-- run once in the supabase sql editor, after schema.sql and hardening.sql. safe to re-run.
--
-- every midnight (new york time) the worker saves the day's finished drawing as a png in the
-- snapshots bucket, adds one row here, and then deletes that day's turns + strokes so the next day
-- starts from a blank canvas. only the pngs are kept.

create table if not exists public.days (
    day date primary key, -- the new york calendar day the drawing belongs to
    snapshot_url text not null,
    turns int not null default 0,
    strokes int not null default 0,
    created_at timestamptz not null default now()
);

alter table public.days enable row level security;

drop policy if exists "anyone can read days" on public.days;
create policy "anyone can read days" on public.days for select using (true);

-- only the worker (secret key) writes days
revoke insert, update, delete, truncate on public.days from anon, authenticated;

-- live updates: an open page clears its canvas the moment a new day row appears
do $$
begin
    alter publication supabase_realtime add table public.days;
exception when duplicate_object then
    null;
end $$;
