"use client";
/* eslint-disable react-hooks/immutability -- the camera is driven per frame by design */

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DISTRICTS, HIGHWAYS, HUB, SHOTS, type Shot } from "@/lib/city";
import { stage } from "@/lib/store";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Points the DOM can label: hub, district towers, then highway midpoints (cortex). */
export const ANCHOR_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(HUB[0], 11.5, HUB[2]),
  ...DISTRICTS.map((d) => new THREE.Vector3(d.center[0], d.height + 1.5, d.center[2])),
  ...HIGHWAYS.map((h) => new THREE.Vector3(...h.points[2]).setY(0.4)),
];

/**
 * Scroll-driven cinematography. `stage.scene` (float) picks the pair of shots,
 * `stage.sub` (0..1 inside the current section) adds the shot's travel (the
 * elevator rise inside a building). Flights between shots arc over the city.
 */
export function CameraRig() {
  const { camera, size } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const s = useRef({ scene: 0, sub: 0, px: 0, py: 0, lat: 0, vy: 0 });
  const v = useMemo(
    () => ({ pa: new THREE.Vector3(), pb: new THREE.Vector3(), ta: new THREE.Vector3(), tb: new THREE.Vector3(), pos: new THREE.Vector3(), tgt: new THREE.Vector3(), tmp: new THREE.Vector3() }),
    [],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const st = s.current;
    const target = stage.boot < 1 ? stage.boot : Math.max(1, stage.scene);
    st.scene += (target - st.scene) * (1 - Math.exp(-dt * 3.2));
    st.sub += (stage.sub - st.sub) * (1 - Math.exp(-dt * 4));
    st.px += (Math.min(1, Math.abs(stage.pointer.x)) * Math.sign(stage.pointer.x) - st.px) * (1 - Math.exp(-dt * 2));
    st.py += (Math.min(1, Math.abs(stage.pointer.y)) * Math.sign(stage.pointer.y) - st.py) * (1 - Math.exp(-dt * 2));

    const max = SHOTS.length - 1;
    const sc = Math.min(Math.max(st.scene, 0), max);
    const i0 = Math.floor(sc);
    const i1 = Math.min(i0 + 1, max);
    const m = ease(sc - i0);
    const A: Shot = SHOTS[i0];
    const B: Shot = SHOTS[i1];
    // the section we're in contributes its travel; the one we're leaving is fully travelled
    const subA = i0 === i1 ? st.sub : 1;
    const subB = m > 0.999 ? st.sub : 0;
    const add = (out: THREE.Vector3, base: number[], rise: number[] | undefined, k: number) =>
      out.set(base[0] + (rise?.[0] ?? 0) * k, base[1] + (rise?.[1] ?? 0) * k, base[2] + (rise?.[2] ?? 0) * k);
    add(v.pa, A.pos, A.rise, subA);
    add(v.pb, B.pos, B.rise, subB);
    add(v.ta, A.target, A.rise, subA);
    add(v.tb, B.target, B.rise, subB);
    v.pos.lerpVectors(v.pa, v.pb, m);
    v.tgt.lerpVectors(v.ta, v.tb, m);
    // flights between distant shots climb over the skyline
    const hop = v.pa.distanceTo(v.pb);
    v.pos.y += Math.sin(m * Math.PI) * Math.min(hop * 0.22, 14);

    // hand-held drift + pointer parallax
    const t = performance.now() * 0.001;
    v.pos.x += Math.sin(t * 0.21) * 0.35 + st.px * 0.9;
    v.pos.y += Math.sin(t * 0.17) * 0.2 + st.py * 0.5;

    cam.position.copy(v.pos);
    cam.lookAt(v.tgt);
    const fov = THREE.MathUtils.lerp(A.fov ?? 40, B.fov ?? 40, m);
    if (Math.abs(cam.fov - fov) > 0.01) cam.fov = fov;

    // frame the subject: right of the copy on wide screens, above it on narrow ones
    const wide = size.width / size.height > 1.15;
    const lat = THREE.MathUtils.lerp(A.lateral ?? 0, B.lateral ?? 0, m);
    st.lat += ((wide ? lat : 0) - st.lat) * (1 - Math.exp(-dt * 4));
    st.vy += ((wide ? 0 : lat > 0 ? 0.2 : 0) - st.vy) * (1 - Math.exp(-dt * 4));
    if (Math.abs(st.lat) > 0.001 || Math.abs(st.vy) > 0.001) {
      cam.setViewOffset(size.width, size.height, -st.lat * size.width, st.vy * size.height, size.width, size.height);
    } else if (cam.view) {
      cam.clearViewOffset();
    }
    cam.updateProjectionMatrix();

    // project label anchors for the DOM
    ANCHOR_POINTS.forEach((p, i) => {
      v.tmp.copy(p).project(cam);
      stage.anchors[i] = {
        x: (v.tmp.x * 0.5 + 0.5) * size.width,
        y: (-v.tmp.y * 0.5 + 0.5) * size.height,
        z: v.tmp.z < 1 ? 1 : -1, // in front of the camera?
      };
    });
  }, -1);

  return null;
}
