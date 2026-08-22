import { useEffect, useRef, useState } from 'react';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';

const DOMAIN = [-6, 6];
const clamp = (value, [min, max]) => Math.max(min, Math.min(max, value));

const QUADRANTS = [
  { number: 'I', sx: 1, sy: 1 },
  { number: 'II', sx: -1, sy: 1 },
  { number: 'III', sx: -1, sy: -1 },
  { number: 'IV', sx: 1, sy: -1 },
];

function renderActive(scene, { point, anchor }) {
  const { x, y } = scene;

  scene.quadrants
    .selectAll('rect')
    .attr('class', (d) =>
      Math.sign(point.x) === d.sx && Math.sign(point.y) === d.sy
        ? 'quadrant-zone is-active'
        : 'quadrant-zone'
    );

  scene.connector
    .attr('x1', x(anchor.x))
    .attr('y1', y(anchor.y))
    .attr('x2', x(point.x))
    .attr('y2', y(point.y));

  scene.legX
    .attr('x1', x(anchor.x))
    .attr('y1', y(anchor.y))
    .attr('x2', x(point.x))
    .attr('y2', y(anchor.y));

  scene.legY
    .attr('x1', x(point.x))
    .attr('y1', y(anchor.y))
    .attr('x2', x(point.x))
    .attr('y2', y(point.y));

  scene.anchor.attr('cx', x(anchor.x)).attr('cy', y(anchor.y));

  scene.point
    .attr('cx', x(point.x))
    .attr('cy', y(point.y))
    .attr('aria-valuetext', `x ${point.x.toFixed(1)}, y ${point.y.toFixed(1)}`);

  scene.label
    .attr('x', x(point.x) + 12)
    .attr('y', y(point.y) - 12)
    .text(`(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`);

  const midX = (anchor.x + point.x) / 2;
  const midY = (anchor.y + point.y) / 2;
  scene.midpoint.attr('cx', x(midX)).attr('cy', y(midY));
}

export default function CoordinatePlaneExplorer({ point, anchor, onChange }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { point, anchor, onChange };
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
    const height = width < 540 ? 340 : 420;
    const margin = { top: 24, right: 24, bottom: 38, left: 42 };

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'The coordinate plane with a draggable point');

    const x = scaleLinear().domain(DOMAIN).range([margin.left, width - margin.right]);
    const y = scaleLinear().domain(DOMAIN).range([height - margin.bottom, margin.top]);

    const scene = { x, y };

    scene.quadrants = svg.append('g');
    scene.quadrants
      .selectAll('rect')
      .data(QUADRANTS)
      .join('rect')
      .attr('class', 'quadrant-zone')
      .attr('x', (d) => (d.sx > 0 ? x(0) : x(DOMAIN[0])))
      .attr('y', (d) => (d.sy > 0 ? y(DOMAIN[1]) : y(0)))
      .attr('width', (x(DOMAIN[1]) - x(DOMAIN[0])) / 2)
      .attr('height', (y(DOMAIN[0]) - y(DOMAIN[1])) / 2);

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

    svg
      .selectAll('text.quadrant-label')
      .data(QUADRANTS)
      .join('text')
      .attr('class', 'quadrant-label')
      .attr('text-anchor', 'middle')
      .attr('x', (d) => x(d.sx * 4.4))
      .attr('y', (d) => y(d.sy * 4.9))
      .text((d) => d.number);

    scene.legX = svg.append('line').attr('class', 'leg-line');
    scene.legY = svg.append('line').attr('class', 'leg-line');
    scene.connector = svg.append('line').attr('class', 'secant-line');
    scene.midpoint = svg.append('circle').attr('class', 'mvt-point').attr('r', 5);
    scene.anchor = svg.append('circle').attr('class', 'anchor-point').attr('r', 6);

    scene.point = svg
      .append('circle')
      .attr('class', 'active-point')
      .attr('r', 9)
      .attr('tabindex', 0)
      .attr('role', 'slider')
      .attr('aria-label', 'Movable point')
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
        const current = latest.current.point;
        latest.current.onChange({
          x: Number(clamp(current.x + move[0], DOMAIN).toFixed(1)),
          y: Number(clamp(current.y + move[1], DOMAIN).toFixed(1)),
        });
      })
      .call(
        drag().on('drag', (event) => {
          latest.current.onChange({
            x: Number(clamp(x.invert(event.x), DOMAIN).toFixed(1)),
            y: Number(clamp(y.invert(event.y), DOMAIN).toFixed(1)),
          });
        })
      );

    scene.label = svg.append('text').attr('class', 'point-label');

    sceneRef.current = scene;
    renderActive(scene, { point: latest.current.point, anchor: latest.current.anchor });
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { point, anchor });
  }, [point, anchor]);

  return <div className="graph" ref={containerRef} />;
}
