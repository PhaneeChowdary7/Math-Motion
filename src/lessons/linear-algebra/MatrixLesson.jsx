import { useState } from 'react';
import MatrixExplorer from './MatrixExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import { determinant, matrixFrom, presets } from '../../lib/linearAlgebra.js';
import { matrixFormulas } from '../../lib/formulas.js';

const defaults = { ix: 1, iy: 0, jx: 1.5, jy: 1, showGrid: true };

const questions = [
  {
    id: 'm1',
    prompt: 'What do the columns of a 2×2 matrix tell you directly?',
    options: [
      'Where the two basis vectors land',
      'The two eigenvalues',
      'The slopes of two lines',
      'The area of the unit square',
    ],
    answer: 0,
    explanation:
      'The first column is where î goes and the second is where ĵ goes. That is the whole definition; everything else follows from it.',
  },
  {
    id: 'm2',
    prompt: 'Why does knowing where î and ĵ land determine the whole transformation?',
    options: [
      'Every vector is a combination of î and ĵ, and the transformation preserves combinations',
      'Because the matrix is square',
      'Because the determinant is fixed',
      'It does not - you also need a third vector',
    ],
    answer: 0,
    explanation:
      'If v = xî + yĵ, then T(v) = xT(î) + yT(ĵ). Linearity carries the answer for every vector from the answer for two.',
  },
  {
    id: 'm3',
    prompt: 'A transformation squashes the unit square flat onto a line. What is its determinant?',
    options: ['0', '1', '−1', 'Undefined'],
    answer: 0,
    explanation:
      'The determinant is the area the unit square becomes. Flat means zero area, and a zero determinant means the matrix cannot be undone.',
  },
  {
    id: 'm4',
    prompt: 'In the explorer, what stays true of the grid lines no matter where you drag î and ĵ?',
    options: [
      'They stay straight, parallel and evenly spaced',
      'They stay at right angles',
      'They keep their original spacing',
      'They stay horizontal and vertical',
    ],
    answer: 0,
    explanation:
      'Angles and spacing both change freely. Straight, parallel and evenly spaced is exactly what linearity preserves - and it is what separates a linear map from any other function.',
  },
];

