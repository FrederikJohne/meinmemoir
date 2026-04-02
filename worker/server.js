const { createClient } = require('@supabase/supabase-js');
const { createClient: createDeepgramClient } = require('@deepgram/sdk');
const OpenAI = require('openai');
const QRCode = require('qrcode');
const { PostHog } = require('posthog-node');
const http = require('http');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const deepgram = createDeepgramClient(process.env.DEEPGRAM_API_KEY);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const posthog = process.env.POSTHOG_KEY
  ? new PostHog(process.env.POSTHOG_KEY, { host: 'https://eu.i.posthog.com' })
  : null;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://meinememoiren.com';

const SYSTEM_PROMPTS = {
  de: 'Du bist ein erfahrener deutscher Lektor. Bereinige das folgende Transkript. Entferne Füllwörter (äh, öhm, also, quasi), korrigiere Grammatikfehler und strukturiere den Text in lesbare Absätze. WICHTIG: Bewahre den Originalton, das Vokabular und den Dialekt des Sprechers. Mach den Text nicht förmlich oder roboterhaft.',
  sv: 'Du är en erfaren svensk redaktör. Rensa upp följande transkription. Ta bort utfyllnadsord (eh, öh, liksom, typ), korrigera grammatiska fel och strukturera texten i läsbara stycken. VIKTIGT: Bevara talarens originalton, ordförråd och dialekt. Gör inte texten formell eller robotaktig.',
  en: 'You are an expert English editor. Clean up the following transcript. Remove filler words (um, uh, like, you know), fix grammatical errors, and structure it into readable paragraphs. CRITICAL: Preserve the speaker\'s original tone, vocabulary, and dialect. Do not make it sound formal or robotic.',
};

async function processRecording(recording) {
  const startTime = Date.now();
  console.log(`Processing recording ${recording.id}...`);

  try {
    await supabase
      .from('recordings')
      .update({ status: 'processing', processing_started_at: new Date().toISOString() })
      .eq('id', recording.id);

    // Fetch storyteller for language info
    const { data: storyteller } = await supabase
      .from('storytellers')
      .select('*')
      .eq('id', recording.storyteller_id)
      .single();

    const language = storyteller?.language || 'de';

    // Step 1: Download audio from Supabase Storage
    const audioPath = recording.audio_url.split('/storage/v1/object/public/')[1];
    let audioBuffer;

    if (audioPath) {
      const { data: audioData, error: downloadError } = await supabase.storage
        .from('audio')
        .download(audioPath.replace('audio/', ''));

      if (downloadError) throw new Error(`Audio download failed: ${downloadError.message}`);
      audioBuffer = Buffer.from(await audioData.arrayBuffer());
    } else {
      const response = await fetch(recording.audio_url);
      audioBuffer = Buffer.from(await response.arrayBuffer());
    }

    // Step 2: Transcribe with Deepgram Nova-3
    const { result } = await deepgram.listen.prerecorded.transcribeFile(audioBuffer, {
      model: 'nova-3',
      language: language,
      smart_format: true,
      punctuate: true,
      paragraphs: true,
    });

    const rawTranscript = result.results.channels[0].alternatives[0].transcript;

    await supabase
      .from('recordings')
      .update({ raw_transcript: rawTranscript })
      .eq('id', recording.id);

    // Step 3: Clean up with GPT-4o
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.de },
        { role: 'user', content: rawTranscript },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const cleanedStory = completion.choices[0].message.content;

    // Step 4: Generate QR code
    const listenUrl = `${APP_URL}/listen/${recording.id}`;
    const qrCodeBuffer = await QRCode.toBuffer(listenUrl, {
      type: 'png',
      width: 300,
      margin: 2,
      color: { dark: '#1a1a1a', light: '#ffffff' },
    });

    const qrFileName = `qr-codes/${recording.id}.png`;
    await supabase.storage
      .from('audio')
      .upload(qrFileName, qrCodeBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    const { data: { publicUrl: qrCodeUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(qrFileName);

    // Step 5: Update recording with all results
    await supabase
      .from('recordings')
      .update({
        cleaned_story: cleanedStory,
        qr_code_url: qrCodeUrl,
        status: 'completed',
        processing_completed_at: new Date().toISOString(),
      })
      .eq('id', recording.id);

    const processingTime = Date.now() - startTime;
    console.log(`Recording ${recording.id} processed in ${processingTime}ms`);

    if (posthog) {
      posthog.capture({
        distinctId: recording.storyteller_id,
        event: 'ai_processing_completed',
        properties: {
          recording_id: recording.id,
          transcript_length: rawTranscript.length,
          processing_time_ms: processingTime,
        },
      });
    }
  } catch (error) {
    console.error(`Error processing recording ${recording.id}:`, error);

    await supabase
      .from('recordings')
      .update({
        status: 'failed',
        error_message: error.message,
        processing_completed_at: new Date().toISOString(),
      })
      .eq('id', recording.id);

    if (posthog) {
      posthog.capture({
        distinctId: recording.storyteller_id,
        event: 'recording_failed',
        properties: {
          recording_id: recording.id,
          error_type: error.message,
        },
      });
    }
  }
}

async function pollForPendingRecordings() {
  const { data: recordings, error } = await supabase
    .from('recordings')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(5);

  if (error) {
    console.error('Error polling for recordings:', error);
    return;
  }

  for (const recording of recordings || []) {
    await processRecording(recording);
  }
}

// Health check server
const server = http.createServer((req, res) => {
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'worker' }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Worker health check running on port ${PORT}`);
});

// Poll every 10 seconds
console.log('Worker started. Polling for pending recordings...');
setInterval(pollForPendingRecordings, 10000);
pollForPendingRecordings();
