"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Play, Pause, Volume2 } from "lucide-react";

interface ListenPageProps {
  recordingId: string;
}

export function ListenPage({ recordingId }: ListenPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [story, setStory] = useState<string | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchRecording() {
      try {
        const response = await fetch(`/api/recordings/${recordingId}`);
        if (!response.ok) throw new Error("Not found");
        const data = await response.json();
        setAudioUrl(data.audio_url);
        setStory(data.cleaned_story);
        setQuestion(data.question);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchRecording();
  }, [recordingId]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-50 flex items-center justify-center">
        <div className="animate-pulse text-stone-400">Laden...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-stone-600">
              Diese Aufnahme wurde nicht gefunden.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-50 flex flex-col">
      <header className="flex items-center justify-center py-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-amber-600" />
          <span className="text-xl font-bold text-stone-900">MeineMemoiren</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md space-y-6">
          {question && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="pt-6">
                <p className="text-xs uppercase font-semibold text-amber-700 mb-2">
                  Frage
                </p>
                <p className="text-lg font-medium text-stone-900">
                  {question}
                </p>
              </CardContent>
            </Card>
          )}

          {audioUrl && (
            <div className="flex flex-col items-center gap-4">
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
              />
              <Button
                size="lg"
                className="w-24 h-24 rounded-full"
                onClick={togglePlayback}
              >
                {isPlaying ? (
                  <Pause className="h-10 w-10" />
                ) : (
                  <Play className="h-10 w-10 ml-1" />
                )}
              </Button>
              <div className="flex items-center gap-2 text-stone-500">
                <Volume2 className="h-4 w-4" />
                <span className="text-sm">Original-Aufnahme anhören</span>
              </div>
            </div>
          )}

          {story && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                  {story}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
