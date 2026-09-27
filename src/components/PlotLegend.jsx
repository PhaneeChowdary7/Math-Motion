import { memo } from 'react';

/**
 * Identity for plot marks, so a series is never carried by colour alone.
 * The dark series palette sits in the 6-8 CVD band, which is only legal with
 * this kind of secondary encoding - the legend is load-bearing, not decoration.
 */
function PlotLegend({ items }) {
  if (!items?.length) return null;

  return (
    <ul className="plot-legend">
      {items.map(({ tone, label, dashed }) => (
        <li key={label}>
          <span
            className={`plot-legend-mark is-${tone}${dashed ? ' is-dashed' : ''}`}
            aria-hidden="true"
          />
          {label}
        </li>
      ))}
    </ul>
  );
}

export default memo(PlotLegend);
