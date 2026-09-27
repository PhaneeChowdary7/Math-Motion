import StoryScene, { Actor, Label, makePlot } from '../components/StoryScene.jsx';
import { phase, smooth } from '../lib/useTimeline.js';

const fmt = (value, digits = 1) => {
  const rounded = Math.round(value * 10 ** digits) / 10 ** digits;
  return (Object.is(rounded, -0) ? 0 : rounded).toFixed(digits);
};

function Arrow({ x1, y1, x2, y2, tone, width = 3 }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 9;
  const length = Math.hypot(x2 - x1, y2 - y1);
  if (length < 2) return null;
  return (
    <g>
      <line className={`st-line ${tone}`} x1={x1} y1={y1} x2={x2 - Math.cos(angle) * 4} y2={y2 - Math.sin(angle) * 4} strokeWidth={width} />
      <path
        className={`st-dot ${tone}`}
        d={`M${x2} ${y2} L${x2 - head * Math.cos(angle - 0.4)} ${y2 - head * Math.sin(angle - 0.4)} L${x2 - head * Math.cos(angle + 0.4)} ${y2 - head * Math.sin(angle + 0.4)} Z`}
      />
    </g>
  );
}


/* Vectors: a plane points east but the wind blows north. It travels along the
   sum of the two vectors, nose still pointing east. */
export function WindPlaneStory({ initialT }) {
  const unit = 52;
  const ox = 80;
  const oy = 200;
  const air = [7, 0];
  const wind = [0, 2.6];
  const P = (x, y) => [ox + x * unit, oy - y * unit];

  return (
    <StoryScene
      initialT={initialT}
      title="Flying in a crosswind"
      duration={11000}
      height={240}
      caption={(t) => {
        if (t < 0.22) return 'The pilot points the plane due east and flies at 7 units per hour through the air. That is vector a.';
        if (t < 0.42) return 'But a wind blows north at 2.6 units per hour: vector b. Drawn tip to tail, the two make a triangle.';
        if (t < 0.95) return 'The plane’s actual path is a + b, the third side of the triangle. Notice the nose still points east while the plane drifts north.';
        return `The ground track is a + b = (7, 2.6), about ${fmt(Math.hypot(7, 2.6))} units per hour. Vector addition is exactly how pilots correct for wind.`;
      }}
      stats={(t) => [
        ['airspeed a', '(7, 0)'],
        ['wind b', '(0, 2.6)'],
        ['ground track a + b', '(7, 2.6)', t >= 0.42],
      ]}
    >
      {(t) => {
        const ka = smooth(phase(t, 0.03, 0.2));
        const kb = smooth(phase(t, 0.24, 0.4));
        const fly = phase(t, 0.44, 0.94);
        const [ax, ay] = P(air[0] * ka, 0);
        const [bx, by] = P(air[0], wind[1] * kb);
        const [px, py] = P((air[0] + wind[0]) * fly, wind[1] * fly);
        const [sx, sy] = P(air[0], wind[1]);
        const grid = [];
        for (let i = 0; i <= 8; i += 1) grid.push(<line className="st-grid" key={`v${i}`} x1={P(i, 0)[0]} y1={P(0, 0)[1]} x2={P(i, 0)[0]} y2={P(0, 3.5)[1]} />);
        for (let j = 0; j <= 3; j += 1) grid.push(<line className="st-grid" key={`h${j}`} x1={P(0, j)[0]} y1={P(0, j)[1]} x2={P(8, j)[0]} y2={P(8, j)[1]} />);
        return (
          <>
            {grid}
            {Array.from({ length: 5 }, (_, i) => (
              <Label key={i} x={P(1 + i * 1.5, 3.1)[0]} y={P(0, 3.1)[1] + ((t * 400 + i * 30) % 60) - 30} size={16} tone="blue">
                ↑
              </Label>
            ))}
            <Arrow x1={ox} y1={oy} x2={ax} y2={ay} tone="a" />
            {kb > 0 ? <Arrow x1={P(air[0], 0)[0]} y1={oy} x2={bx} y2={by} tone="b" /> : null}
            {t >= 0.42 ? <Arrow x1={ox} y1={oy} x2={sx} y2={sy} tone="c" width={2} /> : null}
            <Label x={ox + (air[0] * unit) / 2} y={oy + 20} size={12} tone="accent" weight={700}>
              a (plane)
            </Label>
            {kb > 0.5 ? (
              <Label x={P(air[0], 0)[0] + 14} y={P(0, 1.3)[1]} anchor="start" size={12} tone="blue" weight={700}>
                b (wind)
              </Label>
            ) : null}
            {t >= 0.42 ? (
              <Label x={P(3, 1.6)[0]} y={P(3, 1.6)[1]} size={12} tone="gold" weight={700}>
                a + b
              </Label>
            ) : null}
            <Actor x={t < 0.44 ? ox : px} y={t < 0.44 ? oy : py} emoji="✈️" size={26} rotate={45} />
          </>
        );
      }}
    </StoryScene>
  );
}

