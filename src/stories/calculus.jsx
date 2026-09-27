import StoryScene, { Actor, Label, makePlot } from '../components/StoryScene.jsx';
import { lerp, phase, smooth } from '../lib/useTimeline.js';

const fmt = (value, digits = 1) => {
  const rounded = Math.round(value * 10 ** digits) / 10 ** digits;
  return (Object.is(rounded, -0) ? 0 : rounded).toFixed(digits);
};

function Speedometer({ x, y, value, max, unit, highlight }) {
  const angle = Math.PI * (1 - Math.min(value, max) / max);
  const r = 46;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className="st-fill soft" d={`M${-r - 8} 0 A${r + 8} ${r + 8} 0 0 1 ${r + 8} 0 Z`} />
      <path className="st-line muted" d={`M${-r} 0 A${r} ${r} 0 0 1 ${r} 0`} />
      {ticks.map((k) => {
        const a = Math.PI * (1 - k);
        return (
          <g key={k}>
            <line className="st-axis" x1={Math.cos(a) * (r - 6)} y1={-Math.sin(a) * (r - 6)} x2={Math.cos(a) * r} y2={-Math.sin(a) * r} />
            <Label x={Math.cos(a) * (r - 16)} y={-Math.sin(a) * (r - 16) + 4} size={8}>
              {Math.round(k * max)}
            </Label>
          </g>
        );
      })}
      <line className={`st-line ${highlight ? 'a' : 'd'}`} x1={0} y1={0} x2={Math.cos(angle) * (r - 4)} y2={-Math.sin(angle) * (r - 4)} />
      <circle className="st-dot muted" r={4} />
      <Label x={0} y={18} size={13} tone="text" weight={700}>
        {fmt(value, 0)} {unit}
      </Label>
    </g>
  );
}

/* Derivatives: an accelerating car. The speedometer shows the slope of the
   position graph at each instant: the derivative. */
export function SpeedometerStory({ initialT }) {
  const T = 5;
  const pos = (s) => 2 * s * s;
  const speed = (s) => 4 * s;
  const plot = makePlot({ left: 400, top: 20, width: 210, height: 170, x0: 0, x1: T, y0: 0, y1: 50 });

  return (
    <StoryScene
      initialT={initialT}
      title="What the speedometer measures"
      duration={10000}
      height={230}
      caption={(t) => {
        const s = t * T;
        if (t < 0.03) return 'A car pulls away and speeds up. Its distance from the start is s(t) = 2t² metres.';
        if (t < 0.95) return `The speedometer reads ${fmt(speed(s))} m/s: exactly the slope of the tangent on the distance graph right now.`;
        return 'The speedometer never averages over a stretch of road. It reports the rate of change at one instant: the derivative s′(t) = 4t.';
      }}
      stats={(t) => {
        const s = t * T;
        return [
          ['time', `${fmt(s)} s`],
          ['distance s(t)', `${fmt(pos(s))} m`],
          ["speed s′(t)", `${fmt(speed(s))} m/s`, true],
        ];
      }}
    >
      {(t) => {
        const s = t * T;
        const roadX = (m) => 30 + (m / 50) * 330;
        const m = speed(s);
        const tangent = (x) => pos(s) + m * (x - s);
        return (
          <>
            <rect className="st-road" x={20} y={40} width={350} height={34} rx={8} />
            <line className="st-dash" x1={20} y1={57} x2={370} y2={57} />
            <Actor x={roadX(pos(s))} y={54} emoji="🚗" size={26} flip />
            <Label x={30} y={92} anchor="start" size={10}>
              0 m
            </Label>
            <Label x={360} y={92} anchor="end" size={10}>
              50 m
            </Label>
            <Speedometer x={195} y={190} value={m} max={20} unit="m/s" highlight />
            {plot.axes}
            <path className="st-line muted" d={plot.path(pos)} strokeDasharray="4 5" />
            <path className="st-line a" d={plot.path(pos, 0, s)} />
            <path className="st-line c" d={plot.path(tangent, Math.max(0, s - 1.2), Math.min(T, s + 1.2))} />
            <circle className="st-dot a" cx={plot.sx(s)} cy={plot.sy(pos(s))} r={4.5} />
            <Label x={plot.sx(T)} y={plot.sy(0) + 16} anchor="end" size={10}>
              time (s)
            </Label>
            <Label x={plot.sx(0) + 4} y={plot.sy(50) + 4} anchor="start" size={10}>
              distance
            </Label>
          </>
        );
      }}
    </StoryScene>
  );
}

/* Product rule: a field whose width and length both grow. The new area each
   moment is two strips, u′v and uv′, plus a corner that vanishes. */
