# MeineMemoiren.com

**Die Geschichten deiner Familie — für immer bewahrt.**

A frictionless voice-to-story memoir platform for German seniors, producing a premium printed book with QR-code voice playback.

## Architecture

The platform consists of 3 services deployed on Railway:

| Service | Description | Port |
|---------|-------------|------|
| **web** | Next.js application (landing, dashboard, API routes) | 3000 |
| **worker** | AI processing pipeline (Deepgram → GPT-4o → QR) | 3001 |
| **scheduler** | Cron-triggered prompt dispatch (WhatsApp/SMS) | 3002 |

## Tech Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS, shadcn/ui, next-intl
- **Backend:** Node.js (Next.js API Routes + Railway services)
- **Database & Auth:** Supabase (PostgreSQL + Auth + RLS + Storage) — EU Frankfurt
- **Analytics:** PostHog EU Cloud
- **Payments:** Stripe (Card, SEPA, Klarna, PayPal)
- **Speech-to-Text:** Deepgram Nova-3
- **Text Processing:** OpenAI GPT-4o
- **Messaging:** WhatsApp Business API + Twilio SMS fallback

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (EU Frankfurt region)
- Stripe, Deepgram, OpenAI API keys

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your API keys in .env.local

# Run the database migration
# Execute supabase/migrations/001_initial_schema.sql in your Supabase SQL editor
# Then execute supabase/migrations/002_seed_prompts.sql

# Start the development server
npm run dev
```

### Worker Service

```bash
cd worker
npm install
node server.js
```

### Scheduler Service

```bash
cd scheduler
npm install
node server.js
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── [locale]/          # i18n-wrapped pages
│   │   │   ├── page.tsx       # Landing page
│   │   │   ├── login/         # Auth: login
│   │   │   ├── signup/        # Auth: signup
│   │   │   ├── onboarding/    # Storyteller setup
│   │   │   └── dashboard/     # Buyer dashboard
│   │   │       ├── page.tsx   # Stories list
│   │   │       ├── book/      # Book preview & print
│   │   │       ├── family/    # Family management
│   │   │       └── settings/  # Account settings
│   │   ├── r/[token]/         # Magic link recording (no auth)
│   │   ├── listen/[id]/       # QR code audio playback
│   │   └── api/
│   │       ├── auth/callback  # OAuth callback
│   │       ├── checkout/      # Stripe Checkout
│   │       ├── webhooks/stripe # Stripe webhooks
│   │       ├── onboarding/    # Storyteller creation
│   │       ├── recordings/    # Audio upload & listing
│   │       ├── magic-links/   # Token validation & generation
│   │       ├── family/invite  # Family member invitations
│   │       ├── book/print     # Book print orders
│   │       └── health/        # Health check
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── landing/           # Landing page sections
│   │   ├── dashboard/         # Dashboard components
│   │   └── recording/         # Recording flow components
│   ├── lib/
│   │   ├── supabase/          # Supabase client (browser/server/middleware)
│   │   ├── stripe/            # Stripe client/server
│   │   ├── posthog/           # PostHog client/server
│   │   ├── types.ts           # TypeScript types
│   │   └── utils.ts           # Utility functions
│   ├── i18n/                  # next-intl configuration
│   └── middleware.ts          # Auth + i18n middleware
├── messages/                  # i18n locale files (de, en, sv)
├── supabase/migrations/       # Database schema & seed data
├── worker/                    # AI processing worker service
├── scheduler/                 # Cron job scheduler service
└── railway.toml               # Railway deployment config
```

## Internationalization

The app supports German (default), English, and Swedish via `next-intl`. The recording page (`/r/[token]`) renders in the storyteller's preferred language without i18n routing — it reads the language from the database.

## GDPR Compliance

- All data stored in EU (Supabase Frankfurt, PostHog EU Cloud)
- Audio files auto-deleted 90 days after book print
- Cookie consent required before PostHog full persistence
- Consent checkbox on recording page before audio capture

## Environment Variables

See `.env.example` for all required environment variables.
