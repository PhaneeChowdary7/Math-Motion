export function factorial(n) {
  let total = 1;
  for (let i = 2; i <= n; i += 1) total *= i;
  return total;
}

/** Ordered selections of k from n: n(n-1)...(n-k+1). */
export function permutations(n, k) {
  if (k < 0 || k > n) return 0;
  let total = 1;
  for (let i = 0; i < k; i += 1) total *= n - i;
  return total;
}

/**
 * Unordered selections of k from n. Built multiplicatively and divided as it
 * goes, which keeps every intermediate an exact integer.
 */
export function combinations(n, k) {
  if (k < 0 || k > n) return 0;
  const upper = Math.min(k, n - k);
  let total = 1;
  for (let i = 1; i <= upper; i += 1) total = (total * (n - upper + i)) / i;
  return Math.round(total);
}

export function pascalRow(n) {
  const row = [1];
  for (let k = 1; k <= n; k += 1) row.push(combinations(n, k));
  return row;
}

/** Every ordered arrangement of k items drawn from the list. */
export function listPermutations(items, k) {
  if (k === 0) return [[]];

  const out = [];
  items.forEach((item, index) => {
    const rest = items.filter((value, i) => i !== index);
    for (const tail of listPermutations(rest, k - 1)) out.push([item, ...tail]);
  });

  return out;
}

/** Every unordered selection of k items, in the order the list gives them. */
export function listCombinations(items, k) {
  if (k === 0) return [[]];
  if (k > items.length) return [];

  const out = [];
  for (let i = 0; i <= items.length - k; i += 1) {
    for (const tail of listCombinations(items.slice(i + 1), k - 1)) out.push([items[i], ...tail]);
  }

  return out;
}

/** The fullest any container must be when n items go into m of them. */
export const pigeonholeMinimum = (n, m) => (m > 0 ? Math.ceil(n / m) : 0);

/** Spread n items as evenly as possible across m containers. */
export function spreadEvenly(n, m) {
  const base = Math.floor(n / m);
  const extra = n % m;
  return Array.from({ length: m }, (unused, i) => base + (i < extra ? 1 : 0));
}

export const CONNECTIVES = [
  { id: 'and', label: 'A AND B', symbol: '\\land', apply: (a, b) => a && b },
  { id: 'or', label: 'A OR B', symbol: '\\lor', apply: (a, b) => a || b },
  { id: 'implies', label: 'A implies B', symbol: '\\Rightarrow', apply: (a, b) => !a || b },
  { id: 'iff', label: 'A if and only if B', symbol: '\\Leftrightarrow', apply: (a, b) => a === b },
  { id: 'xor', label: 'A XOR B', symbol: '\\oplus', apply: (a, b) => a !== b },
];

export const getConnective = (id) => CONNECTIVES.find((entry) => entry.id === id) ?? CONNECTIVES[0];

/** The four rows of a two-variable truth table, in standard order. */
export function truthTable(connective) {
  const rows = [];
  for (const a of [true, false]) {
    for (const b of [true, false]) rows.push({ a, b, result: connective.apply(a, b) });
  }
  return rows;
}

export const triangularNumber = (n) => (n * (n + 1)) / 2;
