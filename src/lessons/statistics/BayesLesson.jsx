import { useState } from 'react';
import BayesExplorer, { POPULATION } from './BayesExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import { posterior } from '../../lib/statistics.js';
import { bayesFormulas } from '../../lib/formulas.js';

const defaults = { prevalence: 0.01, sensitivity: 0.99, specificity: 0.95 };

const SCENARIOS = [
  { id: 'rare', label: 'Rare condition', values: { prevalence: 0.01, sensitivity: 0.99, specificity: 0.95 } },
  { id: 'common', label: 'Common condition', values: { prevalence: 0.3, sensitivity: 0.99, specificity: 0.95 } },
  { id: 'sharper', label: 'Far fewer false alarms', values: { prevalence: 0.01, sensitivity: 0.99, specificity: 0.999 } },
];

const questions = [
  {
    id: 'b1',
    prompt: 'A test is 99% accurate and you test positive for a condition affecting 1 in 100 people. Roughly what is the chance you have it?',
    options: [
      'Around one in six',
      'About 99%',
      'About 90%',
      'Exactly 1%',
    ],
    answer: 0,
    explanation:
      'With a 5% false-positive rate, the healthy majority produces far more positives than the rare affected group does. Most positives are therefore false.',
  },
  {
    id: 'b2',
    prompt: 'What makes the base rate so influential here?',
    options: [
      'A small true group is outnumbered by false positives drawn from a much larger healthy group',
      'The test becomes less accurate for rare conditions',
      'Rare conditions are harder to detect',
      'The base rate changes the sensitivity',
    ],
    answer: 0,
    explanation:
      'The test performs identically either way. What changes is the size of the pool each kind of positive is drawn from.',
  },
  {
    id: 'b3',
    prompt: 'Which change would most improve the chance that a positive result is correct?',
    options: [
      'Reducing the false-positive rate',
      'Increasing the sensitivity from 99% to 100%',
      'Testing more people',
      'Repeating the same test on the same person',
    ],
    answer: 0,
    explanation:
      'Sensitivity is already near its ceiling, so there is little to gain. False positives dominate the denominator, so cutting them is what moves the answer.',
  },
  {
    id: 'b4',
    prompt: 'In Bayes\' theorem, what does the denominator P(B) represent?',
    options: [
      'The total probability of the evidence, from every source',
      'The prior probability of the hypothesis',
      'The probability the test is wrong',
      'The number of people tested',
    ],
    answer: 0,
    explanation:
      'It collects every route to the observed evidence, both the true positives and the false ones, and so normalises the result into a probability.',
  },
];

const prose = (
  <>
    <h2>Conditional probability</h2>
    <p>
      The probability of A <strong>given</strong> B restricts attention to the outcomes where B
      occurred, and asks what share of those also have A. In the area picture from the previous
      lesson, it discards everything outside B and rescales what remains.
    </p>

    <Formula label="Conditional probability" note="Divide by P(B) because B has become the new sample space.">
      {String.raw`P(A \mid B) = \frac{P(A \cap B)}{P(B)}, \qquad P(B) > 0`}
    </Formula>

    <p>
      Order matters. P(positive test given disease) is a property of the test; P(disease given
      positive test) is what a patient wants to know. Confusing the two is the most consequential
      error in applied probability.
    </p>

    <h2>Reversing the condition</h2>
    <p>
      Writing the intersection two ways and equating them gives a rule for turning one conditional
      into the other.
    </p>

    <Formula label="Bayes' theorem" note="The denominator collects every route to the evidence.">
      {String.raw`P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}, \qquad P(B) = P(B \mid A)P(A) + P(B \mid A^{c})P(A^{c})`}
    </Formula>

    <Callout label="The base rate does most of the work" tone="fail">
      Set the explorer to the rare condition. The test is right 99% of the time for those who have it
      and wrong only 5% of the time for those who do not, yet most positive squares are healthy
      people. Ten true positives are swamped by roughly fifty false ones, because the healthy group
      is ninety-nine times larger. Ignoring this is the base rate fallacy.
    </Callout>

    <WorkedExample
      label="Worked example - reading a positive result"
      problem="A condition affects 1% of a population. A test detects 99% of those who have it and wrongly flags 5% of those who do not. A person tests positive. Determine the probability they have the condition."
      steps={[
        {
          text: 'Work with a concrete population rather than fractions. Take 10,000 people.',
          math: String.raw`100 \text{ have it}, \qquad 9{,}900 \text{ do not}`,
        },
        {
          text: 'Count the true positives among those who have it.',
          math: String.raw`0.99 \times 100 = 99`,
        },
        {
          text: 'Count the false positives among those who do not.',
          math: String.raw`0.05 \times 9{,}900 = 495`,
        },
        {
          text: 'The positives are these two groups combined; the answer is the true share of them.',
          math: String.raw`\frac{99}{99 + 495} = \frac{99}{594} \approx 0.167`,
        },
      ]}
      result="About 16.7%, or roughly one in six. Five out of six positive results are false alarms."
      note="Counting people rather than manipulating fractions is not a shortcut: it is the same calculation, and it makes the reason for the answer visible."
    />

    <h2>What actually moves the answer</h2>
    <p>
      Three quantities feed the result, and they do not carry equal weight. Raising sensitivity from
      99% toward 100% adds at most one true positive to the numerator. Cutting the false-positive
      rate removes hundreds from the denominator. When positives are dominated by false alarms, it is
      specificity that matters.
    </p>

    <Formula label="In terms of the three inputs" note="Prevalence appears in both terms, which is why it dominates.">
      {String.raw`P(D \mid +) = \frac{\text{sens} \times \text{prev}}{\text{sens} \times \text{prev} + (1 - \text{spec})(1 - \text{prev})}`}
    </Formula>

    <h2>Application: screening a whole population</h2>
    <p>
      This arithmetic is why mass screening for rare conditions is contentious. A test that performs
      well on any individual can still produce mostly false alarms when applied to everyone, and each
      false alarm carries a cost in follow-up procedures and alarm.
    </p>

    <WorkedExample
      variant="applied"
      label="Application - should the screen be offered to everyone"
      problem="A screening programme covers 100,000 people for a condition affecting 1 in 1,000. The test detects 95% of cases and has a false-positive rate of 2%. Determine how many positive results are false, and what happens if screening is restricted to a higher-risk group where 1 in 50 is affected."
      steps={[
        {
          text: 'Split the population by whether the condition is present.',
          math: String.raw`100 \text{ affected}, \qquad 99{,}900 \text{ unaffected}`,
        },
        {
          text: 'Count each kind of positive.',
          math: String.raw`\text{true} = 0.95 \times 100 = 95, \qquad \text{false} = 0.02 \times 99{,}900 = 1{,}998`,
        },
        {
          text: 'Take the true share of all positives.',
          math: String.raw`\frac{95}{95 + 1998} \approx 0.045`,
        },
        {
          text: 'Now restrict to a group where 1 in 50 is affected: 2,000 of 100,000.',
          math: String.raw`\text{true} = 0.95 \times 2000 = 1900, \qquad \text{false} = 0.02 \times 98000 = 1960`,
        },
        {
          text: 'Recompute the share.',
          math: String.raw`\frac{1900}{1900 + 1960} \approx 0.492`,
        },
      ]}
      result="Screening everyone makes only 4.5% of positives genuine, against 49% when restricted to the higher-risk group. The test never changed; the population did."
      note="This is the argument behind age thresholds and risk-based eligibility in screening programmes. Raising the base rate of the group tested is often far cheaper than improving the test."
    />

    <Example label="The same structure elsewhere">
      Spam filters, fraud alerts, security screening and automated content moderation all face this
      arithmetic: a rare target and a large innocent population mean most alerts are false, however
      good the detector. Any claim of accuracy that omits the base rate cannot be evaluated.
    </Example>
  </>
);

