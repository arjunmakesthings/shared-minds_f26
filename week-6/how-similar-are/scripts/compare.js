// phase 3: comparison. for a pair of people: find the topics both have spoken about (each with a
// question and two named poles), have two models place both people on each topic, and write a
// review file for you to read and correct before anything is published.
//
// usage: node scripts/compare.js <idA> <idB>      (one pair)
//        node scripts/compare.js --all             (all 15 pairs)
// output: review/<a>__<b>.md (edit this) and review/<a>__<b>.draft.json (the full data)

import fs from "node:fs/promises";
import path from "node:path";
import { people, personById, dataDir, reviewDir, readJson, writeJson, chunk } from "./lib/util.js";
import { ask, parseJsonLines, liveCallCount } from "./lib/proxy.js";

const MAX_QUOTES_PER_PERSON = 90; // quotes shown to the topic finder
const MAX_TOPICS = 20;
const BATCH = 5; // topics per stance call (keeps each call under the proxy's 60s)
const MIN_CONFIDENCE = 0.6;
const DISAGREE = 0.5;

const SYSTEM =
  "you are a careful, even-handed political analyst. you judge only from the quotes you are given, " +
  "never from outside knowledge or reputation. you answer only in the requested format.";

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const round2 = (x) => Math.round(x * 100) / 100;

function pickQuotes(quotes, n) {
  const good = quotes.filter((q) => q.text.length >= 80);
  const pool = good.length >= 15 ? good : quotes;
  if (pool.length <= n) return pool;
  return Array.from({ length: n }, (_, i) => pool[Math.floor((i * pool.length) / n)]);
}

const short = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

// ---------- 1. shared topics ----------

async function findTopics(A, B, qa, qb) {
  const prompt = `there are two people: A (${A.name}) and B (${B.name}). below are numbered quotes from each. find the topics that BOTH of them have spoken about, so that the two can be compared on each.

for each topic output one json object per line, nothing else:
{"id": "<short-kebab-slug>", "question": "<a specific yes/no-style or either/or question>", "poleA": "<the position at one end>", "poleB": "<the opposite position>", "a": ["<ids of A's quotes on it>"], "b": ["<ids of B's quotes on it>"]}

rules:
- both A and B must have at least one quote that actually speaks to the question. use 1 to 4 quote ids each. only use the ids listed below.
- the question must be specific (for example "should the federal government cut funding to elite universities like harvard?", not "education").
- poleA and poleB are concrete positions on that question, written as mirror images of each other, at most 8 words each. never use "left", "right", "liberal", "conservative", a party name or a person's name.
- no two topics may overlap. give up to ${MAX_TOPICS} topics, the best-covered ones first.

quotes from A (${A.name}):
${qa.map((q) => `[${q.id}] ${short(q.text, 380)}`).join("\n")}

quotes from B (${B.name}):
${qb.map((q) => `[${q.id}] ${short(q.text, 380)}`).join("\n")}`;

  const reply = await ask("haiku", prompt, { system: SYSTEM, maxTokens: 6000 });
  const idsA = new Set(qa.map((q) => q.id));
  const idsB = new Set(qb.map((q) => q.id));
  const seen = new Set();
  const topics = [];
  for (const t of parseJsonLines(reply)) {
    if (!t.id || !t.question || !t.poleA || !t.poleB || t.poleA === t.poleB) continue;
    const id = String(t.id).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!id || seen.has(id)) continue;
    const a = (t.a ?? []).filter((x) => idsA.has(x));
    const b = (t.b ?? []).filter((x) => idsB.has(x));
    if (!a.length || !b.length) continue; // a topic needs a real quote from each person
    seen.add(id);
    topics.push({ id, question: String(t.question), poles: [String(t.poleA), String(t.poleB)], quotesA: a.slice(0, 4), quotesB: b.slice(0, 4) });
  }
  return topics.slice(0, MAX_TOPICS);
}

// ---------- 2. stances ----------

