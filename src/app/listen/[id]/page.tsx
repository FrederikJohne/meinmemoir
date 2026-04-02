'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BookOpen, Play, Pause, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Recording, Prompt } from '@/lib/types';

type RecordingData = Recording & { prompt?: Prompt };

export default function ListenPage() {
  const params = useParams();
  const id = params.id as string;
  const [recording, setRecording] = useState<RecordingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchRecording() {
      try {
        const res = await fetch(`/api/stories/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRecording(data);
          if (data.audio_url) {
            setAudio(new Audio(data.audio_url));
          }
        }
      } catch {
        console.error('Failed to fetch recording');
      } finally {
        setLoading(false);
      }
    }

    fetchRecording();
  }, [id]);

  useEffect(() => {
    if (!audio) return;

    audio.addEventListener('ended', () => setPlaying(false));
    return () => {
      audio.removeEventListener('ended', () => setPlaying(false));
      audio.pause();
    };
  }, [audio]);

  const togglePlay = () => {
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Geschichte nicht gefunden.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8">
      <div className="mb-8 flex items-center gap-2">
        <BookOpen className="h-7 w-7 text-primary" />
        <span className="text-xl font-bold text-foreground">MeineMemoiren</span>
      </div>

      <div className="w-full max-w-lg">
        {recording.prompt && (
          <p className="mb-2 text-center text-sm text-muted-foreground">
            {recording.prompt.question_de}
          </p>
        )}

        {recording.audio_url && (
          <div className="mb-6 flex justify-center">
            <Button
              size="lg"
              onClick={togglePlay}
              className="h-20 w-20 rounded-full"
            >
              {playing ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </Button>
          </div>
        )}

        {recording.cleaned_story && (
          <Card>
            <CardContent className="pt-6">
              <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                {recording.cleaned_story}
              </p>
            </CardContent>
          </Card>
        )}

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Aufgenommen am{' '}
          {new Date(recording.created_at).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}
