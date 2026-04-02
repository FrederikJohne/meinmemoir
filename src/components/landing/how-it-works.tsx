import { Gift, MessageCircle, Mic, BookOpen } from 'lucide-react';

const steps = [
  {
    icon: Gift,
    title: 'Verschenke MeineMemoiren',
    description: 'Bestelle das Paket und richte ein Profil für deinen Erzähler ein — Oma, Opa oder ein anderes Familienmitglied.',
  },
  {
    icon: MessageCircle,
    title: 'Wöchentliche Fragen',
    description: 'Dein Erzähler erhält jede Woche eine liebevolle Frage per WhatsApp oder SMS. Kein Login, keine App nötig.',
  },
  {
    icon: Mic,
    title: 'Einfach erzählen',
    description: 'Mit einem Klick aufnehmen. Unsere KI verwandelt die Sprachaufnahme in eine wunderschön geschriebene Geschichte.',
  },
  {
    icon: BookOpen,
    title: 'Das Buch erhalten',
    description: 'Nach 6 Monaten hältst du ein gedrucktes Buch in den Händen — mit QR-Codes, um die Originalstimme zu hören.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            So funktioniert&apos;s
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            In vier einfachen Schritten zum Familienbuch
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <step.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
