/* =====================================================================
 *  The Data City — layout, buildings and the camera script.
 *  Pure data + seeded generation; the R3F scene in components/city reads it.
 *  Shot index == `data-formation` on each DOM section (Director maps scroll → shot).
 * ===================================================================== */

import { projects, skillGroups, type Tier } from "@/data/portfolio";

export type V3 = [number, number, number];

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/*  Districts: one per featured project, around the central tower      */
/* ------------------------------------------------------------------ */
export type TowerShape = "gyro" | "ledger" | "fleet" | "orb";

export type District = {
  slug: string;
  name: string;
  tier: Tier;
  center: V3;
  shape: TowerShape;
  height: number;
};

const FEATURED = projects.filter((p) => p.featured && p.chapter);
const SHAPES: Record<string, TowerShape> = { rings: "gyro", ledger: "ledger", fleet: "fleet", orb: "orb" };
const SPOTS: V3[] = [
  [-17, 0, -8],
  [16, 0, -12],
  [-15, 0, 13],
  [17, 0, 11],
];

export const DISTRICTS: District[] = FEATURED.map((p, i) => ({
  slug: p.slug,
  name: p.name,
  tier: p.tier,
  center: SPOTS[i % SPOTS.length],
  shape: SHAPES[p.chapter!.formation] ?? "gyro",
  height: [12, 10, 9, 11][i % 4],
}));

/** Secondary projects: smaller landmark towers on the outskirts. */
export const OUTSKIRTS = projects
  .filter((p) => !p.featured || !p.chapter)
  .map((p, i) => ({ slug: p.slug, name: p.name, tier: p.tier, center: [[-30, 0, 2], [30, 0, -1], [2, 0, 30]][i % 3] as V3 }));

export const HUB: V3 = [0, 0, 0]; // the "you" tower (MEMORY)
export const ANTENNA: V3 = [0, 0, -34]; // TRANSMIT

/* ------------------------------------------------------------------ */
/*  The skyline: real architecture on a street grid (instanced)         */
/* ------------------------------------------------------------------ */
/** One box of a building (podium, shaft, setback, crown) — instanced. */
export type Section = { x: number; y: number; z: number; w: number; h: number; d: number; tier: Tier; seed: number; trim: number };
/** Rooftop clutter: tanks, HVAC, masts. */
export type Prop = { x: number; y: number; z: number; w: number; h: number; d: number; kind: 0 | 1 | 2 };
/** Neon signs bolted to facades. */
export type Sign = { x: number; y: number; z: number; w: number; h: number; ry: number; tier: Tier; seed: number };
export type Beacon = { x: number; y: number; z: number; seed: number };

export type Skyline = { sections: Section[]; props: Prop[]; signs: Sign[]; beacons: Beacon[] };

