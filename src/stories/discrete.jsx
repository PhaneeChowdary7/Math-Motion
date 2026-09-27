import StoryScene, { Actor, Label } from '../components/StoryScene.jsx';
import { lerp, phase, smooth } from '../lib/useTimeline.js';

const bezier = ([x0, y0], [cx, cy], [x1, y1], s) => [
  (1 - s) ** 2 * x0 + 2 * (1 - s) * s * cx + s * s * x1,
  (1 - s) ** 2 * y0 + 2 * (1 - s) * s * cy + s * s * y1,
];

/* Counting: three roads from A to B and two from B to C. A bus drives every
   route once; the count is 3 × 2. */
const TOWNS = { A: [60, 118], B: [320, 118], C: [580, 118] };
const AB = [-70, 0, 70];
const BC = [-55, 55];
const ROUTES = AB.flatMap((_, i) => BC.map((__, j) => [i, j]));
const roadPath = (from, to, bend) => {
  const control = [(from[0] + to[0]) / 2, from[1] + bend * 1.6];
  return { from, control, to, d: `M${from[0]} ${from[1]} Q${control[0]} ${control[1]} ${to[0]} ${to[1]}` };
};
const abRoads = AB.map((bend) => roadPath(TOWNS.A, TOWNS.B, bend));
const bcRoads = BC.map((bend) => roadPath(TOWNS.B, TOWNS.C, bend));

function routeAt(t) {
  const k = phase(t, 0.03, 0.93) * ROUTES.length;
  const index = Math.min(ROUTES.length - 1, Math.floor(k));
  return { index, local: Math.min(1, k - index), done: Math.min(ROUTES.length, Math.floor(k)) };
}

export function BusRoutesStory({ initialT }) {
  const names = ['1', '2', '3'];
  const letters = ['a', 'b'];

  return (
    <StoryScene
      initialT={initialT}
      title="Every bus route from A to C"
      duration={14000}
      height={250}
      caption={(t) => {
        const { index, done } = routeAt(t);
        const [i, j] = ROUTES[index];
        if (t < 0.03) return 'Three roads join town A to town B, and two roads join B to C. How many different ways can a bus get from A to C?';
        if (t < 0.93) return `Route ${index + 1}: road ${names[i]} then road ${letters[j]}. For each of the 3 first roads there are 2 ways to finish, so the routes come in groups of 2. ${done} done so far.`;
        return 'Six routes in all: 3 choices, then 2 choices for each of them. When choices happen one after another, multiply: 3 × 2 = 6.';
      }}
      stats={(t) => {
        const { index, done } = routeAt(t);
        const [i, j] = ROUTES[index];
        return [
          ['current route', t < 0.93 ? `${names[i]} → ${letters[j]}` : '—'],
          ['routes driven', t >= 0.93 ? 6 : done],
          ['rule', '3 × 2 = 6', t >= 0.93],
        ];
      }}
    >
      {(t) => {
        const { index, local, done } = routeAt(t);
        const [i, j] = ROUTES[index];
        const active = t >= 0.03 && t < 0.93;
        const road = local < 0.5 ? abRoads[i] : bcRoads[j];
        const s = local < 0.5 ? local * 2 : (local - 0.5) * 2;
        const [bx, by] = bezier(road.from, road.control, road.to, smooth(s));
        return (
          <>
            {abRoads.map((r, k) => (
              <g key={`ab${k}`}>
                <path d={r.d} className={`st-line ${active && k === i && local < 0.5 ? 'a' : 'muted'}`} strokeWidth={active && k === i ? 4 : 2} />
                <Label x={(r.from[0] + r.to[0]) / 2} y={r.from[1] + AB[k] * 0.8 - 6} size={12} tone="text" weight={700}>
                  {names[k]}
                </Label>
              </g>
            ))}
            {bcRoads.map((r, k) => (
              <g key={`bc${k}`}>
                <path d={r.d} className={`st-line ${active && k === j && local >= 0.5 ? 'b' : 'muted'}`} strokeWidth={active && k === j ? 4 : 2} />
                <Label x={(r.from[0] + r.to[0]) / 2} y={r.from[1] + BC[k] * 0.8 - 6} size={12} tone="text" weight={700}>
                  {letters[k]}
                </Label>
              </g>
            ))}
            {Object.entries(TOWNS).map(([name, [x, y]]) => (
              <g key={name}>
                <circle className="st-fill soft" cx={x} cy={y} r={18} />
                <Label x={x} y={y + 5} size={14} tone="text" weight={700}>
                  {name}
                </Label>
              </g>
            ))}
            {active ? <Actor x={bx} y={by - 14} emoji="🚌" size={24} flip /> : null}
            <g transform="translate(40 222)">
              {ROUTES.map(([a, b], k) => (
                <g key={k} transform={`translate(${k * 95} 0)`} opacity={k < done || t >= 0.93 ? 1 : 0.3}>
                  <rect className={k < done || t >= 0.93 ? 'st-fill a' : 'st-fill soft'} width={80} height={22} rx={6} />
                  <Label x={40} y={15} size={11} tone="text" weight={600}>
                    {names[a]} → {letters[b]}
                  </Label>
                </g>
              ))}
            </g>
          </>
        );
      }}
    </StoryScene>
  );
}

