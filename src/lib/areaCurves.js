export const areaPairs = [
  {
    id: 'line-parabola',
    label: 'Line & parabola',
    top: { expression: String.raw`y = x + 2`, f: (x) => x + 2 },
    bottom: { expression: String.raw`y = x^2`, f: (x) => x * x },
    crossings: [-1, 2],
    xDomain: [-2.4, 3.2],
    yDomain: [-1.2, 6],
    exact: (a, b) => {
      const F = (x) => (x * x) / 2 + 2 * x - (x * x * x) / 3;
      return F(b) - F(a);
    },
    note: 'The line sits above the parabola between the crossings, so the strip height is (x + 2) − x².',
  },
  {
    id: 'parabolas',
    label: 'Two parabolas',
    top: { expression: String.raw`y = 4 - x^2`, f: (x) => 4 - x * x },
    bottom: { expression: String.raw`y = x^2 - 4`, f: (x) => x * x - 4 },
    crossings: [-2, 2],
    xDomain: [-3.2, 3.2],
    yDomain: [-5.5, 5.5],
    exact: (a, b) => {
      const F = (x) => 8 * x - (2 * x * x * x) / 3;
      return F(b) - F(a);
    },
    note: 'A symmetric lens. The height is (4 − x²) − (x² − 4) = 8 − 2x².',
  },
  {
    id: 'sine-cosine',
    label: 'Sine & cosine',
    top: { expression: String.raw`y = \sin x`, f: (x) => Math.sin(x) },
    bottom: { expression: String.raw`y = \cos x`, f: (x) => Math.cos(x) },
    crossings: [Math.PI / 4, (5 * Math.PI) / 4],
    xDomain: [-0.5, 4.8],
    yDomain: [-1.35, 1.35],
    exact: (a, b) => {
      const F = (x) => -Math.cos(x) - Math.sin(x);
      return F(b) - F(a);
    },
    note: 'The curves meet wherever tan x = 1. Between those two meetings sine stays on top, and the enclosed area works out to exactly 2√2.',
  },
];

export const defaultPair = areaPairs[0];

export function getPair(id) {
  return areaPairs.find((entry) => entry.id === id) ?? defaultPair;
}

export const gapAt = (pair, x) => pair.top.f(x) - pair.bottom.f(x);

export function stripSum(pair, a, b, n) {
  const width = (b - a) / n;
  let total = 0;

  for (let i = 0; i < n; i += 1) {
    total += gapAt(pair, a + (i + 0.5) * width) * width;
  }

  return total;
}

export function strips(pair, a, b, n) {
  const width = (b - a) / n;
  const bars = [];

  for (let i = 0; i < n; i += 1) {
    const x0 = a + i * width;
    const mid = x0 + width / 2;

    bars.push({ x0, x1: x0 + width, top: pair.top.f(mid), bottom: pair.bottom.f(mid) });
  }

  return bars;
}
