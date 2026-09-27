import { memo } from 'react';
import { Compass, Sigma } from 'lucide-react';
import Math from './Math.jsx';

export const Formula = memo(function Formula({ label, note, children }) {
  return (
    <div className="formula">
      {label ? <span>{label}</span> : null}
      <Math display>{children}</Math>
      {note ? <small>{note}</small> : null}
    </div>
  );
});

export const Callout = memo(function Callout({ label, tone = 'ok', children }) {
  return (
    <div className={`verdict-card is-${tone}`}>
      {label ? <span>{label}</span> : null}
      <p>{children}</p>
    </div>
  );
});

export const Example = memo(function Example({ label = 'Real-world example', children }) {
  return (
    <div className="example-card">
      <span>{label}</span>
      <p>{children}</p>
    </div>
  );
});

/**
 * A worked solution: the problem, the steps taken, and the result. `variant`
 * "applied" marks a problem posed in context rather than in pure notation.
 */
export const WorkedExample = memo(function WorkedExample({
  label,
  variant = 'worked',
  problem,
  steps = [],
  result,
  note,
}) {
  const applied = variant === 'applied';
  const heading = label ?? (applied ? 'Application' : 'Worked example');
  const Icon = applied ? Compass : Sigma;

  return (
    <section className={`worked-example is-${variant}`}>
      <header className="worked-example-head">
        <span className="worked-example-mark" aria-hidden="true">
          <Icon size={14} strokeWidth={2.25} />
        </span>
        <span className="worked-example-label">{heading}</span>
      </header>

      <p className="worked-example-problem">{problem}</p>

      <ol className="worked-example-steps">
        {steps.map((step) => (
          <li key={step.text}>
            <p>{step.text}</p>
            {step.math ? <Math display>{step.math}</Math> : null}
          </li>
        ))}
      </ol>

      {result ? (
        <p className="worked-example-result">
          <strong>Result</strong>
          <span>{result}</span>
        </p>
      ) : null}

      {note ? <p className="worked-example-note">{note}</p> : null}
    </section>
  );
});
