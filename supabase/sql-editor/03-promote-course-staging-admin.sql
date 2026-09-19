-- Run AFTER registering and confirming your email in this application.
-- Replace the all-zero UUID below with YOUR user ID from Authentication > Users.
-- Expected result: exactly one row with role = admin.
-- Zero rows means the ID was not replaced, the account is not confirmed,
-- or its course profile is missing. Resolve that before continuing.
update course_staging.course_profiles as p
set role = 'admin'
where p.id = '00000000-0000-0000-0000-000000000000'::uuid
  and exists (
    select 1 from auth.users as u
    where u.id = p.id and u.email_confirmed_at is not null
  )
returning p.id, p.email, p.display_name, p.role;
