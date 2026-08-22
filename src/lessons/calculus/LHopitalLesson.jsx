import { useMemo, useRef, useState } from 'react';
import { Crosshair, Pause, Play } from 'lucide-react';
import LHopitalExplorer from './LHopitalExplorer.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { limitFormulas } from '../../lib/formulas.js';
import { getLHopitalFunction, lhopitalFunctions } from '../../lib/lhopitalFunctions.js';
import { usePlayback } from '../../lib/usePlayback.js';

const questions = [
  {
    id: 'lh1',
    prompt: 'When is L’Hôpital’s rule allowed?',
    options: [
      'Only when the limit is an indeterminate form such as 0/0 or ∞/∞',
      'For any limit at all',
      'Only for polynomials',
      'Only when the denominator is x',
    ],
    answer: 0,
    explanation: 'Check the form first. Applying it to something like (x + 1)/(x + 2) at x = 0 gives 1/1 = 1, but the real answer is 1/2. The rule is simply not valid there.',
  },
  {
    id: 'lh2',
    prompt: 'What does the rule tell you to do?',
    options: [
      'Differentiate the numerator and denominator separately, then take the limit again',
      'Apply the quotient rule to f/g',
      'Multiply the top and bottom by x',
      'Take the derivative of the whole fraction',
    ],
    answer: 0,
    explanation: 'It is not the quotient rule. You differentiate f and g independently and form the new ratio f′/g′. Using the quotient rule here is the classic error.',
  },
  {
    id: 'lh3',
    prompt: 'After one application you still get 0/0. What now?',
    options: [
      'Apply the rule again, as many times as the form persists',
      'The limit does not exist',
      'Give up and factor instead',
      'The answer is always 0',
    ],
    answer: 0,
    explanation: 'Repeat it. Try (1 − cos x)/x² in the picker: one round gives (sin x)/(2x), still 0/0, and a second round gives (cos x)/2 = 1/2.',
  },
  {
    id: 'lh4',
    prompt: 'Why does the rule work, intuitively?',
    options: [
      'Near a, each function is well approximated by its tangent line, and the ratio of the functions becomes the ratio of the slopes',
      'Because derivatives are always smaller',
      'Because 0/0 equals 1',
      'Because the graphs are parallel',
    ],
    answer: 0,
    explanation: 'Both functions pass through zero at a. Zoom in far enough and each looks like a straight line through that point, so their ratio settles on the ratio of those two slopes.',
  },
];

const defaults = { fnId: 'sine', xValue: 2 };

const prose = (
  <>
    <h2>Indeterminate forms</h2>
    <p>
      The very first lesson ran into a wall. The difference quotient gives 0/0 when you set h = 0,
      and 0/0 says nothing at all: it could be 0, or 1, or 47, depending entirely on which two
      quantities are shrinking and how fast. Every limit so far has worked around that by factoring,
      cancelling, or squeezing.
    </p>

    <p>
      L&rsquo;Hôpital&rsquo;s rule replaces all of that with one move. If both parts of a fraction
      vanish together, compare how <strong>fast</strong> they vanish.
    </p>

    <Formula
      label="L’Hôpital’s rule"
      note="Valid only when f(a) and g(a) are both 0, or both infinite."
    >
      {String.raw`\lim_{x \to a} \frac{f(x)}{g(x)} = \lim_{x \to a} \frac{f'(x)}{g'(x)}`}
    </Formula>

    <h2>Justification</h2>
    <p>
      Both curves pass through zero at the same place. Zoom in close enough and each one is
      indistinguishable from its tangent line through that point, so f is about f′(a)(x − a) and g is
      about g′(a)(x − a). The common factor cancels, and what survives is the ratio of the two
      slopes.
    </p>

    <p>
      That is why the rule is about <strong>rates</strong>. Two runners can both be at the start line
      at once; who is ahead a moment later is decided by their speeds.
    </p>

    <Callout label="Conditions for use" tone="fail">
      This is not a general shortcut for fractions. It applies only to an indeterminate form. On
      (x + 1)/(x + 2) at x = 0 the rule would hand you 1/1 = 1, while the correct answer is plainly
      1/2. Confirm 0/0 or ∞/∞ before you touch it.
    </Callout>

    <h2>Distinction from the quotient rule</h2>
    <p>
      Differentiate the top. Differentiate the bottom. Separately. There is no product, no square in
      the denominator, none of that machinery. Reaching for the quotient rule here is the single most
      common slip, and it produces an answer that looks plausible and is wrong.
    </p>

    <h2>Repeated application</h2>
    <p>
      Sometimes one round is not enough. If f′/g′ is still 0/0, the rule applies again to that new
      fraction, and again after that. Each round differentiates once more until the form finally
      resolves.
    </p>

    <Example label="Applications">
      Physics is full of these. The small-angle result sin θ ≈ θ, the way relativistic energy
      collapses back to ½mv² at low speed, the limiting behaviour of a decaying signal as its rate
      approaches zero. Each is a 0/0 comparison of two quantities heading to nothing together.
    </Example>
  </>
);

