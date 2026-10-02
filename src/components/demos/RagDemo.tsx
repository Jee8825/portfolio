"use client";

import { useRef, useState } from "react";
import { sound } from "@/lib/sound";

const LANGS = ["English", "हिन्दी", "தமிழ்"] as const;
type Lang = (typeof LANGS)[number];

const STEPS = [
  { key: "voice", label: "Speech → text", by: "Sarvam AI", tier: 1 },
  { key: "embed", label: "Embed question", by: "Titan", tier: 2 },
  { key: "retrieve", label: "Retrieve context", by: "knowledge base", tier: 2 },
  { key: "generate", label: "Grounded answer", by: "Llama 3 · Bedrock", tier: 3 },
  { key: "loop", label: "Update difficulty", by: "feedback loop", tier: 3 },
] as const;

const CHUNKS = ["Loops · termination conditions", "Your last attempt: while i < n:", "Common bug: counter never updated"];

/** Cognitia's pipeline: a learner's question, grounded in their own progress, answered in their language. */
export function RagDemo() {
  const [lang, setLang] = useState<Lang>("English");
  const [step, setStep] = useState(-1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const ask = () => {
    timers.current.forEach(clearTimeout);
    sound.play("tick");
    setStep(0);
    for (let i = 1; i <= STEPS.length; i++) {
      timers.current.push(setTimeout(() => (setStep(i), sound.play("hover")), i * 600));
    }
  };
  const done = step >= STEPS.length;

  return (
    <div className="panel p-5 sm:p-6" style={{ ["--panel-accent" as string]: "var(--t2)" }}>
      <div className="label mb-1 text-ink">Try it — ask the mentor</div>
      <p className="label mb-5 text-ink-3">Walkthrough of the pipeline · illustrative</p>

      <div className="mb-4 flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Language">
        {LANGS.map((l) => (
          <button
            key={l}
            role="radio"
            aria-checked={lang === l}
            onClick={() => setLang(l)}
            className={`chip ${lang === l ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 border border-rule p-3">
        <span className="flex-1 text-[0.95rem] text-ink">&ldquo;Why does my loop never end?&rdquo;</span>
        <button onClick={ask} className="btn !px-3 !py-1.5">
          Ask
        </button>
      </div>

      <ol className="mt-4 space-y-1.5">
        {STEPS.map((s, i) => {
          const skipped = s.key === "voice" && lang === "English";
          const state = step > i ? "done" : step === i ? "active" : "idle";
          return (
            <li key={s.key} className={`label flex items-center gap-3 ${state === "idle" ? "text-ink-3" : "text-ink"}`}>
              <span className={`inline-block h-2 w-2 ${state === "idle" ? "bg-rule" : `bg-tier-${s.tier}`} ${state === "active" ? "animate-pulse" : ""}`} />
              <span className={skipped && state !== "idle" ? "line-through opacity-60" : ""}>{s.label}</span>
              <span className="text-ink-3">· {skipped ? "typed, skipped" : s.by}</span>
            </li>
          );
        })}
      </ol>

      {step >= 3 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Retrieved context">
          {CHUNKS.map((c) => (
            <li key={c} className="chip text-ink-2">
              {c}
            </li>
          ))}
        </ul>
      )}
      {done && (
        <p className="mt-4 border-l-2 border-[var(--t3)] pl-3 text-[0.95rem] text-ink" aria-live="polite">
          Your loop checks <code className="mono">i &lt; n</code> but never changes <code className="mono">i</code>, so the
          condition stays true. Add <code className="mono">i += 1</code> inside the loop.
          {lang !== "English" && <span className="label mt-2 block text-ink-3">Reply spoken back in {lang}</span>}
        </p>
      )}
    </div>
  );
}
