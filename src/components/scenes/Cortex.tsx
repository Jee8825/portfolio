"use client";

import { useEffect, useRef } from "react";
import { skillGroups, tiers } from "@/data/portfolio";
import { FORMATIONS } from "@/lib/formations";
import { DISTRICTS } from "@/lib/city";
import { gsap, useGSAP } from "@/lib/gsap";
import { stage } from "@/lib/store";
import { SceneHead } from "@/components/ui/SceneHead";

const CORTEX = FORMATIONS.indexOf("cortex");

/** 03 CORTEX — skills as the city's highways: each skill group is a road, labelled live. */
export function Cortex() {
  const root = useRef<HTMLElement>(null);
  const tags = useRef<(HTMLDivElement | null)[]>([]);

  /* labels follow the projected cluster centres every frame */
  useEffect(() => {
    const tick = () => {
      const near = Math.max(0, 1 - Math.abs(stage.scene - CORTEX) * 1.6);
      tags.current.forEach((el, i) => {
        // anchors: [hub, ...districts, ...highways] — skills label their highway
        const a = stage.anchors[1 + DISTRICTS.length + i];
        if (!el || !a) return;
        const front = a.z > 0 ? 1 : 0;
        el.style.transform = `translate3d(${a.x}px, ${a.y}px, 0) translate(-50%, -50%)`;
        el.style.opacity = String(near * front);
        el.style.zIndex = a.z > 0 ? "2" : "1";
      });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  useGSAP(
    () => {
      gsap.from(".js-group", {
        y: 40,
        autoAlpha: 0,
        stagger: 0.07,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: ".js-index", start: "top 80%" },
      });
    },
    { scope: root },
  );

  return (
    <section
      id="cortex"
      ref={root}
      data-scene="cortex"
      data-formation="3"
      className="relative px-4 pt-32 sm:px-6 lg:pt-48"
    >
      <SceneHead
        code="03"
        label="Cortex"
        kicker="skills"
        title={<>Six highways. One city.</>}
        className="max-w-3xl"
      />

      {/* stage window: the field is the illustration; labels ride on its clusters */}
      <div className="theatre-only pointer-events-none fixed inset-0 z-20" aria-hidden>
        {skillGroups.map((g, i) => (
          <div
            key={g.title}
            ref={(el) => {
              tags.current[i] = el;
            }}
            className="absolute left-0 top-0 opacity-0 will-change-transform"
          >
            <div className="label flex items-center gap-2 whitespace-nowrap bg-paper/70 px-2 py-1 backdrop-blur-sm">
              <span className={`inline-block h-2 w-2 bg-tier-${g.tier}`} />
              <span className="text-ink">{g.title}</span>
              <span className="text-ink-3">{g.skills.length}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="theatre-only h-[110vh]" aria-hidden />
      <div className="hidden h-12 [:root[data-quick='1']_&]:block" aria-hidden />

      {/* the readable index */}
      <div className="js-index grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((g) => (
          <article key={g.title} className="js-group bg-paper p-6 sm:p-8">
            <header className="mb-5 flex items-baseline justify-between gap-4">
              <h3 className="display text-2xl">{g.title}</h3>
              <span className={`label t${g.tier}`}>{tiers[g.tier].short}</span>
            </header>
            <ul className="flex flex-wrap gap-2">
              {g.skills.map((s) => (
                <li key={s} className="chip text-ink-2">
                  {s}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
