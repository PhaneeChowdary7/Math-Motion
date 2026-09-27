import StoryScene, { Actor, Label, makePlot } from '../components/StoryScene.jsx';
import { clamp, lerp, phase, smooth } from '../lib/useTimeline.js';

const fmt = (value, digits = 2) => (Math.round(value * 10 ** digits) / 10 ** digits).toString();

/* Coordinate plane: an aeroplane loops through all four quadrants while the
   radar reads out its coordinates. */
const QUADRANTS = {
  1: 'Quadrant I: x positive, y positive',
  2: 'Quadrant II: x negative, y positive',
  3: 'Quadrant III: both negative',
  4: 'Quadrant IV: x positive, y negative',
};

function planeAt(t) {
  const theta = 0.35 + t * Math.PI * 2;
  return { x: 4 * Math.cos(theta), y: 3 * Math.sin(theta), dx: -4 * Math.sin(theta), dy: 3 * Math.cos(theta) };
}

function quadrantOf(x, y) {
  if (x >= 0 && y >= 0) return 1;
  if (x < 0 && y >= 0) return 2;
  if (x < 0) return 3;
  return 4;
}

export function PlaneRadarStory({ initialT }) {
  const unit = 22;
  const cx = 320;
  const cy = 130;
  const px = (x) => cx + x * unit;
  const py = (y) => cy - y * unit;

  return (
    <StoryScene
      initialT={initialT}
      title="Tracking an aeroplane on radar"
      duration={11000}
      height={260}
      caption={(t) => {
        const { x, y } = planeAt(t);
        return `${QUADRANTS[quadrantOf(x, y)]}. The radar only needs two numbers to pin the plane down: how far across, then how far up.`;
      }}
      stats={(t) => {
        const { x, y } = planeAt(t);
        return [
          ['x', fmt(x, 1)],
          ['y', fmt(y, 1)],
          ['quadrant', ['I', 'II', 'III', 'IV'][quadrantOf(x, y) - 1], true],
        ];
      }}
    >
      {(t) => {
        const { x, y, dx, dy } = planeAt(t);
        const heading = (Math.atan2(-dy, dx) * 180) / Math.PI;
        let trail = '';
        for (let s = 0; s <= t; s += 0.005) {
          const point = planeAt(s);
          trail += `${trail ? 'L' : 'M'}${px(point.x).toFixed(1)} ${py(point.y).toFixed(1)}`;
        }
        const grid = [];
        for (let i = -5; i <= 5; i += 1) {
          grid.push(<line className="st-grid" key={`v${i}`} x1={px(i)} y1={py(5)} x2={px(i)} y2={py(-5)} />);
          grid.push(<line className="st-grid" key={`h${i}`} x1={px(-5)} y1={py(i)} x2={px(5)} y2={py(i)} />);
        }
        const q = quadrantOf(x, y);

        return (
          <>
            {grid}
            <line className="st-axis" x1={px(-5.5)} y1={cy} x2={px(5.5)} y2={cy} />
            <line className="st-axis" x1={cx} y1={py(5.5)} x2={cx} y2={py(-5.5)} />
            {['I', 'II', 'III', 'IV'].map((name, i) => (
              <Label
                key={name}
                x={px([3.8, -3.8, -3.8, 3.8][i])}
                y={py([4.4, 4.4, -4.6, -4.6][i])}
                size={13}
                weight={700}
                tone={q === i + 1 ? 'accent' : 'muted'}
              >
                {name}
              </Label>
            ))}
            <path className="st-line a" d={trail} opacity={0.55} />
            <line className="st-dash" x1={px(x)} y1={py(y)} x2={px(x)} y2={cy} />
            <line className="st-dash" x1={px(x)} y1={py(y)} x2={cx} y2={py(y)} />
            <Actor x={px(x)} y={py(y)} emoji="✈️" size={24} rotate={heading + 45} />
          </>
        );
      }}
    </StoryScene>
  );
}

/* Functions: numbers ride a conveyor into a function machine and come out as
   outputs, each pair landing as a point on the graph. */
const INPUTS = [-2, -1, 0, 1, 2];
const square = (x) => x * x;

