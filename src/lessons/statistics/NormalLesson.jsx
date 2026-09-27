import { useState } from 'react';
import NormalExplorer, { DOMAIN } from './NormalExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import { normalBetween, zScore } from '../../lib/statistics.js';
import { normalFormulas } from '../../lib/formulas.js';
import { GaltonStory } from '../../stories/statistics.jsx';

const defaults = { mu: 100, sigma: 15, low: 85, high: 115 };

const questions = [
  {
    id: 'n1',
    prompt: 'For a normal distribution, what does the area under the curve between two values represent?',
    options: [
      'The probability of landing between them',
      'The number of observations there',
      'The average of the two values',
      'The standard deviation',
    ],
    answer: 0,
    explanation:
      'A density curve encloses total area 1, so any portion of that area is the probability of falling in the corresponding range.',
  },
  {
    id: 'n2',
    prompt: 'Roughly what share of a normal distribution lies within two standard deviations of the mean?',
    options: ['About 95%', 'About 68%', 'About 99.7%', 'About 50%'],
    answer: 0,
    explanation:
      'The 68-95-99.7 rule gives approximately 68% within one standard deviation, 95% within two and 99.7% within three.',
  },
  {
    id: 'n3',
    prompt: 'What does a z-score of −1.5 tell you?',
    options: [
      'The value lies 1.5 standard deviations below the mean',
      'The value is 1.5 units below the mean',
      'The probability is 1.5%',
      'The distribution is skewed',
    ],
    answer: 0,
    explanation:
      'A z-score expresses distance from the mean in units of standard deviation, which makes values from different distributions directly comparable.',
  },
  {
    id: 'n4',
    prompt: 'Two normal distributions have the same mean but different standard deviations. How do their curves differ?',
    options: [
      'The larger standard deviation gives a wider, flatter curve',
      'The larger standard deviation gives a taller curve',
      'They are identical',
      'One is shifted left of the other',
    ],
    answer: 0,
    explanation:
      'Total area is fixed at 1, so spreading the distribution wider must lower its peak. The mean sets position; the standard deviation sets width.',
  },
];

const prose = (
  <>
    <h2>From bars to a curve</h2>
    <p>
      With few outcomes, probability can be listed value by value. For a quantity that varies
      continuously there are infinitely many possible values, and each individual one has
      probability zero. What carries meaning instead is the probability of landing in a{' '}
      <strong>range</strong>, and that is measured as area under a <strong>density curve</strong>.
    </p>

    <Formula label="Probability as area" note="This is the integral from the Calculus chapter, put to work.">
      {String.raw`P(a \le X \le b) = \int_a^b f(x)\, dx, \qquad \int_{-\infty}^{\infty} f(x)\, dx = 1`}
    </Formula>

    <h2>The normal distribution</h2>
    <p>
      The most important density is the <strong>normal</strong>, or Gaussian. Two numbers fix it
      completely: the mean μ sets where it is centred, and the standard deviation σ sets how wide it
      spreads. Because the total area is always 1, a wider curve is necessarily a flatter one.
    </p>

    <Formula label="The normal density" note="Symmetric about the mean, with the width set by sigma.">
      {String.raw`f(x) = \frac{1}{\sigma\sqrt{2\pi}}\, e^{-\frac{(x - \mu)^2}{2\sigma^2}}`}
    </Formula>

    <p>
      A useful consequence is that the same proportions appear at the same distances from the mean,
      whatever μ and σ happen to be.
    </p>

    <Formula label="The 68-95-99.7 rule" note="Distances measured in standard deviations, not in raw units.">
      {String.raw`P(|X - \mu| < \sigma) \approx 0.68, \quad P(|X - \mu| < 2\sigma) \approx 0.95, \quad P(|X - \mu| < 3\sigma) \approx 0.997`}
    </Formula>

    <h2>Standardising</h2>
    <p>
      Because only the distance in standard deviations matters, any normal variable can be converted
      to a common scale. The <strong>z-score</strong> counts how many standard deviations a value
      sits from its mean, which makes results from different distributions comparable.
    </p>

    <Formula label="z-score" note="Subtract the mean, then divide by the standard deviation.">
      {String.raw`z = \frac{x - \mu}{\sigma}`}
    </Formula>

    <WorkedExample
      label="Worked example - comparing two results"
      problem="A candidate scores 130 on a test with mean 100 and standard deviation 15, and 62 on another with mean 50 and standard deviation 8. Determine which result is stronger relative to its cohort."
      steps={[
        {
          text: 'Convert the first score to a z-score.',
          math: String.raw`z_1 = \frac{130 - 100}{15} = 2.00`,
        },
        {
          text: 'Convert the second the same way.',
          math: String.raw`z_2 = \frac{62 - 50}{8} = 1.50`,
        },
        {
          text: 'Compare. The larger z-score is the stronger relative performance.',
          math: String.raw`2.00 > 1.50`,
        },
        {
          text: 'Translate the first into a percentile using the 95% rule for two standard deviations.',
          math: String.raw`P(Z < 2) \approx 0.977`,
        },
      ]}
      result="The first result is stronger: two standard deviations above the mean, placing it near the 98th percentile, against 1.5 for the second."
      note="The raw scores, 130 and 62, cannot be compared directly at all. Standardising is what makes the question answerable."
    />

    <Callout label="Not everything is normal" tone="fail">
      The normal curve is symmetric with thin tails, so it understates the chance of extreme events
      in quantities that are skewed or heavy-tailed. Incomes, city sizes and market returns are all
      poorly served by it. Assuming normality is a modelling choice, and it should be checked rather
      than presumed.
    </Callout>

    <h2>Application: setting a tolerance in manufacturing</h2>
    <p>
      Manufactured dimensions vary around a target in a way the normal distribution usually describes
      well. Given the process spread, the area under the curve outside the tolerance band is the
      expected reject rate, which turns an engineering specification into a cost.
    </p>

    <WorkedExample
      variant="applied"
      label="Application - expected reject rate"
      problem="A machine cuts rods to a mean length of 100 mm with a standard deviation of 0.8 mm. The specification accepts 98.5 mm to 101.5 mm. Determine the proportion of rods rejected."
      steps={[
        {
          text: 'Convert both limits to z-scores.',
          math: String.raw`z_{\text{low}} = \frac{98.5 - 100}{0.8} = -1.875, \qquad z_{\text{high}} = \frac{101.5 - 100}{0.8} = 1.875`,
        },
        {
          text: 'The accepted proportion is the area between them.',
          math: String.raw`P(-1.875 < Z < 1.875) \approx 0.9392`,
        },
        {
          text: 'Rejects are what remains.',
          math: String.raw`1 - 0.9392 = 0.0608`,
        },
        {
          text: 'Now suppose the process is improved so that sigma falls to 0.5 mm.',
          math: String.raw`z = \pm 3.0 \;\Longrightarrow\; P \approx 0.9973 \;\Longrightarrow\; \text{rejects} \approx 0.0027`,
        },
      ]}
      result="About 6.1% of rods are rejected. Tightening the process to a standard deviation of 0.5 mm cuts that to roughly 0.27%, a twentyfold reduction."
      note="The specification never changed. Reducing variability, rather than re-centring the machine, is what removes the rejects, which is the core idea behind statistical process control."
    />

    <Example label="Why this curve keeps appearing">
      Heights, measurement errors and test scores are approximately normal, and the reason is not
      coincidence. Quantities built from many small independent contributions tend toward this shape
      regardless of what the individual contributions look like, which is the subject of the next
      lesson.
    </Example>
  </>
);

