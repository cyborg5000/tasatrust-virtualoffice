
-- Restrictive deny-anonymous policies
CREATE POLICY "Deny anonymous access to bookings"
  ON public.bookings AS RESTRICTIVE FOR ALL TO public
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Deny anonymous access to subscriptions"
  ON public.subscriptions AS RESTRICTIVE FOR ALL TO public
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Deny anonymous access to website_builds"
  ON public.website_builds AS RESTRICTIVE FOR ALL TO public
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Lock down SECURITY DEFINER function execute privileges
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.assign_member_subscription(uuid, public.subscription_tier) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assign_member_subscription(uuid, public.subscription_tier) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.ensure_member_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_member_profile() TO authenticated, service_role;
