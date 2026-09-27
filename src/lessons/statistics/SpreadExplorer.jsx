import { useEffect, useRef, useState } from 'react';
import { axisBottom } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import PlotLegend from '../../components/PlotLegend.jsx';
import { mean, median, standardDeviation } from '../../lib/statistics.js';

export const RANGE = [0, 100];
const clamp = (value) => Math.max(RANGE[0], Math.min(RANGE[1], value));

function renderActive(scene, { values, showSpread }) {
  const { x, baseline } = scene;
  const centre = mean(values);
  const middle = median(values);
  const sd = standardDeviation(values);

  scene.dots = scene.dotGroup
    .selectAll('circle')
    .data(values)
    .join('circle')
    .attr('class', 'data-dot')
    .attr('r', 8)
    .attr('cy', baseline - 58)
    .attr('cx', (value) => x(value))
    .attr('tabindex', 0)
    .attr('role', 'slider')
    .attr('aria-label', (value, index) => `Data point ${index + 1}`)
    .attr('aria-valuenow', (value) => Number(value.toFixed(1)))
    .on('keydown', function onKeyDown(event, value) {
      const step = event.shiftKey ? 10 : 1;
      const delta = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
      if (!delta) return;
      event.preventDefault();
      const index = scene.dotGroup.selectAll('circle').nodes().indexOf(this);
      scene.onChange(index, clamp(value + delta));
    })
    .call(
      drag().on('drag', function onDrag(event) {
        const index = scene.dotGroup.selectAll('circle').nodes().indexOf(this);
        scene.onChange(index, Number(clamp(scene.x.invert(event.x)).toFixed(1)));
      })
    );

  scene.band
    .attr('display', showSpread ? null : 'none')
    .attr('x', x(Math.max(RANGE[0], centre - sd)))
    .attr('width', Math.max(0, x(Math.min(RANGE[1], centre + sd)) - x(Math.max(RANGE[0], centre - sd))));

  const marker = (sel, label, value, offset, labelY) => {
    const px = x(value);
    sel.pointer.attr('d', `M ${px} ${baseline} l -7 ${offset} l 14 0 Z`);
    sel.label.attr('x', px).attr('y', labelY).text(`${label} ${value.toFixed(1)}`);
  };

  marker(scene.meanMarker, 'mean', centre, 14, baseline + 30);
  marker(scene.medianMarker, 'median', middle, -14, baseline - 90);
}

export default function SpreadExplorer({ values, showSpread, onChange }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { values, showSpread, onChange };
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
    const height = width < 540 ? 200 : 220;
    const margin = { top: 18, right: 26, bottom: 52, left: 26 };

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'Data points on a number line with the mean and median marked');

    const x = scaleLinear().domain(RANGE).range([margin.left, width - margin.right]);
    const baseline = height - margin.bottom;

    const scene = { x, baseline, onChange: latest.current.onChange };

    scene.band = svg.append('rect')
      .attr('class', 'spread-band')
      .attr('y', baseline - 82)
      .attr('height', 48);

    svg.append('g').attr('class', 'axis')
      .attr('transform', `translate(0,${baseline})`)
      .call(axisBottom(x).ticks(10).tickSizeOuter(0).tickPadding(10));

    scene.meanMarker = {
      pointer: svg.append('path').attr('class', 'stat-marker is-mean'),
      label: svg.append('text').attr('class', 'stat-label is-mean').attr('text-anchor', 'middle'),
    };
    scene.medianMarker = {
      pointer: svg.append('path').attr('class', 'stat-marker is-median'),
      label: svg.append('text').attr('class', 'stat-label is-median').attr('text-anchor', 'middle'),
    };

    scene.dotGroup = svg.append('g');

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { values, showSpread });
  }, [values, showSpread]);

  return (
    <>
      <div className="graph is-short" ref={containerRef} />
      <PlotLegend
        items={[
          { tone: 'curve', label: 'mean' },
          { tone: 'secant', label: 'median' },
        ]}
      />
    </>
  );
}
