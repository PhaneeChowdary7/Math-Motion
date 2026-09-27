import { useEffect, useRef, useState } from 'react';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import PlotLegend from '../../components/PlotLegend.jsx';
import { drawArrow } from './arrow.js';
import { VIEW, clamp, cross } from '../../lib/linearAlgebra.js';

const SNAP = (value) => Number(value.toFixed(1));

function renderActive(scene, { v, w }) {
  const { x, y } = scene;
  const det = cross(v, w);
  const flipped = det < 0;
  const flat = Math.abs(det) < 0.05;

  scene.parallelogram
    .attr('class', `det-area ${flipped ? 'is-flipped' : ''} ${flat ? 'is-flat' : ''}`)
    .attr('points', [
      { x: 0, y: 0 },
      v,
      { x: v.x + w.x, y: v.y + w.y },
      w,
    ].map((p) => `${x(p.x)},${y(p.y)}`).join(' '));

  drawArrow(scene, scene.vLine, scene.vHead, v);
  drawArrow(scene, scene.wLine, scene.wHead, w);

  scene.edge1.attr('x1', x(v.x)).attr('y1', y(v.y))
    .attr('x2', x(v.x + w.x)).attr('y2', y(v.y + w.y));
  scene.edge2.attr('x1', x(w.x)).attr('y1', y(w.y))
    .attr('x2', x(v.x + w.x)).attr('y2', y(v.y + w.y));

  scene.areaLabel
    .attr('x', x((v.x + w.x) / 2))
    .attr('y', y((v.y + w.y) / 2))
    .attr('text-anchor', 'middle')
    .text(flat ? 'area 0' : `area ${Math.abs(det).toFixed(2)}`);

  scene.vHandle.attr('cx', x(v.x)).attr('cy', y(v.y))
    .attr('aria-valuetext', `v equals ${v.x.toFixed(1)}, ${v.y.toFixed(1)}`);
  scene.wHandle.attr('cx', x(w.x)).attr('cy', y(w.y))
    .attr('aria-valuetext', `w equals ${w.x.toFixed(1)}, ${w.y.toFixed(1)}`);
}

export default function DeterminantExplorer({ v, w, onChange }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { v, w, onChange };
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
    const clipId = `det-clip-${Math.random().toString(36).slice(2, 9)}`;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'The parallelogram spanned by two vectors, and its area');

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

    const clipped = svg.append('g').attr('clip-path', `url(#${clipId})`);
    const scene = { x, y };

    scene.parallelogram = clipped.append('polygon').attr('class', 'det-area');
    scene.edge1 = clipped.append('line').attr('class', 'leg-line');
    scene.edge2 = clipped.append('line').attr('class', 'leg-line');

    svg.append('g').attr('class', 'axis')
      .attr('transform', `translate(0,${y(0)})`)
      .call(axisBottom(x).ticks(6).tickSizeOuter(0).tickPadding(8));
    svg.append('g').attr('class', 'axis')
      .attr('transform', `translate(${x(0)},0)`)
      .call(axisLeft(y).ticks(6).tickSizeOuter(0).tickPadding(8));

    scene.vLine = clipped.append('line').attr('class', 'curve approach right');
    scene.wLine = clipped.append('line').attr('class', 'secant-line');
    scene.areaLabel = clipped.append('text').attr('class', 'point-label strong');

    const handle = (cls, label, key) =>
      svg.append('circle').attr('class', cls).attr('r', 7)
        .attr('tabindex', 0).attr('role', 'slider').attr('aria-label', label)
        .on('keydown', (event) => {
          const step = event.shiftKey ? 1 : 0.1;
          const current = latest.current[key];
          const moves = {
            ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 },
            ArrowUp: { x: 0, y: step }, ArrowDown: { x: 0, y: -step },
          };
          const move = moves[event.key];
          if (!move) return;
          event.preventDefault();
          latest.current.onChange(key, {
            x: SNAP(clamp(current.x + move.x, VIEW)),
            y: SNAP(clamp(current.y + move.y, VIEW)),
          });
        })
        .call(drag().on('drag', (event) => {
          latest.current.onChange(key, {
            x: SNAP(clamp(x.invert(event.x), VIEW)),
            y: SNAP(clamp(y.invert(event.y), VIEW)),
          });
        }));

    scene.vHandle = handle('active-point', 'Vector v', 'v');
    scene.wHandle = handle('active-point is-secondary', 'Vector w', 'w');

    scene.vHead = svg.append('path').attr('class', 'vector-head is-curve');
    scene.wHead = svg.append('path').attr('class', 'vector-head is-secant');

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { v, w });
  }, [v, w]);

  return (
    <>
      <div className="graph" ref={containerRef} />
      <PlotLegend
        items={[
          { tone: 'curve', label: 'v' },
          { tone: 'secant', label: 'w' },
        ]}
      />
    </>
  );
}
