import { useCallback, useState } from 'react';
import PascalExplorer from './PascalExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import { combinations, factorial, listCombinations, permutations } from '../../lib/discrete.js';
import { combinationFormulas } from '../../lib/formulas.js';
import { AnimalPhotoStory } from '../../stories/discrete.jsx';

const defaults = { n: 5, k: 2 };
const LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

const questions = [
  {
    id: 'q1',
    prompt: 'What distinguishes a permutation from a combination?',
    options: [
      'A permutation counts orderings; a combination counts selections',
      'A permutation allows repetition; a combination does not',
      'A permutation applies only to numbers',
      'They are two names for the same count',
    ],
    answer: 0,
    explanation:
      'Both draw k items from n without repetition. The only difference is whether rearranging the chosen items produces a new outcome.',
  },
  {
    id: 'q2',
    prompt: 'Why is C(n, k) equal to P(n, k) divided by k!?',
    options: [
      'Each selection has been counted once for every way of ordering it',
      'Because k! is always smaller than n!',
      'To cancel the repeated items',
      'It corrects for allowing repetition',
    ],
    answer: 0,
    explanation:
      'The k! orderings of any one selection are all counted separately by the permutation count, so dividing by k! collapses them to one.',
  },
  {
    id: 'q3',
    prompt: 'Why does C(n, k) equal C(n, n − k)?',
    options: [
      'Choosing which k to take is the same as choosing which n − k to leave',
      'Because the numbers happen to coincide',
      'Only when k is less than half of n',
      'Because both equal n!',
    ],
    answer: 0,
    explanation:
      'Every selection determines its complement uniquely, so the two counts pair off exactly. This is why the triangle is symmetric.',
  },
  {
    id: 'q4',
    prompt: 'What does each entry of Pascal\'s triangle equal?',
    options: [
      'The sum of the two entries directly above it',
      'Twice the entry above it',
      'The product of its row and column',
      'The factorial of its position',
    ],
    answer: 0,
    explanation:
      'Selections of k from n either include the last item, leaving k − 1 to choose from n − 1, or exclude it, leaving k to choose. Those two cases are the two entries above.',
  },
];

const prose = (
  <>
    <h2>Order, or no order</h2>
    <p>
      Two questions look alike but count different things. Selecting three people from ten to fill
      the roles of chair, secretary and treasurer is not the same as selecting three to form a
      committee. In the first, swapping two of them produces a different outcome; in the second it
      does not.
    </p>

    <Formula label="Permutations: order matters" note="Each stage has one fewer option than the last.">
      {String.raw`P(n, k) = n(n-1)\cdots(n-k+1) = \frac{n!}{(n-k)!}`}
    </Formula>

    <h2>Removing the ordering</h2>
    <p>
      The permutation count treats each selection once for every way of arranging it, and there are
      k! such arrangements. Dividing by k! collapses them to a single outcome, which gives the number
      of <strong>combinations</strong>.
    </p>

    <Formula label="Combinations: order does not matter" note="Read as n choose k.">
      {String.raw`\binom{n}{k} = \frac{P(n,k)}{k!} = \frac{n!}{k!\,(n-k)!}`}
    </Formula>

    <WorkedExample
      label="Worked example - committee against roles"
      problem="From ten candidates, determine how many ways there are to fill three distinct roles, and how many to form a committee of three."
      steps={[
        {
          text: 'For distinct roles the order matters, so use the permutation count.',
          math: String.raw`P(10, 3) = 10 \times 9 \times 8 = 720`,
        },
        {
          text: 'For a committee the order does not matter. Each committee was counted once per arrangement.',
          math: String.raw`3! = 6 \text{ arrangements of any three people}`,
        },
        {
          text: 'Divide to collapse those arrangements into one outcome each.',
          math: String.raw`\binom{10}{3} = \frac{720}{6} = 120`,
        },
      ]}
      result="720 ways to fill the three roles, but only 120 distinct committees."
      note="The factor of 6 between them is exactly the number of ways to shuffle three chosen people. Deciding whether that shuffling matters is the whole of the problem."
    />

    <h2>Symmetry and Pascal's rule</h2>
    <p>
      Choosing which k items to take is the same decision as choosing which n − k to leave behind, so
      the counts must agree. That is why the triangle in the explorer is symmetric about its centre.
    </p>

    <Formula label="Two identities" note="The second is what builds the triangle row by row.">
      {String.raw`\binom{n}{k} = \binom{n}{n-k}, \qquad \binom{n}{k} = \binom{n-1}{k-1} + \binom{n-1}{k}`}
    </Formula>

    <p>
      The second identity has a direct reading. Fix one particular item: every selection either
      includes it, leaving k − 1 more to pick from the remaining n − 1, or excludes it, leaving k to
      pick from n − 1. No selection does both, so the two cases add. Selecting an entry in the
      explorer highlights the pair above that produce it.
    </p>

    <Callout label="Repetition changes the count" tone="fail">
      Both formulas assume each item is used at most once. Allowing repetition gives different
      answers: n^k for ordered selections, and a larger binomial coefficient for unordered ones.
      Checking whether repetition is permitted, before reaching for a formula, avoids most errors in
      counting problems.
    </Callout>

    <h2>Application: the odds on a lottery</h2>
    <p>
      A draw of six numbers from forty-nine ignores order, so it is a combination. The count is what
      turns an apparently modest choice into astronomical odds, and it is also what makes the size of
      a jackpot calculable.
    </p>

    <WorkedExample
      variant="applied"
      label="Application - chances on a six-from-forty-nine draw"
      problem="A lottery draws six numbers from forty-nine, with order irrelevant. Determine the number of possible tickets and the chance a single ticket wins, then find how many tickets share exactly five of the six numbers."
      steps={[
        {
          text: 'Order does not matter, so this is a combination.',
          math: String.raw`\binom{49}{6} = \frac{49 \times 48 \times 47 \times 46 \times 45 \times 44}{6!}`,
        },
        {
          text: 'Evaluate.',
          math: String.raw`\binom{49}{6} = 13{,}983{,}816`,
        },
        {
          text: 'A single ticket is one of those, so the chance of winning is its reciprocal.',
          math: String.raw`P(\text{jackpot}) = \frac{1}{13{,}983{,}816} \approx 7.15 \times 10^{-8}`,
        },
        {
          text: 'For exactly five matches, choose five of the six drawn numbers and one of the other forty-three.',
          math: String.raw`\binom{6}{5}\binom{43}{1} = 6 \times 43 = 258`,
        },
      ]}
      result="13,983,816 possible tickets, giving a jackpot chance of about 1 in 14 million, while 258 tickets match exactly five numbers."
      note="Buying a ticket every week gives an expected wait of roughly 268,000 years for a jackpot. The near-miss count is 258 times larger, which is why five-match prizes feel common while the jackpot does not."
    />

    <Example label="Where binomial coefficients appear">
      The same numbers count the terms in a binomial expansion, the paths through a grid moving only
      right and down, the ways a fixed number of successes can fall among trials, and the subsets of
      a given size. One count answers all of them because they are the same question in different
      clothing.
    </Example>
  </>
);

