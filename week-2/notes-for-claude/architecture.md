# architecture notes -- dialectic canvas

what this is: a full-viewport canvas split into vertical thirds. the center third holds a
one-shot input where a person enters a stance ("thought"). the left and right thirds are
persistent, independently-scrollable chat panes -- disagreer (left) and agreer (right) -- each
backed by anthropic/claude-opus-4.6 via the itp/ima replicate proxy, each locked into its stance
for the rest of the page load.

## files

- `index.html` / `style.css` -- structure and all visual styling (alegreya sans, black dividing
  lines drawn on canvas, message bubbles, pane titles).
- `canvas.js` -- draws the two vertical lines at 1/3 and 2/3 width, redraws on resize. has
  nothing to do with the chat feature; kept separate on purpose.
- `config.js` -- every tunable in one place: the proxy url, the model name, `max_tokens`, the
  agreer/disagreer role copy, and the prompt scaffolding (word/sentence-count targets are named
  constants, not buried in prose).
- `api.js` -- the only file that talks to the network for the ai feature. `getAuthToken()` reads
  `hidden/token.txt` and caches the *promise* (not just the value) so two near-simultaneous calls
  share one fetch instead of racing two. `callModel(systemPrompt, promptText)` is the one place
  that knows the proxy's request/response shape.
- `render.js` -- turns text into safe dom content. everything goes through `escapeHtml` before
  `innerHTML`; the only html we ever construct ourselves is the `<a>` wrapper `linkifyText` adds
  around real `https?://` urls the model returns. never trust model output enough to skip this.
- `app.js` -- state and wiring: the `panes` object (`{ left: {...}, right: {...} }` holding each
  pane's log/panel/input element), the shared `transcript` array, and the two entry points
  (`submitThought`, `submitFollowup`).

`index.html` loads `app.js` as `<script type="module">`; everything else is imported from there.
module scripts need to be served over http(s) -- won't work opened directly as a `file://` url.

## the replicate proxy contract

single endpoint: `POST https://itp-ima-replicate-proxy.web.app/api/create_n_get`, body
`{ model, input: { prompt, system_prompt, max_tokens } }`, `Authorization: Bearer <token>`.
confirmed live (see chat history for the curl tests) that claude-opus-4.6's actual input schema
on replicate is exactly `{ prompt, system_prompt, max_tokens, image?, max_image_resolution? }` --
**no `messages` or `conversation_history` field**. it is not a chat model in the api sense, just a
single completion per call. `max_tokens` has a hard floor of 1024 for this model (422 if lower);
that's a ceiling on output length, not a target, so response length is controlled entirely through
the prompt's word/sentence-count instructions in `config.js`.

the proxy call is synchronous/blocking -- it returns only after replicate's prediction has fully
completed (`create_n_get` = create + poll-until-done in one round trip). there is no token-by-token
streaming available through this endpoint. replicate's own prediction object does expose a native
SSE stream url (`urls.stream`), but hitting it directly from browser js was not attempted: it's
undocumented for this proxy, likely expects replicate's own api key rather than the itp bearer
token, and may not allow cross-origin browser requests. worth revisiting if the proxy ever exposes
a streaming variant, but treat it as unsupported for now.

`prediction.output` comes back as an array of string fragments (replicate's cog streaming-array
convention) -- `extractText()` in `api.js` joins them.

## conversation model

there's one shared `transcript` array (not per-pane) of `{ label, text }` entries: `Person`,
`disagreer`, `agreer`, and `Person (to disagreer)` / `Person (to agreer)` for follow-ups. every
follow-up request sends the *entire* transcript back as the `prompt`, followed by
`Respond as the <role>:`. this is what lets you go into the agreer pane and say "counter what the
disagreer said about x" without repeating it -- the model already saw it, because both panes'
history is flattened into one text blob every time. there is no native multi-turn support to lean
on (see above), so this manual transcript-replay is the only mechanism for context.

cost/latency note: the prompt sent on a follow-up grows with the whole conversation so far
(linearly, both in token cost and — mildly — in first-token latency). fine at the scale of a single
sitting; would need real truncation/summarization if this became a long-running conversation.

## prompt structure

every system prompt is `GUARDRAIL + ROLE_LINE[pane] + (INITIAL_STRUCTURE | CONTINUATION_STRUCTURE)`,
assembled by `buildSystemPrompt()` in `app.js`. `GUARDRAIL` is shared and sets the "this is an
educational dialectic, take a hard side, but don't build a persuasive case for actual violence /
hate / self-harm" boundary -- deliberately not optimized for "fewest refusals," see the
conversation this file doesn't capture for why.

- `INITIAL_STRUCTURE`: used once per pane, for the opening statement. forces the
  "X is definitely true. Here's why:" opening line, then one dense paragraph (evidence + a real
  citation url if applicable), then a closing line. no visible headers -- flowing prose.
- `CONTINUATION_STRUCTURE`: used for every message after that. shorter (2-5 sentences by default),
  conversational, still in-character, still allowed to cite a new url if relevant.

## known constraints worth remembering

- the auth token in `hidden/token.txt` expires roughly hourly (per the proxy's own docs) and has
  to be refreshed by hand -- there's no refresh flow built in.
- replicate/proxy quota tiers (500/day cheap models, 10/day expensive ones per the proxy docs)
  aren't documented per-model; whether claude-opus-4.6 counts as "expensive" is still unconfirmed.
- the center textbox is genuinely one-shot: once a thought is submitted it's hidden and swapped
  for static text (`#thought-display`) for the rest of that page load. a new conversation means
  reloading the page, by design.
