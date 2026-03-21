create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text not null default 'gray',
  created_at timestamptz not null default now(),
  unique (workspace_id, name)
);

alter table public.labels enable row level security;

create policy "team members can manage labels"
  on public.labels
  for all
  using (
    exists (
      select 1 from public.workspaces w
      join public.team_members tm on tm.team_id = w.team_id
      where w.id = labels.workspace_id and tm.user_id = auth.uid()
    )
  );
