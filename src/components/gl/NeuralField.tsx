"use client";
/* eslint-disable react-hooks/immutability -- three.js uniforms, materials and the camera are mutated per frame inside useFrame by design */

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildField, CORTEX_CENTERS, FORMATIONS, mulberry32, STAGING, TEX_W } from "@/lib/formations";
import { PALETTE, hexToRgb } from "@/lib/palette";
import { stage } from "@/lib/store";
import { profile } from "@/data/portfolio";
import { linesFrag, linesVert, pointsFrag, pointsVert } from "./shaders";

/** World-space width each formation needs, used to fit it to narrow screens. */
const WIDTH: Record<string, number> = {
  boot: 15, signal: 13.2, memory: 6.8, cortex: 9.4, rings: 6.2, ledger: 8.2,
  fleet: 6.4, orb: 9, trace: 13.6, transmit: 11.5,
};

const DIGITAL_BLEND = { blending: THREE.AdditiveBlending };
const ANALOG_BLEND = {
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.DstColorFactor,
  blendDst: THREE.ZeroFactor,
};

function inkUniforms(world: "digital" | "analog") {
  const p = PALETTE[world];
  return {
    uInk0: new THREE.Vector3(...hexToRgb(p.key)),
    uInk1: new THREE.Vector3(...hexToRgb(p.t1)),
    uInk2: new THREE.Vector3(...hexToRgb(p.t2)),
    uInk3: new THREE.Vector3(...hexToRgb(p.t3)),
  };
}

