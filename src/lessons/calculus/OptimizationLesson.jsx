import { useState } from 'react';
import { Crosshair, MoveDown, MoveUp } from 'lucide-react';
import OptimizationExplorer from './OptimizationExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { cubic } from '../../lib/curves.js';

const defaults = { xValue: -0.6, showCritical: true };

const questions = [
  {
    id: 'o1',
    prompt: 'What is true of the derivative at a smooth maximum or minimum?',
    options: ['It is zero', 'It is undefined', 'It is positive', 'It equals the function value'],
    answer: 0,
    explanation: 'The tangent is horizontal there, so f′ = 0. Those inputs are called critical points.',
  },
  {
    id: 'o2',
    prompt: 'For f(x) = x³ − 3x² + 2, the critical points come from solving 3x² − 6x = 0. Where are they?',
    options: ['x = 0 and x = 2', 'x = 1 and x = 3', 'x = −2 and x = 2', 'x = 3 only'],
    answer: 0,
    explanation: 'Factor to 3x(x − 2) = 0, giving x = 0 and x = 2. Drag the point to each and watch the tangent flatten.',
  },
  {
    id: 'o3',
    prompt: 'How does the second derivative tell a maximum from a minimum?',
    options: [
      'f″ < 0 means a maximum, f″ > 0 means a minimum',
      'f″ < 0 means a minimum, f″ > 0 means a maximum',
      'f″ is always zero at both',
      'It cannot distinguish them',
    ],
    answer: 0,
    explanation: 'Negative second derivative means the curve bends downwards, so a flat point there is a peak. Here f″ = 6x − 6, negative at x = 0 and positive at x = 2.',
  },
  {
    id: 'o4',
    prompt: 'Does every critical point have to be a maximum or a minimum?',
    options: [
      'No, it can be a flat bend that keeps going',
      'Yes, always one or the other',
      'Only if the function is a polynomial',
      'Only if f″ is zero',
    ],
    answer: 0,
    explanation: 'A saddle or inflection with a horizontal tangent, like x³ at zero, is flat but neither a peak nor a valley.',
  },
];

// Static prose, hoisted so React skips the subtree while the plot is dragged.
const prose = (
  <>
    <h2>Flat means interesting</h2>
    <p>
      At the top of a hill you are neither climbing nor descending. That instant of flatness is
      what makes optimization a derivative problem: instead of scanning every value of the
      function, solve one equation and get the candidates directly.
    </p>

    <Formula label="Critical points" note="Solve for x, then classify each solution you find.">
      {String.raw`f'(x) = 0`}
    </Formula>

    <h2>Classifying what you find</h2>
    <p>
      A flat tangent alone does not say whether you are on a peak or in a valley. The second
      derivative settles it by describing how the curve bends: negative bends downwards into a{' '}
      <strong>maximum</strong>, positive bends upwards into a <strong>minimum</strong>.
    </p>

    <Formula label="The second derivative test" note="For this curve f″(x) = 6x − 6, negative at x = 0 and positive at x = 2.">
      {String.raw`f''(c) < 0 \Rightarrow \text{maximum}, \qquad f''(c) > 0 \Rightarrow \text{minimum}`}
    </Formula>

    <Callout label="Flat is not always extreme" tone="fail">
      A horizontal tangent can also be a flat bend that carries on in the same direction, as x³
      does at zero. When f″ is also zero the test is inconclusive and you must check the sign of
      f′ on either side instead.
    </Callout>

    <h2>Do not forget the edges</h2>
    <p>
      On a closed interval the largest value might sit at an endpoint rather than at a critical
      point, where the curve never levels off at all. Real optimization always checks the boundary
      as well as the interior.
    </p>

    <Example label="Where it shows up">
      A drinks can holding a fixed volume with the least aluminium. Write the surface area in terms
      of the radius, differentiate, set it to zero, and the optimal proportions fall out. Almost
      every engineering trade-off is this same three-step move.
    </Example>
  </>
);

export default function OptimizationLesson({ lessonId }) {
  const [xValue, setXValue] = useState(defaults.xValue);
  const [showCritical, setShowCritical] = useState(defaults.showCritical);

  const slope = cubic.df(xValue);
  const bend = cubic.ddf(xValue);
  const flat = Math.abs(slope) < 0.25;

  function reset() {
    setXValue(defaults.xValue);
    setShowCritical(defaults.showCritical);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      intro="Peaks and valleys are exactly the places where a curve momentarily stops rising or falling, which makes finding them a question about the derivative rather than the function."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plot</span>
              <h2>Hunting for flat tangents</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={{ xValue, showCritical }} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <dl className="readout">
            <div>
              <dt>x</dt>
              <dd>{xValue.toFixed(2)}</dd>
            </div>
            <div>
              <dt>f(x)</dt>
              <dd>{cubic.f(xValue).toFixed(2)}</dd>
            </div>
            <div className={flat ? 'is-close' : ''}>
              <dt>f′(x)</dt>
              <dd>{slope.toFixed(2)}</dd>
            </div>
            <div>
              <dt>f″(x)</dt>
              <dd>{bend.toFixed(2)}</dd>
            </div>
          </dl>

          <OptimizationExplorer xValue={xValue} showCritical={showCritical} onChange={setXValue} />

          <div className="controls">
            <label className="slider">
              <span className="slider-label">Move x</span>
              <input
                type="range"
                min={cubic.xDomain[0]}
                max={cubic.xDomain[1]}
                step="0.01"
                value={xValue}
                onChange={(event) => setXValue(Number(event.target.value))}
              />
              <strong className="slider-value">{xValue.toFixed(2)}</strong>
            </label>

            <div className="control-row">
              <button className="chip" type="button" onClick={() => setXValue(0)}>
                <MoveUp size={14} />
                To the peak
              </button>
              <button className="chip" type="button" onClick={() => setXValue(2)}>
                <MoveDown size={14} />
                To the valley
              </button>
              <button className="chip" type="button" onClick={() => setXValue(cubic.inflection)}>
                <Crosshair size={14} />
                Inflection
              </button>

              <span className="control-spacer" />

              <label className="switch">
                <input
                  type="checkbox"
                  checked={showCritical}
                  onChange={(event) => setShowCritical(event.target.checked)}
                />
                <span className="switch-track" aria-hidden="true">
                  <span className="switch-thumb" />
                </span>
                Critical points
              </label>
            </div>

            <div className={`epsilon-strip ${flat ? 'is-ok' : ''}`}>
              <span className="verdict">{flat ? 'tangent is flat' : `sloping ${slope > 0 ? 'up' : 'down'}`}</span>
              <p>
                {flat
                  ? `f″ = ${bend.toFixed(2)}, so the curve bends ${bend < 0 ? 'downwards: this is a maximum' : 'upwards: this is a minimum'}.`
                  : 'Slide toward a peak or valley and the tangent levels out as the slope passes through zero.'}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Drag the point along the curve, or focus it and use the arrow keys.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
