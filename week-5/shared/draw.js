// geometry, rendering and cursor timing shared by the browser (app.js) and the worker (worker.js).
// pure functions only -- no dom, no node apis. anything with a canvas 2d context api can render.

// the drawing lives in a fixed logical space. models see an image this size and answer in these
// pixel coordinates; every viewer scales it to fit their screen.
export const CANVAS_W = 1200;
export const CANVAS_H = 750;
export const INK = '#111111';
export const PAPER = '#ffffff';

const STEP = 3; // px spacing of the densified polyline

function dist(a, b) {
    return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

// models return sparse points (8-30px apart). run a catmull-rom spline through them and resample to
// ~STEP px so curves look hand-drawn instead of polygonal. the cursor animates along this same
// dense polyline, so the finished line is exactly what the cursor traced.
export function densify(points) {
    if (points.length < 2) return points.slice();
    const out = [];
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] ?? points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] ?? p2;
        const n = Math.max(1, Math.ceil(dist(p1, p2) / STEP));
        for (let s = 0; s < n; s++) {
            const t = s / n;
            const t2 = t * t;
            const t3 = t2 * t;
            out.push([0, 1].map((k) => 0.5 * (
                2 * p1[k] +
                (-p0[k] + p2[k]) * t +
                (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
                (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3
            )));
        }
    }
    out.push(points[points.length - 1].slice());
    return out;
}

// strokes a dense polyline in logical units -- callers set the context transform for scaling.
export function drawPath(ctx, pts, width) {
    if (pts.length === 0) return;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    if (pts.length === 1) ctx.lineTo(pts[0][0] + 0.01, pts[0][1]); // a dot
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.strokeStyle = INK;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
}

// --- cursor timing -------------------------------------------------------------------------------
// a turn's strokes are spread across its drawing window [draw_started_at, draw_ends_at]. every viewer
// computes the same timeline from the same rows and the same clock, so everyone watching sees the
// cursor at the same spot -- including people who arrive halfway through a turn.

const TRAVEL_WEIGHT = 0.35; // a pen-up move costs less time than inking the same distance
const LIFT_PAUSE = 30; // fixed "distance" before each stroke: a beat to place the pen

// strokes: [{ dense, width }]; start: [x, y] where the pen begins
export function buildTimeline(strokes, start) {
    const steps = [];
    let at = start;
    let total = 0;
    for (const stroke of strokes) {
        const first = stroke.dense[0];
        const travel = dist(at, first) * TRAVEL_WEIGHT + LIFT_PAUSE;
        const cum = [0];
        for (let i = 1; i < stroke.dense.length; i++) {
            cum.push(cum[i - 1] + dist(stroke.dense[i - 1], stroke.dense[i]));
        }
        const ink = Math.max(cum[cum.length - 1], 1);
        steps.push({ from: at, travelStart: total, inkStart: total + travel, inkEnd: total + travel + ink, cum });
        total += travel + ink;
        at = stroke.dense[stroke.dense.length - 1];
    }
    return { steps, total: Math.max(total, 1) };
}

// progress 0..1 -> { pos, down, done, partial }
//   done: how many strokes are fully inked; partial: the inked part of the stroke in progress, or null
export function penAt(timeline, strokes, progress) {
    const d = Math.min(Math.max(progress, 0), 1) * timeline.total;
    for (let i = 0; i < timeline.steps.length; i++) {
        const step = timeline.steps[i];
        const stroke = strokes[i];
        if (d >= step.inkEnd) continue;
        if (d < step.inkStart) {
            // pen up, gliding (eased) toward the start of this stroke
            const t = (d - step.travelStart) / (step.inkStart - step.travelStart);
            const e = t * t * (3 - 2 * t);
            const to = stroke.dense[0];
            const pos = [step.from[0] + (to[0] - step.from[0]) * e, step.from[1] + (to[1] - step.from[1]) * e];
            return { pos, down: false, done: i, partial: null };
        }
        // pen down, partway along this stroke
        const along = d - step.inkStart;
        let j = 1;
        while (j < step.cum.length - 1 && step.cum[j] < along) j++;
        const a = stroke.dense[j - 1];
        const b = stroke.dense[j] ?? a;
        const seg = step.cum[j] - step.cum[j - 1] || 1;
        const t = Math.min(Math.max((along - step.cum[j - 1]) / seg, 0), 1);
        const pos = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        return { pos, down: true, done: i, partial: [...stroke.dense.slice(0, j), pos] };
    }
    const last = strokes[strokes.length - 1];
    const pos = last ? last.dense[last.dense.length - 1] : [CANVAS_W / 2, CANVAS_H / 2];
    return { pos, down: false, done: strokes.length, partial: null };
}

// while a model is "thinking", its cursor idles around where the pen was last put down. the drift is
// a pure function of time, so it matches across viewers too.
export function idleAt(anchor, now) {
    return [
        anchor[0] + Math.sin(now / 900) * 16 + Math.sin(now / 2300) * 10,
        anchor[1] + Math.cos(now / 1300) * 12,
    ];
}
