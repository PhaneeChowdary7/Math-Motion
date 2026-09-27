import StoryScene, { Actor, Label, makePlot } from '../components/StoryScene.jsx';
import { lerp, phase, seeded, smooth } from '../lib/useTimeline.js';

const fmt = (value, digits = 1) => {
  const rounded = Math.round(value * 10 ** digits) / 10 ** digits;
  return (Object.is(rounded, -0) ? 0 : rounded).toFixed(digits);
};
const mean = (values) => values.reduce((a, b) => a + b, 0) / values.length;
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/* Describing data: animals race 100 m. Each finish time drops onto a dot plot.
   The slow tortoise drags the mean but barely moves the median. */
const RUNNERS = [
  { emoji: '🐆', time: 10 },
  { emoji: '🐎', time: 11 },
  { emoji: '🐇', time: 12 },
  { emoji: '🦌', time: 13 },
  { emoji: '🦊', time: 13.5 },
  { emoji: '🐕', time: 14 },
  { emoji: '🐈', time: 15 },
  { emoji: '🐿️', time: 16 },
  { emoji: '🐢', time: 38 },
];
const RACE_SECONDS = 40;

export function RaceFinishStory({ initialT }) {
  const plot = makePlot({ left: 40, top: 150, width: 560, height: 60, x0: 8, x1: 40, y0: 0, y1: 1 });
  const clockAt = (t) => phase(t, 0.03, 0.93) * RACE_SECONDS;
  const finishedAt = (t) => RUNNERS.filter((runner) => clockAt(t) >= runner.time);

  return (
    <StoryScene
      initialT={initialT}
      title="Race day statistics"
      duration={13000}
      height={250}
      caption={(t) => {
        const done = finishedAt(t);
        if (done.length === 0) return 'Nine animals run 100 metres. As each one crosses the line, its time drops onto the dot plot below.';
        if (done.length < 8) return `${done.length} finished. The mean (gold) is the balance point of the dots; the median (blue) is the middle one. So far they sit close together.`;
        if (done.length === 8) return 'Eight are home in 10 to 16 seconds. Everyone is waiting for the tortoise…';
        return 'The tortoise’s 38 s drags the mean from 13.1 s to 15.8 s, while the median barely moves (13.3 s to 13.5 s). The median resists outliers.';
      }}
      stats={(t) => {
        const times = finishedAt(t).map((runner) => runner.time);
        return [
          ['finished', times.length],
          ['mean', times.length ? `${fmt(mean(times))} s` : '—', times.length === 9],
          ['median', times.length ? `${fmt(median(times))} s` : '—'],
        ];
      }}
    >
      {(t) => {
        const clock = clockAt(t);
        const done = finishedAt(t);
        const times = done.map((runner) => runner.time);
        const stacks = {};
        return (
          <>
            {RUNNERS.map((runner, i) => {
              const k = Math.min(1, clock / runner.time);
              return (
                <g key={runner.emoji}>
                  <line className="st-grid" x1={40} y1={20 + i * 14} x2={600} y2={20 + i * 14} />
                  <Actor x={40 + k * 540} y={14 + i * 14} emoji={runner.emoji} size={16} flip />
                </g>
              );
            })}
            <line className="st-line a" x1={590} y1={8} x2={590} y2={138} strokeDasharray="4 3" />
            {plot.axes}
            {[10, 15, 20, 25, 30, 35, 40].map((x) => (
              <Label key={x} x={plot.sx(x)} y={plot.sy(0) + 16} size={10}>
                {x}s
              </Label>
            ))}
            {done.map((runner) => {
              const key = Math.round(runner.time);
              stacks[key] = (stacks[key] ?? 0) + 1;
              return <Actor key={runner.emoji} x={plot.sx(runner.time)} y={plot.sy(0) - 10 - (stacks[key] - 1) * 16} emoji={runner.emoji} size={16} />;
            })}
            {times.length ? (
              <g>
                <path className="st-dot c" d={`M${plot.sx(mean(times))} ${plot.sy(0) + 2} l-7 12 h14 z`} />
                <Label x={plot.sx(mean(times))} y={plot.sy(0) + 40} size={10} tone="gold" weight={700}>
                  mean
                </Label>
                <line className="st-line b" x1={plot.sx(median(times))} y1={plot.sy(0)} x2={plot.sx(median(times))} y2={plot.sy(1)} strokeWidth={2} />
                <Label x={plot.sx(median(times))} y={plot.sy(1) - 4} size={10} tone="blue" weight={700}>
                  median
                </Label>
              </g>
            ) : null}
          </>
        );
      }}
    </StoryScene>
  );
}

