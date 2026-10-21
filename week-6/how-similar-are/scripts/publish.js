// phase 4: publish. reads a review file you have edited (review/<a>__<b>.md), and if it says
// `approved: yes` writes data/pairs/<a>__<b>.json for the site. nothing reaches the site without this.
//
// usage: node scripts/publish.js <idA> <idB>      (one pair)
//        node scripts/publish.js --all             (every review file marked approved)

import fs from "node:fs/promises";
import path from "node:path";
import { dataDir, reviewDir, readJson, writeJson, personById } from "./lib/util.js";

const clamp = (x) => Math.min(1, Math.max(-1, x));

function parseReview(md) {
  const approved = /^approved:\s*yes\b/im.test(md);
  const sections = md.split(/^## \d+\.\s+/m).slice(1);
  const edits = new Map();
  for (const sec of sections) {
    const id = sec.split("\n")[0].trim();
    const line = (key) => sec.match(new RegExp(`^${key}:[ \\t]*(.*)$`, "mi"))?.[1].trim();
    const score = (k) => {
      const v = Number(line(`score ${k}`));
      return Number.isFinite(v) ? clamp(v) : null;
    };
    edits.set(id, {
      keep: /^yes\b/i.test(line("keep") ?? ""),
      question: line("question"),
      pole0: line("pole -1"),
      pole1: line("pole \\+1"),
      a: score("a"),
      b: score("b"),
    });
  }
  return { approved, edits };
}

async function publishPair(idA, idB) {
  const [ida, idb] = [idA, idB].sort();
  personById(ida);
  personById(idb);
  const base = path.join(reviewDir, `${ida}__${idb}`);
  const md = await fs.readFile(`${base}.md`, "utf-8").catch(() => null);
  if (md === null) return console.log(`  ${ida} & ${idb}: no review file (run compare.js first)`), false;
  const draft = await readJson(`${base}.draft.json`);
  const { approved, edits } = parseReview(md);
  if (!approved) return console.log(`  ${ida} & ${idb}: not approved yet (set "approved: yes" in the review file)`), false;

  const dims = [];
  for (const row of draft.rows) {
    const e = edits.get(row.id);
    if (!e || !e.keep || !row.a) continue; // removed, or never scored
    const a = e.a ?? row.a.score;
    const b = e.b ?? row.b.score;
    dims.push({
      id: row.id,
      question: e.question || row.question,
      poles: [e.pole0 || row.poles[0], e.pole1 || row.poles[1]],
      a: { score: a, reason: row.a.reason, quotes: row.a.quotes },
      b: { score: b, reason: row.b.reason, quotes: row.b.quotes },
      models: row.models,
      edited: a !== row.a.score || b !== row.b.score || (e.question && e.question !== row.question),
    });
  }

  const out = {
    a: ida,
    b: idb,
    approved: new Date().toISOString().slice(0, 10),
    counts: { ...draft.counts, dimensions: dims.length },
    dims,
  };
  await writeJson(path.join(dataDir, "pairs", `${ida}__${idb}.json`), out);
  console.log(`  ${ida} & ${idb}: published ${dims.length} dimensions`);
  return true;
}

async function writeIndex() {
  const files = (await fs.readdir(path.join(dataDir, "pairs")).catch(() => [])).filter((f) => /__.*\.json$/.test(f));
  await writeJson(
    path.join(dataDir, "pairs", "index.json"),
    files.map((f) => f.replace(/\.json$/, "")).sort()
  );
}

const args = process.argv.slice(2);
if (args.includes("--all")) {
  const drafts = (await fs.readdir(reviewDir).catch(() => [])).filter((f) => f.endsWith(".draft.json"));
  for (const f of drafts) {
    const [a, b] = f.replace(".draft.json", "").split("__");
    await publishPair(a, b);
  }
} else if (args.length === 2) {
  await publishPair(args[0], args[1]);
} else {
  console.log("usage: node scripts/publish.js <idA> <idB> | --all");
}
await writeIndex();
