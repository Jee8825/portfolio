"use client";
/* eslint-disable react-hooks/immutability -- three.js uniforms and objects are mutated per frame by design */

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildCity, type Section } from "@/lib/city";
import { PALETTE } from "@/lib/palette";
import { stage } from "@/lib/store";
import { useWorld } from "./useWorld";

/* ------------------------------------------------------------------ */
/*  Facade shader: glass curtain wall, lit rooms, slabs, shops, fog     */
/* ------------------------------------------------------------------ */
const facadeVert = /* glsl */ `
  attribute vec4 aInfo; // tier, seed, trim, unused
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying vec4 vInfo;
  varying vec3 vLocal;
  void main() {
    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vLocal = position;
    vNormalW = normalize(mat3(modelMatrix * instanceMatrix) * normal);
    vInfo = aInfo;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const facadeFrag = /* glsl */ `
  uniform float uBoot;
  uniform float uTime;
  uniform float uFar;
  uniform vec3 uT1;
  uniform vec3 uT2;
  uniform vec3 uT3;
  uniform vec3 uFog;
  uniform vec3 uCam;
  uniform vec3 uSkyLo;
  uniform vec3 uSkyHi;
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying vec4 vInfo;
  varying vec3 vLocal;

  float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453); }
  float aastep(float edge, float x) {
    float w = fwidth(x) * 0.75;
    return smoothstep(edge - w, edge + w, x);
  }

  void main() {
    vec3 n = normalize(vNormalW);
    vec3 V = normalize(uCam - vWorld);
    float tier = vInfo.x;
    float seed = vInfo.y;
    vec3 tint = tier < 1.5 ? uT1 : tier < 2.5 ? uT2 : uT3;
    float on = step(fract(seed * 7.31), uBoot * 1.02);

    vec3 col;
    if (abs(n.y) > 0.5) {
      // roofs: dark membrane, faint sky sheen
      col = vec3(0.01, 0.008, 0.016) + uSkyHi * 0.05;
    } else {
      float side = abs(n.x) > 0.5 ? vWorld.z : vWorld.x;
      float fu = side / 0.42;
      float fv = vWorld.y / 0.34;
      vec2 cell = floor(vec2(fu, fv));
      vec2 f = fract(vec2(fu, fv));
      // detail fades to its average once a window is smaller than ~2px: no shimmer
      float fw = max(fwidth(fu), fwidth(fv));
      float detail = 1.0 - smoothstep(0.22, 0.55, fw);
      float pane = aastep(0.1, f.x) * (1.0 - aastep(0.9, f.x)) * aastep(0.16, f.y) * (1.0 - aastep(0.86, f.y));

      float h = hash(vec3(cell, seed * 91.0 + n.x * 3.0 + n.z * 7.0));
      float hr = hash(vec3(cell.yx, seed * 13.0 + 1.7));
      float litP = 0.3 + 0.3 * fract(seed * 3.7);
      float lit = step(h, litP) * on;
      // rooms: warm homes, cool offices, the odd neon-lit room
      vec3 room = hr < 0.55 ? vec3(1.0, 0.56, 0.24) : hr < 0.9 ? vec3(0.62, 0.75, 1.0) : tint * 1.3;
      float bright = 0.3 + 0.85 * fract(h * 17.3);
      float ceiling = mix(1.0, 0.5, f.y); // light falls off from the ceiling
      float blinds = mix(1.0, step(0.5, fract(f.y * 7.0)) * 0.6 + 0.4, step(0.8, fract(h * 5.1)));
      vec3 win = room * bright * ceiling * blinds * lit * pane;
      // far away the grid is sub-pixel: use its average instead of per-window noise
      vec3 avgWin = mix(vec3(1.0, 0.56, 0.24), vec3(0.62, 0.75, 1.0), 0.4) * 0.62 * litP * 0.68 * on;
      win = mix(avgWin, win, detail);

      // curtain-wall glass reflecting the night sky
      vec3 R = reflect(-V, n);
      float fres = 0.06 + 0.8 * pow(1.0 - max(dot(V, n), 0.0), 3.0);
      vec3 sky = mix(uSkyLo, uSkyHi, clamp(R.y * 0.9 + 0.35, 0.0, 1.0));
      vec3 facade = vec3(0.012, 0.009, 0.02) + sky * fres;
      float slab = (1.0 - aastep(0.07, f.y)) * detail;
      col = facade + win * 1.15 + slab * vec3(0.025, 0.02, 0.035);

      // shopfronts glow at street level
      float shop = (1.0 - smoothstep(0.3, 0.34, vWorld.y)) * on * (1.0 - uFar);
      col += shop * mix(vec3(1.0, 0.62, 0.32), tint, step(0.55, h)) * 1.1;

      // neon trim band at the top of some sections
      if (vInfo.z > 0.5) {
        float band = smoothstep(0.455, 0.465, vLocal.y) * (1.0 - smoothstep(0.485, 0.495, vLocal.y));
        col += tint * band * 3.5 * on;
      }
    }

    // ambient occlusion where buildings meet the street
    col *= mix(0.3, 1.0, smoothstep(0.0, 1.4, vWorld.y));
    // distance fog thickened near the ground (haze between towers)
    float dist = distance(vWorld, uCam);
    float fog = 1.0 - exp(-pow(dist * 0.017, 1.45));
    fog = clamp(fog * (1.0 + 0.35 * (1.0 - smoothstep(0.0, 7.0, vWorld.y))), 0.0, 1.0);
    col = mix(col, uFog, fog);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

/* neon signs: framed tubes with glyph bars, flicker, a few broken ones */
const signVert = /* glsl */ `
  attribute vec4 aSign; // tier, seed, w, h
  varying vec2 vUv;
  varying vec4 vSign;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vSign = aSign;
    vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const signFrag = /* glsl */ `
  uniform float uTime;
  uniform float uBoot;
  uniform vec3 uT1;
  uniform vec3 uT2;
  uniform vec3 uT3;
  uniform vec3 uFog;
  uniform vec3 uCam;
  varying vec2 vUv;
  varying vec4 vSign;
  varying vec3 vWorld;
  float hash(float n) { return fract(sin(n) * 43758.5453); }
  void main() {
    vec3 tint = vSign.x < 1.5 ? uT1 : vSign.x < 2.5 ? uT2 : uT3;
    float seed = vSign.y;
    vec2 px = vUv * vSign.zw;
    float edge = min(min(px.x, vSign.z - px.x), min(px.y, vSign.w - px.y));
    float frame = smoothstep(0.035, 0.0, abs(edge - 0.04));
    // glyph bars: rows of short tubes, like lettering seen from afar
    bool vertical = vSign.w > vSign.z;
    vec2 g = vertical ? vec2(px.x / vSign.z, px.y / 0.22) : vec2(px.x / 0.16, px.y / vSign.w);
    float cell = vertical ? floor(g.y) : floor(g.x);
    float glyph = step(0.3, hash(cell * 7.1 + seed * 50.0));
    float bar = vertical ? step(0.25, fract(g.y)) * step(fract(g.y), 0.75) * step(0.3, g.x) * step(g.x, 0.7)
                         : step(0.25, fract(g.x)) * step(fract(g.x), 0.75) * step(0.3, g.y) * step(g.y, 0.7);
    float inside = step(0.09, edge);
    float lum = frame + bar * glyph * inside * 0.9;
    // flicker; one in six signs is failing and stutters
    float t = uTime * (1.0 + seed * 2.0);
    float flick = 0.9 + 0.1 * sin(t * 13.0 + seed * 30.0);
    if (seed > 0.83) flick *= step(0.35, fract(sin(floor(t * 6.0) * 91.7 + seed) * 4375.5));
    vec3 col = tint * lum * flick * 2.6 * step(fract(seed * 5.3), uBoot);
    col += tint * 0.05 * inside;
    float dist = distance(vWorld, uCam);
    float fog = 1.0 - exp(-pow(dist * 0.017, 1.45));
    col = mix(col, uFog, clamp(fog, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
  }
`;

/* aircraft warning lights on the tallest roofs */
const beaconFrag = /* glsl */ `
  uniform float uTime;
  varying float vSeed;
  void main() {
    float blink = step(0.55, fract(uTime * 0.6 + vSeed));
    gl_FragColor = vec4(vec3(2.6, 0.25, 0.2) * (0.15 + blink), 1.0);
  }
`;
const beaconVert = /* glsl */ `
  attribute float aSeed;
  varying float vSeed;
  void main() {
    vSeed = aSeed;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;

function makeFacade(far: boolean) {
  const p = PALETTE.neon;
  return new THREE.ShaderMaterial({
    vertexShader: facadeVert,
    fragmentShader: facadeFrag,
    uniforms: {
      uBoot: { value: 0 },
      uTime: { value: 0 },
      uFar: { value: far ? 1 : 0 },
      uT1: { value: new THREE.Color(p.t1) },
      uT2: { value: new THREE.Color(p.t2) },
      uT3: { value: new THREE.Color(p.t3) },
      uFog: { value: new THREE.Color(p.paper) },
      uCam: { value: new THREE.Vector3() },
      uSkyLo: { value: new THREE.Color("#5a1a55") },
      uSkyHi: { value: new THREE.Color("#141036") },
    },
  });
}

/** Merge unit-box edges for many boxes into one CAD drawing. */
function edgesFor(boxes: { x: number; y: number; z: number; w: number; h: number; d: number }[]) {
  const unit = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
  const src = unit.getAttribute("position").array as Float32Array;
  const out = new Float32Array(src.length * boxes.length);
  boxes.forEach((b, i) => {
    for (let k = 0; k < src.length; k += 3) {
      out[i * src.length + k] = b.x + src[k] * b.w;
      out[i * src.length + k + 1] = b.y + src[k + 1] * b.h;
      out[i * src.length + k + 2] = b.z + src[k + 2] * b.d;
    }
  });
  unit.dispose();
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(out, 3));
  return g;
}

function useSections(sections: Section[], mesh: React.RefObject<THREE.InstancedMesh | null>, box: THREE.BoxGeometry) {
  useMemo(() => {
    const a = new Float32Array(sections.length * 4);
    sections.forEach((s, i) => a.set([s.tier, s.seed, s.trim, 0], i * 4));
    box.setAttribute("aInfo", new THREE.InstancedBufferAttribute(a, 4));
  }, [sections, box]);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    sections.forEach((s, i) => {
      m.compose(new THREE.Vector3(s.x, s.y, s.z), q, new THREE.Vector3(s.w, s.h, s.d));
      mesh.current!.setMatrixAt(i, m);
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
  }, [sections, mesh]);
}

export function Skyline({ lots, farLots }: { lots: number; farLots: number }) {
  const city = useMemo(() => buildCity(lots), [lots]);
  const far = useMemo(() => buildCity(farLots, true), [farLots]);

  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const farBox = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const sections = useRef<THREE.InstancedMesh>(null);
  const farMesh = useRef<THREE.InstancedMesh>(null);
  const props = useRef<THREE.InstancedMesh>(null);
  const signs = useRef<THREE.InstancedMesh>(null);
  const beacons = useRef<THREE.InstancedMesh>(null);
  const dayLines = useRef<THREE.Group>(null);

  useSections(city.sections, sections, box);
  useSections(far.sections, farMesh, farBox);

  const facade = useMemo(() => makeFacade(false), []);
  const farFacade = useMemo(() => makeFacade(true), []);
  const dayFill = useMemo(() => new THREE.MeshBasicMaterial({ color: "#f4f8ff", transparent: true, opacity: 0.04, depthWrite: false }), []);
  const propMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1d1830", metalness: 0.8, roughness: 0.38, envMapIntensity: 0.9 }), []);
  const propGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  const signGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    const a = new Float32Array(city.signs.length * 4);
    city.signs.forEach((s, i) => a.set([s.tier, s.seed, s.w, s.h], i * 4));
    g.setAttribute("aSign", new THREE.InstancedBufferAttribute(a, 4));
    return g;
  }, [city.signs]);
  const signMat = useMemo(() => {
    const p = PALETTE.neon;
    return new THREE.ShaderMaterial({
      vertexShader: signVert,
      fragmentShader: signFrag,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uBoot: { value: 0 },
        uT1: { value: new THREE.Color(p.t1) },
        uT2: { value: new THREE.Color(p.t2) },
        uT3: { value: new THREE.Color(p.t3) },
        uFog: { value: new THREE.Color(p.paper) },
        uCam: { value: new THREE.Vector3() },
      },
    });
  }, []);

  const beaconGeo = useMemo(() => {
    const g = new THREE.SphereGeometry(0.06, 8, 6);
    g.setAttribute("aSeed", new THREE.InstancedBufferAttribute(new Float32Array(city.beacons.map((b) => b.seed)), 1));
    return g;
  }, [city.beacons]);
  const beaconMat = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: beaconVert, fragmentShader: beaconFrag, uniforms: { uTime: { value: 0 } } }),
    [],
  );

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    city.props.forEach((p, i) => {
      m.compose(new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3(p.w, p.h, p.d));
      props.current!.setMatrixAt(i, m);
    });
    props.current!.instanceMatrix.needsUpdate = true;
    city.signs.forEach((s, i) => {
      m.compose(new THREE.Vector3(s.x, s.y, s.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, s.ry, 0)), new THREE.Vector3(s.w, s.h, 1));
      signs.current!.setMatrixAt(i, m);
    });
    signs.current!.instanceMatrix.needsUpdate = true;
    city.beacons.forEach((b, i) => {
      m.compose(new THREE.Vector3(b.x, b.y, b.z), q, new THREE.Vector3(1, 1, 1));
      beacons.current!.setMatrixAt(i, m);
    });
    beacons.current!.instanceMatrix.needsUpdate = true;
  }, [city]);

  /* the day drawing: every section, prop and sign as linework */
  const dayGeo = useMemo(() => {
    const boxes = [...city.sections, ...city.props];
    const signBoxes = city.signs.map((s) => ({ x: s.x, y: s.y, z: s.z, w: Math.abs(Math.sin(s.ry)) > 0.5 ? 0.02 : s.w, h: s.h, d: Math.abs(Math.sin(s.ry)) > 0.5 ? s.w : 0.02 }));
    return { city: edgesFor(boxes), signs: edgesFor(signBoxes), far: edgesFor(far.sections) };
  }, [city, far]);

  useWorld((isDay) => {
    if (sections.current) sections.current.material = isDay ? dayFill : facade;
    if (farMesh.current) farMesh.current.visible = !isDay;
    if (props.current) props.current.visible = !isDay;
    if (signs.current) signs.current.visible = !isDay;
    if (beacons.current) beacons.current.visible = !isDay;
    if (dayLines.current) dayLines.current.visible = isDay;
  });

  useFrame((state, dt) => {
    const t = Math.min(dt, 0.05);
    for (const m of [facade, farFacade]) {
      m.uniforms.uTime.value += t;
      m.uniforms.uBoot.value = stage.boot;
      m.uniforms.uCam.value.copy(state.camera.position);
    }
    signMat.uniforms.uTime.value += t;
    signMat.uniforms.uBoot.value = stage.boot;
    signMat.uniforms.uCam.value.copy(state.camera.position);
    beaconMat.uniforms.uTime.value += t;
  });

  return (
    <group>
      <instancedMesh ref={sections} args={[box, facade, city.sections.length]} frustumCulled={false} />
      <instancedMesh ref={farMesh} args={[farBox, farFacade, far.sections.length]} frustumCulled={false} />
      <instancedMesh ref={props} args={[propGeo, propMat, Math.max(1, city.props.length)]} frustumCulled={false} />
      <instancedMesh ref={signs} args={[signGeo, signMat, Math.max(1, city.signs.length)]} frustumCulled={false} />
      <instancedMesh ref={beacons} args={[beaconGeo, beaconMat, Math.max(1, city.beacons.length)]} frustumCulled={false} />
      <group ref={dayLines} visible={false}>
        <lineSegments geometry={dayGeo.city}>
          <lineBasicMaterial color="#f4f8ff" transparent opacity={0.55} />
        </lineSegments>
        <lineSegments geometry={dayGeo.signs}>
          <lineBasicMaterial color={PALETTE.blueprint.t1} transparent opacity={0.9} />
        </lineSegments>
        <lineSegments geometry={dayGeo.far}>
          <lineBasicMaterial color="#f4f8ff" transparent opacity={0.16} />
        </lineSegments>
      </group>
    </group>
  );
}
