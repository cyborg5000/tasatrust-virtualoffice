-- Read-only preview for suspected signup-abuse accounts.
-- Do not delete from this output automatically. Review the rows first.

WITH member_activity AS (
  SELECT
    m.id,
    m.email,
    m.company_name,
    m.created_at,
    au.created_at AS auth_created_at,
    au.last_sign_in_at,
    au.email_confirmed_at,
    count(DISTINCT s.id) AS subscription_count,
    count(DISTINCT o.id) AS order_count,
    count(DISTINCT ms.id) AS service_count,
    count(DISTINCT wb.id) AS website_build_count,
    count(DISTINCT b.id) AS booking_count,
    bool_or(ur.role = 'admin') AS is_admin
  FROM public.members m
  LEFT JOIN auth.users au ON au.id = m.id
  LEFT JOIN public.subscriptions s ON s.member_id = m.id
  LEFT JOIN public.orders o ON o.member_id = m.id
  LEFT JOIN public.member_services ms ON ms.member_id = m.id
  LEFT JOIN public.website_builds wb ON wb.member_id = m.id
  LEFT JOIN public.bookings b ON b.member_id = m.id
  LEFT JOIN public.user_roles ur ON ur.user_id = m.id
  GROUP BY m.id, m.email, m.company_name, m.created_at, au.created_at, au.last_sign_in_at, au.email_confirmed_at
)
SELECT
  id,
  company_name,
  email,
  created_at,
  auth_created_at,
  last_sign_in_at,
  email_confirmed_at,
  subscription_count,
  order_count,
  service_count,
  website_build_count,
  booking_count,
  coalesce(is_admin, false) AS is_admin
FROM member_activity
WHERE subscription_count = 0
  AND order_count = 0
  AND service_count = 0
  AND website_build_count = 0
  AND booking_count = 0
  AND NOT coalesce(is_admin, false)
  AND created_at::date BETWEEN DATE '2026-04-13' AND DATE '2026-04-21'
ORDER BY created_at DESC;