export function GrowingFieldStory({ initialT }) {
  const T = 4;
  const u = (s) => 2 + s;
  const v = (s) => 1 + 0.5 * s;
  const scale = 50;
  const ox = 150;
  const oy = 214;
  const dt = 0.6;

  return (
    <StoryScene
      initialT={initialT}
      title="A field that grows both ways"
      duration={10000}
      height={240}
      caption={(t) => {
        if (t < 0.05) return 'A farmer’s field is u metres wide and v metres long, and both keep growing: width at 1 m/s, length at 0.5 m/s.';
        if (t < 0.9) return 'New area arrives as two strips: u′v (gold, width growing) and uv′ (blue, length growing). The red corner vanishes as the step shrinks.';
        return 'So the area grows at (uv)′ = u′v + uv′. Two strips, not one, which is why the derivative of a product is not the product of the derivatives.';
      }}
      stats={(t) => {
        const s = t * T;
        return [
          ['area uv', `${fmt(u(s) * v(s))} m²`],
          ["u′v + uv′", `${fmt(1 * v(s) + u(s) * 0.5)} m²/s`, true],
        ];
      }}
    >
      {(t) => {
        const s = t * T;
        const s0 = Math.max(0, s - dt);
        const [U, V, U0, V0] = [u(s), v(s), u(s0), v(s0)].map((value) => value * scale);
        return (
          <>
            <rect className="st-block a" x={ox} y={oy - V0} width={U0} height={V0} rx={3} />
            <rect className="st-block c" x={ox + U0 + 1.4} y={oy - V0} width={Math.max(0, U - U0 - 1.4)} height={V0} rx={2} />
            <rect className="st-block b" x={ox} y={oy - V} width={U0} height={Math.max(0, V - V0 - 1.4)} rx={2} />
            <rect className="st-block d" x={ox + U0 + 1.4} y={oy - V} width={Math.max(0, U - U0 - 1.4)} height={Math.max(0, V - V0 - 1.4)} rx={1.5} />
                        <Label x={ox + U0 / 2} y={oy - V0 / 2 + 4} size={12} tone="text" weight={600}>
              uv
            </Label>
            {U - U0 > 18 ? (
              <Label x={ox + U0 + (U - U0) / 2} y={oy - V0 / 2 + 4} size={11} tone="text" weight={700}>
                u′v
              </Label>
            ) : null}
            {V - V0 > 14 ? (
              <Label x={ox + U0 / 2} y={oy - V0 - (V - V0) / 2 + 4} size={11} tone="text" weight={700}>
                uv′
              </Label>
            ) : null}
            <Actor x={ox + U + 16} y={oy - V / 2} emoji="🚜" size={24} flip />
            <Label x={ox + U / 2} y={oy + 18} size={11}>
              width u = {fmt(u(s))} m
            </Label>
          </>
        );
      }}
    </StoryScene>
  );
}

/* Chain rule: three meshed gears. Rates multiply along the chain. */
function Gear({ x, y, r, teeth, angle, tone }) {
  const deg = (angle * 180) / Math.PI;
  const toothW = Math.min(7, ((2 * Math.PI * r) / teeth) * 0.5);
  return (
    <g transform={`translate(${x} ${y}) rotate(${deg})`}>
      {Array.from({ length: teeth }, (_, i) => (
        <rect key={i} className={`st-block ${tone}`} x={-toothW / 2} y={-r - 5} width={toothW} height={8} rx={1.6} transform={`rotate(${(i * 360) / teeth})`} />
      ))}
      <circle className={`st-block ${tone}`} r={r} />
      <circle r={r * 0.62} fill="none" stroke="var(--panel)" strokeWidth={1.4} opacity={0.55} />
      <rect x={-1.6} y={-r * 0.62} width={3.2} height={r * 0.62} rx={1.6} fill="var(--panel)" opacity={0.85} />
      <circle r={Math.max(3, r * 0.16)} fill="var(--panel)" />
    </g>
  );
}

