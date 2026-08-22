const DELTA_CAP = 1.5;

export const limitFunctions = [
  {
    id: 'hole',
    label: 'Hole',
    title: 'Removable hole',
    expression: String.raw`f(x) = \frac{x^2 - 1}{x - 1}`,
    expressionText: 'f(x) = (x squared minus 1) over (x minus 1)',
    note: 'Cancels to x + 1 everywhere except x = 1, where it is undefined.',
    a: 1,
    limit: 2,
    limitExists: true,
    definedAtA: false,
    xDomain: [-3, 4],
    yDomain: [-1, 5],
    samples: 700,
    f: (x) => x + 1,
    deltaFor: (epsilon) => Math.min(epsilon, DELTA_CAP),
    verdict: 'The limit is 2 even though f(1) does not exist. A limit never asks about the point itself.',
  },
  {
    id: 'continuous',
    label: 'Continuous',
    title: 'Continuous point',
    expression: String.raw`f(x) = \frac{x^2}{2} + 1`,
    expressionText: 'f(x) = x squared over 2, plus 1',
    note: 'Defined and unbroken at x = 1, so the limit simply equals f(1).',
    a: 1,
    limit: 1.5,
    limitExists: true,
    definedAtA: true,
    xDomain: [-3, 4],
    yDomain: [-1, 5],
    samples: 700,
    f: (x) => (x * x) / 2 + 1,
    deltaFor: (epsilon) => Math.min(1, (2 * epsilon) / 3),
    verdict: 'Function value and limit agree, which is the definition of continuity at a point.',
  },
  {
    id: 'jump',
    label: 'Jump',
    title: 'Jump discontinuity',
    expression: String.raw`f(x) = \begin{cases} x + 1 & x < 1 \\ x + 2.5 & x \ge 1 \end{cases}`,
    expressionText: 'f(x) = x + 1 for x below 1, and x + 2.5 for x at or above 1',
    note: 'The two sides march toward different heights: 2 from the left, 3.5 from the right.',
    a: 1,
    limit: 2.75,
    limitExists: false,
    definedAtA: true,
    leftLimit: 2,
    rightLimit: 3.5,
    xDomain: [-3, 4],
    yDomain: [-1, 5],
    samples: 700,
    f: (x) => (x < 1 ? x + 1 : x + 2.5),
    deltaFor: (epsilon) => (epsilon > 0.75 ? Math.min(epsilon - 0.75, DELTA_CAP) : null),
    verdict: 'Left and right limits disagree (2 vs 3.5), so no single limit exists.',
  },
  {
    id: 'blowup',
    label: 'Blow-up',
    title: 'Vertical asymptote',
    expression: String.raw`f(x) = \frac{1}{(x - 1)^2}`,
    expressionText: 'f(x) = 1 over (x minus 1) squared',
    note: 'Values climb without bound as x nears 1, so they never settle anywhere.',
    a: 1,
    limit: null,
    limitExists: false,
    definedAtA: false,
    xDomain: [-2, 4],
    yDomain: [-1, 6],
    samples: 900,
    f: (x) => 1 / ((x - 1) * (x - 1)),
    deltaFor: () => null,
    verdict: 'f grows without bound, so no finite L exists and no ε-band can ever contain it.',
  },
  {
    id: 'oscillation',
    label: 'Oscillation',
    title: 'Endless oscillation',
    expression: String.raw`f(x) = \sin\!\left(\frac{1}{x - 1}\right)`,
    expressionText: 'f(x) = sine of 1 over (x minus 1)',
    note: 'Swings faster and faster near x = 1, never settling on any single height.',
    a: 1,
    limit: 0,
    limitExists: false,
    definedAtA: false,
    xDomain: [-1, 3],
    yDomain: [-1.6, 1.6],
    samples: 4200,
    f: (x) => Math.sin(1 / (x - 1)),
    deltaFor: (epsilon) => (epsilon > 1 ? DELTA_CAP : null),
    verdict: 'However small δ gets, the values still sweep the whole range from −1 to 1.',
  },
];

export const defaultFunction = limitFunctions[0];

export function getFunction(id) {
  return limitFunctions.find((entry) => entry.id === id) ?? defaultFunction;
}

export function valueAt(fn, x) {
  if (!fn.definedAtA && Math.abs(x - fn.a) < 1e-9) return null;

  const y = fn.f(x);
  return Number.isFinite(y) ? y : null;
}

const segmentCache = new WeakMap();

export function sampleSegments(fn) {
  const cached = segmentCache.get(fn);
  if (cached) return cached;

  const segments = buildSegments(fn);
  segmentCache.set(fn, segments);

  return segments;
}

function buildSegments(fn) {
  const [x0, x1] = fn.xDomain;
  const [y0, y1] = fn.yDomain;
  const count = fn.samples ?? 700;
  const step = (x1 - x0) / count;
  const overflow = (y1 - y0) * 0.15;

  const segments = [];
  let current = [];

  const flush = () => {
    if (current.length > 1) segments.push(current);
    current = [];
  };

  for (let i = 0; i <= count; i += 1) {
    const x = x0 + i * step;

    if (Math.abs(x - fn.a) < step * 0.75) {
      flush();
      continue;
    }

    const y = fn.f(x);

    if (!Number.isFinite(y) || y < y0 - overflow || y > y1 + overflow) {
      flush();
      continue;
    }

    current.push([x, y]);
  }

  flush();
  return segments;
}
