import { memo } from 'react';
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
