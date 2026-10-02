"use client";

import { useSyncExternalStore } from "react";

export type World = "digital" | "analog";
/** 0 = no WebGL (static art), 1 = light, 2 = medium, 3 = full */
export type GpuTier = 0 | 1 | 2 | 3;

/* ------------------------------------------------------------------ */
/*  Stage: per-frame mutable values. Read inside RAF, never in render. */
/* ------------------------------------------------------------------ */
export const stage = {
  /** float formation index the field is heading to (0 = boot, 1 = signal …) */
  scene: 0,
  /** boot progress 0→1; while < 1 it overrides the scroll scene */
  boot: 0,
  velocity: 0,
  progress: 0,
  pointer: { x: 0, y: 0 },
  /** 0 = digital, 1 = analog. Flips at the peak of the switch sequence. */
  world: 0,
  /** 0..1 particle explosion used by transitions */
  scatter: 0,
  /** 0..1 glitch / tear intensity */
  glitch: 0,
  /** 0..1 "signal fired" pulse used by TRANSMIT and clicks */
  pulse: 0,
};

/* ------------------------------------------------------------------ */
/*  UI store: low-frequency state React renders from.                 */
/* ------------------------------------------------------------------ */
type UIState = {
  world: World;
  tier: GpuTier;
  quick: boolean;
  sound: boolean;
  booted: boolean;
  sceneId: string;
  reducedMotion: boolean;
  gpuReady: boolean;
};

let state: UIState = {
  world: "digital",
  tier: 0,
  quick: false,
  sound: false,
  booted: false,
  sceneId: "signal",
  reducedMotion: false,
  gpuReady: false,
};

const listeners = new Set<() => void>();

export const ui = {
  get: () => state,
  set(patch: Partial<UIState>) {
    let changed = false;
    for (const k in patch) {
      const key = k as keyof UIState;
      if (state[key] !== patch[key]) changed = true;
    }
    if (!changed) return;
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useUI<T>(select: (s: UIState) => T): T {
  return useSyncExternalStore(
    ui.subscribe,
    () => select(state),
    () => select(state),
  );
}

/* ------------------------------------------------------------------ */
/*  Persistence (per-viewer conveniences only)                         */
/* ------------------------------------------------------------------ */
export function readPref(key: string): string | null {
  try {
    return localStorage.getItem(`jee:${key}`);
  } catch {
    return null;
  }
}

export function writePref(key: string, value: string) {
  try {
    localStorage.setItem(`jee:${key}`, value);
  } catch {
    /* private mode — fine */
  }
}
