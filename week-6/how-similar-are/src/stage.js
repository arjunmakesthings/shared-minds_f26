// the stage: draws the pair in whichever view fits the selection.
//   nothing ticked -> star coordinates, all dimensions at once (still, and only an approximation)
//   1 ticked       -> a number line between that topic's two poles
//   2 ticked       -> a square, one topic per axis
//   3 ticked       -> a cube you can orbit (three.js, loaded only when needed; see cube.js)
// when the selection changes, the two dots glide from where they were to where they now belong.

import { s, h, clear } from "./dom.js";
import { topicLabel, starPoint, spokeAngle, gap } from "./math.js";

const W = 720;
const H = 640;
const CX = 360;
const CY = 320;
const STAR_R = 205;
const SQ = { x0: 150, y0: 100, size: 420 };
const LINE = { x0: 110, x1: 610, y: 330 };
const fmt = (x) => (x >= 0 ? "+" : "−") + Math.abs(x).toFixed(2);

// break a label into short lines for svg text
function wrap(text, max) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

function label(x, y, text, { max = 24, anchor = "middle", cls = "lbl", lh = 15 } = {}) {
  const lines = wrap(text, max);
  return s("text", { x, y, "text-anchor": anchor, class: cls }, ...lines.map((t, i) => s("tspan", { x, dy: i === 0 ? 0 : lh }, t)));
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function createStage(root, { onCubeNeeded }) {
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "stage-svg", role: "img" });
  const scene = s("g", { class: "scene" });
  const link = s("line", { class: "link" });
  const mkDot = (who) => {
    const circle = s("circle", { r: 12, class: "dot-c" });
    const text = s("text", { class: "dot-t", "text-anchor": "middle" });
    return { who, g: s("g", { class: `dot ${who}` }, circle, text), text };
  };
  const dp = mkDot("p");
  const dq = mkDot("q");
  svg.append(scene, link, dp.g, dq.g);

  const cubeBox = h("div", { class: "stage-3d" });
  cubeBox.hidden = true;
  const tip = h("div", { class: "tip" });
  tip.hidden = true;
  const empty = h("p", { class: "stage-empty" });
  empty.hidden = true;
  root.append(svg, cubeBox, tip, empty);

  let cur = null; // where the dots are right now: {p:{x,y}, q:{x,y}}
  let raf = 0;
  let mode = null;
  let cube = null;
  let showToken = 0;

  function place(pos) {
    cur = pos;
    dp.g.setAttribute("transform", `translate(${pos.p.x},${pos.p.y})`);
    dq.g.setAttribute("transform", `translate(${pos.q.x},${pos.q.y})`);
    link.setAttribute("x1", pos.p.x);
    link.setAttribute("y1", pos.p.y);
    link.setAttribute("x2", pos.q.x);
    link.setAttribute("y2", pos.q.y);
  }

  function glide(target, instant) {
    cancelAnimationFrame(raf);
    if (instant || !cur || matchMedia("(prefers-reduced-motion: reduce)").matches) return place(target);
    const from = cur;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / 650);
      const e = ease(t);
      const mix = (a, b) => ({ x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e });
      place({ p: mix(from.p, target.p), q: mix(from.q, target.q) });
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  function labelDots(model) {
    dp.text.textContent = model.p.name;
    dq.text.textContent = model.q.name;
    dp.text.setAttribute("y", -19);
    dq.text.setAttribute("y", 31);
  }

  function showTip(evt, d, model) {
    clear(tip);
    tip.append(
      h("b", {}, topicLabel(d)),
      h("p", {}, d.question),
      h("p", { class: "tip-scores" }, `${model.p.name} ${fmt(d.p.score)} · ${model.q.name} ${fmt(d.q.score)}`),
      h("p", { class: "tip-poles" }, `toward the tip: ${d.poles[1]}`, h("br"), `away from it: ${d.poles[0]}`)
    );
    tip.hidden = false;
    const box = root.getBoundingClientRect();
    const x = Math.min(evt.clientX - box.left + 14, box.width - 260);
    tip.style.left = `${Math.max(8, x)}px`;
    tip.style.top = `${evt.clientY - box.top + 14}px`;
  }

  // ---- the flat views: each returns where the dots go ----

  function drawStar(model) {
    const n = model.dims.length;
    scene.append(s("circle", { cx: CX, cy: CY, r: STAR_R, class: "guide" }), s("circle", { cx: CX, cy: CY, r: STAR_R / 2, class: "guide faint" }));
    model.dims.forEach((d, i) => {
      const a = spokeAngle(i, n);
      const c = Math.cos(a);
      const sn = Math.sin(a);
      const tx = CX + STAR_R * c;
      const ty = CY + STAR_R * sn;
      const anchor = c > 0.25 ? "start" : c < -0.25 ? "end" : "middle";
      const name = topicLabel(d);
      scene.append(
        s("line", { x1: CX, y1: CY, x2: tx, y2: ty, class: "spoke" }),
        s("circle", { cx: tx, cy: ty, r: 3, class: "spoke-tip" }),
        s("text", { x: CX + (STAR_R + 12) * c, y: CY + (STAR_R + 12) * sn + (sn > 0.5 ? 10 : sn < -0.5 ? -3 : 4), "text-anchor": anchor, class: "lbl" }, name.length > 22 ? name.slice(0, 21) + "…" : name),
        s("line", {
          x1: CX,
          y1: CY,
          x2: tx,
          y2: ty,
          class: "spoke-hit",
          onmousemove: (e) => showTip(e, d, model),
          onmouseleave: () => (tip.hidden = true),
        })
      );
    });
    const toPx = (pt) => ({ x: CX + STAR_R * pt.x, y: CY + STAR_R * pt.y });
    return { p: toPx(starPoint(model.dims, "p")), q: toPx(starPoint(model.dims, "q")) };
  }

  function drawLine(model, [i]) {
    const d = model.dims[i];
    const x = (v) => LINE.x0 + ((v + 1) / 2) * (LINE.x1 - LINE.x0);
    scene.append(
      label(CX, 110, d.question, { max: 52, cls: "question", lh: 20 }),
      s("line", { x1: LINE.x0, y1: LINE.y, x2: LINE.x1, y2: LINE.y, class: "axis" }),
      s("line", { x1: x(0), y1: LINE.y - 8, x2: x(0), y2: LINE.y + 8, class: "axis faint" }),
      s("line", { x1: LINE.x0, y1: LINE.y - 12, x2: LINE.x0, y2: LINE.y + 12, class: "axis" }),
      s("line", { x1: LINE.x1, y1: LINE.y - 12, x2: LINE.x1, y2: LINE.y + 12, class: "axis" }),
      label(LINE.x0, LINE.y + 48, d.poles[0], { max: 20, anchor: "start" }),
      label(LINE.x1, LINE.y + 48, d.poles[1], { max: 20, anchor: "end" }),
      s("text", { x: (x(d.p.score) + x(d.q.score)) / 2, y: LINE.y + 100, "text-anchor": "middle", class: "lbl faint-t" }, `gap ${gap(d).toFixed(2)} of 2`)
    );
    return { p: { x: x(d.p.score), y: LINE.y }, q: { x: x(d.q.score), y: LINE.y } };
  }

  function drawPlane(model, [i, j]) {
    const dx = model.dims[i];
    const dy = model.dims[j];
    const { x0, y0, size } = SQ;
    const px = (v) => x0 + ((v + 1) / 2) * size;
    const py = (v) => y0 + size - ((v + 1) / 2) * size;
    scene.append(
      s("rect", { x: x0, y: y0, width: size, height: size, class: "guide" }),
      s("line", { x1: px(0), y1: y0, x2: px(0), y2: y0 + size, class: "axis faint" }),
      s("line", { x1: x0, y1: py(0), x2: x0 + size, y2: py(0), class: "axis faint" }),
      label(x0, y0 + size + 26, dx.poles[0], { max: 22, anchor: "start" }),
      label(x0 + size, y0 + size + 26, dx.poles[1], { max: 22, anchor: "end" }),
      label(x0 - 12, y0 + 14, dy.poles[1], { max: 18, anchor: "end" }),
      label(x0 - 12, y0 + size - 6, dy.poles[0], { max: 18, anchor: "end" }),
      s("text", { x: x0 + size / 2, y: y0 + size + 52, "text-anchor": "middle", class: "lbl axis-name" }, `→ ${topicLabel(dx)}`),
      s("text", { x: x0 - 130, y: y0 + size / 2, "text-anchor": "middle", class: "lbl axis-name", transform: `rotate(-90 ${x0 - 130} ${y0 + size / 2})` }, `→ ${topicLabel(dy)}`)
    );
    return {
      p: { x: px(dx.p.score), y: py(dy.p.score) },
      q: { x: px(dx.q.score), y: py(dy.q.score) },
    };
  }

  // ---- public ----

  async function show(model, sel) {
    const token = ++showToken;
    const next = !model.dims.length ? "empty" : sel.length === 0 ? "star" : sel.length === 1 ? "line" : sel.length === 2 ? "plane" : "cube";
    tip.hidden = true;
    empty.hidden = next !== "empty";
    if (next === "empty") {
      empty.textContent = "these two have no topic in common where both take a clear stance, so there is nothing to place them on.";
      svg.style.display = "none";
      cubeBox.hidden = true;
      cube?.pause();
      mode = next;
      return next;
    }

    if (next === "cube") {
      if (!cube) cube = await onCubeNeeded(cubeBox);
      if (token !== showToken) return next; // the selection changed while three.js loaded
      const from = mode === "plane" && cur ? { prevSel: sel.slice(0, 2) } : {};
      svg.style.display = "none";
      cubeBox.hidden = false;
      cube.update(model, sel, from);
      mode = next;
      return next;
    }

    cubeBox.hidden = true;
    cube?.pause();
    svg.style.display = "";
    clear(scene);
    scene.classList.remove("in");
    labelDots(model);
    const target = next === "star" ? drawStar(model) : next === "line" ? drawLine(model, sel) : drawPlane(model, sel);
    requestAnimationFrame(() => scene.classList.add("in"));
    glide(target, mode === null || mode === "cube" || mode === "empty");
    mode = next;
    return next;
  }

  return {
    show,
    get mode() {
      return mode;
    },
  };
}
