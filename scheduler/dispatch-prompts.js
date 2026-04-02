import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://meinememoiren.com";

const MESSAGE_TEMPLATES = {
  de: (name, question, url) =>
    `Hallo ${name}! Deine Familie möchte deine Geschichte hören. 📖\n\nFrage der Woche: ${question}\n\nKlicke hier zum Antworten: ${url}`,
  en: (name, question, url) =>
    `Hello ${name}! Your family wants to hear your story. 📖\n\nQuestion of the week: ${question}\n\nClick here to answer: ${url}`,
  sv: (name, question, url) =>
    `Hej ${name}! Din familj vill höra din berättelse. 📖\n\nVeckans fråga: ${question}\n\nKlicka här för att svara: ${url}`,
};

async function sendWhatsAppMessage(phoneNumber, message) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.log("[Scheduler] WhatsApp not configured, skipping:", phoneNumber);
    return false;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phoneNumber.replace(/[^\d]/g, ""),
          type: "text",
          text: { body: message },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("[Scheduler] WhatsApp send error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Scheduler] WhatsApp error:", error);
    return false;
  }
}

async function sendSMS(phoneNumber, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log("[Scheduler] Twilio not configured, skipping:", phoneNumber);
    return false;
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phoneNumber,
          From: fromNumber,
          Body: message,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("[Scheduler] SMS error:", error);
    return false;
  }
}

export async function dispatchWeeklyPrompts() {
  console.log("[Scheduler] Dispatching weekly prompts...");

  // Get all active subscriptions with their storytellers
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*, storytellers(*)")
    .eq("status", "active")
    .lt("current_week", 52);

  if (error) {
    console.error("[Scheduler] Fetch error:", error);
    return;
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log("[Scheduler] No active subscriptions to process.");
    return;
  }

  console.log(`[Scheduler] Processing ${subscriptions.length} subscriptions`);

  for (const subscription of subscriptions) {
    const storyteller = subscription.storytellers;
    if (!storyteller) continue;

    const nextWeek = subscription.current_week + 1;

    // Get the prompt for this week
    const { data: prompt } = await supabase
      .from("prompts")
      .select("*")
      .eq("week_number", nextWeek)
      .eq("is_active", true)
      .single();

    if (!prompt) {
      console.log(`[Scheduler] No prompt found for week ${nextWeek}`);
      continue;
    }

    // Generate magic link
    const token = nanoid(21);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await supabase.from("magic_links").insert({
      token,
      storyteller_id: storyteller.id,
      prompt_id: prompt.id,
      subscription_id: subscription.id,
      expires_at: expiresAt.toISOString(),
      used: false,
    });

    const recordingUrl = `${APP_URL}/r/${token}`;
    const lang = storyteller.language || "de";

    const question =
      lang === "sv"
        ? prompt.question_sv
        : lang === "en"
          ? prompt.question_en
          : prompt.question_de;

    const messageTemplate =
      MESSAGE_TEMPLATES[lang] || MESSAGE_TEMPLATES.de;
    const message = messageTemplate(storyteller.name, question, recordingUrl);

    // Send via preferred delivery method
    let sent = false;
    if (storyteller.delivery_method === "whatsapp") {
      sent = await sendWhatsAppMessage(storyteller.phone_number, message);
      if (!sent) {
        // Fall back to SMS
        sent = await sendSMS(storyteller.phone_number, message);
      }
    } else if (storyteller.delivery_method === "sms") {
      sent = await sendSMS(storyteller.phone_number, message);
    }

    if (sent) {
      // Increment the current week
      await supabase
        .from("subscriptions")
        .update({ current_week: nextWeek })
        .eq("id", subscription.id);

      console.log(
        `[Scheduler] Sent week ${nextWeek} prompt to ${storyteller.name} (${storyteller.delivery_method})`
      );
    } else {
      console.error(
        `[Scheduler] Failed to send prompt to ${storyteller.name}`
      );
    }
  }

  console.log("[Scheduler] Weekly dispatch complete.");
}

// Run if called directly
dispatchWeeklyPrompts().catch(console.error);
