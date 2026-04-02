"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const t = useTranslations("common");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-amber-600" />
          <span className="text-xl font-bold text-stone-900">
            {t("appName")}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            So funktioniert&apos;s
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            Vorteile
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            Preise
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            FAQ
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">{t("login")}</Link>
          </Button>
          <Button size="sm" asChild>
            <a href="#pricing">Jetzt verschenken</a>
          </Button>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-stone-700" />
          ) : (
            <Menu className="h-6 w-6 text-stone-700" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-3">
          <a
            href="#how-it-works"
            className="block text-sm font-medium text-stone-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            So funktioniert&apos;s
          </a>
          <a
            href="#features"
            className="block text-sm font-medium text-stone-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            Vorteile
          </a>
          <a
            href="#pricing"
            className="block text-sm font-medium text-stone-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            Preise
          </a>
          <a
            href="#faq"
            className="block text-sm font-medium text-stone-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            FAQ
          </a>
          <div className="pt-3 border-t border-stone-200 flex flex-col gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">{t("login")}</Link>
            </Button>
            <Button size="sm" asChild>
              <a href="#pricing">Jetzt verschenken</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
