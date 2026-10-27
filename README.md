# Irfanul Amin Maruf — Portfolio

Personal portfolio: a short intro, selected work, experience, the tools I use, a live GitHub contribution graph, and a small `/play` sidequest with a browser game.

## Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui, Base UI
- **Motion:** GSAP, Motion
- **Icons:** Phosphor, Lucide, Simple Icons
- **Package manager:** pnpm

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command          | What it does                  |
| ---------------- | ----------------------------- |
| `pnpm dev`       | Start the dev server          |
| `pnpm build`     | Production build              |
| `pnpm start`     | Serve the production build    |
| `pnpm lint`      | Run ESLint                    |
| `pnpm typecheck` | Run the TypeScript compiler   |
| `pnpm check`     | Lint and typecheck together   |

## Project structure

```
app/
  page.tsx          Home page
  play/             Sidequest: dot-run (maze game)
components/         Sections, nav, games, and UI primitives
lib/
  projects.ts       Project list
  experience.ts     Work history
  software.ts       Tools and software
  github.ts         Contribution data (revalidated hourly)
public/
  projects/ work/   Logos
```

## Editing content

Most content lives in plain data files, so updating the site rarely means touching components:

- **Projects:** add or remove an entry in `lib/projects.ts` and drop its logo in `public/projects/`.
- **Experience:** edit `lib/experience.ts`.
- **Tools:** edit `lib/software.ts`.

## Deployment

Deployed on [Vercel](https://vercel.com). Pushing to `main` triggers a build.
