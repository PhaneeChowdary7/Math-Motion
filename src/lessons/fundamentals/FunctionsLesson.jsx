import { useState } from 'react';
import FunctionExplorer from './FunctionExplorer.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { functionFormulas } from '../../lib/formulas.js';
import { basicFunctions, getBasicFunction } from '../../lib/basicFunctions.js';

const defaults = { fnId: 'quadratic', probe: 1.5, showTest: true };

const questions = [
  {
    id: 'f1',
    prompt: 'What makes a rule a function?',
    options: [
      'Every allowed input has exactly one output',
      'Every output comes from exactly one input',
      'The graph is a straight line',
      'It can be written with an equation',
    ],
    answer: 0,
    explanation: 'One input may never lead to two answers. The reverse is allowed: a parabola sends two inputs to the same output and is still a function.',
  },
  {
    id: 'f2',
    prompt: 'What does the vertical line test detect?',
    options: [
      'An input with more than one output',
      'Whether the function is increasing',
      'Whether the graph is symmetric',
      'The range of the function',
    ],
    answer: 0,
    explanation: 'A vertical line fixes one x. If it meets the curve twice, that single input has two outputs and the rule is not a function.',
  },
  {
    id: 'f3',
    prompt: 'What is the domain of f(x) = 1/x?',
    options: [
      'Every real number except 0',
      'Every real number',
      'Only positive numbers',
      'Only integers',
    ],
    answer: 0,
    explanation: 'Division by zero has no value, so 0 is thrown out of the domain. The graph shows this as a vertical asymptote.',
  },
  {
    id: 'f4',
    prompt: 'A graph is unchanged when reflected in the y-axis. What is it?',
    options: ['Even', 'Odd', 'Linear', 'Invertible'],
    answer: 0,
    explanation: 'Even means f(−x) = f(x). Odd means f(−x) = −f(x), which shows up as rotational symmetry about the origin instead.',
  },
];

const prose = (
  <>
    <h2>The definition</h2>
    <p>
      A <strong>function</strong> is a rule that assigns to each allowed input exactly one output.
      That word exactly is doing the work. A rule that answers 4 sometimes and −4 other times for the
      same input is not a function, because it cannot be relied on to give an answer at all.
    </p>

    <p>
      The reverse causes no trouble. Two different inputs may perfectly well share an output: squaring
      sends both 2 and −2 to 4, and it is still a function. The restriction runs one way only.
    </p>

    <Formula label="Notation" note="Read f(x) as the output f assigns to the input x.">
      {String.raw`f : X \to Y, \qquad x \mapsto f(x)`}
    </Formula>

    <h2>Domain and range</h2>
    <p>
      The <strong>domain</strong> is the set of inputs the rule is allowed to take. The{' '}
      <strong>range</strong> is the set of outputs it actually produces. Neither is decoration:
      1/x has no value at 0, and √x has none for negative inputs, so those inputs are simply not part
      of the domain.
    </p>

    <p>
      The range is often the harder of the two. Squaring accepts every real number but never returns
      a negative one, so its range stops at 0 even though its domain does not stop anywhere.
    </p>

    <h2>The vertical line test</h2>
    <p>
      Because a function gives one output per input, no vertical line can ever cross its graph more
      than once. A vertical line fixes a single x, so two crossings would mean two outputs for that
      input. Sweep the line across the graph on the right and watch where curves pass or fail.
    </p>

    <Callout label="A circle is not a function" tone="fail">
      The equation x² + y² = 25 fails immediately: at x = 3 the y values are 4 and −4. It is a
      perfectly good curve, just not the graph of a function of x. Splitting it into an upper and a
      lower half repairs this, which is exactly what the implicit differentiation lesson does later.
    </Callout>

    <h2>Symmetry</h2>
    <p>
      Two symmetries are worth spotting on sight. A function is <strong>even</strong> when f(−x) =
      f(x), so its graph is a mirror image in the y-axis. It is <strong>odd</strong> when f(−x) =
      −f(x), which turns the graph into a half-turn rotation about the origin. Squaring is even,
      cubing is odd, and most functions are neither.
    </p>

    <Example label="Applications">
      Every relationship in the later chapters is a function: position against time, cost against
      quantity, temperature against depth. Knowing the domain is what stops an answer being quoted
      where the rule was never defined.
    </Example>
  </>
);

export default function FunctionsLesson({ lessonId }) {
  const [fnId, setFnId] = useState(defaults.fnId);
  const [probe, setProbe] = useState(defaults.probe);
  const [showTest, setShowTest] = useState(defaults.showTest);

  const fn = getBasicFunction(fnId);
  const defined = !fn.excludes?.(probe);
  const value = defined ? fn.f(probe) : null;

  function reset() {
    setFnId(defaults.fnId);
    setProbe(defaults.probe);
    setShowTest(defaults.showTest);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Function reference" groups={functionFormulas} />}
      intro="A function gives exactly one output for each allowed input. The domain records which inputs are allowed, the range records which outputs appear, and the vertical line test checks the whole idea at a glance."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive plot</span>
              <h2>{fn.label}</h2>
            </div>
            <div className="visual-actions">
              <ResetButton
                values={{ fnId, probe, showTest }}
                defaults={defaults}
                onReset={reset}
              />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Function">
            {basicFunctions.map((entry) => (
              <button
                className={`chip ${entry.id === fnId ? 'selected' : ''}`}
                key={entry.id}
                type="button"
                aria-pressed={entry.id === fnId}
                onClick={() => setFnId(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <Formula label="Rule" note={fn.note}>
            {fn.expression}
          </Formula>

          <dl className="readout">
            <div>
              <dt>x</dt>
              <dd>{probe.toFixed(2)}</dd>
            </div>
            <div className="is-close">
              <dt>f(x)</dt>
              <dd>{value === null ? 'undefined' : value.toFixed(2)}</dd>
            </div>
            <div>
              <dt>domain</dt>
              <dd>{fn.domainNote}</dd>
            </div>
            <div>
              <dt>range</dt>
              <dd>{fn.rangeNote}</dd>
            </div>
          </dl>

          <FunctionExplorer fn={fn} probe={probe} showTest={showTest} onChange={setProbe} />

          <div className="controls">
            <label className="slider">
              <span className="slider-label">Move x</span>
              <input
                type="range"
                min={-4.6}
                max={4.6}
                step="0.01"
                value={probe}
                onChange={(event) => setProbe(Number(event.target.value))}
              />
              <strong className="slider-value">{probe.toFixed(2)}</strong>
            </label>

            <div className="control-row">
              <button
                className={`chip ${showTest ? 'selected' : ''}`}
                type="button"
                aria-pressed={showTest}
                onClick={() => setShowTest((current) => !current)}
              >
                Vertical line test
              </button>
            </div>

            <div className={`epsilon-strip ${defined ? 'is-ok' : 'is-fail'}`}>
              <span className="verdict">{defined ? 'one output' : 'outside the domain'}</span>
              <p>{defined ? fn.note : `This input is not allowed here: the domain is ${fn.domainNote}.`}</p>
            </div>
          </div>

          <p className="plot-hint">
            The sweeping line meets every curve at most once, which is what makes each of these a
            function. Drag the handle along the bottom to move the input.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
