/* =====================================================================
 *  Formations — every shape the neural field can take.
 *  Each formation is N points × (x, y, z, ink). `ink` is 0 = key (ink
 *  black / phosphor white), 1 = episodic, 2 = semantic, 3 = procedural.
 *  Order here == scroll order == data-formation index in the DOM.
 * ===================================================================== */

import { skillGroups, type Formation } from "@/data/portfolio";

export const FORMATIONS: Formation[] = [
  "boot",
  "signal",
  "memory",
  "cortex",
  "rings",
  "ledger",
  "fleet",
  "orb",
  "trace",
  "transmit",
];

/** Per-formation staging: how fast it spins, and where it sits on wide screens. */
export const STAGING: Record<Formation, { spin: number; offset: [number, number, number] }> = {
  boot: { spin: 0, offset: [0, 0, 0] },
  signal: { spin: 0, offset: [0, 0.9, 0] },
  memory: { spin: 0.6, offset: [2.9, 0, 0] },
  cortex: { spin: 0.35, offset: [0, 0, 0] },
  rings: { spin: 1, offset: [3.1, 0, 0] },
  ledger: { spin: 0.18, offset: [3.0, -0.2, 0] },
  fleet: { spin: 0.15, offset: [3.0, 0, 0] },
  orb: { spin: 0.8, offset: [3.1, 0, 0] },
  trace: { spin: 0, offset: [0, 0, 0] },
  transmit: { spin: 0, offset: [0, 0.3, 0] },
};

export const TEX_W = 256;

/* ------------------------------------------------------------------ */
/*  Seeded randomness so the art is identical on every visit           */
/* ------------------------------------------------------------------ */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;
const gauss = (r: Rng) => {
  const u = Math.max(r(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
};
const pickInk = (r: Rng, key = 0.3): number => {
  const v = r();
  if (v < key) return 0;
  const t = (v - key) / (1 - key);
  return t < 0.34 ? 1 : t < 0.72 ? 2 : 3;
};
function rotX(p: [number, number, number], a: number): [number, number, number] {
  const c = Math.cos(a),
    s = Math.sin(a);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
}
function rotZ(p: [number, number, number], a: number): [number, number, number] {
  const c = Math.cos(a),
    s = Math.sin(a);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
}

type Writer = (i: number, x: number, y: number, z: number, ink: number) => void;

/* ------------------------------------------------------------------ */
/*  Individual formations                                              */
/* ------------------------------------------------------------------ */

/** CRT power-on: everything collapsed onto one horizontal scanline. */
function boot(n: number, r: Rng, w: Writer) {
  for (let i = 0; i < n; i++) {
    const x = (r() * 2 - 1) * 7.5 * Math.pow(r(), 0.35);
    w(i, x, gauss(r) * 0.012, gauss(r) * 0.05, pickInk(r, 0.6));
  }
}

/** The name, sampled from real glyph pixels of the display face. */
function signal(n: number, r: Rng, w: Writer, text: string) {
  const pts = sampleText(text);
  const width = 12.6;
  for (let i = 0; i < n; i++) {
    if (!pts.length) {
      w(i, (r() - 0.5) * width, (r() - 0.5) * 2, 0, 0);
      continue;
    }
    const p = pts[Math.floor(r() * pts.length)];
    w(i, p[0] * width + gauss(r) * 0.012, p[1] * width + gauss(r) * 0.012, gauss(r) * 0.08, pickInk(r, 0.55));
  }
}

let textCache: { text: string; pts: [number, number][] } | null = null;
function sampleText(text: string): [number, number][] {
  if (textCache?.text === text) return textCache.pts;
  if (typeof document === "undefined") return [];
  const W = 2048,
    H = 420;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) return [];
  g.fillStyle = "#fff";
  g.textBaseline = "middle";
  g.textAlign = "center";
  let size = 330;
  const font = (s: number) =>
    `600 ${s}px "Fraunces Variable", "Fraunces", Georgia, serif`;
  g.font = font(size);
  const measured = g.measureText(text).width;
  if (measured > W * 0.96) {
    size = Math.floor((size * W * 0.96) / measured);
    g.font = font(size);
  }
  g.fillText(text, W / 2, H / 2 + size * 0.04);
  const data = g.getImageData(0, 0, W, H).data;
  const tw = g.measureText(text).width;
  const pts: [number, number][] = [];
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (data[(y * W + x) * 4 + 3] > 128) {
        // normalise so text width maps to 1 unit, centred
        pts.push([(x - W / 2) / tw, -(y - H / 2) / tw]);
      }
    }
  }
  textCache = { text, pts };
  return pts;
}

