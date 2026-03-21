alter table public.profiles
  add column if not exists notify_mentions    boolean default true not null,
  add column if not exists notify_assignments boolean default true not null;