export function GearsStory({ initialT }) {
  const gears = [
    { name: 'pedal x', x: 230, r: 64, teeth: 24, ratio: 1, tone: 'a' },
    { name: 'middle u', x: 230 + 64 + 32 + 8, r: 32, teeth: 12, ratio: -2, tone: 'c' },
    { name: 'wheel y', x: 334 + 32 + 21 + 8, r: 21, teeth: 8, ratio: 3, tone: 'b' },
  ];
  const turnsA = 2;

  return (
    <StoryScene
      initialT={initialT}
      title="Gears multiply rates"
      duration={10000}
      height={230}
      caption={(t) => {
        if (t < 0.05) return 'Three meshed gears, like a bicycle’s pedals, chain and wheel. The middle gear has half the teeth of the first; the last has two thirds of the middle’s.';
        if (t < 0.9) return 'One turn of the big gear spins the middle one twice; each middle turn spins the small one 1.5 times. So the small gear goes 2 × 1.5 = 3 times as fast.';
        return 'That is the chain rule: dy/dx = dy/du · du/dx = 1.5 × 2 = 3. Rates along a chain of dependencies multiply.';
      }}
      stats={(t) => {
        const a = turnsA * t;
        return [
          ['big gear turns', fmt(a, 2)],
          ['small gear turns', fmt(3 * a, 2)],
          ['dy/dx', '1.5 × 2 = 3', true],
        ];
      }}
    >
      {(t) => {
        const base = turnsA * t * 2 * Math.PI;
        return (
          <>
            {gears.map((gear, i) => (
              <g key={gear.name}>
                <Gear x={gear.x} y={115} r={gear.r} teeth={gear.teeth} angle={base * gear.ratio + (i === 1 ? Math.PI / 12 : 0)} tone={gear.tone} />
                <Label x={gear.x} y={115 + 64 + 28} size={11}>
                  {gear.name}
                </Label>
              </g>
            ))}
          </>
        );
      }}
    </StoryScene>
  );
}

/* Mean Value Theorem: an average-speed camera. 120 km in 1.5 hours means the
   car was doing exactly 80 km/h at some instant. */
export function SpeedCameraStory({ initialT }) {
  const pos = (k) => 120 * (k - 0.08 * Math.sin(2 * Math.PI * k));
  const speed = (k) => 80 * (1 - 0.16 * Math.PI * Math.cos(2 * Math.PI * k));
  const plot = makePlot({ left: 410, top: 20, width: 200, height: 160, x0: 0, x1: 1, y0: 0, y1: 120 });
  const hit = (k) => Math.abs(k - 0.25) < 0.025 || Math.abs(k - 0.75) < 0.025;

  return (
    <StoryScene
      initialT={initialT}
      title="The average-speed camera"
      duration={11000}
      height={240}
      caption={(t) => {
        if (t < 0.03) return 'Two cameras sit 120 km apart. A car passes the first at noon and the second at 1:30 pm. Its average speed: 120 ÷ 1.5 = 80 km/h.';
        if (hit(t)) return 'Right now the speedometer reads exactly 80 km/h, and the tangent on the graph is parallel to the average line. The theorem promised this moment.';
        if (t < 0.97) return 'The car speeds up and slows down. The theorem says that somewhere its instantaneous speed must equal the average, however it drove.';
        return 'It happened twice here. That is why average-speed cameras work: a car averaging over the limit must have been over the limit at some instant.';
      }}
      stats={(t) => [
        ['distance', `${fmt(pos(t), 0)} km`],
        ['speedometer', `${fmt(speed(t), 0)} km/h`, hit(t)],
        ['average', '80 km/h'],
      ]}
    >
      {(t) => {
        const roadX = (km) => 40 + (km / 120) * 320;
        const slope = speed(t) * 1.5;
        const tangent = (k) => pos(t) + slope * (k - t);
        return (
          <>
            <rect className="st-road" x={30} y={46} width={340} height={32} rx={8} />
            <Actor x={roadX(0)} y={28} emoji="📷" size={18} />
            <Actor x={roadX(120)} y={28} emoji="📷" size={18} />
            <Actor x={roadX(pos(t))} y={60} emoji="🚗" size={24} flip />
            <Label x={roadX(0)} y={96} size={10}>
              0 km
            </Label>
            <Label x={roadX(120)} y={96} size={10}>
              120 km
            </Label>
            <Speedometer x={200} y={196} value={speed(t)} max={160} unit="km/h" highlight={hit(t)} />
            {plot.axes}
            <line className="st-line b" x1={plot.sx(0)} y1={plot.sy(0)} x2={plot.sx(1)} y2={plot.sy(120)} strokeDasharray="5 5" strokeWidth={1.5} />
            <path className="st-line muted" d={plot.path(pos)} strokeDasharray="3 5" />
            <path className="st-line a" d={plot.path(pos, 0, t)} />
            <path className={`st-line ${hit(t) ? 'a' : 'c'}`} d={plot.path(tangent, Math.max(0, t - 0.18), Math.min(1, t + 0.18))} />
            <circle className="st-dot a" cx={plot.sx(t)} cy={plot.sy(pos(t))} r={4.5} />
            <Label x={plot.sx(1)} y={plot.sy(0) + 16} anchor="end" size={10}>
              time
            </Label>
            <Label x={plot.sx(0.5) + 22} y={plot.sy(60) + 20} anchor="start" size={10} tone="blue">
              average 80
            </Label>
          </>
        );
      }}
    </StoryScene>
  );
}