/* Probability: flip a coin hundreds of times. Early on the share of heads
   swings wildly; over many flips it settles near one half. */
const FLIPS = 400;
const COIN = (() => {
  const random = seeded(7);
  return Array.from({ length: FLIPS }, () => random() < 0.5);
})();
const HEADS_SO_FAR = COIN.reduce((acc, heads, i) => {
  acc.push((acc[i - 1] ?? 0) + (heads ? 1 : 0));
  return acc;
}, []);

export function CoinFlipStory({ initialT }) {
  const plot = makePlot({ left: 170, top: 20, width: 440, height: 190, x0: 1, x1: FLIPS, y0: 0, y1: 1 });
  const countAt = (t) => Math.min(FLIPS, Math.floor(FLIPS * phase(t, 0.03, 0.95) ** 2.2));

  return (
    <StoryScene
      initialT={initialT}
      title="The law of large numbers"
      duration={13000}
      height={240}
      caption={(t) => {
        const n = countAt(t);
        if (n < 1) return 'A fair coin is tossed again and again. We track the share of tosses that land heads.';
        if (n < 30) return `After ${n} tosses the share of heads is ${fmt(HEADS_SO_FAR[n - 1] / n, 2)}. With so few tosses, streaks swing it wildly.`;
        if (n < FLIPS) return `After ${n} tosses: ${fmt(HEADS_SO_FAR[n - 1] / n, 3)}. Each new toss moves the share less and less, and it drifts towards 0.5.`;
        return `After ${FLIPS} tosses the share is ${fmt(HEADS_SO_FAR[FLIPS - 1] / FLIPS, 3)}. Probability 1/2 describes where the long-run share settles, not a promise to alternate.`;
      }}
      stats={(t) => {
        const n = countAt(t);
        return [
          ['tosses', n],
          ['heads', n ? HEADS_SO_FAR[n - 1] : 0],
          ['share of heads', n ? fmt(HEADS_SO_FAR[n - 1] / n, 3) : '—', n >= FLIPS],
        ];
      }}
    >
      {(t) => {
        const n = countAt(t);
        const last = n ? COIN[n - 1] : true;
        const spin = Math.abs(Math.cos(t * 180));
        let d = '';
        for (let i = 1; i <= n; i += 1) d += `${i === 1 ? 'M' : 'L'}${plot.sx(i).toFixed(1)} ${plot.sy(HEADS_SO_FAR[i - 1] / i).toFixed(1)}`;
        return (
          <>
            <g transform={`translate(80 90) scale(1 ${n >= FLIPS ? 1 : Math.max(0.15, spin)})`}>
              <circle r={40} fill="color-mix(in srgb, var(--gold) 45%, var(--panel))" stroke="var(--gold)" strokeWidth={3} />
              <Label x={0} y={10} size={30} tone="text" weight={700}>
                {last ? 'H' : 'T'}
              </Label>
            </g>
            <g transform="translate(18 180)">
              {COIN.slice(Math.max(0, n - 10), n).map((heads, i) => (
                <g key={i} transform={`translate(${i * 14} 0)`}>
                  <circle className={heads ? 'st-dot c' : 'st-dot muted'} cx={6} cy={6} r={6} />
                </g>
              ))}
            </g>
            {plot.axes}
            <line className="st-line b" x1={plot.sx(1)} y1={plot.sy(0.5)} x2={plot.sx(FLIPS)} y2={plot.sy(0.5)} strokeDasharray="5 5" strokeWidth={1.5} />
            <path className="st-line a" d={d} />
            <Label x={plot.sx(FLIPS)} y={plot.sy(0.5) - 6} anchor="end" size={10} tone="blue">
              0.5
            </Label>
            <Label x={plot.sx(FLIPS)} y={plot.sy(0) + 16} anchor="end" size={10}>
              number of tosses
            </Label>
            <Label x={plot.sx(1) + 4} y={plot.sy(1) + 4} anchor="start" size={10}>
              share of heads
            </Label>
          </>
        );
      }}
    </StoryScene>
  );
}

