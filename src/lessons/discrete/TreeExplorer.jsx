import { useEffect, useRef, useState } from 'react';
import { select } from 'd3-selection';
import PlotLegend from '../../components/PlotLegend.jsx';

/** Every path from the root to a leaf is one outcome, so the leaves are the count. */
function buildNodes(stages) {
  const levels = [[{ id: 'root', x: 0.5, parent: null }]];

  stages.forEach((count, depth) => {
    const parents = levels[depth];
    const row = [];
    parents.forEach((parent, parentIndex) => {
      const span = 1 / parents.length;
      for (let i = 0; i < count; i += 1) {
        row.push({
          id: `${parent.id}-${i}`,
          parent,
          branch: i,
          x: parentIndex * span + (span * (i + 0.5)) / count,
        });
      }
    });
    levels.push(row);
  });

  return levels;
}

function renderActive(scene, { stages }) {
  const { x, y, levels: depth } = scene;
  const levels = buildNodes(stages);
  const leaves = levels[levels.length - 1];

  const edges = [];
  const nodes = [];
  levels.forEach((row, level) => {
    row.forEach((node) => {
      nodes.push({ ...node, level });
      if (node.parent) edges.push({ from: node.parent, to: node, level });
    });
  });

  scene.edgeGroup
    .selectAll('line')
    .data(edges, (d) => d.to.id)
    .join('line')
    .attr('class', (d) => `tree-edge is-stage-${(d.level - 1) % 3}`)
    .attr('x1', (d) => x(d.from.x))
    .attr('y1', (d) => y(d.level - 1, depth))
    .attr('x2', (d) => x(d.to.x))
    .attr('y2', (d) => y(d.level, depth));

  scene.nodeGroup
    .selectAll('circle')
    .data(nodes, (d) => d.id)
    .join('circle')
    .attr('class', (d) => (d.level === levels.length - 1 ? 'tree-node is-leaf' : 'tree-node'))
    .attr('r', (d) => (d.level === levels.length - 1 ? Math.max(2.5, 7 - leaves.length / 14) : 5))
    .attr('cx', (d) => x(d.x))
    .attr('cy', (d) => y(d.level, depth));

  scene.total.text(`${leaves.length} outcomes`);
}

export default function TreeExplorer({ stages }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { stages };
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
    const height = width < 540 ? 260 : 300;
    const margin = { top: 34, right: 24, bottom: 34, left: 24 };

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
      .attr('aria-label', 'A branching tree where each path from the root to a leaf is one outcome');

    const x = (t) => margin.left + t * (width - margin.left - margin.right);
    const y = (level, depth) => margin.top + (level / depth) * (height - margin.top - margin.bottom);

    const scene = { x, y, levels: latest.current.stages.length };
    scene.edgeGroup = svg.append('g');
    scene.nodeGroup = svg.append('g');
    scene.total = svg.append('text').attr('class', 'stat-label is-mean').attr('x', margin.left).attr('y', 20);

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.levels = stages.length;
      renderActive(sceneRef.current, { stages });
    }
  }, [stages]);

  return (
    <>
      <div className="graph is-short" ref={containerRef} />
      <PlotLegend
        items={[
          { tone: 'secant', label: 'a choice at each stage' },
          { tone: 'curve', label: 'one complete outcome' },
        ]}
      />
    </>
  );
}
