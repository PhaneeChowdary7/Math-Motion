import { useState } from 'react';
import ExpectationExplorer from './ExpectationExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import { discreteVariance, expectation, sum } from '../../lib/statistics.js';
import { expectationFormulas } from '../../lib/formulas.js';
import { SpinnerStory } from '../../stories/statistics.jsx';

const OUTCOMES = [1, 2, 3, 4, 5, 6];

const PRESETS = [
  { id: 'fair', label: 'Fair die', weights: [1, 1, 1, 1, 1, 1] },
  { id: 'loaded', label: 'Loaded high', weights: [1, 1, 1, 2, 3, 4] },
  { id: 'extremes', label: 'Only the ends', weights: [5, 0, 0, 0, 0, 5] },
  { id: 'certain', label: 'Almost certain', weights: [0, 0, 1, 20, 1, 0] },
];

const defaults = { presetId: 'fair' };

const questions = [
  {
    id: 'x1',
    prompt: 'The expected value of a fair six-sided die is 3.5. What does that mean?',
    options: [
      'The long-run average of many rolls approaches 3.5',
      'A roll of 3.5 is the most likely outcome',
      'Half of all rolls are below 3.5',
      'The die is biased',
    ],
    answer: 0,
    explanation:
      'Expectation is a long-run average, not a prediction of any single roll. It need not be an outcome the variable can actually take.',
  },
  {
    id: 'x2',
    prompt: 'Two distributions share the same expected value. What can differ?',
    options: [
      'The variance, and therefore the risk',
      'Nothing - expectation determines the distribution',
      'The number of outcomes only',
      'The sum of the probabilities',
    ],
    answer: 0,
    explanation:
      'The explorer shows this directly: piling probability on the two extremes leaves the mean at 3.5 while the variance rises sharply.',
  },
  {
    id: 'x3',
    prompt: 'Why does variance square the deviations from the mean?',
    options: [
      'So that deviations above and below do not cancel',
      'To make the units easier to read',
      'To keep the answer below one',
      'Because probabilities are squared',
    ],
    answer: 0,
    explanation:
      'The signed deviations always sum to zero by definition of the mean. Squaring removes the sign so that spread accumulates instead of cancelling.',
  },
  {
    id: 'x4',
    prompt: 'A game costs £2 to play and returns an expected £1.80. What happens over many plays?',
    options: [
      'A loss of about 20p per play on average',
      'A profit, since the return is positive',
      'It breaks even in the long run',
      'The result cannot be predicted at all',
    ],
    answer: 0,
    explanation:
      'Expectations add, so many independent plays accumulate the per-play shortfall. Short runs vary; long runs do not.',
  },
];

const prose = (
  <>
    <h2>Random variables</h2>
    <p>
      A <strong>random variable</strong> attaches a number to each outcome of an experiment: the
      score on a die, the payout of a policy, the delay on a journey. Its distribution lists the
      possible values together with the probability of each.
    </p>

    <Formula label="A discrete distribution" note="The probabilities are non-negative and total one.">
      {String.raw`P(X = x_i) = p_i, \qquad p_i \ge 0, \qquad \sum_{i} p_i = 1`}
    </Formula>

    <h2>Expectation</h2>
    <p>
      The <strong>expected value</strong> is the average of the outcomes weighted by how likely each
      is. It is the long-run average of many repetitions, and it need not be a value the variable can
      actually take: a fair die has expectation 3.5.
    </p>

    <Formula label="Expected value" note="Each outcome contributes in proportion to its probability.">
      {String.raw`E[X] = \sum_{i} x_i\, p_i`}
    </Formula>

    <h2>Variance</h2>
    <p>
      Expectation says nothing about risk. <strong>Variance</strong> measures how far outcomes
      typically fall from the mean, squaring the deviations so that those above and below do not
      cancel.
    </p>

    <Formula label="Variance and its shortcut" note="The second form is usually quicker to compute.">
      {String.raw`\operatorname{Var}(X) = \sum_i p_i (x_i - E[X])^2 = E[X^2] - (E[X])^2`}
    </Formula>

    <Callout label="Equal means, unequal risk" tone="fail">
      Select the fair die, then the ends-only preset. Both have expectation 3.5, but one produces
      middling results and the other only 1s and 6s. Any decision made on the expectation alone
      treats these as identical, which is precisely the mistake that makes a gamble look like a
      sure thing.
    </Callout>

    <WorkedExample
      label="Worked example - the value of a game"
      problem="A game pays £10 for a six, £4 for a five, and nothing otherwise. It costs £3 to play. Determine the expected profit per play."
      steps={[
        {
          text: 'List the payouts against their probabilities.',
          math: String.raw`P(10) = \tfrac{1}{6}, \quad P(4) = \tfrac{1}{6}, \quad P(0) = \tfrac{4}{6}`,
        },
        {
          text: 'Weight each payout by its probability.',
          math: String.raw`E[\text{payout}] = 10\cdot\tfrac{1}{6} + 4\cdot\tfrac{1}{6} + 0\cdot\tfrac{4}{6} = \tfrac{14}{6}`,
        },
        {
          text: 'Evaluate.',
          math: String.raw`E[\text{payout}] = 2.33`,
        },
        {
          text: 'Subtract the cost, which is certain and so enters at full weight.',
          math: String.raw`E[\text{profit}] = 2.33 - 3 = -0.67`,
        },
      ]}
      result="An expected loss of about 67p per play, so the game is unfavourable however lucky any single round feels."
      note="The cost is subtracted directly because expectation is linear: E[X − c] = E[X] − c for any constant c."
    />

    <h2>Application: setting an insurance premium</h2>
    <p>
      Insurance is expectation applied deliberately. The insurer pays out rarely but heavily, and
      charges a premium slightly above the expected loss. The margin is not profit alone; it also
      covers the variance, since a run of claims must be survivable.
    </p>

    <WorkedExample
      variant="applied"
      label="Application - pricing a policy"
      problem="Of every 1,000 policies, 8 result in a £5,000 claim and 40 in a £600 claim. The insurer targets a 25% margin above expected cost. Determine the expected claim per policy and the premium."
      steps={[
        {
          text: 'Convert the frequencies into probabilities.',
          math: String.raw`P(5000) = 0.008, \qquad P(600) = 0.040, \qquad P(0) = 0.952`,
        },
        {
          text: 'Weight each claim by its probability.',
          math: String.raw`E[\text{claim}] = 0.008(5000) + 0.040(600) = 40 + 24`,
        },
        {
          text: 'The expected cost per policy follows.',
          math: String.raw`E[\text{claim}] = 64`,
        },
        {
          text: 'Apply the target margin.',
          math: String.raw`\text{premium} = 1.25 \times 64 = 80`,
        },
      ]}
      result="An expected claim of £64 per policy and a premium of £80."
      note="The business only works at scale. A single policy either claims or does not; across a hundred thousand, the average claim settles close to £64, which is the Central Limit Theorem doing the insurer's work."
    />

    <Example label="Expectation as a decision rule">
      Expected value underlies pricing, portfolio choice and the value of running one more test. It
      is the right rule when a decision is repeated often enough for averages to assert themselves.
      For a decision made once, where a bad outcome cannot be absorbed, the variance may matter more
      than the mean.
    </Example>
  </>
);

