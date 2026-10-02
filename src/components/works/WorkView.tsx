"use client";

import Link from "next/link";
import { useEffect } from "react";
import { projects } from "@/data/portfolio";
import { Director, getLenis } from "@/components/engine/Engine";
import { ScrollTrigger } from "@/lib/gsap";
import { stage, ui } from "@/lib/store";
import { Chapter } from "./Chapter";

const featured = projects.filter((p) => p.featured && p.chapter);

/** A project's own room: the full chapter, then a door to the next one. */
export function WorkView({ slug }: { slug: string }) {
  const index = featured.findIndex((p) => p.slug === slug);
  const project = featured[index];
  const next = featured[(index + 1) % featured.length];

  useEffect(() => {
    stage.boot = 1;
    ui.set({ booted: true, sceneId: "works" });
    getLenis()?.scrollTo(0, { immediate: true });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [slug]);

  return (
    <>
      <main id="main" className="relative z-10">
        <nav className="label px-4 pt-24 sm:px-6" aria-label="Breadcrumb">
          <Link href={`/#${project.slug}`} className="text-ink-2 hover:text-ink">
            ← All works
          </Link>
        </nav>
        <Chapter project={project} index={index} deep />
        <Link
          href={`/work/${next.slug}`}
          className="group block border-t border-rule px-4 py-20 sm:px-6"
          aria-label={`Next case study: ${next.name}`}
        >
          <span className="label text-ink-3">Next chapter</span>
          <span className="display mt-4 block text-[clamp(3rem,9vw,8rem)] transition-transform duration-700 group-hover:translate-x-4">
            {next.name} <span aria-hidden>→</span>
          </span>
          <span className="label mt-3 block text-ink-2">{next.tagline}</span>
        </Link>
      </main>
      <Director key={slug} />
    </>
  );
}
