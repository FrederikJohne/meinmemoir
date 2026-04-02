"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Mic, Square, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecordingPageProps {
  token: string;
  storytellerName?: string;
  question?: string;
  language?: string;
  expired?: boolean;
}

type RecordingState = "idle" | "recording" | "recorded" | "uploading" | "success" | "error";

const messages = {
  de: {
    greeting: (name: string) => `Hallo ${name}!`,
    intro: "Deine Familie möchte deine Geschichte hören.",
    questionLabel: "Frage der Woche",
    record: "Aufnehmen",
    stop: "Stoppen",
    submit: "Aufnahme absenden",
    recording: "Aufnahme läuft...",
    uploading: "Wird hochgeladen...",
    successTitle: "Vielen Dank!",
    successMessage: "Deine Aufnahme wurde erfolgreich gespeichert. Deine Familie wird sich sehr freuen!",
    consent: "Deine Aufnahme wird sicher gespeichert und nur für dein Familienbuch verwendet.",
    expiredTitle: "Link abgelaufen",
    expiredMessage: "Dieser Aufnahme-Link ist leider abgelaufen. Bitte wende dich an deine Familie für einen neuen Link.",
    micError: "Bitte erlaube den Zugriff auf dein Mikrofon.",
    uploadError: "Die Aufnahme konnte nicht hochgeladen werden. Bitte versuche es erneut.",
    retry: "Erneut versuchen",
  },
  en: {
    greeting: (name: string) => `Hello ${name}!`,
    intro: "Your family wants to hear your story.",
    questionLabel: "Question of the week",
    record: "Record",
    stop: "Stop",
    submit: "Submit Recording",
    recording: "Recording...",
    uploading: "Uploading...",
    successTitle: "Thank you!",
    successMessage: "Your recording has been saved successfully. Your family will be so happy!",
    consent: "Your recording will be securely stored and used only for your family book.",
    expiredTitle: "Link expired",
    expiredMessage: "This recording link has expired. Please contact your family for a new link.",
    micError: "Please allow microphone access to record.",
    uploadError: "The recording could not be uploaded. Please try again.",
    retry: "Try again",
  },
  sv: {
    greeting: (name: string) => `Hej ${name}!`,
    intro: "Din familj vill höra din berättelse.",
    questionLabel: "Veckans fråga",
    record: "Spela in",
    stop: "Stoppa",
    submit: "Skicka inspelning",
    recording: "Spelar in...",
    uploading: "Laddar upp...",
    successTitle: "Tack!",
    successMessage: "Din inspelning har sparats. Din familj kommer bli så glad!",
    consent: "Din inspelning lagras säkert och används bara för din familjebok.",
    expiredTitle: "Länken har gått ut",
    expiredMessage: "Den här inspelningslänken har gått ut. Kontakta din familj för en ny länk.",
    micError: "Tillåt mikrofonåtkomst för att spela in.",
    uploadError: "Inspelningen kunde inte laddas upp. Försök igen.",
    retry: "Försök igen",
  },
};

export function RecordingPage({
  token,
  storytellerName,
  question,
  language = "de",
  expired = false,
}: RecordingPageProps) {
  const t = messages[language as keyof typeof messages] || messages.de;

  const [state, setState] = useState<RecordingState>("idle");
  const [duration, setDuration] = useState(0);
  const [consentGiven, setConsentGiven] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setState("recorded");
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setState("recording");
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      setState("error");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const submitRecording = useCallback(async () => {
    if (!audioBlob) return;

    setState("uploading");

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("token", token);

      const response = await fetch("/api/recordings", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      setState("success");
    } catch {
      setState("error");
    }
  }, [audioBlob, token]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (expired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <AlertCircle className="h-16 w-16 text-stone-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-stone-900 mb-2">
              {t.expiredTitle}
            </h1>
            <p className="text-stone-600">{t.expiredMessage}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-stone-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-stone-900 mb-2">
              {t.successTitle}
            </h1>
            <p className="text-stone-600">{t.successMessage}</p>
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
          <div className="text-center">
            <h1 className="text-3xl font-bold text-stone-900 mb-2">
              {storytellerName ? t.greeting(storytellerName) : ""}
            </h1>
            <p className="text-lg text-stone-600">{t.intro}</p>
          </div>

          {question && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="pt-6">
                <p className="text-xs uppercase font-semibold text-amber-700 mb-2">
                  {t.questionLabel}
                </p>
                <p className="text-xl font-medium text-stone-900 leading-relaxed">
                  {question}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col items-center gap-6">
            {!consentGiven && state === "idle" && (
              <div className="w-full">
                <label className="flex items-start gap-3 p-4 rounded-xl bg-white border border-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-stone-600">{t.consent}</span>
                </label>
              </div>
            )}

            {state === "recording" && (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
                  <div className="relative w-32 h-32 rounded-full bg-red-500 flex items-center justify-center">
                    <Mic className="h-12 w-12 text-white" />
                  </div>
                </div>
                <p className="text-lg font-medium text-stone-900">
                  {t.recording}
                </p>
                <p className="text-3xl font-mono font-bold text-stone-900">
                  {formatDuration(duration)}
                </p>
              </div>
            )}

            {state === "uploading" && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-amber-100 flex items-center justify-center animate-pulse">
                  <Send className="h-12 w-12 text-amber-600" />
                </div>
                <p className="text-lg font-medium text-stone-600">
                  {t.uploading}
                </p>
              </div>
            )}

            {state === "idle" && (
              <Button
                size="lg"
                className={cn(
                  "w-full h-20 text-xl rounded-2xl",
                  !consentGiven && "opacity-50 cursor-not-allowed"
                )}
                onClick={startRecording}
                disabled={!consentGiven}
              >
                <Mic className="h-8 w-8 mr-3" />
                {t.record}
              </Button>
            )}

            {state === "recording" && (
              <Button
                size="lg"
                variant="destructive"
                className="w-full h-16 text-lg rounded-2xl"
                onClick={stopRecording}
              >
                <Square className="h-6 w-6 mr-2" />
                {t.stop}
              </Button>
            )}

            {state === "recorded" && (
              <div className="w-full space-y-3">
                <p className="text-center text-stone-600">
                  {formatDuration(duration)} aufgenommen
                </p>
                <Button
                  size="lg"
                  className="w-full h-16 text-lg rounded-2xl"
                  onClick={submitRecording}
                >
                  <Send className="h-6 w-6 mr-2" />
                  {t.submit}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setAudioBlob(null);
                    setDuration(0);
                    setState("idle");
                  }}
                >
                  {t.retry}
                </Button>
              </div>
            )}

            {state === "error" && (
              <div className="text-center space-y-4">
                <p className="text-red-600">{t.uploadError}</p>
                <Button
                  variant="outline"
                  onClick={() => setState("idle")}
                >
                  {t.retry}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