/* Permutations and combinations: three animals try every order for a photo,
   then four animals pick relay pairs where order does not matter. */
const PHOTO = ['🦁', '🐯', '🐇'];
const ORDERS = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
];
const TEAM = ['🦁', '🐯', '🐇', '🐢'];
const PAIRS = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
  [2, 3],
];

export function AnimalPhotoStory({ initialT }) {
  const slotX = [110, 180, 250];
  const photoWindow = [0.03, 0.58];
  const teamWindow = [0.62, 0.94];

  const orderState = (t) => {
    const k = phase(t, ...photoWindow) * ORDERS.length;
    const index = Math.min(ORDERS.length - 1, Math.floor(k));
    return { index, local: Math.min(1, k - index), taken: Math.min(ORDERS.length, Math.floor(k) + (k - Math.floor(k) > 0.4 ? 1 : 0)) };
  };

  return (
    <StoryScene
      initialT={initialT}
      title="Photo orders and relay teams"
      duration={15000}
      height={250}
      caption={(t) => {
        const { index } = orderState(t);
        if (t < 0.03) return 'A lion, a tiger and a rabbit line up for a photo. How many different orders are there?';
        if (t < 0.6) return `Photo ${index + 1}: 3 choices for the first spot, 2 for the second, 1 for the last. Order matters, so these are permutations: 3! = 6.`;
        if (t < 0.95) return 'Now pick 2 of 4 animals for a relay team. Lion-and-tiger is the same team as tiger-and-lion, so order no longer matters.';
        return 'There are 4 × 3 = 12 ordered pairs, but each team is counted twice. So C(4, 2) = 12 ÷ 2 = 6 teams.';
      }}
      stats={(t) => {
        const { taken } = orderState(t);
        const teams = Math.min(6, Math.floor(phase(t, ...teamWindow) * 6.999));
        return [
          ['photos taken', t >= 0.58 ? 6 : taken],
          ['teams found', t >= teamWindow[0] ? teams : '—'],
          ['C(4, 2)', t >= 0.94 ? '6' : '…', t >= 0.94],
        ];
      }}
    >
      {(t) => {
        const { index, local, taken } = orderState(t);
        const previous = ORDERS[Math.max(0, index - 1)];
        const current = ORDERS[index];
        const move = index === 0 ? 1 : smooth(Math.min(1, local / 0.35));
        const flash = local > 0.4 && local < 0.55;
        const teams = Math.min(6, Math.floor(phase(t, ...teamWindow) * 6.999));
        return (
          <>
            <rect className="st-fill soft" x={70} y={40} width={220} height={90} rx={12} />
            {flash ? <rect x={70} y={40} width={220} height={90} rx={12} fill="var(--gold)" opacity={0.25} /> : null}
            <Actor x={180} y={22} emoji="📸" size={20} />
            {PHOTO.map((emoji, animal) => {
              const from = slotX[previous.indexOf(animal)];
              const to = slotX[current.indexOf(animal)];
              return <Actor key={emoji} x={lerp(from, to, move)} y={88 - Math.sin(Math.PI * move) * (from === to ? 0 : 24)} emoji={emoji} size={34} />;
            })}
            <g transform="translate(330 30)">
              <Label x={0} y={0} anchor="start" size={11}>
                photos taken
              </Label>
              {ORDERS.map((order, k) => (
                <g key={k} transform={`translate(${(k % 3) * 94} ${14 + Math.floor(k / 3) * 36})`} opacity={k < taken || t >= 0.58 ? 1 : 0.18}>
                  <rect className="st-fill soft" width={86} height={30} rx={6} />
                  {order.map((animal, slot) => (
                    <Actor key={slot} x={16 + slot * 27} y={15} emoji={PHOTO[animal]} size={17} />
                  ))}
                </g>
              ))}
            </g>
            <g transform="translate(40 150)" opacity={t >= teamWindow[0] - 0.02 ? 1 : 0.2}>
              <Label x={0} y={8} anchor="start" size={11}>
                pick 2 of 4:
              </Label>
              {TEAM.map((emoji, k) => (
                <Actor key={emoji} x={100 + k * 34} y={4} emoji={emoji} size={22} />
              ))}
              {PAIRS.map(([a, b], k) => (
                <g key={k} transform={`translate(${k * 95} 30)`} opacity={k < teams ? 1 : 0.15}>
                  <rect className={k < teams ? 'st-fill a' : 'st-fill soft'} width={84} height={40} rx={8} />
                  <Actor x={28} y={20} emoji={TEAM[a]} size={20} />
                  <Actor x={56} y={20} emoji={TEAM[b]} size={20} />
                </g>
              ))}
            </g>
          </>
        );
      }}
    </StoryScene>
  );
}

