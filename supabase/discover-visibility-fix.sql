create or replace function public.current_user_university_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select university_id
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;

drop policy if exists "profiles read discoverable" on public.profiles;

create policy "profiles read discoverable" on public.profiles for select to authenticated
using (
  id = auth.uid()
  or (
    not exists (select 1 from public.blocks b where b.blocker_id = profiles.id and b.blocked_user_id = auth.uid())
    and (same_university_only = false or university_id = public.current_user_university_id())
  )
);

select
  profile.full_name,
  profile.email,
  university.name as university,
  profile.same_university_only
from public.profiles profile
left join public.universities university on university.id = profile.university_id
order by profile.created_at desc;
