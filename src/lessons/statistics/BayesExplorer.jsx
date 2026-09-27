import { useEffect, useRef, useState } from 'react';
import { select } from 'd3-selection';
import PlotLegend from '../../components/PlotLegend.jsx';
import { posterior } from '../../lib/statistics.js';

const COLUMNS = 50;
const ROWS = 20;
export const POPULATION = COLUMNS * ROWS;

/**
 * The classic natural-frequency picture: one square per person, allocated to the
 * four outcomes in the order disease-positive, disease-negative, healthy-positive,
 * healthy-negative, so each group stays contiguous and countable.
 */
function categories({ prevalence, sensitivity, specificity }) {
  const cells = posterior({ prevalence, sensitivity, specificity });

  const counts = [
    { key: 'truePositive', n: Math.round(cells.truePositive * POPULATION) },
    { key: 'falseNegative', n: Math.round(cells.falseNegative * POPULATION) },
    { key: 'falsePositive', n: Math.round(cells.falsePositive * POPULATION) },
    { key: 'trueNegative', n: Math.round(cells.trueNegative * POPULATION) },
  ];

  // Rounding can leave the total a person or two short; absorb it in the largest group.
  const drift = POPULATION - counts.reduce((total, item) => total + item.n, 0);
  if (drift !== 0) {
    const largest = counts.reduce((best, item) => (item.n > best.n ? item : best), counts[0]);
    largest.n += drift;
  }

  const assignment = [];
  for (const { key, n } of counts) for (let i = 0; i < n; i += 1) assignment.push(key);

  return { assignment, counts: Object.fromEntries(counts.map((c) => [c.key, c.n])) };
}

function renderActive(scene, props) {
  const { assignment } = categories(props);

  scene.cells
    .data(assignment)
    .attr('class', (key) => `bayes-cell is-${key}`);
}

export default function BayesExplorer({ prevalence, sensitivity, specificity }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { prevalence, sensitivity, specificity };
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
    const margin = 18;
    const cell = (width - margin * 2) / COLUMNS;
    const height = ROWS * cell + margin * 2;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
      .attr('aria-label', `A population of ${POPULATION} people, one square each, grouped by whether they have the condition and how they tested`);

    const scene = {};
    scene.cells = svg
      .append('g')
      .selectAll('rect')
      .data(new Array(POPULATION).fill('trueNegative'))
      .join('rect')
      .attr('class', 'bayes-cell is-trueNegative')
      .attr('x', (d, i) => margin + (i % COLUMNS) * cell + 0.6)
      .attr('y', (d, i) => margin + Math.floor(i / COLUMNS) * cell + 0.6)
      .attr('width', Math.max(1, cell - 1.2))
      .attr('height', Math.max(1, cell - 1.2))
      .attr('rx', Math.min(2, cell / 4));

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { prevalence, sensitivity, specificity });
  }, [prevalence, sensitivity, specificity]);

  return (
    <>
      <div className="graph is-short" ref={containerRef} />
      <PlotLegend
        items={[
          { tone: 'curve', label: 'has it, tests positive' },
          { tone: 'tangent', label: 'healthy, tests positive' },
          { tone: 'secant', label: 'has it, missed by the test' },
        ]}
      />
    </>
  );
}