export default function ExpectationLesson({ lessonId }) {
  const [presetId, setPresetId] = useState(defaults.presetId);
  const [weights, setWeights] = useState(PRESETS[0].weights);

  const total = sum(weights) || 1;
  const centre = expectation(OUTCOMES, weights);
  const spread = discreteVariance(OUTCOMES, weights);

  function choose(preset) {
    setPresetId(preset.id);
    setWeights(preset.weights);
  }

  function adjust(index, step, absolute) {
    setPresetId('custom');
    setWeights((current) => {
      const next = [...current];
      if (absolute !== undefined && absolute !== null) {
        next[index] = Math.max(0, Math.round(absolute * sum(current) * 100) / 100);
      } else {
        next[index] = Math.max(0, next[index] + step);
      }
      return sum(next) > 0 ? next : current;
    });
  }

  function reset() {
    setPresetId(defaults.presetId);
    setWeights(PRESETS[0].weights);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      story={<SpinnerStory />}
      quiz={questions}
      reference={<FormulaReference title="Expectation reference" groups={expectationFormulas} />}
      intro="A random variable attaches a number to each outcome. Its expected value is the long-run average, and its variance says how far individual results tend to stray from that average."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive distribution</span>
              <h2>Weighting the outcomes</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={{ presetId }} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Distribution presets">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                className={`chip ${presetId === preset.id ? 'selected' : ''}`}
                type="button"
                onClick={() => choose(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <ExpectationExplorer outcomes={OUTCOMES} weights={weights} onChange={adjust} />

          <dl className="readout">
            <div className="is-close">
              <dt>E[X]</dt>
              <dd>{centre.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Var(X)</dt>
              <dd>{spread.toFixed(2)}</dd>
            </div>
            <div>
              <dt>σ</dt>
              <dd>{Math.sqrt(spread).toFixed(2)}</dd>
            </div>
            <div>
              <dt>probabilities</dt>
              <dd>{(sum(weights) / total).toFixed(2)}</dd>
            </div>
          </dl>

          <div className="controls">
            <div className={`epsilon-strip ${Math.abs(centre - 3.5) < 0.05 ? 'is-ok' : ''}`}>
              <span className="verdict">
                {Math.abs(centre - 3.5) < 0.05 ? 'balanced at 3.5' : `centred at ${centre.toFixed(2)}`}
              </span>
              <p>
                {Math.abs(centre - 3.5) < 0.05
                  ? `The expectation matches a fair die, but the variance here is ${spread.toFixed(2)}. Two distributions can share a mean and still differ entirely in how far results scatter.`
                  : `Shifting weight toward the higher outcomes has moved the expectation to ${centre.toFixed(2)}, with variance ${spread.toFixed(2)}.`}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Drag the top of any bar to change how likely that outcome is, or focus one and use the up
            and down arrows. The bars are rescaled so the probabilities always total one.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
