import { useEffect, useRef, useState } from 'react';
import { range } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { line } from 'd3-shape';
import { guaranteedPoints, mvtCurve, secantSlope } from '../../lib/curves.js';

const clamp = (value, [min, max]) => Math.max(min, Math.min(max, value));

function renderActive(scene, { a, b, showTangents }) {
  const { x, y } = scene;
  const slope = secantSlope(mvtCurve, a, b);

  scene.secant
    .attr('x1', x(a))
    .attr('y1', y(mvtCurve.f(a)))
    .attr('x2', x(b))
    .attr('y2', y(mvtCurve.f(b)));

  scene.endA
    .attr('cx', x(a))
    .attr('cy', y(mvtCurve.f(a)))
    .attr('aria-valuenow', a)
    .attr('aria-valuetext', `left endpoint ${a.toFixed(2)}`);
  scene.endB
    .attr('cx', x(b))
    .attr('cy', y(mvtCurve.f(b)))
    .attr('aria-valuenow', b)
    .attr('aria-valuetext', `right endpoint ${b.toFixed(2)}`);

  const points = guaranteedPoints(mvtCurve, a, b);
  const reach = (mvtCurve.xDomain[1] - mvtCurve.xDomain[0]) * 0.14;

  scene.tangents
    .selectAll('line')
    .data(showTangents ? points : [])
    .join('line')
    .attr('class', 'tangent-line')
    .attr('x1', (c) => x(c - reach))
    .attr('y1', (c) => y(mvtCurve.f(c) - slope * reach))
    .attr('x2', (c) => x(c + reach))
    .attr('y2', (c) => y(mvtCurve.f(c) + slope * reach));

  scene.marks
    .selectAll('circle')
    .data(points)
    .join('circle')
    .attr('class', 'mvt-point')
    .attr('r', 6)
    .attr('cx', (c) => x(c))
    .attr('cy', (c) => y(mvtCurve.f(c)));

  scene.labels
    .selectAll('text')
    .data(points)
    .join('text')
    .attr('class', 'point-label')
    .attr('text-anchor', 'middle')
    .attr('x', (c) => x(c))
    .attr('y', (c) => y(mvtCurve.f(c)) + 22)
    .text((c) => `c = ${c.toFixed(2)}`);
}

export default function MeanValueExplorer({ a, b, showTangents, onChangeA, onChangeB }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { a, b, onChangeA, onChangeB };
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
    const clipId = `mvt-clip-${Math.random().toString(36).slice(2, 9)}`;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'A curve with a secant line and the parallel tangents it guarantees');

    const x = scaleLinear().domain(mvtCurve.xDomain).range([margin.left, width - margin.right]);
    const y = scaleLinear().domain(mvtCurve.yDomain).range([height - margin.bottom, margin.top]);

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
      .datum(range(mvtCurve.xDomain[0], mvtCurve.xDomain[1] + 0.01, 0.02))
      .attr('class', 'curve approach right')
      .attr(
        'd',
        line()
          .x((value) => x(value))
          .y((value) => y(mvtCurve.f(value)))
      );

    const scene = { x, y };

    scene.tangents = clipped.append('g');
    scene.secant = clipped.append('line').attr('class', 'secant-line');
    scene.marks = clipped.append('g');
    scene.labels = clipped.append('g');

    const handle = (label, range_, onChange) =>
      clipped
        .append('circle')
        .attr('class', 'active-point')
        .attr('r', 8)
        .attr('tabindex', 0)
        .attr('role', 'slider')
        .attr('aria-label', label)
        .attr('aria-valuemin', range_[0])
        .attr('aria-valuemax', range_[1])
        .on('keydown', (event) => {
          const stepSize = event.shiftKey ? 0.1 : 0.02;
          const current = onChange === 'a' ? latest.current.a : latest.current.b;
          const setter = onChange === 'a' ? latest.current.onChangeA : latest.current.onChangeB;
          if (event.key === 'ArrowLeft') setter(Number(clamp(current - stepSize, range_).toFixed(2)));
          else if (event.key === 'ArrowRight') setter(Number(clamp(current + stepSize, range_).toFixed(2)));
          else return;
          event.preventDefault();
        })
        .call(
          drag().on('drag', (event) => {
            const setter = onChange === 'a' ? latest.current.onChangeA : latest.current.onChangeB;
            setter(Number(clamp(x.invert(event.x), range_).toFixed(2)));
          })
        );

    scene.endA = handle('Left endpoint a', mvtCurve.aRange, 'a');
    scene.endB = handle('Right endpoint b', mvtCurve.bRange, 'b');

    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', width - margin.right)
      .attr('y', y(0) + 28)
      .attr('text-anchor', 'end')
      .text('x');

    sceneRef.current = scene;
    renderActive(scene, { a: latest.current.a, b: latest.current.b, showTangents: true });
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { a, b, showTangents });
  }, [a, b, showTangents]);

  return <div className="graph" ref={containerRef} />;
}
