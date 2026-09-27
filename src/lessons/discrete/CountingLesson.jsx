import { useState } from 'react';
import TreeExplorer from './TreeExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import { countingFormulas } from '../../lib/formulas.js';
import { BusRoutesStory } from '../../stories/discrete.jsx';

const defaults = { a: 3, b: 2, c: 2 };

const questions = [
  {
    id: 'k1',
    prompt: 'A meal has 4 starters, 6 mains and 3 desserts. How many three-course meals are possible?',
    options: ['72', '13', '18', '24'],
    answer: 0,
    explanation:
      'The choices are made in sequence and each is free of the others, so the counts multiply: 4 × 6 × 3 = 72.',
  },
  {
    id: 'k2',
    prompt: 'When do you add counts rather than multiply them?',
    options: [
      'When choosing one option from separate alternatives, not one from each stage',
      'Whenever there are more than two stages',
      'When the options are identical',
      'Addition is never correct in counting',
    ],
    answer: 0,
    explanation:
      'Multiplication is for making every choice in turn; addition is for picking a single option from disjoint groups. Deciding which applies is the whole difficulty.',
  },
  {
    id: 'k3',
    prompt: 'A 4-digit PIN allows repeated digits. How many are there?',
    options: ['10,000', '5,040', '4,096', '40'],
    answer: 0,
    explanation:
      'Each of the four positions has all ten digits available, so the count is 10⁴ = 10,000. Repetition keeps every stage at full size.',
  },
  {
    id: 'k4',
    prompt: 'Why does forbidding repetition reduce the count at each stage?',
    options: [
      'Every item already used is unavailable, so the next stage has one fewer option',
      'The stages become dependent on the order chosen',
      'Some outcomes become impossible to reach',
      'The multiplication rule no longer applies',
    ],
    answer: 0,
    explanation:
      'The rule still applies; only the stage sizes change, running 10, 9, 8, 7 rather than 10, 10, 10, 10.',
  },
];

const prose = (
  <>
    <h2>Counting by stages</h2>
    <p>
      Most counting problems resolve into a sequence of decisions. If the first can be made in{' '}
      <em>a</em> ways and the second in <em>b</em> ways regardless of the first, then together they
      can be made in <em>ab</em> ways. The tree in the explorer shows why: each of the first branches
      subdivides into <em>b</em> further branches.
    </p>

    <Formula label="The multiplication principle" note="Applies when each stage has the same number of options whatever came before.">
      {String.raw`N = n_1 \times n_2 \times \cdots \times n_k`}
    </Formula>

    <p>
      Every path from the root of the tree to a leaf is exactly one outcome, and no outcome is
      reachable by two different paths. Counting the leaves therefore counts the possibilities, which
      is what the product computes without drawing anything.
    </p>

    <h2>Adding rather than multiplying</h2>
    <p>
      Multiplication answers "one from each stage". A different question, "one from these{' '}
      <strong>or</strong> one from those", calls for addition instead, provided the groups do not
      overlap.
    </p>

    <Formula label="The addition principle" note="Valid only when no item belongs to both groups.">
      {String.raw`|A \cup B| = |A| + |B| \quad \text{when } A \cap B = \varnothing`}
    </Formula>

    <Callout label="The usual mistake" tone="fail">
      Choosing a starter and a main is a product; choosing a single dish from the starters or the
      mains is a sum. Reading the word "and" as multiply and "or" as add is a reliable guide only
      while the groups are genuinely disjoint. Where they overlap, the shared items would be counted
      twice and must be subtracted, exactly as in the addition rule for probability.
    </Callout>

    <h2>With and without repetition</h2>
    <p>
      When an item can be reused, every stage keeps its full set of options. When it cannot, each
      stage has one fewer than the last. The multiplication principle is unchanged; only the numbers
      going into it differ.
    </p>

    <Formula label="Sequences of length k from n items" note="The second form is the permutation count of the next lesson.">
      {String.raw`\text{with repetition: } n^k, \qquad \text{without: } n(n-1)\cdots(n-k+1)`}
    </Formula>

    <WorkedExample
      label="Worked example - counting number plates"
      problem="A plate has two letters from the 26-letter alphabet followed by three digits. Determine how many plates exist if characters may repeat, and how many if no character may repeat within its own group."
      steps={[
        {
          text: 'With repetition, each position is independent and keeps its full set.',
          math: String.raw`26 \times 26 \times 10 \times 10 \times 10 = 676{,}000`,
        },
        {
          text: 'Without repetition, each stage loses one option from its own group.',
          math: String.raw`26 \times 25 \times 10 \times 9 \times 8`,
        },
        {
          text: 'Evaluate the second product.',
          math: String.raw`650 \times 720 = 468{,}000`,
        },
      ]}
      result="676,000 plates allowing repeats, and 468,000 without, a reduction of about 31%."
      note="The letters and digits are counted separately because a letter can never clash with a digit. Grouping independent constraints is what keeps such problems manageable."
    />

    <h2>Application: how long a password holds out</h2>
    <p>
      The multiplication principle sets the size of the space an attacker must search. Because each
      additional character multiplies rather than adds, length raises the count far faster than
      widening the alphabet does, which is the whole argument for passphrases.
    </p>

    <WorkedExample
      variant="applied"
      label="Application - length against alphabet size"
      problem="An attacker tries 10 billion guesses per second. Compare an 8-character password drawn from 94 printable characters with a 12-character password using only the 26 lowercase letters."
      steps={[
        {
          text: 'Count the first space. Each of the eight positions is free.',
          math: String.raw`94^8 \approx 6.10 \times 10^{15}`,
        },
        {
          text: 'Divide by the guess rate to obtain the time for an exhaustive search.',
          math: String.raw`\frac{6.10 \times 10^{15}}{10^{10}} \approx 6.1 \times 10^{5}\text{ s} \approx 7 \text{ days}`,
        },
        {
          text: 'Count the second space.',
          math: String.raw`26^{12} \approx 9.54 \times 10^{16}`,
        },
        {
          text: 'Convert to time in the same way.',
          math: String.raw`\frac{9.54 \times 10^{16}}{10^{10}} \approx 9.5 \times 10^{6}\text{ s} \approx 110 \text{ days}`,
        },
      ]}
      result="The longer all-lowercase password survives about 110 days against roughly 7 for the shorter complex one, despite using a far smaller alphabet."
      note="Each extra character multiplies the space by the alphabet size, so length compounds while complexity only scales the base. This arithmetic is why modern guidance favours length over character-class rules."
    />

    <Example label="Where the product rule sets the scale">
      The size of a key space, the number of routes through a network, the count of possible test
      configurations and the branching factor of a game tree are all products of stage sizes.
      Whenever a quantity grows unmanageably fast, a multiplication principle is usually behind it.
    </Example>
  </>
);

