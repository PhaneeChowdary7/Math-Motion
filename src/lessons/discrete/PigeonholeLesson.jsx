import { useState } from 'react';
import PigeonholeExplorer from './PigeonholeExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import { pigeonholeMinimum } from '../../lib/discrete.js';
import { pigeonholeFormulas } from '../../lib/formulas.js';

const defaults = { items: 13, boxes: 12 };

const questions = [
  {
    id: 'g1',
    prompt: 'Thirteen people are in a room. What can be concluded about their birth months?',
    options: [
      'At least two share a birth month',
      'Every month is represented',
      'Exactly two share a month',
      'Nothing can be concluded',
    ],
    answer: 0,
    explanation:
      'Thirteen people and twelve months: if every month held at most one person, that accounts for at most twelve. The thirteenth must double up.',
  },
  {
    id: 'g2',
    prompt: 'What does the principle tell you about which box is overfull?',
    options: [
      'Nothing - it proves existence without identifying one',
      'Always the first box',
      'Always the largest box',
      'The box with the most items initially',
    ],
    answer: 0,
    explanation:
      'This is characteristic of the argument. It establishes that something must exist without any means of locating it, which is often all that is needed.',
  },
  {
    id: 'g3',
    prompt: 'With 30 items in 4 boxes, what is guaranteed?',
    options: [
      'Some box holds at least 8',
      'Some box holds at least 7',
      'Every box holds at least 7',
      'Some box holds exactly 8',
    ],
    answer: 0,
    explanation:
      'Dividing gives 7.5, and the count must be a whole number, so rounding up gives 8. The guarantee is a lower bound on the fullest box, not a statement about every box.',
  },
  {
    id: 'g4',
    prompt: 'Why must the bound use a ceiling rather than plain division?',
    options: [
      'A box holds a whole number of items, so the average must be rounded up',
      'Because division may produce a negative number',
      'To account for empty boxes',
      'Because the items may be identical',
    ],
    answer: 0,
    explanation:
      'If every box held fewer than the ceiling, the total would fall short of the number of items. The ceiling is the smallest count that avoids that contradiction.',
  },
];

const prose = (
  <>
    <h2>A principle that sounds too simple to be useful</h2>
    <p>
      If more items are placed into fewer containers, some container receives more than one. Stated
      that plainly it seems to say nothing. It nonetheless settles questions that resist direct
      attack, because it establishes that something must exist without constructing it.
    </p>

    <Formula label="The pigeonhole principle" note="The bound holds however the items are arranged.">
      {String.raw`n \text{ items into } m \text{ boxes} \;\Longrightarrow\; \text{some box holds at least } \left\lceil \frac{n}{m} \right\rceil`}
    </Formula>

    <p>
      The reasoning is by contradiction. Suppose every box held fewer than the ceiling of n/m. Then
      the total across all boxes would fall short of n, and the items would not all be placed. So at
      least one box must reach that count.
    </p>

    <Callout label="It never tells you which" tone="fail">
      The principle is purely existential. It guarantees that some box is overfull while giving no
      way to identify it, and no way to say by how much beyond the bound. That limitation is also its
      strength: the conclusion holds for every possible arrangement, so no arrangement need be
      examined.
    </Callout>

    <WorkedExample
      label="Worked example - a guaranteed pair"
      problem="A drawer holds socks in three colours, mixed at random in the dark. Determine how many must be drawn to guarantee a matching pair, and how many to guarantee two matching pairs."
      steps={[
        {
          text: 'Treat the colours as the boxes and the drawn socks as the items.',
          math: String.raw`m = 3 \text{ colours}`,
        },
        {
          text: 'Three socks could be one of each. A fourth must repeat a colour.',
          math: String.raw`\left\lceil \tfrac{4}{3} \right\rceil = 2`,
        },
        {
          text: 'For two pairs, find the worst arrangement that still has only one. Three of one colour and one of each other gives a single pair from five socks.',
          math: String.raw`3 + 1 + 1 = 5 \text{ socks, yet only one pair}`,
        },
        {
          text: 'A sixth sock must complete a second pair, whichever colour it is.',
          math: String.raw`6 \text{ socks guarantee two pairs}`,
        },
      ]}
      result="Four socks guarantee one matching pair, and six guarantee two."
      note="The answer is driven by the worst case, not the typical one. Pigeonhole arguments are always about what an adversary could arrange, which is why they give guarantees rather than probabilities."
    />

    <h2>The stronger form</h2>
    <p>
      The bound is not limited to pairs. With enough items relative to boxes, the guarantee scales,
      and this generalised form is what makes the principle useful in practice.
    </p>

    <Formula label="Generalised pigeonhole" note="More items force a proportionally fuller box.">
      {String.raw`n > km \;\Longrightarrow\; \text{some box holds at least } k + 1`}
    </Formula>

    <h2>Application: why lossless compression cannot always win</h2>
    <p>
      A compression scheme must be reversible, so distinct inputs need distinct outputs. Counting the
      available outputs against the inputs shows immediately that no scheme can shorten every file,
      whatever cleverness it employs.
    </p>

    <WorkedExample
      variant="applied"
      label="Application - no compressor shrinks everything"
      problem="Consider a scheme claiming to shorten every file of exactly 10 bits by at least one bit. Determine whether such a scheme can exist."
      steps={[
        {
          text: 'Count the inputs it must handle.',
          math: String.raw`2^{10} = 1024 \text{ distinct files}`,
        },
        {
          text: 'Count the outputs available, which are all strings of 9 bits or fewer.',
          math: String.raw`2^0 + 2^1 + \cdots + 2^9 = 2^{10} - 1 = 1023`,
        },
        {
          text: 'Place the inputs into the outputs as boxes.',
          math: String.raw`\left\lceil \tfrac{1024}{1023} \right\rceil = 2`,
        },
        {
          text: 'Some output is produced by two different inputs, so decompression cannot recover which.',
        },
      ]}
      result="No such scheme exists. Any compressor that shortens some files must lengthen others, because the outputs are strictly fewer than the inputs."
      note="This is why real compressors are tuned for the files people actually store rather than for all possible files. They gain on structured data and lose on random data, and the pigeonhole principle says the trade is unavoidable."
    />

    <Example label="Where the argument is used">
      The same counting establishes that any group of six people contains three mutual acquaintances
      or three mutual strangers, that some pair of Londoners has exactly the same number of hairs, and
      that a hash function must produce collisions. Each is proved without exhibiting a single
      example.
    </Example>
  </>
);

