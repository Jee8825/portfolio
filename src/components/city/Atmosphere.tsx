"use client";
/* eslint-disable react-hooks/immutability -- three.js uniforms are mutated per frame by design */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { rng } from "@/lib/city";
import { useWorld } from "./useWorld";

/** Night rain: streaks that fall around the camera's focus, faint enough to read through. */
export function Rain({ count = 2400 }: { count?: number }) {
  const ref = useRef<THREE.LineSegments>(null);
  const geo = useMemo(() => {
    const r = rng(77);
    const pos = new Float32Array(count * 6);
    const seed = new Float32Array(count * 2);
    const top = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const x = (r() * 2 - 1) * 40,
        y = r() * 30,
        z = (r() * 2 - 1) * 40;
      pos.set([x, y, z, x - 0.05, y - 0.9, z], i * 6);
      const s = r();
      seed[i * 2] = s;
      seed[i * 2 + 1] = s;
      top[i * 2] = y;
      top[i * 2 + 1] = y;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aTop", new THREE.BufferAttribute(top, 1));
    return g;
  }, [count]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uCenter: { value: new THREE.Vector3() } },
        vertexShader: /* glsl */ `
          attribute float aSeed;
          attribute float aTop;
          uniform float uTime;
          uniform vec3 uCenter;
          varying float vA;
          void main() {
            vec3 p = position;
            // both ends of a streak wrap together, keyed on its top
            p.y = position.y - aTop + mod(aTop - uTime * (14.0 + aSeed * 8.0), 30.0);
            p.xz += uCenter.xz;
            vA = 0.18 + aSeed * 0.25;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying float vA;
          void main() { gl_FragColor = vec4(0.75, 0.8, 1.0, vA); }
        `,
      }),
    [],
  );
  useWorld((isDay) => {
    if (ref.current) ref.current.visible = !isDay;
  });
  useFrame((s, dt) => {
    mat.uniforms.uTime.value += Math.min(dt, 0.05);
    const t = new THREE.Vector3(0, 0, -1).applyQuaternion(s.camera.quaternion).multiplyScalar(14).add(s.camera.position);
    mat.uniforms.uCenter.value.set(t.x, 0, t.z);
  });
  return <lineSegments ref={ref} geometry={geo} material={mat} frustumCulled={false} />;
}
