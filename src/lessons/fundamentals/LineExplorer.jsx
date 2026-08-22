import { useEffect, useRef, useState } from 'react';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';

const DOMAIN = [-6, 6];
const clamp = (value, [min, max]) => Math.max(min, Math.min(max, value));

function edges(p1, p2) {
  if (p1.x === p2.x) {
    return { vertical: true, x: p1.x };
  }

  const m = (p2.y - p1.y) / (p2.x - p1.x);
  const c = p1.y - m * p1.x;

  return {
    vertical: false,
    m,
    c,
    left: [DOMAIN[0], m * DOMAIN[0] + c],
    right: [DOMAIN[1], m * DOMAIN[1] + c],
  };
}

function renderActive(scene, { p1, p2, showRise }) {
  const { x, y } = scene;
  const geometry = edges(p1, p2);

  if (geometry.vertical) {
    scene.line.attr('x1', x(geometry.x)).attr('y1', y(DOMAIN[0])).attr('x2', x(geometry.x)).attr('y2', y(DOMAIN[1]));
  } else {
    scene.line
      .attr('x1', x(geometry.left[0]))
      .attr('y1', y(geometry.left[1]))
      .attr('x2', x(geometry.right[0]))
      .attr('y2', y(geometry.right[1]));
  }

  scene.run
    .attr('display', showRise ? null : 'none')
    .attr('x1', x(p1.x))
    .attr('y1', y(p1.y))
    .attr('x2', x(p2.x))
    .attr('y2', y(p1.y));

  scene.rise
    .attr('display', showRise ? null : 'none')
    .attr('x1', x(p2.x))
    .attr('y1', y(p1.y))
    .attr('x2', x(p2.x))
    .attr('y2', y(p2.y));

  scene.runLabel
    .attr('display', showRise ? null : 'none')
    .attr('x', x((p1.x + p2.x) / 2))
    .attr('y', y(p1.y) + 18)
    .attr('text-anchor', 'middle')
    .text(`run ${(p2.x - p1.x).toFixed(1)}`);

  scene.riseLabel
    .attr('display', showRise ? null : 'none')
    .attr('x', x(p2.x) + 10)
    .attr('y', y((p1.y + p2.y) / 2))
    .text(`rise ${(p2.y - p1.y).toFixed(1)}`);

  scene.intercept
    .attr('display', geometry.vertical ? 'none' : null)
    .attr('cx', x(0))
    .attr('cy', y(geometry.vertical ? 0 : geometry.c));

  scene.handle1.attr('cx', x(p1.x)).attr('cy', y(p1.y));
  scene.handle2.attr('cx', x(p2.x)).attr('cy', y(p2.y));
}

export default function LineExplorer({ p1, p2, showRise, onChange }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { p1, p2, showRise, onChange };
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
    const height = width < 540 ? 330 : 410;
    const margin = { top: 24, right: 24, bottom: 38, left: 42 };
    const clipId = `line-clip-${Math.random().toString(36).slice(2, 9)}`;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'A line through two draggable points');

    const x = scaleLinear().domain(DOMAIN).range([margin.left, width - margin.right]);
    const y = scaleLinear().domain(DOMAIN).range([height - margin.bottom, margin.top]);

    svg
      .append('clipPath')
      .attr('id', clipId)
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom);

    const clipped = svg.append('g').attr('clip-path', `url(#${clipId})`);

    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(axisBottom(x).ticks(12).tickSize(-(height - margin.top - margin.bottom)).tickFormat(''));
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(y).ticks(12).tickSize(-(width - margin.left - margin.right)).tickFormat(''));
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${y(0)})`)
      .call(axisBottom(x).ticks(6).tickSizeOuter(0).tickPadding(8));
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${x(0)},0)`)
      .call(axisLeft(y).ticks(6).tickSizeOuter(0).tickPadding(8));

    const scene = { x, y };

    scene.line = clipped.append('line').attr('class', 'secant-line');
    scene.run = clipped.append('line').attr('class', 'leg-line is-cos');
    scene.rise = clipped.append('line').attr('class', 'leg-line is-sin');
    scene.runLabel = clipped.append('text').attr('class', 'point-label');
    scene.riseLabel = clipped.append('text').attr('class', 'point-label');
    scene.intercept = clipped.append('circle').attr('class', 'mvt-point').attr('r', 6);

    const makeHandle = (which, label) =>
      clipped
        .append('circle')
        .attr('class', 'active-point')
        .attr('r', 9)
        .attr('tabindex', 0)
        .attr('role', 'slider')
        .attr('aria-label', label)
        .on('keydown', (event) => {
          const step = event.shiftKey ? 1 : 0.5;
          const moves = {
            ArrowLeft: [-step, 0],
            ArrowRight: [step, 0],
            ArrowUp: [0, step],
            ArrowDown: [0, -step],
          };
          const move = moves[event.key];
          if (!move) return;

          event.preventDefault();
          const current = latest.current[which];
          latest.current.onChange(which, {
            x: Number(clamp(current.x + move[0], DOMAIN).toFixed(1)),
            y: Number(clamp(current.y + move[1], DOMAIN).toFixed(1)),
          });
        })
        .call(
          drag().on('drag', (event) => {
            latest.current.onChange(which, {
              x: Number(clamp(x.invert(event.x), DOMAIN).toFixed(1)),
              y: Number(clamp(y.invert(event.y), DOMAIN).toFixed(1)),
            });
          })
        );

    scene.handle1 = makeHandle('p1', 'First point');
    scene.handle2 = makeHandle('p2', 'Second point');

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { p1, p2, showRise });
  }, [p1, p2, showRise]);

  return <div className="graph" ref={containerRef} />;
}
