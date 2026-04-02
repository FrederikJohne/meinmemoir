"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Printer, Copy, Eye } from "lucide-react";

export default function BookPage() {
  const t = useTranslations("dashboard.book");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">{t("title")}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-600" />
                Buchvorschau
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[3/4] bg-gradient-to-b from-amber-100 to-amber-50 rounded-xl border border-amber-200 flex items-center justify-center">
                <div className="text-center p-8">
                  <BookOpen className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-stone-800 mb-2">
                    Unsere Familiengeschichte
                  </h3>
                  <p className="text-sm text-stone-500">
                    Füge Geschichten hinzu, um die Buchvorschau zu sehen
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-stone-900">0</p>
                <p className="text-sm text-stone-500">Geschichten im Buch</p>
              </div>

              <div className="space-y-3">
                <Button className="w-full" variant="outline" disabled>
                  <Eye className="h-4 w-4 mr-2" />
                  {t("preview")}
                </Button>
                <Button className="w-full" disabled>
                  <Printer className="h-4 w-4 mr-2" />
                  {t("print")}
                </Button>
                <Button className="w-full" variant="secondary" disabled>
                  <Copy className="h-4 w-4 mr-2" />
                  {t("extraCopies")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <p className="text-sm text-amber-800">
                Das Buch kann gedruckt werden, sobald mindestens 5 Geschichten
                aufgenommen wurden. Du kannst jederzeit weitere Geschichten
                hinzufügen und erneut drucken.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