export default function BayesLesson({ lessonId }) {
  const [prevalence, setPrevalence] = useState(defaults.prevalence);
  const [sensitivity, setSensitivity] = useState(defaults.sensitivity);
  const [specificity, setSpecificity] = useState(defaults.specificity);

  const cells = posterior({ prevalence, sensitivity, specificity });
  const truePositives = Math.round(cells.truePositive * POPULATION);
  const falsePositives = Math.round(cells.falsePositive * POPULATION);
  const misleading = cells.given < 0.5;

  function reset() {
    setPrevalence(defaults.prevalence);
    setSensitivity(defaults.sensitivity);
    setSpecificity(defaults.specificity);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Bayes reference" groups={bayesFormulas} />}
      intro="A test that is right almost every time can still produce mostly false alarms. Whether it does depends on something the test itself knows nothing about: how common the condition is."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive population</span>
              <h2>{POPULATION.toLocaleString()} people, one square each</h2>
            </div>
            <div className="visual-actions">
              <ResetButton
                values={{ prevalence, sensitivity, specificity }}
                defaults={defaults}
                onReset={reset}
              />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Scenarios">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                className="chip"
                type="button"
                onClick={() => {
                  setPrevalence(scenario.values.prevalence);
                  setSensitivity(scenario.values.sensitivity);
                  setSpecificity(scenario.values.specificity);
                }}
              >
                {scenario.label}
              </button>
            ))}
          </div>

          <BayesExplorer
            prevalence={prevalence}
            sensitivity={sensitivity}
            specificity={specificity}
          />

          <dl className="readout">
            <div>
              <dt>true positives</dt>
              <dd>{truePositives}</dd>
            </div>
            <div>
              <dt>false positives</dt>
              <dd>{falsePositives}</dd>
            </div>
            <div className="is-close">
              <dt>P(has it | positive)</dt>
              <dd>{(cells.given * 100).toFixed(1)}%</dd>
            </div>
            <div>
              <dt>tests positive</dt>
              <dd>{(cells.positiveRate * 100).toFixed(1)}%</dd>
            </div>
          </dl>

          <div className="controls">
            {[
              ['Prevalence', prevalence, setPrevalence, 0.001, 0.5, 0.001],
              ['Sensitivity', sensitivity, setSensitivity, 0.5, 1, 0.005],
              ['Specificity', specificity, setSpecificity, 0.5, 1, 0.005],
            ].map(([label, value, setter, min, max, step]) => (
              <div className="slider" key={label}>
                <label htmlFor={`bayes-${label}`}>{label}</label>
                <input
                  id={`bayes-${label}`}
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(event) => setter(Number(event.target.value))}
                />
                <output>{(value * 100).toFixed(1)}%</output>
              </div>
            ))}

            <div className={`epsilon-strip ${misleading ? 'is-fail' : 'is-ok'}`}>
              <span className="verdict">
                {misleading ? 'most positives are false' : 'most positives are genuine'}
              </span>
              <p>
                {misleading
                  ? `Of every ${truePositives + falsePositives} positive results, only ${truePositives} come from someone who has the condition. The test is accurate; the condition is simply rare enough that the healthy majority supplies more positives than the affected minority.`
                  : `Of every ${truePositives + falsePositives} positive results, ${truePositives} are genuine. The base rate is high enough that true positives outnumber false alarms.`}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Each square is one person. Raise the prevalence slider and watch the balance between the
            two kinds of positive change, without the test itself changing at all.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