/* Expectation: a prize wheel pays $0, $2 or $10. Spin it many times and the
   average payout homes in on the expected value, $2.60. */
const SECTORS = [
  { prize: 0, share: 0.5, tone: 'muted' },
  { prize: 2, share: 0.3, tone: 'b' },
  { prize: 10, share: 0.2, tone: 'c' },
];
const SPINS = 60;
const OUTCOMES = (() => {
  const random = seeded(42);
  return Array.from({ length: SPINS }, () => {
    const u = random();
    const sector = u < 0.5 ? 0 : u < 0.8 ? 1 : 2;
    const start = sector === 0 ? 0 : sector === 1 ? 0.5 : 0.8;
    return { sector, spot: start + (0.15 + random() * 0.7) * SECTORS[sector].share };
  });
})();

export function SpinnerStory({ initialT }) {
  const plot = makePlot({ left: 300, top: 24, width: 310, height: 180, x0: 1, x1: SPINS, y0: 0, y1: 6 });
  const spinAt = (t) => {
    const k = SPINS * phase(t, 0.03, 0.95) ** 1.7;
    const index = Math.min(SPINS - 1, Math.floor(k));
    return { index, local: k >= SPINS ? 1 : k - index, done: Math.min(SPINS, Math.floor(k)) };
  };
  const average = (n) => (n ? mean(OUTCOMES.slice(0, n).map((o) => SECTORS[o.sector].prize)) : 0);

  return (
    <StoryScene
      initialT={initialT}
      title="Spinning the prize wheel"
      duration={13000}
      height={240}
      caption={(t) => {
        const { done } = spinAt(t);
        if (done < 1) return 'Half the wheel pays nothing, 30% pays $2 and 20% pays $10. What is a spin worth on average?';
        if (done < 12) return `After ${done} spins the average payout is $${fmt(average(done), 2)}. A lucky $10 or an unlucky run still moves it a lot.`;
        if (done < SPINS) return `After ${done} spins: $${fmt(average(done), 2)}. The running average is homing in on one value.`;
        return 'That value is the expected value: 0 × 0.5 + 2 × 0.3 + 10 × 0.2 = $2.60. No single spin pays $2.60, but it is the long-run average per spin.';
      }}
      stats={(t) => {
        const { done } = spinAt(t);
        return [
          ['spins', done],
          ['running average', done ? `$${fmt(average(done), 2)}` : '—'],
          ['E[X]', '$2.60', done >= SPINS],
        ];
      }}
    >
      {(t) => {
        const { index, local, done } = spinAt(t);
        const previous = index === 0 ? 0 : OUTCOMES[index - 1].spot;
        const target = OUTCOMES[index].spot;
        const turn = previous + (3 + target - previous) * smooth(local);
        const rotation = -turn * 360;
        const r = 90;
        const cx = 140;
        const cy = 120;
        let angle = 0;
        let d = '';
        for (let i = 1; i <= done; i += 1) d += `${i === 1 ? 'M' : 'L'}${plot.sx(i).toFixed(1)} ${plot.sy(average(i)).toFixed(1)}`;
        return (
          <>
            <g transform={`rotate(${rotation} ${cx} ${cy})`}>
              {SECTORS.map((sector) => {
                const a0 = angle * 2 * Math.PI - Math.PI / 2;
                angle += sector.share;
                const a1 = angle * 2 * Math.PI - Math.PI / 2;
                const mid = (a0 + a1) / 2;
                return (
                  <g key={sector.prize}>
                    <path
                      className={sector.tone === 'muted' ? 'st-fill soft' : `st-block ${sector.tone}`}
                      d={`M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 ${sector.share > 0.5 ? 1 : 0} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`}
                      stroke="var(--line)"
                    />
                    <Label x={cx + r * 0.6 * Math.cos(mid)} y={cy + r * 0.6 * Math.sin(mid) + 5} size={15} tone="text" weight={700}>
                      ${sector.prize}
                    </Label>
                  </g>
                );
              })}
            </g>
            <path className="st-dot d" d={`M${cx} ${cy - r + 10} l-9 -22 h18 z`} />
            <circle className="st-dot muted" cx={cx} cy={cy} r={6} />
            {plot.axes}
            <line className="st-line c" x1={plot.sx(1)} y1={plot.sy(2.6)} x2={plot.sx(SPINS)} y2={plot.sy(2.6)} strokeDasharray="5 5" strokeWidth={1.5} />
            <Label x={plot.sx(SPINS)} y={plot.sy(2.6) - 6} anchor="end" size={10} tone="gold">
              E[X] = 2.60
            </Label>
            <path className="st-line a" d={d} />
            <Label x={plot.sx(1) + 4} y={plot.sy(6) + 4} anchor="start" size={10}>
              average payout ($)
            </Label>
            <Label x={plot.sx(SPINS)} y={plot.sy(0) + 16} anchor="end" size={10}>
              spins
            </Label>
          </>
        );
      }}
    </StoryScene>
  );
}

