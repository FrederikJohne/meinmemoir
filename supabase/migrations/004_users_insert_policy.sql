-- Allow authenticated users to create their own profile row in public.users.
-- Required before inserting storytellers (FK: storytellers.buyer_id -> users.id).
-- Without this, only service_role could insert; app flows using the user JWT would fail.

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
