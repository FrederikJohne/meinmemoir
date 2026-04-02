import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Mic, Heart } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Heart className="h-4 w-4" />
            <span>Das perfekte Geschenk für Oma &amp; Opa</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Bewahre die Geschichten deiner Familie —{' '}
            <span className="text-primary">für immer</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
            MeineMemoiren verwandelt die Erinnerungen deiner Liebsten in ein
            wunderschönes Buch mit QR-Code-Sprachaufnahmen. Kein Login, keine
            App — einfach per WhatsApp antworten und erzählen.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 text-base">
                Jetzt verschenken — 99 €
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                So funktioniert&apos;s
              </Button>
            </a>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">52 Fragen</p>
              <p className="text-xs text-muted-foreground">Ein Jahr voller Geschichten</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Gedrucktes Buch</p>
              <p className="text-xs text-muted-foreground">Mit QR-Codes zum Anhören</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Kein Login nötig</p>
              <p className="text-xs text-muted-foreground">Einfach per WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
