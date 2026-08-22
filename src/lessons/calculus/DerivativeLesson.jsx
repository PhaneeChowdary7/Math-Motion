import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Shrink } from 'lucide-react';
import DerivativeExplorer, { aRange, fPrime, hRange } from './DerivativeExplorer.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { derivativeFormulas } from '../../lib/formulas.js';
import { usePlayback } from '../../lib/usePlayback.js';

const questions = [
  {
    id: 'd1',
    prompt: 'The secant slope through (a, a²) and (a + h, (a + h)²) simplifies to which expression?',
    options: ['2a', '2a + h', 'a² + h', 'h²'],
    answer: 1,
    explanation: 'Expanding gives ((a + h)² − a²)/h = (2ah + h²)/h = 2a + h. The secant always overshoots the true slope by exactly h.',
  },
  {
    id: 'd2',
    prompt: 'What is f′(1.5) for f(x) = x²?',
    options: ['1.5', '2.25', '3', '4.5'],
    answer: 2,
    explanation: 'f′(x) = 2x, so f′(1.5) = 3. Drag the base point to 1.5 and shrink h to watch the secant slope settle there.',
  },
  {
    id: 'd3',
    prompt: 'Why can we not simply set h = 0 in the difference quotient?',
    options: [
      'It would give 0/0, which is undefined',
      'The result would be negative',
      'The secant line would disappear',
      'Because h must always stay above 1',
    ],
    answer: 0,
    explanation: 'That is precisely why the derivative needs a limit. We never evaluate at h = 0. We only ask where the quotient is heading as h approaches 0.',
  },
];

const defaults = { a: 1.5, h: 1.2, showTangent: true };

const prose = (
  <>
    <h2>Average and instantaneous rate of change</h2>
    <p>
      Pick two points on the curve. The line through them, called the <strong>secant</strong>,
      gives the average rate of change between them. Slide the second point closer and that average
      is measured over a shorter and shorter stretch.
    </p>

    <Formula
      label="The difference quotient"
      note="As h approaches 0, the secant slope approaches the tangent slope at a."
    >
      {String.raw`f'(a) = \lim_{h \to 0} \frac{f(a+h) - f(a)}{h}`}
    </Formula>

    <h2>Necessity of the limit</h2>
    <p>
      Setting <strong>h = 0</strong> outright gives 0/0, which says nothing. This is the same move
      from the previous lesson: never evaluate at the point, just ask where the values are heading
      as you approach it.
    </p>

    <Callout label="For f(x) = x²">
      The quotient simplifies to <strong>2a + h</strong>, so the secant slope always exceeds the
      true slope by exactly h. Shrink the gap and the error shrinks with it, landing on f′(a) = 2a.
    </Callout>

    <h2>The derivative as a function</h2>
    <p>
      The derivative is itself a function. At every point of f(x) = x² the slope is 2x, so the
      curve is falling at x = −1, flat at x = 0, and climbing ever more steeply to the right.
    </p>

    <Example>
      Your car&apos;s trip computer shows average speed over a whole journey; the speedometer shows
      speed right now. The derivative is the speedometer: what the average becomes when the
      measured interval shrinks toward zero.
    </Example>
  </>
);

export default function DerivativeLesson({ lessonId }) {
  const [a, setA] = useState(defaults.a);
  const [h, setH] = useState(defaults.h);
  const [showTangent, setShowTangent] = useState(defaults.showTangent);
  const [announced, setAnnounced] = useState('');

  const secantSlope = fPrime(a) + h;
  const trueSlope = fPrime(a);
  const playFrom = useRef(1.2);

  const { playing, start, stop } = usePlayback((progress) => {
    setH(Number((playFrom.current + (hRange[0] - playFrom.current) * progress).toFixed(3)));
  });

  function setGap(next) {
    stop();
    setH(next);
  }

  function reset() {
    stop();
    setA(defaults.a);
    setH(defaults.h);
    setShowTangent(defaults.showTangent);
  }

  function shrinkGap() {
    if (playing) {
      stop();
      return;
    }

    const from = h < 0.3 ? hRange[1] : h;
    playFrom.current = from;
    setH(from);
    start(2800);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnounced(`Gap h is ${h.toFixed(2)}. Secant slope ${secantSlope.toFixed(2)}. Derivative ${trueSlope.toFixed(2)}.`);
    }, 400);

    return () => clearTimeout(timer);
  }, [h, secantSlope, trueSlope]);

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Differentiation reference" groups={derivativeFormulas} />}
      intro="A derivative measures how fast a function is changing at a single instant: the slope of the curve at one exact point, found by letting a secant line collapse into a tangent."
      visual={
        <>
        <div className="visual-header">
          <div>
            <span className="eyebrow">Interactive plot</span>
            <h2>Secant to tangent</h2>
          </div>

          <div className="visual-actions">
            <ResetButton values={{ a, h, showTangent }} defaults={defaults} onReset={reset} />
          </div>
        </div>

        <dl className="readout">
          <div>
            <dt>a</dt>
            <dd>{a.toFixed(2)}</dd>
          </div>
          <div>
            <dt>h</dt>
            <dd>{h.toFixed(2)}</dd>
          </div>
          <div>
            <dt>secant</dt>
            <dd>{secantSlope.toFixed(2)}</dd>
          </div>
          <div className={h < 0.25 ? 'is-close' : ''}>
            <dt>f′(a)</dt>
            <dd>{trueSlope.toFixed(2)}</dd>
          </div>
        </dl>

        <DerivativeExplorer a={a} h={h} showTangent={showTangent} onChangeA={setA} onChangeH={setGap} />

        <p className="sr-only" aria-live="polite">
          {announced}
        </p>

        <div className="controls">
          <label className="slider">
            <span className="slider-label">Gap h</span>
            <input
              type="range"
              min={hRange[0]}
              max={hRange[1]}
              step="0.01"
              value={h}
              onChange={(event) => setGap(Number(event.target.value))}
            />
            <strong className="slider-value">{h.toFixed(2)}</strong>
          </label>

          <label className="slider">
            <span className="slider-label">Base point a</span>
            <input
              type="range"
              min={aRange[0]}
              max={aRange[1]}
              step="0.01"
              value={a}
              onChange={(event) => setA(Number(event.target.value))}
            />
            <strong className="slider-value">{a.toFixed(2)}</strong>
          </label>

          <div className="control-row">
            <button className="chip is-action" type="button" onClick={shrinkGap}>
              {playing ? <Pause size={14} /> : <Play size={14} />}
              {playing ? 'Stop' : 'Shrink h'}
            </button>
            <button className="chip" type="button" onClick={() => setGap(1.2)}>
              <Shrink size={14} />
              Wide
            </button>
            <button className="chip" type="button" onClick={() => setGap(0.4)}>
              <Shrink size={14} />
              Closer
            </button>
            <button className="chip" type="button" onClick={() => setGap(hRange[0])}>
              <Shrink size={14} />
              Nearly zero
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

          <div className={`epsilon-strip ${h < 0.25 ? 'is-ok' : ''}`}>
            <span className="verdict">gap {(secantSlope - trueSlope).toFixed(2)}</span>
            <p>
              The secant slope beats the true slope by exactly h, so shrinking the gap drives the
              error straight to zero.
            </p>
          </div>
        </div>

        <p className="plot-hint">
          Drag either point, or focus one and use the arrow keys (hold Shift for bigger steps).
        </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
