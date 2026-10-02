"use client";
/* eslint-disable react-hooks/immutability -- three.js objects are mutated per frame by design */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ANTENNA, DISTRICTS, HUB, OUTSKIRTS, type District, type V3 } from "@/lib/city";
import { PALETTE } from "@/lib/palette";
import { stage } from "@/lib/store";
import type { Tier } from "@/data/portfolio";
import { useWorld } from "./useWorld";

/* ------------------------------------------------------------------ */
/*  Shared materials                                                    */
/* ------------------------------------------------------------------ */
const neonColor = (tier: Tier, boost = 3) => new THREE.Color(PALETTE.neon[`t${tier}`]).multiplyScalar(boost);

function useMaterials(glassTier: number) {
  return useMemo(() => {
    const glass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#d9e6ff"),
      metalness: 0,
      roughness: 0.12,
      transmission: glassTier >= 2 ? 0.92 : 0,
      thickness: 1.6,
      attenuationColor: new THREE.Color("#9a7bff"),
      attenuationDistance: 6,
      ior: 1.45,
      transparent: glassTier < 2,
      opacity: glassTier < 2 ? 0.28 : 1,
      iridescence: 0.6,
      iridescenceIOR: 1.3,
      clearcoat: 1,
      envMapIntensity: 1.6,
    });
    const chrome = new THREE.MeshStandardMaterial({ color: "#b9b4cc", metalness: 1, roughness: 0.14, envMapIntensity: 1.4 });
    const dark = new THREE.MeshStandardMaterial({ color: "#16112a", metalness: 0.7, roughness: 0.35, envMapIntensity: 0.8 });
    const neon = {
      1: new THREE.MeshBasicMaterial({ color: neonColor(1), toneMapped: false }),
      2: new THREE.MeshBasicMaterial({ color: neonColor(2), toneMapped: false }),
      3: new THREE.MeshBasicMaterial({ color: neonColor(3), toneMapped: false }),
    } as Record<Tier, THREE.MeshBasicMaterial>;
    return { glass, chrome, dark, neon };
  }, [glassTier]);
}

const EDGE = new THREE.LineBasicMaterial({ color: "#f4f8ff", transparent: true, opacity: 0.85 });
const EDGE_FAINT = new THREE.LineBasicMaterial({ color: "#f4f8ff", transparent: true, opacity: 0.35 });
/* at night glass edges catch the neon: a thin tier-coloured rim */
const EDGE_NEON = {
  1: new THREE.LineBasicMaterial({ color: new THREE.Color(PALETTE.neon.t1).multiplyScalar(1.4), transparent: true, opacity: 0.55, toneMapped: false }),
  2: new THREE.LineBasicMaterial({ color: new THREE.Color(PALETTE.neon.t2).multiplyScalar(1.4), transparent: true, opacity: 0.55, toneMapped: false }),
  3: new THREE.LineBasicMaterial({ color: new THREE.Color(PALETTE.neon.t3).multiplyScalar(1.4), transparent: true, opacity: 0.55, toneMapped: false }),
} as Record<Tier, THREE.LineBasicMaterial>;
const DAY_FILL = new THREE.MeshBasicMaterial({ color: "#f4f8ff", transparent: true, opacity: 0.06, depthWrite: false });
const DAY_MARK = {
  1: new THREE.MeshBasicMaterial({ color: PALETTE.blueprint.t1 }),
  2: new THREE.MeshBasicMaterial({ color: PALETTE.blueprint.t2 }),
  3: new THREE.MeshBasicMaterial({ color: PALETTE.blueprint.t3 }),
} as Record<Tier, THREE.MeshBasicMaterial>;

type PartProps = {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  position?: V3;
  rotation?: V3;
  scale?: V3 | number;
  /** day look: "edges" (CAD lines), "mark" (redline/markup colour), "none" (hidden by day) */
  day?: "edges" | "faint" | "mark" | "none";
  tier?: Tier;
  angle?: number;
};

