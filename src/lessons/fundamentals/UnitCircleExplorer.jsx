import { useEffect, useRef, useState } from 'react';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { line } from 'd3-shape';
import { TAU, normalize, waveSamples } from '../../lib/trigWave.js';

function renderActive(scene, { theta, wave, showBoth }) {
  const { cx, cy, radius, wx, wy } = scene;
  const wrapped = normalize(theta);
  const px = cx + radius * Math.cos(wrapped);
  const py = cy - radius * Math.sin(wrapped);
  const value = wave.f(wrapped);

  scene.radius.attr('x2', px).attr('y2', py);
  scene.legCos.attr('x1', cx).attr('y1', cy).attr('x2', px).attr('y2', cy);
  scene.legSin.attr('x1', px).attr('y1', cy).attr('x2', px).attr('y2', py);

  scene.arc.attr(
    'd',
    `M ${cx + radius * 0.28} ${cy} A ${radius * 0.28} ${radius * 0.28} 0 ${
      wrapped > Math.PI ? 1 : 0
    } 0 ${cx + radius * 0.28 * Math.cos(wrapped)} ${cy - radius * 0.28 * Math.sin(wrapped)}`
  );

  scene.handle
    .attr('cx', px)
    .attr('cy', py)
    .attr('aria-valuenow', Number(wrapped.toFixed(3)))
    .attr('aria-valuetext', `${((wrapped * 180) / Math.PI).toFixed(0)} degrees`);

  scene.traced.attr(
    'd',
    line()
      .x((d) => wx(d[0]))
      .y((d) => wy(d[1]))(waveSamples(wave.f, wrapped))
  );

  scene.ghost
    .attr('display', showBoth ? null : 'none')
    .attr(
      'd',
      line()
        .x((d) => wx(d[0]))
        .y((d) => wy(d[1]))(waveSamples(wave.id === 'sine' ? Math.cos : Math.sin, TAU))
    );

  scene.tie
    .attr('x1', px)
    .attr('y1', wave.id === 'sine' ? py : cy)
    .attr('x2', wx(wrapped))
    .attr('y2', wy(value));

  scene.marker.attr('cx', wx(wrapped)).attr('cy', wy(value));

  scene.readoutLabel
    .attr('x', wx(wrapped) + 10)
    .attr('y', wy(value) - 12)
    .text(`${wave.label} = ${value.toFixed(2)}`);
}

export default function UnitCircleExplorer({ theta, wave, showBoth, onChange }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { theta, wave, showBoth, onChange };
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
    const narrow = width < 560;
    const height = narrow ? 460 : 360;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', 'A point on the unit circle tracing a wave');

    const circleBox = narrow
      ? { x: 0, y: 0, w: width, h: 210 }
      : { x: 0, y: 0, w: width * 0.42, h: height };
    const waveBox = narrow
      ? { x: 0, y: 220, w: width, h: height - 230 }
      : { x: width * 0.44, y: 0, w: width * 0.56, h: height };

    const radius = Math.min(circleBox.w, circleBox.h) / 2 - 34;
    const cx = circleBox.x + circleBox.w / 2;
    const cy = circleBox.y + circleBox.h / 2;

    const wx = scaleLinear().domain([0, TAU]).range([waveBox.x + 30, waveBox.x + waveBox.w - 14]);
    const wy = scaleLinear()
      .domain([-1.25, 1.25])
      .range([waveBox.y + waveBox.h - 26, waveBox.y + 26]);

    const scene = { cx, cy, radius, wx, wy };

    svg
      .append('line')
      .attr('class', 'axis-rule')
      .attr('x1', cx - radius - 18)
      .attr('y1', cy)
      .attr('x2', cx + radius + 18)
      .attr('y2', cy);
    svg
      .append('line')
      .attr('class', 'axis-rule')
      .attr('x1', cx)
      .attr('y1', cy - radius - 18)
      .attr('x2', cx)
      .attr('y2', cy + radius + 18);

    svg
      .append('circle')
      .attr('class', 'unit-circle')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', radius);

    svg
      .append('line')
      .attr('class', 'axis-rule')
      .attr('x1', wx(0))
      .attr('y1', wy(0))
      .attr('x2', wx(TAU))
      .attr('y2', wy(0));

    svg
      .selectAll('text.wave-tick')
      .data([
        [0, '0'],
        [Math.PI / 2, 'π/2'],
        [Math.PI, 'π'],
        [(3 * Math.PI) / 2, '3π/2'],
        [TAU, '2π'],
      ])
      .join('text')
      .attr('class', 'wave-tick')
      .attr('text-anchor', 'middle')
      .attr('x', (d) => wx(d[0]))
      .attr('y', wy(0) + 18)
      .text((d) => d[1]);

    scene.arc = svg.append('path').attr('class', 'angle-arc');
    scene.legCos = svg.append('line').attr('class', 'leg-line is-cos');
    scene.legSin = svg.append('line').attr('class', 'leg-line is-sin');
    scene.radius = svg
      .append('line')
      .attr('class', 'radius-line')
      .attr('x1', cx)
      .attr('y1', cy);

    scene.ghost = svg.append('path').attr('class', 'curve is-ghost');
    scene.traced = svg.append('path').attr('class', 'curve approach right');
    scene.tie = svg.append('line').attr('class', 'tie-line');
    scene.marker = svg.append('circle').attr('class', 'mvt-point').attr('r', 6);
    scene.readoutLabel = svg.append('text').attr('class', 'point-label');

    scene.handle = svg
      .append('circle')
      .attr('class', 'active-point')
      .attr('r', 9)
      .attr('tabindex', 0)
      .attr('role', 'slider')
      .attr('aria-label', 'Angle on the unit circle')
      .attr('aria-valuemin', 0)
      .attr('aria-valuemax', Number(TAU.toFixed(3)))
      .on('keydown', (event) => {
        const step = event.shiftKey ? Math.PI / 12 : Math.PI / 60;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
          latest.current.onChange(normalize(latest.current.theta - step));
        } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
          latest.current.onChange(normalize(latest.current.theta + step));
        } else return;
        event.preventDefault();
      })
      .call(
        drag().on('drag', (event) => {
          latest.current.onChange(normalize(Math.atan2(cy - event.y, event.x - cx)));
        })
      );

    sceneRef.current = scene;
    renderActive(scene, latest.current);
  }, [width]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, { theta, wave, showBoth });
  }, [theta, wave, showBoth]);

  return <div className="graph" ref={containerRef} />;
}