export function FunctionMachineStory({ initialT }) {
  const plot = makePlot({ left: 410, top: 30, width: 200, height: 180, x0: -2.5, x1: 2.5, y0: 0, y1: 4.5 });
  const machine = { x: 170, y: 90, w: 110, h: 70 };

  return (
    <StoryScene
      initialT={initialT}
      title="The function machine"
      duration={12000}
      height={240}
      caption={(t) => {
        const i = Math.min(INPUTS.length - 1, Math.floor(t * INPUTS.length));
        const x = INPUTS[i];
        if (t >= 0.97) return 'Five inputs, five outputs. Join the points and the graph of f(x) = x² appears: a picture of every input-output pair at once.';
        return `${x} goes in, ${square(x)} comes out, and (${x}, ${square(x)}) becomes a point.${x === 2 ? ' −2 and 2 share an output: allowed, since each input still gets exactly one.' : ''}`;
      }}
      stats={(t) => {
        const i = Math.min(INPUTS.length - 1, Math.floor(t * INPUTS.length));
        return [
          ['input x', INPUTS[i]],
          ['rule', 'x²'],
          ['output f(x)', square(INPUTS[i]), true],
        ];
      }}
    >
      {(t) => {
        const slot = 1 / INPUTS.length;
        return (
          <>
            <rect className="st-road" x={10} y={machine.y + machine.h - 8} width={390} height={10} rx={5} />
            <rect className="st-fill a" x={machine.x} y={machine.y} width={machine.w} height={machine.h} rx={12} stroke="var(--accent)" />
            <Label x={machine.x + machine.w / 2} y={machine.y + 32} size={16} tone="text" weight={700}>
              f(x) = x²
            </Label>
            <Actor x={machine.x + machine.w / 2} y={machine.y + 52} emoji="⚙️" size={16} rotate={t * 1440} />
            {plot.axes}
            <line className="st-grid" x1={plot.sx(0)} y1={plot.sy(0)} x2={plot.sx(0)} y2={plot.sy(4.5)} />
            {[-2, -1, 1, 2].map((x) => (
              <Label key={x} x={plot.sx(x)} y={plot.sy(0) + 16} size={10}>
                {x}
              </Label>
            ))}
            {t >= 0.97 ? <path className="st-line a" d={plot.path(square, -2.1, 2.1)} opacity={phase(t, 0.97, 1)} /> : null}
            {INPUTS.map((x, i) => {
              const local = phase(t, i * slot, (i + 1) * slot);
              const placed = t >= (i + 0.85) * slot;
              const ball = [];
              if (local > 0 && local < 1) {
                if (local < 0.4) {
                  const k = smooth(local / 0.4);
                  ball.push({ x: lerp(30, machine.x + 10, k), y: machine.y + machine.h - 22, text: x, tone: 'b' });
                } else if (local > 0.55) {
                  const k = smooth(phase(local, 0.55, 0.85));
                  ball.push({
                    x: lerp(machine.x + machine.w - 10, plot.sx(x), k),
                    y: lerp(machine.y + machine.h - 22, plot.sy(square(x)), k) - Math.sin(Math.PI * k) * 40,
                    text: square(x),
                    tone: 'a',
                  });
                }
              }
              return (
                <g key={x}>
                  {placed ? <circle className="st-dot a" cx={plot.sx(x)} cy={plot.sy(square(x))} r={5} /> : null}
                  {placed ? (
                    <Label x={plot.sx(x)} y={plot.sy(square(x)) - 10} size={10}>
                      ({x}, {square(x)})
                    </Label>
                  ) : null}
                  {ball.map((b) => (
                    <g key="ball">
                      <circle className={`st-dot ${b.tone}`} cx={b.x} cy={b.y} r={13} />
                      <Label x={b.x} y={b.y + 4} size={12} tone="text" weight={700}>
                        <tspan fill="var(--panel)">{b.text}</tspan>
                      </Label>
                    </g>
                  ))}
                </g>
              );
            })}
          </>
        );
      }}
    </StoryScene>
  );
}

/* Lines and slope: a car and a bus climb straight roads side by side. Same
   run, different rise: the slope is the ratio. */
