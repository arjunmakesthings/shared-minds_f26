// the sidebar: every dimension of the pair, with a tick box (up to 3), a mini track showing where
// each person sits between the two poles, and an expandable "evidence" section with the quotes.

import { h, clear } from "./dom.js";
import { topicLabel, sortDims, gap } from "./math.js";

const MAX_SELECTED = 3;

// where each quote was found (the main site, in case the exact page has moved)
const SITES = {
  wikiquote: { name: "wikiquote", url: "https://en.wikiquote.org" },
  ontheissues: { name: "ontheissues.org", url: "https://www.ontheissues.org" },
  ucsb: { name: "the american presidency project", url: "https://www.presidency.ucsb.edu" },
};
const fmt = (x) => (x >= 0 ? "+" : "−") + Math.abs(x).toFixed(2);
const pos = (score) => `${((score + 1) / 2) * 100}%`;

export function createSidebar(root, onChange) {
  let model = null;
  let sortBy = "biggest gap";
  let selected = []; // indices into model.dims, in the order they were ticked
  const open = new Set();

  const title = h("h2", { class: "side-title" });
  const sortSel = h(
    "select",
    { class: "side-sort", "aria-label": "sort dimensions", onchange: (e) => ((sortBy = e.target.value), renderList()) },
    ...["biggest gap", "smallest gap", "a to z"].map((o) => h("option", { value: o }, o))
  );
  const hint = h("p", { class: "side-hint" });
  const list = h("ul", { class: "dim-list" });
  root.append(h("div", { class: "side-head" }, title, h("label", { class: "side-sortlabel" }, "sort ", sortSel)), hint, list);

  function toggle(i, on) {
    if (on && selected.length >= MAX_SELECTED) return;
    selected = on ? [...selected, i] : selected.filter((x) => x !== i);
    renderList();
    onChange([...selected]);
  }

  function quoteBlock(who, name, cls) {
    const wrap = h("div", { class: `ev-person ${cls}` });
    wrap.append(
      h("div", { class: "ev-who" }, h("span", { class: "ev-dot" }), h("b", {}, name), ` ${fmt(who.score)}`),
      h("p", { class: "ev-reason" }, who.reason)
    );
    for (const q of who.quotes) {
      wrap.append(
        h(
          "blockquote",
          { class: "ev-quote" },
          h("p", {}, `“${q.text}”`),
          h(
            "footer",
            {},
            "source: ",
            h("a", { href: q.source.url, target: "_blank", rel: "noopener noreferrer" }, q.source.title),
            ` · ${q.source.date ?? "undated"} · found on `,
            // the exact page isn't always the original document, so always offer the site it came from
            h("a", { href: SITES[q.via]?.url ?? q.source.url, target: "_blank", rel: "noopener noreferrer" }, SITES[q.via]?.name ?? "the source")
          )
        )
      );
    }
    return wrap;
  }

  // one line per person under the track: their score, and links to where it came from
  function stanceLine(who, name, cls) {
    return h(
      "li",
      { class: `stance ${cls}` },
      h("span", { class: "stance-who" }, h("i"), name),
      h("span", { class: "stance-score" }, fmt(who.score)),
      h(
        "span",
        { class: "stance-src" },
        "from ",
        ...who.quotes.flatMap((q, k) => [
          k ? ", " : "",
          h("a", { href: q.source.url, target: "_blank", rel: "noopener noreferrer", title: q.source.title }, `${SITES[q.via]?.name ?? "source"}${q.source.date ? " " + q.source.date.slice(0, 7) : ""}`),
        ])
      )
    );
  }

  function item(i) {
    const d = model.dims[i];
    const on = selected.includes(i);
    const full = !on && selected.length >= MAX_SELECTED;
    const box = h("input", {
      type: "checkbox",
      checked: on,
      disabled: full,
      "aria-label": `show ${topicLabel(d)}`,
      onchange: (e) => toggle(i, e.target.checked),
    });
    const evidence = h(
      "div",
      { class: "dim-evidence" },
      h("p", { class: "ev-question" }, d.question),
      quoteBlock(d.p, model.p.name, "p"),
      quoteBlock(d.q, model.q.name, "q"),
      h(
        "p",
        { class: "ev-models" },
        `this placement is an ai model's reading of the quotes above, and may be wrong. two models placed it, then it was averaged. claude sonnet:${model.p.name} ${fmt(d.models.sonnet.p)}, ${model.q.name} ${fmt(d.models.sonnet.q)}. ` +
          `gpt-5: ${model.p.name} ${fmt(d.models.gpt5.p)}, ${model.q.name} ${fmt(d.models.gpt5.q)}. ` +
          (d.edited ? "adjusted by hand." : "")
      )
    );
    evidence.hidden = !open.has(d.id);
    const more = h(
      "button",
      {
        type: "button",
        class: "dim-more",
        "aria-expanded": String(open.has(d.id)),
        onclick: () => {
          open.has(d.id) ? open.delete(d.id) : open.add(d.id);
          evidence.hidden = !open.has(d.id);
          more.setAttribute("aria-expanded", String(open.has(d.id)));
          more.textContent = open.has(d.id) ? "quotes ▴" : "quotes ▾";
        },
      },
      open.has(d.id) ? "quotes ▴" : "quotes ▾"
    );
    return h(
      "li",
      {
        class: `dim${on ? " on" : ""}${full ? " locked" : ""}`,
        "data-i": i,
        title: full ? "3 is the most. untick one to pick another." : "",
      },
      h("label", { class: "dim-head" }, box, h("span", { class: "dim-title" }, topicLabel(d))),
      h(
        "div",
        { class: "dim-track", "aria-hidden": "true" },
        h("span", { class: "track-line" }),
        h("span", { class: "track-gap", style: `left:${pos(Math.min(d.p.score, d.q.score))};width:${(gap(d) / 2) * 100}%` }),
        h("span", { class: "track-dot p", style: `left:${pos(d.p.score)}` }),
        h("span", { class: "track-dot q", style: `left:${pos(d.q.score)}` })
      ),
      h("div", { class: "dim-poles" }, h("span", {}, d.poles[0]), h("span", {}, d.poles[1])),
      h("ul", { class: "stances" }, stanceLine(d.p, model.p.name, "p"), stanceLine(d.q, model.q.name, "q")),
      more,
      evidence
    );
  }

  function renderList() {
    clear(list);
    for (const i of sortDims(model.dims, sortBy)) list.append(item(i));
    hint.textContent = selected.length
      ? selected.length >= MAX_SELECTED
        ? "3 is the most. untick one to pick another."
        : `${selected.length} selected. pick up to ${MAX_SELECTED}, or none to see them all.`
      : "tick 1 to 3 to look at just those. none ticked shows all of them.";
  }

  return {
    render(m) {
      model = m;
      selected = [];
      open.clear();
      title.textContent = `dimensions (${m.dims.length})`;
      renderList();
    },
    selected: () => [...selected],
  };
}
