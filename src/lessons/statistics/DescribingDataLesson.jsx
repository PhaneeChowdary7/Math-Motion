import { useState } from 'react';
import SpreadExplorer from './SpreadExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import { iqr, mean, median, standardDeviation } from '../../lib/statistics.js';
import { describeFormulas } from '../../lib/formulas.js';
import { RaceFinishStory } from '../../stories/statistics.jsx';

const PRESETS = [
  { id: 'even', label: 'Fairly even', values: [22, 31, 38, 44, 49, 55, 61, 68, 74, 82] },
  { id: 'outlier', label: 'One outlier', values: [22, 26, 29, 31, 34, 36, 39, 41, 44, 97] },
  { id: 'tight', label: 'Tightly grouped', values: [46, 47, 48, 49, 50, 50, 51, 52, 53, 54] },
  { id: 'split', label: 'Two clusters', values: [15, 17, 19, 21, 23, 76, 78, 80, 82, 84] },
];

const defaults = { presetId: 'even', showSpread: true };

const questions = [
  {
    id: 'd1',
    prompt: 'A single very large value is added to a data set. Which summary changes more?',
    options: [
      'The mean, because every value enters the calculation',
      'The median, because the ordering changes',
      'Both change by the same amount',
      'Neither changes',
    ],
    answer: 0,
    explanation:
      'The mean is a total shared out, so an extreme value pulls it directly. The median only cares about position in the order, so it barely moves.',
  },
  {
    id: 'd2',
    prompt: 'Why is the standard deviation preferred to the variance when reporting spread?',
    options: [
      'It is in the same units as the data',
      'It is always smaller',
      'It is easier to compute',
      'It ignores outliers',
    ],
    answer: 0,
    explanation:
      'Variance is in squared units, so for data in pounds the variance is in pounds squared. Taking the square root returns it to pounds.',
  },
  {
    id: 'd3',
    prompt: 'Two data sets have the same mean. What else must be true?',
    options: [
      'Nothing else - they can differ completely in spread and shape',
      'They have the same standard deviation',
      'They have the same median',
      'They contain the same values',
    ],
    answer: 0,
    explanation:
      'A single centre says nothing about spread. Reporting a mean without a measure of spread hides most of what the data is doing.',
  },
  {
    id: 'd4',
    prompt: 'Which measure of spread is least affected by an extreme value?',
    options: [
      'The interquartile range',
      'The range',
      'The variance',
      'The standard deviation',
    ],
    answer: 0,
    explanation:
      'The interquartile range depends only on the middle half of the data, so a value at either extreme leaves it untouched. The range depends on the extremes entirely.',
  },
];

const prose = (
  <>
    <h2>Two questions about any data set</h2>
    <p>
      A list of numbers is rarely useful in raw form. Two questions summarise most of what matters:
      where is the data centred, and how far does it spread from that centre. Every measure in this
      lesson answers one or the other.
    </p>

    <h2>Measures of centre</h2>
    <p>
      The <strong>mean</strong> shares the total equally among the observations. The{' '}
      <strong>median</strong> is the middle value once the data is sorted, with the average of the
      two middle values taken when the count is even.
    </p>

    <Formula label="Mean and median" note="The mean uses every value; the median uses only position in the order.">
      {String.raw`\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i, \qquad \tilde{x} = \text{middle value of the sorted data}`}
    </Formula>

    <Callout label="They answer to different pressures" tone="fail">
      Select the outlier preset and drag the rightmost point further right. The mean follows it
      immediately, because that value enters the sum directly. The median does not move at all,
      because the middle of the ordering has not changed. Neither is wrong; they are measuring
      different things.
    </Callout>

    <h2>Measures of spread</h2>
    <p>
      Spread is measured from the centre. The <strong>variance</strong> averages the squared
      distances from the mean, and the <strong>standard deviation</strong> is its square root, which
      returns the figure to the original units.
    </p>

    <Formula label="Variance and standard deviation" note="Squaring removes the sign; the square root restores the units.">
      {String.raw`\sigma^2 = \frac{1}{n}\sum_{i=1}^{n}(x_i - \bar{x})^2, \qquad \sigma = \sqrt{\sigma^2}`}
    </Formula>

    <p>
      The <strong>interquartile range</strong> takes a different approach: it is the width of the
      middle half of the data, from the 25th to the 75th percentile. Because it discards both tails
      it is untroubled by extreme values, which makes it the natural partner for the median.
    </p>

    <WorkedExample
      label="Worked example - summarising a small set"
      problem="Summarise the data set 2, 4, 4, 4, 5, 5, 7, 9 by its mean, median and standard deviation."
      steps={[
        {
          text: 'The mean is the total divided by the count.',
          math: String.raw`\bar{x} = \frac{2 + 4 + 4 + 4 + 5 + 5 + 7 + 9}{8} = \frac{40}{8} = 5`,
        },
        {
          text: 'With eight values the median is the average of the fourth and fifth.',
          math: String.raw`\tilde{x} = \frac{4 + 5}{2} = 4.5`,
        },
        {
          text: 'Square each deviation from the mean and average them.',
          math: String.raw`\frac{9 + 1 + 1 + 1 + 0 + 0 + 4 + 16}{8} = \frac{32}{8} = 4`,
        },
        {
          text: 'Take the square root to return to the original units.',
          math: String.raw`\sigma = \sqrt{4} = 2`,
        },
      ]}
      result="Mean 5, median 4.5, standard deviation 2."
      note="A standard deviation of 2 about a mean of 5 says most values sit roughly between 3 and 7, which matches the list."
    />

    <h2>Application: reporting a typical salary</h2>
    <p>
      The choice between mean and median is not a technicality. When a distribution has a long tail,
      the two can differ enough to support opposite claims about the same data, which is why the
      choice of summary deserves as much scrutiny as the number itself.
    </p>

    <WorkedExample
      variant="applied"
      label="Application - which figure describes this team"
      problem="A nine-person team earns, in thousands of pounds: 28, 30, 31, 33, 34, 36, 38, 40 and 190, the last being the founder. Determine the mean and the median, and decide which should be quoted as the typical salary."
      steps={[
        {
          text: 'Total the salaries and divide by the count to obtain the mean.',
          math: String.raw`\bar{x} = \frac{460}{9} \approx 51.1`,
        },
        {
          text: 'With nine values the median is the fifth in order.',
          math: String.raw`\tilde{x} = 34`,
        },
        {
          text: 'Compare each summary against the data. Count how many staff earn at least the mean.',
          math: String.raw`\text{only } 1 \text{ of } 9 \text{ earns } \geq 51.1`,
        },
        {
          text: 'Check the interquartile range, which ignores both tails.',
          math: String.raw`Q_1 = 31, \quad Q_3 = 38 \;\Longrightarrow\; \text{IQR} = 7`,
        },
      ]}
      result="The median of £34k is the honest summary. The mean of £51.1k exceeds all but one salary, so it describes nobody on the team."
      note="This is why national income statistics are reported as medians. A single extreme value shifts a mean without changing anything about the typical case."
    />

    <Example label="Reading a summary critically">
      A centre quoted without a spread is close to meaningless: two teams can share an average
      response time while one is consistent and the other alternates between instant and hopeless.
      When a report gives only an average, the useful question is what the distribution looked like.
    </Example>
  </>
);

