-- Auto-seed default statuses when a new board is created
create or replace function public.seed_default_board_statuses()
returns trigger language plpgsql security definer as $$
begin
  insert into public.board_statuses (board_id, value, label, color, sort_order) values
    (new.id, 'backlog',     'Backlog',     '#94a3b8', 0),
    (new.id, 'todo',        'To Do',       '#60a5fa', 1),
    (new.id, 'in_progress', 'In Progress', '#fbbf24', 2),
    (new.id, 'done',        'Done',        '#4ade80', 3),
    (new.id, 'cancelled',   'Cancelled',   '#f87171', 4);
  return new;
end;
$$;

create trigger on_board_created
  after insert on public.boards
  for each row execute procedure public.seed_default_board_statuses();
