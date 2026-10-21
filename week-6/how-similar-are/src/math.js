// the math. a "model" is one pair, oriented so that p = the person picked first, q = the second:
//   dims: [{ id, question, poles: [minusPole, plusPole], p: {score, reason, quotes}, q: {...} }]
// every stance score is in [-1, +1]; a person is the vector of their scores over the dimensions.

export const topicLabel = (d) => d.id.replace(/-/g, " ");

export const gap = (d) => Math.abs(d.p.score - d.q.score);

// true euclidean distance between the two people, over the dimensions at the given indices
export function distance(dims, idx) {
  let sum = 0;
  for (const i of idx) {
    const e = dims[i].p.score - dims[i].q.score;
    sum += e * e;
  }
  return Math.sqrt(sum);
}

// 1 = identical stances, 0 = opposite extremes on every dimension. the biggest possible gap on one
// axis is 2, so the biggest possible distance over k axes is 2*sqrt(k).
export function similarity(dims, idx) {
  const k = idx.length;
  if (!k) return null;
  return 1 - distance(dims, idx) / (2 * Math.sqrt(k));
}

export const allIdx = (dims) => dims.map((_, i) => i);

// ---- star coordinates: one spoke per dimension, spread evenly around a circle ----

export const spokeAngle = (i, n) => -Math.PI / 2 + (2 * Math.PI * i) / n;

// the longest a person's dot can get from the centre (stance +1 or -1 on every spoke, in the best
// direction), so the picture can be scaled to fill the circle without ever leaving it.
export function starScale(n) {
  if (!n) return 1;
  let best = 0;
  for (let k = 0; k < 720; k++) {
    const u = (Math.PI * k) / 360;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += Math.abs(Math.cos(spokeAngle(i, n) - u));
    best = Math.max(best, sum / n);
  }
  return best || 1;
}

// the average of the spokes, each weighted by that person's stance (+1 pulls toward the tip, -1 away
// from it), scaled into the unit disc. who = "p" | "q". y points down, like the screen.
export function starPoint(dims, who) {
  const n = dims.length;
  if (!n) return { x: 0, y: 0 };
  const scale = starScale(n);
  let x = 0;
  let y = 0;
  dims.forEach((d, i) => {
    const a = spokeAngle(i, n);
    x += d[who].score * Math.cos(a);
    y += d[who].score * Math.sin(a);
  });
  return { x: x / n / scale, y: y / n / scale };
}

// ---- small helpers for the sidebar ----

export function sortDims(dims, how) {
  const order = dims.map((_, i) => i);
  if (how === "smallest gap") order.sort((a, b) => gap(dims[a]) - gap(dims[b]));
  else if (how === "a to z") order.sort((a, b) => dims[a].id.localeCompare(dims[b].id));
  else order.sort((a, b) => gap(dims[b]) - gap(dims[a]));
  return order;
}

export function describe(sim) {
  if (sim === null) return "";
  if (sim >= 0.85) return "very close";
  if (sim >= 0.65) return "fairly close";
  if (sim >= 0.45) return "somewhere in between";
  if (sim >= 0.25) return "far apart";
  return "very far apart";
}
