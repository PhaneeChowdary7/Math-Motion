import { useEffect, useRef, useState } from 'react';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { line } from 'd3-shape';
import { FUNCTION_DOMAIN, FUNCTION_RANGE, sampleSegments } from '../../lib/basicFunctions.js';

const clamp = (value, [min, max]) => Math.max(min, Math.min(max, value));

function renderActive(scene, { fn, probe, showTest }) {
  const { x, y } = scene;
  const defined = !fn.excludes?.(probe);
  const value = defined ? fn.f(probe) : Number.NaN;
  const inView = Number.isFinite(value) && value >= FUNCTION_RANGE[0] && value <= FUNCTION_RANGE[1];

  scene.paths
    .selectAll('path')
    .data(sampleSegments(fn))
    .join('path')
    .attr('class', 'curve approach right')
    .attr(
      'd',
      line()
        .x((d) => x(d[0]))
        .y((d) => y(d[1]))
    );

  scene.sweep
    .attr('display', showTest ? null : 'none')
    .attr('x1', x(probe))
    .attr('y1', y(FUNCTION_RANGE[0]))
    .attr('x2', x(probe))
    .attr('y2', y(FUNCTION_RANGE[1]));

  scene.output
    .attr('display', inView ? null : 'none')
    .attr('x1', x(FUNCTION_DOMAIN[0]))
    .attr('y1', y(inView ? value : 0))
    .attr('x2', x(probe))
    .attr('y2', y(inView ? value : 0));

  scene.hit
    .attr('display', inView ? null : 'none')
    .attr('cx', x(probe))
    .attr('cy', y(inView ? value : 0));

  scene.handle
    .attr('cx', x(probe))
    .attr('cy', y(FUNCTION_RANGE[0]) - 14)
    .attr('aria-valuenow', probe)
    .attr('aria-valuetext', `x equals ${probe.toFixed(2)}`);

  scene.label
    .attr('display', inView ? null : 'none')
    .attr('x', x(probe) + 12)
    .attr('y', y(inView ? value : 0) - 12)
    .text(inView ? `f(${probe.toFixed(1)}) = ${value.toFixed(2)}` : '');
}

export default function FunctionExplorer({ fn, probe, showTest, onChange }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { fn, probe, showTest, onChange };
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
    const height = width < 540 ? 330 : 410;
    const margin = { top: 26, right: 24, bottom: 40, left: 44 };
    const clipId = `fn-clip-${Math.random().toString(36).slice(2, 9)}`;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'A graph with a vertical line testing one input');

    const x = scaleLinear().domain(FUNCTION_DOMAIN).range([margin.left, width - margin.right]);
    const y = scaleLinear().domain(FUNCTION_RANGE).range([height - margin.bottom, margin.top]);

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
      .call(axisBottom(x).ticks(9).tickSize(-(height - margin.top - margin.bottom)).tickFormat(''));
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(y).ticks(7).tickSize(-(width - margin.left - margin.right)).tickFormat(''));
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${y(0)})`)
      .call(axisBottom(x).ticks(9).tickSizeOuter(0).tickPadding(8));
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${x(0)},0)`)
      .call(axisLeft(y).ticks(7).tickSizeOuter(0).tickPadding(8));

    const scene = { x, y };

    scene.paths = clipped.append('g');
    scene.output = clipped.append('line').attr('class', 'leg-line');
    scene.sweep = clipped.append('line').attr('class', 'sweep-line');
    scene.hit = clipped.append('circle').attr('class', 'mvt-point').attr('r', 6);

    scene.handle = svg
      .append('circle')
      .attr('class', 'active-point')
      .attr('r', 8)
      .attr('tabindex', 0)
      .attr('role', 'slider')
      .attr('aria-label', 'Input x')
      .attr('aria-valuemin', FUNCTION_DOMAIN[0])
      .attr('aria-valuemax', FUNCTION_DOMAIN[1])
      .on('keydown', (event) => {
        const step = event.shiftKey ? 0.5 : 0.1;
        if (event.key === 'ArrowLeft') {
          latest.current.onChange(Number(clamp(latest.current.probe - step, FUNCTION_DOMAIN).toFixed(2)));
        } else if (event.key === 'ArrowRight') {
          latest.current.onChange(Number(clamp(latest.current.probe + step, FUNCTION_DOMAIN).toFixed(2)));
        } else return;
        event.preventDefault();
      })
      .call(
        drag().on('drag', (event) => {
          latest.current.onChange(Number(clamp(x.invert(event.x), FUNCTION_DOMAIN).toFixed(2)));
        })
      );

    scene.label = svg.append('text').attr('class', 'point-label');

    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', width - margin.right)
      .attr('y', y(0) + 26)
      .attr('text-anchor', 'end')
      .text('x');

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { fn, probe, showTest });
  }, [fn, probe, showTest]);

  return <div className="graph" ref={containerRef} />;
}
