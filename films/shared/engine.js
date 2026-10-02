/* Film engine — the live site's neural field, rendered deterministically for HyperFrames.
 * Every frame is a pure function of `state` (which the GSAP timeline derives from time).
 * Mirrors src/components/gl/NeuralField.tsx + Stage.tsx; keep them in step. */
import * as S from "./site.js";

const { THREE } = S;
const W = 1920;
const H = 1080;

const WIDTH = {
  boot: 15, signal: 13.2, memory: 6.8, cortex: 9.4, rings: 6.2, ledger: 8.2,
  fleet: 6.4, orb: 9, trace: 13.6, transmit: 11.5,
};

const rgb = (hex) => new THREE.Vector3(...S.hexToRgb(hex));

export const site = S;
export const F = (name) => S.FORMATIONS.indexOf(name);

/** Mutable film state. The timeline tweens these; `render(t)` draws them. */
export function makeState(formation = "boot") {
  return {
    from: F(formation), to: F(formation), mix: 0,
    world: 0, scatter: 0, glitch: 0, pulse: 0,
    focus: 0, focusAmt: 0, dim: 1, camX: 0, camY: 0,
    // optional override of where the shape sits, in world units
    offX: null, offY: null,
  };
}

export async function createField(canvas, { count = 14000 } = {}) {
  await document.fonts.load('600 100px "Fraunces Variable"');
  const data = S.buildField(count, S.profile.name.toUpperCase());

  THREE.ColorManagement.enabled = false;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true, stencil: false });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
  camera.position.set(0, 0, 14);

  const rows = data.rows;
  const tex = new THREE.DataTexture(data.texture, S.TEX_W, rows * S.FORMATIONS.length, THREE.RGBAFormat, THREE.FloatType);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;

  const u = {
    uForm: { value: tex }, uTexW: { value: S.TEX_W }, uTexH: { value: rows * S.FORMATIONS.length }, uRows: { value: rows },
    uFrom: { value: 0 }, uTo: { value: 0 }, uMix: { value: 0 },
    uOffFrom: { value: new THREE.Vector3() }, uOffTo: { value: new THREE.Vector3() },
    uSpinFrom: { value: 0 }, uSpinTo: { value: 0 }, uTime: { value: 0 }, uScatter: { value: 0 },
    uFit: { value: 1 }, uSide: { value: 1 }, uPointer: { value: new THREE.Vector3(99, 99, 0) },
    uVel: { value: 0 }, uPulse: { value: 0 }, uSize: { value: 5.2 }, uPR: { value: 1.35 }, uWorld: { value: 0 },
    uInk0: { value: new THREE.Vector3() }, uInk1: { value: new THREE.Vector3() },
    uInk2: { value: new THREE.Vector3() }, uInk3: { value: new THREE.Vector3() },
    uFocus: { value: 0 }, uFocusAmt: { value: 0 }, uDim: { value: 1 },
  };

  // identical seeds to the site so particles land in the same places
  const pg = new THREE.BufferGeometry();
  const idx = new Float32Array(count), seed = new Float32Array(count);
  const r1 = S.mulberry32(7);
  for (let i = 0; i < count; i++) { idx[i] = i; seed[i] = r1(); }
  pg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  pg.setAttribute("aIdx", new THREE.BufferAttribute(idx, 1));
  pg.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));

  const e = data.edges, m = e.length / 2, r2 = S.mulberry32(11);
  const lg = new THREE.BufferGeometry();
  const A = new Float32Array(m * 2), B = new Float32Array(m * 2), SA = new Float32Array(m * 2), SB = new Float32Array(m * 2);
  const side = new Float32Array(m * 2), es = new Float32Array(m * 2);
  for (let k = 0; k < m; k++) {
    const a = e[k * 2], b = e[k * 2 + 1], r = r2();
    for (let v = 0; v < 2; v++) {
      const o = k * 2 + v;
      A[o] = a; B[o] = b; SA[o] = seed[a]; SB[o] = seed[b]; side[o] = v; es[o] = r;
    }
  }
  lg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(m * 6), 3));
  for (const [k, arr] of Object.entries({ aA: A, aB: B, aSA: SA, aSB: SB, aSide: side, aSeed: es })) {
    lg.setAttribute(k, new THREE.BufferAttribute(arr, 1));
  }

  const blendDigital = { blending: THREE.AdditiveBlending };
  const blendAnalog = { blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.DstColorFactor, blendDst: THREE.ZeroFactor };
  const mk = (v, f) => new THREE.ShaderMaterial({ vertexShader: v, fragmentShader: f, uniforms: u, transparent: true, depthWrite: false, depthTest: false, ...blendDigital });
  const pm = mk(S.pointsVert, S.pointsFrag);
  const lm = mk(S.linesVert, S.linesFrag);
  const pts = new THREE.Points(pg, pm);
  const lines = new THREE.LineSegments(lg, lm);
  pts.frustumCulled = lines.frustumCulled = false;
  scene.add(lines, pts);

  const composer = new S.EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType });
  const bloom = new S.BloomEffect({ intensity: 1.35, luminanceThreshold: 0.12, luminanceSmoothing: 0.3, mipmapBlur: true, radius: 0.72 });
  const signal = new S.SignalEffect();
  const bloomPass = new S.EffectPass(camera, bloom);
  composer.addPass(new S.RenderPass(scene, camera));
  composer.addPass(bloomPass);
  composer.addPass(new S.EffectPass(camera, signal));
  composer.setSize(W, H);
  signal.u("uRes").value.set(W, H);

  let world = -1;
  const visW = 2 * 14 * Math.tan(THREE.MathUtils.degToRad(17.5)) * (W / H);
  const fit = (f) => Math.min(1, (visW * 0.94) / WIDTH[f]);
  const off = (f, st, out) => {
    const o = S.STAGING[f].offset;
    return out.set(st.offX ?? o[0], st.offY ?? o[1], o[2]);
  };

  /** Draw the frame for HyperFrames time `t` with field state `st`. */
  function render(t, st) {
    const w = st.world > 0.5 ? 1 : 0;
    if (w !== world) {
      world = w;
      const p = S.PALETTE[w ? "analog" : "digital"];
      u.uInk0.value.copy(rgb(p.key)); u.uInk1.value.copy(rgb(p.t1));
      u.uInk2.value.copy(rgb(p.t2)); u.uInk3.value.copy(rgb(p.t3));
      u.uWorld.value = w;
      for (const mat of [pm, lm]) { Object.assign(mat, w ? blendAnalog : blendDigital); mat.needsUpdate = true; }
      const bg = S.hexToRgb(p.paper);
      renderer.setClearColor(new THREE.Color(bg[0], bg[1], bg[2]), 1);
      bloomPass.enabled = !w;
      signal.u("uWorld").value = w;
    }
    const fa = S.FORMATIONS[st.from], fb = S.FORMATIONS[st.to];
    const mix = Math.min(1, Math.max(0, st.mix));
    const em = mix * mix * (3 - 2 * mix);
    u.uTime.value = t;
    u.uFrom.value = st.from; u.uTo.value = st.to; u.uMix.value = mix;
    u.uFit.value = THREE.MathUtils.lerp(fit(fa), fit(fb), em);
    off(fa, st, u.uOffFrom.value); off(fb, st, u.uOffTo.value);
    u.uSpinFrom.value = S.STAGING[fa].spin; u.uSpinTo.value = S.STAGING[fb].spin;
    u.uScatter.value = st.scatter; u.uPulse.value = st.pulse;
    u.uFocus.value = st.focus; u.uFocusAmt.value = st.focusAmt; u.uDim.value = st.dim;
    camera.position.x = st.camX; camera.position.y = st.camY; camera.lookAt(0, 0, 0);
    signal.u("uGlitch").value = st.glitch;
    signal.u("uTime").value = t;
    composer.render(1 / 30);
  }

  return { render };
}

