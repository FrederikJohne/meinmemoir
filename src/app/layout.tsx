import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MeineMemoiren — Die Geschichten deiner Familie, für immer bewahrt",
  description:
    "Schenke deinen Liebsten ein sprechendes Erinnerungsbuch. Oma oder Opa erzählen per Sprachnachricht, wir machen ein wunderschönes Buch daraus.",
  openGraph: {
    title: "MeineMemoiren — Die Geschichten deiner Familie",
    description:
      "Schenke deinen Liebsten ein sprechendes Erinnerungsbuch. Oma oder Opa erzählen per Sprachnachricht, wir machen ein wunderschönes Buch daraus.",
    url: "https://meinememoiren.com",
    siteName: "MeineMemoiren",
    locale: "de_DE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