export function buildCity(lots: number, far = false): Skyline {
  const r = rng(far ? 4242 : 2026);
  const sections: Section[] = [];
  const props: Prop[] = [];
  const signs: Sign[] = [];
  const beacons: Beacon[] = [];
  const keepClear: { c: V3; r: number }[] = far
    ? []
    : [
        { c: HUB, r: 5.5 },
        ...DISTRICTS.map((d) => ({ c: d.center, r: 4.4 })),
        ...OUTSKIRTS.map((d) => ({ c: d.center, r: 3 })),
        { c: ANTENNA, r: 5 },
      ];
  const used = new Set<string>();
  let guard = 0;
  let made = 0;
  while (made < lots && guard++ < lots * 60) {
    let gx: number, gz: number;
    if (far) {
      const a = r() * Math.PI * 2;
      const rad = 62 + r() * 55;
      gx = Math.round((Math.cos(a) * rad) / 2.6) * 2.6;
      gz = Math.round((Math.sin(a) * rad) / 2.6) * 2.6;
    } else {
      gx = Math.round((r() * 2 - 1) * 23) * 2.2;
      gz = Math.round((r() * 2 - 1) * 23) * 2.2;
      if (Math.abs(gx) < 1.2 || Math.abs(gz) < 1.2) continue; // main avenues
      if (Math.abs(gx - gz) < 1.5 || Math.abs(gx + gz) < 1.5) continue; // diagonal boulevards
      if (keepClear.some(({ c, r: rad }) => Math.hypot(gx - c[0], gz - c[2]) < rad)) continue;
      if (SHOTS.some((sh) => sh.pos[1] < 20 && distToSegment(gx, gz, sh.pos, sh.target) < 3.2)) continue;
    }
    const key = `${gx},${gz}`;
    if (used.has(key)) continue;
    used.add(key);
    made++;

    const dist = Math.hypot(gx, gz);
    const tier = (1 + Math.floor(r() * 3)) as Tier;
    const seed = r();
    const lot = far ? 2.2 : 1.9;
    const w = lot * (0.62 + r() * 0.3);
    const d = lot * (0.62 + r() * 0.3);
    // taller toward downtown; a few landmarks punch through
    let H = far ? 4 + Math.pow(r(), 1.6) * 22 : Math.max(0.9, 8.5 - dist * 0.13) * (0.35 + Math.pow(r(), 2) * 1.5);
    if (!far && r() < 0.06) H *= 1.8;
    const trim = r() < 0.3 ? 1 : 0;
    const push = (x: number, y: number, z: number, sw: number, sh: number, sd: number) =>
      sections.push({ x, y, z, w: sw, h: sh, d: sd, tier, seed, trim });

    const kind = far ? 0 : H < 2.2 ? 1 : r() < 0.45 ? 0 : r() < 0.6 ? 2 : 3;
    let top = 0;
    let topW = w,
      topD = d;
    if (kind === 0) {
      // podium + shaft + setback
      const ph = Math.min(1.2, H * 0.18);
      push(gx, ph / 2, gz, w * 1.12, ph, d * 1.12);
      const sh = H * 0.78;
      push(gx, ph + sh / 2, gz, w, sh, d);
      const bh = H - ph - sh;
      topW = w * 0.68;
      topD = d * 0.68;
      push(gx, ph + sh + bh / 2, gz, topW, bh, topD);
      top = H;
    } else if (kind === 1) {
      // wide low slab
      push(gx, H / 2, gz, w * 1.15, H, d * 1.15);
      top = H;
      topW = w * 1.15;
      topD = d * 1.15;
    } else if (kind === 2) {
      // stepped ziggurat
      let y = 0;
      for (let k = 0; k < 3; k++) {
        const hh = H * [0.5, 0.3, 0.2][k];
        const s = [1, 0.78, 0.56][k];
        push(gx, y + hh / 2, gz, w * s, hh, d * s);
        y += hh;
        topW = w * s;
        topD = d * s;
      }
      top = y;
    } else {
      // slim spire tower
      push(gx, H / 2, gz, w * 0.72, H, d * 0.72);
      topW = w * 0.72;
      topD = d * 0.72;
      top = H;
    }

    // rooftop clutter
    if (!far) {
      const n = Math.floor(r() * 3);
      for (let k = 0; k < n; k++) {
        const pk = Math.floor(r() * 3) as 0 | 1 | 2;
        const px = gx + (r() - 0.5) * topW * 0.6;
        const pz = gz + (r() - 0.5) * topD * 0.6;
        if (pk === 0) props.push({ x: px, y: top + 0.18, z: pz, w: 0.28, h: 0.36, d: 0.28, kind: 0 }); // water tank
        else if (pk === 1) props.push({ x: px, y: top + 0.09, z: pz, w: 0.42, h: 0.18, d: 0.3, kind: 1 }); // HVAC
        else props.push({ x: px, y: top + 0.6, z: pz, w: 0.04, h: 1.2, d: 0.04, kind: 2 }); // mast
      }
      if (H > 6.5) beacons.push({ x: gx + topW * 0.4, y: top + 0.08, z: gz + topD * 0.4, seed: r() });
      // a neon sign on the street-facing side of some buildings
      if (H > 2.4 && r() < 0.24) {
        const vertical = r() < 0.6;
        const face = Math.floor(r() * 4);
        const sw = vertical ? 0.32 : Math.min(w * 0.8, 1.3);
        const sh = vertical ? Math.min(1.8, H * 0.35) : 0.36;
        const sy = Math.min(top - sh / 2 - 0.3, 1.4 + r() * (top * 0.5));
        const ox = [0, w / 2 + 0.03, 0, -w / 2 - 0.03][face];
        const oz = [d / 2 + 0.03, 0, -d / 2 - 0.03, 0][face];
        signs.push({ x: gx + ox, y: sy, z: gz + oz, w: sw, h: sh, ry: [0, Math.PI / 2, Math.PI, -Math.PI / 2][face], tier, seed: r() });
      }
    }
  }
  return { sections, props, signs, beacons };
}

