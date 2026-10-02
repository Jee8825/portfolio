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
  if (!el) return;
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
  const digital = world === "digital";
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
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <button
            onClick={() => go("signal")}
            className="label group flex flex-col items-start text-left"
            aria-label="Back to top"
          >
            <span className="text-[0.8rem] tracking-[0.2em] text-ink">{profile.name.toUpperCase()}</span>
            <span className="text-ink-3">{digital ? "SYS://AI-DS-ENGINEER" : "AI & DATA SCIENCE — PRINT ED."}</span>
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
              Quick read
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
            <WorldSwitch digital={digital} />
          </div>
        </div>
      </header>

      {/* ---------------- bottom slug ---------------- */}
      <div className="theatre-only pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6">
        <div className="flex items-end justify-between gap-6">
          <div className="label text-ink-3">
            {digital ? (
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-ink">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-t1" />
                  REC
                </span>
                <span ref={tc} className="tabular-nums">00:00:00:00</span>
                <span className="hidden sm:inline">
                  SCN {current.code} / {current.label.toUpperCase()}
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <span className="text-ink">
                  PLATE {current.code} / {String(scenes.length).padStart(2, "0")}
                </span>
                <span className="hidden sm:inline">{current.label.toUpperCase()}</span>
                <span ref={tc} className="hidden tabular-nums">00:00:00:00</span>
              </span>
            )}
          </div>
          <div className="flex w-[34vw] max-w-[320px] flex-col items-end gap-2">
            {!digital && (
              <div className="flex gap-[3px]" aria-hidden>
                {["var(--ink)", "var(--t1)", "var(--t2)", "var(--t3)"].map((c) => (
                  <span key={c} className="h-2.5 w-4" style={{ background: c }} />
                ))}
              </div>
            )}
            <div className="relative h-px w-full bg-rule">
              <div ref={bar} className="absolute inset-0 origin-left bg-ink" style={{ transform: "scaleX(0)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* frame corners: HUD brackets ↔ crop marks */}
      <div className="theatre-only pointer-events-none fixed inset-3 z-40 sm:inset-4" aria-hidden>
        {digital
          ? ["left-0 top-14 border-l border-t", "right-0 top-14 border-r border-t", "left-0 bottom-12 border-l border-b", "right-0 bottom-12 border-r border-b"].map((c) => (
              <span key={c} className={`absolute h-4 w-4 border-ink-3/60 ${c}`} />
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

function WorldSwitch({ digital }: { digital: boolean }) {
  return (
    <button
      onClick={(e) => {
        const b = e.currentTarget.getBoundingClientRect();
        switchWorld({ x: b.left + b.width / 2, y: b.top + b.height / 2 });
      }}
      onMouseEnter={() => sound.play("hover")}
      aria-label={digital ? "Switch to the analog world (light)" : "Switch to the digital world (dark)"}
      className="label group relative flex items-center gap-2 border border-ink px-2.5 py-1.5 text-ink"
    >
      <span aria-hidden className="relative inline-block h-3 w-3">
        {digital ? (
          <>
            <span className="absolute inset-0 translate-x-[1px] rounded-full bg-t1 mix-blend-screen" />
            <span className="absolute inset-0 -translate-x-[1px] rounded-full bg-t2 mix-blend-screen" />
          </>
        ) : (
          <span className="absolute inset-0 border border-ink bg-[repeating-linear-gradient(0deg,var(--ink)_0_1px,transparent_1px_3px)]" />
        )}
      </span>
      <span>{digital ? "Analog" : "Digital"}</span>
    </button>
  );
}
