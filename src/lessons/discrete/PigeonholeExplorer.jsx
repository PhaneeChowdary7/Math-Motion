import { useEffect, useRef, useState } from 'react';
import { select } from 'd3-selection';
import PlotLegend from '../../components/PlotLegend.jsx';
import { pigeonholeMinimum, spreadEvenly } from '../../lib/discrete.js';

function renderActive(scene, { items, boxes }) {
  const counts = spreadEvenly(items, boxes);
  const forced = pigeonholeMinimum(items, boxes);
  const { width, boxWidth, gap, top, boxHeight } = scene;

  scene.boxGroup
    .selectAll('rect')
    .data(counts)
    .join('rect')
    .attr('class', (count) => `hole-box ${count >= forced && forced > 1 ? 'is-forced' : ''}`)
    .attr('x', (d, i) => scene.left + i * (boxWidth + gap))
    .attr('y', top)
    .attr('width', boxWidth)
    .attr('height', boxHeight)
    .attr('rx', 8);

  const dots = [];
  counts.forEach((count, box) => {
    for (let i = 0; i < count; i += 1) dots.push({ box, i, count });
  });

  const perRow = Math.max(1, Math.floor((boxWidth - 8) / 14));
  scene.dotGroup
    .selectAll('circle')
    .data(dots, (d) => `${d.box}-${d.i}`)
    .join('circle')
    .attr('class', (d) => `hole-dot ${d.count >= forced && forced > 1 ? 'is-forced' : ''}`)
    .attr('r', 4.5)
    .attr('cx', (d) => scene.left + d.box * (boxWidth + gap) + 8 + (d.i % perRow) * 14)
    .attr('cy', (d) => top + boxHeight - 12 - Math.floor(d.i / perRow) * 14);

  scene.labels
    .selectAll('text')
    .data(counts)
    .join('text')
    .attr('class', 'point-label')
    .attr('text-anchor', 'middle')
    .attr('x', (d, i) => scene.left + i * (boxWidth + gap) + boxWidth / 2)
    .attr('y', top + boxHeight + 18)
    .text((count) => count);

  scene.verdict
    .attr('x', scene.left)
    .attr('y', top - 14)
    .text(
      forced > 1
        ? `however they are spread, some box holds at least ${forced}`
        : 'with this many boxes, one item each is possible'
    );
  void width;
}

export default function PigeonholeExplorer({ items, boxes }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { items, boxes };
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
    const height = 220;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
      .attr('aria-label', 'Items spread as evenly as possible across a row of boxes');

    const scene = { width, left: 22, gap: 10, top: 56, boxHeight: 110 };
    scene.boxWidth = (width - 44 - scene.gap * (latest.current.boxes - 1)) / latest.current.boxes;

    scene.boxGroup = svg.append('g');
    scene.dotGroup = svg.append('g');
    scene.labels = svg.append('g');
    scene.verdict = svg.append('text').attr('class', 'stat-label is-mean');

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width, boxes]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.boxWidth = (width - 44 - sceneRef.current.gap * (boxes - 1)) / boxes;
      renderActive(sceneRef.current, { items, boxes });
    }
  }, [items, boxes, width]);

  return (
    <>
      <div className="graph is-short" ref={containerRef} />
      <PlotLegend
        items={[
          { tone: 'secant', label: 'a box' },
          { tone: 'tangent', label: 'a box forced above one item' },
        ]}
      />
    </>
  );
}
