import { useEffect, useMemo, useRef, useState } from 'react';
import { axisBottom } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { line } from 'd3-shape';
import PlotLegend from '../../components/PlotLegend.jsx';
import { makeRng } from '../../lib/practice.js';
import { histogram, mean, normalPdf, sampleMean, standardDeviation } from '../../lib/statistics.js';

const DOMAIN = [0, 10];
const BINS = 44;
const TRIALS = 3000;

/** A heavily right-skewed population, so the CLT has something to prove. */
export function buildPopulation(shape) {
  const rng = makeRng(20260830);
  const values = [];

  for (let i = 0; i < 6000; i += 1) {
    if (shape === 'skewed') values.push(Math.min(10, -Math.log(1 - rng()) * 1.8));
    else if (shape === 'bimodal') values.push(rng() < 0.5 ? 1 + rng() * 1.6 : 7 + rng() * 1.8);
    else values.push(rng() * 10);
  }

  return values;
}

export function samplingDistribution(population, n) {
  const rng = makeRng(97531);
  const means = [];
  for (let i = 0; i < TRIALS; i += 1) means.push(sampleMean(population, n, rng));
  return means;
}

function renderActive(scene, { population, means, n }) {
  const { x, yTop, yBottom, topBase, bottomBase } = scene;

  const draw = (sel, values, y, base, scaleTo) => {
    const bars = histogram(values, BINS, DOMAIN);
    const peak = Math.max(...bars.map((b) => b.count)) || 1;
    y.domain([0, peak / scaleTo]);

    sel
      .selectAll('rect')
      .data(bars)
      .join('rect')
      .attr('class', 'hist-bar')
      .attr('x', (b) => x(b.from) + 0.5)
      .attr('width', Math.max(1, x(bars[0].to) - x(bars[0].from) - 1))
      .attr('y', (b) => y(b.count / scaleTo))
      .attr('height', (b) => Math.max(0, base - y(b.count / scaleTo)));
  };

  draw(scene.popGroup, population, yTop, topBase, 1);
  draw(scene.meanGroup, means, yBottom, bottomBase, 1);

  // Overlay the normal the theorem predicts for the sampling distribution.
  const mu = mean(population);
  const se = standardDeviation(population) / Math.sqrt(n);
  // The histogram axis is in counts, so the density has to be converted to the
  // expected count per bin rather than plotted on a 0-1 scale.
  const binWidth = (DOMAIN[1] - DOMAIN[0]) / BINS;

  const curve = line()
    .x((d) => x(d))
    .y((d) => yBottom(normalPdf(d, mu, se) * binWidth * means.length));

  const points = [];
  for (let v = DOMAIN[0]; v <= DOMAIN[1]; v += 0.02) points.push(v);
  scene.normalCurve.attr('d', curve(points));

  scene.popLabel.text(`population  ·  mean ${mu.toFixed(2)}`);
  scene.meanLabel.text(`means of samples of ${n}  ·  standard error ${se.toFixed(3)}`);
}

export default function SamplingExplorer({ shape, n }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [width, setWidth] = useState(0);

  const population = useMemo(() => buildPopulation(shape), [shape]);
  const means = useMemo(() => samplingDistribution(population, n), [population, n]);
  const latest = useRef({});

  useEffect(() => {
    latest.current = { population, means, n };
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
    const height = width < 540 ? 320 : 360;
    const margin = { top: 26, right: 26, bottom: 46, left: 26 };
    const gap = 46;
    const panel = (height - margin.top - margin.bottom - gap) / 2;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'A skewed population above, and the distribution of sample means below');

    const x = scaleLinear().domain(DOMAIN).range([margin.left, width - margin.right]);
    const topBase = margin.top + panel;
    const bottomBase = height - margin.bottom;
    const yTop = scaleLinear().range([topBase, margin.top]);
    const yBottom = scaleLinear().range([bottomBase, topBase + gap]);

    const scene = { x, yTop, yBottom, topBase, bottomBase };

    scene.popGroup = svg.append('g');
    scene.meanGroup = svg.append('g').attr('class', 'is-means');
    scene.normalCurve = svg.append('path').attr('class', 'curve approach right');

    scene.popLabel = svg.append('text').attr('class', 'point-label').attr('x', margin.left).attr('y', margin.top - 8);
    scene.meanLabel = svg.append('text').attr('class', 'point-label').attr('x', margin.left).attr('y', topBase + gap - 10);

    svg.append('g').attr('class', 'axis')
      .attr('transform', `translate(0,${bottomBase})`)
      .call(axisBottom(x).ticks(10).tickSizeOuter(0).tickPadding(8));

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { population, means, n });
  }, [population, means, n]);

  return (
    <>
      <div className="graph is-short" ref={containerRef} />
      <PlotLegend
        items={[
          { tone: 'tangent', label: 'observed counts' },
          { tone: 'curve', label: 'the normal the theorem predicts' },
        ]}
      />
    </>
  );
}
