import { useState } from 'react';
import SequenceExplorer from './SequenceExplorer.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { sequenceFormulas } from '../../lib/formulas.js';
import { MAX_TERMS, buildTerms, convergence, families, getFamily } from '../../lib/sequences.js';

const defaults = { familyId: 'geometric', first: 1, param: 0.5, count: 12, showSums: true };

const questions = [
  {
    id: 's1',
    prompt: 'What separates a sequence from a series?',
    options: [
      'A sequence is the list of terms; a series is their sum',
      'A sequence is finite and a series is infinite',
      'A series has a formula and a sequence does not',
      'They are two names for the same thing',
    ],
    answer: 0,
    explanation: 'The terms 1, ½, ¼ form a sequence. Adding them, 1 + ½ + ¼, makes a series.',
  },
  {
    id: 's2',
    prompt: 'In an arithmetic sequence, what stays constant?',
    options: [
      'The difference between consecutive terms',
      'The ratio between consecutive terms',
      'Every term',
      'The running total',
    ],
    answer: 0,
    explanation: 'A fixed amount is added each step, which is why the terms fall on a straight line.',
  },
  {
    id: 's3',
    prompt: 'When does an infinite geometric series settle on a value?',
    options: [
      'When the common ratio satisfies |r| < 1',
      'Whenever the terms are positive',
      'Whenever r is a fraction',
      'It never does',
    ],
    answer: 0,
    explanation: 'Terms must shrink fast enough. With |r| < 1 the total approaches a₁/(1 − r); otherwise it grows without bound.',
  },
  {
    id: 's4',
    prompt: 'The terms of a sequence approach 0. Must its series converge?',
    options: [
      'No, shrinking terms are necessary but not sufficient',
      'Yes, always',
      'Only if the terms are positive',
      'Only if it is geometric',
    ],
    answer: 0,
    explanation: 'The harmonic series 1 + ½ + ⅓ + ¼ + … has terms going to 0, yet its total grows without bound.',
  },
];

const prose = (
  <>
    <h2>Sequences and series</h2>
    <p>
      A <strong>sequence</strong> is an ordered list of numbers, each one called a term and labelled
      by its position n. A <strong>series</strong> is what you get by adding those terms up. The
      distinction is small to state and easy to lose: 1, ½, ¼, ⅛ is a sequence, while 1 + ½ + ¼ + ⅛
      is a series.
    </p>

    <p>
      The <strong>partial sum</strong> Sₙ is the total after n terms. It is itself a sequence, and
      watching how it behaves is how a series is judged.
    </p>

    <h2>Arithmetic sequences</h2>
    <p>
      An arithmetic sequence adds a fixed amount, the <strong>common difference</strong> d, at every
      step. Because the same amount is added each time, the terms sit on a straight line, and the
      slope of that line is d. This is the sequence version of the Lines lesson.
    </p>

    <Formula label="Arithmetic term" note="Start at a₁ and take n − 1 steps of size d.">
      {String.raw`a_n = a_1 + (n - 1)d`}
    </Formula>

    <p>
      Their sums have a neat shortcut. Pair the first term with the last, the second with the second
      last, and every pair has the same total. There are n/2 such pairs, which gives the formula
      directly and is said to be how Gauss added the numbers to 100 as a schoolboy.
    </p>

    <Formula label="Arithmetic sum" note="The average of the first and last term, times how many terms there are.">
      {String.raw`S_n = \frac{n}{2}\left[\,2a_1 + (n-1)d\,\right]`}
    </Formula>

    <h2>Geometric sequences</h2>
    <p>
      A geometric sequence multiplies by a fixed <strong>common ratio</strong> r at every step.
      Multiplying rather than adding is what makes these grow so violently when r is above 1, and
      collapse so quickly when it is below. This is the sequence version of the Exponents lesson.
    </p>

    <Formula label="Geometric term" note="Start at a₁ and multiply by r a total of n − 1 times.">
      {String.raw`a_n = a_1 r^{\,n-1}`}
    </Formula>

    <h2>Convergence</h2>
    <p>
      Here is where the chapter starts pointing forwards. Set the ratio to ½ and watch the running
      total in the explorer: it climbs, but by less each time, and closes in on 2 without ever
      arriving. That settling is called <strong>convergence</strong>, and the value approached is the
      sum of the infinite series.
    </p>

    <Formula label="Infinite geometric sum" note="Valid only when the terms shrink, meaning the ratio is between −1 and 1.">
      {String.raw`S_\infty = \frac{a_1}{1 - r}, \qquad |r| < 1`}
    </Formula>

    <p>
      Push the ratio to 1.2 instead and the total runs away. An arithmetic series always runs away
      too, because it keeps adding a fixed step no matter how far along you are. Only shrinking terms
      give a series any chance of settling.
    </p>

    <Callout label="Shrinking terms are not enough" tone="fail">
      It is tempting to conclude that terms approaching zero guarantee a finite total. They do not.
      The harmonic series 1 + ½ + ⅓ + ¼ + … has terms heading to zero, yet its sum grows without
      bound. It grows slowly, which is exactly what makes the trap convincing.
    </Callout>

    <p>
      The word approaching is doing careful work in all of this, and it is precisely the idea the
      next chapter makes exact. A limit is what the Limits lesson defines properly; a convergent
      series is one of its first genuine uses.
    </p>

    <Example label="Applications">
      Loan repayments and annuities are geometric series. So is the total distance of a bouncing ball
      that loses a fixed fraction of its height each time, and the way a repeating decimal such as
      0.333… is converted into the exact fraction ⅓.
    </Example>
  </>
);

