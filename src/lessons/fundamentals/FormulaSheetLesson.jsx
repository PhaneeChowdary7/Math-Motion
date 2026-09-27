import { useState } from 'react';
import FormulaReference from '../../components/FormulaReference.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import Math from '../../components/Math.jsx';
import {
  algebraFormulas,
  exponentFormulas,
  geometryFormulas,
  trigFormulas,
  trigIdentityFormulas,
} from '../../lib/formulas.js';
import { formatValue, getIdentity, identities } from '../../lib/identities.js';

const defaults = { identityId: 'square-sum', a: 3, b: 2, A: 30, B: 45 };

// The sheet reuses the sets that other lessons own rather than copying them, so
// each formula has one source of truth. `lessons` links to where each is taught.
const topics = [
  {
    id: 'algebra',
    label: 'Algebra',
    groups: algebraFormulas,
    lessons: [
      ['permutations-and-combinations', 'Permutations & Combinations'],
      ['proof-by-induction', 'Proof by Induction'],
    ],
  },
  {
    id: 'trig',
    label: 'Trigonometry',
    groups: [...trigFormulas.slice(0, 2), ...trigIdentityFormulas],
    lessons: [['sine-and-cosine', 'Sine & Cosine']],
  },
  {
    id: 'logs',
    label: 'Exponents & logs',
    groups: exponentFormulas,
    lessons: [['exponents-and-logarithms', 'Exponents & Logarithms']],
  },
  {
    id: 'geometry',
    label: 'Geometry',
    groups: geometryFormulas,
    lessons: [['coordinate-plane', 'The Coordinate Plane']],
  },
];

const sliders = {
  a: { label: 'a', min: 0.5, max: 6, step: 0.5, unit: '' },
  b: { label: 'b', min: 0.5, max: 6, step: 0.5, unit: '' },
  A: { label: 'Angle A', min: 0, max: 360, step: 1, unit: '°' },
  B: { label: 'Angle B', min: 0, max: 360, step: 1, unit: '°' },
};

const questions = [
  {
    id: 'fs1',
    prompt: 'Which is the correct expansion of (x + 5)²?',
    options: ['x² + 10x + 25', 'x² + 25', 'x² + 5x + 25', '2x + 10'],
    answer: 0,
    explanation: 'Use (a + b)² = a² + 2ab + b² with a = x and b = 5. The middle term 2ab = 10x is the one people forget.',
  },
  {
    id: 'fs2',
    prompt: 'What is 103² − 97²?',
    options: ['1200', '36', '600', '12'],
    answer: 0,
    explanation: 'Difference of squares: (103 + 97)(103 − 97) = 200 × 6 = 1200. No need to square either number.',
  },
  {
    id: 'fs3',
    prompt: 'cos 2θ can be written as…',
    options: ['1 − 2sin²θ', '2cos θ', 'cos²θ + sin²θ', '2 sin θ cos θ'],
    answer: 0,
    explanation: 'cos 2θ = cos²θ − sin²θ, and replacing cos²θ with 1 − sin²θ gives 1 − 2sin²θ. 2 sin θ cos θ is sin 2θ.',
  },
  {
    id: 'fs4',
    prompt: 'What is the exact value of sin 75°?',
    options: ['(√6 + √2) / 4', '(√3 + 1) / 2', '√3 / 2 + √2 / 2', '3 / 4'],
    answer: 0,
    explanation: 'sin(45° + 30°) = sin 45° cos 30° + cos 45° sin 30° = (√2/2)(√3/2) + (√2/2)(1/2) = (√6 + √2)/4.',
  },
  {
    id: 'fs5',
    prompt: 'If a + b = 7 and ab = 10, what is a² + b²?',
    options: ['29', '49', '39', '69'],
    answer: 0,
    explanation: 'a² + b² = (a + b)² − 2ab = 49 − 20 = 29. The identity finds it without solving for a and b.',
  },
];

