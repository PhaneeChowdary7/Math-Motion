import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeftToLine, ArrowRightToLine, Crosshair, Pause, Play } from 'lucide-react';
import LimitExplorer from './LimitExplorer.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { limitFormulas } from '../../lib/formulas.js';
import { getFunction, limitFunctions, valueAt } from '../../lib/limitFunctions.js';
import { usePlayback } from '../../lib/usePlayback.js';

const approachModes = [
  ['left', 'Left'],
  ['both', 'Both'],
  ['right', 'Right'],
];

const questions = [
  {
    id: 'q1',
    prompt: 'For f(x) = (x² − 1)/(x − 1), what is the limit as x approaches 1?',
    options: ['0', '1', '2', 'It does not exist'],
    answer: 2,
    explanation: 'Away from x = 1 the function equals x + 1, which heads to 2. The hole at x = 1 is irrelevant, because a limit never asks about the point itself.',
  },
  {
    id: 'q2',
    prompt: 'A function approaches 2 from the left and 3.5 from the right at x = 1. Does the limit exist there?',
    options: ['Yes, it is 2', 'Yes, it is 2.75', 'No, the one-sided limits disagree', 'Only if f(1) is defined'],
    answer: 2,
    explanation: 'A limit exists only when both sides agree on a single value. Try the Jump function and shrink ε below 0.75 to watch every candidate δ fail.',
  },
  {
    id: 'q3',
    prompt: 'In the ε–δ definition, what happens to δ as you demand a smaller ε?',
    options: ['δ must generally shrink too', 'δ can stay fixed', 'δ must grow', 'δ becomes negative'],
    answer: 0,
    explanation: 'A tighter tolerance on the output forces a tighter window on the input. For f(x) = x + 1 the relationship is exactly δ = ε.',
  },
  {
    id: 'q4',
    prompt: 'Which condition defines continuity of f at a point a?',
    options: [
      'f(a) is defined',
      'The limit at a exists',
      'The limit exists, f(a) is defined, and the two are equal',
      'The graph has no vertical asymptote',
    ],
    answer: 2,
    explanation: 'All three must hold. The removable hole fails the third condition, which is why patching a single point would repair it.',
  },
];

const defaults = {
  fnId: 'hole',
  xValue: 0.2,
  approachMode: 'both',
  showGuides: true,
  showBands: true,
  epsilon: 0.5,
};

