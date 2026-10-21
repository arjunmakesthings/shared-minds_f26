// the side panel: dimension count, camera buttons, display toggles, and one row per parameter holding
// both objects' values. it reads state and calls actions; it never changes state itself.

import { N_MIN, N_MAX, CUBE_MAX, CROWD_MAX, paramName } from './constants.js';

const TEMPLATE = `
<header>
    <h1>n-dimensional space</h1>
    <p class="lede">two objects, <span class="o1">1</span> and <span class="o2">2</span>, each set by n
    parameters. every parameter is an axis, every object is a point. you look into a 3d room cut through
    the space: orbit inside it the usual way, and drag an axis tip to tilt the room through the hidden
    dimensions.</p>
</header>

<section class="group">
    <div class="n-row">
        <label for="n-range">dimensions</label>
        <input id="n-range" type="range">
        <input id="n-num" type="number">
    </div>
</section>

<section class="group">
    <h2>navigate</h2>
    <div class="btns">
        <button id="btn-face" title="f">face 1–2</button>
        <button id="btn-tour" title="space">grand tour</button>
        <button id="btn-reset" title="r">reset</button>
        <button id="btn-fit" title="z">zoom to fit</button>
    </div>
    <div class="slider-row">
        <label for="tour-speed">tour: seconds per leg</label>
        <input id="tour-speed" type="range" min="1" max="15" step="0.5">
        <span id="tour-speed-val" class="muted"></span>
    </div>
</section>

<section class="group">
    <h2>objects</h2>
    <div class="btns">
        <button id="btn-rand">randomize both</button>
        <button id="btn-copy">2 = 1</button>
        <button id="btn-opp">2 = opposite of 1</button>
    </div>
</section>

<section class="group">
    <h2>show</h2>
    <div class="toggles">
        <label><input type="checkbox" data-show="cube"> hypercube <span class="muted">(n ≤ ${CUBE_MAX})</span></label>
        <label><input type="checkbox" data-show="axes"> axes</label>
        <label><input type="checkbox" data-show="labels"> axis letters</label>
        <label><input type="checkbox" data-show="path"> build-up paths</label>
        <label><input type="checkbox" data-show="depth"> hidden depth</label>
        <label><input type="checkbox" data-show="crowd"> crowd</label>
    </div>
    <div class="slider-row" id="crowd-row">
        <label for="crowd-size">crowd size</label>
        <input id="crowd-size" type="range" min="50" max="${CROWD_MAX}" step="50">
        <span id="crowd-size-val" class="muted"></span>
    </div>
</section>

<section class="group dims">
    <div class="dim dim-head">
        <span></span>
        <span class="o1">1</span>
        <span class="o2">2</span>
        <span class="vals">1 · 2</span>
        <span title="this parameter's share of the gap between 1 and 2 (relative to the biggest)">gap</span>
        <span title="how much of this axis the room can show">in view</span>
        <span></span>
    </div>
    <div id="dim-list"></div>
</section>
`;

const ROW = `
<span class="letter"></span>
<input class="r1" type="range" min="0" max="1" step="0.01">
<input class="r2" type="range" min="0" max="1" step="0.01">
<span class="vals"></span>
<div class="meter gap"><i></i></div>
<div class="meter view"><i></i></div>
<button class="vis"></button>
`;

const pct = (x) => Math.round(x * 100);

