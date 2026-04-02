import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const filename = `recordings/${Date.now()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabase.storage
      .from('audio')
      .upload(filename, buffer, {
        contentType: file.type || 'audio/webm',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(data.path);

    return NextResponse.json({ audio_url: publicUrl, path: data.path });
  } catch (error) {
    console.error('Error uploading audio:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
