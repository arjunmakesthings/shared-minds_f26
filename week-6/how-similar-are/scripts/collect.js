// phase 2: collection. per person: gather sources -> have an llm pull out what they said ->
// keep only quotes that appear, verbatim, in the source text. writes data/people/<id>.json.
//
// the rule: an llm never writes a quote. it only points at text we fetched, and every quote it
// returns is thrown away unless it is found in that text (see verify()).
//
// usage: node scripts/collect.js [person-id ...] [--dry]

import path from "node:path";
import { people, personById, dataDir, writeJson, norm, normExact, chunk, isoDate } from "./lib/util.js";
import { ask, parseJsonLines, liveCallCount } from "./lib/proxy.js";
import { wikiquoteQuotes, otiPassages, ucsbSpokenDocs, ucsbDocText } from "./lib/sources.js";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const ids = args.filter((a) => !a.startsWith("--"));
const targets = ids.length ? ids.map(personById) : people;

// how much of each source to read per person (keeps the whole run inside the daily call quota)
const LIMITS = { wikiquote: 60, otiPassages: 60, otiPerCall: 6, ucsbDocs: 6, ucsbChunksPerDoc: 2, ucsbChunkChars: 12_000 };

const SYSTEM =
  "you are a careful research assistant. you copy text exactly as written. you never paraphrase, " +
  "correct, shorten, translate or invent anything. you answer only in the requested format.";

function extractionPrompt(name, items) {
  return `below are numbered passages from sources about ${name}. for each passage, pick out the statements that ${name} personally said or wrote: their own words, about issues, policy, values or positions.

rules:
- copy each quote EXACTLY, character for character, from the passage. do not fix typos, do not shorten with "...", do not combine separate parts.
- only ${name}'s own words. NOT a reporter's summary, NOT another speaker's words (other speakers may be marked with initials or names; check who is talking).
- each quote must be one sentence or a few connected sentences, between 60 and 600 characters, and make sense on its own.
- at most 4 quotes per passage. if a passage has no usable quote, output nothing for it.

output one json object per line, nothing else:
{"p": <passage number>, "quote": "<exact text>", "context": "<what it was about, max 20 words>"}

passages:
${items.map((it) => `[P${it.n}] (${it.label})\n${it.text}`).join("\n\n")}`;
}

// a quote is verified only if it appears in the source text (after normalising whitespace, curly
// quotes and dashes; capitalisation must match). this one check is what makes "no invented quotes" hold.
function verify(quote, ...texts) {
  const q = normExact(quote);
  if (q.length < 40) return false;
  return texts.some((t) => normExact(t).includes(q));
}

function spread(arr, n) {
  if (arr.length <= n) return arr;
  return Array.from({ length: n }, (_, i) => arr[Math.floor((i * arr.length) / n)]);
}

async function extract(name, items, stats, mk) {
  // items: [{n, label, text, meta}]
  const reply = await ask("haiku", extractionPrompt(name, items), { system: SYSTEM, maxTokens: 3000 });
  const found = [];
  for (const r of parseJsonLines(reply)) {
    if (typeof r.quote !== "string") continue;
    stats.asked++;
    const item = items.find((it) => it.n === Number(r.p));
    // check the passage it names, and fall back to the whole batch (the model sometimes miscounts)
    const ok = item ? verify(r.quote, item.text) || verify(r.quote, ...items.map((i) => i.text)) : verify(r.quote, ...items.map((i) => i.text));
    if (!ok) {
      stats.dropped++;
      continue;
    }
    const src = item ?? items.find((it) => verify(r.quote, it.text));
    found.push(mk(src, r));
  }
  return found;
}

