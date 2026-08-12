create extension if not exists "pgcrypto";

create table public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  domain text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  university_id uuid references public.universities(id),
  full_name text not null,
  email text not null unique,
  avatar_url text,
  major text,
  academic_year text,
  country text,
  languages text[] not null default '{}',
  preferred_activities text[] not null default '{}',
  study_style text,
  preferred_study_times text[] not null default '{}',
  student_status text,
  bio text,
  show_country boolean not null default true,
  show_languages boolean not null default true,
  show_courses boolean not null default true,
  same_university_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  university_id uuid references public.universities(id),
  code text not null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (university_id, code)
);

create table public.user_courses (
  user_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table public.interests (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.user_interests (
  user_id uuid references public.profiles(id) on delete cascade,
  interest_id uuid references public.interests(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, interest_id)
);

create table public.connection_preferences (
  user_id uuid references public.profiles(id) on delete cascade,
  connection_type text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, connection_type)
);

create table public.connection_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sender_id, receiver_id)
);

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references public.profiles(id) on delete cascade,
  user_b uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a <> user_b)
);

create table public.connection_messages (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.connections(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) > 0 and length(body) <= 2000),
  created_at timestamptz not null default now()
);

create table public.saved_profiles (
  saver_id uuid references public.profiles(id) on delete cascade,
  saved_user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (saver_id, saved_user_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  starts_at timestamptz not null,
  location text not null,
  category text not null,
  organizer text not null,
  source_label text not null default 'Sample community-added event',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_attendees (
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  status text not null default 'interested' check (status in ('interested', 'joined')),
  needs_buddy boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table public.event_buddy_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  note text,
  status text not null default 'open' check (status in ('open', 'matched', 'closed')),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table public.event_buddy_groups (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  name text not null,
  basis text,
  description text,
  max_members integer not null default 4,
  meeting_preference text,
  note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.event_buddy_group_members (
  group_id uuid references public.event_buddy_groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.survival_guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  category text not null,
  reading_time text not null,
  content jsonb not null,
  last_updated date not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_assistant_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  request jsonb not null,
  response jsonb not null,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blocks (
  blocker_id uuid references public.profiles(id) on delete cascade,
  blocked_user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_user_id)
);

create index profiles_university_idx on public.profiles(university_id);
create index profiles_major_idx on public.profiles(major);
create index courses_code_idx on public.courses(code);
create index events_starts_at_idx on public.events(starts_at);
create index connection_messages_connection_created_idx on public.connection_messages(connection_id, created_at);
create index survival_guides_search_idx on public.survival_guides using gin (to_tsvector('english', title || ' ' || summary || ' ' || category));
create index reports_status_idx on public.reports(status);

alter table public.universities enable row level security;
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.user_courses enable row level security;
alter table public.interests enable row level security;
alter table public.user_interests enable row level security;
alter table public.connection_preferences enable row level security;
alter table public.connection_requests enable row level security;
alter table public.connections enable row level security;
alter table public.connection_messages enable row level security;
alter table public.saved_profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;
alter table public.event_buddy_requests enable row level security;
alter table public.event_buddy_groups enable row level security;
alter table public.event_buddy_group_members enable row level security;
alter table public.survival_guides enable row level security;
alter table public.ai_assistant_history enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;

do $$
begin
  alter publication supabase_realtime add table public.connection_messages;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

create policy "authenticated read universities" on public.universities for select to authenticated using (true);
create policy "authenticated read courses" on public.courses for select to authenticated using (true);
create policy "authenticated read interests" on public.interests for select to authenticated using (true);
create policy "authenticated read guides" on public.survival_guides for select to authenticated using (true);
create policy "authenticated read events" on public.events for select to authenticated using (true);
create policy "authenticated create events" on public.events for insert to authenticated with check (created_by = auth.uid() or created_by is null);

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

create policy "profiles read discoverable" on public.profiles for select to authenticated
using (
  id = auth.uid()
  or (
    not exists (select 1 from public.blocks b where b.blocker_id = profiles.id and b.blocked_user_id = auth.uid())
    and (same_university_only = false or university_id = public.current_user_university_id())
  )
);
create policy "profiles own insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles own update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "own user courses" on public.user_courses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own user interests" on public.user_interests for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own preferences" on public.connection_preferences for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "connection request participants read" on public.connection_requests for select to authenticated using (sender_id = auth.uid() or receiver_id = auth.uid());
create policy "connection request send" on public.connection_requests for insert to authenticated with check (sender_id = auth.uid());
create policy "connection request receiver update" on public.connection_requests for update to authenticated using (receiver_id = auth.uid()) with check (receiver_id = auth.uid());
create policy "connection request sender delete" on public.connection_requests for delete to authenticated using (sender_id = auth.uid());

create policy "connections participants read" on public.connections for select to authenticated using (user_a = auth.uid() or user_b = auth.uid());
create policy "connections participants insert" on public.connections for insert to authenticated with check (user_a = auth.uid() or user_b = auth.uid());
create policy "connections participants delete" on public.connections for delete to authenticated using (user_a = auth.uid() or user_b = auth.uid());
create policy "connection messages participants read" on public.connection_messages for select to authenticated
using (
  exists (
    select 1 from public.connections c
    where c.id = connection_messages.connection_id
    and (c.user_a = auth.uid() or c.user_b = auth.uid())
  )
);
create policy "connection messages participants send" on public.connection_messages for insert to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.connections c
    where c.id = connection_messages.connection_id
    and (c.user_a = auth.uid() or c.user_b = auth.uid())
  )
);
create policy "saved profiles owner" on public.saved_profiles for all to authenticated using (saver_id = auth.uid()) with check (saver_id = auth.uid());
create policy "event attendees own write" on public.event_attendees for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "event attendees read" on public.event_attendees for select to authenticated using (true);
create policy "buddy requests own write" on public.event_buddy_requests for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "buddy requests read" on public.event_buddy_requests for select to authenticated using (true);
create policy "buddy groups read" on public.event_buddy_groups for select to authenticated using (true);
create policy "buddy groups creator write" on public.event_buddy_groups for all to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "buddy group members read" on public.event_buddy_group_members for select to authenticated using (true);
create policy "buddy group members own write" on public.event_buddy_group_members for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ai history owner" on public.ai_assistant_history for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "reports create own" on public.reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "blocks owner" on public.blocks for all to authenticated using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());
