import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

function installBrowserShims() {
  const store = new Map();
  const noop = () => {};
  const mediaQueryList = { matches: false, addEventListener: noop, removeEventListener: noop };

  globalThis.window = {
    addEventListener: noop,
    removeEventListener: noop,
    matchMedia: () => mediaQueryList,
    location: { hash: '' },
    scrollTo: noop,
    innerWidth: 1440,
  };

  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  };

  globalThis.document = { documentElement: { dataset: {}, clientWidth: 1440 } };
  globalThis.matchMedia = globalThis.window.matchMedia;
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
}

installBrowserShims();

const { default: App } = await import('../src/App.jsx');
const { lessonLoaders } = await import('../src/lessons/registry.js');
const { lessons, availableLessons } = await import('../src/lessons/catalog.js');

const failures = [];

function render(label, element) {
  try {
    const html = renderToString(element);
    if (!html || html.length < 20) throw new Error(`rendered almost nothing (${html.length} chars)`);
    console.log(`  ok    ${label.padEnd(26)} ${html.length} chars`);
  } catch (error) {
    failures.push([label, error]);
    console.log(`  FAIL  ${label}`);
    console.log(`        ${error.message.split('\n')[0]}`);
  }
}

console.log(`Rendering the shell and ${availableLessons.length} lesson(s) of ${lessons.length} catalog entries\n`);

render('App shell', createElement(App));

for (const [id, load] of Object.entries(lessonLoaders)) {
  const module = await load();
  render(id, createElement(module.default, { lessonId: id }));
}

console.log('\nCatalog integrity');

function fault(label, message) {
  failures.push([label, new Error(message)]);
  console.log(`  FAIL  ${label}\n        ${message}`);
}

const seenIds = new Map();
const seenSlugs = new Map();

for (const lesson of lessons) {
  if (!lesson.id) fault(lesson.title ?? '(untitled)', 'missing id');
  if (!lesson.title) fault(lesson.id, 'missing title');
  if (!lesson.chapter) fault(lesson.id, 'missing chapter');

  if (seenIds.has(lesson.id)) fault(lesson.id, `duplicate id, also used by "${seenIds.get(lesson.id)}"`);
  else seenIds.set(lesson.id, lesson.title);

  if (lesson.status !== 'soon') {
    if (!lesson.slug) fault(lesson.id, 'available lesson has no slug, so it cannot be routed to');
    else if (seenSlugs.has(lesson.slug))
      fault(lesson.id, `duplicate slug "${lesson.slug}", already used by "${seenSlugs.get(lesson.slug)}"`);
    else seenSlugs.set(lesson.slug, lesson.id);

    if (!lessonLoaders[lesson.id]) fault(lesson.id, 'listed as available but registry.js has no loader');
  }
}

if (!failures.length) {
  console.log(`  ok    ${lessons.length} entries: ids and slugs unique, every available lesson has a loader`);
}

console.log();

if (failures.length) {
  console.log(`${failures.length} failure(s)\n`);
  for (const [label, error] of failures) console.log(`${label}: ${error.stack ?? error.message}\n`);
  process.exit(1);
}

console.log('Smoke test passed: shell and all lessons render.');
