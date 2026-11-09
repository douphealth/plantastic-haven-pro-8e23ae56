-- Per-plant watering interval and a server-owned care streak.
ALTER TABLE public.user_plants
  ADD COLUMN IF NOT EXISTS water_interval_days integer NOT NULL DEFAULT 7;

ALTER TABLE public.user_plants
  DROP CONSTRAINT IF EXISTS user_plants_water_interval_days_check;

ALTER TABLE public.user_plants
  ADD CONSTRAINT user_plants_water_interval_days_check
  CHECK (water_interval_days BETWEEN 1 AND 60);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_care_on date;

CREATE OR REPLACE FUNCTION public.record_plant_care(
  target_plant uuid,
  interval_days integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  uid uuid := auth.uid();
  plant public.user_plants;
  interval integer;
  today date := (now() AT TIME ZONE 'utc')::date;
  previous date;
  new_streak integer;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = uid AND p.subscription_tier = 'pro'
  ) THEN
    RAISE EXCEPTION 'Pro access required';
  END IF;

  SELECT * INTO plant
  FROM public.user_plants
  WHERE id = target_plant AND user_id = uid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plant not found';
  END IF;

  interval := COALESCE(interval_days, plant.water_interval_days, 7);
  IF interval < 1 OR interval > 60 THEN
    interval := 7;
  END IF;

  UPDATE public.user_plants
  SET
    last_watered = now(),
    next_water_date = now() + make_interval(days => interval),
    water_interval_days = interval
  WHERE id = plant.id AND user_id = uid;

  SELECT last_care_on INTO previous
  FROM public.profiles
  WHERE user_id = uid;

  IF previous = today THEN
    SELECT care_streak INTO new_streak FROM public.profiles WHERE user_id = uid;
  ELSIF previous = today - 1 THEN
    UPDATE public.profiles
    SET care_streak = care_streak + 1, last_care_on = today
    WHERE user_id = uid
    RETURNING care_streak INTO new_streak;
  ELSE
    UPDATE public.profiles
    SET care_streak = 1, last_care_on = today
    WHERE user_id = uid
    RETURNING care_streak INTO new_streak;
  END IF;

  RETURN jsonb_build_object(
    'water_interval_days', interval,
    'care_streak', COALESCE(new_streak, 1)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_plant_care(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_plant_care(uuid, integer) TO authenticated;

-- Profiles are no longer world-readable. Community names go through a narrow function.
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE OR REPLACE FUNCTION public.lookup_display_names(ids uuid[])
RETURNS TABLE (user_id uuid, display_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    p.user_id,
    CASE
      WHEN p.display_name IS NULL OR position('@' IN p.display_name) > 0 THEN 'Plant parent'
      ELSE left(p.display_name, 80)
    END
  FROM public.profiles p
  WHERE p.user_id = ANY (COALESCE(ids, ARRAY[]::uuid[]))
  LIMIT 50;
$$;

REVOKE ALL ON FUNCTION public.lookup_display_names(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lookup_display_names(uuid[]) TO authenticated;

-- Community posts are part of the paid workspace.
DROP POLICY IF EXISTS "Community posts are viewable by everyone" ON public.community_posts;

CREATE POLICY "Pro users can view community posts"
ON public.community_posts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  lesson_index integer NOT NULL CHECK (lesson_index >= 0 AND lesson_index < 50),
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id, lesson_index)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.lesson_progress FROM anon;
GRANT SELECT, INSERT, DELETE ON TABLE public.lesson_progress TO authenticated;

DROP POLICY IF EXISTS "Pro users can view their lesson progress" ON public.lesson_progress;
CREATE POLICY "Pro users can view their lesson progress"
ON public.lesson_progress FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

DROP POLICY IF EXISTS "Pro users can save lesson progress" ON public.lesson_progress;
CREATE POLICY "Pro users can save lesson progress"
ON public.lesson_progress FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

DROP POLICY IF EXISTS "Pro users can clear lesson progress" ON public.lesson_progress;
CREATE POLICY "Pro users can clear lesson progress"
ON public.lesson_progress FOR DELETE
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (SELECT auth.uid())
      AND p.subscription_tier = 'pro'
  )
);

-- Service-role only log used to cap paid plant-identifier calls.
CREATE TABLE IF NOT EXISTS public.ai_identification_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_identification_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.ai_identification_log FROM anon, authenticated;
GRANT ALL ON TABLE public.ai_identification_log TO service_role;

CREATE INDEX IF NOT EXISTS ai_identification_log_user_day_idx
ON public.ai_identification_log (user_id, created_at);

GRANT USAGE, SELECT ON SEQUENCE public.ai_identification_log_id_seq TO service_role;
