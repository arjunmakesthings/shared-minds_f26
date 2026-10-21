// the 3d view: a cube with one ticked topic per axis (x, y, z), both people as spheres, orbitable.
// loaded on demand by app.js, so three.js is only fetched if someone ticks a third dimension.

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { topicLabel } from "./math.js";

const COLORS = { p: 0xff832b, q: 0x78a9ff };

function textSprite(text, { color = "#f4f4f4", size = 34, maxWidth = 460 } = {}) {
  const words = text.split(/\s+/);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = `500 ${size}px 'IBM Plex Sans', system-ui, sans-serif`;
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (ctx.measureText((cur + " " + w).trim()).width > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  lines.push(cur);
  canvas.width = maxWidth + 40;
  canvas.height = lines.length * (size + 8) + 24;
  const c = canvas.getContext("2d");
  c.font = `500 ${size}px 'IBM Plex Sans', system-ui, sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.lineJoin = "round";
  c.lineWidth = 7;
  c.strokeStyle = "rgba(28,28,28,0.9)";
  c.fillStyle = color;
  lines.forEach((l, i) => {
    const y = 12 + (size + 8) * i + (size + 8) / 2;
    c.strokeText(l, canvas.width / 2, y);
    c.fillText(l, canvas.width / 2, y);
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  const k = 0.0042;
  sprite.scale.set(canvas.width * k, canvas.height * k, 1);
  sprite.renderOrder = 10;
  return sprite;
}

export function createCube(root) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  root.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(3.6, 2.6, 4.4);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 3;
  controls.maxDistance = 9;
  controls.autoRotate = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  controls.autoRotateSpeed = 0.7;
  renderer.domElement.addEventListener("pointerdown", () => (controls.autoRotate = false));

  const group = new THREE.Group(); // rebuilt for every selection
  scene.add(group);
  const mkSphere = (color) => new THREE.Mesh(new THREE.SphereGeometry(0.09, 32, 20), new THREE.MeshBasicMaterial({ color }));
  const sp = mkSphere(COLORS.p);
  const sq = mkSphere(COLORS.q);
  const linkGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const link = new THREE.Line(linkGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }));
  scene.add(sp, sq, link);
  let nameP = null;
  let nameQ = null;

  let running = false;
  let from = null; // tween start/target
  let t0 = 0;
  let target = null;

  function resize() {
    const w = root.clientWidth || 600;
    const hgt = root.clientHeight || 520;
    renderer.setSize(w, hgt, false);
    camera.aspect = w / hgt;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(root);

  function setLink() {
    const pos = linkGeo.attributes.position;
    pos.setXYZ(0, sp.position.x, sp.position.y, sp.position.z);
    pos.setXYZ(1, sq.position.x, sq.position.y, sq.position.z);
    pos.needsUpdate = true;
    nameP?.position.set(sp.position.x, sp.position.y + 0.3, sp.position.z);
    nameQ?.position.set(sq.position.x, sq.position.y - 0.3, sq.position.z);
  }

  function loop(now) {
    if (!running) return;
    if (target) {
      const t = Math.min(1, (now - t0) / 700);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      sp.position.lerpVectors(from.p, target.p, e);
      sq.position.lerpVectors(from.q, target.q, e);
      setLink();
      if (t >= 1) target = null;
    }
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  function dispose(obj) {
    obj.traverse((o) => {
      o.geometry?.dispose();
      o.material?.map?.dispose();
      o.material?.dispose?.();
    });
  }

  return {
    pause() {
      running = false;
    },
    // sel = the three ticked indices: x, y, z. fromPlane = the two-topic square was showing a moment ago.
    update(model, sel, { prevSel } = {}) {
      const [ix, iy, iz] = sel;
      const dims = [model.dims[ix], model.dims[iy], model.dims[iz]];

      while (group.children.length) {
        const c = group.children.pop();
        dispose(c);
      }
      if (nameP) (scene.remove(nameP), dispose(nameP));
      if (nameQ) (scene.remove(nameQ), dispose(nameQ));

      group.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2, 2, 2)), new THREE.LineBasicMaterial({ color: 0x525252 })));
      const axisDirs = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
      dims.forEach((d, k) => {
        // x, y and z are the order the topics were ticked; the caption under the view names them
        const dir = axisDirs[k];
        group.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([dir.clone().multiplyScalar(-1), dir.clone().multiplyScalar(1)]),
            new THREE.LineBasicMaterial({ color: 0x8d8d8d, transparent: true, opacity: 0.7 })
          )
        );
        const lo = textSprite(d.poles[0], { size: 28, maxWidth: 360 });
        const hi = textSprite(d.poles[1], { size: 28, maxWidth: 360 });
        lo.position.copy(dir).multiplyScalar(-1.35);
        hi.position.copy(dir).multiplyScalar(1.35);
        group.add(lo, hi);
      });

      const at = (who) => new THREE.Vector3(dims[0][who].score, dims[1][who].score, dims[2][who].score);
      target = { p: at("p"), q: at("q") };
      const flat = (v) => new THREE.Vector3(v.x, v.y, 0);
      from = prevSel ? { p: flat(target.p), q: flat(target.q) } : { p: target.p.clone().multiplyScalar(0.2), q: target.q.clone().multiplyScalar(0.2) };
      sp.position.copy(from.p);
      sq.position.copy(from.q);
      t0 = performance.now();

      nameP = textSprite(model.p.name, { color: "#ff832b", size: 30, maxWidth: 300 });
      nameQ = textSprite(model.q.name, { color: "#78a9ff", size: 30, maxWidth: 300 });
      scene.add(nameP, nameQ);
      setLink();

      resize();
      if (!running) {
        running = true;
        requestAnimationFrame(loop);
      }
    },
  };
}
