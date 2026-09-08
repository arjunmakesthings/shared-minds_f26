// camera: "dynamic" auto-fits the whole graph, centered on the central
// question; "fixed" leaves the camera wherever the user last set it.
// switches to "fixed" automatically the moment you pan/zoom by hand.
const viewDynamicEl = document.getElementById('view-dynamic');
const viewFixedEl = document.getElementById('view-fixed');

// layout physics: repulsion keeps any two nodes from crowding each other
// ("bubbles" pushing apart), while a spring along each edge pulls connected
// nodes toward a comfortable link distance — tighter than unrelated nodes end
// up, so a branch's cluster reads as a cluster. link distance isn't uniform:
// main branches off the central question get spaced well apart (they're
// distinct topics), while anything deeper hugs its own local anchor tightly.
// all the numbers below live in config.js.
function linkGapFor(parent) {
  return parent === rootNode ? CONFIG.layout.rootLinkGap : CONFIG.layout.subLinkGap;
}

let viewMode = 'dynamic';

function renderViewMode() {
  viewDynamicEl.classList.toggle('active', viewMode === 'dynamic');
  viewFixedEl.classList.toggle('active', viewMode === 'fixed');
}

function setViewMode(next) {
  if (next !== 'dynamic' && next !== 'fixed') return;
  viewMode = next;
  renderViewMode();
  updateView();
}

function switchToFixedView() {
  if (viewMode === 'fixed') return;
  viewMode = 'fixed';
  renderViewMode();
}

// a circle guaranteed to fully contain the node's box (its half-diagonal) —
// used for edge avoidance, where erring on the side of "too far" is what
// keeps a line from ever clipping a corner
function nodeCircumradius(sizeCache, node) {
  const size = sizeCache.get(node);
  return Math.hypot(size.width, size.height) / 2;
}

// the closest point to (px, py) on the segment from (ax, ay) to (bx, by)
function closestPointOnSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const lengthSq = abx * abx + aby * aby || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / lengthSq));
  return { x: ax + t * abx, y: ay + t * aby };
}

// which side of the line a->b point c falls on (sign only; 0 means collinear)
function turnDirection(ax, ay, bx, by, cx, cy) {
  const value = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  if (Math.abs(value) < 1e-9) return 0;
  return value > 0 ? 1 : -1;
}

function onSegment(ax, ay, bx, by, px, py) {
  return px >= Math.min(ax, bx) && px <= Math.max(ax, bx) &&
         py >= Math.min(ay, by) && py <= Math.max(ay, by);
}

