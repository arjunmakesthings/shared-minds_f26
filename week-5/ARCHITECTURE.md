# exquisite cursors — architecture

> working title (a nod to the surrealists' *exquisite corpse*). rename it in `index.html`.
> this doc is meant to be edited: change the design here first, then the code.

## the idea

five ai models, each wearing a detailed human persona (age, history, desires, fears, drawing habits),
take turns adding to one black-ink line drawing that never ends. one minute each, forever. the page
looks like a figma file: a white frame on a grey canvas, a dock of colored multiplayer cursors at the
bottom, and a properties-style panel on the right.

every minute one cursor rises from the dock, "thinks", draws its strokes live, then sinks back down
and the next one rises. anyone watching can give the drawing a title. the right panel collects those
titles with a snapshot of the drawing at that moment, so you can read how people's interpretations
drift as the picture evolves.

## the pieces

```
 ┌───────────────────────── worker (node, always on: laptop / droplet / pi) ───────────────────────┐
 │  every ~60s:  render canvas → png ──► itp/ima proxy ──► replicate model (persona prompt)        │
 │               ◄── {"intent", "strokes":[{width, points}]} ── parse ── write turn + strokes        │
 └───────────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                                 │ secret key (bypasses rls)
                                                 ▼
 ┌────────────────────────────────────── supabase ─────────────────────────────────────────────────┐
 │  turns    strokes    titles        storage: snapshots/ (png)        realtime on all three tables │
 └───────────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                                 │ publishable key: read everything, insert titles only
                                                 ▼
 ┌──────────────────────────────────── browser (index.html + app.js) ──────────────────────────────┐
 │  loads all strokes → draws them → animates the active cursor along the current turn's strokes    │
 │  title form → snapshot png to storage → titles row → realtime → every open page                 │
 └──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **the worker is the only writer of the drawing.** browsers never call models, so the page works
  with any number of viewers (including zero) and nobody's tab has to stay open.
- **browsers only animate.** a turn's strokes are fully known before its cursor starts moving; the
  page replays them over the turn's drawing window.

## a turn, second by second (60s turns)

| t | worker | what viewers see |
|---|---|---|
| 0s | inserts `turns` row: `status=thinking`, `ends_at=+60s` | the persona's cursor glides up out of the dock, idles near where the last pen lifted, pill says "thinking…" |
| 3s | inserts `strokes` rows, flips turn to `drawing` with `intent`, `draw_started_at`, `draw_ends_at` | cursor starts tracing the strokes; ink appears behind it; pill shows the intent |
| 3s | **asks the next persona's model** (thinking ahead, see below) | — |
| 56s | — | last stroke finishes; cursor rests |
| 60s | sets `status=done` | cursor glides back down to its dock slot |
| 63s | next turn begins | next cursor rises |

constants live at the top of `worker/worker.js`: `TURN_SECONDS` (env), `HANDOFF_MS` 3s,
`THINK_MIN_MS` 3s, `END_PAUSE_MS` 4s, `MIN_DRAW_MS` 10s.

### thinking ahead

models take 4–40s to answer (and the proxy cuts off at 60s). if a turn had to wait for its own model,
slow models would get only a few seconds to draw. so as soon as turn *n*'s strokes are known, the
worker asks turn *n+1*'s model, with those strokes already rendered into its canvas, while turn *n*'s
cursor is still drawing. when turn *n+1* begins, its answer is usually waiting, and the cursor gets
nearly the full minute.

- the "thinking…" phase you see is a 3s beat, not real latency. when no answer is ready yet (first
  turn after starting the worker), it's real.
- a thought-ahead answer is thrown away if anything else touched the canvas in between (e.g. a second
  worker took a turn).
- if the model fails twice (proxy error, timeout, unparseable reply), the turn is **skipped**: the
  cursor rises, thinks for 3s, and goes back down. the next persona goes.

## how a model "draws"

image models can't drive a cursor, so the drawers are **vision-capable llms** that return
coordinates.

- the canvas lives in a fixed **1200 × 750 logical space** (`shared/draw.js`). the model is sent that
  exact png and answers in those pixel coordinates.
- prompt (`worker/prompt.js`) = the persona's bio + the rules of the game + the last 6 turns' intents
  ("what the others said they were doing") + format rules: 3–12 strokes, points 8–30px apart,
  width 1–8, no letters.
- reply: `{"intent": "...", "strokes": [{"width": 3, "points": [[x, y], ...]}]}`.
- models routinely return *almost*-json (gpt models drop a bracket, gemini adds ```json fences), so
  the parser doesn't `JSON.parse`; it regex-extracts each `"points"` list and the `"width"` before it.
  it also rescales 0..1 answers, clamps to the canvas, and caps at 16 strokes / 700 points.
- **all ink is black.** persona colors exist only on the cursors.
- strokes are stored sparse (as the model gave them). both the worker and the browser run them
  through the same catmull-rom spline (`densify`) so lines look hand-drawn, and the cursor traces
  exactly the line that remains.

## everyone sees the same thing

the cursor position is a pure function of `(strokes, draw_started_at, draw_ends_at, now)`
(`buildTimeline` / `penAt` in `shared/draw.js`): time is split across strokes by length, pen-up
moves between strokes are quicker and eased, and there's a small beat before each stroke. the idle
wobble while thinking is also a function of the clock. so a visitor who opens the page 30 seconds
into a turn sees the drawing half-done, with the cursor exactly where everyone else sees it.

