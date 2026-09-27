import { useState } from 'react';
import EigenExplorer from './EigenExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import { alignment, apply, determinant, eigenpairs } from '../../lib/linearAlgebra.js';
import { eigenFormulas } from '../../lib/formulas.js';

const MATRICES = [
  { id: 'stretch', label: 'Axis stretch', m: { a: 3, b: 0, c: 0, d: 2 } },
  { id: 'shear', label: 'Shear', m: { a: 1, b: 1.5, c: 0, d: 1 } },
  { id: 'symmetric', label: 'Symmetric', m: { a: 2, b: 1, c: 1, d: 2 } },
  { id: 'flip', label: 'Reflection', m: { a: 0, b: 1, c: 1, d: 0 } },
  { id: 'rotate', label: 'Rotation', m: { a: 0, b: -1, c: 1, d: 0 } },
];

const defaults = { matrixId: 'symmetric', vx: 2, vy: 0.5 };

const questions = [
  {
    id: 'e1',
    prompt: 'What distinguishes an eigenvector of a matrix from any other vector?',
    options: [
      'The matrix maps it to a scalar multiple of itself, so its direction is unchanged',
      'The matrix maps it to the zero vector',
      'It has length one',
      'It is perpendicular to every other vector',
    ],
    answer: 0,
    explanation:
      'An eigenvector may be stretched, shrunk, or reversed, but it is never turned off its own line. That is the entire definition.',
  },
  {
    id: 'e2',
    prompt: 'A rotation by 90° has no real eigenvectors. Why?',
    options: [
      'Every vector is turned off its own line, so none can be a scalar multiple of itself',
      'Its determinant is zero',
      'It is not a linear transformation',
      'Its eigenvalues are both zero',
    ],
    answer: 0,
    explanation:
      'A quarter turn moves every direction. Algebraically the characteristic equation has no real roots, which is the same fact stated in symbols.',
  },
  {
    id: 'e3',
    prompt: 'What does an eigenvalue of −2 mean geometrically?',
    options: [
      'Vectors on that line are flipped through the origin and doubled in length',
      'The transformation is not invertible',
      'The vector shrinks to half its length',
      'The area doubles in every direction',
    ],
    answer: 0,
    explanation:
      'The magnitude 2 gives the stretch and the negative sign reverses the direction. The line is preserved; the arrow along it points the other way.',
  },
  {
    id: 'e4',
    prompt: 'For a 2×2 matrix, the two eigenvalues always satisfy which pair of relations?',
    options: [
      'They sum to the trace and multiply to the determinant',
      'They sum to the determinant and multiply to the trace',
      'They are both equal to the determinant',
      'They are always reciprocals of one another',
    ],
    answer: 0,
    explanation:
      'Expanding the characteristic polynomial gives λ² − (a + d)λ + (ad − bc), so the sum is the trace and the product is the determinant. It is a quick check on any computation.',
  },
];

