import { useEffect, useRef, useState } from 'react';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { line } from 'd3-shape';
import {
  GROWTH_DOMAIN,
  GROWTH_RANGE,
  exponentialSamples,
  logBase,
  logarithmSamples,
} from '../../lib/growth.js';

function renderActive(scene, { base, probe, showInverse }) {
  const { x, y } = scene;
  const path = line()
    .x((d) => x(d[0]))
    .y((d) => y(d[1]));

  scene.exponential.attr('d', path(exponentialSamples(base)));

  scene.logarithm
    .attr('display', showInverse ? null : 'none')
    .attr('d', path(logarithmSamples(base)));

  scene.mirror.attr('display', showInverse ? null : 'none');

  const height = base ** probe;
  const inView = height >= GROWTH_RANGE[0] && height <= GROWTH_RANGE[1];

  scene.marker
    .attr('display', inView ? null : 'none')
    .attr('cx', x(probe))
    .attr('cy', y(inView ? height : 0));

  scene.drop
    .attr('display', inView ? null : 'none')
    .attr('x1', x(probe))
    .attr('y1', y(0))
    .attr('x2', x(probe))
    .attr('y2', y(inView ? height : 0));

  scene.label
    .attr('display', inView ? null : 'none')
    .attr('x', x(probe) + 12)
    .attr('y', y(inView ? height : 0) - 10)
    .text(inView ? `(${probe.toFixed(2)}, ${height.toFixed(2)})` : '');

  const mirrored = inView && height > 0 && height <= GROWTH_DOMAIN[1];

  scene.mirrorMarker
    .attr('display', showInverse && mirrored ? null : 'none')
    .attr('cx', x(mirrored ? height : 0))
    .attr('cy', y(mirrored ? logBase(base, height) : 0));

  scene.tie
    .attr('display', showInverse && mirrored ? null : 'none')
    .attr('x1', x(probe))
    .attr('y1', y(mirrored ? height : 0))
    .attr('x2', x(mirrored ? height : 0))
    .attr('y2', y(mirrored ? logBase(base, height) : 0));
}

export default function GrowthExplorer({ base, probe, showInverse }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { base, probe, showInverse };
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
    const margin = { top: 24, right: 24, bottom: 38, left: 44 };
    const clipId = `growth-clip-${Math.random().toString(36).slice(2, 9)}`;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'An exponential curve and its logarithm, mirrored in the line y equals x');

    const x = scaleLinear().domain(GROWTH_DOMAIN).range([margin.left, width - margin.right]);
    const y = scaleLinear().domain(GROWTH_RANGE).range([height - margin.bottom, margin.top]);

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
      .call(axisLeft(y).ticks(9).tickSize(-(width - margin.left - margin.right)).tickFormat(''));
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${y(0)})`)
      .call(axisBottom(x).ticks(7).tickSizeOuter(0).tickPadding(8));
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${x(0)},0)`)
      .call(axisLeft(y).ticks(7).tickSizeOuter(0).tickPadding(8));

    const scene = { x, y };

    scene.mirror = clipped
      .append('line')
      .attr('class', 'mirror-line')
      .attr('x1', x(GROWTH_DOMAIN[0]))
      .attr('y1', y(GROWTH_DOMAIN[0]))
      .attr('x2', x(GROWTH_DOMAIN[1]))
      .attr('y2', y(GROWTH_DOMAIN[1]));

    scene.logarithm = clipped.append('path').attr('class', 'curve is-inverse');
    scene.exponential = clipped.append('path').attr('class', 'curve approach right');
    scene.tie = clipped.append('line').attr('class', 'tie-line');
    scene.drop = clipped.append('line').attr('class', 'leg-line');
    scene.mirrorMarker = clipped.append('circle').attr('class', 'mvt-point').attr('r', 6);
    scene.marker = clipped.append('circle').attr('class', 'active-point').attr('r', 7);
    scene.label = clipped.append('text').attr('class', 'point-label');

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
    if (sceneRef.current) renderActive(sceneRef.current, { base, probe, showInverse });
  }, [base, probe, showInverse]);

  return <div className="graph" ref={containerRef} />;
}
