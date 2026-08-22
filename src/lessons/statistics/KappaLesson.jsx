import { useState } from 'react';
import FormulaReference from '../../components/FormulaReference.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import ResetButton from '../../components/ResetButton.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { kappaFormulas } from '../../lib/formulas.js';

const defaults = {
  bothPositive: 42,
  raterOnePositive: 8,
  raterTwoPositive: 12,
  bothNegative: 38,
};

const presets = [
  { id: 'balanced', label: 'Balanced ratings', cells: defaults },
  {
    id: 'paradox',
    label: 'Prevalence paradox',
    cells: { bothPositive: 0, raterOnePositive: 5, raterTwoPositive: 5, bothNegative: 90 },
  },
];

const questions = [
  {
    id: 'k1',
    prompt: 'What does Cohen’s kappa measure?',
    options: ['Agreement beyond chance', 'The number of categories', 'The sample mean', 'Rater speed'],
    answer: 0,
    explanation: 'Kappa adjusts observed agreement using the agreement expected from the raters’ category proportions.',
  },
  {
    id: 'k2',
    prompt: 'In a 2 × 2 agreement table, what is pₒ?',
    options: ['Expected agreement', 'Observed agreement', 'The row total', 'The sample size'],
    answer: 1,
    explanation: 'Observed agreement is the proportion on the diagonal divided by the total number of cases.',
  },
  {
    id: 'k3',
    prompt: 'If κ = 0, what does the result indicate?',
    options: ['Perfect agreement', 'Agreement is no better than chance', 'The data are invalid', 'The raters disagree on every case'],
    answer: 1,
    explanation: 'A kappa of zero means the observed agreement matches the agreement expected from the raters’ category usage.',
  },
  {
    id: 'k4',
    prompt: 'Two raters agree on 95% of cases but κ is near zero. What happened?',
    options: [
      'One category dominates, so chance agreement is already about 95%',
      'The raters made an arithmetic error',
      'Kappa is only valid above 100 cases',
      'The scale should have been ordinal',
    ],
    answer: 0,
    explanation: 'This is the prevalence paradox. When almost every case falls in one category, pₑ is high and the room left above chance is tiny.',
  },
];

function calculateKappa(cells) {
  const { bothPositive, raterOnePositive, raterTwoPositive, bothNegative } = cells;
  const total = bothPositive + raterOnePositive + raterTwoPositive + bothNegative;

  if (total === 0) return { total: 0, observed: 0, expected: 0, kappa: 0, empty: true };

  const rowPositive = bothPositive + raterOnePositive;
  const rowNegative = raterTwoPositive + bothNegative;
  const columnPositive = bothPositive + raterTwoPositive;
  const columnNegative = raterOnePositive + bothNegative;
  const observed = (bothPositive + bothNegative) / total;
  const expected = (rowPositive * columnPositive + rowNegative * columnNegative) / (total * total);
  const kappa = expected === 1 ? 1 : (observed - expected) / (1 - expected);

  return { total, observed, expected, kappa };
}

function interpretation(kappa, empty = false) {
  if (empty) return { label: 'Add some cases', tone: 'fail' };
  if (kappa < 0) return { label: 'Less than chance', tone: 'fail' };
  if (kappa < 0.4) return { label: 'Weak agreement', tone: 'fail' };
  if (kappa < 0.6) return { label: 'Moderate agreement', tone: 'ok' };
  if (kappa < 0.8) return { label: 'Substantial agreement', tone: 'ok' };
  return { label: 'Near-perfect agreement', tone: 'ok' };
}

