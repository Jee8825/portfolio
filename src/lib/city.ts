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
/*  Filler blocks: the rest of the skyline (instanced)                 */
/* ------------------------------------------------------------------ */
export type Block = { x: number; z: number; w: number; d: number; h: number; tier: Tier; seed: number };

export function buildBlocks(count: number): Block[] {
  const r = rng(2026);
  const out: Block[] = [];
  const keepClear: { c: V3; r: number }[] = [
    { c: HUB, r: 5.5 },
    ...DISTRICTS.map((d) => ({ c: d.center, r: 4.2 })),
    ...OUTSKIRTS.map((d) => ({ c: d.center, r: 3 })),
    { c: ANTENNA, r: 5 },
  ];
  let guard = 0;
  while (out.length < count && guard++ < count * 40) {
    // grid-snapped lots so streets read as streets
    const gx = Math.round((r() * 2 - 1) * 23) * 2.2;
    const gz = Math.round((r() * 2 - 1) * 23) * 2.2;
    if (Math.abs(gx) < 1.2 || Math.abs(gz) < 1.2) continue; // main avenues
    if (Math.abs(gx - gz) < 1.5 || Math.abs(gx + gz) < 1.5) continue; // diagonal boulevards
    if (keepClear.some(({ c, r: rad }) => Math.hypot(gx - c[0], gz - c[2]) < rad)) continue;
    // keep every camera sightline open: no block between a shot's camera and its subject
    if (SHOTS.some((sh) => sh.pos[1] < 20 && distToSegment(gx, gz, sh.pos, sh.target) < 3.2)) continue;
    if (out.some((b) => b.x === gx && b.z === gz)) continue;
    const dist = Math.hypot(gx, gz);
    const tall = Math.max(0.6, 7.5 - dist * 0.12) * (0.35 + Math.pow(r(), 2.2) * 1.4);
    const w = 1.2 + r() * 0.7;
    const d = 1.2 + r() * 0.7;
    out.push({ x: gx, z: gz, w, d, h: tall, tier: (1 + Math.floor(r() * 3)) as Tier, seed: r() });
  }
  return out;
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
