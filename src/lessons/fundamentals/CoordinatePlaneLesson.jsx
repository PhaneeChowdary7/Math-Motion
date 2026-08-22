import { useState } from 'react';
import CoordinatePlaneExplorer from './CoordinatePlaneExplorer.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { planeFormulas } from '../../lib/formulas.js';

const defaults = { x: 3, y: 2, ax: 0, ay: 0 };

const questions = [
  {
    id: 'p1',
    prompt: 'A point has a negative x and a positive y. Which quadrant is it in?',
    options: ['Quadrant II', 'Quadrant I', 'Quadrant III', 'Quadrant IV'],
    answer: 0,
    explanation: 'Quadrants are numbered anticlockwise from the top right, so the second is up and to the left.',
  },
  {
    id: 'p2',
    prompt: 'Why does the distance formula square the differences?',
    options: [
      'It is Pythagoras: the differences are the two legs of a right triangle',
      'To keep the numbers small',
      'To make the answer an integer',
      'To cancel the fractions',
    ],
    answer: 0,
    explanation: 'The horizontal gap and the vertical gap meet at a right angle, so the straight-line distance is the hypotenuse.',
  },
  {
    id: 'p3',
    prompt: 'Where does the point (0, −4) sit?',
    options: [
      'On the y-axis, in no quadrant',
      'Quadrant III',
      'Quadrant IV',
      'At the origin',
    ],
    answer: 0,
    explanation: 'A zero coordinate puts a point on an axis, and the axes belong to no quadrant.',
  },
  {
    id: 'p4',
    prompt: 'What does the midpoint formula compute?',
    options: [
      'The average of the x values and the average of the y values',
      'The sum of the coordinates',
      'The difference of the coordinates',
      'The slope between the points',
    ],
    answer: 0,
    explanation: 'Averaging each coordinate separately lands exactly halfway along the segment.',
  },
];

const prose = (
  <>
    <h2>Two numbers, one location</h2>
    <p>
      Two number lines crossed at right angles turn a flat surface into something addressable. The
      horizontal line is the <strong>x-axis</strong>, the vertical one is the <strong>y-axis</strong>,
      and they meet at the <strong>origin</strong>. Any point is then named by an ordered pair: how
      far across, then how far up.
    </p>

    <p>
      Order is not negotiable. (3, 2) sits three right and two up, while (2, 3) sits two right and
      three up. They are different places, which is why the pair is called ordered.
    </p>

    <h2>The four quadrants</h2>
    <p>
      The axes cut the plane into four regions, numbered anticlockwise starting from the top right.
      Each has its own pair of signs: both positive in the first, x negative in the second, both
      negative in the third, y negative in the fourth. Knowing the quadrant tells you the signs
      before you have read a single value.
    </p>

    <Callout label="The axes belong to no quadrant" tone="fail">
      A point with a zero coordinate lies on an axis rather than inside a region. (0, −4) is on the
      y-axis and (5, 0) is on the x-axis. The origin sits on both at once.
    </Callout>

    <h2>Distance between points</h2>
    <p>
      Drop a horizontal leg and a vertical leg between two points and they meet at a right angle. The
      straight-line distance is the hypotenuse of that triangle, so Pythagoras gives it directly. The
      squares are what remove the signs, which is why the order of subtraction never matters here.
    </p>

    <Formula label="Distance" note="The two legs are the differences in x and in y.">
      {String.raw`d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}`}
    </Formula>

    <h2>The midpoint</h2>
    <p>
      Halfway along a segment is found by averaging each coordinate on its own. The x of the midpoint
      is the average of the two x values, and the y is the average of the two y values. No square
      roots are involved, because averaging never leaves the grid.
    </p>

    <Formula label="Midpoint" note="Each coordinate is averaged independently.">
      {String.raw`M = \left( \frac{x_1 + x_2}{2}, \; \frac{y_1 + y_2}{2} \right)`}
    </Formula>

    <Example label="Applications">
      Every graph in the later chapters lives on this grid, and so does every screen coordinate, map
      reference and pixel position. The distance formula is what a mapping tool computes when it
      reports how far apart two markers are.
    </Example>
  </>
);

export default function CoordinatePlaneLesson({ lessonId }) {
  const [point, setPoint] = useState({ x: defaults.x, y: defaults.y });
  const [anchor, setAnchor] = useState({ x: defaults.ax, y: defaults.ay });

  const dx = point.x - anchor.x;
  const dy = point.y - anchor.y;
  const distance = Math.hypot(dx, dy);
  const quadrant =
    point.x === 0 || point.y === 0
      ? null
      : point.x > 0
        ? point.y > 0
          ? 'I'
          : 'IV'
        : point.y > 0
          ? 'II'
          : 'III';

  function reset() {
    setPoint({ x: defaults.x, y: defaults.y });
    setAnchor({ x: defaults.ax, y: defaults.ay });
  }

  const values = { x: point.x, y: point.y, ax: anchor.x, ay: anchor.y };

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Plane reference" groups={planeFormulas} />}
      intro="Two crossed number lines name every point on a flat surface with an ordered pair, split it into four quadrants, and turn distance into a right-triangle problem."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plane</span>
              <h2>Locate a point</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={values} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Second point">
            <button
              className={`chip ${anchor.x === 0 && anchor.y === 0 ? 'selected' : ''}`}
              type="button"
              aria-pressed={anchor.x === 0 && anchor.y === 0}
              onClick={() => setAnchor({ x: 0, y: 0 })}
            >
              Measure from origin
            </button>
            <button
              className={`chip ${anchor.x === -4 && anchor.y === -3 ? 'selected' : ''}`}
              type="button"
              aria-pressed={anchor.x === -4 && anchor.y === -3}
              onClick={() => setAnchor({ x: -4, y: -3 })}
            >
              Measure from (−4, −3)
            </button>
          </div>

          <CoordinatePlaneExplorer point={point} anchor={anchor} onChange={setPoint} />

          <dl className="readout">
            <div>
              <dt>point</dt>
              <dd>
                ({point.x.toFixed(1)}, {point.y.toFixed(1)})
              </dd>
            </div>
            <div>
              <dt>quadrant</dt>
              <dd>{quadrant ?? 'axis'}</dd>
            </div>
            <div>
              <dt>Δx, Δy</dt>
              <dd>
                {dx.toFixed(1)}, {dy.toFixed(1)}
              </dd>
            </div>
            <div className="is-close">
              <dt>distance</dt>
              <dd>{distance.toFixed(2)}</dd>
            </div>
          </dl>

          <div className={`epsilon-strip ${quadrant ? 'is-ok' : 'is-fail'}`}>
            <span className="verdict">{quadrant ? `quadrant ${quadrant}` : 'on an axis'}</span>
            <p>
              {quadrant
                ? `Both legs are ${Math.abs(dx).toFixed(1)} across and ${Math.abs(dy).toFixed(1)} up, so the hypotenuse is √(${(dx * dx).toFixed(2)} + ${(dy * dy).toFixed(2)}) = ${distance.toFixed(2)}.`
                : 'A zero coordinate places the point on an axis, which belongs to no quadrant at all.'}
            </p>
          </div>

          <p className="plot-hint">
            Drag the point, or focus it and use the arrow keys. The dashed legs are the horizontal and
            vertical differences, and the small marker sits at the midpoint.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
