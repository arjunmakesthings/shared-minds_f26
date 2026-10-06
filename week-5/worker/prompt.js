// what each model is told every turn, and how its reply is turned into strokes.

import { CANVAS_W, CANVAS_H } from '../shared/draw.js';
import { PERSONA_BY_ID } from '../shared/personas.js';

const MAX_STROKES = 16;
const MAX_POINTS_PER_STROKE = 80;
const MAX_POINTS_TOTAL = 700;

// history: recent turns, oldest first, as [{ model_id, intent }]
export function buildPrompt(persona, history) {
    const others = history
        .filter((h) => h.intent && PERSONA_BY_ID[h.model_id])
        .map((h) => `- ${PERSONA_BY_ID[h.model_id].label}: "${h.intent}"`);

    return `${persona.bio}

---

THE GAME
You and four strangers take turns adding to one shared drawing that never ends. Each turn lasts one minute. Everyone draws with the same black pen. Nothing can ever be erased: everything anyone has drawn stays forever. People you will never meet are watching and giving the picture titles.

The attached image is the whole canvas exactly as it is right now: ${CANVAS_W} x ${CANVAS_H} pixels, white paper. (0, 0) is the top-left corner, x grows to the right, y grows downward.

${others.length
        ? `What the others said they were doing in the last few turns, oldest first:\n${others.join('\n')}`
        : 'Nobody has drawn anything yet. You make the first marks.'}

YOUR TURN
Look closely at the drawing. Decide -- as yourself, with your own history, wants, fears and habits -- where you want to take this picture next. Continue it rather than ignore it: respond to, connect to, extend or reinterpret what is already there. Make a contribution someone could recognise as yours.

Rules for the pen:
- 3 to 12 strokes. A stroke is one continuous line: pen down, move, pen up.
- Each stroke is a list of [x, y] points in pixels, in drawing order, roughly 8 to 30 px apart so curves come out smooth. Use as many points as the shape needs (up to about 60 per stroke).
- "width" is the pen thickness in pixels, from 1 to 8.
- Stay inside the canvas. No letters, words or numbers -- only drawing.

Reply with JSON only. No markdown fences, no commentary:
{"intent": "<one short first-person sentence, under 12 words, saying what you are adding>", "strokes": [{"width": 3, "points": [[x, y], [x, y], ...]}]}`;
}

const NUM = String.raw`(-?\d*\.?\d+)`;
const PAIR = new RegExp(String.raw`\[\s*${NUM}\s*,\s*${NUM}\s*\]`, 'g');

// models regularly return almost-json (gpt models drop a bracket, gemini wraps it in ```json fences),
// so instead of JSON.parse we pull out each "points" list and the "width" just before it.
export function parseReply(text) {
    let intent = null;
    const intentMatch = text.match(/"intent"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (intentMatch) {
        try {
            intent = JSON.parse(`"${intentMatch[1]}"`).trim().slice(0, 140) || null;
        } catch {
            intent = intentMatch[1].slice(0, 140);
        }
    }

    const marks = [...text.matchAll(/"points"\s*:/g)];
    let strokes = [];
    let prevEnd = 0;
    for (let i = 0; i < marks.length; i++) {
        const before = text.slice(prevEnd, marks[i].index);
        const after = text.slice(marks[i].index + marks[i][0].length, marks[i + 1]?.index ?? text.length);
        prevEnd = marks[i].index;

        const widths = [...before.matchAll(/"width"\s*:\s*(\d*\.?\d+)/g)];
        const width = widths.length ? Number(widths[widths.length - 1][1]) : 3;
        const points = [...after.matchAll(PAIR)].map((m) => [Number(m[1]), Number(m[2])]);
        if (points.length >= 2) strokes.push({ width, points });
    }

    // some models answer in 0..1 despite being asked for pixels -- scale those up
    const all = strokes.flatMap((s) => s.points);
    if (all.length && all.every(([x, y]) => x <= 1.5 && y <= 1.5)) {
        strokes = strokes.map((s) => ({ ...s, points: s.points.map(([x, y]) => [x * CANVAS_W, y * CANVAS_H]) }));
    }

    // clamp to the canvas and to sane sizes
    let budget = MAX_POINTS_TOTAL;
    const clean = [];
    for (const s of strokes.slice(0, MAX_STROKES)) {
        if (budget < 2) break;
        const points = s.points.slice(0, Math.min(MAX_POINTS_PER_STROKE, budget)).map(([x, y]) => [
            Math.round(Math.min(Math.max(x, 0), CANVAS_W) * 10) / 10,
            Math.round(Math.min(Math.max(y, 0), CANVAS_H) * 10) / 10,
        ]);
        budget -= points.length;
        clean.push({ width: Math.min(Math.max(s.width, 1), 8), points });
    }
    return { intent, strokes: clean };
}
