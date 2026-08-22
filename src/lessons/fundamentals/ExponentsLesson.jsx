import { useState } from 'react';
import GrowthExplorer from './GrowthExplorer.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { exponentFormulas } from '../../lib/formulas.js';
import { bases, getBase, logBase } from '../../lib/growth.js';

const defaults = { baseId: 'two', probe: 2, showInverse: true };

const questions = [
  {
    id: 'e1',
    prompt: 'Why is b⁰ equal to 1 for every base b?',
    options: [
      'Dividing bⁿ by itself gives both 1 and b⁰',
      'Because zero times anything is zero',
      'It is a convention with no reason',
      'Because b is always positive',
    ],
    answer: 0,
    explanation: 'bⁿ / bⁿ is 1, and the quotient law makes it b^(n−n) = b⁰. The two answers must agree.',
  },
  {
    id: 'e2',
    prompt: 'What does log₂ 8 ask?',
    options: [
      'To what power must 2 be raised to give 8?',
      'What is 2 times 8?',
      'What is 8 divided by 2?',
      'What is 2 to the power 8?',
    ],
    answer: 0,
    explanation: 'A logarithm returns the exponent. Since 2³ = 8, log₂ 8 = 3.',
  },
  {
    id: 'e3',
    prompt: 'Why do the graphs of bˣ and log_b x mirror each other?',
    options: [
      'They are inverses, so swapping x and y reflects one onto the other in the line y = x',
      'They are both increasing',
      'They have the same asymptote',
      'They cross at the origin',
    ],
    answer: 0,
    explanation: 'If (2, 4) lies on 2ˣ then (4, 2) lies on log₂ x. Swapping the coordinates is exactly a reflection in y = x.',
  },
  {
    id: 'e4',
    prompt: 'Why does log(mn) = log m + log n?',
    options: [
      'Because multiplying powers adds their exponents',
      'Because logs are linear',
      'Because m and n are positive',
      'It only holds for base 10',
    ],
    answer: 0,
    explanation: 'The log laws are the index laws read backwards. Multiplication of the numbers becomes addition of the exponents.',
  },
];

const prose = (
  <>
    <h2>Repeated multiplication</h2>
    <p>
      An <strong>index</strong>, or exponent, records how many copies of a base are multiplied
      together: b⁴ means b × b × b × b. Every rule that follows is bookkeeping on that count, which
      is why the laws are worth deriving once rather than memorising.
    </p>

    <Formula label="Adding indices" note="Multiplying gathers the copies, so the counts add.">
      {String.raw`b^m \times b^n = b^{m+n}`}
    </Formula>

    <p>
      Dividing cancels copies instead, so the counts subtract. Raising a power to a power repeats the
      repetition, so the counts multiply. That is three of the six laws already, and none of them
      needed to be learned separately.
    </p>

    <h2>Zero, negative and fractional indices</h2>
    <p>
      Counting copies only explains whole numbers, yet b⁰ and b^(−2) and b^(1/2) all have values. They
      are forced, not invented. Since bⁿ divided by itself is 1, and the quotient law makes it
      b^(n−n) = b⁰, the only consistent value for b⁰ is 1.
    </p>

    <p>
      Continue down the powers and each step divides by b, so going below zero produces reciprocals:
      b^(−n) is 1/bⁿ. And since b^(1/2) multiplied by itself gives b¹, the fractional index must be a
      root. Each extension is the only choice that keeps the original laws working.
    </p>

    <Callout label="A base below 1 decays" tone="ok">
      When b is between 0 and 1 each step to the right multiplies by less than one, so the curve
      falls rather than climbs. Select base ½ in the explorer: the shape is the same, reflected left
      to right, because (1/2)ˣ is the same as 2^(−x).
    </Callout>

    <h2>Logarithms as the inverse</h2>
    <p>
      A <strong>logarithm</strong> answers the question an exponential poses in reverse. Where 2³ = 8
      asks what you reach, log₂ 8 = 3 asks what power got you there. The logarithm returns the
      exponent, and nothing more mysterious than that is going on.
    </p>

    <Formula label="The defining relationship" note="Each statement carries exactly the same information.">
      {String.raw`b^y = x \quad \Longleftrightarrow \quad \log_b x = y`}
    </Formula>

    <p>
      Because they are inverses, their graphs are reflections in the line y = x. If (2, 4) sits on the
      exponential then (4, 2) sits on the logarithm, coordinates simply swapped. Switch on the mirror
      in the explorer and drag the point to watch the pairing.
    </p>

    <h2>The log laws</h2>
    <p>
      Every log law is an index law read backwards. Multiplying powers adds exponents, so a logarithm
      turns multiplication into addition. Dividing turns into subtraction, and a power becomes a
      multiplier out the front. This is what made logarithm tables so valuable before calculators:
      they converted hard multiplications into easy additions.
    </p>

    <Formula label="Turning products into sums" note="The reason logarithms once did the work of slide rules.">
      {String.raw`\log_b(mn) = \log_b m + \log_b n`}
    </Formula>

    <Callout label="The domain stops at zero" tone="fail">
      No power of a positive base ever produces zero or a negative number, so log x has no value for
      x ≤ 0. The curve dives down the y-axis without ever touching it, which is a vertical asymptote
      rather than an intercept.
    </Callout>

    <h2>The natural base</h2>
    <p>
      One base, e ≈ 2.718, matters more than the rest. It is the base whose curve has a growth rate
      equal to its own height at every point, which makes eˣ its own derivative and puts it at the
      centre of the calculus chapter. Its logarithm, ln x, is the one written without a base at all.
    </p>

    <Example label="Applications">
      Compound interest, population growth, radioactive decay and drug half-lives are exponential.
      Decibels, pH and the Richter scale are logarithmic, chosen because they compress enormous
      ranges into numbers a person can hold in mind.
    </Example>
  </>
);

