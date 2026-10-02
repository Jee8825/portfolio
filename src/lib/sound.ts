"use client";

/* Opt-in city ambience, fully synthesized with Web Audio (no files to load).
 * neon      → rain on glass, neon-tube hum, a slow detuned pad; synth blips
 * blueprint → a quiet drafting room: soft room tone + pencil ticks */

type Kind = "tick" | "hover" | "switch" | "boot" | "pulse" | "ding";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bed: { stop: () => void } | null = null;
let enabled = false;
let world: "neon" | "blueprint" = "neon";
let lastDing = 0;

function ac() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }
  return ctx;
}

function noise(c: AudioContext, seconds: number, pink = false) {
  const b = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const d = b.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    if (!pink) {
      d[i] = w;
      continue;
    }
    b0 = 0.99765 * b0 + w * 0.099;
    b1 = 0.963 * b1 + w * 0.2965;
    b2 = 0.57 * b2 + w * 1.0526;
    d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2;
  }
  return b;
}

function startBed() {
  const c = ac();
  const t = c.currentTime;
  const out = c.createGain();
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(1, t + 2.5);
  out.connect(master!);
  const nodes: AudioScheduledSourceNode[] = [];

  const loopNoise = (pink: boolean, filter: BiquadFilterType, freq: number, gain: number) => {
    const n = c.createBufferSource();
    n.buffer = noise(c, 3, pink);
    n.loop = true;
    const f = c.createBiquadFilter();
    f.type = filter;
    f.frequency.value = freq;
    const g = c.createGain();
    g.gain.value = gain;
    n.connect(f).connect(g).connect(out);
    n.start();
    nodes.push(n);
  };

  if (world === "neon") {
    loopNoise(true, "lowpass", 2400, 0.22); // rain body
    loopNoise(false, "highpass", 6500, 0.025); // drops on glass
    // neon tube hum: 120 Hz + harmonics, barely there
    for (const [f, g] of [[120, 0.012], [240, 0.006], [360, 0.003]] as const) {
      const o = c.createOscillator();
      o.frequency.value = f;
      const gg = c.createGain();
      gg.gain.value = g;
      o.connect(gg).connect(out);
      o.start();
      nodes.push(o);
    }
    // slow pad: detuned saws through a breathing lowpass
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 650;
    lp.Q.value = 0.7;
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 280;
    lfo.connect(lfoGain).connect(lp.frequency);
    lfo.start();
    nodes.push(lfo);
    const padGain = c.createGain();
    padGain.gain.value = 0.03;
    lp.connect(padGain).connect(out);
    for (const [f, det] of [[110, -7], [164.8, 5], [220, 9], [246.9, -4]] as const) {
      const o = c.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      o.detune.value = det;
      o.connect(lp);
      o.start();
      nodes.push(o);
    }
  } else {
    loopNoise(true, "lowpass", 900, 0.06); // room tone
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.value = 196;
    const g = c.createGain();
    g.gain.value = 0.008;
    o.connect(g).connect(out);
    o.start();
    nodes.push(o);
  }

  return {
    stop() {
      const now = c.currentTime;
      out.gain.cancelScheduledValues(now);
      out.gain.setValueAtTime(out.gain.value, now);
      out.gain.linearRampToValueAtTime(0, now + 0.8);
      nodes.forEach((n) => n.stop(now + 0.9));
    },
  };
}

function blip(c: AudioContext, g: GainNode, freq: number, vol: number, len: number, type: OscillatorType = "sine") {
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(g);
  o.start(t);
  o.stop(t + len + 0.02);
}

export const sound = {
  get enabled() {
    return enabled;
  },
  async setEnabled(on: boolean) {
    enabled = on;
    if (on) {
      await ac().resume();
      bed?.stop();
      bed = startBed();
      this.play("tick");
    } else {
      bed?.stop();
      bed = null;
    }
  },
  setWorld(w: "neon" | "blueprint") {
    world = w;
    if (enabled) {
      bed?.stop();
      bed = startBed();
    }
  },
  play(kind: Kind) {
    if (!enabled || !ctx || !master) return;
    const c = ctx;
    const t = c.currentTime;
    const g = c.createGain();
    g.connect(master);

    if (kind === "switch" || kind === "boot") {
      // a wet sweep: the world draining away and flooding back
      const n = c.createBufferSource();
      n.buffer = noise(c, 1.6, true);
      const bp = c.createBiquadFilter();
      bp.type = "bandpass";
      bp.Q.value = 3;
      bp.frequency.setValueAtTime(world === "neon" ? 260 : 2600, t);
      bp.frequency.exponentialRampToValueAtTime(world === "neon" ? 3200 : 240, t + 1.3);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.7, t + 0.3);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      n.connect(bp).connect(g);
      n.start(t);
      n.stop(t + 1.6);
      return;
    }
    if (kind === "ding") {
      // elevator chime between floors (rate-limited so fast scrolls don't ring a bell choir)
      if (t - lastDing < 0.35) return;
      lastDing = t;
      const g2 = c.createGain();
      g2.connect(master);
      blip(c, g, world === "neon" ? 1318.5 : 987.8, 0.06, 0.9);
      setTimeout(() => blip(c, g2, world === "neon" ? 1046.5 : 784, 0.05, 1.1), 140);
      return;
    }
    if (kind === "pulse") {
      const o = c.createOscillator();
      o.frequency.setValueAtTime(880, t);
      o.frequency.exponentialRampToValueAtTime(110, t + 0.9);
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1);
      o.connect(g);
      o.start(t);
      o.stop(t + 1);
      return;
    }
    if (world === "neon") {
      blip(c, g, kind === "hover" ? 1760 : 1320, kind === "hover" ? 0.03 : 0.07, 0.07);
    } else {
      // pencil on paper
      const n = c.createBufferSource();
      n.buffer = noise(c, 0.06);
      const bp = c.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = kind === "hover" ? 3800 : 2400;
      g.gain.setValueAtTime(kind === "hover" ? 0.08 : 0.18, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      n.connect(bp).connect(g);
      n.start(t);
    }
  },
};