export default function CalculusLimitLesson({ lessonId }) {
  const [fnId, setFnId] = useState(defaults.fnId);
  const [xValue, setXValue] = useState(defaults.xValue);
  const [approachMode, setApproachMode] = useState(defaults.approachMode);
  const [showGuides, setShowGuides] = useState(defaults.showGuides);
  const [showBands, setShowBands] = useState(defaults.showBands);
  const [epsilon, setEpsilon] = useState(defaults.epsilon);
  const [announced, setAnnounced] = useState('');

  const fn = useMemo(() => getFunction(fnId), [fnId]);
  const delta = fn.deltaFor(epsilon);
  const value = valueAt(fn, xValue);
  const distance = Math.abs(xValue - fn.a);
  const gap = value === null || fn.limit === null ? null : Math.abs(value - fn.limit);
  const insideBand = gap !== null && gap < epsilon;

  const playFrom = useRef({ start: 0, target: 1 });

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
    setApproachMode(defaults.approachMode);
    setShowGuides(defaults.showGuides);
    setShowBands(defaults.showBands);
    setEpsilon(defaults.epsilon);
  }

  function animateApproach() {
    if (playing) {
      stop();
      return;
    }

    const side = approachMode === 'right' ? 1 : -1;
    const from = side === -1 ? Math.min(xValue, fn.a - 0.9) : Math.max(xValue, fn.a + 0.9);

    playFrom.current = { start: from, target: fn.a + side * 0.02 };
    setXValue(from);
    start(2600);
  }

  function selectFunction(id) {
    const next = getFunction(id);
    stop();
    setFnId(id);
    setXValue(Number((next.a - 0.8).toFixed(2)));
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnounced(
        `x is ${xValue.toFixed(2)}. f of x is ${value === null ? 'undefined' : value.toFixed(2)}. Distance to ${fn.a} is ${distance.toFixed(2)}.`
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [xValue, value, distance, fn.a]);

  // The prose depends on the chosen function and δ, never on x, so dragging the
  // point leaves this subtree alone.
  const prose = useMemo(
    () => (
      <>
        <h2>The idea</h2>
        <p>
          A function can approach a value even when it is missing that exact point. Pick a function in
          the explorer and drag the point toward the dashed line. The readouts show where the output is
          heading, not what happens at the point itself.
        </p>

        <Formula label="Now exploring" note={fn.note}>
          {fn.expression}
        </Formula>

        <h2>The ε–δ definition</h2>
        <p>
          The formal definition turns this into a challenge. You name a tolerance <strong>ε</strong>{' '}
          around the target height; the limit exists only if some input window <strong>δ</strong>{' '}
          around <strong>x = {fn.a}</strong> keeps every nearby output inside that band. Shrink ε in
          the explorer and watch δ respond.
        </p>

        <Callout label={fn.title} tone={delta === null ? 'fail' : 'ok'}>
          {fn.verdict}
        </Callout>

        <h2>When limits fail</h2>
        <p>
          Three failures are worth knowing, and each one is in the picker. A <strong>jump</strong>{' '}
          sends the two sides to different heights. A <strong>blow-up</strong> lets values grow without
          bound. An <strong>oscillation</strong> swings forever without settling. In every case some ε
          is small enough that no δ can rescue it.
        </p>

        <h2>Continuity</h2>
        <p>
          A graph is continuous at a point when the function value and the limit agree. If there is a
          hole, jump, or break, continuity fails at that point.
        </p>

        <Example>
          Imagine a rideshare app estimating your pickup time. At exactly 8:00 AM the app may refresh
          and briefly show no value, but the estimates from 7:59:59 and 8:00:01 can still point toward
          the same wait time. Limits focus on that approaching behavior.
        </Example>
      </>
    ),
    [fn, delta]
  );

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Limits reference" groups={limitFormulas} />}
      intro="A limit describes where a function is heading as the input gets close to a point, even when the function is not defined at that exact input."
      visual={
        <>
        <div className="visual-header">
          <div>
            <span className="eyebrow">Interactive plot</span>
            <h2>{fn.title}</h2>
          </div>
          <div className="visual-actions">
            <div
              className="segmented"
              aria-label="Approach direction"
              style={{ '--active-index': approachModes.findIndex(([mode]) => mode === approachMode) }}
            >
              {approachModes.map(([mode, label]) => (
                <button
                  className={approachMode === mode ? 'selected' : ''}
                  key={mode}
                  onClick={() => setApproachMode(mode)}
                  type="button"
                  aria-pressed={approachMode === mode}
                >
                  {label}
                </button>
              ))}
            </div>

            <ResetButton
              values={{ fnId, xValue, approachMode, showGuides, showBands, epsilon }}
              defaults={defaults}
              onReset={reset}
            />
          </div>
        </div>

        <div className="fn-picker" role="group" aria-label="Function">
          {limitFunctions.map((entry) => (
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
            <dd>{value === null ? 'undef' : value.toFixed(2)}</dd>
          </div>
          <div className={distance < 0.25 ? 'is-close' : ''}>
            <dt>|x − {fn.a}|</dt>
            <dd>{distance.toFixed(2)}</dd>
          </div>
          <div className={insideBand ? 'is-close' : ''}>
            <dt>{fn.limit === null ? 'target' : '|f(x) − L|'}</dt>
            <dd>{gap === null ? 'undef' : gap.toFixed(2)}</dd>
          </div>
        </dl>

        <LimitExplorer
          fn={fn}
          approachMode={approachMode}
          showGuides={showGuides}
          showBands={showBands}
          epsilon={epsilon}
          delta={delta}
          xValue={xValue}
          onChange={setX}
        />

        <p className="sr-only" aria-live="polite">
          {announced}
        </p>

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

          <label className="slider">
            <span className="slider-label">Tolerance ε</span>
            <input
              type="range"
              min="0.05"
              max="2"
              step="0.05"
              value={epsilon}
              onChange={(event) => setEpsilon(Number(event.target.value))}
            />
            <strong className="slider-value">{epsilon.toFixed(2)}</strong>
          </label>

          <div className="control-row">
            <button className="chip is-action" type="button" onClick={animateApproach}>
              {playing ? <Pause size={14} /> : <Play size={14} />}
              {playing ? 'Stop' : 'Animate'}
            </button>
            <button className="chip" type="button" onClick={() => setX(Number((fn.a - 0.5).toFixed(2)))}>
              <ArrowRightToLine size={14} />
              From left
            </button>
            <button className="chip" type="button" onClick={() => setX(Number((fn.a + 0.5).toFixed(2)))}>
              <ArrowLeftToLine size={14} />
              From right
            </button>
            <button className="chip" type="button" onClick={() => setX(Number((fn.a - 0.02).toFixed(2)))}>
              <Crosshair size={14} />
              Very close
            </button>

            <span className="control-spacer" />

            <label className="switch">
              <input type="checkbox" checked={showGuides} onChange={(event) => setShowGuides(event.target.checked)} />
              <span className="switch-track" aria-hidden="true">
                <span className="switch-thumb" />
              </span>
              Guides
            </label>
            <label className="switch">
              <input type="checkbox" checked={showBands} onChange={(event) => setShowBands(event.target.checked)} />
              <span className="switch-track" aria-hidden="true">
                <span className="switch-thumb" />
              </span>
              Bands
            </label>
          </div>

          <div className={`epsilon-strip ${delta === null ? 'is-fail' : 'is-ok'}`}>
            <span className="verdict">{delta === null ? 'No δ works' : `δ = ${delta.toFixed(2)} works`}</span>
            <p>
              {fn.limit === null
                ? 'No finite limit here, so there is no band to aim for.'
                : delta === null
                  ? `No input window keeps f within ${epsilon.toFixed(2)} of ${fn.limit}, which is why the limit fails.`
                  : `Every x within ${delta.toFixed(2)} of ${fn.a} lands inside ${epsilon.toFixed(2)} of ${fn.limit}.`}
            </p>
          </div>
        </div>

        <p className="plot-hint">
          Drag the point, or focus it and use the arrow keys (hold Shift for bigger steps).
        </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
