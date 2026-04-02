import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = createServiceRoleClient();

    const { data: magicLink, error } = await supabase
      .from('magic_links')
      .select(`
        *,
        storyteller:storytellers(*),
        prompt:prompts(*)
      `)
      .eq('token', token)
      .single();

    if (error || !magicLink) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 404 });
    }

    if (magicLink.used) {
      return NextResponse.json({ error: 'Link already used' }, { status: 410 });
    }

    if (new Date(magicLink.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Link expired' }, { status: 410 });
    }

    return NextResponse.json(magicLink);
  } catch (error) {
    console.error('Error validating magic link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
