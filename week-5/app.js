// exquisite cursors -- the page everyone watches. it reads turns, strokes and titles from supabase,
// animates whichever model's cursor is up, and lets visitors title the drawing. it never writes
// drawing data: only the worker does (worker/worker.js).

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { PERSONAS, PERSONA_BY_ID } from './shared/personas.js';
import { CANVAS_W, CANVAS_H, PAPER, densify, drawPath, buildTimeline, penAt, idleAt } from './shared/draw.js';

const STALE_MS = 20000; // nothing open this long after a turn ended -> the worker is off (the worker waits 3s between turns)
const TITLE_LIMIT = 500;
const NAME_KEY = 'exquisite-cursors:name';

const $ = (id) => document.getElementById(id);
const els = {
    stage: $('stage'),
    frameArea: $('frame-area'),
    frameWrap: $('frame-wrap'),
    frame: $('frame'),
    base: $('base'),
    live: $('live'),
    dock: $('dock'),
    cursors: $('cursors'),
    status: $('status'),
    offline: $('offline'),
    offlineText: $('offline-text'),
    statusText: $('status-text'),
    statusClock: $('status-clock'),
    frameTitle: $('frame-title'),
    frameTurn: $('frame-turn'),
    form: $('title-form'),
    nameInput: $('name-input'),
    titleInput: $('title-input'),
    submit: $('submit'),
    formStatus: $('form-status'),
    titles: $('titles'),
    titleCount: $('title-count'),
    titlesEmpty: $('titles-empty'),
};

const configured = !SUPABASE_URL.includes('your-project-ref');
const db = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const state = {
    turn: null, // the latest turn row
    strokes: new Map(), // turn id -> [{ id, seq, width, dense, baked }] in seq order
    strokeIds: new Set(),
    lastStrokeId: 0,
    pending: new Set(), // turn ids with strokes not yet drawn into the base canvas
    timeline: null, // { turnId, count, timeline } for the turn being drawn
    anchor: null, // { turnId, point } where that turn's cursor idles while thinking
    titleIds: new Set(),
    lastTitleId: 0,
    titleCount: 0,
    latestTitle: null,
    loadError: null,
};

// where the frame sits on the stage, in css px
const view = { scale: 1, dpr: 1, frameX: 0, frameY: 0 };
const baseCtx = els.base.getContext('2d');
const liveCtx = els.live.getContext('2d');

// --- the dock and the cursors ----------------------------------------------------------------------

// figma-style arrow; its tip sits at (2, 2)
const ARROW = '<svg viewBox="0 0 18 24"><path d="M2 2 L2 19 L6.5 15 L9.6 21.6 L12.6 20.3 L9.6 13.8 L15.6 13.8 Z"/></svg>';

const cursors = PERSONAS.map((persona) => {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.style.setProperty('--c', persona.color);
    slot.innerHTML = `
        <div class="slot-spot"></div>
        <div class="slot-name"></div>
        <div class="slot-sub"></div>
        <div class="slot-card"><b></b><span class="tag"></span><span class="mdl"></span></div>`;
    const age = persona.label.split(', ').pop();
    const subText = `${age} · ${persona.model.split('/').pop()}`;
    slot.querySelector('.slot-name').textContent = persona.name;
    slot.querySelector('.slot-sub').textContent = subText;
    slot.querySelector('.slot-card b').textContent = persona.label;
    slot.querySelector('.slot-card .tag').textContent = persona.tagline;
    slot.querySelector('.slot-card .mdl').textContent = persona.model;
    els.dock.append(slot);

    const el = document.createElement('div');
    el.className = 'cursor is-docked';
    el.style.setProperty('--c', persona.color);
    el.innerHTML = `${ARROW}<div class="pill"><b></b><span class="say"></span></div>`;
    el.querySelector('.pill b').textContent = persona.name;
    els.cursors.append(el);

    return {
        persona,
        slot,
        el,
        spot: slot.querySelector('.slot-spot'),
        sub: slot.querySelector('.slot-sub'),
        say: el.querySelector('.say'),
        subText,
        home: [0, 0],
        x: null,
        y: null,
        up: false,
        lastSay: null,
        lastSub: subText,
    };
});

function nextPersona(turn) {
    const i = PERSONAS.findIndex((p) => p.id === turn.model_id);
    return PERSONAS[(i + 1) % PERSONAS.length];
}

// --- layout ----------------------------------------------------------------------------------------

