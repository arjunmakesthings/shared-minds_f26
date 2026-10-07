// the turn loop -- the only thing that writes turns and strokes. run exactly one, anywhere that
// stays on (laptop, droplet, raspberry pi):  cd week-5/worker && npm install && npm start
//
// each turn: render the canvas to a png -> send it + the persona to that persona's model via the
// itp/ima proxy -> parse strokes -> write them to supabase. browsers animate the cursor from there.
//
// models take 4-40s to answer, so the worker thinks one turn ahead: as soon as a turn's strokes are
// known, the next persona is asked (with those strokes already on its canvas) while the current
// cursor is still drawing. that way every turn gets nearly its whole minute to draw.

import os from 'node:os';
import { createClient } from '@supabase/supabase-js';
import { createCanvas } from '@napi-rs/canvas';
import { CANVAS_W, CANVAS_H, PAPER, densify, drawPath } from '../shared/draw.js';
import { PERSONAS } from '../shared/personas.js';
import { dayOf } from '../shared/day.js';
import { MODELS, PROXY_URL } from './models.js';
import { buildPrompt, parseReply } from './prompt.js';

const TURN_MS = Number(process.env.TURN_SECONDS || 60) * 1000;
const HANDOFF_MS = 3000; // gap between one cursor going down and the next coming up
const THINK_MIN_MS = 3000; // even an answer that's ready shows "thinking…" for a beat
const END_PAUSE_MS = 4000; // the cursor rests after its last stroke before it goes back down
const MIN_DRAW_MS = 10000; // never squeeze a drawing into less than this, even after a slow model
const MODEL_TIMEOUT_MS = 65000; // the proxy itself gives up at 60s with a 502
const RETRY_WINDOW_MS = 20000; // retry a failed call only if the first try failed within this
const HISTORY_TURNS = 6;
const WORKER_ID = process.env.WORKER_ID || os.hostname();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    console.error('missing SUPABASE_URL or SUPABASE_SECRET_KEY -- copy .env.example to .env and fill it in');
    process.exit(1);
}

// the secret (service role) key bypasses row level security -- browsers only get read access
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false },
});

const strokes = []; // every stroke so far, in order: { id, width, dense }
let lastStrokeId = 0;
const history = []; // recent turns' { model_id, intent }, oldest first -- what the others "said"

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

function log(...args) {
    console.log(`[${new Date().toLocaleTimeString()}]`, ...args);
}

function iso(ms) {
    return new Date(ms).toISOString();
}

function must({ data, error }) {
    if (error) throw new Error(`supabase: ${error.message}`);
    return data;
}

function addStrokes(rows) {
    for (const row of rows) {
        strokes.push({ id: row.id, width: row.width, dense: densify(row.points) });
        lastStrokeId = Math.max(lastStrokeId, row.id);
    }
}

// pick up strokes we don't have yet (all of them on startup; usually none after that)
async function syncStrokes() {
    while (true) {
        const rows = must(await db.from('strokes')
            .select('id, width, points')
            .gt('id', lastStrokeId)
            .order('id')
            .limit(1000));
        addStrokes(rows);
        if (rows.length < 1000) return;
    }
}

async function loadHistory() {
    const rows = must(await db.from('turns')
        .select('model_id, intent')
        .not('intent', 'is', null)
        .order('id', { ascending: false })
        .limit(HISTORY_TURNS));
    history.push(...rows.reverse());
}

function renderBuffer() {
    const canvas = createCanvas(CANVAS_W, CANVAS_H);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    for (const s of strokes) drawPath(ctx, s.dense, s.width);
    return canvas.toBuffer('image/png');
}

function renderPng() {
    return `data:image/png;base64,${renderBuffer().toString('base64')}`;
}

