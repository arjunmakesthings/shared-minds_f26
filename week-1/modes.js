// thinking mode: broad vs deep, switchable by voice or mouse
const modeBroadEl = document.getElementById('mode-broad');
const modeDeepEl = document.getElementById('mode-deep');

const GOLDEN_ANGLE = CONFIG.layout.goldenAngleDegrees * (Math.PI / 180);

let mode = 'broad';

// rootNode: the central question, fixed as the camera's center point.
// anchorNode: node new branches stem from.
// currentNode: the last node created (becomes the anchor on the next mode switch).
let rootNode = null;
let anchorNode = null;
let currentNode = null;

function initRoot(node) {
  rootNode = node;
  anchorNode = node;
  currentNode = node;
}

function renderMode() {
  modeBroadEl.textContent = COMMANDS.thinkBroad.phrase;
  modeDeepEl.textContent = COMMANDS.thinkDeep.phrase;
  modeBroadEl.classList.toggle('active', mode === 'broad');
  modeDeepEl.classList.toggle('active', mode === 'deep');
}

function setMode(next) {
  if (next !== 'broad' && next !== 'deep') return;
  if (currentNode) anchorNode = currentNode;
  mode = next;
  renderMode();
  updateView();
}

// creates the next node according to the current mode, branching off the anchor
function addBranchNode(text) {
  if (!anchorNode) return addNode(text);

  let parent, angle, isBroadChild;

  if (mode === 'broad') {
    parent = anchorNode;
    angle = parent.branchCount * GOLDEN_ANGLE;
    parent.branchCount++;
    isBroadChild = true;
  } else {
    parent = currentNode;
    angle = anchorNode.angle;
    isBroadChild = false;
  }

  const x = parent.x + CONFIG.layout.branchSpacing * Math.cos(angle);
  const y = parent.y + CONFIG.layout.branchSpacing * Math.sin(angle);

  const node = createNode(x, y, text, parent);
  node.angle = angle;
  node.isBroadChild = isBroadChild;
  currentNode = node;

  if (mode === 'deep') {
    parent.next = node;
    anchorNode = node; // the anchor rides the frontier of a deep chain
  }

  resolveLayout();
  updateView();
  return node;
}

// moves the anchor up to its parent (toward the central question)
function goBack() {
  if (!anchorNode || !anchorNode.parent) return;
  anchorNode = anchorNode.parent;
  currentNode = anchorNode;
  updateView();
}

// moves the anchor forward to the next node in a "think deep" chain
function goForward() {
  if (!anchorNode || !anchorNode.next) return;
  anchorNode = anchorNode.next;
  currentNode = anchorNode;
  updateView();
}

// cycles the anchor through its siblings (other branches off the same parent)
function changeNode() {
  if (!anchorNode) return;
  const siblings = nodes.filter((n) => n.parent === anchorNode.parent);
  if (siblings.length <= 1) return;

  const idx = siblings.indexOf(anchorNode);
  anchorNode = siblings[(idx + 1) % siblings.length];
  currentNode = anchorNode;
  updateView();
}

// removes a node and everything branching from it (can't remove the root).
// used both by the voice "delete" command (on the last-made node) and by
// selecting a node with the mouse and pressing delete/backspace.
function deleteNode(node) {
  if (!node || !node.parent) return;

  const toRemove = new Set([node]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const n of nodes) {
      if (!toRemove.has(n) && n.parent && toRemove.has(n.parent)) {
        toRemove.add(n);
        changed = true;
      }
    }
  }

  for (let i = nodes.length - 1; i >= 0; i--) {
    if (toRemove.has(nodes[i])) nodes.splice(i, 1);
  }

  for (const n of nodes) {
    if (n.next && toRemove.has(n.next)) n.next = null;
  }

  if (node.isBroadChild && node.parent.branchCount > 0) {
    node.parent.branchCount--;
  }

  if (toRemove.has(anchorNode)) anchorNode = node.parent;
  if (toRemove.has(currentNode)) currentNode = node.parent;
  if (toRemove.has(selectedNode)) selectedNode = null;

  updateView();
}

function normalizeSpeech(text) {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[.!?]+$/, '')
    .trim();
}

// returns true if the phrase was a voice command (and handled it).
// each phrase comes from commands.js, so editing a phrase there is enough
// to change what you have to say — nothing here needs to change.
function handleVoiceCommand(text) {
  const normalized = normalizeSpeech(text);

  switch (normalized) {
    case COMMANDS.thinkBroad.phrase: setMode('broad'); return true;
    case COMMANDS.thinkDeep.phrase: setMode('deep'); return true;
    case COMMANDS.delete.phrase: deleteNode(currentNode); return true;
    case COMMANDS.goBack.phrase: goBack(); return true;
    case COMMANDS.goForward.phrase: goForward(); return true;
    case COMMANDS.changeNode.phrase: changeNode(); return true;
    default: return false;
  }
}

modeBroadEl.addEventListener('click', () => setMode('broad'));
modeDeepEl.addEventListener('click', () => setMode('deep'));

renderMode();
resize();