export function HillRoadStory({ initialT }) {
  const plot = makePlot({ left: 50, top: 20, width: 540, height: 200, x0: 0, x1: 8, y0: 0, y1: 12 });
  const roads = [
    { m: 0.5, emoji: '🚗', tone: 'a', name: 'car' },
    { m: 1.5, emoji: '🚌', tone: 'b', name: 'bus' },
  ];

  return (
    <StoryScene
      initialT={initialT}
      title="Two roads, two slopes"
      duration={9000}
      height={250}
      caption={(t) => {
        if (t < 0.05) return 'A car and a bus set off up two straight roads, covering the same distance across each second.';
        if (t < 0.9) return 'Every 2 across, the car rises 1 and the bus rises 3. Rise over run never changes along a straight road: slope 0.5 versus 1.5.';
        return 'A straight road has the same steepness everywhere, which is exactly what a constant slope means. The bus road is three times as steep, so it climbs three times as fast.';
      }}
      stats={(t) => [
        ['car height', fmt(0.5 * t * 8, 1)],
        ['bus height', fmt(1.5 * t * 8, 1)],
        ['slopes', '0.5 vs 1.5', true],
      ]}
    >
      {(t) => {
        const run = t * 8;
        return (
          <>
            {plot.axes}
            {roads.map((road) => {
              const angle = (Math.atan2(plot.sy(0) - plot.sy(road.m), plot.sx(1) - plot.sx(0)) * 180) / Math.PI;
              const steps = [];
              for (let x = 0; x + 2 <= run + 0.001; x += 2) {
                steps.push(
                  <g key={x}>
                    <path
                      className={`st-line ${road.tone}`}
                      d={`M${plot.sx(x)} ${plot.sy(road.m * x)} H${plot.sx(x + 2)} V${plot.sy(road.m * (x + 2))}`}
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                    />
                    <Label x={plot.sx(x + 2) + 12} y={(plot.sy(road.m * x) + plot.sy(road.m * (x + 2))) / 2 + 4} size={10} tone={road.tone === 'a' ? 'accent' : 'blue'}>
                      {road.m * 2}
                    </Label>
                  </g>
                );
              }
              return (
                <g key={road.name}>
                  <path className="st-line muted" d={plot.path((x) => road.m * x, 0, 8)} strokeWidth={8} opacity={0.35} />
                  {steps}
                  <Actor x={plot.sx(run)} y={plot.sy(road.m * run) - 12} emoji={road.emoji} size={24} flip rotate={-angle} />
                </g>
              );
            })}
            <Label x={plot.sx(4)} y={plot.sy(0) + 18} size={11}>
              each step: run 2 across
            </Label>
          </>
        );
      }}
    </StoryScene>
  );
}

/* Exponents: rabbits double every generation while tortoises add two. The
   tortoises lead at first; doubling wins for good at generation 3. */
const GENERATIONS = 6;
const rabbits = (g) => 2 ** g;
const tortoises = (g) => 1 + 2 * g;

export function RabbitGrowthStory({ initialT }) {
  const plot = makePlot({ left: 440, top: 24, width: 170, height: 180, x0: 0, x1: GENERATIONS, y0: 0, y1: 64 });
  const genAt = (t) => Math.min(GENERATIONS, Math.floor(t * (GENERATIONS + 0.999)));

  return (
    <StoryScene
      initialT={initialT}
      title="Rabbits double, tortoises add"
      duration={12000}
      height={240}
      caption={(t) => {
        const g = genAt(t);
        if (g === 0) return 'One rabbit and one tortoise. Each generation the rabbits double; the tortoises gain two.';
        if (g < 3) return `Generation ${g}: ${rabbits(g)} rabbits, ${tortoises(g)} tortoises. Adding a steady 2 is actually ahead for now.`;
        if (g === 3) return 'Generation 3: 8 rabbits against 7 tortoises. Doubling has just overtaken, and it never looks back.';
        if (g < GENERATIONS) return `Generation ${g}: ${rabbits(g)} against ${tortoises(g)}. Each doubling adds more than the whole population before it.`;
        return 'Generation 6: 64 rabbits, 13 tortoises. Asking “how many doublings reach 64?” is a logarithm: log₂ 64 = 6.';
      }}
      stats={(t) => {
        const g = genAt(t);
        return [
          ['generation', g],
          ['rabbits 2ⁿ', rabbits(g), rabbits(g) > tortoises(g)],
          ['tortoises 1 + 2n', tortoises(g)],
        ];
      }}
    >
      {(t) => {
        const g = genAt(t);
        const pop = clamp((t * (GENERATIONS + 0.999) - g) * 4);
        const bunnies = [];
        for (let i = 0; i < rabbits(g); i += 1) {
          const fresh = i >= rabbits(g) / 2 && g > 0;
          bunnies.push(
            <Actor key={i} x={30 + (i % 16) * 24} y={40 + Math.floor(i / 16) * 26} emoji="🐇" size={18} opacity={fresh ? pop : 1} />
          );
        }
        const shells = [];
        for (let i = 0; i < tortoises(g); i += 1) {
          shells.push(<Actor key={i} x={30 + i * 26} y={200} emoji="🐢" size={18} opacity={i >= tortoises(g) - 2 && g > 0 ? pop : 1} />);
        }
        const gens = Array.from({ length: g + 1 }, (_, i) => i);
        return (
          <>
            {bunnies}
            <line className="st-ground" x1={16} y1={174} x2={410} y2={174} />
            {shells}
            {plot.axes}
            <path className="st-line b" d={gens.map((i) => `${i ? 'L' : 'M'}${plot.sx(i)} ${plot.sy(rabbits(i))}`).join('')} />
            <path className="st-line c" d={gens.map((i) => `${i ? 'L' : 'M'}${plot.sx(i)} ${plot.sy(tortoises(i))}`).join('')} />
            {gens.map((i) => (
              <g key={i}>
                <circle className="st-dot b" cx={plot.sx(i)} cy={plot.sy(rabbits(i))} r={3.5} />
                <circle className="st-dot c" cx={plot.sx(i)} cy={plot.sy(tortoises(i))} r={3.5} />
              </g>
            ))}
            <Label x={plot.sx(0) + 4} y={plot.sy(64) - 6} anchor="start" size={11} tone="blue">
              rabbits
            </Label>
            <Label x={plot.sx(GENERATIONS)} y={plot.sy(0) + 16} anchor="end" size={10}>
              generation
            </Label>
          </>
        );
      }}
    </StoryScene>
  );
}

