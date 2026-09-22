-- Apply to a dedicated Supabase project. Never bootstrap an administrator from signup metadata.
-- SQL Editor: paste this entire file and run once in the NEW course project.
-- Keep the transaction intact so an error cannot leave a partial installation.
begin;

create extension if not exists pgcrypto;

create table public.course_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  display_name text not null default '',
  role text not null default 'learner' check (role in ('learner','admin')),
  suspended boolean not null default false,
  created_at timestamptz not null default now()
);
create function public.create_course_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.course_profiles(id,email,display_name)
  values (new.id,coalesce(new.email,''),left(coalesce(new.raw_user_meta_data->>'display_name',''),120));
  return new;
end $$;
create trigger course_profile_signup after insert on auth.users for each row execute function public.create_course_profile();
insert into public.course_profiles(id,email) select id,coalesce(email,'') from auth.users on conflict do nothing;

create function public.course_is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.course_profiles where id=auth.uid() and role='admin' and not suspended)
$$;
create function public.course_is_active() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.course_profiles where id=auth.uid() and not suspended)
$$;

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 160),
  summary text not null default '' check (length(summary)<=2000),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  position integer not null default 0 check (position>=0),
  stripe_price_id text unique,
  thumbnail_asset_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null check (length(title) between 1 and 160),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  position integer not null default 0 check (position>=0),
  created_at timestamptz not null default now()
);
create table public.course_assets (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete restrict,
  name text not null check (length(name) between 1 and 250),
  path text not null unique,
  kind text not null check (kind in ('video','image','attachment')),
  mime_type text not null,
  size_bytes bigint not null check(size_bytes>0),
  status text not null default 'uploading' check(status in ('uploading','ready','archived')),
  created_at timestamptz not null default now()
);
alter table public.courses add constraint course_thumbnail_fk foreign key(thumbnail_asset_id) references public.course_assets(id) on delete set null;
create table public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null check(length(title) between 1 and 160),
  description jsonb not null default '{"type":"doc","content":[]}',
  video_asset_id uuid references public.course_assets(id) on delete set null,
  status text not null default 'draft' check(status in ('draft','published','archived')),
  position integer not null default 0 check(position>=0),
  created_at timestamptz not null default now(),
  check(pg_column_size(description)<=100000)
);
create table public.course_attachments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  asset_id uuid not null references public.course_assets(id) on delete restrict,
  unique(lesson_id,asset_id)
);
create table public.course_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.course_profiles(id),
  course_id uuid not null references public.courses(id),
  stripe_price_id text not null,
  checkout_session_id text unique,
  payment_intent_id text unique,
  status text not null default 'pending' check(status in ('pending','paid','refunded','disputed','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.course_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.course_profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id),
  source text not null check(source in ('purchase','manual','migration')),
  source_id text not null,
  active boolean not null default true,
  expires_at timestamptz,
  note text not null default '',
  created_at timestamptz not null default now(),
  unique(source,source_id)
);
create index course_grants_lookup on public.course_entitlements(user_id,course_id) where active;
create index course_modules_order on public.course_modules(course_id,position);
create index course_lessons_order on public.course_lessons(module_id,position);
create index course_attachments_asset on public.course_attachments(asset_id);
create index course_assets_course on public.course_assets(course_id);

create table public.course_payment_events (
  id text primary key,
  type text not null,
  order_id uuid references public.course_orders(id),
  status text not null default 'received' check(status in ('received','processed','failed','ignored')),
  error text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
create table public.course_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  table_name text not null,
  record_id text,
  created_at timestamptz not null default now()
);
create function public.course_audit() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.course_audit_log(actor_id,action,table_name,record_id)
  values(auth.uid(),tg_op,tg_table_name,coalesce(to_jsonb(new)->>'id',to_jsonb(old)->>'id'));
  return coalesce(new,old);
end $$;

create function public.course_can_read(target uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select public.course_is_admin() or (
    public.course_is_active() and exists(select 1 from public.courses where id=target and status='published')
    and exists(select 1 from public.course_entitlements where user_id=auth.uid() and course_id=target and active and (expires_at is null or expires_at>now()))
  )
$$;

-- DB-level checks protect against bypassing the application's forms.
create function public.validate_course_asset_reference() returns trigger language plpgsql set search_path = '' as $$
declare target_course uuid; asset public.course_assets;
begin
  if tg_table_name='courses' then
    if new.thumbnail_asset_id is null then return new; end if;
    select * into asset from public.course_assets where id=new.thumbnail_asset_id for update;
    if asset.id is null or asset.course_id<>new.id or asset.kind<>'image' or asset.status<>'ready' then raise exception 'Invalid course thumbnail'; end if;
  elsif tg_table_name='course_lessons' then
    select course_id into target_course from public.course_modules where id=new.module_id;
    if new.video_asset_id is not null then
      select * into asset from public.course_assets where id=new.video_asset_id for update;
      if asset.id is null or asset.course_id<>target_course or asset.kind<>'video' or asset.status<>'ready' then raise exception 'Invalid lesson video'; end if;
    end if;
    if new.status='published' and new.video_asset_id is null then raise exception 'Upload a video before publishing a lesson'; end if;
  else
    select m.course_id into target_course from public.course_lessons l join public.course_modules m on m.id=l.module_id where l.id=new.lesson_id;
    select * into asset from public.course_assets where id=new.asset_id for update;
    if asset.id is null or asset.course_id<>target_course or asset.kind='video' or asset.status<>'ready' then raise exception 'Invalid attachment'; end if;
  end if;
  return new;
end $$;
create trigger course_thumbnail_check before insert or update on public.courses for each row execute function public.validate_course_asset_reference();
create trigger course_video_check before insert or update on public.course_lessons for each row execute function public.validate_course_asset_reference();
create trigger course_attachment_check before insert or update on public.course_attachments for each row execute function public.validate_course_asset_reference();

create function public.guard_course_asset_archive() returns trigger language plpgsql set search_path='' as $$
begin
  if new.status<>'ready' and (
    exists(select 1 from public.courses where thumbnail_asset_id=new.id)
    or exists(select 1 from public.course_lessons where video_asset_id=new.id)
    or exists(select 1 from public.course_attachments where asset_id=new.id)
  ) then raise exception 'Detach this file before archiving it'; end if;
  return new;
end $$;
create trigger asset_archive_check before update on public.course_assets for each row execute function public.guard_course_asset_archive();

alter table public.course_profiles enable row level security;
create policy profile_read on public.course_profiles for select to authenticated using (id=auth.uid() or public.course_is_admin());
-- No direct writes to profiles: prevents self-promotion / self-unsuspension.
revoke all on public.course_profiles from anon,authenticated;
grant select on public.course_profiles to authenticated;

do $$ declare name text; begin
  foreach name in array array['courses','course_modules','course_lessons','course_assets','course_attachments','course_entitlements','course_orders','course_payment_events','course_audit_log'] loop
    execute format('alter table public.%I enable row level security',name);
    execute format('revoke all on public.%I from anon,authenticated',name);
    execute format('grant select on public.%I to authenticated',name);
    execute format('create policy admin_read on public.%I for select to authenticated using (public.course_is_admin())',name);
  end loop;
  foreach name in array array['courses','course_modules','course_lessons','course_assets','course_attachments'] loop
    execute format('grant insert,update,delete on public.%I to authenticated',name);
    execute format('create policy admin_write on public.%I for all to authenticated using (public.course_is_admin()) with check (public.course_is_admin())',name);
  end loop;
  foreach name in array array['courses','course_modules','course_lessons','course_assets','course_attachments','course_entitlements','course_profiles'] loop
    execute format('create trigger audit_changes after insert or update or delete on public.%I for each row execute function public.course_audit()',name);
  end loop;
end $$;
create policy course_catalog on public.courses for select to authenticated using (status='published' and public.course_is_active());
create policy module_access on public.course_modules for select to authenticated using (status='published' and public.course_can_read(course_id));
create policy lesson_access on public.course_lessons for select to authenticated using (
  status='published' and exists(select 1 from public.course_modules m where m.id=module_id and m.status='published' and public.course_can_read(m.course_id))
);
create policy attachment_access on public.course_attachments for select to authenticated using (exists(select 1 from public.course_lessons l where l.id=lesson_id));
create policy asset_access on public.course_assets for select to authenticated using (
  status='ready' and public.course_is_active() and (
    exists(select 1 from public.courses c where c.thumbnail_asset_id=course_assets.id and c.status='published')
    or exists(select 1 from public.course_lessons l where l.video_asset_id=course_assets.id)
    or exists(select 1 from public.course_attachments a where a.asset_id=course_assets.id)
  )
);
create policy grant_owner on public.course_entitlements for select to authenticated using(user_id=auth.uid() and public.course_is_active());
create policy order_owner on public.course_orders for select to authenticated using(user_id=auth.uid() and public.course_is_active());

-- Manual grants cannot alter purchase-backed grants. A refund revokes only its own grant.
create function public.course_manage_access(target_user uuid,target_course uuid,enabled boolean,reason text) returns void language plpgsql security definer set search_path='' as $$
begin
  if not public.course_is_admin() then raise exception 'Forbidden'; end if;
  if length(trim(reason))=0 or length(reason)>500 then raise exception 'A reason is required'; end if;
  insert into public.course_entitlements(user_id,course_id,source,source_id,active,note)
  values(target_user,target_course,'manual',target_user::text||':'||target_course::text,enabled,reason)
  on conflict(source,source_id) do update set active=excluded.active,note=excluded.note;
end $$;
create function public.course_suspend_member(target_user uuid,enabled boolean) returns void language plpgsql security definer set search_path='' as $$
begin
  if not public.course_is_admin() or target_user=auth.uid() then raise exception 'Forbidden'; end if;
  update public.course_profiles set suspended=enabled where id=target_user and role='learner';
end $$;

create function public.course_reorder(item_type text,ordered_ids uuid[]) returns void language plpgsql security definer set search_path='' as $$
declare parent uuid; total integer; supplied integer;
begin
  if not public.course_is_admin() then raise exception 'Forbidden'; end if;
  supplied := cardinality(ordered_ids);
  if supplied is null or supplied=0 or supplied>1000 or (select count(distinct x) from unnest(ordered_ids) x)<>supplied then raise exception 'Invalid order'; end if;
  if item_type='module' then
    select course_id into parent from public.course_modules where id=ordered_ids[1];
    perform 1 from public.courses where id=parent for update;
    select count(*) into total from public.course_modules where course_id=parent;
    if total<>supplied or (select count(*) from public.course_modules where course_id=parent and id=any(ordered_ids))<>supplied then raise exception 'Curriculum changed. Refresh and retry.'; end if;
    update public.course_modules m set position=ordered.ordinality-1 from unnest(ordered_ids) with ordinality as ordered(id,ordinality) where m.id=ordered.id;
  elsif item_type='lesson' then
    select module_id into parent from public.course_lessons where id=ordered_ids[1];
    perform 1 from public.course_modules where id=parent for update;
    select count(*) into total from public.course_lessons where module_id=parent;
    if total<>supplied or (select count(*) from public.course_lessons where module_id=parent and id=any(ordered_ids))<>supplied then raise exception 'Curriculum changed. Refresh and retry.'; end if;
    update public.course_lessons l set position=ordered.ordinality-1 from unnest(ordered_ids) with ordinality as ordered(id,ordinality) where l.id=ordered.id;
  else raise exception 'Invalid item type'; end if;
end $$;
revoke all on function public.course_reorder(text,uuid[]) from public,anon;
grant execute on function public.course_reorder(text,uuid[]) to authenticated;

-- Service-only RPC: serialize fulfillment, preserve refunds against late success events.
create function public.course_apply_payment(target_order uuid,target_state text,session_ref text,intent_ref text) returns void language plpgsql security definer set search_path='' as $$
declare purchase public.course_orders;
begin
  if target_state not in ('paid','refunded','disputed','failed') then raise exception 'Invalid payment state'; end if;
  select * into purchase from public.course_orders where id=target_order for update;
  if purchase.id is null then raise exception 'Order not found'; end if;
  if purchase.status='refunded' then target_state := 'refunded';
  elsif purchase.status='disputed' and target_state<>'refunded' then target_state := 'disputed';
  elsif purchase.status='paid' and target_state='failed' then target_state := 'paid'; end if;
  update public.course_orders set status=target_state,checkout_session_id=coalesce(session_ref,checkout_session_id),payment_intent_id=coalesce(intent_ref,payment_intent_id),updated_at=now() where id=target_order;
  insert into public.course_entitlements(user_id,course_id,source,source_id,active)
  values(purchase.user_id,purchase.course_id,'purchase',purchase.id::text,target_state='paid')
  on conflict(source,source_id) do update set active=excluded.active;
end $$;

revoke all on function public.course_apply_payment(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.course_apply_payment(uuid,text,text,text) to service_role;
revoke all on function public.course_manage_access(uuid,uuid,boolean,text),public.course_suspend_member(uuid,boolean) from public,anon;
grant execute on function public.course_manage_access(uuid,uuid,boolean,text),public.course_suspend_member(uuid,boolean) to authenticated;
revoke all on function public.create_course_profile(),public.course_audit(),public.validate_course_asset_reference() from public;
revoke all on function public.course_is_admin(),public.course_is_active(),public.course_can_read(uuid) from public,anon;
grant execute on function public.course_is_admin(),public.course_is_active(),public.course_can_read(uuid) to authenticated,service_role;
revoke all on function public.guard_course_asset_archive() from public;
grant all on public.course_profiles,public.courses,public.course_modules,public.course_lessons,public.course_assets,public.course_attachments,public.course_entitlements,public.course_orders,public.course_payment_events,public.course_audit_log to service_role;
grant usage,select on sequence public.course_audit_log_id_seq to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('course-media','course-media',false,5368709120,array['video/mp4','video/quicktime','image/jpeg','image/png','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict(id) do update set public=false;
create policy course_storage_admin on storage.objects for all to authenticated
using(bucket_id='course-media' and public.course_is_admin())
with check(bucket_id='course-media' and public.course_is_admin());
-- Learners receive short-lived URLs only from the authorized media API, never direct Storage access.

commit;
