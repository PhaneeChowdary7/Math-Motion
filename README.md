# Math Motion

Interactive math lessons built with React, Vite and D3. Each lesson pairs a written
explanation with a visual you can drag, step through or replay, a short animated story
that shows the idea in a real-world setting, a formula reference and a quiz.

Live site: <https://phaneechowdary7.github.io/Seeing-Theory/> (deployed from `main`).

## Chapters

39 lessons across five chapters.

**Fundamentals** — Number Sets & Primes, The Coordinate Plane, Functions & Graphs,
Lines & Slope, Exponents & Logarithms, Sine & Cosine, Sequences & Series,
Formula Sheet & Identities

**Calculus** — Limits & Continuity, Derivatives, Product & Quotient Rules,
The Chain Rule, Implicit Differentiation, Related Rates, Mean Value Theorem,
L'Hôpital's Rule, Optimization, Integrals, Fundamental Theorem, Substitution,
Integration by Parts, Area Between Curves

**Linear Algebra** — Vectors & Span, Matrices as Transformations, Systems of Equations,
Determinants & Area, Eigenvectors & Eigenvalues

**Discrete Mathematics** — Counting Principles, Permutations & Combinations,
The Pigeonhole Principle, Logic & Truth Tables, Proof by Induction

**Statistics** — Describing Data, Probability & Independence,
Conditional Probability & Bayes, Random Variables & Expectation,
Distributions & the Normal Curve, Sampling & the Central Limit Theorem,
Kappa & Inter-Rater Reliability

## Features

- **Interactive plots** with sliders, draggable points and presets in every lesson.
- **Watch it happen**: animated stories (a speed camera for the Mean Value Theorem,
  gears for the chain rule, a Galton board for the normal curve, and more) with
  play, pause, scrubbing and 0.5×–2× speed. They appear only where they add
  something the interactive plot does not already show.
- **Formula reference** panel for every lesson, plus a Formula Sheet with algebraic
  identities such as (a + b)², trigonometric identities and geometry formulas.
- **Profile page** (`#profile`) with a GitHub-style activity map, streaks, per-chapter
  progress and data export.
- **Quizzes, notes and feedback** on each lesson; light and dark themes.

Progress, notes and activity are stored in the browser's `localStorage`. There are no
accounts or server, so each person's data stays on their own device.

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
| `npm run smoke` | Renders every lesson, the profile page and every story across its timeline, and checks the catalog |
| `npm run check` | Lint, smoke and build together |

## Project layout

```text
src/
  App.jsx         Sidebar, hash routing, theme, progress, profile route
  components/     Shared UI: lesson layout, quiz, notes, formula reference,
                  story player (StoryScene) and its vector art (storyArt),
                  profile page and activity heatmap
  lessons/        catalog.js, registry.js, and one folder per chapter
  stories/        Animated stories, one file per chapter
  lib/            Maths helpers, formula data, progress and activity storage
  styles.css      Single stylesheet, light and dark
scripts/
  smoke.jsx       Server-renders the app to catch runtime errors
.github/
  workflows/      GitHub Pages deploy (runs npm run check first)
```

## Adding a lesson

1. Add an entry to `src/lessons/catalog.js` with a unique `id`, `slug`, `title` and `chapter`.
2. Add a matching loader in `src/lessons/registry.js`.
3. Build the lesson in its chapter folder using `LessonLayout`. Pass `reference` for a
   formula panel (data lives in `src/lib/formulas.js`) and, if it helps, `story` for an
   animation.
4. Run `npm run check`.

A new chapter also needs an icon in the `chapterIcons` map in `catalog.js`.

## Adding a story

Stories live in `src/stories/`. Each one renders a `StoryScene` whose child is a pure
function of time `t` from 0 to 1, so play, pause, scrubbing and speed come for free.
Characters are drawn with `Actor`, which looks up a vector figure in
`src/components/storyArt.jsx`; add a figure there for any new character. The smoke
test fails if a story shows `NaN`, `undefined` or an emoji without a figure.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which runs `npm run check`
and publishes `dist/` to GitHub Pages. A failing check stops the deploy.