/** One mesh that is glass/chrome/neon by night and a drafted outline by day. */
function Part({ geometry, material, position, rotation, scale, day = "edges", tier = 2, angle = 18 }: PartProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const edges = useMemo(() => (day === "edges" || day === "faint" ? new THREE.EdgesGeometry(geometry, angle) : null), [geometry, day, angle]);
  const glassy = material instanceof THREE.MeshPhysicalMaterial;
  useWorld((isDay) => {
    if (!mesh.current) return;
    if (day === "mark") mesh.current.material = isDay ? DAY_MARK[tier] : material;
    else if (day === "none") mesh.current.visible = !isDay;
    else mesh.current.material = isDay ? DAY_FILL : material;
    if (lines.current) {
      // by day every outline is drafted; by night only glass shows a neon rim
      lines.current.visible = isDay || (glassy && day === "edges");
      lines.current.material = isDay ? (day === "faint" ? EDGE_FAINT : EDGE) : EDGE_NEON[tier];
    }
  });
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh ref={mesh} geometry={geometry} material={material} />
      {edges && <lineSegments ref={lines} geometry={edges} material={day === "faint" ? EDGE_FAINT : EDGE} visible={false} />}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  The hub: "you" — Recall's three tiers stacked as a tower (MEMORY)  */
/* ------------------------------------------------------------------ */
function Hub({ glassTier }: { glassTier: number }) {
  const m = useMaterials(glassTier);
  const geo = useMemo(
    () => ({
      base: new THREE.BoxGeometry(4, 3.2, 4),
      mid: new THREE.CylinderGeometry(1.7, 1.9, 3.6, 32),
      spire: new THREE.ConeGeometry(1.4, 4.2, 4, 1),
      coreA: new THREE.BoxGeometry(1.2, 3.0, 1.2),
      coreB: new THREE.CylinderGeometry(0.55, 0.55, 3.4, 16),
      coreC: new THREE.ConeGeometry(0.45, 3.4, 4, 1),
      ring: new THREE.TorusGeometry(2.25, 0.05, 8, 64),
    }),
    [],
  );
  const cores = useMemo(() => [m.neon[3].clone(), m.neon[2].clone(), m.neon[1].clone()], [m]);
  useFrame((s) => {
    // MEMORY spotlights one tier: that band blazes, the others dim
    const f = stage.focus;
    cores.forEach((mat, i) => {
      const tier = (3 - i) as Tier;
      const on = f === 0 ? 1 : f === tier ? 1.8 : 0.25;
      const flick = tier === 1 ? 0.75 + 0.25 * Math.sin(s.clock.elapsedTime * 9) : 1;
      mat.color.copy(neonColor(tier, 3 * on * flick * Math.max(stage.boot, 0.05)));
    });
  });
  return (
    <group position={HUB}>
      <Part geometry={geo.base} material={m.glass} position={[0, 1.6, 0]} tier={3} />
      <Part geometry={geo.coreA} material={cores[0]} position={[0, 1.6, 0]} day="mark" tier={3} />
      <Part geometry={geo.mid} material={m.glass} position={[0, 5.0, 0]} tier={2} />
      <Part geometry={geo.coreB} material={cores[1]} position={[0, 5.0, 0]} day="mark" tier={2} />
      <Part geometry={geo.spire} material={m.glass} position={[0, 8.9, 0]} rotation={[0, Math.PI / 4, 0]} tier={1} />
      <Part geometry={geo.coreC} material={cores[2]} position={[0, 8.7, 0]} rotation={[0, Math.PI / 4, 0]} day="mark" tier={1} />
      <Part geometry={geo.ring} material={m.neon[2]} position={[0, 6.85, 0]} rotation={[Math.PI / 2, 0, 0]} day="faint" />
      <Part geometry={geo.ring} material={m.neon[3]} position={[0, 3.25, 0]} rotation={[Math.PI / 2, 0, 0]} scale={1.15} day="faint" />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  District hero towers                                                */
/* ------------------------------------------------------------------ */
function Gyro({ d, m }: { d: District; m: ReturnType<typeof useMaterials> }) {
  const h = d.height;
  const rings = useRef<THREE.Group>(null);
  const geo = useMemo(
    () => ({
      shaft: new THREE.CylinderGeometry(1.1, 1.5, h, 24),
      core: new THREE.CylinderGeometry(0.32, 0.32, h * 0.96, 12),
      r1: new THREE.TorusGeometry(2.4, 0.07, 8, 80),
      r2: new THREE.TorusGeometry(3.0, 0.07, 8, 80),
      r3: new THREE.TorusGeometry(3.6, 0.09, 8, 80),
    }),
    [h],
  );
  const episodic = useMemo(() => m.neon[1].clone(), [m]);
  useFrame((s, dt) => {
    const g = rings.current;
    if (!g) return;
    g.children[0].rotation.z += dt * 0.25;
    g.children[1].rotation.x += dt * 0.18;
    g.children[2].rotation.y += dt * 0.32;
    // the episodic ring decays and flickers
    episodic.color.copy(neonColor(1, 2.2 * (0.55 + 0.45 * Math.abs(Math.sin(s.clock.elapsedTime * 1.7)))));
  });
  return (
    <group>
      <Part geometry={geo.shaft} material={m.glass} position={[0, h / 2, 0]} tier={d.tier} />
      <Part geometry={geo.core} material={m.neon[3]} position={[0, h / 2, 0]} day="mark" tier={3} />
      <group ref={rings} position={[0, h * 0.62, 0]}>
        <group rotation={[0.3, 0, 0]}>
          <Part geometry={geo.r1} material={m.neon[3]} day="faint" />
        </group>
        <group rotation={[1.1, 0.5, 0]}>
          <Part geometry={geo.r2} material={m.neon[2]} day="faint" />
        </group>
        <group rotation={[-0.7, 0, -0.4]}>
          <Part geometry={geo.r3} material={episodic} day="faint" />
        </group>
      </group>
    </group>
  );
}

function Ledger({ d, m }: { d: District; m: ReturnType<typeof useMaterials> }) {
  const weeks = 13;
  const heights = useMemo(() => Array.from({ length: weeks }, (_, k) => 2.2 + 2.2 * Math.sin(k * 0.7) + k * 0.42), []);
  const geo = useMemo(() => {
    // the forecast line rides the bar tops and runs out through the gate
    const pts = heights.map((hh, k) => new THREE.Vector3(-3.4 + k * 0.6, hh + 0.6, 0));
    pts.push(new THREE.Vector3(4.8, heights[weeks - 1] + 0.4, 0));
    return {
      bar: new THREE.BoxGeometry(0.5, 1, 1.6),
      cap: new THREE.BoxGeometry(0.52, 0.08, 1.62),
      post: new THREE.BoxGeometry(0.22, 7.2, 0.22),
      lintel: new THREE.BoxGeometry(3.4, 0.22, 0.22),
      line: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.07, 6),
    };
  }, [heights]);
  return (
    <group>
      {heights.map((hh, k) => (
        <group key={k}>
          <Part geometry={geo.bar} material={m.glass} position={[-3.4 + k * 0.6, hh / 2, 0]} scale={[1, hh, 1]} tier={2} />
          <Part geometry={geo.cap} material={m.neon[2]} position={[-3.4 + k * 0.6, hh, 0]} day="mark" tier={2} />
        </group>
      ))}
      <Part geometry={geo.line} material={m.neon[1]} day="mark" tier={1} />
      {/* the approval gate every forecast must pass */}
      <group position={[4.8, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <Part geometry={geo.post} material={m.neon[3]} position={[-1.6, 3.6, 0]} day="mark" tier={3} />
        <Part geometry={geo.post} material={m.neon[3]} position={[1.6, 3.6, 0]} day="mark" tier={3} />
        <Part geometry={geo.lintel} material={m.neon[3]} position={[0, 7.2, 0]} day="mark" tier={3} />
      </group>
    </group>
  );
}

function Fleet({ d, m }: { d: District; m: ReturnType<typeof useMaterials> }) {
  const geo = useMemo(() => {
    const arcs: THREE.TubeGeometry[] = [];
    const pts = [
      [-2.2, -2.2],
      [0, -2.2],
      [2.2, -2.2],
      [-2.2, 0],
      [0, 0],
      [2.2, 0],
      [-2.2, 2.2],
      [0, 2.2],
      [2.2, 2.2],
    ];
    const odd = 5;
    for (const j of [0, 2, 6, 8, 4]) {
      const a = new THREE.Vector3(pts[odd][0], 4.2, pts[odd][1]);
      const b = new THREE.Vector3(pts[j][0], 3.6, pts[j][1]);
      const mid = a.clone().add(b).multiplyScalar(0.5).add(new THREE.Vector3(0, 2.6, 0));
      arcs.push(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 24, 0.05, 6));
    }
    return { pts, odd, tower: new THREE.BoxGeometry(1.3, 1, 1.3), core: new THREE.BoxGeometry(0.4, 1, 0.4), arcs };
  }, []);
  return (
    <group>
      {geo.pts.map(([x, z], i) => {
        const hh = 3.2 + ((i * 37) % 5) * 0.35;
        const isOdd = i === geo.odd;
        return (
          <group key={i}>
            <Part geometry={geo.tower} material={m.glass} position={[x, hh / 2, z]} scale={[1, hh, 1]} tier={1} />
            <Part geometry={geo.core} material={m.neon[isOdd ? 1 : 2]} position={[x, hh / 2, z]} scale={[1, hh * 0.92, 1]} day="mark" tier={isOdd ? 1 : 2} />
          </group>
        );
      })}
      {geo.arcs.map((g, i) => (
        <Part key={i} geometry={g} material={m.neon[3]} day="mark" tier={3} />
      ))}
    </group>
  );
}

function Orb({ d, m }: { d: District; m: ReturnType<typeof useMaterials> }) {
  const h = d.height;
  const rings = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    const spiral: THREE.Vector3[] = [];
    for (let k = 0; k <= 120; k++) {
      const u = k / 120;
      const a = u * Math.PI * 6;
      const r = 0.2 + (1 - u) * 1.2;
      spiral.push(new THREE.Vector3(-6 + u * 6, h * 0.62 + Math.cos(a) * r, Math.sin(a) * r));
    }
    return {
      shaft: new THREE.CylinderGeometry(0.6, 0.9, h * 0.55, 16),
      sphere: new THREE.SphereGeometry(2.4, 48, 32),
      core: new THREE.SphereGeometry(0.7, 24, 16),
      ring: new THREE.TorusGeometry(3.1, 0.06, 8, 96),
      stream: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spiral), 200, 0.06, 6),
    };
  }, [h]);
  useFrame((_, dt) => {
    if (rings.current) rings.current.rotation.y += dt * 0.4;
  });
  return (
    <group>
      <Part geometry={geo.shaft} material={m.chrome} position={[0, (h * 0.55) / 2, 0]} tier={2} />
      <Part geometry={geo.sphere} material={m.glass} position={[0, h * 0.62, 0]} angle={40} tier={2} />
      <Part geometry={geo.core} material={m.neon[3]} position={[0, h * 0.62, 0]} day="mark" tier={3} />
      <group ref={rings} position={[0, h * 0.62, 0]}>
        <Part geometry={geo.ring} material={m.neon[1]} rotation={[1.2, 0, 0]} day="faint" />
        <Part geometry={geo.ring} material={m.neon[1]} rotation={[1.9, 0.4, 0]} scale={1.15} day="faint" />
      </group>
      <Part geometry={geo.stream} material={m.neon[1]} day="mark" tier={1} />
    </group>
  );
}

