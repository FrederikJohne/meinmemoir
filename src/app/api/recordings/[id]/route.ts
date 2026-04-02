import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServiceClient();

    const { data: recording, error } = await supabase
      .from("recordings")
      .select("*, prompts(*)")
      .eq("id", id)
      .single();

    if (error || !recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    const prompt = recording.prompts as {
      question_de?: string;
      question_en?: string;
      question_sv?: string;
    } | null;

    return NextResponse.json({
      audio_url: recording.audio_url,
      cleaned_story: recording.cleaned_story,
      raw_transcript: recording.raw_transcript,
      question: prompt?.question_de || null,
      status: recording.status,
    });
  } catch (error) {
    console.error("Recording fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recording" },
      { status: 500 }
    );
  }
}
