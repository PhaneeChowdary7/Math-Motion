const HEAD = 11;

/**
 * Draw a vector as a shaft plus a solid head. The shaft stops short of the tip
 * so the two do not overdraw each other at the point.
 */
export function drawArrow({ x, y }, shaft, head, vec, from = { x: 0, y: 0 }) {
  const x0 = x(from.x);
  const y0 = y(from.y);
  const x1 = x(vec.x);
  const y1 = y(vec.y);
  const len = Math.hypot(x1 - x0, y1 - y0);

  if (len < 1) {
    shaft.attr('x1', x0).attr('y1', y0).attr('x2', x0).attr('y2', y0);
    head.attr('d', '');
    return;
  }

  const ux = (x1 - x0) / len;
  const uy = (y1 - y0) / len;
  const back = Math.min(HEAD, len);

  shaft.attr('x1', x0).attr('y1', y0).attr('x2', x1 - ux * back * 0.9).attr('y2', y1 - uy * back * 0.9);

  const bx = x1 - ux * back;
  const by = y1 - uy * back;
  const wx = -uy * (HEAD * 0.42);
  const wy = ux * (HEAD * 0.42);

  head.attr('d', `M ${x1} ${y1} L ${bx + wx} ${by + wy} L ${bx - wx} ${by - wy} Z`);
}
