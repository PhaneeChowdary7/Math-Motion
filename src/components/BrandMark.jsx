import { useEffect, useRef } from 'react';

// The mark is an M nested inside a smaller M. On hover it zooms forever: the
// inner M grows into the outer one's place while a new M emerges at the centre,
// each copy scaled by the same ratio, a geometric series drawn in motion.
//
// Each layer sits at a continuous depth d: d = 0 is the outer M, d = 1 the inner
// M, d = 2 and 3 the copies within. The zoom slides every layer from d to d - 1
// over one cycle, so the frame at the end of a cycle is identical to the start.

const OUTER = [
  [2.5, 20.5],
  [2.5, 4.5],
  [12, 9.5],
  [21.5, 4.5],
  [21.5, 20.5],
];

// The affine map taking the outer M's legs onto the inner M's legs.
const RX = 9 / 19;
const RY = 6.5 / 16;
const CX = 12;
const CY = (19 - RY * 20.5) / (1 - RY);

// The inner M's V dips slightly deeper than the affine copy; this offset is
// eased in between depth 0 and 1 so both resting Ms match the drawn logo.
const V_OFFSET = 15.5 - (CY + (9.5 - CY) * RY);

const OUTER_WIDTH = 2.6;
const INNER_WIDTH = 1.9;
const INNER_OPACITY = 0.72;
const CYCLE_MS = 1200;
const INTRO_MS = 220;
const LAYERS = 4;

function layerPath(d) {
  const sx = RX ** d;
  const sy = RY ** d;
  const vShift = d <= 0 ? 0 : d <= 1 ? V_OFFSET * d : V_OFFSET * RY ** (d - 1);

  return OUTER.map(([x, y], index) => {
    const px = CX + (x - CX) * sx;
    const py = CY + (y - CY) * sy + (index === 2 ? vShift : 0);
    return `${index ? 'L' : 'M'}${px.toFixed(3)} ${py.toFixed(3)}`;
  }).join(' ');
}

function layerStyle(d, intro) {
  const width = OUTER_WIDTH * (INNER_WIDTH / OUTER_WIDTH) ** d;
  let opacity;

  if (d < 0) opacity = Math.max(0, 1 + d * 2.5);
  else if (d <= 1) opacity = 1 - (1 - INNER_OPACITY) * d;
  // Deeper copies only show while hovered; `intro` steepens their fade to
  // nothing at rest, keeping the value continuous at d = 1.
  else opacity = INNER_OPACITY * Math.max(0, 1 - (d - 1) * (0.5 + 4 * (1 - intro)));

  return { width, opacity };
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export default function BrandMark({ size = 24, title = 'Math Motion' }) {
  const svgRef = useRef(null);
  const pathRefs = useRef([]);

  useEffect(() => {
    const svg = svgRef.current;
    const host = svg?.closest('a, button') ?? svg;
    if (!host) return undefined;

    let frame = 0;
    let phase = 0;
    let intro = 0;
    let active = false;
    let last = 0;

    function draw() {
      pathRefs.current.forEach((path, index) => {
        if (!path) return;
        const d = index - phase;
        const { width, opacity } = layerStyle(d, intro);
        path.setAttribute('d', layerPath(d));
        path.setAttribute('stroke-width', width.toFixed(3));
        path.setAttribute('opacity', opacity.toFixed(3));
      });
    }

    function tick(now) {
      const dt = Math.min(now - last, 64);
      last = now;
      intro = Math.min(1, Math.max(0, intro + (active ? dt : -dt) / INTRO_MS));
      phase += dt / CYCLE_MS;

      if (phase >= 1) {
        phase -= 1;
        // Once released, stop at a cycle boundary, which is the resting logo.
        if (!active && intro === 0) {
          phase = 0;
          frame = 0;
          draw();
          return;
        }
      }

      draw();
      frame = requestAnimationFrame(tick);
    }

    function start() {
      active = true;
      if (frame || prefersReducedMotion()) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }

    function stop() {
      active = false;
    }

    host.addEventListener('pointerenter', start);
    host.addEventListener('pointerleave', stop);
    host.addEventListener('focus', start);
    host.addEventListener('blur', stop);

    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener('pointerenter', start);
      host.removeEventListener('pointerleave', stop);
      host.removeEventListener('focus', start);
      host.removeEventListener('blur', stop);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="brand-zoom"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={title}
    >
      {Array.from({ length: LAYERS }, (_, index) => {
        const { width, opacity } = layerStyle(index, 0);
        return (
          <path
            key={index}
            ref={(node) => {
              pathRefs.current[index] = node;
            }}
            d={layerPath(index)}
            strokeWidth={width}
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
}
