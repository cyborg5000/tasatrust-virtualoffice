-- Allow admins to manage website_builds
CREATE POLICY "Admins can view all website builds"
ON public.website_builds
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update website builds"
ON public.website_builds
FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert website builds"
ON public.website_builds
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete website builds"
ON public.website_builds
FOR DELETE
USING (has_role(auth.uid(), 'admin'));