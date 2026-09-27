import { memo } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useTimeline } from '../lib/useTimeline.js';
import { STORY_ART } from './storyArt.jsx';

export const STAGE_WIDTH = 640;

/**
 * A "watch it happen" card: an animated real-world scene driven by one clock.
 * `children(t)` draws the stage for t in [0, 1]; scenes are pure functions of
 * time, so play, pause, scrub and replay all come for free.
 */
const SPEEDS = [0.5, 1, 1.5, 2];

function StoryScene({ title, duration = 8000, height = 240, caption, stats, children, initialT = 0 }) {
  const { t, playing, speed, setSpeed, play, pause, seek, replay } = useTimeline(duration, initialT);
  const readouts = stats ? stats(t).slice(0, 3) : [];
  const idle = t === 0 && !playing;
  const ended = t >= 1 && !playing;

  return (
    <section className="story" aria-label={`Animation: ${title}`}>
      <div className="story-head">
        <span className="eyebrow">Watch it happen</span>
        <h2>{title}</h2>
      </div>

      <div className="story-stage-wrap">
        <svg className="story-stage" viewBox={`0 0 ${STAGE_WIDTH} ${height}`} role="img" aria-label={title}>
          {children(t)}
        </svg>
        {idle ? (
          <button className="story-overlay" type="button" onClick={play} aria-label={`Play: ${title}`}>
            <span>
              <Play size={22} />
            </span>
          </button>
        ) : null}
      </div>

      <div className="story-bar">
        <button
          className="story-play"
          type="button"
          aria-label={playing ? 'Pause' : ended ? 'Replay' : 'Play'}
          title={playing ? 'Pause' : ended ? 'Replay' : 'Play'}
          onClick={playing ? pause : ended ? replay : play}
        >
          {playing ? <Pause size={15} /> : ended ? <RotateCcw size={15} /> : <Play size={15} />}
        </button>
        <input
          className="story-scrubber"
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={t}
          aria-label="Timeline"
          style={{ '--progress': `${t * 100}%` }}
          onChange={(event) => seek(Number(event.target.value))}
        />
        <div className="story-speed" role="group" aria-label="Playback speed">
          {SPEEDS.map((value) => (
            <button
              key={value}
              type="button"
              className={speed === value ? 'is-selected' : ''}
              aria-pressed={speed === value}
              onClick={() => setSpeed(value)}
            >
              {value}×
            </button>
          ))}
        </div>
      </div>

      {readouts.length ? (
        <dl className="readout story-readout">
          {readouts.map(([label, value, highlight]) => (
            <div className={highlight ? 'is-close' : ''} key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <p className="story-caption" aria-live="polite">
        {caption(t)}
      </p>
    </section>
  );
}

export default memo(StoryScene);

/**
 * A character on the stage, drawn from the vector set in storyArt.jsx, keyed by
 * the emoji it stands for. Figures face left, so moving right means `flip`.
 */
export function Actor({ x, y, emoji, size = 30, flip = false, rotate = 0, opacity = 1 }) {
  const Figure = STORY_ART[emoji];
  const scale = size / 24;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${flip ? -scale : scale} ${scale})`} opacity={opacity}>
      {Figure ? (
        <Figure />
      ) : (
        <text className="story-emoji" fontSize={24} textAnchor="middle" dominantBaseline="central">
          {emoji}
        </text>
      )}
    </g>
  );
}

/** A plain text label in the stage's muted ink. */
export function Label({ x, y, children, anchor = 'middle', tone = 'muted', size = 12, weight }) {
  return (
    <text className={`st-label st-${tone}`} x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight}>
      {children}
    </text>
  );
}

/**
 * A small plot frame: maps x from [x0, x1] and y from [y0, y1] into the box at
 * left and top with the given width and height, and draws its axes. Returns the
 * scale functions.
 */
export function makePlot({ left, top, width, height, x0 = 0, x1 = 1, y0 = 0, y1 = 1 }) {
  const sx = (x) => left + ((x - x0) / (x1 - x0)) * width;
  const sy = (y) => top + height - ((y - y0) / (y1 - y0)) * height;
  const path = (fn, from = x0, to = x1, steps = 120) => {
    let d = '';
    for (let i = 0; i <= steps; i += 1) {
      const x = from + ((to - from) * i) / steps;
      const y = fn(x);
      if (!Number.isFinite(y)) continue;
      d += `${d ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`;
    }
    return d;
  };
  const area = (fn, from, to, base = () => y0, steps = 90) => {
    if (to <= from) return '';
    let top = '';
    let bottom = '';
    for (let i = 0; i <= steps; i += 1) {
      const x = from + ((to - from) * i) / steps;
      top += `${i ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(fn(x)).toFixed(1)}`;
      bottom = `L${sx(x).toFixed(1)} ${sy(base(x)).toFixed(1)}` + bottom;
    }
    return `${top}${bottom}Z`;
  };
  const axes = (
    <g className="st-axes">
      <line x1={left} y1={top + height} x2={left + width} y2={top + height} />
      <line x1={left} y1={top} x2={left} y2={top + height} />
    </g>
  );
  return { sx, sy, path, area, axes };
}
