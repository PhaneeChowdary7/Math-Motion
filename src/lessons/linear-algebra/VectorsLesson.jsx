import { useState } from 'react';
import VectorExplorer from './VectorExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import { combine, cross, magnitude } from '../../lib/linearAlgebra.js';
import { vectorFormulas } from '../../lib/formulas.js';
import { WindPlaneStory } from '../../stories/linearAlgebra.jsx';

const defaults = { vx: 3, vy: 1, wx: -1, wy: 2, a: 1, b: 1, showCombo: true };

const questions = [
  {
    id: 'v1',
    prompt: 'What does it mean for two vectors in the plane to be linearly independent?',
    options: [
      'Neither one is a scalar multiple of the other',
      'They point in opposite directions',
      'They have the same length',
      'They meet at a right angle',
    ],
    answer: 0,
    explanation:
      'Independence is about direction, not length or angle. The moment one is a multiple of the other they lie on a single line, and the pair collapses.',
  },
  {
    id: 'v2',
    prompt: 'Two independent vectors in the plane span what?',
    options: [
      'The entire plane',
      'A single line through the origin',
      'Only the points between their tips',
      'Just the four points ±v and ±w',
    ],
    answer: 0,
    explanation:
      'Every point in the plane can be written as av + bw for exactly one pair of scalars, so the span is all of it.',
  },
  {
    id: 'v3',
    prompt: 'If v and w are parallel, what is their span?',
    options: [
      'A line through the origin',
      'Still the whole plane',
      'Nothing at all',
      'A circle',
    ],
    answer: 0,
    explanation:
      'Both vectors lie along one direction, so every combination stays on that line. The pair has lost a dimension.',
  },
  {
    id: 'v4',
    prompt: 'Every span contains one point no matter which vectors you choose. Which?',
    options: [
      'The origin',
      'The point (1, 1)',
      'The tip of v',
      'There is no such point',
    ],
    answer: 0,
    explanation:
      'Taking a = 0 and b = 0 gives the zero vector, so the origin is in every span. That is why spans are lines and planes through the origin, never off to one side.',
  },
];