const methods = [
  {
    id: 'cohen',
    label: 'Cohen’s',
    title: 'Cohen’s Kappa',
    use: '2 raters, nominal categories',
    example:
      'Two teachers independently mark 100 student answers as Correct or Incorrect. Kappa measures how consistently they agree once luck is discounted.',
  },
  {
    id: 'linear',
    label: 'Linear-weighted',
    title: 'Linear-weighted Kappa',
    use: 'Ordinal; penalty grows evenly with distance',
    example:
      'Two reviewers rate films from 1 to 5 stars. A 2 against a 3 is one step apart, and a 2 against a 4 counts as exactly twice that disagreement.',
  },
  {
    id: 'quadratic',
    label: 'Quadratic-weighted',
    title: 'Quadratic-weighted Kappa',
    use: 'Ordinal; large gaps punished hardest',
    example:
      'Two teachers grade essays from 1 to 5. A 2 against a 3 barely registers, while a 2 against a 5 is penalised far more because the weight squares the distance.',
  },
  {
    id: 'fleiss',
    label: 'Fleiss’',
    title: 'Fleiss’ Kappa',
    use: 'More than 2 raters, nominal categories',
    example:
      'Three doctors classify each patient as Healthy or Not healthy. Fleiss’ kappa asks how consistently the whole group agrees, case by case.',
  },
  {
    id: 'light',
    label: 'Light’s',
    title: 'Light’s Kappa',
    use: 'Multiple raters, averaged pairwise',
    example:
      'Three teachers classify essays as Poor, Average, or Good. Cohen’s kappa is computed for A–B, A–C, and B–C, and the three results are averaged.',
  },
  {
    id: 'conger',
    label: 'Conger’s',
    title: 'Conger’s Kappa',
    use: 'Multiple raters with different habits',
    example:
      'Three reviewers call films Good 90%, 60%, and 40% of the time. Conger’s chance term keeps each rater’s own tendency instead of pooling them.',
  },
  {
    id: 'prevalence',
    label: 'Prevalence & bias',
    title: 'Kappa under prevalence and bias',
    use: 'One category swamps the other',
    example:
      'Two forecasters label 100 days Rainy or Not rainy. They agree on 95 of them, yet kappa can still land near zero because both almost always say Not rainy.',
  },
  {
    id: 'pabak',
    label: 'PABAK',
    title: 'PABAK',
    use: 'Reported alongside κ when the paradox bites',
    example:
      'For those same rain forecasts, PABAK reports agreement adjusted for prevalence and bias, which is why it can read high where ordinary kappa reads low.',
  },
];

const methodsById = new Map(methods.map((method) => [method.id, method]));

const VIEWBOX = { width: 120, height: 64 };

function Thumb({ label, children }) {
  return (
    <svg
      className="method-visual"
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  );
}

function Bars({ values, fill = 'var(--accent)', width = 14, gap = 10 }) {
  const span = values.length * width + (values.length - 1) * gap;
  const left = (VIEWBOX.width - span) / 2;
  const floor = 52;
  const tallest = 40;

  return values.map((value, index) => {
    const height = Math.max(3, value * tallest);
    return (
      <rect
        style={{ fill }}
        height={height}
        key={index}
        rx="2"
        width={width}
        x={left + index * (width + gap)}
        y={floor - height}
      />
    );
  });
}

function Rows({ values, fill = 'var(--accent)' }) {
  return values.map((value, index) => (
    <g key={index}>
      <rect style={{ fill: 'var(--line)' }} height="7" rx="3.5" width="76" x="22" y={14 + index * 15} />
      <rect style={{ fill }} height="7" rx="3.5" width={Math.max(6, 76 * value)} x="22" y={14 + index * 15} />
    </g>
  ));
}

