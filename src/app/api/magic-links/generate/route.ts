import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storyteller_id, prompt_id, subscription_id } = body;

    if (!storyteller_id || !prompt_id || !subscription_id) {
      return NextResponse.json(
        { error: "storyteller_id, prompt_id, and subscription_id are required" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();
    const token = nanoid(21);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: magicLink, error } = await supabase
      .from("magic_links")
      .insert({
        token,
        storyteller_id,
        prompt_id,
        subscription_id,
        expires_at: expiresAt.toISOString(),
        used: false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const recordingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/r/${token}`;

    return NextResponse.json({
      token: magicLink.token,
      url: recordingUrl,
      expires_at: magicLink.expires_at,
    });
  } catch (error) {
    console.error("Magic link generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate magic link" },
      { status: 500 }
    );
  }
}