const prose = (
  <>
    <h2>Identities, not equations</h2>
    <p>
      An equation like 2x + 1 = 7 is true for one value of x. An <strong>identity</strong> is true
      for every value you could substitute. (a + b)² = a² + 2ab + b² holds whether a and b are 3 and
      2, −1 and 8, or anything else. That is what makes identities useful: they let you swap one
      form of an expression for another, knowing nothing changes.
    </p>

    <Formula label="The square of a sum" note="Every other square identity is a variation of this one.">
      {String.raw`(a + b)^2 = (a + b)(a + b) = a^2 + ab + ba + b^2 = a^2 + 2ab + b^2`}
    </Formula>

    <Callout label="The most common slip" tone="fail">
      (a + b)² is not a² + b². Put a = 3 and b = 2 into both: 5² = 25, but 3² + 2² = 13. The missing
      12 is exactly the 2ab term, the two rectangles in the picture on the right.
    </Callout>

    <h2>Families worth knowing</h2>
    <p>
      The algebra identities come in two sizes. The <strong>square identities</strong> handle (a ± b)²
      and a² − b². The <strong>cube identities</strong> handle (a ± b)³ and the sum and difference of
      cubes. Past the third power, the binomial theorem takes over and gives every coefficient from
      Pascal’s triangle.
    </p>

    <p>
      Trigonometry builds from a single fact, sin²θ + cos²θ = 1, plus the two{' '}
      <strong>compound angle</strong> formulas for sin(A + B) and cos(A + B). The double angle,
      half angle, product-to-sum and sum-to-product formulas all fall out of those by substitution,
      so if you forget one, you can rebuild it.
    </p>

    <Formula label="Deriving the double angle" note="Set B = A in the compound angle formula.">
      {String.raw`\sin(A + A) = \sin A \cos A + \cos A \sin A \;\Longrightarrow\; \sin 2A = 2 \sin A \cos A`}
    </Formula>

    <WorkedExample
      variant="applied"
      label="Application - squaring in your head"
      problem="Work out 98² without a calculator."
      steps={[
        {
          text: 'Write 98 as a difference from a round number.',
          math: String.raw`98^2 = (100 - 2)^2`,
        },
        {
          text: 'Apply (a − b)² = a² − 2ab + b² with a = 100 and b = 2.',
          math: String.raw`100^2 - 2(100)(2) + 2^2 = 10000 - 400 + 4`,
        },
      ]}
      result="98² = 9604."
      note="The same trick with (a + b)² handles numbers just above a round value: 103² = 10000 + 600 + 9 = 10609."
    />

    <Example label="Where these show up">
      Square identities are how you complete the square and derive the quadratic formula. The
      compound angle formulas are how signal processing adds waves together, and the cosine rule is
      how surveyors and GPS receivers turn measured angles into distances.
    </Example>
  </>
);

function AreaModel({ a, b }) {
  const size = 260;
  const scale = size / (a + b);
  const pa = a * scale;
  const pb = b * scale;
  const pad = 20;

  const cells = [
    { x: 0, y: 0, w: pa, h: pa, label: 'a²', tone: 'var(--accent)' },
    { x: pa, y: 0, w: pb, h: pa, label: 'ab', tone: 'var(--gold)' },
    { x: 0, y: pa, w: pa, h: pb, label: 'ab', tone: 'var(--gold)' },
    { x: pa, y: pa, w: pb, h: pb, label: 'b²', tone: 'var(--blue)' },
  ];

  return (
    <svg
      className="area-model"
      viewBox={`0 0 ${size + pad * 2} ${size + pad * 2}`}
      role="img"
      aria-label={`A square of side ${a + b} split into a squared, two a b rectangles and b squared`}
    >
      <g transform={`translate(${pad} ${pad})`}>
        {cells.map((cell) => (
          <g key={`${cell.x}-${cell.y}`}>
            <rect
              x={cell.x}
              y={cell.y}
              width={cell.w}
              height={cell.h}
              fill={cell.tone}
              fillOpacity="0.22"
              stroke={cell.tone}
              strokeWidth="2"
            />
            {cell.w > 22 && cell.h > 18 ? (
              <text x={cell.x + cell.w / 2} y={cell.y + cell.h / 2} dominantBaseline="middle" textAnchor="middle">
                {cell.label}
              </text>
            ) : null}
          </g>
        ))}
        <text className="area-model-edge" x={pa / 2} y={-6} textAnchor="middle">a</text>
        <text className="area-model-edge" x={pa + pb / 2} y={-6} textAnchor="middle">b</text>
        <text className="area-model-edge" x={-8} y={pa / 2} textAnchor="middle" dominantBaseline="middle">a</text>
        <text className="area-model-edge" x={-8} y={pa + pb / 2} textAnchor="middle" dominantBaseline="middle">b</text>
      </g>
    </svg>
  );
}

