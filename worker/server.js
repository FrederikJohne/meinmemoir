import { createClient } from "@supabase/supabase-js";
import { createClient as createDeepgramClient } from "@deepgram/sdk";
import OpenAI from "openai";
import QRCode from "qrcode";
import { PostHog } from "posthog-node";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const deepgram = createDeepgramClient(process.env.DEEPGRAM_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const posthog = process.env.POSTHOG_KEY
  ? new PostHog(process.env.POSTHOG_KEY, { host: "https://eu.i.posthog.com" })
  : null;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://meinememoiren.com";

const CLEANUP_PROMPTS = {
  de: "Du bist ein erfahrener deutscher Lektor. Bereinige das folgende Transkript. Entferne Füllwörter (äh, öhm, also, halt, ne), korrigiere Grammatikfehler und strukturiere es in lesbare Absätze. WICHTIG: Bewahre den Original-Ton, Wortschatz und Dialekt des Sprechers. Mache es nicht formell oder roboterhaft.",
  en: "You are an expert English editor. Clean up the following transcript. Remove filler words (uh, um, like, you know), fix grammatical errors, and structure it into readable paragraphs. CRITICAL: Preserve the speaker's original tone, vocabulary, and dialect. Do not make it sound formal or robotic.",
  sv: "Du är en erfaren svensk redaktör. Rensa upp följande transkript. Ta bort fyllnadsord (eh, öh, liksom, typ), korrigera grammatiska fel och strukturera det i läsbara stycken. VIKTIGT: Bevara talarens ursprungliga ton, ordförråd och dialekt. Gör det inte formellt eller robotaktigt.",
};

async function processRecording(recording) {
  const startTime = Date.now();
  console.log(`[Worker] Processing recording ${recording.id}...`);

  try {
    // Mark as processing
    await supabase
      .from("recordings")
      .update({
        status: "processing",
        processing_started_at: new Date().toISOString(),
      })
      .eq("id", recording.id);

    // Fetch the storyteller to get language
    const { data: storyteller } = await supabase
      .from("storytellers")
      .select("language")
      .eq("id", recording.storyteller_id)
      .single();

    const language = storyteller?.language || "de";

    // Step 1: Download audio from Supabase Storage
    console.log(`[Worker] Downloading audio for ${recording.id}...`);
    const audioResponse = await fetch(recording.audio_url);
    const audioBuffer = await audioResponse.arrayBuffer();

    // Step 2: Transcribe with Deepgram Nova-3
    console.log(`[Worker] Transcribing with Deepgram (${language})...`);
    const { result, error: dgError } =
      await deepgram.listen.prerecorded.transcribeFile(
        Buffer.from(audioBuffer),
        {
          model: "nova-3",
          language: language === "sv" ? "sv" : language === "en" ? "en" : "de",
          smart_format: true,
          punctuate: true,
          paragraphs: true,
        }
      );

    if (dgError) {
      throw new Error(`Deepgram error: ${dgError.message}`);
    }

    const rawTranscript =
      result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    if (!rawTranscript) {
      throw new Error("Empty transcript from Deepgram");
    }

    // Save raw transcript
    await supabase
      .from("recordings")
      .update({ raw_transcript: rawTranscript })
      .eq("id", recording.id);

    console.log(`[Worker] Transcript: ${rawTranscript.substring(0, 100)}...`);

    // Step 3: Clean up with GPT-4o
    console.log(`[Worker] Cleaning up with GPT-4o...`);
    const systemPrompt = CLEANUP_PROMPTS[language] || CLEANUP_PROMPTS.de;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: rawTranscript },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const cleanedStory = completion.choices[0]?.message?.content || rawTranscript;

    // Step 4: Generate QR code
    console.log(`[Worker] Generating QR code...`);
    const listenUrl = `${APP_URL}/listen/${recording.id}`;
    const qrCodeBuffer = await QRCode.toBuffer(listenUrl, {
      type: "png",
      width: 300,
      margin: 2,
      color: {
        dark: "#1c1917",
        light: "#ffffff",
      },
    });

    // Upload QR code to Supabase Storage
    const qrFileName = `qr-codes/${recording.id}.png`;
    await supabase.storage
      .from("recordings")
      .upload(qrFileName, qrCodeBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    const {
      data: { publicUrl: qrCodeUrl },
    } = supabase.storage.from("recordings").getPublicUrl(qrFileName);

    // Step 5: Update recording with all processed data
    const processingTime = Date.now() - startTime;

    await supabase
      .from("recordings")
      .update({
        cleaned_story: cleanedStory,
        qr_code_url: qrCodeUrl,
        status: "completed",
        processing_completed_at: new Date().toISOString(),
      })
      .eq("id", recording.id);

    console.log(
      `[Worker] Recording ${recording.id} processed in ${processingTime}ms`
    );

    // Track in PostHog
    if (posthog) {
      posthog.capture({
        distinctId: recording.storyteller_id,
        event: "ai_processing_completed",
        properties: {
          recording_id: recording.id,
          transcript_length: rawTranscript.length,
          processing_time_ms: processingTime,
        },
      });
    }
  } catch (error) {
    console.error(`[Worker] Error processing recording ${recording.id}:`, error);

    await supabase
      .from("recordings")
      .update({ status: "failed" })
      .eq("id", recording.id);

    if (posthog) {
      posthog.capture({
        distinctId: recording.storyteller_id || "system",
        event: "recording_failed",
        properties: {
          recording_id: recording.id,
          error_type: "processing_error",
          error_message: error.message,
        },
      });
    }
  }
}

async function pollForPendingRecordings() {
  console.log("[Worker] Polling for pending recordings...");

  const { data: recordings, error } = await supabase
    .from("recordings")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(5);

  if (error) {
    console.error("[Worker] Poll error:", error);
    return;
  }

  if (recordings && recordings.length > 0) {
    console.log(`[Worker] Found ${recordings.length} pending recordings`);
    for (const recording of recordings) {
      await processRecording(recording);
    }
  }
}

// Health check endpoint
import { createServer } from "http";

const server = createServer((req, res) => {
  if (req.url === "/health" || req.url === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "worker" }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[Worker] Health check server running on port ${PORT}`);
});

// Poll every 10 seconds
console.log("[Worker] Starting polling loop...");
setInterval(pollForPendingRecordings, 10000);
pollForPendingRecordings();
