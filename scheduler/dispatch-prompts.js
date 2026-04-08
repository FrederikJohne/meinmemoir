const { createClient } = require('@supabase/supabase-js');
const { nanoid } = require('nanoid');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://meinememoiren.com';
const WHATSAPP_PROVIDER = (process.env.WHATSAPP_PROVIDER || '').toLowerCase();

const MESSAGE_TEMPLATES = {
  de: (name, question, link) =>
    `Hallo ${name}! Deine Familie möchte deine Geschichte hören.\n\nFrage der Woche: ${question}\n\nKlicke hier zum Antworten: ${link}`,
  sv: (name, question, link) =>
    `Hej ${name}! Din familj vill höra din berättelse.\n\nVeckans fråga: ${question}\n\nKlicka här för att svara: ${link}`,
  en: (name, question, link) =>
    `Hello ${name}! Your family wants to hear your story.\n\nThis week's question: ${question}\n\nClick here to answer: ${link}`,
};

async function sendWhatsAppMessage(to, body) {
  const provider = resolveWhatsAppProvider();

  if (provider === 'twilio') {
    return sendWhatsAppViaTwilio(to, body);
  }

  return sendWhatsAppViaMeta(to, body);
}

function resolveWhatsAppProvider() {
  if (WHATSAPP_PROVIDER === 'twilio' || WHATSAPP_PROVIDER === 'meta') {
    return WHATSAPP_PROVIDER;
  }

  // Prefer Twilio when credentials are present so production can
  // move to Twilio without requiring a code change.
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM) {
    return 'twilio';
  }

  if (process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN) {
    return 'meta';
  }

  throw new Error(
    'No WhatsApp provider configured. Set WHATSAPP_PROVIDER=twilio|meta and matching credentials.'
  );
}

function normalizePhone(to) {
  return String(to || '').replace(/\s+/g, '');
}

function toMetaWhatsAppRecipient(to) {
  return normalizePhone(to).replace(/^\+/, '');
}

function toTwilioWhatsAppRecipient(to) {
  const normalized = normalizePhone(to);
  const digitsOnly = normalized.replace(/[^\d]/g, '');
  if (!digitsOnly) {
    throw new Error(`Invalid phone number: "${to}"`);
  }
  const e164 = normalized.startsWith('+') ? normalized : `+${digitsOnly}`;
  return `whatsapp:${e164}`;
}

