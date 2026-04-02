import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">MeineMemoiren</span>
          </div>

          <nav className="flex gap-6">
            <Link href="/datenschutz" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Datenschutz
            </Link>
            <Link href="/impressum" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Impressum
            </Link>
            <Link href="/agb" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              AGB
            </Link>
          </nav>

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MeineMemoiren. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
