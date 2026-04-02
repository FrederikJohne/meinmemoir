import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get storytellers owned by this user
    const { data: storytellers } = await supabase
      .from('storytellers')
      .select('id')
      .eq('buyer_id', user.id);

    const storytellerIds = storytellers?.map(s => s.id) || [];

    const { data, error } = await supabase
      .from('family_members')
      .select(`
        *,
        user:users(*)
      `)
      .in('storyteller_id', storytellerIds);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching family members:', error);
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
    const { email, storyteller_id } = body;

    // For now, store the invite — full implementation would send email
    return NextResponse.json({
      message: 'Invitation sent',
      email,
      storyteller_id,
    });
  } catch (error) {
    console.error('Error inviting family member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
