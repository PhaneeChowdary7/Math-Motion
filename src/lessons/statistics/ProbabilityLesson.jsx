import { useState } from 'react';
import ProbabilityExplorer from './ProbabilityExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import { probabilityFormulas } from '../../lib/formulas.js';
import { CoinFlipStory } from '../../stories/statistics.jsx';

const defaults = { pA: 0.5, pB: 0.4, overlap: 0.2 };

const questions = [
  {
    id: 'p1',
    prompt: 'Two events are independent. What does that mean about their joint probability?',
    options: [
      'P(A and B) equals P(A) × P(B)',
      'P(A and B) equals zero',
      'P(A and B) equals P(A) + P(B)',
      'A and B cannot both happen',
    ],
    answer: 0,
    explanation:
      'Independence is a statement about multiplication. Events that cannot both happen are mutually exclusive, which is a different and in fact opposite condition.',
  },
  {
    id: 'p2',
    prompt: 'Why does P(A or B) subtract P(A and B)?',
    options: [
      'The overlap is counted once in each of P(A) and P(B), so once too often',
      'Because probabilities cannot exceed 1',
      'Because A and B are independent',
      'To convert the answer to a percentage',
    ],
    answer: 0,
    explanation:
      'Adding the two areas double-counts the region they share. Subtracting it once restores the correct total.',
  },
  {
    id: 'p3',
    prompt: 'Two mutually exclusive events both have positive probability. Are they independent?',
    options: [
      'No - knowing one happened tells you the other did not',
      'Yes, exclusivity implies independence',
      'Only if they have equal probability',
      'Independence cannot be determined',
    ],
    answer: 0,
    explanation:
      'For exclusive events P(A and B) = 0, while P(A)P(B) is positive. The two are unequal, so the events are strongly dependent.',
  },
  {
    id: 'p4',
    prompt: 'A fair coin has landed heads five times running. What is the chance the next flip is heads?',
    options: [
      'One half - the coin has no memory',
      'Less than one half, since tails is overdue',
      'More than one half, since heads is on a run',
      'It cannot be determined',
    ],
    answer: 0,
    explanation:
      'Independence means each flip is unaffected by the ones before it. The belief that a result is due is the gambler\'s fallacy.',
  },
];

const prose = (
  <>
    <h2>Probability as proportion</h2>
    <p>
      Fix the set of all possible outcomes and call it the sample space. An <strong>event</strong> is
      a subset of that space, and its probability is the share of the space it occupies. Drawing the
      space as a square of area 1 makes every rule in this lesson a statement about area.
    </p>

    <Formula label="The basic constraints" note="Nothing is more likely than certainty, and the whole space is certain.">
      {String.raw`0 \le P(A) \le 1, \qquad P(\text{sample space}) = 1, \qquad P(\text{not } A) = 1 - P(A)`}
    </Formula>

    <h2>Combining events</h2>
    <p>
      For the probability that at least one of two events occurs, adding the two areas counts the
      region they share twice. Subtracting the overlap once corrects it.
    </p>

    <Formula label="Addition rule" note="Subtract the overlap because adding the areas counts it twice.">
      {String.raw`P(A \cup B) = P(A) + P(B) - P(A \cap B)`}
    </Formula>

    <h2>Independence</h2>
    <p>
      Two events are <strong>independent</strong> when knowing that one occurred tells you nothing
      about the other. The test is multiplicative: the joint probability must equal the product of
      the separate probabilities.
    </p>

    <Formula label="Independence test" note="A definition, not a fact to be assumed.">
      {String.raw`P(A \cap B) = P(A)\,P(B)`}
    </Formula>

    <p>
      In the explorer, slide the overlap away from the product and the two events become dependent:
      the strip A occupies within B no longer matches the strip it occupies overall.
    </p>

    <Callout label="Exclusive is the opposite of independent" tone="fail">
      Events that cannot both occur have P(A ∩ B) = 0. If both have positive probability, the product
      P(A)P(B) is positive, so the two are not equal and the events are strongly dependent: learning
      that one happened tells you with certainty that the other did not.
    </Callout>

    <WorkedExample
      label="Worked example - two dice"
      problem="Two fair dice are rolled. Let A be the event that the first shows a six, and B the event that the total is at least ten. Determine whether A and B are independent."
      steps={[
        {
          text: 'The first die is a six in one outcome out of six.',
          math: String.raw`P(A) = \tfrac{1}{6}`,
        },
        {
          text: 'Totals of at least ten are 10, 11 and 12, arising in 3 + 2 + 1 = 6 of the 36 equally likely pairs.',
          math: String.raw`P(B) = \tfrac{6}{36} = \tfrac{1}{6}`,
        },
        {
          text: 'Both occur when the first die is a six and the total is at least ten: (6,4), (6,5) and (6,6).',
          math: String.raw`P(A \cap B) = \tfrac{3}{36} = \tfrac{1}{12}`,
        },
        {
          text: 'Compare against the product.',
          math: String.raw`P(A)P(B) = \tfrac{1}{6} \times \tfrac{1}{6} = \tfrac{1}{36} \neq \tfrac{1}{12}`,
        },
      ]}
      result="The events are dependent: a six on the first die makes a high total considerably more likely."
      note="The individual dice are independent of each other, but events defined across both need not be. Independence is a property of events, not of the underlying mechanism."
    />

    <h2>Application: redundancy in a system</h2>
    <p>
      Independence is what makes duplication effective. Two components that fail for unrelated
      reasons multiply their failure probabilities, so the chance of both failing falls sharply. The
      argument collapses if the failures share a cause.
    </p>

    <WorkedExample
      variant="applied"
      label="Application - a backup pump"
      problem="A pump fails during a given year with probability 0.05. A second, identical pump is installed as a backup, failing independently with the same probability. Determine the probability the system is without a working pump, and how much reliability improves."
      steps={[
        {
          text: 'The system fails only when both pumps fail. Independence lets the probabilities multiply.',
          math: String.raw`P(\text{both fail}) = 0.05 \times 0.05 = 0.0025`,
        },
        {
          text: 'Express the improvement as a factor.',
          math: String.raw`\frac{0.05}{0.0025} = 20`,
        },
        {
          text: 'Compute the chance at least one pump works, using the complement.',
          math: String.raw`1 - 0.0025 = 0.9975`,
        },
        {
          text: 'Now suppose a shared power supply causes both to fail together in 1% of years. That common cause is not covered by the product.',
          math: String.raw`P(\text{both fail}) \geq 0.01 \;\gg\; 0.0025`,
        },
      ]}
      result="With genuinely independent failures the risk falls twentyfold, from 5% to 0.25%. A single shared cause at 1% wipes out most of that gain."
      note="This is why redundancy analysis focuses on common-mode failure. The multiplication rule is only as good as the independence assumption behind it, and that assumption is the thing worth auditing."
    />

    <Example label="Where independence is assumed too readily">
      Mortgage defaults were modelled as near-independent before 2008; a shared cause, falling house
      prices, made them anything but. The same error appears whenever correlated risks are pooled as
      if unrelated. Multiplying probabilities is easy, which is exactly why the assumption behind it
      deserves scrutiny.
    </Example>
  </>
);

