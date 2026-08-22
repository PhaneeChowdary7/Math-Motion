import { BarChart3, Infinity as InfinityIcon, Shapes } from 'lucide-react';

export const chapterIcons = {
  Fundamentals: Shapes,
  Calculus: InfinityIcon,
  Statistics: BarChart3,
};

export const lessons = [
  {
    id: 'fundamentals-numbers',
    slug: 'number-sets-and-primes',
    title: 'Number Sets & Primes',
    chapter: 'Fundamentals',
  },
  {
    id: 'fundamentals-plane',
    slug: 'coordinate-plane',
    title: 'The Coordinate Plane',
    chapter: 'Fundamentals',
  },
  {
    id: 'fundamentals-functions',
    slug: 'functions-and-graphs',
    title: 'Functions & Graphs',
    chapter: 'Fundamentals',
  },
  {
    id: 'fundamentals-lines',
    slug: 'lines-and-slope',
    title: 'Lines & Slope',
    chapter: 'Fundamentals',
  },
  {
    id: 'fundamentals-exponents',
    slug: 'exponents-and-logarithms',
    title: 'Exponents & Logarithms',
    chapter: 'Fundamentals',
  },
  {
    id: 'fundamentals-trigonometry',
    slug: 'sine-and-cosine',
    title: 'Sine & Cosine',
    chapter: 'Fundamentals',
  },
  {
    id: 'fundamentals-sequences',
    slug: 'sequences-and-series',
    title: 'Sequences & Series',
    chapter: 'Fundamentals',
  },
  {
    id: 'calculus-limits',
    slug: 'limits',
    title: 'Limits & Continuity',
    chapter: 'Calculus',
  },
  {
    id: 'calculus-derivatives',
    slug: 'derivatives',
    title: 'Derivatives',
    chapter: 'Calculus',
  },
  {
    id: 'techniques-product-quotient',
    slug: 'product-quotient',
    title: 'Product & Quotient Rules',
    chapter: 'Calculus',
  },
  {
    id: 'techniques-chain-rule',
    slug: 'chain-rule',
    title: 'The Chain Rule',
    chapter: 'Calculus',
  },
  {
    id: 'calculus-implicit',
    slug: 'implicit-differentiation',
    title: 'Implicit Differentiation',
    chapter: 'Calculus',
  },
  {
    id: 'techniques-related-rates',
    slug: 'related-rates',
    title: 'Related Rates',
    chapter: 'Calculus',
  },
  {
    id: 'calculus-mean-value',
    slug: 'mean-value-theorem',
    title: 'Mean Value Theorem',
    chapter: 'Calculus',
  },
  {
    id: 'calculus-lhopital',
    slug: 'lhopitals-rule',
    title: "L'Hôpital's Rule",
    chapter: 'Calculus',
  },
  {
    id: 'calculus-optimization',
    slug: 'optimization',
    title: 'Optimization',
    chapter: 'Calculus',
  },
  {
    id: 'calculus-integrals',
    slug: 'integrals',
    title: 'Integrals',
    chapter: 'Calculus',
  },
  {
    id: 'calculus-ftc',
    slug: 'fundamental-theorem',
    title: 'Fundamental Theorem',
    chapter: 'Calculus',
  },
  {
    id: 'techniques-u-substitution',
    slug: 'u-substitution',
    title: 'Substitution',
    chapter: 'Calculus',
  },
  {
    id: 'techniques-by-parts',
    slug: 'integration-by-parts',
    title: 'Integration by Parts',
    chapter: 'Calculus',
  },
  {
    id: 'calculus-area-between',
    slug: 'area-between-curves',
    title: 'Area Between Curves',
    chapter: 'Calculus',
  },
  {
    id: 'statistics-kappa',
    slug: 'kappa-inter-rater-reliability',
    title: 'Kappa & Inter-Rater Reliability',
    chapter: 'Statistics',
  },
];

export const availableLessons = lessons.filter((lesson) => lesson.status !== 'soon');

export const firstLesson = availableLessons[0];

const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
const bySlug = new Map(availableLessons.map((lesson) => [lesson.slug, lesson]));
const indexById = new Map(availableLessons.map((lesson, index) => [lesson.id, index]));

const chapters = [];
const chaptersByName = new Map();

for (const lesson of lessons) {
  let chapter = chaptersByName.get(lesson.chapter);

  if (!chapter) {
    chapter = { name: lesson.chapter, Icon: chapterIcons[lesson.chapter] ?? null, lessons: [] };
    chaptersByName.set(lesson.chapter, chapter);
    chapters.push(chapter);
  }

  chapter.lessons.push(lesson);
}

const availableByChapter = new Map(
  chapters.map((chapter) => [chapter.name, chapter.lessons.filter((lesson) => lesson.status !== 'soon')])
);

const positions = new Map();

for (const [chapterName, siblings] of availableByChapter) {
  siblings.forEach((lesson, index) => {
    positions.set(lesson.id, { index: index + 1, total: siblings.length, chapter: chapterName });
  });
}

export function getLessonById(id) {
  return byId.get(id) ?? null;
}

export function getLessonBySlug(slug) {
  if (!slug) return null;
  return bySlug.get(slug) ?? null;
}

export function getChapters() {
  return chapters;
}

export function getPosition(id) {
  return positions.get(id) ?? null;
}

export function getNeighbors(id) {
  const index = indexById.get(id);

  if (index === undefined) return { previous: null, next: null };

  return {
    previous: availableLessons[index - 1] ?? null,
    next: availableLessons[index + 1] ?? null,
  };
}

export function searchLessons(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return null;

  return lessons.filter(
    (lesson) =>
      lesson.title.toLowerCase().includes(needle) || lesson.chapter.toLowerCase().includes(needle)
  );
}

export function getChapterProgress(chapterName, progress) {
  const siblings = availableByChapter.get(chapterName) ?? [];
  let completed = 0;

  for (const lesson of siblings) {
    if (progress[lesson.id]) completed += 1;
  }

  return { completed, total: siblings.length };
}
