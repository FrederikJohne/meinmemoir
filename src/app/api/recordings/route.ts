import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getPostHogServer } from "@/lib/posthog/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("buyer_id", user.id);

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ recordings: [] });
    }

    const subscriptionIds = subscriptions.map((s) => s.id);

    const { data: recordings } = await supabase
      .from("recordings")
      .select("*, prompts(*)")
      .in("subscription_id", subscriptionIds)
      .order("created_at", { ascending: false });

    return NextResponse.json({ recordings: recordings || [] });
  } catch (error) {
    console.error("Recordings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recordings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio") as File;
    const token = formData.get("token") as string;

    if (!audio || !token) {
      return NextResponse.json(
        { error: "Audio file and token are required" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // Validate magic link
    const { data: magicLink, error: linkError } = await supabase
      .from("magic_links")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (linkError || !magicLink) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    if (new Date(magicLink.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Token has expired" },
        { status: 400 }
      );
    }

    // Upload audio to Supabase Storage
    const fileName = `${magicLink.storyteller_id}/${Date.now()}.webm`;
    const audioBuffer = Buffer.from(await audio.arrayBuffer());

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("recordings")
      .upload(fileName, audioBuffer, {
        contentType: "audio/webm",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("recordings").getPublicUrl(uploadData.path);

    // Create recording entry
    const { data: recording, error: recordingError } = await supabase
      .from("recordings")
      .insert({
        storyteller_id: magicLink.storyteller_id,
        prompt_id: magicLink.prompt_id,
        subscription_id: magicLink.subscription_id,
        audio_url: publicUrl,
        status: "pending",
      })
      .select()
      .single();

    if (recordingError) {
      throw recordingError;
    }

    // Mark magic link as used
    await supabase
      .from("magic_links")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("token", token);

    const posthog = getPostHogServer();
    if (posthog) {
      posthog.capture({
        distinctId: magicLink.storyteller_id,
        event: "recording_completed",
        properties: {
          storyteller_id: magicLink.storyteller_id,
          recording_id: recording.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      recording_id: recording.id,
    });
  } catch (error) {
    console.error("Recording upload error:", error);

    const posthog = getPostHogServer();
    if (posthog) {
      posthog.capture({
        distinctId: "system",
        event: "recording_failed",
        properties: {
          error_type: "upload_error",
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to upload recording" },
      { status: 500 }
    );
  }
}
