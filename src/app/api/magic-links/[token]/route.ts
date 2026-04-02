import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getPostHogServer } from "@/lib/posthog/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = await createServiceClient();

    const { data: magicLink, error } = await supabase
      .from("magic_links")
      .select("*, storytellers(*), prompts(*)")
      .eq("token", token)
      .single();

    if (error || !magicLink) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 404 }
      );
    }

    if (magicLink.used) {
      return NextResponse.json(
        { error: "Token already used" },
        { status: 410 }
      );
    }

    if (new Date(magicLink.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Token expired" },
        { status: 410 }
      );
    }

    const storyteller = magicLink.storytellers as {
      name: string;
      language: string;
    };
    const prompt = magicLink.prompts as {
      question_de: string;
      question_en: string;
      question_sv: string;
    };

    const lang = storyteller.language || "de";
    const question =
      lang === "sv"
        ? prompt.question_sv
        : lang === "en"
          ? prompt.question_en
          : prompt.question_de;

    const posthog = getPostHogServer();
    if (posthog) {
      posthog.capture({
        distinctId: magicLink.storyteller_id,
        event: "magic_link_opened",
        properties: {
          storyteller_id: magicLink.storyteller_id,
          prompt_category: (magicLink.prompts as { category?: string })?.category,
        },
      });
    }

    return NextResponse.json({
      storyteller_name: storyteller.name,
      question,
      language: lang,
    });
  } catch (error) {
    console.error("Magic link validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate token" },
      { status: 500 }
    );
  }
}
