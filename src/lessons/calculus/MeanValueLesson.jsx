import { useState } from 'react';
import MeanValueExplorer from './MeanValueExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { guaranteedPoints, mvtCurve, secantSlope } from '../../lib/curves.js';

const defaults = { a: -1.6, b: 1.8, showTangents: true };

const questions = [
  {
    id: 'm1',
    prompt: 'The Mean Value Theorem guarantees a point c where the tangent slope equals what?',
    options: [
      'The average rate of change across the interval',
      'Zero',
      'The slope at the left endpoint',
      'The second derivative',
    ],
    answer: 0,
    explanation: 'It equals (f(b) − f(a))/(b − a), the slope of the secant joining the endpoints.',
  },
  {
    id: 'm2',
    prompt: 'How many such points c does the theorem promise?',
    options: ['At least one', 'Exactly one', 'Exactly two', 'None in general'],
    answer: 0,
    explanation: 'At least one. Drag the endpoints wide on the plot and a second point often appears, both with tangents parallel to the same secant.',
  },
  {
    id: 'm3',
    prompt: 'If f(a) = f(b), what does the theorem reduce to?',
    options: [
      'A point where f′(c) = 0',
      'A point where f(c) = 0',
      'A vertical tangent',
      'Nothing useful',
    ],
    answer: 0,
    explanation: 'The secant is horizontal, so its slope is zero. That special case is called Rolle\'s theorem.',
  },
];

const prose = (
  <>
    <h2>Average and instantaneous rate</h2>
    <p>
      Drive 120 miles in two hours and your average speed was 60 mph. You may have sped up and
      slowed down throughout, but there must have been at least one instant where the speedometer
      read exactly 60. That is the Mean Value Theorem, and it is more useful than it first looks.
    </p>

    <Formula label="The Mean Value Theorem" note="For f continuous on [a, b] and differentiable in between, some c in the interval satisfies this.">
      {String.raw`f'(c) = \frac{f(b) - f(a)}{b - a}`}
    </Formula>

    <h2>Geometric interpretation</h2>
    <p>
      The right-hand side is the slope of the <strong>secant</strong> joining the two endpoints.
      The left-hand side is the slope of a <strong>tangent</strong> somewhere inside. The theorem
      says you can always slide the secant sideways until it touches the curve, and where it
      touches, the tangent is parallel.
    </p>

    <Callout label="Existence, not uniqueness">
      The guarantee is existence, not uniqueness. On this cubic a wide interval often produces{' '}
      <strong>two</strong> points where the tangent is parallel to the same secant. Widen the
      endpoints and watch the second one appear.
    </Callout>

    <h2>Consequences</h2>
    <p>
      It is the bridge between a derivative at a point and behaviour across an interval. It is how
      we prove that a function with zero derivative everywhere must be constant, and that a
      positive derivative forces a function to increase, both of which we relied on in earlier
      lessons without justification.
    </p>

    <Example label="Applications">
      Average speed cameras on a motorway. They record your entry and exit times, and the theorem
      guarantees that if your average exceeded the limit, there was a moment when your actual
      speed did too. That is enough to issue the ticket.
    </Example>
  </>
);

export default function MeanValueLesson({ lessonId }) {
  const [a, setA] = useState(defaults.a);
  const [b, setB] = useState(defaults.b);
  const [showTangents, setShowTangents] = useState(defaults.showTangents);

  const slope = secantSlope(mvtCurve, a, b);
  const points = guaranteedPoints(mvtCurve, a, b);

  function reset() {
    setA(defaults.a);
    setB(defaults.b);
    setShowTangents(defaults.showTangents);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      intro="Over any smooth stretch of curve, there is always a moment where the instantaneous rate matches the average rate for the whole trip."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plot</span>
              <h2>Tangent parallel to secant</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={{ a, b, showTangents }} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <dl className="readout">
            <div>
              <dt>a</dt>
              <dd>{a.toFixed(2)}</dd>
            </div>
            <div>
              <dt>b</dt>
              <dd>{b.toFixed(2)}</dd>
            </div>
            <div>
              <dt>average rate</dt>
              <dd>{slope.toFixed(2)}</dd>
            </div>
            <div className="is-close">
              <dt>points c</dt>
              <dd>{points.length}</dd>
            </div>
          </dl>

          <MeanValueExplorer
            a={a}
            b={b}
            showTangents={showTangents}
            onChangeA={setA}
            onChangeB={setB}
          />

          <div className="controls">
            <label className="slider">
              <span className="slider-label">Left a</span>
              <input
                type="range"
                min={mvtCurve.aRange[0]}
                max={mvtCurve.aRange[1]}
                step="0.01"
                value={a}
                onChange={(event) => setA(Number(event.target.value))}
              />
              <strong className="slider-value">{a.toFixed(2)}</strong>
            </label>

            <label className="slider">
              <span className="slider-label">Right b</span>
              <input
                type="range"
                min={mvtCurve.bRange[0]}
                max={mvtCurve.bRange[1]}
                step="0.01"
                value={b}
                onChange={(event) => setB(Number(event.target.value))}
              />
              <strong className="slider-value">{b.toFixed(2)}</strong>
            </label>

            <div className="control-row">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={showTangents}
                  onChange={(event) => setShowTangents(event.target.checked)}
                />
                <span className="switch-track" aria-hidden="true">
                  <span className="switch-thumb" />
                </span>
                Tangents at c
              </label>
            </div>

            <div className="epsilon-strip is-ok">
              <span className="verdict">
                {points.length === 1 ? 'one point c' : `${points.length} points c`}
              </span>
              <p>
                Every tangent drawn here has slope {slope.toFixed(2)}, the same as the secant. Move
                the endpoints and the points slide, but they never disappear.
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Drag either endpoint, or focus one and use the arrow keys.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
