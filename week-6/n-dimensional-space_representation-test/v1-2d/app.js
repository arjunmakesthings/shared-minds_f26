// n-dimensional space -- representation test.
// two objects (a, b) are described by n traits, each a value from 0 to 1. each trait is one axis, so each
// object is a point in n-dimensional space. we look at that space through a 2d camera plane (see
// src/nd.js) and navigate by tilting that plane through the n dimensions.
//
// app.js owns the state and the actions that change it; src/view.js draws it and src/panel.js edits it.

import * as nd from './src/nd.js';
import { N_MIN, N_MAX, DEFAULT_NAMES, nameFor } from './src/constants.js';
import { createView } from './src/view.js';
import { createPanel } from './src/panel.js';

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const rand01 = () => Math.round(Math.random() * 100) / 100;

const state = {
    n: 5,
    names: DEFAULT_NAMES.slice(),
    a: [0.8, 0.4, 0.7, 0.6, 0.3],
    b: [0.3, 0.7, 0.2, 0.65, 0.6],
    frame: nd.axisFrame(5, 0, 1), // starts as a plain scatter plot of the first two traits
    zoom: 1,
    lock: false, // keep the camera facing the a–b plane, so the distance on screen is exact
    tour: false,
    tourSec: 4,
    anim: null, // a camera transition in progress
    show: { cube: true, axes: true, path: true, depth: false },
    hoverDim: -1,
};

// the plane through the centre of the space that contains the a–b line (u along it). any plane holding
// that line shows the a–b distance exactly; this one also keeps their midpoint in view.
function faceFrame() {
    const d = nd.sub(state.a, state.b);
    const mid = state.a.map((x, i) => (x + state.b[i]) / 2 - 0.5);
    return nd.orthonormalize(d, mid, [state.frame.u, state.frame.v]);
}

// a zoom at which both points sit comfortably on screen in this frame
function fitZoom(frame) {
    let extent = 0.5;
    for (const x of [state.a, state.b]) {
        const [px, py] = nd.project(x.map((xi) => xi - 0.5), frame);
        extent = Math.max(extent, Math.hypot(px, py));
    }
    return clamp(0.9 / extent, 0.05, 4);
}

function animateTo(target, dur, zoomTo, ease, onDone) {
    state.anim = {
        from: state.frame,
        to: nd.alignFrame(target, state.frame),
        zoomFrom: state.zoom,
        zoomTo,
        t0: performance.now(),
        dur,
        ease,
        onDone,
    };
}

// any hand-driven camera move takes over from the tour, the lock and running transitions
function stopAuto() {
    state.anim = null;
    if (state.tour || state.lock) {
        state.tour = false;
        state.lock = false;
        panel.sync();
    }
}

function valuesChanged(fromOutsideSliders = false) {
    if (state.lock) state.frame = nd.alignFrame(faceFrame(), state.frame);
    if (fromOutsideSliders) panel.syncValues();
    else panel.updateBars();
}

const actions = {
    setN(n) {
        n = clamp(Math.round(n) || N_MIN, N_MIN, N_MAX);
        if (n !== state.n) {
            state.anim = null;
            state.a = nd.resizeVec(state.a, n, rand01);
            state.b = nd.resizeVec(state.b, n, rand01);
            // names only grow, so custom names survive shrinking and growing again
            while (state.names.length < n) state.names.push(nameFor(state.names.length));
            state.frame = nd.resizeFrame(state.frame, n);
            state.n = n;
            if (state.hoverDim >= n) state.hoverDim = -1;
            if (state.lock) state.frame = faceFrame();
            panel.build();
        }
        panel.sync();
    },
    setValue(which, i, value) {
        state[which][i] = value;
        valuesChanged();
    },
    setName(i, name) {
        state.names[i] = name.trim() || nameFor(i);
    },
    randomize() {
        state.a = state.a.map(rand01);
        state.b = state.b.map(rand01);
        valuesChanged(true);
    },
    copyAToB() {
        state.b = state.a.slice();
        valuesChanged(true);
    },
    opposite() {
        state.b = state.a.map((x) => Math.round((1 - x) * 100) / 100);
        valuesChanged(true);
    },

    face() {
        if (state.lock) {
            state.lock = false;
        } else {
            state.tour = false;
            const target = faceFrame();
            animateTo(target, 900, fitZoom(target), true, () => {
                state.lock = true;
                state.frame = nd.alignFrame(faceFrame(), state.frame); // in case a or b moved mid-flight
                panel.sync();
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
        const target = nd.axisFrame(state.n, 0, 1);
        animateTo(target, 700, fitZoom(target), true, null);
    },
    fit() {
        const z = fitZoom(state.anim ? state.anim.to : state.frame);
        if (state.anim) state.anim.zoomFrom = state.anim.zoomTo = z;
        state.zoom = z;
    },
    zoomBy(k) {
        state.zoom = clamp(state.zoom * k, 0.05, 20);
        if (state.anim) {
            state.anim.zoomFrom *= k;
            state.anim.zoomTo *= k;
        }
    },
    setTourSec(s) {
        state.tourSec = s;
    },
    setShow(key, on) {
        state.show[key] = on;
    },
    setHover(i, fromCanvas = false) {
        state.hoverDim = i;
        hoverFromCanvas = fromCanvas;
    },

    // from the view: drag an axis tip, or spin the camera inside its plane
    tilt(i, x, y) {
        stopAuto();
        state.frame = nd.setAxisTip(state.frame, i, x, y);
    },
    spin(theta) {
        stopAuto();
        state.frame = nd.spin(state.frame, theta);
    },
};

let hoverFromCanvas = false;

function tick(now) {
    const A = state.anim;
    if (A) {
        const t = Math.min(1, (now - A.t0) / A.dur);
        const e = A.ease ? t * t * (3 - 2 * t) : t;
        state.frame = nd.lerpFrame(A.from, A.to, e);
        state.zoom = A.zoomFrom + (A.zoomTo - A.zoomFrom) * e;
        if (t >= 1) {
            state.anim = null;
            A.onDone?.();
        }
    }
    // the grand tour: keep drifting toward a fresh random plane, one leg after another
    if (state.tour && !state.anim) animateTo(nd.randomFrame(state.n), state.tourSec * 1000, state.zoom, false, null);
    view.render(state);
    panel.updateView(hoverFromCanvas);
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

const view = createView(document.getElementById('view'), document.getElementById('hud'), actions);
const panel = createPanel(document.getElementById('panel'), state, actions);
state.zoom = fitZoom(state.frame);
panel.build();
requestAnimationFrame(tick);
