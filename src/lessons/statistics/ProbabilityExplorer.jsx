import { useEffect, useRef, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import PlotLegend from '../../components/PlotLegend.jsx';

/**
 * Probability drawn as area in a unit square: A is a vertical strip, B a
 * horizontal one, and their overlap is the intersection. When the strips are
 * drawn independently the overlap is exactly the product of the two widths.
 */
function renderActive(scene, { pA, pB, overlap }) {
  const { x, y } = scene;
  const independent = pA * pB;
  const joint = overlap;

  scene.stripA.attr('x', x(0)).attr('width', x(pA) - x(0));
  scene.stripB.attr('y', y(pB)).attr('height', y(0) - y(pB));

  // Place the intersection so its area is the requested joint probability.
  const jointWidth = pA > 0 ? joint / pA : 0;
  scene.intersection
    .attr('x', x(0))
    .attr('width', x(pA) - x(0))
    .attr('y', y(Math.min(1, jointWidth)))
    .attr('height', y(0) - y(Math.min(1, jointWidth)));

  scene.independentLine
    .attr('x1', x(0))
    .attr('x2', x(1))
    .attr('y1', y(pB))
    .attr('y2', y(pB));

  scene.labelA.attr('x', x(pA / 2)).attr('y', y(1) - 10).text(`P(A) = ${pA.toFixed(2)}`);
  scene.labelB.attr('x', x(1) + 8).attr('y', y(pB / 2)).text(`P(B) = ${pB.toFixed(2)}`);
  scene.labelJoint
    .attr('x', x(pA / 2))
    .attr('y', y(Math.min(1, jointWidth) / 2))
    .attr('display', joint > 0.02 && pA > 0.08 ? null : 'none')
    .text(joint.toFixed(2));

  scene.verdict
    .attr('x', x(0))
    .attr('y', y(0) + 34)
    .text(
      Math.abs(joint - independent) < 0.005
        ? `independent: P(A)P(B) = ${independent.toFixed(2)}`
        : `dependent: P(A)P(B) would be ${independent.toFixed(2)}`
    );
}

export default function ProbabilityExplorer({ pA, pB, overlap }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { pA, pB, overlap };
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
    const height = width < 540 ? 300 : 340;
    const margin = { top: 34, right: 116, bottom: 54, left: 30 };

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'Two events drawn as areas inside a unit square');

    const side = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom);
    const x = scaleLinear().domain([0, 1]).range([margin.left, margin.left + side]);
    const y = scaleLinear().domain([0, 1]).range([margin.top + side, margin.top]);

    const scene = { x, y };

    svg.append('rect')
      .attr('class', 'sample-space')
      .attr('x', x(0)).attr('y', y(1))
      .attr('width', side).attr('height', side);

    scene.stripA = svg.append('rect').attr('class', 'event-strip is-a').attr('y', y(1)).attr('height', side);
    scene.stripB = svg.append('rect').attr('class', 'event-strip is-b').attr('x', x(0)).attr('width', side);
    scene.intersection = svg.append('rect').attr('class', 'event-intersection');
    scene.independentLine = svg.append('line').attr('class', 'independent-line');

    scene.labelA = svg.append('text').attr('class', 'stat-label is-mean').attr('text-anchor', 'middle');
    scene.labelB = svg.append('text').attr('class', 'stat-label is-median');
    scene.labelJoint = svg.append('text').attr('class', 'stat-label is-joint').attr('text-anchor', 'middle');
    scene.verdict = svg.append('text').attr('class', 'point-label');

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { pA, pB, overlap });
  }, [pA, pB, overlap]);

  return (
    <>
      <div className="graph is-short" ref={containerRef} />
      <PlotLegend
        items={[
          { tone: 'curve', label: 'event A' },
          { tone: 'secant', label: 'event B' },
          { tone: 'tangent', label: 'both (A and B)' },
        ]}
      />
    </>
  );
}
