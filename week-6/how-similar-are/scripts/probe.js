// phase 1: sources check. counts quotes dated 2023+ per person and per source.
// usage: node scripts/probe.js
// raw pages are cached in ../cache so re-runs don't re-fetch.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const cacheDir = path.join(here, "..", "cache");
const FROM_YEAR = 2023;
const UA = "Mozilla/5.0 (class project: itp shared minds)";

const people = [
  { id: "donald-trump", wikiquote: "Donald_Trump", oti: "Donald_Trump" },
  { id: "jd-vance", wikiquote: "JD_Vance", oti: "JD_Vance" },
  { id: "kamala-harris", wikiquote: "Kamala_Harris", oti: "Kamala_Harris" },
  { id: "bernie-sanders", wikiquote: "Bernie_Sanders", oti: "Bernie_Sanders" },
  { id: "joe-biden", wikiquote: "Joe_Biden", oti: "Joe_Biden" },
  { id: "nikki-haley", wikiquote: "Nikki_Haley", oti: "Nikki_Haley" },
];

async function cached(key, url, decode = "utf-8") {
  const file = path.join(cacheDir, key);
  try {
    return await fs.readFile(file, "utf-8");
  } catch {}
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const text = new TextDecoder(decode).decode(await res.arrayBuffer());
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, text);
  await new Promise((r) => setTimeout(r, 400)); // be polite
  return text;
}

const yearOf = (s) => {
  const m = String(s).match(/\b(19|20)\d{2}\b/g);
  return m ? Math.max(...m.map(Number)) : null;
};

// --- wikiquote: top-level bullets under a section whose heading carries a year ---
async function wikiquote(p) {
  const url = `https://en.wikiquote.org/w/api.php?action=parse&page=${p.wikiquote}&prop=wikitext&format=json&redirects=1`;
  const json = JSON.parse(await cached(`wikiquote/${p.id}.json`, url));
  const lines = json.parse.wikitext["*"].split("\n");
  let heading = "";
  let total = 0;
  let recent = 0;
  for (const line of lines) {
    const h = line.match(/^=+\s*(.*?)\s*=+\s*$/);
    if (h) {
      heading = h[1];
      continue;
    }
    if (!/^\* /.test(line)) continue; // top-level bullets only; sub-bullets are sources
    total++;
    const y = yearOf(heading);
    if (y !== null && y >= FROM_YEAR) recent++;
  }
  return { total, recent };
}

// --- ontheissues: main page lists topics; each topic has a popup page of full passages ---
async function ontheissues(p) {
  const main = await cached(
    `oti/${p.id}.htm`,
    `https://www.ontheissues.org/${p.oti}.htm`,
    "latin1"
  );
  const links = [
    ...new Set([...main.matchAll(/pop_wide\('\.\.\/(\d{4}\/[^']+\.htm)'\)/g)].map((m) => m[1])),
  ];
  let total = 0;
  let recent = 0;
  let withSource = 0;
  for (const rel of links) {
    let html;
    try {
      html = await cached(`oti/${p.id}/${rel.replace("/", "_")}`, `https://www.ontheissues.org/${rel}`, "latin1");
    } catch (e) {
      console.warn("  skip", rel, e.message);
      continue;
    }
    // each passage ends with: Source: <title>, Mon D, YYYY
    for (const m of html.matchAll(/Source:([\s\S]*?)<\/center>/g)) {
      total++;
      const src = m[1].replace(/<[^>]+>/g, " ");
      if (/\S/.test(src)) withSource++;
      const y = yearOf(src);
      if (y !== null && y >= FROM_YEAR) recent++;
    }
  }
  return { topics: links.length, total, recent, withSource };
}

// --- ucsb american presidency project: per-person document listings, oldest first ---
// walks pages backward from the end until dates drop below FROM_YEAR (capped for big archives).
// counts only titles that look like spoken/transcribed words, not proclamations or press releases.
const ucsbSlug = {
  "donald-trump": "president/donald-j-trump-2nd-term",
  "jd-vance": "other/jd-vance",
  "kamala-harris": "other/kamala-harris",
  "joe-biden": "president/joseph-r-biden-jr",
  "bernie-sanders": "other/bernie-sanders",
  "nikki-haley": "other/nikki-haley",
};
const SPOKEN = /\b(remarks|address|interview|debate|speech|exchange with reporters|news conference|press conference|rally|town hall|conversation)\b/i;
const NOT_SPOKEN = /pool report|proclamation|executive order|message|letter|memorandum|press release|fact sheet|press secretary|nomination|appointment|designation/i;
const PAGE_CAP = 40;

async function ucsb(p) {
  const slug = ucsbSlug[p.id];
  const base = `https://www.presidency.ucsb.edu/people/${slug}`;
  const first = await cached(`ucsb/${p.id}/page-0.html`, base);
  const last = Math.max(0, ...[...first.matchAll(/page=(\d+)/g)].map((m) => Number(m[1])));
  let docs = 0;
  let spoken = 0;
  let fetched = 0;
  let reachedCutoff = false;
  for (let n = last; n >= 0 && fetched < PAGE_CAP; n--) {
    const html = n === 0 ? first : await cached(`ucsb/${p.id}/page-${n}.html`, `${base}?page=${n}`);
    fetched++;
    const rows = [
      ...html.matchAll(
        /content="(\d{4})-\d\d-\d\dT[^"]*" class="date-display-single"[\s\S]*?<a href="\/documents\/[^"]+">([^<]+)<\/a>/g
      ),
    ];
    let old = 0;
    for (const [, year, title] of rows) {
      if (Number(year) < FROM_YEAR) {
        old++;
        continue;
      }
      docs++;
      if (SPOKEN.test(title) && !NOT_SPOKEN.test(title)) spoken++;
    }
    if (rows.length && old === rows.length) {
      reachedCutoff = true;
      break;
    }
  }
  return { docs, spoken, pages: fetched, complete: reachedCutoff || last + 1 <= fetched };
}

const rows = [];
for (const p of people) {
  console.log("probing", p.id);
  const w = await wikiquote(p).catch((e) => (console.warn("  wikiquote:", e.message), { total: 0, recent: 0 }));
  const o = await ontheissues(p).catch((e) => (console.warn("  ontheissues:", e.message), { topics: 0, total: 0, recent: 0 }));
  const u = ucsbSlug[p.id]
    ? await ucsb(p).catch((e) => (console.warn("  ucsb:", e.message), { docs: 0, spoken: 0, pages: 0, complete: false }))
    : { docs: 0, spoken: 0, pages: 0, complete: true };
  rows.push({
    person: p.id,
    "wikiquote all": w.total,
    "wikiquote 2023+": w.recent,
    "oti topics": o.topics,
    "oti passages": o.total,
    "oti 2023+": o.recent,
    "ucsb docs 2023+": u.docs,
    "ucsb spoken 2023+": u.spoken,
    "ucsb pages": u.pages,
    "ucsb complete": u.complete,
  });
}
console.table(rows);
console.log("ucsb counts are listing titles only (documents not fetched yet); incomplete = hit the page cap, so a lower bound");