// save the finished day as a png + a `days` row, and only then wipe the canvas. nothing is deleted
// unless the png is safely stored, and every step can be retried.
async function rollover(day) {
    await syncStrokes();
    if (strokes.length) {
        const path = `day-${day}.png`;
        const upload = await db.storage.from('snapshots').upload(path, renderBuffer(), { contentType: 'image/png', upsert: true });
        if (upload.error) throw new Error(`supabase storage: ${upload.error.message}`);
        const { count, error } = await db.from('turns').select('id', { count: 'exact', head: true }).eq('status', 'done');
        if (error) throw new Error(`supabase: ${error.message}`);
        must(await db.from('days').upsert({
            day,
            snapshot_url: db.storage.from('snapshots').getPublicUrl(path).data.publicUrl,
            turns: count ?? 0,
            strokes: strokes.length,
        }));
        log(`saved ${day}: ${count} turns, ${strokes.length} strokes`);
    }
    must(await db.from('strokes').delete().gt('id', 0));
    must(await db.from('turns').delete().gt('id', 0));
    // a blank canvas: forget the drawing and what the others "said" about it (the personas stay)
    strokes.length = 0;
    lastStrokeId = 0;
    history.length = 0;
    log('new day, blank canvas');
}

async function latestTurn() {
    const rows = must(await db.from('turns').select('*').order('id', { ascending: false }).limit(1));
    return rows[0] ?? null;
}

// a worker that crashed or was stopped mid-turn leaves a turn "open" -- close any that are past due
async function closeStaleTurns() {
    const cutoff = iso(Date.now() - 5000);
    must(await db.from('turns').update({ status: 'skipped' }).eq('status', 'thinking').lt('ends_at', cutoff));
    must(await db.from('turns').update({ status: 'done' }).eq('status', 'drawing').lt('ends_at', cutoff));
}

// if another worker is mid-turn (someone left a second copy running), wait for it instead of
// drawing on top of it
async function waitForOthers() {
    while (true) {
        const turn = await latestTurn();
        const open = turn && ['thinking', 'drawing'].includes(turn.status);
        const remaining = turn ? Date.parse(turn.ends_at) - Date.now() : 0;
        if (!open || turn.worker_id === WORKER_ID || remaining < -5000) return turn;
        log(`turn ${turn.id} belongs to worker "${turn.worker_id}" -- waiting ${Math.ceil(remaining / 1000)}s`);
        await sleep(remaining + HANDOFF_MS);
    }
}

function nextPersona(lastTurn) {
    const i = lastTurn ? PERSONAS.findIndex((p) => p.id === lastTurn.model_id) : -1;
    return PERSONAS[(i + 1) % PERSONAS.length];
}

async function askModel(persona, prompt, png) {
    const model = MODELS[persona.model];
    if (!model) throw new Error(`no entry for ${persona.model} in worker/models.js`);
    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
            model: persona.model,
            input: {
                prompt,
                [model.imageField]: model.imageAsList ? [png] : png,
                ...model.params,
            },
        }),
        signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
    });
    // on a timeout the proxy answers with an html error page, not json
    const prediction = await response.json().catch(() => ({}));
    if (!response.ok || prediction.error) {
        throw new Error(`proxy ${response.status}: ${prediction.error ?? ''} ${prediction.details ?? ''}`.trim());
    }
    const out = prediction.output;
    return Array.isArray(out) ? out.join('') : String(out ?? '');
}

// look at the canvas as it is now and decide what to draw. never throws: resolves to null on failure
async function think(persona, label) {
    try {
        await syncStrokes();
        const prompt = buildPrompt(persona, history.slice(-HISTORY_TURNS));
        const png = renderPng();
        const started = Date.now();
        for (let attempt = 1; attempt <= 2; attempt++) {
            if (attempt > 1 && Date.now() - started > RETRY_WINDOW_MS) break;
            const t0 = Date.now();
            try {
                const reply = parseReply(await askModel(persona, prompt, png));
                if (reply.strokes.length) return { ...reply, seconds: (Date.now() - t0) / 1000 };
                log(`${label}: ${persona.id} replied with no usable strokes (attempt ${attempt})`);
            } catch (err) {
                log(`${label}: ${persona.id} ${err.message} (attempt ${attempt})`);
            }
        }
    } catch (err) {
        log(`${label}: ${err.message}`);
    }
    return null;
}