/* Systems of equations: two trains on one line head towards each other. The
   point where their distance-time lines cross is the solution. */
export function TrainsMeetStory({ initialT }) {
  const T = 3;
  const east = (s) => 60 * s;
  const west = (s) => 300 - 90 * s;
  const plot = makePlot({ left: 60, top: 100, width: 540, height: 118, x0: 0, x1: T, y0: 0, y1: 300 });
  const timeAt = (t) => Math.min(2, t * T * 1.12);

  return (
    <StoryScene
      initialT={initialT}
      title="When do the trains meet?"
      duration={10000}
      height={240}
      caption={(t) => {
        const s = timeAt(t);
        if (t < 0.03) return 'Train A leaves the west station at 60 km/h. Train B leaves the east station, 300 km away, at 90 km/h, heading west.';
        if (s < 2) return 'Each train’s position is a straight line on the graph: d = 60t and d = 300 − 90t. The gap between them is closing at 150 km/h.';
        return 'They meet where the lines cross: t = 2 hours, 120 km from the west station. Solving the system 60t = 300 − 90t finds that point exactly.';
      }}
      stats={(t) => {
        const s = timeAt(t);
        return [
          ['train A', `${fmt(east(s), 0)} km`],
          ['train B', `${fmt(west(s), 0)} km`],
          ['gap', `${fmt(west(s) - east(s), 0)} km`, s >= 2],
        ];
      }}
    >
      {(t) => {
        const s = timeAt(t);
        const trackX = (km) => 60 + (km / 300) * 540;
        return (
          <>
            <line className="st-line muted" x1={50} y1={52} x2={610} y2={52} strokeWidth={3} />
            <line className="st-line muted" x1={50} y1={58} x2={610} y2={58} strokeWidth={3} />
            <Actor x={trackX(east(s))} y={40} emoji="🚆" size={26} flip />
            <Actor x={trackX(west(s))} y={40} emoji="🚄" size={26} />
            <Label x={60} y={80} size={10}>
              west station
            </Label>
            <Label x={600} y={80} size={10}>
              east, 300 km
            </Label>
            {plot.axes}
            <path className="st-line muted" d={plot.path(east, 0, T)} strokeDasharray="3 5" />
            <path className="st-line muted" d={plot.path(west, 0, T)} strokeDasharray="3 5" />
            <path className="st-line a" d={plot.path(east, 0, s)} />
            <path className="st-line b" d={plot.path(west, 0, s)} />
            {s >= 2 ? (
              <g>
                <circle className="st-dot c" cx={plot.sx(2)} cy={plot.sy(120)} r={6} />
                <Label x={plot.sx(2) + 10} y={plot.sy(120) - 8} anchor="start" size={11} tone="gold" weight={700}>
                  (2 h, 120 km)
                </Label>
              </g>
            ) : null}
            <Label x={plot.sx(T)} y={plot.sy(0) + 16} anchor="end" size={10}>
              time (h)
            </Label>
            <Label x={plot.sx(0) + 8} y={plot.sy(300) - 4} anchor="start" size={10}>
              distance from west
            </Label>
          </>
        );
      }}
    </StoryScene>
  );
}
