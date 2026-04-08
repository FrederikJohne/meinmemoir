import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { captureServerEvent } from '@/lib/posthog/server';

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string;
  };
};

async function ensureBuyerProfile(user: AuthUser) {
  const serviceRole = createServiceRoleClient();
  const fullName = user.user_metadata?.full_name ?? null;

  const { error } = await serviceRole.from('users').upsert(
    {
      id: user.id,
      email: user.email ?? '',
      full_name: fullName,
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw new Error(`Failed to ensure buyer profile: ${error.message}`);
  }
}

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone_number, email, delivery_method, language, timezone } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (delivery_method !== 'email' && !phone_number?.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required for WhatsApp/SMS delivery' },
        { status: 400 }
      );
    }

    await ensureBuyerProfile(user);

    const { data, error } = await supabase
      .from('storytellers')
      .insert({
        buyer_id: user.id,
        name: name.trim(),
        phone_number,
        email,
        delivery_method: delivery_method || 'whatsapp',
        language: language || 'de',
        timezone: timezone || 'Europe/Berlin',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create storyteller: ${error.message}`);
    }

    // Link to existing subscription if any
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('buyer_id', user.id)
      .is('storyteller_id', null)
      .single();

    if (subscription) {
      await supabase
        .from('subscriptions')
        .update({ storyteller_id: data.id })
        .eq('id', subscription.id);
    }

    captureServerEvent(user.id, 'storyteller_onboarded', {
      delivery_method: data.delivery_method,
      language: data.language,
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error creating storyteller:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
