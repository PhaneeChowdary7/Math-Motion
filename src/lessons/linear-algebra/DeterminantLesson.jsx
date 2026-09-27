import { useState } from 'react';
import DeterminantExplorer from './DeterminantExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import { cross } from '../../lib/linearAlgebra.js';
import { determinantFormulas } from '../../lib/formulas.js';

const defaults = { vx: 3, vy: 1, wx: 1, wy: 2 };

const questions = [
  {
    id: 'd1',
    prompt: 'Geometrically, what is the determinant of a 2×2 matrix?',
    options: [
      'The signed area of the parallelogram its columns span',
      'The length of the longer column',
      'The angle between the columns',
      'The sum of the diagonal entries',
    ],
    answer: 0,
    explanation:
      'Area is the magnitude; the sign records whether the pair kept its orientation or flipped it. The sum of the diagonal is the trace, a different quantity.',
  },
  {
    id: 'd2',
    prompt: 'What does a negative determinant mean?',
    options: [
      'The transformation flipped the plane over',
      'The area is negative, which is impossible',
      'The matrix has no inverse',
      'The columns are parallel',
    ],
    answer: 0,
    explanation:
      'Swap the two columns and the sign flips. Negative means the sense of rotation from the first vector to the second has reversed - the plane has been reflected.',
  },
  {
    id: 'd3',
    prompt: 'Why does a determinant of zero mean the matrix has no inverse?',
    options: [
      'Everything is squashed onto a line, so different inputs share an output',
      'Division by zero appears in the formula, and that is the whole reason',
      'Because the matrix is not square',
      'Because the columns are perpendicular',
    ],
    answer: 0,
    explanation:
      'The formula does divide by the determinant, but the reason behind it is geometric: a flattened plane has lost a dimension, so the map cannot be run backwards.',
  },
  {
    id: 'd4',
    prompt: 'If det A = 3 and det B = 2, what is det(AB)?',
    options: ['6', '5', '1.5', 'It cannot be determined'],
    answer: 0,
    explanation:
      'Applying B scales every area by 2, then A scales by 3, so the combined effect is 6. Determinants multiply because area factors compose.',
  },
];

const prose = (
  <>
    <h2>Geometric interpretation</h2>
    <p>
      Two vectors issuing from the origin frame a parallelogram. The determinant of the matrix whose
      columns are those vectors is the area of that parallelogram, carrying a sign. Once this
      identification is made, the algebraic properties of the determinant follow from properties of
      area rather than requiring separate justification.
    </p>

    <Formula label="Determinant of a pair of columns" note="The expression is the one used as the independence criterion in the first lesson.">
      {String.raw`\det\begin{pmatrix} v_1 & w_1 \\ v_2 & w_2 \end{pmatrix} = v_1 w_2 - v_2 w_1`}
    </Formula>

    <WorkedExample
      label="Worked example - evaluating a determinant"
      problem="Compute the determinant of the matrix with columns v = (3, 1) and w = (1, 2), and state the area of the parallelogram they frame."
      steps={[
        {
          text: 'Apply the definition.',
          math: String.raw`\det = (3)(2) - (1)(1) = 6 - 1 = 5`,
        },
        {
          text: 'The magnitude gives the area; the positive sign indicates that the turn from v to w is anticlockwise.',
          math: String.raw`\text{area} = |{\det}| = 5`,
        },
      ]}
      result="The determinant is 5 and the parallelogram has area 5, with orientation preserved."
      note="Entering these vectors in the explorer reproduces the figure and the value."
    />

    <h2>Significance of the sign</h2>
    <p>
      Area is ordinarily non-negative, so the sign carries additional information:{' '}
      <strong>orientation</strong>. A positive determinant indicates that the shorter rotation from
      the first vector to the second is anticlockwise; a negative determinant indicates clockwise.
      Interchanging the two columns reverses the sense of that rotation and hence the sign.
    </p>

    <Formula label="Antisymmetry" note="Magnitude records area; sign records orientation.">
      {String.raw`\det(\mathbf{w}, \mathbf{v}) = -\det(\mathbf{v}, \mathbf{w})`}
    </Formula>

    <p>
      A transformation with negative determinant reverses orientation, as a reflection does. Such a
      transformation is not degenerate: it remains invertible and well behaved. Only a determinant of
      zero is exceptional.
    </p>

    <Callout label="The degenerate case" tone="fail">
      If w lies along v, the parallelogram collapses to a segment and the area is zero. The
      associated transformation maps the entire plane onto a line, so distinct inputs share images
      and no inverse exists. This is the same event described in the first lesson as a span reducing
      to a line, and in the third as a system losing its unique solution.
    </Callout>

    <h2>Multiplicativity</h2>
    <p>
      A transformation scales every area in the plane by its determinant. Applying a second
      transformation scales areas again, so the combined factor is the product of the two. This
      accounts for the multiplicative property, which is laborious to verify from the algebraic
      definition and immediate from the geometric one.
    </p>

    <Formula label="Determinant of a product" note="Two area factors applied in succession.">
      {String.raw`\det(AB) = \det(A)\,\det(B)`}
    </Formula>

    <p>
      The same reasoning determines the determinant of an inverse. If A scales areas by det A, then
      the transformation undoing A must scale them by the reciprocal. Zero admits no reciprocal,
      which is precisely why a singular matrix has no inverse.
    </p>

    <Formula label="Inverse of a 2×2 matrix" note="The determinant appears in the denominator and must therefore be non-zero.">
      {String.raw`A^{-1} = \frac{1}{\det A}\begin{pmatrix} d & -b \\ -c & a \end{pmatrix}`}
    </Formula>

    <h2>Application: area of a plot from surveyed corners</h2>
    <p>
      Because the determinant returns an area directly from coordinates, it provides a means of
      computing the area of a polygon from surveyed corner positions without measuring any distance
      or angle in the field. A triangle occupies half the parallelogram framed by two of its edge
      vectors.
    </p>

    <Formula label="Area of a triangle from coordinates" note="Half the parallelogram framed by two edges taken from a common corner.">
      {String.raw`\text{area} = \tfrac{1}{2}\left| (x_2 - x_1)(y_3 - y_1) - (y_2 - y_1)(x_3 - x_1) \right|`}
    </Formula>

    <WorkedExample
      variant="applied"
      label="Application - area of a triangular plot"
      problem="A triangular plot has corners surveyed at A = (2, 1), B = (8, 3) and C = (4, 7), with coordinates in metres. Determine its area."
      steps={[
        {
          text: 'Form two edge vectors from the common corner A.',
          math: String.raw`\mathbf{u} = B - A = \begin{pmatrix} 6 \\ 2 \end{pmatrix}, \qquad \mathbf{v} = C - A = \begin{pmatrix} 2 \\ 6 \end{pmatrix}`,
        },
        {
          text: 'The determinant of these two columns gives the area of the parallelogram they frame.',
          math: String.raw`\det = (6)(6) - (2)(2) = 36 - 4 = 32`,
        },
        {
          text: 'The triangle is half that parallelogram.',
          math: String.raw`\text{area} = \tfrac{1}{2}(32) = 16`,
        },
      ]}
      result="The plot has an area of 16 square metres."
      note="The sign of the determinant indicates the order in which the corners were traversed. Surveying software uses this to detect whether a boundary has been recorded clockwise or anticlockwise, and the same idea extends to polygons of any number of sides."
    />

    <Example label="Determinants as local scale factors">
      Changing variables in a multiple integral introduces the determinant of the Jacobian matrix as
      a factor, for exactly the reason developed here: it is the local scale factor for area. The
      determinant is the mechanism by which a transformation reports its effect on size and
      orientation as a single number.
    </Example>
  </>
);

