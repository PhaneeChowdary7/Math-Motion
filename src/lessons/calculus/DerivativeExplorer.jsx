import { useEffect, useRef, useState } from 'react';
import { range } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { line } from 'd3-shape';

export const xDomain = [-0.6, 3.2];
export const yDomain = [-1.4, 9.8];

export const aRange = [0.3, 1.8];
export const hRange = [0.02, 1.2];

export const f = (x) => x * x;
export const fPrime = (x) => 2 * x;

const clamp = (value, [min, max]) => Math.max(min, Math.min(max, value));

function renderActive(scene, { a, h, showTangent }) {
  const { x, y, margin, width } = scene;

  const ax = x(a);
  const ay = y(f(a));
  const bx = x(a + h);
  const by = y(f(a + h));
  const secantSlope = fPrime(a) + h;

  const lineAcross = (slope) => ({
    x1: x(xDomain[0]),
    y1: y(f(a) + slope * (xDomain[0] - a)),
    x2: x(xDomain[1]),
    y2: y(f(a) + slope * (xDomain[1] - a)),
  });

  const secant = lineAcross(secantSlope);
  scene.secant.attr('x1', secant.x1).attr('y1', secant.y1).attr('x2', secant.x2).attr('y2', secant.y2);

  const tangent = lineAcross(fPrime(a));
  scene.tangent
    .attr('display', showTangent ? null : 'none')
    .attr('x1', tangent.x1)
    .attr('y1', tangent.y1)
    .attr('x2', tangent.x2)
    .attr('y2', tangent.y2);

  scene.riseRun.attr('d', `M${ax},${ay} L${bx},${ay} L${bx},${by}`);

  scene.runLabel
    .attr('x', (ax + bx) / 2)
    .attr('y', ay + 18)
    .text(`Δx = ${h.toFixed(2)}`);

  scene.riseLabel
    .attr('x', bx + 10)
    .attr('y', (ay + by) / 2)
    .text(`Δy = ${(f(a + h) - f(a)).toFixed(2)}`);

  scene.pointA.attr('cx', ax).attr('cy', ay).attr('aria-valuenow', a).attr('aria-valuetext', `a equals ${a.toFixed(2)}`);
  scene.haloA.attr('cx', ax).attr('cy', ay);

  scene.pointB
    .attr('cx', bx)
    .attr('cy', by)
    .attr('aria-valuenow', h)
    .attr('aria-valuetext', `gap h equals ${h.toFixed(2)}, secant slope ${secantSlope.toFixed(2)}`);

  const flip = bx > width - margin.right - 130;
  scene.slopeLabel
    .attr('x', flip ? bx - 14 : bx + 14)
    .attr('y', by - 14)
    .attr('text-anchor', flip ? 'end' : 'start')
    .text(`secant slope = ${secantSlope.toFixed(2)}`);
}

export default function DerivativeExplorer({ a, h, showTangent, onChangeA, onChangeH }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { a, h, showTangent, onChangeA, onChangeH };
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
    const clipId = `deriv-clip-${Math.random().toString(36).slice(2, 9)}`;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'Plot of f of x equals x squared with a secant line');

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

    const curve = line()
      .x((value) => x(value))
      .y((value) => y(f(value)));

    clipped
      .append('path')
      .datum(range(xDomain[0], xDomain[1] + 0.01, 0.02))
      .attr('class', 'curve approach right')
      .attr('d', curve);

    const scene = { x, y, margin, width, height };

    scene.riseRun = clipped.append('path').attr('class', 'rise-run');
    scene.tangent = clipped.append('line').attr('class', 'tangent-line');
    scene.secant = clipped.append('line').attr('class', 'secant-line');
    scene.runLabel = clipped.append('text').attr('class', 'point-label').attr('text-anchor', 'middle');
    scene.riseLabel = clipped.append('text').attr('class', 'point-label');
    scene.slopeLabel = clipped.append('text').attr('class', 'point-label strong');

    scene.haloA = clipped.append('circle').attr('class', 'active-halo').attr('r', 15);

    scene.pointA = clipped
      .append('circle')
      .attr('class', 'active-point')
      .attr('r', 8)
      .attr('tabindex', 0)
      .attr('role', 'slider')
      .attr('aria-label', 'Base point a')
      .attr('aria-valuemin', aRange[0])
      .attr('aria-valuemax', aRange[1])
      .on('keydown', (event) => {
        const step = event.shiftKey ? 0.1 : 0.01;
        if (event.key === 'ArrowLeft') latest.current.onChangeA(clamp(latest.current.a - step, aRange));
        else if (event.key === 'ArrowRight') latest.current.onChangeA(clamp(latest.current.a + step, aRange));
        else return;
        event.preventDefault();
      })
      .call(
        drag().on('drag', (event) => {
          latest.current.onChangeA(Number(clamp(x.invert(event.x), aRange).toFixed(2)));
        })
      );

    scene.pointB = clipped
      .append('circle')
      .attr('class', 'active-point is-secondary')
      .attr('r', 8)
      .attr('tabindex', 0)
      .attr('role', 'slider')
      .attr('aria-label', 'Gap h between the two points')
      .attr('aria-valuemin', hRange[0])
      .attr('aria-valuemax', hRange[1])
      .on('keydown', (event) => {
        const step = event.shiftKey ? 0.1 : 0.01;
        if (event.key === 'ArrowLeft') latest.current.onChangeH(clamp(latest.current.h - step, hRange));
        else if (event.key === 'ArrowRight') latest.current.onChangeH(clamp(latest.current.h + step, hRange));
        else return;
        event.preventDefault();
      })
      .call(
        drag().on('drag', (event) => {
          const next = x.invert(event.x) - latest.current.a;
          latest.current.onChangeH(Number(clamp(next, hRange).toFixed(2)));
        })
      );

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
    if (sceneRef.current) renderActive(sceneRef.current, { a, h, showTangent });
  }, [a, h, showTangent]);

  return <div className="graph" ref={containerRef} />;
}
