import { useState } from 'react';
import LineExplorer from './LineExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';

const defaults = { x1: -3, y1: -1, x2: 2, y2: 3, showRise: true };

const questions = [
  {
    id: 'l1',
    prompt: 'What does a slope of 3 mean?',
    options: [
      'y climbs 3 units for every 1 unit x moves right',
      'The line passes through 3',
      'The line makes a 3 degree angle',
      'y equals 3 everywhere',
    ],
    answer: 0,
    explanation: 'Slope is rise over run, so a slope of 3 is a rise of 3 for a run of 1.',
  },
  {
    id: 'l2',
    prompt: 'Why is a vertical line said to have undefined slope?',
    options: [
      'The run is 0, and dividing by 0 has no value',
      'The rise is 0',
      'It has no y-intercept',
      'It is not a straight line',
    ],
    answer: 0,
    explanation: 'Both points share an x, so the denominator of rise over run is zero. Not infinite, simply undefined.',
  },
  {
    id: 'l3',
    prompt: 'In y = mx + c, what is c?',
    options: [
      'The y value where the line crosses the y-axis',
      'The slope',
      'The x-intercept',
      'The length of the line',
    ],
    answer: 0,
    explanation: 'Setting x = 0 leaves y = c, which is exactly the crossing point on the y-axis.',
  },
  {
    id: 'l4',
    prompt: 'Two lines are perpendicular. What is true of their slopes?',
    options: [
      'Their product is −1',
      'They are equal',
      'Their sum is 0',
      'One of them is 0',
    ],
    answer: 0,
    explanation: 'Each is the negative reciprocal of the other, so a slope of 2 meets a slope of −1/2 at a right angle.',
  },
];

const prose = (
  <>
    <h2>Slope as a rate</h2>
    <p>
      The <strong>slope</strong> of a line measures how steeply it climbs: the change in y divided by
      the change in x, usually said as rise over run. Because a line is straight, that ratio is the
      same wherever you measure it, which is precisely what makes it a single number rather than a
      list of them.
    </p>

    <Formula label="Slope" note="Any two distinct points on the line give the same value.">
      {String.raw`m = \frac{y_2 - y_1}{x_2 - x_1} = \frac{\Delta y}{\Delta x}`}
    </Formula>

    <p>
      Positive slope climbs to the right, negative slope falls, and zero slope is flat. The steeper
      the line, the larger the magnitude. This is the idea the Derivatives lesson later stretches to
      curves, where the slope stops being constant and has to be measured afresh at every point.
    </p>

    <Callout label="Vertical lines have no slope" tone="fail">
      Two points on a vertical line share the same x, so the run is 0 and the ratio has no value.
      Undefined is not the same as infinite: the quantity simply does not exist, which is why a
      vertical line cannot be written as y = mx + c at all.
    </Callout>

    <h2>Slope-intercept form</h2>
    <p>
      Written as y = mx + c, a line hands over both of its defining facts at once. The coefficient m
      is the slope, and c is the height at which the line crosses the y-axis, since putting x = 0
      leaves y = c. Two numbers pin down the whole line.
    </p>

    <Formula label="Slope-intercept form" note="m sets the steepness, c sets the height at x = 0.">
      {String.raw`y = mx + c`}
    </Formula>

    <h2>Point-slope form</h2>
    <p>
      When a slope and one known point are in hand, point-slope form is quicker than solving for c.
      It says only that the slope from the known point to any other point on the line is m, which is
      the definition of slope rearranged.
    </p>

    <Formula label="Point-slope form" note="Useful the moment you know a slope and a single point.">
      {String.raw`y - y_1 = m(x - x_1)`}
    </Formula>

    <h2>Parallel and perpendicular</h2>
    <p>
      Two lines are parallel exactly when their slopes match, since equal steepness means they never
      converge. They are perpendicular when the product of their slopes is −1, so each slope is the
      negative reciprocal of the other. A line of slope 2 meets a line of slope −1/2 at a right angle.
    </p>

    <Example label="Applications">
      A straight line is the first model reached for in almost every field: cost per unit, speed over
      a fixed stretch, a line of best fit through data. The slope is the answer to how much y changes
      per unit of x, which is the question most of applied mathematics is asking.
    </Example>
  </>
);

export default function LinesLesson({ lessonId }) {
  const [p1, setP1] = useState({ x: defaults.x1, y: defaults.y1 });
  const [p2, setP2] = useState({ x: defaults.x2, y: defaults.y2 });
  const [showRise, setShowRise] = useState(defaults.showRise);

  const run = p2.x - p1.x;
  const rise = p2.y - p1.y;
  const vertical = run === 0;
  const slope = vertical ? null : rise / run;
  const intercept = vertical ? null : p1.y - slope * p1.x;

  function movePoint(which, next) {
    if (which === 'p1') setP1(next);
    else setP2(next);
  }

  function reset() {
    setP1({ x: defaults.x1, y: defaults.y1 });
    setP2({ x: defaults.x2, y: defaults.y2 });
    setShowRise(defaults.showRise);
  }

  const values = { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, showRise };

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      intro="A straight line has one steepness everywhere, and that single number, rise over run, is its slope. Two numbers, a slope and an intercept, describe the whole line."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plot</span>
              <h2>Slope between two points</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={values} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Line presets">
            <button className="chip" type="button" onClick={() => { setP1({ x: -3, y: -1 }); setP2({ x: 2, y: 3 }); }}>
              Climbing
            </button>
            <button className="chip" type="button" onClick={() => { setP1({ x: -3, y: 3 }); setP2({ x: 3, y: -3 }); }}>
              Falling
            </button>
            <button className="chip" type="button" onClick={() => { setP1({ x: -4, y: 2 }); setP2({ x: 4, y: 2 }); }}>
              Flat
            </button>
            <button className="chip" type="button" onClick={() => { setP1({ x: 2, y: -4 }); setP2({ x: 2, y: 4 }); }}>
              Vertical
            </button>
          </div>

          <LineExplorer p1={p1} p2={p2} showRise={showRise} onChange={movePoint} />

          <dl className="readout">
            <div>
              <dt>rise</dt>
              <dd>{rise.toFixed(1)}</dd>
            </div>
            <div>
              <dt>run</dt>
              <dd>{run.toFixed(1)}</dd>
            </div>
            <div className="is-close">
              <dt>slope m</dt>
              <dd>{vertical ? 'undefined' : slope.toFixed(2)}</dd>
            </div>
            <div>
              <dt>intercept c</dt>
              <dd>{vertical ? 'none' : intercept.toFixed(2)}</dd>
            </div>
          </dl>

          <div className="controls">
            <div className="control-row">
              <button
                className={`chip ${showRise ? 'selected' : ''}`}
                type="button"
                aria-pressed={showRise}
                onClick={() => setShowRise((current) => !current)}
              >
                Show rise and run
              </button>
            </div>

            <div className={`epsilon-strip ${vertical ? 'is-fail' : 'is-ok'}`}>
              <span className="verdict">
                {vertical ? 'undefined slope' : rise === 0 ? 'flat' : slope > 0 ? 'climbing' : 'falling'}
              </span>
              <p>
                {vertical
                  ? 'Both points share an x, so the run is zero and rise over run has no value. This line cannot be written as y = mx + c.'
                  : `y = ${slope.toFixed(2)}x ${intercept >= 0 ? '+' : '−'} ${Math.abs(intercept).toFixed(2)}. Drag either point and the ratio holds wherever you measure it.`}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Drag either point, or focus one and use the arrow keys. The two legs show the run and the
            rise, and the small marker sits where the line crosses the y-axis.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
