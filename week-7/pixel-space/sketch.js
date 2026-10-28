// walk through the space of every possible 100x100 rgb image.
// the nano (position-test.ino) prints "x: 1.23; y: 4.56" in meters, one line per step.
// the room is a 2-d grid of cells (one cell = one step). the grid is finite and
// maps 1:1 onto the set of images: it has 2^120000 x 2^120000 = 256^30000 cells,
// and every possible image sits at exactly one of them. the start is the centre
// of the grid, so you can walk any direction, and the edges are out of reach.
// the same cell always shows the same image; WORLD_SEED only changes how the
// images are arranged over the cells, not which images exist.

const IMG_W = 100, IMG_H = 100;
const N = IMG_W * IMG_H;
const SCALE = 6;
const MAP_W = 320;             // map panel on the right
const MAX_PATH = 3000;         // how many moves the trail remembers
const TEXT_SIZE = 14;          // every label on the canvas uses this size

const CELL_M = 0.7;            // one cell = one step (match STEP_LENGTH_M in the sketch)
const WORLD_SEED = 12345;      // same seed = same arrangement every time
const HALF = 15000;            // bytes per grid coordinate: 15000 * 8 = 120,000 bits
const ROUNDS = 8;              // shuffle rounds (must stay even, see permute)

let img;
let posX = 0, posY = 0;        // meters from the nano
let ci = 0, cj = 0;            // current cell
let address = '';
let visited = new Map();       // "i,j" -> number of times you've been there
let path = [[0, 0]];           // every cell you've moved through, in order
let dirty = true;
let statusText = 'not connected';

// a reversible scramble of one 32-bit number
function mix32(h) {
  h ^= h >>> 16; h = Math.imul(h, 0x7FEB352D);
  h ^= h >>> 15; h = Math.imul(h, 0x846CA68B);
  h ^= h >>> 16;
  return h >>> 0;
}