function layout() {
    const area = els.frameArea.getBoundingClientRect();
    const pad = getComputedStyle(els.frameArea);
    const labelH = 24;
    const w = area.width - parseFloat(pad.paddingLeft) - parseFloat(pad.paddingRight);
    const h = area.height - parseFloat(pad.paddingTop) - parseFloat(pad.paddingBottom) - labelH;
    const fit = Math.max(0.05, Math.min(w / CANVAS_W, h / CANVAS_H));
    const cssW = Math.floor(CANVAS_W * fit);
    const cssH = Math.floor(CANVAS_H * fit);

    view.scale = cssW / CANVAS_W;
    view.dpr = window.devicePixelRatio || 1;
    els.frameWrap.style.width = `${cssW}px`;
    els.frame.style.width = `${cssW}px`;
    els.frame.style.height = `${cssH}px`;
    for (const canvas of [els.base, els.live]) {
        canvas.width = Math.round(cssW * view.dpr);
        canvas.height = Math.round(cssH * view.dpr);
    }

    const stage = els.stage.getBoundingClientRect();
    const frame = els.frame.getBoundingClientRect();
    view.frameX = frame.left - stage.left;
    view.frameY = frame.top - stage.top;
    for (const c of cursors) {
        const spot = c.spot.getBoundingClientRect();
        c.home = [spot.left - stage.left + 4, spot.top - stage.top + 2];
    }
    redrawBase();
}

function toStage([x, y]) {
    return [view.frameX + x * view.scale, view.frameY + y * view.scale];
}

function scaleCtx(ctx) {
    const s = view.scale * view.dpr;
    ctx.setTransform(s, 0, 0, s, 0, 0);
}

