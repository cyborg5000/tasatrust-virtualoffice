-- Harden member profile writes after the April signup-abuse burst.
-- Users may only create/update their own member profile when the member email
-- matches the authenticated Supabase Auth email. Service-role writes still
-- bypass RLS for checkout/webhook reconciliation.

DROP POLICY IF EXISTS "Users can insert own member data" ON public.members;
DROP POLICY IF EXISTS "Users can update own member data" ON public.members;

CREATE POLICY "Users can insert own member data"
ON public.members
FOR INSERT
WITH CHECK (
  auth.uid() = id
  AND lower(email) = lower(coalesce(auth.email(), ''))
);

CREATE POLICY "Users can update own member data"
ON public.members
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND lower(email) = lower(coalesce(auth.email(), ''))
);
