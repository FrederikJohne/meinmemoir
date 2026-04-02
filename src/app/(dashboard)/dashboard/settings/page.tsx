'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, User, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        setFullName(user.user_metadata?.full_name || '');
      }
    }
    loadUser();
  }, [supabase.auth]);

  async function handleSave() {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    if (error) {
      toast.error('Fehler beim Speichern.');
    } else {
      toast.success('Einstellungen gespeichert!');
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Einstellungen</h1>
        <p className="text-muted-foreground">Verwalte dein Konto und deine Einstellungen.</p>
      </div>

      <div className="max-w-xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" value={email} disabled />
            </div>
            <Button onClick={handleSave}>Speichern</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Datenschutz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Alle deine Daten werden sicher auf EU-Servern in Frankfurt gespeichert.
              Wir sind vollständig DSGVO-konform.
            </p>
            <div className="space-y-2">
              <Button variant="outline" size="sm">
                Daten exportieren
              </Button>
              <Button variant="destructive" size="sm" className="ml-2">
                Konto löschen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
