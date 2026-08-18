export const ftcFunctions = [
  {
    id: 'line',
    label: 'Rising line',
    expression: String.raw`f(x) = x`,
    accumulated: String.raw`A(x) = \frac{x^2}{2}`,
    note: 'A steadily taller strip is added each step, so the area curves upward.',
    f: (x) => x,
    F: (x) => (x * x) / 2,
    xDomain: [0, 3],
    fRange: [-0.4, 3.2],
    aRange: [-0.6, 5],
  },
  {
    id: 'signed',
    label: 'Crosses zero',
    expression: String.raw`f(x) = x - 1.5`,
    accumulated: String.raw`A(x) = \frac{x^2}{2} - 1.5x`,
    note: 'Below the axis the strips count as negative, so the area actually falls before it rises.',
    f: (x) => x - 1.5,
    F: (x) => (x * x) / 2 - 1.5 * x,
    xDomain: [0, 3],
    fRange: [-1.8, 1.8],
    aRange: [-1.4, 0.8],
  },
  {
    id: 'wave',
    label: 'Wave',
    expression: String.raw`f(x) = \sin x`,
    accumulated: String.raw`A(x) = 1 - \cos x`,
    note: 'The area climbs while the wave is positive and falls back while it is negative.',
    f: (x) => Math.sin(x),
    F: (x) => 1 - Math.cos(x),
    xDomain: [0, 2 * Math.PI],
    fRange: [-1.3, 1.3],
    aRange: [-0.3, 2.3],
  },
];

export const defaultFtcFunction = ftcFunctions[0];

export function getFtcFunction(id) {
  return ftcFunctions.find((entry) => entry.id === id) ?? defaultFtcFunction;
}
