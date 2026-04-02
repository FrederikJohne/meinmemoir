import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RETENTION_DAYS = 90;

export async function cleanupExpiredAudio() {
  console.log("[Cleanup] Starting audio cleanup...");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  // Find subscriptions where book was printed more than 90 days ago
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("book_printed", true)
    .lt("book_printed_at", cutoffDate.toISOString());

  if (error) {
    console.error("[Cleanup] Error fetching subscriptions:", error);
    return;
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log("[Cleanup] No expired audio to clean up.");
    return;
  }

  console.log(`[Cleanup] Found ${subscriptions.length} subscriptions with expired audio`);

  for (const sub of subscriptions) {
    const { data: recordings } = await supabase
      .from("recordings")
      .select("id, audio_url")
      .eq("subscription_id", sub.id)
      .not("audio_url", "is", null);

    if (!recordings) continue;

    for (const recording of recordings) {
      try {
        // Extract file path from URL
        const urlParts = new URL(recording.audio_url);
        const filePath = urlParts.pathname.split("/storage/v1/object/public/recordings/")[1];

        if (filePath) {
          await supabase.storage.from("recordings").remove([filePath]);
          console.log(`[Cleanup] Deleted audio: ${filePath}`);
        }

        // Clear the audio_url
        await supabase
          .from("recordings")
          .update({ audio_url: null })
          .eq("id", recording.id);
      } catch (err) {
        console.error(`[Cleanup] Error deleting audio for ${recording.id}:`, err);
      }
    }
  }

  console.log("[Cleanup] Audio cleanup complete.");
}

cleanupExpiredAudio().catch(console.error);
