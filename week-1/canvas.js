// infinite pan/zoom canvas
const canvasWrap = document.getElementById('canvas-wrap');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// view transform: screen = world * scale + offset
let scale = 1;
let offsetX = 0;
let offsetY = 0;

let viewW = 0;
let viewH = 0;

function resize() {
  viewW = canvasWrap.clientWidth;
  viewH = canvasWrap.clientHeight;
  canvas.width = viewW * devicePixelRatio;
  canvas.height = viewH * devicePixelRatio;
  canvas.style.width = viewW + 'px';
  canvas.style.height = viewH + 'px';
  updateView();
}
window.addEventListener('resize', resize);

function screenToWorld(x, y) {
  return {
    x: (x - offsetX) / scale,
    y: (y - offsetY) / scale
  };
}

function worldToScreen(x, y) {
  return {
    x: x * scale + offsetX,
    y: y * scale + offsetY
  };
}

function draw() {
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  ctx.clearRect(0, 0, viewW, viewH);

  // background
  ctx.fillStyle = CONFIG.canvas.backgroundColor;
  ctx.fillRect(0, 0, viewW, viewH);

  drawEdges();
  for (const node of nodes) node.draw();
}

function drawEdges() {
  ctx.strokeStyle = CONFIG.node.borderColor;
  ctx.lineWidth = CONFIG.node.borderWidth * scale;
  for (const node of nodes) {
    if (!node.parent) continue;
    const from = worldToScreen(node.parent.x, node.parent.y);
    const to = worldToScreen(node.x, node.y);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }
}

function eventToCanvasPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

// panning / node dragging
let isPanning = false;
let lastX = 0;
let lastY = 0;

let draggingNode = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

let selectedNode = null;

canvas.addEventListener('mousedown', (e) => {
  const p = eventToCanvasPoint(e);
  const node = hitTestNode(p.x, p.y);

  selectedNode = node;

  if (node) {
    // selecting a node with the mouse also makes it the anchor, so voice
    // commands (delete, go broad/deep, etc.) continue from wherever you clicked
    anchorNode = node;
    currentNode = node;
    updateView();

    draggingNode = node;
    const world = screenToWorld(p.x, p.y);
    dragOffsetX = node.x - world.x;
    dragOffsetY = node.y - world.y;
    canvas.style.cursor = 'grabbing';
    return;
  }

  draw();

  switchToFixedView();
  isPanning = true;
  lastX = e.clientX;
  lastY = e.clientY;
  canvas.style.cursor = 'grabbing';
});

// delete the selected node (and its branches) via keyboard
window.addEventListener('keydown', (e) => {
  if (e.key !== 'Delete' && e.key !== 'Backspace') return;
  if (introActive) return;
  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
  if (!selectedNode) return;

  e.preventDefault();
  deleteNode(selectedNode);
});

window.addEventListener('mousemove', (e) => {
  if (draggingNode) {
    const p = eventToCanvasPoint(e);
    const world = screenToWorld(p.x, p.y);
    draggingNode.x = world.x + dragOffsetX;
    draggingNode.y = world.y + dragOffsetY;
    draw();
    return;
  }

  if (!isPanning) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  offsetX += dx;
  offsetY += dy;
  draw();
});

window.addEventListener('mouseup', () => {
  isPanning = false;
  draggingNode = null;
  canvas.style.cursor = 'default';
});

// double-click to edit a node's text
canvas.addEventListener('dblclick', (e) => {
  const p = eventToCanvasPoint(e);
  const node = hitTestNode(p.x, p.y);
  if (node) editNode(node);
});

function editNode(node) {
  const rect = node.getRect();

  node.editing = true;
  draw();

  const input = document.createElement('input');
  input.type = 'text';
  input.value = node.text;
  Object.assign(input.style, {
    position: 'absolute',
    left: rect.x + 'px',
    top: rect.y + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px',
    font: `${rect.fontSize}px ${CONFIG.node.fontFamily}`,
    textAlign: 'center',
    border: `${rect.borderWidth}px solid ${CONFIG.node.borderColor}`,
    outline: 'none',
    background: CONFIG.node.fillColor,
    boxSizing: 'border-box',
    padding: '0'
  });

  canvasWrap.appendChild(input);
  input.focus();
  input.select();

  function commit() {
    const text = input.value.trim();
    if (text) node.text = text;
    node.editing = false;
    input.remove();
    draw();
  }

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') {
      input.value = node.text;
      input.blur();
    }
  });
}

// zooming, centered on cursor
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  switchToFixedView();

  const delta = -e.deltaY * CONFIG.canvas.zoomIntensity;
  const newScale = Math.min(CONFIG.canvas.maxScale, Math.max(CONFIG.canvas.minScale, scale * (1 + delta)));

  const p = eventToCanvasPoint(e);
  const worldBefore = screenToWorld(p.x, p.y);

  scale = newScale;

  // keep the point under the cursor fixed
  offsetX = p.x - worldBefore.x * scale;
  offsetY = p.y - worldBefore.y * scale;

  draw();
}, { passive: false });
