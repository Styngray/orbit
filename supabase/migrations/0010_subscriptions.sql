-- ============================================================
-- Orbit — Subscriptions & Plan Limits
-- ============================================================

-- Add stripe_customer_id to teams
alter table public.teams
  add column if not exists stripe_customer_id text unique;

-- Subscriptions table (one active row per team)
create table public.subscriptions (
  id                        uuid default gen_random_uuid() primary key,
  team_id                   uuid references public.teams on delete cascade not null unique,
  stripe_subscription_id    text unique,
  plan                      text check (plan in ('free', 'lite', 'pro')) default 'free' not null,
  status                    text check (status in ('active', 'trialing', 'past_due', 'canceled', 'incomplete')) default 'active' not null,
  current_period_end        timestamptz,
  cancel_at_period_end      boolean default false not null,
  created_at                timestamptz default now() not null,
  updated_at                timestamptz default now() not null
);

-- Auto-update updated_at
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- RLS
alter table public.subscriptions enable row level security;

create policy "Team members can view their subscription"
  on public.subscriptions for select
  using (
    exists (
      select 1 from public.team_members
      where team_id = subscriptions.team_id and user_id = auth.uid()
    )
  );

-- Helper: get team plan (security definer so actions can call it)
create or replace function public.get_team_plan(p_team_id uuid)
returns text
language sql
security definer
stable
as $$
  select coalesce(
    (select plan from public.subscriptions
     where team_id = p_team_id
       and status in ('active', 'trialing')
     limit 1),
    'free'
  );
$$;
