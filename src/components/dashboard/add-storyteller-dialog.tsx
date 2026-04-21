'use client';

import { useState } from 'react';
import { Loader2, Mail, MessageCircle, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatApiErrorBody } from '@/lib/read-api-error';
import type { Storyteller } from '@/lib/types';

const deliveryMethods = [
  { id: 'whatsapp' as const, label: 'WhatsApp', icon: MessageCircle },
  { id: 'sms' as const, label: 'SMS', icon: Phone },
  { id: 'email' as const, label: 'E-Mail', icon: Mail },
];

const languages = [
  { id: 'de' as const, label: 'Deutsch', flag: '🇩🇪' },
  { id: 'en' as const, label: 'English', flag: '🇬🇧' },
  { id: 'sv' as const, label: 'Svenska', flag: '🇸🇪' },
];

type AddStorytellerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (storyteller: Storyteller) => void;
};

export function AddStorytellerDialog({
  open,
  onOpenChange,
  onCreated,
}: AddStorytellerDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<
    'whatsapp' | 'sms' | 'email'
  >('whatsapp');
  const [language, setLanguage] = useState<'de' | 'sv' | 'en'>('de');
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setName('');
    setPhone('');
    setEmail('');
    setDeliveryMethod('whatsapp');
    setLanguage('de');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/storytellers', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone_number: phone.trim() || null,
          email: deliveryMethod === 'email' ? email.trim() : null,
          delivery_method: deliveryMethod,
          language,
        }),
      });

      const raw = await res.text();
      if (!res.ok) {
        throw new Error(formatApiErrorBody(res.status, res.statusText, raw));
      }

      let created: Storyteller;
      try {
        created = JSON.parse(raw) as Storyteller;
      } catch {
        throw new Error('Unerwartete Antwort vom Server.');
      }
      if (!created?.id) {
        throw new Error('Erzähler wurde nicht korrekt angelegt.');
      }
      toast.success('Erzähler hinzugefügt.');
      resetForm();
      onCreated(created);
      onOpenChange(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Erzähler konnte nicht angelegt werden.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neuen Erzähler hinzufügen</DialogTitle>
          <DialogDescription>
            Profil für eine weitere Person, deren Geschichten du festhalten möchtest.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-narrator-name">Name</Label>
            <Input
              id="new-narrator-name"
              placeholder="z. B. Oma Helga"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Zustellungsart</Label>
            <div className="grid grid-cols-3 gap-2">
              {deliveryMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setDeliveryMethod(method.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-xs transition-colors',
                    deliveryMethod === method.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  <method.icon className="h-4 w-4" />
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {deliveryMethod !== 'email' ? (
            <div className="space-y-2">
              <Label htmlFor="new-narrator-phone">Telefonnummer</Label>
              <Input
                id="new-narrator-phone"
                type="tel"
                placeholder="+49 170 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="new-narrator-email">E-Mail-Adresse</Label>
              <Input
                id="new-narrator-email"
                type="email"
                placeholder="oma@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Sprache</Label>
            <div className="grid grid-cols-3 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.id)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs transition-colors',
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

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="sm:min-w-28"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" className="sm:min-w-28" disabled={submitting}>
              {submitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Speichern
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