function FormulaSheet() {
  const [topicId, setTopicId] = useState('algebra');
  const topic = topics.find((entry) => entry.id === topicId) ?? topics[0];

  return (
    <div className="formula-sheet">
      <div className="fn-picker" role="group" aria-label="Formula topic">
        {topics.map((entry) => (
          <button
            className={`chip ${topicId === entry.id ? 'selected' : ''}`}
            key={entry.id}
            type="button"
            aria-pressed={topicId === entry.id}
            onClick={() => setTopicId(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <FormulaReference key={topic.id} title={`${topic.label} formulas`} groups={topic.groups} />
      <p className="formula-sheet-links">
        More in{' '}
        {topic.lessons.map(([slug, title], index) => (
          <span key={slug}>
            {index > 0 ? ' and ' : ''}
            <a href={`#${slug}`}>{title}</a>
          </span>
        ))}
        .
      </p>
    </div>
  );
}

export default function FormulaSheetLesson({ lessonId }) {
  const [identityId, setIdentityId] = useState(defaults.identityId);
  const [values, setValues] = useState({ a: defaults.a, b: defaults.b, A: defaults.A, B: defaults.B });

  const identity = getIdentity(identityId);
  const args = identity.inputs.map((name) => values[name]);
  const lhs = identity.lhs(...args);
  const rhs = identity.rhs(...args);
  const defined = formatValue(lhs) !== 'undefined' && formatValue(rhs) !== 'undefined';
  const agrees = defined && globalThis.Math.abs(lhs - rhs) < 1e-9 * globalThis.Math.max(1, globalThis.Math.abs(lhs));

  function reset() {
    setIdentityId(defaults.identityId);
    setValues({ a: defaults.a, b: defaults.b, A: defaults.A, B: defaults.B });
  }

  const current = { identityId, ...values };

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaSheet />}
      intro="The identities you reach for again and again: algebraic expansions like (a + b)², the trigonometric identities, and the standard results for logs and geometry, each one checkable with real numbers."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Identity checker</span>
              <h2>Test an identity with numbers</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={current} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Algebra identities">
            {identities
              .filter((entry) => entry.family === 'algebra')
              .map((entry) => (
                <button
                  className={`chip ${identityId === entry.id ? 'selected' : ''}`}
                  key={entry.id}
                  type="button"
                  aria-pressed={identityId === entry.id}
                  onClick={() => setIdentityId(entry.id)}
                >
                  {entry.label}
                </button>
              ))}
          </div>
          <div className="fn-picker" role="group" aria-label="Trigonometric identities">
            {identities
              .filter((entry) => entry.family === 'trig')
              .map((entry) => (
                <button
                  className={`chip ${identityId === entry.id ? 'selected' : ''}`}
                  key={entry.id}
                  type="button"
                  aria-pressed={identityId === entry.id}
                  onClick={() => setIdentityId(entry.id)}
                >
                  {entry.label}
                </button>
              ))}
          </div>

          <div className="factor-card identity-card">
            <span>identity</span>
            <Math display>{identity.latex}</Math>
          </div>

          <dl className="readout">
            <div>
              <dt>left side</dt>
              <dd>{formatValue(lhs)}</dd>
            </div>
            <div>
              <dt>right side</dt>
              <dd>{formatValue(rhs)}</dd>
            </div>
            <div className={agrees ? 'is-close' : ''}>
              <dt>difference</dt>
              <dd>{defined ? formatValue(lhs - rhs) : '—'}</dd>
            </div>
          </dl>

          {identity.id === 'square-sum' ? <AreaModel a={values.a} b={values.b} /> : null}

          <dl className="readout identity-terms">
            {identity.terms(...args).map(([latex, value]) => (
              <div key={latex}>
                <dt>
                  <Math>{latex}</Math>
                </dt>
                <dd>{formatValue(value)}</dd>
              </div>
            ))}
          </dl>

          <div className="controls">
            {identity.inputs.map((name) => {
              const slider = sliders[name];
              return (
                <label className="slider" key={name}>
                  <span className="slider-label">{slider.label}</span>
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={values[name]}
                    onChange={(event) =>
                      setValues((previous) => ({ ...previous, [name]: Number(event.target.value) }))
                    }
                  />
                  <strong className="slider-value">
                    {values[name]}
                    {slider.unit}
                  </strong>
                </label>
              );
            })}

            <div className={`epsilon-strip ${agrees || !defined ? 'is-ok' : 'is-fail'}`}>
              <span className="verdict">{defined ? (agrees ? 'both sides agree' : 'mismatch') : 'undefined here'}</span>
              <p>{identity.note}</p>
            </div>
          </div>

          <p className="plot-hint">
            Pick an identity and move the sliders. The two sides change together and never separate,
            which is what it means for an identity to hold for every value.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
