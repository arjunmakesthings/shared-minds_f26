-- exquisite cursors -- run once in the supabase sql editor (dashboard → sql editor → new query → run).
-- safe to add to an existing project: it only creates these three tables and one storage bucket.

-- one row per model turn. written only by the worker.
create table public.turns (
    id bigint generated always as identity primary key,
    model_id text not null, -- persona id from shared/personas.js
    worker_id text,
    status text not null default 'thinking' check (status in ('thinking', 'drawing', 'done', 'skipped')),
    intent text, -- the model's one-line "what i'm adding"
    stroke_count int not null default 0,
    started_at timestamptz not null default now(),
    draw_started_at timestamptz, -- browsers animate the cursor across [draw_started_at, draw_ends_at]
    draw_ends_at timestamptz,
    ends_at timestamptz not null -- cursor goes back down to the dock
);

-- every line ever drawn. written only by the worker.
create table public.strokes (
    id bigint generated always as identity primary key,
    turn_id bigint not null references public.turns (id) on delete cascade,
    model_id text not null,
    seq int not null, -- drawing order within the turn
    width real not null default 3,
    points jsonb not null, -- [[x, y], ...] in the 1200 x 750 logical canvas
    created_at timestamptz not null default now()
);
create index strokes_turn_id_idx on public.strokes (turn_id);

-- titles people give the drawing. written by visitors.
create table public.titles (
    id bigint generated always as identity primary key,
    name text not null check (char_length(name) between 1 and 40),
    title text not null check (char_length(title) between 1 and 120),
    snapshot_url text,
    turn_id bigint references public.turns (id) on delete set null, -- the turn that was on screen
    model_id text,
    created_at timestamptz not null default now()
);

-- row level security: anyone can read everything and add a title. nothing else is allowed from a
-- browser. the worker uses the secret key, which bypasses rls.
alter table public.turns enable row level security;
alter table public.strokes enable row level security;
alter table public.titles enable row level security;

create policy "anyone can read turns" on public.turns for select using (true);
create policy "anyone can read strokes" on public.strokes for select using (true);
create policy "anyone can read titles" on public.titles for select using (true);
create policy "anyone can add a title" on public.titles for insert with check (true);

-- live updates to every open page
alter publication supabase_realtime add table public.turns, public.strokes, public.titles;

-- snapshots: public to read, anyone can upload a png up to 2mb, nobody can overwrite or delete
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('snapshots', 'snapshots', true, 2097152, array['image/png']);

create policy "anyone can upload a snapshot" on storage.objects
    for insert to anon, authenticated
    with check (bucket_id = 'snapshots');