/* L'Hôpital: a hare and a tortoise both reach the finish at the same moment.
   The gaps both shrink to 0, but their ratio settles on the ratio of speeds. */
export function RaceToZeroStory({ initialT }) {
  const f = (x) => 3 * x - 0.8 * x * x;
  const g = (x) => x;
  const xAt = (t) => Math.max(0.0005, 1 - smooth(phase(t, 0.04, 0.92)));

  return (
    <StoryScene
      initialT={initialT}
      title="Two runners, one finish line"
      duration={10000}
      height={210}
      caption={(t) => {
        const x = xAt(t);
        if (t < 0.04) return 'A hare and a tortoise are closing on the finish line, and they will cross at the same instant. Call the hare’s gap f and the tortoise’s gap g.';
        if (t < 0.92) return `Both gaps are shrinking toward 0, so f/g heads for the form 0/0. Yet the ratio is steady: ${fmt(f(x) / g(x), 3)}, closing in on 3.`;
        return 'At the finish both gaps are 0, but the ratio of gaps tends to the ratio of speeds: f′/g′ = 3/1. That is L’Hôpital’s rule in a race.';
      }}
      stats={(t) => {
        const x = xAt(t);
        return [
          ['hare gap f', fmt(f(x), 3)],
          ['tortoise gap g', fmt(g(x), 3)],
          ['ratio f / g', fmt(f(x) / g(x), 3), t >= 0.92],
        ];
      }}
    >
      {(t) => {
        const x = xAt(t);
        const finish = 590;
        const unit = 240;
        return (
          <>
            {[70, 140].map((y) => (
              <rect key={y} className="st-road" x={20} y={y - 20} width={600} height={40} rx={8} />
            ))}
            <line className="st-line a" x1={finish} y1={40} x2={finish} y2={170} strokeWidth={4} strokeDasharray="6 4" />
            <Actor x={finish} y={24} emoji="🏁" size={20} />
            <Actor x={finish - f(x) * unit} y={68} emoji="🐇" size={28} flip />
            <Actor x={finish - g(x) * unit} y={138} emoji="🐢" size={28} flip />
            <line className="st-line b" x1={finish - f(x) * unit + 16} y1={94} x2={finish} y2={94} strokeWidth={2} />
            <line className="st-line c" x1={finish - g(x) * unit + 16} y1={164} x2={finish} y2={164} strokeWidth={2} />
            <Label x={30} y={100} anchor="start" size={11} tone="blue">
              hare gap f = {fmt(f(x), 2)}
            </Label>
            <Label x={30} y={170} anchor="start" size={11} tone="gold">
              tortoise gap g = {fmt(g(x), 2)}
            </Label>
          </>
        );
      }}
    </StoryScene>
  );
}

/* Optimization: 20 m of fence. Sweep the width and the enclosed area peaks
   when the field is a square. */
