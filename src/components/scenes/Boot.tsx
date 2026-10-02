"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { sound } from "@/lib/sound";
import { stage, ui, useUI } from "@/lib/store";
import { getLenis } from "@/components/engine/Engine";

const DIGITAL = [
  "init neural_field",
  "mount memory tiers  [EPI] [SEM] [PRO]",
  "calibrate confidence",
  "signal acquired",
];
const ANALOG = [
  "plate K — key black",
  "plate P — fluoro pink",
  "plate B — riso blue",
  "plate Y — yellow",
];

/** 00 BOOT — the field powers on: a single scanline, then the name. Any input skips. */
export function Boot() {
  const world = useUI((s) => s.world);
  const gpuReady = useUI((s) => s.gpuReady);
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !gpuReady) return;
    const s = ui.get();
    run();
    function run() {
      started.current = true;
      const quiet = s.reducedMotion || s.quick || ui.get().tier === 0;
      let seen = false;
      try {
        seen = sessionStorage.getItem("jee:booted") === "1";
        sessionStorage.setItem("jee:booted", "1");
      } catch {}
      if (quiet) {
        stage.boot = 1;
        ui.set({ booted: true });
        setGone(true);
        return;
      }
      const lenis = getLenis();
      lenis?.stop();
      const speed = seen ? 2.2 : 1;
      const lines = root.current?.querySelectorAll<HTMLElement>("[data-line]") ?? [];
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        onComplete: finish,
      });
      tl.timeScale(speed);
      lines.forEach((el, i) => {
        tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.15 + i * 0.28)
          .to(el.querySelector("[data-ok]"), { autoAlpha: 1, duration: 0.01 }, 0.15 + i * 0.28 + 0.2);
      });
      tl.to(stage, { glitch: 0.35, duration: 0.12, yoyo: true, repeat: 1 }, 1.25)
        .to(root.current, { autoAlpha: 0, duration: 0.45, ease: "power2.out" }, 1.45)
        .to(stage, { boot: 1, duration: 2.1, ease: "expo.inOut" }, 1.3)
        .call(() => {
          sound.play("boot");
          ui.set({ booted: true });
          lenis?.start();
        }, [], 2.4);

      function finish() {
        stage.boot = 1;
        setGone(true);
      }
      const skip = () => {
        if (tl.progress() < 1) tl.progress(1);
      };
      addEventListener("keydown", skip, { once: true });
      addEventListener("pointerdown", skip, { once: true });
      addEventListener("wheel", skip, { once: true, passive: true });
    }
  }, [gpuReady]);

  if (gone) return null;
  const lines = world === "digital" ? DIGITAL : ANALOG;
  return (
    <div
      ref={root}
      className="theatre-only pointer-events-none fixed inset-0 z-[70] flex items-end px-4 pb-24 sm:px-6"
      aria-hidden
    >
      <ul className="label space-y-1.5 text-ink-2">
        {lines.map((l, i) => (
          <li key={l} data-line className="invisible flex gap-3">
            <span className="text-ink-3">{world === "digital" ? `[${String(i).padStart(2, "0")}]` : `${i + 1}.`}</span>
            <span>{l}</span>
            <span data-ok className={`invisible ${i % 3 === 0 ? "t1" : i % 3 === 1 ? "t2" : "t3"}`}>
              {world === "digital" ? "ok" : "✓ registered"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
