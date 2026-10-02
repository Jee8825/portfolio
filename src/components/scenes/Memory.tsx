"use client";

import { useRef } from "react";
import { about, profile, tiers } from "@/data/portfolio";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { stage } from "@/lib/store";
import { SceneHead } from "@/components/ui/SceneHead";
import { Portrait } from "@/components/ui/Portrait";

/** 02 MEMORY — who I am, told through Recall's three tiers. Each tier lights its stratum in the field. */
export function Memory() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const blocks = gsap.utils.toArray<HTMLElement>(".js-tier");
      blocks.forEach((el) => {
        const tier = Number(el.dataset.tier);
        ScrollTrigger.create({
          trigger: el,
          start: "top 60%",
          end: "bottom 40%",
          onToggle: (self) => {
            if (self.isActive) stage.focus = tier;
            else if (stage.focus === tier) stage.focus = 0;
          },
        });
        gsap.from(el.querySelectorAll(".js-in"), {
          y: 40,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 75%" },
        });
        // strength bar decays as the block scrolls away (episodic fades fastest)
        gsap.fromTo(
          el.querySelector(".js-strength"),
          { scaleX: 1 },
          {
            scaleX: tier === 1 ? 0.18 : tier === 2 ? 0.62 : 0.94,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 40%", end: "bottom top", scrub: true },
          },
        );
      });
      gsap.from(".js-stat", {
        y: 30,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: ".js-stats", start: "top 85%" },
      });
    },
    { scope: root },
  );

  return (
    <section
      id="memory"
      ref={root}
      data-scene="memory"
      data-formation="2"
      className="relative px-4 py-32 sm:px-6 lg:py-48"
    >
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SceneHead code="02" label="Memory" kicker="about" title={about.intro} />

          <div className="mt-16 grid grid-cols-[auto_1fr] items-start gap-6">
            <Portrait src={profile.portrait} name={profile.name} />
            <div className="label space-y-1 pt-1 text-ink-2">
              <p className="text-ink">{profile.name}</p>
              <p>{profile.degree}</p>
              <p>{profile.college}</p>
              <p>{profile.location}</p>
            </div>
          </div>

          <div className="mt-24 space-y-[28vh] pb-[10vh] [:root[data-quick='1']_&]:space-y-6 [:root[data-quick='1']_&]:pb-0">
            {about.tiers.map((t) => {
              const meta = tiers[t.tier];
              return (
                <article
                  key={t.tier}
                  data-tier={t.tier}
                  className="js-tier panel p-6 sm:p-8"
                  style={{ ["--panel-accent" as string]: `var(--t${t.tier})` }}
                >
                  <div className="js-in label mb-5 flex items-center justify-between gap-4">
                    <span className={`t${t.tier}`}>
                      T{t.tier} · {meta.name}
                    </span>
                    <span className="text-ink-3">{meta.note}</span>
                  </div>
                  <h3 className="js-in display text-[clamp(1.8rem,3vw,2.6rem)]">{t.title}</h3>
                  <p className="js-in mt-4 max-w-prose text-ink-2">{t.body}</p>
                  <div className="js-in mt-6 flex items-center gap-3">
                    <span className="label text-ink-3">strength</span>
                    <span className="relative h-1 flex-1 bg-rule">
                      <span className={`js-strength absolute inset-0 origin-left bg-tier-${t.tier}`} />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <dl className="js-stats mt-16 grid grid-cols-2 gap-px border border-rule bg-rule lg:grid-cols-4">
        {about.stats.map((s, i) => (
          <div key={s.label} className="js-stat bg-paper p-6 sm:p-8">
            <dt className="label text-ink-3">{s.label}</dt>
            <dd className={`display mt-3 text-[clamp(1.8rem,3.4vw,3rem)] t${(i % 3) + 1}`}>{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
