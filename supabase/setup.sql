-- Class Schedule Builder — database setup
-- Run in: Supabase Dashboard -> SQL Editor -> New query
-- Intended for a NEW project with no conflicting table names.

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_code text not null,
  subject_name text not null,
  instructor text,
  room text,
  color text not null default '#6366f1',
  created_at timestamptz not null default now(),
  constraint subjects_code_per_user_unique unique (user_id, subject_code)
);

create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  constraint class_session_valid_time check (start_time < end_time)
);

create index class_sessions_user_day_idx
  on public.class_sessions (user_id, day_of_week);

create index class_sessions_subject_id_idx
  on public.class_sessions (subject_id);

-- Enable Row Level Security on every browser-accessible table.
alter table public.subjects enable row level security;
alter table public.class_sessions enable row level security;

-- Grant signed-in users the table operations that the app uses.
grant select, insert, update, delete on public.subjects to authenticated;
grant select, insert, update, delete on public.class_sessions to authenticated;

-- A user can manage only their own subject records.
create policy "Users manage their own subjects"
on public.subjects
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- A user can read only their own class sessions.
create policy "Users read their own class sessions"
on public.class_sessions
for select
to authenticated
using (auth.uid() = user_id);

-- New sessions must belong to the signed-in user and to one of that user's subjects.
create policy "Users create their own class sessions"
on public.class_sessions
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.subjects s
    where s.id = subject_id
      and s.user_id = auth.uid()
  )
);

-- Updated sessions must still belong to the signed-in user and their subject.
create policy "Users update their own class sessions"
on public.class_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.subjects s
    where s.id = subject_id
      and s.user_id = auth.uid()
  )
);

-- A user can delete only their own class sessions.
create policy "Users delete their own class sessions"
on public.class_sessions
for delete
to authenticated
using (auth.uid() = user_id);
