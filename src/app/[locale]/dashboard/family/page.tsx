"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Mail, Trash2 } from "lucide-react";

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "family_member";
}

export default function FamilyPage() {
  const t = useTranslations("dashboard.family");
  const [members] = useState<FamilyMember[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/family/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (response.ok) {
        setInviteEmail("");
        setShowInvite(false);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">{t("title")}</h1>
        <Button onClick={() => setShowInvite(!showInvite)}>
          <UserPlus className="h-4 w-4 mr-2" />
          {t("invite")}
        </Button>
      </div>

      {showInvite && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleInvite} className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="inviteEmail">E-Mail-Adresse</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={loading}>
                  <Mail className="h-4 w-4 mr-2" />
                  Einladen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {members.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <UserPlus className="h-12 w-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500">
              Noch keine Familienmitglieder eingeladen.
            </p>
            <p className="text-sm text-stone-400 mt-1">
              Lade Familienmitglieder ein, damit sie Fotos hinzufügen und
              Geschichten lesen können.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <Card key={member.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-stone-900">
                        {member.name}
                      </p>
                      <p className="text-sm text-stone-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      {t(`role.${member.role}`)}
                    </Badge>
                    {member.role !== "admin" && (
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-stone-400" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
