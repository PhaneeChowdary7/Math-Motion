/**
 * Flat vector characters for the story scenes, drawn in the site's own palette
 * so every scene matches the interactive plots instead of borrowing emoji.
 *
 * Each figure is drawn on a 24-unit grid centred on (0, 0). Vehicles and
 * animals face left and the plane points up and to the right, the same way the
 * emoji they replace did, so scenes can mirror them to face the direction of travel.
 */

const INK = 'color-mix(in srgb, var(--text) 82%, transparent)';
const PANEL = 'var(--panel)';
const SOFT = 'color-mix(in srgb, var(--text) 30%, var(--panel))';
const tint = (color, amount) => `color-mix(in srgb, ${color} ${amount}%, var(--panel))`;

function Wheel({ x, y, r = 3.2 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={INK} />
      <circle cx={x} cy={y} r={r * 0.38} fill={PANEL} />
    </g>
  );
}

function Car({ color }) {
  return (
    <g>
      <path
        d="M-13 3.5 V-0.5 Q-13 -3.2 -10.2 -3.6 L-6.5 -4.2 L-3.6 -8.2 Q-2.8 -9.2 -1.4 -9.2 H6 Q7.8 -9.2 8.8 -7.6 L11 -4.2 Q13 -3.8 13 -1.2 V3.5 Z"
        fill={color}
      />
      <path d="M-2.4 -4.4 L-0.6 -7.6 H2.8 V-4.4 Z M4.2 -4.4 V-7.6 H6 Q7 -7.6 7.6 -6.5 L8.7 -4.4 Z" fill={PANEL} opacity={0.9} />
      <rect x={-13} y={-1.6} width={2.6} height={1.8} rx={0.8} fill="var(--gold)" />
      <Wheel x={-7.4} y={3.8} />
      <Wheel x={7.6} y={3.8} />
    </g>
  );
}

function Bus({ color }) {
  return (
    <g>
      <rect x={-14} y={-9.5} width={28} height={14} rx={3.2} fill={color} />
      <path d="M-14 -3 H-10.5 V-8.2 H-12 Q-14 -8.2 -14 -6 Z" fill={PANEL} opacity={0.9} />
      {[-8.2, -3, 2.2, 7.4].map((x) => (
        <rect key={x} x={x} y={-8.2} width={4} height={4.4} rx={0.9} fill={PANEL} opacity={0.9} />
      ))}
      <rect x={-14} y={-1.6} width={28} height={1.4} fill={INK} opacity={0.18} />
      <Wheel x={-8} y={4.6} />
      <Wheel x={8} y={4.6} />
    </g>
  );
}

function Train({ color }) {
  return (
    <g>
      <path d="M-15 4 V-1.5 Q-14 -8.5 -7 -8.5 H13 Q15 -8.5 15 -6.5 V4 Z" fill={color} />
      <path d="M-12.6 -2.6 Q-11.6 -6.6 -7.6 -6.6 H-5.6 V-2.6 Z" fill={PANEL} opacity={0.9} />
      {[-3.4, 2, 7.4].map((x) => (
        <rect key={x} x={x} y={-6.6} width={4} height={3.6} rx={0.8} fill={PANEL} opacity={0.9} />
      ))}
      <rect x={-15} y={0} width={30} height={1.3} fill="var(--gold)" />
      {[-9, -3, 5, 11].map((x) => (
        <circle key={x} cx={x} cy={5.2} r={1.8} fill={INK} />
      ))}
    </g>
  );
}

function Plane() {
  return (
    <g transform="rotate(-45)">
      <path d="M2.5 -1.6 L-4.5 -12 H-7.4 L-3.6 -1.6 Z M2.5 1.6 L-4.5 12 H-7.4 L-3.6 1.6 Z" fill="var(--blue)" />
      <path d="M-9.4 -1 L-12.2 -6 H-14 L-12.8 -1 Z M-9.4 1 L-12.2 6 H-14 L-12.8 1 Z" fill="var(--blue)" />
      <rect x={-14} y={-2} width={27} height={4} rx={2} fill={tint('var(--blue)', 55)} stroke="var(--blue)" strokeWidth={0.8} />
      <circle cx={10} cy={0} r={1.1} fill={PANEL} />
    </g>
  );
}

