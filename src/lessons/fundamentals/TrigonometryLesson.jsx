import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import UnitCircleExplorer from './UnitCircleExplorer.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { trigFormulas } from '../../lib/formulas.js';
import {
  TAU,
  getWave,
  namedAngles,
  nearestNamedAngle,
  quadrantOf,
  toDegrees,
} from '../../lib/trigWave.js';
import { usePlayback } from '../../lib/usePlayback.js';

const defaults = { waveId: 'sine', theta: Math.PI / 6, showBoth: false };

const questions = [
  {
    id: 't1',
    prompt: 'On the unit circle, what is sin θ?',
    options: [
      'The vertical coordinate of the point',
      'The horizontal coordinate of the point',
      'The length of the radius',
      'The angle measured in degrees',
    ],
    answer: 0,
    explanation: 'The radius is 1, so the point sits at (cos θ, sin θ). Sine reads the height and cosine reads the width.',
  },
  {
    id: 't2',
    prompt: 'Why is sin²θ + cos²θ = 1?',
    options: [
      'It is Pythagoras on a triangle with hypotenuse 1',
      'Because sine and cosine are opposites',
      'Because the period is 2π',
      'It is true only at θ = 0',
    ],
    answer: 0,
    explanation: 'The two legs are cos θ and sin θ and the hypotenuse is the radius, which is 1. Squaring and adding gives 1².',
  },
  {
    id: 't3',
    prompt: 'How does the cosine wave relate to the sine wave?',
    options: [
      'It is the sine wave shifted a quarter turn to the left',
      'It is the sine wave upside down',
      'It has twice the period',
      'It has half the amplitude',
    ],
    answer: 0,
    explanation: 'cos θ = sin(θ + π/2). Both have period 2π and amplitude 1; only the starting height differs.',
  },
  {
    id: 't4',
    prompt: 'In which quadrant is sine positive but cosine negative?',
    options: ['Quadrant II', 'Quadrant I', 'Quadrant III', 'Quadrant IV'],
    answer: 0,
    explanation: 'Up and to the left: the height is above the axis, so sine is positive, while the width is to the left, so cosine is negative.',
  },
];

const prose = (
  <>
    <h2>The unit circle</h2>
    <p>
      Draw a circle of radius 1 centred at the origin and mark a point on it. Sweep that point
      anticlockwise from the positive x-axis and call the angle turned θ. Everything in this lesson
      follows from one observation: the point sits at the coordinates (cos θ, sin θ).
    </p>

    <p>
      So the two ratios are not really ratios here at all, they are lengths.{' '}
      <strong>Cosine is the width</strong> of the point from the vertical axis, and{' '}
      <strong>sine is its height</strong> above the horizontal one. The radius, the width and the
      height form a right triangle whose hypotenuse is always 1.
    </p>

    <Formula label="Pythagoras on the unit circle" note="The legs are cos θ and sin θ; the hypotenuse is the radius.">
      {String.raw`\sin^2\theta + \cos^2\theta = 1`}
    </Formula>

    <h2>Radians</h2>
    <p>
      Angles here are measured in <strong>radians</strong>, the distance travelled around a circle of
      radius 1. A full turn is the circumference, 2π, so half a turn is π and a quarter turn is π/2.
      Degrees are a human convention; radians are the measure the mathematics itself prefers, and
      every derivative in the later chapters assumes them.
    </p>

    <h2>From circle to wave</h2>
    <p>
      Now unroll the motion. Let the angle run along a horizontal axis and plot the height of the
      point against it. Going round the circle at a steady rate makes that height rise to 1, fall
      through 0 to −1, and return, over and over. That trace is the <strong>sine wave</strong>.
    </p>

    <p>
      Plot the width instead and you get the <strong>cosine wave</strong>, the same shape started
      from a different place. Cosine begins at 1 because the point starts on the positive x-axis,
      fully to the right and at no height at all. This is why cos θ = sin(θ + π/2): the same curve,
      shifted a quarter turn.
    </p>

    <Callout label="Amplitude and period" tone="ok">
      Both waves rise to 1 and fall to −1, an <strong>amplitude</strong> of 1, and both repeat every
      2π, a <strong>period</strong> of 2π. In y = a sin(bθ) the a stretches the wave vertically and
      the b squeezes it horizontally, giving a period of 2π/|b|.
    </Callout>

    <h2>Signs by quadrant</h2>
    <p>
      Because sine is a height and cosine is a width, their signs are simply the signs of the
      coordinates. Both are positive in the first quadrant. In the second the point is up and to the
      left, so sine stays positive while cosine turns negative. In the third both are negative, and
      in the fourth cosine recovers while sine is still below the axis.
    </p>

    <Example label="Applications">
      Anything that repeats is described by these waves: alternating current, sound and light,
      tides, the swing of a pendulum, seasonal temperature. The circle is the honest picture of every
      one of them, and the wave is what you see when the motion is plotted against time.
    </Example>
  </>
);

