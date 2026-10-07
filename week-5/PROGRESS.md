# week-5 progress log

read this first when picking the project back up. design → [ARCHITECTURE.md](ARCHITECTURE.md),
setup → [README.md](README.md), proxy reference → [../assets/replicate-proxy.md](../assets/replicate-proxy.md).

---

## status as of 2026-10-06 (end of session 1)

**first full version written, not yet run for real.** all code exists. the drawing pipeline and the
worker's turn loop are tested. the browser page has never been opened, and nothing has touched a
real supabase project yet.

### the brief (from arjun, in their words, condensed)

- a webpage where different ai models are each given a human persona (age, desires, etc.), as
  descriptive as possible. 5 personas, one model each.
- the models take turns completing one picture. it's unending: there's always something to add.
- looks like figma/figjam multiplayer: each model has a colored mouse cursor. all cursors sit
  down on a panel; every minute one goes up onto the canvas and draws, continuing the previous
  drawing through its own personality. after its minute it goes back down and the next goes up.
  live, all the time.
- canvas is not infinite or zoomable. left 3/4 of the screen is drawing, right 1/4 is a panel
  that is always visible and can't be collapsed.
- visitors can at any time enter their name + a title for the drawing. the right panel shows the
  titles over time: title, name, time + how long ago, and a snapshot that expands/collapses.
- all strokes black. supabase for the database. plain html/css/js.
- the worker can run on arjun's laptop, a digitalocean droplet, or a raspberry pi on their study
  floor. class said the proxy is unlimited without an auth token for text and image.

### done

- [x] `assets/replicate-proxy.md`: proxy reference + verified findings (60s limit, vision llm fields)
- [x] tested which vision llms work through the proxy and how they reply (see proxy reference)
- [x] `shared/draw.js`: 1200×750 logical canvas, catmull-rom smoothing, shared cursor timeline
- [x] `shared/personas.js`: 5 detailed personas (margo 78, dev 9, tomasz 41, rae 26, noor 17)
- [x] `worker/`: turn loop with thinking-ahead, tolerant reply parser, per-model config
- [x] `supabase/schema.sql`: turns / strokes / titles, rls, realtime, `snapshots` bucket
- [x] `index.html`, `style.css`, `app.js`: stage + dock + cursors + titles panel + snapshots
- [x] `ARCHITECTURE.md` (for arjun to edit) and `README.md` (setup)

### verified

- 10 real turns through the proxy with the real prompt + personas → strokes parsed every time,
  drawing builds coherently (island → monster → lamp/bench → birds/paper plane), personas read as
  distinct.
- the real `worker/worker.js` ran against an in-memory fake supabase + fake model latencies (12s
  turns): turn sequence, 3s thinking beat, thinking-ahead, retry, skip-after-2-failures, intent
  history all correct.
- every js file passes `node --check`.

### not verified yet (expect some first-run fixes)

- the page in a browser: layout, cursor glide dock ↔ frame, live stroke animation, dock hover cards,
  titles list expand/collapse, relative times.
- anything against real supabase: schema runs cleanly, rls policies, realtime events arriving,
  snapshot upload to storage (anon insert policy), `select('*', { count: 'exact' })`.
- `npm install` of the worker on the droplet / pi (`@napi-rs/canvas` native binary on arm).

---

## status as of 2026-10-07 (end of session 2)

