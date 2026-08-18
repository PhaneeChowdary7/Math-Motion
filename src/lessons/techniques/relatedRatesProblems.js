import { buildProblem, frac, pick, randomInt, step } from '../../lib/practice.js';

const round2 = (value) => Math.round(value * 100) / 100;

function expandingCircle(rng) {
  const radius = randomInt(rng, 3, 9);
  const rate = randomInt(rng, 2, 6);
  const answer = 2 * radius * rate;

  return buildProblem(rng, {
    prompt: `A ripple spreads as a circle. Its radius grows at ${rate} cm/s. How fast is the area growing when the radius is ${radius} cm?`,
    steps: [
      step(
        'Which equation ties the two quantities together?',
        'A = \\pi r^2',
        ['A = 2\\pi r', 'A = \\pi r', 'A = \\pi^2 r'],
        'You want area in terms of radius, not the circumference.'
      ),
      step(
        'Differentiate both sides with respect to time',
        `${frac('dA', 'dt')} = 2\\pi r \\cdot ${frac('dr', 'dt')}`,
        [
          `${frac('dA', 'dt')} = 2\\pi r`,
          `${frac('dA', 'dt')} = \\pi r^2 \\cdot ${frac('dr', 'dt')}`,
          `${frac('dA', 'dt')} = 2\\pi \\cdot ${frac('dr', 'dt')}`,
        ],
        'The chain rule applies: r depends on t, so differentiating r squared brings out 2r times dr/dt.'
      ),
      step(
        `Substitute r = ${radius} and dr/dt = ${rate}`,
        `2\\pi(${radius})(${rate})`,
        [`2\\pi(${radius})`, `\\pi(${radius})^2(${rate})`, `2\\pi(${rate})`],
        'Only substitute the numbers after differentiating, never before.'
      ),
      step(
        'So the area is growing at',
        `${answer}\\pi \\ \\text{cm}^2/\\text{s}`,
        [
          `${2 * radius}\\pi \\ \\text{cm}^2/\\text{s}`,
          `${radius * rate}\\pi \\ \\text{cm}^2/\\text{s}`,
          `${answer} \\ \\text{cm}^2/\\text{s}`,
        ],
        'Multiply the numbers and keep pi in the answer.'
      ),
    ],
    result: `${frac('dA', 'dt')} = ${answer}\\pi \\ \\text{cm}^2/\\text{s}`,
    note: 'The bigger the ripple, the faster its area grows, even at a constant radial speed.',
    verify: {
      kind: 'rate',
      quantity: (t) => Math.PI * (radius + rate * t) ** 2,
      expected: answer * Math.PI,
    },
  });
}

function growingCube(rng) {
  const side = randomInt(rng, 2, 8);
  const rate = randomInt(rng, 1, 5);
  const answer = 3 * side * side * rate;

  return buildProblem(rng, {
    prompt: `A cube's edge grows at ${rate} mm/s. How fast is its volume growing when the edge is ${side} mm?`,
    steps: [
      step(
        'Which equation ties the two quantities together?',
        'V = s^3',
        ['V = 6s^2', 'V = 3s', 'V = s^2'],
        'Volume of a cube, not its surface area.'
      ),
      step(
        'Differentiate both sides with respect to time',
        `${frac('dV', 'dt')} = 3s^2 \\cdot ${frac('ds', 'dt')}`,
        [
          `${frac('dV', 'dt')} = 3s^2`,
          `${frac('dV', 'dt')} = s^3 \\cdot ${frac('ds', 'dt')}`,
          `${frac('dV', 'dt')} = 3s \\cdot ${frac('ds', 'dt')}`,
        ],
        'Differentiating s cubed gives 3s squared, and the chain rule attaches ds/dt.'
      ),
      step(
        `Substitute s = ${side} and ds/dt = ${rate}`,
        `3(${side})^2(${rate})`,
        [`3(${side})(${rate})`, `(${side})^3(${rate})`, `3(${side})^2`],
        'Square the edge length first, then multiply by 3 and by the rate.'
      ),
      step(
        'So the volume is growing at',
        `${answer} \\ \\text{mm}^3/\\text{s}`,
        [
          `${3 * side * rate} \\ \\text{mm}^3/\\text{s}`,
          `${side * side * rate} \\ \\text{mm}^3/\\text{s}`,
          `${answer} \\ \\text{mm}^2/\\text{s}`,
        ],
        'Volume changes in cubic units per second.'
      ),
    ],
    result: `${frac('dV', 'dt')} = ${answer} \\ \\text{mm}^3/\\text{s}`,
    note: 'Volume accelerates away as the cube grows, because the surface it gains scales with the square of the edge.',
    verify: {
      kind: 'rate',
      quantity: (t) => (side + rate * t) ** 3,
      expected: answer,
    },
  });
}

