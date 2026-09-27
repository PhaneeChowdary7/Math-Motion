import { useSyncExternalStore } from 'react';

const KEY = 'math-motion:lesson-notes';
const listeners = new Set();

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    const clean = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (typeof value === 'string') clean[id] = value;
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

export function setLessonNote(lessonId, text) {
  const next = { ...read() };

  if (text.trim()) next[lessonId] = text;
  else delete next[lessonId];

  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
  }

  emit();
}

export function useLessonNote(lessonId) {
  const notes = useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
  return notes[lessonId] ?? '';
}
