# Math Motion

Interactive math lessons built with React, Vite and D3. Each lesson pairs a written
explanation with a visual you can drag, step through or replay.

## Chapters

**Fundamentals** — Number Sets & Primes, The Coordinate Plane, Functions & Graphs,
Lines & Slope, Exponents & Logarithms, Sine & Cosine, Sequences & Series

**Calculus** — Limits & Continuity, Derivatives, Product & Quotient Rules,
The Chain Rule, Implicit Differentiation, Related Rates, Mean Value Theorem,
L'Hôpital's Rule, Optimization, Integrals, Fundamental Theorem, Substitution,
Integration by Parts, Area Between Curves

**Statistics** — Kappa & Inter-Rater Reliability

## Run locally

```bash
npm install
npm run dev
```

Then open <http://localhost:5175/>.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 5175 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the build on port 4175 |
| `npm run lint` | ESLint |
| `npm run smoke` | Renders every lesson and checks the catalog |
| `npm run check` | Lint, smoke and build together |

## Project layout

```text
src/
  App.jsx         Sidebar, routing, theme, progress
  components/     Shared UI: lesson layout, quiz, notes, formula reference
  lessons/        catalog.js, registry.js, and one folder per chapter
  lib/            Maths helpers and formula data
  styles.css      Single stylesheet, light and dark
```

## Adding a lesson

1. Add an entry to `src/lessons/catalog.js` with a unique `id`, `slug`, `title` and `chapter`.
2. Add a matching loader in `src/lessons/registry.js`.
3. Build the lesson in its chapter folder using `LessonLayout`.
4. Run `npm run check`.

A new chapter also needs an icon in the `chapterIcons` map in `catalog.js`.
