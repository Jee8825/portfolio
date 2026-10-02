"use client";

import { gsap } from "@/lib/gsap";
import { sound } from "@/lib/sound";
import { stage, ui, writePref, type World } from "@/lib/store";

function apply(next: World) {
  const root = document.documentElement;
  root.dataset.world = next;
  stage.world = next === "analog" ? 1 : 0;
  ui.set({ world: next });
  writePref("world", next);
  sound.setWorld(next);
}

let busy = false;

/**
 * The signature cut between worlds:
 *  1. the field explodes, the screen tears           (0.0 – 0.35s)
 *  2. a portal opens from the switch, new world live (0.35 – 1.4s)
 *  3. the field re-assembles, type re-sets its axes   (0.4 – 1.6s)
 *  4. visible labels re-scramble                      (≈1.0s)
 */
export async function switchWorld(origin?: { x: number; y: number }) {
  if (busy) return;
  const current = ui.get().world;
  const next: World = current === "digital" ? "analog" : "digital";
  const root = document.documentElement;
  const reduced = ui.get().reducedMotion;

  if (reduced || typeof document.startViewTransition !== "function") {
    apply(next);
    return;
  }
  busy = true;
  const x = origin?.x ?? innerWidth / 2;
  const y = origin?.y ?? innerHeight / 2;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  sound.play("switch");
  await new Promise<void>((done) =>
    gsap
      .timeline({ onComplete: done })
      .to(stage, { scatter: 0.6, duration: 0.34, ease: "power3.in" }, 0)
      .to(stage, { glitch: 1, duration: 0.3, ease: "power2.in" }, 0),
  );

  root.classList.add("vt-run");
  const vt = document.startViewTransition(() => apply(next));
  gsap.to(stage, { scatter: 0, duration: 1.5, ease: "expo.out", delay: 0.05 });
  gsap.to(stage, { glitch: 0, duration: 0.9, ease: "power2.out", delay: 0.1 });

  try {
    await vt.ready;
    // the portal: the new world irises open from the switch itself
    root.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`],
        filter: ["contrast(1.6) saturate(1.6)", "contrast(1.1)", "none"],
      },
      { duration: 1050, easing: "cubic-bezier(0.76, 0, 0.24, 1)", pseudoElement: "::view-transition-new(root)" },
    );
    await vt.finished;
  } finally {
    root.classList.remove("vt-run");
    busy = false;
  }
  rescramble();
}

/** Re-type the labels currently on screen, like a terminal re-drawing / a press re-printing. */
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
        chars: ui.get().world === "digital" ? "01<>/\\|#_" : "abcdefghijklmnopqrstuvwxyz",
        speed: 0.6,
      },
      ease: "none",
    });
  });
}
