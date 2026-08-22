export const TAU = Math.PI * 2;

export const toDegrees = (radians) => (radians * 180) / Math.PI;

export const normalize = (radians) => ((radians % TAU) + TAU) % TAU;

export const waves = [
  {
    id: 'sine',
    label: 'sin θ',

    f: Math.sin,
    note: 'Sine reads the vertical leg. It starts at 0, peaks a quarter turn in, and returns to 0 at half a turn.',
  },
  {
    id: 'cosine',
    label: 'cos θ',
    f: Math.cos,
    note: 'Cosine reads the horizontal leg. It starts at 1, which is why it looks like sine shifted a quarter turn to the left.',
  },
];

export const getWave = (id) => waves.find((entry) => entry.id === id) ?? waves[0];

export const namedAngles = [
  { radians: 0, label: '0', exact: { sin: '0', cos: '1' } },
  { radians: Math.PI / 6, label: 'π/6', exact: { sin: '1/2', cos: '√3/2' } },
  { radians: Math.PI / 4, label: 'π/4', exact: { sin: '√2/2', cos: '√2/2' } },
  { radians: Math.PI / 3, label: 'π/3', exact: { sin: '√3/2', cos: '1/2' } },
  { radians: Math.PI / 2, label: 'π/2', exact: { sin: '1', cos: '0' } },
  { radians: Math.PI, label: 'π', exact: { sin: '0', cos: '−1' } },
  { radians: (3 * Math.PI) / 2, label: '3π/2', exact: { sin: '−1', cos: '0' } },
];

export function nearestNamedAngle(radians, tolerance = 0.05) {
  const wrapped = normalize(radians);

  return (
    namedAngles.find((angle) => {
      const gap = Math.abs(normalize(angle.radians) - wrapped);
      return Math.min(gap, TAU - gap) < tolerance;
    }) ?? null
  );
}

export function quadrantOf(radians) {
  const wrapped = normalize(radians);
  const index = Math.floor(wrapped / (Math.PI / 2)) % 4;

  return [
    { number: 'I', sin: '+', cos: '+' },
    { number: 'II', sin: '+', cos: '−' },
    { number: 'III', sin: '−', cos: '−' },
    { number: 'IV', sin: '−', cos: '+' },
  ][index];
}

export function waveSamples(fn, upTo = TAU, step = 0.02) {
  const points = [];

  for (let theta = 0; theta <= upTo + step / 2; theta += step) {
    points.push([Math.min(theta, upTo), fn(Math.min(theta, upTo))]);
  }

  return points;
}
