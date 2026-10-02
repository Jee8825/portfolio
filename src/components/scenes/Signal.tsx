"use client";

import { useRef } from "react";
import { profile, socials } from "@/data/portfolio";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useUI } from "@/lib/store";
import { SocialIcon } from "@/components/ui/SocialIcon";

/** 01 SIGNAL — the network assembles the name; the thesis types in underneath. */
export function Signal() {
  const root = useRef<HTMLElement>(null);
  const booted = useUI((s) => s.booted);

  useGSAP(
    () => {
      if (!booted) return;
      const split = SplitText.create(".js-headline", { type: "lines,words", mask: "lines" });
      // the sign ignites tube by tube, with a couple of stutters
      const sign = SplitText.create(".js-sign", { type: "chars" });
      sign.chars.forEach((c, i) => {
        gsap.fromTo(
          c,
          { opacity: 0.08 },
          {
            keyframes: { opacity: [0.08, 1, 0.2, 1, 0.5, 1] },
            duration: 0.9,
            delay: 0.05 + ((i * 7) % 10) * 0.07,
            ease: "steps(6)",
          },
        );
      });
      gsap
        .timeline({ delay: 0.15 })
        .from(split.words, { yPercent: 110, duration: 1.1, stagger: 0.035, ease: "expo.out" })
        .from(".js-fade", { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.08 }, 0.35);

      // the copy drifts up and away as the name dissolves into MEMORY
      gsap.to(".js-hero-copy", {
        yPercent: -30,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom 30%", scrub: true },
      });
      return () => {
        split.revert();
        sign.revert();
      };
    },
    { scope: root, dependencies: [booted] },
  );

  return (
    <section
      id="signal"
      ref={root}
      data-scene="signal"
      data-formation="1"
      className="relative flex min-h-[100svh] flex-col justify-end px-4 pb-20 pt-28 sm:px-6 sm:pb-24"
    >
      {/* the name, as a sign over the skyline */}
      <h1 className="js-sign display signal sign pointer-events-none absolute inset-x-4 top-[22%] text-center text-[clamp(2.6rem,10.5vw,10.5rem)] uppercase sm:top-[24%]">
        {profile.name}
        <span className="sr-only"> — {profile.role}</span>
      </h1>

      <div className="js-hero-copy grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="scrim lg:col-span-7">
          <p className="js-fade label mb-5 flex items-center gap-2 text-ink-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-t1" />
            <span data-scramble={profile.role.toUpperCase()}>{profile.role.toUpperCase()}</span>
          </p>
          <p
            className={`js-headline display max-w-[19ch] text-balance text-[clamp(2.2rem,5.2vw,4.6rem)] ${invisibleUntil(booted)}`}
          >
            {profile.headline}
          </p>
        </div>
        <div className="scrim space-y-6 lg:col-span-4 lg:col-start-9">
          <p className={`js-fade max-w-md text-ink-2 ${invisibleUntil(booted)}`}>{profile.subheadline}</p>
          <div className={`js-fade flex flex-wrap items-center gap-3 ${invisibleUntil(booted)}`}>
            <a href="#works" className="btn primary">
              See the work <span aria-hidden>↓</span>
            </a>
            <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="btn">
              Résumé <span aria-hidden>↗</span>
            </a>
          </div>
          <div className={`js-fade flex items-center gap-4 ${invisibleUntil(booted)}`}>
            {profile.available && (
              <span className="chip whitespace-normal">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-t3" />
                {profile.availabilityText}
              </span>
            )}
          </div>
          <ul className={`js-fade flex gap-4 text-ink-2 ${invisibleUntil(booted)}`}>
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="hover:text-ink">
                  <SocialIcon icon={s.icon} className="h-5 w-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* Before boot finishes the copy stays hidden so the name lands first (quick-read shows it). */
function invisibleUntil(booted: boolean) {
  return booted ? "" : "opacity-0 [:root[data-quick='1']_&]:opacity-100";
}
