// a single mind-map node
class Node {
  constructor(x, y, text) {
    this.x = x; // world coords, center
    this.y = y;
    this.text = text;
    this.editing = false;
    this.parent = null; // the node it branched from, if any
    this.angle = 0; // radians, direction from parent to this node
    this.branchCount = 0; // how many "think broad" children this node has spawned
    this.isBroadChild = false; // whether this node was placed as a "think broad" branch
    this.next = null; // the node that continues this one's "think deep" chain, if any
  }

  getRect() {
    const center = worldToScreen(this.x, this.y);
    const fontSize = CONFIG.node.fontSize * scale;
    const padding = CONFIG.node.padding * scale;
    const height = CONFIG.node.height * scale;

    ctx.font = `${fontSize}px ${CONFIG.node.fontFamily}`;
    const textWidth = ctx.measureText(this.text).width;
    const width = textWidth + padding * 2;

    return {
      x: center.x - width / 2,
      y: center.y - height / 2,
      width,
      height,
      fontSize,
      borderWidth: CONFIG.node.borderWidth * scale,
      center
    };
  }

  // this node's footprint in world units, independent of camera zoom —
  // used for collision math rather than for drawing
  getWorldSize() {
    ctx.font = `${CONFIG.node.fontSize}px ${CONFIG.node.fontFamily}`;
    const textWidth = ctx.measureText(this.text).width;
    return {
      width: textWidth + CONFIG.node.padding * 2,
      height: CONFIG.node.height
    };
  }

  containsPoint(screenX, screenY) {
    const rect = this.getRect();
    return (
      screenX >= rect.x && screenX <= rect.x + rect.width &&
      screenY >= rect.y && screenY <= rect.y + rect.height
    );
  }

  draw() {
    if (this.editing) return;

    const rect = this.getRect();

    ctx.fillStyle = selectedNode === this ? CONFIG.node.selectedFillColor : CONFIG.node.fillColor;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.strokeStyle = anchorNode === this ? CONFIG.node.anchorBorderColor : CONFIG.node.borderColor;
    ctx.lineWidth = rect.borderWidth;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

    ctx.fillStyle = CONFIG.node.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, rect.center.x, rect.center.y);
  }
}

const nodes = [];

function createNode(x, y, text, parent) {
  const node = new Node(x, y, text);
  node.parent = parent || null;
  nodes.push(node);
  return node;
}

function addNode(text) {
  const centerWorld = screenToWorld(viewW / 2, viewH / 2);
  const cascade = nodes.length * 24;
  const node = createNode(centerWorld.x + cascade, centerWorld.y + cascade, text, null);
  updateView();
  return node;
}

function hitTestNode(screenX, screenY) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (nodes[i].containsPoint(screenX, screenY)) return nodes[i];
  }
  return null;
}
