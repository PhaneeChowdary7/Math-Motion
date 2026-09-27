import { useEffect, useRef, useState } from 'react';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import PlotLegend from '../../components/PlotLegend.jsx';
import { drawArrow } from './arrow.js';
import { VIEW, clamp, combine, cross } from '../../lib/linearAlgebra.js';

const SNAP = (value) => Number(value.toFixed(1));

function renderActive(scene, { v, w, a, b, showCombo }) {
  const { x, y } = scene;
  const det = cross(v, w);
  const dependent = Math.abs(det) < 0.05;

  drawArrow(scene, scene.vLine, scene.vHead, v);
  drawArrow(scene, scene.wLine, scene.wHead, w);

  scene.vLabel.attr('x', x(v.x) + 10).attr('y', y(v.y) - 8).text('v');
  scene.wLabel.attr('x', x(w.x) + 10).attr('y', y(w.y) - 8).text('w');

  scene.spanLine.attr('display', dependent ? null : 'none');
  scene.spanRegion.attr('display', dependent ? 'none' : null);

  if (dependent) {
    const basis = Math.hypot(v.x, v.y) > 0.05 ? v : w;
    const len = Math.hypot(basis.x, basis.y) || 1;
    const k = (VIEW[1] * 2) / len;
    scene.spanLine
      .attr('x1', x(-basis.x * k))
      .attr('y1', y(-basis.y * k))
      .attr('x2', x(basis.x * k))
      .attr('y2', y(basis.y * k));
  }

  const result = combine(v, w, a, b);

  scene.comboGroup.attr('display', showCombo ? null : 'none');
  if (showCombo) {
    drawArrow(scene, scene.comboLine, scene.comboHead, result);

    const av = { x: v.x * a, y: v.y * a };
    scene.legA.attr('x1', x(0)).attr('y1', y(0)).attr('x2', x(av.x)).attr('y2', y(av.y));
    scene.legB.attr('x1', x(av.x)).attr('y1', y(av.y)).attr('x2', x(result.x)).attr('y2', y(result.y));

    scene.comboLabel
      .attr('x', x(result.x) + 10)
      .attr('y', y(result.y) + 18)
      .text(`(${result.x.toFixed(1)}, ${result.y.toFixed(1)})`);
  }

  scene.vHandle.attr('cx', x(v.x)).attr('cy', y(v.y))
    .attr('aria-valuetext', `v equals ${v.x.toFixed(1)}, ${v.y.toFixed(1)}`);
  scene.wHandle.attr('cx', x(w.x)).attr('cy', y(w.y))
    .attr('aria-valuetext', `w equals ${w.x.toFixed(1)}, ${w.y.toFixed(1)}`);
}

export default function VectorExplorer({ v, w, a, b, showCombo, onChange }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { v, w, a, b, showCombo, onChange };
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

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'Two vectors from the origin and the combinations they reach');

    const x = scaleLinear().domain(VIEW).range([margin.left, width - margin.right]);
    const y = scaleLinear().domain(VIEW).range([height - margin.bottom, margin.top]);
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const scene = { x, y };

    scene.spanRegion = svg
      .append('rect')
      .attr('class', 'span-region')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', plotWidth)
      .attr('height', plotHeight);

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

    scene.spanLine = svg.append('line').attr('class', 'span-line');

    scene.comboGroup = svg.append('g');
    scene.legA = scene.comboGroup.append('line').attr('class', 'leg-line is-cos');
    scene.legB = scene.comboGroup.append('line').attr('class', 'leg-line is-sin');
    scene.comboLine = scene.comboGroup.append('line').attr('class', 'tangent-line is-flat');
    scene.comboHead = scene.comboGroup.append('path').attr('class', 'vector-head is-tangent');
    scene.comboLabel = scene.comboGroup.append('text').attr('class', 'point-label');

    scene.vLine = svg.append('line').attr('class', 'curve approach right');
    scene.wLine = svg.append('line').attr('class', 'secant-line');

    scene.vLabel = svg.append('text').attr('class', 'point-label strong');
    scene.wLabel = svg.append('text').attr('class', 'point-label strong');

    const handle = (cls, label, key) =>
      svg
        .append('circle')
        .attr('class', cls)
        .attr('r', 7)
        .attr('tabindex', 0)
        .attr('role', 'slider')
        .attr('aria-label', label)
        .on('keydown', (event) => {
          const step = event.shiftKey ? 1 : 0.1;
          const current = latest.current[key];
          const moves = {
            ArrowLeft: { x: -step, y: 0 },
            ArrowRight: { x: step, y: 0 },
            ArrowUp: { x: 0, y: step },
            ArrowDown: { x: 0, y: -step },
          };
          const move = moves[event.key];
          if (!move) return;
          event.preventDefault();
          latest.current.onChange(key, {
            x: SNAP(clamp(current.x + move.x, VIEW)),
            y: SNAP(clamp(current.y + move.y, VIEW)),
          });
        })
        .call(
          drag().on('drag', (event) => {
            latest.current.onChange(key, {
              x: SNAP(clamp(x.invert(event.x), VIEW)),
              y: SNAP(clamp(y.invert(event.y), VIEW)),
            });
          })
        );

    scene.vHandle = handle('active-point is-tip', 'Vector v', 'v');
    scene.wHandle = handle('active-point is-secondary is-tip', 'Vector w', 'w');

    // Heads go last so they sit above the drag handles; they ignore the
    // pointer so the handle underneath still takes the drag.
    scene.vHead = svg.append('path').attr('class', 'vector-head is-curve');
    scene.wHead = svg.append('path').attr('class', 'vector-head is-secant');

    svg.append('text').attr('class', 'axis-label')
      .attr('x', width - margin.right).attr('y', y(0) + 26).attr('text-anchor', 'end').text('x');
    svg.append('text').attr('class', 'axis-label')
      .attr('x', x(0) + 12).attr('y', margin.top + 12).text('y');

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { v, w, a, b, showCombo });
  }, [v, w, a, b, showCombo]);

  return (
    <>
      <div className="graph" ref={containerRef} />
      <PlotLegend
        items={[
          { tone: 'curve', label: 'v' },
          { tone: 'secant', label: 'w' },
          { tone: 'tangent', label: 'av + bw', dashed: true },
        ]}
      />
    </>
  );
}
