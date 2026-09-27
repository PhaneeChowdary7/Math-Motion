import { useEffect, useRef, useState } from 'react';
import { select } from 'd3-selection';
import PlotLegend from '../../components/PlotLegend.jsx';
import { truthTable } from '../../lib/discrete.js';

const HEADERS = ['A', 'B', 'result'];

function renderActive(scene, { connective }) {
  const rows = truthTable(connective);
  const { colWidth, rowHeight, top, left } = scene;

  scene.cellGroup
    .selectAll('g')
    .data(rows.flatMap((row, r) => [
      { r, c: 0, value: row.a, kind: 'input' },
      { r, c: 1, value: row.b, kind: 'input' },
      { r, c: 2, value: row.result, kind: 'result' },
    ]), (d) => `${d.r}-${d.c}`)
    .join((enter) => {
      const g = enter.append('g');
      g.append('rect');
      g.append('text').attr('text-anchor', 'middle').attr('dominant-baseline', 'central');
      return g;
    })
    .each(function eachCell(d) {
      const cell = select(this);
      cell.attr('class', `truth-cell is-${d.kind} ${d.value ? 'is-true' : 'is-false'}`);
      cell.select('rect')
        .attr('x', left + d.c * colWidth + 3)
        .attr('y', top + d.r * rowHeight + 3)
        .attr('width', colWidth - 6)
        .attr('height', rowHeight - 6)
        .attr('rx', 6);
      cell.select('text')
        .attr('x', left + d.c * colWidth + colWidth / 2)
        .attr('y', top + d.r * rowHeight + rowHeight / 2)
        .text(d.value ? 'true' : 'false');
    });

  scene.headers
    .selectAll('text')
    .data(HEADERS)
    .join('text')
    .attr('class', 'truth-header')
    .attr('text-anchor', 'middle')
    .attr('x', (d, i) => left + i * colWidth + colWidth / 2)
    .attr('y', top - 12)
    .text((d, i) => (i === 2 ? connective.label : d));
}

export default function TruthTableExplorer({ connective }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { connective };
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
    const rowHeight = 48;
    const height = 4 * rowHeight + 60;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
      .attr('aria-label', 'A truth table for two variables');

    const usable = Math.min(width - 40, 520);
    const scene = {
      rowHeight,
      colWidth: usable / 3,
      top: 44,
      left: (width - usable) / 2,
    };

    scene.headers = svg.append('g');
    scene.cellGroup = svg.append('g');

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { connective });
  }, [connective]);

  return (
    <>
      <div className="graph is-short" ref={containerRef} />
      <PlotLegend
        items={[
          { tone: 'curve', label: 'true' },
          { tone: 'area', label: 'false' },
        ]}
      />
    </>
  );
}
