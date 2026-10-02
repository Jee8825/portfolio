# Films (HyperFrames)

Rendered video for the portfolio, built from the **same code as the site**: `shared/entry.ts`
bundles `src/lib/formations.ts`, the field shaders, the CRT/paper lens and `src/data/portfolio.ts`,
so every film draws the live site's neural field and says the site's exact words.

| Project   | Length | What                                                        |
| --------- | ------ | ----------------------------------------------------------- |
| `sting`   | 4s     | CRT boot → name                                             |
| `trailer` | 20s    | One composition, `slug` variable → Recall / FinDesk / SYNAPSE / Cognitia |
| `promo`   | 42s    | 16:9 LinkedIn promo with the Digital → Analog switch        |

```bash
node films/build.mjs                         # rebuild assets/ (engine bundle, fonts, synthesized SFX)
cd films/promo && npx hyperframes check      # lint + runtime + layout + contrast
cd films/promo && npx hyperframes preview    # Studio
cd films/trailer && npx hyperframes render --quality high --variables '{"slug":"findesk"}' --output renders/findesk.mp4
```

Rules that keep renders deterministic: field state is a pure function of time (`track`, `morphs`,
`steps` in `shared/engine.js`), text scrambles are seeded, initial hidden states use `gsap.set`
before the timeline. Rendered MP4s go to `public/films/` and are wired in via `chapter.film`.
