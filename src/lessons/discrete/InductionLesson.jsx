import { useState } from 'react';
import InductionExplorer from './InductionExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import { triangularNumber } from '../../lib/discrete.js';
import { inductionFormulas } from '../../lib/formulas.js';
import { DominoStory } from '../../stories/discrete.jsx';

const defaults = { n: 6, showMirror: true };

const questions = [
  {
    id: 'i1',
    prompt: 'What are the two parts of a proof by induction?',
    options: [
      'A base case, and a step showing each case forces the next',
      'A base case and a counterexample',
      'Two separate base cases',
      'A guess and a check',
    ],
    answer: 0,
    explanation:
      'The base case starts the chain and the inductive step propagates it. Either alone proves nothing.',
  },
  {
    id: 'i2',
    prompt: 'Why is the base case essential?',
    options: [
      'The step only passes truth along; without a true starting point it passes nothing',
      'It makes the algebra simpler',
      'It proves the general formula directly',
      'It is a formality with no real content',
    ],
    answer: 0,
    explanation:
      'The step establishes an implication, not a fact. A chain of implications with no true first link never yields a true conclusion.',
  },
  {
    id: 'i3',
    prompt: 'In the inductive step, what exactly is assumed?',
    options: [
      'That the statement holds for one particular n, in order to derive it for n + 1',
      'That the statement holds for every n',
      'That the statement is false',
      'Nothing is assumed',
    ],
    answer: 0,
    explanation:
      'Assuming the case being proved would be circular. Induction assumes a single case and derives the next, which is a different and legitimate move.',
  },
  {
    id: 'i4',
    prompt: 'What does 1 + 2 + ... + n equal?',
    options: ['n(n + 1)/2', 'n²/2', '2ⁿ − 1', 'n(n − 1)/2'],
    answer: 0,
    explanation:
      'Two copies of the staircase form an n by (n + 1) rectangle, so one copy is half of it. The explorer shows the pairing directly.',
  },
];

const prose = (
  <>
    <h2>Proving infinitely many statements</h2>
    <p>
      A claim such as "1 + 2 + ... + n = n(n+1)/2 for every positive integer n" is not one statement
      but infinitely many. Checking cases can never exhaust them.{' '}
      <strong>Induction</strong> settles them all with two finite pieces of work.
    </p>

    <Formula label="The two obligations" note="The base case starts the chain; the step passes truth along it.">
      {String.raw`P(1) \text{ is true}, \qquad P(k) \Rightarrow P(k+1) \text{ for every } k`}
    </Formula>

    <p>
      Together these give every case. P(1) holds, so the step gives P(2), which gives P(3), and so on
      without end. Any particular n is reached after finitely many applications, which is exactly
      what the claim requires.
    </p>

    <Callout label="Neither half works alone" tone="fail">
      The step establishes an implication, not a fact: it says each case would force the next. With
      no true starting point it never fires, in the way that a row of dominoes correctly spaced but
      never pushed stays standing. A base case without a step is equally useless, verifying one
      instance and no more.
    </Callout>

    <WorkedExample
      label="Worked example - the sum of the first n integers"
      problem="Prove by induction that 1 + 2 + ... + n = n(n + 1)/2 for every positive integer n."
      steps={[
        {
          text: 'Base case: check the claim at n = 1.',
          math: String.raw`1 = \frac{1 \times 2}{2} = 1 \quad \checkmark`,
        },
        {
          text: 'Inductive hypothesis: assume it holds for one particular k.',
          math: String.raw`1 + 2 + \cdots + k = \frac{k(k+1)}{2}`,
        },
        {
          text: 'Add the next term to both sides.',
          math: String.raw`1 + \cdots + k + (k+1) = \frac{k(k+1)}{2} + (k+1)`,
        },
        {
          text: 'Factor out the common term on the right.',
          math: String.raw`= (k+1)\left(\frac{k}{2} + 1\right) = (k+1) \cdot \frac{k+2}{2}`,
        },
        {
          text: 'This is the formula with k + 1 in place of k, which completes the step.',
          math: String.raw`= \frac{(k+1)\bigl((k+1)+1\bigr)}{2}`,
        },
      ]}
      result="The base case holds and the step is established, so the formula holds for every positive integer n."
      note="The explorer shows the same fact without algebra: two copies of the staircase interlock into an n by (n + 1) rectangle, so one copy is half of it."
    />

    <h2>Choosing the right starting point</h2>
    <p>
      The base case need not be n = 1. A claim true only from some point onward is proved by starting
      the chain there, and the conclusion then applies from that point on.
    </p>

    <Formula label="Starting elsewhere" note="The conclusion holds from the base case onward, not before it.">
      {String.raw`P(n_0) \text{ true}, \quad P(k) \Rightarrow P(k+1) \text{ for } k \ge n_0 \;\Longrightarrow\; P(n) \text{ for all } n \ge n_0`}
    </Formula>

    <h2>Application: proving a program terminates</h2>
    <p>
      Induction underwrites reasoning about anything defined step by step, which includes loops and
      recursive procedures. A loop is shown to be correct by finding a property preserved by each
      pass and true before the first.
    </p>

    <WorkedExample
      variant="applied"
      label="Application - a loop invariant"
      problem="A routine sums a list by keeping a running total, adding one element per pass. Show that on finishing it holds the sum of the whole list."
      steps={[
        {
          text: 'State the invariant: the property claimed to hold after each pass.',
          math: String.raw`\text{after } k \text{ passes, total} = \sum_{i=1}^{k} a_i`,
        },
        {
          text: 'Base case: before any pass, no elements have been added.',
          math: String.raw`k = 0 \;\Longrightarrow\; \text{total} = 0 = \sum_{i=1}^{0} a_i \quad \checkmark`,
        },
        {
          text: 'Inductive step: assume it after k passes, then examine pass k + 1, which adds one element.',
          math: String.raw`\text{total} = \sum_{i=1}^{k} a_i + a_{k+1} = \sum_{i=1}^{k+1} a_i`,
        },
        {
          text: 'The invariant survives the pass, so it holds after every pass. Apply it at the end, where k = n.',
          math: String.raw`\text{total} = \sum_{i=1}^{n} a_i`,
        },
      ]}
      result="The routine finishes holding the sum of the entire list, proved for a list of any length without running it once."
      note="Testing can only sample the possible inputs. An invariant argument covers all of them at once, which is why it is the basis of formal verification."
    />

    <Example label="Where induction is doing the work">
      Recursion, the correctness of sorting algorithms, the complexity of divide-and-conquer methods,
      and the well-definedness of anything built in stages all rest on induction. Whenever a
      definition refers to itself, an inductive argument is what makes it legitimate.
    </Example>
  </>
);

