import { lazy } from 'react';

const loaders = {
  'calculus-limits': () => import('./calculus/CalculusLimitLesson.jsx'),
  'calculus-derivatives': () => import('./calculus/DerivativeLesson.jsx'),
  'calculus-mean-value': () => import('./calculus/MeanValueLesson.jsx'),
  'calculus-optimization': () => import('./calculus/OptimizationLesson.jsx'),
  'calculus-integrals': () => import('./calculus/IntegralLesson.jsx'),
  'calculus-ftc': () => import('./calculus/FundamentalTheoremLesson.jsx'),
  'techniques-product-quotient': () => import('./techniques/ProductQuotientLesson.jsx'),
  'techniques-chain-rule': () => import('./techniques/ChainRuleLesson.jsx'),
  'techniques-related-rates': () => import('./techniques/RelatedRatesLesson.jsx'),
  'techniques-u-substitution': () => import('./techniques/USubstitutionLesson.jsx'),
  'techniques-by-parts': () => import('./techniques/ByPartsLesson.jsx'),
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
