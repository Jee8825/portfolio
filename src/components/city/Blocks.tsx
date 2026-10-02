"use client";
/* eslint-disable react-hooks/immutability -- three.js uniforms and objects are mutated per frame by design */

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildBlocks } from "@/lib/city";
import { PALETTE } from "@/lib/palette";
import { stage } from "@/lib/store";
import { useWorld } from "./useWorld";

const vert = /* glsl */ `
  attribute vec4 aInfo; // tier, seed, height, trim
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying vec4 vInfo;
  varying vec3 vLocal;
  void main() {
    vec4 local = vec4(position, 1.0);
    vec4 world = modelMatrix * instanceMatrix * local;
    vWorld = world.xyz;
    vLocal = position;
    vNormalW = normalize(mat3(modelMatrix * instanceMatrix) * normal);
    vInfo = aInfo;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const frag = /* glsl */ `
  uniform float uBoot;
  uniform float uTime;
  uniform vec3 uT1;
  uniform vec3 uT2;
  uniform vec3 uT3;
  uniform vec3 uFog;
  uniform vec3 uCam;
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying vec4 vInfo;
  varying vec3 vLocal;

  float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453); }

  void main() {
    vec3 n = normalize(vNormalW);
    float tier = vInfo.x;
    vec3 tint = tier < 1.5 ? uT1 : tier < 2.5 ? uT2 : uT3;

    // dark glass-and-steel body, lit from the sky and the street glow below
    float up = clamp(vLocal.y + 0.5, 0.0, 1.0);
    vec3 col = mix(vec3(0.008, 0.005, 0.02), vec3(0.03, 0.022, 0.055), up);
    col += max(n.y, 0.0) * vec3(0.02, 0.015, 0.035);

    // windows on the side faces
    if (abs(n.y) < 0.5) {
      float side = abs(n.x) > 0.5 ? vWorld.z : vWorld.x;
      vec2 cell = vec2(floor(side * 3.2), floor(vWorld.y * 2.6));
      vec2 f = fract(vec2(side * 3.2, vWorld.y * 2.6));
      float pane = step(0.18, f.x) * step(f.x, 0.82) * step(0.25, f.y) * step(f.y, 0.75);
      float h = hash(vec3(cell, vInfo.y * 100.0 + n.x * 3.0 + n.z * 7.0));
      // the city powers on during boot, block by block
      float lit = step(h, 0.38) * step(vInfo.y, uBoot * 1.05);
      float flicker = 0.85 + 0.15 * sin(uTime * (2.0 + h * 9.0) + h * 40.0);
      vec3 warm = mix(vec3(1.0, 0.7, 0.36), tint, step(0.8, h));
      col += pane * lit * warm * flicker * 0.75;
    }

    // neon trim on some rooftops
    if (vInfo.w > 0.5 && abs(n.y) < 0.5) {
      float band = smoothstep(0.455, 0.47, vLocal.y) * (1.0 - smoothstep(0.485, 0.5, vLocal.y));
      col += tint * band * 4.0 * step(vInfo.y, uBoot * 1.05);
    }

    // fog
    float dist = distance(vWorld, uCam);
    float fog = 1.0 - exp(-pow(dist * 0.019, 1.5));
    col = mix(col, uFog, clamp(fog, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function Blocks({ count }: { count: number }) {
  const blocks = useMemo(() => buildBlocks(count), [count]);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const edges = useRef<THREE.LineSegments>(null);

  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const info = useMemo(() => {
    const a = new Float32Array(blocks.length * 4);
    blocks.forEach((b, i) => {
      a.set([b.tier, b.seed, b.h, b.seed > 0.72 ? 1 : 0], i * 4);
    });
    const attr = new THREE.InstancedBufferAttribute(a, 4);
    box.setAttribute("aInfo", attr);
    return attr;
  }, [blocks, box]);

  const night = useMemo(() => {
    const p = PALETTE.neon;
    return new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uBoot: { value: 0 },
        uTime: { value: 0 },
        // THREE.Color converts the sRGB hexes into the linear working space
        uT1: { value: new THREE.Color(p.t1) },
        uT2: { value: new THREE.Color(p.t2) },
        uT3: { value: new THREE.Color(p.t3) },
        uFog: { value: new THREE.Color(p.paper) },
        uCam: { value: new THREE.Vector3() },
      },
    });
  }, []);

  const day = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#f4f8ff", transparent: true, opacity: 0.045, depthWrite: false }),
    [],
  );

  /* merged white CAD edges for every block (day) */
  const edgeGeo = useMemo(() => {
    const unit = new THREE.EdgesGeometry(box);
    const src = unit.getAttribute("position").array as Float32Array;
    const out = new Float32Array(src.length * blocks.length);
    const m = new THREE.Matrix4();
    const v = new THREE.Vector3();
    blocks.forEach((b, i) => {
      m.compose(new THREE.Vector3(b.x, b.h / 2, b.z), new THREE.Quaternion(), new THREE.Vector3(b.w, b.h, b.d));
      for (let k = 0; k < src.length; k += 3) {
        v.set(src[k], src[k + 1], src[k + 2]).applyMatrix4(m);
        out.set([v.x, v.y, v.z], i * src.length + k);
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(out, 3));
    unit.dispose();
    return g;
  }, [blocks, box]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    blocks.forEach((b, i) => {
      m.compose(new THREE.Vector3(b.x, b.h / 2, b.z), new THREE.Quaternion(), new THREE.Vector3(b.w, b.h, b.d));
      mesh.current!.setMatrixAt(i, m);
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
  }, [blocks, info]);

  useWorld((isDay) => {
    if (!mesh.current || !edges.current) return;
    mesh.current.material = isDay ? day : night;
    edges.current.visible = isDay;
  });

  useFrame((state, dt) => {
    night.uniforms.uTime.value += Math.min(dt, 0.05);
    night.uniforms.uBoot.value = stage.boot;
    night.uniforms.uCam.value.copy(state.camera.position);
  });

  return (
    <group>
      <instancedMesh ref={mesh} args={[box, night, blocks.length]} frustumCulled={false} />
      <lineSegments ref={edges} geometry={edgeGeo} visible={false}>
        <lineBasicMaterial color="#f4f8ff" transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}
