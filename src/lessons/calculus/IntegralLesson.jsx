import { useEffect, useRef, useState } from 'react';
import { Grid2x2, Pause, Play, Rows3 } from 'lucide-react';
import IntegralExplorer, { bRange, nRange } from './IntegralExplorer.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { integralFormulas } from '../../lib/formulas.js';
import { exactArea, riemannSum, rules } from '../../lib/riemann.js';
import { usePlayback } from '../../lib/usePlayback.js';

const questions = [
  {
    id: 'i1',
    prompt: 'What is the exact value of the integral of x² from 0 to 3?',
    options: ['3', '9', '18', '27'],
    answer: 1,
    explanation: 'The area comes to b³/3, and 3³/3 = 9. Drag the handle to b = 3 and raise n to watch the rectangles close in on it.',
  },
  {
    id: 'i2',
    prompt: 'On [0, 3], f(x) = x² is increasing. What does a left-endpoint sum do?',
    options: ['Underestimates the area', 'Overestimates the area', 'Matches it exactly', 'Depends on n'],
    answer: 0,
    explanation: 'Each rectangle takes its height from the lowest point of its slice, so every rectangle sits under the curve. Switch to Right to see the opposite.',
  },
  {
    id: 'i3',
    prompt: 'As the number of rectangles n grows, what happens to the width Δx?',
    options: ['It approaches 0', 'It approaches 1', 'It grows without bound', 'It stays fixed'],
    answer: 0,
    explanation: 'Δx = (b − a)/n, so more slices means thinner ones. The integral is the limit of the sum as Δx approaches 0.',
  },
  {
    id: 'i4',
    prompt: 'The area from 0 to b is b³/3. What is the derivative of that area with respect to b?',
    options: ['3b²', 'b²', 'b³', 'b⁴/4'],
    answer: 1,
    explanation: 'It is b², the original function. Differentiating an area function returns the curve you started from, which is the Fundamental Theorem of Calculus.',
  },
];

const defaults = { b: 2, n: 8, rule: 'left', showExact: true };

// Static prose, hoisted so React skips the subtree while the plot is dragged.
const prose = (
  <>
    <h2>Adding up the slices</h2>
    <p>
      The area under a curve has no formula the way a rectangle does. So we approximate it with
      shapes we can measure: chop the interval into <strong>n</strong> slices of width{' '}
      <strong>Δx</strong>, stand a rectangle on each one, and add up their areas.
    </p>

    <Formula
      label="A Riemann sum"
      note="Each rectangle takes its height from one sample point inside its own slice."
    >
      {String.raw`\int_a^b f(x)\, dx = \lim_{n \to \infty} \sum_{i=1}^{n} f(x_i)\, \Delta x`}
    </Formula>

    <h2>Why this needs a limit</h2>
    <p>
      Any finite number of rectangles is wrong: they either poke above the curve or fall short of
      it. The integral is not any one of those sums, it is where they are <strong>heading</strong>{' '}
      as the slices get thinner. That is the same move as the first two lessons in this chapter.
    </p>

    <Callout label="Which corner you measure from">
      With an increasing curve, sampling at the <strong>left</strong> edge always underestimates
      and the <strong>right</strong> edge always overestimates, so the truth is trapped between
      them. Sampling at the <strong>middle</strong> lets the overshoot on one side cancel the
      shortfall on the other, which is why it converges far faster.
    </Callout>

    <h2>The link back to derivatives</h2>
    <p>
      For f(x) = x² the area from 0 to b works out to <strong>b³/3</strong>. Differentiate that
      with respect to b and you get b² back, the curve you started with. Accumulation and rate of
      change are inverse operations, and that statement is the Fundamental Theorem of Calculus.
    </p>

    <Example>
      Earlier in this chapter the derivative was a speedometer, turning distance into speed. An
      integral runs the other way: hold a speed for an hour and you have covered that many miles.
      Add up every instant of a journey and you get the odometer reading.
    </Example>
  </>
);