export function FenceStory({ initialT }) {
  const area = (w) => w * (10 - w);
  const widthAt = (t) => (t < 0.8 ? 1 + 8 * phase(t, 0.03, 0.8) : lerp(9, 5, smooth(phase(t, 0.82, 0.95))));
  const plot = makePlot({ left: 400, top: 24, width: 210, height: 170, x0: 0, x1: 10, y0: 0, y1: 27 });

  return (
    <StoryScene
      initialT={initialT}
      title="Fencing the biggest field"
      duration={11000}
      height={240}
      caption={(t) => {
        const w = widthAt(t);
        if (t < 0.03) return 'A farmer has 20 m of fence for a rectangular sheep pen. Width w leaves 10 − w for the length.';
        if (t < 0.8) return `Width ${fmt(w)} m, length ${fmt(10 - w)} m: area ${fmt(area(w))} m². Watch the area rise, level off, then fall.`;
        return 'The best pen is a 5 × 5 square, 25 m². At the peak the area graph is flat: A′(w) = 10 − 2w = 0 gives w = 5.';
      }}
      stats={(t) => {
        const w = widthAt(t);
        return [
          ['width', `${fmt(w)} m`],
          ['area', `${fmt(area(w))} m²`, Math.abs(w - 5) < 0.15],
          ["A′(w)", fmt(10 - 2 * w, 1)],
        ];
      }}
    >
      {(t) => {
        const w = widthAt(t);
        const s = 23;
        const W = w * s;
        const L = (10 - w) * s;
        const ox = 30 + (230 - W) / 2;
        const oy = 8 + (212 - L) / 2;
        const sheep = Math.max(1, Math.floor(area(w) / 3));
        const flock = [];
        for (let i = 0; i < sheep; i += 1) {
          const cols = Math.max(1, Math.floor(W / 22));
          const x = ox + 12 + (i % cols) * 22;
          const y = oy + 14 + Math.floor(i / cols) * 22;
          if (x < ox + W - 6 && y < oy + L - 6) flock.push(<Actor key={i} x={x} y={y} emoji="🐑" size={15} />);
        }
        return (
          <>
            <rect x={ox} y={oy} width={W} height={L} className="st-fill a" stroke="var(--accent-strong)" strokeWidth={3} strokeDasharray="8 4" />
            {flock}
            <Label x={ox + W / 2} y={Math.min(236, oy + L + 14)} size={11}>
              w = {fmt(w)}
            </Label>
            {plot.axes}
            <path className="st-line muted" d={plot.path(area, 0, 10)} strokeDasharray="4 5" />
            <line className="st-dash" x1={plot.sx(5)} y1={plot.sy(25)} x2={plot.sx(5)} y2={plot.sy(0)} />
            <circle className={`st-dot ${Math.abs(w - 5) < 0.15 ? 'a' : 'c'}`} cx={plot.sx(w)} cy={plot.sy(area(w))} r={5} />
            <Label x={plot.sx(5)} y={plot.sy(25) - 8} size={10} tone="accent">
              max 25
            </Label>
            <Label x={plot.sx(10)} y={plot.sy(0) + 16} anchor="end" size={10}>
              width w
            </Label>
          </>
        );
      }}
    </StoryScene>
  );
}

/* Integrals: the odometer adds up speed × time. The distance travelled is the
   area under the speed graph. */
export function OdometerStory({ initialT }) {
  const T = 10;
  const speed = (s) => 12 + 6 * Math.sin((s / T) * 2 * Math.PI * 1.3) - 0.4 * s;
  const distance = (s) => {
    let sum = 0;
    const n = 200;
    for (let i = 0; i < n; i += 1) sum += speed(((i + 0.5) * s) / n) * (s / n);
    return sum;
  };
  const total = distance(T);
  const plot = makePlot({ left: 50, top: 100, width: 560, height: 110, x0: 0, x1: T, y0: 0, y1: 20 });

  return (
    <StoryScene
      initialT={initialT}
      title="Distance is the area under speed"
      duration={11000}
      height={240}
      caption={(t) => {
        const s = t * T;
        if (t < 0.03) return 'A car’s speed changes over 10 seconds. The odometer has to turn speed into distance.';
        if (t < 0.95) return `Each thin sliver of time adds speed × time to the distance: a thin rectangle under the graph. After ${fmt(s)} s the shaded area, and the odometer, read ${fmt(distance(s))} m.`;
        return `Total distance ${fmt(total)} m, equal to the whole area under the speed curve. That is what ∫ speed dt means.`;
      }}
      stats={(t) => {
        const s = t * T;
        return [
          ['time', `${fmt(s)} s`],
          ['speed now', `${fmt(speed(s))} m/s`],
          ['odometer = area', `${fmt(distance(s))} m`, true],
        ];
      }}
    >
      {(t) => {
        const s = t * T;
        const roadX = (m) => 40 + (m / total) * 540;
        return (
          <>
            <rect className="st-road" x={30} y={30} width={580} height={32} rx={8} />
            <Actor x={roadX(distance(s))} y={44} emoji="🚙" size={24} flip />
            <g transform={`translate(${Math.min(540, roadX(distance(s)) - 30)} 72)`}>
              <rect className="st-fill soft" width={62} height={18} rx={4} />
              <Label x={31} y={13} size={11} tone="text" weight={700}>
                {fmt(distance(s), 0)} m
              </Label>
            </g>
            {plot.axes}
            <path className="st-fill a" d={plot.area(speed, 0, s)} />
            <path className="st-line a" d={plot.path(speed)} />
            <line className="st-line c" x1={plot.sx(s)} y1={plot.sy(0)} x2={plot.sx(s)} y2={plot.sy(speed(s))} strokeWidth={2} />
            <Label x={plot.sx(0) + 4} y={plot.sy(20) + 4} anchor="start" size={10}>
              speed (m/s)
            </Label>
            <Label x={plot.sx(T)} y={plot.sy(0) + 16} anchor="end" size={10}>
              time (s)
            </Label>
          </>
        );
      }}
    </StoryScene>
  );
}

/* Fundamental theorem: a tap fills a tank. The rate graph's area is the level,
   and the level's slope is the rate. */
