import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { getPostHogServer } from "@/lib/posthog/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, locale = "de" } = body;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "sepa_debit", "klarna", "paypal"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name:
                locale === "de"
                  ? "Das Erinnerungsbuch"
                  : locale === "sv"
                    ? "Minnesboken"
                    : "The Memory Book",
              description:
                locale === "de"
                  ? "52 Wochen Fragen, unbegrenzte Aufnahmen, 1 Premium-Buch"
                  : "52 weeks of questions, unlimited recordings, 1 premium book",
            },
            unit_amount: 9900,
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?checkout=cancelled`,
      metadata: {
        product: "memory_book",
        locale,
      },
    });

    const posthog = getPostHogServer();
    if (posthog && email) {
      posthog.capture({
        distinctId: email,
        event: "checkout_started",
        properties: {
          package: "memory_book",
          price: 99,
          currency: "EUR",
        },
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/#pricing`
  );
}
