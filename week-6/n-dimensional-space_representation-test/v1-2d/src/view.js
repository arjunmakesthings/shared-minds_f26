// draws the camera's view of the n-d space onto a canvas, plus a small "camera" gizmo, and turns pointer
// input into camera moves. everything in here is 2d: the n-d work happens in nd.js.
//
// positions are measured from the centre of the space (every trait at 0.5), so the hypercube of all
// possible objects sits in the middle of the screen.

import * as nd from './nd.js';
import { CUBE_MAX } from './constants.js';

const FONT = '12px Inter, system-ui, sans-serif';
const PICK_PX = 12;

export function createView(canvas, hud, actions) {
    const ctx = canvas.getContext('2d');
    let W = 1;
    let H = 1;
    let dpr = 1;
    let colors = readColors();
    let handles = []; // draggable axis tips from the last render: { dim, x, y, ox, oy, R }
    let centre = { x: 0, y: 0 };
    let drag = null;
    let hudHtml = '';

    function resize() {
        dpr = window.devicePixelRatio || 1;
        W = canvas.clientWidth;
        H = canvas.clientHeight;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
    }
    new ResizeObserver(resize).observe(canvas);
    resize();
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => (colors = readColors()));

    function render(state) {
        const { n, a, b, frame, show, hoverDim, names } = state;
        const { u, v } = frame;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.font = FONT;
        handles = [];

        const cx = W / 2;
        const cy = H / 2;
        const S = state.zoom * Math.min(W, H) * 0.4; // pixels per unit of trait (the 0 -> 1 range)
        centre = { x: cx, y: cy };
        const sx = (px) => cx + px * S;
        const sy = (py) => cy - py * S;
        // screen position of the all-zero corner of the hypercube
        const corner = [-0.5 * u.reduce((s, x) => s + x, 0), -0.5 * v.reduce((s, x) => s + x, 0)];

        const relA = a.map((x) => x - 0.5);
        const relB = b.map((x) => x - 0.5);
        const [pax, pay] = nd.project(relA, frame);
        const [pbx, pby] = nd.project(relB, frame);
        const A = [sx(pax), sy(pay)];
        const B = [sx(pbx), sy(pby)];

        if (show.cube && n <= CUBE_MAX) drawCube(n, u, v, corner, sx, sy);
        if (show.axes) {
            for (let i = 0; i < n; i++) {
                const tip = [sx(0.5 * u[i]), sy(0.5 * v[i])];
                drawAxis(i, [sx(-0.5 * u[i]), sy(-0.5 * v[i])], tip, Math.hypot(u[i], v[i]), i === hoverDim, names[i]);
                handles.push({ dim: i, x: tip[0], y: tip[1], ox: cx, oy: cy, R: 0.5 * S });
            }
        }
        if (show.path) {
            drawPath(a, u, v, corner, sx, sy, colors.a, hoverDim);
            drawPath(b, u, v, corner, sx, sy, colors.b, hoverDim);
        }
        if (show.depth) {
            drawRing(A, nd.residual(relA, frame) * S, colors.a);
            drawRing(B, nd.residual(relB, frame) * S, colors.b);
        }

        const dist = nd.norm(nd.sub(a, b));
        const seen = Math.hypot(pax - pbx, pay - pby);
        drawSegment(A, B, seen, dist);
        drawPoint(A, colors.a, 'a');
        drawPoint(B, colors.b, 'b');
        drawGizmo(n, u, v, hoverDim, names);
        updateHud(n, a, b, relA, relB, dist, seen);
    }

    function drawCube(n, u, v, corner, sx, sy) {
        // vertex k has trait j at 1 wherever bit j of k is set; each vertex is its parent plus one axis
        const V = 1 << n;
        const X = new Float32Array(V);
        const Y = new Float32Array(V);
        [X[0], Y[0]] = corner;
        for (let k = 1; k < V; k++) {
            const low = k & -k;
            const j = 31 - Math.clz32(low);
            X[k] = X[k ^ low] + u[j];
            Y[k] = Y[k ^ low] + v[j];
        }
        ctx.beginPath();
        for (let k = 0; k < V; k++) {
            for (let j = 0; j < n; j++) {
                const bit = 1 << j;
                if (k & bit) continue;
                ctx.moveTo(sx(X[k]), sy(Y[k]));
                ctx.lineTo(sx(X[k | bit]), sy(Y[k | bit]));
            }
        }
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = 1;
        ctx.globalAlpha = n > 6 ? 0.55 : 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    // one trait's full 0 -> 1 range, drawn through the centre of the space
    function drawAxis(i, tail, tip, len, hot, name) {
        ctx.globalAlpha = hot ? 1 : 0.15 + 0.55 * len;
        ctx.strokeStyle = hot ? colors.fg : colors.muted;
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = hot ? 2 : 1;
        line(tail, tip);
        dot(tip, hot ? 4 : 2.5);
        if (len > 0.25 || hot) label(name, tip, tip[0] - tail[0], tip[1] - tail[1]);
        ctx.globalAlpha = 1;
    }

    // walks from the all-zero corner, one trait at a time, to the object's point: the position is the
    // sum of its n one-dimensional values
    function drawPath(x, u, v, corner, sx, sy, color, hoverDim) {
        const pts = [corner.slice()];
        let [px, py] = corner;
        for (let i = 0; i < x.length; i++) {
            px += x[i] * u[i];
            py += x[i] * v[i];
            pts.push([px, py]);
        }
        const S = pts.map(([qx, qy]) => [sx(qx), sy(qy)]);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 1;
        ctx.beginPath();
        S.forEach(([qx, qy], k) => (k ? ctx.lineTo(qx, qy) : ctx.moveTo(qx, qy)));
        ctx.stroke();
        S.slice(0, -1).forEach((p) => dot(p, 1.6));
        if (hoverDim >= 0 && hoverDim < x.length) {
            ctx.globalAlpha = 1;
            ctx.lineWidth = 2.5;
            line(S[hoverDim], S[hoverDim + 1]);
        }
        ctx.globalAlpha = 1;
    }

    function drawRing(p, r, color) {
        if (r < 0.5) return;
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
    }

    function drawSegment(A, B, seen, dist) {
        ctx.strokeStyle = colors.fg;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.8;
        line(A, B);
        const dx = B[0] - A[0];
        const dy = B[1] - A[1];
        const len = Math.hypot(dx, dy);
        if (len > 40) {
            const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
            ctx.fillStyle = colors.fg;
            label(`${seen.toFixed(2)} seen · ${dist.toFixed(2)} true`, mid, -dy / len, dx / len, 10);
        }
        ctx.globalAlpha = 1;
    }

    function drawPoint(p, color, name) {
        ctx.fillStyle = color;
        ctx.strokeStyle = colors.bg;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.font = `600 ${FONT}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(name, p[0] + 8, p[1] - 6);
        ctx.font = FONT;
    }

    // the camera's orientation, independent of zoom: each axis is (u[i], v[i]) inside a unit circle.
    // on the rim = fully in view; in the middle = pointing straight out of the screen, invisible.
    function drawGizmo(n, u, v, hoverDim, names) {
        const R = Math.max(40, Math.min(72, Math.min(W, H) * 0.14));
        const gx = R + 26;
        const gy = H - R - 40;
        const o = [gx, gy];
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(gx, gy, R, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < n; i++) {
            const len = Math.hypot(u[i], v[i]);
            const hot = i === hoverDim;
            const tip = [gx + u[i] * R, gy - v[i] * R];
            ctx.globalAlpha = hot ? 1 : 0.25 + 0.75 * len;
            ctx.strokeStyle = hot ? colors.fg : colors.muted;
            ctx.fillStyle = ctx.strokeStyle;
            ctx.lineWidth = hot ? 2 : 1;
            line(o, tip);
            dot(tip, hot ? 4.5 : 3);
            if (hot) label(names[i], tip, u[i], -v[i]);
            else if (len > 0.35 && n <= 24) label(String(i + 1), tip, u[i], -v[i], 6);
            handles.push({ dim: i, x: tip[0], y: tip[1], ox: gx, oy: gy, R });
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = colors.muted;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('camera', gx, gy + R + 10);
    }

    function updateHud(n, a, b, relA, relB, dist, seen) {
        const hidden = Math.sqrt(Math.max(0, dist * dist - seen * seen));
        const inView = dist > 1e-9 ? seen / dist : 1;
        const cos = (x, y) => {
            const d = nd.norm(x) * nd.norm(y);
            return d > 1e-9 ? (nd.dot(x, y) / d).toFixed(2) : '—';
        };
        const html =
            `<div><b>${n}</b> dimensions · ${((n * (n - 1)) / 2).toLocaleString()} planes to rotate in</div>` +
            `<div>distance a–b: <b>${dist.toFixed(3)}</b> true · <b>${seen.toFixed(3)}</b> on screen · ${hidden.toFixed(3)} hidden</div>` +
            `<div class="hud-bar"><i style="width:${(inView * 100).toFixed(1)}%"></i></div>` +
            `<div>${Math.round(inView * 100)}% of the distance is in view</div>` +
            `<div class="muted">largest possible distance √${n} = ${Math.sqrt(n).toFixed(3)}</div>` +
            `<div class="muted">cosine similarity: ${cos(a, b)} measured from 0 · ${cos(relA, relB)} measured from the average</div>` +
            (inView > 0.9995 ? `<div class="exact">the camera plane contains a–b, so this distance is exact</div>` : '');
        if (html !== hudHtml) hud.innerHTML = hudHtml = html;
    }

    // drawing helpers

    function line(p, q) {
        ctx.beginPath();
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(q[0], q[1]);
        ctx.stroke();
    }

    function dot(p, r) {
        ctx.beginPath();
        ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
        ctx.fill();
    }

    // text placed just beyond p, in screen direction (dx, dy)
    function label(text, p, dx, dy, gap = 8) {
        const l = Math.hypot(dx, dy) || 1;
        dx /= l;
        dy /= l;
        ctx.textAlign = dx > 0.3 ? 'left' : dx < -0.3 ? 'right' : 'center';
        ctx.textBaseline = dy > 0.3 ? 'top' : dy < -0.3 ? 'bottom' : 'middle';
        ctx.fillText(text, p[0] + dx * gap, p[1] + dy * gap);
    }

    // pointer input: drag an axis tip to tilt the camera, drag anywhere else to spin it, scroll to zoom

    const pos = (e) => {
        const r = canvas.getBoundingClientRect();
        return [e.clientX - r.left, e.clientY - r.top];
    };
    const angleAt = (mx, my) => Math.atan2(-(my - centre.y), mx - centre.x);

    function pick(mx, my) {
        let best = null;
        let bestD = PICK_PX;
        for (const h of handles) {
            const d = Math.hypot(h.x - mx, h.y - my);
            if (d < bestD) {
                bestD = d;
                best = h;
            }
        }
        return best;
    }

    canvas.addEventListener('pointerdown', (e) => {
        const [mx, my] = pos(e);
        const h = pick(mx, my);
        drag = h ? { h } : { angle: angleAt(mx, my) };
        canvas.setPointerCapture(e.pointerId);
        canvas.classList.add('dragging');
        if (h) actions.setHover(h.dim);
    });

    canvas.addEventListener('pointermove', (e) => {
        const [mx, my] = pos(e);
        if (!drag) {
            const h = pick(mx, my);
            actions.setHover(h ? h.dim : -1, true);
            canvas.classList.toggle('on-handle', !!h);
            return;
        }
        if (drag.h) {
            const { h } = drag;
            actions.tilt(h.dim, (mx - h.ox) / h.R, -(my - h.oy) / h.R);
        } else {
            const ang = angleAt(mx, my);
            let d = ang - drag.angle;
            if (d > Math.PI) d -= 2 * Math.PI;
            if (d < -Math.PI) d += 2 * Math.PI;
            drag.angle = ang;
            actions.spin(-d); // spin(theta) turns the picture by -theta
        }
    });

    const endDrag = () => {
        drag = null;
        canvas.classList.remove('dragging');
    };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('pointerleave', () => {
        if (!drag) actions.setHover(-1);
    });
    canvas.addEventListener(
        'wheel',
        (e) => {
            e.preventDefault();
            actions.zoomBy(Math.exp(-e.deltaY * 0.0015));
        },
        { passive: false },
    );

    return { render };
}

function readColors() {
    const cs = getComputedStyle(document.documentElement);
    const get = (k) => cs.getPropertyValue(k).trim();
    return { bg: get('--bg'), fg: get('--fg'), muted: get('--muted'), line: get('--line'), a: get('--a'), b: get('--b') };
}
