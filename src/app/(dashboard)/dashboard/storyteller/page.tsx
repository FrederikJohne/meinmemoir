'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MessageCircle, Phone, Mail, Globe } from 'lucide-react';
import type { Storyteller } from '@/lib/types';

const deliveryIcons = {
  whatsapp: MessageCircle,
  sms: Phone,
  email: Mail,
};

const languageLabels: Record<string, string> = {
  de: 'Deutsch',
  en: 'English',
  sv: 'Svenska',
};

export default function StorytellerPage() {
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStorytellers() {
      try {
        const res = await fetch('/api/storytellers');
        if (res.ok) {
          const data = await res.json();
          setStorytellers(data || []);
        }
      } catch {
        console.error('Failed to fetch storytellers');
      } finally {
        setLoading(false);
      }
    }
    fetchStorytellers();
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Erzähler</h1>
        </div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Erzähler</h1>
        <p className="text-muted-foreground">Verwalte die Profile deiner Erzähler.</p>
      </div>

      {storytellers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <User className="h-16 w-16 text-muted-foreground/30" />
            <div>
              <p className="text-lg font-medium text-foreground">Kein Erzähler eingerichtet</p>
              <p className="text-sm text-muted-foreground">
                Richte zuerst einen Erzähler ein, um loszulegen.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {storytellers.map((storyteller) => {
            const DeliveryIcon = deliveryIcons[storyteller.delivery_method];
            return (
              <Card key={storyteller.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{storyteller.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Erstellt am{' '}
                        {new Date(storyteller.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <DeliveryIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{storyteller.delivery_method}</span>
                    {storyteller.phone_number && (
                      <span className="text-muted-foreground">
                        — {storyteller.phone_number}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{languageLabels[storyteller.language]}</span>
                  </div>
                  <Badge variant="outline">{storyteller.timezone}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