export default function SequencesLesson({ lessonId }) {
  const [familyId, setFamilyId] = useState(defaults.familyId);
  const [first, setFirst] = useState(defaults.first);
  const [param, setParam] = useState(defaults.param);
  const [count, setCount] = useState(defaults.count);
  const [showSums, setShowSums] = useState(defaults.showSums);

  const family = getFamily(familyId);
  const terms = buildTerms(family, first, param, count);
  const status = convergence(family, first, param);
  const last = terms[terms.length - 1];

  function selectFamily(id) {
    const next = getFamily(id);
    setFamilyId(id);
    setParam(next.id === 'geometric' ? 0.5 : 2);
  }

  function reset() {
    setFamilyId(defaults.familyId);
    setFirst(defaults.first);
    setParam(defaults.param);
    setCount(defaults.count);
    setShowSums(defaults.showSums);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Sequence reference" groups={sequenceFormulas} />}
      intro="A sequence lists terms in order and a series adds them up. Whether that total settles on a value or runs away is decided by how fast the terms shrink."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plot</span>
              <h2>{family.label} sequence</h2>
            </div>
            <div className="visual-actions">
              <ResetButton
                values={{ familyId, first, param, count, showSums }}
                defaults={defaults}
                onReset={reset}
              />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Sequence type">
            {families.map((entry) => (
              <button
                className={`chip ${entry.id === familyId ? 'selected' : ''}`}
                key={entry.id}
                type="button"
                aria-pressed={entry.id === familyId}
                onClick={() => selectFamily(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <Formula label="Term rule" note={family.note}>
            {family.rule}
          </Formula>

          <dl className="readout">
            <div>
              <dt>term a{count}</dt>
              <dd>{last.value.toFixed(3)}</dd>
            </div>
            <div>
              <dt>partial sum S{count}</dt>
              <dd>{last.running.toFixed(3)}</dd>
            </div>
            <div className={status.converges ? 'is-close' : ''}>
              <dt>infinite sum</dt>
              <dd>{status.converges ? status.limit.toFixed(3) : 'diverges'}</dd>
            </div>
          </dl>

          <SequenceExplorer
            terms={terms}
            showSums={showSums}
            limit={status.converges ? status.limit : null}
          />

          <div className="controls">
            <label className="slider">
              <span className="slider-label">First term a₁</span>
              <input
                type="range"
                min={-3}
                max={4}
                step="0.25"
                value={first}
                onChange={(event) => setFirst(Number(event.target.value))}
              />
              <strong className="slider-value">{first.toFixed(2)}</strong>
            </label>

            <label className="slider">
              <span className="slider-label">{family.paramLabel}</span>
              <input
                type="range"
                min={family.paramRange[0]}
                max={family.paramRange[1]}
                step={family.paramStep}
                value={param}
                onChange={(event) => setParam(Number(event.target.value))}
              />
              <strong className="slider-value">{param.toFixed(2)}</strong>
            </label>

            <label className="slider">
              <span className="slider-label">Terms</span>
              <input
                type="range"
                min={4}
                max={MAX_TERMS}
                step="1"
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
              />
              <strong className="slider-value">{count}</strong>
            </label>

            <div className="control-row">
              <button
                className={`chip ${showSums ? 'selected' : ''}`}
                type="button"
                aria-pressed={showSums}
                onClick={() => setShowSums((current) => !current)}
              >
                Show running total
              </button>
            </div>

            <div className={`epsilon-strip ${status.converges ? 'is-ok' : 'is-fail'}`}>
              <span className="verdict">{status.converges ? 'converges' : 'diverges'}</span>
              <p>{status.reason}</p>
            </div>
          </div>

          <p className="plot-hint">
            The dots are the terms and the line is the running total. Set a geometric ratio below 1
            and watch the total flatten towards its limit.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
