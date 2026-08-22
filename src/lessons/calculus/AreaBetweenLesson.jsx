import { useMemo, useState } from 'react';
import { Grid2x2, Rows3, Target } from 'lucide-react';
import AreaBetweenExplorer from './AreaBetweenExplorer.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { areaPairs, getPair, stripSum } from '../../lib/areaCurves.js';
import { integralFormulas } from '../../lib/formulas.js';

const questions = [
  {
    id: 'ab1',
    prompt: 'What does the integrand look like for the area between two curves?',
    options: [
      'The upper function minus the lower one',
      'The sum of the two functions',
      'The product of the two functions',
      'Whichever function is larger at x = 0',
    ],
    answer: 0,
    explanation: 'Each thin strip runs from the lower curve up to the upper one, so its height is top − bottom and its area is (top − bottom)·dx.',
  },
  {
    id: 'ab2',
    prompt: 'Why do we usually integrate between the points where the curves cross?',
    options: [
      'Those are the natural bounds of the enclosed region',
      'Because integrals only work at crossings',
      'To make the answer negative',
      'Because the curves are undefined elsewhere',
    ],
    answer: 0,
    explanation: 'The crossings are where the gap closes to zero, which is exactly where the enclosed region begins and ends. Use the "Snap to crossings" button to land on them.',
  },
  {
    id: 'ab3',
    prompt: 'What happens if you subtract the curves the wrong way round?',
    options: [
      'You get the same magnitude with a negative sign',
      'You get a completely different number',
      'The integral fails to exist',
      'You get zero',
    ],
    answer: 0,
    explanation: 'Swapping top and bottom negates the integrand, so the answer flips sign. Area is positive, so take the absolute value or order the functions correctly.',
  },
  {
    id: 'ab4',
    prompt: 'The curves swap which one is on top partway through the interval. What should you do?',
    options: [
      'Split the integral at the crossing and handle each piece separately',
      'Integrate anyway and keep the result',
      'Use only the left-hand piece',
      'Take the derivative first',
    ],
    answer: 0,
    explanation: 'Past a crossing, top − bottom goes negative and the two pieces would cancel instead of adding. Split at the crossing so each piece uses its own correct ordering.',
  },
];

const defaults = { pairId: 'line-parabola', a: -1, b: 2, n: 12, showStrips: true };

const prose = (
  <>
    <h2>Extending the Riemann sum</h2>
    <p>
      The Integrals lesson built area under a curve out of thin rectangles standing on the x-axis.
      Nothing about that argument required the axis. Move the floor up onto a second curve and every
      step still holds.
    </p>

    <p>
      A strip at position x now runs from the lower curve to the upper one. Its height is the{' '}
      <strong>gap</strong> between them, its width is dx, and adding up infinitely many of them is
      the same integral as before.
    </p>

    <Formula
      label="Area between two curves"
      note="Valid as long as the top function really does stay on top across the whole interval."
    >
      {String.raw`A = \int_a^b \big[\, f_{\text{top}}(x) - f_{\text{bottom}}(x) \,\big]\, dx`}
    </Formula>

    <h2>Limits of integration</h2>
    <p>
      Usually nobody hands you a and b. The region closes itself where the two curves meet, so set
      the functions equal and solve. For the line and the parabola, x + 2 = x² gives x² − x − 2 = 0,
      which factors to (x − 2)(x + 1) and pins the region between −1 and 2.
    </p>

    <Callout label="Order of subtraction">
      Subtracting the wrong way round flips the sign of the answer. Do not guess from the formulas:
      pick any x inside the interval and check which curve is genuinely higher there. Area is a
      positive quantity, so a negative result means the ordering was backwards.
    </Callout>

    <h2>Curves that intersect within the interval</h2>
    <p>
      If the two curves swap places partway through, a single integral quietly betrays you. Past the
      crossing the integrand turns negative and starts cancelling the area you already accumulated,
      so the total comes out too small.
    </p>

    <p>
      The fix is to <strong>split at the crossing</strong> and integrate each stretch on its own,
      each with its own top and bottom, then add the pieces. Sketching first is what tells you a
      split is needed at all.
    </p>

    <Example label="Applications">
      Anywhere two rates are compared over time. Income against expenditure, where the region between
      them is money saved. Supply against demand, where it is consumer surplus. Power drawn against
      power generated, where it is the shortfall a battery has to cover.
    </Example>
  </>
);