const prose = (
  <>
    <h2>The matrix as a record of basis images</h2>
    <p>
      Every vector in the plane decomposes into the two standard basis vectors: î, of unit length
      along the horizontal axis, and ĵ, of unit length along the vertical. The point (3, 1) is
      precisely 3î + 1ĵ. A transformation is therefore specified completely by recording where these
      two vectors are sent.
    </p>

    <Formula label="Columns are basis images" note="The first column is the image of î; the second is the image of ĵ.">
      {String.raw`A = \begin{pmatrix} a & b \\ c & d \end{pmatrix}, \qquad A\hat{\imath} = \begin{pmatrix} a \\ c \end{pmatrix}, \quad A\hat{\jmath} = \begin{pmatrix} b \\ d \end{pmatrix}`}
    </Formula>

    <h2>Linearity and its consequence</h2>
    <p>
      A transformation is <strong>linear</strong> when it commutes with the two vector operations:
      scaling before the transformation gives the same result as scaling after, and likewise for
      addition. This single property is what permits two recorded images to determine infinitely
      many.
    </p>

    <Formula label="Definition of linearity" note="Combine then transform, or transform then combine; the results agree.">
      {String.raw`T(a\mathbf{v} + b\mathbf{w}) = aT(\mathbf{v}) + bT(\mathbf{w})`}
    </Formula>

    <p>
      Writing an arbitrary vector as v = xî + yĵ and applying linearity yields T(v) = xT(î) + yT(ĵ).
      The image of any vector is thus a linear combination of the columns, weighted by the original
      coordinates. This is the definition of matrix-vector multiplication.
    </p>

    <Formula label="Matrix acting on a vector" note="The output is a combination of the columns.">
      {String.raw`\begin{pmatrix} a & b \\ c & d \end{pmatrix}\begin{pmatrix} x \\ y \end{pmatrix} = x\begin{pmatrix} a \\ c \end{pmatrix} + y\begin{pmatrix} b \\ d \end{pmatrix} = \begin{pmatrix} ax + by \\ cx + dy \end{pmatrix}`}
    </Formula>

    <WorkedExample
      label="Worked example - applying a matrix"
      problem="Let A send î to (2, 1) and ĵ to (−1, 3). Determine the image of the vector v = (4, 2)."
      steps={[
        {
          text: 'Assemble the matrix by placing the basis images in its columns.',
          math: String.raw`A = \begin{pmatrix} 2 & -1 \\ 1 & 3 \end{pmatrix}`,
        },
        {
          text: 'Express the image as a combination of the columns, weighted by the coordinates of v.',
          math: String.raw`A\mathbf{v} = 4\begin{pmatrix} 2 \\ 1 \end{pmatrix} + 2\begin{pmatrix} -1 \\ 3 \end{pmatrix}`,
        },
        {
          text: 'Evaluate componentwise.',
          math: String.raw`= \begin{pmatrix} 8 - 2 \\ 4 + 6 \end{pmatrix} = \begin{pmatrix} 6 \\ 10 \end{pmatrix}`,
        },
      ]}
      result="A maps (4, 2) to (6, 10)."
      note="Placing î at (2, 1) and ĵ at (−1, 3) in the explorer displays the corresponding deformation of the unit square."
    />

    <h2>Composition of transformations</h2>
    <p>
      Applying one transformation and then a second is itself a linear transformation, and the matrix
      representing it is the product of the two matrices. The order is significant: BA denotes A
      applied first, then B, and reversing the order generally produces a different result.
    </p>

    <Formula label="Composition" note="Read right to left: the rightmost factor acts first.">
      {String.raw`(BA)\mathbf{v} = B\bigl(A\mathbf{v}\bigr)`}
    </Formula>

    <WorkedExample
      label="Worked example - composing two operations"
      problem="A shape is first rotated by 90° anticlockwise, then scaled by a factor of 2 in both directions. Determine the single matrix representing the combined operation."
      steps={[
        {
          text: 'Record the rotation. It sends î to (0, 1) and ĵ to (−1, 0).',
          math: String.raw`R = \begin{pmatrix} 0 & -1 \\ 1 & 0 \end{pmatrix}`,
        },
        {
          text: 'Record the scaling. It sends î to (2, 0) and ĵ to (0, 2).',
          math: String.raw`S = \begin{pmatrix} 2 & 0 \\ 0 & 2 \end{pmatrix}`,
        },
        {
          text: 'The rotation acts first, so it stands to the right in the product.',
          math: String.raw`SR = \begin{pmatrix} 2 & 0 \\ 0 & 2 \end{pmatrix}\begin{pmatrix} 0 & -1 \\ 1 & 0 \end{pmatrix} = \begin{pmatrix} 0 & -2 \\ 2 & 0 \end{pmatrix}`,
        },
      ]}
      result="The combined operation is represented by the matrix with columns (0, 2) and (−2, 0)."
      note="Here the two operations happen to commute, because uniform scaling commutes with everything. This is the exception rather than the rule."
    />

    <h2>Invariants of a linear map</h2>
    <p>
      Enabling the transformed grid in the explorer demonstrates what linearity preserves. Angles are
      distorted and spacing is altered, but the grid lines remain straight, parallel families remain
      parallel, spacing along any one family remains uniform, and the origin is fixed. These four
      properties characterise linear maps and distinguish them from arbitrary functions of the plane.
    </p>

    <Callout label="Degenerate transformations" tone="fail">
      If ĵ is placed along î, the unit square collapses onto a segment and the entire plane is mapped
      onto a single line. Distinct inputs then share a common image, so no inverse transformation
      exists. This condition is detected by a determinant of zero, treated in the final lesson.
    </Callout>

    <h2>Application: coordinate conversion in a plotting system</h2>
    <p>
      Rendering pipelines express the mapping from data coordinates to screen coordinates as a linear
      transformation, because the properties above are exactly the ones a plot must preserve: a
      straight line in the data must remain straight on screen, and equal data intervals must remain
      equally spaced.
    </p>

    <WorkedExample
      variant="applied"
      label="Application - mapping data to device coordinates"
      problem="A plotting routine must map data measured in units of one metre horizontally and one second vertically onto a device on which one metre spans 40 pixels rightward and one second spans 25 pixels upward. Screen coordinates increase downward. Determine the matrix and apply it to the data point (3, 2)."
      steps={[
        {
          text: 'Record where each data basis vector lands in device coordinates. One metre moves 40 pixels right and none vertically.',
          math: String.raw`\hat{\imath} \mapsto \begin{pmatrix} 40 \\ 0 \end{pmatrix}`,
        },
        {
          text: 'One second moves 25 pixels up the screen, which is −25 in device coordinates because the screen axis is inverted.',
          math: String.raw`\hat{\jmath} \mapsto \begin{pmatrix} 0 \\ -25 \end{pmatrix}`,
        },
        {
          text: 'Assemble the matrix from these two columns.',
          math: String.raw`M = \begin{pmatrix} 40 & 0 \\ 0 & -25 \end{pmatrix}`,
        },
        {
          text: 'Apply it to the data point (3, 2).',
          math: String.raw`M\begin{pmatrix} 3 \\ 2 \end{pmatrix} = \begin{pmatrix} 120 \\ -50 \end{pmatrix}`,
        },
      ]}
      result="The data point (3, 2) is drawn 120 pixels right of the origin and 50 pixels above it, the negative sign reflecting the inverted screen axis."
      note="The negative determinant of −1000 records the axis inversion: the transformation reverses orientation, which is precisely what flipping the vertical axis does."
    />

    <Example label="Further occurrences">
      The same construction underlies rotation of an image, projection of a three-dimensional scene
      onto a display surface, and a single layer of a linear neural network. In each case the
      transformation is fixed by recording the images of the basis, and composition of successive
      stages is carried out by matrix multiplication.
    </Example>
  </>
);

