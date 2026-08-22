import { useEffect, useRef, useState } from 'react';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';

export const RADIUS = 5;

const X_SPAN = 15;
const Y_SPAN = 12.4;

export const pointAt = (angle) => ({ x: RADIUS * Math.cos(angle), y: RADIUS * Math.sin(angle) });

export function slopeAt(angle) {
  const { x, y } = pointAt(angle);
  if (Math.abs(y) < 1e-9) return null;

  const slope = -x / y;
  return Math.abs(slope) < 1e-9 ? 0 : slope;
}

function renderActive(scene, { angle, showTangent }) {
  const { x, y, margin, width } = scene;
  const point = pointAt(angle);
  const slope = slopeAt(angle);
  const px = x(point.x);
  const py = y(point.y);

  scene.radius.attr('x2', px).attr('y2', py);

  if (slope === null) {
    scene.tangent.attr('x1', px).attr('x2', px).attr('y1', y(-Y_SPAN)).attr('y2', y(Y_SPAN));
  } else {
    const reach = 4.2;
    scene.tangent
      .attr('x1', x(point.x - reach))
      .attr('y1', y(point.y - slope * reach))
      .attr('x2', x(point.x + reach))
      .attr('y2', y(point.y + slope * reach));
  }

  scene.tangent.attr('display', showTangent ? null : 'none').classed('is-flat', slope === null);

  scene.point
    .attr('cx', px)
    .attr('cy', py)
    .attr('aria-valuenow', Number(point.x.toFixed(2)))
    .attr(
      'aria-valuetext',
      `x equals ${point.x.toFixed(2)}, y equals ${point.y.toFixed(2)}, slope ${
        slope === null ? 'undefined, the tangent is vertical' : slope.toFixed(2)
      }`
    );

  scene.halo.attr('cx', px).attr('cy', py);

  const flip = px > width - margin.right - 150;
  scene.label
    .attr('x', flip ? px - 14 : px + 14)
    .attr('y', py - 14)
    .attr('text-anchor', flip ? 'end' : 'start')
    .text(`(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`);

  scene.slopeLabel
    .attr('x', flip ? px - 14 : px + 14)
    .attr('y', py + 26)
    .attr('text-anchor', flip ? 'end' : 'start')
    .text(slope === null ? 'dy/dx undefined' : `dy/dx = ${slope.toFixed(2)}`);
}

export default function ImplicitExplorer({ angle, showTangent, onChange }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { angle, showTangent, onChange };
  });

  useEffect(() => {
    const container = containerRef.current;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      setWidth((current) => (Math.abs(current - next) > 1 ? next : current));
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!width) return;

    const container = containerRef.current;
    const height = width < 540 ? 340 : 430;
    const margin = { top: 26, right: 26, bottom: 40, left: 48 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'The circle x squared plus y squared equals 25, with a tangent line');

    const unit = Math.min(plotWidth / X_SPAN, plotHeight / Y_SPAN);
    const cx = margin.left + plotWidth / 2;
    const cy = margin.top + plotHeight / 2;

    const x = scaleLinear()
      .domain([-X_SPAN / 2, X_SPAN / 2])
      .range([cx - (X_SPAN / 2) * unit, cx + (X_SPAN / 2) * unit]);
    const y = scaleLinear()
      .domain([-Y_SPAN / 2, Y_SPAN / 2])
      .range([cy + (Y_SPAN / 2) * unit, cy - (Y_SPAN / 2) * unit]);

    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(axisBottom(x).ticks(8).tickSize(-plotHeight).tickFormat(''));
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(y).ticks(6).tickSize(-plotWidth).tickFormat(''));
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${y(0)})`)
      .call(axisBottom(x).ticks(8).tickSizeOuter(0).tickPadding(8));
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${x(0)},0)`)
      .call(axisLeft(y).ticks(6).tickSizeOuter(0).tickPadding(8));

    const scene = { x, y, margin, width, height };

    svg
      .append('circle')
      .attr('class', 'implicit-curve')
      .attr('cx', x(0))
      .attr('cy', y(0))
      .attr('r', RADIUS * unit);

    scene.radius = svg
      .append('line')
      .attr('class', 'distance-line')
      .attr('x1', x(0))
      .attr('y1', y(0));

    scene.tangent = svg.append('line').attr('class', 'tangent-line');
    scene.halo = svg.append('circle').attr('class', 'active-halo').attr('r', 15);

    const setFromPointer = (event) => {
      const next = Math.atan2(y.invert(event.y), x.invert(event.x));
      latest.current.onChange(next);
    };

    scene.point = svg
      .append('circle')
      .attr('class', 'active-point')
      .attr('r', 8)
      .attr('tabindex', 0)
      .attr('role', 'slider')
      .attr('aria-label', 'Point on the circle')
      .attr('aria-valuemin', -RADIUS)
      .attr('aria-valuemax', RADIUS)
      .on('keydown', (event) => {
        const stepSize = (event.shiftKey ? 0.25 : 0.05) * Math.PI;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown')
          latest.current.onChange(latest.current.angle - stepSize);
        else if (event.key === 'ArrowRight' || event.key === 'ArrowUp')
          latest.current.onChange(latest.current.angle + stepSize);
        else return;
        event.preventDefault();
      })
      .call(drag().on('drag', setFromPointer));

    scene.label = svg.append('text').attr('class', 'point-label');
    scene.slopeLabel = svg.append('text').attr('class', 'point-label strong');

    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', width - margin.right)
      .attr('y', y(0) + 28)
      .attr('text-anchor', 'end')
      .text('x');

    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', x(0) + 12)
      .attr('y', margin.top + 12)
      .text('y');

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { angle, showTangent });
  }, [angle, showTangent]);

  return <div className="graph" ref={containerRef} />;
}
