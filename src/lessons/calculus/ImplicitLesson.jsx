import { useState } from 'react';
import ImplicitExplorer, { RADIUS, pointAt, slopeAt } from './ImplicitExplorer.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import PracticeSet from '../../components/PracticeSet.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { derivativeFormulas } from '../../lib/formulas.js';
import { implicitGenerators } from './implicitProblems.js';

const questions = [
  {
    id: 'im1',
    prompt: 'Why does differentiating y² with respect to x give 2y·dy/dx rather than 2y?',
    options: [
      'Because y is itself a function of x, so the chain rule applies',
      'Because y is a constant',
      'Because the power rule does not work on y',
      'Because dy/dx is always 1',
    ],
    answer: 0,
    explanation: 'The outer power gives 2y, and the inner derivative of y with respect to x is dy/dx. Leaving that factor off is the single most common mistake in the whole topic.',
  },
  {
    id: 'im2',
    prompt: 'For x² + y² = 25, what is dy/dx?',
    options: ['−x/y', 'x/y', '−y/x', '−2x'],
    answer: 0,
    explanation: '2x + 2y·dy/dx = 0, so dy/dx = −x/y. Drag the point around the circle and watch the readout match this at every position.',
  },
  {
    id: 'im3',
    prompt: 'On the circle x² + y² = 25, what happens to the tangent at (5, 0)?',
    options: [
      'It is vertical, so dy/dx is undefined',
      'It is horizontal with slope 0',
      'It has slope 1',
      'The tangent does not exist',
    ],
    answer: 0,
    explanation: 'At y = 0 the formula −x/y divides by zero. The tangent still exists geometrically, it is just vertical, and a vertical line has no finite slope.',
  },
  {
    id: 'im4',
    prompt: 'Why can we not just solve x² + y² = 25 for y and differentiate normally?',
    options: [
      'We can here, but it splits into two branches and most implicit curves cannot be solved at all',
      'Because the equation has no solutions',
      'Because squaring is not differentiable',
      'Because the result would be the same anyway',
    ],
    answer: 0,
    explanation: 'A circle splits into y = ±√(25 − x²), which is awkward but possible. Curves like x³ + y³ = 6xy cannot be untangled for y at all, and implicit differentiation handles them without complaint.',
  },
];

const defaults = { angle: Math.PI / 4, showTangent: true };

const prose = (
  <>
    <h2>Implicitly defined curves</h2>
    <p>
      Every derivative so far started from <strong>y = something in x</strong>. But plenty of curves
      refuse to be written that way. The circle below is the friendly case, and even it needs two
      separate square roots to untangle. Something like x³ + y³ = 6xy cannot be solved for y at all.
    </p>

    <p>
      The trick is to stop trying. Differentiate the equation exactly as it stands, treating y as an
      unnamed function of x, and let dy/dx appear on its own.
    </p>

    <Formula
      label="The one rule you need"
      note="Any term containing y picks up a factor of dy/dx from the chain rule."
    >
      {String.raw`\frac{d}{dx}\big[\,y^n\,\big] = n y^{\,n-1} \frac{dy}{dx}`}
    </Formula>

    <h2>Procedure</h2>
    <p>
      Differentiate both sides with respect to <strong>x</strong>. Terms in x behave normally. Terms
      in y gain a dy/dx. Then collect every dy/dx on one side and divide. That is the whole
      procedure, and it never changes.
    </p>

    <Callout label="Common error" tone="fail">
      Differentiating y² and writing 2y. The y is a function of x, not a variable independent of it,
      so the chain rule demands that extra dy/dx. If your answer has no dy/dx in it before you solve,
      you have already lost it.
    </Callout>

    <h2>Interpreting dy/dx</h2>
    <p>
      Notice that dy/dx = −x/y depends on <strong>both</strong> coordinates. That is normal for an
      implicit derivative and not a sign you did something wrong. It simply means you need to know
      where you are on the curve before you can say how steep it is.
    </p>

    <p>
      It also explains the vertical tangents. At the far left and right of the circle y is zero, the
      formula divides by zero, and the slope is undefined. The curve is perfectly smooth there; it is
      the idea of &ldquo;rise over run&rdquo; that breaks down when the run is zero.
    </p>

    <Example label="Applications">
      Anything defined by a constraint rather than a formula. A level curve on a contour map, a
      pressure and volume relationship holding energy fixed, or the path traced where two surfaces
      meet. In each case the relationship is known but neither variable is written in terms of the
      other, and this is the only way to get a slope out of it.
    </Example>
  </>
);