async function sendWhatsAppViaMeta(to, body) {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: toMetaWhatsAppRecipient(to),
        type: 'text',
        text: { body },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`WhatsApp error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

async function sendWhatsAppViaTwilio(to, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    throw new Error(
      'Missing Twilio WhatsApp config. Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM'
    );
  }

  const params = new URLSearchParams();
  params.append('To', toTwilioWhatsAppRecipient(to));
  params.append('From', from);
  params.append('Body', body);

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Twilio WhatsApp error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

async function sendSMS(to, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  const params = new URLSearchParams();
  params.append('To', to);
  params.append('From', from);
  params.append('Body', body);

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Twilio error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

async function dispatchPrompts() {
  console.log('Starting weekly prompt dispatch...');

  // Get all active subscriptions with storytellers
  const { data: subscriptions, error: subError } = await supabase
    .from('subscriptions')
    .select(`
      *,
      storyteller:storytellers(*)
    `)
    .eq('status', 'active')
    .not('storyteller_id', 'is', null);

  if (subError) {
    console.error('Error fetching subscriptions:', subError);
    return;
  }

  for (const sub of subscriptions || []) {
    const storyteller = sub.storyteller;
    if (!storyteller) continue;

    try {
      // Find the next prompt for this storyteller
      const { data: dispatched } = await supabase
        .from('prompt_dispatches')
        .select('prompt_id')
        .eq('storyteller_id', storyteller.id)
        .eq('delivery_status', 'sent');

      const dispatchedPromptIds = (dispatched || []).map(d => d.prompt_id);

      const { data: nextPrompt } = await supabase
        .from('prompts')
        .select('*')
        .eq('is_active', true)
        .not('id', 'in', `(${dispatchedPromptIds.join(',') || '00000000-0000-0000-0000-000000000000'})`)
        .order('week_number', { ascending: true })
        .limit(1)
        .single();

      if (!nextPrompt) {
        console.log(`No more prompts for storyteller ${storyteller.id}`);
        continue;
      }

      // Create magic link
      const token = nanoid(24);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await supabase.from('magic_links').insert({
        token,
        storyteller_id: storyteller.id,
        prompt_id: nextPrompt.id,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

      const magicLinkUrl = `${APP_URL}/r/${token}`;

      // Get question in storyteller's language
      const lang = storyteller.language || 'de';
      const questionKey = `question_${lang}`;
      const question = nextPrompt[questionKey] || nextPrompt.question_de;

      const messageTemplate = MESSAGE_TEMPLATES[lang] || MESSAGE_TEMPLATES.de;
      const messageBody = messageTemplate(storyteller.name, question, magicLinkUrl);

      // Send message
      let deliveryStatus = 'sent';
      let errorMessage = null;

      try {
        if (storyteller.delivery_method === 'whatsapp' && storyteller.phone_number) {
          await sendWhatsAppMessage(storyteller.phone_number, messageBody);
        } else if (storyteller.delivery_method === 'sms' && storyteller.phone_number) {
          await sendSMS(storyteller.phone_number, messageBody);
        } else {
          console.log(`Email delivery for ${storyteller.id}: ${messageBody}`);
        }
      } catch (sendError) {
        deliveryStatus = 'failed';
        errorMessage = sendError.message;
        console.error(`Failed to send to ${storyteller.id}:`, sendError);
      }

      // Log dispatch
      await supabase.from('prompt_dispatches').insert({
        storyteller_id: storyteller.id,
        prompt_id: nextPrompt.id,
        magic_link_token: token,
        delivery_method: storyteller.delivery_method,
        delivery_status: deliveryStatus,
        sent_at: deliveryStatus === 'sent' ? new Date().toISOString() : null,
        error_message: errorMessage,
      });

      console.log(`Dispatched prompt to ${storyteller.name} (${storyteller.id}): ${deliveryStatus}`);
    } catch (error) {
      console.error(`Error dispatching to storyteller ${storyteller.id}:`, error);
    }
  }

  console.log('Prompt dispatch complete.');
}

// Audio retention cleanup (90 days after book print)
async function cleanupExpiredAudio() {
  console.log('Starting audio cleanup...');

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: bookOrders } = await supabase
    .from('book_orders')
    .select('subscription_id')
    .eq('status', 'delivered')
    .lt('updated_at', ninetyDaysAgo.toISOString());

  if (!bookOrders?.length) {
    console.log('No audio files to clean up.');
    return;
  }

  for (const order of bookOrders) {
    const { data: recordings } = await supabase
      .from('recordings')
      .select('id, audio_url')
      .eq('subscription_id', order.subscription_id)
      .not('audio_url', 'is', null);

    for (const recording of recordings || []) {
      if (recording.audio_url) {
        const path = recording.audio_url.split('/storage/v1/object/public/audio/')[1];
        if (path) {
          await supabase.storage.from('audio').remove([path]);
          await supabase
            .from('recordings')
            .update({ audio_url: null })
            .eq('id', recording.id);
          console.log(`Deleted audio for recording ${recording.id}`);
        }
      }
    }
  }

  console.log('Audio cleanup complete.');
}

module.exports = {
  dispatchPrompts,
  cleanupExpiredAudio,
  __private: {
    resolveWhatsAppProvider,
    toMetaWhatsAppRecipient,
    toTwilioWhatsAppRecipient,
  },
};

// Run if called directly
if (require.main === module) {
  dispatchPrompts().then(() => process.exit(0));
}
