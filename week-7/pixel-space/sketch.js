// walk through the space of every possible 100x100 rgb image.
// the nano (position-test.ino) prints "x: 1.23; y: 4.56" in meters, one line per step.
// the room is a 2-d grid of cells (one cell = one step). every cell is a fixed
// address in the space and holds exactly one image: the same cell always shows
// the same image, and (in practice) no two cells share one.

const IMG_W = 100, IMG_H = 100;
const N = IMG_W * IMG_H;
const SCALE = 6;
const MAP_W = 320;             // map panel on the right
const MAX_PATH = 3000;         // how many moves the trail remembers
const TEXT_SIZE = 14;          // every label on the canvas uses this size

const CELL_M = 0.7;            // one cell = one step (match STEP_LENGTH_M in the sketch)
const WORLD_SEED = 12345;      // same seed = same space every time

let img;
let posX = 0, posY = 0;        // meters from the nano
let ci = 0, cj = 0;            // current cell
let address = '';
let visited = new Map();       // "i,j" -> number of times you've been there
let path = [[0, 0]];           // every cell you've moved through, in order
let dirty = true;
let statusText = 'not connected';

function hash32(a, b, salt) {
  let h = salt ^ Math.imul(a | 0, 0x85EBCA6B) ^ Math.imul(b | 0, 0xC2B2AE35);
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

// the image at a cell: 30,000 channel values from a generator seeded by the cell
function renderCell(i, j) {
  const rand = sfc32(
    hash32(i, j, WORLD_SEED),
    hash32(i, j, WORLD_SEED + 1),
    hash32(i, j, WORLD_SEED + 2),
    hash32(i, j, WORLD_SEED + 3)
  );
  for (let k = 0; k < 12; k++) rand();   // warm up

  img.loadPixels();
  for (let p = 0; p < N; p++) {
    img.pixels[p * 4]     = Math.floor(rand() * 256);
    img.pixels[p * 4 + 1] = Math.floor(rand() * 256);
    img.pixels[p * 4 + 2] = Math.floor(rand() * 256);
    img.pixels[p * 4 + 3] = 255;
  }
  img.updatePixels();
  address = hash32(i, j, WORLD_SEED).toString(16).padStart(8, '0');
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
  text(`cell (${ci}, ${cj})   address ${address}`, 10, 21);
  textSize(TEXT_SIZE);
  text('1 of ~10^72247 possible 100x100 images', 10, 41);

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
