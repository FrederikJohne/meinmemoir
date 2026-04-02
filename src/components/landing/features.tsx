"use client";

import { useTranslations } from "next-intl";
import {
  Smartphone,
  MessageCircle,
  Sparkles,
  BookOpen,
  Users,
  Shield,
} from "lucide-react";

const features = [
  { icon: Smartphone, key: "noApp" as const },
  { icon: MessageCircle, key: "whatsapp" as const },
  { icon: Sparkles, key: "ai" as const },
  { icon: BookOpen, key: "print" as const },
  { icon: Users, key: "family" as const },
  { icon: Shield, key: "privacy" as const },
];

export function Features() {
  const t = useTranslations("landing.features");

  return (
    <section id="features" className="py-20 sm:py-28 bg-stone-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-stone-900 mb-16">
          {t("title")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.key}
                className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 text-amber-700 mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  {t(`${feature.key}.title`)}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {t(`${feature.key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
