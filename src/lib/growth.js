export const E = Math.E;

export const GROWTH_DOMAIN = [-3.4, 3.4];
export const GROWTH_RANGE = [-3.4, 3.4];

export const bases = [
  { id: 'two', value: 2, label: 'base 2', note: 'Doubling. Each step to the right multiplies the height by 2.' },
  { id: 'e', value: E, label: 'base e', note: 'The natural base, about 2.718. It is the one whose growth rate equals its own height.' },
  { id: 'ten', value: 10, label: 'base 10', note: 'Each step to the right multiplies by 10, which is why log base 10 counts digits.' },
  { id: 'half', value: 0.5, label: 'base ½', note: 'A base below 1 shrinks instead of growing, so the curve decays to the right.' },
];

export const getBase = (id) => bases.find((entry) => entry.id === id) ?? bases[0];

export const logBase = (base, value) => Math.log(value) / Math.log(base);

export function exponentialSamples(base, [min, max] = GROWTH_DOMAIN, step = 0.02) {
  const points = [];

  for (let x = min; x <= max + step / 2; x += step) {
    const y = base ** x;
    if (y >= GROWTH_RANGE[0] - 1 && y <= GROWTH_RANGE[1] + 1) points.push([x, y]);
  }

  return points;
}

export function logarithmSamples(base, [, max] = GROWTH_DOMAIN, step = 0.01) {
  const points = [];

  for (let x = step; x <= max + step / 2; x += step) {
    const y = logBase(base, x);
    if (y >= GROWTH_RANGE[0] - 1 && y <= GROWTH_RANGE[1] + 1) points.push([x, y]);
  }

  return points;
}
