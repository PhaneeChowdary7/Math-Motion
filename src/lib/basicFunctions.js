export const basicFunctions = [
  {
    id: 'linear',
    label: 'Linear',
    expression: String.raw`f(x) = 2x - 1`,
    f: (x) => 2 * x - 1,
    domainNote: 'every real number',
    rangeNote: 'every real number',
    note: 'A constant rate of change. Equal steps in x always give equal steps in y.',
  },
  {
    id: 'quadratic',
    label: 'Quadratic',
    expression: String.raw`f(x) = x^2 - 2`,
    f: (x) => x * x - 2,
    domainNote: 'every real number',
    rangeNote: 'y ≥ −2',
    note: 'A parabola. Symmetric about its vertex, and it fails the horizontal line test.',
  },
  {
    id: 'cubic',
    label: 'Cubic',
    expression: String.raw`f(x) = x^3 - 3x`,
    f: (x) => x ** 3 - 3 * x,
    domainNote: 'every real number',
    rangeNote: 'every real number',
    note: 'Odd symmetry through the origin, with a turn on each side of it.',
  },
  {
    id: 'reciprocal',
    label: 'Reciprocal',
    expression: String.raw`f(x) = \frac{1}{x}`,
    f: (x) => 1 / x,
    domainNote: 'every real number except 0',
    rangeNote: 'every real number except 0',
    note: 'Undefined at x = 0. The gap in the domain shows up as a vertical asymptote.',
    excludes: (x) => Math.abs(x) < 0.08,
  },
  {
    id: 'root',
    label: 'Square root',
    expression: String.raw`f(x) = \sqrt{x + 3}`,
    f: (x) => Math.sqrt(x + 3),
    domainNote: 'x ≥ −3',
    rangeNote: 'y ≥ 0',
    note: 'A restricted domain: the expression under the root is never allowed to go negative.',
    excludes: (x) => x < -3,
  },
  {
    id: 'absolute',
    label: 'Absolute value',
    expression: String.raw`f(x) = |x| - 1`,
    f: (x) => Math.abs(x) - 1,
    domainNote: 'every real number',
    rangeNote: 'y ≥ −1',
    note: 'Continuous everywhere, but the corner at x = 0 has no single slope.',
  },
];

export const getBasicFunction = (id) =>
  basicFunctions.find((entry) => entry.id === id) ?? basicFunctions[0];

export const FUNCTION_DOMAIN = [-4.6, 4.6];
export const FUNCTION_RANGE = [-4.2, 4.6];

export function sampleSegments(fn, [min, max] = FUNCTION_DOMAIN, step = 0.02) {
  const segments = [];
  let current = [];

  for (let x = min; x <= max + step / 2; x += step) {
    const skip = fn.excludes?.(x);
    const y = skip ? Number.NaN : fn.f(x);

    if (skip || !Number.isFinite(y) || y < FUNCTION_RANGE[0] - 6 || y > FUNCTION_RANGE[1] + 6) {
      if (current.length > 1) segments.push(current);
      current = [];
      continue;
    }

    current.push([x, y]);
  }

  if (current.length > 1) segments.push(current);

  return segments;
}
