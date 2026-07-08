# Jeevanandh — Portfolio

Personal portfolio of **Jeevanandh**, B.Tech Artificial Intelligence & Data Science.
Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **Motion**.
Designed to deploy on **Vercel (free tier)** with zero configuration.

---

## ✨ The one rule: content is decoupled from the UI

**All content lives in a single file: [`src/data/portfolio.ts`](src/data/portfolio.ts).**

The components only *read* from that file. This means you can:

- Update any text, project, skill, or link → edit `portfolio.ts` **only**.
- Restyle or completely rebuild the UI → the content stays intact.
- Add a backend later → plug Next.js API routes into the same Vercel project.

> Whatever you refactor or revamp, keep `src/data/portfolio.ts` as the source of
> truth and the site stays deployable.

---

## 🚀 Quick start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (what Vercel runs)
```

## 🖊️ How to update your info

Open [`src/data/portfolio.ts`](src/data/portfolio.ts) and edit the exported objects:

| Object         | What it controls                                  |
| -------------- | ------------------------------------------------- |
| `profile`      | Name, role, headline, email, résumé link          |
| `socials`      | GitHub / LinkedIn / Hugging Face / email links    |
| `about`        | Bio paragraphs + the stat tiles                   |
| `skillGroups`  | The skills/stack cards                             |
| `projects`     | Every project card (mark `featured: true` to feature) |
| `experience`   | The timeline                                      |
| `seo`          | Meta title/description + site URL                 |

### ⚠️ TODO before you ship (search for `TODO` in that file)

1. **`socials`** — replace placeholder `github.com/`, `linkedin.com/in/`, `huggingface.co/` with your real profile URLs.
2. **`profile.resumeUrl`** — replace [`public/resume.pdf`](public/resume.pdf) (currently a placeholder) with your real résumé.
3. **`seo.url`** — set to your live Vercel URL after the first deploy (for SEO + sitemap).

---

## 📦 Deploy to Vercel (free)

**Option A — GitHub + Vercel dashboard (recommended):**

1. Create a new GitHub repo and push this folder to it.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Framework preset auto-detects **Next.js** — no settings needed. Click **Deploy**.
4. Copy your `*.vercel.app` URL into `seo.url` and redeploy (or just commit).

**Option B — Vercel CLI:**

```bash
npm i -g vercel
vercel          # first run links/creates the project
vercel --prod   # production deploy
```

Every push to your default branch auto-deploys. Preview deployments are created for other branches/PRs.

---

## 🗂️ Project structure

```
src/
├── app/
│   ├── layout.tsx        # metadata / SEO / fonts
│   ├── page.tsx          # composes the sections
│   ├── globals.css       # design system (tokens, dark theme, utilities)
│   ├── robots.ts         # SEO
│   └── sitemap.ts        # SEO
├── data/
│   └── portfolio.ts      # ⭐ SINGLE SOURCE OF TRUTH — edit this
└── components/
    ├── Navbar.tsx
    ├── Footer.tsx
    ├── sections/         # Hero, About, Skills, Projects, Experience, Contact
    └── ui/               # Reveal, Section, ProjectCard, SocialIcon
```

## 🎨 Design system

Tokens (colors, fonts) are defined in [`src/app/globals.css`](src/app/globals.css) as CSS
variables and exposed to Tailwind via `@theme`. Change the palette in one place
(`:root`) and the whole site follows. Fonts are self-hosted via the `geist`
package (no build-time network dependency).
