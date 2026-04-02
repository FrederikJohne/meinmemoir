import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const features = [
  '52 wöchentliche Fragen per WhatsApp/SMS',
  'KI-gestützte Textbearbeitung',
  'Gedrucktes Hardcover-Buch',
  'QR-Codes mit Original-Sprachaufnahmen',
  'Online-Dashboard zum Bearbeiten',
  'Familienmitglieder einladen',
  'Fotos zu Geschichten hinzufügen',
  'DSGVO-konform — Daten in der EU',
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ein Geschenk, das bleibt
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Alles in einem Paket — keine versteckten Kosten
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-md">
          <Card className="relative overflow-hidden border-primary/20 shadow-xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">MeineMemoiren Paket</CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold text-foreground">99 €</span>
                <span className="ml-2 text-muted-foreground">einmalig</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/login" className="mt-8 block">
                <Button size="lg" className="w-full h-12 text-base">
                  Jetzt verschenken
                </Button>
              </Link>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Zahlung per Kreditkarte, SEPA, Klarna oder PayPal
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
