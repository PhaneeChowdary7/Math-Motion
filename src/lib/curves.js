export const cubic = {
  expression: String.raw`f(x) = x^3 - 3x^2 + 2`,
  derivative: String.raw`f'(x) = 3x^2 - 6x`,
  f: (x) => x ** 3 - 3 * x * x + 2,
  df: (x) => 3 * x * x - 6 * x,
  ddf: (x) => 6 * x - 6,
  xDomain: [-1.1, 3.3],
  yDomain: [-3.2, 5],
  criticalPoints: [
    { x: 0, kind: 'maximum' },
    { x: 2, kind: 'minimum' },
  ],
  inflection: 1,
};

export const mvtCurve = {
  expression: String.raw`f(x) = \frac{x^3}{3} - x + 1`,
  derivative: String.raw`f'(x) = x^2 - 1`,
  f: (x) => x ** 3 / 3 - x + 1,
  df: (x) => x * x - 1,
  xDomain: [-2.4, 2.4],
  yDomain: [-1.2, 3.2],
  aRange: [-2.2, 0.6],
  bRange: [0.8, 2.2],
};

export const secantSlope = (curve, a, b) => (curve.f(b) - curve.f(a)) / (b - a);

/**
 * Every interior point whose tangent matches the secant. The Mean Value Theorem
 * promises at least one; a cubic can supply two, which is worth showing.
 */
export function guaranteedPoints(curve, a, b, samples = 2000) {
  const target = secantSlope(curve, a, b);
  const found = [];
  const step = (b - a) / samples;

  let previous = curve.df(a + step * 0.5) - target;

  for (let i = 1; i < samples; i += 1) {
    const x = a + step * (i + 0.5);
    const current = curve.df(x) - target;

    if (previous === 0 || previous * current < 0) {
      let low = x - step;
      let high = x;
      let atLow = curve.df(low) - target;

      for (let k = 0; k < 60; k += 1) {
        const mid = (low + high) / 2;
        const atMid = curve.df(mid) - target;

        if (atLow * atMid <= 0) {
          high = mid;
        } else {
          low = mid;
          atLow = atMid;
        }
      }

      found.push((low + high) / 2);
    }

    previous = current;
  }

  return found;
}
