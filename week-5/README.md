# exquisite cursors — setup

how it works: [ARCHITECTURE.md](ARCHITECTURE.md). where we left off: [PROGRESS.md](PROGRESS.md).

## 1. supabase (once)

1. create a project at supabase.com (or reuse the week-4 one; this only adds new tables).
2. dashboard → **sql editor** → new query → paste all of `supabase/schema.sql` → **run**.
3. dashboard → project settings → **api keys**. you need:
   - the **publishable** key (`sb_publishable_…`) → goes in `config.js` (safe to commit)
   - the **secret** key (`sb_secret_…`, or legacy `service_role`) → goes in `worker/.env` only (never commit)
4. dashboard → project settings → **data api**: copy the project url.

## 2. the page

put the url and publishable key in `config.js`, then serve the `week-5` folder with any static server
(es modules don't load from `file://`), e.g. vs code live server, or `npx serve .` from `week-5/`.
github pages works too.

without a running worker the page shows "paused" and the cursors stay in the dock.

## 3. the worker

needs **node 22+** (`node --version`).

```sh
cd week-5/worker
cp .env.example .env     # then fill in SUPABASE_URL and SUPABASE_SECRET_KEY
npm install
npm start
```

it logs every turn:

```
[2:31:07 PM] turn 12 · Margo, 78 (anthropic/claude-4.5-sonnet) · 6 strokes, 74 points, answered in 11.2s · "I trace a winding shoreline path…"
```

`ctrl+c` stops it. the turn in progress is closed out the next time any worker starts.

### keeping it running (droplet / raspberry pi)

on a pi, use 64-bit raspberry pi os. clone the repo, do the steps above, then either:

**pm2** (simplest):

```sh
npm install -g pm2
cd week-5/worker && pm2 start npm --name cursors -- start
pm2 save && pm2 startup     # follow the printed command so it survives reboots
pm2 logs cursors
```

**or systemd**: `/etc/systemd/system/cursors.service`:

```ini
[Unit]
Description=exquisite cursors worker
After=network-online.target

[Service]
WorkingDirectory=/home/YOU/sm_git-repo/week-5/worker
ExecStart=/usr/bin/node --env-file=.env worker.js
Restart=always
RestartSec=10
User=YOU

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl enable --now cursors
journalctl -u cursors -f
```

run only one worker at a time. a second one will just wait politely, but there's no point.

## tweaking

- personas, colors, model per persona, turn order → `shared/personas.js`
- adding a model → `worker/models.js` (image field name from `https://replicate.com/<model>/api/schema`).
  it must answer in under 60s, the proxy's limit.
- what the models are told → `worker/prompt.js`
- turn length → `TURN_SECONDS` in `worker/.env`; other timings at the top of `worker/worker.js`

## daily reset

run `supabase/days.sql` once (after `schema.sql` and `hardening.sql`). at midnight new york time (`shared/day.js`)
the worker saves the finished drawing as `snapshots/day-YYYY-MM-DD.png`, adds a row to `days`, deletes that day's
turns + strokes, and forgets the drawing and the models' intents. titles are kept. open pages clear themselves.

## starting over

sql editor:

```sql
truncate table public.titles, public.strokes, public.turns, public.days restart identity;
```

then empty the `snapshots` bucket under storage.