function slidingLadder(rng) {
  const [x, y, length] = pick(rng, [
    [3, 4, 5],
    [6, 8, 10],
    [9, 12, 15],
    [5, 12, 13],
    [8, 15, 17],
  ]);
  const rate = randomInt(rng, 1, 4);
  const answer = round2(-(x * rate) / y);

  return buildProblem(rng, {
    prompt: `A ${length} m ladder leans on a wall. Its foot slides away at ${rate} m/s. How fast is the top sliding down when the foot is ${x} m out and the top is ${y} m up?`,
    steps: [
      step(
        'Which equation ties the two quantities together?',
        `x^2 + y^2 = ${length * length}`,
        [`x + y = ${length}`, `x^2 + y^2 = ${length}`, `xy = ${length * length}`],
        'The ladder, wall and ground form a right triangle, so Pythagoras applies with the ladder as hypotenuse.'
      ),
      step(
        'Differentiate both sides with respect to time',
        `2x \\cdot ${frac('dx', 'dt')} + 2y \\cdot ${frac('dy', 'dt')} = 0`,
        [
          '2x + 2y = 0',
          `2x \\cdot ${frac('dx', 'dt')} + 2y \\cdot ${frac('dy', 'dt')} = ${2 * length}`,
          `x \\cdot ${frac('dx', 'dt')} + y \\cdot ${frac('dy', 'dt')} = ${length}`,
        ],
        'The ladder length is constant, so the right side differentiates to zero.'
      ),
      step(
        'Solve for dy/dt',
        `${frac('dy', 'dt')} = -${frac('x', 'y')} \\cdot ${frac('dx', 'dt')}`,
        [
          `${frac('dy', 'dt')} = ${frac('x', 'y')} \\cdot ${frac('dx', 'dt')}`,
          `${frac('dy', 'dt')} = -${frac('y', 'x')} \\cdot ${frac('dx', 'dt')}`,
          `${frac('dy', 'dt')} = -xy \\cdot ${frac('dx', 'dt')}`,
        ],
        'Move the x term across and divide by 2y. The minus sign survives.'
      ),
      step(
        `Substitute x = ${x}, y = ${y}, dx/dt = ${rate}`,
        `${answer} \\ \\text{m/s}`,
        [
          `${round2((x * rate) / y)} \\ \\text{m/s}`,
          `${round2(-(y * rate) / x)} \\ \\text{m/s}`,
          `${round2(-x / y)} \\ \\text{m/s}`,
        ],
        'A negative answer is correct here: the top is moving down.'
      ),
    ],
    result: `${frac('dy', 'dt')} = ${answer} \\ \\text{m/s}`,
    note: 'The sign carries the meaning. Negative means the top is descending.',
    verify: {
      kind: 'rate',
      quantity: (t) => Math.sqrt(length * length - (x + rate * t) ** 2),
      expected: -(x * rate) / y,
      tolerance: 0.01,
    },
  });
}

export const relatedRatesGenerators = [expandingCircle, growingCube, slidingLadder];
