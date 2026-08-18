export function makeRng(seed) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export const randomInt = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));

export const pick = (rng, list) => list[Math.floor(rng() * list.length)];

export function power(base, exponent) {
  if (exponent === 0) return '1';
  if (exponent === 1) return base;
  return `${base}^{${exponent}}`;
}

export function frac(numerator, denominator) {
  return `\\frac{${numerator}}{${denominator}}`;
}

export function units(value, unit) {
  return `${value}\\ \\text{${unit}}`;
}

export function step(ask, correct, distractors, hint) {
  const unique = [];

  for (const option of distractors) {
    if (option !== correct && !unique.includes(option)) unique.push(option);
  }

  return { ask, correct, options: [correct, ...unique], hint };
}

export function shuffleStep(rng, entry) {
  const options = [...entry.options];

  for (let i = options.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return { ask: entry.ask, hint: entry.hint, options, answer: options.indexOf(entry.correct) };
}

export function buildProblem(rng, blueprint) {
  return { ...blueprint, steps: blueprint.steps.map((entry) => shuffleStep(rng, entry)) };
}
