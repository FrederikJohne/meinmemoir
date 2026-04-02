import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateBookHTML } from '@/lib/book/pdf-generator';
import { captureServerEvent } from '@/lib/posthog/server';
import type { RecordingWithPrompt, Storyteller } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { storyteller_id, title, dedication } = body;

    // Fetch storyteller
    const { data: storyteller, error: stError } = await supabase
      .from('storytellers')
      .select('*')
      .eq('id', storyteller_id)
      .eq('buyer_id', user.id)
      .single();

    if (stError || !storyteller) {
      return NextResponse.json({ error: 'Storyteller not found' }, { status: 404 });
    }

    // Fetch completed stories
    const { data: recordings, error: recError } = await supabase
      .from('recordings')
      .select(`
        *,
        prompt:prompts(*),
        photos(*)
      `)
      .eq('storyteller_id', storyteller_id)
      .eq('status', 'completed')
      .order('created_at', { ascending: true });

    if (recError) throw recError;

    const html = generateBookHTML({
      storyteller: storyteller as Storyteller,
      stories: (recordings || []) as RecordingWithPrompt[],
      title,
      dedication,
    });

    captureServerEvent(user.id, 'book_ordered', {
      story_count: recordings?.length || 0,
      page_count: Math.max(20, (recordings?.length || 0) * 2 + 10),
    });

    return NextResponse.json({
      html,
      story_count: recordings?.length || 0,
      page_count: Math.max(20, (recordings?.length || 0) * 2 + 10),
    });
  } catch (error) {
    console.error('Error generating book:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
