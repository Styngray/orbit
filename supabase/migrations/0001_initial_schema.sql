-- ============================================================
-- Orbit — Initial Schema
-- ============================================================

-- Profiles (extends auth.users)
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url  text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- Teams
create table public.teams (
  id         uuid default gen_random_uuid() primary key,
  name       text not null,
  slug       text unique not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Team members
create table public.team_members (
  id         uuid default gen_random_uuid() primary key,
  team_id    uuid references public.teams on delete cascade not null,
  user_id    uuid references auth.users on delete cascade not null,
  role       text check (role in ('owner', 'admin', 'member')) default 'member' not null,
  created_at timestamptz default now() not null,
  unique(team_id, user_id)
);

-- Workspaces
create table public.workspaces (
  id         uuid default gen_random_uuid() primary key,
  team_id    uuid references public.teams on delete cascade not null,
  name       text not null,
  slug       text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(team_id, slug)
);

-- Boards
create table public.boards (
  id           uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  name         text not null,
  description  text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- Tasks
create table public.tasks (
  id          uuid default gen_random_uuid() primary key,
  board_id    uuid references public.boards on delete cascade not null,
  title       text not null,
  description text,
  status      text check (status in ('backlog', 'todo', 'in_progress', 'done', 'cancelled')) default 'backlog' not null,
  priority    text check (priority in ('urgent', 'high', 'medium', 'low', 'none')) default 'none' not null,
  assignee_id uuid references auth.users on delete set null,
  sort_order  float default 0 not null,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles     enable row level security;
alter table public.teams        enable row level security;
alter table public.team_members enable row level security;
alter table public.workspaces   enable row level security;
alter table public.boards       enable row level security;
alter table public.tasks        enable row level security;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Teams
create policy "Team members can view their teams"
  on public.teams for select
  using (
    exists (
      select 1 from public.team_members
      where team_id = teams.id and user_id = auth.uid()
    )
  );

create policy "Owners can update their teams"
  on public.teams for update
  using (
    exists (
      select 1 from public.team_members
      where team_id = teams.id and user_id = auth.uid() and role = 'owner'
    )
  );

-- Team members
create policy "Members can view their team's members"
  on public.team_members for select
  using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_members.team_id and tm.user_id = auth.uid()
    )
  );

create policy "Owners and admins can manage members"
  on public.team_members for all
  using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_members.team_id
        and tm.user_id = auth.uid()
        and tm.role in ('owner', 'admin')
    )
  );

-- Workspaces
create policy "Team members can view workspaces"
  on public.workspaces for select
  using (
    exists (
      select 1 from public.team_members
      where team_id = workspaces.team_id and user_id = auth.uid()
    )
  );

create policy "Owners and admins can manage workspaces"
  on public.workspaces for all
  using (
    exists (
      select 1 from public.team_members
      where team_id = workspaces.team_id
        and user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- Boards
create policy "Team members can view boards"
  on public.boards for select
  using (
    exists (
      select 1 from public.workspaces w
      join public.team_members tm on tm.team_id = w.team_id
      where w.id = boards.workspace_id and tm.user_id = auth.uid()
    )
  );

create policy "Team members can manage boards"
  on public.boards for all
  using (
    exists (
      select 1 from public.workspaces w
      join public.team_members tm on tm.team_id = w.team_id
      where w.id = boards.workspace_id and tm.user_id = auth.uid()
    )
  );

-- Tasks
create policy "Team members can view tasks"
  on public.tasks for select
  using (
    exists (
      select 1 from public.boards b
      join public.workspaces w on w.id = b.workspace_id
      join public.team_members tm on tm.team_id = w.team_id
      where b.id = tasks.board_id and tm.user_id = auth.uid()
    )
  );

create policy "Team members can manage tasks"
  on public.tasks for all
  using (
    exists (
      select 1 from public.boards b
      join public.workspaces w on w.id = b.workspace_id
      join public.team_members tm on tm.team_id = w.team_id
      where b.id = tasks.board_id and tm.user_id = auth.uid()
    )
  );

-- ============================================================
-- Triggers
-- ============================================================

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_teams_updated_at
  before update on public.teams
  for each row execute procedure public.set_updated_at();

create trigger set_workspaces_updated_at
  before update on public.workspaces
  for each row execute procedure public.set_updated_at();

create trigger set_boards_updated_at
  before update on public.boards
  for each row execute procedure public.set_updated_at();

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();