/* Logic: two switches wired in series for AND and in parallel for OR, stepped
   through every row of the truth table. */
const ROWS = [
  [false, false],
  [false, true],
  [true, false],
  [true, true],
];

function Switch({ x, y, on, label }) {
  return (
    <g>
      <circle className="st-dot muted" cx={x} cy={y} r={3} />
      <circle className="st-dot muted" cx={x + 30} cy={y} r={3} />
      <line className={`st-line ${on ? 'a' : 'd'}`} x1={x} y1={y} x2={x + (on ? 30 : 26)} y2={y - (on ? 0 : 14)} strokeWidth={3} />
      <Label x={x + 15} y={y - 16} size={11} tone="text" weight={700}>
        {label}
      </Label>
    </g>
  );
}

function Lamp({ x, y, on }) {
  return (
    <g>
      {on ? <circle cx={x} cy={y} r={20} fill="var(--gold)" opacity={0.35} /> : null}
      <Actor x={x} y={y} emoji="💡" size={24} opacity={on ? 1 : 0.3} />
    </g>
  );
}

export function LampCircuitStory({ initialT }) {
  const rowAt = (t) => Math.min(3, Math.floor(phase(t, 0.04, 0.96) * 3.999));

  return (
    <StoryScene
      initialT={initialT}
      title="Switches, lamps and truth tables"
      duration={12000}
      height={240}
      caption={(t) => {
        const [a, b] = ROWS[rowAt(t)];
        if (t < 0.04) return 'Two switches, A and B, control two lamps. The left lamp is wired in series, the right lamp in parallel.';
        if (a && b) return 'Both switches on: current flows through the series circuit too. A AND B is true only in this one row.';
        if (a || b) return `Only ${a ? 'A' : 'B'} is on. The parallel lamp lights, since one path is enough (A OR B), but the series lamp needs both.`;
        return 'Both switches off: no path for current, so both lamps stay dark. AND and OR are both false.';
      }}
    >
      {(t) => {
        const row = rowAt(t);
        const [a, b] = ROWS[row];
        const flow = (t * 8) % 1;
        return (
          <>
            <Label x={120} y={28} size={12}>
              series: A AND B
            </Label>
            <path className="st-line muted" d="M30 70 H70 M100 70 H130 M160 70 H210 V170 H30 V70" strokeWidth={2} />
            <Switch x={70} y={70} on={a} label="A" />
            <Switch x={130} y={70} on={b} label="B" />
            <Lamp x={210} y={120} on={a && b} />
            <Actor x={30} y={120} emoji="🔋" size={22} />
            {a && b ? [0, 0.25, 0.5, 0.75].map((k) => <circle key={k} className="st-dot c" cx={30 + ((flow + k) % 1) * 180} cy={170} r={3} />) : null}

            <Label x={340} y={28} size={12}>
              parallel: A OR B
            </Label>
            <path className="st-line muted" d="M250 100 H280 V60 H300 M330 60 H360 V100 M280 100 V140 H300 M330 140 H360 V100 H420 V180 H250 V100" strokeWidth={2} />
            <Switch x={300} y={60} on={a} label="A" />
            <Switch x={300} y={140} on={b} label="B" />
            <Lamp x={420} y={140} on={a || b} />
            <Actor x={250} y={140} emoji="🔋" size={22} />
            {a || b ? [0, 0.25, 0.5, 0.75].map((k) => <circle key={k} className="st-dot c" cx={250 + ((flow + k) % 1) * 170} cy={180} r={3} />) : null}

            <g transform="translate(460 40)">
              <rect className="st-fill soft" width={160} height={150} rx={10} />
              {['A', 'B', 'AND', 'OR'].map((head, c) => (
                <Label key={head} x={24 + c * 37} y={24} size={11} weight={700}>
                  {head}
                </Label>
              ))}
              {ROWS.map(([ra, rb], r) => (
                <g key={r} transform={`translate(0 ${34 + r * 27})`}>
                  {r === row && t >= 0.04 ? <rect className="st-fill a" x={4} y={0} width={152} height={24} rx={5} /> : null}
                  {[ra, rb, ra && rb, ra || rb].map((value, c) => (
                    <Label key={c} x={24 + c * 37} y={17} size={12} tone={value ? 'accent' : 'muted'} weight={600}>
                      {value ? 'T' : 'F'}
                    </Label>
                  ))}
                </g>
              ))}
            </g>
          </>
        );
      }}
    </StoryScene>
  );
}

