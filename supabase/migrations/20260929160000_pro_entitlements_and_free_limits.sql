-- Production entitlement hardening and free-tier limits.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS pro_purchased_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_stripe_customer_id_unique
  ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Users may edit profile presentation fields, but never their own entitlement.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name, avatar_url) ON public.profiles TO authenticated;

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stripe_webhook_events FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.ai_scan_usage (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_start DATE NOT NULL,
  scan_count INTEGER NOT NULL DEFAULT 0 CHECK (scan_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, month_start)
);

ALTER TABLE public.ai_scan_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_scan_usage FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_ai_scan(p_user_id UUID)
RETURNS TABLE (allowed BOOLEAN, used INTEGER, remaining INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month DATE := date_trunc('month', now())::date;
  v_count INTEGER;
BEGIN
  INSERT INTO public.ai_scan_usage (user_id, month_start, scan_count, updated_at)
  VALUES (p_user_id, v_month, 1, now())
  ON CONFLICT (user_id, month_start)
  DO UPDATE
    SET scan_count = public.ai_scan_usage.scan_count + 1,
        updated_at = now()
    WHERE public.ai_scan_usage.scan_count < 5
  RETURNING scan_count INTO v_count;

  IF v_count IS NULL THEN
    SELECT scan_count
      INTO v_count
      FROM public.ai_scan_usage
     WHERE user_id = p_user_id
       AND month_start = v_month;

    RETURN QUERY SELECT false, COALESCE(v_count, 5), 0;
    RETURN;
  END IF;

  RETURN QUERY SELECT true, v_count, GREATEST(5 - v_count, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_scan(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_scan(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.refund_ai_scan(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month DATE := date_trunc('month', now())::date;
BEGIN
  UPDATE public.ai_scan_usage
     SET scan_count = GREATEST(scan_count - 1, 0),
         updated_at = now()
   WHERE user_id = p_user_id
     AND month_start = v_month;
END;
$$;

REVOKE ALL ON FUNCTION public.refund_ai_scan(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refund_ai_scan(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.enforce_free_plant_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier public.subscription_tier;
  v_count INTEGER;
BEGIN
  SELECT subscription_tier
    INTO v_tier
    FROM public.profiles
   WHERE user_id = NEW.user_id;

  IF COALESCE(v_tier, 'free'::public.subscription_tier) = 'free'::public.subscription_tier THEN
    SELECT count(*)
      INTO v_count
      FROM public.user_plants
     WHERE user_id = NEW.user_id;

    IF v_count >= 15 THEN
      RAISE EXCEPTION 'Free plan limit reached: 15 plants maximum'
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_free_plant_limit_trigger ON public.user_plants;
CREATE TRIGGER enforce_free_plant_limit_trigger
  BEFORE INSERT ON public.user_plants
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_free_plant_limit();

CREATE OR REPLACE FUNCTION public.enforce_free_community_post_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier public.subscription_tier;
  v_count INTEGER;
BEGIN
  SELECT subscription_tier
    INTO v_tier
    FROM public.profiles
   WHERE user_id = NEW.user_id;

  IF COALESCE(v_tier, 'free'::public.subscription_tier) = 'free'::public.subscription_tier THEN
    SELECT count(*)
      INTO v_count
      FROM public.community_posts
     WHERE user_id = NEW.user_id
       AND created_at >= date_trunc('month', now());

    IF v_count >= 5 THEN
      RAISE EXCEPTION 'Free plan limit reached: 5 community posts per month'
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_free_community_post_limit_trigger ON public.community_posts;
CREATE TRIGGER enforce_free_community_post_limit_trigger
  BEFORE INSERT ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_free_community_post_limit();
