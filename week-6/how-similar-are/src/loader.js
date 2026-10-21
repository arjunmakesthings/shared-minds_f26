// the loading screen. nothing is computed in the browser (it was all done ahead of time by the
// scripts), so this replays the real steps for the pair, with the real counts, faster than they ran.

import { h, clear, sleep } from "./dom.js";
import { topicLabel } from "./math.js";

export async function playLoader(root, model, { fast = false } = {}) {
  clear(root);
  const log = h("ul", { class: "loader-log" });
  root.append(h("div", { class: "loader-inner" }, h("div", { class: "loader-spin", "aria-hidden": "true" }), log));
  const pause = (ms) => sleep(fast ? 0 : ms);

  const line = (text) => {
    const li = h("li", {}, text);
    log.append(li);
    return li;
  };

  line(`reading ${model.quoteCounts.p} quotes from ${model.p.name} · ${model.quoteCounts.q} from ${model.q.name}`);
  await pause(900);
  line(`found ${model.counts.topicsFound} topics both have spoken about`);
  await pause(900);

  const placing = line("placing stances: ");
  const tick = h("span", { class: "loader-ticks" });
  placing.append(tick);
  const n = model.dims.length;
  const step = Math.min(160, Math.max(25, Math.round(2200 / Math.max(1, n))));
  for (let i = 0; i < n; i++) {
    tick.textContent = `${topicLabel(model.dims[i])} ✓` + (i + 1 < n ? " …" : "");
    await pause(step);
  }
  await pause(300);
  line(n ? `keeping the ${n} where both take a clear stance` : "no topic where both take a clear stance");
  await pause(700);
}
