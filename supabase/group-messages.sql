-

create table if not exists public.event_buddy_group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.event_buddy_groups(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists buddy_group_messages_group_created_idx
  on public.event_buddy_group_messages(group_id, created_at);

alter table public.event_buddy_group_messages enable row level security;

do $$
begin
  alter publication supabase_realtime add table public.event_buddy_group_messages;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;


create or replace function public.is_buddy_group_member(target_group_id uuid, target_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.event_buddy_group_members m
    where m.group_id = target_group_id and m.user_id = target_user_id
  ) or exists (
    select 1 from public.event_buddy_groups g
    where g.id = target_group_id and g.created_by = target_user_id
  );
$$;

drop policy if exists "buddy group messages member read" on public.event_buddy_group_messages;
drop policy if exists "buddy group messages member write" on public.event_buddy_group_messages;

create policy "buddy group messages member read" on public.event_buddy_group_messages
for select to authenticated
using (public.is_buddy_group_member(group_id, auth.uid()));

create policy "buddy group messages member write" on public.event_buddy_group_messages
for insert to authenticated
with check (sender_id = auth.uid() and public.is_buddy_group_member(group_id, auth.uid()));

-- Notify every other member of the group, reusing the existing notifications table.
create or replace function public.create_group_message_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sender_name text;
  group_name text;
  event_local_id text;
begin
  select full_name into sender_name from public.profiles where id = new.sender_id;
  select g.name into group_name from public.event_buddy_groups g where g.id = new.group_id;

  select e.id::text into event_local_id
  from public.event_buddy_groups g
  join public.events e on e.id = g.event_id
  where g.id = new.group_id;

  insert into public.notifications (user_id, actor_id, kind, title, body, href)
  select
    member_id,
    new.sender_id,
    'group_message',
    coalesce(sender_name, 'A UniBridge student') || ' posted in ' || coalesce(group_name, 'your buddy group'),
    left(new.body, 180),
    '/events'
  from (
    select m.user_id as member_id
    from public.event_buddy_group_members m
    where m.group_id = new.group_id
    union
    select g.created_by as member_id
    from public.event_buddy_groups g
    where g.id = new.group_id and g.created_by is not null
  ) members
  where member_id <> new.sender_id;

  return new;
end;
$$;

drop trigger if exists on_buddy_group_message_create_notification on public.event_buddy_group_messages;

create trigger on_buddy_group_message_create_notification
after insert on public.event_buddy_group_messages
for each row execute function public.create_group_message_notification();
