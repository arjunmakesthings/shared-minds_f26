// shared helpers for the node scripts: paths, polite cached fetching, text cleanup.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const root = path.join(here, "..", "..");
export const cacheDir = path.join(root, "cache");
export const dataDir = path.join(root, "data");
export const reviewDir = path.join(root, "review");

export const FROM_YEAR = 2023;
const UA = "Mozilla/5.0 (class project: itp shared minds)";

export const people = [
  { id: "donald-trump", name: "donald trump", party: "republican", wiki: "https://en.wikipedia.org/wiki/Donald_Trump", wikiquote: "Donald_Trump", oti: "Donald_Trump", ucsb: "president/donald-j-trump-2nd-term" },
  { id: "jd-vance", name: "jd vance", party: "republican", wiki: "https://en.wikipedia.org/wiki/JD_Vance", wikiquote: "JD_Vance", oti: "JD_Vance", ucsb: "other/jd-vance" },
  { id: "nikki-haley", name: "nikki haley", party: "republican", wiki: "https://en.wikipedia.org/wiki/Nikki_Haley", wikiquote: "Nikki_Haley", oti: "Nikki_Haley", ucsb: "other/nikki-haley" },
  { id: "kamala-harris", name: "kamala harris", party: "democrat", wiki: "https://en.wikipedia.org/wiki/Kamala_Harris", wikiquote: "Kamala_Harris", oti: "Kamala_Harris", ucsb: "other/kamala-harris" },
  { id: "joe-biden", name: "joe biden", party: "democrat", wiki: "https://en.wikipedia.org/wiki/Joe_Biden", wikiquote: "Joe_Biden", oti: "Joe_Biden", ucsb: "president/joseph-r-biden-jr" },
  { id: "bernie-sanders", name: "bernie sanders", party: "independent", wiki: "https://en.wikipedia.org/wiki/Bernie_Sanders", wikiquote: "Bernie_Sanders", oti: "Bernie_Sanders", ucsb: "other/bernie-sanders" },
];

export const personById = (id) => {
  const p = people.find((x) => x.id === id);
  if (!p) throw new Error(`unknown person: ${id}`);
  return p;
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// fetch once, keep the raw text on disk under cache/<key>
export async function cachedFetch(key, url, { decode = "utf-8", delay = 400 } = {}) {
  const file = path.join(cacheDir, key);
  try {
    return await fs.readFile(file, "utf-8");
  } catch {}
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const text = new TextDecoder(decode).decode(await res.arrayBuffer());
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, text);
  await sleep(delay);
  return text;
}

export async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n");
}

export async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf-8"));
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", mdash: "—", ndash: "–", hellip: "…" };

export function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

// html -> plain text; paragraph-ish tags become newlines
export function htmlToText(html) {
  return decodeEntities(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<\/?(p|br|li|div|h\d|tr)\b[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// the comparison used to verify a quote really is in its source: whitespace, curly quotes and
// dashes are ignored (norm() also ignores case, and is only used for de-duplicating); nothing else.
export function norm(s) {
  return normExact(s).toLowerCase();
}

// same, but keeps capitalisation
export function normExact(s) {
  return s
    .replace(/[​­]/g, "")
    .replace(/[‘’‛′`´]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/[–—−‐‑]/g, "-")
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim();
}

export const yearOf = (s) => {
  const m = String(s ?? "").match(/\b(?:19|20)\d{2}\b/g);
  return m ? Math.max(...m.map(Number)) : null;
};

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

// "Nov 1, 2024" / "March 26, 2025" / "5 November 2025" -> "2024-11-01"; otherwise just the year, or null
export function isoDate(s) {
  s = String(s ?? "");
  let m = s.match(/\b([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+((?:19|20)\d{2})\b/);
  let mon, day, yr;
  if (m) [, mon, day, yr] = m;
  else if ((m = s.match(/\b(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?,?\s+((?:19|20)\d{2})\b/))) [, day, mon, yr] = m;
  if (m && MONTHS[mon.toLowerCase()]) {
    return `${yr}-${String(MONTHS[mon.toLowerCase()]).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  const y = yearOf(s);
  return y ? String(y) : null;
}

export function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
