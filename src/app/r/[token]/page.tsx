'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { BookOpen, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { AudioRecorder } from '@/components/recording/audio-recorder';
import { Card, CardContent } from '@/components/ui/card';
import type { MagicLink, Storyteller, Prompt } from '@/lib/types';

type MagicLinkData = MagicLink & {
  storyteller: Storyteller;
  prompt: Prompt;
};

type PageState = 'loading' | 'ready' | 'uploading' | 'success' | 'error' | 'expired' | 'used';

export default function RecordingPage() {
  const params = useParams();
  const token = params.token as string;
  const [state, setState] = useState<PageState>('loading');
  const [magicLink, setMagicLink] = useState<MagicLinkData | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function validateToken() {
      try {
        const res = await fetch(`/api/magic-links/${token}`);

        if (res.status === 410) {
          const data = await res.json();
          setState(data.error === 'Link already used' ? 'used' : 'expired');
          return;
        }

        if (!res.ok) {
          setState('error');
          setErrorMessage('Ungültiger Link.');
          return;
        }

        const data = await res.json();
        setMagicLink(data);
        setState('ready');
      } catch {
        setState('error');
        setErrorMessage('Ein Fehler ist aufgetreten.');
      }
    }

    validateToken();
  }, [token]);

  const handleRecordingComplete = useCallback(async (blob: Blob, duration: number) => {
    if (!magicLink) return;
    setState('uploading');

    try {
      const formData = new FormData();
      formData.append('file', blob, `recording-${token}.webm`);

      const uploadRes = await fetch('/api/recordings/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      const { audio_url } = await uploadRes.json();

      const recordingRes = await fetch('/api/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyteller_id: magicLink.storyteller_id,
          prompt_id: magicLink.prompt_id,
          audio_url,
          audio_duration_seconds: duration,
          magic_link_token: token,
        }),
      });

      if (!recordingRes.ok) throw new Error('Failed to save recording');

      setState('success');
    } catch {
      setState('error');
      setErrorMessage('Beim Hochladen ist ein Fehler aufgetreten. Bitte versuche es erneut.');
    }
  }, [magicLink, token]);

  const getQuestionText = () => {
    if (!magicLink?.prompt) return '';
    const lang = magicLink.storyteller?.language || 'de';
    const key = `question_${lang}` as keyof Prompt;
    return (magicLink.prompt[key] as string) || magicLink.prompt.question_de;
  };

  if (state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Laden...</div>
      </div>
    );
  }

  if (state === 'expired') {
    return (
      <StatusPage
        icon={<Clock className="h-12 w-12 text-muted-foreground" />}
        title="Link abgelaufen"
        message="Dieser Link ist leider abgelaufen. Deine Familie kann dir einen neuen Link senden."
      />
    );
  }

  if (state === 'used') {
    return (
      <StatusPage
        icon={<CheckCircle className="h-12 w-12 text-green-500" />}
        title="Bereits verwendet"
        message="Dieser Link wurde bereits verwendet. Vielen Dank für deine Geschichte!"
      />
    );
  }

  if (state === 'success') {
    return (
      <StatusPage
        icon={<CheckCircle className="h-12 w-12 text-green-500" />}
        title="Vielen Dank!"
        message="Deine Geschichte wurde erfolgreich aufgenommen. Deine Familie wird sich darüber freuen!"
      />
    );
  }

  if (state === 'error') {
    return (
      <StatusPage
        icon={<AlertCircle className="h-12 w-12 text-destructive" />}
        title="Fehler"
        message={errorMessage}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8">
      <div className="mb-8 flex items-center gap-2">
        <BookOpen className="h-7 w-7 text-primary" />
        <span className="text-xl font-bold text-foreground">MeineMemoiren</span>
      </div>

      <div className="w-full max-w-md">
        {magicLink?.storyteller && (
          <p className="mb-2 text-center text-sm text-muted-foreground">
            Hallo {magicLink.storyteller.name}!
          </p>
        )}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Frage der Woche
            </p>
            <p className="mt-2 text-xl font-semibold leading-relaxed text-foreground">
              {getQuestionText()}
            </p>
          </CardContent>
        </Card>

        {/* Consent */}
        {!consentGiven ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Deine Aufnahme wird sicher gespeichert und nur für dein
                Familienbuch verwendet. Alle Daten werden auf EU-Servern
                gespeichert.
              </p>
            </div>
            <button
              onClick={() => setConsentGiven(true)}
              className="w-full rounded-lg bg-primary px-4 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Einverstanden — Aufnahme starten
            </button>
          </div>
        ) : (
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            disabled={state === 'uploading'}
          />
        )}

        {state === 'uploading' && (
          <p className="mt-4 text-center text-sm text-muted-foreground animate-pulse">
            Aufnahme wird hochgeladen...
          </p>
        )}
      </div>
    </div>
  );
}

function StatusPage({
  icon,
  title,
  message,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-4 flex items-center gap-2">
        <BookOpen className="h-7 w-7 text-primary" />
        <span className="text-xl font-bold text-foreground">MeineMemoiren</span>
      </div>
      <div className="text-center">
        <div className="mb-4 flex justify-center">{icon}</div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
