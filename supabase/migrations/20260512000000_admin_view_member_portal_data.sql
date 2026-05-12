-- Let admins inspect member portal data while using the view-as-member mode.
-- These policies are read-only; member-side writes still require the real member session.

CREATE POLICY "Admins can view all member services"
ON public.member_services
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all booking slots"
ON public.booking_slots
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
