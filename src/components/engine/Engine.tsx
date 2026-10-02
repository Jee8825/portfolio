"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { advance } from "@react-three/fiber";
import { getGPUTier } from "detect-gpu";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { readPref, stage, ui, type GpuTier, type World } from "@/lib/store";

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

/** Single RAF owner: GSAP's ticker → Lenis → ScrollTrigger → R3F. */
export function Engine() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __stage: stage, __ui: ui });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const world = (document.documentElement.dataset.world as World) || "digital";
    stage.world = world === "analog" ? 1 : 0;
    ui.set({
      world,
      reducedMotion: reduced,
      quick: readPref("quick") === "1",
      sound: false,
    });

    /* GPU tier — benchmarks are self-hosted in /public/gpu */
    let cancelled = false;
    const forced = new URLSearchParams(location.search).get("tier");
    if (forced !== null) {
      ui.set({ tier: Math.max(0, Math.min(3, Number(forced))) as GpuTier, gpuReady: true });
    } else if (reduced) {
      ui.set({ tier: 0, gpuReady: true });
    } else {
      getGPUTier({ benchmarksURL: "/gpu" })
        .then((r) => {
          if (cancelled) return;
          let tier = r.tier as GpuTier;
          // unknown GPUs on desktop usually cope fine; phones get at most medium
          if (r.type === "FALLBACK") tier = (r.isMobile ? 1 : 2) as GpuTier;
          if (r.isMobile) tier = Math.min(tier, 2) as GpuTier;
          if (r.type === "WEBGL_UNSUPPORTED" || r.type === "BLOCKLISTED") tier = 0;
          ui.set({ tier, gpuReady: true });
        })
        .catch(() => !cancelled && ui.set({ tier: 2, gpuReady: true }));
    }

    /* smooth scroll */
    lenis = new Lenis({ autoRaf: false, lerp: reduced ? 1 : 0.09, wheelMultiplier: 0.9 });
    lenis.on("scroll", (l: Lenis) => {
      stage.velocity = l.velocity;
      stage.progress = l.progress;
      ScrollTrigger.update();
    });
    const tick = (time: number) => {
      lenis?.raf(time * 1000);
      // velocity decays to zero when the wheel stops
      if (lenis && !lenis.isScrolling) stage.velocity *= 0.9;
      advance(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onPointer = (e: PointerEvent) => {
      stage.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      stage.pointer.y = -((e.clientY / innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      stage.pointer.x = 9;
      stage.pointer.y = 9;
    };
    addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelled = true;
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
      removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return null;
}

/** Maps every [data-formation] section to the field: entering section k morphs k-1 → k. */
export function Director() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-formation]"));
    const triggers: ScrollTrigger[] = [];
    els.forEach((el, k) => {
      const f = Number(el.dataset.formation);
      const prev = k === 0 ? f : Number(els[k - 1].dataset.formation);
      if (k > 0) {
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: "top bottom",
            end: "top 15%",
            onUpdate: (self) => {
              if (self.isActive) stage.scene = prev + (f - prev) * self.progress;
            },
            onLeave: () => (stage.scene = f),
            onLeaveBack: () => (stage.scene = prev),
          }),
        );
      }
      const id = el.dataset.scene;
      if (id) {
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: "top 50%",
            end: "bottom 50%",
            onToggle: (self) => self.isActive && ui.set({ sceneId: id }),
          }),
        );
      }
    });
    stage.scene = 1;
    const id = requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
    return () => {
      cancelAnimationFrame(id);
      triggers.forEach((t) => t.kill());
    };
  }, []);
  return null;
}
