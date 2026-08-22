import { useEffect, useRef, useState } from 'react';
import { axisBottom, axisLeft } from 'd3-axis';
import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { line } from 'd3-shape';

export default function SequenceExplorer({ terms, showSums, limit }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

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
    const height = width < 540 ? 330 : 400;
    const margin = { top: 24, right: 24, bottom: 38, left: 48 };

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'Sequence terms with their running total');

    const values = terms.map((t) => t.value);
    const sums = showSums ? terms.map((t) => t.running) : [];
    const candidates = [...values, ...sums, 0];
    if (Number.isFinite(limit)) candidates.push(limit);

    const [low, high] = extent(candidates);
    const pad = Math.max(1, (high - low) * 0.14);

    const x = scaleLinear()
      .domain([0.5, terms.length + 0.5])
      .range([margin.left, width - margin.right]);
    const y = scaleLinear()
      .domain([low - pad, high + pad])
      .range([height - margin.bottom, margin.top]);

    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(y).ticks(6).tickSize(-(width - margin.left - margin.right)).tickFormat(''));
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(axisBottom(x).ticks(Math.min(terms.length, 12)).tickSizeOuter(0).tickPadding(8));
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(y).ticks(6).tickSizeOuter(0).tickPadding(8));

    if (Number.isFinite(limit)) {
      svg
        .append('line')
        .attr('class', 'limit-line')
        .attr('x1', margin.left)
        .attr('y1', y(limit))
        .attr('x2', width - margin.right)
        .attr('y2', y(limit));

      svg
        .append('text')
        .attr('class', 'point-label')
        .attr('x', width - margin.right)
        .attr('y', y(limit) - 8)
        .attr('text-anchor', 'end')
        .text(`sum → ${limit.toFixed(2)}`);
    }

    if (showSums) {
      svg
        .append('path')
        .datum(terms)
        .attr('class', 'curve is-inverse')
        .attr(
          'd',
          line()
            .x((d) => x(d.n))
            .y((d) => y(d.running))
        );

      svg
        .selectAll('circle.sum-dot')
        .data(terms)
        .join('circle')
        .attr('class', 'sum-dot')
        .attr('r', 3.5)
        .attr('cx', (d) => x(d.n))
        .attr('cy', (d) => y(d.running));
    }

    svg
      .selectAll('line.term-stem')
      .data(terms)
      .join('line')
      .attr('class', 'term-stem')
      .attr('x1', (d) => x(d.n))
      .attr('y1', y(0))
      .attr('x2', (d) => x(d.n))
      .attr('y2', (d) => y(d.value));

    svg
      .selectAll('circle.term-dot')
      .data(terms)
      .join('circle')
      .attr('class', 'term-dot')
      .attr('r', 5)
      .attr('cx', (d) => x(d.n))
      .attr('cy', (d) => y(d.value));

    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', width - margin.right)
      .attr('y', height - 8)
      .attr('text-anchor', 'end')
      .text('n');
  }, [width, terms, showSums, limit]);

  return <div className="graph" ref={containerRef} />;
}
