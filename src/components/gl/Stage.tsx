"use client";
/* eslint-disable react-hooks/immutability -- the post chain is mutated per frame inside useFrame by design */

import { useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import { HalfFloatType } from "three";
import { NeuralField } from "./NeuralField";
import { SignalEffect } from "./SignalEffect";
import { stage, useUI } from "@/lib/store";

const COUNTS = { 1: 5000, 2: 9000, 3: 14000 } as const;

/** Takes over rendering (priority 1) and runs the post chain. */
function Composer({ tier }: { tier: 1 | 2 | 3 }) {
  const { gl, scene, camera, size } = useThree();

  const chain = useMemo(() => {
    const composer = new EffectComposer(gl, { frameBufferType: HalfFloatType });
    const bloom = new BloomEffect({
      intensity: 1.35,
      luminanceThreshold: 0.12,
      luminanceSmoothing: 0.3,
      mipmapBlur: true,
      radius: 0.72,
    });
    const signal = new SignalEffect();
    const bloomPass = new EffectPass(camera, bloom);
    composer.addPass(new RenderPass(scene, camera));
    if (tier >= 2) composer.addPass(bloomPass);
    composer.addPass(new EffectPass(camera, signal));
    return { composer, bloom, bloomPass, signal };
  }, [gl, scene, camera, tier]);

  useEffect(() => {
    chain.composer.setSize(size.width, size.height);
    chain.signal.u("uRes").value.set(size.width * gl.getPixelRatio(), size.height * gl.getPixelRatio());
  }, [chain, size, gl]);

  useEffect(() => () => chain.composer.dispose(), [chain]);

  useFrame((_, delta) => {
    const { signal, bloomPass, composer } = chain;
    const analog = stage.world > 0.5;
    bloomPass.enabled = !analog;
    signal.u("uWorld").value = analog ? 1 : 0;
    signal.u("uGlitch").value = stage.glitch + Math.min(Math.abs(stage.velocity) * 0.015, 0.08);
    signal.u("uTime").value += delta;
    composer.render(delta);
  }, 1);

  return null;
}

export default function Stage() {
  const tier = useUI((s) => s.tier);
  const gpuReady = useUI((s) => s.gpuReady);
  const [fonts, setFonts] = useState(false);

  useEffect(() => {
    // the name is sampled from real Fraunces glyphs, so wait for the face
    Promise.race([
      document.fonts.load('600 100px "Fraunces Variable"'),
      new Promise((r) => setTimeout(r, 2500)),
    ]).finally(() => setFonts(true));
  }, []);

  useEffect(() => {
    if (gpuReady) document.documentElement.dataset.gl = tier > 0 ? "on" : "off";
  }, [tier, gpuReady]);

  if (tier === 0 || !fonts) return null;
  const t = tier as 1 | 2 | 3;
  return (
    <div className="stage" aria-hidden>
      <Canvas
        frameloop="never"
        flat
        linear
        dpr={[1, t === 3 ? 1.75 : t === 2 ? 1.5 : 1]}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance", stencil: false }}
        camera={{ fov: 35, position: [0, 0, 14], near: 0.1, far: 100 }}
      >
        <NeuralField count={COUNTS[t]} />
        <Composer tier={t} />
      </Canvas>
    </div>
  );
}
