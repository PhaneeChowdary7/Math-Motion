import { useEffect, useRef, useState } from 'react';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import PlotLegend from '../../components/PlotLegend.jsx';
import { VIEW, lineEndpoints, solveSystem } from '../../lib/linearAlgebra.js';

function renderActive(scene, { row1, row2 }) {
  const { x, y } = scene;
  const result = solveSystem(row1, row2);

  for (const [key, row] of [['line1', row1], ['line2', row2]]) {
    const ends = lineEndpoints(row);
    if (!ends) {
      scene[key].attr('display', 'none');
      continue;
    }
    scene[key]
      .attr('display', null)
      .attr('x1', x(ends[0].x)).attr('y1', y(ends[0].y))
      .attr('x2', x(ends[1].x)).attr('y2', y(ends[1].y));
  }

  const inView =
    result.point &&
    result.point.x >= VIEW[0] && result.point.x <= VIEW[1] &&
    result.point.y >= VIEW[0] && result.point.y <= VIEW[1];

  scene.point.attr('display', inView ? null : 'none');
  scene.pointLabel.attr('display', inView ? null : 'none');

  if (inView) {
    scene.point.attr('cx', x(result.point.x)).attr('cy', y(result.point.y));
    scene.pointLabel
      .attr('x', x(result.point.x) + 12)
      .attr('y', y(result.point.y) - 12)
      .text(`(${result.point.x.toFixed(2)}, ${result.point.y.toFixed(2)})`);
  }
}

export default function SystemsExplorer({ row1, row2 }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { row1, row2 };
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
    const margin = { top: 24, right: 26, bottom: 38, left: 44 };
    const clipId = `sys-clip-${Math.random().toString(36).slice(2, 9)}`;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'Two lines and the point where they meet');

    const x = scaleLinear().domain(VIEW).range([margin.left, width - margin.right]);
    const y = scaleLinear().domain(VIEW).range([height - margin.bottom, margin.top]);
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    svg.append('clipPath').attr('id', clipId).append('rect')
      .attr('x', margin.left).attr('y', margin.top)
      .attr('width', plotWidth).attr('height', plotHeight);

    svg.append('g').attr('class', 'grid')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(axisBottom(x).ticks(12).tickSize(-plotHeight).tickFormat(''));
    svg.append('g').attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(y).ticks(12).tickSize(-plotWidth).tickFormat(''));
    svg.append('g').attr('class', 'axis')
      .attr('transform', `translate(0,${y(0)})`)
      .call(axisBottom(x).ticks(6).tickSizeOuter(0).tickPadding(8));
    svg.append('g').attr('class', 'axis')
      .attr('transform', `translate(${x(0)},0)`)
      .call(axisLeft(y).ticks(6).tickSizeOuter(0).tickPadding(8));

    const clipped = svg.append('g').attr('clip-path', `url(#${clipId})`);
    const scene = { x, y };

    scene.line1 = clipped.append('line').attr('class', 'curve approach right');
    scene.line2 = clipped.append('line').attr('class', 'secant-line');
    scene.point = clipped.append('circle').attr('class', 'mvt-point').attr('r', 7);
    scene.pointLabel = clipped.append('text').attr('class', 'point-label strong');

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { row1, row2 });
  }, [row1, row2]);

  return (
    <>
      <div className="graph" ref={containerRef} />
      <PlotLegend
        items={[
          { tone: 'curve', label: 'first equation' },
          { tone: 'secant', label: 'second equation' },
          { tone: 'tangent', label: 'solution' },
        ]}
      />
    </>
  );
}
