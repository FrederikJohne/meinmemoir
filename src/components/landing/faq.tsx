'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Braucht mein Erzähler ein Smartphone?',
    answer: 'Ja, ein Smartphone mit WhatsApp oder SMS-Empfang genügt. Es wird keine App heruntergeladen — alles funktioniert über einen einfachen Link im Browser.',
  },
  {
    question: 'Was passiert mit den Aufnahmen?',
    answer: 'Alle Aufnahmen werden sicher auf EU-Servern (Frankfurt) gespeichert und nur für dein Familienbuch verwendet. Wir sind vollständig DSGVO-konform.',
  },
  {
    question: 'Kann ich die Geschichten bearbeiten?',
    answer: 'Ja! Im Dashboard kannst du alle KI-bearbeiteten Texte überprüfen und anpassen. Du kannst auch Fotos hinzufügen und die Reihenfolge der Geschichten ändern.',
  },
  {
    question: 'Wie lange dauert es, bis das Buch fertig ist?',
    answer: 'Das Paket umfasst 52 wöchentliche Fragen — ein ganzes Jahr voller Geschichten. Du kannst das Buch jederzeit bestellen, auch bevor alle Fragen beantwortet sind.',
  },
  {
    question: 'Kann ich weitere Exemplare bestellen?',
    answer: 'Natürlich! Im Dashboard kannst du jederzeit weitere Exemplare des Buches bestellen — perfekt als Geschenk für andere Familienmitglieder.',
  },
  {
    question: 'Welche Sprachen werden unterstützt?',
    answer: 'Aktuell unterstützen wir Deutsch, Englisch und Schwedisch. Die Fragen und die KI-Bearbeitung werden in der Sprache deines Erzählers durchgeführt.',
  },
  {
    question: 'Was kostet der Versand?',
    answer: 'Der Versand innerhalb Deutschlands ist im Preis enthalten. Für andere Länder können zusätzliche Versandkosten anfallen.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Häufige Fragen
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Alles, was du wissen musst
          </p>
        </div>

        <div className="mt-12 divide-y divide-border">
          {faqs.map((faq, index) => (
            <div key={faq.question} className="py-4">
              <button
                className="flex w-full items-center justify-between text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-base font-medium text-foreground pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-200',
                  openIndex === index ? 'mt-3 max-h-96' : 'max-h-0'
                )}
              >
                <p className="text-sm leading-6 text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