async function scoreBatch(modelKey, A, B, batch, byIdA, byIdB) {
  const prompt = `place two people on a scale for each topic below. person A is ${A.name}. person B is ${B.name}.

for each topic: -1.0 means fully the "-1 pole", +1.0 means fully the "+1 pole", 0 means neutral, mixed or unclear. use the whole continuous range (for example -0.7, 0.35). score both people on the same scale, so their scores are comparable.

for each person give:
- score: -1.0 to 1.0
- confidence: 0.0 to 1.0. how clearly do the quotes show their stance on this exact question? use below 0.6 if the quotes only touch on it, are ambiguous, or are about a different question.
- reason: one short plain sentence
- quotes: the ids of the quotes you relied on

judge only from the quotes given. do not use outside knowledge.

output one json object per line, nothing else:
{"topic": "<id>", "a": {"score": 0.0, "confidence": 0.0, "reason": "", "quotes": ["q1"]}, "b": {"score": 0.0, "confidence": 0.0, "reason": "", "quotes": ["q2"]}}

topics:
${batch
  .map(
    (t) => `### ${t.id}
question: ${t.question}
-1 pole: ${t.poles[0]}
+1 pole: ${t.poles[1]}
A's quotes:
${t.quotesA.map((id) => `[${id}] ${short(byIdA.get(id).text, 500)}`).join("\n")}
B's quotes:
${t.quotesB.map((id) => `[${id}] ${short(byIdB.get(id).text, 500)}`).join("\n")}`
  )
  .join("\n\n")}`;

  const reply = await ask(modelKey, prompt, { system: SYSTEM, maxTokens: 4000 });
  const out = new Map();
  for (const r of parseJsonLines(reply)) {
    const ok = (p) => p && Number.isFinite(Number(p.score)) && Number.isFinite(Number(p.confidence));
    if (!r.topic || !ok(r.a) || !ok(r.b)) continue;
    const clean = (p, ids) => ({
      score: clamp(Number(p.score), -1, 1),
      confidence: clamp(Number(p.confidence), 0, 1),
      reason: String(p.reason ?? "").slice(0, 300),
      quotes: (p.quotes ?? []).filter((x) => ids.includes(x)),
    });
    const t = batch.find((x) => x.id === r.topic);
    if (t) out.set(r.topic, { a: clean(r.a, t.quotesA), b: clean(r.b, t.quotesB) });
  }
  return out;
}

async function scoreAll(modelKey, A, B, topics, byIdA, byIdB) {
  const all = new Map();
  for (const batch of chunk(topics, BATCH)) {
    try {
      for (const [k, v] of await scoreBatch(modelKey, A, B, batch, byIdA, byIdB)) all.set(k, v);
    } catch (e) {
      console.warn(`    ${modelKey} batch failed: ${e.message}`);
    }
  }
  return all;
}

// ---------- 3. combine + review file ----------

function combine(topics, sonnet, gpt5) {
  return topics.map((t) => {
    const s = sonnet.get(t.id);
    const g = gpt5.get(t.id);
    if (!s || !g) return { ...t, status: "unscored", note: `scored by ${[s && "sonnet", g && "gpt-5"].filter(Boolean).join("+") || "no model"} only` };
    const person = (k) => ({
      score: round2((s[k].score + g[k].score) / 2),
      confidence: round2(Math.min(s[k].confidence, g[k].confidence)),
      reason: s[k].reason || g[k].reason,
      quotes: [...new Set([...s[k].quotes, ...g[k].quotes])].slice(0, 3),
    });
    const a = person("a");
    const b = person("b");
    if (!a.quotes.length) a.quotes = t.quotesA.slice(0, 2);
    if (!b.quotes.length) b.quotes = t.quotesB.slice(0, 2);
    const gapA = Math.abs(s.a.score - g.a.score);
    const gapB = Math.abs(s.b.score - g.b.score);
    const flags = [];
    if (gapA > DISAGREE) flags.push(`models disagree on A by ${round2(gapA)}`);
    if (gapB > DISAGREE) flags.push(`models disagree on B by ${round2(gapB)}`);
    const clear = a.confidence >= MIN_CONFIDENCE && b.confidence >= MIN_CONFIDENCE;
    return {
      ...t,
      status: clear ? "clear" : "unclear",
      note: clear ? "" : `confidence a ${a.confidence}, b ${b.confidence} (needs ${MIN_CONFIDENCE})`,
      flags,
      a,
      b,
      models: { sonnet: { a: round2(s.a.score), b: round2(s.b.score) }, gpt5: { a: round2(g.a.score), b: round2(g.b.score) } },
    };
  });
}

const fmt = (x) => (x >= 0 ? "+" : "") + x.toFixed(2);

