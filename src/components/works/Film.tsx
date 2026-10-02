"use client";

import { useEffect, useRef } from "react";
import { useUI } from "@/lib/store";

/** HyperFrames-rendered trailer. Plays muted only while on screen; respects reduced motion. */
export function Film({ src, poster, title }: { src: string; poster?: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useUI((s) => s.reducedMotion);

  useEffect(() => {
    const v = ref.current;
    if (!v || reduced) return;
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()),
      { threshold: 0.4 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <figure className="panel overflow-hidden p-0" style={{ ["--panel-accent" as string]: "var(--t1)" }}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        controls={reduced}
        aria-label={title}
        className="block aspect-video w-full bg-paper-2"
      />
      <figcaption className="label flex justify-between px-4 py-3 text-ink-3">
        <span>{title}</span>
        <span>HyperFrames</span>
      </figcaption>
    </figure>
  );
}
