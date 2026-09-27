import { useState } from 'react';
import TruthTableExplorer from './TruthTableExplorer.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import { CONNECTIVES, getConnective, truthTable } from '../../lib/discrete.js';
import { logicFormulas } from '../../lib/formulas.js';
import { LampCircuitStory } from '../../stories/discrete.jsx';

const defaults = { connectiveId: 'implies' };

const questions = [
  {
    id: 'l1',
    prompt: 'When is the statement "if A then B" false?',
    options: [
      'Only when A is true and B is false',
      'Whenever A is false',
      'Whenever B is false',
      'Only when both are false',
    ],
    answer: 0,
    explanation:
      'An implication promises something only about the case where A holds. If A never happens, the promise was never tested and is counted as kept.',
  },
  {
    id: 'l2',
    prompt: 'What is the negation of "every swan is white"?',
    options: [
      'Some swan is not white',
      'Every swan is not white',
      'No swan is white',
      'Some swan is white',
    ],
    answer: 0,
    explanation:
      'Negating a universal claim gives an existential one. A single counterexample is enough to refute it, which is why disproof is often far easier than proof.',
  },
  {
    id: 'l3',
    prompt: 'Which statement is logically equivalent to "if A then B"?',
    options: [
      'If not B then not A',
      'If B then A',
      'If not A then not B',
      'A and not B',
    ],
    answer: 0,
    explanation:
      'That is the contrapositive, and it always shares the truth value of the original. Its converse and inverse do not, which is a common source of error.',
  },
  {
    id: 'l4',
    prompt: 'A claim is proved by assuming its negation and deriving a contradiction. What is this?',
    options: [
      'Proof by contradiction',
      'Proof by induction',
      'A counterexample',
      'A tautology',
    ],
    answer: 0,
    explanation:
      'If the negation cannot hold without inconsistency, the original claim must hold. This is how the irrationality of the square root of two is established.',
  },
];

const prose = (
  <>
    <h2>Statements and connectives</h2>
    <p>
      A <strong>statement</strong> is a sentence that is definitely true or definitely false.
      Connectives combine statements into larger ones, and the truth of the whole is fixed entirely
      by the truth of the parts. A table of the possible cases therefore settles the meaning
      completely.
    </p>

    <Formula label="The basic connectives" note="Two statements give four cases, and a table covers them all.">
      {String.raw`\lnot A, \qquad A \land B, \qquad A \lor B, \qquad A \Rightarrow B, \qquad A \Leftrightarrow B`}
    </Formula>

    <h2>Implication is the awkward one</h2>
    <p>
      Everyday use of "if" carries a suggestion of cause, but the logical connective does not. It
      makes a promise only about the case where A holds, so it is counted false in exactly one
      situation: A true and B false. Select the implication in the explorer and note that three of
      the four rows come out true.
    </p>

    <Callout label="Vacuously true is still true" tone="fail">
      "If this number is both even and odd, then the moon is made of cheese" is a true statement,
      because the condition never holds and so the promise is never broken. This is a feature rather
      than a defect: it lets a claim about all members of an empty collection be true without
      exception, which keeps general statements consistent.
    </Callout>

    <h2>Converse, inverse and contrapositive</h2>
    <p>
      From any implication three related statements can be formed, and only one of them always
      agrees with the original.
    </p>

    <Formula label="The three relatives" note="Only the contrapositive is equivalent to the original.">
      {String.raw`\text{converse: } B \Rightarrow A, \qquad \text{inverse: } \lnot A \Rightarrow \lnot B, \qquad \text{contrapositive: } \lnot B \Rightarrow \lnot A`}
    </Formula>

    <WorkedExample
      label="Worked example - checking an equivalence"
      problem="Verify that the contrapositive of an implication always agrees with it, and that the converse does not."
      steps={[
        {
          text: 'The implication is false in exactly one row: A true, B false.',
          math: String.raw`A \Rightarrow B \text{ is false only when } A = T,\; B = F`,
        },
        {
          text: 'The contrapositive is false when its own antecedent holds and consequent fails.',
          math: String.raw`\lnot B \Rightarrow \lnot A \text{ is false only when } \lnot B = T,\; \lnot A = F`,
        },
        {
          text: 'Translate that condition back into A and B.',
          math: String.raw`B = F \text{ and } A = T`,
        },
        {
          text: 'The two are false in the same single row, so they agree everywhere. The converse fails on a different row.',
          math: String.raw`B \Rightarrow A \text{ is false when } A = F,\; B = T`,
        },
      ]}
      result="The contrapositive is equivalent to the original; the converse is a genuinely different claim."
      note="This is why proving the contrapositive is a legitimate proof strategy. It is often easier: showing that a failure of the conclusion forces a failure of the hypothesis can be more direct than arguing forwards."
    />

    <h2>Quantifiers and negation</h2>
    <p>
      Most mathematical statements range over a collection. Negating them exchanges the two
      quantifiers, which is why a single counterexample refutes a universal claim while confirming
      instances never establish one.
    </p>

    <Formula label="Negating a quantifier" note="For all becomes there exists, and the inner statement flips.">
      {String.raw`\lnot \bigl(\forall x\, P(x)\bigr) \equiv \exists x\, \lnot P(x), \qquad \lnot \bigl(\exists x\, P(x)\bigr) \equiv \forall x\, \lnot P(x)`}
    </Formula>

    <h2>Application: reading a specification exactly</h2>
    <p>
      Requirements are written in ordinary language but must be implemented exactly. Translating a
      requirement into a connective, then negating it, produces the precise condition a test must
      look for.
    </p>

    <WorkedExample
      variant="applied"
      label="Application - turning a requirement into a test"
      problem="A system states: every request with a valid token is granted access. Determine what must be observed to demonstrate a violation, and how many test cases the requirement itself constrains."
      steps={[
        {
          text: 'Write the requirement as a quantified implication.',
          math: String.raw`\forall r\; \bigl(\text{valid}(r) \Rightarrow \text{granted}(r)\bigr)`,
        },
        {
          text: 'Negate it. The universal becomes existential and the implication becomes a conjunction.',
          math: String.raw`\exists r\; \bigl(\text{valid}(r) \land \lnot\text{granted}(r)\bigr)`,
        },
        {
          text: 'A single such request refutes the requirement, so that is exactly what a test must hunt for.',
        },
        {
          text: 'Note which cases the requirement does not constrain: it says nothing about invalid tokens.',
          math: String.raw`\lnot\text{valid}(r) \;\Longrightarrow\; \text{the requirement is silent}`,
        },
      ]}
      result="A violation is one request with a valid token that is refused. Requests with invalid tokens cannot violate this requirement at all, whether granted or not."
      note="The last point is the practical one. As written, the specification does not forbid granting access to an invalid token; a separate requirement is needed for that. Negating a specification is the fastest way to find such gaps."
    />

    <Example label="Why the precision earns its keep">
      Access rules, contract terms, database constraints and type systems all rest on statements
      whose exact scope matters. The difference between a statement and its converse is the
      difference between "only staff may enter" and "all staff may enter", and systems have failed on
      exactly that confusion.
    </Example>
  </>
);

