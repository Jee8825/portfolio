"use client";
/* eslint-disable react-hooks/immutability -- three.js uniforms and objects are mutated per frame by design */

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useWorld } from "./useWorld";

/** Night sky: deep violet zenith, a magenta glow where the city lights the haze, slow clouds, stars. */
export function Sky() {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_Position = p.xyww;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          varying vec3 vDir;
          float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float noise(vec2 p) {
            vec2 i = floor(p), f = fract(p);
            float a = hash(i), b = hash(i + vec2(1, 0)), c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
          }
          float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
          void main() {
            float h = vDir.y;
            vec3 zenith = vec3(0.004, 0.003, 0.012);
            vec3 mid = vec3(0.025, 0.012, 0.05);
            vec3 glow = vec3(0.16, 0.02, 0.1);
            vec3 col = mix(mid, zenith, smoothstep(0.05, 0.6, h));
            col += glow * exp(-max(h, 0.0) * 14.0);          // city glow on the haze
            col += vec3(0.0, 0.06, 0.09) * exp(-abs(h - 0.02) * 30.0) * 0.6; // cyan smog line
            // clouds lit from below by the city
            vec2 uv = vDir.xz / max(h + 0.25, 0.08) * 1.6 + vec2(uTime * 0.004, 0.0);
            float c = smoothstep(0.45, 0.85, fbm(uv));
            col += c * mix(vec3(0.07, 0.018, 0.055), vec3(0.015, 0.012, 0.035), smoothstep(0.0, 0.4, h)) * smoothstep(0.0, 0.12, h);
            // stars above the haze
            vec2 sp = vDir.xz / (h + 1.0) * 260.0;
            vec2 cellc = fract(sp) - 0.5;
            float star = step(0.997, hash(floor(sp))) * smoothstep(0.1, 0.0, length(cellc)) * smoothstep(0.25, 0.6, h) * (1.0 - c);
            col += star * 0.45;
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [],
  );
  useWorld((isDay) => {
    if (ref.current) ref.current.visible = !isDay;
  });
  useFrame((s, dt) => {
    mat.uniforms.uTime.value += Math.min(dt, 0.05);
    ref.current?.position.copy(s.camera.position);
  });
  return (
    <mesh ref={ref} material={mat} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[150, 48, 24]} />
    </mesh>
  );
}

/** Street lamps along the two main avenues, each with a pool of light on the wet road. */
export function StreetLamps() {
  const lamps = useMemo(() => {
    const out: [number, number][] = [];
    for (let k = -22; k <= 22; k += 2.75) {
      if (Math.abs(k) < 6) continue; // the hub plaza
      out.push([k, 1.05], [k, -1.05], [1.05, k], [-1.05, k]);
    }
    return out;
  }, []);
  const poles = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const pools = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const poolMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position,1.0); }`,
        fragmentShader: `varying vec2 vUv; void main(){ float d = length(vUv - 0.5) * 2.0; float a = exp(-d * d * 4.0) * (1.0 - d); gl_FragColor = vec4(vec3(1.0, 0.55, 0.22) * a * 0.35, 1.0); }`,
      }),
    [],
  );
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const flat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    lamps.forEach(([x, z], i) => {
      m.compose(new THREE.Vector3(x, 0.55, z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
      poles.current!.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(x, 1.12, z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
      heads.current!.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(x, 0.02, z), flat, new THREE.Vector3(2.2, 2.2, 1));
      pools.current!.setMatrixAt(i, m);
    });
    for (const r of [poles, heads, pools]) r.current!.instanceMatrix.needsUpdate = true;
  }, [lamps]);
  useWorld((isDay) => {
    if (group.current) group.current.visible = !isDay;
  });
  return (
    <group ref={group}>
      <instancedMesh ref={poles} args={[undefined, undefined, lamps.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.025, 0.035, 1.1, 6]} />
        <meshStandardMaterial color="#2a2438" metalness={0.9} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, lamps.length]} frustumCulled={false}>
        <boxGeometry args={[0.16, 0.05, 0.08]} />
        <meshBasicMaterial color={new THREE.Color(2.6, 1.5, 0.7)} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={pools} args={[undefined, poolMat, lamps.length]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
      </instancedMesh>
    </group>
  );
}