/** Recall's three strata: loose episodic cloud, ringed semantic disc, crystalline procedural lattice. */
function memory(n: number, r: Rng, w: Writer) {
  for (let i = 0; i < n; i++) {
    const t = r();
    let p: [number, number, number];
    let ink: number;
    if (t < 0.42) {
      const a = r() * Math.PI * 2,
        rad = Math.sqrt(r()) * 3.1;
      p = [Math.cos(a) * rad, 1.75 + gauss(r) * 0.22, Math.sin(a) * rad];
      ink = r() < 0.12 ? 0 : 1;
    } else if (t < 0.78) {
      const ring = Math.floor(r() * 6);
      const a = r() * Math.PI * 2,
        rad = 0.55 + ring * 0.48 + gauss(r) * 0.03;
      p = [Math.cos(a) * rad, gauss(r) * 0.04, Math.sin(a) * rad];
      ink = r() < 0.1 ? 0 : 2;
    } else {
      const g = 9,
        s = 0.5;
      const gx = Math.floor(r() * g) - (g - 1) / 2,
        gz = Math.floor(r() * g) - (g - 1) / 2,
        gy = Math.floor(r() * 2);
      // points along lattice edges so it reads as a crystal, not a cloud
      const along = r(),
        axis = Math.floor(r() * 3);
      p = [gx * s, -1.75 - gy * s, gz * s];
      p[axis === 1 ? 1 : axis === 0 ? 0 : 2] += (along - 0.5) * s * (axis === 1 ? -1 : 1);
      if (Math.hypot(p[0], p[2]) > 2.4) {
        p[0] *= 0.6;
        p[2] *= 0.6;
      }
      ink = r() < 0.15 ? 0 : 3;
    }
    p = rotX(p, 0.42);
    w(i, p[0], p[1], p[2], ink);
  }
}

/** Skill cortex: one cluster per skill group on an ellipsoid, joined by a sparse shell. */
export const CORTEX_CENTERS: [number, number, number][] = (() => {
  const out: [number, number, number][] = [];
  const k = skillGroups.length;
  for (let i = 0; i < k; i++) {
    const a = (i / k) * Math.PI * 2 + 0.4;
    const yy = i % 2 === 0 ? 0.9 : -0.9;
    out.push([Math.cos(a) * 3.6, yy + Math.sin(a * 2) * 0.4, Math.sin(a) * 2.0]);
  }
  return out;
})();

function cortex(n: number, r: Rng, w: Writer) {
  const centers = CORTEX_CENTERS;
  for (let i = 0; i < n; i++) {
    if (r() < 0.72) {
      const c = Math.floor(r() * centers.length);
      const [cx, cy, cz] = centers[c];
      const s = 0.42;
      w(i, cx + gauss(r) * s, cy + gauss(r) * s, cz + gauss(r) * s, r() < 0.15 ? 0 : skillGroups[c].tier);
    } else {
      const u = r() * 2 - 1,
        a = r() * Math.PI * 2,
        q = Math.sqrt(1 - u * u);
      w(i, q * Math.cos(a) * 4.2, u * 2.3, q * Math.sin(a) * 2.4, 0);
    }
  }
}

