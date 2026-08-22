import { useEffect, useRef, useState } from 'react';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { line as lineGenerator } from 'd3-shape';

const SAMPLES = 900;

function sampleRatio(fn) {
  const [x0, x1] = fn.xDomain;
  const [y0, y1] = fn.yDomain;
  const stepSize = (x1 - x0) / SAMPLES;

  const segments = [];
  let current = [];

  for (let i = 0; i <= SAMPLES; i += 1) {
    const x = x0 + i * stepSize;

    if (Math.abs(x - fn.a) < stepSize * 0.75) {
      if (current.length > 1) segments.push(current);
      current = [];
      continue;
    }

    const value = fn.ratio(x);

    if (!Number.isFinite(value) || value < y0 - 1 || value > y1 + 1) {
      if (current.length > 1) segments.push(current);
      current = [];
      continue;
    }

    current.push([x, value]);
  }

  if (current.length > 1) segments.push(current);
  return segments;
}

function renderActive(scene, xValue) {
  const { x, y, fn, margin, width } = scene;
  const value = fn.ratio(xValue);
  const finite = Number.isFinite(value);
  const px = x(xValue);
  const py = finite ? y(value) : y(fn.limit);

  scene.point.attr('display', finite ? null : 'none').attr('cx', px).attr('cy', py);
  scene.halo.attr('display', finite ? null : 'none').attr('cx', px).attr('cy', py);

  scene.point
    .attr('aria-valuenow', xValue)
    .attr(
      'aria-valuetext',
      `x equals ${xValue.toFixed(3)}, the ratio is ${finite ? value.toFixed(4) : 'undefined'}`
    );

  scene.drop.attr('x1', px).attr('x2', px).attr('y1', y(fn.limit)).attr('y2', py);

  const flip = px > width - margin.right - 130;
  scene.label
    .attr('x', flip ? px - 12 : px + 12)
    .attr('y', py - 14)
    .attr('text-anchor', flip ? 'end' : 'start')
    .text(finite ? `f/g = ${value.toFixed(4)}` : 'undefined at a');
}

export default function LHopitalExplorer({ fn, xValue, onChange }) {
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
    const height = width < 540 ? 330 : 400;
    const margin = { top: 28, right: 26, bottom: 42, left: 52 };
    const clipId = `lh-clip-${Math.random().toString(36).slice(2, 9)}`;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', `The ratio ${fn.label} approaching its limit`);

    const x = scaleLinear().domain(fn.xDomain).range([margin.left, width - margin.right]);
    const y = scaleLinear().domain(fn.yDomain).range([height - margin.bottom, margin.top]);
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
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(axisBottom(x).ticks(7).tickSizeOuter(0).tickPadding(8));
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(y).ticks(6).tickSizeOuter(0).tickPadding(8));

    const scene = { x, y, fn, margin, width, height };

    clipped
      .append('line')
      .attr('class', 'limit-line horizontal')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', y(fn.limit))
      .attr('y2', y(fn.limit));

    clipped
      .append('line')
      .attr('class', 'limit-line')
      .attr('x1', x(fn.a))
      .attr('x2', x(fn.a))
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom);

    const line = lineGenerator()
      .x((point) => x(point[0]))
      .y((point) => y(point[1]));

    sampleRatio(fn).forEach((segment) => {
      clipped.append('path').datum(segment).attr('class', 'curve approach right').attr('d', line);
    });

    clipped
      .append('circle')
      .attr('class', 'hole')
      .attr('cx', x(fn.a))
      .attr('cy', y(fn.limit))
      .attr('r', 6.5);

    clipped
      .append('text')
      .attr('class', 'label')
      .attr('x', x(fn.a) + 14)
      .attr('y', y(fn.limit) - 16)
      .text(`f'/g' = ${fn.limit}`);

    scene.drop = clipped.append('line').attr('class', 'distance-line');
    scene.halo = clipped.append('circle').attr('class', 'active-halo').attr('r', 15);

    scene.point = clipped
      .append('circle')
      .attr('class', 'active-point')
      .attr('r', 8)
      .attr('tabindex', 0)
      .attr('role', 'slider')
      .attr('aria-label', 'Value of x')
      .attr('aria-valuemin', fn.xDomain[0])
      .attr('aria-valuemax', fn.xDomain[1])
      .on('keydown', (event) => {
        const stepSize = event.shiftKey ? 0.05 : 0.005;
        let next = null;

        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = latest.current.xValue - stepSize;
        else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = latest.current.xValue + stepSize;
        else return;

        event.preventDefault();
        latest.current.onChange(Number(Math.max(fn.xDomain[0], Math.min(fn.xDomain[1], next)).toFixed(3)));
      })
      .call(
        drag().on('drag', (event) => {
          const next = Math.max(fn.xDomain[0], Math.min(fn.xDomain[1], x.invert(event.x)));
          latest.current.onChange(Number(next.toFixed(3)));
        })
      );

    scene.label = clipped.append('text').attr('class', 'point-label strong');

    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', width - margin.right)
      .attr('y', height - margin.bottom + 30)
      .attr('text-anchor', 'end')
      .text('x');

    sceneRef.current = scene;
    renderActive(scene, latest.current.xValue);
  }, [width, fn]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, xValue);
  }, [xValue]);

  return <div className="graph" ref={containerRef} />;
}