export default function DescribingDataLesson({ lessonId }) {
  const [presetId, setPresetId] = useState(defaults.presetId);
  const [values, setValues] = useState(PRESETS[0].values);
  const [showSpread, setShowSpread] = useState(defaults.showSpread);

  const centre = mean(values);
  const middle = median(values);
  const sd = standardDeviation(values);
  const spread = iqr(values);
  const skew = centre - middle;

  function choose(preset) {
    setPresetId(preset.id);
    setValues(preset.values);
  }

  function moveValue(index, next) {
    setValues((current) => current.map((value, i) => (i === index ? next : value)));
    setPresetId('custom');
  }

  function reset() {
    setPresetId(defaults.presetId);
    setValues(PRESETS[0].values);
    setShowSpread(defaults.showSpread);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      story={<RaceFinishStory />}
      quiz={questions}
      reference={<FormulaReference title="Descriptive statistics reference" groups={describeFormulas} />}
      intro="A list of numbers becomes useful once two questions are answered: where is it centred, and how far does it spread. The summaries that answer them respond very differently to extreme values."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive data</span>
              <h2>Centre and spread</h2>
            </div>
            <div className="visual-actions">
              <ResetButton
                values={{ presetId, showSpread }}
                defaults={defaults}
                onReset={reset}
              />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Data presets">
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

          <SpreadExplorer values={values} showSpread={showSpread} onChange={moveValue} />

          <dl className="readout">
            <div>
              <dt>mean</dt>
              <dd>{centre.toFixed(1)}</dd>
            </div>
            <div>
              <dt>median</dt>
              <dd>{middle.toFixed(1)}</dd>
            </div>
            <div className="is-close">
              <dt>σ</dt>
              <dd>{sd.toFixed(1)}</dd>
            </div>
            <div>
              <dt>IQR</dt>
              <dd>{spread.toFixed(1)}</dd>
            </div>
          </dl>

          <div className="controls">
            <div className="control-row">
              <button
                className={`chip ${showSpread ? 'selected' : ''}`}
                type="button"
                aria-pressed={showSpread}
                onClick={() => setShowSpread((current) => !current)}
              >
                Show one standard deviation
              </button>
            </div>

            <div className={`epsilon-strip ${Math.abs(skew) < 2 ? 'is-ok' : ''}`}>
              <span className="verdict">
                {Math.abs(skew) < 2 ? 'roughly symmetric' : skew > 0 ? 'tail to the right' : 'tail to the left'}
              </span>
              <p>
                {Math.abs(skew) < 2
                  ? `The mean and median agree to within ${Math.abs(skew).toFixed(1)}, so either summarises the centre fairly.`
                  : `The mean sits ${Math.abs(skew).toFixed(1)} ${skew > 0 ? 'above' : 'below'} the median, so a few extreme values are pulling it. The median is the safer summary here.`}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Drag any point along the line, or focus one and use the arrow keys. The shaded band
            covers one standard deviation either side of the mean. Watch how far the mean travels
            compared with the median.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
