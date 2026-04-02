import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { captureServerEvent } from '@/lib/posthog/server';

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { priceId } = body;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'sepa_debit', 'klarna', 'paypal'],
      line_items: [
        {
          price: priceId || process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?cancelled=true`,
      customer_email: user?.email,
      metadata: {
        user_id: user?.id || '',
      },
    });

    if (user) {
      captureServerEvent(user.id, 'checkout_started', {
        package: 'standard',
        price: 99,
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
