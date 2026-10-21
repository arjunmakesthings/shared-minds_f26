// how similar are ____ & ____ ?
// pick two people -> a loader replays the steps that were run ahead of time -> the result:
// the result: the two names, a view of the two people, and a sidebar of the topics (dimensions).

import { h, clear } from "./src/dom.js";
import { loadPeople, loadPairIndex, loadPair, pairKey } from "./src/data.js";
import { createPicker } from "./src/picker.js";
import { playLoader } from "./src/loader.js";
import { createSidebar } from "./src/sidebar.js";
import { createStage } from "./src/stage.js";
import { topicLabel } from "./src/math.js";

const $ = (id) => document.getElementById(id);

const state = { people: [], published: new Set(), model: null, selected: [] };

async function boot() {
  try {
    [state.people, state.published] = await Promise.all([loadPeople(), loadPairIndex().then((l) => new Set(l))]);
  } catch (e) {
    $("pick-error").textContent = "couldn't load the people list. is this page being served from a local server? (" + e.message + ")";
    return;
  }

  const go = $("go");
  const first = createPicker("first person", state.people, () => onPick());
  const second = createPicker("second person", state.people, () => onPick());
  $("pick-a").append(first.el);
  $("pick-b").append(second.el);

  function onPick() {
    first.block(second.value);
    second.block(first.value);
    go.disabled = !(first.value && second.value);
    $("pick-error").textContent = "";
    if (state.model) hideResult();
  }

  go.addEventListener("click", () => run(first.value, second.value));
}

function hideResult() {
  state.model = null;
  $("result").hidden = true;
  $("loader").hidden = true;
}

async function run(idA, idB) {
  const err = $("pick-error");
  err.textContent = "";
  if (!state.published.has(pairKey(idA, idB))) {
    err.textContent = "this pair hasn't been reviewed and published yet.";
    return;
  }
  $("intro").hidden = true; // the introduction goes once they press go
  $("go").disabled = true;
  hideResult();

  let model;
  try {
    model = await loadPair(idA, idB, state.people);
  } catch (e) {
    err.textContent = "couldn't load this pair (" + e.message + ").";
    $("go").disabled = false;
    return;
  }

  $("loader").hidden = false;
  await playLoader($("loader"), model);
  $("loader").hidden = true;
  $("go").disabled = false;
  show(model);
}

// ---- the result ----

let stage = null;
let sidebar = null;

function show(model) {
  state.model = model;
  state.selected = [];
  $("result").hidden = false;

  if (!stage) {
    stage = createStage($("stage"), {
      onCubeNeeded: async (box) => {
        const { createCube } = await import("./src/cube.js");
        return createCube(box);
      },
    });
    sidebar = createSidebar($("sidebar"), (sel) => {
      state.selected = sel;
      update();
    });
  }
  $("legend").replaceChildren(
    h("span", { class: "key p" }, h("i"), model.p.name),
    h("span", { class: "key q" }, h("i"), model.q.name)
  );
  sidebar.render(model);
  $("sidebar").hidden = model.dims.length === 0;
  update();
  document.title = `how similar are ${model.p.name} & ${model.q.name}?`;
}

function update() {
  const model = state.model;
  const sel = state.selected;
  const n = model.dims.length;

  // no score on purpose: the picture is the answer, and it changes with the topics you look at
  const head = $("headline");
  clear(head);
  head.append(
    h("h1", {}, `${model.p.name} & ${model.q.name}`),
    h(
      "p",
      { class: "sub" },
      !n
        ? "no shared topic with a clear stance from both."
        : sel.length
          ? `looking only at ${sel.map((i) => topicLabel(model.dims[i])).join(", ")}`
          : `across all ${n} topic${n === 1 ? "" : "s"}`
    )
  );

  stage.show(model, sel).then(() => caption(model, sel));
}

function caption(model, sel) {
  const el = $("caption");
  const n = model.dims.length;
  if (!n) return (el.textContent = "");
  if (sel.length === 0) {
    el.textContent =
      `all ${n} topics at once, as a star: each spoke is one topic, and a dot is pulled toward a spoke's tip by agreeing with that end ` +
      `and away from it by the opposite. this flattens ${n} dimensions into 2, so distances in the picture are approximate. ` +
      `tick topics on the right to look at fewer.`;
  } else if (sel.length === 1) {
    el.textContent = `one topic, so one line: ${topicLabel(model.dims[sel[0]])}.`;
  } else if (sel.length === 2) {
    el.textContent = `two topics, so a square. across: ${topicLabel(model.dims[sel[0]])}. up: ${topicLabel(model.dims[sel[1]])}.`;
  } else {
    el.textContent = `three topics, so a cube you can drag to orbit. ${["x", "y", "z"].map((a, k) => `${a}: ${topicLabel(model.dims[sel[k]])}`).join(" · ")}.`;
  }
}

boot();
