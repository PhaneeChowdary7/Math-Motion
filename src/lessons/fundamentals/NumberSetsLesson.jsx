import { useState } from 'react';
import SieveExplorer from './SieveExplorer.jsx';
import FormulaReference from '../../components/FormulaReference.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import Math from '../../components/Math.jsx';
import { numberFormulas } from '../../lib/formulas.js';
import { divisorsOf, factorLatex, isPrime, primeFactors, sieve } from '../../lib/numbers.js';

const defaults = { rounds: 1, selected: 12 };

const questions = [
  {
    id: 'n1',
    prompt: 'Why is 1 not counted as a prime?',
    options: [
      'A prime must have exactly two distinct divisors, and 1 has only one',
      'Because 1 is too small',
      'Because 1 is odd',
      'It is prime, by an older convention',
    ],
    answer: 0,
    explanation: 'Excluding 1 is what makes prime factorisation unique. If 1 were prime, 6 could be written as 2 × 3, or 1 × 2 × 3, endlessly.',
  },
  {
    id: 'n2',
    prompt: 'Testing whether 97 is prime, how far do you have to divide?',
    options: ['Up to √97, so up to 9', 'Up to 96', 'Up to 97/2', 'Up to 97'],
    answer: 0,
    explanation: 'A factor above √n forces a partner below it, so if nothing below √n divides n, nothing above it will either.',
  },
  {
    id: 'n3',
    prompt: 'Which set does −4 belong to?',
    options: [
      'Integers and rationals, but not naturals',
      'Naturals only',
      'Irrationals',
      'Rationals only',
    ],
    answer: 0,
    explanation: 'The sets nest. Every integer is rational, but the naturals start at 1 and never go negative.',
  },
  {
    id: 'n4',
    prompt: 'The sieve crosses out multiples of 3 starting at 9, not 6. Why?',
    options: [
      'Every smaller multiple of 3 was already struck by a smaller prime',
      'Because 6 is even',
      'It is an arbitrary choice',
      'Because 9 is 3 squared and squares are special',
    ],
    answer: 0,
    explanation: '6 went when the multiples of 2 were struck. In general the first new multiple of p is p², which is why the sieve can stop once p² passes the limit.',
  },
];

const prose = (
  <>
    <h2>The number sets</h2>
    <p>
      Counting comes first: 1, 2, 3, and onwards. Those are the <strong>natural numbers</strong>.
      Allow zero and the negatives and you have the <strong>integers</strong>. Allow one integer
      divided by another and you have the <strong>rationals</strong>, which include every fraction
      and every terminating or repeating decimal.
    </p>

    <p>
      What is left over is the surprise. The square root of 2 cannot be written as a fraction, and
      neither can π. These are the <strong>irrationals</strong>, and together with the rationals they
      make up the <strong>real numbers</strong>, one for every point on the number line. Each set
      sits inside the next, so a natural number is also an integer, also a rational, also a real.
    </p>

    <Formula label="Nested sets" note="Each set contains the one before it.">
      {String.raw`\mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R}`}
    </Formula>

    <h2>Primes as building blocks</h2>
    <p>
      A <strong>prime</strong> is a whole number above 1 whose only divisors are 1 and itself. 7 is
      prime; 8 is not, because 2 and 4 divide it. Numbers that are not prime are called{' '}
      <strong>composite</strong>, and every one of them breaks apart into primes.
    </p>

    <p>
      That breaking apart is unique. 360 is 2³ × 3² × 5, and there is no other way to write it as a
      product of primes. This is the Fundamental Theorem of Arithmetic, and it is why primes are
      described as the atoms of the whole numbers: they cannot be split further, and everything else
      is built from them.
    </p>

    <Callout label="Why 1 is excluded" tone="fail">
      A prime needs exactly two distinct divisors, and 1 has only one. Admitting it would destroy
      uniqueness, since 6 could then be 2 × 3, or 1 × 2 × 3, or 1 × 1 × 2 × 3, without end. The
      exclusion is a choice that keeps the theorem clean.
    </Callout>

    <h2>Finding primes by elimination</h2>
    <p>
      The sieve on the right does not test numbers one at a time. It takes the smallest number not
      yet crossed out, declares it prime, strikes out every multiple of it, and repeats. What remains
      standing at the end is the complete list of primes below the limit.
    </p>

    <p>
      Two economies make it fast. Striking multiples of p can start at p² rather than 2p, because
      every smaller multiple already carries a smaller prime factor. And the whole process can stop
      once p² passes the limit, since anything still standing has no factor small enough to have
      caught it. For 100 that means the work is finished after 2, 3, 5 and 7.
    </p>

    <Formula label="Trial division" note="A divisor above the square root forces a partner below it.">
      {String.raw`n = a \times b, \quad a \le b \;\Longrightarrow\; a \le \sqrt{n}`}
    </Formula>

    <Example label="Applications">
      Prime factorisation is how fractions get reduced and how least common denominators are found.
      It also underpins public-key cryptography, where multiplying two large primes is easy and
      recovering them from the product is not.
    </Example>
  </>
);

