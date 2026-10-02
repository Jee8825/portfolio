"use client";
/* eslint-disable react-hooks/immutability -- three.js objects are mutated per frame by design */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { AVENUE, DISTRICTS, HIGHWAYS, HUB, OUTSKIRTS } from "@/lib/city";
import { log } from "@/data/portfolio";
import { PALETTE } from "@/lib/palette";
import { stage } from "@/lib/store";
import { useWorld } from "./useWorld";

const CARS = 26;

/** Skill highways: glowing tubes at night, dashed survey lines by day, with traffic on both. */
export function Highways() {
  const curves = useMemo(() => HIGHWAYS.map((h) => new THREE.CatmullRomCurve3(h.points.map((p) => new THREE.Vector3(...p)))), []);
  const tubes = useMemo(() => curves.map((c) => new THREE.TubeGeometry(c, 160, 0.09, 6)), [curves]);
  const dashes = useMemo(
    () =>
      curves.map((c) => {
        const g = new THREE.BufferGeometry().setFromPoints(c.getPoints(200));
        const l = new THREE.Line(g, new THREE.LineDashedMaterial({ color: "#f4f8ff", dashSize: 0.5, gapSize: 0.35, transparent: true, opacity: 0.8 }));
        l.computeLineDistances();
        return l;
      }),
    [curves],
  );
  const night = useRef<THREE.Group>(null);
  const day = useRef<THREE.Group>(null);
  const cars = useRef<THREE.InstancedMesh>(null);
  const carGeo = useMemo(() => new THREE.CapsuleGeometry(0.09, 0.5, 2, 6).rotateZ(Math.PI / 2), []);
  const carMat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), t: new THREE.Vector3(), s: new THREE.Vector3(1, 1, 1), c: new THREE.Color() }), []);

  useWorld((isDay) => {
    if (night.current) night.current.visible = !isDay;
    if (day.current) day.current.visible = isDay;
    const mesh = cars.current;
    if (!mesh) return;
    HIGHWAYS.forEach((h, i) => {
      for (let k = 0; k < CARS; k++) {
        const hex = isDay ? (k % 4 === 0 ? PALETTE.blueprint.t1 : "#f4f8ff") : PALETTE.neon[`t${h.tier}`];
        tmp.c.set(hex).multiplyScalar(isDay ? 1 : 2.5);
        mesh.setColorAt(i * CARS + k, tmp.c);
      }
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  useFrame((s) => {
    const mesh = cars.current;
    if (!mesh) return;
    const t = s.clock.elapsedTime;
    curves.forEach((c, i) => {
      for (let k = 0; k < CARS; k++) {
        const dir = k % 2 ? 1 : -1;
        const u = (((k / CARS + dir * t * (0.018 + (k % 5) * 0.003)) % 1) + 1) % 1;
        c.getPointAt(u, tmp.p);
        c.getTangentAt(u, tmp.t);
        tmp.q.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tmp.t);
        tmp.p.y += 0.12;
        tmp.s.setScalar(stage.boot > 0.6 ? 1 : 0.0001);
        tmp.m.compose(tmp.p, tmp.q, tmp.s);
        mesh.setMatrixAt(i * CARS + k, tmp.m);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <group ref={night}>
        {tubes.map((g, i) => (
          <mesh key={i} geometry={g}>
            <meshBasicMaterial color={new THREE.Color(PALETTE.neon[`t${HIGHWAYS[i].tier}`]).multiplyScalar(1.6)} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <group ref={day} visible={false}>
        {dashes.map((l, i) => (
          <primitive key={i} object={l} />
        ))}
      </group>
      <instancedMesh ref={cars} args={[carGeo, carMat, HIGHWAYS.length * CARS]} frustumCulled={false} />
    </group>
  );
}

/** LOG avenue: a boulevard to the antenna, one milestone per log entry. */
export function Avenue() {
  const from = new THREE.Vector3(...AVENUE.from);
  const to = new THREE.Vector3(...AVENUE.to);
  const posts = useMemo(
    () =>
      log.map((e, i) => {
        const u = (i + 1) / (log.length + 1);
        const p = from.clone().lerp(to, u);
        return { p: [p.x + (i % 2 ? 1.6 : -1.6), 0, p.z] as [number, number, number], tier: e.tier };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const postGeo = useMemo(() => new THREE.BoxGeometry(0.16, 2.6, 0.16), []);
  const capGeo = useMemo(() => new THREE.BoxGeometry(0.9, 0.5, 0.08), []);
  const night = useRef<THREE.Group>(null);
  const day = useRef<THREE.Group>(null);
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([from, to]);
    const l = new THREE.Line(g, new THREE.LineDashedMaterial({ color: "#f4f8ff", dashSize: 0.8, gapSize: 0.5 }));
    l.computeLineDistances();
    return l;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useWorld((isDay) => {
    if (night.current) night.current.visible = !isDay;
    if (day.current) day.current.visible = isDay;
  });
  return (
    <group>
      <group ref={night}>
        <mesh position={[0, 0.05, (AVENUE.from[2] + AVENUE.to[2]) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, Math.abs(AVENUE.to[2] - AVENUE.from[2])]} />
          <meshBasicMaterial color={new THREE.Color(PALETTE.neon.t3).multiplyScalar(1.5)} toneMapped={false} />
        </mesh>
        {posts.map((p, i) => (
          <group key={i} position={p.p}>
            <mesh geometry={postGeo} position={[0, 1.3, 0]}>
              <meshStandardMaterial color="#b9b4cc" metalness={1} roughness={0.2} />
            </mesh>
            <mesh geometry={capGeo} position={[0, 2.7, 0]}>
              <meshBasicMaterial color={new THREE.Color(PALETTE.neon[`t${p.tier}`]).multiplyScalar(2.4)} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
      <group ref={day} visible={false}>
        <primitive object={line} />
        {posts.map((p, i) => (
          <group key={i} position={p.p}>
            <lineSegments position={[0, 1.4, 0]}>
              <edgesGeometry args={[new THREE.BoxGeometry(0.16, 2.8, 0.16)]} />
              <lineBasicMaterial color="#f4f8ff" />
            </lineSegments>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Ground: wet street ↔ drafting sheet                                 */
/* ------------------------------------------------------------------ */
const gridFrag = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  uniform vec3 uInk;
  float line(float c, float w) {
    float d = abs(fract(c - 0.5) - 0.5) / fwidth(c);
    return 1.0 - min(d / w, 1.0);
  }
  void main() {
    vec2 p = vWorld.xz;
    float minor = max(line(p.x / 2.2, 1.0), line(p.y / 2.2, 1.0)) * 0.12;
    float major = max(line(p.x / 11.0, 1.2), line(p.y / 11.0, 1.2)) * 0.32;
    float axis = max(1.0 - min(abs(p.x) / fwidth(p.x), 1.0), 1.0 - min(abs(p.y) / fwidth(p.y), 1.0)) * 0.6;
    float fade = 1.0 - smoothstep(30.0, 70.0, length(p));
    float a = max(max(minor, major), axis) * fade;
    gl_FragColor = vec4(uInk, a);
  }
`;
const gridVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

export function Ground({ reflect }: { reflect: boolean }) {
  const night = useRef<THREE.Group>(null);
  const day = useRef<THREE.Group>(null);
  const gridMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: gridVert,
        fragmentShader: gridFrag,
        uniforms: { uInk: { value: new THREE.Color("#f4f8ff") } },
        transparent: true,
        depthWrite: false,
        extensions: { derivatives: true } as never,
      }),
    [],
  );
  /* dimension rings around each district, like a site plan */
  const rings = useMemo(() => {
    const centers = [HUB, ...DISTRICTS.map((d) => d.center), ...OUTSKIRTS.map((o) => o.center)];
    return centers.map((c, i) => {
      const r = i === 0 ? 6 : i <= DISTRICTS.length ? 5.8 : 3.2;
      const pts = new THREE.EllipseCurve(0, 0, r, r).getPoints(96).map((v) => new THREE.Vector3(c[0] + v.x, 0.03, c[2] + v.y));
      const l = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: "#f4f8ff", dashSize: 0.4, gapSize: 0.3, transparent: true, opacity: 0.7 }));
      l.computeLineDistances();
      return l;
    });
  }, []);
  useWorld((isDay) => {
    if (night.current) night.current.visible = !isDay;
    if (day.current) day.current.visible = isDay;
  });
  return (
    <group>
      <group ref={night}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[220, 220]} />
          {reflect ? (
            <MeshReflectorMaterial
              resolution={512}
              blur={[260, 70]}
              mixBlur={1}
              mixStrength={3.2}
              mirror={0.7}
              roughness={0.85}
              depthScale={0.6}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.3}
              color="#0b0716"
              metalness={0.6}
            />
          ) : (
            <meshStandardMaterial color="#0b0716" metalness={0.75} roughness={0.42} envMapIntensity={0.7} />
          )}
        </mesh>
      </group>
      <group ref={day} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} material={gridMat}>
          <planeGeometry args={[220, 220]} />
        </mesh>
        {rings.map((l, i) => (
          <primitive key={i} object={l} />
        ))}
      </group>
    </group>
  );
}
