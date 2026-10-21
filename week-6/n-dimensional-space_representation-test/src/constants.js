export const N_MIN = 2;
export const N_MAX = 128;

// the room we look into is 3d (or n-d when n < 3)
export const ROOM_MAX = 3;
export const roomDims = (n) => Math.min(ROOM_MAX, n);

// a hypercube has n·2^(n-1) edges (5,120 at n = 10); past that it's just a smear
export const CUBE_MAX = 10;

// the optional crowd of random other objects, for context
export const CROWD_MAX = 2000;
export const NEAREST_K = 5;

// parameters are just letters: a … z, then aa, ab, … (like spreadsheet columns)
export function paramName(i) {
    let s = '';
    for (let k = i + 1; k > 0; k = Math.floor((k - 1) / 26)) s = String.fromCharCode(97 + ((k - 1) % 26)) + s;
    return s;
}
