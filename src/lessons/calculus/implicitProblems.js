import { buildProblem, frac, randomInt, step } from '../../lib/practice.js';

function circleLike(rng) {
  const r2 = randomInt(rng, 2, 9) ** 2;

  return buildProblem(rng, {
    prompt: 'Differentiate both sides with respect to x, then solve for dy/dx.',
    expression: `x^2 + y^2 = ${r2}`,
    steps: [
      step(
        'Differentiating x^2 with respect to x gives',
        '2x',
        ['x', '2', '2y'],
        'This term has no y in it, so it differentiates normally.'
      ),
      step(
        'Differentiating y^2 with respect to x gives',
        String.raw`2y\frac{dy}{dx}`,
        ['2y', String.raw`2\frac{dy}{dx}`, String.raw`y^2\frac{dy}{dx}`],
        'y is a function of x, so the chain rule attaches a factor of dy/dx.'
      ),
      step(
        'Solving 2x + 2y·dy/dx = 0 gives dy/dx =',
        frac('-x', 'y'),
        [frac('x', 'y'), frac('-y', 'x'), '-x'],
        'Move 2x across, then divide by 2y.'
      ),
    ],
    result: String.raw`\frac{dy}{dx} = ${frac('-x', 'y')}`,
    note: 'The slope depends on both coordinates, which is why an implicit answer keeps y in it.',
  });
}

function weightedConic(rng) {
  const a = randomInt(rng, 2, 6);
  const b = randomInt(rng, 2, 6);
  const c = randomInt(rng, 4, 30);

  return buildProblem(rng, {
    prompt: 'Differentiate both sides with respect to x, then solve for dy/dx.',
    expression: `${a}x^2 + ${b}y^2 = ${c}`,
    steps: [
      step(
        `Differentiating ${a}x^2 gives`,
        `${2 * a}x`,
        [`${a}x`, `${2 * a}`, `${2 * a}y`],
        'Bring the exponent down and multiply by the coefficient.'
      ),
      step(
        `Differentiating ${b}y^2 gives`,
        String.raw`${2 * b}y\frac{dy}{dx}`,
        [`${2 * b}y`, String.raw`${b}y\frac{dy}{dx}`, String.raw`${2 * b}\frac{dy}{dx}`],
        'Every y term picks up a dy/dx from the chain rule.'
      ),
      step(
        'Solving for dy/dx gives',
        frac(`-${2 * a}x`, `${2 * b}y`),
        [frac(`${2 * a}x`, `${2 * b}y`), frac(`-${2 * b}y`, `${2 * a}x`), frac(`-${a}x`, `${b}y`)],
        'Collect the dy/dx term on one side and divide.'
      ),
    ],
    result: String.raw`\frac{dy}{dx} = ${frac(`-${2 * a}x`, `${2 * b}y`)}`,
    note: 'Leaving the coefficients unsimplified is fine; the shape of the answer is what matters.',
  });
}

function productTerm(rng) {
  const k = randomInt(rng, 2, 12);

  return buildProblem(rng, {
    prompt: 'This one needs the product rule before you can solve for dy/dx.',
    expression: `xy = ${k}`,
    steps: [
      step(
        'Differentiating the product xy with respect to x gives',
        String.raw`y + x\frac{dy}{dx}`,
        [String.raw`x\frac{dy}{dx}`, String.raw`\frac{dy}{dx}`, 'y + x'],
        'Product rule: derivative of the first times the second, plus the first times the derivative of the second.'
      ),
      step(
        `Differentiating the constant ${k} gives`,
        '0',
        [`${k}`, '1', String.raw`\frac{dy}{dx}`],
        'A constant does not change, so its rate of change is zero.'
      ),
      step(
        'Solving y + x·dy/dx = 0 gives dy/dx =',
        frac('-y', 'x'),
        [frac('-x', 'y'), frac('y', 'x'), '-y'],
        'Move y across, then divide by x.'
      ),
    ],
    result: String.raw`\frac{dy}{dx} = ${frac('-y', 'x')}`,
    note: 'Any term mixing x and y needs the product rule first.',
  });
}

export const implicitGenerators = [circleLike, weightedConic, productTerm];