export default function MatrixLesson({ lessonId }) {
  const [i, setI] = useState({ x: defaults.ix, y: defaults.iy });
  const [j, setJ] = useState({ x: defaults.jx, y: defaults.jy });
  const [showGrid, setShowGrid] = useState(defaults.showGrid);

  const m = matrixFrom(i, j);
  const det = determinant(m);
  const singular = Math.abs(det) < 0.05;

  function move(which, next) {
    if (which === 'i') setI(next);
    else setJ(next);
  }

  function reset() {
    setI({ x: defaults.ix, y: defaults.iy });
    setJ({ x: defaults.jx, y: defaults.jy });
    setShowGrid(defaults.showGrid);
  }

  const values = { ix: i.x, iy: i.y, jx: j.x, jy: j.y, showGrid };

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Matrix reference" groups={matrixFormulas} />}
      intro="A matrix does not describe a grid of numbers so much as a destination: say where the two basis arrows land, and every other point in the plane follows automatically."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plane</span>
              <h2>Where the basis lands</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={values} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Transformation presets">
            {presets.map((preset) => (
              <button
                key={preset.id}
                className={`chip ${i.x === preset.i.x && i.y === preset.i.y && j.x === preset.j.x && j.y === preset.j.y ? 'selected' : ''}`}
                type="button"
                onClick={() => { setI(preset.i); setJ(preset.j); }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <MatrixExplorer i={i} j={j} showGrid={showGrid} onChange={move} />

          <dl className="readout">
            <div>
              <dt>î ↦</dt>
              <dd>({i.x.toFixed(1)}, {i.y.toFixed(1)})</dd>
            </div>
            <div>
              <dt>ĵ ↦</dt>
              <dd>({j.x.toFixed(1)}, {j.y.toFixed(1)})</dd>
            </div>
            <div className="is-close">
              <dt>det A</dt>
              <dd>{det.toFixed(2)}</dd>
            </div>
            <div>
              <dt>invertible</dt>
              <dd>{singular ? 'no' : 'yes'}</dd>
            </div>
          </dl>

          <div className="controls">
            <div className="control-row">
              <button
                className={`chip ${showGrid ? 'selected' : ''}`}
                type="button"
                aria-pressed={showGrid}
                onClick={() => setShowGrid((current) => !current)}
              >
                Show the transformed grid
              </button>
            </div>

            <div className={`epsilon-strip ${singular ? 'is-fail' : 'is-ok'}`}>
              <span className="verdict">{singular ? 'squashed flat' : `area × ${Math.abs(det).toFixed(2)}`}</span>
              <p>
                {singular
                  ? 'The two columns are parallel, so the whole plane collapses onto one line. The determinant is zero and the transformation cannot be undone.'
                  : `The unit square becomes a parallelogram of area ${Math.abs(det).toFixed(2)}${det < 0 ? ', with the orientation flipped' : ''}. Every area in the plane scales by the same factor.`}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Drag either arrowhead to place a column of the matrix, or focus one and use the arrow keys.
            The faint outline is the original unit square.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
