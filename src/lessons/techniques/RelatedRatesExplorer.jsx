import { useEffect, useRef, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';

export const rRange = [1, 9];
export const rateRange = [1, 6];

const maxRadius = rRange[1] + rateRange[1];

function renderActive(scene, { radius, rate }) {
  const { toPixels, cx, cy } = scene;

  scene.ring.attr('r', toPixels(radius + rate));
  scene.disc.attr('r', toPixels(radius));
  scene.spoke.attr('x2', cx + toPixels(radius));
  scene.spokeLabel.attr('x', cx + toPixels(radius) / 2).text(`r = ${radius}`);
  scene.growth
    .attr('x', cx)
    .attr('y', cy - toPixels(radius + rate) - 10)
    .text(`ring added each second ≈ 2πr × ${rate} = ${(2 * Math.PI * radius * rate).toFixed(1)}`);
}

export default function RelatedRatesExplorer({ radius, rate }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { radius, rate };
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
    const height = width < 540 ? 320 : 400;
    const cx = width / 2;
    const cy = height / 2 + 6;
    const toPixels = scaleLinear().domain([0, maxRadius]).range([0, Math.min(cx, cy) - 26]);

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
      .attr('aria-label', 'A circle whose radius grows at a constant rate');

    const scene = { toPixels, cx, cy };

    scene.ring = svg.append('circle').attr('class', 'growth-ring').attr('cx', cx).attr('cy', cy);
    scene.disc = svg.append('circle').attr('class', 'growth-disc').attr('cx', cx).attr('cy', cy);

    scene.spoke = svg
      .append('line')
      .attr('class', 'distance-line')
      .attr('x1', cx)
      .attr('y1', cy)
      .attr('y2', cy);

    svg.append('circle').attr('class', 'active-point').attr('cx', cx).attr('cy', cy).attr('r', 4);

    scene.spokeLabel = svg
      .append('text')
      .attr('class', 'point-label')
      .attr('y', cy - 10)
      .attr('text-anchor', 'middle');

    scene.growth = svg.append('text').attr('class', 'axis-label').attr('text-anchor', 'middle');

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { radius, rate });
  }, [radius, rate]);

  return <div className="graph" ref={containerRef} />;
}
