import { useMemo, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import FundamentalTheoremExplorer from './FundamentalTheoremExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { ftcFunctions, getFtcFunction } from '../../lib/ftcFunctions.js';
import { usePlayback } from '../../lib/usePlayback.js';

const defaults = { fnId: 'line', xValue: 1.2 };

const questions = [
  {
    id: 'f1',
    prompt: 'If A(x) is the area accumulated under f from 0 to x, what is A′(x)?',
    options: ['f(x)', 'f′(x)', 'x · f(x)', '0'],
    answer: 0,
    explanation: 'That is the Fundamental Theorem. The rate at which area piles up is exactly the height of the curve at that moment.',
  },
  {
    id: 'f2',
    prompt: 'While f(x) is negative, what happens to the accumulated area A(x)?',
    options: ['It decreases', 'It increases', 'It stays flat', 'It becomes undefined'],
    answer: 0,
    explanation: 'Strips below the axis count as negative, so A falls. Try the "Crosses zero" function and drag past the root to watch it happen.',
  },
  {
    id: 'f3',
    prompt: 'Where f has a root and changes sign from positive to negative, the graph of A has what?',
    options: ['A maximum', 'A minimum', 'A vertical asymptote', 'A jump'],
    answer: 0,
    explanation: 'A′ = f, so f = 0 means A is momentarily flat. Changing from positive to negative makes it a peak.',
  },
  {
    id: 'f4',
    prompt: 'How does the theorem let you evaluate a definite integral without adding up rectangles?',
    options: [
      'Find any antiderivative F and compute F(b) − F(a)',
      'Differentiate the integrand twice',
      'Take the average of f(a) and f(b)',
      'Multiply f(b) by the width',
    ],
    answer: 0,
    explanation: 'Because accumulating and differentiating are inverses, an antiderivative already holds every partial area. Subtracting removes the part before a.',
  },
];

const prose = (
  <>
    <h2>Differentiation and integration as inverses</h2>
    <p>
      The previous lessons asked opposite questions. Derivatives asked how fast something is
      changing. Integrals asked how much has piled up. The Fundamental Theorem says these are the
      same question read in opposite directions.
    </p>

    <Formula
      label="The Fundamental Theorem of Calculus"
      note="Differentiating an accumulated area returns the curve you were accumulating."
    >
      {String.raw`\frac{d}{dx} \int_a^x f(t) \, dt = f(x)`}
    </Formula>

    <h2>Justification</h2>
    <p>
      Push x forward by a sliver of width <strong>dx</strong>. The area gains a thin strip whose
      height is <strong>f(x)</strong> and whose width is dx, so it gains about f(x)·dx. Divide by
      dx and the rate of gain is f(x). That is the whole proof, and the plot shows it: where the
      lower curve is tall, the upper curve is steep.
    </p>

    <Callout label="Sign of the integrand" tone="fail">
      Where f dips below the axis the strips count as negative, so the accumulated area{' '}
      <strong>falls</strong>. Choose the crossing function and drag past the root: the moment f
      hits zero, A stops climbing and turns over into a peak.
    </Callout>

    <h2>Evaluating definite integrals</h2>
    <p>
      This is what rescues you from adding up rectangles forever. If you can find any function F
      whose derivative is f, then F already contains every partial area, and the area from a to b
      is just <strong>F(b) − F(a)</strong>. An infinite summation collapses into one subtraction.
    </p>

    <Formula label="Evaluating a definite integral" note="Any antiderivative will do; the constants cancel in the subtraction.">
      {String.raw`\int_a^b f(x) \, dx = F(b) - F(a)`}
    </Formula>

    <Example label="Applications">
      A flow meter records litres per second while a tank fills. The derivative view is the meter
      reading at an instant; the integral view is the total in the tank. The theorem says the tank
      level is rising exactly as fast as the meter reads, which is obvious in words and profound
      in symbols.
    </Example>
  </>
);

export default function FundamentalTheoremLesson({ lessonId }) {
  const [fnId, setFnId] = useState(defaults.fnId);
  const [xValue, setXValue] = useState(defaults.xValue);

  const fn = useMemo(() => getFtcFunction(fnId), [fnId]);
  const height = fn.f(xValue);
  const total = fn.F(xValue);

  const { playing, start, stop } = usePlayback((progress) => {
    setXValue(Number((fn.xDomain[0] + (fn.xDomain[1] - fn.xDomain[0]) * progress).toFixed(3)));
  });

  function setX(next) {
    stop();
    setXValue(next);
  }

  function sweep() {
    if (playing) {
      stop();
      return;
    }

    setXValue(fn.xDomain[0]);
    start(3000);
  }

  function selectFunction(id) {
    stop();
    setFnId(id);
    setXValue(Number((getFtcFunction(id).xDomain[1] * 0.4).toFixed(2)));
  }

  function reset() {
    stop();
    setFnId(defaults.fnId);
    setXValue(defaults.xValue);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      intro="Differentiating and accumulating are opposite operations. That single fact links the two halves of calculus and turns area from a summation problem into a subtraction."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plot</span>
              <h2>Accumulated area</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={{ fnId, xValue }} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Function">
            {ftcFunctions.map((entry) => (
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
              <dd>{xValue.toFixed(2)}</dd>
            </div>
            <div>
              <dt>f(x)</dt>
              <dd>{height.toFixed(2)}</dd>
            </div>
            <div>
              <dt>A(x)</dt>
              <dd>{total.toFixed(2)}</dd>
            </div>
            <div className="is-close">
              <dt>slope of A</dt>
              <dd>{height.toFixed(2)}</dd>
            </div>
          </dl>

          <FundamentalTheoremExplorer fn={fn} xValue={xValue} onChange={setX} />

          <div className="controls">
            <label className="slider">
              <span className="slider-label">Move x</span>
              <input
                type="range"
                min={fn.xDomain[0]}
                max={fn.xDomain[1]}
                step="0.01"
                value={xValue}
                onChange={(event) => setX(Number(event.target.value))}
              />
              <strong className="slider-value">{xValue.toFixed(2)}</strong>
            </label>

            <div className="control-row">
              <button className="chip is-action" type="button" onClick={sweep}>
                {playing ? <Pause size={14} /> : <Play size={14} />}
                {playing ? 'Stop' : 'Sweep across'}
              </button>
            </div>

            <div className="epsilon-strip is-ok">
              <span className="verdict">A′(x) = f(x)</span>
              <p>
                The two readouts are always equal. Whatever height the lower curve has, the upper
                curve climbs at exactly that rate.
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Drag the point on the upper curve, or focus it and use the arrow keys.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
