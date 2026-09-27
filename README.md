# Math Motion

Interactive math lessons built with React, Vite and D3. Each lesson combines a written
explanation, an interactive plot, a formula reference and a quiz. Many lessons also
include a short animation that shows the idea in a real-world setting.

## Chapters

- **Fundamentals:** number sets, the coordinate plane, functions, lines, exponents and
  logarithms, sine and cosine, sequences, and a formula sheet
- **Calculus:** limits, derivatives, differentiation rules, related rates, the Mean Value
  Theorem, L'Hôpital's rule, optimization, integrals and integration techniques
- **Linear Algebra:** vectors, matrices, systems of equations, determinants, eigenvectors
- **Discrete Mathematics:** counting, permutations and combinations, the pigeonhole
  principle, logic, induction
- **Statistics:** describing data, probability, Bayes, expectation, the normal
  distribution, sampling, kappa

There is also a profile page with an activity map and progress by chapter. Progress is
saved in the browser.

## Run locally

```bash
npm install
npm run dev
```

Then open <http://localhost:5175/>.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build into `dist/` |
| `npm run preview` | Serve the build |
| `npm run lint` | Run ESLint |
| `npm run smoke` | Render every lesson to catch errors |
| `npm run check` | Lint, smoke test and build |

## Project layout

```text
src/
  components/   Shared UI
  lessons/      Lesson catalog and one folder per chapter
  stories/      Lesson animations
  lib/          Maths helpers and formula data
  styles.css    Styles for light and dark themes
```

## Adding a lesson

1. Add an entry to `src/lessons/catalog.js`.
2. Add a loader in `src/lessons/registry.js`.
3. Build the lesson in its chapter folder using `LessonLayout`.
4. Run `npm run check`.
