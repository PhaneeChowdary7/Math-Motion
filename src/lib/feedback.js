import { useSyncExternalStore } from 'react';
import { availableLessons, getLessonById } from '../lessons/catalog.js';

const KEY = 'math-motion:lesson-feedback';
const APP = 'math-motion';

const SCHEMA = 1;

const listeners = new Set();

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
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

function buildRecord(lessonId, rating, comment, existing) {
  const lesson = getLessonById(lessonId);
  const now = new Date().toISOString();

  return {
    schema: SCHEMA,
    app: APP,
    lessonId,
    lessonSlug: lesson?.slug ?? null,
    lessonTitle: lesson?.title ?? null,
    chapter: lesson?.chapter ?? null,
    rating: rating ?? null,
    comment: comment.trim(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function setLessonFeedback(lessonId, { rating, comment = '' }) {
  const store = read();
  const next = { ...store };

  if (!rating && !comment.trim()) delete next[lessonId];
  else next[lessonId] = buildRecord(lessonId, rating, comment, store[lessonId]);

  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
  }

  emit();
}

export function clearLessonFeedback(lessonId) {
  setLessonFeedback(lessonId, { rating: null, comment: '' });
}

export function useLessonFeedback(lessonId) {
  const all = useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
  return all[lessonId] ?? null;
}

export function useFeedbackCount() {
  const all = useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
  return Object.keys(all).length;
}

export function exportFeedback() {
  const store = read();
  const entries = availableLessons.map((lesson) => store[lesson.id]).filter(Boolean);
  const rated = entries.filter((entry) => entry.rating);

  return {
    app: APP,
    schema: SCHEMA,
    exportedAt: new Date().toISOString(),
    count: entries.length,
    averageRating: rated.length
      ? Number((rated.reduce((total, entry) => total + entry.rating, 0) / rated.length).toFixed(2))
      : null,
    entries,
  };
}
