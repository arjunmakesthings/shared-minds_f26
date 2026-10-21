// n-dimensional math. vectors are plain arrays of length n.
// the camera is a "frame": two orthonormal n-vectors { u, v } spanning the 2d plane we look through.
// a point x lands on screen at (x·u, x·v) -- its shadow on that plane. axis i shows up on screen as the
// 2d vector (u[i], v[i]): its length says how much of that dimension the camera can see.

export const dot = (a, b) => {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
};
export const norm = (a) => Math.sqrt(dot(a, a));
export const sub = (a, b) => a.map((x, i) => x - b[i]);
export const scale = (a, k) => a.map((x) => x * k);

// a - k*b: strips k of direction b out of a (the gram-schmidt step)
const minus = (a, b, k) => a.map((x, i) => x - k * b[i]);

export function normalize(a) {
    const l = norm(a);
    return l < 1e-6 ? null : a.map((x) => x / l);
}

export const project = (x, frame) => [dot(x, frame.u), dot(x, frame.v)];

// how far x sits off the camera plane: the part of it the camera can't see
export function residual(x, frame) {
    const [px, py] = project(x, frame);
    return Math.sqrt(Math.max(0, dot(x, x) - px * px - py * py));
}

function gaussian() {
    let r = 0;
    while (r === 0) r = Math.random();
    return Math.sqrt(-2 * Math.log(r)) * Math.cos(2 * Math.PI * Math.random());
}

// a random direction, perpendicular to every (orthonormal) vector in `against`, with the axes in `zero` left out
export function randomUnitOrthogonal(n, against = [], zero = []) {
    for (let tries = 0; tries < 20; tries++) {
        let r = Array.from({ length: n }, gaussian);
        for (const i of zero) r[i] = 0;
        for (const w of against) r = minus(r, w, dot(r, w));
        const out = normalize(r);
        if (out) return out;
    }
    return null;
}

// turns any two vectors into a valid camera frame. if u or v is degenerate (zero, or v parallel to u),
// it tries the fallbacks in order before picking a random direction.
export function orthonormalize(u, v, fallbacks = []) {
    const n = u.length;
    let uu = normalize(u);
    for (const f of fallbacks) {
        if (uu) break;
        uu = normalize(f);
    }
    uu = uu || randomUnitOrthogonal(n);
    let vv = normalize(minus(v, uu, dot(v, uu)));
    for (const f of fallbacks) {
        if (vv) break;
        vv = normalize(minus(f, uu, dot(f, uu)));
    }
    vv = vv || randomUnitOrthogonal(n, [uu]);
    return { u: uu, v: vv };
}

// the ordinary 2d scatter plot: dimension i across, dimension j up, everything else hidden
export function axisFrame(n, i = 0, j = 1) {
    const u = new Array(n).fill(0);
    const v = new Array(n).fill(0);
    u[i] = 1;
    v[j] = 1;
    return { u, v };
}

export const randomFrame = (n) =>
    orthonormalize(Array.from({ length: n }, gaussian), Array.from({ length: n }, gaussian));

// rotates the camera inside its own plane. on screen, everything turns by -theta.
export function spin({ u, v }, theta) {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    return {
        u: u.map((x, i) => c * x + s * v[i]),
        v: v.map((x, i) => -s * u[i] + c * x),
    };
}

// flips the target's axes to point the same way as the current view. a flipped axis is still the same
// plane, but without this a transition can swing the picture through its mirror image.
export function alignFrame(target, ref) {
    return {
        u: dot(target.u, ref.u) < 0 ? scale(target.u, -1) : target.u,
        v: dot(target.v, ref.v) < 0 ? scale(target.v, -1) : target.v,
    };
}

// a cheap path between two camera frames: blend, then repair. not a true geodesic, but smooth.
export function lerpFrame(a, b, t) {
    return orthonormalize(
        a.u.map((x, i) => x + (b.u[i] - x) * t),
        a.v.map((x, i) => x + (b.v[i] - x) * t),
        [a.u, a.v],
    );
}

// the "manual tour": grab axis i and put its screen tip at (x, y), in units of the axis's full length.
// the rest of the frame is rebuilt from what it was, so the other axes move as little as possible:
// u = (alpha·p) + x·e_i and v = (beta·p + gamma·q) + y·e_i, where p, q are the old frame with axis i
// removed (made orthonormal). alpha, beta, gamma are what keeps u and v unit length and perpendicular,
// which works out as long as x² + y² ≤ 1 -- an axis can never look longer than it really is.
const MAX_TIP = 0.98;

export function setAxisTip(frame, i, x, y) {
    const n = frame.u.length;
    const r = Math.hypot(x, y);
    if (r > MAX_TIP) {
        x *= MAX_TIP / r;
        y *= MAX_TIP / r;
    }
    // in 2d nothing is hidden: every axis is full length, so dragging one can only rotate the view
    if (n === 2) return spin(frame, Math.atan2(frame.v[i], frame.u[i]) - Math.atan2(y, x));

    const uRest = frame.u.slice();
    const vRest = frame.v.slice();
    uRest[i] = 0;
    vRest[i] = 0;
    const p = normalize(uRest) || randomUnitOrthogonal(n, [], [i]);
    const q = normalize(minus(vRest, p, dot(vRest, p))) || randomUnitOrthogonal(n, [p], [i]);

    const alpha = Math.sqrt(1 - x * x);
    const beta = (-x * y) / alpha;
    const gamma = Math.sqrt(Math.max(0, 1 - y * y - beta * beta));
    const u = p.map((pk) => alpha * pk);
    const v = p.map((pk, k) => beta * pk + gamma * q[k]);
    u[i] = x;
    v[i] = y;
    return { u, v };
}

// keeps existing values when n changes; new slots come from fill(index)
export const resizeVec = (a, n, fill) => Array.from({ length: n }, (_, i) => (i < a.length ? a[i] : fill(i)));

export function resizeFrame(frame, n) {
    if (n === frame.u.length) return frame;
    const zero = () => 0;
    return orthonormalize(resizeVec(frame.u, n, zero), resizeVec(frame.v, n, zero));
}
