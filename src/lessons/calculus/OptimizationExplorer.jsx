import { useEffect, useRef, useState } from 'react';
import { range } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { line } from 'd3-shape';
import { cubic } from '../../lib/curves.js';

const clamp = (value, [min, max]) => Math.max(min, Math.min(max, value));

function renderActive(scene, { xValue, showCritical }) {
  const { x, y } = scene;
  const height = cubic.f(xValue);
  const slope = cubic.df(xValue);
  const flat = Math.abs(slope) < 0.25;
  const reach = 0.55;

  scene.tangent
    .classed('is-flat', flat)
    .attr('x1', x(xValue - reach))
    .attr('y1', y(height - slope * reach))
    .attr('x2', x(xValue + reach))
    .attr('y2', y(height + slope * reach));

  scene.point
    .attr('cx', x(xValue))
    .attr('cy', y(height))
    .attr('aria-valuenow', xValue)
    .attr('aria-valuetext', `x equals ${xValue.toFixed(2)}, slope ${slope.toFixed(2)}`);

  scene.label
    .attr('x', x(xValue))
    .attr('y', y(height) - 16)
    .text(`f'(x) = ${slope.toFixed(2)}`);

  scene.marks
    .selectAll('circle')
    .data(showCritical ? cubic.criticalPoints : [])
    .join('circle')
    .attr('class', (point) => `critical-point is-${point.kind}`)
    .attr('r', 6)
    .attr('cx', (point) => x(point.x))
    .attr('cy', (point) => y(cubic.f(point.x)));

  scene.markLabels
    .selectAll('text')
    .data(showCritical ? cubic.criticalPoints : [])
    .join('text')
    .attr('class', 'point-label')
    .attr('text-anchor', 'middle')
    .attr('x', (point) => x(point.x))
    .attr('y', (point) => y(cubic.f(point.x)) + (point.kind === 'maximum' ? -18 : 26))
    .text((point) => point.kind);
}

export default function OptimizationExplorer({ xValue, showCritical, onChange }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { xValue, onChange };
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
    const height = width < 540 ? 340 : 420;
    const margin = { top: 28, right: 26, bottom: 42, left: 48 };
    const clipId = `opt-clip-${Math.random().toString(36).slice(2, 9)}`;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'A cubic curve with a moving tangent line and its critical points');

    const x = scaleLinear().domain(cubic.xDomain).range([margin.left, width - margin.right]);
    const y = scaleLinear().domain(cubic.yDomain).range([height - margin.bottom, margin.top]);

    svg
      .append('clipPath')
      .attr('id', clipId)
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom);

    const clipped = svg.append('g').attr('clip-path', `url(#${clipId})`);

    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(axisBottom(x).ticks(7).tickSize(-(height - margin.top - margin.bottom)).tickFormat(''));
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(y).ticks(5).tickSize(-(width - margin.left - margin.right)).tickFormat(''));
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${y(0)})`)
      .call(axisBottom(x).ticks(7).tickSizeOuter(0).tickPadding(8));
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${x(0)},0)`)
      .call(axisLeft(y).ticks(5).tickSizeOuter(0).tickPadding(8));

    clipped
      .append('path')
      .datum(range(cubic.xDomain[0], cubic.xDomain[1] + 0.01, 0.02))
      .attr('class', 'curve approach right')
      .attr(
        'd',
        line()
          .x((value) => x(value))
          .y((value) => y(cubic.f(value)))
      );

    const scene = { x, y };

    scene.marks = clipped.append('g');
    scene.markLabels = clipped.append('g');
    scene.tangent = clipped.append('line').attr('class', 'tangent-line');

    scene.point = clipped
      .append('circle')
      .attr('class', 'active-point')
      .attr('r', 8)
      .attr('tabindex', 0)
      .attr('role', 'slider')
      .attr('aria-label', 'Position along the curve')
      .attr('aria-valuemin', cubic.xDomain[0])
      .attr('aria-valuemax', cubic.xDomain[1])
      .on('keydown', (event) => {
        const stepSize = event.shiftKey ? 0.1 : 0.02;
        if (event.key === 'ArrowLeft')
          latest.current.onChange(Number(clamp(latest.current.xValue - stepSize, cubic.xDomain).toFixed(2)));
        else if (event.key === 'ArrowRight')
          latest.current.onChange(Number(clamp(latest.current.xValue + stepSize, cubic.xDomain).toFixed(2)));
        else return;
        event.preventDefault();
      })
      .call(
        drag().on('drag', (event) => {
          latest.current.onChange(Number(clamp(x.invert(event.x), cubic.xDomain).toFixed(2)));
        })
      );

    scene.label = clipped.append('text').attr('class', 'point-label strong').attr('text-anchor', 'middle');

    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', width - margin.right)
      .attr('y', y(0) + 28)
      .attr('text-anchor', 'end')
      .text('x');

    sceneRef.current = scene;
    renderActive(scene, { xValue: latest.current.xValue, showCritical: true });
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { xValue, showCritical });
  }, [xValue, showCritical]);

  return <div className="graph" ref={containerRef} />;
}