// true if segment p1->p2 crosses segment p3->p4 (shared endpoints don't count)
function segmentsCross(p1, p2, p3, p4) {
  const d1 = turnDirection(p3.x, p3.y, p4.x, p4.y, p1.x, p1.y);
  const d2 = turnDirection(p3.x, p3.y, p4.x, p4.y, p2.x, p2.y);
  const d3 = turnDirection(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  const d4 = turnDirection(p1.x, p1.y, p2.x, p2.y, p4.x, p4.y);

  if (d1 !== d2 && d3 !== d4 && d1 !== 0 && d2 !== 0 && d3 !== 0 && d4 !== 0) return true;

  if (d1 === 0 && onSegment(p3.x, p3.y, p4.x, p4.y, p1.x, p1.y)) return true;
  if (d2 === 0 && onSegment(p3.x, p3.y, p4.x, p4.y, p2.x, p2.y)) return true;
  if (d3 === 0 && onSegment(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)) return true;
  if (d4 === 0 && onSegment(p1.x, p1.y, p2.x, p2.y, p4.x, p4.y)) return true;

  return false;
}

// relaxes the whole graph like a spring embedder: every pair of nodes repels
// (so nothing overlaps, like bubbles finding room), every parent-child edge
// acts as a spring pulling toward a comfortable link distance (so a branch's
// nodes settle near each other, reading as a cluster), and any node that
// strays too close to an edge it isn't part of gets pushed off that line (so
// edges never cut through an unrelated box). the central question is pinned
// so the graph doesn't drift out from under the camera.
function resolveLayout() {
  const sizeCache = new Map(nodes.map((n) => [n, n.getWorldSize()]));

  for (let iter = 0; iter < CONFIG.layout.iterations; iter++) {
    const forces = new Map(nodes.map((n) => [n, { x: 0, y: 0 }]));

    // exact rectangle-vs-rectangle overlap: push apart along whichever axis
    // has the smaller overlap, same as testing two axis-aligned boxes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const sizeA = sizeCache.get(a);
        const sizeB = sizeCache.get(b);

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const minDx = (sizeA.width + sizeB.width) / 2 + CONFIG.layout.repelPadding;
        const minDy = (sizeA.height + sizeB.height) / 2 + CONFIG.layout.repelPadding;

        if (Math.abs(dx) >= minDx || Math.abs(dy) >= minDy) continue;

        const overlapX = minDx - Math.abs(dx);
        const overlapY = minDy - Math.abs(dy);
        const fx = overlapX < overlapY ? (dx === 0 ? 1 : Math.sign(dx)) * overlapX * CONFIG.layout.repelStrength : 0;
        const fy = overlapX < overlapY ? 0 : (dy === 0 ? 1 : Math.sign(dy)) * overlapY * CONFIG.layout.repelStrength;

        forces.get(a).x -= fx / 2; forces.get(a).y -= fy / 2;
        forces.get(b).x += fx / 2; forces.get(b).y += fy / 2;
      }
    }

    for (const b of nodes) {
      const a = b.parent;
      if (!a) continue;

      const sizeA = sizeCache.get(a);
      const sizeB = sizeCache.get(b);
      const reachA = Math.max(sizeA.width, sizeA.height) / 2;
      const reachB = Math.max(sizeB.width, sizeB.height) / 2;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.01;

      const linkDistance = reachA + reachB + CONFIG.layout.repelPadding + linkGapFor(a);
      const pull = (dist - linkDistance) * CONFIG.layout.linkStrength;
      const fx = (dx / dist) * pull;
      const fy = (dy / dist) * pull;
      forces.get(a).x += fx; forces.get(a).y += fy;
      forces.get(b).x -= fx; forces.get(b).y -= fy;
    }

    // keep unrelated nodes off of edges they aren't part of
    for (const edgeChild of nodes) {
      const edgeParent = edgeChild.parent;
      if (!edgeParent) continue;

      for (const n of nodes) {
        if (n === edgeParent || n === edgeChild) continue;

        const closest = closestPointOnSegment(n.x, n.y, edgeParent.x, edgeParent.y, edgeChild.x, edgeChild.y);
        const dx = n.x - closest.x;
        const dy = n.y - closest.y;
        const dist = Math.hypot(dx, dy) || 0.01;

        const minDist = nodeCircumradius(sizeCache, n) + CONFIG.layout.edgePadding;
        if (dist >= minDist) continue;

        const push = (minDist - dist) * CONFIG.layout.edgeRepelStrength;
        forces.get(n).x += (dx / dist) * push;
        forces.get(n).y += (dy / dist) * push;
      }
    }

    // keep unrelated edges from crossing each other
    for (let i = 0; i < nodes.length; i++) {
      const child1 = nodes[i];
      const parent1 = child1.parent;
      if (!parent1) continue;

      for (let j = i + 1; j < nodes.length; j++) {
        const child2 = nodes[j];
        const parent2 = child2.parent;
        if (!parent2) continue;
        if (parent1 === parent2 || parent1 === child2 || parent2 === child1) continue;

        if (!segmentsCross(parent1, child1, parent2, child2)) continue;

        const dx = child2.x - child1.x;
        const dy = child2.y - child1.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        const fx = (dx / dist) * CONFIG.layout.edgeCrossStep;
        const fy = (dy / dist) * CONFIG.layout.edgeCrossStep;

        forces.get(child1).x -= fx; forces.get(child1).y -= fy;
        forces.get(child2).x += fx; forces.get(child2).y += fy;
      }
    }

    for (const n of nodes) {
      if (n === rootNode) continue; // keep the central question fixed
      const f = forces.get(n);
      n.x += f.x;
      n.y += f.y;
    }
  }
}

// re-centers/re-scales the camera on the central question so everything fits
function fitCamera() {
  if (!rootNode) return;

  let maxX = 0;
  let maxY = 0;
  for (const n of nodes) {
    maxX = Math.max(maxX, Math.abs(n.x - rootNode.x));
    maxY = Math.max(maxY, Math.abs(n.y - rootNode.y));
  }

  const halfW = viewW / 2 - CONFIG.layout.fitMargin;
  const halfH = viewH / 2 - CONFIG.layout.fitMargin;

  let newScale = 1;
  if (maxX > 0 || maxY > 0) {
    const scaleX = maxX > 0 ? halfW / maxX : Infinity;
    const scaleY = maxY > 0 ? halfH / maxY : Infinity;
    newScale = Math.max(CONFIG.canvas.minScale, Math.min(scaleX, scaleY, CONFIG.canvas.maxScale));
  }

  scale = newScale;
  offsetX = viewW / 2 - rootNode.x * scale;
  offsetY = viewH / 2 - rootNode.y * scale;
}

// call after any change to the node graph or the window size
function updateView() {
  if (viewMode === 'dynamic') fitCamera();
  draw();
}

viewDynamicEl.addEventListener('click', () => setViewMode('dynamic'));
viewFixedEl.addEventListener('click', () => setViewMode('fixed'));

renderViewMode();
