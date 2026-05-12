-- Allow admins to manage the room inventory used by member meeting-room bookings.
-- Deletion is intentionally not enabled here so booking history remains intact.

DROP POLICY IF EXISTS "Admins can view all meeting rooms" ON public.meeting_rooms;
DROP POLICY IF EXISTS "Admins can create meeting rooms" ON public.meeting_rooms;
DROP POLICY IF EXISTS "Admins can update meeting rooms" ON public.meeting_rooms;

CREATE POLICY "Admins can view all meeting rooms"
ON public.meeting_rooms
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create meeting rooms"
ON public.meeting_rooms
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update meeting rooms"
ON public.meeting_rooms
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