**the worker is live on the digitalocean droplet under pm2.** the page has not been checked in a browser
by claude (claude doesn't run servers), so the csp and the offline banner still need a real look.

### done this session

- [x] supabase project set up; `config.js` has the real url (bare project url, no `/rest/v1/`) + publishable key.
- [x] `worker/.env` created locally (gitignored). `worker/.env.local` holds the db password (gitignored via `worker/.gitignore`; nothing reads it).
- [x] new copy: page `<title>` and panel heading/description are now "humans & machines try to find meaning till infinity" + arjun's description.
- [x] **offline state**: 20s after the last turn ends the status pill says "system offline", a banner explains it (with time of last activity), the dock dims. clears itself when the worker returns.
- [x] **hardening**: csp + no-referrer meta in `index.html`; `supabase-js` pinned to 2.117.2 in `app.js`; new `supabase/hardening.sql` (titles insert restricted to own-bucket png url / real persona id / existing turn; snapshot upload names restricted; browsers can't write turns/strokes). arjun chose **not** to add a title rate limit.
- [x] git history checked: no secrets ever committed.
- [x] droplet: node upgraded 18 → 22+, repo cloned, `npm install`, `.env` written, `npm start` worked, `pm2 start` + `pm2 save` done (process `cursors`, online, ~66mb).

### still to check / do

1. **run `supabase/hardening.sql`** in the sql editor (after `schema.sql`) if not done yet.
2. confirm `pm2 startup` really took: `systemctl status pm2-non-root | head -5`, ideally a `sudo reboot` test then `pm2 status`.
3. firewall on the droplet: `sudo ufw allow OpenSSH && sudo ufw enable` (test a second ssh login first).
4. optional: `pm2 install pm2-logrotate`.
5. open the page in a browser (serve `week-5/` yourself), watch the console for csp errors, then title a drawing and check the snapshot upload still passes the new storage policy.
6. test the offline banner: `pm2 stop cursors`, wait ~20s, look at the page, then `pm2 start cursors`.
7. commit (arjun commits themselves; leave `assets/` out unless wanted), turn on github pages (branch main, root; page lives at `.../week-5/`).
8. only one worker at a time: don't run `npm start` on the laptop while the droplet runs.

### droplet cheatsheet

- logs: `pm2 logs cursors --lines 50` (stream) or `--nostream`; files in `~/.pm2/logs/`.
- stop / start: `pm2 stop cursors` / `pm2 start cursors`. a powered-off droplet still bills; only destroying it stops billing.
- update code: `cd ~/sm_git-repo && git pull && pm2 restart cursors`.
- the droplet's `.env` (secret key) lives only there; never paste it in chat or commit it.

---

## status as of 2026-10-07 (session 3): daily reset

the proxy caps each ip at 500 calls, so the droplet worker was stopped (`pm2 stop cursors`); run the worker locally for now.

- [x] **daily reset, written but not run.** at midnight new york time the worker saves the day's drawing to `snapshots/day-YYYY-MM-DD.png`, inserts a `days` row, deletes all turns + strokes, clears its stroke + intent history, and the first persona starts the blank canvas. pages clear on the `days` insert.
- [x] panel: "today's titles" (form + list), then "past days" (thumbnail + that day's titles, expands). a title belongs to today's list until its day is saved.
- [x] description mentions the reset; the whole page is lowercase (`text-transform` on body).
- [x] new: `shared/day.js`, `supabase/days.sql`.
- **to do:** run `supabase/days.sql`; clear the old messy canvas first (`delete from public.strokes; delete from public.turns;`) or the worker will archive it as a day on first start; then `cd worker && npm start`, and test the rollover without waiting (temporarily change `TIMEZONE`, or insert a fake old turn).
- **the 500 cap:** 60s turns is ~1,440 calls/day. `TURN_SECONDS=180` is ~480/day.

---

## decisions made (and why)

| decision | why |
|---|---|
| models return stroke **coordinates as json**, not images | a cursor has to trace real lines; tracing an image back into strokes would be lossy and slow |
| drawers are **vision llms** via the itp/ima proxy, no auth token | they can see the canvas png and reason about where to go next; token not needed |
| fixed **1200×750 (16:10)** logical canvas, scaled to fit the left 3/4 | every viewer and every model must share one coordinate space, so the canvas can't be literally viewport-shaped |
| **worker is the only writer**; browsers only animate | runs 24/7 regardless of viewers; no browser ever calls a model |
| cursor position = pure function of (strokes, draw window, clock) | everyone, including late arrivals, sees the same cursor at the same moment, with no streaming |
| worker **thinks one turn ahead** | proxy hard-limits calls at 60s and some models take ~36s; this gives every turn ~53s of drawing |
| rae uses `google/gemini-3-flash`, not gemini-3-pro | gemini-3-pro / 3.1-pro exceed the proxy's 60s limit (502) |
| regex-based reply parser instead of `JSON.parse` | gpt models drop brackets, gemini adds ```json fences |
| snapshot re-rendered from stroke data at full 1200×750 | crisp and identical regardless of the viewer's screen; includes the half-drawn stroke |
| no framework, es modules, week-3 code style | arjun's preference; nothing here needs a build step |

---

## next steps (in order)

1. **arjun:** create the supabase project (or reuse week-4's) → run `supabase/schema.sql` → put
   url + publishable key in `config.js` → secret key in `worker/.env`.
2. **arjun:** `cd week-5/worker && npm install && npm start`, and check the turn log lines look right.
3. **arjun:** serve `week-5/` (live server / `npx serve .`) and open the page. (claude doesn't run
   servers.) report what looks broken: console errors, layout, cursor behavior.
4. fix whatever the first real run shows.
5. title the drawing a few times from two browsers; check that realtime + snapshots work.
6. decide the open questions at the bottom of `ARCHITECTURE.md`, especially **canvas saturation**
   (it will be mostly ink within a day).
7. deploy: page on github pages, worker on the droplet or pi (pm2/systemd steps in README).

## ideas parked for later

- per-persona memory ("what i drew last time and why") so they're more consistent characters
- fade old strokes / new page every n hours with an archive / white "eraser" strokes
- worker uploads a base png every n turns so page load doesn't grow forever
- gate titling behind supabase auth (week 5 is the auth week)
- show a persona's full bio on dock click

## testing notes

the session-1 test harnesses lived in a temporary scratch folder and are gone. to recreate:

- **offline pipeline test**: a node script that imports `shared/draw.js`, `shared/personas.js`,
  `worker/models.js`, `worker/prompt.js`, renders with `@napi-rs/canvas`, calls the real proxy
  for each persona in turn, and writes a png per turn.
- **worker loop test**: run `worker/worker.js` with `node --import loader.mjs`, where the loader
  (a) redirects `@supabase/supabase-js` to an in-memory fake that supports the query-builder calls
  the worker uses (`from/select/insert/update/eq/gt/lt/not/order/limit/single`), and (b) replaces
  `globalThis.fetch` with fake model replies + delays. use `TURN_SECONDS=12`. on macos, wrap it with
  `perl -e 'alarm 90; exec @ARGV' node …` since `timeout` doesn't exist.
