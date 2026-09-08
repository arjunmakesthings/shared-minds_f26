## what: 
made mapper — a tool to mind-map quickly with voice. it supports two basic thinking operations: think broad or think deep.

used claude, nvim & vscode. the rest of this readme is written by claude (with small edits by me). 

---

## running:

plain html/css/js, no build step, no dependencies. serve the folder with any static server (e.g. `python3 -m http.server`) and open it in chrome — the web speech api used for voice input is chrome-only, and needs the page served over `http://localhost` or `https`, not opened as a bare `file://` path.

## what you can change:

everything you'd want to tweak lives in one of two files, both loaded first so nothing else needs editing when you change a value in them.

### `commands.js` — what you say

every spoken command is a `{ phrase, description }` pair:

```js
thinkBroad: {
  phrase: 'go broad',
  description: 'branch a new node outward from the anchor'
},
```

change `phrase` to whatever you'd rather say (e.g. `'think wide'` instead of `'go broad'`) and it takes effect everywhere at once: what the speech recognizer listens for, the "mode: go broad | go deep" label top-right, and the command reference listed top-left. `description` only affects that reference list.

### `config.js` — everything else tunable

grouped into four sections:

- **`node`** — how a node box looks: font size/family, padding, height, border width, and every color (fill, selected fill, border, the anchor's highlighted border, text). `fontFamily` should match the `font-family` set in `style.css`/the google fonts `<link>` in `index.html` if you want the canvas text and the surrounding page text to look the same — they're separate because canvas text and dom text are drawn by different systems and can't share one css rule.
- **`canvas`** — background color, min/max zoom, and scroll-wheel zoom sensitivity.
- **`layout`** — where new nodes are placed and how the graph settles:
  - `branchSpacing` / `goldenAngleDegrees` — how far a brand-new node starts from its parent, and the angle between successive "go broad" siblings.
  - `rootLinkGap` vs `subLinkGap` — how far apart main branches off the central question sit, versus how tightly a deeper branch hugs its own local anchor. raise `rootLinkGap` for more breathing room between main topics; lower `subLinkGap` to pack sub-branches even tighter.
  - `repelPadding`/`repelStrength`, `edgePadding`/`edgeRepelStrength`, `edgeCrossStep`, `linkStrength` — the force-relaxation constants that keep node boxes from overlapping, keep edges from cutting through unrelated boxes, and keep edges from crossing each other. higher `*Strength` values converge faster but can feel jumpier.
  - `iterations` — how many relaxation passes run after every new node. more iterations settle a dense graph better but cost more time per node added.
  - `fitMargin` — breathing room kept around the whole graph when the camera auto-fits in dynamic view mode.
- **`voice`** — recognition language, the placeholder text shown in the transcript box before you've said anything, the ⏎ icon on the speak-mode button, and the restart/watchdog timings that keep the microphone from silently dying (see the comments in `voice.js` if you need to understand why these exist before changing them).

## file map

| file | responsibility |
| --- | --- |
| `index.html` | page structure and script load order |
| `style.css` | page chrome — layout, fonts, the top-corner toggles, the command reference |
| `config.js` | every tunable number/color (see above) |
| `commands.js` | every spoken command's phrase + description (see above) |
| `canvas.js` | the infinite pan/zoom canvas, mouse interaction (select/drag/edit/delete) |
| `node.js` | the `Node` class — its box, hit-testing, drawing |
| `view.js` | the camera (dynamic auto-fit vs. fixed) and the force-relaxation layout |
| `modes.js` | broad/deep mode state, the anchor/current node, branch/delete/navigate logic, voice command routing |
| `voice.js` | speech recognition setup and its restart/watchdog resilience |
| `command-list.js` | renders the top-left command reference from `commands.js` |
| `intro.js` | the "central question" prompt shown before speak-mode starts |