export default function IntegralLesson({ lessonId }) {
  const [b, setB] = useState(defaults.b);
  const [n, setN] = useState(defaults.n);
  const [rule, setRule] = useState(defaults.rule);
  const [showExact, setShowExact] = useState(defaults.showExact);
  const [announced, setAnnounced] = useState('');

  const approx = riemannSum(0, b, n, rule);
  const exact = exactArea(0, b);
  const error = Math.abs(exact - approx);
  const deltaX = b / n;
  const playFrom = useRef(4);

  const { playing, start, stop } = usePlayback((progress) => {
    setN(Math.max(1, Math.round(playFrom.current + (nRange[1] - playFrom.current) * progress)));
  });

  function setSlices(next) {
    stop();
    setN(next);
  }

  function reset() {
    stop();
    setB(defaults.b);
    setN(defaults.n);
    setRule(defaults.rule);
    setShowExact(defaults.showExact);
  }

  function refine() {
    if (playing) {
      stop();
      return;
    }

    const from = n > nRange[1] - 10 ? 4 : n;
    playFrom.current = from;
    setN(from);
    start(2800);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnounced(
        `${n} rectangles. Approximation ${approx.toFixed(3)}. Exact ${exact.toFixed(3)}. Error ${error.toFixed(3)}.`
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [n, approx, exact, error]);

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Integration reference" groups={integralFormulas} />}
      intro="An integral measures accumulated quantity: the area trapped between a curve and the axis, found by slicing it into rectangles and letting the slices get infinitely thin."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plot</span>
              <h2>Slice the area</h2>
            </div>
            <div className="visual-actions">
              <div
                className="segmented"
                aria-label="Rectangle height rule"
                style={{ '--active-index': rules.findIndex(([value]) => value === rule) }}
              >
                {rules.map(([value, label]) => (
                  <button
                    className={rule === value ? 'selected' : ''}
                    key={value}
                    onClick={() => setRule(value)}
                    type="button"
                    aria-pressed={rule === value}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <ResetButton values={{ b, n, rule, showExact }} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <dl className="readout">
            <div>
              <dt>n</dt>
              <dd>{n}</dd>
            </div>
            <div>
              <dt>Δx</dt>
              <dd>{deltaX.toFixed(3)}</dd>
            </div>
            <div>
              <dt>sum</dt>
              <dd>{approx.toFixed(3)}</dd>
            </div>
            <div className={error < 0.05 ? 'is-close' : ''}>
              <dt>error</dt>
              <dd>{error.toFixed(3)}</dd>
            </div>
          </dl>

          <IntegralExplorer b={b} n={n} rule={rule} showExact={showExact} onChangeB={setB} />

          <p className="sr-only" aria-live="polite">
            {announced}
          </p>

          <div className="controls">
            <label className="slider">
              <span className="slider-label">Rectangles</span>
              <input
                type="range"
                min={nRange[0]}
                max={nRange[1]}
                step="1"
                value={n}
                onChange={(event) => setSlices(Number(event.target.value))}
              />
              <strong className="slider-value">{n}</strong>
            </label>

            <label className="slider">
              <span className="slider-label">Upper limit b</span>
              <input
                type="range"
                min={bRange[0]}
                max={bRange[1]}
                step="0.01"
                value={b}
                onChange={(event) => setB(Number(event.target.value))}
              />
              <strong className="slider-value">{b.toFixed(2)}</strong>
            </label>

            <div className="control-row">
              <button className="chip is-action" type="button" onClick={refine}>
                {playing ? <Pause size={14} /> : <Play size={14} />}
                {playing ? 'Stop' : 'Add slices'}
              </button>
              <button className="chip" type="button" onClick={() => setSlices(4)}>
                <Rows3 size={14} />
                Coarse
              </button>
              <button className="chip" type="button" onClick={() => setSlices(20)}>
                <Grid2x2 size={14} />
                Finer
              </button>
              <button className="chip" type="button" onClick={() => setSlices(nRange[1])}>
                <Grid2x2 size={14} />
                Very fine
              </button>

              <span className="control-spacer" />

              <label className="switch">
                <input
                  type="checkbox"
                  checked={showExact}
                  onChange={(event) => setShowExact(event.target.checked)}
                />
                <span className="switch-track" aria-hidden="true">
                  <span className="switch-thumb" />
                </span>
                True area
              </label>
            </div>

            <div className={`epsilon-strip ${error < 0.05 ? 'is-ok' : ''}`}>
              <span className="verdict">exact {exact.toFixed(3)}</span>
              <p>
                {n === 1
                  ? 'One rectangle is a crude guess. Add slices and watch the sum close on the true area.'
                  : `${n} rectangles of width ${deltaX.toFixed(3)} put the estimate within ${error.toFixed(3)} of the true area.`}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Drag the handle at the right edge to move b, or focus it and use the arrow keys.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