export default function AreaBetweenLesson({ lessonId }) {
  const [pairId, setPairId] = useState(defaults.pairId);
  const [a, setA] = useState(defaults.a);
  const [b, setB] = useState(defaults.b);
  const [n, setN] = useState(defaults.n);
  const [showStrips, setShowStrips] = useState(defaults.showStrips);

  const pair = useMemo(() => getPair(pairId), [pairId]);

  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const exact = pair.exact(lo, hi);
  const approx = stripSum(pair, lo, hi, n);
  const error = Math.abs(exact - approx);
  const atCrossings = Math.abs(lo - pair.crossings[0]) < 0.02 && Math.abs(hi - pair.crossings[1]) < 0.02;

  function reset() {
    setPairId(defaults.pairId);
    setA(defaults.a);
    setB(defaults.b);
    setN(defaults.n);
    setShowStrips(defaults.showStrips);
  }

  function selectPair(id) {
    const next = getPair(id);
    setPairId(id);

    setA(next.crossings[0]);
    setB(next.crossings[1]);
  }

  function snap() {
    setA(pair.crossings[0]);
    setB(pair.crossings[1]);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Integration reference" groups={integralFormulas} />}
      intro="The area between two curves is the same Riemann argument as before, with the floor lifted off the axis: every strip now runs from the lower curve up to the upper one."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plot</span>
              <h2>Vertical gap between curves</h2>
            </div>
            <div className="visual-actions">
              <ResetButton
                values={{ pairId, a, b, n, showStrips }}
                defaults={defaults}
                onReset={reset}
              />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Curve pair">
            {areaPairs.map((entry) => (
              <button
                className={`chip ${entry.id === pairId ? 'selected' : ''}`}
                key={entry.id}
                type="button"
                aria-pressed={entry.id === pairId}
                onClick={() => selectPair(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <dl className="readout">
            <div>
              <dt>a</dt>
              <dd>{lo.toFixed(2)}</dd>
            </div>
            <div>
              <dt>b</dt>
              <dd>{hi.toFixed(2)}</dd>
            </div>
            <div>
              <dt>strips</dt>
              <dd>{approx.toFixed(3)}</dd>
            </div>
            <div className={atCrossings ? 'is-close' : ''}>
              <dt>exact</dt>
              <dd>{exact.toFixed(3)}</dd>
            </div>
          </dl>

          <AreaBetweenExplorer
            pair={pair}
            a={a}
            b={b}
            n={n}
            showStrips={showStrips}
            onChangeA={setA}
            onChangeB={setB}
          />

          <div className="controls">
            <label className="slider">
              <span className="slider-label">Strips</span>
              <input
                type="range"
                min="1"
                max="60"
                step="1"
                value={n}
                onChange={(event) => setN(Number(event.target.value))}
              />
              <strong className="slider-value">{n}</strong>
            </label>

            <div className="control-row">
              <button className="chip is-action" type="button" onClick={snap}>
                <Target size={14} />
                Snap to crossings
              </button>
              <button className="chip" type="button" onClick={() => setN(6)}>
                <Rows3 size={14} />
                Coarse
              </button>
              <button className="chip" type="button" onClick={() => setN(60)}>
                <Grid2x2 size={14} />
                Very fine
              </button>

              <span className="control-spacer" />

              <label className="switch">
                <input
                  type="checkbox"
                  checked={showStrips}
                  onChange={(event) => setShowStrips(event.target.checked)}
                />
                <span className="switch-track" aria-hidden="true">
                  <span className="switch-thumb" />
                </span>
                Strips
              </label>
            </div>

            <div className={`epsilon-strip ${error < 0.02 ? 'is-ok' : ''}`}>
              <span className="verdict">
                {atCrossings ? 'full enclosed region' : `error ${error.toFixed(3)}`}
              </span>
              <p>
                {atCrossings
                  ? `${pair.note} Between the crossings the enclosed area is ${exact.toFixed(3)}.`
                  : 'Drag the handles onto the crossings, or press Snap, to capture the whole enclosed region.'}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Drag either bound along the curves, or focus one and use the arrow keys.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
