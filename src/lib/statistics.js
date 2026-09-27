export const sum = (values) => values.reduce((total, value) => total + value, 0);

export const mean = (values) => (values.length ? sum(values) / values.length : 0);

export function median(values) {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** Population variance by default; pass 1 for the Bessel-corrected sample form. */
export function variance(values, ddof = 0) {
  if (values.length <= ddof) return 0;

  const centre = mean(values);
  return sum(values.map((value) => (value - centre) ** 2)) / (values.length - ddof);
}

export const standardDeviation = (values, ddof = 0) => Math.sqrt(variance(values, ddof));

/** Linear interpolation between order statistics, matching the common convention. */
export function quantile(values, p) {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * p;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);

  if (lower === upper) return sorted[lower];
  return sorted[lower] + (position - lower) * (sorted[upper] - sorted[lower]);
}

export const iqr = (values) => quantile(values, 0.75) - quantile(values, 0.25);

export const normalPdf = (x, mu = 0, sigma = 1) =>
  Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI));

/**
 * Standard normal CDF via the Zelen & Severo rational approximation, formula
 * 26.2.17 in Abramowitz & Stegun, accurate to about 7.5e-8.
 */
export function normalCdf(x, mu = 0, sigma = 1) {
  const z = (x - mu) / sigma;
  const sign = z < 0 ? -1 : 1;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly =
    t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const tail = normalPdf(Math.abs(z)) * poly;

  return sign > 0 ? 1 - tail : tail;
}

export const zScore = (x, mu, sigma) => (x - mu) / sigma;

export const normalBetween = (low, high, mu = 0, sigma = 1) =>
  normalCdf(high, mu, sigma) - normalCdf(low, mu, sigma);

/**
 * Posterior probability of the condition given a positive test, from the base
 * rate, the true-positive rate and the true-negative rate.
 */
export function posterior({ prevalence, sensitivity, specificity }) {
  const truePositive = prevalence * sensitivity;
  const falsePositive = (1 - prevalence) * (1 - specificity);
  const positive = truePositive + falsePositive;

  return {
    truePositive,
    falsePositive,
    falseNegative: prevalence * (1 - sensitivity),
    trueNegative: (1 - prevalence) * specificity,
    positiveRate: positive,
    given: positive > 0 ? truePositive / positive : 0,
  };
}

/** Expectation of a discrete variable given matched outcome and weight lists. */
export function expectation(outcomes, weights) {
  const total = sum(weights);
  if (!total) return 0;
  return sum(outcomes.map((value, index) => value * weights[index])) / total;
}

export function discreteVariance(outcomes, weights) {
  const total = sum(weights);
  if (!total) return 0;

  const centre = expectation(outcomes, weights);
  return sum(outcomes.map((value, index) => weights[index] * (value - centre) ** 2)) / total;
}

export const standardError = (sigma, n) => (n > 0 ? sigma / Math.sqrt(n) : 0);

/** Sample n values from a population with replacement and return the mean. */
export function sampleMean(population, n, rng) {
  let total = 0;
  for (let i = 0; i < n; i += 1) total += population[Math.floor(rng() * population.length)];
  return total / n;
}

/** Bucket values into equal-width bins across [min, max] for a histogram. */
export function histogram(values, bins, [min, max]) {
  const counts = new Array(bins).fill(0);
  const width = (max - min) / bins;

  for (const value of values) {
    if (value < min || value > max) continue;
    const index = Math.min(bins - 1, Math.floor((value - min) / width));
    counts[index] += 1;
  }

  return counts.map((count, index) => ({
    from: min + index * width,
    to: min + (index + 1) * width,
    count,
  }));
}
