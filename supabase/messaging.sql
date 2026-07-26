create table if not exists public.connection_messages (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.connections(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) > 0 and length(body) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists connection_messages_connection_created_idx
  on public.connection_messages(connection_id, created_at);

alter table public.connection_messages enable row level security;

drop policy if exists "connection messages participants read" on public.connection_messages;
drop policy if exists "connection messages participants send" on public.connection_messages;

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
