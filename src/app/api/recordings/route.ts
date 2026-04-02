import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { captureServerEvent } from '@/lib/posthog/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('recordings')
      .select(`
        *,
        prompt:prompts(*),
        storyteller:storytellers!inner(*),
        photos(*)
      `)
      .eq('storyteller.buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching recordings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storyteller_id, prompt_id, audio_url, audio_duration_seconds, magic_link_token } = body;

    const supabase = createServiceRoleClient();

    // Find subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('storyteller_id', storyteller_id)
      .eq('status', 'active')
      .single();

    const { data: recording, error } = await supabase
      .from('recordings')
      .insert({
        storyteller_id,
        prompt_id,
        subscription_id: subscription?.id,
        audio_url,
        audio_duration_seconds,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Mark magic link as used
    if (magic_link_token) {
      await supabase
        .from('magic_links')
        .update({ used: true, used_at: new Date().toISOString() })
        .eq('token', magic_link_token);
    }

    captureServerEvent(storyteller_id, 'recording_completed', {
      duration_seconds: audio_duration_seconds,
      storyteller_id,
    });

    return NextResponse.json(recording);
  } catch (error) {
    console.error('Error creating recording:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
