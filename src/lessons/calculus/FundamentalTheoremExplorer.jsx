import { useEffect, useRef, useState } from 'react';
import { range } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { area, line } from 'd3-shape';

const clamp = (value, [min, max]) => Math.max(min, Math.min(max, value));

function renderActive(scene, x) {
  const { fn, sx, sf, sa, margin, width, points } = scene;
  const height = fn.f(x);
  const total = fn.F(x);
  const px = sx(x);

  // Same values d3.range would produce, taken from the grid the curve already
  // uses instead of building a new array every frame.
  const upTo = Math.max(0, Math.ceil((x + 0.001 - fn.xDomain[0]) / 0.01));
  scene.shade.attr('d', scene.areaShape(points.slice(0, upTo).concat(x)));
  scene.connector.attr('x1', px).attr('x2', px);

  scene.fPoint.attr('cx', px).attr('cy', sf(height));
  scene.fHeight.attr('x1', px).attr('x2', px).attr('y1', sf(0)).attr('y2', sf(height));

  scene.aPoint
    .attr('cx', px)
    .attr('cy', sa(total))
    .attr('aria-valuenow', x)
    .attr('aria-valuetext', `x equals ${x.toFixed(2)}, area ${total.toFixed(2)}, slope ${height.toFixed(2)}`);

  const reach = (fn.xDomain[1] - fn.xDomain[0]) * 0.18;
  const x1 = clamp(x - reach, fn.xDomain);
  const x2 = clamp(x + reach, fn.xDomain);

  scene.tangent
    .attr('x1', sx(x1))
    .attr('y1', sa(total + height * (x1 - x)))
    .attr('x2', sx(x2))
    .attr('y2', sa(total + height * (x2 - x)));

  const flip = px > width - margin.right - 110;
  scene.slopeLabel
    .attr('x', flip ? px - 12 : px + 12)
    .attr('y', sa(total) - 14)
    .attr('text-anchor', flip ? 'end' : 'start')
    .text(`slope = ${height.toFixed(2)}`);

  scene.heightLabel
    .attr('x', flip ? px - 12 : px + 12)
    .attr('y', sf(height) - 12)
    .attr('text-anchor', flip ? 'end' : 'start')
    .text(`f(x) = ${height.toFixed(2)}`);
}

export default function FundamentalTheoremExplorer({ fn, xValue, onChange }) {
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
    const height = width < 540 ? 400 : 470;
    const margin = { top: 24, right: 26, bottom: 38, left: 48 };
    const gap = 34;
    const panel = (height - margin.top - margin.bottom - gap) / 2;
    const clipId = `ftc-clip-${Math.random().toString(36).slice(2, 9)}`;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'Accumulated area above, and the function being accumulated below');

    const sx = scaleLinear().domain(fn.xDomain).range([margin.left, width - margin.right]);
    const sa = scaleLinear().domain(fn.aRange).range([margin.top + panel, margin.top]);
    const sf = scaleLinear()
      .domain(fn.fRange)
      .range([margin.top + panel + gap + panel, margin.top + panel + gap]);

    svg
      .append('clipPath')
      .attr('id', clipId)
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom);

    const clipped = svg.append('g').attr('clip-path', `url(#${clipId})`);

    for (const [scale, ticks] of [[sa, 4], [sf, 4]]) {
      svg
        .append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(${margin.left},0)`)
        .call(axisLeft(scale).ticks(ticks).tickSize(-(width - margin.left - margin.right)).tickFormat(''));
      svg
        .append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(axisLeft(scale).ticks(ticks).tickSizeOuter(0).tickPadding(6));
    }

    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${sf(0)})`)
      .call(axisBottom(sx).ticks(6).tickSizeOuter(0).tickPadding(7));

    const points = range(fn.xDomain[0], fn.xDomain[1] + 0.005, 0.01);

    const scene = { fn, sx, sf, sa, margin, width, points };

    scene.areaShape = area()
      .x((value) => sx(value))
      .y0(sf(0))
      .y1((value) => sf(fn.f(value)));

    scene.shade = clipped.append('path').attr('class', 'area-exact');

    clipped
      .append('path')
      .datum(points)
      .attr('class', 'curve approach right')
      .attr(
        'd',
        line()
          .x((value) => sx(value))
          .y((value) => sf(fn.f(value)))
      );

    clipped
      .append('path')
      .datum(points)
      .attr('class', 'curve approach left')
      .attr(
        'd',
        line()
          .x((value) => sx(value))
          .y((value) => sa(fn.F(value)))
      );

    scene.connector = clipped
      .append('line')
      .attr('class', 'trace')
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom);

    scene.fHeight = clipped.append('line').attr('class', 'distance-line');
    scene.tangent = clipped.append('line').attr('class', 'tangent-line');

    scene.fPoint = clipped.append('circle').attr('class', 'active-point is-secondary').attr('r', 6);

    scene.aPoint = clipped
      .append('circle')
      .attr('class', 'active-point')
      .attr('r', 8)
      .attr('tabindex', 0)
      .attr('role', 'slider')
      .attr('aria-label', 'Upper limit x')
      .attr('aria-valuemin', fn.xDomain[0])
      .attr('aria-valuemax', fn.xDomain[1])
      .on('keydown', (event) => {
        const span = fn.xDomain[1] - fn.xDomain[0];
        const stepSize = (event.shiftKey ? 0.1 : 0.02) * span;
        if (event.key === 'ArrowLeft') latest.current.onChange(clamp(latest.current.xValue - stepSize, fn.xDomain));
        else if (event.key === 'ArrowRight') latest.current.onChange(clamp(latest.current.xValue + stepSize, fn.xDomain));
        else return;
        event.preventDefault();
      })
      .call(
        drag().on('drag', (event) => {
          latest.current.onChange(Number(clamp(sx.invert(event.x), fn.xDomain).toFixed(3)));
        })
      );

    scene.slopeLabel = clipped.append('text').attr('class', 'point-label strong');
    scene.heightLabel = clipped.append('text').attr('class', 'point-label');

    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', margin.left + 4)
      .attr('y', margin.top + 12)
      .text('A(x) = area so far');

    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', margin.left + 4)
      .attr('y', margin.top + panel + gap + 12)
      .text('f(x)');

    sceneRef.current = scene;
    renderActive(scene, latest.current.xValue);
  }, [width, fn]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, xValue);
  }, [xValue]);

  return <div className="graph is-tall" ref={containerRef} />;
}