export default function LHopitalLesson({ lessonId }) {
  const [fnId, setFnId] = useState(defaults.fnId);
  const [xValue, setXValue] = useState(defaults.xValue);

  const fn = useMemo(() => getLHopitalFunction(fnId), [fnId]);
  const value = fn.ratio(xValue);
  const gap = Number.isFinite(value) ? Math.abs(value - fn.limit) : null;

  const playFrom = useRef({ start: 0, target: 0 });

  const { playing, start, stop } = usePlayback((progress) => {
    const { start: from, target } = playFrom.current;
    setXValue(Number((from + (target - from) * progress).toFixed(3)));
  });

  function setX(next) {
    stop();
    setXValue(next);
  }

  function reset() {
    stop();
    setFnId(defaults.fnId);
    setXValue(defaults.xValue);
  }

  function selectFunction(id) {
    const next = getLHopitalFunction(id);
    stop();
    setFnId(id);
    setXValue(Number((next.a + (next.xDomain[1] - next.a) * 0.7).toFixed(2)));
  }

  function animateApproach() {
    if (playing) {
      stop();
      return;
    }

    const from = fn.a + (fn.xDomain[1] - fn.a) * 0.8;
    playFrom.current = { start: from, target: fn.a + 0.004 };
    setXValue(Number(from.toFixed(3)));
    start(2600);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Limits reference" groups={limitFormulas} />}
      intro="L’Hôpital’s rule evaluates a limit that collapses to 0/0 by comparing how fast the top and bottom are heading to zero, which is to say by comparing their derivatives."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plot</span>
              <h2>{fn.label}</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={{ fnId, xValue }} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Indeterminate form">
            {lhopitalFunctions.map((entry) => (
              <button
                className={`chip ${entry.id === fnId ? 'selected' : ''}`}
                key={entry.id}
                type="button"
                aria-pressed={entry.id === fnId}
                onClick={() => selectFunction(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <dl className="readout">
            <div>
              <dt>x</dt>
              <dd>{xValue.toFixed(3)}</dd>
            </div>
            <div>
              <dt>f(x)/g(x)</dt>
              <dd>{Number.isFinite(value) ? value.toFixed(4) : 'undef'}</dd>
            </div>
            <div>
              <dt>f′/g′</dt>
              <dd>{fn.limit}</dd>
            </div>
            <div className={gap !== null && gap < 0.01 ? 'is-close' : ''}>
              <dt>difference</dt>
              <dd>{gap === null ? 'undef' : gap.toFixed(4)}</dd>
            </div>
          </dl>

          <LHopitalExplorer fn={fn} xValue={xValue} onChange={setX} />

          <div className="controls">
            <label className="slider">
              <span className="slider-label">Move x</span>
              <input
                type="range"
                min={fn.xDomain[0]}
                max={fn.xDomain[1]}
                step="0.001"
                value={xValue}
                onChange={(event) => setX(Number(event.target.value))}
              />
              <strong className="slider-value">{xValue.toFixed(3)}</strong>
            </label>

            <div className="control-row">
              <button className="chip is-action" type="button" onClick={animateApproach}>
                {playing ? <Pause size={14} /> : <Play size={14} />}
                {playing ? 'Stop' : 'Close in on a'}
              </button>
              <button
                className="chip"
                type="button"
                onClick={() => setX(Number((fn.a + 0.5).toFixed(3)))}
              >
                <Crosshair size={14} />
                Near
              </button>
              <button
                className="chip"
                type="button"
                onClick={() => setX(Number((fn.a + 0.01).toFixed(3)))}
              >
                <Crosshair size={14} />
                Very close
              </button>
            </div>

            <div className={`epsilon-strip ${gap !== null && gap < 0.01 ? 'is-ok' : ''}`}>
              <span className="verdict">
                {fn.twice ? 'needs two rounds' : 'one round is enough'}
              </span>
              <p>
                {gap !== null && gap < 0.01
                  ? `The ratio is within ${gap.toFixed(4)} of ${fn.limit}, the value the derivatives predict.`
                  : fn.note}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            The curve is the ratio f(x)/g(x). The dashed line is what the derivatives predict. Drag
            the point toward the hole.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
