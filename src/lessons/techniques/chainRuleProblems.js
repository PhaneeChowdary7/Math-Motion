import { buildProblem, power, randomInt, step } from '../../lib/practice.js';

function binomialPower(rng) {
  const a = randomInt(rng, 2, 5);
  const b = randomInt(rng, 1, 6);
  const n = randomInt(rng, 2, 5);
  const inner = `${a}x + ${b}`;
  const outer = `(${inner})`;

  return buildProblem(rng, {
    prompt: 'Differentiate this composed function.',
    expression: `y = ${power(outer, n)}`,
    steps: [
      step(
        'What is the inner function u?',
        inner,
        ['x', `${a}x`, power(outer, n)],
        'The inner function is whatever sits inside the brackets.'
      ),
      step(
        'With y = u^n, what is dy/du?',
        `${n}${power('u', n - 1)}`,
        [`${n}${power('u', n)}`, power('u', n - 1), `${n}${power('x', n - 1)}`],
        'Bring the exponent down and reduce it by one, keeping everything in terms of u.'
      ),
      step(
        'What is du/dx?',
        `${a}`,
        [`${a}x`, `${b}`, inner],
        'The derivative of a straight line ax + b is just its slope.'
      ),
      step(
        'Multiply the two rates. dy/dx =',
        `${n * a}${power(outer, n - 1)}`,
        [`${n}${power(outer, n - 1)}`, `${n * a}${power(outer, n)}`, `${a}${power(outer, n - 1)}`],
        'dy/dx = dy/du multiplied by du/dx. Forgetting the second factor is the classic slip.'
      ),
    ],
    result: `\\frac{dy}{dx} = ${n * a}${power(outer, n - 1)}`,
    note: 'The inner derivative multiplies the whole thing.',
    verify: {
      kind: 'derivative',
      f: (x) => (a * x + b) ** n,
      df: (x) => n * a * (a * x + b) ** (n - 1),
    },
  });
}

function quadraticInside(rng) {
  const c = randomInt(rng, 1, 9);
  const n = randomInt(rng, 2, 4);
  const inner = `x^2 + ${c}`;
  const outer = `(${inner})`;

  return buildProblem(rng, {
    prompt: 'Differentiate this composed function.',
    expression: `y = ${power(outer, n)}`,
    steps: [
      step(
        'What is the inner function u?',
        inner,
        ['x^2', `${c}`, power(outer, n)],
        'Everything inside the brackets is the inner function.'
      ),
      step(
        'What is dy/du?',
        `${n}${power('u', n - 1)}`,
        [`${n}${power('u', n)}`, power('u', n - 1), `${n}${power('x', n - 1)}`],
        'Treat u as a single variable and use the power rule.'
      ),
      step(
        'What is du/dx?',
        '2x',
        ['x', '2', `2x + ${c}`],
        'Differentiate x squared plus a constant term by term. The constant disappears.'
      ),
      step(
        'Multiply the two rates. dy/dx =',
        `${2 * n}x${power(outer, n - 1)}`,
        [`${n}x${power(outer, n - 1)}`, `${2 * n}x${power(outer, n)}`, `${2 * n}${power(outer, n - 1)}`],
        'The 2x from the inside multiplies the n from the outside.'
      ),
    ],
    result: `\\frac{dy}{dx} = ${2 * n}x${power(outer, n - 1)}`,
    note: 'The 2x comes from differentiating the inside.',
    verify: {
      kind: 'derivative',
      f: (x) => (x * x + c) ** n,
      df: (x) => 2 * n * x * (x * x + c) ** (n - 1),
    },
  });
}

function sineOfLine(rng) {
  const a = randomInt(rng, 2, 6);
  const b = randomInt(rng, 1, 5);
  const inner = `${a}x + ${b}`;

  return buildProblem(rng, {
    prompt: 'Differentiate this composed function.',
    expression: `y = \\sin(${inner})`,
    steps: [
      step(
        'What is the inner function u?',
        inner,
        ['\\sin(x)', `${a}x`, `\\sin(${inner})`],
        'The inner function is the argument of the sine.'
      ),
      step(
        'With y = sin(u), what is dy/du?',
        '\\cos(u)',
        ['-\\cos(u)', '\\sin(u)', '-\\sin(u)'],
        'The derivative of sine is cosine, with no sign change.'
      ),
      step(
        'What is du/dx?',
        `${a}`,
        [`${a}x`, `${b}`, inner],
        'The derivative of a straight line is its slope.'
      ),
      step(
        'Multiply the two rates. dy/dx =',
        `${a}\\cos(${inner})`,
        [`\\cos(${inner})`, `${a}\\sin(${inner})`, `-${a}\\sin(${inner})`],
        'Keep the inside untouched and multiply by its derivative.'
      ),
    ],
    result: `\\frac{dy}{dx} = ${a}\\cos(${inner})`,
    note: 'The inside is copied unchanged into the cosine.',
    verify: {
      kind: 'derivative',
      f: (x) => Math.sin(a * x + b),
      df: (x) => a * Math.cos(a * x + b),
    },
  });
}

export const chainRuleGenerators = [binomialPower, quadraticInside, sineOfLine];
