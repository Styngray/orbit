-- ============================================================
-- Milestone 4: Team & User Management
-- ============================================================

-- Add email column to profiles so team members can see each other's emails
alter table public.profiles add column if not exists email text;

-- Update handle_new_user trigger to populate email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    new.email
  )
  on conflict (id) do update set
    email = excluded.email;
  return new;
end;
$$;

-- Allow team members to view each other's profiles (needed for member management page)
create policy "Team members can view teammate profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.team_members tm1
      join public.team_members tm2 on tm1.team_id = tm2.team_id
      where tm1.user_id = auth.uid()
        and tm2.user_id = profiles.id
    )
  );

-- ============================================================
-- Invitations table
-- ============================================================

create table if not exists public.invitations (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  email       text not null,
  role        text not null default 'member' check (role in ('admin', 'member')),
  token       uuid not null default gen_random_uuid(),
  invited_by  uuid not null references public.profiles(id),
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  unique (token),
  unique (email, team_id)
);

alter table public.invitations enable row level security;

-- Team admins can manage (view, create, delete) invitations for their team
create policy "Team admins can manage invitations"
  on public.invitations for all
  using (public.is_team_admin(team_id));
