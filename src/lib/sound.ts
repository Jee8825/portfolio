"use client";

/* Opt-in sound, fully synthesized with Web Audio (no files to load).
 * digital → clean sine blips + detuned drone
 * analog  → filtered clicks, tape hiss + warm low hum */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let drone: { stop: () => void } | null = null;
let enabled = false;
let world: "neon" | "blueprint" = "neon";

function ac() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  return ctx;
}

function noiseBuffer(c: AudioContext, seconds: number) {
  const b = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

function startDrone() {
  const c = ac();
  const out = c.createGain();
  out.gain.value = 0;
  out.gain.linearRampToValueAtTime(world === "neon" ? 0.05 : 0.035, c.currentTime + 2);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = world === "neon" ? 900 : 420;
  lp.connect(out).connect(master!);
  const nodes: AudioScheduledSourceNode[] = [];
  const base = world === "neon" ? 55 : 49;
  for (const [mult, det] of [[1, -6], [1.5, 4], [2, 7]] as const) {
    const o = c.createOscillator();
    o.type = world === "neon" ? "sawtooth" : "triangle";
    o.frequency.value = base * mult;
    o.detune.value = det;
    const g = c.createGain();
    g.gain.value = 0.25;
    o.connect(g).connect(lp);
    o.start();
    nodes.push(o);
  }
  if (world === "blueprint") {
    const n = c.createBufferSource();
    n.buffer = noiseBuffer(c, 2);
    n.loop = true;
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 3000;
    const g = c.createGain();
    g.gain.value = 0.12;
    n.connect(hp).connect(g).connect(out);
    n.start();
    nodes.push(n);
  }
  return {
    stop() {
      const t = c.currentTime;
      out.gain.cancelScheduledValues(t);
      out.gain.setValueAtTime(out.gain.value, t);
      out.gain.linearRampToValueAtTime(0, t + 0.6);
      nodes.forEach((n) => n.stop(t + 0.7));
    },
  };
}

export const sound = {
  get enabled() {
    return enabled;
  },
  async setEnabled(on: boolean) {
    enabled = on;
    if (on) {
      await ac().resume();
      drone?.stop();
      drone = startDrone();
      this.play("tick");
    } else {
      drone?.stop();
      drone = null;
    }
  },
  setWorld(w: "neon" | "blueprint") {
    world = w;
    if (enabled) {
      drone?.stop();
      drone = startDrone();
    }
  },
  play(kind: "tick" | "hover" | "switch" | "boot" | "pulse") {
    if (!enabled || !ctx || !master) return;
    const c = ctx;
    const t = c.currentTime;
    const g = c.createGain();
    g.connect(master);
    if (kind === "switch" || kind === "boot") {
      const n = c.createBufferSource();
      n.buffer = noiseBuffer(c, 1.4);
      const bp = c.createBiquadFilter();
      bp.type = "bandpass";
      bp.Q.value = 2.5;
      bp.frequency.setValueAtTime(world === "neon" ? 300 : 2400, t);
      bp.frequency.exponentialRampToValueAtTime(world === "neon" ? 4200 : 220, t + 1.1);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.5, t + 0.25);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.3);
      n.connect(bp).connect(g);
      n.start(t);
      n.stop(t + 1.4);
      return;
    }
    if (kind === "pulse") {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(880, t);
      o.frequency.exponentialRampToValueAtTime(110, t + 0.9);
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1);
      o.connect(g);
      o.start(t);
      o.stop(t + 1);
      return;
    }
    if (world === "neon") {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.value = kind === "hover" ? 1760 : 1320;
      g.gain.setValueAtTime(kind === "hover" ? 0.04 : 0.08, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      o.connect(g);
      o.start(t);
      o.stop(t + 0.08);
    } else {
      const n = c.createBufferSource();
      n.buffer = noiseBuffer(c, 0.05);
      const bp = c.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = kind === "hover" ? 2800 : 1600;
      g.gain.setValueAtTime(kind === "hover" ? 0.12 : 0.25, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      n.connect(bp).connect(g);
      n.start(t);
    }
  },
};
