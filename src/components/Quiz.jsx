import { memo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Trophy, X } from 'lucide-react';

const RESULTS = 'results';

function Quiz({ questions }) {
  const [answers, setAnswers] = useState({});
  const [active, setActive] = useState(0);

  const answeredCount = Object.keys(answers).length;
  const complete = answeredCount === questions.length;
  const score = questions.filter((entry) => answers[entry.id] === entry.answer).length;

  const showingResults = active === RESULTS;
  const question = showingResults ? null : questions[active];
  const chosen = question ? answers[question.id] : undefined;
  const locked = chosen !== undefined;
  const isLast = !showingResults && active === questions.length - 1;

  function moveTab(direction) {
    const stops = questions.map((_, index) => index);
    if (complete) stops.push(RESULTS);

    const position = stops.indexOf(active);
    const next = stops[Math.min(stops.length - 1, Math.max(0, position + direction))];
    if (next !== undefined) setActive(next);
  }

  function onTabKeyDown(event) {
    if (event.key === 'ArrowRight') moveTab(1);
    else if (event.key === 'ArrowLeft') moveTab(-1);
    else return;

    event.preventDefault();
  }

  return (
    <section className="quiz" aria-labelledby="quiz-heading">
      <div className="quiz-head">
        <h2 id="quiz-heading">Check your understanding</h2>
        <span className="quiz-count">
          {answeredCount} of {questions.length} answered
        </span>
      </div>

      <div className="quiz-tabs" role="tablist" aria-label="Questions" onKeyDown={onTabKeyDown}>
        {questions.map((entry, index) => {
          const answer = answers[entry.id];
          const state =
            answer === undefined ? '' : answer === entry.answer ? 'is-correct' : 'is-wrong';

          return (
            <button
              className={`quiz-tab ${state} ${active === index ? 'is-active' : ''}`}
              key={entry.id}
              role="tab"
              type="button"
              aria-selected={active === index}
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
            >
              <span>{index + 1}</span>
              {answer !== undefined &&
                (answer === entry.answer ? (
                  <Check size={12} strokeWidth={3} />
                ) : (
                  <X size={12} strokeWidth={3} />
                ))}
            </button>
          );
        })}

        <button
          className={`quiz-tab is-results ${showingResults ? 'is-active' : ''}`}
          role="tab"
          type="button"
          disabled={!complete}
          aria-selected={showingResults}
          tabIndex={showingResults ? 0 : -1}
          title={complete ? 'See your results' : 'Answer every question to unlock'}
          onClick={() => setActive(RESULTS)}
        >
          <Trophy size={12} />
          Results
        </button>
      </div>

      <div className="quiz-panel" role="tabpanel">
        {showingResults ? (
          <div className="quiz-results">
            <div className="quiz-score">
              <strong>
                {score} / {questions.length}
              </strong>
              <span>correct</span>
            </div>

            <ul className="quiz-summary">
              {questions.map((entry, index) => {
                const right = answers[entry.id] === entry.answer;

                return (
                  <li key={entry.id}>
                    <button type="button" onClick={() => setActive(index)}>
                      <span className={`quiz-summary-mark ${right ? 'is-correct' : 'is-wrong'}`}>
                        {right ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                      </span>
                      <span className="quiz-summary-text">
                        {index + 1}. {entry.prompt}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <button className="quiz-reset" type="button" onClick={() => { setAnswers({}); setActive(0); }}>
              <RotateCcw size={14} />
              Try again
            </button>
          </div>
        ) : (
          <>
            <p className="quiz-prompt">{question.prompt}</p>

            <div className="quiz-options">
              {question.options.map((option, optionIndex) => {
                const isAnswer = optionIndex === question.answer;
                const isChosen = optionIndex === chosen;
                const state = !locked ? '' : isAnswer ? 'is-correct' : isChosen ? 'is-wrong' : 'is-dim';

                return (
                  <button
                    className={`quiz-option ${state}`}
                    disabled={locked}

                    key={optionIndex}
                    type="button"
                    onClick={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                  >
                    <span>{option}</span>
                    {locked && isAnswer && <Check size={15} strokeWidth={2.75} />}
                    {locked && isChosen && !isAnswer && <X size={15} strokeWidth={2.75} />}
                  </button>
                );
              })}
            </div>

            {locked && (
              <p className="quiz-explain">
                <strong>{chosen === question.answer ? 'Correct.' : 'Not quite.'}</strong>{' '}
                {question.explanation}
              </p>
            )}
          </>
        )}
      </div>

      <div className="quiz-foot">
        <button
          className="quiz-step"
          type="button"
          disabled={active === 0}
          onClick={() => moveTab(-1)}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {complete && !showingResults ? (
          <button className="quiz-step is-primary" type="button" onClick={() => setActive(RESULTS)}>
            See results
            <Trophy size={14} />
          </button>
        ) : (
          <button
            className="quiz-step"
            type="button"
            disabled={showingResults || isLast}
            onClick={() => moveTab(1)}
          >
            Next
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </section>
  );
}

export default memo(Quiz);
