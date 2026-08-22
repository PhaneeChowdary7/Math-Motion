import { useEffect, useRef, useState } from 'react';
import { range } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { area, line } from 'd3-shape';
import { gapAt, strips } from '../../lib/areaCurves.js';

const clamp = (value, [min, max]) => Math.max(min, Math.min(max, value));

function renderActive(scene, { pair, a, b, n, showStrips }) {
  const { x, y, margin, width } = scene;

  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const samples = range(lo, hi + 1e-9, Math.max(0.004, (hi - lo) / 300)).concat(hi);

  scene.region.attr('d', scene.band(samples));

  scene.strips
    .attr('display', showStrips ? null : 'none')
    .selectAll('rect')
    .data(showStrips ? strips(pair, lo, hi, n) : [])
    .join('rect')
    .attr('x', (bar) => x(bar.x0))
    .attr('y', (bar) => Math.min(y(bar.top), y(bar.bottom)))
    .attr('width', (bar) => Math.max(0, x(bar.x1) - x(bar.x0) - (n > 30 ? 0 : 0.6)))
    .attr('height', (bar) => Math.abs(y(bar.bottom) - y(bar.top)));

  [
    ['handleA', 'labelA', a, 'a'],
    ['handleB', 'labelB', b, 'b'],
  ].forEach(([handleKey, labelKey, value, name]) => {
    const px = x(value);
    const top = pair.top.f(value);
    const bottom = pair.bottom.f(value);

    scene[handleKey]
      .attr('cx', px)
      .attr('cy', y((top + bottom) / 2))
      .attr('aria-valuenow', value)
      .attr('aria-valuetext', `${name} equals ${value.toFixed(2)}`);

    scene[`${handleKey}Line`].attr('x1', px).attr('x2', px).attr('y1', y(top)).attr('y2', y(bottom));

    const flip = px > width - margin.right - 60;
    scene[labelKey]
      .attr('x', flip ? px - 10 : px + 10)
      .attr('y', y(Math.max(top, bottom)) - 12)
      .attr('text-anchor', flip ? 'end' : 'start')
      .text(`${name} = ${value.toFixed(2)}`);
  });

  const mid = (lo + hi) / 2;
  const height = gapAt(pair, mid);

  scene.gapLine
    .attr('x1', x(mid))
    .attr('x2', x(mid))
    .attr('y1', y(pair.bottom.f(mid)))
    .attr('y2', y(pair.top.f(mid)));

  scene.gapLabel
    .attr('x', x(mid) + 10)
    .attr('y', y((pair.top.f(mid) + pair.bottom.f(mid)) / 2))
    .text(`top − bottom = ${height.toFixed(2)}`);
}

export default function AreaBetweenExplorer({ pair, a, b, n, showStrips, onChangeA, onChangeB }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { pair, a, b, n, showStrips, onChangeA, onChangeB };
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
    const margin = { top: 28, right: 26, bottom: 42, left: 50 };
    const clipId = `area-clip-${Math.random().toString(36).slice(2, 9)}`;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'Two curves with the region between them shaded');

    const x = scaleLinear().domain(pair.xDomain).range([margin.left, width - margin.right]);
    const y = scaleLinear().domain(pair.yDomain).range([height - margin.bottom, margin.top]);
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

    scene.band = area()
      .x((value) => x(value))
      .y0((value) => y(pair.bottom.f(value)))
      .y1((value) => y(pair.top.f(value)));

    scene.region = clipped.append('path').attr('class', 'area-between');
    scene.strips = clipped.append('g').attr('class', 'riemann');

    const curveSamples = range(pair.xDomain[0], pair.xDomain[1] + 0.01, 0.02);

    clipped
      .append('path')
      .datum(curveSamples)
      .attr('class', 'curve approach right')
      .attr(
        'd',
        line()
          .x((value) => x(value))
          .y((value) => y(pair.top.f(value)))
      );

    clipped
      .append('path')
      .datum(curveSamples)
      .attr('class', 'curve approach left')
      .attr(
        'd',
        line()
          .x((value) => x(value))
          .y((value) => y(pair.bottom.f(value)))
      );

    scene.gapLine = clipped.append('line').attr('class', 'distance-line');
    scene.gapLabel = clipped.append('text').attr('class', 'point-label');

    const bounds = [pair.xDomain[0] + 0.05, pair.xDomain[1] - 0.05];

    const makeHandle = (label, setterKey) => {
      const handleLine = clipped.append('line').attr('class', 'limit-line');

      const handle = clipped
        .append('circle')
        .attr('class', 'active-point')
        .attr('r', 8)
        .attr('tabindex', 0)
        .attr('role', 'slider')
        .attr('aria-label', label)
        .attr('aria-valuemin', bounds[0])
        .attr('aria-valuemax', bounds[1])
        .on('keydown', (event) => {
          const stepSize = event.shiftKey ? 0.1 : 0.02;
          const current = latest.current[setterKey === 'onChangeA' ? 'a' : 'b'];
          if (event.key === 'ArrowLeft') latest.current[setterKey](Number(clamp(current - stepSize, bounds).toFixed(2)));
          else if (event.key === 'ArrowRight') latest.current[setterKey](Number(clamp(current + stepSize, bounds).toFixed(2)));
          else return;
          event.preventDefault();
        })
        .call(
          drag().on('drag', (event) => {
            latest.current[setterKey](Number(clamp(x.invert(event.x), bounds).toFixed(2)));
          })
        );

      return { handle, handleLine };
    };

    const first = makeHandle('Left bound a', 'onChangeA');
    const second = makeHandle('Right bound b', 'onChangeB');

    scene.handleA = first.handle;
    scene.handleALine = first.handleLine;
    scene.handleB = second.handle;
    scene.handleBLine = second.handleLine;

    scene.labelA = clipped.append('text').attr('class', 'point-label strong');
    scene.labelB = clipped.append('text').attr('class', 'point-label strong');

    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', width - margin.right)
      .attr('y', y(0) + 28)
      .attr('text-anchor', 'end')
      .text('x');

    sceneRef.current = scene;
    renderActive(scene, { ...latest.current, pair });
  }, [width, pair]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { pair, a, b, n, showStrips });
  }, [pair, a, b, n, showStrips]);

  return <div className="graph" ref={containerRef} />;
}
