import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getPostHogServer } from "@/lib/posthog/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();
  const posthog = getPostHogServer();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status === "paid") {
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("stripe_checkout_session_id", session.id)
          .single();

        if (!existingSub) {
          await supabase.from("subscriptions").insert({
            stripe_customer_id: session.customer as string,
            stripe_checkout_session_id: session.id,
            buyer_id: "00000000-0000-0000-0000-000000000000",
            storyteller_id: "00000000-0000-0000-0000-000000000000",
            status: "active",
          });
        }

        if (posthog && session.customer_email) {
          posthog.capture({
            distinctId: session.customer_email,
            event: "checkout_completed",
            properties: {
              session_id: session.id,
              amount: session.amount_total ? session.amount_total / 100 : 99,
              currency: session.currency,
            },
          });
        }
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.error("Payment failed:", paymentIntent.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