export default function ProbabilityLesson({ lessonId }) {
  const [pA, setPA] = useState(defaults.pA);
  const [pB, setPB] = useState(defaults.pB);
  const [overlap, setOverlap] = useState(defaults.overlap);

  const product = pA * pB;
  const independent = Math.abs(overlap - product) < 0.005;
  const maxOverlap = Math.min(pA, pB);

  function reset() {
    setPA(defaults.pA);
    setPB(defaults.pB);
    setOverlap(defaults.overlap);
  }

  const clampedOverlap = Math.min(overlap, maxOverlap);

  return (
    <LessonLayout
      lessonId={lessonId}
      story={<CoinFlipStory />}
      quiz={questions}
      reference={<FormulaReference title="Probability reference" groups={probabilityFormulas} />}
      intro="Fix the set of possible outcomes and probability becomes area. Every rule for combining events is then a statement about how areas add, overlap, or multiply."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive space</span>
              <h2>Events as areas</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={{ pA, pB, overlap }} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Presets">
            <button className="chip" type="button" onClick={() => { setPA(0.5); setPB(0.4); setOverlap(0.2); }}>
              Independent
            </button>
            <button className="chip" type="button" onClick={() => { setPA(0.5); setPB(0.4); setOverlap(0.4); }}>
              B inside A
            </button>
            <button className="chip" type="button" onClick={() => { setPA(0.5); setPB(0.4); setOverlap(0); }}>
              Mutually exclusive
            </button>
          </div>

          <ProbabilityExplorer pA={pA} pB={pB} overlap={clampedOverlap} />

          <dl className="readout">
            <div>
              <dt>P(A ∩ B)</dt>
              <dd>{clampedOverlap.toFixed(2)}</dd>
            </div>
            <div>
              <dt>P(A)P(B)</dt>
              <dd>{product.toFixed(2)}</dd>
            </div>
            <div className="is-close">
              <dt>P(A ∪ B)</dt>
              <dd>{(pA + pB - clampedOverlap).toFixed(2)}</dd>
            </div>
            <div>
              <dt>P(not A)</dt>
              <dd>{(1 - pA).toFixed(2)}</dd>
            </div>
          </dl>

          <div className="controls">
            {[
              ['P(A)', pA, setPA, 0.05, 0.95],
              ['P(B)', pB, setPB, 0.05, 0.95],
              ['P(A and B)', clampedOverlap, setOverlap, 0, Number(maxOverlap.toFixed(2))],
            ].map(([label, value, setter, min, max]) => (
              <div className="slider" key={label}>
                <label htmlFor={`prob-${label}`}>{label}</label>
                <input
                  id={`prob-${label}`}
                  type="range"
                  min={min}
                  max={max}
                  step="0.01"
                  value={value}
                  onChange={(event) => setter(Number(event.target.value))}
                />
                <output>{value.toFixed(2)}</output>
              </div>
            ))}

            <div className={`epsilon-strip ${independent ? 'is-ok' : ''}`}>
              <span className="verdict">{independent ? 'independent' : 'dependent'}</span>
              <p>
                {independent
                  ? `P(A ∩ B) equals P(A)P(B) = ${product.toFixed(2)}, so knowing one event occurred does not change the chance of the other.`
                  : `P(A ∩ B) is ${clampedOverlap.toFixed(2)} against a product of ${product.toFixed(2)}. Knowing A occurred ${clampedOverlap > product ? 'raises' : 'lowers'} the chance of B, so the events carry information about each other.`}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            The square has area 1, so every probability is the fraction of it shaded. Slide the
            overlap onto the product to make the two events independent.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
