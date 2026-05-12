# Payment Operations

Last updated: 2026-05-12

## Required Stripe Webhook Setup

Payments unlock the member portal only after Stripe is reconciled into Supabase. Keep these pieces configured together:

- Stripe webhook endpoint:
  `https://wktusutjeoyokptqbdeu.supabase.co/functions/v1/stripe-webhook`
- Required Stripe events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Required Supabase Edge Function secrets:
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_RESTRICTED_KEY` or `STRIPE_SECRET_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SITE_URL=https://tasatrust.com`

If `STRIPE_WEBHOOK_SECRET` is missing, Stripe can still collect payment, but `stripe-webhook` returns an error before writing the active subscription row. The customer then gets sent back to onboarding because `/member` requires an active row in `public.subscriptions`.

## Deployment Checklist

1. Confirm required secrets are present:

```bash
supabase secrets list --project-ref wktusutjeoyokptqbdeu
```

2. Add or rotate the webhook secret from the live Stripe webhook endpoint:

```bash
supabase secrets set \
  STRIPE_WEBHOOK_SECRET=whsec_live_value_from_stripe \
  SITE_URL=https://tasatrust.com \
  --project-ref wktusutjeoyokptqbdeu
```

3. Deploy payment functions after payment code changes:

```bash
supabase functions deploy stripe-webhook --project-ref wktusutjeoyokptqbdeu
supabase functions deploy create-checkout-session --project-ref wktusutjeoyokptqbdeu
supabase functions deploy reconcile-checkout-session --project-ref wktusutjeoyokptqbdeu
```

4. In Stripe, resend any failed `checkout.session.completed` events after the webhook secret is fixed.

5. Confirm the customer has an active subscription:

```sql
select
  m.email,
  s.tier,
  s.status,
  s.stripe_subscription_id,
  s.current_period_end
from public.members m
left join public.subscriptions s on s.member_id = m.id
where lower(m.email) = lower('acruz@axctrust.com')
order by s.created_at desc nulls last;
```

## Checkout Success Safety Net

`/member/checkout/success` now calls `reconcile-checkout-session` with the Stripe Checkout session ID. This function verifies:

- the Supabase user is authenticated,
- the Stripe session belongs to that user,
- the session is a completed paid subscription checkout,
- the tier metadata is valid.

Only then does it upsert the member subscription and related checkout records. This protects customers when the webhook is delayed or temporarily misconfigured, while unpaid or unrelated sessions still remain locked out of the member dashboard.