function sfc32(a, b, c, d) {
  return function () {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

// the grid coordinate (centre + v) as a big-endian HALF-byte number, written into out.
// the centre is 2^119999, the middle of 0 .. 2^120000 - 1. v is a whole number
// (|v| < 2^53, far more than anyone can walk), so the result is always in range.
function coordBytes(v, out) {
  out.fill(0);
  out[0] = 0x80;
  let carry = v;
  for (let k = HALF - 1; k >= 0 && carry !== 0; k--) {
    const s = out[k] + carry;
    const q = Math.floor(s / 256);
    out[k] = s - q * 256;
    carry = q;
  }
}

// one round function: xors a byte stream into dst. the stream is seeded by a hash
// of src and the round number. it doesn't need to be reversible.
function roundXor(src, round, dst) {
  let h0 = mix32(WORLD_SEED + round * 4);
  let h1 = mix32(WORLD_SEED + round * 4 + 1);
  let h2 = mix32(WORLD_SEED + round * 4 + 2);
  let h3 = mix32(WORLD_SEED + round * 4 + 3);
  for (let t = 0; t < HALF; t++) {
    h0 = mix32(h0 ^ src[t]);
    h1 = mix32(h1 ^ h0);
    h2 = mix32(h2 ^ h1);
    h3 = mix32(h3 ^ h2);
  }
  const rand = sfc32(h0, h1, h2, h3);
  for (let k = 0; k < 12; k++) rand();   // warm up
  for (let t = 0; t < HALF; t++) dst[t] ^= Math.floor(rand() * 256);
}

// shuffles the 2 * HALF byte block (L, R) in place. this is a feistel network, which
// is a one-to-one map on the whole block however roundXor behaves: each round
// replaces L with L xor f(R) and swaps the halves, and that can be undone by
// swapping back and xoring the same stream again. inverse = true runs it backwards,
// so the map can be checked, and so the cell holding any given image can be found.
// ROUNDS is even, so L and R end up back in their own buffers.
function permute(L, R, inverse) {
  for (let n = 0; n < ROUNDS; n++) {
    if (inverse) {
      const t = L; L = R; R = t;
      roundXor(R, ROUNDS - 1 - n, L);
    } else {
      roundXor(R, n, L);
      const t = L; L = R; R = t;
    }
  }
}

const bufL = new Uint8Array(HALF);
const bufR = new Uint8Array(HALF);

// the image at a cell. the cell's two coordinates fill the two halves of a
// 30,000 byte block, the shuffle scrambles it, and the bytes are the r, g, b values.
function renderCell(i, j) {
  coordBytes(i, bufL);
  coordBytes(j, bufR);
  permute(bufL, bufR, false);

  img.loadPixels();
  for (let p = 0; p < N; p++) {
    for (let c = 0; c < 3; c++) {
      const k = p * 3 + c;
      img.pixels[p * 4 + c] = k < HALF ? bufL[k] : bufR[k - HALF];
    }
    img.pixels[p * 4 + 3] = 255;
  }
  img.updatePixels();
  // short label: the first 8 bytes of the image
  address = Array.from(bufL.subarray(0, 8), (b) => b.toString(16).padStart(2, '0')).join('');
}

function setup() {
  createCanvas(IMG_W * SCALE + MAP_W, IMG_H * SCALE).parent('canvas-holder');
  noSmooth();   // keeps the 100x100 image blocky; text stays sharp
  img = createImage(IMG_W, IMG_H);
  visited.set('0,0', 1);
  document.getElementById('connect').addEventListener('click', connectSerial);
}

function draw() {
  if (dirty) {
    renderCell(ci, cj);
    dirty = false;
  }
  background(17);
  image(img, 0, 0, IMG_W * SCALE, IMG_H * SCALE);

  // label
  noStroke();
  fill(0, 170);
  rect(0, 0, IMG_W * SCALE, 50);
  fill(255);
  textFont('monospace');
  textSize(TEXT_SIZE);
  text(`cell (${ci}, ${cj}) from centre   id ${address}`, 10, 21);
  textSize(TEXT_SIZE);
  text('1 of ~10^72247 images, each at exactly one cell', 10, 41);

  drawMap();

  document.getElementById('status').textContent =
    `${statusText}\nposition: x ${posX.toFixed(2)} m, y ${posY.toFixed(2)} m`;
}

function drawMap() {
  const ox = IMG_W * SCALE;
  const size = MAP_W - 24;       // square plot area
  const px = ox + 12, py = 36;

  noStroke();
  fill(28);
  rect(ox, 0, MAP_W, height);
  fill(210);
  textSize(TEXT_SIZE);
  text('your path (up = forward)', px, 24);

  // fit the whole trail, always keeping the start in view
  let minI = 0, maxI = 0, minJ = 0, maxJ = 0;
  for (const [i, j] of path) {
    minI = Math.min(minI, i); maxI = Math.max(maxI, i);
    minJ = Math.min(minJ, j); maxJ = Math.max(maxJ, j);
  }
  minI -= 2; maxI += 2; minJ -= 2; maxJ += 2;
  const span = Math.max(maxI - minI, maxJ - minJ, 12);
  const unit = size / span;
  const left = minI - (span - (maxI - minI)) / 2;
  const bottom = minJ - (span - (maxJ - minJ)) / 2;
  const sx = (i) => px + (i - left) * unit;
  const sy = (j) => py + size - (j - bottom) * unit;   // up = +y

  // grid
  fill(18);
  rect(px, py, size, size);
  const step = Math.max(1, Math.ceil(span / 20));
  stroke(48);
  strokeWeight(1);
  for (let i = Math.ceil(left / step) * step; i <= left + span; i += step) {
    line(sx(i), py, sx(i), py + size);
  }
  for (let j = Math.ceil(bottom / step) * step; j <= bottom + span; j += step) {
    line(px, sy(j), px + size, sy(j));
  }
  // axes through the start
  stroke(120);
  line(sx(0), py, sx(0), py + size);
  line(px, sy(0), px + size, sy(0));

  // trail: faint and blue = old, brighter and yellow = recent.
  // it's see-through, so walking over the same stretch again builds up
  const oldC = color(110, 140, 255, 50), newC = color(255, 220, 80, 170);
  strokeWeight(3);
  for (let k = 1; k < path.length; k++) {
    stroke(lerpColor(oldC, newC, k / path.length));
    line(sx(path[k - 1][0]), sy(path[k - 1][1]), sx(path[k][0]), sy(path[k][1]));
  }

  // cells you've stood on: red = more than once (you backtracked)
  noStroke();
  for (const [key, count] of visited) {
    const [i, j] = key.split(',').map(Number);
    if (count > 1) fill(255, 130, 110, 190); else fill(140, 170, 255, 190);
    circle(sx(i), sy(j), 5 + Math.min(count - 1, 4) * 2);
  }

  // start and you
  noFill();
  stroke(255);
  strokeWeight(1.5);
  circle(sx(0), sy(0), 14);
  noStroke();
  fill(255);
  textSize(TEXT_SIZE);
  text('start', sx(0) + 10, sy(0) - 8);
  fill(255, 220, 80);
  stroke(255);
  strokeWeight(2);
  circle(sx(ci), sy(cj), 12);

  // axis numbers (in cells) along the edges
  noStroke();
  fill(150);
  textSize(TEXT_SIZE);
  const every = Math.max(1, Math.ceil(span / 8));
  textAlign(CENTER, BOTTOM);
  for (let i = Math.ceil(left / every) * every; i <= left + span; i += every) {
    text(i, sx(i), py + size - 2);
  }
  textAlign(LEFT, CENTER);
  for (let j = Math.ceil(bottom / every) * every; j <= bottom + span; j += every) {
    text(j, px + 3, sy(j));
  }

  // direction names
  fill(235);
  textSize(TEXT_SIZE);
  textAlign(CENTER, TOP);
  text('↑ forward (+y)', px + size / 2, py + 5);
  textAlign(CENTER, BOTTOM);
  text('↓ back (−y)', px + size / 2, py + size - 17);
  textAlign(LEFT, CENTER);
  text('← left (−x)', px + 28, py + size / 2);
  textAlign(RIGHT, CENTER);
  text('right (+x) →', px + size - 5, py + size / 2);
  textAlign(LEFT, BASELINE);

  // numbers
  fill(235);
  textSize(TEXT_SIZE);
  const ty = py + size + 26;
  const moves = path.length - 1;
  const revisits = moves - (visited.size - 1);
  text(`last move: ${lastMoveLabel()}`, px, ty);
  text(`x ${ci}   y ${cj}   (cells)`, px, ty + 22);
  text(`${posX.toFixed(1)} m right, ${posY.toFixed(1)} m forward`, px, ty + 44);
  text(`moves ${moves}   cells ${visited.size}   revisits ${revisits}`, px, ty + 66);
  fill(160);
  textSize(TEXT_SIZE);
  text('1 cell = 1 step. red dots = cells you came back to', px, ty + 90);
}

function lastMoveLabel() {
  if (path.length < 2) return 'none yet';
  const [pi, pj] = path[path.length - 2];
  const di = ci - pi, dj = cj - pj;
  const parts = [];
  if (dj > 0) parts.push('↑ forward');
  else if (dj < 0) parts.push('↓ back');
  if (di > 0) parts.push('→ right');
  else if (di < 0) parts.push('← left');
  return parts.join(' + ') || 'none yet';
}

function setPosition(x, y) {
  posX = x;
  posY = y;
  const ni = Math.round(posX / CELL_M);
  const nj = Math.round(posY / CELL_M);
  if (ni !== ci || nj !== cj) {
    ci = ni;
    cj = nj;
    const key = `${ci},${cj}`;
    visited.set(key, (visited.get(key) || 0) + 1);
    path.push([ci, cj]);
    if (path.length > MAX_PATH) path.shift();
    dirty = true;
  }
}

// keyboard fallback: arrows move one cell (up = forward = +y)
function keyPressed() {
  if (keyCode === LEFT_ARROW)  setPosition(posX - CELL_M, posY);
  else if (keyCode === RIGHT_ARROW) setPosition(posX + CELL_M, posY);
  else if (keyCode === UP_ARROW)    setPosition(posX, posY + CELL_M);
  else if (keyCode === DOWN_ARROW)  setPosition(posX, posY - CELL_M);
  else return true;
  return false;
}

// web serial
const POS_RE = /x:\s*(-?\d+(?:\.\d+)?);\s*y:\s*(-?\d+(?:\.\d+)?)/;

function handleLine(line) {
  if (!line) return;
  const m = line.match(POS_RE);
  if (m) setPosition(parseFloat(m[1]), parseFloat(m[2]));
  else statusText = line;   // setup messages from the nano
}

async function connectSerial() {
  if (!('serial' in navigator)) {
    statusText = 'web serial is not supported here. use chrome or edge.';
    return;
  }
  try {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    try { await port.setSignals({ dataTerminalReady: true }); } catch (e) {}
    statusText = 'connected, waiting for the nano...';

    const decoder = new TextDecoderStream();
    port.readable.pipeTo(decoder.writable);
    const reader = decoder.readable.getReader();
    let buf = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += value;
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        handleLine(buf.slice(0, nl).trim());
        buf = buf.slice(nl + 1);
      }
    }
    statusText = 'disconnected';
  } catch (err) {
    statusText = 'serial error: ' + err.message;
  }
}
