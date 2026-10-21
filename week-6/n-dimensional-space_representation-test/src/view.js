// the 3d view: draws the room (the camera's 3d slice of n-d space) with three.js, and turns pointer input
// into moves. orbiting/panning/zooming moves your eye around inside the room (ordinary 3d); dragging an
// axis tip tilts the room itself through the n dimensions (the n-d part).
//
// positions are measured from the centre of the space (every parameter at 0.5), so the hypercube of all
// possible objects sits around the origin.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import * as nd from './nd.js';
import { CUBE_MAX, CROWD_MAX, NEAREST_K, paramName } from './constants.js';

const PICK_PX = 14;
const HOME = new THREE.Vector3(1.25, 0.85, 1.95);

export function createView(container, hud, actions, crowdData) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.append(renderer.domElement);
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.domElement.className = 'labels';
    container.append(labelRenderer.domElement);

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
    let crowdKey = ''; // what the crowd's colours were last computed for
    let crowdStats = null;
    let fitTo = null; // camera distance we're easing toward
    let hudHtml = '';
    const mats = {
        cube: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.55, fog: true }),
        axes: new THREE.LineBasicMaterial({ vertexColors: true, fog: true }),
        handles: new THREE.MeshBasicMaterial(),
        path: [0, 1].map(() => new THREE.LineBasicMaterial({ transparent: true, opacity: 0.6 })),
        hot: new THREE.LineBasicMaterial({ vertexColors: true }),
        joints: [0, 1].map(() => new THREE.PointsMaterial({ size: 4, sizeAttenuation: false, transparent: true, opacity: 0.8 })),
        obj: [0, 1].map(() => new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.05 })),
        halo: [0, 1].map(() => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide })),
        haloWire: [0, 1].map(() => new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.12, depthWrite: false })),
        segment: new THREE.MeshBasicMaterial(),
        crowd: new THREE.PointsMaterial({ size: 3.5, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.9 }),
        nearest: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.45 }),
    };

    // --- things that don't depend on n ---

    const sphereGeo = new THREE.SphereGeometry(1, 32, 16);
    const objMesh = [0, 1].map((o) => {
        const m = new THREE.Mesh(sphereGeo, mats.obj[o]);
        scene.add(m);
        return m;
    });
    const halo = [0, 1].map((o) => {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(sphereGeo, mats.halo[o]), new THREE.Mesh(new THREE.SphereGeometry(1, 18, 10), mats.haloWire[o]));
        scene.add(g);
        return g;
    });
    const segment = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 10, 1), mats.segment);
    scene.add(segment);
    const objLabel = [0, 1].map((o) => addLabel(`label obj o${o + 1}`, String(o + 1)));
    const distLabel = addLabel('label dist', '');

    const hotLine = new THREE.LineSegments(new THREE.BufferGeometry(), mats.hot);
    hotLine.geometry.setAttribute('position', dynamic(new Float32Array(12), 3));
    hotLine.geometry.setAttribute('color', dynamic(new Float32Array(12), 3));
    scene.add(hotLine);

    const crowd = new THREE.Points(new THREE.BufferGeometry(), mats.crowd);
    crowd.geometry.setAttribute('position', dynamic(new Float32Array(CROWD_MAX * 3), 3));
    crowd.geometry.setAttribute('color', dynamic(new Float32Array(CROWD_MAX * 3), 3));
    crowd.frustumCulled = false;
    scene.add(crowd);
    const nearest = new THREE.LineSegments(new THREE.BufferGeometry(), mats.nearest);
    nearest.geometry.setAttribute('position', dynamic(new Float32Array(NEAREST_K * 6), 3));
    nearest.frustumCulled = false;
    scene.add(nearest);

    // --- things rebuilt whenever n changes ---

    let built = -1;
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
            g.setAttribute('position', dynamic(new Float32Array(V * 3), 3));
            g.setIndex(idx);
            cube = new THREE.LineSegments(g, mats.cube);
            cube.frustumCulled = false;
            scene.add(cube);
        }

        const ag = new THREE.BufferGeometry();
        ag.setAttribute('position', dynamic(new Float32Array(n * 6), 3));
        ag.setAttribute('color', dynamic(new Float32Array(n * 6), 3));
        axes = new THREE.LineSegments(ag, mats.axes);
        axes.frustumCulled = false;
        scene.add(axes);

        handles = new THREE.InstancedMesh(sphereGeo, mats.handles, n);
        handles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        handles.frustumCulled = false;
        scene.add(handles);

        paths = [0, 1].map((o) => {
            const g = new THREE.BufferGeometry();
            g.setAttribute('position', dynamic(new Float32Array((n + 1) * 3), 3));
            const line = new THREE.Line(g, mats.path[o]);
            line.frustumCulled = false;
            scene.add(line);
            return line;
        });
        joints = [0, 1].map((o) => {
            const g = new THREE.BufferGeometry();
            g.setAttribute('position', dynamic(new Float32Array(n * 3), 3));
            const pts = new THREE.Points(g, mats.joints[o]);
            pts.frustumCulled = false;
            scene.add(pts);
            return pts;
        });

        paramLabels = Array.from({ length: n }, (_, i) => addLabel('label param', paramName(i)));
        tips = Array.from({ length: n }, () => new THREE.Vector3());
        built = n;
    }

    function addLabel(className, text) {
        const el = document.createElement('div');
        el.className = className;
        el.textContent = text;
        const obj = new CSS2DObject(el);
        scene.add(obj);
        return obj;
    }

    // --- theme ---

    function applyTheme() {
        const cs = getComputedStyle(document.documentElement);
        for (const key of ['bg', 'fg', 'muted', 'line', 'o1', 'o2']) colors[key] = new THREE.Color(cs.getPropertyValue(`--${key}`).trim());
        scene.background = colors.bg;
        scene.fog.color = colors.bg;
        mats.cube.color = colors.line;
        mats.segment.color = colors.fg;
        [colors.o1, colors.o2].forEach((c, o) => {
            for (const m of [mats.path[o], mats.joints[o], mats.obj[o], mats.halo[o], mats.haloWire[o]]) m.color = c;
        });
        mats.nearest.color = colors.o1;
        crowdKey = ''; // recolour
    }
    applyTheme();
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

    // --- size ---

    let W = 1;
    let H = 1;
    function resize() {
        W = container.clientWidth;
        H = container.clientHeight;
        renderer.setSize(W, H);
        labelRenderer.setSize(W, H);
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(container);
    resize();

    // --- per-frame update ---

    const tmpColor = new THREE.Color();
    const tmpMatrix = new THREE.Matrix4();
    const tmpQuat = new THREE.Quaternion();
    const UP = new THREE.Vector3(0, 1, 0);
    const labelState = new WeakMap(); // avoids touching the dom when nothing changed

    function render(state) {
        const { n, frame: F, objs, show, hoverDim } = state;
        if (n !== built) build(n);
        const k = F.length;
        const camDist = camera.position.distanceTo(controls.target);

        // the room position of any n-d point (relative to the centre of the space), as a three.js vector
        const room = (rel, out = new THREE.Vector3()) => out.set(nd.dot(rel, F[0]), nd.dot(rel, F[1]), k > 2 ? nd.dot(rel, F[2]) : 0);
        const col = (i) => [F[0][i], F[1][i], k > 2 ? F[2][i] : 0];
        const cols = Array.from({ length: n }, (_, i) => col(i));
        const corner = [0, 1, 2].map((r) => -0.5 * cols.reduce((s, c) => s + c[r], 0)); // the all-zero corner

        const rel = objs.map((x) => x.map((xi) => xi - 0.5));
        const P = rel.map((r) => room(r));

        // hypercube
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

        // axes: each parameter's 0 → 1 range through the centre, faded by how hidden it is
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
                const s = handleR * (hot ? 1.8 : 0.6 + 0.6 * len);
                handles.setMatrixAt(i, tmpMatrix.makeScale(s, s, s).setPosition(tips[i]));
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

        // build-up paths: from the all-zero corner, one parameter at a time, to the object's point
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
        hotLine.visible = show.path && hoverDim >= 0 && hoverDim < n;
        if (hotLine.visible) {
            const src = paths.map((l) => l.geometry.attributes.position.array);
            const pos = hotLine.geometry.attributes.position.array;
            const cl = hotLine.geometry.attributes.color.array;
            for (let o = 0; o < 2; o++) {
                pos.set(src[o].subarray(hoverDim * 3, hoverDim * 3 + 6), o * 6);
                const c = o ? colors.o2 : colors.o1;
                c.toArray(cl, o * 6);
                c.toArray(cl, o * 6 + 3);
            }
            hotLine.geometry.attributes.position.needsUpdate = true;
            hotLine.geometry.attributes.color.needsUpdate = true;
        }

        // the two objects, their hidden depth, and the line between them
        const objR = Math.max(0.012, camDist * 0.014);
        for (let o = 0; o < 2; o++) {
            objMesh[o].position.copy(P[o]);
            objMesh[o].scale.setScalar(objR);
            objLabel[o].position.copy(P[o]).add(new THREE.Vector3(0, objR * 2.2, 0));
            const depth = nd.residual(rel[o], F);
            halo[o].visible = show.depth && depth > 1e-3;
            halo[o].position.copy(P[o]);
            halo[o].scale.setScalar(Math.max(depth, 1e-3));
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
        const distText = `${seen.toFixed(2)} in the room · ${dist.toFixed(2)} true`;
        if (distLabel.element.textContent !== distText) distLabel.element.textContent = distText;
        setLabel(distLabel, seen > 1e-6, 1);

        // the crowd: random other objects, coloured by their *true* n-d distance from object 1
        crowd.visible = nearest.visible = show.crowd;
        if (show.crowd) updateCrowd(state, F, k, P[0]);

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
        updateHud(state, rel, dist, seen);
    }

    function setLabel(obj, visible, opacity, hot = false) {
        const prev = labelState.get(obj);
        const op = opacity.toFixed(2);
        if (prev && prev.visible === visible && prev.op === op && prev.hot === hot) return;
        labelState.set(obj, { visible, op, hot });
        obj.visible = visible;
        obj.element.style.opacity = op;
        obj.element.classList.toggle('hot', hot);
    }

    function updateCrowd(state, F, k, P1) {
        const { n, crowdSize, objs } = state;
        const stride = crowdData.stride;
        const data = crowdData.values;
        const pos = crowd.geometry.attributes.position.array;
        const x = new Array(n);
        for (let j = 0; j < crowdSize; j++) {
            for (let i = 0; i < n; i++) x[i] = data[j * stride + i] - 0.5;
            pos[j * 3] = nd.dot(x, F[0]);
            pos[j * 3 + 1] = nd.dot(x, F[1]);
            pos[j * 3 + 2] = k > 2 ? nd.dot(x, F[2]) : 0;
        }
        crowd.geometry.setDrawRange(0, crowdSize);
        crowd.geometry.attributes.position.needsUpdate = true;

        // true distances only change with the values, not with the view
        const key = `${state.version}:${crowdSize}`;
        if (key !== crowdKey) {
            crowdKey = key;
            const d = new Float32Array(crowdSize);
            for (let j = 0; j < crowdSize; j++) {
                let s = 0;
                for (let i = 0; i < n; i++) s += (data[j * stride + i] - objs[0][i]) ** 2;
                d[j] = Math.sqrt(s);
            }
            const order = Array.from(d.keys()).sort((a, b) => d[a] - d[b]);
            const lo = d[order[0]] ?? 0;
            const hi = d[order.at(-1)] ?? 1;
            const cl = crowd.geometry.attributes.color.array;
            for (let j = 0; j < crowdSize; j++) {
                const t = hi > lo ? (d[j] - lo) / (hi - lo) : 0;
                tmpColor.copy(colors.o1).lerp(colors.muted, Math.pow(t, 0.6)).lerp(colors.bg, 0.15 + 0.45 * t);
                tmpColor.toArray(cl, j * 3);
            }
            crowd.geometry.attributes.color.needsUpdate = true;
            crowdStats = { lo, hi, near: order.slice(0, NEAREST_K) };
        }
        const np = nearest.geometry.attributes.position.array;
        crowdStats.near.forEach((j, m) => {
            P1.toArray(np, m * 6);
            np.set(pos.subarray(j * 3, j * 3 + 3), m * 6 + 3);
        });
        nearest.geometry.setDrawRange(0, crowdStats.near.length * 2);
        nearest.geometry.attributes.position.needsUpdate = true;
    }

    function updateHud(state, rel, dist, seen) {
        const { n, objs, frame } = state;
        const k = frame.length;
        const hidden = Math.sqrt(Math.max(0, dist * dist - seen * seen));
        const inView = dist > 1e-9 ? seen / dist : 1;
        const cos = (x, y) => {
            const d = nd.norm(x) * nd.norm(y);
            return d > 1e-9 ? (nd.dot(x, y) / d).toFixed(2) : '—';
        };
        const planes = (n * (n - 1)) / 2;
        const tilt = k * (n - k);
        const inert = ((n - k) * (n - k - 1)) / 2;
        const lines = [
            `<div class="hud-title"><b>${n}</b> parameters · <b>${n}</b>-dimensional space</div>`,
            `<div>distance between <span class="o1">1</span> and <span class="o2">2</span>: <b>${dist.toFixed(3)}</b> true · <b>${seen.toFixed(3)}</b> in the room · ${hidden.toFixed(3)} hidden</div>`,
            `<div class="hud-bar"><i style="width:${(inView * 100).toFixed(1)}%"></i></div>`,
            `<div>${Math.round(inView * 100)}% of the distance is in view${inView > 0.9995 ? ' — <span class="exact">exact: the room contains the 1–2 line</span>' : ''}</div>`,
            `<div class="muted">largest possible distance √${n} = ${Math.sqrt(n).toFixed(3)} · cosine similarity ${cos(objs[0], objs[1])} from 0, ${cos(rel[0], rel[1])} from the centre</div>`,
            n > k
                ? `<div class="muted">${planes.toLocaleString()} planes to rotate in: ${k === 3 ? 3 : 1} orbit the room, ${tilt.toLocaleString()} tilt it into hidden parameters${inert ? `, ${inert.toLocaleString()} only shuffle hidden ones (no visible change)` : ''}</div>`
                : `<div class="muted">the whole space fits in the room: nothing is hidden</div>`,
        ];
        if (state.show.crowd && crowdStats) {
            const { lo, hi } = crowdStats;
            lines.push(
                `<div class="muted">crowd of ${state.crowdSize}: from <span class="o1">1</span>, nearest ${lo.toFixed(2)} · farthest ${hi.toFixed(2)} · ratio ${(lo / hi).toFixed(2)} (→ 1 as n grows: everything becomes equally far)</div>`,
            );
        }
        const html = lines.join('');
        if (html !== hudHtml) hud.innerHTML = hudHtml = html;
    }

    // --- camera helpers for the app ---

    // a room direction pointing across the screen, turned by `angle` (radians) around the line of sight
    function screenDir(angle, k) {
        camera.updateMatrixWorld();
        const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
        const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
        const d = right.multiplyScalar(Math.cos(angle)).addScaledVector(up, Math.sin(angle));
        return [d.x, d.y, d.z].slice(0, k);
    }

    // frames the objects (and the hypercube) at the current viewing angle
    function fit(state) {
        const { frame: F, objs } = state;
        let r = 0.5;
        for (const x of objs) r = Math.max(r, nd.norm(nd.project(x.map((xi) => xi - 0.5), F)));
        if (state.show.cube && cube) {
            const pos = cube.geometry.attributes.position.array; // as of the last frame
            for (let v = 0; v < pos.length; v += 3) r = Math.max(r, Math.hypot(pos[v], pos[v + 1], pos[v + 2]));
        }
        fitTo = (r * 1.25) / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2));
    }

    function home(state) {
        controls.target.set(0, 0, 0);
        camera.position.copy(HOME);
        fit(state);
    }

    // --- pointer: drag an axis tip to tilt the room; anything else goes to the orbit controls ---

    const el = renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane();
    const hit = new THREE.Vector3();
    const proj = new THREE.Vector3();
    let drag = null;
    let lastState = null;

    const local = (e) => {
        const r = el.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    function pick(x, y) {
        if (!lastState?.show.axes) return -1;
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

    // capture phase, so this runs before orbit controls and can switch them off for an axis drag
    el.addEventListener(
        'pointerdown',
        (e) => {
            const { x, y } = local(e);
            const i = pick(x, y);
            if (i < 0) return;
            controls.enabled = false;
            el.setPointerCapture(e.pointerId);
            const normal = new THREE.Vector3();
            camera.getWorldDirection(normal);
            plane.setFromNormalAndCoplanarPoint(normal, tips[i]);
            drag = { dim: i };
            actions.setHover(i, true);
            el.classList.add('dragging');
        },
        { capture: true },
    );

    el.addEventListener('pointermove', (e) => {
        const { x, y } = local(e);
        if (!drag) {
            if (e.buttons) return; // orbiting
            const i = pick(x, y);
            actions.setHover(i, true);
            el.classList.toggle('on-handle', i >= 0);
            return;
        }
        raycaster.setFromCamera(new THREE.Vector2((x / W) * 2 - 1, -(y / H) * 2 + 1), camera);
        if (!raycaster.ray.intersectPlane(plane, hit)) return;
        const k = lastState.frame.length;
        actions.tilt(drag.dim, [hit.x * 2, hit.y * 2, hit.z * 2].slice(0, k)); // the tip sits at half the column
    });

    const endDrag = () => {
        if (!drag) return;
        drag = null;
        controls.enabled = true;
        el.classList.remove('dragging');
    };
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
    el.addEventListener('pointerleave', () => {
        if (!drag) actions.setHover(-1);
    });

    return {
        render(state) {
            lastState = state;
            render(state);
        },
        fit,
        home,
        screenDir,
    };
}

function dynamic(array, size) {
    return new THREE.BufferAttribute(array, size).setUsage(THREE.DynamicDrawUsage);
}