function reviewMarkdown(A, B, counts, rows, byIdA, byIdB) {
  const quoteLine = (q) => `- ${q.id} (${q.source.date}, ${short(q.source.title, 70)}, ${q.source.url}): "${short(q.text.replace(/\s+/g, " "), 400)}"`;
  const lines = [
    `# ${A.id} & ${B.id} — review`,
    ``,
    `approved: no`,
    ``,
    `a = ${A.name}, b = ${B.name}. ${counts.quotesA} quotes from a, ${counts.quotesB} from b, ${counts.topicsFound} shared topics found.`,
    `to review: read each topic. change \`keep:\` to yes/no, fix a score or a pole if it's wrong, then set \`approved: yes\` above and run \`node scripts/publish.js ${A.id} ${B.id}\`.`,
    `scores run from -1.00 (the "-1 pole") to +1.00 (the "+1 pole"). only edit the lines that start with keep / question / pole / score.`,
    ``,
  ];
  rows.forEach((r, i) => {
    lines.push(`## ${i + 1}. ${r.id}`);
    lines.push(`keep: ${r.status === "clear" ? "yes" : "no"}`);
    lines.push(`question: ${r.question}`);
    lines.push(`pole -1: ${r.poles[0]}`);
    lines.push(`pole +1: ${r.poles[1]}`);
    if (r.a) {
      lines.push(`score a: ${fmt(r.a.score)}`);
      lines.push(`score b: ${fmt(r.b.score)}`);
      lines.push(`models: sonnet a ${fmt(r.models.sonnet.a)} b ${fmt(r.models.sonnet.b)} · gpt-5 a ${fmt(r.models.gpt5.a)} b ${fmt(r.models.gpt5.b)} · confidence a ${r.a.confidence} b ${r.b.confidence}`);
      if (r.flags.length) lines.push(`FLAG: ${r.flags.join("; ")}`);
      if (r.note) lines.push(`note: not clear enough -> ${r.note}`);
      lines.push(`reason a: ${r.a.reason}`);
      lines.push(`reason b: ${r.b.reason}`);
    } else {
      lines.push(`score a: +0.00`);
      lines.push(`score b: +0.00`);
      lines.push(`note: ${r.note} (scores are placeholders; set them yourself if you want to keep this topic)`);
    }
    lines.push(`quotes a:`);
    (r.a?.quotes ?? r.quotesA).forEach((id) => lines.push(quoteLine(byIdA.get(id))));
    lines.push(`quotes b:`);
    (r.b?.quotes ?? r.quotesB).forEach((id) => lines.push(quoteLine(byIdB.get(id))));
    lines.push(``);
  });
  return lines.join("\n");
}

async function comparePair(idA, idB) {
  const [ida, idb] = [idA, idB].sort();
  const A = personById(ida);
  const B = personById(idb);
  console.log(`\n== ${A.id} & ${B.id}`);
  const pa = await readJson(path.join(dataDir, "people", `${A.id}.json`));
  const pb = await readJson(path.join(dataDir, "people", `${B.id}.json`));
  const byIdA = new Map(pa.quotes.map((q) => [q.id, q]));
  const byIdB = new Map(pb.quotes.map((q) => [q.id, q]));

  const topics = await findTopics(A, B, pickQuotes(pa.quotes, MAX_QUOTES_PER_PERSON), pickQuotes(pb.quotes, MAX_QUOTES_PER_PERSON));
  console.log(`  ${topics.length} shared topics`);
  if (!topics.length) console.warn("  no shared topics found");

  console.log("  scoring with sonnet…");
  const sonnet = await scoreAll("sonnet", A, B, topics, byIdA, byIdB);
  console.log("  scoring with gpt-5…");
  const gpt5 = await scoreAll("gpt5", A, B, topics, byIdA, byIdB);

  const rows = combine(topics, sonnet, gpt5);
  const counts = { quotesA: pa.quotes.length, quotesB: pb.quotes.length, topicsFound: topics.length };
  const clear = rows.filter((r) => r.status === "clear").length;
  console.log(`  ${clear} clear dimensions, ${rows.length - clear} left out, ${rows.filter((r) => r.flags?.length).length} flagged`);

  await writeJson(path.join(reviewDir, `${A.id}__${B.id}.draft.json`), { a: A.id, b: B.id, counts, rows });
  await fs.writeFile(path.join(reviewDir, `${A.id}__${B.id}.md`), reviewMarkdown(A, B, counts, rows, byIdA, byIdB));
}

const args = process.argv.slice(2);
if (args.includes("--all")) {
  for (let i = 0; i < people.length; i++)
    for (let j = i + 1; j < people.length; j++) {
      try {
        await comparePair(people[i].id, people[j].id);
      } catch (e) {
        console.warn(`  pair failed: ${e.message}`);
      }
    }
} else if (args.length === 2) {
  await comparePair(args[0], args[1]);
} else {
  console.log("usage: node scripts/compare.js <idA> <idB> | --all");
}
console.log(`\ndone. live llm calls this run: ${liveCallCount()}`);
