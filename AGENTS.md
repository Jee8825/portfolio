<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-context -->
# Project Context — Jeevanandh's Portfolio

> **Maintenance rule (for any agent):** Keep this block accurate. Whenever you change the
> stack, structure, deploy setup, owner links, or project list, update the relevant lines
> here in the same change. Treat it as living documentation. Last updated: 2026-10-02.

## What this is
Personal portfolio for **Jeevanandh** (B.Tech AI & Data Science). A scroll-driven "film" built
on one idea: **a mind in three tiers** (Recall's episodic / semantic / procedural memory). Two
worlds instead of dark/light: **DIGITAL** (phosphor, CRT, glitch) and **ANALOG** (riso ink on
newsprint). One persistent WebGL "neural field" morphs between shapes as you scroll.
Design brief + decisions: [`docs/REVAMP_BRIEF.md`](docs/REVAMP_BRIEF.md).

- **Live:** https://portfolio-three-eosin-86.vercel.app
- **Repo:** https://github.com/Jee8825/portfolio (`main` = production; revamp work on `revamp`)
- **Deploy:** Vercel free tier, zero-config. Push to `main` deploys prod; other branches get
  preview URLs. Merge `revamp` → `main` only with Jee's approval.

## Stack
Next.js 16 (App Router, `experimental.viewTransition`) · TypeScript · Tailwind CSS v4 ·
GSAP 3.15 (ScrollTrigger, SplitText, ScrambleText — all free) + `@gsap/react` · Lenis ·
three.js + @react-three/fiber 9 + `postprocessing` · detect-gpu · self-hosted fonts via
`@fontsource-variable/*` (Fraunces = display, Space Grotesk = text, Recursive = mono) ·
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
- `src/lib/` — `store.ts` (`stage` per-frame values + `ui` React store), `formations.ts`
  (10 point-cloud shapes, order == `data-formation` index), `gsap.ts`, `world.ts` (the
  world-switch choreography), `sound.ts`, `palette.ts`
- `src/components/engine/Engine.tsx` — single RAF owner (GSAP ticker → Lenis →
  ScrollTrigger → R3F `advance`), GPU tiering, `Director` (scroll → formation)
- `src/components/gl/` — `Stage` (persistent canvas + post chain), `NeuralField`, `shaders`,
  `SignalEffect` (CRT / paper lens + transition tear)
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
- **postprocessing:** an effect that samples `inputBuffer` can't also use `mainUv`; the
  CRT warp lives inside `mainImage` in `SignalEffect`.
- **View-transition portal** is animated from JS (`root.animate(..., {pseudoElement})`);
  CSS vars don't reach `::view-transition-new` reliably.
- **Canvas is `flat linear`** with raw sRGB values in uniforms so palette hexes match CSS.
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
