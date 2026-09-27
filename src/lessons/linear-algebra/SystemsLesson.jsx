import { useState } from 'react';
import SystemsExplorer from './SystemsExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import { solveSystem } from '../../lib/linearAlgebra.js';
import { systemFormulas } from '../../lib/formulas.js';
import { TrainsMeetStory } from '../../stories/linearAlgebra.jsx';

const defaults = { a1: 1, b1: 1, c1: 2, a2: 1, b2: -1, c2: -2 };

/** Render ax + by = c without "+ -1y" or a redundant leading 1. */
function equationText({ a, b, c }) {
  const term = (coef, name) => {
    const size = Math.abs(coef);
    const unit = size === 1 ? '' : size.toString().replace(/\.0$/, '');
    return `${unit}${name}`;
  };

  const parts = [];
  if (a !== 0) parts.push(`${a < 0 ? '-' : ''}${term(a, 'x')}`);
  if (b !== 0) parts.push(`${parts.length ? (b < 0 ? ' - ' : ' + ') : b < 0 ? '-' : ''}${term(b, 'y')}`);
  if (!parts.length) parts.push('0');

  return `${parts.join('')} = ${c}`;
}

const cases = [
  { id: 'unique', label: 'One solution', values: { a1: 1, b1: 1, c1: 2, a2: 1, b2: -1, c2: -2 } },
  { id: 'none', label: 'No solution', values: { a1: 1, b1: 1, c1: 2, a2: 2, b2: 2, c2: -3 } },
  { id: 'infinite', label: 'Infinitely many', values: { a1: 1, b1: 1, c1: 2, a2: 2, b2: 2, c2: 4 } },
];

const questions = [
  {
    id: 's1',
    prompt: 'Two linear equations in two unknowns have no solution. What does that look like?',
    options: [
      'Two parallel lines that never meet',
      'Two lines crossing at one point',
      'One line drawn twice',
      'Two lines at right angles',
    ],
    answer: 0,
    explanation:
      'Same slope, different intercept. The equations demand two different things of the same direction, so nothing satisfies both.',
  },
  {
    id: 's2',
    prompt: 'What does a determinant of zero tell you about a 2×2 system?',
    options: [
      'There is no unique solution - either none or infinitely many',
      'There is exactly one solution',
      'The solution is at the origin',
      'The system has three unknowns',
    ],
    answer: 0,
    explanation:
      'A zero determinant means the two rows point the same way. Which of the two cases you land in depends on the constants, not the coefficients.',
  },
  {
    id: 's3',
    prompt: 'When a system has infinitely many solutions, what do the two lines look like?',
    options: [
      'They are the same line',
      'They are parallel but distinct',
      'They meet at the origin only',
      'One is vertical',
    ],
    answer: 0,
    explanation:
      'The second equation is a multiple of the first, so it adds no new constraint. Every point on the line satisfies both.',
  },
  {
    id: 's4',
    prompt: 'Written as Ax = b, when does the system have exactly one solution for every b?',
    options: [
      'When A is invertible',
      'When b is the zero vector',
      'When A is symmetric',
      'Never - it depends on b',
    ],
    answer: 0,
    explanation:
      'An invertible A gives x = A⁻¹b, which exists and is unique whatever b happens to be. That is the same condition as a non-zero determinant.',
  },
];

