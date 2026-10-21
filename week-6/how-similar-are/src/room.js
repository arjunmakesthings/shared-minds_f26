// the n-dimensional view (ported from ../../n-dimensional-space_representation-test).
//
// the two people are points in n-dimensional space, one axis per topic (a stance of -1 … +1 becomes a
// value 0 … 1 on that axis). we look at that space through a "room": a 3d slice of it (see nd.js).
// you can move two ways:
//   - inside the room (ordinary 3d): drag to orbit, right-drag to pan, scroll to zoom
//   - the room itself, through n-d: drag an axis tip to tilt the room toward that topic; click a tip to
//     bring the topic fully into view or push it out
// by default the room is turned to contain the line between the two people, so the distance you see is
// exactly the true distance. dragging an axis lets go of that.

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import * as nd from "./nd.js";
import { topicLabel } from "./math.js";
import { h } from "./dom.js";

const PICK_PX = 14;
const HOME = new THREE.Vector3(1.25, 0.85, 1.95);
const CUBE_MAX = 10; // a hypercube has n·2^(n-1) edges; past this it's just a smear
const roomDims = (n) => Math.min(3, n);
const toUnit = (score) => (score + 1) / 2; // stance -1…+1 -> axis value 0…1

const dynamic = (array, size) => new THREE.BufferAttribute(array, size).setUsage(THREE.DynamicDrawUsage);

