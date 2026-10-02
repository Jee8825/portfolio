"use client";
/* eslint-disable react-hooks/immutability -- the post chain is mutated per frame inside useFrame by design */

import { useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import { HalfFloatType } from "three";
import { City } from "@/components/city/City";
import { CityLens } from "@/components/city/CityLens";
import { stage, useUI } from "@/lib/store";

/** Takes over rendering (priority 1) and runs the post chain. */
function Composer({ tier }: { tier: 1 | 2 | 3 }) {
  const { gl, scene, camera, size } = useThree();

  const chain = useMemo(() => {
    const composer = new EffectComposer(gl, { frameBufferType: HalfFloatType });
    const bloom = new BloomEffect({
      intensity: 1.15,
      luminanceThreshold: 0.82,
      luminanceSmoothing: 0.2,
      mipmapBlur: true,
      radius: 0.78,
    });
    const lens = new CityLens();
    const bloomPass = new EffectPass(camera, bloom);
    composer.addPass(new RenderPass(scene, camera));
    if (tier >= 2) composer.addPass(bloomPass);
    composer.addPass(new EffectPass(camera, lens));
    return { composer, bloomPass, lens };
  }, [gl, scene, camera, tier]);

  useEffect(() => {
    chain.composer.setSize(size.width, size.height);
    chain.lens.u("uRes").value.set(size.width, size.height);
  }, [chain, size]);

  useEffect(() => () => chain.composer.dispose(), [chain]);

  useFrame((_, delta) => {
    const { lens, bloomPass, composer } = chain;
    const day = stage.world > 0.5;
    bloomPass.enabled = !day;
    lens.u("uDay").value = day ? 1 : 0;
    lens.u("uTime").value += delta;
    lens.u("uMelt").value = stage.melt;
    lens.u("uMeltAt").value.set(stage.meltAt.x, stage.meltAt.y);
    composer.render(delta);
  }, 1);

  return null;
}

export default function Stage() {
  const tier = useUI((s) => s.tier);
  const gpuReady = useUI((s) => s.gpuReady);

  useEffect(() => {
    if (gpuReady) document.documentElement.dataset.gl = tier > 0 ? "on" : "off";
  }, [tier, gpuReady]);

  if (tier === 0) return null;
  const t = tier as 1 | 2 | 3;
  return (
    <div className="stage" aria-hidden>
      <Canvas
        frameloop="never"
        flat
        dpr={[1, t === 3 ? 1.75 : t === 2 ? 1.5 : 1]}
        gl={{ antialias: t >= 2, alpha: false, powerPreference: "high-performance", stencil: false }}
        camera={{ fov: 40, position: [0, 62, 48], near: 0.1, far: 400 }}
      >
        <City tier={t} />
        <Composer tier={t} />
      </Canvas>
    </div>
  );
}