/* Sequences and series: each hop covers half the remaining distance to the
   carrot. Infinitely many hops, but the total never passes 1. */
const HOPS = 10;

export function ZenoHareStory({ initialT }) {
  const x0 = 40;
  const x1 = 590;
  const at = (d) => x0 + (x1 - x0) * d;
  const hopWindow = [0.04, 0.86];

  const progress = (t) => {
    const k = phase(t, ...hopWindow) * HOPS;
    const n = Math.min(HOPS, Math.floor(k));
    const frac = n >= HOPS ? 0 : k - n;
    const before = 1 - 2 ** -n;
    const after = 1 - 2 ** -(n + 1);
    return { n, frac, pos: lerp(before, after, smooth(frac)) };
  };

  return (
    <StoryScene
      initialT={initialT}
      title="Half the way, every time"
      duration={13000}
      height={220}
      caption={(t) => {
        const { n } = progress(t);
        if (t < 0.04) return 'The rabbit wants the carrot, 1 metre away. Each hop covers exactly half of whatever distance is left.';
        if (n < 4) return `Hop ${n + 1} covers ${['1/2', '1/4', '1/8', '1/16'][n]} of a metre. The hops shrink by the same ratio each time: a geometric sequence with r = 1/2.`;
        if (t < 0.9) return `After ${n} hops the rabbit has covered 1 − 1/2^${n} of the way. The gap halves forever but never goes negative.`;
        return 'Add every hop and the series 1/2 + 1/4 + 1/8 + … sums to exactly 1. An infinite number of terms, a finite total, because |r| < 1.';
      }}
      stats={(t) => {
        const { n, pos } = progress(t);
        return [
          ['hops', n],
          ['distance covered', fmt(pos, 4)],
          ['still to go', fmt(1 - pos, 4), t >= 0.9],
        ];
      }}
    >
      {(t) => {
        const { n, frac, pos } = progress(t);
        const segments = [];
        for (let i = 0; i < n; i += 1) {
          const a = 1 - 2 ** -i;
          const b = 1 - 2 ** -(i + 1);
          segments.push(
            <g key={i}>
              <rect className={`st-block ${i % 2 ? 'b' : 'a'}`} x={at(a) + 0.7} y={150} width={Math.max(0.5, at(b) - at(a) - 1.4)} height={22} rx={Math.min(3, (at(b) - at(a)) / 4)} />
              {i < 4 ? (
                <Label x={(at(a) + at(b)) / 2} y={190} size={11} tone="text">
                  1/{2 ** (i + 1)}
                </Label>
              ) : null}
            </g>
          );
        }
        return (
          <>
            <line className="st-ground" x1={20} y1={130} x2={620} y2={130} />
            <rect className="st-fill soft" x={x0} y={150} width={x1 - x0} height={22} />
            {segments}
            <line className="st-axis" x1={at(1)} y1={144} x2={at(1)} y2={178} />
            <Label x={at(0)} y={210} size={11}>
              0
            </Label>
            <Label x={at(1)} y={210} size={11}>
              1 m
            </Label>
            <Actor x={at(1) + 14} y={112} emoji="🥕" size={24} />
            <Actor x={at(pos)} y={112 - Math.sin(Math.PI * frac) * 40} emoji="🐇" size={28} flip />
          </>
        );
      }}
    </StoryScene>
  );
}