// one turn. `ready` is a reply already being worked on (thought ahead), or null to think now.
// returns the next persona's thought-ahead { personaId, afterTurnId, reply } or null.
async function runTurn(persona, ready) {
    const startedAt = Date.now();
    const turn = must(await db.from('turns').insert({
        model_id: persona.id,
        worker_id: WORKER_ID,
        status: 'thinking',
        started_at: iso(startedAt),
        ends_at: iso(startedAt + TURN_MS),
    }).select().single());

    const reply = await (ready ?? think(persona, `turn ${turn.id}`));
    await sleep(startedAt + THINK_MIN_MS - Date.now());

    if (!reply) {
        // pass the pen on early rather than leave a cursor hovering for nothing
        must(await db.from('turns').update({ status: 'skipped', ends_at: iso(Date.now()) }).eq('id', turn.id));
        log(`turn ${turn.id} · ${persona.label}: skipped`);
        return null;
    }

    // strokes first, then flip the turn to "drawing" -- browsers start animating on that flip
    const rows = must(await db.from('strokes').insert(reply.strokes.map((s, seq) => ({
        turn_id: turn.id,
        model_id: persona.id,
        seq,
        width: s.width,
        points: s.points,
    }))).select('id, width, points'));
    addStrokes(rows);
    if (reply.intent) history.push({ model_id: persona.id, intent: reply.intent });

    const drawStart = Date.now();
    const drawEnd = Math.max(startedAt + TURN_MS - END_PAUSE_MS, drawStart + MIN_DRAW_MS);
    const endsAt = drawEnd + END_PAUSE_MS;
    must(await db.from('turns').update({
        status: 'drawing',
        intent: reply.intent,
        stroke_count: rows.length,
        draw_started_at: iso(drawStart),
        draw_ends_at: iso(drawEnd),
        ends_at: iso(endsAt),
    }).eq('id', turn.id));

    const points = reply.strokes.reduce((n, s) => n + s.points.length, 0);
    log(`turn ${turn.id} · ${persona.label} (${persona.model}) · ${rows.length} strokes, ${points} points,`,
        `answered in ${reply.seconds.toFixed(1)}s · "${reply.intent ?? ''}"`);

    // think ahead: the next persona looks at the canvas (with these strokes) while this cursor draws
    const next = nextPersona({ model_id: persona.id });
    const ahead = { personaId: next.id, afterTurnId: turn.id, reply: think(next, `thinking ahead for turn ${turn.id + 1}`) };

    await sleep(endsAt - Date.now());
    must(await db.from('turns').update({ status: 'done' }).eq('id', turn.id));
    return ahead;
}

async function main() {
    log(`worker "${WORKER_ID}" starting · ${TURN_MS / 1000}s turns · ${PERSONAS.map((p) => p.id).join(' → ')}`);
    await closeStaleTurns();
    await syncStrokes();
    await loadHistory();
    log(`loaded ${strokes.length} existing strokes`);

    // the day the canvas on screen belongs to; a new day starts a blank one
    const startTurn = await latestTurn();
    let canvasDay = dayOf(startTurn ? Date.parse(startTurn.started_at) : Date.now());

    let ahead = null;
    while (true) {
        try {
            let last = await waitForOthers();
            if (dayOf(Date.now()) !== canvasDay) {
                await rollover(canvasDay);
                canvasDay = dayOf(Date.now());
                last = null; // the first drawer of the day is the first persona
                ahead = null;
            }
            const persona = nextPersona(last);
            // only use a thought-ahead reply if nothing else happened on the canvas in between
            const ready = ahead && ahead.personaId === persona.id && ahead.afterTurnId === last?.id ? ahead.reply : null;
            ahead = await runTurn(persona, ready);
        } catch (err) {
            // a supabase or network hiccup shouldn't kill an all-day loop
            ahead = null;
            log(`turn failed: ${err.message} -- retrying in 10s`);
            await sleep(10000);
            await closeStaleTurns().catch(() => {});
        }
        await sleep(HANDOFF_MS);
    }
}

main();