export function WaterTankStory({ initialT }) {
  const T = 10;
  const rate = (s) => 2 + 1.5 * Math.sin((s / T) * 2 * Math.PI) + (s > 6 ? -1.5 * (s - 6) * 0.5 : 0);
  const level = (s) => {
    let sum = 0;
    const n = 160;
    for (let i = 0; i < n; i += 1) sum += rate(((i + 0.5) * s) / n) * (s / n);
    return sum;
  };
  const full = level(T);
  const top = makePlot({ left: 250, top: 18, width: 360, height: 88, x0: 0, x1: T, y0: -1, y1: 4 });
  const bottom = makePlot({ left: 250, top: 132, width: 360, height: 88, x0: 0, x1: T, y0: 0, y1: full * 1.1 });

  return (
    <StoryScene
      initialT={initialT}
      title="Filling the tank"
      duration={12000}
      height={240}
      caption={(t) => {
        const s = t * T;
        if (t < 0.03) return 'A tap fills a tank, but the flow rate keeps changing. Top graph: the rate. Bottom graph: the water level.';
        if (rate(s) < 0) return 'The rate has gone negative: water is draining. The shaded area dips below the axis and the level falls.';
        if (t < 0.95) return 'The level at any moment is the area under the rate graph so far. And the steepness of the level graph is the rate. Each graph is built from the other.';
        return 'Accumulating the rate gives the level; differentiating the level gives back the rate. That two-way link is the Fundamental Theorem of Calculus.';
      }}
      stats={(t) => {
        const s = t * T;
        return [
          ['flow rate f(t)', `${fmt(rate(s))} L/s`],
          ['level A(t) = ∫f', `${fmt(level(s))} L`, true],
          ['slope of A', `${fmt(rate(s))} L/s`],
        ];
      }}
    >
      {(t) => {
        const s = t * T;
        const tankH = 170;
        const water = (level(s) / (full * 1.1)) * tankH;
        const flowing = rate(s) > 0;
        return (
          <>
            <Actor x={60} y={30} emoji="🚰" size={30} flip />
            {flowing ? <line x1={78} y1={46} x2={78} y2={220 - water} stroke="var(--blue)" strokeWidth={Math.max(1, rate(s) * 2)} opacity={0.7} /> : null}
            <rect x={40} y={50} width={130} height={tankH} className="st-fill soft" rx={6} />
            <rect x={42} y={220 - water} width={126} height={Math.max(0, water - 2)} fill="color-mix(in srgb, var(--blue) 35%, transparent)" />
            <Label x={105} y={236} size={10}>
              {fmt(level(s))} L
            </Label>
            {top.axes}
            <line className="st-grid" x1={top.sx(0)} y1={top.sy(0)} x2={top.sx(T)} y2={top.sy(0)} />
            <path className="st-fill b" d={top.area(rate, 0, s, () => 0)} />
            <path className="st-line b" d={top.path(rate)} />
            <Label x={top.sx(0) + 4} y={top.sy(4) + 4} anchor="start" size={10}>
              rate f(t)
            </Label>
            {bottom.axes}
            <path className="st-line muted" d={bottom.path(level, 0, T, 60)} strokeDasharray="3 5" />
            <path className="st-line a" d={bottom.path(level, 0, s, 60)} />
            <path className="st-line c" d={bottom.path((x) => level(s) + rate(s) * (x - s), Math.max(0, s - 1), Math.min(T, s + 1), 4)} />
            <circle className="st-dot a" cx={bottom.sx(s)} cy={bottom.sy(level(s))} r={4} />
            <Label x={bottom.sx(0) + 4} y={bottom.sy(full * 1.1) + 4} anchor="start" size={10}>
              level A(t)
            </Label>
          </>
        );
      }}
    </StoryScene>
  );
}

/* Substitution: the strips under 2x·cos(x²) slide and stretch into the strips
   under cos(u). Each strip keeps its area, so the integrals agree. */
const STRIPS = 22;

