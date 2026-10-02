"use client";

import { gsap } from "@/lib/gsap";
import { sound } from "@/lib/sound";
import { stage, ui, writePref, type World } from "@/lib/store";

function apply(next: World) {
  const root = document.documentElement;
  root.dataset.world = next;
  stage.world = next === "blueprint" ? 1 : 0;
  ui.set({ world: next });
  writePref("world", next);
  sound.setWorld(next);
}

let busy = false;

/**
 * The liquid melt between NEON and BLUEPRINT:
 *  • the new world floods in from the switch, its edge warped like liquid
 *    (view-transition clip + SVG turbulence displacement)
 *  • the old world drips and slides away underneath
 *  • the WebGL city rolls a refractive ripple out from the same point
 *  • type re-sets (Unbounded weight 760 ⇄ 260)
 */
export async function switchWorld(origin?: { x: number; y: number }) {
  if (busy) return;
  const next: World = ui.get().world === "neon" ? "blueprint" : "neon";
  const root = document.documentElement;
  const x = origin?.x ?? innerWidth / 2;
  const y = origin?.y ?? innerHeight / 2;
  stage.meltAt = { x: x / innerWidth, y: 1 - y / innerHeight };

  if (ui.get().reducedMotion || typeof document.startViewTransition !== "function") {
    apply(next);
    return;
  }
  busy = true;
  sound.play("switch");
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) * 1.15;
  const px = (x / innerWidth) * 100;
  const py = (y / innerHeight) * 100;
  // circle() % radius is relative to sqrt(w² + h²) / √2
  const pr = (r / (Math.hypot(innerWidth, innerHeight) / Math.SQRT2)) * 100;
  const edge = document.getElementById("melt-edge-map");
  const drip = document.getElementById("melt-drip-map");

  root.classList.add("vt-run");
  const vt = document.startViewTransition(() => apply(next));
  gsap.fromTo(stage, { melt: 0 }, { melt: 1, duration: 1.5, ease: "power2.out", onComplete: () => void (stage.melt = 0) });

  const anims: Animation[] = [];
  try {
    await vt.ready;
    const opts = { duration: 1250, easing: "cubic-bezier(0.7, 0, 0.2, 1)", fill: "both" as FillMode };
    anims.push(
      root.animate(
        {
          // percentages are relative to the snapshot itself, so zoom/scaling can't skew the origin
          clipPath: [`circle(0% at ${px}% ${py}%)`, `circle(${pr}% at ${px}% ${py}%)`],
          filter: ["url(#melt-edge)", "url(#melt-edge)"],
        },
        { ...opts, pseudoElement: "::view-transition-new(root)" },
      ),
    );
    anims.push(root.animate(
      [
        { transform: "translateY(0)", filter: "url(#melt-drip)" },
        { transform: "translateY(6vh) scaleY(1.06)", filter: "url(#melt-drip)" },
      ],
      { ...opts, pseudoElement: "::view-transition-old(root)" },
    ));
    if (edge) gsap.fromTo(edge, { attr: { scale: 90 } }, { attr: { scale: 0 }, duration: 1.25, ease: "power2.out" });
    if (drip) gsap.fromTo(drip, { attr: { scale: 0 } }, { attr: { scale: 160 }, duration: 1.25, ease: "power2.in" });
    await vt.finished;
  } finally {
    // filled animations would otherwise linger on :root and hijack the next switch
    anims.forEach((a) => a.cancel());
    root.classList.remove("vt-run");
    busy = false;
  }
  rescramble();
}

/** Re-type the labels on screen, like a sign re-lighting / a drafter re-lettering. */
function rescramble() {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-scramble]")).filter((el) => {
    const b = el.getBoundingClientRect();
    return b.bottom > 0 && b.top < innerHeight && el.childElementCount === 0;
  });
  els.slice(0, 24).forEach((el, i) => {
    const text = el.dataset.scramble || el.textContent || "";
    gsap.to(el, {
      duration: 0.7,
      delay: i * 0.025,
      scrambleText: {
        text,
        chars: ui.get().world === "neon" ? "▮▯/\\|#_" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        speed: 0.6,
      },
      ease: "none",
    });
  });
}