function MethodVisual({ id }) {
  if (id === 'cohen') {
    const cells = [
      [36, 10, true],
      [62, 10, false],
      [36, 34, false],
      [62, 34, true],
    ];

    return (
      <Thumb label="Two by two agreement matrix, agreements on the diagonal">
        {cells.map(([x, y, diagonal]) => (
          <rect
            height="20"
            key={`${x}-${y}`}
            rx="3"
            style={{
              fill: diagonal ? 'var(--accent-soft)' : 'var(--panel)',
              stroke: diagonal ? 'var(--accent)' : 'var(--line)',
            }}
            width="22"
            x={x}
            y={y}
          />
        ))}
      </Thumb>
    );
  }

  if (id === 'linear' || id === 'quadratic') {
    const steps = [1, 2, 3, 4];
    const values = steps.map((step) => (id === 'quadratic' ? (step / 4) ** 2 : step / 4));

    return (
      <Thumb label={`${id === 'quadratic' ? 'Quadratic' : 'Linear'} penalty growing with distance`}>
        <Bars fill="var(--gold)" values={values} />
        <line strokeWidth="1" style={{ stroke: 'var(--line)' }} x1="16" x2="104" y1="52" y2="52" />
      </Thumb>
    );
  }

  if (id === 'fleiss') {
    return (
      <Thumb label="Three raters, two agreeing and one dissenting">
        {[34, 60, 86].map((x, index) => (
          <circle
            cx={x}
            cy="32"
            key={x}
            r="10"
            style={{
              fill: index === 2 ? 'var(--red)' : 'var(--accent)',
              stroke: 'var(--panel)',
            }}
            strokeWidth="3"
          />
        ))}
      </Thumb>
    );
  }

  if (id === 'light') {
    return (
      <Thumb label="Three rater pairs, each with its own kappa">
        <Rows values={[0.8, 0.7, 0.6]} />
        {['AB', 'AC', 'BC'].map((pair, index) => (
          <text fontSize="8" style={{ fill: 'var(--muted)' }} key={pair} x="4" y={20 + index * 15}>
            {pair}
          </text>
        ))}
      </Thumb>
    );
  }

  if (id === 'conger') {
    return (
      <Thumb label="Three raters using the same category at different rates">
        <Rows values={[0.9, 0.6, 0.4]} />
        {['A', 'B', 'C'].map((rater, index) => (
          <text fontSize="8" style={{ fill: 'var(--muted)' }} key={rater} x="8" y={20 + index * 15}>
            {rater}
          </text>
        ))}
      </Thumb>
    );
  }

  if (id === 'prevalence') {
    return (
      <Thumb label="One category taking almost every case">
        <rect height="18" style={{ fill: 'var(--accent)' }} rx="3" width="80" x="14" y="23" />
        <rect height="18" style={{ fill: 'var(--gold)' }} rx="3" width="12" x="94" y="23" />
        <text fontSize="8" style={{ fill: 'var(--muted)' }} x="14" y="17">95%</text>
        <text fontSize="8" style={{ fill: 'var(--muted)' }} textAnchor="end" x="106" y="52">5%</text>
      </Thumb>
    );
  }

  return (
    <Thumb label="Kappa near zero beside a high PABAK">
      <Bars fill="var(--accent)" values={[0.08, 0.85]} gap={26} width={18} />
      <text fontSize="8" style={{ fill: 'var(--muted)' }} textAnchor="middle" x="38" y="61">κ</text>
      <text fontSize="8" style={{ fill: 'var(--muted)' }} textAnchor="middle" x="82" y="61">PABAK</text>
      <line strokeWidth="1" style={{ stroke: 'var(--line)' }} x1="20" x2="100" y1="52" y2="52" />
    </Thumb>
  );
}

function Slider({ label, value, min = 0, max = 100, step = 1, display, onChange }) {
  return (
    <label className="slider">
      <span className="slider-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <strong className="slider-value">{display ?? value}</strong>
    </label>
  );
}

