import { useSyncExternalStore } from 'react';
import { recordCompletion } from './activity.js';

const KEY = 'math-motion:completed-lessons';
const listeners = new Set();

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    const clean = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (value === true) clean[id] = true;
    }

    return clean;
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

export function setLessonComplete(lessonId, complete) {
  const next = { ...read() };

  if (complete) next[lessonId] = true;
  else delete next[lessonId];

  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
  }

  emit();
  recordCompletion(lessonId, complete);
}

export function useProgress() {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}
