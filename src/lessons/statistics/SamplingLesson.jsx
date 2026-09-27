import { useMemo, useState } from 'react';
import SamplingExplorer, { buildPopulation, samplingDistribution } from './SamplingExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import { mean, standardDeviation } from '../../lib/statistics.js';
import { samplingFormulas } from '../../lib/formulas.js';

const SHAPES = [
  { id: 'skewed', label: 'Skewed population' },
  { id: 'bimodal', label: 'Two clusters' },
  { id: 'uniform', label: 'Flat population' },
];

const defaults = { shape: 'skewed', n: 5 };

const questions = [
  {
    id: 'c1',
    prompt: 'The Central Limit Theorem describes the distribution of what?',
    options: [
      'The mean of a sample, across many samples',
      'The individual values in the population',
      'The largest value in each sample',
      'The population standard deviation',
    ],
    answer: 0,
    explanation:
      'The population itself may be any shape at all. It is the sampling distribution of the mean that becomes normal as the sample size grows.',
  },
  {
    id: 'c2',
    prompt: 'Quadrupling the sample size does what to the standard error?',
    options: [
      'Halves it',
      'Quarters it',
      'Doubles it',
      'Leaves it unchanged',
    ],
    answer: 0,
    explanation:
      'The standard error divides by the square root of n, so a fourfold increase in sample size gives only a twofold gain in precision.',
  },
  {
    id: 'c3',
    prompt: 'A poll of 1,000 people reports a margin of error of about 3 points. Roughly what sample would halve it?',
    options: ['About 4,000', 'About 2,000', 'About 1,500', 'About 500'],
    answer: 0,
    explanation:
      'Precision improves with the square root of n, so halving the margin requires quadrupling the sample. This is why large polls are expensive.',
  },
  {
    id: 'c4',
    prompt: 'The population is heavily skewed. What happens to the distribution of sample means as n grows?',
    options: [
      'It becomes approximately normal and narrows',
      'It stays as skewed as the population',
      'It becomes uniform',
      'It widens',
    ],
    answer: 0,
    explanation:
      'This is precisely the content of the theorem, and it is why normal-based methods work even when the underlying data is not normal.',
  },
];

const prose = (
  <>
    <h2>A statistic is itself random</h2>
    <p>
      A sample mean is computed from data that could have come out differently. Draw another sample
      and it changes. The mean therefore has its own distribution, called the{' '}
      <strong>sampling distribution</strong>, and it is this distribution, not the population, that
      determines how much a single estimate can be trusted.
    </p>

    <h2>Two things are true of it</h2>
    <p>
      Whatever shape the population has, the sampling distribution of the mean is centred on the
      population mean, and its spread shrinks as the sample grows. That spread has its own name: the{' '}
      <strong>standard error</strong>.
    </p>

    <Formula label="Centre and spread of the sample mean" note="The square root is the reason large gains in precision are expensive.">
      {String.raw`E[\bar{X}] = \mu, \qquad \operatorname{SE}(\bar{X}) = \frac{\sigma}{\sqrt{n}}`}
    </Formula>

    <h2>The Central Limit Theorem</h2>
    <p>
      The theorem adds the crucial third fact: as the sample size grows, the sampling distribution
      approaches a normal curve, <strong>whatever the population looks like</strong>. Select the
      skewed population in the explorer and raise n. The top panel never changes shape; the bottom
      one becomes symmetric and narrow.
    </p>

    <Formula label="Central Limit Theorem" note="The population shape stops mattering once n is reasonably large.">
      {String.raw`\bar{X} \;\xrightarrow{\;n \to \infty\;}\; N\!\left(\mu, \frac{\sigma^2}{n}\right)`}
    </Formula>

    <Callout label="The population does not become normal" tone="fail">
      A common misreading is that large samples make the data normal. They do not: the top panel is
      as skewed at n = 60 as at n = 2. What becomes normal is the distribution of the average. This
      is why methods built on the normal curve can be applied to plainly non-normal data, provided
      the quantity of interest is a mean or a total.
    </Callout>

    <WorkedExample
      label="Worked example - precision of an estimate"
      problem="A population has standard deviation 12. Determine the standard error for a sample of 36, and the sample needed to halve it."
      steps={[
        {
          text: 'Apply the standard error formula.',
          math: String.raw`\operatorname{SE} = \frac{12}{\sqrt{36}} = \frac{12}{6} = 2`,
        },
        {
          text: 'Halving the standard error means solving for the n that gives 1.',
          math: String.raw`\frac{12}{\sqrt{n}} = 1 \;\Longrightarrow\; \sqrt{n} = 12`,
        },
        {
          text: 'Square both sides.',
          math: String.raw`n = 144`,
        },
      ]}
      result="A standard error of 2 at n = 36; halving it requires n = 144, four times the sample."
      note="Precision improves with the square root of the sample size, so each further halving costs four times as much again. This single fact governs the economics of surveying."
    />

    <h2>Application: the margin of error on a poll</h2>
    <p>
      A reported margin of error is the Central Limit Theorem applied to a proportion. Because the
      sampling distribution is approximately normal, roughly 95% of samples land within about two
      standard errors of the truth, and that interval is what gets quoted.
    </p>

    <WorkedExample
      variant="applied"
      label="Application - reading a published poll"
      problem="A poll of 1,000 voters finds 52% support. Determine the margin of error at 95% confidence, and say whether the poll establishes a lead."
      steps={[
        {
          text: 'For a proportion, the standard error uses p and its complement.',
          math: String.raw`\operatorname{SE} = \sqrt{\frac{p(1-p)}{n}} = \sqrt{\frac{0.52 \times 0.48}{1000}}`,
        },
        {
          text: 'Evaluate.',
          math: String.raw`\operatorname{SE} = \sqrt{0.0002496} \approx 0.0158`,
        },
        {
          text: 'A 95% interval spans about 1.96 standard errors either side.',
          math: String.raw`1.96 \times 0.0158 \approx 0.031`,
        },
        {
          text: 'Form the interval and compare it against the 50% threshold.',
          math: String.raw`52\% \pm 3.1\% \;\Longrightarrow\; (48.9\%,\; 55.1\%)`,
        },
      ]}
      result="A margin of about 3.1 points. The interval includes 50%, so the poll does not establish a lead: the result is within sampling noise."
      note="This is why a 52-48 split is routinely reported as a statistical tie. Note also that the margin depends on the sample size, not on the size of the population being sampled."
    />

    <Example label="Why this theorem carries so much">
      Confidence intervals, hypothesis tests, quality control limits and A/B test readouts all rest
      on the sampling distribution being approximately normal. The theorem is what licenses that
      assumption without requiring anything of the underlying data, and it is the reason a handful of
      normal-based methods cover so much of applied statistics.
    </Example>
  </>
);