export default function CombinationsLesson({ lessonId }) {
  const [n, setN] = useState(defaults.n);
  const [k, setK] = useState(defaults.k);

  const select = useCallback((row, col) => {
    setN(row);
    setK(col);
  }, []);

  const chooseCount = combinations(n, k);
  const orderCount = permutations(n, k);
  const items = LABELS.slice(0, n);
  const listed = n <= 6 ? listCombinations(items, k) : null;

  function reset() {
    setN(defaults.n);
    setK(defaults.k);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      story={<AnimalPhotoStory />}
      quiz={questions}
      reference={<FormulaReference title="Permutations and combinations reference" groups={combinationFormulas} />}
      intro="Selecting k items from n asks one of two different questions, depending on whether rearranging the chosen items counts as a new outcome. The two answers differ by exactly the number of ways to shuffle them."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive triangle</span>
              <h2>Every way to choose</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={{ n, k }} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Presets">
            <button className="chip" type="button" onClick={() => select(5, 2)}>5 choose 2</button>
            <button className="chip" type="button" onClick={() => select(6, 3)}>6 choose 3</button>
            <button className="chip" type="button" onClick={() => select(8, 1)}>8 choose 1</button>
            <button className="chip" type="button" onClick={() => select(8, 4)}>8 choose 4</button>
          </div>

          <PascalExplorer n={n} k={k} onSelect={select} />

          <dl className="readout">
            <div className="is-close">
              <dt>C({n}, {k})</dt>
              <dd>{chooseCount}</dd>
            </div>
            <div>
              <dt>P({n}, {k})</dt>
              <dd>{orderCount}</dd>
            </div>
            <div>
              <dt>{k}!</dt>
              <dd>{factorial(k)}</dd>
            </div>
            <div>
              <dt>C({n}, {n - k})</dt>
              <dd>{combinations(n, n - k)}</dd>
            </div>
          </dl>

          <div className="controls">
            {listed ? (
              <div className="selection-list">
                {listed.length ? (
                  listed.map((group) => (
                    <span className="selection-chip" key={group.join('')}>
                      {group.join('') || '(none)'}
                    </span>
                  ))
                ) : (
                  <span className="selection-chip">no selections possible</span>
                )}
              </div>
            ) : null}

            <div className="epsilon-strip is-ok">
              <span className="verdict">
                {orderCount} ÷ {k}! = {chooseCount}
              </span>
              <p>
                There are {orderCount} ordered arrangements of {k} from {n}, but each selection was
                counted {factorial(k)} times, once per ordering. Dividing leaves {chooseCount}{' '}
                distinct selections
                {n <= 6 ? ', listed above' : ''}.
                {k > 0 && k < n
                  ? ` The entry equals ${combinations(n - 1, k - 1)} + ${combinations(n - 1, k)}, the two highlighted above it.`
                  : ''}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Click any entry in the triangle, or focus one and press Enter. The two entries that add
            to it are highlighted, and for small n every selection is listed underneath.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
