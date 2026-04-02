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
    const { name, phone_number, delivery_method, language } = body;

    // Create the user profile if it doesn't exist
    await supabase.from("users").upsert({
      id: user.id,
      email: user.email!,
      role: "admin",
    });

    // Create the storyteller
    const { data: storyteller, error: storytellerError } = await supabase
      .from("storytellers")
      .insert({
        name,
        phone_number,
        delivery_method,
        language,
        timezone: "Europe/Berlin",
      })
      .select()
      .single();

    if (storytellerError) {
      throw storytellerError;
    }

    // Link buyer to storyteller via subscription
    const { error: subError } = await supabase.from("subscriptions").insert({
      buyer_id: user.id,
      storyteller_id: storyteller.id,
      status: "active",
    });

    if (subError) {
      throw subError;
    }

    const posthog = getPostHogServer();
    if (posthog) {
      posthog.capture({
        distinctId: user.id,
        event: "storyteller_onboarded",
        properties: {
          delivery_method,
          language,
        },
      });
    }

    return NextResponse.json({ success: true, storyteller_id: storyteller.id });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
