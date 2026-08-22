export const MAX_TERMS = 24;

export const families = [
  {
    id: 'arithmetic',
    label: 'Arithmetic',
    rule: String.raw`a_n = a_1 + (n - 1)d`,
    sum: String.raw`S_n = \frac{n}{2}\left[\,2a_1 + (n-1)d\,\right]`,
    note: 'A constant difference is added each step, so the terms sit on a straight line.',

    term: (a1, d, n) => a1 + (n - 1) * d,
    partial: (a1, d, n) => (n / 2) * (2 * a1 + (n - 1) * d),
    paramLabel: 'common difference d',
    paramRange: [-3, 3],
    paramStep: 0.25,
  },
  {
    id: 'geometric',
    label: 'Geometric',
    rule: String.raw`a_n = a_1 r^{\,n-1}`,
    sum: String.raw`S_n = a_1 \frac{1 - r^n}{1 - r}, \quad r \neq 1`,
    note: 'A constant ratio multiplies each step, so the terms grow or decay by a fixed factor.',

    term: (a1, r, n) => a1 * r ** (n - 1),
    partial: (a1, r, n) => (r === 1 ? a1 * n : a1 * ((1 - r ** n) / (1 - r))),
    paramLabel: 'common ratio r',
    paramRange: [-1.6, 2.2],
    paramStep: 0.05,
  },
];

export const getFamily = (id) => families.find((entry) => entry.id === id) ?? families[0];

export function buildTerms(family, first, param, count = MAX_TERMS) {
  const terms = [];
  let running = 0;

  for (let n = 1; n <= count; n += 1) {
    const value = family.term(first, param, n);
    running += value;
    terms.push({ n, value, running });
  }

  return terms;
}

export function convergence(family, first, param) {
  if (family.id !== 'geometric') {
    return { converges: false, reason: 'An arithmetic series keeps adding a fixed step, so its total grows without bound.' };
  }

  if (Math.abs(param) < 1) {
    return {
      converges: true,
      limit: first / (1 - param),
      reason: 'Each term is a fixed fraction of the one before, so the leftovers shrink fast enough for the total to settle.',
    };
  }

  if (param === 1) {
    return { converges: false, reason: 'Every term is the same, so the running total climbs by that amount forever.' };
  }

  return {
    converges: false,
    reason: 'The terms do not shrink, so the running total never settles on a value.',
  };
}
