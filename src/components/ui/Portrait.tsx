"use client";

import { useMemo } from "react";
import { useUI } from "@/lib/store";

/**
 * Portrait, rendered as a halftone. With no photo yet, a generative
 * head-and-shoulders silhouette is drawn from dots; drop a real photo into
 * `profile.portrait` and it gets the same screen treatment per world.
 */
export function Portrait({ src, name }: { src?: string; name: string }) {
  const night = useUI((s) => s.world) === "neon";
  const dots = useMemo(() => silhouette(), []);
  const W = 132,
    H = 168;

  return (
    <figure className="relative" style={{ width: W, height: H }}>
      <div className="panel absolute inset-0 overflow-hidden" style={{ ["--panel-accent" as string]: "var(--t1)" }}>
        {src ? (
          <div className="absolute inset-0">
            {/* pink plate, slightly off-register in print / RGB ghost on screen */}
            <img
              src={src}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                filter: "grayscale(1) contrast(1.5)",
                mixBlendMode: night ? "screen" : "multiply",
                transform: "translate(3px, 2px)",
                opacity: 0.55,
                background: "var(--t1)",
              }}
            />
            <img
              src={src}
              alt={`Portrait of ${name}`}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                filter: night ? "grayscale(1) contrast(1.35) brightness(1.1)" : "grayscale(1) contrast(1.6)",
                mixBlendMode: night ? "screen" : "multiply",
                WebkitMaskImage: "radial-gradient(circle, #000 52%, transparent 58%)",
                maskImage: "radial-gradient(circle, #000 52%, transparent 58%)",
                WebkitMaskSize: "4px 4px",
                maskSize: "4px 4px",
              }}
            />
          </div>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" role="img" aria-label="Portrait placeholder">
            <g fill="var(--t1)" transform="translate(2.5 1.5)" opacity={night ? 0.5 : 0.85}>
              {dots.map((d, i) => (
                <circle key={`p${i}`} cx={d.x} cy={d.y} r={d.r * 0.85} />
              ))}
            </g>
            <g fill="var(--ink)">
              {dots.map((d, i) => (
                <circle key={i} cx={d.x} cy={d.y} r={d.r} />
              ))}
            </g>
          </svg>
        )}
        {night && (
          <span
            aria-hidden
            className="absolute inset-x-0 h-8 animate-[scan_3.2s_linear_infinite]"
            style={{ background: "linear-gradient(to bottom, transparent, rgb(46 139 255 / 0.25), transparent)" }}
          />
        )}
      </div>
      {!src && (
        <figcaption className="label absolute -bottom-6 left-0 text-ink-3">
          {night ? "IMG // PENDING" : "photo to come"}
        </figcaption>
      )}
      <style>{`@keyframes scan{from{transform:translateY(-2rem)}to{transform:translateY(${H}px)}}`}</style>
    </figure>
  );
}

/** Halftone dots for a stylised head + shoulders, lit from the upper left. */
function silhouette() {
  const out: { x: number; y: number; r: number }[] = [];
  const step = 5.5;
  for (let y = step; y < 168; y += step) {
    for (let x = step; x < 132; x += step) {
      const head = Math.pow((x - 66) / 30, 2) + Math.pow((y - 64) / 38, 2);
      const neck = Math.abs(x - 66) < 13 && y > 92 && y < 118 ? 0.7 : 9;
      const sh = y > 112 ? Math.pow((x - 66) / (44 + (y - 112) * 0.9), 2) + Math.pow((y - 168) / 58, 2) : 9;
      const inside = Math.min(head, neck, sh);
      if (inside > 1.05) continue;
      const light = 0.55 + 0.45 * ((x - 30) / 100 + (y - 20) / 160);
      const tone = Math.min(1, Math.max(0.15, light * (1.1 - inside * 0.4)));
      out.push({ x, y, r: (step / 2) * tone });
    }
  }
  return out;
}
