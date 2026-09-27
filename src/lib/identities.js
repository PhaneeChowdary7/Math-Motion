const rad = (degrees) => (degrees * Math.PI) / 180;

// Each identity is checked numerically: lhs and rhs are evaluated at the current
// inputs, and terms breaks the right-hand side into the pieces that add up to it.
// Algebra identities take (a, b); trig identities take angles (A, B) in degrees.
export const identities = [
  {
    id: 'square-sum',
    family: 'algebra',
    label: '(a + b)²',
    latex: '(a + b)^2 = a^2 + 2ab + b^2',
    inputs: ['a', 'b'],
    lhs: (a, b) => (a + b) ** 2,
    rhs: (a, b) => a * a + 2 * a * b + b * b,
    terms: (a, b) => [
      ['a^2', a * a],
      ['2ab', 2 * a * b],
      ['b^2', b * b],
    ],
    note: 'The square of side a + b splits into an a × a square, a b × b square and two a × b strips. Forgetting the 2ab strips is the classic mistake.',
  },
  {
    id: 'square-diff',
    family: 'algebra',
    label: '(a − b)²',
    latex: '(a - b)^2 = a^2 - 2ab + b^2',
    inputs: ['a', 'b'],
    lhs: (a, b) => (a - b) ** 2,
    rhs: (a, b) => a * a - 2 * a * b + b * b,
    terms: (a, b) => [
      ['a^2', a * a],
      ['-2ab', -2 * a * b],
      ['b^2', b * b],
    ],
    note: 'Replace b with −b in (a + b)² and only the middle term changes sign.',
  },
  {
    id: 'diff-squares',
    family: 'algebra',
    label: 'a² − b²',
    latex: 'a^2 - b^2 = (a + b)(a - b)',
    inputs: ['a', 'b'],
    lhs: (a, b) => a * a - b * b,
    rhs: (a, b) => (a + b) * (a - b),
    terms: (a, b) => [
      ['a + b', a + b],
      ['a - b', a - b],
    ],
    note: 'Multiply out (a + b)(a − b) and the two ab terms cancel. Handy for mental arithmetic: 51 × 49 = 50² − 1² = 2499.',
  },
  {
    id: 'cube-sum',
    family: 'algebra',
    label: '(a + b)³',
    latex: '(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3',
    inputs: ['a', 'b'],
    lhs: (a, b) => (a + b) ** 3,
    rhs: (a, b) => a ** 3 + 3 * a * a * b + 3 * a * b * b + b ** 3,
    terms: (a, b) => [
      ['a^3', a ** 3],
      ['3a^2b', 3 * a * a * b],
      ['3ab^2', 3 * a * b * b],
      ['b^3', b ** 3],
    ],
    note: 'The coefficients 1, 3, 3, 1 are row three of Pascal’s triangle, the same pattern the binomial theorem generalises.',
  },
  {
    id: 'cubes-sum',
    family: 'algebra',
    label: 'a³ + b³',
    latex: 'a^3 + b^3 = (a + b)(a^2 - ab + b^2)',
    inputs: ['a', 'b'],
    lhs: (a, b) => a ** 3 + b ** 3,
    rhs: (a, b) => (a + b) * (a * a - a * b + b * b),
    terms: (a, b) => [
      ['a + b', a + b],
      ['a^2 - ab + b^2', a * a - a * b + b * b],
    ],
    note: 'Sum of cubes factors with a minus in the middle of the quadratic; difference of cubes has a plus.',
  },
  {
    id: 'cubes-diff',
    family: 'algebra',
    label: 'a³ − b³',
    latex: 'a^3 - b^3 = (a - b)(a^2 + ab + b^2)',
    inputs: ['a', 'b'],
    lhs: (a, b) => a ** 3 - b ** 3,
    rhs: (a, b) => (a - b) * (a * a + a * b + b * b),
    terms: (a, b) => [
      ['a - b', a - b],
      ['a^2 + ab + b^2', a * a + a * b + b * b],
    ],
    note: 'The sign of the linear factor matches the sign between the cubes.',
  },
  {
    id: 'pythagorean',
    family: 'trig',
    label: 'sin² + cos²',
    latex: '\\sin^2 A + \\cos^2 A = 1',
    inputs: ['A'],
    lhs: (A) => Math.sin(rad(A)) ** 2 + Math.cos(rad(A)) ** 2,
    rhs: () => 1,
    terms: (A) => [
      ['\\sin^2 A', Math.sin(rad(A)) ** 2],
      ['\\cos^2 A', Math.cos(rad(A)) ** 2],
    ],
    note: 'This is Pythagoras on the unit circle: the point (cos A, sin A) always sits at distance 1 from the origin.',
  },
  {
    id: 'tan-sec',
    family: 'trig',
    label: '1 + tan²',
    latex: '1 + \\tan^2 A = \\sec^2 A',
    inputs: ['A'],
    lhs: (A) => 1 + Math.tan(rad(A)) ** 2,
    rhs: (A) => 1 / Math.cos(rad(A)) ** 2,
    terms: (A) => [
      ['1', 1],
      ['\\tan^2 A', Math.tan(rad(A)) ** 2],
    ],
    note: 'Divide sin² A + cos² A = 1 through by cos² A. Both sides blow up as A approaches 90°, where cos A is 0.',
  },
  {
    id: 'double-sin',
    family: 'trig',
    label: 'sin 2A',
    latex: '\\sin 2A = 2\\sin A \\cos A',
    inputs: ['A'],
    lhs: (A) => Math.sin(rad(2 * A)),
    rhs: (A) => 2 * Math.sin(rad(A)) * Math.cos(rad(A)),
    terms: (A) => [
      ['\\sin A', Math.sin(rad(A))],
      ['\\cos A', Math.cos(rad(A))],
    ],
    note: 'Set B = A in sin(A + B). Note sin 2A is not 2 sin A: at A = 90°, sin 180° = 0 but 2 sin 90° = 2.',
  },
  {
    id: 'double-cos',
    family: 'trig',
    label: 'cos 2A',
    latex: '\\cos 2A = \\cos^2 A - \\sin^2 A',
    inputs: ['A'],
    lhs: (A) => Math.cos(rad(2 * A)),
    rhs: (A) => Math.cos(rad(A)) ** 2 - Math.sin(rad(A)) ** 2,
    terms: (A) => [
      ['\\cos^2 A', Math.cos(rad(A)) ** 2],
      ['-\\sin^2 A', -(Math.sin(rad(A)) ** 2)],
    ],
    note: 'Swap sin² A for 1 − cos² A to get 2cos² A − 1, or the other way to get 1 − 2sin² A. All three forms are the same identity.',
  },
  {
    id: 'sin-sum',
    family: 'trig',
    label: 'sin(A + B)',
    latex: '\\sin(A + B) = \\sin A \\cos B + \\cos A \\sin B',
    inputs: ['A', 'B'],
    lhs: (A, B) => Math.sin(rad(A + B)),
    rhs: (A, B) => Math.sin(rad(A)) * Math.cos(rad(B)) + Math.cos(rad(A)) * Math.sin(rad(B)),
    terms: (A, B) => [
      ['\\sin A \\cos B', Math.sin(rad(A)) * Math.cos(rad(B))],
      ['\\cos A \\sin B', Math.cos(rad(A)) * Math.sin(rad(B))],
    ],
    note: 'sin(A + B) is not sin A + sin B. Try A = B = 45°: sin 90° = 1, but sin 45° + sin 45° ≈ 1.414.',
  },
  {
    id: 'cos-sum',
    family: 'trig',
    label: 'cos(A + B)',
    latex: '\\cos(A + B) = \\cos A \\cos B - \\sin A \\sin B',
    inputs: ['A', 'B'],
    lhs: (A, B) => Math.cos(rad(A + B)),
    rhs: (A, B) => Math.cos(rad(A)) * Math.cos(rad(B)) - Math.sin(rad(A)) * Math.sin(rad(B)),
    terms: (A, B) => [
      ['\\cos A \\cos B', Math.cos(rad(A)) * Math.cos(rad(B))],
      ['-\\sin A \\sin B', -Math.sin(rad(A)) * Math.sin(rad(B))],
    ],
    note: 'Cosine keeps like with like (cos·cos, sin·sin) and flips the sign; sine mixes them and keeps the sign.',
  },
];

export function getIdentity(id) {
  return identities.find((identity) => identity.id === id) ?? identities[0];
}

export function formatValue(value) {
  if (!Number.isFinite(value) || Math.abs(value) > 1e9) return 'undefined';
  const rounded = Math.round(value * 1000) / 1000;
  return (Object.is(rounded, -0) ? 0 : rounded).toString();
}
