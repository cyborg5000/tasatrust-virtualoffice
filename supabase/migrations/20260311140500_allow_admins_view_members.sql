-- Allow admins to view all members and their subscriptions.

CREATE POLICY "Admins can view all members"
ON public.members
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
