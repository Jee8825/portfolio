"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { stage } from "@/lib/store";

/**
 * Calls `apply(isDay)` once on mount and again whenever the world flips
 * (stage.world changes at the peak of the melt), without re-rendering React.
 */
export function useWorld(apply: (day: boolean) => void) {
  const last = useRef<number>(-1);
  useFrame(() => {
    const w = stage.world > 0.5 ? 1 : 0;
    if (w !== last.current) {
      last.current = w;
      apply(w === 1);
    }
  });
}