export default function LogicLesson({ lessonId }) {
  const [connectiveId, setConnectiveId] = useState(defaults.connectiveId);

  const connective = getConnective(connectiveId);
  const rows = truthTable(connective);
  const trueRows = rows.filter((row) => row.result).length;

  return (
    <LessonLayout
      lessonId={lessonId}
      story={<LampCircuitStory />}
      quiz={questions}
      reference={<FormulaReference title="Logic reference" groups={logicFormulas} />}
      intro="A statement is either true or false, and a connective fixes the truth of a compound entirely from the truth of its parts. Four rows therefore settle the meaning of any two-variable connective completely."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive table</span>
              <h2>Every case, enumerated</h2>
            </div>
            <div className="visual-actions">
              <ResetButton
                values={{ connectiveId }}
                defaults={defaults}
                onReset={() => setConnectiveId(defaults.connectiveId)}
              />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Connectives">
            {CONNECTIVES.map((entry) => (
              <button
                key={entry.id}
                className={`chip ${connectiveId === entry.id ? 'selected' : ''}`}
                type="button"
                onClick={() => setConnectiveId(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <TruthTableExplorer connective={connective} />

          <dl className="readout">
            <div>
              <dt>connective</dt>
              <dd>{connective.label}</dd>
            </div>
            <div>
              <dt>rows</dt>
              <dd>4</dd>
            </div>
            <div className="is-close">
              <dt>true in</dt>
              <dd>{trueRows} of 4</dd>
            </div>
            <div>
              <dt>false in</dt>
              <dd>{4 - trueRows} of 4</dd>
            </div>
          </dl>

          <div className="controls">
            <div className={`epsilon-strip ${connectiveId === 'implies' ? 'is-ok' : ''}`}>
              <span className="verdict">
                {connectiveId === 'implies' ? 'false in one row only' : `${trueRows} of 4 true`}
              </span>
              <p>
                {connectiveId === 'implies'
                  ? 'An implication is broken only when its condition holds and its conclusion fails. The two rows where A is false are true regardless of B, because the promise was never tested.'
                  : connectiveId === 'iff'
                    ? 'Equivalence holds exactly when the two statements agree, which is the two rows on the diagonal.'
                    : connectiveId === 'xor'
                      ? 'Exclusive or is the negation of equivalence: true precisely when the two disagree.'
                      : `This connective is true in ${trueRows} of the four possible cases. Two statements admit exactly four combinations, so the table is a complete definition.`}
              </p>
            </div>
          </div>

          <p className="plot-hint">
            Two statements give four combinations, so the table is not a sample of cases but all of
            them. Compare the implication against its converse by switching the connective.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