/* Induction: a row of dominoes. Knocking the first is the base case; each
   falling domino toppling the next is the inductive step; so they all fall. */
const DOMINOES = 11;

export function DominoStory({ initialT }) {
  const x0 = 70;
  const gap = 48;
  const base = 190;
  const h = 78;
  const w = 12;
  const startAt = (i) => 0.16 + i * 0.062;
  const tip = Math.asin((gap - w) / h);

  const angleAt = (t, i) => {
    const k = smooth(phase(t, startAt(i), startAt(i) + 0.07));
    const limit = i === DOMINOES - 1 ? Math.PI / 2 : tip;
    return k * limit;
  };

  return (
    <StoryScene
      initialT={initialT}
      title="The domino chain"
      duration={11000}
      height={240}
      caption={(t) => {
        const fallen = Array.from({ length: DOMINOES }, (_, i) => angleAt(t, i) > 0.05).filter(Boolean).length;
        if (t < 0.13) return 'A line of dominoes, one for each statement P(1), P(2), P(3), and so on. Two facts will be enough to topple them all.';
        if (fallen <= 1) return 'Base case: push the first domino over. P(1) is true.';
        if (t < 0.9) return `Inductive step: whenever one domino falls, it knocks over the next. If P(k) is true then P(k + 1) is true. ${fallen} have fallen.`;
        return 'Base case plus inductive step, and every domino falls, however long the line. That is proof by induction: P(n) holds for every n.';
      }}
      stats={(t) => {
        const fallen = Array.from({ length: DOMINOES }, (_, i) => angleAt(t, i) > 0.05).filter(Boolean).length;
        return [
          ['base case P(1)', t >= startAt(0) ? 'true' : '…', t >= startAt(0)],
          ['step P(k) ⇒ P(k+1)', 'holds'],
          ['statements proved', fallen],
        ];
      }}
    >
      {(t) => {
        const push = smooth(phase(t, 0.04, startAt(0)));
        return (
          <>
            <line className="st-ground" x1={20} y1={base} x2={620} y2={base} />
            <Actor x={lerp(20, x0 - 16, push)} y={base - h + 10} emoji="👉" size={24} />
            {Array.from({ length: DOMINOES }, (_, i) => {
              const x = x0 + i * gap;
              const angle = angleAt(t, i);
              const down = angle > 0.05;
              return (
                <g key={i}>
                  <g transform={`rotate(${(angle * 180) / Math.PI} ${x + w} ${base})`}>
                    <rect x={x} y={base - h} width={w} height={h} rx={2} className={down ? 'st-dot a' : 'st-fill soft'} stroke="var(--axis)" />
                    <circle cx={x + w / 2} cy={base - h + 16} r={2} fill="var(--panel)" />
                    <circle cx={x + w / 2} cy={base - h + 52} r={2} fill="var(--panel)" />
                  </g>
                  <Label x={x + w / 2} y={base + 18} size={10} tone={down ? 'accent' : 'muted'} weight={down ? 700 : 400}>
                    P({i + 1})
                  </Label>
                </g>
              );
            })}
            <Label x={x0 + DOMINOES * gap + 10} y={base - 30} anchor="start" size={16} tone="muted">
              …
            </Label>
          </>
        );
      }}
    </StoryScene>
  );
}
