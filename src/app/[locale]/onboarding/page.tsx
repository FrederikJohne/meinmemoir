"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, MessageCircle, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

type DeliveryMethod = "whatsapp" | "sms" | "email";
type Language = "de" | "sv" | "en";

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("whatsapp");
  const [language, setLanguage] = useState<Language>("de");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone_number: phone,
          delivery_method: deliveryMethod,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save storyteller details");
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
      setLoading(false);
    }
  };

  const deliveryOptions: { value: DeliveryMethod; label: string; icon: React.ElementType }[] = [
    { value: "whatsapp", label: t("whatsapp"), icon: MessageCircle },
    { value: "sms", label: t("sms"), icon: Phone },
    { value: "email", label: t("emailOption"), icon: Mail },
  ];

  const languageOptions: { value: Language; label: string }[] = [
    { value: "de", label: t("german") },
    { value: "sv", label: t("swedish") },
    { value: "en", label: t("english") },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-50 to-stone-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-amber-600" />
            <span className="text-2xl font-bold text-stone-900">
              MeineMemoiren
            </span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="storytellerName">{t("name")}</Label>
                <Input
                  id="storytellerName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("phonePlaceholder")}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>{t("deliveryMethod")}</Label>
                <div className="grid grid-cols-3 gap-3">
                  {deliveryOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDeliveryMethod(option.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all cursor-pointer",
                          deliveryMethod === option.value
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                        )}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs font-medium">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label>{t("language")}</Label>
                <div className="grid grid-cols-3 gap-3">
                  {languageOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setLanguage(option.value)}
                      className={cn(
                        "rounded-xl border-2 p-3 text-sm font-medium transition-all cursor-pointer",
                        language === option.value
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "..." : t("submit")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
