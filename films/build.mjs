// Rebuilds every film project's assets/ from the site sources.
//   node films/build.mjs
// 1. bundles src/lib/formations.ts + src/data/portfolio.ts for the browser (esbuild)
// 2. copies the self-hosted variable fonts
// 3. synthesizes the sound design with ffmpeg (no licensed audio)
// 4. copies shared engine/css into each project
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const out = join(here, "shared", "build");
mkdirSync(join(out, "fonts"), { recursive: true });
mkdirSync(join(out, "sfx"), { recursive: true });

const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit", cwd: root });

/* 1 — engine bundle */
run("npx", [
  "-y", "esbuild@0.25.10", "films/shared/entry.ts",
  "--bundle", "--format=esm", "--platform=browser", "--target=es2020",
  `--alias:@=./src`, "--outfile=films/shared/build/site.js", "--log-level=warning",
]);

/* 2 — fonts */
const fonts = {
  "fraunces.woff2": "@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2",
  "space-grotesk.woff2": "@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2",
  "recursive.woff2": "@fontsource-variable/recursive/files/recursive-latin-full-normal.woff2",
};
for (const [name, src] of Object.entries(fonts)) cpSync(join(root, "node_modules", src), join(out, "fonts", name));

/* 3 — sound design, all synthesized */
const sr = 48000;
const sfx = {
  // band-passed noise sweeping up: the portal / cut
  "whoosh.wav": ["-f", "lavfi", "-i", `anoisesrc=d=1.4:c=pink:r=${sr}:a=0.9`,
    "-af", "bandpass=f=900:w=1.2,afreqshift=0,volume=1.6,afade=t=in:d=0.35,afade=t=out:st=0.6:d=0.8"],
  // CRT power-on: falling sine + crackle
  "boot.wav": ["-f", "lavfi", "-i", `aevalsrc='0.55*sin(2*PI*(1600*exp(-4*t))*t)*exp(-2.2*t)+0.08*(random(0)-0.5)*exp(-6*t)':d=1.6:s=${sr}`,
    "-af", "lowpass=f=6000,afade=t=out:st=1.1:d=0.5"],
  // tick: short phosphor blip
  "tick.wav": ["-f", "lavfi", "-i", `aevalsrc='0.35*sin(2*PI*1320*t)*exp(-60*t)':d=0.12:s=${sr}`],
  // hit: sub thump for title slams
  "hit.wav": ["-f", "lavfi", "-i", `aevalsrc='0.9*sin(2*PI*(52+90*exp(-18*t))*t)*exp(-5*t)+0.15*(random(0)-0.5)*exp(-40*t)':d=1.2:s=${sr}`],
  // riser: high-passed noise climbing
  "riser.wav": ["-f", "lavfi", "-i", `anoisesrc=d=2.2:c=white:r=${sr}:a=0.5`,
    "-af", "highpass=f=1800,volume='min(1,t/2)':eval=frame,afade=t=out:st=2.0:d=0.2"],
  // print: chunky mechanical press for the analog flip
  "print.wav": ["-f", "lavfi", "-i", `aevalsrc='0.6*(random(0)-0.5)*exp(-30*mod(t,0.11))*lt(t,0.66)':d=0.8:s=${sr}`,
    "-af", "bandpass=f=1400:w=1.5,volume=2.2"],
  // drone: three detuned saws, low-passed, 48s bed
  "drone.wav": ["-f", "lavfi", "-i", `aevalsrc='0.12*(2*mod(55*t,1)-1)+0.10*(2*mod(82.9*t,1)-1)+0.08*(2*mod(110.4*t,1)-1)':d=48:s=${sr}`,
    "-af", "lowpass=f=520,afade=t=in:d=2.5,afade=t=out:st=45:d=3"],
};
for (const [name, args] of Object.entries(sfx)) {
  run("ffmpeg", ["-y", "-loglevel", "error", ...args, "-ac", "2", join(out, "sfx", name)]);
}

/* 4 — fan out into each project */
for (const p of ["sting", "trailer", "promo"]) {
  const dest = join(here, p, "assets");
  mkdirSync(dest, { recursive: true });
  cpSync(out, dest, { recursive: true });
  cpSync(join(here, "shared", "engine.js"), join(dest, "engine.js"));
  cpSync(join(here, "shared", "film.css"), join(dest, "film.css"));
}
console.log("films: assets rebuilt");
if (!existsSync(join(here, "trailer", "index.html"))) console.warn("trailer/index.html missing");
