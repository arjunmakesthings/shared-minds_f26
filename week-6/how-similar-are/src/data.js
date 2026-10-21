// loads the published json (see scripts/publish.js) and orients a pair so that "p" is the person
// picked first and "q" the second, whatever order the files use (they are sorted by id).

const base = new URL("../data/", import.meta.url);

async function getJson(rel) {
  const res = await fetch(new URL(rel, base));
  if (!res.ok) throw new Error(`${res.status} ${rel}`);
  return res.json();
}

export const loadPeople = () => getJson("people.json");

export async function loadPairIndex() {
  try {
    return await getJson("pairs/index.json");
  } catch {
    return [];
  }
}

export const pairKey = (x, y) => [x, y].sort().join("__");

export async function loadPair(firstId, secondId, people) {
  const key = pairKey(firstId, secondId);
  const [pair, qa, qb] = await Promise.all([
    getJson(`pairs/${key}.json`),
    getJson(`people/${pair_a(key)}.json`),
    getJson(`people/${pair_b(key)}.json`),
  ]);
  const quotesById = new Map();
  quotesById.set(pair.a, new Map(qa.quotes.map((q) => [q.id, q])));
  quotesById.set(pair.b, new Map(qb.quotes.map((q) => [q.id, q])));

  const byId = new Map(people.map((p) => [p.id, p]));
  const swap = pair.a !== firstId; // the file's "a" is not the person picked first
  const [pk, qk] = swap ? ["b", "a"] : ["a", "b"];
  return {
    p: byId.get(firstId),
    q: byId.get(secondId),
    counts: pair.counts,
    approved: pair.approved,
    dims: pair.dims.map((d) => ({
      id: d.id,
      question: d.question,
      poles: d.poles,
      models: {
        sonnet: { p: d.models.sonnet[pk], q: d.models.sonnet[qk] },
        gpt5: { p: d.models.gpt5[pk], q: d.models.gpt5[qk] },
      },
      edited: d.edited,
      p: { ...d[pk], quotes: d[pk].quotes.map((id) => quotesById.get(firstId).get(id)).filter(Boolean) },
      q: { ...d[qk], quotes: d[qk].quotes.map((id) => quotesById.get(secondId).get(id)).filter(Boolean) },
    })),
    quoteCounts: { p: quotesById.get(firstId).size, q: quotesById.get(secondId).size },
  };
}

const pair_a = (key) => key.split("__")[0];
const pair_b = (key) => key.split("__")[1];
