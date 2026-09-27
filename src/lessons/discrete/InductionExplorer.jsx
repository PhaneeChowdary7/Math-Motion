import { useEffect, useRef, useState } from 'react';
import { select } from 'd3-selection';
import PlotLegend from '../../components/PlotLegend.jsx';
import { triangularNumber } from '../../lib/discrete.js';

/**
 * The staircase 1 + 2 + ... + n, and the copy that completes it into an
 * n by (n+1) rectangle. The picture is the proof the induction step formalises.
 */
function renderActive(scene, { n, showMirror }) {
  const cols = n;
  const rows = n + 1;
  const cell = Math.min(scene.maxCell, (scene.usable - 4) / cols, 150 / rows);
  const originX = scene.centreX - (cols * cell) / 2;
  const originY = scene.baseY;

  const blocks = [];
  for (let col = 0; col < cols; col += 1) {
    for (let row = 0; row < col + 1; row += 1) blocks.push({ col, row, kind: 'own' });
    if (showMirror) {
      for (let row = col + 1; row < rows; row += 1) blocks.push({ col, row, kind: 'mirror' });
    }
  }

  scene.blockGroup
    .selectAll('rect')
    .data(blocks, (d) => `${d.col}-${d.row}-${d.kind}`)
    .join('rect')
    .attr('class', (d) => `stair-block is-${d.kind}`)
    .attr('x', (d) => originX + d.col * cell + 0.7)
    .attr('y', (d) => originY - (d.row + 1) * cell + 0.7)
    .attr('width', cell - 1.4)
    .attr('height', cell - 1.4)
    .attr('rx', Math.min(3, cell / 5));

  scene.caption
    .attr('x', scene.centreX)
    .attr('y', originY + 26)
    .text(
      showMirror
        ? `2 × (1 + ... + ${n}) = ${n} × ${n + 1} = ${n * (n + 1)}`
        : `1 + 2 + ... + ${n} = ${triangularNumber(n)}`
    );
}

export default function InductionExplorer({ n, showMirror }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { n, showMirror };
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
    const height = 230;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
      .attr('aria-label', 'A staircase of blocks and the copy that completes it into a rectangle');

    const scene = {
      centreX: width / 2,
      baseY: height - 44,
      usable: Math.min(width - 40, 460),
      maxCell: 24,
    };

    scene.blockGroup = svg.append('g');
    scene.caption = svg.append('text').attr('class', 'stat-label is-mean').attr('text-anchor', 'middle');

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { n, showMirror });
  }, [n, showMirror]);

  return (
    <>
      <div className="graph is-short" ref={containerRef} />
      <PlotLegend
        items={[
          { tone: 'curve', label: 'the sum 1 + 2 + ... + n' },
          { tone: 'tangent', label: 'the matching copy' },
        ]}
      />
    </>
  );
}
