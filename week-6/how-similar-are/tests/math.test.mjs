// run with: node tests/math.test.mjs
import assert from "node:assert/strict";
import { distance, similarity, starPoint, starScale, sortDims, allIdx } from "../src/math.js";

const dim = (id, p, q) => ({ id, p: { score: p }, q: { score: q } });
const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);

// identical stances -> 100%
close(similarity([dim("a", 0.3, 0.3), dim("b", -1, -1)], [0, 1]), 1);
// opposite extremes on everything -> 0%, for any k
for (const k of [1, 2, 3, 7]) {
  const dims = Array.from({ length: k }, (_, i) => dim("d" + i, 1, -1));
  close(similarity(dims, allIdx(dims)), 0);
}
// k = 1 matches 1 - |a - b| / 2
close(similarity([dim("a", 0.5, -0.3)], [0]), 1 - 0.8 / 2);
// distance is euclidean and only counts the selected dimensions
close(distance([dim("a", 1, 0), dim("b", 0, 1), dim("c", 1, -1)], [0, 1]), Math.sqrt(2));
// nothing selected -> no number
assert.equal(similarity([dim("a", 0, 0)], []), null);
// picking different dimensions can change the answer a lot
const dims = [dim("agree", 0.8, 0.8), dim("agree2", -0.5, -0.5), dim("clash", 1, -1)];
assert.ok(similarity(dims, [0, 1]) > 0.99);
assert.ok(similarity(dims, [2]) < 0.01);

// star view: the dots stay inside the unit disc, and identical people land on the same spot
for (const n of [1, 2, 3, 5, 12, 20]) {
  assert.ok(starScale(n) > 0);
  const hi = Array.from({ length: n }, (_, i) => dim("d" + i, 1, -1));
  const a = starPoint(hi, "p");
  const b = starPoint(hi, "q");
  assert.ok(Math.hypot(a.x, a.y) <= 1 + 1e-6, `n=${n} p outside disc`);
  assert.ok(Math.hypot(b.x, b.y) <= 1 + 1e-6, `n=${n} q outside disc`);
  const same = Array.from({ length: n }, (_, i) => dim("d" + i, 0.4, 0.4));
  close(starPoint(same, "p").x, starPoint(same, "q").x);
  close(starPoint(same, "p").y, starPoint(same, "q").y);
}
// sorting by gap
const sorted = sortDims([dim("a", 0, 0.1), dim("b", 0, 1), dim("c", 0, 0.5)], "biggest gap");
assert.deepEqual(sorted, [1, 2, 0]);

console.log("math ok");
