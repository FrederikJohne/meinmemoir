"use client";

import { useTranslations } from "next-intl";
import { BookOpen } from "lucide-react";
import { Link } from "@/i18n/routing";

export function Footer() {
  const t = useTranslations("landing.footer");

  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-6 w-6 text-amber-500" />
              <span className="text-lg font-bold text-white">
                {t("company")}
              </span>
            </div>
            <p className="text-sm text-stone-400 max-w-sm">
              {t("tagline")}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">
              {t("legal")}
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/datenschutz"
                  className="text-sm text-stone-400 hover:text-white transition-colors"
                >
                  {t("privacy")}
                </a>
              </li>
              <li>
                <a
                  href="/agb"
                  className="text-sm text-stone-400 hover:text-white transition-colors"
                >
                  {t("terms")}
                </a>
              </li>
              <li>
                <a
                  href="/impressum"
                  className="text-sm text-stone-400 hover:text-white transition-colors"
                >
                  {t("imprint")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">
              {t("contact")}
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={`mailto:${t("email")}`}
                  className="text-sm text-stone-400 hover:text-white transition-colors"
                >
                  {t("email")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 text-center">
          <p className="text-xs text-stone-500">
            &copy; {new Date().getFullYear()} MeineMemoiren. Alle Rechte
            vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