export default function TrigonometryLesson({ lessonId }) {
  const [waveId, setWaveId] = useState(defaults.waveId);
  const [theta, setTheta] = useState(defaults.theta);
  const [showBoth, setShowBoth] = useState(defaults.showBoth);

  const wave = getWave(waveId);
  const spinFrom = useRef(0);

  const { playing, start, stop } = usePlayback((progress) => {
    setTheta(spinFrom.current + (TAU - 0.001) * progress);
  });

  const sin = Math.sin(theta);
  const cos = Math.cos(theta);
  const quadrant = quadrantOf(theta);
  const named = nearestNamedAngle(theta);

  function setAngle(next) {
    stop();
    setTheta(next);
  }

  function spin() {
    if (playing) {
      stop();
      return;
    }

    spinFrom.current = 0;
    setTheta(0);
    start(4200);
  }

  function reset() {
    stop();
    setWaveId(defaults.waveId);
    setTheta(defaults.theta);
    setShowBoth(defaults.showBoth);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Trigonometry reference" groups={trigFormulas} />}
      intro="A point travelling round a circle of radius 1 has a height and a width. Plotting the height against the angle draws the sine wave, and plotting the width draws the cosine wave."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive circle</span>
              <h2>{wave.label} traced from the circle</h2>
            </div>
            <div className="visual-actions">
              <ResetButton
                values={{ waveId, theta, showBoth }}
                defaults={defaults}
                onReset={reset}
              />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Wave">
            <button
              className={`chip ${waveId === 'sine' ? 'selected' : ''}`}
              type="button"
              aria-pressed={waveId === 'sine'}
              onClick={() => setWaveId('sine')}
            >
              sin θ
            </button>
            <button
              className={`chip ${waveId === 'cosine' ? 'selected' : ''}`}
              type="button"
              aria-pressed={waveId === 'cosine'}
              onClick={() => setWaveId('cosine')}
            >
              cos θ
            </button>
          </div>

          <dl className="readout">
            <div>
              <dt>θ</dt>
              <dd>{named ? named.label : `${toDegrees(theta).toFixed(0)}°`}</dd>
            </div>
            <div>
              <dt>cos θ</dt>
              <dd>{cos.toFixed(3)}</dd>
            </div>
            <div>
              <dt>sin θ</dt>
              <dd>{sin.toFixed(3)}</dd>
            </div>
            <div className="is-close">
              <dt>sin² + cos²</dt>
              <dd>{(sin * sin + cos * cos).toFixed(3)}</dd>
            </div>
          </dl>

          <UnitCircleExplorer theta={theta} wave={wave} showBoth={showBoth} onChange={setAngle} />

          <div className="controls">
            <label className="slider">
              <span className="slider-label">Angle θ</span>
              <input
                type="range"
                min={0}
                max={TAU}
                step="0.005"
                value={theta}
                onChange={(event) => setAngle(Number(event.target.value))}
              />
              <strong className="slider-value">{toDegrees(theta).toFixed(0)}°</strong>
            </label>

            <div className="control-row">
              <button className="chip is-action" type="button" onClick={spin}>
                {playing ? <Pause size={14} /> : <Play size={14} />}
                {playing ? 'Stop' : 'Trace one turn'}
              </button>
              <button
                className={`chip ${showBoth ? 'selected' : ''}`}
                type="button"
                aria-pressed={showBoth}
                onClick={() => setShowBoth((current) => !current)}
              >
                Show the other wave
              </button>
            </div>

            <div className="control-row">
              {namedAngles.slice(0, 5).map((angle) => (
                <button
                  className="chip"
                  key={angle.label}
                  type="button"
                  onClick={() => setAngle(angle.radians)}
                >
                  {angle.label}
                </button>
              ))}
            </div>

            <div className="epsilon-strip is-ok">
              <span className="verdict">
                {named ? `exact at ${named.label}` : `quadrant ${quadrant.number}`}
              </span>
              <p>
                {named
                  ? `At ${named.label} the values are exact: sin = ${named.exact.sin} and cos = ${named.exact.cos}. These are the ones worth committing to memory.`
                  : `Here sine is ${quadrant.sin === '+' ? 'positive' : 'negative'} and cosine is ${quadrant.cos === '+' ? 'positive' : 'negative'}, because that is the sign of the point's height and width. ${wave.note}`}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Drag the point around the circle and watch the wave draw itself. The tie line joins the
            height on the circle to the height on the curve, which is the whole relationship.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
