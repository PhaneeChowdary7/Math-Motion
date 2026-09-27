import { useEffect, useRef, useState } from 'react';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import PlotLegend from '../../components/PlotLegend.jsx';
import { drawArrow } from './arrow.js';
import { VIEW, alignment, apply, clamp, eigenpairs } from '../../lib/linearAlgebra.js';

const SNAP = (value) => Number(value.toFixed(1));
const ALIGNED = 0.03;

function renderActive(scene, { matrix, v }) {
  const { x, y } = scene;
  const image = apply(matrix, v);
  const pairs = eigenpairs(matrix);
  const off = alignment(matrix, v);
  const onEigen = off !== null && off < ALIGNED;

  scene.eigenLines.forEach((line, index) => {
    const pair = pairs[index];
    if (!pair) {
      line.attr('display', 'none');
      return;
    }
    const reach = VIEW[1] * 2;
    line
      .attr('display', null)
      .attr('x1', x(-pair.vector.x * reach))
      .attr('y1', y(-pair.vector.y * reach))
      .attr('x2', x(pair.vector.x * reach))
      .attr('y2', y(pair.vector.y * reach));
  });

  drawArrow(scene, scene.vLine, scene.vHead, v);
  drawArrow(scene, scene.imageLine, scene.imageHead, image);

  scene.vLine.attr('class', `curve approach right ${onEigen ? 'is-aligned' : ''}`);
  scene.vLabel.attr('x', x(v.x) + 10).attr('y', y(v.y) - 8).text('v');
  scene.imageLabel
    .attr('x', x(image.x) + 10)
    .attr('y', y(image.y) + 16)
    .text(`Av (${image.x.toFixed(1)}, ${image.y.toFixed(1)})`);

  scene.handle
    .attr('cx', x(v.x))
    .attr('cy', y(v.y))
    .attr('aria-valuetext', `v equals ${v.x.toFixed(1)}, ${v.y.toFixed(1)}`);
}

export default function EigenExplorer({ matrix, v, onChange }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { matrix, v, onChange };
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
    const clipId = `eigen-clip-${Math.random().toString(36).slice(2, 9)}`;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'A vector, its image under the matrix, and the eigenvector directions');

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

    scene.eigenLines = [
      clipped.append('line').attr('class', 'eigen-line'),
      clipped.append('line').attr('class', 'eigen-line is-second'),
    ];

    svg.append('g').attr('class', 'axis')
      .attr('transform', `translate(0,${y(0)})`)
      .call(axisBottom(x).ticks(6).tickSizeOuter(0).tickPadding(8));
    svg.append('g').attr('class', 'axis')
      .attr('transform', `translate(${x(0)},0)`)
      .call(axisLeft(y).ticks(6).tickSizeOuter(0).tickPadding(8));

    scene.imageLine = clipped.append('line').attr('class', 'tangent-line is-flat');
    scene.vLine = clipped.append('line').attr('class', 'curve approach right');
    scene.vLabel = svg.append('text').attr('class', 'point-label strong');
    scene.imageLabel = svg.append('text').attr('class', 'point-label');

    scene.handle = svg
      .append('circle')
      .attr('class', 'active-point')
      .attr('r', 7)
      .attr('tabindex', 0)
      .attr('role', 'slider')
      .attr('aria-label', 'Test vector v')
      .on('keydown', (event) => {
        const step = event.shiftKey ? 1 : 0.1;
        const current = latest.current.v;
        const moves = {
          ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 },
          ArrowUp: { x: 0, y: step }, ArrowDown: { x: 0, y: -step },
        };
        const move = moves[event.key];
        if (!move) return;
        event.preventDefault();
        latest.current.onChange({
          x: SNAP(clamp(current.x + move.x, VIEW)),
          y: SNAP(clamp(current.y + move.y, VIEW)),
        });
      })
      .call(drag().on('drag', (event) => {
        latest.current.onChange({
          x: SNAP(clamp(x.invert(event.x), VIEW)),
          y: SNAP(clamp(y.invert(event.y), VIEW)),
        });
      }));

    scene.vHead = svg.append('path').attr('class', 'vector-head is-curve');
    scene.imageHead = svg.append('path').attr('class', 'vector-head is-tangent');

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { matrix, v });
  }, [matrix, v]);

  return (
    <>
      <div className="graph" ref={containerRef} />
      <PlotLegend
        items={[
          { tone: 'curve', label: 'v' },
          { tone: 'tangent', label: 'Av', dashed: true },
          { tone: 'secant', label: 'eigenvector directions', dashed: true },
        ]}
      />
    </>
  );
}
