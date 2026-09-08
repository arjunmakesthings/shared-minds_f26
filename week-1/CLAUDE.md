# mapper — project notes for claude

a voice-driven mind-mapping tool. plain html/css/js, no frameworks, no build step, no dependencies. speech recognition via the web speech api (chrome-only). see `README.md` for the file map and what's user-tunable (`config.js`, `commands.js`).

## how the interaction model works

- the app starts with a full-screen prompt (`intro.js`) asking for the **central question**, typed directly (no input element — keydown is captured on `window` and rendered into `#intro-text` with a blinking cursor placeholder). enter submits it, creates the root node, and auto-starts speak-mode.
- once running: the bottom bar (`#keyboard`) shows live speech transcription and a speak-mode toggle button (click or press enter). every *finalized* utterance is checked against `commands.js`'s phrases (`handleVoiceCommand` in `modes.js`); if it doesn't match a command, it becomes a new node (`addBranchNode`).
- **anchor node** vs **current node** (state lives in `modes.js`): the anchor is where new branches stem from and is shown with a blue border; current is simply the last node touched. clicking a node with the mouse sets both. most navigation commands (go back/forward, change node) move both together.
- **modes**: "go broad" fans new nodes out from the anchor at increasing golden-angle increments; "go deep" chains new nodes in a straight line continuing the anchor's own angle from *its* parent, and — unlike broad — auto-advances the anchor to each new node as it's created.
- **layout** (`view.js`): after every graph change, `resolveLayout()` runs an iterative force relaxation — node/node repulsion (exact rectangle overlap), node/edge repulsion (keeps lines off unrelated boxes), edge/edge crossing avoidance, and parent-child springs. link distance is tiered: edges straight off the root use `rootLinkGap` (spaced apart, distinct topics), everything deeper uses `subLinkGap` (tight, reads as one cluster). the root node is always pinned in place.
- **camera** (`view.js`): "dynamic" mode auto-fits/centers on the root after every change; "fixed" mode (auto-triggered by manual pan/zoom, or toggled explicitly) leaves the camera alone. toggle lives top-right next to the broad/deep mode toggle.

## conventions established during this build

- **one small file per concern** — resist folding things together. current split: `config.js` (tunables), `commands.js` (voice phrases + descriptions), `canvas.js` (pan/zoom/mouse), `node.js` (`Node` class + node array), `view.js` (camera + layout physics), `modes.js` (anchor/current state, branch/delete/navigate, command routing), `voice.js` (speech recognition + its restart/watchdog resilience), `command-list.js` (renders the top-left reference from `commands.js`), `intro.js` (central-question prompt).
- no modules/bundler — everything is plain `<script>` tags in `index.html`, sharing one global scope. load order matters only for code that runs *immediately* at parse time (e.g. `resize()` is called at the end of `modes.js`, not `node.js`, specifically so `CONFIG`/`rootNode` etc. already exist); anything referenced only inside a function body resolves fine regardless of order since it's not evaluated until later.
- **all visible copy is lowercase** — this was an explicit, repeated user preference (readme prose, ui text, transcript via `text-transform: lowercase` in css). keep new text lowercase too, code identifiers excepted.
- keep the visual style plain/monochrome — white background, black text/borders, one blue accent (anchor highlight) and one grey accent (selection fill). the user has pushed back on unnecessary UI chrome more than once (e.g. rejected a modal-style intro overlay in favor of plain centered text).
- when adding a new tunable constant, put it in `config.js` (or `commands.js` if it's a spoken phrase), not inline — that's the whole point of the last refactor pass.

## known limitations / things not to re-litigate lightly

- speech recognition reliability: chrome's `continuous` mode does not reliably stay alive; `voice.js` already has a from-scratch-instance restart strategy plus a watchdog (see its comments) after several rounds of debugging a real hang. if voice stops working again, check the console for `speech recognition error:` / `watchdog:` logs before changing this code further — don't guess blind.
- the force-relaxation layout is a best-effort heuristic, not a deterministic guarantee. dense/deep graphs can still occasionally show a crossing or tight overlap; a fully deterministic fix would mean replacing the angle-based placement with a proper angular-wedge tree layout (bigger rewrite, discussed but not done).
- no automated tests; this is a small interactive tool verified by hand in-browser.

## workflow notes

- the user's global claude.md preference: always ask explicit permission before file-system actions, memory saves, etc. — this project has been built incrementally, one small change at a time, confirming direction before big steps.
- development has proceeded as a long running conversation of small, sequential feature requests — check recent conversation/commit history for the actual current feature set rather than assuming this file is exhaustive; update this file when picking up major new threads of work.
