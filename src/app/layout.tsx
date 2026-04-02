import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MeineMemoiren — Bewahre die Geschichten deiner Familie',
  description:
    'Verwandle die Erinnerungen deiner Liebsten in ein wunderschönes Buch mit QR-Code-Sprachaufnahmen. Das perfekte Geschenk für die ganze Familie.',
  keywords: ['Memoiren', 'Familienbuch', 'Erinnerungen', 'Geschenk', 'Großeltern', 'Sprachaufnahme'],
  openGraph: {
    title: 'MeineMemoiren — Bewahre die Geschichten deiner Familie',
    description:
      'Verwandle die Erinnerungen deiner Liebsten in ein wunderschönes Buch mit QR-Code-Sprachaufnahmen.',
    url: 'https://meinememoiren.com',
    siteName: 'MeineMemoiren',
    locale: 'de_DE',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
