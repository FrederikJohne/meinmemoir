'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  disabled?: boolean;
}

export function AudioRecorder({ onRecordingComplete, disabled }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch {
      alert('Bitte erlaube den Zugriff auf dein Mikrofon.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const submitRecording = useCallback(() => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, duration);
    }
  }, [audioBlob, duration, onRecordingComplete]);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDuration(0);
  }, [audioUrl]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Timer */}
      <div className={cn(
        'text-4xl font-mono font-bold tabular-nums transition-colors',
        isRecording ? 'text-red-500' : 'text-foreground'
      )}>
        {formatDuration(duration)}
      </div>

      {/* Recording pulse animation */}
      {isRecording && (
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
          <span className="text-sm font-medium text-red-500">Aufnahme läuft...</span>
        </div>
      )}

      {/* Audio playback */}
      {audioUrl && !isRecording && (
        <audio controls src={audioUrl} className="w-full max-w-xs" />
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!audioBlob && !isRecording && (
          <Button
            size="lg"
            onClick={startRecording}
            disabled={disabled}
            className="h-20 w-20 rounded-full text-lg"
          >
            <Mic className="h-8 w-8" />
          </Button>
        )}

        {isRecording && (
          <Button
            size="lg"
            variant="destructive"
            onClick={stopRecording}
            className="h-20 w-20 rounded-full"
          >
            <Square className="h-8 w-8" />
          </Button>
        )}

        {audioBlob && !isRecording && (
          <>
            <Button variant="outline" size="lg" onClick={resetRecording}>
              Neu aufnehmen
            </Button>
            <Button size="lg" onClick={submitRecording} disabled={disabled}>
              {disabled ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Send className="mr-2 h-5 w-5" />
              )}
              Absenden
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