/* Normal distribution: a Galton board. Each ball bounces left or right at ten
   rows of pegs; the piles build the bell curve. */
const ROWS = 10;
const BALLS = 110;
const BALL_PATHS = (() => {
  const random = seeded(3);
  return Array.from({ length: BALLS }, () => Array.from({ length: ROWS }, () => random() < 0.5));
})();
const BINS = BALL_PATHS.map((path) => path.filter(Boolean).length);

export function GaltonStory({ initialT }) {
  const cx = 320;
  const dx = 24;
  const dy = 13;
  const top = 18;
  const floor = 236;
  const step = 3.4;
  const release = (i) => 0.03 + (0.78 * i) / BALLS;
  const fall = 0.12;

  const stateAt = (t) => {
    const landed = [];
    const flying = [];
    BALL_PATHS.forEach((path, i) => {
      const k = (t - release(i)) / fall;
      if (k <= 0) return;
      if (k >= 1) landed.push(i);
      else flying.push({ i, k });
    });
    return { landed, flying };
  };

  return (
    <StoryScene
      initialT={initialT}
      title="The Galton board"
      duration={14000}
      height={250}
      caption={(t) => {
        const { landed } = stateAt(t);
        if (landed.length === 0) return 'Balls drop through ten rows of pegs. At each peg a ball goes left or right with equal chance.';
        if (landed.length < 40) return 'Reaching the far edge needs ten bounces the same way, which is rare. Most paths mix lefts and rights and end near the middle.';
        if (landed.length < BALLS) return 'The piles are taking a shape: tall in the middle, tapering evenly on both sides.';
        return 'Sum many small, independent nudges and you get the bell curve. That is why heights, measurement errors and exam scores so often look normal.';
      }}
      stats={(t) => {
        const { landed } = stateAt(t);
        const bins = landed.map((i) => BINS[i]);
        return [
          ['balls landed', landed.length],
          ['average bin', bins.length ? fmt(mean(bins), 2) : '—'],
          ['middle 3 bins', bins.length ? `${Math.round((bins.filter((b) => b >= 4 && b <= 6).length / bins.length) * 100)}%` : '—', landed.length === BALLS],
        ];
      }}
    >
      {(t) => {
        const { landed, flying } = stateAt(t);
        const counts = Array(ROWS + 1).fill(0);
        const pegs = [];
        for (let row = 0; row < ROWS; row += 1) {
          for (let k = 0; k <= row; k += 1) pegs.push(<circle key={`${row}-${k}`} className="st-dot muted" cx={cx + (k - row / 2) * dx} cy={top + 12 + row * dy} r={2.2} />);
        }
        const binX = (m) => cx + (m - ROWS / 2) * dx;
        let curve = '';
        for (let m = 0; m <= ROWS; m += 0.1) {
          const expected = (BALLS * Math.exp(-((m - 5) ** 2) / 5)) / Math.sqrt(5 * Math.PI);
          curve += `${curve ? 'L' : 'M'}${binX(m).toFixed(1)} ${(floor - expected * step).toFixed(1)}`;
        }
        return (
          <>
            {pegs}
            {Array.from({ length: ROWS + 2 }, (_, m) => (
              <line key={m} className="st-grid" x1={binX(m - 0.5)} y1={floor} x2={binX(m - 0.5)} y2={floor - 90} />
            ))}
            <line className="st-ground" x1={binX(-0.8)} y1={floor} x2={binX(ROWS + 0.8)} y2={floor} />
            {landed.map((i) => {
              const m = BINS[i];
              counts[m] += 1;
              return <circle key={i} className="st-dot a" cx={binX(m)} cy={floor - 2 - (counts[m] - 1) * step} r={1.9} />;
            })}
            {flying.map(({ i, k }) => {
              const rowFloat = k * (ROWS + 1);
              const row = Math.min(ROWS, Math.floor(rowFloat));
              const rights = BALL_PATHS[i].slice(0, row).filter(Boolean).length;
              const nextRights = rights + (row < ROWS && BALL_PATHS[i][row] ? 1 : 0);
              const frac = rowFloat - row;
              const x = cx + (lerp(rights, nextRights, row < ROWS ? frac : 0) - Math.min(row + frac, ROWS) / 2) * dx;
              const y = row < ROWS ? top + 4 + (row + frac) * dy : lerp(top + 4 + ROWS * dy, floor - 2 - counts[BINS[i]] * step, frac);
              return <circle key={i} className="st-dot c" cx={x} cy={y} r={3} />;
            })}
            {landed.length === BALLS ? <path className="st-line b" d={curve} strokeWidth={2} /> : null}
          </>
        );
      }}
    </StoryScene>
  );
}

