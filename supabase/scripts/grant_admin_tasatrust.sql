-- Grant admin role to the current TASA Trust admin users.
-- Safe to run multiple times (idempotent).

do $$
declare
  v_email text;
  v_user_id uuid;
begin
  foreach v_email in array array[
    'info@tasatrust.com',
    'herry@phoenix.com.sg'
  ]::text[]
  loop
    select id
    into v_user_id
    from auth.users
    where email = v_email
    limit 1;

    if v_user_id is null then
      raise exception 'User with email % not found in auth.users', v_email;
    end if;

    insert into public.user_roles (user_id, role)
    values (v_user_id, 'admin'::public.app_role)
    on conflict (user_id, role) do nothing;

    raise notice 'Admin role granted (or already existed) for % (user_id=%)', v_email, v_user_id;
  end loop;
end
$$;
