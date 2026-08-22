import { useEffect, useRef, useState } from 'react';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { pointer, select } from 'd3-selection';

import { line as lineGenerator } from 'd3-shape';
import { sampleSegments, valueAt } from '../../lib/limitFunctions.js';

const round2 = (value) => Number(value.toFixed(2));

function renderBands(scene, { epsilon, delta, showBands }) {
  const { x, y, fn, margin, width, height } = scene;
  const hasLimit = fn.limit !== null;
  const showEpsilon = showBands && hasLimit;

  scene.epsBand
    .attr('display', showEpsilon ? null : 'none')
    .classed('is-fail', delta === null)
    .attr('x', margin.left)
    .attr('width', width - margin.left - margin.right)
    .attr('y', y(fn.limit + epsilon))
    .attr('height', Math.max(0, y(fn.limit - epsilon) - y(fn.limit + epsilon)));

  scene.epsLines
    .attr('display', showEpsilon ? null : 'none')
    .each(function (side) {
      select(this)
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', y(fn.limit + side * epsilon))
        .attr('y2', y(fn.limit + side * epsilon));
    });

  const showDelta = showBands && delta !== null;

  scene.deltaStrip
    .attr('display', showDelta ? null : 'none')
    .attr('y', margin.top)
    .attr('height', height - margin.top - margin.bottom)
    .attr('x', showDelta ? x(fn.a - delta) : 0)
    .attr('width', showDelta ? Math.max(0, x(fn.a + delta) - x(fn.a - delta)) : 0);
}

function renderGuides(scene, { approachMode, showGuides }) {
  scene.showGuides = showGuides;

  scene.curves.forEach(({ path, side }) => {
    const highlighted = approachMode === 'both' || approachMode === side;
    path.attr('class', `curve ${highlighted ? `approach ${side}` : 'muted'}`);
  });

  const display = showGuides ? null : 'none';
  scene.limitLines.forEach((selection) => selection.attr('display', display));
}

function renderActive(scene, xValue) {
  const { x, y, fn, margin, width, height, showGuides } = scene;
  const value = valueAt(fn, xValue);
  const px = x(xValue);

  const rawY = value === null ? null : y(value);
  const py = rawY === null ? null : Math.max(margin.top, Math.min(height - margin.bottom, rawY));
  const clipped = rawY !== null && Math.abs(rawY - py) > 0.5;
  const flip = px > width - margin.right - 120;

  const hidden = value === null;
  scene.point.attr('display', hidden ? 'none' : null);
  scene.halo.attr('display', hidden ? 'none' : null);
  scene.distance.attr('display', hidden ? 'none' : null);

  if (!hidden) {
    scene.halo.attr('cx', px).attr('cy', py);
    scene.point
      .attr('cx', px)
      .attr('cy', py)
      .attr('aria-valuenow', xValue)
      .attr('aria-valuetext', `x equals ${xValue.toFixed(2)}, f of x equals ${value.toFixed(2)}`);
    scene.distance.attr('x1', px).attr('x2', x(fn.a)).attr('y1', py + 22).attr('y2', py + 22);
  } else {
    scene.point.attr('aria-valuenow', xValue).attr('aria-valuetext', `x equals ${xValue.toFixed(2)}, f of x is undefined`);
  }

  scene.label
    .attr('x', flip ? px - 12 : px + 12)
    .attr('y', (py ?? y(0)) - 15)
    .attr('text-anchor', flip ? 'end' : 'start')
    .text(
      value === null
        ? `x = ${xValue.toFixed(2)}, undefined`
        : `(${xValue.toFixed(2)}, ${clipped ? '→ ∞' : value.toFixed(2)})`
    );

  if (showGuides && !hidden) {
    scene.traceX.attr('display', null).attr('x1', px).attr('x2', px).attr('y1', y(0)).attr('y2', py);
    scene.traceY.attr('display', null).attr('x1', x(0)).attr('x2', px).attr('y1', py).attr('y2', py);
  } else {
    scene.traceX.attr('display', 'none');
    scene.traceY.attr('display', 'none');
  }
}

