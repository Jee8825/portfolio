# Portfolio Revamp — Research Brief (2026-10-02)

Working doc for the full redesign on the `revamp` branch. Decisions from Q&A round 1 are locked;
round-2 answers get appended at the bottom.

## 1. Concept — "RECALL // a mind, in three tiers"
A **living neural system staged as a film**. The site is a mind booting up, remembering and
acting, cut into cinematic scenes. The organising idea comes straight from Jee's flagship work
(Recall's three memory tiers), so the *design system itself* is three-tiered:

| Tier (Recall) | Colour role | Font role | Motion role |
|---|---|---|---|
| Episodic — raw, fast, decays | Accent A | Mono (data, labels) | glitch / flicker / decay |
| Semantic — durable facts | Accent B | Text (reading) | ease, settle, reinforce |
| Procedural — near-permanent | Accent C | Display (headlines) | slow, massive, inevitable |

## 2. Two worlds (same content, different art direction)
- **DIGITAL (dark):** CRT phosphor, scanlines, terminal, RGB-split glitch, bloom. WebGL particle
  network is emissive. Post-FX: scanline + chromatic aberration + bloom + noise.
- **ANALOG (light):** risograph print — paper grain, halftone dots, misregistered ink layers,
  Swiss grid. Same particle network rendered as halftone ink dots on paper. Post-FX: halftone +
  ink misregistration + paper texture.
- **Switch (signature):** layered sequence ≈1.2s → (1) WebGL noise-dissolve of the 3D scene from
  click point, (2) View Transitions API circular portal for the DOM, (3) type re-sets (variable font
  axes morph), UI "re-prints". Reduced-motion → instant swap.

## 3. Stack (verified on npm 2026-10-02)
`gsap 3.15` (all plugins free incl. SplitText/MorphSVG/ScrambleText since 3.13) · `@gsap/react 2.1`
· `lenis 1.3` · `three 0.186` · `@react-three/fiber 9.8` · `@react-three/drei 10.7` ·
`@react-three/postprocessing 3.1` · `detect-gpu 5` · fonts via `@fontsource(-variable)/*` (self-hosted;
no Google Fonts fetch at build). Keep Next 16 + Tailwind v4 + `portfolio.ts` as content source.

**Architecture rules (from research):**
- One RAF owner: GSAP ticker drives Lenis (`autoRaf:false`) → ScrollTrigger → R3F (`frameloop="never"`/
  manual advance). Prevents jitter/double loops.
- One persistent `<Canvas>` fixed behind the DOM for the whole site; sections register "scenes"
  that the scroll timeline blends between (no canvas per section).
- Adaptive: `detect-gpu` tier at boot + drei `PerformanceMonitor` to drop DPR/effects at runtime;
  tier 0/reduced-motion → static art + CSS motion.
- Award sites share one trait: *one hard idea executed cleanly* (Utsubo 2026 review). Our idea:
  the neural network that remembers you scrolled.

## 4. HyperFrames
Renders seekable GSAP/CSS/SVG/3D compositions to MP4, or WebM/MOV with alpha for overlays.
Plan: intro sting (≤4s), one trailer per featured project (20–45s), LinkedIn promo (30–60s),
frame sequences for scroll-scrub. Compositions reuse the site's tokens so films match the site.

## 5. Project facts (from public READMEs)
- **Recall** — memory that *forgets*: episodic → semantic → procedural; strength decay
  `S(t)=S₀·e^(−λt)` boosted on retrieval; confidence axis; conflict detection; provenance graph
  (Neo4j); budget-aware packer. Benchmarks: precision@5 0.48→1.00, facts-in-400-tokens 4→7,
  forgetting curve 1.33×. Stack: FastAPI, Postgres+pgvector, Neo4j, Redis, Qwen/OpenAI/Anthropic.
- **FinDesk** — autonomous CFO for Indian SMEs on top of Tally/Zoho. Module A bookkeeping
  (TDS reconciliation, anomaly, provenance); Module B cash command (payment prediction, MSME 45-day
  enforcement, 4/13-week forecasts w/ confidence bands, TReDS). LangGraph Planner → Executor →
  Critic → Approval Gate; MCP tool servers; never moves money (maker-checker). Vendors Recall.
- **SYNAPSE** — edge-AI fleet learning (Tata InnoVent). 4 layers/node: Isolation Forest → ADWIN
  drift + conformal → FAISS case memory → Zenoh P2P gossip. Drift-conscience: Confident / Stale
  ("listen, don't teach") / Unknown. Has a 3D fleet twin + 2-min demo video.
- **HavenWell (hos_web)** — MERN + Socket.io hospital system, live at jeeh.netlify.app.
- **Cognitia AI** — repo README is a backup stub; architecture from `portfolio.ts` copy.
- GramMesh, Harvestify — no public repo found under Jee8825.

## Sources
- Awwwards portfolio winners — https://www.awwwards.com/websites/winner_category_portfolio/
- Best Three.js sites 2026 — https://www.utsubo.com/blog/best-threejs-websites-2026
- Trionn architecture (GSAP+Three+Lenis+Audio) — https://tympanus.net/codrops/2026/07/15/the-architecture-behind-trionn-coordinating-gsap-three-js-lenis-and-web-audio/
- Lenis + WebGL single RAF — https://github.com/sw7rvy/lenis-webgl-ticker
- GSAP 3.13 free plugins — https://gsap.com/blog/3-13/
- View-transition theme reveal — https://akashhamirwasia.com/blog/full-page-theme-toggle-animation-with-view-transitions-api/
- CRT shader (three/pmndrs adapters) — https://github.com/OutThisLife/crt-shader
- pmndrs postprocessing — https://github.com/pmndrs/postprocessing
- detect-gpu — https://www.npmjs.com/package/detect-gpu · drei PerformanceMonitor — http://drei.docs.pmnd.rs/misc/detect-gpu-use-detect-gpu

## Round-2 decisions (locked 2026-10-02)
- **Palette — Riso trio.** Digital bg `#07080A`: episodic `#FF48B0`, semantic `#2E8BFF`,
  procedural `#FFE800`. Analog bg `#F2EDE4` (newsprint): `#FF48B0`, `#0078BF`, `#FFE800` + black key.
- **Fonts — Morph trio.** Display Fraunces (var opsz/SOFT/WONK; digital SOFT 0, analog SOFT 100 WONK 1)
  · Text Space Grotesk (var) · Mono Recursive (MONO 1, CASL 0 digital → 1 analog).
- **Storyboard:** 00 BOOT → 01 SIGNAL → 02 MEMORY → 03 CORTEX → 04 WORKS → 05 LOG → 06 TRANSMIT.
- **Featured (chapter + /work page):** Recall, FinDesk, SYNAPSE, Cognitia AI.
  Secondary: HavenWell (re-added), GramMesh, Harvestify.
- **Recruiter mode:** `QUICK READ` nav toggle → condensed one-pager (no WebGL), default for reduced-motion.

## Build phases
1. Foundation — deps, tokens, fonts, two-world theme system, single RAF (GSAP→Lenis→R3F), persistent canvas, GPU tiering.
2. Signature — boot, hero neural network, theme-switch sequence, post-FX per world.
3. Scenes — MEMORY, CORTEX, LOG, TRANSMIT.
4. WORKS — 4 chapters + /work/[slug] pages (3D object, architecture, mini-demo) + morph transitions.
5. HyperFrames — intro sting, 4 trailers, scroll-scrub sequences, LinkedIn promo.
6. Audio, QUICK READ, a11y/perf pass, SEO, preview deploy.
