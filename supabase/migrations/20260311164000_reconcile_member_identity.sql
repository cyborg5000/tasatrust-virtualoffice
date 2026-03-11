-- Ensure authenticated users are linked to the correct member profile by auth UID.

CREATE OR REPLACE FUNCTION public.ensure_member_profile()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_id UUID := auth.uid();
  v_auth_email TEXT;
  v_legacy_member public.members%ROWTYPE;
  v_placeholder_email TEXT;
BEGIN
  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized.';
  END IF;

  SELECT email
  INTO v_auth_email
  FROM auth.users
  WHERE id = v_auth_id;

  IF v_auth_email IS NULL THEN
    RAISE EXCEPTION 'Authenticated user email not found.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.members
    WHERE id = v_auth_id
  ) THEN
    RETURN v_auth_id;
  END IF;

  SELECT *
  INTO v_legacy_member
  FROM public.members
  WHERE lower(email) = lower(v_auth_email)
  ORDER BY created_at ASC NULLS LAST
  LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO public.members (
      id,
      email,
      company_name
    )
    VALUES (
      v_auth_id,
      v_auth_email,
      split_part(v_auth_email, '@', 1)
    );

    RETURN v_auth_id;
  END IF;

  v_placeholder_email := concat('legacy+', v_legacy_member.id::text, '@migrated.local');

  UPDATE public.members
  SET email = v_placeholder_email
  WHERE id = v_legacy_member.id;

  INSERT INTO public.members (
    id,
    email,
    company_name,
    contact_name,
    phone,
    stripe_customer_id,
    created_at,
    updated_at
  )
  VALUES (
    v_auth_id,
    v_auth_email,
    v_legacy_member.company_name,
    v_legacy_member.contact_name,
    v_legacy_member.phone,
    v_legacy_member.stripe_customer_id,
    v_legacy_member.created_at,
    NOW()
  );

  UPDATE public.subscriptions
  SET member_id = v_auth_id
  WHERE member_id = v_legacy_member.id;

  UPDATE public.member_services
  SET member_id = v_auth_id
  WHERE member_id = v_legacy_member.id;

  UPDATE public.orders
  SET member_id = v_auth_id
  WHERE member_id = v_legacy_member.id;

  UPDATE public.website_builds
  SET member_id = v_auth_id
  WHERE member_id = v_legacy_member.id;

  UPDATE public.bookings
  SET member_id = v_auth_id
  WHERE member_id = v_legacy_member.id;

  DELETE FROM public.members
  WHERE id = v_legacy_member.id;

  RETURN v_auth_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_member_profile() TO authenticated;
