export const VIEW = [-6, 6];

export const clamp = (value, [min, max]) => Math.max(min, Math.min(max, value));

export const add = (v, w) => ({ x: v.x + w.x, y: v.y + w.y });
export const scale = (v, k) => ({ x: v.x * k, y: v.y * k });
export const combine = (v, w, a, b) => add(scale(v, a), scale(w, b));
export const magnitude = (v) => Math.hypot(v.x, v.y);

/** Signed area of the parallelogram spanned by v and w. */
export const cross = (v, w) => v.x * w.y - v.y * w.x;

export const dot = (v, w) => v.x * w.x + v.y * w.y;

/** Columns of a 2x2 matrix, the way a transformation is easiest to read. */
export const matrixFrom = (i, j) => ({ a: i.x, b: j.x, c: i.y, d: j.y });

export const apply = ({ a, b, c, d }, v) => ({ x: a * v.x + b * v.y, y: c * v.x + d * v.y });

export const determinant = ({ a, b, c, d }) => a * d - b * c;

const NEARLY_ZERO = 1e-9;

export const isSingular = (m) => Math.abs(determinant(m)) < NEARLY_ZERO;

export function inverse(m) {
  const det = determinant(m);
  if (Math.abs(det) < NEARLY_ZERO) return null;
  return { a: m.d / det, b: -m.b / det, c: -m.c / det, d: m.a / det };
}

/**
 * Solve a1x + b1y = c1, a2x + b2y = c2 by Cramer's rule, and say which of the
 * three possible shapes the answer has rather than just returning null.
 */
export function solveSystem(row1, row2) {
  const det = row1.a * row2.b - row1.b * row2.a;

  if (Math.abs(det) > NEARLY_ZERO) {
    return {
      kind: 'unique',
      det,
      point: {
        x: (row1.c * row2.b - row1.b * row2.c) / det,
        y: (row1.a * row2.c - row1.c * row2.a) / det,
      },
    };
  }

  // Determinant is zero: the rows are parallel. Consistent only if the
  // constants sit in the same ratio as the coefficients.
  const consistent =
    Math.abs(row1.a * row2.c - row2.a * row1.c) < NEARLY_ZERO &&
    Math.abs(row1.b * row2.c - row2.b * row1.c) < NEARLY_ZERO;

  return { kind: consistent ? 'infinite' : 'none', det, point: null };
}

/** Where a1x + b1y = c1 crosses the edges of the viewport, for drawing. */
export function lineEndpoints({ a, b, c }, [min, max] = VIEW) {
  if (Math.abs(a) < NEARLY_ZERO && Math.abs(b) < NEARLY_ZERO) return null;

  if (Math.abs(b) < NEARLY_ZERO) {
    const x = c / a;
    return [{ x, y: min }, { x, y: max }];
  }

  return [
    { x: min, y: (c - a * min) / b },
    { x: max, y: (c - a * max) / b },
  ];
}

/** Real eigenvalues of a 2x2 matrix, or null when the pair is complex. */
export function eigenvalues({ a, b, c, d }) {
  const trace = a + d;
  const det = a * d - b * c;
  const disc = trace * trace - 4 * det;

  if (disc < -NEARLY_ZERO) return null;

  const root = Math.sqrt(Math.max(0, disc));
  return [(trace + root) / 2, (trace - root) / 2];
}

/**
 * Real eigenpairs of a 2x2 matrix, largest eigenvalue first. Returns an empty
 * list when the eigenvalues are complex, which is the rotation case.
 */
export function eigenpairs(m) {
  const values = eigenvalues(m);
  if (!values) return [];

  const { a, b, c, d } = m;

  const pairs = values.map((value, index) => {
    // Solve (A - vI)x = 0. One row is enough; pick whichever is non-degenerate.
    let vector;
    if (Math.abs(b) > NEARLY_ZERO) vector = { x: b, y: value - a };
    else if (Math.abs(c) > NEARLY_ZERO) vector = { x: value - d, y: c };
    else if (Math.abs(a - d) > NEARLY_ZERO)
      vector = Math.abs(value - a) < NEARLY_ZERO ? { x: 1, y: 0 } : { x: 0, y: 1 };
    // A scalar matrix scales every direction equally, so the eigenspace is the
    // whole plane. Report the two axes as a basis for it.
    else vector = index === 0 ? { x: 1, y: 0 } : { x: 0, y: 1 };

    const length = Math.hypot(vector.x, vector.y) || 1;
    return { value, vector: { x: vector.x / length, y: vector.y / length } };
  });

  // Merge pairs sharing a direction. A shear has a repeated eigenvalue but only
  // one eigenvector, so reporting two would be wrong: this returns geometric
  // multiplicity, which is what the picture actually shows.
  const distinct = [];

  for (const pair of pairs) {
    const match = distinct.find(
      (other) =>
        Math.abs(other.value - pair.value) < NEARLY_ZERO &&
        Math.abs(cross(other.vector, pair.vector)) < 1e-6
    );

    if (match) match.multiplicity += 1;
    else distinct.push({ ...pair, multiplicity: 1 });
  }

  return distinct;
}

/** How far v is from lying along an eigenvector, as |sin| of the angle to Av. */
export function alignment(m, v) {
  const image = apply(m, v);
  const lv = magnitude(v);
  const li = magnitude(image);
  if (lv < NEARLY_ZERO || li < NEARLY_ZERO) return null;
  return Math.abs(cross(v, image)) / (lv * li);
}

export const presets = [
  { id: 'identity', label: 'Identity', i: { x: 1, y: 0 }, j: { x: 0, y: 1 } },
  { id: 'scale', label: 'Scale ×2', i: { x: 2, y: 0 }, j: { x: 0, y: 2 } },
  { id: 'shear', label: 'Shear', i: { x: 1, y: 0 }, j: { x: 1.5, y: 1 } },
  { id: 'rotate', label: 'Rotate 90°', i: { x: 0, y: 1 }, j: { x: -1, y: 0 } },
  { id: 'squash', label: 'Squash flat', i: { x: 2, y: 1 }, j: { x: 4, y: 2 } },
];