export default function ExponentsLesson({ lessonId }) {
  const [baseId, setBaseId] = useState(defaults.baseId);
  const [probe, setProbe] = useState(defaults.probe);
  const [showInverse, setShowInverse] = useState(defaults.showInverse);

  const entry = getBase(baseId);
  const base = entry.value;
  const height = base ** probe;
  const back = height > 0 ? logBase(base, height) : null;

  function reset() {
    setBaseId(defaults.baseId);
    setProbe(defaults.probe);
    setShowInverse(defaults.showInverse);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Index and log reference" groups={exponentFormulas} />}
      intro="An index counts how many times a base is multiplied by itself, and a logarithm recovers that count. The two are inverses, so their graphs are reflections in the line y = x."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plot</span>
              <h2>Growth and its inverse</h2>
            </div>
            <div className="visual-actions">
              <ResetButton
                values={{ baseId, probe, showInverse }}
                defaults={defaults}
                onReset={reset}
              />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Base">
            {bases.map((option) => (
              <button
                className={`chip ${option.id === baseId ? 'selected' : ''}`}
                key={option.id}
                type="button"
                aria-pressed={option.id === baseId}
                onClick={() => setBaseId(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <dl className="readout">
            <div>
              <dt>x</dt>
              <dd>{probe.toFixed(2)}</dd>
            </div>
            <div className="is-close">
              <dt>bˣ</dt>
              <dd>{height.toFixed(3)}</dd>
            </div>
            <div>
              <dt>log_b of that</dt>
              <dd>{back === null ? 'undefined' : back.toFixed(2)}</dd>
            </div>
          </dl>

          <GrowthExplorer base={base} probe={probe} showInverse={showInverse} />

          <div className="controls">
            <label className="slider">
              <span className="slider-label">Move x</span>
              <input
                type="range"
                min={-3.4}
                max={3.4}
                step="0.01"
                value={probe}
                onChange={(event) => setProbe(Number(event.target.value))}
              />
              <strong className="slider-value">{probe.toFixed(2)}</strong>
            </label>

            <div className="control-row">
              <button
                className={`chip ${showInverse ? 'selected' : ''}`}
                type="button"
                aria-pressed={showInverse}
                onClick={() => setShowInverse((current) => !current)}
              >
                Show the logarithm and mirror
              </button>
            </div>

            <div className="epsilon-strip is-ok">
              <span className="verdict">
                {base > 1 ? 'growth' : 'decay'}
              </span>
              <p>
                {entry.note} The logarithm sends {height.toFixed(2)} straight back to{' '}
                {back === null ? 'nothing' : back.toFixed(2)}, which is where you started.
              </p>
            </div>
          </div>

          <p className="plot-hint">
            The dashed diagonal is the line y = x. Every point on one curve has a partner on the
            other with its coordinates swapped, which is what makes them inverses.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
