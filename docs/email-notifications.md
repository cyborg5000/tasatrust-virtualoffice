# Email Notification Architecture

Last updated: 2026-02-16

## 1) Purpose

The platform now sends transactional emails from Supabase Edge Functions through Resend for:

- New user onboarding
- Contact form alerts
- Subscription lifecycle updates from Stripe

All logic is centralized in `supabase/functions/_shared/email.ts` and event-specific function handlers.

## 2) Event map

| App event | Trigger | Email sent | Recipient |
|---|---|---|---|
| New signup form submit | `src/pages/auth/Signup.tsx` | Welcome email + admin alert | User + `admin@tasatrust.com`, `business+tasatrust@5amuelchan.com` |
| Contact form submit | `src/pages/Contact.tsx` → `supabase/functions/submit-contact-message` | Contact alert | `CONTACT_NOTIFICATION_EMAIL` / fallback to `SUPPORT_EMAIL` / `RESEND_TO_EMAIL` / `info@tasatrust.com` |
| Checkout completed | Stripe `checkout.session.completed` webhook | Subscription confirmation + admin alert | User + configured admin emails |
| Subscription updated | Stripe `customer.subscription.updated` webhook | Status change alert + admin alert (status/cancel changes only) | User + configured admin emails |
| Subscription deleted | Stripe `customer.subscription.deleted` webhook | Cancellation alert + admin alert | User + configured admin emails |

## 3) Email defaults

- From address default: `no-reply@tasatrust.com`
- Admin recipients default:
  - `admin@tasatrust.com`
  - `business+tasatrust@5amuelchan.com`
- Admin recipients and sender are fixed in code.

## 4) Environment variables

Set these in Supabase Edge function secrets:

- `RESEND_API_KEY` (required)
- `CONTACT_NOTIFICATION_EMAIL` (optional contact form recipient override)
- `SUPPORT_EMAIL` (fallback contact recipient)
- `RESEND_TO_EMAIL` (fallback contact recipient)
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_RESTRICTED_KEY` or `STRIPE_SECRET_KEY`
- `SITE_URL` (optional; used in email links)

Example:

```bash
supabase functions secrets set \
  RESEND_API_KEY=... \
  SITE_URL=https://tasatrust.com
```

## 5) Implemented function locations

- `supabase/functions/_shared/email.ts`  
  Shared Resend sender, recipient helpers, email escaping, and reusable send helper.
- `supabase/functions/send-welcome-email/index.ts`  
  Triggered from signup flow. Sends welcome email to user and admin alert.
- `supabase/functions/submit-contact-message/index.ts`  
  Updated to use shared Resend helper.
- `supabase/functions/stripe-webhook/index.ts`  
  Updated to send checkout/subscription lifecycle notifications.
- `src/pages/auth/Signup.tsx`  
  Calls `send-welcome-email` after successful user registration/member create.

## 6) Operational notes

- Webhook email sends are best-effort. A failed email send does not block subscription DB updates.
- Stripe events can retry; if retries happen repeatedly, notification emails can be duplicated. If deduplication is required, introduce an email event log table keyed by `event.id`.