const prose = (
  <>
    <h2>Definition and representation</h2>
    <p>
      A vector in the plane is an ordered pair of real numbers. It is represented geometrically as a
      directed segment from the origin: the first component gives horizontal displacement, the second
      vertical. The pair (3, 1) therefore denotes a displacement of three units right and one unit up.
    </p>

    <Formula label="A vector and its magnitude" note="The magnitude follows from the Pythagorean theorem.">
      {String.raw`\mathbf{v} = \begin{pmatrix} v_1 \\ v_2 \end{pmatrix}, \qquad \lVert \mathbf{v} \rVert = \sqrt{v_1^2 + v_2^2}`}
    </Formula>

    <h2>The two admissible operations</h2>
    <p>
      Two operations are defined on vectors, and every construction in this chapter is assembled from
      them. <strong>Addition</strong> combines two vectors componentwise, realised geometrically by
      placing the tail of the second at the tip of the first. <strong>Scalar multiplication</strong>
      scales a vector by a real number, stretching or compressing it, and reversing its direction
      when the scalar is negative.
    </p>

    <Formula label="Linear combination" note="Scale each vector, then add. Every construction below reduces to this.">
      {String.raw`a\mathbf{v} + b\mathbf{w} = \begin{pmatrix} av_1 + bw_1 \\ av_2 + bw_2 \end{pmatrix}`}
    </Formula>

    <WorkedExample
      problem="Given v = (1, 2) and w = (3, −1), evaluate the linear combination 2v − w."
      steps={[
        {
          text: 'Apply scalar multiplication to each vector separately.',
          math: String.raw`2\mathbf{v} = \begin{pmatrix} 2 \\ 4 \end{pmatrix}, \qquad -1\cdot\mathbf{w} = \begin{pmatrix} -3 \\ 1 \end{pmatrix}`,
        },
        {
          text: 'Add the results componentwise.',
          math: String.raw`\begin{pmatrix} 2 \\ 4 \end{pmatrix} + \begin{pmatrix} -3 \\ 1 \end{pmatrix} = \begin{pmatrix} -1 \\ 5 \end{pmatrix}`,
        },
      ]}
      result="2v − w = (−1, 5)."
      note="Setting a = 2 and b = −1 in the explorer reproduces this vector."
    />

    <h2>Span</h2>
    <p>
      The <strong>span</strong> of a set of vectors is the set of all linear combinations of them.
      For two vectors in the plane the span is the collection of every point expressible as av + bw
      for some pair of scalars.
    </p>

    <p>
      When the two vectors point in genuinely different directions, this set is the entire plane:
      each target point admits exactly one pair (a, b). When they are parallel, every combination
      remains on a single line, and the span is that line.
    </p>

    <Callout label="The degenerate case" tone="fail">
      If w is a scalar multiple of v, the second vector contributes no direction the first did not
      already supply. The span therefore has dimension one rather than two. Dragging w onto v in the
      explorer produces this collapse directly.
    </Callout>

    <h2>The independence criterion</h2>
    <p>
      Whether the span is a line or a plane is settled by a single quantity. The vectors are{' '}
      <strong>linearly independent</strong> precisely when v₁w₂ − v₂w₁ is non-zero. The Determinants
      lesson establishes the geometric meaning of this expression: it is the signed area of the
      parallelogram the two vectors frame, and a vanishing area indicates a degenerate figure.
    </p>

    <Formula label="Independence criterion" note="A value of zero indicates parallel vectors and a span of dimension one.">
      {String.raw`v_1 w_2 - v_2 w_1 \neq 0 \iff \mathbf{v}, \mathbf{w} \text{ are independent}`}
    </Formula>

    <WorkedExample
      label="Worked example - testing a pair"
      problem="Determine whether v = (2, 3) and w = (−4, −6) span the plane."
      steps={[
        {
          text: 'Evaluate the independence criterion.',
          math: String.raw`v_1 w_2 - v_2 w_1 = (2)(-6) - (3)(-4) = -12 + 12 = 0`,
        },
        {
          text: 'The value is zero, so the vectors are dependent. Confirm by exhibiting the scalar relating them.',
          math: String.raw`\mathbf{w} = -2\,\mathbf{v}`,
        },
      ]}
      result="The pair is linearly dependent and spans only the line through the origin in the direction (2, 3)."
    />

    <h2>Application: attainable production mixes</h2>
    <p>
      The span question arises whenever a target must be assembled from fixed ingredients in
      arbitrary proportions. If the available resources are dependent, some targets are unreachable
      regardless of quantity, and the deficiency is structural rather than a matter of scale.
    </p>

    <WorkedExample
      variant="applied"
      label="Application - blending two feedstocks"
      problem="A plant blends two feedstocks. Each tonne of feedstock A supplies 2 units of nitrogen and 1 of phosphate; each tonne of B supplies 1 unit of nitrogen and 3 of phosphate. Can the plant meet an order requiring exactly 8 units of nitrogen and 9 of phosphate, and if so in what quantities?"
      steps={[
        {
          text: 'Represent each feedstock as a vector of nutrient yields, and the order as the target.',
          math: String.raw`\mathbf{a} = \begin{pmatrix} 2 \\ 1 \end{pmatrix}, \quad \mathbf{b} = \begin{pmatrix} 1 \\ 3 \end{pmatrix}, \quad \mathbf{t} = \begin{pmatrix} 8 \\ 9 \end{pmatrix}`,
        },
        {
          text: 'Test independence to establish whether every order is attainable.',
          math: String.raw`(2)(3) - (1)(1) = 5 \neq 0`,
        },
        {
          text: 'The feedstocks are independent, so the span is the whole plane and the order is attainable. Solve for the tonnages x and y.',
          math: String.raw`\begin{aligned} 2x + y &= 8 \\ x + 3y &= 9 \end{aligned}`,
        },
        {
          text: 'Eliminate y by subtracting three times the first equation from the second.',
          math: String.raw`x + 3y - 3(2x + y) = 9 - 24 \;\Longrightarrow\; -5x = -15 \;\Longrightarrow\; x = 3`,
        },
        {
          text: 'Substitute back to recover y.',
          math: String.raw`2(3) + y = 8 \;\Longrightarrow\; y = 2`,
        },
      ]}
      result="Blend 3 tonnes of feedstock A with 2 tonnes of B. Because the two feedstocks are independent, any nutrient specification whatsoever can be met by some blend."
      note="Had the criterion returned zero, the two feedstocks would supply nutrients in a fixed ratio, and only orders in that same ratio could be filled."
    />

    <Example label="Coordinates as a choice">
      A coordinate pair is meaningful only relative to a chosen pair of reference vectors. Writing a
      point as (3, 1) asserts that it equals three of the standard horizontal vector plus one of the
      standard vertical vector. A different independent pair assigns the same point different
      coordinates. Much of linear algebra is concerned with exploiting that freedom.
    </Example>
  </>
);

