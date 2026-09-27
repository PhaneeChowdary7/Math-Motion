import { useEffect, useRef, useState } from 'react';
import { select } from 'd3-selection';
import PlotLegend from '../../components/PlotLegend.jsx';
import { combinations } from '../../lib/discrete.js';

const ROWS = 9;

function renderActive(scene, { n, k, onSelect }) {
  const cells = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col <= row; col += 1) {
      cells.push({ row, col, value: combinations(row, col) });
    }
  }

  scene.cellGroup
    .selectAll('g')
    .data(cells, (d) => `${d.row}-${d.col}`)
    .join((enter) => {
      const g = enter.append('g').attr('class', 'pascal-cell');
      g.append('rect');
      g.append('text').attr('text-anchor', 'middle').attr('dominant-baseline', 'central');
      return g;
    })
    .attr('transform', (d) => `translate(${scene.x(d.row, d.col)},${scene.y(d.row)})`)
    .attr('class', (d) => {
      const parent = d.row === n - 1 && (d.col === k - 1 || d.col === k);
      if (d.row === n && d.col === k) return 'pascal-cell is-selected';
      if (parent) return 'pascal-cell is-parent';
      return 'pascal-cell';
    })
    .each(function eachCell(d) {
      const cell = select(this);
      cell.select('rect')
        .attr('x', -scene.size / 2).attr('y', -scene.size / 2)
        .attr('width', scene.size).attr('height', scene.size)
        .attr('rx', 5)
        .attr('tabindex', 0)
        .attr('role', 'button')
        .attr('aria-label', `${d.row} choose ${d.col} equals ${d.value}`)
        .on('click', () => onSelect(d.row, d.col))
        .on('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          onSelect(d.row, d.col);
        });
      cell.select('text').text(d.value).attr('font-size', scene.size > 34 ? 12.5 : 10.5);
    });
}

export default function PascalExplorer({ n, k, onSelect }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { n, k, onSelect };
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
    const size = Math.min(42, (width - 60) / (ROWS + 1));
    const gap = size * 1.16;
    const height = ROWS * gap + 46;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', "Pascal's triangle, where each entry is the number of ways to choose that many items");

    const scene = {
      size,
      x: (row, col) => width / 2 + (col - row / 2) * gap,
      y: (row) => 26 + row * gap,
    };

    scene.cellGroup = svg.append('g');

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { n, k, onSelect });
  }, [n, k, onSelect]);

  return (
    <>
      <div className="graph is-short" ref={containerRef} />
      <PlotLegend
        items={[
          { tone: 'curve', label: 'the entry you picked' },
          { tone: 'tangent', label: 'the two above that add to it' },
        ]}
      />
    </>
  );
}