function clearCtx(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

// --- drawing ---------------------------------------------------------------------------------------
// finished turns are "baked" into the base canvas once; the turn in progress is redrawn on the live
// canvas every frame.

function sortedTurnIds() {
    return [...state.strokes.keys()].sort((a, b) => a - b);
}

function drawBaked(ctx) {
    for (const id of sortedTurnIds()) {
        for (const s of state.strokes.get(id)) if (s.baked) drawPath(ctx, s.dense, s.width);
    }
}

function redrawBase() {
    clearCtx(baseCtx);
    scaleCtx(baseCtx);
    drawBaked(baseCtx);
}

// a turn's strokes are settled once its cursor has finished tracing them (or a newer turn exists)
function isSettled(turnId, now) {
    const t = state.turn;
    if (!t || turnId < t.id) return true;
    if (turnId > t.id) return false;
    if (t.status === 'done' || t.status === 'skipped') return true;
    return t.status === 'drawing' && !!t.draw_ends_at && now >= Date.parse(t.draw_ends_at);
}

function bakeSettled(now) {
    if (!state.pending.size) return;
    scaleCtx(baseCtx);
    for (const id of [...state.pending]) {
        if (!isSettled(id, now)) continue;
        for (const s of state.strokes.get(id)) {
            if (s.baked) continue;
            drawPath(baseCtx, s.dense, s.width);
            s.baked = true;
        }
        state.pending.delete(id);
    }
}

// where the pen was last lifted before this turn -- the next cursor picks up from there
function anchorFor(turnId) {
    if (state.anchor?.turnId === turnId) return state.anchor.point;
    let prev = -Infinity;
    for (const [id, list] of state.strokes) if (id < turnId && id > prev && list.length) prev = id;
    let point = [CANVAS_W / 2, CANVAS_H / 2];
    if (prev > -Infinity) {
        const list = state.strokes.get(prev);
        const dense = list[list.length - 1].dense;
        point = dense[dense.length - 1];
    }
    state.anchor = { turnId, point };
    return point;
}

// the pen of the turn being drawn, from the shared clock -- null if nothing is being drawn
function penFor(turn, now) {
    if (!turn || turn.status !== 'drawing' || !turn.draw_started_at) return null;
    const strokes = state.strokes.get(turn.id) ?? [];
    if (!strokes.length || strokes.length < turn.stroke_count) return null; // still arriving
    if (state.timeline?.turnId !== turn.id || state.timeline.count !== strokes.length) {
        state.timeline = { turnId: turn.id, count: strokes.length, timeline: buildTimeline(strokes, anchorFor(turn.id)) };
    }
    const start = Date.parse(turn.draw_started_at);
    const end = Date.parse(turn.draw_ends_at);
    return penAt(state.timeline.timeline, strokes, (now - start) / Math.max(end - start, 1));
}

function drawProgress(ctx, turn, pen) {
    const strokes = state.strokes.get(turn.id);
    for (let i = 0; i < pen.done; i++) drawPath(ctx, strokes[i].dense, strokes[i].width);
    if (pen.partial) drawPath(ctx, pen.partial, strokes[pen.done].width);
}

function drawLive(turn, pen, now) {
    clearCtx(liveCtx);
    if (!pen || isSettled(turn.id, now)) return;
    scaleCtx(liveCtx);
    drawProgress(liveCtx, turn, pen);
}

// --- cursors + status ------------------------------------------------------------------------------

function activeTurn(now) {
    const t = state.turn;
    if (!t || (t.status !== 'thinking' && t.status !== 'drawing')) return null;
    return now < Date.parse(t.ends_at) ? t : null;
}

function moveCursors(now, dt, active, pen) {
    for (const c of cursors) {
        const up = !!active && active.model_id === c.persona.id;
        let target = c.home;
        let k = 5; // how quickly the cursor catches up with its target
        let say = null;
        let sub = c.subText;

        if (up) {
            const thinking = active.status === 'thinking' || !pen;
            target = toStage(pen ? pen.pos : idleAt(anchorFor(active.id), now));
            k = pen ? 30 : 4;
            say = thinking ? 'thinking…' : active.intent ?? '';
            sub = thinking ? 'thinking…' : 'drawing';
        }

        if (c.x === null) [c.x, c.y] = target;
        const a = 1 - Math.exp(-k * dt);
        c.x += (target[0] - c.x) * a;
        c.y += (target[1] - c.y) * a;
        c.el.style.transform = `translate(${c.x - 2}px, ${c.y - 2}px)`;

        if (up !== c.up) {
            c.up = up;
            c.el.classList.toggle('is-docked', !up);
            c.slot.classList.toggle('is-up', up);
        }
        if (say !== null && say !== c.lastSay) c.say.textContent = c.lastSay = say;
        if (sub !== c.lastSub) c.sub.textContent = c.lastSub = sub;
    }
}

function fmtClock(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function setText(el, text) {
    if (el.textContent !== text) el.textContent = text;
}

function renderStatus(now, active) {
    const t = state.turn;
    let text;
    let clock = '';
    let live = false;
    let offline = false;
    if (!configured) {
        text = 'add your supabase url + key to config.js';
    } else if (state.loadError) {
        text = `couldn’t load: ${state.loadError}`;
    } else if (!t) {
        text = 'waiting for the first turn';
    } else if (active) {
        const name = PERSONA_BY_ID[active.model_id]?.name ?? active.model_id;
        text = `${name} is ${active.status === 'drawing' ? 'drawing' : 'thinking…'}`;
        clock = fmtClock(Date.parse(active.ends_at) - now);
        live = true;
    } else if (now - Date.parse(t.ends_at) < STALE_MS) {
        text = `next up: ${nextPersona(t).name}`;
        live = true;
    } else {
        text = 'system offline';
        offline = true;
    }
    setText(els.statusText, text);
    setText(els.statusClock, clock);
    els.status.classList.toggle('is-live', live);
    els.stage.classList.toggle('is-offline', offline);
    if (els.offline.hidden === offline) els.offline.hidden = !offline;
    if (offline && t) {
        const since = `last drawing activity ${timeAgo(Date.parse(t.ends_at))}. `;
        setText(els.offlineText, `${since}the machine that runs the models is turned off, so nothing new is being drawn. you can still look around and title the drawing.`);
    }

    const latest = state.latestTitle;
    setText(els.frameTitle, latest ? `“${latest.title}” — ${latest.name}` : 'untitled');
    setText(els.frameTurn, t ? `turn ${t.id}` : '');
}

let lastFrame = performance.now();
function tick(t) {
    const dt = Math.min((t - lastFrame) / 1000, 0.1);
    lastFrame = t;
    const now = Date.now();
    const turn = state.turn;
    const pen = penFor(turn, now);
    const active = activeTurn(now);
    bakeSettled(now);
    drawLive(turn, pen, now);
    moveCursors(now, dt, active, active ? pen : null);
    renderStatus(now, active);
    requestAnimationFrame(tick);
}

// --- data ------------------------------------------------------------------------------------------

function must({ data, error }) {
    if (error) throw error;
    return data;
}

function addStroke(row) {
    if (!row?.id || state.strokeIds.has(row.id)) return;
    state.strokeIds.add(row.id);
    state.lastStrokeId = Math.max(state.lastStrokeId, row.id);
    const points = typeof row.points === 'string' ? JSON.parse(row.points) : row.points;
    const list = state.strokes.get(row.turn_id) ?? [];
    list.push({ id: row.id, seq: row.seq, width: row.width, dense: densify(points), baked: false });
    list.sort((a, b) => a.seq - b.seq);
    state.strokes.set(row.turn_id, list);
    state.pending.add(row.turn_id);
}

function setTurn(row) {
    if (!row?.id || (state.turn && row.id < state.turn.id)) return;
    state.turn = row;
    const have = state.strokes.get(row.id)?.length ?? 0;
    if (row.status === 'drawing' && have < row.stroke_count) loadTurnStrokes(row.id);
}

async function loadStrokes() {
    while (true) {
        const rows = must(await db.from('strokes')
            .select('id, turn_id, seq, width, points')
            .gt('id', state.lastStrokeId)
            .order('id')
            .limit(1000));
        rows.forEach(addStroke);
        if (rows.length < 1000) return;
    }
}

async function loadTurnStrokes(turnId) {
    const { data } = await db.from('strokes').select('id, turn_id, seq, width, points').eq('turn_id', turnId);
    data?.forEach(addStroke);
}

async function loadTurn() {
    const rows = must(await db.from('turns').select('*').order('id', { ascending: false }).limit(1));
    if (rows[0]) setTurn(rows[0]);
}

async function loadInitialTitles() {
    const { data, count, error } = await db.from('titles')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })
        .limit(TITLE_LIMIT);
    if (error) throw error;
    state.titleCount = count ?? data.length;
    for (const row of data) {
        state.titleIds.add(row.id);
        els.titles.append(titleItem(row, false));
    }
    if (data[0]) {
        state.lastTitleId = data[0].id;
        state.latestTitle = data[0];
    }
    renderTitleCount();
}

