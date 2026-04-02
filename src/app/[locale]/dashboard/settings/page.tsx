"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, Bell } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("dashboard.settings");

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">
        {t("title")}
      </h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-amber-600" />
              {t("storyteller")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="Oma Helga" disabled />
              </div>
              <div className="space-y-2">
                <Label>Telefonnummer</Label>
                <Input placeholder="+49 171 1234567" disabled />
              </div>
              <div className="space-y-2">
                <Label>Zustellmethode</Label>
                <Input value="WhatsApp" disabled />
              </div>
              <div className="space-y-2">
                <Label>Sprache</Label>
                <Input value="Deutsch" disabled />
              </div>
            </div>
            <Button variant="outline" size="sm">
              Bearbeiten
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-600" />
              {t("subscription")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-stone-900">
                  Das Erinnerungsbuch
                </p>
                <p className="text-sm text-stone-500">
                  Woche 0 von 52
                </p>
              </div>
              <Badge variant="success">Aktiv</Badge>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-stone-100 rounded-full">
                <div className="h-2 bg-amber-500 rounded-full w-0" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-600" />
              {t("notifications")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-900 text-sm">
                    Neue Aufnahme
                  </p>
                  <p className="text-xs text-stone-500">
                    Benachrichtigung, wenn eine neue Aufnahme eingeht
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-900 text-sm">
                    Wöchentlicher Bericht
                  </p>
                  <p className="text-xs text-stone-500">
                    Zusammenfassung der Woche per E-Mail
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                />
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
