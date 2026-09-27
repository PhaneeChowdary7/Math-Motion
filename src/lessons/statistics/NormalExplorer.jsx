import { useEffect, useRef, useState } from 'react';
import { axisBottom } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { area, line } from 'd3-shape';
import PlotLegend from '../../components/PlotLegend.jsx';
import { normalBetween, normalPdf } from '../../lib/statistics.js';

export const DOMAIN = [0, 200];

function samples(mu, sigma, from, to) {
  const points = [];
  const step = (to - from) / 240;
  for (let x = from; x <= to + 1e-9; x += step) points.push([x, normalPdf(x, mu, sigma)]);
  return points;
}

function renderActive(scene, { mu, sigma, low, high }) {
  const { x, y } = scene;
  y.domain([0, Math.max(0.004, normalPdf(mu, mu, sigma) * 1.15)]);

  const curve = line().x((d) => x(d[0])).y((d) => y(d[1]));
  const shade = area().x((d) => x(d[0])).y0(y(0)).y1((d) => y(d[1]));

  scene.curve.attr('d', curve(samples(mu, sigma, DOMAIN[0], DOMAIN[1])));
  scene.shaded.attr('d', shade(samples(mu, sigma, low, high)));

  for (const [key, value] of [['lowHandle', low], ['highHandle', high]]) {
    scene[key]
      .attr('x1', x(value)).attr('x2', x(value))
      .attr('y1', y(0)).attr('y2', scene.top);
    scene[`${key}Grip`]
      .attr('cx', x(value))
      .attr('cy', scene.top + 10)
      .attr('aria-valuenow', Number(value.toFixed(1)));
  }

  scene.meanLine.attr('x1', x(mu)).attr('x2', x(mu)).attr('y1', y(0)).attr('y2', y(normalPdf(mu, mu, sigma)));

  const share = normalBetween(low, high, mu, sigma);
  scene.shareLabel
    .attr('x', x((low + high) / 2))
    .attr('y', scene.top + 34)
    .text(`${(share * 100).toFixed(1)}% of the area`);
}

export default function NormalExplorer({ mu, sigma, low, high, onChange }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { mu, sigma, low, high, onChange };
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
    const height = width < 540 ? 300 : 340;
    const margin = { top: 46, right: 26, bottom: 50, left: 30 };

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'A normal curve with a shaded region between two movable bounds');

    const x = scaleLinear().domain(DOMAIN).range([margin.left, width - margin.right]);
    const y = scaleLinear().range([height - margin.bottom, margin.top]);

    const scene = { x, y, top: margin.top - 14, onChange: latest.current.onChange };

    scene.shaded = svg.append('path').attr('class', 'normal-shade');
    scene.curve = svg.append('path').attr('class', 'curve approach right');
    scene.meanLine = svg.append('line').attr('class', 'mean-line');

    svg.append('g').attr('class', 'axis')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(axisBottom(x).ticks(8).tickSizeOuter(0).tickPadding(8));

    const bound = (key) => {
      scene[key] = svg.append('line').attr('class', 'bound-line');
      scene[`${key}Grip`] = svg
        .append('circle')
        .attr('class', 'active-point is-secondary')
        .attr('r', 7)
        .attr('tabindex', 0)
        .attr('role', 'slider')
        .attr('aria-label', key === 'lowHandle' ? 'Lower bound' : 'Upper bound')
        .on('keydown', (event) => {
          const step = event.shiftKey ? 10 : 1;
          const delta = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
          if (!delta) return;
          event.preventDefault();
          scene.onChange(key === 'lowHandle' ? 'low' : 'high', delta, null);
        })
        .call(
          drag().on('drag', (event) => {
            scene.onChange(key === 'lowHandle' ? 'low' : 'high', null, x.invert(event.x));
          })
        );
    };

    bound('lowHandle');
    bound('highHandle');

    scene.shareLabel = svg.append('text').attr('class', 'stat-label is-joint').attr('text-anchor', 'middle');

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { mu, sigma, low, high });
  }, [mu, sigma, low, high]);

  return (
    <>
      <div className="graph is-short" ref={containerRef} />
      <PlotLegend
        items={[
          { tone: 'curve', label: 'the distribution' },
          { tone: 'tangent', label: 'area between the bounds' },
          { tone: 'secant', label: 'movable bounds', dashed: true },
        ]}
      />
    </>
  );
}