function Rabbit({ color = SOFT }) {
  return (
    <g>
      <ellipse cx={3} cy={2.5} rx={8.4} ry={6} fill={color} />
      <ellipse cx={-4.4} cy={-10} rx={1.8} ry={5.2} fill={color} transform="rotate(-14 -4.4 -10)" />
      <ellipse cx={-1.6} cy={-10.4} rx={1.8} ry={5.2} fill={color} transform="rotate(12 -1.6 -10.4)" />
      <circle cx={-5.4} cy={-3.2} r={4.6} fill={color} />
      <circle cx={11.2} cy={0.6} r={2.4} fill={PANEL} stroke={color} strokeWidth={1} />
      <ellipse cx={6.4} cy={7.6} rx={4} ry={1.6} fill={color} />
      <circle cx={-7} cy={-3.8} r={0.95} fill={INK} />
      <circle cx={-9.8} cy={-2.4} r={0.8} fill="var(--red)" />
    </g>
  );
}

function Tortoise() {
  const shell = 'var(--accent)';
  const skin = tint('var(--accent)', 45);
  return (
    <g>
      <rect x={-7.5} y={1} width={3.2} height={5} rx={1.4} fill={skin} />
      <rect x={5.5} y={1} width={3.2} height={5} rx={1.4} fill={skin} />
      <path d="M11 3 L14 4.4 L11 5 Z" fill={skin} />
      <circle cx={-11.6} cy={0.4} r={3.3} fill={skin} />
      <path d="M-9.5 3.4 A10.5 9.5 0 0 1 11.5 3.4 Z" fill={shell} />
      <path d="M-4 3.4 L-2 -2.6 H4 L6 3.4 M-2 -2.6 L-5.2 -3.6 M4 -2.6 L7.4 -3.4 M1 -2.6 V-5.9" stroke={PANEL} strokeWidth={0.9} fill="none" opacity={0.7} />
      <circle cx={-12.6} cy={-0.3} r={0.8} fill={INK} />
    </g>
  );
}

function Quadruped({ color, spots }) {
  return (
    <g>
      <path d="M-2 -1 Q-4 -9 -10 -7.5" stroke={color} strokeWidth={3.4} strokeLinecap="round" fill="none" />
      <ellipse cx={3} cy={0} rx={8.6} ry={4.8} fill={color} />
      <circle cx={-10.4} cy={-7.4} r={3.4} fill={color} />
      <path d="M11 -1 Q15 -3 14.4 -7" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      {[-3.6, -0.6, 6.4, 9.4].map((x, i) => (
        <rect key={x} x={x} y={2.6} width={2.2} height={i % 2 ? 7 : 7.6} rx={1.1} fill={color} />
      ))}
      {spots ? [[1, -1.6], [5, 0.6], [8, -1.8]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={1} fill={INK} opacity={0.45} />) : null}
      <circle cx={-11.4} cy={-8} r={0.8} fill={INK} />
    </g>
  );
}

function Dog({ color, vest }) {
  return (
    <g>
      <path d="M10.5 -2 Q14 -5 13 -9" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
      <rect x={-6} y={-4.5} width={17} height={8.6} rx={4.2} fill={color} />
      {vest ? <rect x={-1} y={-4.5} width={7} height={8.6} fill="var(--accent)" opacity={0.85} /> : null}
      {[-4.6, -1.4, 6.4, 9.2].map((x) => (
        <rect key={x} x={x} y={2} width={2.3} height={7} rx={1.1} fill={color} />
      ))}
      <circle cx={-8.4} cy={-6.6} r={4.6} fill={color} />
      <path d="M-12.2 -7.8 Q-14.6 -5.4 -13.2 -3" stroke={color} strokeWidth={0.6} fill={color} />
      <ellipse cx={-6.4} cy={-7.8} rx={1.6} ry={3.4} fill={INK} opacity={0.35} transform="rotate(20 -6.4 -7.8)" />
      <circle cx={-10} cy={-7.4} r={0.8} fill={INK} />
      <circle cx={-12.8} cy={-5.6} r={0.9} fill={INK} />
    </g>
  );
}

function Sheep() {
  return (
    <g>
      {[-4, 4].map((x) => (
        <rect key={x} x={x - 1} y={3} width={2} height={6} rx={1} fill={INK} />
      ))}
      {[[-4, -1], [0, -3.4], [4, -1], [0, 1.6], [-6.6, 1.4], [6.6, 1.4]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={4} fill={PANEL} stroke="var(--line)" strokeWidth={0.8} />
      ))}
      <ellipse cx={-9.6} cy={-2.4} rx={3} ry={3.6} fill={INK} />
    </g>
  );
}

