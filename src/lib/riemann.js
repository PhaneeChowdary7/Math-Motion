export const f = (x) => x * x;

export const exactArea = (a, b) => (b ** 3 - a ** 3) / 3;

export const rules = [
  ['left', 'Left'],
  ['midpoint', 'Middle'],
  ['right', 'Right'],
];

export function samplePoint(x0, x1, rule) {
  if (rule === 'left') return x0;
  if (rule === 'right') return x1;
  return (x0 + x1) / 2;
}

export function partition(a, b, n, rule) {
  const width = (b - a) / n;
  const bars = [];

  for (let i = 0; i < n; i += 1) {
    const x0 = a + i * width;
    const x1 = x0 + width;
    bars.push({ x0, x1, width, height: f(samplePoint(x0, x1, rule)) });
  }

  return bars;
}

export function riemannSum(a, b, n, rule) {
  const width = (b - a) / n;
  let total = 0;

  for (let i = 0; i < n; i += 1) {
    const x0 = a + i * width;
    total += f(samplePoint(x0, x0 + width, rule)) * width;
  }

  return total;
}
