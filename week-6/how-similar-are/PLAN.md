# how similar are ____ & ____ ? — plan

working title. first written 2026-10-20; decisions locked the same day (§11). updated 2026-10-21 to match
what was built: see "status" at the end.

---

## 1. the idea in one paragraph

pick two politicians from a dropdown. we gather what each of them has actually said (direct quotes,
with sources), find the topics they've **both** spoken about, and place each person's stance on each
topic on a one-dimensional axis (e.g. *harvard's federal funding: cut it ←→ restore it*). every topic
where both take a clear stance is one dimension. each politician becomes a vector in n-dimensional
space, and the distance between the two vectors is how similar they are. by default you see them across
all n dimensions at once. a sidebar lists the dimensions, and picking 1, 2 or 3 of them re-draws the
view in just those dimensions, where the similarity can come out very differently.

the point it makes: "how similar are they?" has no single answer. it depends on which dimensions you
look at.

---

## 2. people

| name | party | wikipedia |
|---|---|---|
| donald trump | republican | https://en.wikipedia.org/wiki/Donald_Trump |
| jd vance | republican | https://en.wikipedia.org/wiki/JD_Vance |
| nikki haley | republican | https://en.wikipedia.org/wiki/Nikki_Haley |
| kamala harris | democrat | https://en.wikipedia.org/wiki/Kamala_Harris |
| joe biden | democrat | https://en.wikipedia.org/wiki/Joe_Biden |
| bernie sanders | independent | https://en.wikipedia.org/wiki/Bernie_Sanders |

6 people → **15 pairs**. links to be checked through the wikipedia api before they're used.

changed 2026-10-20 after the phase-1 probe: mamdani, desantis, rubio, cruz and mcconnell were dropped
because they have almost no quotes dated 2023 or later in our sources. caveat: sanders has only ~10
recent passages on ontheissues, so he may need an earlier cutoff (open question, see §10).

---

## 3. user flow

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│      how similar are  [ select ▾ ]  &  [ select ▾ ]   [go]   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

1. **pick.** two dropdowns list the same 6 people. each entry shows **name, party, and a wikipedia
   link**. you can't pick the same person twice. **go** is disabled until both are picked.
2. **load.** a loader that replays the real steps for that pair, with real counts, faster than they
   actually ran:
   - "reading 212 quotes from a · 187 from b"
   - "found 23 topics both have spoken about"
   - "placing stances: harvard funding ✓ · tariffs ✓ · rent control …"
3. **result.**

```
┌───────────────────────────────────────────────┬──────────────────────────┐
│  a & b are 38% similar                        │  dimensions (23)         │
│  across 23 topics                             │  sort: biggest gap ▾     │
│                                               │                          │
│             tariffs                           │  ☐ harvard funding       │
│                │        ● b                   │    cut ●──────────○ keep │
│   abortion ────○──── immigration              │  ☐ tariffs               │
│               ╱ ╲                             │    ●○────────────────    │
│          crypto  healthcare      ● a          │  ☑ rent control          │
│                                               │    ...                   │
│  [the view: star / 1-d / 2-d / 3-d]           │  (up to 3)               │
└───────────────────────────────────────────────┴──────────────────────────┘
```

   - **nothing selected (default):** star coordinates across all n dimensions (§8). still, not
     interactive. the headline is the n-dimensional similarity.
   - **1 selected:** a number line between that topic's two poles, both dots on it.
   - **2 selected:** a 2d square, one topic per axis.
   - **3 selected:** a 3d cube you can orbit.
   - **a 4th pick is refused:** with 3 selected, the other checkboxes are disabled until one is
     unticked.
   - the headline recalculates for whatever is selected.
   - every dimension in the sidebar **expands to show the evidence**: each person's quote(s) with source
     link and date, plus a one-line reason for the placement.

---

## 4. the main constraint: where the quotes come from

the replicate proxy **only runs models**. its llms can't search or browse the web, and if asked to
"recall quotes" they'll produce plausible but **made-up** ones. attributing invented quotes to real
politicians is the worst possible failure for this project. so:

> **rule: an llm never writes a quote. it only reads quotes we fetched, from a source we can link to.**

so everything is **pre-computed** by a node script, and the site just shows the results:

| part | what | where |
|---|---|---|
| **a. collection** | fetch sources → extract verbatim quotes → verify each one against its source | node script |
| **b. comparison** | for each of the 6 pairs: find shared topics → place stances → compute | node script |
| **c. review** | you read and correct the results | review file per pair (§6) |
| **d. site** | picker → loader → views; reads the published json | static site |

### sources (quotes since 2023)

| source | what it gives | access |
|---|---|---|
| **transcripts** (speeches, debates, interviews): e.g. the american presidency project (ucsb), the 2024 trump–harris and vance–walz debates | long, verbatim, on-topic statements | fetch + parse (node) |
| **ontheissues.org** | quotes already sorted by topic per politician | scrape (node), credited clearly |
| **wikiquote** | curated quotes with citations | mediawiki api |

phase 1 checks how much each source actually has for each person. first results (2023+ passages,
wikiquote / ontheissues): trump 348 / 181, vance 49 / 104, harris 41 / 140, biden 58 / 101,
haley 21 / 116, sanders 27 / 10. ucsb transcripts not probed yet. note: ontheissues passages are
not all verbatim (some are news summaries, debate passages include the opponent's lines), so the
extraction step must attribute text to the right speaker.

---

## 5. the pipeline

### a. collection (per person)

1. **fetch documents** → `{ url, title, date, publisher, text }`. keep only material dated 2023 or
   later. cache the raw text on disk so re-runs don't re-fetch.
2. **extract quotes** with **claude-4.5-haiku** (~3s per call; long transcripts are split into chunks
   to stay under the proxy's 60s limit): "list every direct quote by <name> in this text, verbatim,
   with a sentence of context."
3. **verify:** keep a quote only if it appears in the source text (after normalizing whitespace and
   curly quotes). drop everything else. this one check is what makes the "no invented quotes" rule hold.
4. write `data/people/<id>.json`.

### b. comparison (per pair)

1. **find shared topics.** the model groups both people's quotes by topic and returns the topics they
   *both* spoke on. each topic gets a specific question and **two named poles** that are positions on
   that question (never "left/right" or a party, and mirror images of each other), plus the ids of the
   quotes it's based on.
2. **place stances.** **claude-4.5-sonnet** and **gpt-5** each score both people on every topic, in
   the same call (so the two are calibrated against each other): `score` from −1 (pole a) to +1 (pole
   b) on a continuous scale, `confidence` (0–1), a one-line `reason`, and the quote ids used. batch
   ~4–6 topics per call to stay under 60s.
   - the two models' scores are **averaged**.
   - if the two models disagree by more than ~0.5 on a score, the topic is **flagged** for review.
3. **keep only clear stances.** a topic becomes a dimension only if both models rate both people's
   stance as clear (confidence ≥ 0.6). everything else is left out. there is **no minimum** number of
   dimensions and no warning.
4. **robustness:** these models sometimes return broken json (see `assets/replicate-proxy.md`), so
   parse defensively (regex fallback, like `week-5/worker/prompt.js → parseReply`), and retry a call
   once on failure.

### budget

15 pairs, plus extraction for 6 people ≈ 150–300 proxy calls in total, inside one day's quota of 500
(may be split over two days).
the proxy token is read from an environment variable (`REPLICATE_PROXY_TOKEN`) and never committed. it
expires about every hour, so it's refreshed from the proxy site as needed.

---

## 6. the review step

after scoring, the script writes `review/<a>__<b>.md`: one section per topic with the axis and its
poles, both people's quotes (linked), both models' scores, the averaged score, the reasons, and any
disagreement flag. you can:
- **remove** a topic,
- **correct** a score or a pole label,
- **approve** the pair.

a second command reads the edited review files and writes the final `data/pairs/*.json` that the site
uses. nothing reaches the site without passing review.

---

## 7. data model

```js
// data/people.json
[{ "id": "kamala-harris", "name": "Kamala Harris", "party": "democrat",
   "wiki": "https://en.wikipedia.org/wiki/Kamala_Harris" }]

// data/people/<id>.json
{ "id": "kamala-harris", "collected": "2026-10-21",
  "quotes": [
    { "id": "q17", "text": "verbatim quote…", "context": "said at a rally in …",
      "source": { "url": "…", "title": "…", "publisher": "…", "date": "2024-09-10" } }
  ] }

// data/pairs/<idA>__<idB>.json  -- ids sorted, so a&b = b&a
{ "a": "…", "b": "…", "approved": "2026-10-23", "counts": { "quotesA": 212, "quotesB": 187, "topicsFound": 31 },
  "dims": [
    { "id": "higher-ed-funding", "question": "should the federal government fund elite universities like harvard?",
      "poles": ["cut or condition it", "protect or expand it"],
      "a": { "score": -0.8, "reason": "…", "quotes": ["q17"] },
      "b": { "score":  0.6, "reason": "…", "quotes": ["q4", "q9"] },
      "models": { "sonnet": { "a": -0.85, "b": 0.6 }, "gpt5": { "a": -0.75, "b": 0.6 } } }
  ] }
```

`counts` feeds the loader's real numbers.

---

## 8. the math & the views

- each stance is `s ∈ [−1, +1]`, with 0 = neutral or mixed. a person is the vector `(s₁ … sₙ)` over
  the n dimensions of that pair. every dimension counts equally.
- **distance:** `d = ‖a − b‖`. the biggest possible gap on one axis is 2, so the biggest possible
  distance is `2√n`.
- **headline:** `similarity = 1 − d / (2√n)` → "x% similar across n topics". 100% = identical stances,
  0% = opposite extremes on everything. with k dimensions selected, it's the same formula over those k
  (with k = 1: `1 − |aᵢ − bᵢ| / 2`).

### views

- **nothing selected: star coordinates.** every dimension is a spoke from the centre, spread evenly
  around a circle. each person's dot is the average of the spokes, each weighted by that person's
  stance: +1 pulls toward the spoke's tip, −1 the opposite way. every dimension contributes equally. the
  view is still. distances in the picture are approximate (it's a projection), so the headline always
  uses the true n-d distance.
- **1 selected:** a number line from pole to pole.
- **2 selected:** a square, one topic per axis, poles labelled.
- **3 selected:** a cube, orbitable (three.js).
- changing the selection animates the dots from one view to the next.

---

## 9. risks & how the design deals with them

| risk | handling |
|---|---|
| invented quotes | llms never write quotes; every quote is checked against its source text and linked |
| quotes out of context | store and show context + source; prefer full statements to soundbites |
| stances change over time | only material since 2023; dates shown in the evidence |
| model bias in placement | two models averaged; both people scored together; reasons shown; disagreements flagged; human review |
| axes found per pair are hard to audit | every axis and its poles pass through the review file before publishing |
| "x% similar" read as a fact | the headline always says "across n topics", and the whole design shows the answer depends on the dimensions picked |
| scraping terms | small scale, for a class project; sources credited; apis where they exist |

---

## 10. build phases

all six built 2026-10-20/21. see "status" at the end for what is true of the published data.

1. **sources check.** `scripts/probe.js`. done for wikiquote, ontheissues and ucsb.
2. **collection script.** `scripts/collect.js`: fetch → extract (haiku) → verify → `data/people/*.json`.
3. **comparison script.** `scripts/compare.js`: topics → stances (sonnet + gpt-5) → filter → review files.
4. **review + publish.** `scripts/publish.js` reads the review files and writes `data/pairs/*.json`.
5. **front end.** picker → loader → star / line / square / cube + sidebar with evidence.
6. **polish.** not done: mobile pass, failure states beyond the basics, a separate method page.

---

## 11. decisions

| area | decision |
|---|---|
| people | trump, vance, haley, harris, biden, sanders (15 pairs) |
| picker | name + party + wikipedia link; no duplicate pick |
| compute | pre-computed; the loader replays the real steps, faster |
| sources | ucsb transcripts + ontheissues.org + wikiquote, since 2023. every stance links to its quote's source page and to the source's main site |
| extraction model | claude-4.5-haiku, with verbatim verification |
| topics | found per pair, with named poles |
| stance models | claude-4.5-sonnet + gpt-5, averaged; big disagreements flagged |
| stance scale | continuous −1 to +1 |
| dimensions | only topics where both take a clear stance; all count equally; no minimum |
| review | a review file per pair is written; **in practice all 15 were approved unchanged by the assistant on the user's instruction, with no human read-through** (see status) |
| headline | `1 − d / (2√n)`, recalculated for the selection |
| default view | star coordinates, still |
| selection | up to 3; a 4th is refused until one is unticked |
| hosting | static site |
| stack | plain js + three.js, no build step; node for the scripts |

---

## status (2026-10-21)

- **people:** mamdani, desantis (and rubio, cruz, mcconnell, considered) were dropped for lack of quotes
  dated 2023+. final six: trump, vance, haley, harris, biden, sanders. sanders keeps the 2023 cutoff and
  is thin (11 quotes, 2–5 dimensions per pair); the user chose to keep him as is.
- **collected:** 11 to 221 verified quotes per person. each was checked to appear word for word (case
  sensitive, after normalising whitespace/quotes/dashes) in its source text. the check does not verify
  *who* said it, so quotes from debate/interview passages can be misattributed.
- **published:** all 15 pairs, 2 to 10 dimensions each. topics the models were not confident about
  (confidence < 0.6) are in the review files as `keep: no` and are not shown.
- **not reviewed by a person.** the user chose not to review, and asked for the site to say so. the page
  states that stances are ai readings that may be wrong, links every quote to its source, and links the
  source's main site.
- **not verified in a browser:** the front end passed syntax checks and the math tests, but has not been
  opened in a browser yet.
- **the n-d "room" was tried and set aside (2026-10-21):** the star coordinates are the default view again,
  as in §3 and §8. `src/room.js` + `src/nd.js` (a port of `../n-dimensional-space_representation-test`) and
  `tests/room-math.test.mjs` are kept but not wired in.
- **ui pass (2026-10-21):** ibm plex sans, a smaller type scale, an 8px grid; an introduction shown until a
  person is picked; the method paragraph as the footer; under every stance in the sidebar, links to the pages
  its quotes came from, and ticking a topic opens its quotes.
