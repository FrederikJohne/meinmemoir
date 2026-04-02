'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, Pause, Edit2, Save, X, BookText } from 'lucide-react';
import { toast } from 'sonner';
import type { Recording, Prompt, Storyteller, Photo } from '@/lib/types';

type RecordingWithDetails = Recording & {
  prompt?: Prompt;
  storyteller?: Storyteller;
  photos?: Photo[];
};

export default function StoriesPage() {
  const [recordings, setRecordings] = useState<RecordingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecording, setSelectedRecording] = useState<RecordingWithDetails | null>(null);
  const [editing, setEditing] = useState(false);
  const [editedStory, setEditedStory] = useState('');
  const [saving, setSaving] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchRecordings() {
      try {
        const res = await fetch('/api/recordings');
        if (res.ok) {
          const data = await res.json();
          setRecordings(data || []);
        }
      } catch {
        console.error('Failed to fetch recordings');
      } finally {
        setLoading(false);
      }
    }
    fetchRecordings();
  }, []);

  const togglePlay = (recording: RecordingWithDetails) => {
    if (playingId === recording.id) {
      audio?.pause();
      setPlayingId(null);
      return;
    }

    audio?.pause();
    if (recording.audio_url) {
      const newAudio = new Audio(recording.audio_url);
      newAudio.addEventListener('ended', () => setPlayingId(null));
      newAudio.play();
      setAudio(newAudio);
      setPlayingId(recording.id);
    }
  };

  const openStory = (recording: RecordingWithDetails) => {
    setSelectedRecording(recording);
    setEditedStory(recording.cleaned_story || '');
    setEditing(false);
  };

  const saveStory = async () => {
    if (!selectedRecording) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/stories/${selectedRecording.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cleaned_story: editedStory }),
      });

      if (!res.ok) throw new Error('Failed to save');

      setRecordings(prev =>
        prev.map(r =>
          r.id === selectedRecording.id
            ? { ...r, cleaned_story: editedStory }
            : r
        )
      );
      setSelectedRecording(prev => prev ? { ...prev, cleaned_story: editedStory } : null);
      setEditing(false);
      toast.success('Geschichte gespeichert!');
    } catch {
      toast.error('Fehler beim Speichern.');
    } finally {
      setSaving(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Ausstehend',
    processing: 'In Bearbeitung',
    completed: 'Fertig',
    failed: 'Fehlgeschlagen',
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Geschichten</h1>
        <p className="text-muted-foreground">Alle aufgenommenen Geschichten deines Erzählers.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : recordings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <BookText className="h-16 w-16 text-muted-foreground/30" />
            <div>
              <p className="text-lg font-medium text-foreground">Noch keine Geschichten</p>
              <p className="text-sm text-muted-foreground">
                Sobald dein Erzähler die erste Frage beantwortet, erscheinen die Geschichten hier.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recordings.map((recording) => (
            <Card
              key={recording.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => openStory(recording)}
            >
              <CardContent className="flex items-center gap-4 py-4">
                {recording.audio_url && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay(recording);
                    }}
                  >
                    {playingId === recording.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                )}

                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {recording.prompt?.question_de || 'Geschichte'}
                  </p>
                  {recording.cleaned_story && (
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {recording.cleaned_story.substring(0, 120)}...
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(recording.created_at).toLocaleDateString('de-DE')}
                    </span>
                    {recording.prompt?.category && (
                      <Badge variant="outline" className="text-xs">
                        {recording.prompt.category}
                      </Badge>
                    )}
                  </div>
                </div>

                <Badge className={statusColors[recording.status]} variant="secondary">
                  {statusLabels[recording.status]}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Story Detail Dialog */}
      <Dialog open={!!selectedRecording} onOpenChange={(open) => !open && setSelectedRecording(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {selectedRecording?.prompt?.question_de || 'Geschichte'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedRecording?.audio_url && (
              <audio controls src={selectedRecording.audio_url} className="w-full" />
            )}

            {editing ? (
              <div className="space-y-3">
                <Textarea
                  value={editedStory}
                  onChange={(e) => setEditedStory(e.target.value)}
                  rows={12}
                  className="resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Abbrechen
                  </Button>
                  <Button onClick={saveStory} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Speichern...' : 'Speichern'}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {selectedRecording?.cleaned_story ? (
                  <div className="space-y-3">
                    <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                      {selectedRecording.cleaned_story}
                    </p>
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Bearbeiten
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    Die Geschichte wird noch bearbeitet...
                  </p>
                )}
              </div>
            )}

            {selectedRecording?.raw_transcript && (
              <details className="rounded-lg border border-border p-3">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                  Original-Transkript anzeigen
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {selectedRecording.raw_transcript}
                </p>
              </details>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
