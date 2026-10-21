// n-dimensional space -- representation test (3d).
// two objects (1, 2) are set by n parameters (a, b, c, …), each a value from 0 to 1. each parameter is
// one axis, so each object is a point in n-dimensional space. we look at that space through a 3d "room"
// -- a 3d slice of it (see src/nd.js) -- and navigate two ways: orbit inside the room (ordinary 3d), or
// tilt the room itself through the n dimensions.
//
// app.js owns the state and the actions that change it; src/view.js draws it and src/panel.js edits it.

import * as nd from './src/nd.js';
import { N_MIN, N_MAX, CROWD_MAX, roomDims } from './src/constants.js';
import { createView } from './src/view.js';
import { createPanel } from './src/panel.js';

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const rand01 = () => Math.round(Math.random() * 100) / 100;

const state = {
    n: 5,
    objs: [
        [0.8, 0.4, 0.7, 0.6, 0.3],
        [0.3, 0.7, 0.2, 0.65, 0.6],
    ],
    frame: nd.axisFrame(5, 3), // a, b, c along the room's x, y, z; d and e hidden
    lock: false, // keep the room containing the 1–2 line, so the distance in view is exact
    tour: false,
    tourSec: 5,
    anim: null, // a room transition in progress: { at(e) -> frame, t0, dur, ease, onDone }
    show: { cube: true, axes: true, labels: true, path: true, depth: false, crowd: false },
    crowdSize: 500,
    hoverDim: -1,
    version: 0, // bumps whenever the objects or n change (the crowd's true distances depend on it)
};

// the crowd: random objects with values for every possible parameter, so changing n keeps them stable
const crowdData = { stride: N_MAX, values: Float32Array.from({ length: CROWD_MAX * N_MAX }, Math.random) };

// a room holding the 1–2 line and their midpoint (and, for the third direction, whatever the room
// already shows). any room containing that line shows the 1–2 distance exactly.
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

// any hand-driven room move takes over from the tour, the lock and running transitions
function stopAuto() {
    state.anim = null;
    if (state.tour || state.lock) {
        state.tour = false;
        state.lock = false;
        panel.sync();
    }
}

function valuesChanged(fromOutsideSliders = false) {
    state.version++;
    if (state.lock) state.frame = nd.alignFrame(faceTarget(), state.frame);
    if (fromOutsideSliders) panel.syncValues();
    else panel.updateBars();
}

const actions = {
    setN(n) {
        n = clamp(Math.round(n) || N_MIN, N_MIN, N_MAX);
        if (n !== state.n) {
            state.anim = null;
            state.objs = state.objs.map((x) => nd.resizeVec(x, n, rand01));
            state.frame = nd.resizeFrame(state.frame, n, roomDims(n));
            state.n = n;
            state.version++;
            if (state.hoverDim >= n) state.hoverDim = -1;
            if (state.lock) state.frame = faceTarget();
            panel.build();
            view.fit(state);
        }
        panel.sync();
    },
    setValue(o, i, value) {
        state.objs[o][i] = value;
        valuesChanged();
    },
    randomize() {
        state.objs = state.objs.map((x) => x.map(rand01));
        valuesChanged(true);
    },
    copy() {
        state.objs[1] = state.objs[0].slice();
        valuesChanged(true);
    },
    opposite() {
        state.objs[1] = state.objs[0].map((x) => Math.round((1 - x) * 100) / 100);
        valuesChanged(true);
    },

    face() {
        if (state.lock) {
            state.lock = false;
        } else {
            state.tour = false;
            animateTo(faceTarget(), 1000, true, () => {
                state.lock = true;
                state.frame = nd.alignFrame(faceTarget(), state.frame); // in case the values moved mid-flight
                panel.sync();
                view.fit(state);
            });
        }
        panel.sync();
    },
    toggleTour() {
        state.tour = !state.tour;
        state.anim = null;
        if (state.tour) state.lock = false;
        panel.sync();
    },
    reset() {
        stopAuto();
        animateTo(nd.axisFrame(state.n, state.frame.length), 800);
        view.home(state);
    },
    fit() {
        view.fit(state);
    },

    // bring parameter i fully into the room, or push it out into the hidden dimensions
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
            const dir = len > 0.05 ? nd.scale(c0, 1 / len) : view.screenDir(i * 2.39996, k);
            tip = nd.scale(dir, 0.98);
        }
        animate((e) => nd.setAxisTip(F0, i, c0.map((c, r) => c + (tip[r] - c) * e)), 800, true);
    },

    setTourSec(s) {
        state.tourSec = s;
        panel.sync();
    },
    setShow(key, on) {
        state.show[key] = on;
        panel.sync();
    },
    setCrowdSize(size) {
        state.crowdSize = clamp(size, 1, CROWD_MAX);
        panel.sync();
    },
    setHover(i, fromView = false) {
        state.hoverDim = i;
        hoverFromView = fromView;
    },

    // from the view: an axis tip dragged to t (a point in the room, in units of the full axis)
    tilt(i, t) {
        stopAuto();
        state.frame = nd.setAxisTip(state.frame, i, t);
    },
};

let hoverFromView = false;

function tick(now) {
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
    if (state.tour && !state.anim) animateTo(nd.randomFrame(state.n, state.frame.length), state.tourSec * 1000, false);
    view.render(state);
    panel.updateView(hoverFromView);
    requestAnimationFrame(tick);
}

window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest?.('input, textarea, select, button')) return;
    const keys = { ' ': actions.toggleTour, f: actions.face, r: actions.reset, z: actions.fit };
    const fn = keys[e.key];
    if (fn) {
        e.preventDefault();
        fn();
    }
});

const view = createView(document.getElementById('stage'), document.getElementById('hud'), actions, crowdData);
const panel = createPanel(document.getElementById('panel'), state, actions);
panel.build();
view.fit(state);
requestAnimationFrame(tick);