export default function DeterminantLesson({ lessonId }) {
  const [v, setV] = useState({ x: defaults.vx, y: defaults.vy });
  const [w, setW] = useState({ x: defaults.wx, y: defaults.wy });

  const det = cross(v, w);
  const flat = Math.abs(det) < 0.05;

  function move(which, next) {
    if (which === 'v') setV(next);
    else setW(next);
  }

  function reset() {
    setV({ x: defaults.vx, y: defaults.vy });
    setW({ x: defaults.wx, y: defaults.wy });
  }

  const values = { vx: v.x, vy: v.y, wx: w.x, wy: w.y };

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Determinant reference" groups={determinantFormulas} />}
      intro="The determinant is not an arbitrary combination of four numbers. It is the area of the parallelogram the columns span, with a sign that records whether the plane was flipped."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plane</span>
              <h2>The area a pair of vectors makes</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={values} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Determinant presets">
            <button className="chip" type="button" onClick={() => { setV({ x: 3, y: 1 }); setW({ x: 1, y: 2 }); }}>
              Positive
            </button>
            <button className="chip" type="button" onClick={() => { setV({ x: 1, y: 2 }); setW({ x: 3, y: 1 }); }}>
              Flipped
            </button>
            <button className="chip" type="button" onClick={() => { setV({ x: 2, y: 1 }); setW({ x: 4, y: 2 }); }}>
              Collapsed
            </button>
            <button className="chip" type="button" onClick={() => { setV({ x: 1, y: 0 }); setW({ x: 0, y: 1 }); }}>
              Unit square
            </button>
          </div>

          <DeterminantExplorer v={v} w={w} onChange={move} />

          <dl className="readout">
            <div>
              <dt>v</dt>
              <dd>({v.x.toFixed(1)}, {v.y.toFixed(1)})</dd>
            </div>
            <div>
              <dt>w</dt>
              <dd>({w.x.toFixed(1)}, {w.y.toFixed(1)})</dd>
            </div>
            <div className="is-close">
              <dt>det</dt>
              <dd>{det.toFixed(2)}</dd>
            </div>
            <div>
              <dt>area</dt>
              <dd>{Math.abs(det).toFixed(2)}</dd>
            </div>
          </dl>

          <div className="controls">
            <div className="control-row">
              <button className="chip is-action" type="button" onClick={() => { setV(w); setW(v); }}>
                Swap v and w
              </button>
            </div>

            <div className={`epsilon-strip ${flat ? 'is-fail' : 'is-ok'}`}>
              <span className="verdict">
                {flat ? 'area 0' : det < 0 ? 'orientation flipped' : 'orientation kept'}
              </span>
              <p>
                {flat
                  ? 'v and w lie along one line, so the parallelogram has no area. A matrix with these columns squashes the plane and has no inverse.'
                  : `The parallelogram has area ${Math.abs(det).toFixed(2)}. ${det < 0 ? 'The determinant is negative because the turn from v to w runs clockwise - the plane has been reflected.' : 'The determinant is positive because the turn from v to w runs anticlockwise.'} Press swap to reverse it.`}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Slide one arrow along the direction of the other: the parallelogram shears but the area
            holds, because base and height are unchanged.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
