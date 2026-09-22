-- Upgrade an existing course bucket. Does not change its size limit, privacy,
-- objects, or policies. Safe to run again. NULL already permits every MIME type.
begin;
do $$ begin
  if not exists(select 1 from storage.buckets where id='course-media' and public=false) then
    raise exception 'Expected private course-media bucket was not found. Check the target project.';
  end if;
end $$;
update storage.buckets
set allowed_mime_types = array_append(allowed_mime_types, 'video/quicktime')
where id='course-media' and allowed_mime_types is not null
  and not ('video/quicktime' = any(allowed_mime_types));
commit;
