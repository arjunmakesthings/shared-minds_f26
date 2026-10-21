export const N_MIN = 2;
export const N_MAX = 128;

// a hypercube has n·2^(n-1) edges (5,120 at n = 10); past that it's just a smear
export const CUBE_MAX = 10;

export const DEFAULT_NAMES = ['openness', 'conscientiousness', 'extroversion', 'agreeableness', 'neuroticism'];
export const nameFor = (i) => DEFAULT_NAMES[i] ?? `trait ${i + 1}`;