const prose = (
  <>
    <h2>Geometric formulation</h2>
    <p>
      An equation of the form ax + by = c describes a line: the set of points satisfying it, and no
      others. A system of two such equations therefore asks which points lie on both lines
      simultaneously, and the geometry of two lines in a plane settles the matter at once.
    </p>

    <Formula label="A system of two equations" note="Each equation is a line; a solution is a point common to both.">
      {String.raw`\begin{aligned} a_1 x + b_1 y &= c_1 \\ a_2 x + b_2 y &= c_2 \end{aligned}`}
    </Formula>

    <p>
      Two distinct lines in a plane admit exactly three configurations, and a system of this form has
      correspondingly three possible outcomes. The lines intersect at a single point, giving a{' '}
      <strong>unique solution</strong>. They are parallel and distinct, giving <strong>no
      solution</strong>. Or they coincide, giving <strong>infinitely many</strong>. No fourth case
      exists.
    </p>

    <h2>The discriminating quantity</h2>
    <p>
      Which of the three cases obtains is determined by the coefficients alone, through the
      determinant a₁b₂ − a₂b₁. This is the same expression that tested linear independence in the
      first lesson of the chapter.
    </p>

    <Formula label="Determinant of the coefficient matrix" note="A non-zero value guarantees a single intersection.">
      {String.raw`\det = a_1 b_2 - a_2 b_1`}
    </Formula>

    <WorkedExample
      label="Worked example - solving by elimination"
      problem="Solve the system 2x + 3y = 12 and x − y = 1."
      steps={[
        {
          text: 'Evaluate the determinant to confirm a unique solution exists.',
          math: String.raw`\det = (2)(-1) - (3)(1) = -5 \neq 0`,
        },
        {
          text: 'Eliminate x by subtracting twice the second equation from the first.',
          math: String.raw`(2x + 3y) - 2(x - y) = 12 - 2 \;\Longrightarrow\; 5y = 10`,
        },
        {
          text: 'Solve for y, then substitute into the second equation to recover x.',
          math: String.raw`y = 2, \qquad x - 2 = 1 \;\Longrightarrow\; x = 3`,
        },
        {
          text: 'Verify by substituting both values into the original first equation.',
          math: String.raw`2(3) + 3(2) = 12 \quad \checkmark`,
        },
      ]}
      result="The unique solution is x = 3, y = 2."
    />

    <Callout label="A zero determinant does not by itself mean no solution" tone="fail">
      A determinant of zero establishes only that the two lines are parallel. Whether that yields no
      solution or infinitely many depends on the constants: if the second equation is a scalar
      multiple of the first, constants included, the lines coincide. Adjusting c₂ in the explorer
      while the coefficients remain parallel moves the system between the two cases.
    </Callout>

    <h2>Matrix formulation</h2>
    <p>
      Collecting the coefficients into a matrix and the constants into a vector reduces the system to
      a single equation, Ax = b. The question is no longer about two lines but about one
      transformation: which input vector does A map to b?
    </p>

    <Formula label="The system in matrix form" note="A holds the coefficients; b holds the constants.">
      {String.raw`A\mathbf{x} = \mathbf{b}, \qquad A = \begin{pmatrix} a_1 & b_1 \\ a_2 & b_2 \end{pmatrix}`}
    </Formula>

    <p>
      When det A is non-zero the transformation is invertible, so each output has exactly one
      preimage and the solution is x = A⁻¹b. When det A is zero the plane has been collapsed onto a
      line; b either lies on that line, in which case infinitely many inputs map to it, or it does
      not, in which case none do. The three geometric cases and the three algebraic cases coincide.
    </p>

    <Formula label="Cramer's rule" note="Applicable precisely when the determinant is non-zero.">
      {String.raw`x = \frac{c_1 b_2 - b_1 c_2}{a_1 b_2 - a_2 b_1}, \qquad y = \frac{a_1 c_2 - c_1 a_2}{a_1 b_2 - a_2 b_1}`}
    </Formula>

    <h2>Application: recovering unknown rates from totals</h2>
    <p>
      Systems of this form arise wherever two unknown quantities are constrained by two independent
      measurements. The standard procedure is to name the unknowns, translate each measurement into
      an equation, confirm that the determinant is non-zero, and solve.
    </p>

    <WorkedExample
      variant="applied"
      label="Application - ticket revenue"
      problem="A venue sold 180 tickets for a single event and took £1,600 in total. Standard admission is £10 and concessions are £6. Determine how many of each were sold."
      steps={[
        {
          text: 'Name the unknowns: let x be the number of standard tickets and y the number of concessions.',
        },
        {
          text: 'The ticket count gives one equation and the revenue gives a second.',
          math: String.raw`\begin{aligned} x + y &= 180 \\ 10x + 6y &= 1600 \end{aligned}`,
        },
        {
          text: 'Confirm the two measurements are independent before solving.',
          math: String.raw`\det = (1)(6) - (1)(10) = -4 \neq 0`,
        },
        {
          text: 'Eliminate y by subtracting six times the first equation from the second.',
          math: String.raw`10x + 6y - 6(x + y) = 1600 - 1080 \;\Longrightarrow\; 4x = 520`,
        },
        {
          text: 'Solve for x, then substitute into the first equation to recover y.',
          math: String.raw`x = 130, \qquad 130 + y = 180 \;\Longrightarrow\; y = 50`,
        },
        {
          text: 'Verify against the revenue figure.',
          math: String.raw`10(130) + 6(50) = 1300 + 300 = 1600 \quad \checkmark`,
        },
      ]}
      result="The venue sold 130 standard tickets and 50 concessions."
      note="A revenue figure outside the range £1,080 to £1,800 would place the solution outside the admissible region, yielding a negative count. The determinant would still be non-zero: algebraic solvability and physical meaningfulness are separate questions."
    />

    <Example label="Where the three-case structure recurs">
      Fitting a straight line to data, balancing a chemical equation, and analysing a resistive
      circuit all reduce to systems of this kind, generally of larger size. The trichotomy survives
      unchanged: a unique solution, no solution, or an entire family of them. Establishing which case
      applies is frequently more important than computing the numbers.
    </Example>
  </>
);

