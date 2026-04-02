import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPostHogServer } from "@/lib/posthog/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subscription_id } = body;

    // Fetch all completed recordings for this subscription
    const { data: recordings } = await supabase
      .from("recordings")
      .select("*, prompts(*)")
      .eq("subscription_id", subscription_id)
      .eq("status", "completed")
      .order("created_at", { ascending: true });

    if (!recordings || recordings.length < 5) {
      return NextResponse.json(
        { error: "At least 5 completed stories are required to print" },
        { status: 400 }
      );
    }

    // Mark subscription as book printed
    await supabase
      .from("subscriptions")
      .update({
        book_printed: true,
        book_printed_at: new Date().toISOString(),
      })
      .eq("id", subscription_id);

    const posthog = getPostHogServer();
    if (posthog) {
      posthog.capture({
        distinctId: user.id,
        event: "book_ordered",
        properties: {
          story_count: recordings.length,
          subscription_id,
        },
      });
    }

    // In production, this would generate PDF via Puppeteer and submit to POD API
    return NextResponse.json({
      success: true,
      message: "Book print order submitted",
      story_count: recordings.length,
    });
  } catch (error) {
    console.error("Book print error:", error);
    return NextResponse.json(
      { error: "Failed to submit print order" },
      { status: 500 }
    );
  }
}
