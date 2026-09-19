-- Run in the CLIENT project's SQL Editor before preparing its installation.
-- Read-only: no tables, accounts, triggers, policies or settings are changed.
-- Returns metadata and aggregate counts, not user emails, tokens or passwords.
-- This inventory cannot prove that an existing application is unused.
begin read only;
set local statement_timeout = '15s';

select 'schemas' as section,
  coalesce(jsonb_agg(jsonb_build_object('name', nspname) order by nspname), '[]'::jsonb) as details
from pg_namespace
where nspname !~ '^pg_' and nspname <> 'information_schema'
union all
select 'application_relations',
  coalesce(jsonb_agg(jsonb_build_object(
    'schema', n.nspname, 'name', c.relname, 'kind', c.relkind,
    'rls_enabled', c.relrowsecurity, 'force_rls', c.relforcerowsecurity
  ) order by n.nspname, c.relname), '[]'::jsonb)
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public', 'course_platform', 'course_staging', 'course_production')
  and c.relkind in ('r', 'p', 'v', 'm')
union all
select 'auth_user_triggers',
  coalesce(jsonb_agg(jsonb_build_object(
    'name', t.tgname, 'enabled', t.tgenabled,
    'definition', pg_get_triggerdef(t.oid),
    'function_schema', n.nspname, 'function_name', p.proname,
    'security_definer', p.prosecdef
  ) order by t.tgname), '[]'::jsonb)
from pg_trigger t
join pg_proc p on p.oid = t.tgfoid
join pg_namespace n on n.oid = p.pronamespace
where t.tgrelid = 'auth.users'::regclass and not t.tgisinternal
union all
select 'auth_user_counts', jsonb_build_object(
  'total', count(*), 'email_confirmed', count(email_confirmed_at)
)
from auth.users
union all
select 'storage_buckets',
  coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'public', public, 'file_size_limit', file_size_limit,
    'allowed_mime_types', allowed_mime_types
  ) order by id), '[]'::jsonb)
from storage.buckets
union all
select 'storage_object_policies',
  coalesce(jsonb_agg(jsonb_build_object(
    'name', policyname, 'permissive', permissive, 'roles', roles,
    'command', cmd, 'using', qual, 'with_check', with_check
  ) order by policyname), '[]'::jsonb)
from pg_policies where schemaname = 'storage' and tablename = 'objects'
union all
select 'existing_course_functions',
  coalesce(jsonb_agg(jsonb_build_object(
    'schema', n.nspname, 'name', p.proname,
    'arguments', pg_get_function_identity_arguments(p.oid)
  ) order by n.nspname, p.proname), '[]'::jsonb)
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public', 'course_platform', 'course_staging', 'course_production')
  and (p.proname like 'course\_%' escape '\' or p.proname = 'create_course_profile');

commit;
