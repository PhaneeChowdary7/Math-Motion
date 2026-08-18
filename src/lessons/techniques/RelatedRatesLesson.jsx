import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import RelatedRatesExplorer, { rRange, rateRange } from './RelatedRatesExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import PracticeSet from '../../components/PracticeSet.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { relatedRatesGenerators } from './relatedRatesProblems.js';
import { usePlayback } from '../../lib/usePlayback.js';

const defaults = { radius: 4, rate: 3 };

const questions = [
  {
    id: 'r1',
    prompt: 'A circle\'s radius grows at 2 cm/s. How fast is its area growing when r = 5 cm?',
    options: ['10π cm²/s', '20π cm²/s', '25π cm²/s', '4π cm²/s'],
    answer: 1,
    explanation: 'dA/dt = 2πr · dr/dt = 2π(5)(2) = 20π cm²/s.',
  },
  {
    id: 'r2',
    prompt: 'When should you substitute the given numbers?',
    options: [
      'After differentiating, never before',
      'Before differentiating, to simplify',
      'It makes no difference',
      'Only if the rate is constant',
    ],
    answer: 0,
    explanation: 'Substituting first freezes the variable into a constant, and constants differentiate to zero. The relationship must be differentiated while everything is still a variable.',
  },
  {
    id: 'r3',
    prompt: 'In a sliding ladder problem, why is dy/dt negative?',
    options: [
      'Because the top is moving downwards',
      'Because the ladder is shrinking',
      'Because x is negative',
      'Because time runs backwards',
    ],
    answer: 0,
    explanation: 'The sign carries the direction. A negative rate means the measured quantity is decreasing, so the top of the ladder is descending.',
  },
];

// Static prose, hoisted so React skips the subtree while the plot is dragged.
const prose = (
  <>
    <h2>One relationship, two rates</h2>
    <p>
      A ripple spreads outward at a steady speed. Its radius climbs at a constant rate, yet its
      area does not: the bigger the circle, the more area each extra centimetre of radius brings
      with it. Both facts come from a single equation, differentiated with respect to time.
    </p>

    <Formula label="The pattern" note="Differentiate the relationship with respect to t, then substitute the numbers.">
      dA/dt = dA/dr × dr/dt
    </Formula>

    <h2>The method</h2>
    <p>
      Every problem of this kind follows the same four moves. Write the equation relating the
      quantities. Differentiate both sides with respect to <strong>time</strong>. Solve for the
      rate you want. Only then substitute the numbers you were given.
    </p>

    <Callout label="The order matters" tone="fail">
      Substituting the numbers before differentiating is the classic error. Once you write r = 5,
      the radius has become a constant, and constants have zero rate of change. Differentiate
      first, while every quantity is still free to vary.
    </Callout>

    <h2>Reading the sign</h2>
    <p>
      A negative rate is not a mistake, it is information. In the sliding ladder problem the foot
      moves away from the wall while the top slides down, so one rate is positive and the other is
      negative. Keeping the sign honest is how the algebra tells you which way things are moving.
    </p>

    <Example label="Where it shows up">
      Air traffic control watches two aircraft on converging paths and needs the rate at which the
      distance between them is closing, not the speed of either plane. That distance is related to
      both positions by Pythagoras, and differentiating that relation is exactly this technique.
    </Example>
  </>
);

export default function RelatedRatesLesson({ lessonId }) {
  const [radius, setRadius] = useState(defaults.radius);
  const [rate, setRate] = useState(defaults.rate);
  const playFrom = useRef(rRange[0]);

  const areaRate = 2 * Math.PI * radius * rate;

  const { playing, start, stop } = usePlayback((progress) => {
    setRadius(Number((playFrom.current + (rRange[1] - playFrom.current) * progress).toFixed(2)));
  });

  function setSize(next) {
    stop();
    setRadius(next);
  }

  function grow() {
    if (playing) {
      stop();
      return;
    }

    const from = radius > rRange[1] - 1 ? rRange[0] : radius;
    playFrom.current = from;
    setRadius(from);
    start(2600);
  }

  function reset() {
    stop();
    setRadius(defaults.radius);
    setRate(defaults.rate);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      intro="When two quantities are tied together by a formula, their rates of change are tied together too. Related rates is the chain rule applied to a relationship that is unfolding in time."
      practice={<PracticeSet title="Work through a rate problem" generators={relatedRatesGenerators} />}
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plot</span>
              <h2>Why bigger means faster</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={{ radius, rate }} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <dl className="readout">
            <div>
              <dt>r</dt>
              <dd>{radius.toFixed(1)}</dd>
            </div>
            <div>
              <dt>dr/dt</dt>
              <dd>{rate}</dd>
            </div>
            <div>
              <dt>dA/dt</dt>
              <dd>{areaRate.toFixed(1)}</dd>
            </div>
          </dl>

          <RelatedRatesExplorer radius={radius} rate={rate} />

          <div className="controls">
            <label className="slider">
              <span className="slider-label">Radius r</span>
              <input
                type="range"
                min={rRange[0]}
                max={rRange[1]}
                step="0.1"
                value={radius}
                onChange={(event) => setSize(Number(event.target.value))}
              />
              <strong className="slider-value">{radius.toFixed(1)}</strong>
            </label>

            <label className="slider">
              <span className="slider-label">Speed dr/dt</span>
              <input
                type="range"
                min={rateRange[0]}
                max={rateRange[1]}
                step="1"
                value={rate}
                onChange={(event) => setRate(Number(event.target.value))}
              />
              <strong className="slider-value">{rate}</strong>
            </label>

            <div className="control-row">
              <button className="chip is-action" type="button" onClick={grow}>
                {playing ? <Pause size={14} /> : <Play size={14} />}
                {playing ? 'Stop' : 'Grow it'}
              </button>
            </div>

            <div className="epsilon-strip is-ok">
              <span className="verdict">dA/dt = {areaRate.toFixed(1)}</span>
              <p>
                The radius creeps outward at a steady {rate}, but the ring added each second gets
                longer as the circle widens, so the area accelerates.
              </p>
            </div>
          </div>

          <p className="plot-hint">
            The shaded ring is roughly the area gained in the next second: circumference × speed.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
