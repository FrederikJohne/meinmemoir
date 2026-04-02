'use client';

import { useEffect } from 'react';
import { PostHogProvider } from 'posthog-js/react';
import { initPostHog } from '@/lib/posthog/client';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  const posthog = typeof window !== 'undefined' ? initPostHog() : undefined;

  return (
    <PostHogProvider client={posthog!}>
      {children}
    </PostHogProvider>
  );
}
