-- Row Level Security Policies for MeineMemoiren.com
-- All tables have RLS enabled

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storytellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_dispatches ENABLE ROW LEVEL SECURITY;

-- Users: can read/update own profile
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Storytellers: buyer can CRUD, family members can read
CREATE POLICY "Buyers can manage their storytellers" ON public.storytellers
  FOR ALL USING (auth.uid() = buyer_id);

CREATE POLICY "Family members can view storytellers" ON public.storytellers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.storyteller_id = storytellers.id AND fm.user_id = auth.uid()
    )
  );

-- Subscriptions: buyer can read their own
CREATE POLICY "Buyers can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = buyer_id);

-- Prompts: readable by all authenticated users
CREATE POLICY "Prompts are readable by authenticated users" ON public.prompts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Recordings: accessible by buyer and family members of the storyteller
CREATE POLICY "Buyers can manage recordings" ON public.recordings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.storytellers s
      WHERE s.id = recordings.storyteller_id AND s.buyer_id = auth.uid()
    )
  );

CREATE POLICY "Family members can view recordings" ON public.recordings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.storyteller_id = recordings.storyteller_id AND fm.user_id = auth.uid()
    )
  );

-- Magic Links: service role only for creation; public read for token validation
CREATE POLICY "Magic links are publicly readable by token" ON public.magic_links
  FOR SELECT USING (true);

-- Family Members: users can see their own memberships; buyers can manage
CREATE POLICY "Users can view own family memberships" ON public.family_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Buyers can manage family members" ON public.family_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.storytellers s
      WHERE s.id = family_members.storyteller_id AND s.buyer_id = auth.uid()
    )
  );

-- Photos: accessible by buyer and family members
CREATE POLICY "Buyers can manage photos" ON public.photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.recordings r
      JOIN public.storytellers s ON s.id = r.storyteller_id
      WHERE r.id = photos.recording_id AND s.buyer_id = auth.uid()
    )
  );

CREATE POLICY "Family members can view photos" ON public.photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recordings r
      JOIN public.family_members fm ON fm.storyteller_id = r.storyteller_id
      WHERE r.id = photos.recording_id AND fm.user_id = auth.uid()
    )
  );

-- Book Orders: buyer can manage
CREATE POLICY "Buyers can manage book orders" ON public.book_orders
  FOR ALL USING (auth.uid() = buyer_id);

-- Prompt Dispatches: service role handles these; buyers can read
CREATE POLICY "Buyers can view dispatches for their storytellers" ON public.prompt_dispatches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.storytellers s
      WHERE s.id = prompt_dispatches.storyteller_id AND s.buyer_id = auth.uid()
    )
  );
