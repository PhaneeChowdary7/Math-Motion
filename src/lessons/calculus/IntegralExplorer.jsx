import { useEffect, useRef, useState } from 'react';
import { range } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { area, line } from 'd3-shape';
import { exactArea, f, partition } from '../../lib/riemann.js';

export const xDomain = [-0.25, 3.4];
export const yDomain = [-0.8, 10.2];
export const bRange = [0.5, 3];
export const nRange = [1, 80];

const clamp = (value, [min, max]) => Math.max(min, Math.min(max, value));

function renderActive(scene, { b, n, rule, showExact }) {
  const { x, y, margin, width } = scene;
  const baseline = y(0);
  const gap = n > 40 ? 0 : 0.5;

  scene.bars
    .selectAll('rect')
    .data(partition(0, b, n, rule))
    .join('rect')
    .attr('x', (bar) => x(bar.x0))
    .attr('y', (bar) => y(bar.height))
    .attr('width', (bar) => Math.max(0, x(bar.x1) - x(bar.x0) - gap))
    .attr('height', (bar) => Math.max(0, baseline - y(bar.height)));

  scene.exact.attr('display', showExact ? null : 'none');

  // Around 400 samples per redraw, so skip it while the shape is hidden.
  if (showExact) {
    scene.exact.attr('d', scene.areaShape(range(0, b + 0.005, Math.max(0.005, b / 400)).concat(b)));
  }

  scene.edge
    .attr('x1', x(b))
    .attr('x2', x(b))
    .attr('y1', y(0))
    .attr('y2', y(f(b)));

  scene.handle
    .attr('cx', x(b))
    .attr('cy', y(f(b)))
    .attr('aria-valuenow', b)
    .attr('aria-valuetext', `upper limit ${b.toFixed(2)}, area ${exactArea(0, b).toFixed(2)}`);

  const flip = x(b) > width - margin.right - 120;
  scene.label
    .attr('x', flip ? x(b) - 12 : x(b) + 12)
    .attr('y', y(f(b)) - 14)
    .attr('text-anchor', flip ? 'end' : 'start')
    .text(`b = ${b.toFixed(2)}`);
}

export default function IntegralExplorer({ b, n, rule, showExact, onChangeB }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { b, n, rule, showExact, onChangeB };
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
    const margin = { top: 30, right: 28, bottom: 44, left: 52 };
    const clipId = `integral-clip-${Math.random().toString(36).slice(2, 9)}`;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'Area under f of x equals x squared, approximated by rectangles');

    const x = scaleLinear().domain(xDomain).range([margin.left, width - margin.right]);
    const y = scaleLinear().domain(yDomain).range([height - margin.bottom, margin.top]);
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    svg
      .append('clipPath')
      .attr('id', clipId)
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', plotWidth)
      .attr('height', plotHeight);

    const clipped = svg.append('g').attr('clip-path', `url(#${clipId})`);

    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(axisBottom(x).ticks(7).tickSize(-plotHeight).tickFormat(''));
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(y).ticks(6).tickSize(-plotWidth).tickFormat(''));
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${y(0)})`)
      .call(axisBottom(x).ticks(7).tickSizeOuter(0).tickPadding(8));
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${x(0)},0)`)
      .call(axisLeft(y).ticks(6).tickSizeOuter(0).tickPadding(8));

    const scene = { x, y, margin, width, height };

    scene.areaShape = area()
      .x((value) => x(value))
      .y0(y(0))
      .y1((value) => y(f(value)));

    scene.exact = clipped.append('path').attr('class', 'area-exact');
    scene.bars = clipped.append('g').attr('class', 'riemann');

    clipped
      .append('path')
      .datum(range(xDomain[0], xDomain[1] + 0.01, 0.02))
      .attr('class', 'curve approach right')
      .attr(
        'd',
        line()
          .x((value) => x(value))
          .y((value) => y(f(value)))
      );

    scene.edge = clipped.append('line').attr('class', 'limit-line');

    scene.handle = clipped
      .append('circle')
      .attr('class', 'active-point')
      .attr('r', 8)
      .attr('tabindex', 0)
      .attr('role', 'slider')
      .attr('aria-label', 'Upper limit b')
      .attr('aria-valuemin', bRange[0])
      .attr('aria-valuemax', bRange[1])
      .on('keydown', (event) => {
        const step = event.shiftKey ? 0.1 : 0.01;
        if (event.key === 'ArrowLeft') latest.current.onChangeB(clamp(latest.current.b - step, bRange));
        else if (event.key === 'ArrowRight') latest.current.onChangeB(clamp(latest.current.b + step, bRange));
        else return;
        event.preventDefault();
      })
      .call(
        drag().on('drag', (event) => {
          latest.current.onChangeB(Number(clamp(x.invert(event.x), bRange).toFixed(2)));
        })
      );

    scene.label = clipped.append('text').attr('class', 'point-label');

    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', width - margin.right)
      .attr('y', y(0) + 30)
      .attr('text-anchor', 'end')
      .text('x');

    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', x(0) + 12)
      .attr('y', margin.top + 12)
      .text('f(x)');

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { b, n, rule, showExact });
  }, [b, n, rule, showExact]);

  return <div className="graph" ref={containerRef} />;
}
