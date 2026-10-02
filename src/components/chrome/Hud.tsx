"use client";

import { useEffect, useRef } from "react";
import { profile, scenes } from "@/data/portfolio";
import { gsap } from "@/lib/gsap";
import { sound } from "@/lib/sound";
import { stage, ui, useUI, writePref } from "@/lib/store";
import { switchWorld } from "@/lib/world";
import { getLenis } from "@/components/engine/Engine";

function go(id: string) {
  const el = document.getElementById(id);
  if (!el) {
    location.href = `/#${id}`;
    return;
  }
  sound.play("tick");
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView();
}

export function Hud() {
  const world = useUI((s) => s.world);
  const sceneId = useUI((s) => s.sceneId);
  const quick = useUI((s) => s.quick);
  const soundOn = useUI((s) => s.sound);
  const tc = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const night = world === "neon";
  const idx = Math.max(0, scenes.findIndex((s) => s.id === sceneId));
  const current = scenes[idx];

  /* timecode + progress, written straight to the DOM every frame */
  useEffect(() => {
    const FILM = 180; // the page "runs" 3 minutes of film
    const tick = () => {
      const p = stage.progress || 0;
      if (tc.current) {
        const total = p * FILM;
        const m = Math.floor(total / 60);
        const s = Math.floor(total % 60);
        const f = Math.floor((total % 1) * 24);
        tc.current.textContent = `00:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
      }
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.quick = quick ? "1" : "0";
  }, [quick]);

  const toggleQuick = () => {
    const next = !ui.get().quick;
    ui.set({ quick: next });
    writePref("quick", next ? "1" : "0");
    sound.play("tick");
  };
  const toggleSound = async () => {
    const next = !ui.get().sound;
    ui.set({ sound: next });
    await sound.setEnabled(next);
  };

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] btn primary">
        Skip to content
      </a>

      {/* ---------------- top bar ---------------- */}
      <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-paper via-paper/85 to-transparent px-4 pb-8 pt-4 sm:px-6 lg:bg-none lg:pb-0">
        <div className="flex items-start justify-between gap-4">
          <button
            onClick={() => go("signal")}
            className="label group flex flex-col items-start text-left"
            aria-label="Back to top"
          >
            <span className="text-[0.8rem] tracking-[0.2em] text-ink">{profile.name.toUpperCase()}</span>
            <span className="hidden text-ink-3 sm:inline">{night ? "AI & DATA SCIENCE · NIGHT CITY" : "AI & DATA SCIENCE · DWG NO. 01"}</span>
          </button>

          <nav aria-label="Scenes" className="hidden lg:block">
            <ol className="flex items-center gap-1">
              {scenes.map((s, i) => {
                const active = s.id === sceneId;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => go(s.id)}
                      onMouseEnter={() => sound.play("hover")}
                      aria-current={active ? "true" : undefined}
                      className={`label px-2.5 py-1.5 transition-colors ${
                        active ? "text-ink" : "text-ink-3 hover:text-ink"
                      }`}
                    >
                      <span className={active ? (i % 3 === 0 ? "t1" : i % 3 === 1 ? "t2" : "t3") : ""}>{s.code}</span>{" "}
                      {s.label}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleQuick}
              aria-pressed={quick}
              className={`label px-2.5 py-1.5 border ${quick ? "border-ink bg-ink text-paper" : "border-rule text-ink-2 hover:text-ink"}`}
              title="A fast, plain one-page read — no animation"
            >
              Quick<span className="hidden sm:inline"> read</span>
            </button>
            <button
              onClick={toggleSound}
              aria-pressed={soundOn}
              aria-label={soundOn ? "Mute sound" : "Turn sound on"}
              className="label theatre-only border border-rule px-2.5 py-1.5 text-ink-2 hover:text-ink"
            >
              <span aria-hidden className="inline-flex h-3 items-end gap-[2px] align-middle">
                {[0.5, 1, 0.7, 0.9].map((h, i) => (
                  <span
                    key={i}
                    className="w-[2px] bg-current"
                    style={{
                      height: soundOn ? `${h * 100}%` : "20%",
                      transformOrigin: "bottom",
                      animation: soundOn ? `eq 0.${6 + i}s ease-in-out infinite alternate` : undefined,
                    }}
                  />
                ))}
              </span>
              <span className="sr-only">Sound</span>
            </button>
            <WorldSwitch night={night} />
          </div>
        </div>
      </header>

      {/* ---------------- bottom slug ---------------- */}
      <div className="theatre-only pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6">
        <div className="flex items-end justify-between gap-6">
          <div className="label text-ink-3">
            {night ? (
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-ink">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-t2 shadow-[0_0_8px_var(--t2)]" />
                  LIVE
                </span>
                <span className="hidden sm:inline">
                  DISTRICT {current.code} · {current.label.toUpperCase()}
                </span>
                <span ref={tc} className="tabular-nums">00:00:00:00</span>
              </span>
            ) : (
              <span className="flex items-stretch border border-ink/70 text-ink">
                <span className="border-r border-ink/70 px-2 py-1">
                  SHEET {current.code}/{String(scenes.length).padStart(2, "0")}
                </span>
                <span className="hidden px-2 py-1 sm:inline">{current.label.toUpperCase()} — SITE PLAN</span>
                <span className="hidden border-l border-ink/70 px-2 py-1 md:inline">SCALE 1:500</span>
                <span ref={tc} className="hidden tabular-nums">00:00:00:00</span>
              </span>
            )}
          </div>
          <div className="flex w-[34vw] max-w-[320px] flex-col items-end gap-2">
            {!night && (
              <div className="flex w-32 items-end" aria-hidden>
                {/* scale bar */}
                {[0, 1, 2, 3].map((k) => (
                  <span key={k} className={`h-1.5 flex-1 border border-ink/80 ${k % 2 ? "bg-transparent" : "bg-ink/80"}`} />
                ))}
              </div>
            )}
            <div className="relative h-px w-full bg-rule">
              <div
                ref={bar}
                className={`absolute inset-0 origin-left ${night ? "bg-t2 shadow-[0_0_10px_var(--t2)]" : "bg-ink"}`}
                style={{ transform: "scaleX(0)" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* frame corners: neon brackets ↔ drawing registration marks */}
      <div className="theatre-only pointer-events-none fixed inset-3 z-40 sm:inset-4" aria-hidden>
        {night
          ? ["left-0 top-14 border-l border-t", "right-0 top-14 border-r border-t", "left-0 bottom-12 border-l border-b", "right-0 bottom-12 border-r border-b"].map((c, i) => (
              <span
                key={c}
                className={`absolute h-5 w-5 ${c}`}
                style={{ borderColor: i % 2 ? "var(--t2)" : "var(--t1)", filter: `drop-shadow(0 0 4px ${i % 2 ? "var(--t2)" : "var(--t1)"})` }}
              />
            ))
          : ["left-0 top-14", "right-0 top-14", "left-0 bottom-12", "right-0 bottom-12"].map((c) => (
              <svg key={c} className={`absolute h-5 w-5 text-ink ${c}`} viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="4.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
                <path d="M10 0v20M0 10h20" stroke="currentColor" strokeWidth="0.8" />
              </svg>
            ))}
      </div>
      <style>{`@keyframes eq{from{transform:scaleY(.35)}to{transform:scaleY(1)}}`}</style>
    </>
  );
}

function WorldSwitch({ night }: { night: boolean }) {
  return (
    <button
      onClick={(e) => {
        const b = e.currentTarget.getBoundingClientRect();
        switchWorld({ x: b.left + b.width / 2, y: b.top + b.height / 2 });
      }}
      onMouseEnter={() => sound.play("hover")}
      aria-label={night ? "Switch to the blueprint world (day)" : "Switch to the neon world (night)"}
      className={`label group relative flex items-center gap-2 border px-2.5 py-1.5 text-ink ${night ? "rounded-full border-t2/60 shadow-[0_0_14px_rgb(34_225_255_/_0.35)]" : "border-ink"}`}
    >
      <span aria-hidden className="relative inline-block h-3 w-3">
        {night ? (
          <span className="absolute inset-0 rounded-full border border-ink bg-[repeating-linear-gradient(0deg,var(--ink)_0_1px,transparent_1px_3px)]" />
        ) : (
          <>
            <span className="absolute inset-0 rounded-full bg-[#ff2e88]" />
            <span className="absolute inset-[3px] rounded-full bg-[#22e1ff]" />
          </>
        )}
      </span>
      <span>{night ? "Blueprint" : "Neon"}</span>
    </button>
  );
}
