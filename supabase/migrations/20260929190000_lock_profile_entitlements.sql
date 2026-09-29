-- Prevent client-side privilege escalation of paid entitlements.
-- Users can edit presentation fields only. Service-role functions retain full access.
REVOKE UPDATE ON TABLE public.profiles FROM authenticated;
GRANT UPDATE (display_name, avatar_url) ON TABLE public.profiles TO authenticated;

-- Existing RLS policy still limits those allowed column updates to auth.uid() = user_id.
