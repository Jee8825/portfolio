<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-context -->
# Project Context — Jeevanandh's Portfolio

> **Maintenance rule (for any agent):** Keep this block accurate. Whenever you change the
> stack, structure, deploy setup, owner links, or project list, update the relevant lines
> here in the same change. Treat it as living documentation. Last updated: 2026-10-02 (Data City).

## What this is
Personal portfolio for **Jeevanandh** (B.Tech AI & Data Science), built as a **Data City**:
an isometric 3D city you fly through on scroll. Each featured project is a glass-and-chrome
tower you ride *inside* (lobby → F1 brief → F2 systems → F3 demo → roof proof) while the tower
explodes into its layers. Two worlds instead of dark/light: **NEON** (night, rain, neon,
glass) and **BLUEPRINT** (white CAD linework on cyanotype); switching is a liquid melt.
Brief + decisions: [`docs/REVAMP_BRIEF.md`](docs/REVAMP_BRIEF.md) ("Direction 2"). The previous
"neural film" design is parked on branch `revamp-neural`.

- **Live:** https://portfolio-three-eosin-86.vercel.app
- **Repo:** https://github.com/Jee8825/portfolio (`main` = production; revamp work on `revamp`)
- **Deploy:** Vercel free tier, zero-config. Push to `main` deploys prod; other branches get
  preview URLs. Merge `revamp` → `main` only with Jee's approval.

## Stack
Next.js 16 (App Router, `experimental.viewTransition`) · TypeScript · Tailwind CSS v4 ·
GSAP 3.15 (ScrollTrigger, SplitText, ScrambleText — all free) + `@gsap/react` · Lenis ·
three.js + @react-three/fiber 9 + drei + `postprocessing` · detect-gpu · self-hosted fonts via
`@fontsource-variable/*` (Unbounded = display, Space Grotesk = text, JetBrains Mono = mono) ·
Web Audio (synthesized, opt-in). HyperFrames films live in `films/` (see `films/README.md`):
they bundle the site's own formations/shaders/content, render to `public/films/`.

## Golden rule — content is decoupled from UI
**All site content lives in [`src/data/portfolio.ts`](src/data/portfolio.ts)**: `profile`,
`socials`, `scenes`, `tiers`, `about`, `skillGroups`, `projects` (featured ones carry a
`chapter`: thesis, problem, insight, metrics, architecture nodes/edges, demo, formation, film),
`log`, `experience`, `seo`. Components only READ from it. Every `tier` (1|2|3) maps to a
colour + role automatically. Facts come from the public repo READMEs — don't invent metrics.

## Structure
- `src/app/` — `layout.tsx` (fonts, no-flash world script, Engine + Stage + Hud),
  `page.tsx` (the film: Signal → Memory → Cortex → Works → Log → Transmit),
  `work/[slug]/page.tsx` (SSG case studies), `globals.css` (two-world tokens; component
  classes live in `@layer components` so Tailwind utilities override them)
- `src/lib/` — `store.ts` (`stage` per-frame values incl. `scene`, `travel[]`, `melt`; `ui`
  React store), `city.ts` (districts, skyline generator, highways, **camera SHOTS** — shot
  index == `data-formation`), `formations.ts` (index map + legacy film shapes), `gsap.ts`,
  `world.ts` (liquid-melt switch), `sound.ts` (city ambience), `palette.ts`
- `src/components/engine/Engine.tsx` — single RAF owner (GSAP ticker → Lenis →
  ScrollTrigger → R3F `advance`), GPU tiering, `Director` (scroll → formation)
- `src/components/gl/Stage.tsx` — persistent canvas + post chain (MSAA, bloom, CityLens)
- `src/components/city/` — `City` (root), `Skyline` (instanced architecture, facade shader,
  signs, beacons), `Landmarks` (hub + project towers, exploded view), `Roads` (highways,
  traffic, avenue, ground), `SkyStreets`, `Atmosphere` (rain), `CameraRig`, `CityLens`
- `src/components/gl/shaders.ts`, `SignalEffect.ts` — only used by the legacy films bundle
- `src/components/scenes/` — Boot, Signal, Memory, Cortex, Works, Log, Transmit
- `src/components/works/` — Chapter, ArchDiagram, Demo, Film, WorkView
- `src/components/demos/` — Decay (Recall), Approval (FinDesk), Fleet (SYNAPSE), Rag (Cognitia)
- `src/components/chrome/Hud.tsx`, `src/components/ui/` — SceneHead, Portrait, SocialIcon

## Gotchas (already handled — don't "fix" back)
- **No Google Fonts at build** (this machine can't reach fonts.gstatic.com): fonts are
  self-hosted via `@fontsource-variable/*`. Do NOT switch to `next/font/google`.
- **lucide v1 removed brand icons**: brand icons are inline SVGs in `ui/SocialIcon.tsx`.
- **Workspace root pinned** in `next.config.ts` (`turbopack.root` / `outputFileTracingRoot`).
- **detect-gpu benchmarks are self-hosted** in `public/gpu` (no CDN call). `?tier=0..3` forces a tier.
- **postprocessing:** an effect that samples `inputBuffer` can't also use `mainUv`; warps live
  inside `mainImage`. Composer uses MSAA (canvas `antialias` is off on purpose).
- **Melt switch** is animated from JS with `%` clip geometry and the animations are
  cancelled after each switch (filled animations otherwise hijack the next one).
- **Colour:** canvas is sRGB output (not `linear`); shader colours come in as `THREE.Color`
  (linear). Facade detail is AA'd with `fwidth` and averaged at distance (no shimmer).
- **Camera:** each shot has its own smoothed `travel`; never switch blend formulas by threshold.
- **Browser-pane testing:** clicks under viewport emulation land at the wrong coordinates —
  test clicks at the pane's native size.

## Owner facts / real links (used across profile + SEO)
- Name: Jeevanandh · B.Tech AI & Data Science · Sri Eshwar College of Engineering
- Email: anandhjeeva88255@gmail.com (portfolio) / jeevanandh.b2024@sece.ac.in (college/resume)
- GitHub: https://github.com/Jee8825 · LinkedIn: jeevanandh-b-ai-ds-605852333 ·
  Hugging Face: https://huggingface.co/Jee0088
- Résumé: Google Drive link in `profile.resumeUrl`. Portrait: `profile.portrait` (empty →
  generative halftone placeholder).

## Featured projects (chapter + /work page; repos PUBLIC)
- **Recall** — memory engine that forgets — github.com/Jee8825/recall
- **FinDesk** — autonomous CFO for Indian SMEs — github.com/Jee8825/FinDesk
- **SYNAPSE** — edge-AI fleet learning (Tata InnoVent) — github.com/Jee8825/Synapse
- **Cognitia AI** — AWS Bedrock RAG coding mentor — github.com/Jee8825/CognitiaAI
- Also built: HavenWell (MERN, live at jeeh.netlify.app), GramMesh, Harvestify (no public repos)

## Commands
`npm run dev` (3000 may be taken by Docker → auto port) · `npm run build` · `npx eslint src`.

## Related, but NOT in this repo
The LaTeX **résumé** lives at `~/Downloads/jeevanandh_resume/` (`pdflatex`, TeX Gyre Termes).
<!-- END:project-context -->