/** Recall object: a memory gyroscope — three tilted rings around a dense core. */
function rings(n: number, r: Rng, w: Writer) {
  const spec = [
    { rad: 1.25, tilt: 0.3, roll: 0.0, ink: 3, thick: 0.03, share: 0.3 },
    { rad: 2.0, tilt: 1.1, roll: 0.5, ink: 2, thick: 0.06, share: 0.3 },
    { rad: 2.75, tilt: -0.7, roll: -0.4, ink: 1, thick: 0.22, share: 0.28 },
  ];
  for (let i = 0; i < n; i++) {
    let t = r();
    let done = false;
    for (const s of spec) {
      if (t < s.share) {
        const a = r() * Math.PI * 2;
        // episodic ring decays: sparser and more diffuse along part of its arc
        const decay = s.ink === 1 ? Math.pow(0.5 + 0.5 * Math.sin(a), 2) : 0;
        let p: [number, number, number] = [
          Math.cos(a) * s.rad + gauss(r) * (s.thick + decay * 0.4),
          gauss(r) * (s.thick + decay * 0.3),
          Math.sin(a) * s.rad + gauss(r) * (s.thick + decay * 0.4),
        ];
        p = rotZ(rotX(p, s.tilt), s.roll);
        w(i, p[0], p[1], p[2], r() < 0.1 ? 0 : s.ink);
        done = true;
        break;
      }
      t -= s.share;
    }
    if (!done) {
      const u = r() * 2 - 1,
        a = r() * Math.PI * 2,
        q = Math.sqrt(1 - u * u),
        rad = Math.pow(r(), 0.6) * 0.55;
      w(i, q * Math.cos(a) * rad, u * rad, q * Math.sin(a) * rad, r() < 0.5 ? 0 : 3);
    }
  }
}

/** FinDesk object: a 13-week cash forecast — columns, a widening confidence band, and the approval gate. */
function ledger(n: number, r: Rng, w: Writer) {
  const weeks = 13,
    x0 = -3.0,
    dx = 0.46;
  const h = (k: number) => 0.9 + 0.55 * Math.sin(k * 0.7) + k * 0.07;
  for (let i = 0; i < n; i++) {
    const t = r();
    const k = Math.floor(r() * weeks);
    const x = x0 + k * dx;
    if (t < 0.55) {
      const hh = h(k);
      const edge = r() < 0.55;
      let px = x + (r() - 0.5) * 0.26,
        pz = (r() - 0.5) * 0.26;
      if (edge) {
        if (r() < 0.5) px = x + (r() < 0.5 ? -0.13 : 0.13);
        else pz = r() < 0.5 ? -0.13 : 0.13;
      }
      const py = -1.6 + r() * hh;
      w(i, px, py, pz, r() < 0.12 ? 0 : 2);
    } else if (t < 0.85) {
      const fx = x0 + r() * (weeks - 1) * dx;
      const kk = (fx - x0) / dx;
      const band = 0.08 + kk * 0.035;
      w(i, fx, -1.6 + h(kk) + 0.25 + gauss(r) * band, gauss(r) * band * 0.6, r() < 0.15 ? 0 : 1);
    } else {
      // approval gate: a frame the forecast must pass through
      const gx = x0 + weeks * dx + 0.35;
      const side = Math.floor(r() * 4);
      const gh = 2.9,
        gw = 1.1;
      let y = -1.6,
        z = 0;
      if (side === 0) { y = -1.6 + r() * gh; z = -gw / 2; }
      else if (side === 1) { y = -1.6 + r() * gh; z = gw / 2; }
      else if (side === 2) { y = -1.6 + gh; z = (r() - 0.5) * gw; }
      else { y = -1.6; z = (r() - 0.5) * gw; }
      w(i, gx + gauss(r) * 0.02, y, z, r() < 0.2 ? 0 : 3);
    }
  }
}

