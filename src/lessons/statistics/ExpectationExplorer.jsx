import { useEffect, useRef, useState } from 'react';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleBand, scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import PlotLegend from '../../components/PlotLegend.jsx';
import { discreteVariance, expectation, sum } from '../../lib/statistics.js';

function renderActive(scene, { outcomes, weights }) {
  const { x, y, baseline } = scene;
  const total = sum(weights) || 1;
  const probabilities = weights.map((weight) => weight / total);
  const centre = expectation(outcomes, weights);
  const sd = Math.sqrt(discreteVariance(outcomes, weights));

  scene.bars
    .data(probabilities)
    .attr('x', (d, i) => x(outcomes[i]))
    .attr('width', x.bandwidth())
    .attr('y', (p) => y(p))
    .attr('height', (p) => Math.max(0, baseline - y(p)));

  scene.handles
    .data(probabilities)
    .attr('x', (d, i) => x(outcomes[i]))
    .attr('width', x.bandwidth())
    .attr('y', (p) => y(p) - 5)
    .attr('aria-valuenow', (p) => Number((p * 100).toFixed(1)));

  scene.labels
    .data(probabilities)
    .attr('x', (d, i) => x(outcomes[i]) + x.bandwidth() / 2)
    .attr('y', (p) => y(p) - 12)
    .text((p) => (p > 0.02 ? p.toFixed(2) : ''));

  const px = scene.axisX(centre);
  scene.meanLine.attr('x1', px).attr('x2', px);
  scene.meanLabel.attr('x', px).text(`E[X] = ${centre.toFixed(2)}`);

  scene.sdBand
    .attr('x', scene.axisX(centre - sd))
    .attr('width', Math.max(0, scene.axisX(centre + sd) - scene.axisX(centre - sd)));
}

export default function ExpectationExplorer({ outcomes, weights, onChange }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { outcomes, weights, onChange };
    if (sceneRef.current) sceneRef.current.onChange = onChange;
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
    const height = width < 540 ? 280 : 320;
    const margin = { top: 30, right: 26, bottom: 56, left: 46 };
    const { outcomes: values } = latest.current;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'Probability of each outcome, with the expected value marked');

    const x = scaleBand().domain(values).range([margin.left, width - margin.right]).padding(0.22);
    const y = scaleLinear().domain([0, 0.6]).range([height - margin.bottom, margin.top]);
    const axisX = scaleLinear()
      .domain([values[0] - 0.5, values[values.length - 1] + 0.5])
      .range([margin.left, width - margin.right]);
    const baseline = height - margin.bottom;

    const scene = { x, y, axisX, baseline, onChange: latest.current.onChange };

    scene.sdBand = svg.append('rect').attr('class', 'spread-band').attr('y', margin.top).attr('height', baseline - margin.top);

    svg.append('g').attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(y).ticks(4).tickSize(-(width - margin.left - margin.right)).tickFormat(''));

    scene.bars = svg.append('g').selectAll('rect').data(values).join('rect').attr('class', 'prob-bar');

    scene.handles = svg
      .append('g')
      .selectAll('rect')
      .data(values)
      .join('rect')
      .attr('class', 'prob-handle')
      .attr('height', 10)
      .attr('tabindex', 0)
      .attr('role', 'slider')
      .attr('aria-label', (d, i) => `Probability of outcome ${values[i]}`)
      .on('keydown', function onKeyDown(event) {
        const step = event.shiftKey ? 5 : 1;
        const delta = event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0;
        if (!delta) return;
        event.preventDefault();
        const index = scene.handles.nodes().indexOf(this);
        scene.onChange(index, delta);
      })
      .call(
        drag().on('drag', function onDrag(event) {
          const index = scene.handles.nodes().indexOf(this);
          scene.onChange(index, null, Math.max(0, Math.min(1, y.invert(event.y))));
        })
      );

    scene.labels = svg.append('g').selectAll('text').data(values).join('text')
      .attr('class', 'point-label').attr('text-anchor', 'middle');

    svg.append('g').attr('class', 'axis')
      .attr('transform', `translate(0,${baseline})`)
      .call(axisBottom(x).tickSizeOuter(0).tickPadding(8));

    scene.meanLine = svg.append('line').attr('class', 'mean-line').attr('y1', margin.top).attr('y2', baseline);
    scene.meanLabel = svg.append('text').attr('class', 'stat-label is-mean').attr('text-anchor', 'middle').attr('y', margin.top - 10);

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width, outcomes]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { outcomes, weights });
  }, [outcomes, weights]);

  return (
    <>
      <div className="graph is-short" ref={containerRef} />
      <PlotLegend
        items={[
          { tone: 'tangent', label: 'probability of each outcome' },
          { tone: 'curve', label: 'expected value' },
        ]}
      />
    </>
  );
}
