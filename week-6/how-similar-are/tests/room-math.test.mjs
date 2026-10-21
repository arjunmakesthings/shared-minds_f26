// run with: node tests/room-math.test.mjs
// the room's default orientation must contain the line between the two people, so the distance
// seen in the room equals the true distance, for every number of topics the site can have.
import assert from "node:assert/strict";
import * as nd from "../src/nd.js";

const rnd = (n) => Array.from({ length: n }, () => Math.random());
for (let n = 2; n <= 10; n++) {
  const k = Math.min(3, n);
  for (let trial = 0; trial < 50; trial++) {
    const x1 = rnd(n);
    const x2 = rnd(n);
    let F = nd.axisFrame(n, k);
    const target = nd.gramSchmidt(n, k, [nd.sub(x1, x2), x1.map((x, i) => (x + x2[i]) / 2 - 0.5), ...F]);
    F = nd.alignFrame(target, F);
    // rows orthonormal
    for (let a = 0; a < k; a++)
      for (let b = 0; b < k; b++) assert.ok(Math.abs(nd.dot(F[a], F[b]) - (a === b ? 1 : 0)) < 1e-6, `n=${n} not orthonormal`);
    const seen = nd.norm(nd.sub(nd.project(x1, F), nd.project(x2, F)));
    const dist = nd.norm(nd.sub(x1, x2));
    assert.ok(Math.abs(seen - dist) < 1e-6, `n=${n}: seen ${seen} != true ${dist}`);
  }
}
// tilting an axis keeps the room orthonormal
const F0 = nd.axisFrame(6, 3);
const F1 = nd.setAxisTip(F0, 4, [0.3, 0.2, 0.1]);
for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) assert.ok(Math.abs(nd.dot(F1[a], F1[b]) - (a === b ? 1 : 0)) < 1e-6);
console.log("room math ok");