export default function SystemsLesson({ lessonId }) {
  const [coef, setCoef] = useState(defaults);

  const row1 = { a: coef.a1, b: coef.b1, c: coef.c1 };
  const row2 = { a: coef.a2, b: coef.b2, c: coef.c2 };
  const result = solveSystem(row1, row2);

  const set = (key) => (event) => setCoef((current) => ({ ...current, [key]: Number(event.target.value) }));

  const verdict = {
    unique: 'one solution',
    none: 'no solution',
    infinite: 'infinitely many',
  }[result.kind];

  return (
    <LessonLayout
      lessonId={lessonId}
      story={<TrainsMeetStory />}
      quiz={questions}
      reference={<FormulaReference title="Systems reference" groups={systemFormulas} />}
      intro="Two linear equations in two unknowns ask which points lie on both lines at once. There are only three possible answers, and the determinant tells you which one you are getting."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plane</span>
              <h2>Two lines, three outcomes</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={coef} defaults={defaults} onReset={() => setCoef(defaults)} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="System presets">
            {cases.map((preset) => (
              <button
                key={preset.id}
                className={`chip ${result.kind === preset.id ? 'selected' : ''}`}
                type="button"
                onClick={() => setCoef(preset.values)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <SystemsExplorer row1={row1} row2={row2} />

          <dl className="readout">
            <div>
              <dt>line 1</dt>
              <dd>{equationText(row1)}</dd>
            </div>
            <div>
              <dt>line 2</dt>
              <dd>{equationText(row2)}</dd>
            </div>
            <div className="is-close">
              <dt>det</dt>
              <dd>{result.det.toFixed(2)}</dd>
            </div>
            <div>
              <dt>solutions</dt>
              <dd>{result.kind === 'unique' ? '1' : result.kind === 'none' ? '0' : '∞'}</dd>
            </div>
          </dl>

          <div className="controls">
            {[
              ['b1', 'Slope term b₁', -4, 4, 0.5],
              ['c1', 'Constant c₁', -6, 6, 0.5],
              ['b2', 'Slope term b₂', -4, 4, 0.5],
              ['c2', 'Constant c₂', -6, 6, 0.5],
            ].map(([key, label, min, max, step]) => (
              <div className="slider" key={key}>
                <label htmlFor={`sys-${key}`}>{label}</label>
                <input
                  id={`sys-${key}`}
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={coef[key]}
                  onChange={set(key)}
                />
                <output>{coef[key].toFixed(1)}</output>
              </div>
            ))}

            <div className={`epsilon-strip ${result.kind === 'unique' ? 'is-ok' : 'is-fail'}`}>
              <span className="verdict">{verdict}</span>
              <p>
                {result.kind === 'unique'
                  ? `The lines cross at (${result.point.x.toFixed(2)}, ${result.point.y.toFixed(2)}). The determinant is ${result.det.toFixed(2)}, and any non-zero value guarantees exactly one crossing.`
                  : result.kind === 'none'
                    ? 'The determinant is zero and the constants disagree, so the lines are parallel and distinct. No point satisfies both equations.'
                    : 'The determinant is zero and the second equation is a multiple of the first, constants included. The lines coincide, so every point on the line is a solution.'}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Slide b₂ until the determinant reaches zero - the lines become parallel. Then slide c₂ and
            watch the answer flip between no solution and infinitely many.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
