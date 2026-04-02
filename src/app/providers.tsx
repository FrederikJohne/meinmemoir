'use client';

import { useEffect, useRef } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

export function Providers({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: 'https://eu.i.posthog.com',
        capture_pageview: true,
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
        person_profiles: 'identified_only',
      });
      initialized.current = true;
    }
  }, []);

  return (
    <PostHogProvider client={posthog}>
      {children}
    </PostHogProvider>
  );
}
