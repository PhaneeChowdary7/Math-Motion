import { useMemo } from 'react';
import { SIEVE_LIMIT, sieve } from '../../lib/numbers.js';

export default function SieveExplorer({ rounds, selected, onSelect }) {
  const { composite, struckBy, drivers } = useMemo(() => sieve(SIEVE_LIMIT, rounds), [rounds]);
  const active = drivers[drivers.length - 1] ?? null;

  return (
    <div className="sieve" role="group" aria-label={`Numbers 1 to ${SIEVE_LIMIT}`}>
      {Array.from({ length: SIEVE_LIMIT }, (_, index) => {
        const value = index + 1;
        const struck = composite[value];
        const isDriver = drivers.includes(value);
        const justStruck = struckBy[value] === active;

        const classes = ['sieve-cell'];
        if (value === 1) classes.push('is-unit');
        else if (isDriver) classes.push('is-driver');
        else if (struck) classes.push('is-struck');
        else classes.push('is-prime');
        if (justStruck) classes.push('is-latest');
        if (value === selected) classes.push('is-selected');

        return (
          <button
            className={classes.join(' ')}
            key={value}
            type="button"
            aria-pressed={value === selected}
            aria-label={
              value === 1
                ? '1, neither prime nor composite'
                : `${value}, ${struck ? `a multiple of ${struckBy[value]}` : 'prime'}`
            }
            onClick={() => onSelect(value)}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
