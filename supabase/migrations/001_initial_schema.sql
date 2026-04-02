-- MeineMemoiren.com Database Schema
-- Supabase PostgreSQL (EU Frankfurt region)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom enum types
CREATE TYPE user_role AS ENUM ('admin', 'family_member');
CREATE TYPE delivery_method AS ENUM ('whatsapp', 'sms', 'email');
CREATE TYPE storyteller_language AS ENUM ('de', 'sv', 'en');
CREATE TYPE subscription_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE recording_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Users table (Buyers & Family Members)
-- Managed by Supabase Auth; this extends the auth.users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'admin',
  posthog_distinct_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Storytellers (The Seniors)
CREATE TABLE public.storytellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  delivery_method delivery_method NOT NULL DEFAULT 'whatsapp',
  language storyteller_language NOT NULL DEFAULT 'de',
  timezone TEXT NOT NULL DEFAULT 'Europe/Berlin',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions (Stripe Link)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  storyteller_id UUID REFERENCES public.storytellers(id) ON DELETE SET NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_checkout_session_id TEXT,
  status subscription_status NOT NULL DEFAULT 'active',
  amount_paid INTEGER, -- in cents
  currency TEXT DEFAULT 'eur',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prompts (The Question Library)
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  question_de TEXT NOT NULL,
  question_sv TEXT,
  question_en TEXT,
  week_number INTEGER, -- optional ordering
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recordings (The Core Content)
CREATE TABLE public.recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storyteller_id UUID NOT NULL REFERENCES public.storytellers(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  audio_url TEXT,
  audio_duration_seconds INTEGER,
  raw_transcript TEXT,
  cleaned_story TEXT,
  qr_code_url TEXT,
  status recording_status NOT NULL DEFAULT 'pending',
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Magic Links (Stateless Auth for Seniors)
CREATE TABLE public.magic_links (
  token TEXT PRIMARY KEY,
  storyteller_id UUID NOT NULL REFERENCES public.storytellers(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Family Members (linking additional users to storytellers)
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  storyteller_id UUID NOT NULL REFERENCES public.storytellers(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  role user_role NOT NULL DEFAULT 'family_member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, storyteller_id)
);

-- Photos (attached to stories for the book)
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recording_id UUID NOT NULL REFERENCES public.recordings(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Book Orders
CREATE TABLE public.book_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, generating, ready, ordered, shipped, delivered
  pdf_url TEXT,
  print_provider TEXT, -- 'saal_digital' or 'cewe'
  print_order_id TEXT,
  story_count INTEGER,
  page_count INTEGER,
  copies INTEGER NOT NULL DEFAULT 1,
  shipping_address JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prompt Dispatch Log (tracks which prompts were sent)
CREATE TABLE public.prompt_dispatches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storyteller_id UUID NOT NULL REFERENCES public.storytellers(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  magic_link_token TEXT REFERENCES public.magic_links(token) ON DELETE SET NULL,
  delivery_method delivery_method NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, delivered, failed
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_storytellers_buyer ON public.storytellers(buyer_id);
CREATE INDEX idx_recordings_storyteller ON public.recordings(storyteller_id);
CREATE INDEX idx_recordings_status ON public.recordings(status);
CREATE INDEX idx_magic_links_storyteller ON public.magic_links(storyteller_id);
CREATE INDEX idx_magic_links_expires ON public.magic_links(expires_at);
CREATE INDEX idx_subscriptions_buyer ON public.subscriptions(buyer_id);
CREATE INDEX idx_family_members_user ON public.family_members(user_id);
CREATE INDEX idx_family_members_storyteller ON public.family_members(storyteller_id);
CREATE INDEX idx_prompt_dispatches_storyteller ON public.prompt_dispatches(storyteller_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storytellers_updated_at
  BEFORE UPDATE ON public.storytellers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recordings_updated_at
  BEFORE UPDATE ON public.recordings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_orders_updated_at
  BEFORE UPDATE ON public.book_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
