// the three sources. wikiquote gives finished quotes (taken straight from the page, so verified by
// construction). ontheissues and ucsb give *documents*; an llm reads those and a later step checks
// every quote it returns against the document text (see collect.js).

import { cachedFetch, htmlToText, decodeEntities, isoDate, yearOf, FROM_YEAR } from "./util.js";

// ---------- wikiquote ----------

const SKIP_HEADING = /about|external links|see also|misattributed|disputed|unsourced|references|attributed/i;

function cleanWiki(s) {
  return decodeEntities(
    s
      .replace(/<ref[\s\S]*?(<\/ref>|\/>)/gi, "")
      .replace(/\{\{[^{}]*\}\}/g, "")
      .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, "$1")
      .replace(/\[(https?:\/\/\S+)\s+([^\]]*)\]/g, "$2")
      .replace(/\[(https?:\/\/\S+)\]/g, "")
      .replace(/'{2,}/g, "")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/\s+/g, " ")
    .trim();
}

export async function wikiquoteQuotes(person) {
  const url = `https://en.wikiquote.org/w/api.php?action=parse&page=${person.wikiquote}&prop=wikitext&format=json&redirects=1`;
  const json = JSON.parse(await cachedFetch(`wikiquote/${person.id}.json`, url));
  const pageUrl = `https://en.wikiquote.org/wiki/${person.wikiquote}`;
  const lines = json.parse.wikitext["*"].split("\n");

  const stack = []; // [{level, text}]
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^(=+)\s*(.*?)\s*=+\s*$/);
    if (h) {
      const level = h[1].length;
      while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
      stack.push({ level, text: cleanWiki(h[2]) });
      continue;
    }
    if (!/^\* /.test(lines[i])) continue;
    if (stack.some((s) => SKIP_HEADING.test(s.text))) continue;

    // the sources for a quote are the `**` lines right after it
    const sourceLines = [];
    while (i + 1 < lines.length && /^\*\*/.test(lines[i + 1])) sourceLines.push(lines[++i]);

    const heading = [...stack].reverse().find((s) => yearOf(s.text));
    const year = heading ? yearOf(heading.text) : null;
    if (!year || year < FROM_YEAR) continue;

    const text = cleanWiki(lines[i - sourceLines.length].replace(/^\*\s*/, ""));
    if (text.length < 70 || text.length > 900 || !/[.!?"”]/.test(text)) continue;
    const sourceText = cleanWiki(sourceLines.map((l) => l.replace(/^\*+\s*/, "")).join("; "));
    const link = sourceLines.join(" ").match(/\[(https?:\/\/[^\s\]]+)/)?.[1];
    out.push({
      text,
      context: heading.text,
      via: "wikiquote",
      source: {
        url: link ?? pageUrl,
        title: sourceText || `wikiquote: ${heading.text}`,
        publisher: link ? "via wikiquote" : "wikiquote",
        date: isoDate(sourceText) ?? isoDate(heading.text) ?? String(year),
      },
    });
  }
  return out;
}

// ---------- ontheissues.org ----------

const OTI = "https://www.ontheissues.org";

// every passage on a topic's popup page -> {title, text, sourceTitle, sourceUrl, date}
function parseOtiPopup(html, popupUrl) {
  const out = [];
  const blocks = html.split(/<a name='\d+'><\/a>/i).slice(1);
  for (const block of blocks) {
    const title = block.match(/<h3>\s*<center>\s*([\s\S]*?)\s*<\/h3>/i)?.[1];
    const body = block.match(/<\/h3>\s*<\/center>([\s\S]*?)<center>\s*<font[^>]*>\s*Source:/i)?.[1];
    const src = block.match(/Source:([\s\S]*?)<\/center>/i)?.[1];
    if (!title || !body || !src) continue;
    const href = src.match(/href=['"]([^'"]+)['"]/i)?.[1];
    const srcText = htmlToText(src).replace(/\n/g, " ");
    const date = isoDate(srcText);
    out.push({
      title: htmlToText(title),
      text: htmlToText(body),
      sourceTitle: srcText.replace(/,?\s*[A-Za-z]{3,9}\.?\s+\d{1,2},\s*\d{4}\s*$/, "").trim(),
      sourceUrl: href ? new URL(href, popupUrl).href : popupUrl,
      date,
    });
  }
  return out;
}