/* ------------------------------------------------------------------ */
/*  Deterministic text effects                                          */
/* ------------------------------------------------------------------ */
const hash = (n) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };

/** Seeded scramble-in: same frame → same characters, every render. */
export function scramble(tl, el, at, dur, { chars = "01<>/\\|#_", seed = 1 } = {}) {
  const text = el.textContent;
  const p = { v: 0 };
  el.textContent = "";
  tl.fromTo(p, { v: 0 }, {
    v: 1, duration: dur, ease: "none",
    onUpdate() {
      const shown = Math.floor(p.v * text.length);
      const frame = Math.floor(p.v * dur * 30);
      let out = text.slice(0, shown);
      for (let i = shown; i < Math.min(text.length, shown + 6); i++) {
        out += text[i] === " " ? " " : chars[Math.floor(hash(seed * 97 + i * 13 + frame) * chars.length)];
      }
      el.textContent = p.v >= 1 ? text : out;
    },
  }, at);
}

/** Wrap each word in a mask so it can rise into place. Returns the inner spans. */
export function words(el) {
  const parts = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  return parts.map((w, i) => {
    const mask = document.createElement("span");
    mask.className = "w-mask";
    const inner = document.createElement("span");
    inner.className = "w-in";
    inner.textContent = w;
    mask.appendChild(inner);
    el.appendChild(mask);
    if (i < parts.length - 1) el.appendChild(document.createTextNode(" "));
    return inner;
  });
}

