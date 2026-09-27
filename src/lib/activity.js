import { useSyncExternalStore } from 'react';

// A per-device learning log: which days the reader studied and what they did.
// Shape: { name, since, lastLesson, days: { 'YYYY-MM-DD': { lessons: [id], quiz, completed } },
//          completedOn: { lessonId: 'YYYY-MM-DD' } }
const KEY = 'math-motion:activity';
// Kept long enough to browse several past years; a year of entries is only a few KB.
const RETAIN_DAYS = 366 * 6;
const listeners = new Set();

export function dateKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

const empty = { name: '', since: null, lastLesson: null, days: {}, completedOn: {} };

function count(value) {
  return Number.isInteger(value) && value > 0 ? value : 0;
}

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return empty;

    const days = {};
    for (const [key, day] of Object.entries(parsed.days ?? {})) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !day || typeof day !== 'object') continue;
      days[key] = {
        lessons: Array.isArray(day.lessons) ? day.lessons.filter((id) => typeof id === 'string') : [],
        quiz: count(day.quiz),
        completed: count(day.completed),
      };
    }

    const completedOn = {};
    for (const [id, key] of Object.entries(parsed.completedOn ?? {})) {
      if (typeof key === 'string') completedOn[id] = key;
    }

    return {
      name: typeof parsed.name === 'string' ? parsed.name.slice(0, 40) : '',
      since: typeof parsed.since === 'string' ? parsed.since : null,
      lastLesson: typeof parsed.lastLesson === 'string' ? parsed.lastLesson : null,
      days,
      completedOn,
    };
  } catch {
    return empty;
  }
}

let snapshot = read();

function emit() {
  snapshot = read();
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

window.addEventListener('storage', (event) => {
  if (event.key === KEY) emit();
});

function write(update) {
  const next = update(structuredClone(read()));
  const cutoff = dateKey(addDays(new Date(), -RETAIN_DAYS));

  for (const key of Object.keys(next.days)) {
    if (key < cutoff) delete next.days[key];
  }

  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
  }

  emit();
}

function today(state) {
  const key = dateKey();
  state.since ??= key;
  state.days[key] ??= { lessons: [], quiz: 0, completed: 0 };
  return state.days[key];
}

export function recordLessonVisit(lessonId) {
  const key = dateKey();
  const current = snapshot.days[key];
  if (current?.lessons.includes(lessonId) && snapshot.lastLesson === lessonId) return;

  write((state) => {
    const day = today(state);
    if (!day.lessons.includes(lessonId)) day.lessons.push(lessonId);
    state.lastLesson = lessonId;
    return state;
  });
}

export function recordQuizAnswer() {
  write((state) => {
    today(state).quiz += 1;
    return state;
  });
}

export function recordCompletion(lessonId, complete) {
  write((state) => {
    if (complete) {
      today(state).completed += 1;
      state.completedOn[lessonId] = dateKey();
    } else {
      delete state.completedOn[lessonId];
    }
    return state;
  });
}

export function setProfileName(name) {
  write((state) => {
    state.name = name.slice(0, 40);
    return state;
  });
}

export function clearActivity() {
  write((state) => ({ ...empty, name: state.name }));
}

export function useActivity() {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}

// One action per distinct lesson opened, per quiz answer and per completion.
export function dayScore(day) {
  return day ? day.lessons.length + day.quiz + day.completed : 0;
}

export function scoreLevel(score) {
  if (score <= 0) return 0;
  if (score <= 2) return 1;
  if (score <= 5) return 2;
  if (score <= 9) return 3;
  return 4;
}

export function getStreaks(days, now = new Date()) {
  const active = (date) => dayScore(days[dateKey(date)]) > 0;

  let current = 0;
  let cursor = active(now) ? now : addDays(now, -1);
  while (active(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  let longest = 0;
  let run = 0;
  let previous = null;
  for (const key of Object.keys(days).sort()) {
    if (dayScore(days[key]) <= 0) continue;
    const date = parseKey(key);
    run = previous && dateKey(addDays(previous, 1)) === key ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = date;
  }

  return { current, longest };
}

// The GitHub-style grid of Sunday-to-Saturday week columns. With no year it is
// the rolling last year ending today; with a past year it runs Jan 1 to Dec 31.
// Days outside the range are returned as null so the grid keeps its shape.
export function buildCalendar(days, now = new Date(), year = null) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const rolling = year === null || year >= today.getFullYear();
  const last = rolling ? today : new Date(year, 11, 31);
  const first = rolling ? addDays(today, -(52 * 7 + today.getDay())) : new Date(year, 0, 1);
  const start = addDays(first, -first.getDay());
  const span = Math.round((last - start) / 86400000) + 1;
  const weeks = [];
  let total = 0;
  let activeDays = 0;

  for (let week = 0; week < Math.ceil(span / 7); week += 1) {
    const column = [];
    for (let weekday = 0; weekday < 7; weekday += 1) {
      const date = addDays(start, week * 7 + weekday);
      if (date < first || date > last) {
        column.push(null);
        continue;
      }
      const key = dateKey(date);
      const score = dayScore(days[key]);
      total += score;
      if (score > 0) activeDays += 1;
      column.push({ key, date, score, level: scoreLevel(score), day: days[key] ?? null });
    }
    weeks.push(column);
  }

  return { weeks, total, activeDays };
}

// Years the reader can browse, newest first: from their first active year to now.
export function activityYears(since, now = new Date()) {
  const current = now.getFullYear();
  const earliest = since ? Math.min(parseKey(since).getFullYear(), current) : current;
  const years = [];
  for (let year = current; year >= earliest; year -= 1) years.push(year);
  return years;
}