export default function InductionLesson({ lessonId }) {
  const [n, setN] = useState(defaults.n);
  const [showMirror, setShowMirror] = useState(defaults.showMirror);

  const sum = triangularNumber(n);
  const rectangle = n * (n + 1);

  function reset() {
    setN(defaults.n);
    setShowMirror(defaults.showMirror);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      story={<DominoStory />}
      quiz={questions}
      reference={<FormulaReference title="Induction reference" groups={inductionFormulas} />}
      intro="A statement about every positive integer is infinitely many statements. Induction proves them all with two finite steps: check the first, then show each case forces the next."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive proof</span>
              <h2>The staircase and its double</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={{ n, showMirror }} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Presets">
            {[3, 6, 10, 14].map((value) => (
              <button
                key={value}
                className={`chip ${n === value ? 'selected' : ''}`}
                type="button"
                onClick={() => setN(value)}
              >
                n = {value}
              </button>
            ))}
          </div>

          <InductionExplorer n={n} showMirror={showMirror} />

          <dl className="readout">
            <div>
              <dt>n</dt>
              <dd>{n}</dd>
            </div>
            <div className="is-close">
              <dt>1 + ... + n</dt>
              <dd>{sum}</dd>
            </div>
            <div>
              <dt>n(n+1)</dt>
              <dd>{rectangle}</dd>
            </div>
            <div>
              <dt>half of it</dt>
              <dd>{rectangle / 2}</dd>
            </div>
          </dl>

          <div className="controls">
            <div className="slider">
              <label htmlFor="induction-n">Steps in the staircase</label>
              <input
                id="induction-n"
                type="range"
                min="1"
                max="14"
                step="1"
                value={n}
                onChange={(event) => setN(Number(event.target.value))}
              />
              <output>{n}</output>
            </div>

            <div className="control-row">
              <button
                className={`chip ${showMirror ? 'selected' : ''}`}
                type="button"
                aria-pressed={showMirror}
                onClick={() => setShowMirror((current) => !current)}
              >
                Show the matching copy
              </button>
            </div>

            <div className="epsilon-strip is-ok">
              <span className="verdict">{sum} = {n} × {n + 1} ÷ 2</span>
              <p>
                {showMirror
                  ? `The staircase and its copy interlock into a rectangle ${n} wide and ${n + 1} tall, holding ${rectangle} blocks. One staircase is exactly half, giving ${sum}.`
                  : `The staircase holds ${sum} blocks. Turn on the matching copy to see the two combine into an ${n} by ${n + 1} rectangle.`}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Raise n and the identity keeps holding, but no amount of raising proves it. The induction
            step is what covers every n at once.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