const prose = (
  <>
    <h2>Directions a transformation leaves alone</h2>
    <p>
      A linear transformation generally moves a vector off its own line: the arrow that comes out
      points somewhere the arrow that went in did not. For most matrices, however, a small number of
      directions escape this. Vectors along them are stretched or reversed, but never turned.
    </p>

    <p>
      Such a vector is an <strong>eigenvector</strong>, and the factor by which it is scaled is the
      corresponding <strong>eigenvalue</strong>. Drag v around the explorer and watch the angle
      between v and Av: at two particular directions it closes to zero, and the two arrows lie along
      one line.
    </p>

    <Formula label="The defining equation" note="The matrix acts on this vector exactly as a single number would.">
      {String.raw`A\mathbf{v} = \lambda \mathbf{v}, \qquad \mathbf{v} \neq \mathbf{0}`}
    </Formula>

    <h2>Finding them</h2>
    <p>
      Rearranging the definition gives (A − λI)v = 0 with v non-zero, so the matrix A − λI must send
      a non-zero vector to the origin. From the Determinants lesson, that happens precisely when its
      determinant vanishes. This condition is a quadratic in λ.
    </p>

    <Formula label="Characteristic equation" note="Its roots are the eigenvalues.">
      {String.raw`\det(A - \lambda I) = \lambda^2 - (a + d)\lambda + (ad - bc) = 0`}
    </Formula>

    <p>
      The coefficients are quantities already familiar: a + d is the <strong>trace</strong> and
      ad − bc is the determinant. So the two eigenvalues sum to the trace and multiply to the
      determinant, which makes any computation quick to check.
    </p>

    <WorkedExample
      label="Worked example - finding an eigenpair"
      problem="Determine the eigenvalues and eigenvectors of the matrix with rows (2, 1) and (1, 2)."
      steps={[
        {
          text: 'Write the characteristic equation using the trace and determinant.',
          math: String.raw`\lambda^2 - 4\lambda + 3 = 0`,
        },
        {
          text: 'Factor to obtain the eigenvalues.',
          math: String.raw`(\lambda - 3)(\lambda - 1) = 0 \;\Longrightarrow\; \lambda = 3, \; 1`,
        },
        {
          text: 'Check against the identities before continuing: the sum must be the trace and the product the determinant.',
          math: String.raw`3 + 1 = 4 \;\checkmark, \qquad 3 \times 1 = 3 \;\checkmark`,
        },
        {
          text: 'For λ = 3, solve (A − 3I)x = 0. The rows both reduce to the same condition.',
          math: String.raw`\begin{pmatrix} -1 & 1 \\ 1 & -1 \end{pmatrix}\begin{pmatrix} x \\ y \end{pmatrix} = \mathbf{0} \;\Longrightarrow\; x = y`,
        },
        {
          text: 'For λ = 1, repeat with (A − I).',
          math: String.raw`\begin{pmatrix} 1 & 1 \\ 1 & 1 \end{pmatrix}\begin{pmatrix} x \\ y \end{pmatrix} = \mathbf{0} \;\Longrightarrow\; y = -x`,
        },
      ]}
      result="λ = 3 along the direction (1, 1), and λ = 1 along the direction (1, −1)."
      note="Selecting the symmetric preset and dragging v onto either diagonal reproduces both cases. Note that the two directions meet at a right angle, which always happens for a symmetric matrix."
    />

    <Callout label="Not every matrix has real eigenvectors" tone="fail">
      Choose the rotation preset. A quarter turn moves every direction without exception, so no
      vector can survive as a multiple of itself and the eigenlines disappear. In the characteristic
      equation the discriminant is negative and the roots are complex. Nothing has gone wrong; the
      transformation simply has no invariant direction in the plane.
    </Callout>

    <h2>What the eigenvalue records</h2>
    <p>
      The sign and size of λ describe what happens along its own line. A value greater than 1
      stretches, a value between 0 and 1 compresses toward the origin, and a negative value reverses
      the direction while scaling by its magnitude. A value of exactly zero means the whole line is
      collapsed to the origin, which is the singular case from the Determinants lesson.
    </p>

    <Formula label="Trace and determinant from the eigenvalues" note="A fast check on any hand computation.">
      {String.raw`\lambda_1 + \lambda_2 = a + d, \qquad \lambda_1 \lambda_2 = ad - bc`}
    </Formula>

    <h2>Application: the long-run split of a repeating process</h2>
    <p>
      When the same linear step is applied over and over, the eigenvector with the largest eigenvalue
      dominates. Any starting state can be written in terms of the eigenvectors, and repeated
      application scales each component by its own eigenvalue, so the largest one eventually
      overwhelms the rest. This is why such processes settle into a fixed proportion.
    </p>

    <WorkedExample
      variant="applied"
      label="Application - customers settling between two providers"
      problem="Each month 90% of provider A's customers stay and 10% leave for B, while 20% of B's customers move to A and 80% stay. Determine the long-run share of the market held by each provider."
      steps={[
        {
          text: 'Write the monthly step as a matrix acting on the pair (a, b) of customer counts.',
          math: String.raw`M = \begin{pmatrix} 0.9 & 0.2 \\ 0.1 & 0.8 \end{pmatrix}`,
        },
        {
          text: 'A stable split is unchanged by another month, so it is an eigenvector with eigenvalue 1. Confirm 1 is an eigenvalue using the trace and determinant.',
          math: String.raw`\lambda^2 - 1.7\lambda + 0.7 = 0 \;\Longrightarrow\; (\lambda - 1)(\lambda - 0.7) = 0`,
        },
        {
          text: 'Solve (M − I)x = 0 for the steady state.',
          math: String.raw`\begin{pmatrix} -0.1 & 0.2 \\ 0.1 & -0.2 \end{pmatrix}\begin{pmatrix} a \\ b \end{pmatrix} = \mathbf{0} \;\Longrightarrow\; a = 2b`,
        },
        {
          text: 'Express the direction (2, 1) as proportions of the whole market.',
          math: String.raw`\frac{2}{3} \approx 66.7\%, \qquad \frac{1}{3} \approx 33.3\%`,
        },
      ]}
      result="The market settles at two thirds for provider A and one third for provider B, whatever the starting split."
      note="The second eigenvalue, 0.7, controls how fast the process settles: the departure from the steady state shrinks by a factor of 0.7 each month, so roughly two thirds of the gap closes every three months."
    />

    <Example label="Where eigenvectors appear">
      The same idea underlies the ranking of web pages by a link matrix, the natural vibration modes
      of a bridge or molecule, the axes chosen by principal component analysis when compressing data,
      and the stationary distribution of a Markov chain. In each case the question is the same one
      asked here: which directions does this transformation leave alone?
    </Example>
  </>
);

