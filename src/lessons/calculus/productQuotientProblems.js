import { buildProblem, frac, pick, power, randomInt, step } from '../../lib/practice.js';

const slopes = [2, 3, 4, 5];

function distinctSlope(rng, avoid) {
  return pick(rng, slopes.filter((value) => value !== avoid));
}

function polynomialProduct(rng) {
  const a = randomInt(rng, 2, 5);
  const c = distinctSlope(rng, a);
  const b = randomInt(rng, 1, 6);
  const d = randomInt(rng, 1, 6);
  const first = `(${a}x + ${b})`;
  const second = `(${c}x + ${d})`;

  return buildProblem(rng, {
    prompt: 'Differentiate this product.',
    expression: `y = ${first}${second}`,
    steps: [
      step(
        'Take u to be the first factor. What is u′?',
        `${a}`,
        [`${a}x`, `${b}`, first],
        'The derivative of a straight line is its slope alone.'
      ),
      step(
        'Take v to be the second factor. What is v′?',
        `${c}`,
        [`${c}x`, `${d}`, second],
        'Same rule again: only the slope survives.'
      ),
      step(
        'The product rule says y′ = u′v + uv′. Assemble it',
        `${a}${second} + ${c}${first}`,
        [`${a * c}`, `${a}${first} + ${c}${second}`, `${a}${second} - ${c}${first}`],
        'Each term keeps one factor untouched while the other is differentiated. Never multiply the two derivatives.'
      ),
      step(
        'Expand and collect',
        `${2 * a * c}x + ${a * d + b * c}`,
        [`${a * c}x + ${a * d + b * c}`, `${2 * a * c}x + ${a * d}`, `${a * c}x + ${b * d}`],
        `Multiply out both terms, then add the x coefficients and the constants separately.`
      ),
    ],
    result: `\\frac{dy}{dx} = ${2 * a * c}x + ${a * d + b * c}`,
    note: 'The derivative of a product is never the product of the derivatives.',
    verify: {
      kind: 'derivative',
      f: (x) => (a * x + b) * (c * x + d),
      df: (x) => 2 * a * c * x + (a * d + b * c),
    },
  });
}

function powerTimesSine(rng) {
  const n = randomInt(rng, 2, 4);
  const term = power('x', n);

  return buildProblem(rng, {
    prompt: 'Differentiate this product.',
    expression: `y = ${term} \\sin x`,
    steps: [
      step(
        'With u = x^n, what is u′?',
        `${n}${power('x', n - 1)}`,
        [power('x', n - 1), `${n}${power('x', n)}`, `${n}${power('x', n + 1)}`],
        'Power rule: bring the exponent down, then reduce it by one.'
      ),
      step(
        'With v = sin x, what is v′?',
        '\\cos x',
        ['-\\cos x', '\\sin x', '-\\sin x'],
        'Sine differentiates to cosine, with no sign change.'
      ),
      step(
        'Apply y′ = u′v + uv′',
        `${n}${power('x', n - 1)} \\sin x + ${term} \\cos x`,
        [
          `${n}${power('x', n - 1)} \\cos x`,
          `${n}${power('x', n - 1)} \\sin x - ${term} \\cos x`,
          `${term} \\cos x`,
        ],
        'Two terms, each differentiating one factor and leaving the other alone.'
      ),
    ],
    result: `\\frac{dy}{dx} = ${n}${power('x', n - 1)} \\sin x + ${term} \\cos x`,
    note: 'Both factors depend on x, so both contribute a term.',
    verify: {
      kind: 'derivative',
      f: (x) => x ** n * Math.sin(x),
      df: (x) => n * x ** (n - 1) * Math.sin(x) + x ** n * Math.cos(x),
    },
  });
}

function linearQuotient(rng) {
  const a = randomInt(rng, 2, 5);
  const c = distinctSlope(rng, a);
  let b = randomInt(rng, 1, 6);
  let d = randomInt(rng, 1, 6);

  if (b === a && d === c) b = (b % 6) + 1;
  while (a * d === b * c) d = (d % 6) + 1;

  const top = `${a}x + ${b}`;
  const bottom = `${c}x + ${d}`;
  const numerator = a * d - b * c;

  return buildProblem(rng, {
    prompt: 'Differentiate this quotient.',
    expression: `y = ${frac(top, bottom)}`,
    steps: [
      step(
        'Identify u and v, then find u′ and v′',
        `u′ = ${a}, \\;\\; v′ = ${c}`,
        [`u′ = ${b}, \\;\\; v′ = ${d}`, `u′ = ${a}x, \\;\\; v′ = ${c}x`, `u′ = ${c}, \\;\\; v′ = ${a}`],
        'u is the top, v is the bottom. Both are straight lines, so their derivatives are the slopes.'
      ),
      step(
        'The quotient rule says y′ = (u′v − uv′) / v². Write the numerator',
        `${a}(${bottom}) - ${c}(${top})`,
        [
          `${c}(${top}) - ${a}(${bottom})`,
          `${a}(${bottom}) + ${c}(${top})`,
          `${a}${c}`,
        ],
        'Order matters here, unlike the product rule. The derivative of the top comes first.'
      ),
      step(
        'Simplify that numerator',
        `${numerator}`,
        [`${a * d + b * c}`, `${b * c - a * d}`, `${a * c}x + ${numerator}`],
        'The x terms cancel, leaving only a constant.'
      ),
      step(
        'So the derivative is',
        `${frac(numerator, `(${bottom})^2`)}`,
        [
          `${frac(numerator, bottom)}`,
          `${frac(-numerator, `(${bottom})^2`)}`,
          `${frac(a, c)}`,
        ],
        'The denominator is always squared.'
      ),
    ],
    result: `\\frac{dy}{dx} = ${frac(numerator, `(${bottom})^2`)}`,
    note: 'For a ratio of two straight lines the numerator always collapses to a constant.',
    verify: {
      kind: 'derivative',
      f: (x) => (a * x + b) / (c * x + d),
      df: (x) => (a * d - b * c) / (c * x + d) ** 2,
      domain: [0.5, 3],
    },
  });
}

export const productQuotientGenerators = [polynomialProduct, powerTimesSine, linearQuotient];