export default function NormalLesson({ lessonId }) {
  const [mu, setMu] = useState(defaults.mu);
  const [sigma, setSigma] = useState(defaults.sigma);
  const [low, setLow] = useState(defaults.low);
  const [high, setHigh] = useState(defaults.high);

  const share = normalBetween(low, high, mu, sigma);
  const zLow = zScore(low, mu, sigma);
  const zHigh = zScore(high, mu, sigma);

  function moveBound(which, step, absolute) {
    const clamp = (value) => Math.max(DOMAIN[0], Math.min(DOMAIN[1], value));
    const next = (current) =>
      Number(clamp(absolute !== null && absolute !== undefined ? absolute : current + step).toFixed(1));

    if (which === 'low') setLow((current) => Math.min(next(current), high - 1));
    else setHigh((current) => Math.max(next(current), low + 1));
  }

  function reset() {
    setMu(defaults.mu);
    setSigma(defaults.sigma);
    setLow(defaults.low);
    setHigh(defaults.high);
  }

  const symmetric = Math.abs(zLow + zHigh) < 0.05;

  return (
    <LessonLayout
      lessonId={lessonId}
      story={<GaltonStory />}
      quiz={questions}
      reference={<FormulaReference title="Normal distribution reference" groups={normalFormulas} />}
      intro="For a quantity that varies continuously, any single value has probability zero. What carries meaning is the probability of landing in a range, and that is an area under a curve."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive distribution</span>
              <h2>Area under the curve</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={{ mu, sigma, low, high }} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Range presets">
            {[
              ['Within 1σ', 1],
              ['Within 2σ', 2],
              ['Within 3σ', 3],
            ].map(([label, k]) => (
              <button
                key={label}
                className="chip"
                type="button"
                onClick={() => { setLow(mu - k * sigma); setHigh(mu + k * sigma); }}
              >
                {label}
              </button>
            ))}
          </div>

          <NormalExplorer mu={mu} sigma={sigma} low={low} high={high} onChange={moveBound} />

          <dl className="readout">
            <div>
              <dt>z low</dt>
              <dd>{zLow.toFixed(2)}</dd>
            </div>
            <div>
              <dt>z high</dt>
              <dd>{zHigh.toFixed(2)}</dd>
            </div>
            <div className="is-close">
              <dt>area between</dt>
              <dd>{(share * 100).toFixed(1)}%</dd>
            </div>
            <div>
              <dt>outside</dt>
              <dd>{((1 - share) * 100).toFixed(1)}%</dd>
            </div>
          </dl>

          <div className="controls">
            {[
              ['Mean μ', mu, setMu, 40, 160, 1],
              ['Standard deviation σ', sigma, setSigma, 5, 35, 0.5],
            ].map(([label, value, setter, min, max, step]) => (
              <div className="slider" key={label}>
                <label htmlFor={`normal-${label}`}>{label}</label>
                <input
                  id={`normal-${label}`}
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(event) => setter(Number(event.target.value))}
                />
                <output>{value}</output>
              </div>
            ))}

            <div className={`epsilon-strip ${symmetric ? 'is-ok' : ''}`}>
              <span className="verdict">
                {symmetric ? `within ${Math.abs(zHigh).toFixed(1)}σ` : 'off-centre range'}
              </span>
              <p>
                {symmetric
                  ? `The bounds sit symmetrically about the mean at ${Math.abs(zHigh).toFixed(2)} standard deviations, capturing ${(share * 100).toFixed(1)}% of the distribution. Change μ and σ and that percentage does not move, because it depends only on the distance in standard deviations.`
                  : `The range runs from z = ${zLow.toFixed(2)} to z = ${zHigh.toFixed(2)}, capturing ${(share * 100).toFixed(1)}%. Only the z-scores matter: any μ and σ giving the same pair give the same area.`}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Drag either bound along the top, or focus one and use the arrow keys. Change μ and σ and
            watch the shaded percentage stay fixed whenever the z-scores do.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
