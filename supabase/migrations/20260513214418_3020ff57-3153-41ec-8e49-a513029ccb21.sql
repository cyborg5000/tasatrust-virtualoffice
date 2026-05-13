-- Harden RLS on sensitive tables by restricting policies to authenticated role
-- and adding explicit restrictive policies to deny anonymous access.

-- members
DROP POLICY IF EXISTS "Users view own member data" ON public.members;
DROP POLICY IF EXISTS "Users can insert own member data" ON public.members;
DROP POLICY IF EXISTS "Users can update own member data" ON public.members;
DROP POLICY IF EXISTS "Admins can view all members" ON public.members;

CREATE POLICY "Users view own member data" ON public.members
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own member data" ON public.members
  FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = id) AND (lower(email::text) = lower(COALESCE(auth.email(), ''::text))));
CREATE POLICY "Users can update own member data" ON public.members
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK ((auth.uid() = id) AND (lower(email::text) = lower(COALESCE(auth.email(), ''::text))));
CREATE POLICY "Admins can view all members" ON public.members
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Deny anonymous access to members" ON public.members
  AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- orders
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT TO authenticated USING (member_id = auth.uid());
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Deny anonymous access to orders" ON public.orders
  AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- member_services
DROP POLICY IF EXISTS "Users view own member services" ON public.member_services;
DROP POLICY IF EXISTS "Admins can view all member services" ON public.member_services;

CREATE POLICY "Users view own member services" ON public.member_services
  FOR SELECT TO authenticated USING (member_id = auth.uid());
CREATE POLICY "Admins can view all member services" ON public.member_services
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Deny anonymous access to member_services" ON public.member_services
  AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