export default function ImplicitLesson({ lessonId }) {
  const [angle, setAngle] = useState(defaults.angle);
  const [showTangent, setShowTangent] = useState(defaults.showTangent);

  const point = pointAt(angle);
  const slope = slopeAt(angle);

  function reset() {
    setAngle(defaults.angle);
    setShowTangent(defaults.showTangent);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Differentiation reference" groups={derivativeFormulas} />}
      practice={<PracticeSet title="Solve for dy/dx" generators={implicitGenerators} />}
      intro="Implicit differentiation finds a slope from an equation that was never solved for y, by differentiating the relationship as it stands and letting dy/dx fall out."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plot</span>
              <h2>Slope from an implicit equation</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={{ angle, showTangent }} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <dl className="readout">
            <div>
              <dt>x</dt>
              <dd>{point.x.toFixed(2)}</dd>
            </div>
            <div>
              <dt>y</dt>
              <dd>{point.y.toFixed(2)}</dd>
            </div>
            <div>
              <dt>−x/y</dt>
              <dd>{slope === null ? 'undef' : slope.toFixed(2)}</dd>
            </div>
            <div className={Math.abs(point.x * point.x + point.y * point.y - RADIUS * RADIUS) < 0.01 ? 'is-close' : ''}>
              <dt>x² + y²</dt>
              <dd>{(point.x * point.x + point.y * point.y).toFixed(1)}</dd>
            </div>
          </dl>

          <ImplicitExplorer angle={angle} showTangent={showTangent} onChange={setAngle} />

          <div className="controls">
            <label className="slider">
              <span className="slider-label">Move around the circle</span>
              <input
                type="range"
                min={-Math.PI}
                max={Math.PI}
                step="0.01"
                value={angle > Math.PI ? angle - 2 * Math.PI : angle < -Math.PI ? angle + 2 * Math.PI : angle}
                onChange={(event) => setAngle(Number(event.target.value))}
              />
              <strong className="slider-value">{point.x.toFixed(1)}</strong>
            </label>

            <div className="control-row">
              <button className="chip" type="button" onClick={() => setAngle(Math.PI / 2)}>
                Top
              </button>
              <button className="chip" type="button" onClick={() => setAngle(0)}>
                Right edge
              </button>
              <button className="chip" type="button" onClick={() => setAngle(Math.PI)}>
                Left edge
              </button>

              <span className="control-spacer" />

              <label className="switch">
                <input
                  type="checkbox"
                  checked={showTangent}
                  onChange={(event) => setShowTangent(event.target.checked)}
                />
                <span className="switch-track" aria-hidden="true">
                  <span className="switch-thumb" />
                </span>
                Tangent
              </label>
            </div>

            <div className={`epsilon-strip ${slope === null ? 'is-fail' : 'is-ok'}`}>
              <span className="verdict">
                {slope === null ? 'vertical tangent' : `dy/dx = ${slope.toFixed(2)}`}
              </span>
              <p>
                {slope === null
                  ? 'Here y = 0, so −x/y divides by zero. The curve is smooth, but the tangent is vertical and has no finite slope.'
                  : `At (${point.x.toFixed(2)}, ${point.y.toFixed(2)}) the formula gives −(${point.x.toFixed(2)})/(${point.y.toFixed(2)}), and the tangent matches it.`}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Drag the point around the circle, or focus it and use the arrow keys.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
