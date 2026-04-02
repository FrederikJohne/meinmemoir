"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import {
  BookOpen,
  BookText,
  Users,
  Settings,
  LogOut,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { key: "stories" as const, href: "/dashboard" as const, icon: Mic },
  { key: "book" as const, href: "/dashboard/book" as const, icon: BookText },
  { key: "family" as const, href: "/dashboard/family" as const, icon: Users },
  { key: "settings" as const, href: "/dashboard/settings" as const, icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200">
        <div className="mx-auto max-w-6xl flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-amber-600" />
            <span className="text-xl font-bold text-stone-900">
              MeineMemoiren
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Abmelden</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex gap-1 mb-8 p-1 bg-stone-100 rounded-xl w-fit">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </div>
  );
}
