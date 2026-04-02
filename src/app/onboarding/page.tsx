'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Loader2, MessageCircle, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const deliveryMethods = [
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'sms', label: 'SMS', icon: Phone },
  { id: 'email', label: 'E-Mail', icon: Mail },
] as const;

const languages = [
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'sv', label: 'Svenska', flag: '🇸🇪' },
] as const;

export default function OnboardingPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [language, setLanguage] = useState<'de' | 'sv' | 'en'>('de');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/storytellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone_number: phone || null,
          email: deliveryMethod === 'email' ? email : null,
          delivery_method: deliveryMethod,
          language,
        }),
      });

      if (!res.ok) throw new Error('Failed to create storyteller');

      toast.success('Erzähler erfolgreich eingerichtet!');
      router.push('/dashboard');
    } catch {
      toast.error('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8">
      <div className="mb-8 flex items-center gap-2">
        <BookOpen className="h-7 w-7 text-primary" />
        <span className="text-xl font-bold text-foreground">MeineMemoiren</span>
      </div>

      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Richte deinen Erzähler ein</CardTitle>
            <p className="text-sm text-muted-foreground">
              Erzähl uns etwas über die Person, deren Geschichten du bewahren möchtest.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name des Erzählers</Label>
                <Input
                  id="name"
                  placeholder="z.B. Oma Helga"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Delivery Method */}
              <div className="space-y-2">
                <Label>Zustellungsart</Label>
                <div className="grid grid-cols-3 gap-2">
                  {deliveryMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setDeliveryMethod(method.id)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition-colors',
                        deliveryMethod === method.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <method.icon className="h-5 w-5" />
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              {deliveryMethod !== 'email' ? (
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefonnummer</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+49 170 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail-Adresse</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="oma@beispiel.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Language */}
              <div className="space-y-2">
                <Label>Sprache</Label>
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setLanguage(lang.id)}
                      className={cn(
                        'flex items-center justify-center gap-2 rounded-lg border p-3 text-sm transition-colors',
                        language === lang.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <span>{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Einrichtung abschließen
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
