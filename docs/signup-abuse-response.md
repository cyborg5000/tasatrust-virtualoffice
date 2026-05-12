# Signup Abuse Response

Date checked: 2026-05-12

## Finding

This looked like automated signup spam, not evidence that an admin account or paid member account was compromised.

Production review showed:

- 67 total member rows.
- 4 members with paid or admin-assigned subscriptions.
- 62 no-activity, non-admin member rows.
- 58 no-activity, non-admin rows created in the April 13-21, 2026 burst.
- The suspicious rows had no subscriptions, orders, member services, website builds, bookings, or admin roles.

## Bugs Closed

- Public signup created a `members` row before payment, so bot signups appeared as members.
- `send-welcome-email` accepted direct unauthenticated POST requests and could send welcome/admin emails for arbitrary payload emails.
- The `members` RLS insert/update policy only checked `auth.uid() = id`; a signed-in user could write a member email that did not match their Auth email.

## Code Safeguards

- Signup now stores `company_name` in Supabase Auth metadata and does not create a member row until checkout/reconciliation.
- Signup includes a hidden bot trap plus a lightweight verification word.
- `send-welcome-email` now requires a valid authenticated user and ignores caller-supplied recipient email.
- Member RLS now requires `lower(members.email) = lower(auth.email())` for user-created/user-updated member profiles.
- Admin Members now has a Needs Review filter and warning badge for no-subscription accounts matching the abuse pattern.

## Required Supabase Dashboard Hardening

These are platform settings and should be checked after every auth deploy:

1. Go to Supabase dashboard > Authentication > Providers > Email.
2. Turn on email confirmation for new users.
3. Go to Authentication > Protection.
4. Enable CAPTCHA for sign-up, sign-in, and password recovery using Cloudflare Turnstile or hCaptcha.
5. Go to Authentication > Rate Limits.
6. Keep sign-up and email-send limits low enough that a burst is throttled before it creates operational noise.

## Cleanup Process

Use `supabase/scripts/preview_signup_abuse_accounts.sql` as a read-only review list.

Do not bulk delete only by `No Sub`. Older no-sub accounts include admin, test, and possibly real lead records. Delete only after reviewing the preview output and confirming there is no payment, subscription, order, service, website build, booking, or admin role.