export function NeuralField({ count }: { count: number }) {
  const { camera, size, gl } = useThree();
  const data = useMemo(() => buildField(count, profile.name.toUpperCase()), [count]);

  const texture = useMemo(() => {
    const t = new THREE.DataTexture(
      data.texture,
      TEX_W,
      data.rows * FORMATIONS.length,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    t.minFilter = t.magFilter = THREE.NearestFilter;
    t.needsUpdate = true;
    return t;
  }, [data]);

  /* shared uniforms object: both materials point at the same values */
  const uniforms = useMemo(
    () => ({
      uForm: { value: texture },
      uTexW: { value: TEX_W },
      uTexH: { value: data.rows * FORMATIONS.length },
      uRows: { value: data.rows },
      uFrom: { value: 0 },
      uTo: { value: 0 },
      uMix: { value: 0 },
      uOffFrom: { value: new THREE.Vector3() },
      uOffTo: { value: new THREE.Vector3() },
      uSpinFrom: { value: 0 },
      uSpinTo: { value: 0 },
      uTime: { value: 0 },
      uScatter: { value: 0 },
      uFit: { value: 1 },
      uSide: { value: 1 },
      uPointer: { value: new THREE.Vector3(99, 99, 0) },
      uVel: { value: 0 },
      uPulse: { value: 0 },
      uSize: { value: 5.2 },
      uPR: { value: gl.getPixelRatio() },
      uWorld: { value: 0 },
      uInk0: { value: new THREE.Vector3() },
      uInk1: { value: new THREE.Vector3() },
      uInk2: { value: new THREE.Vector3() },
      uInk3: { value: new THREE.Vector3() },
      uFocus: { value: 0 },
      uFocusAmt: { value: 0 },
      uDim: { value: 1 },
    }),
    [texture, data.rows, gl],
  );

  const pointsGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const idx = new Float32Array(count);
    const seed = new Float32Array(count);
    const rnd = mulberry32(7);
    for (let i = 0; i < count; i++) {
      idx[i] = i;
      seed[i] = rnd();
    }
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aIdx", new THREE.BufferAttribute(idx, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);
    return g;
  }, [count]);

  const linesGeo = useMemo(() => {
    const seeds = pointsGeo.getAttribute("aSeed").array as Float32Array;
    const e = data.edges;
    const m = e.length / 2;
    const rnd = mulberry32(11);
    const g = new THREE.BufferGeometry();
    const A = new Float32Array(m * 2), B = new Float32Array(m * 2);
    const SA = new Float32Array(m * 2), SB = new Float32Array(m * 2);
    const side = new Float32Array(m * 2), s = new Float32Array(m * 2);
    for (let k = 0; k < m; k++) {
      const a = e[k * 2], b = e[k * 2 + 1], r = rnd();
      for (let v = 0; v < 2; v++) {
        const o = k * 2 + v;
        A[o] = a; B[o] = b; SA[o] = seeds[a]; SB[o] = seeds[b]; side[o] = v; s[o] = r;
      }
    }
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(m * 2 * 3), 3));
    g.setAttribute("aA", new THREE.BufferAttribute(A, 1));
    g.setAttribute("aB", new THREE.BufferAttribute(B, 1));
    g.setAttribute("aSA", new THREE.BufferAttribute(SA, 1));
    g.setAttribute("aSB", new THREE.BufferAttribute(SB, 1));
    g.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(s, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);
    return g;
  }, [data, pointsGeo]);

  const pointsMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: pointsVert,
        fragmentShader: pointsFrag,
        uniforms,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        ...DIGITAL_BLEND,
      }),
    [uniforms],
  );
  const linesMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: linesVert,
        fragmentShader: linesFrag,
        uniforms,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        ...DIGITAL_BLEND,
      }),
    [uniforms],
  );

  useEffect(() => () => {
    texture.dispose();
    pointsGeo.dispose();
    linesGeo.dispose();
    pointsMat.dispose();
    linesMat.dispose();
  }, [texture, pointsGeo, linesGeo, pointsMat, linesMat]);

  const worldRef = useRef(-1);
  const smooth = useRef({ scene: 0, vel: 0, px: 0, py: 0 });
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const tmp2 = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const u = uniforms;
    const dt = Math.min(delta, 1 / 20);
    u.uTime.value += dt;

    /* world flip — swaps blending and inks in one frame (hidden by the transition) */
    const world = stage.world > 0.5 ? 1 : 0;
    if (world !== worldRef.current) {
      worldRef.current = world;
      const key = world ? "analog" : "digital";
      const inks = inkUniforms(key);
      (Object.keys(inks) as (keyof typeof inks)[]).forEach((k) => u[k].value.copy(inks[k]));
      u.uWorld.value = world;
      for (const m of [pointsMat, linesMat]) {
        Object.assign(m, world ? ANALOG_BLEND : DIGITAL_BLEND);
        m.needsUpdate = true;
      }
      const bg = hexToRgb(PALETTE[key].paper);
      state.gl.setClearColor(new THREE.Color(bg[0], bg[1], bg[2]), 1);
    }

    /* scene: boot overrides scroll until it completes */
    const target = stage.boot < 1 ? stage.boot : Math.max(1, stage.scene);
    const s = smooth.current;
    s.scene += (target - s.scene) * (1 - Math.exp(-dt * 6));
    s.vel += (stage.velocity - s.vel) * (1 - Math.exp(-dt * 4));
    const max = FORMATIONS.length - 1;
    const sc = Math.min(Math.max(s.scene, 0), max);
    const from = Math.min(Math.floor(sc), max);
    const to = Math.min(from + 1, max);
    const mix = sc - from;
    u.uFrom.value = from;
    u.uTo.value = to;
    u.uMix.value = mix;

    const aspect = size.width / size.height;
    const wide = aspect > 1.15;
    const visW = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(35 / 2)) * aspect;
    const fit = (f: string) => Math.min(1, (visW * (wide ? 0.94 : 0.9)) / WIDTH[f]);
    const fa = FORMATIONS[from], fb = FORMATIONS[to];
    const em = mix * mix * (3 - 2 * mix);
    u.uFit.value = THREE.MathUtils.lerp(fit(fa), fit(fb), em);
    const off = (f: string, out: THREE.Vector3) => {
      const o = STAGING[f as keyof typeof STAGING].offset;
      if (wide) return out.set(o[0], o[1], o[2]);
      // narrow screens: centred, everything lifted above the copy
      if (f === "signal") return out.set(0, 2.2, 0);
      return out.set(0, o[0] !== 0 ? -2.0 : o[1], 0);
    };
    off(fa, u.uOffFrom.value);
    off(fb, u.uOffTo.value);
    u.uSide.value = 1;
    u.uSpinFrom.value = STAGING[fa].spin;
    u.uSpinTo.value = STAGING[fb].spin;
    u.uVel.value = s.vel;
    u.uScatter.value = stage.scatter;
    u.uPulse.value = stage.pulse;

    /* narrow screens: the field sits behind the copy, so it steps back */
    const loud = (f: string) => f === "signal" || f === "transmit" || f === "boot";
    const dimTarget = wide ? 1 : THREE.MathUtils.lerp(loud(fa) ? 1 : 0.4, loud(fb) ? 1 : 0.4, em);
    u.uDim.value += (dimTarget - u.uDim.value) * (1 - Math.exp(-dt * 4));

    /* tier spotlight */
    stage.focusAmt += ((stage.focus > 0 ? 1 : 0) - stage.focusAmt) * (1 - Math.exp(-dt * 5));
    if (stage.focus > 0) u.uFocus.value = stage.focus;
    u.uFocusAmt.value = stage.focusAmt;

    /* project the cortex cluster centres so DOM labels can ride on them */
    const ci = FORMATIONS.indexOf("cortex");
    if (Math.abs(sc - ci) < 1) {
      const st = STAGING.cortex;
      const fitC = fit("cortex");
      const offC = off("cortex", tmp2);
      const a = u.uTime.value * 0.12 * st.spin;
      const c = Math.cos(a), sn = Math.sin(a);
      CORTEX_CENTERS.forEach(([x, y, z], i) => {
        tmp.set((x * c + z * sn) * fitC + offC.x, y * fitC + offC.y, (-x * sn + z * c) * fitC + offC.z);
        const depth = tmp.z;
        tmp.project(camera);
        stage.anchors[i] = {
          x: (tmp.x * 0.5 + 0.5) * size.width,
          y: (-tmp.y * 0.5 + 0.5) * size.height,
          z: depth,
        };
      });
    }

    /* pointer → world plane at z = 0, eased */
    s.px += (stage.pointer.x - s.px) * (1 - Math.exp(-dt * 8));
    s.py += (stage.pointer.y - s.py) * (1 - Math.exp(-dt * 8));
    const visH = visW / aspect;
    tmp.set((s.px * visW) / 2, (s.py * visH) / 2, 0);
    u.uPointer.value.copy(tmp);

    /* camera parallax */
    camera.position.x += (s.px * 0.5 - camera.position.x) * (1 - Math.exp(-dt * 3));
    camera.position.y += (s.py * 0.3 - camera.position.y) * (1 - Math.exp(-dt * 3));
    camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      <lineSegments geometry={linesGeo} material={linesMat} frustumCulled={false} />
      <points geometry={pointsGeo} material={pointsMat} frustumCulled={false} />
    </group>
  );
}
