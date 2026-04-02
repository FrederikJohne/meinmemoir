"use client";

import { useTranslations } from "next-intl";
import { Gift, MessageCircle, Sparkles, BookOpen } from "lucide-react";

const steps = [
  { icon: Gift, key: "step1" as const },
  { icon: MessageCircle, key: "step2" as const },
  { icon: Sparkles, key: "step3" as const },
  { icon: BookOpen, key: "step4" as const },
];

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-stone-900 mb-16">
          {t("title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.key}
                className="relative flex flex-col items-center text-center"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 mb-5">
                  <Icon className="h-8 w-8" />
                </div>

                <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-bold md:static md:mb-3 md:w-8 md:h-8">
                  {index + 1}
                </div>

                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  {t(`${step.key}.title`)}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {t(`${step.key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