/** SYNAPSE object: a 5×5 fleet; one machine diverges, gossip arcs carry signatures between peers. */
function fleet(n: number, r: Rng, w: Writer) {
  const G = 5,
    sp = 1.05,
    s = 0.3;
  const odd = [3, 1];
  const arcs: [number, number, number, number][] = [
    [3, 1, 1, 0], [3, 1, 4, 3], [3, 1, 2, 3], [3, 1, 0, 2], [3, 1, 4, 0], [3, 1, 1, 4],
  ];
  for (let i = 0; i < n; i++) {
    const t = r();
    let p: [number, number, number];
    let ink: number;
    if (t < 0.74) {
      const gx = Math.floor(r() * G),
        gz = Math.floor(r() * G);
      const isOdd = gx === odd[0] && gz === odd[1];
      const j = isOdd ? 0.07 : 0;
      // points on cube edges
      const e = [r() - 0.5, r() - 0.5, r() - 0.5];
      const a1 = Math.floor(r() * 3),
        a2 = (a1 + 1 + Math.floor(r() * 2)) % 3;
      e[a1] = e[a1] < 0 ? -0.5 : 0.5;
      e[a2] = e[a2] < 0 ? -0.5 : 0.5;
      p = [
        (gx - (G - 1) / 2) * sp + e[0] * s + gauss(r) * j,
        e[1] * s * 1.2 + (isOdd ? 0.25 : 0) + gauss(r) * j,
        (gz - (G - 1) / 2) * sp + e[2] * s + gauss(r) * j,
      ];
      ink = isOdd ? 1 : r() < 0.25 ? 0 : 2;
    } else {
      const [ax, az, bx, bz] = arcs[Math.floor(r() * arcs.length)];
      const u = r();
      const A = [(ax - 2) * sp, 0.2, (az - 2) * sp],
        B = [(bx - 2) * sp, 0.2, (bz - 2) * sp];
      const lift = Math.sin(u * Math.PI) * 1.3;
      p = [A[0] + (B[0] - A[0]) * u, A[1] + lift, A[2] + (B[2] - A[2]) * u];
      ink = 3;
    }
    p = rotX(p, 0.62);
    w(i, p[0], p[1], p[2], ink);
  }
}

/** Cognitia object: a mentor orb fed by a retrieval stream, ringed by voice waves. */
function orb(n: number, r: Rng, w: Writer) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const t = r();
    if (t < 0.45) {
      const k = Math.floor(r() * 2400);
      const y = 1 - (k / 2399) * 2,
        q = Math.sqrt(1 - y * y),
        a = golden * k;
      const rad = 1.8 + gauss(r) * 0.015;
      w(i, Math.cos(a) * q * rad, y * rad, Math.sin(a) * q * rad, r() < 0.2 ? 0 : 2);
    } else if (t < 0.58) {
      const u = r() * 2 - 1,
        a = r() * Math.PI * 2,
        q = Math.sqrt(1 - u * u),
        rad = Math.pow(r(), 0.5) * 0.6;
      w(i, q * Math.cos(a) * rad, u * rad, q * Math.sin(a) * rad, 3);
    } else if (t < 0.82) {
      // retrieval stream spiralling in from the left
      const u = Math.pow(r(), 0.8);
      const ang = u * Math.PI * 6;
      const rad = 0.15 + (1 - u) * 0.9;
      w(i, -6.2 + u * 6.2, Math.cos(ang) * rad, Math.sin(ang) * rad, r() < 0.2 ? 0 : 1);
    } else {
      const ring = r() < 0.5 ? 2.5 : 3.0;
      const a = r() * Math.PI * 2;
      const wave = Math.sin(a * 12) * 0.08;
      let p: [number, number, number] = [Math.cos(a) * (ring + wave), gauss(r) * 0.02, Math.sin(a) * (ring + wave)];
      p = rotX(p, 1.25);
      w(i, p[0], p[1], p[2], 1);
    }
  }
}

/** LOG: a horizontal double helix — the memory trace of everything so far. */
function trace(n: number, r: Rng, w: Writer) {
  const L = 13,
    R = 0.85,
    turns = 5;
  for (let i = 0; i < n; i++) {
    const u = r();
    const x = (u - 0.5) * L;
    const a = u * Math.PI * 2 * turns;
    const t = r();
    if (t < 0.8) {
      const strand = r() < 0.5 ? 0 : Math.PI;
      w(i, x, Math.cos(a + strand) * R + gauss(r) * 0.03, Math.sin(a + strand) * R + gauss(r) * 0.03, strand ? 2 : 3);
    } else {
      // rungs every so often
      const ru = Math.round(u * 60) / 60;
      const ra = ru * Math.PI * 2 * turns;
      const k = r() * 2 - 1;
      w(i, (ru - 0.5) * L, Math.cos(ra) * R * k, Math.sin(ra) * R * k, r() < 0.5 ? 0 : 1);
    }
  }
}

