-- MeineMemoiren.com Database Schema
-- Supabase PostgreSQL with RLS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
CREATE TYPE user_role AS ENUM ('admin', 'family_member');
CREATE TYPE delivery_method AS ENUM ('whatsapp', 'sms', 'email');
CREATE TYPE supported_language AS ENUM ('de', 'sv', 'en');
CREATE TYPE subscription_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE recording_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Users table (Buyers & Family Members)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    role user_role NOT NULL DEFAULT 'admin',
    posthog_distinct_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Storytellers table (The Seniors)
CREATE TABLE storytellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    delivery_method delivery_method NOT NULL DEFAULT 'whatsapp',
    language supported_language NOT NULL DEFAULT 'de',
    timezone TEXT NOT NULL DEFAULT 'Europe/Berlin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions table (links buyers to storytellers via Stripe)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_checkout_session_id TEXT,
    status subscription_status NOT NULL DEFAULT 'active',
    current_week INTEGER NOT NULL DEFAULT 0,
    total_weeks INTEGER NOT NULL DEFAULT 52,
    book_printed BOOLEAN NOT NULL DEFAULT FALSE,
    book_printed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prompts table (The Question Library)
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    question_de TEXT NOT NULL,
    question_sv TEXT,
    question_en TEXT,
    week_number INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recordings table (The Core Content)
CREATE TABLE recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    audio_url TEXT,
    audio_duration_seconds INTEGER,
    raw_transcript TEXT,
    cleaned_story TEXT,
    qr_code_url TEXT,
    status recording_status NOT NULL DEFAULT 'pending',
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Magic Links table (Stateless Auth for Seniors)
CREATE TABLE magic_links (
    token TEXT PRIMARY KEY,
    storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Family members junction table
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'family_member',
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, subscription_id)
);

-- Story photos table
CREATE TABLE story_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recording_id UUID NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_buyer_id ON subscriptions(buyer_id);
CREATE INDEX idx_subscriptions_storyteller_id ON subscriptions(storyteller_id);
CREATE INDEX idx_recordings_storyteller_id ON recordings(storyteller_id);
CREATE INDEX idx_recordings_subscription_id ON recordings(subscription_id);
CREATE INDEX idx_recordings_status ON recordings(status);
CREATE INDEX idx_magic_links_storyteller_id ON magic_links(storyteller_id);
CREATE INDEX idx_magic_links_expires_at ON magic_links(expires_at);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_week_number ON prompts(week_number);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_members_subscription_id ON family_members(subscription_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_storytellers_updated_at BEFORE UPDATE ON storytellers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recordings_updated_at BEFORE UPDATE ON recordings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE storytellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_photos ENABLE ROW LEVEL SECURITY;

-- Users: can read/update own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Storytellers: accessible by subscription buyer or family members
CREATE POLICY "Storytellers visible to subscription buyers" ON storytellers FOR SELECT
    USING (id IN (
        SELECT storyteller_id FROM subscriptions WHERE buyer_id = auth.uid()
        UNION
        SELECT s.storyteller_id FROM subscriptions s JOIN family_members fm ON fm.subscription_id = s.id WHERE fm.user_id = auth.uid()
    ));

CREATE POLICY "Storytellers editable by subscription buyers" ON storytellers FOR UPDATE
    USING (id IN (SELECT storyteller_id FROM subscriptions WHERE buyer_id = auth.uid()));

CREATE POLICY "Storytellers insertable by authenticated users" ON storytellers FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Subscriptions: visible to buyer and family members
CREATE POLICY "Subscriptions visible to buyer" ON subscriptions FOR SELECT
    USING (buyer_id = auth.uid() OR id IN (SELECT subscription_id FROM family_members WHERE user_id = auth.uid()));

CREATE POLICY "Subscriptions editable by buyer" ON subscriptions FOR UPDATE
    USING (buyer_id = auth.uid());

CREATE POLICY "Subscriptions insertable by authenticated users" ON subscriptions FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Prompts: readable by everyone (public question library)
CREATE POLICY "Prompts are publicly readable" ON prompts FOR SELECT USING (TRUE);

-- Recordings: visible to subscription buyer and family members
CREATE POLICY "Recordings visible to authorized users" ON recordings FOR SELECT
    USING (subscription_id IN (
        SELECT id FROM subscriptions WHERE buyer_id = auth.uid()
        UNION
        SELECT subscription_id FROM family_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Recordings insertable by service role" ON recordings FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Recordings updatable by authorized users" ON recordings FOR UPDATE
    USING (subscription_id IN (SELECT id FROM subscriptions WHERE buyer_id = auth.uid()));

-- Magic links: service role only (created by scheduler, read by API)
CREATE POLICY "Magic links readable by service role" ON magic_links FOR SELECT USING (TRUE);
CREATE POLICY "Magic links insertable by service role" ON magic_links FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Magic links updatable by service role" ON magic_links FOR UPDATE USING (TRUE);

-- Family members: visible to subscription participants
CREATE POLICY "Family members visible to subscription participants" ON family_members FOR SELECT
    USING (subscription_id IN (
        SELECT id FROM subscriptions WHERE buyer_id = auth.uid()
        UNION
        SELECT subscription_id FROM family_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Family members insertable by subscription buyer" ON family_members FOR INSERT
    WITH CHECK (subscription_id IN (SELECT id FROM subscriptions WHERE buyer_id = auth.uid()));

CREATE POLICY "Family members deletable by subscription buyer" ON family_members FOR DELETE
    USING (subscription_id IN (SELECT id FROM subscriptions WHERE buyer_id = auth.uid()));

-- Story photos: visible to subscription participants
CREATE POLICY "Story photos visible to authorized users" ON story_photos FOR SELECT
    USING (recording_id IN (
        SELECT r.id FROM recordings r WHERE r.subscription_id IN (
            SELECT id FROM subscriptions WHERE buyer_id = auth.uid()
            UNION
            SELECT subscription_id FROM family_members WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Story photos insertable by authorized users" ON story_photos FOR INSERT
    WITH CHECK (recording_id IN (
        SELECT r.id FROM recordings r WHERE r.subscription_id IN (
            SELECT id FROM subscriptions WHERE buyer_id = auth.uid()
            UNION
            SELECT subscription_id FROM family_members WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Story photos deletable by authorized users" ON story_photos FOR DELETE
    USING (recording_id IN (
        SELECT r.id FROM recordings r WHERE r.subscription_id IN (
            SELECT id FROM subscriptions WHERE buyer_id = auth.uid()
        )
    ));