export default function VectorsLesson({ lessonId }) {
  const [v, setV] = useState({ x: defaults.vx, y: defaults.vy });
  const [w, setW] = useState({ x: defaults.wx, y: defaults.wy });
  const [a, setA] = useState(defaults.a);
  const [b, setB] = useState(defaults.b);
  const [showCombo, setShowCombo] = useState(defaults.showCombo);

  const det = cross(v, w);
  const dependent = Math.abs(det) < 0.05;
  const result = combine(v, w, a, b);

  function move(which, next) {
    if (which === 'v') setV(next);
    else setW(next);
  }

  function reset() {
    setV({ x: defaults.vx, y: defaults.vy });
    setW({ x: defaults.wx, y: defaults.wy });
    setA(defaults.a);
    setB(defaults.b);
    setShowCombo(defaults.showCombo);
  }

  const values = { vx: v.x, vy: v.y, wx: w.x, wy: w.y, a, b, showCombo };

  return (
    <LessonLayout
      lessonId={lessonId}
      story={<WindPlaneStory />}
      quiz={questions}
      reference={<FormulaReference title="Vector reference" groups={vectorFormulas} />}
      intro="A vector is an arrow from the origin, and there are only two things you can do with one: scale it, or add it to another. Everything the subject builds rests on those two moves."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plane</span>
              <h2>Two arrows and what they reach</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={values} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Vector presets">
            <button className="chip" type="button" onClick={() => { setV({ x: 3, y: 1 }); setW({ x: -1, y: 2 }); }}>
              Independent
            </button>
            <button className="chip" type="button" onClick={() => { setV({ x: 2, y: 1 }); setW({ x: 4, y: 2 }); }}>
              Parallel
            </button>
            <button className="chip" type="button" onClick={() => { setV({ x: 1, y: 0 }); setW({ x: 0, y: 1 }); }}>
              Standard basis
            </button>
            <button className="chip" type="button" onClick={() => { setV({ x: 3, y: 0 }); setW({ x: 0, y: -2 }); }}>
              Axis aligned
            </button>
          </div>

          <VectorExplorer v={v} w={w} a={a} b={b} showCombo={showCombo} onChange={move} />

          <dl className="readout">
            <div>
              <dt>v</dt>
              <dd>({v.x.toFixed(1)}, {v.y.toFixed(1)})</dd>
            </div>
            <div>
              <dt>w</dt>
              <dd>({w.x.toFixed(1)}, {w.y.toFixed(1)})</dd>
            </div>
            <div>
              <dt>‖v‖</dt>
              <dd>{magnitude(v).toFixed(2)}</dd>
            </div>
            <div className="is-close">
              <dt>v₁w₂ − v₂w₁</dt>
              <dd>{det.toFixed(2)}</dd>
            </div>
          </dl>

          <div className="controls">
            <div className="slider">
              <label htmlFor="combo-a">Scalar a</label>
              <input
                id="combo-a"
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={a}
                onChange={(event) => setA(Number(event.target.value))}
              />
              <output>{a.toFixed(1)}</output>
            </div>

            <div className="slider">
              <label htmlFor="combo-b">Scalar b</label>
              <input
                id="combo-b"
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={b}
                onChange={(event) => setB(Number(event.target.value))}
              />
              <output>{b.toFixed(1)}</output>
            </div>

            <div className="control-row">
              <button
                className={`chip ${showCombo ? 'selected' : ''}`}
                type="button"
                aria-pressed={showCombo}
                onClick={() => setShowCombo((current) => !current)}
              >
                Show the combination
              </button>
            </div>

            <div className={`epsilon-strip ${dependent ? 'is-fail' : 'is-ok'}`}>
              <span className="verdict">{dependent ? 'spans a line' : 'spans the plane'}</span>
              <p>
                {dependent
                  ? 'v and w are parallel, so every combination lands on one line through the origin. The second arrow adds no new direction.'
                  : `av + bw reaches (${result.x.toFixed(1)}, ${result.y.toFixed(1)}). Because the pair is independent, every point in the plane has exactly one such (a, b).`}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Drag either arrowhead, or focus one and use the arrow keys (hold Shift for whole units).
            The faint legs show the combination being built one scaled vector at a time.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
