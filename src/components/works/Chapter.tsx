"use client";

import Link from "next/link";
import { useRef, ViewTransition } from "react";
import { tiers, type Project } from "@/data/portfolio";
import { FORMATIONS } from "@/lib/formations";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { sound } from "@/lib/sound";
import { useUI } from "@/lib/store";
import { ArchDiagram } from "./ArchDiagram";
import { Demo } from "./Demo";
import { Film } from "./Film";

/**
 * One project = one chapter of the film. The field morphs into the project's
 * object on the right; the left column walks title card → problem → system →
 * proof → hands-on demo. `deep` renders the full case-study version.
 */
export function Chapter({ project, index, deep = false }: { project: Project; index: number; deep?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const digital = useUI((s) => s.world) === "digital";
  const ch = project.chapter!;
  const code = String(index + 1).padStart(2, "0");

  useGSAP(
    () => {
      const title = root.current!.querySelector(".js-name");
      const split = SplitText.create(title, { type: "chars", mask: "chars" });
      gsap.from(split.chars, {
        yPercent: 110,
        rotate: 6,
        stagger: 0.035,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: title, start: "top 85%" },
      });
      gsap.utils.toArray<HTMLElement>(".js-block").forEach((el) =>
        gsap.from(el, {
          y: 50,
          autoAlpha: 0,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 82%" },
        }),
      );
      // metrics scramble in like a readout
      gsap.utils.toArray<HTMLElement>(".js-metric").forEach((el, i) =>
        gsap.from(el, {
          duration: 1.1,
          delay: i * 0.12,
          scrambleText: { text: el.textContent || "", chars: digital ? "0123456789.×→" : "0123456789", speed: 0.5 },
          scrollTrigger: { trigger: el, start: "top 88%" },
        }),
      );
      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <section
      id={project.slug}
      ref={root}
      data-scene={deep ? undefined : "works"}
      data-formation={FORMATIONS.indexOf(ch.formation)}
      className="relative px-4 pb-24 sm:px-6"
    >
      <div className="lg:w-1/2 lg:pr-10">
        {/* ---- title card ---- */}
        <header
          className={`flex flex-col justify-center [:root[data-quick='1']_&]:min-h-0 [:root[data-quick='1']_&]:pb-12 [:root[data-quick='1']_&]:pt-24 ${deep ? "min-h-[85svh] pt-32" : "min-h-[95svh]"}`}
        >
          <div className="label mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-ink-2">
            <span className={`t${project.tier}`}>
              {digital ? `W/${code}` : `Chapter ${code}`}
            </span>
            <span>{project.status}</span>
            <span className="text-ink-3">{tiers[project.tier].name} tier</span>
          </div>
          <ViewTransition name={`title-${project.slug}`} share="title-morph">
            <h2 className="js-name display signal text-[clamp(3.6rem,10vw,9rem)]">{project.name}</h2>
          </ViewTransition>
          <p className="label mt-5 text-ink-2">{project.tagline}</p>
          <p className="display mt-10 max-w-[18ch] text-[clamp(1.7rem,3vw,2.7rem)] text-balance">{ch.thesis}</p>
        </header>

        <div className="space-y-20">
          {/* ---- problem / insight ---- */}
          <div className="js-block grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="label mb-3 t1">The problem</h3>
              <p className="text-ink-2">{ch.problem}</p>
            </div>
            <div>
              <h3 className="label mb-3 t2">The move</h3>
              <p className="text-ink">{ch.insight}</p>
            </div>
          </div>

          {deep && (
            <div className="js-block space-y-6">
              <p className="text-[1.15rem] text-ink">{project.description}</p>
              <ul className="space-y-3">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-ink-2">
                    <span aria-hidden className={`mt-2.5 inline-block h-1.5 w-1.5 shrink-0 bg-tier-${project.tier}`} />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ---- the system ---- */}
          <div className="js-block lg:w-[min(64vw,1060px)]">
            <h3 className="label mb-4 text-ink-2">How it works</h3>
            <ArchDiagram arch={ch.architecture} id={project.slug} />
          </div>

          {/* ---- proof ---- */}
          <dl className="js-block grid grid-cols-1 gap-px border border-rule bg-rule sm:grid-cols-3">
            {ch.metrics.map((m, i) => (
              <div key={m.label} className="bg-paper p-5">
                <dd className={`js-metric display text-[clamp(1.6rem,2.6vw,2.3rem)] t${(i % 3) + 1}`}>{m.value}</dd>
                <dt className="label mt-2 text-ink-2">{m.label}</dt>
                {m.note && <p className="label mt-1 normal-case tracking-normal text-ink-3">{m.note}</p>}
              </div>
            ))}
          </dl>

          {/* ---- hands on ---- */}
          <div className="js-block">
            <Demo kind={ch.demo} />
          </div>

          {ch.film && (
            <div className="js-block">
              <Film src={ch.film.src} poster={ch.film.poster} title={`${project.name} — trailer`} />
            </div>
          )}

          {/* ---- stack + links ---- */}
          <div className="js-block space-y-6">
            <ul className="flex flex-wrap gap-2" aria-label="Stack">
              {project.stack.map((s) => (
                <li key={s} className="chip text-ink-2">
                  {s}
                </li>
              ))}
            </ul>
            <p className="label text-ink-3">{project.role}</p>
            <div className="flex flex-wrap gap-3">
              {!deep && (
                <Link href={`/work/${project.slug}`} className="btn primary" onClick={() => sound.play("tick")}>
                  Open the case study <span aria-hidden>→</span>
                </Link>
              )}
              {project.links?.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="btn">
                  {l.label} <span aria-hidden>↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
