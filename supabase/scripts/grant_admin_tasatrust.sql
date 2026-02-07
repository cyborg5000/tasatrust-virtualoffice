-- Grant admin role to admin@tasatrust.com
-- Safe to run multiple times (idempotent).

do $$
declare
  v_user_id uuid;
begin
  select id
  into v_user_id
  from auth.users
  where email = 'admin@tasatrust.com'
  limit 1;

  if v_user_id is null then
    raise exception 'User with email % not found in auth.users', 'admin@tasatrust.com';
  end if;

  insert into public.user_roles (user_id, role)
  values (v_user_id, 'admin'::public.app_role)
  on conflict (user_id, role) do nothing;

  raise notice 'Admin role granted (or already existed) for % (user_id=%)', 'admin@tasatrust.com', v_user_id;
end
$$;
