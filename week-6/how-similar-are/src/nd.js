// n-dimensional math. vectors are plain arrays of length n.
//
// the camera is a "frame": k orthonormal n-vectors (rows), k = 3 -- the 3d room you can orbit around.
// a point x shows up in the room at (x·F[0], x·F[1], x·F[2]): its shadow in that 3d slice of the space.
// parameter i shows up in the room as the k-vector (F[0][i], F[1][i], F[2][i]), its "column". the
// column's length (0 → 1) is how much of that parameter the room can show: 1 = fully in view, 0 = it
// points entirely into the hidden dimensions.

export const dot = (a, b) => {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
};
export const norm = (a) => Math.sqrt(dot(a, a));
export const sub = (a, b) => a.map((x, i) => x - b[i]);
export const scale = (a, k) => a.map((x) => x * k);
const minus = (a, b, k) => a.map((x, i) => x - k * b[i]); // a - k·b, the gram-schmidt step

export function normalize(a) {
    const l = norm(a);
    return l < 1e-6 ? null : a.map((x) => x / l);
}

export const project = (x, F) => F.map((f) => dot(x, f));
export const column = (F, i) => F.map((f) => f[i]);

// how far x sits from the room: the part of it in the hidden dimensions
export function residual(x, F) {
    const y = project(x, F);
    return Math.sqrt(Math.max(0, dot(x, x) - dot(y, y)));
}

function gaussian() {
    let r = 0;
    while (r === 0) r = Math.random();
    return Math.sqrt(-2 * Math.log(r)) * Math.cos(2 * Math.PI * Math.random());
}
const randomVec = (n) => Array.from({ length: n }, gaussian);

// a random direction perpendicular to the (orthonormal) vectors in `against`, with the axes in `zero` left out
function randomUnitOrthogonal(n, against = [], zero = []) {
    for (let tries = 0; tries < 20; tries++) {
        let r = randomVec(n);
        for (const i of zero) r[i] = 0;
        for (const w of against) r = minus(r, w, dot(r, w));
        const out = normalize(r);
        if (out) return out;
    }
    return null;
}

// k orthonormal rows built from the candidates in order, skipping any that add nothing new
export function gramSchmidt(n, k, candidates, zero = []) {
    const rows = [];
    for (const c of candidates) {
        if (rows.length === k) break;
        let r = c.slice();
        for (const i of zero) r[i] = 0;
        for (const q of rows) r = minus(r, q, dot(r, q));
        const q = normalize(r);
        if (q) rows.push(q);
    }
    while (rows.length < k) rows.push(randomUnitOrthogonal(n, rows, zero));
    return rows;
}

// --- small k×k matrices (k ≤ 3) ---

const identity = (k) => Array.from({ length: k }, (_, r) => Array.from({ length: k }, (_, c) => (r === c ? 1 : 0)));

// rows of the result are combinations of the rows of R: out[r] = Σ_s M[r][s]·R[s]
const combine = (M, R) => M.map((m) => R[0].map((_, j) => m.reduce((s, mrs, r) => s + mrs * R[r][j], 0)));

