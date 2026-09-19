-- Read-only installation checks. Every row must return passed = true.
-- This verifies schema configuration, not live signup, uploads or payments.
with expected(name) as (
  values ('course_profiles'), ('courses'), ('course_modules'),
    ('course_lessons'), ('course_assets'), ('course_attachments'),
    ('course_orders'), ('course_entitlements'), ('course_payment_events'),
    ('course_audit_log')
), checks as (
  select 'Table / RLS / policies: public.' || e.name as check_name,
    coalesce(c.relkind = 'r' and c.relrowsecurity and exists (
      select 1 from pg_catalog.pg_policy p where p.polrelid = c.oid
    ), false) as passed
  from expected e
  left join pg_catalog.pg_namespace n on n.nspname = 'public'
  left join pg_catalog.pg_class c on c.relnamespace = n.oid and c.relname = e.name
  union all
  select 'Private course-media bucket', exists (
    select 1 from storage.buckets where id = 'course-media' and public = false
  )
  union all
  select 'Storage access policy', exists (
    select 1 from pg_catalog.pg_policies where schemaname = 'storage'
      and tablename = 'objects' and policyname = 'course_storage_admin'
  )
  union all
  select 'Automatic profile creation trigger', exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'auth.users'::regclass and tgname = 'course_profile_signup'
      and tgenabled = 'O' and not tgisinternal
  )
  union all
  select 'Payment fulfillment restricted to service role', coalesce(
    has_function_privilege('service_role', to_regprocedure('public.course_apply_payment(uuid,text,text,text)'), 'execute')
    and not has_function_privilege('authenticated', to_regprocedure('public.course_apply_payment(uuid,text,text,text)'), 'execute')
    and not has_function_privilege('anon', to_regprocedure('public.course_apply_payment(uuid,text,text,text)'), 'execute'), false
  )
)
select check_name, passed from checks order by check_name;
