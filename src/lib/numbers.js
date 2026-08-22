export const SIEVE_LIMIT = 100;

export function sieve(limit = SIEVE_LIMIT, rounds = Infinity) {
  const composite = new Array(limit + 1).fill(false);
  const struckBy = new Array(limit + 1).fill(0);
  const drivers = [];

  composite[0] = true;
  composite[1] = true;

  for (let candidate = 2; candidate * candidate <= limit; candidate += 1) {
    if (composite[candidate]) continue;
    if (drivers.length >= rounds) break;

    drivers.push(candidate);

    for (let multiple = candidate * candidate; multiple <= limit; multiple += candidate) {
      if (composite[multiple]) continue;
      composite[multiple] = true;
      struckBy[multiple] = candidate;
    }
  }

  return { composite, struckBy, drivers };
}

export function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;

  for (let divisor = 2; divisor * divisor <= n; divisor += 1) {
    if (n % divisor === 0) return false;
  }

  return true;
}

export function primeFactors(n) {
  if (!Number.isInteger(n) || n < 2) return [];

  const pairs = [];
  let remaining = n;

  for (let divisor = 2; divisor * divisor <= remaining; divisor += 1) {
    let power = 0;

    while (remaining % divisor === 0) {
      remaining /= divisor;
      power += 1;
    }

    if (power) pairs.push([divisor, power]);
  }

  if (remaining > 1) pairs.push([remaining, 1]);

  return pairs;
}

export function factorLatex(n) {
  const pairs = primeFactors(n);
  if (!pairs.length) return String(n);

  return pairs
    .map(([base, power]) => (power === 1 ? String(base) : `${base}^{${power}}`))
    .join(' \\times ');
}

export function divisorsOf(n) {
  const found = [];

  for (let divisor = 1; divisor <= n; divisor += 1) {
    if (n % divisor === 0) found.push(divisor);
  }

  return found;
}
