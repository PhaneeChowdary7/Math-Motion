import { buildProblem, frac, power, randomInt, step } from '../../lib/practice.js';

function linearInside(rng) {
  const a = randomInt(rng, 2, 5);
  const b = randomInt(rng, 1, 7);
  const n = randomInt(rng, 2, 4);
  const inner = `${a}x + ${b}`;
  const outer = `(${inner})`;
  const denominator = a * (n + 1);

  return buildProblem(rng, {
    prompt: 'Evaluate this integral using a substitution.',
    expression: `\\int ${power(outer, n)} \\, dx`,
    steps: [
      step(
        'Which substitution simplifies this?',
        `u = ${inner}`,
        ['u = x', `u = ${power(outer, n)}`, `u = ${a}x`],
        'Choose the inside of the bracket, so the awkward part becomes a single letter.'
      ),
      step(
        'Then du =',
        `${a} \\, dx`,
        ['dx', `${a}x \\, dx`, `${b} \\, dx`],
        'Differentiate u with respect to x, then multiply through by dx.'
      ),
      step(
        'Rewrite the integral in u',
        `${frac(1, a)} \\int ${power('u', n)} \\, du`,
        [
          `\\int ${power('u', n)} \\, du`,
          `${a} \\int ${power('u', n)} \\, du`,
          `${frac(1, a)} \\int ${power('u', n + 1)} \\, du`,
        ],
        `Since du is ${a} dx, we have dx = du over ${a}, so that factor comes out front.`
      ),
      step(
        'Integrate and substitute back',
        `${frac(power(outer, n + 1), denominator)} + C`,
        [
          `${frac(power(outer, n + 1), n + 1)} + C`,
          `${frac(power(outer, n), denominator)} + C`,
          `${a}${frac(power(outer, n + 1), n + 1)} + C`,
        ],
        `Raise the exponent to ${n + 1}, divide by ${n + 1}, and keep the factor from the substitution.`
      ),
    ],
    result: `\\int ${power(outer, n)} \\, dx = ${frac(power(outer, n + 1), denominator)} + C`,
    note: 'Differentiate the answer and the chain rule hands the integrand straight back.',
    verify: {
      kind: 'integral',
      integrand: (x) => (a * x + b) ** n,
      antiderivative: (x) => (a * x + b) ** (n + 1) / denominator,
    },
  });
}

function quadraticInside(rng) {
  const c = randomInt(rng, 1, 8);
  const n = randomInt(rng, 2, 4);
  const inner = `x^2 + ${c}`;
  const outer = `(${inner})`;
  const denominator = 2 * (n + 1);

  return buildProblem(rng, {
    prompt: 'Evaluate this integral using a substitution.',
    expression: `\\int x ${power(outer, n)} \\, dx`,
    steps: [
      step(
        'Which substitution simplifies this?',
        `u = ${inner}`,
        ['u = x', `u = ${power(outer, n)}`, 'u = x^2'],
        'Pick the inside of the bracket, and notice its derivative is already sitting outside.'
      ),
      step(
        'Then du =',
        '2x \\, dx',
        ['x \\, dx', '2 \\, dx', `(2x + ${c}) \\, dx`],
        'Differentiate x squared plus c to get 2x, then multiply by dx.'
      ),
      step(
        'The integral has x dx, not 2x dx. Rewrite it',
        `${frac(1, 2)} \\int ${power('u', n)} \\, du`,
        [
          `\\int ${power('u', n)} \\, du`,
          `2 \\int ${power('u', n)} \\, du`,
          `${frac(1, 2)} \\int ${power('u', n + 1)} \\, du`,
        ],
        'x dx is half of du, so a factor of one half comes out front.'
      ),
      step(
        'Integrate and substitute back',
        `${frac(power(outer, n + 1), denominator)} + C`,
        [
          `${frac(power(outer, n + 1), n + 1)} + C`,
          `${frac(power(outer, n), denominator)} + C`,
          `2${frac(power(outer, n + 1), n + 1)} + C`,
        ],
        `Divide by ${n + 1} from the power rule and by 2 from the substitution.`
      ),
    ],
    result: `\\int x ${power(outer, n)} \\, dx = ${frac(power(outer, n + 1), denominator)} + C`,
    note: 'The stray x outside was exactly what the substitution needed.',
    verify: {
      kind: 'integral',
      integrand: (x) => x * (x * x + c) ** n,
      antiderivative: (x) => (x * x + c) ** (n + 1) / denominator,
    },
  });
}

function cosineInside(rng) {
  const c = randomInt(rng, 1, 6);
  const inner = `x^2 + ${c}`;

  return buildProblem(rng, {
    prompt: 'Evaluate this integral using a substitution.',
    expression: `\\int x \\cos(${inner}) \\, dx`,
    steps: [
      step(
        'Which substitution simplifies this?',
        `u = ${inner}`,
        ['u = x', `u = \\cos(${inner})`, 'u = x \\cos(x)'],
        'Substitute the argument of the cosine.'
      ),
      step(
        'Then du =',
        '2x \\, dx',
        ['x \\, dx', '2 \\, dx', '-2x \\, dx'],
        'Differentiate x squared plus c with respect to x, then multiply by dx.'
      ),
      step(
        'Rewrite the integral in u',
        `${frac(1, 2)} \\int \\cos(u) \\, du`,
        ['\\int \\cos(u) \\, du', '2 \\int \\cos(u) \\, du', `${frac(1, 2)} \\int \\sin(u) \\, du`],
        'The x dx in front supplies half of du.'
      ),
      step(
        'Integrate and substitute back',
        `${frac(`\\sin(${inner})`, 2)} + C`,
        [
          `\\sin(${inner}) + C`,
          `-${frac(`\\sin(${inner})`, 2)} + C`,
          `${frac(`\\cos(${inner})`, 2)} + C`,
        ],
        'The integral of cosine is sine, and the one half stays.'
      ),
    ],
    result: `\\int x \\cos(${inner}) \\, dx = ${frac(`\\sin(${inner})`, 2)} + C`,
    note: 'Substitution turned an awkward product into a standard integral.',
    verify: {
      kind: 'integral',
      integrand: (x) => x * Math.cos(x * x + c),
      antiderivative: (x) => Math.sin(x * x + c) / 2,
    },
  });
}

export const uSubstitutionGenerators = [linearInside, quadraticInside, cosineInside];
