-- Computer Lab Records schema for Supabase
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'viewer' check (role in ('lab_assistant', 'viewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.labs (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  room_no text,
  total_pcs integer not null default 20,
  created_at timestamptz not null default now()
);

create table if not exists public.pcs (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid not null references public.labs(id) on delete cascade,
  pc_number integer not null,
  asset_tag text,
  status text not null default 'ok' check (status in ('ok', 'issue', 'under_repair')),
  notes text,
  updated_at timestamptz not null default now(),
  unique (lab_id, pc_number)
);

create table if not exists public.pc_issues (
  id uuid primary key default gen_random_uuid(),
  pc_id uuid not null references public.pcs(id) on delete cascade,
  issue_title text not null,
  issue_details text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  issue_status text not null default 'open' check (issue_status in ('open', 'in_progress', 'resolved')),
  reported_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null
);

create table if not exists public.lab_sessions (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid not null references public.labs(id) on delete cascade,
  session_date date not null,
  day_name text not null,
  start_time time not null,
  end_time time not null,
  teacher_name text not null,
  class_name text not null,
  topic text not null,
  teacher_sign text,
  cr_sign text,
  assistant_sign text,
  remarks text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'viewer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'viewer');
$$;

alter table public.profiles enable row level security;
alter table public.labs enable row level security;
alter table public.pcs enable row level security;
alter table public.pc_issues enable row level security;
alter table public.lab_sessions enable row level security;

-- Profiles
create policy "profiles self read" on public.profiles
for select to authenticated
using (id = auth.uid());

create policy "assistant can update own profile" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Read access for both roles
create policy "labs readable by authenticated" on public.labs
for select to authenticated
using (true);

create policy "pcs readable by authenticated" on public.pcs
for select to authenticated
using (true);

create policy "issues readable by authenticated" on public.pc_issues
for select to authenticated
using (true);

create policy "sessions readable by authenticated" on public.lab_sessions
for select to authenticated
using (true);

-- Full write for lab assistant only
create policy "assistant manages labs" on public.labs
for all to authenticated
using (public.current_app_role() = 'lab_assistant')
with check (public.current_app_role() = 'lab_assistant');

create policy "assistant manages pcs" on public.pcs
for all to authenticated
using (public.current_app_role() = 'lab_assistant')
with check (public.current_app_role() = 'lab_assistant');

create policy "assistant manages issues" on public.pc_issues
for all to authenticated
using (public.current_app_role() = 'lab_assistant')
with check (public.current_app_role() = 'lab_assistant');

create policy "assistant manages sessions" on public.lab_sessions
for all to authenticated
using (public.current_app_role() = 'lab_assistant')
with check (public.current_app_role() = 'lab_assistant');

-- Sample labs
insert into public.labs (name, room_no, total_pcs)
values
  ('Lab A', 'Room 101', 20),
  ('Lab B', 'Room 102', 20)
on conflict (name) do nothing;

-- Generate 20 PCs for each lab if missing
insert into public.pcs (lab_id, pc_number, status)
select l.id, gs.pc_number, 'ok'
from public.labs l
cross join generate_series(1, 20) as gs(pc_number)
on conflict (lab_id, pc_number) do nothing;

comment on function public.current_app_role is 'Returns app role from public.profiles for RLS checks.';
