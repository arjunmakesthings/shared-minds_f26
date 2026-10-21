# how similar are ____ & ____ ?

pick two politicians. each is placed on the topics both have spoken about, and the distance between them
is how similar they are. the answer changes with the topics you look at. the design is in `PLAN.md`.

## run the site

es modules + three.js from a cdn, no build step. it needs a local static server, e.g.
`python3 -m http.server` in this folder, then open `index.html` from it.

## the pipeline (node 18+, no dependencies)

```
node scripts/probe.js                          # phase 1: how much each source has per person
node scripts/collect.js [person-id ...]        # phase 2: fetch, extract with an llm, verify -> data/people/<id>.json
node scripts/compare.js <idA> <idB> | --all    # phase 3: shared topics, stances from two models -> review/<a>__<b>.md
# you: read and edit review/<a>__<b>.md, then set "approved: yes"
node scripts/publish.js <idA> <idB> | --all    # phase 4: approved reviews -> data/pairs/<a>__<b>.json (+ index.json)
node tests/math.test.mjs                       # the similarity math
node tests/room-math.test.mjs                  # the n-d room shows the true distance
```

- an llm never writes a quote. it points at text that was fetched, and `collect.js` drops any quote that
  is not found, verbatim, in its source text.
- raw pages and every llm reply are cached in `cache/` (git-ignore it if you like), so re-runs are free.
- llm calls go through the itp/ima replicate proxy (`../../assets/replicate-proxy.md`). no token is
  needed; set `REPLICATE_PROXY_TOKEN` to raise the quota. it is never written to disk.
- the 2023 cutoff is `FROM_YEAR` in `scripts/lib/util.js`.

## reviewing a pair

`review/<a>__<b>.md` has one section per candidate topic: the question, the two poles (-1 and +1), both
people's scores, the models' own scores, a flag if they disagreed by more than 0.5, and the quotes (with
links). edit only the lines starting with `keep`, `question`, `pole` and `score`. topics the models weren't
confident about are listed with `keep: no`; flip one to `yes` and set the scores yourself to include it.

## files

- `app.js`, `index.html`, `style.css`: the page
- `src/`: `math.js` (similarity, star coordinates), `stage.js` (star / line / square), `cube.js` (3d for 3
  ticked topics), `sidebar.js`, `picker.js`, `loader.js`, `data.js`, `dom.js`. `room.js` + `nd.js` are an
  unused n-dimensional "room" view tried and set aside (from `../n-dimensional-space_representation-test`)
- `scripts/`: the pipeline; `scripts/lib/` holds the proxy client, source readers and helpers
- `data/`: `people.json`, `people/<id>.json` (verified quotes), `pairs/<a>__<b>.json` (published)
- `review/`: what you read and edit before publishing
