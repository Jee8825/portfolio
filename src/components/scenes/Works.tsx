"use client";

import { useRef } from "react";
import { projects } from "@/data/portfolio";
import { gsap, useGSAP } from "@/lib/gsap";
import { SceneHead } from "@/components/ui/SceneHead";
import { Chapter } from "@/components/works/Chapter";

/** 04 WORKS — four featured chapters, then the rest of the shelf. */
export function Works() {
  const root = useRef<HTMLDivElement>(null);
  const featured = projects.filter((p) => p.featured && p.chapter);
  const rest = projects.filter((p) => !p.featured || !p.chapter);

  useGSAP(
    () => {
      gsap.from(".js-shelf > li", {
        y: 24,
        autoAlpha: 0,
        stagger: 0.07,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: ".js-shelf", start: "top 85%" },
      });
    },
    { scope: root },
  );

  return (
    <div id="works" ref={root} className="relative">
      <div className="px-4 pb-8 pt-32 sm:px-6 lg:pt-48">
        <SceneHead
          code="04"
          label="Works"
          kicker={`${featured.length} chapters`}
          title="Four systems, each built around trust."
          className="max-w-4xl"
        />
        <ol className="label mt-10 flex flex-wrap gap-x-6 gap-y-2 text-ink-3">
          {featured.map((p, i) => (
            <li key={p.slug}>
              <a href={`#${p.slug}`} className="hover:text-ink">
                <span className={`t${p.tier}`}>{String(i + 1).padStart(2, "0")}</span> {p.name}
              </a>
            </li>
          ))}
        </ol>
      </div>

      {featured.map((p, i) => (
        <Chapter key={p.slug} project={p} index={i} />
      ))}

      <div className="px-4 pb-16 sm:px-6">
        <h3 className="label mb-6 text-ink-2">Also built</h3>
        <ul className="js-shelf border-t border-rule">
          {rest.map((p) => {
            const href = p.links?.[0]?.href;
            const Row = href ? "a" : "div";
            return (
              <li key={p.slug} className="border-b border-rule">
                <Row
                  {...(href ? { href, target: "_blank", rel: "noreferrer" } : {})}
                  className="group grid items-baseline gap-2 py-6 sm:grid-cols-12 sm:gap-6"
                >
                  <span className="display text-3xl transition-transform duration-500 group-hover:translate-x-2 sm:col-span-4">
                    {p.name}
                  </span>
                  <span className="text-ink-2 sm:col-span-5">{p.tagline} — {p.description.split(". ")[0]}.</span>
                  <span className="label flex items-center justify-between gap-3 text-ink-3 sm:col-span-3">
                    <span className={`t${p.tier}`}>{p.status}</span>
                    {href && <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span>}
                  </span>
                </Row>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
