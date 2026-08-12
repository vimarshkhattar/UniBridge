create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind text not null default 'message',
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications(user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications(user_id, read_at)
  where read_at is null;

alter table public.notifications enable row level security;

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

drop policy if exists "notifications owner read" on public.notifications;
drop policy if exists "notifications owner update" on public.notifications;
drop policy if exists "notifications owner delete" on public.notifications;

create policy "notifications owner read" on public.notifications for select to authenticated
using (user_id = auth.uid());

create policy "notifications owner update" on public.notifications for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "notifications owner delete" on public.notifications for delete to authenticated
using (user_id = auth.uid());

create or replace function public.create_message_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  receiver_id uuid;
  sender_name text;
begin
  select case when c.user_a = new.sender_id then c.user_b else c.user_a end
  into receiver_id
  from public.connections c
  where c.id = new.connection_id
    and (c.user_a = new.sender_id or c.user_b = new.sender_id);

  if receiver_id is null or receiver_id = new.sender_id then
    return new;
  end if;

  select full_name into sender_name
  from public.profiles
  where id = new.sender_id;

  insert into public.notifications (user_id, actor_id, kind, title, body, href)
  values (
    receiver_id,
    new.sender_id,
    'message',
    'New message from ' || coalesce(sender_name, 'a UniBridge student'),
    left(new.body, 180),
    '/connections'
  );

  return new;
end;
$$;

drop trigger if exists on_connection_message_create_notification on public.connection_messages;

create trigger on_connection_message_create_notification
after insert on public.connection_messages
for each row execute function public.create_message_notification();
