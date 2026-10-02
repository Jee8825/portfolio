"use client";
/* eslint-disable react-hooks/immutability -- scene fog/background are mutated on world flips by design */

import { useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { PALETTE } from "@/lib/palette";
import { Skyline } from "./Skyline";
import { Sky, StreetLamps } from "./SkyStreets";
import { Landmarks } from "./Landmarks";
import { Avenue, Ground, Highways } from "./Roads";
import { Rain } from "./Atmosphere";
import { CameraRig } from "./CameraRig";
import { useWorld } from "./useWorld";

const QUALITY = {
  1: { lots: 150, far: 60, reflect: false, glass: 1, rain: 900 },
  2: { lots: 250, far: 120, reflect: false, glass: 2, rain: 1600 },
  3: { lots: 340, far: 180, reflect: true, glass: 2, rain: 2600 },
} as const;

/** The Data City. Night = neon, glass and wet streets. Day = the same city as a blueprint. */
export function City({ tier }: { tier: 1 | 2 | 3 }) {
  const q = QUALITY[tier];
  const { scene, gl } = useThree();

  useWorld((isDay) => {
    const p = isDay ? PALETTE.blueprint : PALETTE.neon;
    gl.setClearColor(new THREE.Color(p.paper), 1);
    scene.fog = isDay ? null : new THREE.FogExp2(new THREE.Color(p.paper), 0.021);
    scene.environmentIntensity = isDay ? 0 : 1;
  });

  return (
    <>
      <CameraRig />
      {/* studio light for the glass and chrome: neon strips reflected in every surface */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4} color="#ff2e88" position={[-10, 6, -6]} scale={[8, 1.2, 1]} rotation-y={Math.PI / 3} />
        <Lightformer form="rect" intensity={4} color="#22e1ff" position={[10, 4, 6]} scale={[8, 1.2, 1]} rotation-y={-Math.PI / 3} />
        <Lightformer form="rect" intensity={2.5} color="#ffb020" position={[0, 10, -10]} scale={[10, 2, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#ffffff" position={[0, 14, 0]} scale={6} rotation-x={Math.PI / 2} />
      </Environment>
      <ambientLight intensity={0.25} color="#6b5bff" />
      <directionalLight position={[20, 30, 10]} intensity={0.6} color="#b9a8ff" />

      <Ground reflect={q.reflect} />
      <Highways />
      <Avenue />
      <Sky />
      <Skyline lots={q.lots} farLots={q.far} />
      <StreetLamps />
      <Landmarks glassTier={q.glass} />
      <Rain count={q.rain} />
    </>
  );
}
