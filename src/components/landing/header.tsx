'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            MeineMemoiren
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            So funktioniert&apos;s
          </a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Preis
          </a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </a>
          <Link href="/login">
            <Button variant="ghost" size="sm">Anmelden</Button>
          </Link>
          <Link href="/login">
            <Button size="sm">Jetzt verschenken</Button>
          </Link>
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/40 bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <a href="#how-it-works" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>
              So funktioniert&apos;s
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>
              Preis
            </a>
            <a href="#faq" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>
              FAQ
            </a>
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full">Anmelden</Button>
            </Link>
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full">Jetzt verschenken</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
