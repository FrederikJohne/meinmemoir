import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { captureServerEvent } from '@/lib/posthog/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;

      if (userId) {
        await supabase.from('subscriptions').insert({
          buyer_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_checkout_session_id: session.id,
          status: 'active',
          amount_paid: session.amount_total,
          currency: session.currency,
        });

        captureServerEvent(userId, 'checkout_completed', {
          subscription_id: session.id,
          amount: session.amount_total,
        });
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.error('Payment failed:', paymentIntent.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