function Readout({ rows }) {
  return (
    <dl className="readout">
      {rows.map(([term, value, close]) => (
        <div className={close ? 'is-close' : ''} key={term}>
          <dt>{term}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function MethodInteractive({ id }) {
  const [agreement, setAgreement] = useState(80);
  const [distance, setDistance] = useState(1);
  const [disagreementRate, setDisagreementRate] = useState(20);
  const [expectedPenalty, setExpectedPenalty] = useState(25);
  const [matchingJudges, setMatchingJudges] = useState(2);
  const [expectedAgreement, setExpectedAgreement] = useState(50);
  const [pairAB, setPairAB] = useState(80);
  const [pairAC, setPairAC] = useState(70);
  const [pairBC, setPairBC] = useState(60);
  const [raterA, setRaterA] = useState(90);
  const [raterB, setRaterB] = useState(60);
  const [raterC, setRaterC] = useState(40);
  const [prevalence, setPrevalence] = useState(95);
  const [prevalenceObserved, setPrevalenceObserved] = useState(95);

  if (id === 'cohen') {
    const expected = 0.5;
    const kappa = (agreement / 100 - expected) / (1 - expected);

    return (
      <>
        <Formula label="Cohen’s kappa" note="Chance agreement is pinned at 0.50 here so the effect of pₒ is easy to see.">
          {String.raw`\kappa = \frac{p_o - p_e}{1 - p_e}`}
        </Formula>

        <div className="controls">
          <Slider label="Observed agreement" value={agreement} min={50} display={`${agreement}%`} onChange={setAgreement} />
        </div>

        <Readout
          rows={[
            ['observed pₒ', (agreement / 100).toFixed(2)],
            ['chance pₑ', expected.toFixed(2)],
            ['κ', kappa.toFixed(2), true],
          ]}
        />

        <div className={`epsilon-strip ${kappa >= 0.6 ? 'is-ok' : 'is-fail'}`}>
          <span className="verdict">{kappa >= 0.6 ? 'beating chance clearly' : 'barely above chance'}</span>
          <p>
            Half of the agreement is free: two raters guessing would already match on 50% of cases. Kappa
            measures only the ground gained above that floor.
          </p>
        </div>
      </>
    );
  }

  if (id === 'linear' || id === 'quadratic') {
    const quadratic = id === 'quadratic';
    const weight = quadratic ? (distance ** 2) / 16 : distance / 4;
    const observedPenalty = (disagreementRate / 100) * weight;
    const expectedPenaltyDecimal = expectedPenalty / 100;
    const weightedKappa = 1 - observedPenalty / expectedPenaltyDecimal;

    return (
      <>
        <Formula
          label={quadratic ? 'Quadratic-weighted kappa' : 'Linear-weighted kappa'}
          note="Dₒ is the average penalty actually paid; Dₑ is the penalty chance alone would cost."
        >
          {quadratic
            ? String.raw`\kappa_w = 1 - \frac{D_o}{D_e}, \qquad w_{ij} = \frac{(i-j)^2}{(k-1)^2}`
            : String.raw`\kappa_w = 1 - \frac{D_o}{D_e}, \qquad w_{ij} = \frac{|i-j|}{k-1}`}
        </Formula>

        <div className="controls">
          <Slider label="Steps apart" value={distance} min={1} max={4} onChange={setDistance} />
          <Slider label="Cases at this gap" value={disagreementRate} display={`${disagreementRate}%`} onChange={setDisagreementRate} />
          <Slider label="Chance penalty Dₑ" value={expectedPenalty} min={5} display={`${expectedPenalty}%`} onChange={setExpectedPenalty} />
        </div>

        <Readout
          rows={[
            ['weight w', weight.toFixed(2)],
            ['observed Dₒ', observedPenalty.toFixed(3)],
            ['chance Dₑ', expectedPenaltyDecimal.toFixed(2)],
            ['κw', weightedKappa.toFixed(2), true],
          ]}
        />

        <div className={`epsilon-strip ${weightedKappa >= 0.6 ? 'is-ok' : 'is-fail'}`}>
          <span className="verdict">{quadratic ? 'far gaps hurt most' : 'every step costs the same'}</span>
          <p>
            On a 1–5 scale there are four possible steps. Drag the gap to 4 and watch the weight:{' '}
            {quadratic
              ? 'squaring sends it straight to 1.00, so one wild disagreement can sink the score.'
              : 'it climbs evenly to 1.00, treating a two-step miss as exactly twice a one-step miss.'}
          </p>
        </div>
      </>
    );
  }

  if (id === 'fleiss') {
    const dissenting = 3 - matchingJudges;
    const agreeingPairs = (matchingJudges * (matchingJudges - 1)) / 2 + (dissenting * (dissenting - 1)) / 2;
    const itemAgreement = agreeingPairs / 3;
    const overallHealthy = expectedAgreement / 100;
    const chanceAgreement = overallHealthy ** 2 + (1 - overallHealthy) ** 2;
    const fleissKappa = (itemAgreement - chanceAgreement) / (1 - chanceAgreement);

    return (
      <>
        <Formula label="Fleiss’ kappa" note="P̄ averages the per-case pair agreement across every case in the study.">
          {String.raw`\kappa = \frac{\bar{P} - \bar{P_e}}{1 - \bar{P_e}}`}
        </Formula>

        <div className="controls">
          <Slider label="Doctors saying Healthy" value={matchingJudges} min={0} max={3} onChange={setMatchingJudges} />
          <Slider label="Healthy across the study" value={expectedAgreement} min={10} max={90} display={`${expectedAgreement}%`} onChange={setExpectedAgreement} />
        </div>

        <Readout
          rows={[
            ['agreeing pairs', `${agreeingPairs} of 3`],
            ['this case P', itemAgreement.toFixed(2)],
            ['chance P̄ₑ', chanceAgreement.toFixed(2)],
            ['κ', fleissKappa.toFixed(2), true],
          ]}
        />

        <div className={`epsilon-strip ${fleissKappa >= 0.6 ? 'is-ok' : 'is-fail'}`}>
          <span className="verdict">three raters make three pairs</span>
          <p>
            A–B, A–C, and B–C. A pair agrees when both doctors say the same thing, so a 2–1 split still
            earns one agreeing pair out of three rather than nothing at all.
          </p>
        </div>
      </>
    );
  }

  if (id === 'light') {
    const average = (pairAB + pairAC + pairBC) / 300;

    return (
      <>
        <Formula label="Light’s kappa" note="Every rater pair gets its own Cohen’s kappa, and those are averaged.">
          {String.raw`\kappa_L = \frac{1}{m} \sum_{\text{pairs}} \kappa_{\text{Cohen}}`}
        </Formula>

        <div className="controls">
          <Slider label="κ for A ↔ B" value={pairAB} display={(pairAB / 100).toFixed(2)} onChange={setPairAB} />
          <Slider label="κ for A ↔ C" value={pairAC} display={(pairAC / 100).toFixed(2)} onChange={setPairAC} />
          <Slider label="κ for B ↔ C" value={pairBC} display={(pairBC / 100).toFixed(2)} onChange={setPairBC} />
        </div>

        <Readout rows={[['pairs m', '3'], ['κL', average.toFixed(2), true]]} />

        <div className={`epsilon-strip ${average >= 0.6 ? 'is-ok' : 'is-fail'}`}>
          <span className="verdict">an average, so it hides outliers</span>
          <p>
            Drop one pair to 0.20 and leave the others high: the mean stays respectable even though two
            of your raters plainly disagree. Always read the individual pairs too.
          </p>
        </div>
      </>
    );
  }

  if (id === 'conger') {
    const chanceAB = (raterA * raterB + (100 - raterA) * (100 - raterB)) / 10000;
    const chanceAC = (raterA * raterC + (100 - raterA) * (100 - raterC)) / 10000;
    const chanceBC = (raterB * raterC + (100 - raterB) * (100 - raterC)) / 10000;
    const congerExpected = (chanceAB + chanceAC + chanceBC) / 3;

    const congerKappa = congerExpected >= 1 ? 0 : (agreement / 100 - congerExpected) / (1 - congerExpected);

    return (
      <>
        <Formula label="Conger’s kappa" note="The chance term keeps each rater’s own category proportions instead of pooling them.">
          {String.raw`\kappa = \frac{p_o - \bar{p_e}}{1 - \bar{p_e}}`}
        </Formula>

        <div className="controls">
          <Slider label="A says Good" value={raterA} display={`${raterA}%`} onChange={setRaterA} />
          <Slider label="B says Good" value={raterB} display={`${raterB}%`} onChange={setRaterB} />
          <Slider label="C says Good" value={raterC} display={`${raterC}%`} onChange={setRaterC} />
          <Slider label="Observed agreement" value={agreement} min={50} display={`${agreement}%`} onChange={setAgreement} />
        </div>

        <Readout
          rows={[
            ['chance A↔B', chanceAB.toFixed(2)],
            ['chance A↔C', chanceAC.toFixed(2)],
            ['chance B↔C', chanceBC.toFixed(2)],
            ['κ', congerKappa.toFixed(2), true],
          ]}
        />

        <div className={`epsilon-strip ${congerKappa >= 0.6 ? 'is-ok' : 'is-fail'}`}>
          <span className="verdict">rater habits stay separate</span>
          <p>
            Push the three sliders far apart. Pooling them would invent an average rater nobody
            resembles, so Conger averages the pairwise chance terms instead.
          </p>
        </div>
      </>
    );
  }

  if (id === 'prevalence') {
    const prevalenceDecimal = prevalence / 100;
    const prevalenceExpected = prevalenceDecimal ** 2 + (1 - prevalenceDecimal) ** 2;
    const prevalenceKappa = (prevalenceObserved / 100 - prevalenceExpected) / (1 - prevalenceExpected);

    return (
      <>
        <Formula label="Kappa under class imbalance" note="Expected agreement climbs towards 1 as one category takes over.">
          {String.raw`p_e = p^2 + (1 - p)^2, \qquad \kappa = \frac{p_o - p_e}{1 - p_e}`}
        </Formula>

        <div className="controls">
          <Slider label="Days Not rainy" value={prevalence} min={50} max={99} display={`${prevalence}%`} onChange={setPrevalence} />
          <Slider label="Observed agreement" value={prevalenceObserved} min={50} display={`${prevalenceObserved}%`} onChange={setPrevalenceObserved} />
        </div>

        <Readout
          rows={[
            ['observed pₒ', (prevalenceObserved / 100).toFixed(2)],
            ['chance pₑ', prevalenceExpected.toFixed(2)],
            ['κ', prevalenceKappa.toFixed(2), true],
          ]}
        />

        <div className={`epsilon-strip ${prevalenceKappa >= 0.6 ? 'is-ok' : 'is-fail'}`}>
          <span className="verdict">the paradox in one slider</span>
          <p>
            Push Not rainy to 95% and hold observed agreement at 95%: chance agreement is already 0.905,
            so almost nothing is left for kappa to credit.
          </p>
        </div>
      </>
    );
  }

  const pabak = 2 * (agreement / 100) - 1;

  return (
    <>
      <Formula label="PABAK" note="Prevalence-adjusted, bias-adjusted kappa depends on observed agreement alone.">
        {String.raw`\text{PABAK} = 2 p_o - 1`}
      </Formula>

      <div className="controls">
        <Slider label="Observed agreement" value={agreement} min={50} display={`${agreement}%`} onChange={setAgreement} />
      </div>

      <Readout rows={[['observed pₒ', (agreement / 100).toFixed(2)], ['PABAK', pabak.toFixed(2), true]]} />

      <div className={`epsilon-strip ${pabak >= 0.6 ? 'is-ok' : 'is-fail'}`}>
        <span className="verdict">report it beside κ, never instead</span>
        <p>
          PABAK ignores how the categories were distributed, which is exactly why it escapes the
          paradox and exactly why it can flatter a study that deserves scrutiny.
        </p>
      </div>
    </>
  );
}

function KappaMethodExplorer() {
  const [activeId, setActiveId] = useState(methods[0].id);
  const active = methodsById.get(activeId) ?? methods[0];

  return (
    <section className="visual-section">
      <div className="visual-header">
        <div>
          <span className="eyebrow">Method selection</span>
          <h2>Types of Kappa</h2>
        </div>
      </div>

      <div className="fn-picker" role="group" aria-label="Kappa method">
        {methods.map((method) => (
          <button
            className={`chip ${method.id === activeId ? 'selected' : ''}`}
            key={method.id}
            type="button"
            aria-pressed={method.id === activeId}
            onClick={() => setActiveId(method.id)}
          >
            {method.label}
          </button>
        ))}
      </div>

      <div className="method-detail">
        <div className="visual-header">
          <div>
            <span className="eyebrow">{active.use}</span>
            <h3>{active.title}</h3>
          </div>
          <MethodVisual id={active.id} />
        </div>

        <p>{active.example}</p>

        <MethodInteractive key={active.id} id={active.id} />
      </div>

      <p className="plot-hint">
        Every method answers the same question - how much agreement is real? - and differs only in what
        it is willing to call chance.
      </p>
    </section>
  );
}

const prose = (
  <>
    <h2>Chance-corrected agreement</h2>
    <p>
      Two people label the same hundred cases. They match on ninety of them. That sounds convincing
      until you notice that two people flipping coins would have matched on about fifty, and the
      ninety suddenly needs deflating. Cohen’s kappa does exactly that deflating, and it is so close
      to the standard measure of <strong>inter-rater reliability</strong> that the two names are used
      almost interchangeably.
    </p>

    <Formula label="Cohen’s kappa" note="pₒ is observed agreement and pₑ is the agreement chance alone would produce.">
      {String.raw`\kappa = \frac{P_o - P_e}{1 - P_e}`}
    </Formula>

    <h2>Observed and expected agreement</h2>
    <p>
      Observed agreement is the easy one: count the cases where both raters said the same thing and
      divide by the total. In a 2 × 2 table that is the diagonal, the two cells where the labels
      coincide.
    </p>

    <p>
      Expected agreement is the interesting one. Suppose each rater keeps their personal habit - this
      one calls things positive 60% of the time, that one 45% - but stops looking at the cases and
      answers independently. Multiply the two proportions for each category, add them up, and you
      have the agreement their habits alone would manufacture. Kappa asks how much of the gap between
      that floor and perfection was actually closed.
    </p>

    <h2>Categorical data requirements</h2>
    <p>
      The method only makes sense for <strong>categorical</strong> data: labels rather than
      quantities. Blood type and gender are categorical; age and weight are not. Within categorical
      data the distinction that matters is order. <strong>Nominal</strong> categories have none -
      blood types A, B, AB and O are simply different - while <strong>ordinal</strong> ones line up,
      like a gingival index running 0, 1, 2, 3, where 3 sits further from 0 than 1 does. A{' '}
      <strong>binary</strong> variable is just a nominal one with exactly two options, and it is the
      case the 2 × 2 matrix on the right is built for.
    </p>

    <p>
      That distinction decides which kappa you reach for. Plain Cohen’s kappa treats every
      disagreement as equally wrong, which is right for nominal labels and wasteful for ordinal ones,
      where a one-step miss plainly matters less than a four-step miss. The weighted variants exist
      for precisely that case.
    </p>

    <Callout label="The prevalence paradox" tone="fail">
      When one category swamps the other, expected agreement climbs towards 1 and kappa collapses even
      though the raters look consistent. Two forecasters who agree on 95 of 100 days can score near
      zero if 95 of those days were dry. Load the prevalence paradox preset to watch it happen - the
      statistic is not broken, it is telling you the agreement was cheap.
    </Callout>

    <h2>Interpreting κ</h2>
    <p>
      Kappa runs from −1 to 1. Zero means the raters did no better than their own habits predicted,
      negative means they managed worse than chance, and 1 means every case landed on the diagonal.
      The usual bands - weak below 0.4, moderate to 0.6, substantial to 0.8 - are conventions rather
      than laws, and they deserve less weight than the sample size and the prevalence behind them.
    </p>

    <Example label="Applications">
      Two radiologists reading the same scans, two coders tagging the same interview transcripts, two
      reviewers screening the same papers for a meta-analysis. Anywhere a study depends on human
      judgement, kappa is the number that says whether that judgement was reproducible or merely
      confident.
    </Example>
  </>
);

export default function KappaLesson({ lessonId }) {
  const [cells, setCells] = useState(defaults);
  const [activePreset, setActivePreset] = useState('balanced');
  const [openMetric, setOpenMetric] = useState(null);
  const result = calculateKappa(cells);
  const verdict = interpretation(result.kappa, result.empty);

  function updateCell(name, value) {
    setActivePreset('custom');
    setCells((current) => ({ ...current, [name]: Math.max(0, Number(value) || 0) }));
  }

  function reset() {
    setActivePreset('balanced');
    setCells(defaults);
  }

  function choosePreset(preset) {
    setActivePreset(preset.id);
    setCells(preset.cells);
  }

  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      reference={<FormulaReference title="Kappa reference" groups={kappaFormulas} />}
      belowVisual={<KappaMethodExplorer />}
      intro="Cohen’s kappa measures how consistently two raters classify the same cases, after subtracting the agreement their own habits would have produced by chance."
      visual={
        <>
          <div className="visual-header">
            <div>
              <span className="eyebrow">Interactive matrix</span>
              <h2>Agreement matrix</h2>
            </div>
            <div className="visual-actions">
              <ResetButton values={cells} defaults={defaults} onReset={reset} />
            </div>
          </div>

          <div className="fn-picker" role="group" aria-label="Matrix example">
            {presets.map((preset) => (
              <button
                className={`chip ${activePreset === preset.id ? 'selected' : ''}`}
                key={preset.id}
                type="button"
                aria-pressed={activePreset === preset.id}
                onClick={() => choosePreset(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="kappa-matrix" role="group" aria-label="Rater agreement counts">
            <div className="matrix-corner" />
            <strong>Rater 2: positive</strong>
            <strong>Rater 2: negative</strong>
            <strong>Rater 1: positive</strong>
            <MatrixCell label="Both positive" name="bothPositive" value={cells.bothPositive} agreement onChange={updateCell} />
            <MatrixCell label="Rater 1 only" name="raterOnePositive" value={cells.raterOnePositive} onChange={updateCell} />
            <strong>Rater 1: negative</strong>
            <MatrixCell label="Rater 2 only" name="raterTwoPositive" value={cells.raterTwoPositive} onChange={updateCell} />
            <MatrixCell label="Both negative" name="bothNegative" value={cells.bothNegative} agreement onChange={updateCell} />
          </div>

          <dl className="readout">
            <div>
              <dt>cases</dt>
              <dd>{result.total}</dd>
            </div>
            <div>
              <dt>
                <button
                  className="metric-info-trigger"
                  type="button"
                  aria-expanded={openMetric === 'observed'}
                  onClick={() => setOpenMetric((current) => (current === 'observed' ? null : 'observed'))}
                >
                  observed pₒ <span>?</span>
                </button>
              </dt>
              <dd>{result.observed.toFixed(2)}</dd>
            </div>
            <div>
              <dt>
                <button
                  className="metric-info-trigger"
                  type="button"
                  aria-expanded={openMetric === 'expected'}
                  onClick={() => setOpenMetric((current) => (current === 'expected' ? null : 'expected'))}
                >
                  chance pₑ <span>?</span>
                </button>
              </dt>
              <dd>{result.expected.toFixed(2)}</dd>
            </div>
            <div className="is-close">
              <dt>κ</dt>
              <dd>{result.kappa.toFixed(2)}</dd>
            </div>
          </dl>

          {openMetric && !result.empty ? (
            <MetricExplanation metric={openMetric} cells={cells} result={result} />
          ) : null}

          <div className="agreement-bars" aria-label="Observed and expected agreement comparison">
            <div className="bar-row">
              <span>observed agreement</span>
              <div><i style={{ width: `${result.observed * 100}%` }} /></div>
              <strong>{(result.observed * 100).toFixed(0)}%</strong>
            </div>
            <div className="bar-row is-chance">
              <span>expected by chance</span>
              <div><i style={{ width: `${result.expected * 100}%` }} /></div>
              <strong>{(result.expected * 100).toFixed(0)}%</strong>
            </div>
          </div>

          <div className="kappa-scale" aria-label="Kappa interpretation scale">
            <div className="scale-track">
              <i style={{ left: `${Math.max(0, Math.min(100, (result.kappa + 1) * 50))}%` }} />
            </div>
            <div className="scale-labels">
              <span>−1 disagreement</span>
              <span>0 chance</span>
              <span>1 perfect</span>
            </div>
          </div>

          <div className={`epsilon-strip is-${verdict.tone}`}>
            <span className="verdict">{verdict.label}</span>
            <p>
              {result.empty
                ? 'Every cell is zero, so there is nothing to measure yet. Put some cases back into the table.'
                : 'The gap between the two bars is what kappa scores. Shrink it and κ falls, however high observed agreement looks.'}
            </p>
          </div>

          <p className="plot-hint">
            The diagonal cells are agreements and the off-diagonal cells are disagreements. Edit any
            count directly, or tap the ? beside pₒ and pₑ to see the arithmetic.
          </p>
        </>
      }
    >
      {prose}
    </LessonLayout>
  );
}

function MatrixCell({ label, name, value, agreement = false, onChange }) {
  return (
    <label className={`matrix-cell ${agreement ? 'is-agreement' : ''}`}>
      <span>{label}</span>
      <input type="number" min="0" value={value} onChange={(event) => onChange(name, event.target.value)} />
    </label>
  );
}

function MetricExplanation({ metric, cells, result }) {
  if (metric === 'observed') {
    const agreements = cells.bothPositive + cells.bothNegative;

    return (
      <aside className="metric-explanation" aria-live="polite">
        <strong>Observed agreement (pₒ): how often did they actually agree?</strong>
        <ol className="metric-steps">
          <li>
            <span>Find agreements</span>
            <p>Both said Positive for <b>{cells.bothPositive}</b> cases. Both said Negative for <b>{cells.bothNegative}</b> cases.</p>
          </li>
          <li>
            <span>Add them</span>
            <p>{cells.bothPositive} + {cells.bothNegative} = <b>{agreements} agreements</b>.</p>
          </li>
          <li>
            <span>Divide by all cases</span>
            <p>{agreements} ÷ {result.total} = <b>{result.observed.toFixed(2)}</b>, or <b>{(result.observed * 100).toFixed(0)}%</b>.</p>
          </li>
        </ol>
      </aside>
    );
  }

  const raterOnePositive = cells.bothPositive + cells.raterOnePositive;
  const raterOneNegative = cells.raterTwoPositive + cells.bothNegative;
  const raterTwoPositive = cells.bothPositive + cells.raterTwoPositive;
  const raterTwoNegative = cells.raterOnePositive + cells.bothNegative;
  const positiveChance = (raterOnePositive / result.total) * (raterTwoPositive / result.total);
  const negativeChance = (raterOneNegative / result.total) * (raterTwoNegative / result.total);

  return (
    <aside className="metric-explanation" aria-live="polite">
      <strong>Expected agreement (pₑ): how often could their habits agree by chance?</strong>
      <p>Imagine both raters choose independently, but keep using Positive and Negative in their usual proportions.</p>
      <ol className="metric-steps">
        <li>
          <span>Chance both say Positive</span>
          <p>Rater 1 says Positive {raterOnePositive}/{result.total} times. Rater 2 says it {raterTwoPositive}/{result.total} times.</p>
          <code>{(raterOnePositive / result.total).toFixed(2)} × {(raterTwoPositive / result.total).toFixed(2)} = {positiveChance.toFixed(2)}</code>
        </li>
        <li>
          <span>Chance both say Negative</span>
          <p>Rater 1 says Negative {raterOneNegative}/{result.total} times. Rater 2 says it {raterTwoNegative}/{result.total} times.</p>
          <code>{(raterOneNegative / result.total).toFixed(2)} × {(raterTwoNegative / result.total).toFixed(2)} = {negativeChance.toFixed(2)}</code>
        </li>
        <li>
          <span>Add both ways to agree</span>
          <p>{positiveChance.toFixed(2)} + {negativeChance.toFixed(2)} = <b>{result.expected.toFixed(2)}</b>, or <b>{(result.expected * 100).toFixed(0)}%</b>.</p>
        </li>
      </ol>
    </aside>
  );
}
