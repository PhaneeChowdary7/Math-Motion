import { buildProblem, frac, randomInt, step } from '../../lib/practice.js';

function timesExponential(rng) {
  const a = randomInt(rng, 2, 5);
  const exponential = `e^{${a}x}`;

  return buildProblem(rng, {
    prompt: 'Evaluate this integral using integration by parts.',
    expression: `\\int x ${exponential} \\, dx`,
    steps: [
      step(
        'Which factor should be u?',
        'u = x',
        [`u = ${exponential}`, `u = x ${exponential}`, 'u = dx'],
        'Choose the factor that gets simpler when differentiated. x becomes 1; the exponential never simplifies.'
      ),
      step(
        'Then dv =',
        `dv = ${exponential} \\, dx`,
        ['dv = x \\, dx', `dv = ${exponential}`, 'dv = dx'],
        'Whatever is left over, including the dx, becomes dv.'
      ),
      step(
        'Compute du and v',
        `du = dx, \\;\\; v = ${frac(exponential, a)}`,
        [
          `du = dx, \\;\\; v = ${a}${exponential}`,
          `du = x \\, dx, \\;\\; v = ${frac(exponential, a)}`,
          `du = dx, \\;\\; v = ${exponential}`,
        ],
        `Integrating the exponential divides by ${a}, it does not multiply.`
      ),
      step(
        'Apply uv minus the integral of v du',
        `${frac(`x ${exponential}`, a)} - ${frac(exponential, a * a)} + C`,
        [
          `${frac(`x ${exponential}`, a)} + ${frac(exponential, a * a)} + C`,
          `${frac(`x ${exponential}`, a)} - ${frac(exponential, a)} + C`,
          `${frac(`x ${exponential}`, a)} - ${frac(`x ${exponential}`, a * a)} + C`,
        ],
        `The leftover integral divides by ${a} a second time, giving ${a * a}.`
      ),
    ],
    result: `\\int x ${exponential} \\, dx = ${frac(`x ${exponential}`, a)} - ${frac(exponential, a * a)} + C`,
    note: 'Each integration of the exponential costs another factor of the coefficient.',
    verify: {
      kind: 'integral',
      integrand: (x) => x * Math.exp(a * x),
      antiderivative: (x) => (x * Math.exp(a * x)) / a - Math.exp(a * x) / (a * a),
    },
  });
}

function timesSine(rng) {
  const a = randomInt(rng, 2, 5);

  return buildProblem(rng, {
    prompt: 'Evaluate this integral using integration by parts.',
    expression: `\\int x \\sin(${a}x) \\, dx`,
    steps: [
      step(
        'Which factor should be u?',
        'u = x',
        [`u = \\sin(${a}x)`, `u = x \\sin(${a}x)`, 'u = dx'],
        'Pick the factor that simplifies when differentiated. Sine just cycles.'
      ),
      step(
        'Then dv =',
        `dv = \\sin(${a}x) \\, dx`,
        ['dv = x \\, dx', `dv = \\sin(${a}x)`, `dv = \\cos(${a}x) \\, dx`],
        'The remaining factor together with dx becomes dv.'
      ),
      step(
        'Compute du and v',
        `du = dx, \\;\\; v = -${frac(`\\cos(${a}x)`, a)}`,
        [
          `du = dx, \\;\\; v = ${frac(`\\cos(${a}x)`, a)}`,
          `du = dx, \\;\\; v = -${a}\\cos(${a}x)`,
          `du = x \\, dx, \\;\\; v = -${frac(`\\cos(${a}x)`, a)}`,
        ],
        'Integrating sine gives minus cosine, then divide by the coefficient inside.'
      ),
      step(
        'Apply uv minus the integral of v du',
        `-${frac(`x \\cos(${a}x)`, a)} + ${frac(`\\sin(${a}x)`, a * a)} + C`,
        [
          `-${frac(`x \\cos(${a}x)`, a)} - ${frac(`\\sin(${a}x)`, a * a)} + C`,
          `${frac(`x \\cos(${a}x)`, a)} + ${frac(`\\sin(${a}x)`, a * a)} + C`,
          `-${frac(`x \\cos(${a}x)`, a)} + ${frac(`\\sin(${a}x)`, a)} + C`,
        ],
        'Subtracting a negative cosine integral flips the sign to a plus.'
      ),
    ],
    result: `\\int x \\sin(${a}x) \\, dx = -${frac(`x \\cos(${a}x)`, a)} + ${frac(`\\sin(${a}x)`, a * a)} + C`,
    note: 'Watch the sign: minus a minus becomes plus.',
    verify: {
      kind: 'integral',
      integrand: (x) => x * Math.sin(a * x),
      antiderivative: (x) => (-x * Math.cos(a * x)) / a + Math.sin(a * x) / (a * a),
    },
  });
}

function timesLogarithm(rng) {
  const n = randomInt(rng, 1, 3);
  const powerTerm = n === 1 ? 'x' : `x^{${n}}`;
  const raised = n + 1;

  return buildProblem(rng, {
    prompt: 'Evaluate this integral using integration by parts.',
    expression: `\\int ${powerTerm} \\ln x \\, dx`,
    steps: [
      step(
        'Which factor should be u?',
        'u = \\ln x',
        [`u = ${powerTerm}`, `u = ${powerTerm} \\ln x`, 'u = dx'],
        'Here the logarithm is the one that simplifies: differentiating it gives 1 over x. There is no elementary antiderivative to reach for first.'
      ),
      step(
        'Then dv =',
        `dv = ${powerTerm} \\, dx`,
        ['dv = \\ln x \\, dx', `dv = ${powerTerm}`, 'dv = dx'],
        'The power of x together with dx becomes dv.'
      ),
      step(
        'Compute du and v',
        `du = ${frac('dx', 'x')}, \\;\\; v = ${frac(`x^{${raised}}`, raised)}`,
        [
          `du = ${frac('dx', 'x')}, \\;\\; v = ${powerTerm}`,
          `du = x \\, dx, \\;\\; v = ${frac(`x^{${raised}}`, raised)}`,
          `du = ${frac('dx', 'x')}, \\;\\; v = x^{${raised}}`,
        ],
        'The derivative of the logarithm is 1 over x, and the power rule raises the exponent by one.'
      ),
      step(
        'Apply uv minus the integral of v du',
        `${frac(`x^{${raised}} \\ln x`, raised)} - ${frac(`x^{${raised}}`, raised * raised)} + C`,
        [
          `${frac(`x^{${raised}} \\ln x`, raised)} + ${frac(`x^{${raised}}`, raised * raised)} + C`,
          `${frac(`x^{${raised}} \\ln x`, raised)} - ${frac(`x^{${raised}}`, raised)} + C`,
          `${frac(`x^{${raised}} \\ln x`, raised)} - ${frac('\\ln x', raised * raised)} + C`,
        ],
        `The leftover integral divides by ${raised} again.`
      ),
    ],
    result: `\\int ${powerTerm} \\ln x \\, dx = ${frac(`x^{${raised}} \\ln x`, raised)} - ${frac(`x^{${raised}}`, raised * raised)} + C`,
    note: 'The 1 over x from the logarithm cancels a power of x, which is what makes the leftover integral easy.',
    verify: {
      kind: 'integral',
      integrand: (x) => x ** n * Math.log(x),
      antiderivative: (x) => (x ** raised * Math.log(x)) / raised - x ** raised / (raised * raised),
      domain: [0.3, 3],
    },
  });
}

export const byPartsGenerators = [timesExponential, timesSine, timesLogarithm];
