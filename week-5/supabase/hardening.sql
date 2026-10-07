-- run once in the supabase sql editor, after schema.sql. tightens what visitors can write.
-- safe to re-run.

-- 1. titles: a visitor may only add a plain title. the snapshot must be a png in our own bucket, the
--    model must be one of the five personas, and the turn must really exist.
drop policy if exists "anyone can add a title" on public.titles;
create policy "anyone can add a title" on public.titles for insert to anon, authenticated
with check (
    char_length(btrim(name)) between 1 and 40
    and char_length(btrim(title)) between 1 and 120
    and (snapshot_url is null
         or snapshot_url ~ '^https://fhekvtwagipiwqlhmxoy\.supabase\.co/storage/v1/object/public/snapshots/[0-9]+-[0-9a-f-]+\.png$')
    and (model_id is null or model_id in ('margo', 'dev', 'tomasz', 'rae', 'noor'))
    and (turn_id is null or exists (select 1 from public.turns t where t.id = turn_id))
);

-- 2. snapshots: only files named <timestamp>-<uuid>.png can be uploaded.
drop policy if exists "anyone can upload a snapshot" on storage.objects;
create policy "anyone can upload a snapshot" on storage.objects for insert to anon, authenticated
with check (bucket_id = 'snapshots' and name ~ '^[0-9]+-[0-9a-f-]+\.png$');

-- 3. make sure browsers can never write drawing data, even if a policy is added by mistake later.
revoke insert, update, delete, truncate on public.turns, public.strokes from anon, authenticated;
revoke update, delete, truncate on public.titles from anon, authenticated;
