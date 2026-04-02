import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storyteller_id, prompt_id } = body;

    const supabase = createServiceRoleClient();

    const token = nanoid(24);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data, error } = await supabase
      .from('magic_links')
      .insert({
        token,
        storyteller_id,
        prompt_id,
        expires_at: expiresAt.toISOString(),
        used: false,
      })
      .select()
      .single();

    if (error) throw error;

    const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL}/r/${token}`;

    return NextResponse.json({
      ...data,
      url: magicLinkUrl,
    });
  } catch (error) {
    console.error('Error creating magic link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
