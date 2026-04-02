"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Check, BookOpen } from "lucide-react";
import { useState } from "react";

export function Pricing() {
  const t = useTranslations("landing.pricing");
  const [loading, setLoading] = useState(false);

  const features: string[] = [
    t("package.features.0"),
    t("package.features.1"),
    t("package.features.2"),
    t("package.features.3"),
    t("package.features.4"),
    t("package.features.5"),
    t("package.features.6"),
  ];

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: "de" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-stone-900 mb-16">
          {t("title")}
        </h2>

        <div className="max-w-md mx-auto">
          <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-600 text-white px-4 py-1 text-xs font-bold rounded-bl-xl">
              BELIEBT
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-stone-900 mb-2">
                {t("package.name")}
              </h3>
              <p className="text-stone-600 text-sm mb-6">
                {t("package.description")}
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-stone-900">
                  {t("package.price")}
                </span>
                <span className="text-2xl font-medium text-stone-500">
                  {t("package.currency")}
                </span>
              </div>
              <p className="text-sm text-stone-500 mt-1">einmalig</p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-stone-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={loading}
            >
              <BookOpen className="h-5 w-5 mr-1" />
              {loading ? "..." : t("package.cta")}
            </Button>

            <p className="text-center text-xs text-stone-500 mt-4">
              {t("extraCopy")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
