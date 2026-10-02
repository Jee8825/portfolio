"use client";

import { useRef } from "react";
import { log } from "@/data/portfolio";
import { gsap, useGSAP } from "@/lib/gsap";
import { useUI } from "@/lib/store";
import { SceneHead } from "@/components/ui/SceneHead";

/** 05 LOG — the memory trace: entries travel along the helix as you scroll. */
export function Log() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const quick = useUI((s) => s.quick);
  const night = useUI((s) => s.world) === "neon";

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        if (quick) return;
        const el = track.current!;
        const dist = () => el.scrollWidth - innerWidth + 48;
        gsap.to(el, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: ".js-pin",
            start: "top top",
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
      });
      gsap.from(".js-entry", {
        autoAlpha: 0,
        y: 30,
        stagger: 0.08,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: track.current, start: "top 85%" },
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [quick], revertOnUpdate: true },
  );

  return (
    <section id="log" ref={root} data-scene="log" data-formation="8" className="relative pt-32 lg:pt-48">
      <div className="px-4 sm:px-6">
        <SceneHead code="05" label="Log" kicker="experience" title="The trace so far." className="max-w-3xl" />
      </div>
      <div className="js-pin flex min-h-[100svh] items-center overflow-hidden py-16">
        <ol ref={track} className="flex flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:gap-8 lg:pr-[30vw]">
          {log.map((e, i) => (
            <li
              key={e.title}
              className="js-entry panel flex w-full shrink-0 flex-col p-6 sm:p-8 lg:w-[30rem]"
              style={{ ["--panel-accent" as string]: `var(--t${e.tier})` }}
            >
              <div className="label mb-6 flex items-center justify-between text-ink-3">
                <span className={`t${e.tier}`}>
                  {night ? `0x${(i + 1).toString(16).padStart(2, "0").toUpperCase()}` : `No. ${i + 1}`} · {e.kind}
                </span>
                <span>{e.when}</span>
              </div>
              <h3 className="display text-[clamp(1.6rem,2.4vw,2.2rem)]">{e.title}</h3>
              <p className="label mt-3 text-ink-2">{e.org}</p>
              <p className="mt-5 text-ink-2">{e.body}</p>
              {e.tags && (
                <ul className="mt-auto flex flex-wrap gap-2 pt-6">
                  {e.tags.map((t) => (
                    <li key={t} className="chip text-ink-2">
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
