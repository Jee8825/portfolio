"use client";

import { useEffect, useState } from "react";
import { tiers, type Tier } from "@/data/portfolio";
import { sound } from "@/lib/sound";
import { useInView } from "./useInView";

type Mem = { id: number; text: string; tier: Tier; s: number; hit: number };

const SEED: Omit<Mem, "s" | "hit">[] = [
  { id: 1, text: "Asked about pgvector index types", tier: 1 },
  { id: 2, text: "Opened the billing page twice today", tier: 1 },
  { id: 3, text: "Deploys the backend on AWS with kubectl", tier: 2 },
  { id: 4, text: "Team uses Postgres 16", tier: 2 },
  { id: 5, text: "Release = tag → CI → canary → promote", tier: 3 },
];
// accelerated decay rates per tier (per second of demo time)
const LAMBDA: Record<Tier, number> = { 1: 0.22, 2: 0.07, 3: 0.012 };
const FLOOR = 0.12;

const fresh = () => SEED.map((m) => ({ ...m, s: 1, hit: 0 }));

/** Recall's decay curve, live: S(t) = S₀·e^(−λt). Retrieve a memory to reinforce it. */
export function DecayDemo() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [mems, setMems] = useState<Mem[]>(fresh);

  useEffect(() => {
    if (!inView) return;
    const dt = 0.1;
    const id = setInterval(() => {
      setMems((ms) =>
        ms.map((m) => (m.s < FLOOR ? m : { ...m, s: m.s * Math.exp(-LAMBDA[m.tier] * dt) })),
      );
    }, dt * 1000);
    return () => clearInterval(id);
  }, [inView]);

  const retrieve = (id: number) => {
    sound.play("tick");
    setMems((ms) => ms.map((m) => (m.id === id && m.s >= FLOOR ? { ...m, s: Math.min(1, m.s + 0.45), hit: m.hit + 1 } : m)));
  };

  return (
    <div ref={ref} className="panel p-5 sm:p-6" style={{ ["--panel-accent" as string]: "var(--t1)" }}>
      <div className="label mb-1 flex items-center justify-between gap-4">
        <span className="text-ink">Try it — memory decay</span>
        <button onClick={() => setMems(fresh())} className="text-ink-3 underline-offset-4 hover:text-ink hover:underline">
          Reset
        </button>
      </div>
      <p className="label mb-5 text-ink-3">S(t) = S₀·e^(−λt) · click a memory to retrieve it · time is sped up</p>
      <ul className="space-y-2.5">
        {mems.map((m) => {
          const dead = m.s < FLOOR;
          return (
            <li key={m.id}>
              <button
                onClick={() => retrieve(m.id)}
                disabled={dead}
                className="group w-full text-left disabled:cursor-not-allowed"
                aria-label={`${m.text} — strength ${Math.round(m.s * 100)}%${dead ? ", forgotten" : ". Retrieve to reinforce."}`}
              >
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className={`text-[0.95rem] ${dead ? "text-ink-3 line-through" : "text-ink group-hover:underline"}`}>
                    {m.text}
                  </span>
                  <span className={`label shrink-0 t${m.tier}`}>
                    {dead ? "tombstoned" : `${tiers[m.tier].short} ${Math.round(m.s * 100)}`}
                  </span>
                </div>
                <span className="relative block h-1.5 bg-rule">
                  <span
                    className={`absolute inset-y-0 left-0 bg-tier-${m.tier} transition-[width] duration-100 ease-linear`}
                    style={{ width: `${m.s * 100}%`, opacity: dead ? 0.25 : 1 }}
                  />
                  <span className="absolute inset-y-[-3px] w-px bg-ink-3" style={{ left: `${FLOOR * 100}%` }} aria-hidden />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="label mt-5 text-ink-3">Illustrative memories · threshold line = forget</p>
    </div>
  );
}
