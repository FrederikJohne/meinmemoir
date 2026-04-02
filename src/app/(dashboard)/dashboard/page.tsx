'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookText, Mic, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import type { Recording, Storyteller, Prompt } from '@/lib/types';
import Link from 'next/link';

type RecordingWithDetails = Recording & {
  prompt?: Prompt;
  storyteller?: Storyteller;
};

export default function DashboardPage() {
  const [recordings, setRecordings] = useState<RecordingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
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
    fetchData();
  }, []);

  const completedCount = recordings.filter(r => r.status === 'completed').length;
  const pendingCount = recordings.filter(r => r.status === 'pending' || r.status === 'processing').length;
  const totalCount = recordings.length;

  const recentRecordings = recordings.slice(0, 5);

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
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Willkommen zurück! Hier ist der Überblick über eure Geschichten.</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BookText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-sm text-muted-foreground">Geschichten gesamt</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Abgeschlossen</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">In Bearbeitung</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Math.round((completedCount / 52) * 100)}%</p>
              <p className="text-sm text-muted-foreground">Fortschritt</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Stories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Neueste Geschichten</CardTitle>
          <Link href="/dashboard/stories" className="text-sm text-primary hover:underline">
            Alle anzeigen
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : recentRecordings.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Mic className="h-12 w-12 text-muted-foreground/50" />
              <div>
                <p className="font-medium text-foreground">Noch keine Geschichten</p>
                <p className="text-sm text-muted-foreground">
                  Die erste Frage wurde an deinen Erzähler gesendet!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRecordings.map((recording) => (
                <Link
                  key={recording.id}
                  href={`/dashboard/stories?id=${recording.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {recording.prompt?.question_de || 'Geschichte'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(recording.created_at).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge className={statusColors[recording.status]} variant="secondary">
                    {statusLabels[recording.status]}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
