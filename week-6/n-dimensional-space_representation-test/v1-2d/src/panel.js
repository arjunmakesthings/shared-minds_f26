// the side panel: dimension count, camera buttons, display toggles, and one row per trait holding both
// objects' values. it reads state and calls actions; it never changes state itself.

import { N_MIN, N_MAX, CUBE_MAX } from './constants.js';

const TEMPLATE = `
<header>
    <h1>n-dimensional space</h1>
    <p class="lede">two objects, n traits each. every trait is an axis and every object is a point. you see
    the space through a flat 2d camera that you can tilt through all n dimensions.</p>
</header>

<section class="group">
    <div class="n-row">
        <label for="n-range">dimensions</label>
        <input id="n-range" type="range">
        <input id="n-num" type="number">
    </div>
</section>

<section class="group">
    <h2>camera</h2>
    <div class="btns">
        <button id="btn-face" title="f">face a–b</button>
        <button id="btn-tour" title="space">grand tour</button>
        <button id="btn-reset" title="r">reset</button>
        <button id="btn-fit" title="z">zoom to fit</button>
    </div>
    <div class="slider-row">
        <label for="tour-speed">tour: seconds per leg</label>
        <input id="tour-speed" type="range" min="1" max="12" step="0.5">
        <span id="tour-speed-val" class="muted"></span>
    </div>
</section>

<section class="group">
    <h2>objects</h2>
    <div class="btns">
        <button id="btn-rand">randomize a & b</button>
        <button id="btn-copy">b = a</button>
        <button id="btn-opp">b = opposite of a</button>
    </div>
</section>

<section class="group">
    <h2>show</h2>
    <div class="toggles">
        <label><input type="checkbox" data-show="cube"> hypercube <span class="muted">(n ≤ ${CUBE_MAX})</span></label>
        <label><input type="checkbox" data-show="axes"> axes</label>
        <label><input type="checkbox" data-show="path"> build-up paths</label>
        <label><input type="checkbox" data-show="depth"> hidden depth</label>
    </div>
</section>

<section class="group dims">
    <div class="dim dim-head">
        <span>trait</span>
        <span class="ca">a</span>
        <span class="cb">b</span>
        <span class="vals">a · b</span>
        <span title="this trait's share of the gap between a and b (relative to the biggest)">gap</span>
        <span title="how much of this axis the camera can see">in view</span>
    </div>
    <div id="dim-list"></div>
</section>
`;

const ROW = `
<input class="name" spellcheck="false" aria-label="trait name">
<input class="ra" type="range" min="0" max="1" step="0.01" aria-label="value for a">
<input class="rb" type="range" min="0" max="1" step="0.01" aria-label="value for b">
<span class="vals"></span>
<div class="meter gap"><i></i></div>
<div class="meter view"><i></i></div>
`;

const pct = (x) => Math.round(x * 100);

export function createPanel(root, state, actions) {
    root.innerHTML = TEMPLATE;
    const $ = (id) => root.querySelector(`#${id}`);
    const nRange = $('n-range');
    const nNum = $('n-num');
    const list = $('dim-list');
    const tourSpeed = $('tour-speed');
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
    $('btn-copy').addEventListener('click', actions.copyAToB);
    $('btn-opp').addEventListener('click', actions.opposite);
    tourSpeed.addEventListener('input', () => {
        actions.setTourSec(+tourSpeed.value);
        sync();
    });
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
                name: el.querySelector('.name'),
                ra: el.querySelector('.ra'),
                rb: el.querySelector('.rb'),
                vals: el.querySelector('.vals'),
                gapBox: el.querySelector('.gap'),
                gap: el.querySelector('.gap i'),
                view: el.querySelector('.view i'),
            };
            r.name.value = state.names[i];
            r.name.addEventListener('input', () => actions.setName(i, r.name.value));
            r.ra.addEventListener('input', () => actions.setValue('a', i, +r.ra.value));
            r.rb.addEventListener('input', () => actions.setValue('b', i, +r.rb.value));
            el.addEventListener('mouseenter', () => actions.setHover(i));
            el.addEventListener('mouseleave', () => actions.setHover(-1));
            list.append(el);
            return r;
        });
        syncValues();
        sync();
    }

    // after a and b change from outside the sliders (randomize, copy, ...)
    function syncValues() {
        rows.forEach((r, i) => {
            r.ra.value = state.a[i];
            r.rb.value = state.b[i];
        });
        updateBars();
    }

    function updateBars() {
        const sq = state.a.map((x, i) => (x - state.b[i]) ** 2);
        const total = sq.reduce((s, x) => s + x, 0);
        const max = Math.max(...sq, 1e-12);
        rows.forEach((r, i) => {
            r.vals.textContent = `${pct(state.a[i])} · ${pct(state.b[i])}`;
            r.gap.style.width = `${(sq[i] / max) * 100}%`;
            r.gapBox.title = total > 0 ? `${((sq[i] / total) * 100).toFixed(1)}% of the squared distance` : 'a and b are identical';
        });
    }

    // every frame: how much of each axis the camera sees, and which trait is highlighted
    function updateView(scrollToHover = false) {
        const { u, v } = state.frame;
        rows.forEach((r, i) => (r.view.style.width = `${Math.hypot(u[i], v[i]) * 100}%`));
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
        face.textContent = state.lock ? 'facing a–b (locked)' : 'face a–b';
        const tour = $('btn-tour');
        tour.classList.toggle('on', state.tour);
        tour.textContent = state.tour ? 'stop tour' : 'grand tour';
        tourSpeed.value = state.tourSec;
        $('tour-speed-val').textContent = `${state.tourSec}s`;
        for (const cb of toggles) {
            cb.checked = state.show[cb.dataset.show];
            if (cb.dataset.show === 'cube') cb.disabled = state.n > CUBE_MAX;
        }
    }

    return { build, syncValues, updateBars, updateView, sync };
}
