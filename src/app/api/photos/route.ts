import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const recordingId = formData.get('recording_id') as string;
    const caption = formData.get('caption') as string;

    if (!file || !recordingId) {
      return NextResponse.json({ error: 'File and recording_id required' }, { status: 400 });
    }

    const serviceClient = createServiceRoleClient();
    const filename = `photos/${recordingId}/${Date.now()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from('audio')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: photo, error: insertError } = await supabase
      .from('photos')
      .insert({
        recording_id: recordingId,
        uploaded_by: user.id,
        storage_path: uploadData.path,
        caption: caption || null,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(photo);
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