/* Kappa: two judges score sixteen dogs pass or fail. Agreement looks high, but
   kappa subtracts the agreement you would expect by chance alone. */
const DOG_EMOJI = ['🐕', '🐩', '🐶', '🦮', '🐕‍🦺'];
const VERDICTS = [
  [1, 1], [0, 0], [1, 1], [1, 0], [1, 1], [0, 0], [0, 1], [1, 1],
  [0, 0], [1, 1], [1, 0], [0, 0], [1, 1], [0, 1], [1, 1], [0, 0],
];

function kappaStats(n) {
  const seen = VERDICTS.slice(0, n);
  const agree = seen.filter(([a, b]) => a === b).length;
  const aPass = seen.filter(([a]) => a).length;
  const bPass = seen.filter(([, b]) => b).length;
  const po = n ? agree / n : 0;
  const pe = n ? (aPass / n) * (bPass / n) + (1 - aPass / n) * (1 - bPass / n) : 0;
  const kappa = n && pe < 1 ? (po - pe) / (1 - pe) : 0;
  return { po, pe, kappa, cells: [[1, 1], [1, 0], [0, 1], [0, 0]].map(([a, b]) => seen.filter(([x, y]) => x === a && y === b).length) };
}

export function DogShowStory({ initialT }) {
  const judgedAt = (t) => Math.min(VERDICTS.length, Math.floor(phase(t, 0.04, 0.9) * (VERDICTS.length + 0.999)));

  return (
    <StoryScene
      initialT={initialT}
      title="Two judges at a dog show"
      duration={14000}
      height={240}
      caption={(t) => {
        const n = judgedAt(t);
        const { po, pe, kappa } = kappaStats(n);
        if (n === 0) return 'Two judges independently score each dog pass or fail. How much do they really agree?';
        if (n < VERDICTS.length) return `${n} dogs judged. They agree on ${Math.round(po * 100)}%, but even random guessing at their pass rates would agree ${Math.round(pe * 100)}% of the time.`;
        return `They agree 75% of the time, but chance alone gives ${Math.round(pe * 100)}%. κ = (0.75 − ${fmt(pe, 2)}) ÷ (1 − ${fmt(pe, 2)}) ≈ ${fmt(kappa, 2)}: moderate agreement.`;
      }}
      stats={(t) => {
        const n = judgedAt(t);
        const { po, pe, kappa } = kappaStats(n);
        return [
          ['observed pₒ', n ? fmt(po, 2) : '—'],
          ['chance pₑ', n ? fmt(pe, 2) : '—'],
          ['kappa κ', n ? fmt(kappa, 2) : '—', n === VERDICTS.length],
        ];
      }}
    >
      {(t) => {
        const n = judgedAt(t);
        const local = phase(t, 0.04, 0.9) * (VERDICTS.length + 0.999) - n;
        const { cells } = kappaStats(n);
        const current = VERDICTS[Math.min(n, VERDICTS.length - 1)];
        const walking = n < VERDICTS.length;
        const dogX = walking ? lerp(-20, 300, Math.min(1, local * 1.6)) : 300;
        const showVerdict = walking && local > 0.55;
        return (
          <>
            <rect className="st-road" x={10} y={150} width={380} height={12} rx={6} />
            <Actor x={220} y={50} emoji="👩‍⚖️" size={30} />
            <Actor x={330} y={50} emoji="🧑‍⚖️" size={30} />
            {showVerdict ? (
              <>
                <Label x={220} y={96} size={18} tone={current[0] ? 'accent' : 'red'} weight={700}>
                  {current[0] ? '✓' : '✗'}
                </Label>
                <Label x={330} y={96} size={18} tone={current[1] ? 'accent' : 'red'} weight={700}>
                  {current[1] ? '✓' : '✗'}
                </Label>
              </>
            ) : null}
            {walking ? <Actor x={dogX} y={136} emoji={DOG_EMOJI[n % DOG_EMOJI.length]} size={28} flip /> : null}
            <g transform="translate(420 30)">
              <Label x={100} y={0} size={11}>
                judge 2 →
              </Label>
              <Label x={75} y={28} size={11} weight={700}>
                pass
              </Label>
              <Label x={145} y={28} size={11} weight={700}>
                fail
              </Label>
              <Label x={-4} y={70} anchor="start" size={11} weight={700}>
                pass
              </Label>
              <Label x={-4} y={140} anchor="start" size={11} weight={700}>
                fail
              </Label>
              {cells.map((count, c) => {
                const agreeCell = c === 0 || c === 3;
                return (
                  <g key={c} transform={`translate(${40 + (c % 2) * 70} ${40 + Math.floor(c / 2) * 70})`}>
                    <rect className={agreeCell ? 'st-fill a' : 'st-fill d'} width={64} height={64} rx={8} />
                    <Label x={32} y={40} size={22} tone="text" weight={700}>
                      {count}
                    </Label>
                  </g>
                );
              })}
              <Label x={-4} y={196} anchor="start" size={10}>
                ↑ judge 1 · green = agree
              </Label>
            </g>
          </>
        );
      }}
    </StoryScene>
  );
}