export default function LimitExplorer({
  fn,
  approachMode,
  showGuides,
  showBands,
  epsilon,
  delta,
  xValue,
  onChange,
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({});
  const [width, setWidth] = useState(0);

  useEffect(() => {
    latest.current = { xValue, epsilon, delta, showBands, approachMode, showGuides, onChange };
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
    const height = width < 540 ? 340 : 430;
    const margin = { top: 30, right: 28, bottom: 44, left: 52 };
    const clipId = `plot-clip-${Math.random().toString(36).slice(2, 9)}`;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'group')
      .attr('aria-label', `Plot of ${fn.expressionText ?? fn.title}`);

    const x = scaleLinear().domain(fn.xDomain).range([margin.left, width - margin.right]);
    const y = scaleLinear().domain(fn.yDomain).range([height - margin.bottom, margin.top]);
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    svg
      .append('clipPath')
      .attr('id', clipId)
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', plotWidth)
      .attr('height', plotHeight);

    const clipped = svg.append('g').attr('clip-path', `url(#${clipId})`);

    const setFromPointer = (event) => {
      const [pointerX] = pointer(event);
      const next = Math.max(fn.xDomain[0], Math.min(fn.xDomain[1], x.invert(pointerX)));
      latest.current.onChange(round2(next));
    };

    svg
      .append('rect')
      .attr('class', 'plot-hitbox')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', plotWidth)
      .attr('height', plotHeight)
      .on('pointerdown', setFromPointer);

    const scene = {
      x,
      y,
      fn,
      margin,
      width,
      height,
      showGuides: latest.current.showGuides,
      curves: [],
      limitLines: [],
    };

    scene.deltaStrip = clipped.append('rect').attr('class', 'delta-strip').attr('rx', 4);
    scene.epsBand = clipped.append('rect').attr('class', 'eps-band').attr('rx', 4);
    scene.epsLines = clipped
      .selectAll('line.eps-line')
      .data([1, -1])
      .join('line')
      .attr('class', 'eps-line');

    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(axisBottom(x).ticks(7).tickSize(-plotHeight).tickFormat(''));
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(y).ticks(6).tickSize(-plotWidth).tickFormat(''));
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${y(0)})`)
      .call(axisBottom(x).ticks(7).tickSizeOuter(0).tickPadding(8));
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${x(0)},0)`)
      .call(axisLeft(y).ticks(6).tickSizeOuter(0).tickPadding(8));

    const line = lineGenerator()
      .x((point) => x(point[0]))
      .y((point) => y(point[1]));

    sampleSegments(fn).forEach((segment) => {
      const side = segment[0][0] < fn.a ? 'left' : 'right';

      scene.curves.push({
        side,
        path: clipped.append('path').datum(segment).attr('d', line),
      });
    });

    scene.limitLines.push(
      clipped
        .append('line')
        .attr('class', 'limit-line')
        .attr('x1', x(fn.a))
        .attr('x2', x(fn.a))
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom)
    );

    if (fn.limit !== null) {
      scene.limitLines.push(
        clipped
          .append('line')
          .attr('class', 'limit-line horizontal')
          .attr('x1', margin.left)
          .attr('x2', width - margin.right)
          .attr('y1', y(fn.limit))
          .attr('y2', y(fn.limit))
      );
    }

    scene.traceX = clipped.append('line').attr('class', 'trace');
    scene.traceY = clipped.append('line').attr('class', 'trace');

    scene.distance = clipped.append('line').attr('class', 'distance-line');

    if (!fn.definedAtA && fn.limit !== null) {
      clipped
        .append('circle')
        .attr('class', 'hole')
        .attr('cx', x(fn.a))
        .attr('cy', y(fn.limit))
        .attr('r', 6.5);
    }

    if (fn.id === 'jump') {
      clipped.append('circle').attr('class', 'hole').attr('cx', x(fn.a)).attr('cy', y(fn.leftLimit)).attr('r', 6.5);
      clipped
        .append('circle')
        .attr('class', 'hole is-filled')
        .attr('cx', x(fn.a))
        .attr('cy', y(fn.rightLimit))
        .attr('r', 6.5);
    }

    scene.halo = clipped.append('circle').attr('class', 'active-halo').attr('r', 16);

    scene.point = clipped
      .append('circle')
      .attr('class', 'active-point')
      .attr('r', 8.5)
      .attr('tabindex', 0)
      .attr('role', 'slider')
      .attr('aria-label', 'Value of x')
      .attr('aria-valuemin', fn.xDomain[0])
      .attr('aria-valuemax', fn.xDomain[1])
      .on('keydown', (event) => {
        const stepSize = event.shiftKey ? 0.1 : 0.01;
        const current = latest.current.xValue;
        let next = null;

        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = current - stepSize;
        else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = current + stepSize;
        else if (event.key === 'Home') next = fn.xDomain[0];
        else if (event.key === 'End') next = fn.xDomain[1];
        else if (event.key === 'PageUp') next = fn.a + 0.02;
        else if (event.key === 'PageDown') next = fn.a - 0.02;
        else return;

        event.preventDefault();
        latest.current.onChange(round2(Math.max(fn.xDomain[0], Math.min(fn.xDomain[1], next))));
      })
      .call(
        drag().on('drag', (event) => {
          const next = Math.max(fn.xDomain[0], Math.min(fn.xDomain[1], x.invert(event.x)));
          latest.current.onChange(round2(next));
        })
      );

    scene.label = clipped.append('text').attr('class', 'point-label');

    if (fn.limit !== null && fn.limitExists) {
      clipped
        .append('text')
        .attr('class', 'label')
        .attr('x', x(fn.a) + 12)
        .attr('y', y(fn.limit) - 14)
        .text(`limit = ${fn.limit}`);
    }

    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', width - margin.right)
      .attr('y', y(0) + 30)
      .attr('text-anchor', 'end')
      .text('x');

    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', x(0) + 12)
      .attr('y', margin.top + 12)
      .text('f(x)');

    sceneRef.current = scene;
    renderGuides(scene, latest.current);
    renderBands(scene, latest.current);
    renderActive(scene, latest.current.xValue);
  }, [width, fn]);

  useEffect(() => {
    if (sceneRef.current) {
      renderGuides(sceneRef.current, { approachMode, showGuides });
      renderActive(sceneRef.current, latest.current.xValue);
    }
  }, [approachMode, showGuides]);

  useEffect(() => {
    if (sceneRef.current) renderBands(sceneRef.current, { epsilon, delta, showBands });
  }, [epsilon, delta, showBands]);

  useEffect(() => {
    if (sceneRef.current) renderActive(sceneRef.current, xValue);
  }, [xValue]);

  return <div className="graph" ref={containerRef} />;
}
