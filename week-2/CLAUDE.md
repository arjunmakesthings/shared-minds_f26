# shared minds -- week 2 project context

read this first if you're picking up this project fresh. it's a running log of what's been built
and decided so far, so you can continue without re-deriving everything from the diff history.

## what this is

a small webpage: a full-viewport canvas split into vertical thirds by two black lines. the center
third holds a one-shot text input where a person types a "thought" (a stance on something). the
left and right thirds are persistent chat panes, each backed by an LLM taking a fixed, opposing
side of that thought -- left = disagreer, right = agreer -- so the person can dialectically
stress-test their own opinion by talking to both.

## current state

fully working. three-pane layout, live model calls through the itp/ima replicate proxy, shared
conversation context across both panes, styled with alegreya sans. nothing is known-broken as of
this save. see `notes-for-claude/architecture.md` for the full technical breakdown (file
responsibilities, the replicate proxy's confirmed api contract, prompt structure, conversation
model) -- this file is the higher-level "what and why," that file is the "how."

## file map

- `index.html`, `style.css` -- structure and all visual styling
- `config.js`, `api.js`, `render.js`, `canvas.js`, `app.js` -- js modules (loaded via
  `<script type="module" src="app.js">`, which imports the rest)
- `hidden/token.txt` -- gitignored auth token, no longer used by any api call (see "auth" under
  known decisions below). left in place, untracked, in case auth is reinstated later.
- `notes-for-claude/` -- claude's own reference notes: this file, `architecture.md` (technical
  deep-dive), and `replicate-proxy-notes.md` (general proxy usage notes from before this feature
  existed).

## key decisions made so far

- three vertical thirds, drawn on canvas as black lines -- explicitly "for now," may change later.
- center input is one-shot: submitting hides it and swaps in static text (`#thought-display`) for
  the rest of the page load. no reset without reloading the page -- confirmed intentional.
- the center thought's opacity fades as the person sends follow-ups to either pane (dissolving
  toward `THOUGHT_MIN_OPACITY`, never fully to zero) -- meant to visually represent the original
  opinion softening under scrutiny. tunable in `config.js`.
- **left pane = disagreer (oppose), right pane = agreer (reaffirm)** -- this mapping was
  deliberately confirmed with the user via an explicit either/or question; don't assume the more
  "intuitive" left=agree pairing.
- **auth removed (2026-09-15)**: the proxy's own docs say authentication is optional
  ("you do not need to authenticate and it is a bit of a pain so you should probably skip this"),
  so the token/`Authorization` header was stripped from `api.js`, `config.js`, and `app.js` so the
  page works for anyone on the web with no login step. tradeoff: unauthenticated calls fall under
  the proxy's vague "a few creations" free tier instead of the 500/day authenticated quota, and
  that free tier is likely a shared pool across all of itp's anonymous traffic, not per-visitor --
  so this page may start failing under real public load. `hidden/token.txt` and the reading code
  pattern in `notes-for-claude/replicate-proxy-notes.md` are kept around specifically so this is
  easy to revert if unauthenticated calls turn out to be too limited.
- model: `anthropic/claude-opus-4.6` via the replicate proxy, picked specifically for
  argumentative strength -- the user asked about picking a model with "the least guardrails" for
  this, and the resolution was: pick for strength, not for fewest refusals, and instead add an
  explicit guardrail (below) since this is a public page with no human moderation in the loop.
- guardrail baked into every system prompt: argue any genuine debate topic hard and in full
  character, but do not construct a persuasive case for something genuinely violent, hateful
  toward a real person/group, or self-harm-promoting.
- responses: fully lowercase (except literal code, if any), no headers/markdown except exactly one
  `**highlighted**` core sentence per response, real citation urls only (model is told to name the
  source instead of fabricating a url it isn't sure of -- llms hallucinate urls readily).
- one shared `transcript` array across both panes (not two independent histories), replayed into
  the `prompt` on every follow-up -- this is what lets you ask the agreer pane to counter something
  the disagreer said without repeating it yourself. the model on this proxy has no native
  multi-turn/`messages` field, so this manual replay is the only way to give it conversation memory.
- chat bubbles: capped at 80% width, "you" bubbles pushed right via `margin-left: auto` and shaded
  slightly darker, bot bubbles left-aligned and lighter, no sender name labels (alignment + shade
  differentiate sender, per explicit request to drop the labels).
- font: alegreya sans, loaded via google fonts.

## known constraints

- no auth token is sent anymore -- if requests start failing broadly, check whether the
  unauthenticated quota got hit rather than looking for a stale token.
- replicate/proxy quota tier for this specific model (cheap vs. expensive, 500/day vs 10/day per
  the proxy's own docs) has never been confirmed.
- no token streaming -- the proxy's `create_n_get` endpoint blocks until the full completion is
  done. investigated hitting replicate's native stream url directly and deliberately did not
  build it (different auth than our proxy token, undocumented, likely CORS-blocked).
- module scripts (`type="module"`) require being served over http(s) -- won't work opened as a
  bare `file://` url. the user runs their own local server; don't try to start one.

## working conventions with this user

- default to lowercase in all chat replies (global preference outside this project too).
- always ask before taking a file-system action.
- never start or run a dev/local server -- the user always runs it themselves.
- confirm ambiguous ui/architecture calls before implementing rather than guessing, especially
  anything involving left/right mapping, alignment, or naming -- this session needed several rounds
  of clarifying questions and re-confirmations on exactly that kind of thing.

## open items

- watch whether the unauthenticated quota is actually enough for real public traffic -- if it
  isn't, reinstating the token flow (`getAuthToken()` in `api.js`, `TOKEN_PATH` in `config.js`) is
  the fix; the user has said they may want to go back to it.
- the black-line-only canvas styling was flagged early on as temporary ("for now"), so a broader
  visual/color pass is a plausible next ask, but nothing has been requested yet.
