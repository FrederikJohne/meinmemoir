"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, Mic, Star } from "lucide-react";

export function Hero() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50/30 to-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.08),transparent_50%)]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 mb-8">
            <Heart className="h-4 w-4" />
            <span>{t("trust")}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-tight">
            {t("title")}
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-stone-600 leading-relaxed max-w-2xl mx-auto">
            {t("subtitle")}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base" asChild>
              <a href="#pricing">
                <BookOpen className="h-5 w-5 mr-1" />
                {t("cta")}
              </a>
            </Button>
            <span className="text-sm text-stone-500 font-medium">
              {t("price")}
            </span>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-4 max-w-xl mx-auto">
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-stone-200/50">
            <Mic className="h-8 w-8 text-amber-600" />
            <span className="text-xs sm:text-sm font-medium text-stone-700 text-center">
              Per Sprache erzählen
            </span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-stone-200/50">
            <Star className="h-8 w-8 text-amber-600" />
            <span className="text-xs sm:text-sm font-medium text-stone-700 text-center">
              KI macht Text daraus
            </span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-stone-200/50">
            <BookOpen className="h-8 w-8 text-amber-600" />
            <span className="text-xs sm:text-sm font-medium text-stone-700 text-center">
              Dein Familienbuch
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