/** Wrap each character for a slam-in. */
export function chars(el) {
  const t = el.textContent;
  el.textContent = "";
  return [...t].map((c) => {
    const mask = document.createElement("span");
    mask.className = "w-mask";
    const inner = document.createElement("span");
    inner.className = "w-in";
    inner.textContent = c === " " ? " " : c;
    mask.appendChild(inner);
    el.appendChild(mask);
    return inner;
  });
}

/* ------------------------------------------------------------------ */
/*  Architecture diagram (same router as the site's ArchDiagram)        */
/* ------------------------------------------------------------------ */
export function diagram(arch, { CW = 244, RH = 126, NW = 186, NH = 66 } = {}) {
  const ns = "http://www.w3.org/2000/svg";
  const cols = Math.max(...arch.nodes.map((n) => n.col)) + 1;
  const rows = Math.max(...arch.nodes.map((n) => n.row)) + 1;
  const pos = new Map(arch.nodes.map((n) => [n.id, { x: n.col * CW + 4, y: n.row * RH + 4, n }]));
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${cols * CW} ${rows * RH + 30}`);
  svg.setAttribute("width", String(cols * CW));
  svg.setAttribute("height", String(rows * RH + 30));
  const el = (tag, attrs, parent = svg) => {
    const x = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) x.setAttribute(k, String(v));
    parent.appendChild(x);
    return x;
  };
  const edges = [];
  arch.edges.forEach(([a, b, label], i) => {
    const P = pos.get(a), Q = pos.get(b);
    const cA = P.x + NW / 2, cB = Q.x + NW / 2;
    let d, mx, my;
    if (P.n.col === Q.n.col) {
      const y1 = Q.y > P.y ? P.y + NH : P.y, y2 = Q.y > P.y ? Q.y : Q.y + NH;
      d = `M ${cA} ${y1} L ${cA} ${y2}`; mx = cA + 10; my = (y1 + y2) / 2 + 4;
    } else if (Q.x > P.x) {
      const x1 = P.x + NW, y1 = P.y + NH / 2, x2 = Q.x, y2 = Q.y + NH / 2, k = (x2 - x1) * 0.6;
      d = `M ${x1} ${y1} C ${x1 + k} ${y1}, ${x2 - k} ${y2}, ${x2} ${y2}`; mx = (x1 + x2) / 2; my = (y1 + y2) / 2 - 10;
    } else if (Q.n.row > P.n.row) {
      const y1 = P.y + NH, y2 = Q.y, k = (y2 - y1) * 0.6;
      d = `M ${cA} ${y1} C ${cA} ${y1 + k}, ${cB} ${y2 - k}, ${cB} ${y2}`; mx = (cA + cB) / 2; my = (y1 + y2) / 2;
    } else if (Q.n.row < P.n.row) {
      const y1 = P.y, y2 = Q.y + NH, k = (y1 - y2) * 0.6;
      d = `M ${cA} ${y1} C ${cA} ${y1 - k}, ${cB} ${y2 + k}, ${cB} ${y2}`; mx = (cA + cB) / 2; my = (y1 + y2) / 2;
    } else {
      const y1 = P.y + NH, dip = y1 + 42;
      d = `M ${cA} ${y1} C ${cA} ${dip}, ${cB} ${dip}, ${cB} ${Q.y + NH}`; mx = (cA + cB) / 2; my = dip - 2;
    }
    const path = el("path", { d, fill: "none", stroke: "var(--ink-3)", "stroke-width": 1.6, class: "edge" });
    const dot = el("circle", { r: 5, fill: `var(--t${Q.n.tier})`, class: "packet", cx: -50, cy: -50 });
    let lab = null;
    if (label) {
      lab = el("text", { x: mx, y: my, "text-anchor": "middle", class: "elabel" });
      lab.textContent = label;
    }
    edges.push({ path, dot, lab, i });
  });
  const nodes = [];
  for (const { x, y, n } of pos.values()) {
    const g = el("g", { class: "node" });
    el("rect", { x, y, width: NW, height: NH, class: "nbox" }, g);
    el("rect", { x, y, width: 5, height: NH, fill: `var(--t${n.tier})` }, g);
    const t1 = el("text", { x: x + 18, y: y + 29, class: "nlabel" }, g);
    t1.textContent = n.label;
    if (n.sub) {
      const t2 = el("text", { x: x + 18, y: y + 51, class: "nsub" }, g);
      t2.textContent = n.sub;
      if (n.sub.length * 13 * 0.6 > NW - 28) { t2.setAttribute("textLength", NW - 28); t2.setAttribute("lengthAdjust", "spacingAndGlyphs"); }
    }
    if (n.label.length * 19 * 0.56 > NW - 28) { t1.setAttribute("textLength", NW - 28); t1.setAttribute("lengthAdjust", "spacingAndGlyphs"); }
    nodes.push(g);
  }
  return { svg, nodes, edges };
}

/** Packets along edges as a pure function of time (no SMIL, no clocks). */
export function packetsAt(edges, t) {
  for (const e of edges) {
    const len = e.path.getTotalLength();
    const period = 1.6 + (e.i % 3) * 0.4;
    const p = ((t + e.i * 0.37) % period) / period;
    const pt = e.path.getPointAtLength(p * len);
    e.dot.setAttribute("cx", pt.x);
    e.dot.setAttribute("cy", pt.y);
  }
}

/* ------------------------------------------------------------------ */
/*  Keyframe tracks: field state as a pure function of time             */
/* ------------------------------------------------------------------ */
const EASE = {
  linear: (x) => x,
  smooth: (x) => x * x * (3 - 2 * x),
  out: (x) => 1 - Math.pow(1 - x, 3),
  in: (x) => x * x * x,
  expo: (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
};

/** keys: [[time, value, ease?], ...] — ease applies to the segment ending at that key. */
export function track(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, ease = "smooth"] = keys[i];
      const [t0, v0] = keys[i - 1];
      if (t <= t1) {
        const x = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
        return v0 + (v1 - v0) * EASE[ease](x);
      }
    }
    return keys[keys.length - 1][1];
  };
}

/** cuts: [[startTime, endTime, fromFormation, toFormation, ease?], ...] in order. */
export function morphs(cuts, first) {
  return (t) => {
    let cur = { from: F(first), to: F(first), mix: 0 };
    for (const [t0, t1, a, b, ease = "expo"] of cuts) {
      if (t < t0) break;
      const x = Math.min(1, (t - t0) / (t1 - t0));
      cur = { from: F(a), to: F(b), mix: EASE[ease](x) };
    }
    return cur;
  };
}

/** Step function for discrete values (e.g. world flips). keys: [[time, value], ...] */
export function steps(keys) {
  return (t) => {
    let v = keys[0][1];
    for (const [k, val] of keys) if (t >= k) v = val;
    return v;
  };
}