async function loadNewTitles() {
    const rows = must(await db.from('titles').select('*').gt('id', state.lastTitleId).order('id'));
    rows.forEach(addNewTitle);
}

function addNewTitle(row) {
    if (!row?.id || state.titleIds.has(row.id)) return;
    state.titleIds.add(row.id);
    state.titleCount++;
    els.titles.prepend(titleItem(row, true));
    if (row.id > state.lastTitleId) {
        state.lastTitleId = row.id;
        state.latestTitle = row;
    }
    renderTitleCount();
}

// catch up on anything missed while disconnected or in a background tab
let syncing = null;
function resync() {
    syncing ??= (async () => {
        try {
            await loadStrokes();
            await loadTurn();
            await loadNewTitles();
        } catch (err) {
            console.warn('resync failed', err);
        } finally {
            syncing = null;
        }
    })();
    return syncing;
}

function subscribe() {
    db.channel('exquisite-cursors')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'turns' }, ({ new: row }) => setTurn(row))
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'strokes' }, ({ new: row }) => addStroke(row))
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'titles' }, ({ new: row }) => addNewTitle(row))
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') resync();
        });
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) resync();
    });
}

// --- titles panel ----------------------------------------------------------------------------------

function timeAgo(ts) {
    const s = Math.max(0, (Date.now() - ts) / 1000);
    if (s < 45) return 'just now';
    if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
    const d = Math.floor(s / 86400);
    return `${d} day${d === 1 ? '' : 's'} ago`;
}

function fmtWhen(ts) {
    const sameYear = new Date(ts).getFullYear() === new Date().getFullYear();
    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        ...(sameYear ? {} : { year: 'numeric' }),
        hour: 'numeric',
        minute: '2-digit',
    }).format(ts);
}

function titleItem(row, isNew) {
    const li = document.createElement('li');
    li.className = isNew ? 'title-item is-new' : 'title-item';
    li.innerHTML = `
        <button class="title-head" type="button" aria-expanded="false">
            <span class="title-text"></span>
            <span class="title-meta"><span class="who"></span> · <time class="ago"></time> · <span class="when"></span></span>
            <svg class="chev" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg>
        </button>
        <div class="title-body" hidden>
            <img alt="">
            <p class="title-context"></p>
        </div>`;

    const ts = Date.parse(row.created_at);
    li.querySelector('.title-text').textContent = `“${row.title}”`;
    li.querySelector('.who').textContent = row.name;
    const ago = li.querySelector('.ago');
    ago.dateTime = row.created_at;
    ago.dataset.ts = ts;
    ago.textContent = timeAgo(ts);
    li.querySelector('.when').textContent = fmtWhen(ts);

    const persona = PERSONA_BY_ID[row.model_id];
    const context = [row.turn_id && `turn ${row.turn_id}`, persona && `${persona.name}’s turn`].filter(Boolean);
    if (!row.snapshot_url) context.push('no snapshot was saved');
    li.querySelector('.title-context').textContent = context.join(' · ');

    const head = li.querySelector('.title-head');
    const body = li.querySelector('.title-body');
    const img = li.querySelector('img');
    img.alt = `the drawing when ${row.name} titled it “${row.title}”`;
    if (!row.snapshot_url) img.remove();
    head.addEventListener('click', () => {
        const open = head.getAttribute('aria-expanded') !== 'true';
        head.setAttribute('aria-expanded', String(open));
        body.hidden = !open;
        if (open && row.snapshot_url && !img.src) img.src = row.snapshot_url; // load on first open
    });
    return li;
}