export function WarpAreaStory({ initialT }) {
  const plot = makePlot({ left: 60, top: 20, width: 520, height: 170, x0: 0, x1: 1.05, y0: 0, y1: 1.3 });
  const morphAt = (t) => smooth(phase(t, 0.3, 0.75));

  return (
    <StoryScene
      initialT={initialT}
      title="Substitution reshapes the area"
      duration={11000}
      height={230}
      caption={(t) => {
        const k = morphAt(t);
        if (k === 0) return 'Here is the area under 2x·cos(x²) from x = 0 to 1, cut into thin strips. Substituting u = x² should turn it into the area under cos(u).';
        if (k < 1) return 'Each strip slides to u = x² and changes width by du = 2x dx. Its height changes by the opposite factor, so every strip keeps exactly the same area.';
        return 'Same total, new shape: ∫₀¹ 2x cos(x²) dx = ∫₀¹ cos u du = sin 1 ≈ 0.841. The factor 2x dx was precisely what du absorbs.';
      }}
      stats={(t) => [
        ['variable', morphAt(t) < 0.5 ? 'x' : 'u', morphAt(t) >= 1],
        ['total area', '0.841'],
        ['integrand', morphAt(t) < 0.5 ? '2x cos(x²)' : 'cos(u)'],
      ]}
    >
      {(t) => {
        const k = morphAt(t);
        const strips = [];
        for (let i = 0; i < STRIPS; i += 1) {
          const a = i / STRIPS;
          const b = (i + 1) / STRIPS;
          const areaStrip = (b * b - a * a) * Math.cos(((a + b) / 2) ** 2);
          const left = lerp(a, a * a, k);
          const right = lerp(b, b * b, k);
          const height = areaStrip / (right - left);
          strips.push(
            <rect
              key={i}
              className={`st-fill ${i % 2 ? 'a' : 'b'}`}
              x={plot.sx(left)}
              y={plot.sy(height)}
              width={Math.max(0.5, plot.sx(right) - plot.sx(left))}
              height={plot.sy(0) - plot.sy(height)}
            />
          );
        }
        return (
          <>
            {plot.axes}
            {strips}
            <path className="st-line a" d={plot.path((x) => 2 * x * Math.cos(x * x), 0, 1)} opacity={1 - k} />
            <path className="st-line b" d={plot.path((u) => Math.cos(u), 0, 1)} opacity={k} />
            <Label x={plot.sx(1)} y={plot.sy(0) + 16} size={11} tone="text" weight={600}>
              {k < 0.5 ? 'x = 1' : 'u = 1'}
            </Label>
            <Label x={plot.sx(0)} y={plot.sy(0) + 16} size={11}>
              0
            </Label>
            <Label x={plot.sx(0.02)} y={plot.sy(1.25)} anchor="start" size={12} tone={k < 0.5 ? 'accent' : 'blue'} weight={700}>
              {k < 0.5 ? 'y = 2x · cos(x²)' : 'y = cos(u)'}
            </Label>
          </>
        );
      }}
    </StoryScene>
  );
}

/* Integration by parts: a curve from (u₀, v₀) to (u₁, v₁) splits the L-shaped
   region into ∫v du and ∫u dv, which together make u₁v₁ − u₀v₀. */
export function PartsRectangleStory({ initialT }) {
  const U = (s) => 1 + 3 * s;
  const V = (s) => 1 + 2 * s * s;
  const plot = makePlot({ left: 180, top: 18, width: 280, height: 200, x0: 0, x1: 4.4, y0: 0, y1: 3.4 });
  const curveAt = (t) => phase(t, 0.04, 0.4);

  return (
    <StoryScene
      initialT={initialT}
      title="Two areas that make a rectangle"
      duration={11000}
      height={240}
      caption={(t) => {
        if (t < 0.4) return 'A curve runs from (u, v) = (1, 1) to (4, 3). Read u across and v up.';
        if (t < 0.62) return 'Below the curve, down to the u-axis, is the area ∫ v du.';
        if (t < 0.84) return 'Left of the curve, across to the v-axis, is the area ∫ u dv.';
        return 'Together they fill the big rectangle, 4 × 3 = 12, minus the small corner, 1 × 1 = 1. So ∫ v du + ∫ u dv = uv evaluated at the ends, which rearranges to integration by parts.';
      }}
      stats={(t) => [
        ['∫ v du', t >= 0.62 ? '5' : '…'],
        ['∫ u dv', t >= 0.84 ? '6' : '…'],
        ['u₁v₁ − u₀v₀', t >= 0.84 ? '12 − 1 = 11' : '…', t >= 0.84],
      ]}
    >
      {(t) => {
        const c = curveAt(t);
        const steps = 60;
        let curve = '';
        let below = `M${plot.sx(U(0))} ${plot.sy(0)}`;
        let beside = `M${plot.sx(0)} ${plot.sy(V(0))}`;
        for (let i = 0; i <= steps; i += 1) {
          const s = i / steps;
          const point = `${plot.sx(U(s)).toFixed(1)} ${plot.sy(V(s)).toFixed(1)}`;
          if (s <= c) curve += `${curve ? 'L' : 'M'}${point}`;
          below += `L${point}`;
          beside += `L${point}`;
        }
        below += `L${plot.sx(U(1))} ${plot.sy(0)}Z`;
        beside += `L${plot.sx(0)} ${plot.sy(V(1))}Z`;
        const showBelow = phase(t, 0.42, 0.55);
        const showBeside = phase(t, 0.64, 0.77);
        return (
          <>
            {plot.axes}
            <rect x={plot.sx(0)} y={plot.sy(1)} width={plot.sx(1) - plot.sx(0)} height={plot.sy(0) - plot.sy(1)} className="st-fill soft" strokeDasharray="4 4" />
            <path className="st-fill a" d={below} opacity={showBelow} />
            <path className="st-fill c" d={beside} opacity={showBeside} />
            <path className="st-line b" d={curve} />
            {t >= 0.84 ? <rect x={plot.sx(0)} y={plot.sy(3)} width={plot.sx(4) - plot.sx(0)} height={plot.sy(0) - plot.sy(3)} fill="none" className="st-line d" strokeDasharray="6 4" strokeWidth={2} /> : null}
            {showBelow > 0.5 ? (
              <Label x={plot.sx(2.7)} y={plot.sy(0.7)} size={13} tone="accent" weight={700}>
                ∫ v du
              </Label>
            ) : null}
            {showBeside > 0.5 ? (
              <Label x={plot.sx(1.1)} y={plot.sy(2.3)} size={13} tone="gold" weight={700}>
                ∫ u dv
              </Label>
            ) : null}
            <Label x={plot.sx(4.3)} y={plot.sy(0) + 16} size={11}>
              u
            </Label>
            <Label x={plot.sx(0) - 12} y={plot.sy(3.3)} size={11}>
              v
            </Label>
          </>
        );
      }}
    </StoryScene>
  );
}

