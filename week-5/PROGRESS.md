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