/** @deprecated kept for the films bundle; the site uses buildCity */
export type Block = { x: number; z: number; w: number; d: number; h: number; tier: Tier; seed: number };
export function buildBlocks(count: number): Block[] {
  return buildCity(count).sections.map((s) => ({ x: s.x, z: s.z, w: s.w, d: s.d, h: s.y + s.h / 2, tier: s.tier, seed: s.seed }));
}

function distToSegment(x: number, z: number, a: V3, b: V3) {
  const vx = b[0] - a[0],
    vz = b[2] - a[2];
  const t = Math.max(0, Math.min(1, ((x - a[0]) * vx + (z - a[2]) * vz) / (vx * vx + vz * vz || 1)));
  return Math.hypot(x - (a[0] + vx * t), z - (a[2] + vz * t));
}

/* ------------------------------------------------------------------ */
/*  Highways: one per skill group, hub → around the ring                */
/* ------------------------------------------------------------------ */
export type Highway = { title: string; tier: Tier; points: V3[] };

export const HIGHWAYS: Highway[] = skillGroups.map((g, i) => {
  const a = (i / skillGroups.length) * Math.PI * 2 + 0.3;
  const R = 24;
  const mid: V3 = [Math.cos(a + 0.35) * R * 0.55, 0.06, Math.sin(a + 0.35) * R * 0.55];
  return {
    title: g.title,
    tier: g.tier,
    points: [
      [Math.cos(a) * 4, 0.06, Math.sin(a) * 4],
      mid,
      [Math.cos(a) * R, 0.06, Math.sin(a) * R],
      [Math.cos(a + 0.6) * R * 1.15, 0.06, Math.sin(a + 0.6) * R * 1.15],
    ],
  };
});

/** LOG avenue: a straight boulevard from the hub to the antenna with milestone posts. */
export const AVENUE: { from: V3; to: V3 } = { from: [0, 0.06, -5.5], to: [0, 0.06, -29] };

/* ------------------------------------------------------------------ */
/*  Camera script — one shot per scroll section                         */
/* ------------------------------------------------------------------ */
export type Shot = {
  pos: V3;
  target: V3;
  /** shift the subject sideways on wide screens (fraction of view, +right) */
  lateral?: number;
  /** extra camera travel while scrolling through the section (e.g. elevator rise) */
  rise?: V3;
  fov?: number;
};

const d = (i: number) => DISTRICTS[i]?.center ?? [0, 0, 0];
const towerShot = (i: number): Shot => {
  const c = d(i);
  const h = DISTRICTS[i]?.height ?? 10;
  // stand off the tower on the side facing the hub, looking slightly up the facade
  const dir = Math.atan2(-c[2], -c[0]);
  const ox = Math.cos(dir) * 21 + Math.cos(dir + Math.PI / 2) * 5;
  const oz = Math.sin(dir) * 21 + Math.sin(dir + Math.PI / 2) * 5;
  return {
    pos: [c[0] + ox, 4.5, c[2] + oz],
    target: [c[0], h * 0.45, c[2]],
    lateral: 0.22,
    rise: [0, h * 0.5, 0],
    fov: 36,
  };
};

export const SHOTS: Shot[] = [
  /* 0 boot      */ { pos: [0, 62, 48], target: [0, 0, 0], fov: 32 },
  /* 1 signal    */ { pos: [26, 7, 44], target: [-2, 11, 0], fov: 42 },
  /* 2 memory    */ { pos: [11, 6, 13], target: [0, 5.5, 0], lateral: 0.24, rise: [0, 3, 0], fov: 38 },
  /* 3 cortex    */ { pos: [0, 56, 26], target: [0, 0, 1], fov: 42 },
  /* 4 recall    */ towerShot(0),
  /* 5 findesk   */ towerShot(1),
  /* 6 synapse   */ towerShot(2),
  /* 7 cognitia  */ towerShot(3),
  /* 8 log       */ { pos: [9, 4.5, -4], target: [0, 1.5, -18], rise: [-1, 0.5, -16], fov: 42 },
  /* 9 transmit  */ { pos: [14, 9, -20], target: [0, 14, -34], fov: 40 },
];
