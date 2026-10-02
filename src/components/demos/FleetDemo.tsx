"use client";

import { useState } from "react";
import { sound } from "@/lib/sound";

type State = "ok" | "fault" | "stale";
type Scenario = "idle" | "divergence" | "batch" | "stale";

const N = 25;
const healthy = () => Array<State>(N).fill("ok");
const pick = (k: number) => {
  const s = new Set<number>();
  while (s.size < k) s.add(Math.floor(Math.random() * N));
  return [...s];
};

const COPY: Record<Scenario, string> = {
  idle: "25 identical machines, each comparing its fault signature with its peers. Pick a scenario.",
  divergence: "One machine diverges from its 24 identical peers → the fleet flags it, and peers learn the signature born-wise.",
  batch: "The same premature signature appears on several machines at once → a systemic batch-defect alarm, not wear.",
  stale: "A node drifts from its training data → self-trust drops → it listens to the fleet but stops teaching it.",
};

/** SYNAPSE's three repo scenarios, played on a 5×5 fleet. */
export function FleetDemo() {
  const [cells, setCells] = useState<State[]>(healthy);
  const [scenario, setScenario] = useState<Scenario>("idle");

  const play = (s: Scenario) => {
    sound.play("tick");
    const next = healthy();
    if (s === "divergence") pick(1).forEach((i) => (next[i] = "fault"));
    if (s === "batch") pick(6).forEach((i) => (next[i] = "fault"));
    if (s === "stale") pick(1).forEach((i) => (next[i] = "stale"));
    setCells(next);
    setScenario(s);
  };

  return (
    <div className="panel p-5 sm:p-6" style={{ ["--panel-accent" as string]: "var(--t1)" }}>
      <div className="label mb-1 text-ink">Try it — fleet scenarios</div>
      <p className="label mb-5 text-ink-3">Simulation of the three scenarios in the repo</p>
      <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="grid grid-cols-5 gap-2" role="img" aria-label={COPY[scenario]}>
          {cells.map((c, i) => (
            <span
              key={i}
              className={`relative block h-9 w-9 border transition-colors duration-500 ${
                c === "fault"
                  ? "border-[var(--t1)] bg-tier-1"
                  : c === "stale"
                    ? "border-dashed border-ink-3 bg-transparent"
                    : "border-rule bg-[color-mix(in_srgb,var(--t2)_35%,transparent)]"
              }`}
            >
              {c === "fault" && <span className="absolute inset-[-5px] animate-ping border border-[var(--t1)]" />}
            </span>
          ))}
        </div>
        <div>
          <p className="min-h-[4.8em] text-[0.95rem] text-ink-2" aria-live="polite">
            {COPY[scenario]}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => play("divergence")} className="chip text-ink hover:bg-ink hover:text-paper">
              Divergence
            </button>
            <button onClick={() => play("batch")} className="chip text-ink hover:bg-ink hover:text-paper">
              Bad batch
            </button>
            <button onClick={() => play("stale")} className="chip text-ink hover:bg-ink hover:text-paper">
              Stale node
            </button>
            {scenario !== "idle" && (
              <button onClick={() => { setCells(healthy()); setScenario("idle"); }} className="chip text-ink-3 hover:text-ink">
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
