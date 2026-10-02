"use client";

import { useEffect, useRef } from "react";
import { DISTRICTS } from "@/lib/city";
import { gsap } from "@/lib/gsap";
import { stage, useUI } from "@/lib/store";

const near = (x: number, at: number) => Math.max(0, 1 - Math.abs(x - at) * 1.6);

/** District signs that hang over each tower in the overview shots (signal + cortex). */
export function CitySigns() {
  const night = useUI((s) => s.world) === "neon";
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const tick = () => {
      const show = Math.min(1, near(stage.scene, 1) + near(stage.scene, 3)) * (stage.boot >= 1 ? 1 : 0);
      refs.current.forEach((el, i) => {
        const a = stage.anchors[i];
        if (!el || !a) return;
        el.style.transform = `translate3d(${a.x}px, ${a.y}px, 0) translate(-50%, -100%)`;
        el.style.opacity = String(a.z > 0 ? show : 0);
      });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const signs = [{ name: "You are here", tier: 3 }, ...DISTRICTS.map((d) => ({ name: d.name, tier: d.tier }))];
  return (
    <div className="theatre-only pointer-events-none fixed inset-0 z-20" aria-hidden>
      {signs.map((s, i) => (
        <div key={s.name} ref={(el) => void (refs.current[i] = el)} className="absolute left-0 top-0 opacity-0 will-change-transform">
          <div className="flex flex-col items-center">
            <span
              className={`label whitespace-nowrap px-2 py-1 ${night ? "rounded-sm text-ink" : "border border-ink bg-paper text-ink"}`}
              style={
                night
                  ? { textShadow: `0 0 8px var(--t${s.tier}), 0 0 18px var(--t${s.tier})`, border: `1px solid var(--t${s.tier})`, boxShadow: `0 0 12px var(--t${s.tier})` }
                  : undefined
              }
            >
              {s.name}
            </span>
            <span className="h-6 w-px" style={{ background: night ? `var(--t${s.tier})` : "var(--ink)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