export function createRoom(container, { onHover = () => {} } = {}) {
  // ---- dom: canvas, labels, hud, buttons ----
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.append(renderer.domElement);
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.className = "labels";
  container.append(labelRenderer.domElement);
  const hud = h("div", { class: "hud" });
  const btn = (text, title, onclick) => h("button", { type: "button", class: "room-btn", title, onclick }, text);
  const buttons = {
    face: btn("face the two", "turn the room so it contains the line between them (f)", () => actions.face()),
    tour: btn("tour", "drift through random rooms (space)", () => actions.toggleTour()),
    reset: btn("reset", "first three topics along x, y, z (r)", () => actions.reset()),
    fit: btn("fit", "zoom to fit (z)", () => actions.fit()),
    cube: btn("all possible stances", "show the hypercube of every possible pair of stances", () => actions.setShow("cube", !state.show.cube)),
    path: btn("paths", "show how each person's point is built up, one topic at a time", () => actions.setShow("path", !state.show.path)),
  };
  const bar = h("div", { class: "room-bar" }, ...Object.values(buttons));
  const help = h("p", { class: "room-help" }, "drag to orbit · scroll to zoom · drag a topic's tip to tilt the room toward it · click a tip to bring it in or push it out");
  container.append(hud, bar, help);

  // ---- three.js scene ----
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 1, 10);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.005, 500);
  camera.position.copy(HOME);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 0.1;
  controls.maxDistance = 200;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 2.2));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(2, 3, 4);
  scene.add(sun);

  const colors = {};
  let fitTo = null; // camera distance we're easing toward
  let hudHtml = "";
  const mats = {
    cube: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.55, fog: true }),
    axes: new THREE.LineBasicMaterial({ vertexColors: true, fog: true }),
    handles: new THREE.MeshBasicMaterial(),
    path: [0, 1].map(() => new THREE.LineBasicMaterial({ transparent: true, opacity: 0.6 })),
    joints: [0, 1].map(() => new THREE.PointsMaterial({ size: 4, sizeAttenuation: false, transparent: true, opacity: 0.8 })),
    obj: [0, 1].map(() => new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.05 })),
    segment: new THREE.MeshBasicMaterial(),
  };

  const sphereGeo = new THREE.SphereGeometry(1, 32, 16);
  const objMesh = [0, 1].map((o) => {
    const m = new THREE.Mesh(sphereGeo, mats.obj[o]);
    scene.add(m);
    return m;
  });
  const segment = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 10, 1), mats.segment);
  scene.add(segment);

  function addLabel(className, text) {
    const el = document.createElement("div");
    el.className = className;
    el.textContent = text;
    const obj = new CSS2DObject(el);
    scene.add(obj);
    return obj;
  }
  const objLabel = [0, 1].map((o) => addLabel(`label obj o${o + 1}`, ""));
  const distLabel = addLabel("label dist", "");

  // ---- things rebuilt whenever the pair (so n) changes ----
  let built = null;
  let cube = null;
  let axes = null;
  let handles = null;
  let paths = [];
  let joints = [];
  let paramLabels = [];
  let tips = []; // world position of every axis tip, for picking

  function build(n) {
    for (const obj of [cube, axes, handles, ...paths, ...joints]) {
      if (!obj) continue;
      scene.remove(obj);
      if (obj.geometry !== sphereGeo) obj.geometry.dispose();
    }
    if (handles) handles.dispose();
    for (const l of paramLabels) {
      scene.remove(l);
      l.element.remove();
    }

    cube = null;
    if (n <= CUBE_MAX) {
      const V = 1 << n;
      const idx = [];
      for (let v = 0; v < V; v++) for (let j = 0; j < n; j++) if (!(v & (1 << j))) idx.push(v, v | (1 << j));
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", dynamic(new Float32Array(V * 3), 3));
      g.setIndex(idx);
      cube = new THREE.LineSegments(g, mats.cube);
      cube.frustumCulled = false;
      scene.add(cube);
    }

    const ag = new THREE.BufferGeometry();
    ag.setAttribute("position", dynamic(new Float32Array(n * 6), 3));
    ag.setAttribute("color", dynamic(new Float32Array(n * 6), 3));
    axes = new THREE.LineSegments(ag, mats.axes);
    axes.frustumCulled = false;
    scene.add(axes);

    handles = new THREE.InstancedMesh(sphereGeo, mats.handles, n);
    handles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    handles.frustumCulled = false;
    scene.add(handles);

    paths = [0, 1].map(() => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", dynamic(new Float32Array((n + 1) * 3), 3));
      const line = new THREE.Line(g, mats.path[0]);
      line.frustumCulled = false;
      scene.add(line);
      return line;
    });
    paths.forEach((l, o) => (l.material = mats.path[o]));
    joints = [0, 1].map((o) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", dynamic(new Float32Array(n * 3), 3));
      const pts = new THREE.Points(g, mats.joints[o]);
      pts.frustumCulled = false;
      scene.add(pts);
      return pts;
    });

    const dims = state.model.dims;
    paramLabels = Array.from({ length: n }, (_, i) => {
      const name = topicLabel(dims[i]);
      return addLabel("label param", name.length > 26 ? name.slice(0, 25) + "…" : name);
    });
    tips = Array.from({ length: n }, () => new THREE.Vector3());
    built = state.model;
  }

  // ---- theme: the page's css variables ----
  function applyTheme() {
    const cs = getComputedStyle(document.documentElement);
    const get = (v) => new THREE.Color(cs.getPropertyValue(v).trim() || "#888888");
    colors.bg = get("--panel");
    colors.fg = get("--text");
    colors.muted = get("--muted");
    colors.line = get("--line");
    colors.o1 = get("--p");
    colors.o2 = get("--q");
    scene.background = colors.bg;
    scene.fog.color = colors.bg;
    mats.cube.color = colors.line;
    mats.segment.color = colors.fg;
    [colors.o1, colors.o2].forEach((c, o) => {
      for (const m of [mats.path[o], mats.joints[o], mats.obj[o]]) m.color = c;
    });
  }
  applyTheme();

  // ---- size ----
  let W = 1;
  let H = 1;
  function resize() {
    W = container.clientWidth;
    H = container.clientHeight;
    if (!W || !H) return; // hidden
    renderer.setSize(W, H);
    labelRenderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(container);

  // ---- state: the pair, and the room we look through ----
  const state = {
    model: null,
    n: 0,
    objs: [[], []], // each person's values, 0 … 1 per topic
    frame: null,
    lock: true, // keep the room containing the line between them, so the distance in view is exact
    tour: false,
    anim: null,
    show: { cube: true, axes: true, labels: true, path: false },
    hoverDim: -1,
  };
  let running = false;

  // a room holding the line between them and their midpoint. any room containing that line shows the
  // distance exactly.
  function faceTarget() {
    const [x1, x2] = state.objs;
    const d = nd.sub(x1, x2);
    const mid = x1.map((x, i) => (x + x2[i]) / 2 - 0.5);
    return nd.gramSchmidt(state.n, state.frame.length, [d, mid, ...state.frame]);
  }
  function animate(at, dur, ease, onDone = null) {
    state.anim = { at, t0: performance.now(), dur, ease, onDone };
  }
  function animateTo(target, dur, ease = true, onDone = null) {
    const from = state.frame;
    const to = nd.alignFrame(target, from);
    animate((e) => nd.lerpFrame(from, to, e), dur, ease, onDone);
  }
  // any hand-driven move takes over from the tour, the lock and running transitions
  function stopAuto() {
    state.anim = null;
    if (state.tour || state.lock) {
      state.tour = false;
      state.lock = false;
      syncButtons();
    }
  }
  function syncButtons() {
    buttons.face.setAttribute("aria-pressed", String(state.lock));
    buttons.tour.setAttribute("aria-pressed", String(state.tour));
    buttons.cube.setAttribute("aria-pressed", String(state.show.cube));
    buttons.path.setAttribute("aria-pressed", String(state.show.path));
    buttons.cube.hidden = !cube;
  }

  const actions = {
    face() {
      if (state.lock) state.lock = false;
      else {
        state.tour = false;
        animateTo(faceTarget(), 1000, true, () => {
          state.lock = true;
          state.frame = nd.alignFrame(faceTarget(), state.frame);
          syncButtons();
          fit();
        });
      }
      syncButtons();
    },
    toggleTour() {
      state.tour = !state.tour;
      state.anim = null;
      if (state.tour) state.lock = false;
      syncButtons();
    },
    reset() {
      stopAuto();
      animateTo(nd.axisFrame(state.n, state.frame.length), 800);
      home();
    },
    fit() {
      fit();
    },
    // bring topic i fully into the room, or push it out into the hidden dimensions
    toggleAxis(i) {
      const F0 = state.frame;
      const k = F0.length;
      if (state.n <= k) return;
      stopAuto();
      const c0 = nd.column(F0, i);
      const len = nd.norm(c0);
      let tip;
      if (len > 0.5) tip = new Array(k).fill(0);
      else {
        // keep its direction if it has one; otherwise fan new axes out across the screen
        const dir = len > 0.05 ? nd.scale(c0, 1 / len) : screenDir(i * 2.39996, k);
        tip = nd.scale(dir, 0.98);
      }
      animate((e) => nd.setAxisTip(F0, i, c0.map((c, r) => c + (tip[r] - c) * e)), 800, true);
    },
    setShow(key, on) {
      state.show[key] = on;
      syncButtons();
    },
    // from the pointer: an axis tip dragged to t (a point in the room, in units of the full axis)
    tilt(i, t) {
      stopAuto();
      state.frame = nd.setAxisTip(state.frame, i, t);
    },
  };

  // ---- per-frame render ----
  const tmpColor = new THREE.Color();
  const tmpMatrix = new THREE.Matrix4();
  const tmpQuat = new THREE.Quaternion();
  const UP = new THREE.Vector3(0, 1, 0);
  const labelState = new WeakMap(); // avoids touching the dom when nothing changed

  function setLabel(obj, visible, opacity, hot = false) {
    const prev = labelState.get(obj);
    const op = opacity.toFixed(2);
    if (prev && prev.visible === visible && prev.op === op && prev.hot === hot) return;
    labelState.set(obj, { visible, op, hot });
    obj.visible = visible;
    obj.element.style.opacity = op;
    obj.element.classList.toggle("hot", hot);
  }

  function render() {
    const { n, frame: F, objs, show, hoverDim } = state;
    if (built !== state.model) build(n);
    const k = F.length;
    const camDist = camera.position.distanceTo(controls.target);

    // the room position of any n-d point (relative to the centre of the space)
    const room = (rel, out = new THREE.Vector3()) => out.set(nd.dot(rel, F[0]), nd.dot(rel, F[1]), k > 2 ? nd.dot(rel, F[2]) : 0);
    const col = (i) => [F[0][i], F[1][i], k > 2 ? F[2][i] : 0];
    const cols = Array.from({ length: n }, (_, i) => col(i));
    const corner = [0, 1, 2].map((r) => -0.5 * cols.reduce((s, c) => s + c[r], 0)); // the all-zero corner

    const rel = objs.map((x) => x.map((xi) => xi - 0.5));
    const P = rel.map((r) => room(r));

    // hypercube: every possible pair of stances
    if (cube) {
      cube.visible = show.cube;
      if (show.cube) {
        const pos = cube.geometry.attributes.position.array;
        [pos[0], pos[1], pos[2]] = corner;
        for (let v = 1; v < 1 << n; v++) {
          const low = v & -v;
          const j = 31 - Math.clz32(low);
          const p = (v ^ low) * 3;
          pos[v * 3] = pos[p] + cols[j][0];
          pos[v * 3 + 1] = pos[p + 1] + cols[j][1];
          pos[v * 3 + 2] = pos[p + 2] + cols[j][2];
        }
        cube.geometry.attributes.position.needsUpdate = true;
      }
    }

    // axes: each topic's range through the centre, faded by how hidden it is
    axes.visible = handles.visible = show.axes;
    const handleR = Math.max(0.006, camDist * 0.0075);
    if (show.axes) {
      const pos = axes.geometry.attributes.position.array;
      const cl = axes.geometry.attributes.color.array;
      for (let i = 0; i < n; i++) {
        const c = cols[i];
        const len = Math.hypot(...c);
        const hot = i === hoverDim;
        for (let r = 0; r < 3; r++) {
          pos[i * 6 + r] = -0.5 * c[r];
          pos[i * 6 + 3 + r] = 0.5 * c[r];
        }
        tips[i].set(0.5 * c[0], 0.5 * c[1], 0.5 * c[2]);
        tmpColor.copy(colors.bg).lerp(hot ? colors.fg : colors.muted, hot ? 0.35 : 0.08 + 0.25 * len);
        tmpColor.toArray(cl, i * 6);
        tmpColor.copy(colors.bg).lerp(hot ? colors.fg : colors.muted, hot ? 1 : 0.25 + 0.75 * len);
        tmpColor.toArray(cl, i * 6 + 3);
        const sc = handleR * (hot ? 1.8 : 0.6 + 0.6 * len);
        handles.setMatrixAt(i, tmpMatrix.makeScale(sc, sc, sc).setPosition(tips[i]));
        handles.setColorAt(i, tmpColor);
      }
      axes.geometry.attributes.position.needsUpdate = true;
      axes.geometry.attributes.color.needsUpdate = true;
      handles.instanceMatrix.needsUpdate = true;
      if (handles.instanceColor) handles.instanceColor.needsUpdate = true;
    }
    for (let i = 0; i < n; i++) {
      const len = Math.hypot(...cols[i]);
      const hot = i === hoverDim;
      const visible = show.axes && show.labels && (hot || len > 0.3);
      paramLabels[i].position.copy(tips[i]).multiplyScalar(1 + (0.06 * camDist) / Math.max(0.05, len));
      setLabel(paramLabels[i], visible, hot ? 1 : 0.35 + 0.65 * len, hot);
    }

    // build-up paths: from the all-zero corner, one topic at a time, to each person's point
    for (let o = 0; o < 2; o++) {
      paths[o].visible = joints[o].visible = show.path;
      if (!show.path) continue;
      const pos = paths[o].geometry.attributes.position.array;
      const jp = joints[o].geometry.attributes.position.array;
      const p = corner.slice();
      pos.set(p, 0);
      for (let i = 0; i < n; i++) {
        jp.set(p, i * 3);
        for (let r = 0; r < 3; r++) p[r] += objs[o][i] * cols[i][r];
        pos.set(p, (i + 1) * 3);
      }
      paths[o].geometry.attributes.position.needsUpdate = true;
      joints[o].geometry.attributes.position.needsUpdate = true;
    }

    // the two people and the line between them
    const objR = Math.max(0.012, camDist * 0.014);
    for (let o = 0; o < 2; o++) {
      objMesh[o].position.copy(P[o]);
      objMesh[o].scale.setScalar(objR);
      objLabel[o].position.copy(P[o]).add(new THREE.Vector3(0, objR * (o ? -2.6 : 2.2), 0));
    }
    const dist = nd.norm(nd.sub(objs[0], objs[1]));
    const seen = P[0].distanceTo(P[1]);
    segment.visible = seen > 1e-6;
    if (segment.visible) {
      const dir = P[1].clone().sub(P[0]);
      segment.position.copy(P[0]).addScaledVector(dir, 0.5);
      segment.quaternion.copy(tmpQuat.setFromUnitVectors(UP, dir.normalize()));
      const r = Math.max(0.002, camDist * 0.0022);
      segment.scale.set(r, seen, r);
    }
    distLabel.position.copy(P[0]).lerp(P[1], 0.5);
    // the room works in 0…1 units; our distances are in stance units (-1…+1), twice as big
    const distText = `${(seen * 2).toFixed(2)} in view · ${(dist * 2).toFixed(2)} true`;
    if (distLabel.element.textContent !== distText) distLabel.element.textContent = distText;
    setLabel(distLabel, seen > 1e-6, 1);

    // fog follows the eye, so depth reads at any zoom
    scene.fog.near = camDist * 0.7;
    scene.fog.far = camDist * 3.2;

    if (fitTo !== null) {
      const d = camDist + (fitTo - camDist) * 0.14;
      camera.position.sub(controls.target).setLength(d).add(controls.target);
      if (Math.abs(fitTo - d) < 1e-3) fitTo = null;
    }
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);

    const inView = dist > 1e-9 ? seen / dist : 1;
    const html =
      `<div>the room shows <b>${Math.round(inView * 100)}%</b> of the true gap between them` +
      (inView > 0.9995 ? ' — <span class="exact">exact: the room contains the line between them</span>' : "") +
      `</div><div class="muted">${n} topics = ${n}-dimensional space. ` +
      (n > k ? `you are looking at a ${k}d slice of it.` : "the whole space fits in the room.") +
      `</div>`;
    if (html !== hudHtml) hud.innerHTML = hudHtml = html;
  }

  function tick(now) {
    if (!running) return;
    const A = state.anim;
    if (A) {
      const t = Math.min(1, (now - A.t0) / A.dur);
      state.frame = A.at(A.ease ? t * t * (3 - 2 * t) : t);
      if (t >= 1) {
        state.anim = null;
        A.onDone?.();
      }
    }
    // the grand tour: keep drifting toward a fresh random room, one leg after another
    if (state.tour && !state.anim) animateTo(nd.randomFrame(state.n, state.frame.length), 5000, false);
    render();
    requestAnimationFrame(tick);
  }

  // ---- camera helpers ----
  function screenDir(angle, k) {
    camera.updateMatrixWorld();
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    const d = right.multiplyScalar(Math.cos(angle)).addScaledVector(up, Math.sin(angle));
    return [d.x, d.y, d.z].slice(0, k);
  }

  // frames the people (and the hypercube) at the current viewing angle
  function fit() {
    const { frame: F, objs } = state;
    if (!F) return;
    let r = 0.5;
    for (const x of objs) r = Math.max(r, nd.norm(nd.project(x.map((xi) => xi - 0.5), F)));
    if (state.show.cube && cube) {
      const pos = cube.geometry.attributes.position.array; // as of the last frame
      for (let v = 0; v < pos.length; v += 3) r = Math.max(r, Math.hypot(pos[v], pos[v + 1], pos[v + 2]));
    }
    fitTo = (r * 1.25) / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2));
  }

  function home() {
    controls.target.set(0, 0, 0);
    camera.position.copy(HOME);
    fit();
  }

  // ---- pointer: drag an axis tip to tilt the room; click one to toggle it; anything else orbits ----
  const el = renderer.domElement;
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane();
  const hit = new THREE.Vector3();
  const proj = new THREE.Vector3();
  let drag = null;

  const local = (e) => {
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  function pick(x, y) {
    if (!state.show.axes) return -1;
    let best = -1;
    let bestD = PICK_PX;
    for (let i = 0; i < tips.length; i++) {
      proj.copy(tips[i]).project(camera);
      if (proj.z > 1) continue;
      const d = Math.hypot(((proj.x + 1) / 2) * W - x, ((1 - proj.y) / 2) * H - y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }

  function setHover(i, fromPointer = false) {
    if (state.hoverDim === i) return;
    state.hoverDim = i;
    if (fromPointer) onHover(i);
  }

  // capture phase, so this runs before orbit controls and can switch them off for an axis drag
  el.addEventListener(
    "pointerdown",
    (e) => {
      const { x, y } = local(e);
      const i = pick(x, y);
      if (i < 0) return;
      controls.enabled = false;
      el.setPointerCapture(e.pointerId);
      const normal = new THREE.Vector3();
      camera.getWorldDirection(normal);
      plane.setFromNormalAndCoplanarPoint(normal, tips[i]);
      drag = { dim: i, x, y, moved: false };
      setHover(i, true);
      el.classList.add("dragging");
    },
    { capture: true }
  );

  el.addEventListener("pointermove", (e) => {
    const { x, y } = local(e);
    if (!drag) {
      if (e.buttons) return; // orbiting
      const i = pick(x, y);
      setHover(i, true);
      el.classList.toggle("on-handle", i >= 0);
      return;
    }
    if (!drag.moved && Math.hypot(x - drag.x, y - drag.y) < 4) return; // a click, not yet a drag
    drag.moved = true;
    raycaster.setFromCamera(new THREE.Vector2((x / W) * 2 - 1, -(y / H) * 2 + 1), camera);
    if (!raycaster.ray.intersectPlane(plane, hit)) return;
    const k = state.frame.length;
    actions.tilt(drag.dim, [hit.x * 2, hit.y * 2, hit.z * 2].slice(0, k)); // the tip sits at half the column
  });

  const endDrag = () => {
    if (!drag) return;
    if (!drag.moved) actions.toggleAxis(drag.dim);
    drag = null;
    controls.enabled = true;
    el.classList.remove("dragging");
  };
  el.addEventListener("pointerup", endDrag);
  el.addEventListener("pointercancel", () => {
    drag = null;
    controls.enabled = true;
    el.classList.remove("dragging");
  });
  el.addEventListener("pointerleave", () => {
    if (!drag) setHover(-1, true);
  });

  window.addEventListener("keydown", (e) => {
    if (!running || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest?.("input, textarea, select, button")) return;
    const keys = { " ": actions.toggleTour, f: actions.face, r: actions.reset, z: actions.fit };
    const fn = keys[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  });

  // ---- public ----
  return {
    // model.dims must have 2 or more topics
    setModel(model) {
      const n = model.dims.length;
      state.model = model;
      state.n = n;
      state.objs = [model.dims.map((d) => toUnit(d.p.score)), model.dims.map((d) => toUnit(d.q.score))];
      state.anim = null;
      state.tour = false;
      state.lock = true;
      state.hoverDim = -1;
      state.frame = nd.axisFrame(n, roomDims(n));
      state.frame = nd.alignFrame(faceTarget(), state.frame);
      objLabel[0].element.textContent = model.p.name;
      objLabel[1].element.textContent = model.q.name;
      if (built !== model) build(n);
      syncButtons();
      resize();
      home();
    },
    // highlight a topic's axis (from the sidebar)
    highlight: (i) => setHover(i, false),
    start() {
      if (running) return;
      running = true;
      resize();
      requestAnimationFrame(tick);
    },
    pause() {
      running = false;
    },
  };
}