export default function PigeonholeLesson({ lessonId }) {
  const [items, setItems] = useState(defaults.items);
  const [boxes, setBoxes] = useState(defaults.boxes);

  const forced = pigeonholeMinimum(items, boxes);

  function reset() {
    setItems(defaults.items);
    setBoxes(defaults.boxes);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Pigeonhole reference" groups={pigeonholeFormulas} />}
      intro="Put more items into fewer containers and one container must hold several. The statement is almost trivial, yet it settles questions that no direct construction can reach."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive boxes</span>
              <h2>Spread as evenly as possible</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={{ items, boxes }} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Presets">
            <button className="chip" type="button" onClick={() => { setItems(13); setBoxes(12); }}>
              13 people, 12 months
            </button>
            <button className="chip" type="button" onClick={() => { setItems(30); setBoxes(4); }}>
              30 into 4
            </button>
            <button className="chip" type="button" onClick={() => { setItems(5); setBoxes(8); }}>
              Fewer than the boxes
            </button>
          </div>

          <PigeonholeExplorer items={items} boxes={boxes} />

          <dl className="readout">
            <div>
              <dt>items</dt>
              <dd>{items}</dd>
            </div>
            <div>
              <dt>boxes</dt>
              <dd>{boxes}</dd>
            </div>
            <div>
              <dt>n / m</dt>
              <dd>{(items / boxes).toFixed(2)}</dd>
            </div>
            <div className="is-close">
              <dt>guaranteed</dt>
              <dd>{forced}</dd>
            </div>
          </dl>

          <div className="controls">
            {[
              ['Items', items, setItems, 1, 40],
              ['Boxes', boxes, setBoxes, 1, 12],
            ].map(([label, value, setter, min, max]) => (
              <div className="slider" key={label}>
                <label htmlFor={`pigeon-${label}`}>{label}</label>
                <input
                  id={`pigeon-${label}`}
                  type="range"
                  min={min}
                  max={max}
                  step="1"
                  value={value}
                  onChange={(event) => setter(Number(event.target.value))}
                />
                <output>{value}</output>
              </div>
            ))}

            <div className={`epsilon-strip ${forced > 1 ? 'is-ok' : ''}`}>
              <span className="verdict">
                {forced > 1 ? `some box holds ≥ ${forced}` : 'no box is forced'}
              </span>
              <p>
                {forced > 1
                  ? `Even spread as evenly as possible, ${items} items across ${boxes} boxes leaves the fullest holding ${forced}. Since ${boxes} × ${forced - 1} = ${boxes * (forced - 1)} is short of ${items}, no arrangement can keep every box below ${forced}.`
                  : `With ${items} items and ${boxes} boxes there is room for one each, so nothing is forced. The principle only bites once the items outnumber the boxes.`}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            The dots are spread as evenly as the numbers allow, which is the arrangement that keeps
            the fullest box as empty as possible. Any other arrangement makes some box fuller still.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
