import { memo, useMemo, useState } from 'react';
import { Check, Lightbulb, RefreshCw, X } from 'lucide-react';
import Math from './Math.jsx';
import { makeRng } from '../lib/practice.js';

function PracticeSet({ title, generators }) {
  const [round, setRound] = useState(0);
  const [answers, setAnswers] = useState({});
  const [misses, setMisses] = useState({});
  const [solved, setSolved] = useState(0);

  const problem = useMemo(() => {
    const generate = generators[round % generators.length];
    return generate(makeRng(1013 + round * 7919));
  }, [generators, round]);

  const cleared = problem.steps.filter((_, index) => answers[index] !== undefined).length;
  const finished = cleared === problem.steps.length;

  function choose(stepIndex, optionIndex) {
    const step = problem.steps[stepIndex];

    if (optionIndex !== step.answer) {
      setMisses((current) => ({ ...current, [stepIndex]: optionIndex }));
      return;
    }

    setAnswers((current) => {
      const next = { ...current, [stepIndex]: optionIndex };
      if (Object.keys(next).length === problem.steps.length) setSolved((count) => count + 1);
      return next;
    });
  }

  function nextProblem() {
    setRound((current) => current + 1);
    setAnswers({});
    setMisses({});
  }

  return (
    <section className="practice" aria-label="Practice problems">
      <div className="visual-header">
        <div>
          <span className="eyebrow">Practice</span>
          <h2>{title}</h2>
        </div>
        <span className="practice-count">{solved} solved</span>
      </div>

      <p className="practice-prompt">{problem.prompt}</p>

      {problem.expression ? (
        <div className="practice-expression">
          <Math display>{problem.expression}</Math>
        </div>
      ) : null}

      <ol className="practice-steps">
        {problem.steps.map((step, index) => {
          const answered = answers[index] !== undefined;
          const locked = index > cleared;
          const missed = misses[index];

          if (locked) return null;

          return (
            <li className={answered ? 'is-done' : ''} key={step.ask}>
              <p className="practice-ask">
                <span aria-hidden="true">{index + 1}.</span> {step.ask}
              </p>

              <div className="practice-options">
                {step.options.map((option, optionIndex) => {
                  const isAnswer = optionIndex === step.answer;
                  const state = answered
                    ? isAnswer
                      ? 'is-correct'
                      : 'is-dim'
                    : missed === optionIndex
                      ? 'is-wrong'
                      : '';

                  return (
                    <button
                      className={`practice-option ${state}`}
                      disabled={answered}
                      key={optionIndex}
                      type="button"
                      onClick={() => choose(index, optionIndex)}
                    >
                      <Math>{option}</Math>
                      {answered && isAnswer && <Check size={14} strokeWidth={2.75} />}
                      {!answered && missed === optionIndex && <X size={14} strokeWidth={2.75} />}
                    </button>
                  );
                })}
              </div>

              {!answered && missed !== undefined && (
                <p className="practice-hint">
                  <Lightbulb size={14} />
                  {step.hint}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {finished && (
        <div className="practice-solution">
          <strong><Math>{problem.result}</Math></strong>
          {problem.note ? <span>{problem.note}</span> : null}
        </div>
      )}

      <button className="chip is-action practice-next" type="button" onClick={nextProblem}>
        <RefreshCw size={14} />
        New problem
      </button>
    </section>
  );
}

export default memo(PracticeSet);