// eigen-decomposition of a small symmetric matrix by jacobi rotations: A = V·diag(vals)·Vᵀ
function symEig(A) {
    const k = A.length;
    const a = A.map((r) => r.slice());
    const V = identity(k);
    for (let sweep = 0; sweep < 60; sweep++) {
        let off = 0;
        for (let p = 0; p < k; p++) for (let q = p + 1; q < k; q++) off += a[p][q] * a[p][q];
        if (off < 1e-24) break;
        for (let p = 0; p < k; p++) {
            for (let q = p + 1; q < k; q++) {
                if (Math.abs(a[p][q]) < 1e-18) continue;
                const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
                const t = (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
                const c = 1 / Math.sqrt(t * t + 1);
                const s = t * c;
                for (let r = 0; r < k; r++) {
                    const arp = a[r][p];
                    const arq = a[r][q];
                    a[r][p] = c * arp - s * arq;
                    a[r][q] = s * arp + c * arq;
                }
                for (let r = 0; r < k; r++) {
                    const apr = a[p][r];
                    const aqr = a[q][r];
                    a[p][r] = c * apr - s * aqr;
                    a[q][r] = s * apr + c * aqr;
                }
                for (let r = 0; r < k; r++) {
                    const vrp = V[r][p];
                    const vrq = V[r][q];
                    V[r][p] = c * vrp - s * vrq;
                    V[r][q] = s * vrp + c * vrq;
                }
            }
        }
    }
    return { vals: a.map((r, i) => r[i]), V };
}

// f applied to a symmetric matrix through its eigenvalues
const matFn = ({ vals, V }, f) => {
    const fv = vals.map(f);
    return V.map((_, r) => V.map((_, c) => fv.reduce((s, x, j) => s + V[r][j] * x * V[c][j], 0)));
};

// the orthonormal rows closest to R (löwdin / symmetric orthonormalization): (R·Rᵀ)^(-1/2)·R.
// unlike gram-schmidt it treats every row the same, and leaves rows that are already orthonormal untouched.
function lowdin(R) {
    const eig = symEig(R.map((a) => R.map((b) => dot(a, b))));
    if (Math.min(...eig.vals) < 1e-10) return null;
    return combine(matFn(eig, (x) => 1 / Math.sqrt(x)), R);
}

// --- frames ---

export function orthonormalize(R, fallbacks = []) {
    return lowdin(R) || gramSchmidt(R[0].length, R.length, [...R, ...fallbacks]);
}

// parameters 0, 1, 2 along the room's x, y, z; everything else hidden
export const axisFrame = (n, k) => identity(n).slice(0, k);

export const randomFrame = (n, k) => gramSchmidt(n, k, Array.from({ length: k }, () => randomVec(n)));

// re-expresses target (the same 3d slice) in the orientation closest to ref, so moving between them
// doesn't needlessly spin or mirror the room: an orthogonal procrustes fit, via the polar decomposition.
export function alignFrame(target, ref) {
    const M = ref.map((r) => target.map((t) => dot(r, t)));
    const MtM = M[0].map((_, a) => M[0].map((_, b) => M.reduce((s, row) => s + row[a] * row[b], 0)));
    const eig = symEig(MtM);
    if (Math.min(...eig.vals) < 1e-10) return target;
    const O = combine(M, matFn(eig, (x) => 1 / Math.sqrt(x)));
    return combine(O, target);
}

// a cheap path between two frames: blend, then repair. not a true geodesic, but smooth.
export function lerpFrame(A, B, t) {
    return orthonormalize(
        A.map((row, r) => row.map((x, j) => x + (B[r][j] - x) * t)),
        A,
    );
}

// the rotation of k-space that turns unit vector c onto unit vector t, leaving everything
// perpendicular to both alone
function rotationBetween(c, t) {
    const k = c.length;
    const cos = Math.max(-1, Math.min(1, dot(c, t)));
    const p = normalize(minus(t, c, cos));
    if (!p) return identity(k);
    const sin = Math.sqrt(1 - cos * cos);
    return identity(k).map((row, r) =>
        row.map((x, s) => x + sin * (p[r] * c[s] - c[r] * p[s]) + (cos - 1) * (c[r] * c[s] + p[r] * p[s])),
    );
}

// the "manual tour": grab parameter i and put its column at t (a k-vector, |t| < 1).
// strip parameter i out of the frame, re-orthonormalize what's left (Q), then
//     F' = sqrt(I − t·tᵀ)·Q + t·e_iᵀ
// which keeps the rows orthonormal for any |t| < 1. because both steps are the symmetric choice, passing
// in the axis's current column gives back exactly the current frame, so dragging is continuous: the rest
// of the room moves as little as possible to make room for the parameter you're pulling in.
const MAX_TIP = 0.985;

export function setAxisTip(F, i, t) {
    const k = F.length;
    const n = F[0].length;
    let s = norm(t);
    // nothing is hidden when the whole space fits in the room: every axis is full length and dragging one
    // just turns the room
    if (n <= k) return s < 1e-9 ? F : combine(rotationBetween(column(F, i), scale(t, 1 / s)), F);
    if (s > MAX_TIP) {
        t = scale(t, MAX_TIP / s);
        s = MAX_TIP;
    }
    const R = F.map((f) => {
        const r = f.slice();
        r[i] = 0;
        return r;
    });
    const Q = lowdin(R) || gramSchmidt(n, k, R, [i]);
    const shrink = s > 1e-9 ? (1 - Math.sqrt(1 - s * s)) / (s * s) : 0;
    const M = t.map((tr, r) => t.map((tc, c) => (r === c ? 1 : 0) - shrink * tr * tc));
    const out = combine(M, Q);
    out.forEach((row, r) => (row[i] = t[r]));
    return out;
}

// keeps existing values when n changes; new slots come from fill(index)
export const resizeVec = (a, n, fill) => Array.from({ length: n }, (_, i) => (i < a.length ? a[i] : fill(i)));

export function resizeFrame(F, n, k) {
    const rows = F.slice(0, k).map((f) => resizeVec(f, n, () => 0));
    return (rows.length === k && lowdin(rows)) || gramSchmidt(n, k, [...rows, ...identity(n)]);
}
