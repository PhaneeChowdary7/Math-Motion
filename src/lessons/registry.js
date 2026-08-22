import { lazy } from 'react';

const loaders = {
  'fundamentals-numbers': () => import('./fundamentals/NumberSetsLesson.jsx'),
  'fundamentals-plane': () => import('./fundamentals/CoordinatePlaneLesson.jsx'),
  'fundamentals-functions': () => import('./fundamentals/FunctionsLesson.jsx'),
  'fundamentals-lines': () => import('./fundamentals/LinesLesson.jsx'),
  'fundamentals-exponents': () => import('./fundamentals/ExponentsLesson.jsx'),
  'fundamentals-trigonometry': () => import('./fundamentals/TrigonometryLesson.jsx'),
  'fundamentals-sequences': () => import('./fundamentals/SequencesLesson.jsx'),
  'calculus-limits': () => import('./calculus/CalculusLimitLesson.jsx'),
  'calculus-derivatives': () => import('./calculus/DerivativeLesson.jsx'),
  'calculus-mean-value': () => import('./calculus/MeanValueLesson.jsx'),
  'calculus-optimization': () => import('./calculus/OptimizationLesson.jsx'),
  'calculus-integrals': () => import('./calculus/IntegralLesson.jsx'),
  'calculus-ftc': () => import('./calculus/FundamentalTheoremLesson.jsx'),
  'techniques-product-quotient': () => import('./calculus/ProductQuotientLesson.jsx'),
  'techniques-chain-rule': () => import('./calculus/ChainRuleLesson.jsx'),
  'calculus-implicit': () => import('./calculus/ImplicitLesson.jsx'),
  'techniques-related-rates': () => import('./calculus/RelatedRatesLesson.jsx'),
  'calculus-lhopital': () => import('./calculus/LHopitalLesson.jsx'),
  'techniques-u-substitution': () => import('./calculus/USubstitutionLesson.jsx'),
  'techniques-by-parts': () => import('./calculus/ByPartsLesson.jsx'),
  'calculus-area-between': () => import('./calculus/AreaBetweenLesson.jsx'),
  'statistics-kappa': () => import('./statistics/KappaLesson.jsx'),
};

export const lessonLoaders = loaders;

const components = new Map();

export function getLessonComponent(id) {
  if (!loaders[id]) return null;

  if (!components.has(id)) {
    components.set(id, lazy(loaders[id]));
  }

  return components.get(id);
}

export function prefetchLesson(id) {
  loaders[id]?.().catch(() => {
  });
}