export default function NumberSetsLesson({ lessonId }) {
  const [rounds, setRounds] = useState(defaults.rounds);
  const [selected, setSelected] = useState(defaults.selected);

  const { drivers } = sieve(100, rounds);
  const factors = primeFactors(selected);
  const divisors = divisorsOf(selected);
  const prime = isPrime(selected);

  function reset() {
    setRounds(defaults.rounds);
    setSelected(defaults.selected);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Number reference" groups={numberFormulas} />}
      intro="The whole numbers split into primes, which have no factors, and composites, which are built from primes in exactly one way. Everything above them nests outwards to the reals."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive sieve</span>
              <h2>The Sieve of Eratosthenes</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={{ rounds, selected }} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Sieve progress">
            {[1, 2, 3, 4].map((step) => (
              <button
                className={`chip ${rounds === step ? 'selected' : ''}`}
                key={step}
                type="button"
                aria-pressed={rounds === step}
                onClick={() => setRounds(step)}
              >
                {step === 1 ? 'Strike 2' : `Through ${[2, 3, 5, 7][step - 1]}`}
              </button>
            ))}
          </div>

          <SieveExplorer rounds={rounds} selected={selected} onSelect={setSelected} />

          <dl className="readout">
            <div>
              <dt>primes struck by</dt>
              <dd>{drivers.join(', ')}</dd>
            </div>
            <div>
              <dt>selected</dt>
              <dd>{selected}</dd>
            </div>
            <div className={prime ? 'is-close' : ''}>
              <dt>divisors</dt>
              <dd>{divisors.length}</dd>
            </div>
          </dl>

          <div className="factor-card">
            <span>factorisation</span>
            {selected === 1 ? (
              <p>1 is a unit: neither prime nor composite, and it has no prime factorisation.</p>
            ) : (
              <Math display>{`${selected} = ${factorLatex(selected)}`}</Math>
            )}
            <p>
              Divisors: {divisors.join(', ')}
              {factors.length === 1 && factors[0][1] === 1 ? ' - only two, so it is prime.' : ''}
            </p>
          </div>

          <div className={`epsilon-strip ${prime ? 'is-ok' : 'is-fail'}`}>
            <span className="verdict">{selected === 1 ? 'neither' : prime ? 'prime' : 'composite'}</span>
            <p>
              {selected === 1
                ? '1 divides everything and is divided only by itself, which is why it sits outside the classification.'
                : prime
                  ? 'Nothing below its square root divides it, so it survived every round of the sieve.'
                  : `It was struck out as a multiple of ${factors[0][0]}, so it cannot be prime.`}
            </p>
          </div>

          <p className="plot-hint">
            Step the sieve forward to watch each prime clear its multiples, then tap any number to
            see how it breaks apart.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}
