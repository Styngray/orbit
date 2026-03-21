-- Add FK from team_members.user_id → profiles.id so PostgREST can
-- resolve the profiles(...) embedded resource join in queries like:
--   .from("team_members").select("user_id, profiles(display_name, email)")
alter table public.team_members
  add constraint team_members_user_id_profiles_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;