function Tractor() {
  return (
    <g>
      <rect x={-12} y={-3.5} width={15} height={7} rx={1.8} fill="var(--accent)" />
      <path d="M-1 -3.5 V-11 H7.5 V-3.5" fill={tint('var(--accent)', 25)} stroke="var(--accent)" strokeWidth={1.6} />
      <rect x={-8.4} y={-8.8} width={1.6} height={5.4} fill={INK} />
      <Wheel x={6.5} y={3.6} r={6} />
      <Wheel x={-9} y={5.8} r={3.6} />
    </g>
  );
}

function Carrot() {
  return (
    <g transform="rotate(-40)">
      <path d="M-11 0 L6 -4 Q8 0 6 4 Z" fill="color-mix(in srgb, var(--gold) 70%, var(--red))" />
      <path d="M-4 -1.2 H0 M-1 1.4 H2.6" stroke={PANEL} strokeWidth={0.8} opacity={0.6} />
      <path d="M6 -1.5 Q11 -7 13 -5 M6 0 Q12 0 13 -1.5 M6 1.5 Q10 6 12.5 5" stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" fill="none" />
    </g>
  );
}

function Camera() {
  return (
    <g>
      <rect x={-4.5} y={-9} width={6} height={3.2} rx={1} fill={INK} />
      <rect x={-11} y={-6.4} width={22} height={14} rx={3} fill={INK} />
      <circle cx={0} cy={0.6} r={5} fill={PANEL} />
      <circle cx={0} cy={0.6} r={2.8} fill="var(--blue)" />
      <rect x={6} y={-4.6} width={3} height={1.8} rx={0.6} fill="var(--gold)" />
    </g>
  );
}

function Flag() {
  const cells = [];
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      cells.push(<rect key={`${r}${c}`} x={-6 + c * 4.2} y={-11 + r * 4} width={4.2} height={4} fill={(r + c) % 2 ? PANEL : INK} />);
    }
  }
  return (
    <g>
      <rect x={-8} y={-12} width={1.8} height={24} rx={0.9} fill={INK} />
      {cells}
      <rect x={-6} y={-11} width={16.8} height={12} fill="none" stroke={INK} strokeWidth={0.6} />
    </g>
  );
}

function Tap() {
  return (
    <g>
      <rect x={-7} y={-6} width={19} height={4.6} rx={1.6} fill="var(--axis)" />
      <rect x={-9} y={-6} width={4.6} height={10} rx={1.6} fill="var(--axis)" />
      <rect x={1.6} y={-11} width={2.4} height={5} fill={INK} />
      <rect x={-2.6} y={-12.4} width={10.8} height={2.4} rx={1.2} fill="var(--red)" />
      <path d="M-6.7 6 Q-8.4 8.6 -6.7 10 Q-5 8.6 -6.7 6 Z" fill="var(--blue)" />
    </g>
  );
}

function Battery() {
  return (
    <g>
      <rect x={-2.6} y={-11.6} width={5.2} height={2.4} rx={0.8} fill={INK} />
      <rect x={-6} y={-9.4} width={12} height={20} rx={2.4} fill={PANEL} stroke={INK} strokeWidth={1.4} />
      <rect x={-4.4} y={-1} width={8.8} height={10.4} rx={1.2} fill="var(--accent)" />
      <path d="M-2 -5 H2 M0 -7 V-3" stroke={INK} strokeWidth={1.2} />
    </g>
  );
}

function Bulb() {
  return (
    <g>
      <circle cx={0} cy={-3.4} r={7.4} fill="color-mix(in srgb, var(--gold) 80%, var(--panel))" stroke="var(--gold)" strokeWidth={1} />
      <path d="M-2.4 -2 L0 -5 L2.4 -2" stroke="var(--amber-ink)" strokeWidth={1} fill="none" />
      <rect x={-3.6} y={3.8} width={7.2} height={2.4} rx={0.8} fill={INK} />
      <rect x={-3} y={6.6} width={6} height={2.2} rx={0.8} fill={INK} />
    </g>
  );
}

function Pusher() {
  return (
    <g>
      <rect x={-12} y={-3} width={14} height={6} rx={3} fill="var(--accent)" />
      <path d="M1 -7.5 L12 0 L1 7.5 Z" fill="var(--accent)" />
    </g>
  );
}

