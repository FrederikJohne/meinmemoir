import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { captureServerEvent } from '@/lib/posthog/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('storytellers')
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching storytellers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht angemeldet. Bitte erneut anmelden.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone_number, email, delivery_method, language, timezone } = body;

    // Ensure public.users row exists (FK for storytellers). Uses JWT + RLS INSERT policy.
    const profileEmail =
      typeof user.email === 'string' && user.email.length > 0
        ? user.email
        : typeof email === 'string' && email.length > 0
          ? email
          : 'pending@user.local';

    const { error: userUpsertError } = await supabase.from('users').upsert(
      {
        id: user.id,
        email: profileEmail,
        full_name:
          (user.user_metadata?.full_name as string | undefined) ?? null,
      },
      { onConflict: 'id' }
    );

    if (userUpsertError) {
      console.error('Error ensuring user profile:', userUpsertError);
      return NextResponse.json(
        {
          error:
            'Profil konnte nicht angelegt werden. Bitte Supabase-Migration 004 ausführen oder erneut versuchen.',
          detail: userUpsertError.message,
        },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('storytellers')
      .insert({
        buyer_id: user.id,
        name,
        phone_number,
        email,
        delivery_method: delivery_method || 'whatsapp',
        language: language || 'de',
        timezone: timezone || 'Europe/Berlin',
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting storyteller:', error);
      return NextResponse.json(
        { error: 'Erzähler konnte nicht erstellt werden.', detail: error.message },
        { status: 500 }
      );
    }

    // Link to existing subscription if any
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('buyer_id', user.id)
      .is('storyteller_id', null)
      .maybeSingle();

    if (subscription) {
      await supabase
        .from('subscriptions')
        .update({ storyteller_id: data.id })
        .eq('id', subscription.id);
    }

    try {
      captureServerEvent(user.id, 'storyteller_onboarded', {
        delivery_method: data.delivery_method,
        language: data.language,
      });
    } catch (posthogError) {
      console.error('PostHog capture failed (non-fatal):', posthogError);
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error creating storyteller:', error);
    const detail =
      error instanceof Error ? error.message : typeof error === 'string' ? error : undefined;
    return NextResponse.json(
      {
        error: 'Interner Serverfehler',
        ...(detail ? { detail } : {}),
      },
      { status: 500 }
    );
  }
}