function DistrictTower({ d, glassTier }: { d: District; glassTier: number }) {
  const m = useMaterials(glassTier);
  const plinth = useMemo(() => new THREE.CylinderGeometry(5.2, 5.4, 0.25, 48), []);
  return (
    <group position={d.center}>
      <Part geometry={plinth} material={m.dark} position={[0, 0.12, 0]} day="faint" tier={d.tier} />
      {d.shape === "gyro" && <Gyro d={d} m={m} />}
      {d.shape === "ledger" && <Ledger d={d} m={m} />}
      {d.shape === "fleet" && <Fleet d={d} m={m} />}
      {d.shape === "orb" && <Orb d={d} m={m} />}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Outskirts + the broadcast antenna                                   */
/* ------------------------------------------------------------------ */
function Outskirt({ c, tier, glassTier }: { c: V3; tier: Tier; glassTier: number }) {
  const m = useMaterials(glassTier);
  const geo = useMemo(() => ({ body: new THREE.BoxGeometry(2.2, 6, 2.2), cap: new THREE.BoxGeometry(2.3, 0.12, 2.3) }), []);
  return (
    <group position={c}>
      <Part geometry={geo.body} material={m.glass} position={[0, 3, 0]} tier={tier} />
      <Part geometry={geo.cap} material={m.neon[tier]} position={[0, 6.05, 0]} day="mark" tier={tier} />
    </group>
  );
}

function Antenna({ glassTier }: { glassTier: number }) {
  const m = useMaterials(glassTier);
  const pulseRing = useRef<THREE.Mesh>(null);
  const beacon = useMemo(() => m.neon[1].clone(), [m]);
  const geo = useMemo(() => {
    const legs: { g: THREE.BufferGeometry; p: V3; r: V3 }[] = [];
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      legs.push({ g: new THREE.CylinderGeometry(0.06, 0.12, 20.6, 6), p: [Math.cos(a) * 0.9, 10, Math.sin(a) * 0.9], r: [Math.sin(a) * 0.09, 0, -Math.cos(a) * 0.09] });
    }
    return {
      legs,
      brace: new THREE.TorusGeometry(1, 0.04, 4, 4),
      beacon: new THREE.SphereGeometry(0.5, 16, 12),
      wave: new THREE.TorusGeometry(1, 0.05, 6, 96),
    };
  }, []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    beacon.color.copy(neonColor(1, 2 + 2.5 * (0.5 + 0.5 * Math.sin(t * 3))));
    const ring = pulseRing.current;
    if (ring) {
      // an idle broadcast every few seconds; TRANSMIT's pulse drives a big one
      const idle = (t * 0.35) % 1;
      const p = stage.pulse > 0.01 ? stage.pulse : idle;
      ring.scale.setScalar(1 + p * 26);
      (ring.material as THREE.MeshBasicMaterial).opacity = (1 - p) * (stage.pulse > 0.01 ? 1 : 0.5);
    }
  });
  return (
    <group position={ANTENNA}>
      {geo.legs.map((l, i) => (
        <Part key={i} geometry={l.g} material={m.chrome} position={l.p} rotation={l.r} tier={2} />
      ))}
      {[3, 7, 11, 15, 18.5].map((y, i) => (
        <Part key={i} geometry={geo.brace} material={m.chrome} position={[0, y, 0]} rotation={[Math.PI / 2, 0, Math.PI / 4]} scale={0.9 - i * 0.12} tier={2} />
      ))}
      <Part geometry={geo.beacon} material={beacon} position={[0, 20.8, 0]} day="mark" tier={1} />
      <mesh ref={pulseRing} geometry={geo.wave} position={[0, 20.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={neonColor(1, 2)} transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function Landmarks({ glassTier }: { glassTier: number }) {
  return (
    <group>
      <Hub glassTier={glassTier} />
      {DISTRICTS.map((d) => (
        <DistrictTower key={d.slug} d={d} glassTier={glassTier} />
      ))}
      {OUTSKIRTS.map((o) => (
        <Outskirt key={o.slug} c={o.center} tier={o.tier} glassTier={glassTier} />
      ))}
      <Antenna glassTier={glassTier} />
    </group>
  );
}