function Person({ color }) {
  return (
    <g>
      <path d="M-9 11 Q-9 0 0 0 Q9 0 9 11 Z" fill={color} />
      <path d="M-2 0.4 L0 5 L2 0.4 Z" fill={PANEL} />
      <circle cx={0} cy={-6} r={5} fill={tint(color, 45)} stroke={color} strokeWidth={1.2} />
    </g>
  );
}

function LionFace() {
  return (
    <g>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return <circle key={i} cx={Math.cos(a) * 8.4} cy={Math.sin(a) * 8.4} r={3.6} fill="var(--amber-ink)" />;
      })}
      <circle r={8.2} fill="var(--gold)" />
      <circle cx={-2.8} cy={-1.4} r={1} fill={INK} />
      <circle cx={2.8} cy={-1.4} r={1} fill={INK} />
      <path d="M-1.6 2 H1.6 L0 3.8 Z" fill={INK} />
    </g>
  );
}

function TigerFace() {
  const fur = 'color-mix(in srgb, var(--gold) 60%, var(--red))';
  return (
    <g>
      <circle cx={-7} cy={-7.4} r={3.2} fill={fur} />
      <circle cx={7} cy={-7.4} r={3.2} fill={fur} />
      <circle r={9.6} fill={fur} />
      <path d="M-1.2 -9.4 V-6 M1.2 -9.4 V-6 M-9 -1 H-5.6 M-9 2 H-5.8 M9 -1 H5.6 M9 2 H5.8" stroke={INK} strokeWidth={1.3} strokeLinecap="round" />
      <ellipse cx={0} cy={3.6} rx={4.6} ry={3.4} fill={PANEL} />
      <circle cx={-3.2} cy={-2} r={1} fill={INK} />
      <circle cx={3.2} cy={-2} r={1} fill={INK} />
      <path d="M-1.4 2.2 H1.4 L0 3.8 Z" fill={INK} />
    </g>
  );
}

function Gear() {
  const teeth = Array.from({ length: 8 }, (_, i) => (
    <rect key={i} x={-1.8} y={-11} width={3.6} height={5} rx={0.8} fill="var(--accent)" transform={`rotate(${i * 45})`} />
  ));
  return (
    <g>
      {teeth}
      <circle r={7.4} fill="var(--accent)" />
      <circle r={2.8} fill={PANEL} />
    </g>
  );
}

export const STORY_ART = {
  '🚗': () => <Car color="var(--red)" />,
  '🚙': () => <Car color="var(--blue)" />,
  '🚌': () => <Bus color="var(--gold)" />,
  '🚆': () => <Train color="var(--blue)" />,
  '🚄': () => <Train color="var(--accent)" />,
  '✈️': () => <Plane />,
  '🚜': () => <Tractor />,
  '🐇': () => <Rabbit />,
  '🐢': () => <Tortoise />,
  '🐑': () => <Sheep />,
  '🥕': () => <Carrot />,
  '📷': () => <Camera />,
  '📸': () => <Camera />,
  '🏁': () => <Flag />,
  '🚰': () => <Tap />,
  '🔋': () => <Battery />,
  '💡': () => <Bulb />,
  '👉': () => <Pusher />,
  '⚙️': () => <Gear />,
  '👩‍⚖️': () => <Person color="var(--accent)" />,
  '🧑‍⚖️': () => <Person color="var(--blue)" />,
  '🦁': () => <LionFace />,
  '🐯': () => <TigerFace />,
  '🐆': () => <Quadruped color="var(--gold)" spots />,
  '🐎': () => <Quadruped color="color-mix(in srgb, var(--amber-ink) 80%, var(--panel))" />,
  '🦌': () => <Quadruped color="color-mix(in srgb, var(--gold) 55%, var(--amber-ink))" />,
  '🦊': () => <Quadruped color="color-mix(in srgb, var(--gold) 55%, var(--red))" />,
  '🐈': () => <Quadruped color="var(--axis)" />,
  '🐿️': () => <Quadruped color="color-mix(in srgb, var(--amber-ink) 60%, var(--red))" />,
  '🐕': () => <Dog color="color-mix(in srgb, var(--gold) 70%, var(--amber-ink))" />,
  '🐩': () => <Dog color={SOFT} />,
  '🐶': () => <Dog color="var(--gold)" />,
  '🦮': () => <Dog color="color-mix(in srgb, var(--amber-ink) 85%, var(--text))" />,
  '🐕‍🦺': () => <Dog color="var(--axis)" vest />,
};
