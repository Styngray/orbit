-- ============================================================
-- Fix self-referential RLS on team_members
--
-- The original policies queried team_members from within
-- team_members' own SELECT policy, causing infinite recursion.
-- Security definer scalar functions break the recursion.
-- ============================================================

-- Returns true if the current user is a member of the given team
create or replace function public.is_team_member(check_team_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.team_members
    where user_id = auth.uid() and team_id = check_team_id
  )
$$;

-- Returns true if the current user is owner/admin of the given team
create or replace function public.is_team_admin(check_team_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.team_members
    where user_id = auth.uid()
      and team_id = check_team_id
      and role in ('owner', 'admin')
  )
$$;

-- Replace self-referential team_members policies
drop policy if exists "Members can view their team's members" on public.team_members;
drop policy if exists "Owners and admins can manage members" on public.team_members;

create policy "Members can view their team's members"
  on public.team_members for select
  using (public.is_team_member(team_id));

create policy "Owners and admins can manage members"
  on public.team_members for all
  using (public.is_team_admin(team_id));
