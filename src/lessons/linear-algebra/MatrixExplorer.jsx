import { useEffect, useRef, useState } from 'react';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import PlotLegend from '../../components/PlotLegend.jsx';
import { drawArrow } from './arrow.js';
import { VIEW, apply, clamp, determinant, matrixFrom } from '../../lib/linearAlgebra.js';

const SNAP = (value) => Number(value.toFixed(1));
const UNIT = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
const GRID = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

const polygon = (scale, points) =>
  points.map((p) => `${scale.x(p.x)},${scale.y(p.y)}`).join(' ');

function renderActive(scene, { i, j, showGrid }) {
  const { x, y } = scene;
  const m = matrixFrom(i, j);
  const det = determinant(m);

  scene.ghost.attr('points', polygon(scene, UNIT));
  scene.shape.attr('points', polygon(scene, UNIT.map((p) => apply(m, p))));

  scene.gridGroup.attr('display', showGrid ? null : 'none');
  if (showGrid) {
    scene.gridLines.attr('d', () => {
      const parts = [];
      for (const k of GRID) {
        const a = apply(m, { x: k, y: GRID[0] });
        const b = apply(m, { x: k, y: GRID[GRID.length - 1] });
        parts.push(`M ${x(a.x)} ${y(a.y)} L ${x(b.x)} ${y(b.y)}`);
        const c = apply(m, { x: GRID[0], y: k });
        const d = apply(m, { x: GRID[GRID.length - 1], y: k });
        parts.push(`M ${x(c.x)} ${y(c.y)} L ${x(d.x)} ${y(d.y)}`);
      }
      return parts.join(' ');
    });
  }

  drawArrow(scene, scene.iLine, scene.iHead, i);
  drawArrow(scene, scene.jLine, scene.jHead, j);

  scene.iLabel.attr('x', x(i.x) + 10).attr('y', y(i.y) - 8).text('î');
  scene.jLabel.attr('x', x(j.x) + 10).attr('y', y(j.y) - 8).text('ĵ');

  scene.iHandle.attr('cx', x(i.x)).attr('cy', y(i.y))
    .attr('aria-valuetext', `i hat lands at ${i.x.toFixed(1)}, ${i.y.toFixed(1)}`);
  scene.jHandle.attr('cx', x(j.x)).attr('cy', y(j.y))
    .attr('aria-valuetext', `j hat lands at ${j.x.toFixed(1)}, ${j.y.toFixed(1)}`);

  scene.shape.attr('class', Math.abs(det) < 0.05 ? 'area-between is-flat' : 'area-between');
}

export default function MatrixExplorer({ i, j, showGrid, onChange }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { i, j, showGrid, onChange };
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
    const clipId = `matrix-clip-${Math.random().toString(36).slice(2, 9)}`;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'The unit square transformed by a two by two matrix');

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

    scene.gridGroup = clipped.append('g');
    scene.gridLines = scene.gridGroup.append('path').attr('class', 'mapped-grid');

    scene.ghost = clipped.append('polygon').attr('class', 'unit-ghost');
    scene.shape = clipped.append('polygon').attr('class', 'area-between');

    svg.append('g').attr('class', 'axis')
      .attr('transform', `translate(0,${y(0)})`)
      .call(axisBottom(x).ticks(6).tickSizeOuter(0).tickPadding(8));
    svg.append('g').attr('class', 'axis')
      .attr('transform', `translate(${x(0)},0)`)
      .call(axisLeft(y).ticks(6).tickSizeOuter(0).tickPadding(8));

    scene.iLine = clipped.append('line').attr('class', 'curve approach right');
    scene.jLine = clipped.append('line').attr('class', 'secant-line');
    scene.iLabel = svg.append('text').attr('class', 'point-label strong');
    scene.jLabel = svg.append('text').attr('class', 'point-label strong');

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

    scene.iHandle = handle('active-point', 'Where i hat lands', 'i');
    scene.jHandle = handle('active-point is-secondary', 'Where j hat lands', 'j');

    scene.iHead = svg.append('path').attr('class', 'vector-head is-curve');
    scene.jHead = svg.append('path').attr('class', 'vector-head is-secant');

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { i, j, showGrid });
  }, [i, j, showGrid]);

  return (
    <>
      <div className="graph" ref={containerRef} />
      <PlotLegend
        items={[
          { tone: 'curve', label: 'î lands here' },
          { tone: 'secant', label: 'ĵ lands here' },
        ]}
      />
    </>
  );
}
