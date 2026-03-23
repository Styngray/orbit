-- Board-level custom statuses
create table public.board_statuses (
  id          uuid default gen_random_uuid() primary key,
  board_id    uuid references public.boards on delete cascade not null,
  value       text not null,
  label       text not null,
  color       text not null default '#94a3b8',
  sort_order  integer not null default 0,
  created_at  timestamptz default now() not null,
  unique(board_id, value)
);

alter table public.board_statuses enable row level security;

-- Workspace members can view (team_members join through workspaces→teams)
create policy "workspace members can view board statuses"
  on public.board_statuses for select
  using (
    board_id in (
      select b.id from public.boards b
      join public.workspaces w on w.id = b.workspace_id
      join public.team_members tm on tm.team_id = w.team_id
      where tm.user_id = auth.uid()
    )
  );

-- Workspace members can insert
create policy "workspace members can insert board statuses"
  on public.board_statuses for insert
  with check (
    board_id in (
      select b.id from public.boards b
      join public.workspaces w on w.id = b.workspace_id
      join public.team_members tm on tm.team_id = w.team_id
      where tm.user_id = auth.uid()
    )
  );

-- Workspace members can update
create policy "workspace members can update board statuses"
  on public.board_statuses for update
  using (
    board_id in (
      select b.id from public.boards b
      join public.workspaces w on w.id = b.workspace_id
      join public.team_members tm on tm.team_id = w.team_id
      where tm.user_id = auth.uid()
    )
  );

-- Workspace members can delete
create policy "workspace members can delete board statuses"
  on public.board_statuses for delete
  using (
    board_id in (
      select b.id from public.boards b
      join public.workspaces w on w.id = b.workspace_id
      join public.team_members tm on tm.team_id = w.team_id
      where tm.user_id = auth.uid()
    )
  );

-- Seed default statuses for all existing boards
insert into public.board_statuses (board_id, value, label, color, sort_order)
select
  b.id,
  s.value,
  s.label,
  s.color,
  s.sort_order
from public.boards b
cross join (values
  ('backlog',     'Backlog',     '#94a3b8', 0),
  ('todo',        'To Do',       '#60a5fa', 1),
  ('in_progress', 'In Progress', '#fbbf24', 2),
  ('done',        'Done',        '#4ade80', 3),
  ('cancelled',   'Cancelled',   '#f87171', 4)
) as s(value, label, color, sort_order);

-- Remove the hard-coded CHECK constraint so custom status values are allowed
alter table public.tasks drop constraint if exists tasks_status_check;