export default function CountingLesson({ lessonId }) {
  const [a, setA] = useState(defaults.a);
  const [b, setB] = useState(defaults.b);
  const [c, setC] = useState(defaults.c);

  const stages = [a, b, c].filter((count) => count > 0);
  const total = stages.reduce((product, count) => product * count, 1);

  function reset() {
    setA(defaults.a);
    setB(defaults.b);
    setC(defaults.c);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      story={<BusRoutesStory />}
      quiz={questions}
      reference={<FormulaReference title="Counting reference" groups={countingFormulas} />}
      intro="Most counting problems are a sequence of decisions. When each stage offers the same number of options whatever came before, the counts multiply, and the total grows far faster than intuition suggests."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive tree</span>
              <h2>Choices multiplying</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={{ a, b, c }} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Presets">
            <button className="chip" type="button" onClick={() => { setA(3); setB(2); setC(2); }}>
              Three stages
            </button>
            <button className="chip" type="button" onClick={() => { setA(4); setB(3); setC(1); }}>
              Two stages
            </button>
            <button className="chip" type="button" onClick={() => { setA(2); setB(2); setC(2); }}>
              Binary choices
            </button>
          </div>

          <TreeExplorer stages={stages} />

          <dl className="readout">
            <div>
              <dt>stage 1</dt>
              <dd>{a}</dd>
            </div>
            <div>
              <dt>stage 2</dt>
              <dd>{b}</dd>
            </div>
            <div>
              <dt>stage 3</dt>
              <dd>{c}</dd>
            </div>
            <div className="is-close">
              <dt>outcomes</dt>
              <dd>{total}</dd>
            </div>
          </dl>

          <div className="controls">
            {[
              ['Options at stage 1', a, setA],
              ['Options at stage 2', b, setB],
              ['Options at stage 3', c, setC],
            ].map(([label, value, setter]) => (
              <div className="slider" key={label}>
                <label htmlFor={`stage-${label}`}>{label}</label>
                <input
                  id={`stage-${label}`}
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={value}
                  onChange={(event) => setter(Number(event.target.value))}
                />
                <output>{value}</output>
              </div>
            ))}

            <div className="epsilon-strip is-ok">
              <span className="verdict">{a} × {b} × {c} = {total}</span>
              <p>
                The tree has {total} leaves, one for each way of making all three choices. Adding one
                option to the first stage adds {b * c} outcomes, not one, because everything after it
                repeats for the new branch.
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Each level of the tree is one decision, and each path from top to bottom is one complete
            outcome. Raise any stage and watch the width of the bottom row multiply.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