caveat: this uses each viewer's own clock. computers are usually within a second of each other; a
badly-set clock shifts that viewer's cursor timing.

## data

`supabase/schema.sql`. three tables, one bucket:

- **turns**: `model_id` (persona id), `status` thinking → drawing → done | skipped, `intent`,
  `stroke_count`, `started_at`, `draw_started_at`, `draw_ends_at`, `ends_at`, `worker_id`.
- **strokes**: `turn_id`, `seq`, `width`, `points` (jsonb `[[x,y],…]` in logical px).
- **titles**: `name` (≤40), `title` (≤120), `snapshot_url`, `turn_id` + `model_id` (what was
  happening when it was titled), `created_at`.
- **storage `snapshots/`**: public pngs, 1200 × 750, ≤2mb, upload-only (no overwrite/delete).

row level security: browsers can read everything and insert titles + snapshots, nothing else. the
worker uses the secret key and bypasses rls.

## the page

- **layout**: 3/4 stage, 1/4 panel (panel min 300px; on phones it stacks under the stage, still
  always visible). the frame keeps the 16:10 drawing ratio and is scaled to fit the stage. it can't be
  literally viewport-shaped because every viewer and the models must share one coordinate space.
- **frame label**: the most recent title given + who gave it, like a figma frame name, plus the
  turn number.
- **status chip** (top left): who's thinking/drawing + countdown, "next up", or "paused" when the
  worker has been silent for 30s.
- **dock**: five slots (name, age, model). hovering shows the persona's tagline. the active slot
  shows a dashed outline where its cursor left from.
- **cursors**: figma-style arrows in persona colors with a name pill (the "cursor chat" shows
  "thinking…" and then the intent). they glide between the dock and the frame.
- **titles panel**: name + title form (your name is remembered in this browser). list is newest first;
  each row shows the title, name, relative time ("12 min ago", live-updating) and absolute time;
  clicking expands the snapshot (loaded only when first opened) with the turn and whose turn it was.
- **snapshot** = the drawing exactly as it looked when the button was pressed, re-rendered at full
  1200 × 750 from stroke data (including a half-drawn stroke), not a screenshot of the viewer's
  scaled canvas.

## personas × models

defined in `shared/personas.js` (bio, colors, model) and `worker/models.js` (how to call each model).
turn order = array order.

| persona | who | drawing habits | model | measured answer time |
|---|---|---|---|---|
| margo, 78 | retired cartographer, gothenburg | thin precise coastlines, contours, roads that connect | `anthropic/claude-4.5-sonnet` | ~10–15s |
| dev, 9 | third grader, jersey city | thick wobbly monsters, trains, explosions, eyes | `google/gemini-2.5-flash` | ~20s |
| tomasz, 41 | night-shift icu nurse, chicago | roofs, lit windows, hands, repairs, shelter | `openai/gpt-5` | ~10–22s |
| rae, 26 | tattoo apprentice, mexico city | bold single lines, impossible architecture, subversion | `google/gemini-3-flash` | ~36s |
| noor, 17 | high school senior, dearborn | birds, kites, rockets, sky, ways up and out | `openai/gpt-4.1` | ~4s |

tested and rejected: `google/gemini-3-pro` and `gemini-3.1-pro` take longer than the proxy's 60s
limit (502). spares that work: `anthropic/claude-4.5-haiku`, `openai/gpt-5-mini`.

## files

```
week-5/
  index.html, style.css, app.js   the page
  config.js                       supabase url + publishable key (public by design)
  shared/draw.js                  logical canvas, spline, rendering, cursor timeline (browser + worker)
  shared/personas.js              the five personas
  worker/worker.js                the turn loop
  worker/prompt.js                prompt + tolerant reply parser
  worker/models.js                proxy url + per-model image field / params
  worker/.env.example             copy to .env (gitignored): supabase url + secret key
  supabase/schema.sql             tables, rls, realtime, storage bucket
```

## open questions / known limits

edit these as you decide.

1. **the canvas will fill up.** ~60 turns/hour × ~8 strokes = thousands of lines a day; by evening
   it'll be mostly ink. options: let it (that's the piece), fade older strokes over time, start a new
   page every n hours and keep the old ones as an archive, let personas draw white "eraser" strokes,
   or tell the models explicitly to find empty space as it gets crowded.
2. **page load grows.** every visitor loads every stroke. fine for a few days (~10k rows/day). past
   that, have the worker upload a "base" png every n turns and only load strokes after it.
3. **proxy usage.** ~1,440 calls/day. the proxy docs mention per-day limits; class said it's
   unlimited for text/image. if it starts refusing, turns get skipped (the page keeps working);
   lengthen `TURN_SECONDS` to reduce calls.
4. **titles are open to anyone.** no login, no moderation. week 5 is the auth week; titling could be
   gated behind supabase auth (or nyu google login) if needed.
5. **one worker at a time.** a second copy waits instead of colliding, but don't run two on purpose.
6. **personas stay fixed.** they don't remember their own past turns beyond the shared 6-turn
   intent history. a per-persona memory ("what i drew last time and why") would make them more
   consistent characters.
