"use client";

import { useRef, useState } from "react";
import { profile, socials } from "@/data/portfolio";
import { gsap, useGSAP } from "@/lib/gsap";
import { sound } from "@/lib/sound";
import { stage, useUI } from "@/lib/store";
import { SceneHead } from "@/components/ui/SceneHead";
import { SocialIcon } from "@/components/ui/SocialIcon";

function fire() {
  sound.play("pulse");
  gsap.fromTo(stage, { pulse: 0 }, { pulse: 1, duration: 1.6, ease: "power2.out", onComplete: () => void (stage.pulse = 0) });
}

/** 06 TRANSMIT — contact. Every way to reach me fires a shockwave through the network. */
export function Transmit() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const night = useUI((s) => s.world) === "neon";

  useGSAP(
    () => {
      gsap.from(".js-tx", {
        y: 40,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 55%", onEnter: fire },
      });
    },
    { scope: root },
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      fire();
      setTimeout(() => setCopied(false), 2200);
    } catch {
      location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section
      id="transmit"
      ref={root}
      data-scene="transmit"
      data-formation="9"
      className="relative flex min-h-[100svh] flex-col justify-between px-4 pb-10 pt-40 sm:px-6"
    >
      <div className="mx-auto w-full max-w-5xl text-center">
        <SceneHead code="06" label="Transmit" kicker="contact" title="Send a signal." className="[&_.label]:justify-center" />
        <p className="js-tx mx-auto mt-8 max-w-xl text-ink-2">
          {profile.availabilityText}. If you&apos;re building agents that need to remember, reason or be trusted with
          real decisions, I&apos;d like to hear about it.
        </p>

        <div className="js-tx mt-12 flex flex-col items-center gap-4">
          <a
            href={`mailto:${profile.email}`}
            onClick={fire}
            className="display break-all text-[clamp(1.1rem,3vw,2.4rem)] underline decoration-rule decoration-1 underline-offset-[0.3em] transition-colors hover:decoration-[var(--t1)]"
          >
            {profile.email}
          </a>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={copy} className="btn primary" aria-live="polite">
              {copied ? "Copied" : "Copy email"}
            </button>
            <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="btn">
              Résumé <span aria-hidden>↗</span>
            </a>
          </div>
        </div>

        <ul className="js-tx mt-12 flex flex-wrap justify-center gap-3">
          {socials
            .filter((s) => s.icon !== "mail")
            .map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={fire}
                  onMouseEnter={() => sound.play("hover")}
                  className="chip gap-2 px-3 py-2 text-ink-2 hover:text-ink"
                >
                  <SocialIcon icon={s.icon} className="h-4 w-4" />
                  {s.label}
                </a>
              </li>
            ))}
        </ul>
      </div>

      <footer className="label mt-24 flex flex-col items-center justify-between gap-3 text-ink-3 sm:flex-row">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>{night ? "Rendered live — Next.js · Three.js · GSAP" : "Printed live — Next.js · Three.js · GSAP"}</span>
      </footer>
    </section>
  );
}