/* Area between curves: a hare starts fast and tires; a tortoise plods at a
   constant speed. The area between their speed graphs is the hare's lead. */
export function HareLeadStory({ initialT }) {
  const T = 4;
  const hare = (s) => 9 - 2 * s;
  const tortoise = () => 4;
  const lead = (s) => 5 * s - s * s;
  const plot = makePlot({ left: 50, top: 110, width: 560, height: 110, x0: 0, x1: T, y0: 0, y1: 10 });

  return (
    <StoryScene
      initialT={initialT}
      title="How far ahead is the hare?"
      duration={11000}
      height={240}
      caption={(t) => {
        const s = t * T;
        if (t < 0.03) return 'The hare bolts off at 9 m/s but tires steadily. The tortoise plods at a constant 4 m/s.';
        if (s < 2.5) return 'While the hare is faster, the green area between the speed graphs grows, and so does the hare’s lead.';
        if (t < 0.97) return 'After 2.5 s the tortoise is faster. The red area counts against the hare: its lead starts shrinking.';
        return 'The lead at the end is green area minus red area: 6.25 − 2.25 = 4 m. The total area between the curves, 8.5, counts both as positive, which answers a different question.';
      }}
      stats={(t) => {
        const s = t * T;
        return [
          ['hare speed', `${fmt(hare(s))} m/s`],
          ['tortoise speed', '4.0 m/s'],
          ['hare’s lead = ∫(f − g)', `${fmt(lead(s), 2)} m`, true],
        ];
      }}
    >
      {(t) => {
        const s = t * T;
        const scale = 26;
        const tortoiseDist = 4 * s;
        const hareDist = tortoiseDist + lead(s);
        const trackX = (m) => 40 + m * scale;
        const split = Math.min(s, 2.5);
        return (
          <>
            <rect className="st-road" x={30} y={20} width={580} height={30} rx={8} />
            <rect className="st-road" x={30} y={58} width={580} height={30} rx={8} />
            <Actor x={trackX(hareDist)} y={34} emoji="🐇" size={24} flip />
            <Actor x={trackX(tortoiseDist)} y={72} emoji="🐢" size={24} flip />
            {plot.axes}
            <path className="st-fill a" d={plot.area(hare, 0, split, tortoise)} />
            {s > 2.5 ? <path className="st-fill d" d={plot.area(hare, 2.5, s, tortoise)} /> : null}
            <path className="st-line b" d={plot.path(hare)} />
            <path className="st-line c" d={plot.path(tortoise)} />
            <Label x={plot.sx(0.1)} y={plot.sy(hare(0.1)) - 6} anchor="start" size={10} tone="blue">
              hare speed f
            </Label>
            <Label x={plot.sx(3.95)} y={plot.sy(4) - 6} anchor="end" size={10} tone="gold">
              tortoise speed g
            </Label>
            <line className="st-dash" x1={plot.sx(s)} y1={plot.sy(0)} x2={plot.sx(s)} y2={plot.sy(10)} />
          </>
        );
      }}
    </StoryScene>
  );
}
