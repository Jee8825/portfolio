"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useUI } from "@/lib/store";

/** Film slate for each scene: "02 / MEMORY" + a display title that sets in line by line. */
export function SceneHead({
  code,
  label,
  title,
  kicker,
  className = "",
}: {
  code: string;
  label: string;
  title: React.ReactNode;
  kicker?: string;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const night = useUI((s) => s.world) === "neon";

  useGSAP(
    () => {
      const split = SplitText.create(root.current!.querySelector(".js-title"), {
        type: "lines,words",
        mask: "lines",
      });
      gsap.from(split.words, {
        yPercent: 105,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.03,
        scrollTrigger: { trigger: root.current, start: "top 82%" },
      });
      gsap.from(root.current!.querySelector(".js-rule"), {
        scaleX: 0,
        transformOrigin: "left",
        duration: 1.4,
        ease: "expo.inOut",
        scrollTrigger: { trigger: root.current, start: "top 85%" },
      });
      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      <div className="label mb-6 flex items-center gap-4 text-ink-2">
        <span className="text-ink" data-scramble={night ? `SCN_${code}` : `PLATE ${code}`}>
          {night ? `SCN_${code}` : `PLATE ${code}`}
        </span>
        <span className="js-rule h-px flex-1 bg-rule" style={{ maxWidth: "8rem" }} />
        <span data-scramble={label.toUpperCase()}>{label.toUpperCase()}</span>
        {kicker && <span className="hidden text-ink-3 sm:inline">— {kicker}</span>}
      </div>
      <h2 className="js-title display text-[clamp(2rem,4.4vw,4.2rem)] text-balance">{title}</h2>
    </div>
  );
}
