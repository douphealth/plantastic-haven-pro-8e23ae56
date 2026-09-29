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
-- The likes_count column is server-maintained and cannot be forged by clients.
REVOKE INSERT, UPDATE ON TABLE public.community_posts FROM authenticated;
GRANT INSERT (user_id, title, content, image_url, category)
  ON TABLE public.community_posts TO authenticated;
GRANT UPDATE (title, content, image_url, category)
  ON TABLE public.community_posts TO authenticated;

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


-- Model community likes as per-user rows instead of allowing arbitrary post updates.
CREATE TABLE IF NOT EXISTS public.community_post_likes (
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.community_post_likes FROM anon;
GRANT SELECT, INSERT, DELETE ON TABLE public.community_post_likes TO authenticated;

CREATE POLICY "Pro users can view community likes"
ON public.community_post_likes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

CREATE POLICY "Pro users can add their own community likes"
ON public.community_post_likes FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

CREATE POLICY "Pro users can remove their own community likes"
ON public.community_post_likes FOR DELETE
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.sync_community_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_post_id UUID := COALESCE(NEW.post_id, OLD.post_id);
BEGIN
  UPDATE public.community_posts
  SET likes_count = (
    SELECT count(*)::integer
    FROM public.community_post_likes
    WHERE post_id = target_post_id
  )
  WHERE id = target_post_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.sync_community_post_likes_count() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS sync_community_post_likes_count ON public.community_post_likes;
CREATE TRIGGER sync_community_post_likes_count
AFTER INSERT OR DELETE ON public.community_post_likes
FOR EACH ROW EXECUTE FUNCTION private.sync_community_post_likes_count();
