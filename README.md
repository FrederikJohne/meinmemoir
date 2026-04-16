# MeineMemoiren.com

A voice-to-story memoir platform for the German market. MeineMemoiren transforms loved ones' memories into a beautiful printed book with QR-code voice playback.

## Architecture

The platform serves two distinct user personas:

1. **The Buyer (Adult Child):** SaaS-like dashboard with auth, payments, and family management.
2. **The Storyteller (Senior):** Interacts only via magic links sent through WhatsApp/SMS/Email. No login, no app, no password.

### Services

| Service | Technology | Purpose |
|---------|-----------|---------|
| **web** | Next.js (App Router) | Landing page, dashboard, recording pages, API routes |
| **worker** | Node.js | AI processing: Deepgram → GPT-4o → QR code generation |
| **scheduler** | Node.js | Weekly prompt dispatch via WhatsApp/SMS, audio cleanup |

### Tech Stack

- **Frontend:** Next.js 16, Tailwind CSS v4, shadcn/ui
- **Backend:** Next.js API routes + Railway worker services
- **Database & Auth:** Supabase (PostgreSQL + Auth + RLS + Storage) — EU Frankfurt
- **Analytics:** PostHog EU Cloud
- **Payments:** Stripe (Credit Card, SEPA, Klarna, PayPal)
- **Messaging:** WhatsApp Business API (Meta) + Twilio (SMS fallback)
- **Speech-to-Text:** Deepgram Nova-3
- **Text Processing:** OpenAI GPT-4o
- **Hosting:** Railway (EU region)

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your actual values

# Run the development server
npm run dev
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login/signup pages
│   │   ├── (dashboard)/      # Buyer dashboard
│   │   ├── api/              # API routes
│   │   ├── r/[token]/        # Magic link recording page
│   │   ├── listen/[id]/      # QR code playback page
│   │   └── onboarding/       # Storyteller setup
│   ├── components/
│   │   ├── dashboard/        # Dashboard components
│   │   ├── landing/          # Landing page sections
│   │   ├── recording/        # Audio recorder
│   │   └── ui/               # shadcn/ui components
│   └── lib/
│       ├── supabase/         # Supabase clients
│       ├── stripe/           # Stripe client
│       ├── posthog/          # PostHog clients
│       ├── messaging/        # WhatsApp & SMS
│       ├── book/             # PDF generation
│       └── types.ts          # TypeScript types
├── worker/                   # AI processing worker (Railway Service 2)
├── scheduler/                # Prompt dispatch (Railway Service 3)
├── supabase/migrations/      # Database schema & RLS policies
└── messages/                 # i18n translations (de, en, sv)
```

## Database Setup

Run the SQL migrations in order against your Supabase project:

1. `supabase/migrations/001_initial_schema.sql` — Tables, enums, indexes, triggers
2. `supabase/migrations/002_rls_policies.sql` — Row Level Security
3. `supabase/migrations/003_seed_prompts.sql` — 52 weekly questions (DE/EN/SV)

## Environment Variables

See `.env.example` for all required environment variables. Key services:

- **Supabase** — EU Frankfurt region project
- **Stripe** — Payment processing
- **Deepgram** — Speech-to-text (Nova-3, German)
- **OpenAI** — Story cleanup (GPT-4o)
- **PostHog** — Analytics (EU Cloud endpoint)
- **WhatsApp/Twilio** — Message delivery

For Twilio-powered email outreach (SendGrid), also configure:

- `TWILIO_SENDGRID_API_KEY`
- `TWILIO_SENDGRID_FROM_EMAIL`

## Enable Google Auth (Supabase)

Google OAuth is wired in the login/signup UI and uses `/api/auth/callback` for session exchange. To enable it:

1. Open Supabase Dashboard → `Authentication` → `Providers` → `Google`.
2. Enable Google provider and add your Google OAuth client ID + secret.
3. In your Google Cloud OAuth app, add this redirect URI:
   - `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
4. In Supabase `Authentication` → `URL Configuration`, add your app URLs:
   - Site URL: `https://meinememoiren.com` (or your env URL)
   - Redirect URLs: `http://localhost:3000/api/auth/callback`, `https://meinememoiren.com/api/auth/callback`
5. Set `NEXT_PUBLIC_APP_URL` in your environment so OAuth redirects use the correct domain.

## Railway Deployment

Each service has its own `railway.toml` configuration:

```bash
# Deploy web app
railway up --service web

# Deploy worker
cd worker && railway up --service worker

# Deploy scheduler
cd scheduler && railway up --service scheduler
```

## GDPR Compliance

- All data stored on EU servers (Frankfurt)
- Supabase + PostHog EU endpoints
- Audio retention policy: 90-day auto-deletion after book delivery
- Cookie consent integrated with PostHog
- Recording consent required before microphone access
