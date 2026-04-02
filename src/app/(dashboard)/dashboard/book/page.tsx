'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Printer, Plus, Minus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import type { Recording } from '@/lib/types';

export default function BookPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [, setLoading] = useState(true);
  const [copies, setCopies] = useState(1);

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

  const completedStories = recordings.filter(r => r.status === 'completed');
  const progress = Math.round((completedStories.length / 52) * 100);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Buch</h1>
        <p className="text-muted-foreground">
          Gestalte und bestelle das gedruckte Familienbuch.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Book Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Buchfortschritt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Geschichten gesammelt</span>
              <span className="font-medium">{completedStories.length} / 52</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {progress < 100
                ? `Noch ${52 - completedStories.length} Geschichten bis zum fertigen Buch.`
                : 'Alle Geschichten gesammelt! Du kannst jetzt das Buch bestellen.'}
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{completedStories.length}</p>
                <p className="text-xs text-muted-foreground">Geschichten</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-2xl font-bold text-foreground">
                  ~{Math.max(20, completedStories.length * 2 + 10)}
                </p>
                <p className="text-xs text-muted-foreground">Seiten</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {recordings.filter(r => r.qr_code_url).length}
                </p>
                <p className="text-xs text-muted-foreground">QR-Codes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Book */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Buch bestellen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border p-4 text-center">
              <div className="mb-2 flex h-32 items-center justify-center">
                <BookOpen className="h-20 w-20 text-primary/20" />
              </div>
              <p className="font-medium text-foreground">MeineMemoiren Hardcover</p>
              <p className="text-sm text-muted-foreground">Premium-Druck mit QR-Codes</p>
              {completedStories.length < 5 && (
                <Badge variant="outline" className="mt-2">
                  Mindestens 5 Geschichten erforderlich
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Anzahl Exemplare</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCopies(Math.max(1, copies - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{copies}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCopies(copies + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {copies > 1 && (
              <p className="text-xs text-muted-foreground">
                Weitere Exemplare: {copies - 1} x 29 € = {(copies - 1) * 29} €
              </p>
            )}

            <Button
              className="w-full"
              disabled={completedStories.length < 5}
              onClick={() => toast.info('Buchbestellung wird vorbereitet...')}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Buch bestellen
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