export async function otiPassages(person) {
  let main;
  try {
    main = await cachedFetch(`oti/${person.id}.htm`, `${OTI}/${person.oti}.htm`, { decode: "latin1" });
  } catch {
    return [];
  }
  const rels = [...new Set([...main.matchAll(/pop_wide\('\.\.\/(\d{4}\/[^']+\.htm)'\)/g)].map((m) => m[1]))];
  const out = [];
  for (const rel of rels) {
    const popupUrl = `${OTI}/${rel}`;
    let html;
    try {
      html = await cachedFetch(`oti/${person.id}/${rel.replace("/", "_")}`, popupUrl, { decode: "latin1" });
    } catch {
      continue;
    }
    for (const p of parseOtiPopup(html, popupUrl)) {
      const y = yearOf(p.date);
      if (y && y >= FROM_YEAR && p.text.length > 120) out.push({ ...p, topic: rel.split("/")[1].replace(/\.htm$/, "").replace(/^.*?_/, "") });
    }
  }
  // most recent first
  return out.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

// ---------- ucsb american presidency project ----------

const UCSB = "https://www.presidency.ucsb.edu";
const SPOKEN = /\b(remarks|address|interview|debate|speech|exchange with reporters|news conference|press conference|rally|town hall|conversation)\b/i;
const NOT_SPOKEN = /pool report|proclamation|executive order|message|letter|memorandum|press release|fact sheet|press secretary|nomination|appointment|designation|advisory|schedule|readout|announces|background/i;

// listing pages are oldest-first, so walk backward from the last page (the probe already cached these)
export async function ucsbSpokenDocs(person, { maxPages = 40, want = 40 } = {}) {
  if (!person.ucsb) return [];
  const base = `${UCSB}/people/${person.ucsb}`;
  const first = await cachedFetch(`ucsb/${person.id}/page-0.html`, base);
  const last = Math.max(0, ...[...first.matchAll(/page=(\d+)/g)].map((m) => Number(m[1])));
  const docs = [];
  for (let n = last, fetched = 0; n >= 0 && fetched < maxPages; n--, fetched++) {
    const html = n === 0 ? first : await cachedFetch(`ucsb/${person.id}/page-${n}.html`, `${base}?page=${n}`);
    const rows = [
      ...html.matchAll(/content="(\d{4}-\d\d-\d\d)T[^"]*" class="date-display-single"[\s\S]*?<a href="(\/documents\/[^"]+)">([^<]+)<\/a>/g),
    ];
    let old = 0;
    for (const [, date, href, rawTitle] of rows) {
      if (Number(date.slice(0, 4)) < FROM_YEAR) {
        old++;
        continue;
      }
      const title = decodeEntities(rawTitle);
      if (SPOKEN.test(title) && !NOT_SPOKEN.test(title)) docs.push({ date, title, url: UCSB + href });
    }
    if (rows.length && old === rows.length) break;
    if (docs.length >= want) break;
  }
  return docs.sort((a, b) => b.date.localeCompare(a.date));
}

export async function ucsbDocText(person, doc) {
  const slug = doc.url.split("/documents/")[1];
  const html = await cachedFetch(`ucsb/${person.id}/doc-${slug}.html`, doc.url);
  const body = html.match(/<div class="field-docs-content">([\s\S]*?)<\/div>\s*(?:<div class="field-docs-|<\/div>|<footer)/i)?.[1] ?? html.match(/<div class="field-docs-content">([\s\S]*)/i)?.[1];
  return body ? htmlToText(body) : "";
}