async function collectPerson(person) {
  console.log(`\n== ${person.id}`);
  const stats = { wikiquote: 0, ontheissues: 0, ucsb: 0, asked: 0, dropped: 0 };
  const quotes = [];

  // 1. wikiquote: finished quotes, straight off the page
  const wq = spread(
    (await wikiquoteQuotes(person)).sort((a, b) => String(b.source.date).localeCompare(String(a.source.date))),
    LIMITS.wikiquote
  );
  quotes.push(...wq);
  stats.wikiquote = wq.length;
  console.log(`  wikiquote: ${wq.length} quotes`);

  // 2. ontheissues: passages for the llm to read
  const passages = spread(await otiPassages(person), LIMITS.otiPassages);
  const otiBatches = chunk(
    passages.map((p, i) => ({
      n: i + 1,
      label: `${p.sourceTitle}, ${p.date}`,
      text: p.text.slice(0, 2500),
      meta: p,
    })),
    LIMITS.otiPerCall
  );
  console.log(`  ontheissues: ${passages.length} passages -> ${otiBatches.length} calls`);

  // 3. ucsb: a few recent transcripts, first chunks only
  const listing = spread(await ucsbSpokenDocs(person), LIMITS.ucsbDocs);
  console.log(`  ucsb: ${listing.length} documents`);

  if (dry) {
    console.log(`  (dry run) ≈ ${otiBatches.length + listing.length * LIMITS.ucsbChunksPerDoc} llm calls`);
    return null;
  }

  for (const [i, batch] of otiBatches.entries()) {
    try {
      const got = await extract(person.name, batch, stats, (item, r) => ({
        text: r.quote.trim(),
        context: String(r.context ?? "").slice(0, 200),
        via: "ontheissues",
        source: { url: item.meta.sourceUrl, title: item.meta.sourceTitle, publisher: "ontheissues.org", date: item.meta.date },
      }));
      stats.ontheissues += got.length;
      quotes.push(...got);
      process.stdout.write(`  ontheissues ${i + 1}/${otiBatches.length}: +${got.length}\r`);
    } catch (e) {
      console.warn(`\n  ontheissues batch ${i + 1} failed: ${e.message}`);
    }
  }
  console.log("");

  for (const doc of listing) {
    let text;
    try {
      text = await ucsbDocText(person, doc);
    } catch (e) {
      console.warn(`  skip ${doc.url}: ${e.message}`);
      continue;
    }
    if (text.length < 500) continue;
    // split on paragraph boundaries into ~12k char pieces, read the first few
    const pieces = [];
    let cur = "";
    for (const para of text.split("\n")) {
      if (cur.length + para.length > LIMITS.ucsbChunkChars && cur) {
        pieces.push(cur);
        cur = "";
      }
      cur += para + "\n";
    }
    if (cur.trim()) pieces.push(cur);
    for (const piece of pieces.slice(0, LIMITS.ucsbChunksPerDoc)) {
      try {
        const got = await extract(
          person.name,
          [{ n: 1, label: `${doc.title}, ${doc.date}`, text: piece, meta: doc }],
          stats,
          (item, r) => ({
            text: r.quote.trim(),
            context: String(r.context ?? "").slice(0, 200),
            via: "ucsb",
            source: { url: doc.url, title: doc.title, publisher: "the american presidency project (ucsb)", date: isoDate(doc.date) },
          })
        );
        stats.ucsb += got.length;
        quotes.push(...got);
      } catch (e) {
        console.warn(`  ucsb chunk failed (${doc.title.slice(0, 50)}): ${e.message}`);
      }
    }
    process.stdout.write(`  ucsb: ${stats.ucsb} so far\r`);
  }
  console.log("");

  // dedupe, newest first, number them
  const seen = new Set();
  const unique = quotes
    .filter((q) => {
      const k = norm(q.text).slice(0, 120);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => String(b.source.date).localeCompare(String(a.source.date)))
    .map((q, i) => ({ id: `q${i + 1}`, ...q }));

  console.log(`  kept ${unique.length} quotes; the model proposed ${stats.asked}, ${stats.dropped} dropped as not found in the source`);
  return { id: person.id, collected: new Date().toISOString().slice(0, 10), stats, quotes: unique };
}

for (const person of targets) {
  const result = await collectPerson(person);
  if (result) await writeJson(path.join(dataDir, "people", `${person.id}.json`), result);
}
if (!dry) {
  await writeJson(
    path.join(dataDir, "people.json"),
    people.map(({ id, name, party, wiki }) => ({ id, name, party, wiki }))
  );
}
console.log(`\ndone. live llm calls this run: ${liveCallCount()}`);
