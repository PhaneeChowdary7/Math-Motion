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

function fault(label, message) {
  failures.push([label, new Error(message)]);
  console.log(`  FAIL  ${label}\n        ${message}`);
}

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

const activity = await import('../src/lib/activity.js');
const { default: ProfilePage } = await import('../src/components/ProfilePage.jsx');

render('profile (empty)', createElement(ProfilePage));
activity.recordLessonVisit(availableLessons[0].id);
activity.recordQuizAnswer();
render('profile (with activity)', createElement(ProfilePage));

console.log('\nStory scenes (each rendered across its timeline)');

{
  // Lazy glob: an eager one would bundle the stories into this entry chunk,
  // and lesson chunks importing them would then deadlock on its top-level await.
  const loaders = import.meta.glob('../src/stories/*.jsx');
  let count = 0;
  for (const [file, load] of Object.entries(loaders)) {
    const module = await load();
    for (const [name, Story] of Object.entries(module)) {
      if (typeof Story !== 'function') continue;
      count += 1;
      for (const t of [0, 0.25, 0.5, 0.75, 1]) {
        try {
          const html = renderToString(createElement(Story, { initialT: t }));
          if (html.length < 200) throw new Error(`rendered almost nothing at t=${t}`);
          if (html.includes('story-emoji')) throw new Error(`an emoji has no vector figure in storyArt.jsx at t=${t}`);
          if (/NaN|undefined|Infinity/.test(html.replace(/aria-label="[^"]*"/g, ''))) {
            throw new Error(`NaN, undefined or Infinity in the markup at t=${t}`);
          }
        } catch (error) {
          fault(`${file.split('/').pop()} ${name}`, `${error.message.split('\n')[0]} (t=${t})`);
          break;
        }
      }
    }
  }
  console.log(`  ok    ${count} stories rendered at t = 0, 0.25, 0.5, 0.75, 1`);
}

console.log('\nActivity maths');

{
  const { activityYears, addDays, dateKey, getStreaks, buildCalendar } = activity;
  const now = new Date(2026, 8, 27);
  const day = { lessons: ['x'], quiz: 0, completed: 0 };
  const days = {
    [dateKey(now)]: day,
    [dateKey(addDays(now, -1))]: day,
    [dateKey(addDays(now, -2))]: day,
    [dateKey(addDays(now, -10))]: day,
    [dateKey(addDays(now, -11))]: day,
    [dateKey(addDays(now, -12))]: day,
    [dateKey(addDays(now, -13))]: day,
  };
  const streaks = getStreaks(days, now);
  const calendar = buildCalendar(days, now);
  const cells = calendar.weeks.flat().filter(Boolean);

  const checks = [
    ['current streak is 3', streaks.current === 3],
    ['longest streak is 4', streaks.longest === 4],
    ['yesterday keeps a streak alive', getStreaks(days, addDays(now, 1)).current === 3],
    ['calendar has 53 weeks of 7 rows', calendar.weeks.length === 53 && calendar.weeks.every((w) => w.length === 7)],
    ['calendar ends today', cells[cells.length - 1].key === dateKey(now)],
    ['7 active days counted', calendar.activeDays === 7 && calendar.total === 7],
    ['past year runs Jan 1 to Dec 31', (() => {
      const year = buildCalendar({ '2025-01-01': day, '2025-12-31': day, '2026-01-01': day }, now, 2025);
      const inYear = year.weeks.flat().filter(Boolean);
      return inYear[0].key === '2025-01-01' && inYear[inYear.length - 1].key === '2025-12-31' && inYear.length === 365 && year.activeDays === 2;
    })()],
    ['years listed newest first', activityYears('2024-03-02', now).join() === '2026,2025,2024'],
    ['no history lists the current year', activityYears(null, now).join() === '2026'],
  ];

  for (const [label, ok] of checks) {
    if (ok) console.log(`  ok    ${label}`);
    else fault(label, 'activity maths check failed');
  }
}

console.log('\nCatalog integrity');


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
