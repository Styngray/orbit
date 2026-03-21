alter table public.tasks add column if not exists labels text[] not null default '{}';