export default function EigenLesson({ lessonId }) {
  const [matrixId, setMatrixId] = useState(defaults.matrixId);
  const [v, setV] = useState({ x: defaults.vx, y: defaults.vy });

  const matrix = MATRICES.find((entry) => entry.id === matrixId).m;
  const pairs = eigenpairs(matrix);
  const off = alignment(matrix, v);
  const onEigen = off !== null && off < 0.03;
  const image = apply(matrix, v);

  function reset() {
    setMatrixId(defaults.matrixId);
    setV({ x: defaults.vx, y: defaults.vy });
  }

  const values = { matrixId, vx: v.x, vy: v.y };

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Eigenvector reference" groups={eigenFormulas} />}
      intro="Most vectors are turned aside by a transformation. A few are not: they are only stretched or reversed along their own line. Those directions, and the factors attached to them, describe what the matrix fundamentally does."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plane</span>
              <h2>Directions that survive</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={values} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Matrix presets">
            {MATRICES.map((entry) => (
              <button
                key={entry.id}
                className={`chip ${matrixId === entry.id ? 'selected' : ''}`}
                type="button"
                onClick={() => setMatrixId(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <EigenExplorer matrix={matrix} v={v} onChange={setV} />

          <dl className="readout">
            <div>
              <dt>v</dt>
              <dd>({v.x.toFixed(1)}, {v.y.toFixed(1)})</dd>
            </div>
            <div>
              <dt>Av</dt>
              <dd>({image.x.toFixed(1)}, {image.y.toFixed(1)})</dd>
            </div>
            <div className="is-close">
              <dt>λ₁, λ₂</dt>
              <dd>
                {pairs.length
                  ? pairs
                      .map((pair) => `${pair.value.toFixed(2)}${pair.multiplicity > 1 ? ' (repeated)' : ''}`)
                      .join(', ')
                  : 'complex'}
              </dd>
            </div>
            <div>
              <dt>det</dt>
              <dd>{determinant(matrix).toFixed(2)}</dd>
            </div>
          </dl>

          <div className="controls">
            {pairs.length ? (
              <div className="control-row">
                {pairs.map((pair) => (
                  <button
                    key={`${pair.value}-${pair.multiplicity}`}
                    className="chip is-action"
                    type="button"
                    onClick={() => setV({
                      x: Number((pair.vector.x * 2).toFixed(1)),
                      y: Number((pair.vector.y * 2).toFixed(1)),
                    })}
                  >
                    Snap to λ = {pair.value.toFixed(2)}
                  </button>
                ))}
              </div>
            ) : null}

            <div className={`epsilon-strip ${onEigen ? 'is-ok' : !pairs.length ? 'is-fail' : ''}`}>
              <span className="verdict">
                {!pairs.length ? 'no real eigenvectors' : onEigen ? 'on an eigenvector' : 'turned aside'}
              </span>
              <p>
                {!pairs.length
                  ? 'This transformation turns every direction in the plane, so no vector is a multiple of itself. The characteristic equation has no real roots.'
                  : onEigen
                    ? `v lies along an eigenvector, so Av points the same way and is simply scaled. The two arrows share one line.`
                    : 'v is turned off its own line, so it is not an eigenvector. Drag it toward one of the dashed directions and the two arrows will align.'}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Drag the arrowhead, or focus it and use the arrow keys. The dashed lines mark the
            eigenvector directions, and they disappear when no real ones exist.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
