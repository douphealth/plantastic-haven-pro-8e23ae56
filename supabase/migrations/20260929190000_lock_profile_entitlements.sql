-- Paid entitlements are server-owned. Browser clients may only edit profile presentation fields.
REVOKE INSERT, UPDATE ON TABLE public.profiles FROM authenticated;
GRANT UPDATE (display_name, avatar_url) ON TABLE public.profiles TO authenticated;

-- Replace premium workspace policies so a signed-in free user cannot bypass the UI
-- and call the Data API directly.
DROP POLICY IF EXISTS "Users can view their own plants" ON public.user_plants;
DROP POLICY IF EXISTS "Users can add their own plants" ON public.user_plants;
DROP POLICY IF EXISTS "Users can update their own plants" ON public.user_plants;
DROP POLICY IF EXISTS "Users can delete their own plants" ON public.user_plants;

CREATE POLICY "Pro users can view their own plants"
ON public.user_plants FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

CREATE POLICY "Pro users can add their own plants"
ON public.user_plants FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

CREATE POLICY "Pro users can update their own plants"
ON public.user_plants FOR UPDATE
TO authenticated
USING (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
)
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

CREATE POLICY "Pro users can delete their own plants"
ON public.user_plants FOR DELETE
TO authenticated
USING (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

DROP POLICY IF EXISTS "Users can view their own journal entries" ON public.plant_journal_entries;
DROP POLICY IF EXISTS "Users can create their own journal entries" ON public.plant_journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON public.plant_journal_entries;
DROP POLICY IF EXISTS "Users can delete their own journal entries" ON public.plant_journal_entries;

CREATE POLICY "Pro users can view their own journal entries"
ON public.plant_journal_entries FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

CREATE POLICY "Pro users can create their own journal entries"
ON public.plant_journal_entries FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

CREATE POLICY "Pro users can update their own journal entries"
ON public.plant_journal_entries FOR UPDATE
TO authenticated
USING (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
)
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

CREATE POLICY "Pro users can delete their own journal entries"
ON public.plant_journal_entries FOR DELETE
TO authenticated
USING (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

-- Anyone may read community posts, but only verified Pro users can participate.
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.community_posts;

CREATE POLICY "Pro users can create posts"
ON public.community_posts FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

CREATE POLICY "Pro users can update their own posts"
ON public.community_posts FOR UPDATE
TO authenticated
USING (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
)
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

CREATE POLICY "Pro users can delete their own posts"
ON public.community_posts FOR DELETE
TO authenticated
USING (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

-- Tighten plant-photo writes. The first storage path segment must be the caller's user id.
DROP POLICY IF EXISTS "Authenticated users can upload plant photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;

CREATE POLICY "Pro users can upload their own plant photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'plant-photos'
  AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

CREATE POLICY "Pro users can update their own plant photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'plant-photos'
  AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
)
WITH CHECK (
  bucket_id = 'plant-photos'
  AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

CREATE POLICY "Pro users can delete their own plant photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'plant-photos'
  AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);
