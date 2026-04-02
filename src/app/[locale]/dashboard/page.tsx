"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, Play, Edit, BookOpen, Clock } from "lucide-react";
import type { Recording, Prompt } from "@/lib/types";

interface RecordingWithPrompt extends Recording {
  prompt?: Prompt;
}

const statusColors = {
  pending: "secondary" as const,
  processing: "default" as const,
  completed: "success" as const,
  failed: "destructive" as const,
};

export default function StoriesPage() {
  const t = useTranslations("dashboard.stories");
  const [recordings, setRecordings] = useState<RecordingWithPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecordings() {
      try {
        const response = await fetch("/api/recordings");
        if (response.ok) {
          const data = await response.json();
          setRecordings(data.recordings || []);
        }
      } catch {
        // Silently handle
      } finally {
        setLoading(false);
      }
    }
    fetchRecordings();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-white rounded-2xl animate-pulse border border-stone-200"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{t("title")}</h1>
          <p className="text-sm text-stone-500 mt-1">
            {recordings.length > 0
              ? `${recordings.length} Geschichten`
              : t("empty")}
          </p>
        </div>
      </div>

      {recordings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <Mic className="h-12 w-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500">{t("empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recordings.map((recording) => (
            <Card key={recording.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={statusColors[recording.status]}>
                        {t(`status.${recording.status}`)}
                      </Badge>
                      <span className="text-xs text-stone-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(recording.created_at).toLocaleDateString(
                          "de-DE",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    {recording.cleaned_story ? (
                      <p className="text-stone-700 line-clamp-2 text-sm">
                        {recording.cleaned_story}
                      </p>
                    ) : recording.raw_transcript ? (
                      <p className="text-stone-500 line-clamp-2 text-sm italic">
                        {recording.raw_transcript}
                      </p>
                    ) : (
                      <p className="text-stone-400 text-sm italic">
                        Wird verarbeitet...
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {recording.audio_url && (
                      <Button variant="ghost" size="icon">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {recording.status === "completed" && (
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
