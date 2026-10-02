"use client";

import { useRef, useState } from "react";
import { sound } from "@/lib/sound";

type Action = {
  id: number;
  text: string;
  money: boolean;
  note: string;
};

const ACTIONS: Action[] = [
  { id: 1, text: "Reconcile 42 bank lines against the ledger", money: false, note: "critic: totals match, TDS split correct" },
  { id: 2, text: "Chase invoice — 52 days overdue (MSME 45-day rule)", money: true, note: "external email → needs a human" },
  { id: 3, text: "Categorise 18 new expenses", money: false, note: "critic: consistent with prior periods" },
  { id: 4, text: "Pay vendor ₹38,000 before due date", money: true, note: "moves money → needs a human" },
];
const STAGES = ["Planner", "Executor", "Critic", "Gate", "Done"] as const;

type Item = Action & { at: number; verdict?: "approved" | "rejected" };

/** FinDesk's maker-checker: agents do the work; anything that touches money stops at the gate. */
export function ApprovalDemo() {
  const [items, setItems] = useState<Item[]>(ACTIONS.map((a) => ({ ...a, at: -1 })));
  const [running, setRunning] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const run = () => {
    timers.current.forEach(clearTimeout);
    setItems(ACTIONS.map((a) => ({ ...a, at: 0 })));
    setRunning(true);
    sound.play("tick");
    for (let step = 1; step <= 4; step++) {
      timers.current.push(
        setTimeout(() => {
          setItems((its) =>
            its.map((it) => {
              if (it.verdict) return it;
              // gated actions park at the Gate (3); safe ones go straight through
              const next = Math.min(step, it.money ? 3 : 4);
              return { ...it, at: next };
            }),
          );
          sound.play("hover");
          if (step === 4) setRunning(false);
        }, step * 650),
      );
    }
  };

  const decide = (id: number, verdict: "approved" | "rejected") => {
    sound.play("tick");
    setItems((its) => its.map((it) => (it.id === id ? { ...it, at: 4, verdict } : it)));
  };

  return (
    <div className="panel p-5 sm:p-6" style={{ ["--panel-accent" as string]: "var(--t3)" }}>
      <div className="label mb-1 flex items-center justify-between gap-4">
        <span className="text-ink">Try it — the approval gate</span>
        <button onClick={run} disabled={running} className="btn !px-3 !py-1.5 disabled:opacity-50">
          {items.some((i) => i.at >= 0) ? "Run again" : "Run agents"}
        </button>
      </div>
      <p className="label mb-5 text-ink-3">Planner → Executor → Critic → Gate · illustrative data</p>

      <ol className="mb-4 grid grid-cols-5 gap-1 text-center" aria-hidden>
        {STAGES.map((s, i) => (
          <li key={s} className={`label border-b-2 pb-1.5 ${i === 3 ? "border-[var(--t3)] text-ink" : "border-rule text-ink-3"}`}>
            {s}
          </li>
        ))}
      </ol>

      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.id}>
            <div className="relative h-1.5 bg-rule">
              <span
                className={`absolute inset-y-0 left-0 transition-[width] duration-500 ease-out ${it.money ? "bg-tier-1" : "bg-tier-2"}`}
                style={{ width: it.at < 0 ? "0%" : `${((it.at + 1) / 5) * 100}%` }}
              />
            </div>
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[0.92rem] text-ink">{it.text}</span>
              {it.at === 3 && !it.verdict ? (
                <span className="flex gap-2">
                  <button onClick={() => decide(it.id, "approved")} className="chip text-ink hover:bg-ink hover:text-paper">
                    Approve
                  </button>
                  <button onClick={() => decide(it.id, "rejected")} className="chip text-ink-2 hover:text-ink">
                    Reject
                  </button>
                </span>
              ) : (
                <span className="label text-ink-3">
                  {it.verdict ? it.verdict : it.at === 4 ? "done" : it.at >= 0 ? STAGES[it.at].toLowerCase() : "queued"}
                </span>
              )}
            </div>
            {it.at >= 2 && <p className="label mt-1 text-ink-3">{it.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
