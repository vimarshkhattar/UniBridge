create or replace function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_university_id uuid;
  resolved_email text;
  resolved_name text;
begin
  resolved_email := coalesce(new.email, new.id::text || '@unibridge.local');

  select id into resolved_university_id
  from public.universities
  where domain is not null
    and lower(resolved_email) like '%@' || lower(domain)
  order by length(domain) desc
  limit 1;

  resolved_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    nullif(trim(split_part(resolved_email, '@', 1)), ''),
    'UniBridge Student'
  );

  insert into public.profiles (
    id,
    university_id,
    full_name,
    email,
    languages,
    preferred_activities,
    preferred_study_times,
    bio,
    show_country,
    show_languages,
    show_courses,
    same_university_only
  )
  values (
    new.id,
    resolved_university_id,
    resolved_name,
    resolved_email,
    '{}',
    '{}',
    '{}',
    'New UniBridge member. Profile details can be completed from the Profile page.',
    true,
    true,
    true,
    false
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
    university_id = coalesce(public.profiles.university_id, excluded.university_id),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;

create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_auth_user_profile();

insert into public.profiles (
  id,
  university_id,
  full_name,
  email,
  languages,
  preferred_activities,
  preferred_study_times,
  bio,
  show_country,
  show_languages,
  show_courses,
  same_university_only
)
select
  auth_user.id,
  university_match.id,
  coalesce(
    nullif(trim(auth_user.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(auth_user.raw_user_meta_data->>'name'), ''),
    nullif(trim(split_part(auth_user.email, '@', 1)), ''),
    'UniBridge Student'
  ),
  auth_user.email,
  '{}',
  '{}',
  '{}',
  'New UniBridge member. Profile details can be completed from the Profile page.',
  true,
  true,
  true,
  false
from auth.users auth_user
left join lateral (
  select id
  from public.universities
  where domain is not null
    and lower(coalesce(auth_user.email, '')) like '%@' || lower(domain)
  order by length(domain) desc
  limit 1
) university_match on true
where auth_user.email is not null
  and not exists (
    select 1
    from public.profiles existing_profile
    where existing_profile.id = auth_user.id
  )
on conflict (id) do nothing;

insert into public.connection_preferences (user_id, connection_type)
select profile.id, preference.connection_type
from public.profiles profile
cross join (
  values
    ('Study partner'),
    ('Friend'),
    ('Event buddy')
) as preference(connection_type)
where not exists (
  select 1
  from public.connection_preferences existing_preference
  where existing_preference.user_id = profile.id
)
on conflict do nothing;