/** TRANSMIT: concentric broadcast rings around a single source. */
function transmit(n: number, r: Rng, w: Writer) {
  for (let i = 0; i < n; i++) {
    if (r() < 0.08) {
      w(i, gauss(r) * 0.12, gauss(r) * 0.12, gauss(r) * 0.12, 3);
      continue;
    }
    const ring = Math.floor(Math.pow(r(), 0.8) * 9);
    const rad = 0.6 + ring * 0.62;
    const a = r() * Math.PI * 2;
    w(i, Math.cos(a) * rad, Math.sin(a) * rad * 0.62, gauss(r) * 0.05 - ring * 0.12, ring % 3 === 0 ? 1 : ring % 3 === 1 ? 2 : r() < 0.4 ? 0 : 3);
  }
}

/* ------------------------------------------------------------------ */
/*  Build the packed texture + neighbour edges                         */
/* ------------------------------------------------------------------ */
export type FieldData = {
  count: number;
  rows: number;
  texture: Float32Array;
  edges: Uint32Array; // pairs (a, b)
};

export function buildField(count: number, name: string): FieldData {
  const rows = Math.ceil(count / TEX_W);
  const per = rows * TEX_W;
  const texture = new Float32Array(per * FORMATIONS.length * 4);
  FORMATIONS.forEach((f, fi) => {
    const r = mulberry32(1337 + fi * 7919);
    const base = fi * per * 4;
    const w: Writer = (i, x, y, z, ink) => {
      const o = base + i * 4;
      texture[o] = x;
      texture[o + 1] = y;
      texture[o + 2] = z;
      texture[o + 3] = ink;
    };
    switch (f) {
      case "boot": boot(count, r, w); break;
      case "signal": signal(count, r, w, name); break;
      case "memory": memory(count, r, w); break;
      case "cortex": cortex(count, r, w); break;
      case "rings": rings(count, r, w); break;
      case "ledger": ledger(count, r, w); break;
      case "fleet": fleet(count, r, w); break;
      case "orb": orb(count, r, w); break;
      case "trace": trace(count, r, w); break;
      case "transmit": transmit(count, r, w); break;
    }
  });

  // Edges: nearest neighbours inside the formations where a "network" reads best.
  const edgeSets = ["signal", "cortex", "fleet", "orb", "memory"] as Formation[];
  const pairs: number[] = [];
  const budget = Math.floor(count * 0.11);
  const rng = mulberry32(99);
  for (const f of edgeSets) {
    const fi = FORMATIONS.indexOf(f);
    const base = fi * per * 4;
    const cell = 0.35;
    const grid = new Map<string, number[]>();
    const key = (x: number, y: number, z: number) =>
      `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;
    for (let i = 0; i < count; i++) {
      const o = base + i * 4;
      const k = key(texture[o], texture[o + 1], texture[o + 2]);
      let b = grid.get(k);
      if (!b) grid.set(k, (b = []));
      b.push(i);
    }
    for (let e = 0; e < budget; e++) {
      const i = Math.floor(rng() * count);
      const o = base + i * 4;
      const x = texture[o],
        y = texture[o + 1],
        z = texture[o + 2];
      const cx = Math.floor(x / cell),
        cy = Math.floor(y / cell),
        cz = Math.floor(z / cell);
      let best = -1,
        bd = Infinity;
      for (let a = -1; a <= 1; a++)
        for (let b = -1; b <= 1; b++)
          for (let c = -1; c <= 1; c++) {
            const bucket = grid.get(`${cx + a},${cy + b},${cz + c}`);
            if (!bucket) continue;
            for (let q = 0; q < bucket.length; q += 3) {
              const j = bucket[q];
              if (j === i) continue;
              const p = base + j * 4;
              const d = (texture[p] - x) ** 2 + (texture[p + 1] - y) ** 2 + (texture[p + 2] - z) ** 2;
              if (d > 0.004 && d < bd) {
                bd = d;
                best = j;
              }
            }
          }
      if (best >= 0) pairs.push(i, best);
    }
  }
  return { count, rows, texture, edges: new Uint32Array(pairs) };
}