function renderTitleCount() {
    els.titleCount.textContent = state.titleCount ? String(state.titleCount) : '';
    els.titlesEmpty.hidden = state.titleCount > 0;
}

function refreshAgo() {
    for (const el of els.titles.querySelectorAll('time.ago')) el.textContent = timeAgo(Number(el.dataset.ts));
}

// the drawing exactly as it looks right now, at full 1200 x 750, including the stroke in progress
function snapshotBlob() {
    const now = Date.now();
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    drawBaked(ctx);
    for (const id of state.pending) {
        if (!isSettled(id, now)) continue; // settled but not baked yet (this frame)
        for (const s of state.strokes.get(id)) if (!s.baked) drawPath(ctx, s.dense, s.width);
    }
    const turn = state.turn;
    const pen = penFor(turn, now);
    if (pen && !isSettled(turn.id, now)) drawProgress(ctx, turn, pen);
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('could not encode snapshot'))), 'image/png');
    });
}

function setFormStatus(text, isError = false) {
    els.formStatus.textContent = text;
    els.formStatus.classList.toggle('is-error', isError);
}

function randomId() {
    return crypto.randomUUID();
}

els.form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!db) return setFormStatus('the page isn’t connected to supabase yet', true);
    const name = els.nameInput.value.trim();
    const title = els.titleInput.value.trim();
    if (!name || !title) return;

    // capture the moment the button was pressed, before any awaiting
    const snapshot = snapshotBlob();
    const turn = state.turn;
    const active = activeTurn(Date.now());

    els.submit.disabled = true;
    setFormStatus('saving…');
    try {
        localStorage.setItem(NAME_KEY, name);
    } catch {
        // storage can be unavailable (private mode); remembering the name is just a nicety
    }

    let snapshotUrl = null;
    try {
        const path = `${Date.now()}-${randomId()}.png`;
        const { error } = await db.storage.from('snapshots').upload(path, await snapshot, { contentType: 'image/png' });
        if (error) throw error;
        snapshotUrl = db.storage.from('snapshots').getPublicUrl(path).data.publicUrl;
    } catch (err) {
        console.warn('snapshot upload failed', err);
    }

    const { data, error } = await db.from('titles').insert({
        name,
        title,
        snapshot_url: snapshotUrl,
        turn_id: turn?.id ?? null,
        model_id: active?.model_id ?? null,
    }).select().single();
    els.submit.disabled = false;

    if (error) return setFormStatus(`couldn’t save: ${error.message}`, true);
    addNewTitle(data);
    els.titleInput.value = '';
    setFormStatus(snapshotUrl ? 'thanks, it’s on the list.' : 'saved, but the snapshot didn’t upload.', !snapshotUrl);
});

// --- start -----------------------------------------------------------------------------------------

async function init() {
    try {
        els.nameInput.value = localStorage.getItem(NAME_KEY) ?? '';
    } catch {
        // see above
    }

    layout();
    let layoutQueued = false;
    new ResizeObserver(() => {
        if (layoutQueued) return;
        layoutQueued = true;
        requestAnimationFrame(() => {
            layoutQueued = false;
            layout();
        });
    }).observe(els.stage);
    document.fonts?.ready.then(layout);
    setInterval(refreshAgo, 15000);
    requestAnimationFrame(tick);

    renderTitleCount();
    if (!db) return;
    try {
        await Promise.all([
            loadInitialTitles(),
            // strokes before the turn, so the idle anchor of the current turn is computed from real data
            loadStrokes().then(loadTurn),
        ]);
    } catch (err) {
        console.error(err);
        state.loadError = err.message;
    }
    subscribe();
}

init();
