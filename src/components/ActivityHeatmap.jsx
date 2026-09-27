import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { activityYears, buildCalendar } from '../lib/activity.js';

const CELL = 11;
const STEP = 14;
const LEFT = 30;
const TOP = 18;

const weekdayLabels = [
  [1, 'Mon'],
  [3, 'Wed'],
  [5, 'Fri'],
];

const longDate = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});
const monthName = new Intl.DateTimeFormat(undefined, { month: 'short' });

function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

function describeDay(cell) {
  const { lessons, quiz, completed } = cell.day;
  return [
    lessons.length ? `${plural(lessons.length, 'lesson')} opened` : null,
    quiz ? plural(quiz, 'quiz answer') : null,
    completed ? `${completed} completed` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

function monthLabels(weeks) {
  const labels = [];
  let lastMonth = null;

  weeks.forEach((column, index) => {
    const first = column.find(Boolean);
    if (!first || first.date.getMonth() === lastMonth) return;
    lastMonth = first.date.getMonth();
    labels.push({ index, text: monthName.format(first.date) });
  });

  // A partial month at the left edge leaves no room for its label; drop it
  // rather than the full month that follows, as GitHub does.
  if (labels.length > 1 && labels[1].index - labels[0].index < 3) labels.shift();

  return labels;
}

function ActivityHeatmap({ days, since }) {
  const years = useMemo(() => activityYears(since), [since]);
  const [year, setYear] = useState(null);
  const { weeks, total, activeDays } = useMemo(() => buildCalendar(days, new Date(), year), [days, year]);
  const months = useMemo(() => monthLabels(weeks), [weeks]);
  const [hover, setHover] = useState(null);
  const scroller = useRef(null);
  const width = LEFT + weeks.length * STEP;
  const height = TOP + 7 * STEP;
  const period = year === null ? 'in the last year' : `in ${year}`;

  // Most recent weeks sit on the right; start scrolled there on narrow screens.
  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollLeft = year === null ? node.scrollWidth : 0;
  }, [year]);

  function onPointerMove(event) {
    const box = event.currentTarget.getBoundingClientRect();
    const scale = width / box.width;
    const x = (event.clientX - box.left) * scale - LEFT;
    const y = (event.clientY - box.top) * scale - TOP;
    const week = Math.floor(x / STEP);
    const weekday = Math.floor(y / STEP);
    const cell = x >= 0 && y >= 0 ? weeks[week]?.[weekday] : null;

    if (!cell) setHover(null);
    else if (hover?.cell.key !== cell.key) setHover({ cell, week, weekday });
  }

  return (
    <div className="heatmap">
      <div className="heatmap-main">
        <div className="heatmap-scroll" ref={scroller}>
          <div className="heatmap-canvas" style={{ width }}>
            <svg
              viewBox={`0 0 ${width} ${height}`}
              width={width}
              height={height}
              role="img"
              aria-label={`Activity ${period}: ${plural(total, 'action')} across ${plural(activeDays, 'active day')}.`}
              onPointerMove={onPointerMove}
              onPointerLeave={() => setHover(null)}
            >
              {months.map((label) => (
                <text className="heatmap-label" key={label.index} x={LEFT + label.index * STEP} y={11}>
                  {label.text}
                </text>
              ))}
              {weekdayLabels.map(([row, text]) => (
                <text className="heatmap-label" key={text} x={0} y={TOP + row * STEP + CELL - 1}>
                  {text}
                </text>
              ))}
              {weeks.map((column, week) =>
                column.map((cell, weekday) =>
                  cell ? (
                    <rect
                      className={`heat-cell heat-${cell.level} ${hover?.cell.key === cell.key ? 'is-hover' : ''}`}
                      key={cell.key}
                      x={LEFT + week * STEP}
                      y={TOP + weekday * STEP}
                      width={CELL}
                      height={CELL}
                      rx={2.5}
                    />
                  ) : null
                )
              )}
            </svg>

            {hover ? (
              <div
                className={`heatmap-tip ${hover.week > weeks.length - 13 ? 'is-left' : ''} ${hover.week < 8 ? 'is-right' : ''}`}
                role="presentation"
                style={{ left: LEFT + hover.week * STEP + CELL / 2, top: TOP + hover.weekday * STEP }}
              >
                <strong>{hover.cell.score ? plural(hover.cell.score, 'action') : 'No activity'}</strong>
                <span>{longDate.format(hover.cell.date)}</span>
                {hover.cell.score ? <span>{describeDay(hover.cell)}</span> : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="heatmap-foot">
          <span>
            {plural(total, 'action')} {period} · {plural(activeDays, 'active day')}
          </span>
          <span className="heatmap-legend" aria-hidden="true">
            Less
            {[0, 1, 2, 3, 4].map((level) => (
              <i className={`heat-swatch heat-${level}`} key={level} />
            ))}
            More
          </span>
        </div>
      </div>

      <div className="heatmap-years" role="group" aria-label="Year">
        {years.map((entry, index) => {
          const value = index === 0 ? null : entry;
          const selected = year === value;
          return (
            <button
              className={`heatmap-year ${selected ? 'is-selected' : ''}`}
              key={entry}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setHover(null);
                setYear(value);
              }}
            >
              {entry}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(ActivityHeatmap);