export function createPanel(root, state, actions) {
    root.innerHTML = TEMPLATE;
    const $ = (id) => root.querySelector(`#${id}`);
    const nRange = $('n-range');
    const nNum = $('n-num');
    const list = $('dim-list');
    const tourSpeed = $('tour-speed');
    const crowdSize = $('crowd-size');
    const toggles = [...root.querySelectorAll('[data-show]')];
    let rows = [];
    let lastHover = -1;

    for (const el of [nRange, nNum]) {
        el.min = N_MIN;
        el.max = N_MAX;
    }
    nRange.addEventListener('input', () => actions.setN(+nRange.value));
    nNum.addEventListener('change', () => actions.setN(+nNum.value));
    $('btn-face').addEventListener('click', actions.face);
    $('btn-tour').addEventListener('click', actions.toggleTour);
    $('btn-reset').addEventListener('click', actions.reset);
    $('btn-fit').addEventListener('click', actions.fit);
    $('btn-rand').addEventListener('click', actions.randomize);
    $('btn-copy').addEventListener('click', actions.copy);
    $('btn-opp').addEventListener('click', actions.opposite);
    tourSpeed.addEventListener('input', () => actions.setTourSec(+tourSpeed.value));
    crowdSize.addEventListener('input', () => actions.setCrowdSize(+crowdSize.value));
    for (const cb of toggles) cb.addEventListener('change', () => actions.setShow(cb.dataset.show, cb.checked));

    function build() {
        list.textContent = '';
        lastHover = -1;
        rows = Array.from({ length: state.n }, (_, i) => {
            const el = document.createElement('div');
            el.className = 'dim';
            el.innerHTML = ROW;
            const r = {
                el,
                r1: el.querySelector('.r1'),
                r2: el.querySelector('.r2'),
                vals: el.querySelector('.vals'),
                gapBox: el.querySelector('.gap'),
                gap: el.querySelector('.gap i'),
                view: el.querySelector('.view i'),
                vis: el.querySelector('.vis'),
                shown: null,
            };
            const name = paramName(i);
            el.querySelector('.letter').textContent = name;
            r.r1.setAttribute('aria-label', `${name} for object 1`);
            r.r2.setAttribute('aria-label', `${name} for object 2`);
            r.r1.addEventListener('input', () => actions.setValue(0, i, +r.r1.value));
            r.r2.addEventListener('input', () => actions.setValue(1, i, +r.r2.value));
            r.vis.addEventListener('click', () => actions.toggleAxis(i));
            el.addEventListener('mouseenter', () => actions.setHover(i));
            el.addEventListener('mouseleave', () => actions.setHover(-1));
            list.append(el);
            return r;
        });
        syncValues();
        sync();
    }

    // after the values change from outside the sliders (randomize, copy, ...)
    function syncValues() {
        rows.forEach((r, i) => {
            r.r1.value = state.objs[0][i];
            r.r2.value = state.objs[1][i];
        });
        updateBars();
    }

    function updateBars() {
        const [x1, x2] = state.objs;
        const sq = x1.map((x, i) => (x - x2[i]) ** 2);
        const total = sq.reduce((s, x) => s + x, 0);
        const max = Math.max(...sq, 1e-12);
        rows.forEach((r, i) => {
            r.vals.textContent = `${pct(x1[i])} · ${pct(x2[i])}`;
            r.gap.style.width = `${(sq[i] / max) * 100}%`;
            r.gapBox.title = total > 0 ? `${((sq[i] / total) * 100).toFixed(1)}% of the squared distance` : 'the objects are identical';
        });
    }

    // every frame: how much of each axis the room shows, and which parameter is highlighted
    function updateView(scrollToHover) {
        const F = state.frame;
        const noneHidden = state.n <= F.length;
        rows.forEach((r, i) => {
            const len = Math.hypot(...F.map((f) => f[i]));
            r.view.style.width = `${len * 100}%`;
            const shown = noneHidden ? 'all' : len > 0.5;
            if (shown !== r.shown) {
                r.shown = shown;
                r.vis.textContent = shown === 'all' ? '—' : shown ? 'hide' : 'show';
                r.vis.disabled = shown === 'all';
                r.vis.title = shown === 'all' ? 'nothing is hidden at this n' : shown ? 'tilt the room away from this parameter' : 'tilt the room to show this parameter';
            }
        });
        if (state.hoverDim !== lastHover) {
            rows[lastHover]?.el.classList.remove('hover');
            const row = rows[state.hoverDim];
            row?.el.classList.add('hover');
            if (row && scrollToHover) row.el.scrollIntoView({ block: 'nearest' });
            lastHover = state.hoverDim;
        }
    }

    // buttons and toggles
    function sync() {
        nRange.value = nNum.value = state.n;
        const face = $('btn-face');
        face.classList.toggle('on', state.lock);
        face.textContent = state.lock ? 'facing 1–2 (locked)' : 'face 1–2';
        const tour = $('btn-tour');
        tour.classList.toggle('on', state.tour);
        tour.textContent = state.tour ? 'stop tour' : 'grand tour';
        tourSpeed.value = state.tourSec;
        $('tour-speed-val').textContent = `${state.tourSec}s`;
        crowdSize.value = state.crowdSize;
        $('crowd-size-val').textContent = state.crowdSize;
        $('crowd-row').hidden = !state.show.crowd;
        for (const cb of toggles) {
            cb.checked = state.show[cb.dataset.show];
            if (cb.dataset.show === 'cube') cb.disabled = state.n > CUBE_MAX;
        }
    }

    return { build, syncValues, updateBars, updateView, sync };
}
