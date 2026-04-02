import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateBookHTML } from '@/lib/book/pdf-generator';
import type { RecordingWithPrompt, Storyteller } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storytellerId = searchParams.get('storyteller_id');

    if (!storytellerId) {
      return NextResponse.json({ error: 'storyteller_id required' }, { status: 400 });
    }

    const { data: storyteller } = await supabase
      .from('storytellers')
      .select('*')
      .eq('id', storytellerId)
      .eq('buyer_id', user.id)
      .single();

    if (!storyteller) {
      return NextResponse.json({ error: 'Storyteller not found' }, { status: 404 });
    }

    const { data: recordings } = await supabase
      .from('recordings')
      .select(`
        *,
        prompt:prompts(*),
        photos(*)
      `)
      .eq('storyteller_id', storytellerId)
      .eq('status', 'completed')
      .order('created_at', { ascending: true });

    const html = generateBookHTML({
      storyteller: storyteller as Storyteller,
      stories: (recordings || []) as RecordingWithPrompt[],
    });

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating book preview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