export default function SamplingLesson({ lessonId }) {
  const [shape, setShape] = useState(defaults.shape);
  const [n, setN] = useState(defaults.n);

  const population = useMemo(() => buildPopulation(shape), [shape]);
  const means = useMemo(() => samplingDistribution(population, n), [population, n]);

  const mu = mean(population);
  const sigma = standardDeviation(population);
  const se = sigma / Math.sqrt(n);
  const observed = standardDeviation(means);

  function reset() {
    setShape(defaults.shape);
    setN(defaults.n);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Sampling reference" groups={samplingFormulas} />}
      intro="A sample mean is itself a random quantity. Its distribution becomes normal as the sample grows, whatever the population looks like, and that single fact underwrites most of applied statistics."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive sampling</span>
              <h2>The population, and the means it produces</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={{ shape, n }} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Population shape">
            {SHAPES.map((entry) => (
              <button
                key={entry.id}
                className={`chip ${shape === entry.id ? 'selected' : ''}`}
                type="button"
                onClick={() => setShape(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <SamplingExplorer shape={shape} n={n} />

          <dl className="readout">
            <div>
              <dt>population μ</dt>
              <dd>{mu.toFixed(2)}</dd>
            </div>
            <div>
              <dt>population σ</dt>
              <dd>{sigma.toFixed(2)}</dd>
            </div>
            <div className="is-close">
              <dt>σ/√n</dt>
              <dd>{se.toFixed(3)}</dd>
            </div>
            <div>
              <dt>observed spread</dt>
              <dd>{observed.toFixed(3)}</dd>
            </div>
          </dl>

          <div className="controls">
            <div className="slider">
              <label htmlFor="sampling-n">Sample size n</label>
              <input
                id="sampling-n"
                type="range"
                min="1"
                max="60"
                step="1"
                value={n}
                onChange={(event) => setN(Number(event.target.value))}
              />
              <output>{n}</output>
            </div>

            <div className={`epsilon-strip ${n >= 25 ? 'is-ok' : ''}`}>
              <span className="verdict">{n >= 25 ? 'convincingly normal' : `n = ${n}`}</span>
              <p>
                {n >= 25
                  ? `At n = ${n} the sample means trace the predicted normal closely, even though the population is anything but. The predicted standard error is ${se.toFixed(3)} and the observed spread is ${observed.toFixed(3)}.`
                  : `At n = ${n} the sampling distribution still carries some of the population's shape. Raise n and watch it straighten into the predicted curve while narrowing by a factor of √n.`}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            The top panel is the population and never changes with n. The bottom panel holds the
            means of {(3000).toLocaleString()} samples, with the normal the theorem predicts drawn over it.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
