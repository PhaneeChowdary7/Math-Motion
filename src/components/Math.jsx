import { memo, useMemo } from 'react';
import katex from 'katex';

// The same expressions are rendered again on every mount, and useMemo only
// survives one mount, so the markup is cached at module scope.
const cache = new Map();
const CACHE_LIMIT = 600;

function render(source, display) {
  const key = display ? `d:${source}` : `i:${source}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const html = katex.renderToString(source, {
    displayMode: display,
    throwOnError: false,
    strict: false,
  });

  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(key, html);

  return html;
}

function Math({ children, display = false, className = '' }) {
  const html = useMemo(() => render(String(children ?? ''), display), [children, display]);

  return (
    <span
      className={`math ${display ? 'is-display' : ''} ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default memo(Math);
