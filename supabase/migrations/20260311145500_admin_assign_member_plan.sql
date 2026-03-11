-- Let admins manually assign a plan to a member without checkout.

CREATE OR REPLACE FUNCTION public.assign_member_subscription(
  _member_id UUID,
  _tier public.subscription_tier
)
RETURNS public.subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_stripe_subscription_id TEXT;
  v_subscription public.subscriptions;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can assign plans to members.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.members
    WHERE id = _member_id
  ) THEN
    RAISE EXCEPTION 'Member % does not exist.', _member_id;
  END IF;

  SELECT stripe_subscription_id
  INTO v_existing_stripe_subscription_id
  FROM public.subscriptions
  WHERE member_id = _member_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_existing_stripe_subscription_id IS NOT NULL THEN
    RAISE EXCEPTION 'This member already has a Stripe-managed subscription. Update it in Stripe instead.';
  END IF;

  UPDATE public.subscriptions
  SET
    status = 'cancelled',
    cancel_at_period_end = true,
    updated_at = NOW()
  WHERE member_id = _member_id
    AND status = 'active';

  INSERT INTO public.subscriptions (
    member_id,
    tier,
    status,
    stripe_subscription_id,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    updated_at
  )
  VALUES (
    _member_id,
    _tier,
    'active',
    NULL,
    NULL,
    NULL,
    false,
    NOW()
  )
  RETURNING *
  INTO v_subscription;

  RETURN v_subscription;
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_member_subscription(UUID, public.subscription_tier) TO authenticated;
