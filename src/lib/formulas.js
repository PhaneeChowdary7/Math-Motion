export const limitFormulas = [
  {
    heading: 'Limit laws',
    items: [
      { left: '\\lim_{x \\to a} [\\, f(x) \\pm g(x) \\,]', right: '\\lim_{x \\to a} f(x) \\pm \\lim_{x \\to a} g(x)' },
      { left: '\\lim_{x \\to a} [\\, c \\cdot f(x) \\,]', right: 'c \\cdot \\lim_{x \\to a} f(x)' },
      { left: '\\lim_{x \\to a} [\\, f(x)\\, g(x) \\,]', right: '\\lim_{x \\to a} f(x) \\cdot \\lim_{x \\to a} g(x)' },
      {
        left: '\\lim_{x \\to a} \\dfrac{f(x)}{g(x)}',
        right: '\\dfrac{\\lim f(x)}{\\lim g(x)}, \\quad \\lim g \\neq 0',
      },
      { left: '\\lim_{x \\to a} [\\, f(x) \\,]^n', right: '\\left[\\, \\lim_{x \\to a} f(x) \\,\\right]^n' },
      { left: '\\lim_{x \\to a} c', right: 'c' },
      { left: '\\lim_{x \\to a} x', right: 'a' },
    ],
  },
  {
    heading: 'Standard limits',
    items: [
      {
        left: '\\lim_{x \\to 0} \\dfrac{\\sin x}{x}',
        right: '1',
        check: { kind: 'limit', at: (h) => Math.sin(h) / h, expected: 1 },
      },
      {
        left: '\\lim_{x \\to 0} \\dfrac{1 - \\cos x}{x}',
        right: '0',
        check: { kind: 'limit', at: (h) => (1 - Math.cos(h)) / h, expected: 0 },
      },
      {
        left: '\\lim_{x \\to 0} \\dfrac{e^x - 1}{x}',
        right: '1',
        check: { kind: 'limit', at: (h) => (Math.exp(h) - 1) / h, expected: 1 },
      },
      {
        left: '\\lim_{x \\to \\infty} \\left(1 + \\dfrac{1}{x}\\right)^{x}',
        right: 'e',
        check: { kind: 'limit', at: (h) => (1 + h) ** (1 / h), expected: Math.E },
      },
      {
        left: '\\lim_{x \\to a} \\dfrac{x^n - a^n}{x - a}',
        right: 'n\\, a^{n-1}',
        check: { kind: 'limit', at: (h) => ((2 + h) ** 3 - 8) / h, expected: 12 },
      },
    ],
  },
  {
    heading: 'Continuity at a point',
    items: [
      {
        left: 'f \\text{ continuous at } a',
        rel: '\\iff',
        right: '\\lim_{x \\to a} f(x) = f(a)',
      },
      { left: 'Requires', rel: false, right: 'f(a) \\text{ defined, limit exists, and both agree}' },
      {
        left: 'Squeeze theorem',
        rel: false,
        right: 'g \\le f \\le h,\\; \\lim g = \\lim h = L \\;\\Rightarrow\\; \\lim f = L',
      },
    ],
  },
];

export const derivativeFormulas = [
  {
    heading: 'Rules of differentiation',
    items: [
      { left: '\\dfrac{d}{dx}\\,[\\, c \\,]', right: '0' },
      { left: '\\dfrac{d}{dx}\\,[\\, x^n \\,]', right: 'n\\, x^{n-1}' },
      { left: '\\dfrac{d}{dx}\\,[\\, c\\,f \\,]', right: 'c\\, f\'' },
      { left: '\\dfrac{d}{dx}\\,[\\, f \\pm g \\,]', right: 'f\' \\pm g\'' },
      {
        left: '\\dfrac{d}{dx}\\,[\\, f\\,g \\,]',
        right: 'f\'g + f\\,g\'',
        check: {
          kind: 'derivative',
          f: (x) => x * x * Math.sin(x),
          df: (x) => 2 * x * Math.sin(x) + x * x * Math.cos(x),
        },
      },
      {
        left: '\\dfrac{d}{dx}\\left[\\dfrac{f}{g}\\right]',
        right: '\\dfrac{f\'g - f\\,g\'}{g^2}',
        check: {
          kind: 'derivative',
          f: (x) => Math.sin(x) / (x * x + 2),
          df: (x) => (Math.cos(x) * (x * x + 2) - Math.sin(x) * 2 * x) / (x * x + 2) ** 2,
        },
      },
      {
        left: '\\dfrac{d}{dx}\\,[\\, f(g(x)) \\,]',
        right: 'f\'(g(x)) \\cdot g\'(x)',
        check: {
          kind: 'derivative',
          f: (x) => Math.sin(x * x + 1),
          df: (x) => Math.cos(x * x + 1) * 2 * x,
        },
      },
    ],
  },
  {
    heading: 'Common derivatives',
    items: [
      {
        left: '\\dfrac{d}{dx}\\,[\\, \\sqrt{x} \\,]',
        right: '\\dfrac{1}{2\\sqrt{x}}',
        check: { kind: 'derivative', f: Math.sqrt, df: (x) => 1 / (2 * Math.sqrt(x)), domain: [0.4, 3] },
      },
      {
        left: '\\dfrac{d}{dx}\\left[\\dfrac{1}{x}\\right]',
        right: '-\\dfrac{1}{x^2}',
        check: { kind: 'derivative', f: (x) => 1 / x, df: (x) => -1 / (x * x), domain: [0.4, 3] },
      },
      {
        left: '\\dfrac{d}{dx}\\,[\\, e^x \\,]',
        right: 'e^x',
        check: { kind: 'derivative', f: Math.exp, df: Math.exp },
      },
      {
        left: '\\dfrac{d}{dx}\\,[\\, a^x \\,]',
        right: 'a^x \\ln a',
        check: { kind: 'derivative', f: (x) => 3 ** x, df: (x) => 3 ** x * Math.log(3) },
      },
      {
        left: '\\dfrac{d}{dx}\\,[\\, \\ln x \\,]',
        right: '\\dfrac{1}{x}',
        check: { kind: 'derivative', f: Math.log, df: (x) => 1 / x, domain: [0.4, 3] },
      },
      {
        left: '\\dfrac{d}{dx}\\,[\\, \\sin x \\,]',
        right: '\\cos x',
        check: { kind: 'derivative', f: Math.sin, df: Math.cos },
      },
      {
        left: '\\dfrac{d}{dx}\\,[\\, \\cos x \\,]',
        right: '-\\sin x',
        check: { kind: 'derivative', f: Math.cos, df: (x) => -Math.sin(x) },
      },
      {
        left: '\\dfrac{d}{dx}\\,[\\, \\tan x \\,]',
        right: '\\sec^2 x',
        check: { kind: 'derivative', f: Math.tan, df: (x) => 1 / Math.cos(x) ** 2, domain: [-1, 1] },
      },
      {
        left: '\\dfrac{d}{dx}\\,[\\, \\arcsin x \\,]',
        right: '\\dfrac{1}{\\sqrt{1 - x^2}}',
        check: { kind: 'derivative', f: Math.asin, df: (x) => 1 / Math.sqrt(1 - x * x), domain: [-0.8, 0.8] },
      },
      {
        left: '\\dfrac{d}{dx}\\,[\\, \\arctan x \\,]',
        right: '\\dfrac{1}{1 + x^2}',
        check: { kind: 'derivative', f: Math.atan, df: (x) => 1 / (1 + x * x) },
      },
    ],
  },
  {
    heading: 'What a derivative means',
    items: [
      { left: 'f\'(a)', right: '\\lim_{h \\to 0} \\dfrac{f(a+h) - f(a)}{h}' },
      { left: 'Geometrically', rel: false, right: '\\text{slope of the tangent line at } a' },
      {
        left: 'f\'(a) = 0',
        rel: '\\Rightarrow',
        right: '\\text{a peak, a valley, or a flat bend}',
      },
      { left: 'f\' > 0 \\text{ on an interval}', rel: '\\Rightarrow', right: 'f \\text{ is increasing there}' },
    ],
  },
];

export const integralFormulas = [
  {
    heading: 'Rules of integration',
    items: [
      { left: '\\displaystyle\\int c \\; dx', right: 'c\\,x + C' },
      {
        left: '\\displaystyle\\int x^n \\, dx \\quad (n \\neq -1)',
        right: '\\dfrac{x^{n+1}}{n+1} + C',
        check: { kind: 'integral', integrand: (x) => x ** 4, antiderivative: (x) => x ** 5 / 5 },
      },
      {
        left: '\\displaystyle\\int \\dfrac{1}{x} \\, dx',
        right: '\\ln |x| + C',
        check: {
          kind: 'integral',
          integrand: (x) => 1 / x,
          antiderivative: (x) => Math.log(Math.abs(x)),
          domain: [0.4, 3],
        },
      },
      { left: '\\displaystyle\\int c\\,f(x) \\, dx', right: 'c \\displaystyle\\int f(x) \\, dx' },
      {
        left: '\\displaystyle\\int [\\, f \\pm g \\,] \\, dx',
        right: '\\displaystyle\\int f \\, dx \\pm \\int g \\, dx',
      },
      {
        left: '\\displaystyle\\int f(g(x))\\, g\'(x) \\, dx',
        right: '\\displaystyle\\int f(u) \\, du, \\quad u = g(x)',
      },
      { left: '\\displaystyle\\int u \\, dv', right: 'u\\,v - \\displaystyle\\int v \\, du' },
    ],
  },
  {
    heading: 'Common integrals',
    items: [
      {
        left: '\\displaystyle\\int e^x \\, dx',
        right: 'e^x + C',
        check: { kind: 'integral', integrand: Math.exp, antiderivative: Math.exp },
      },
      {
        left: '\\displaystyle\\int a^x \\, dx',
        right: '\\dfrac{a^x}{\\ln a} + C',
        check: {
          kind: 'integral',
          integrand: (x) => 3 ** x,
          antiderivative: (x) => 3 ** x / Math.log(3),
        },
      },
      {
        left: '\\displaystyle\\int \\sin x \\, dx',
        right: '-\\cos x + C',
        check: { kind: 'integral', integrand: Math.sin, antiderivative: (x) => -Math.cos(x) },
      },
      {
        left: '\\displaystyle\\int \\cos x \\, dx',
        right: '\\sin x + C',
        check: { kind: 'integral', integrand: Math.cos, antiderivative: Math.sin },
      },
      {
        left: '\\displaystyle\\int \\sec^2 x \\, dx',
        right: '\\tan x + C',
        check: {
          kind: 'integral',
          integrand: (x) => 1 / Math.cos(x) ** 2,
          antiderivative: Math.tan,
          domain: [-1, 1],
        },
      },
      {
        left: '\\displaystyle\\int \\ln x \\, dx',
        right: 'x \\ln x - x + C',
        check: {
          kind: 'integral',
          integrand: Math.log,
          antiderivative: (x) => x * Math.log(x) - x,
          domain: [0.4, 3],
        },
      },
      {
        left: '\\displaystyle\\int \\dfrac{dx}{1 + x^2}',
        right: '\\arctan x + C',
        check: { kind: 'integral', integrand: (x) => 1 / (1 + x * x), antiderivative: Math.atan },
      },
      {
        left: '\\displaystyle\\int \\dfrac{dx}{\\sqrt{1 - x^2}}',
        right: '\\arcsin x + C',
        check: {
          kind: 'integral',
          integrand: (x) => 1 / Math.sqrt(1 - x * x),
          antiderivative: Math.asin,
          domain: [-0.8, 0.8],
        },
      },
    ],
  },
  {
    heading: 'Definite integrals',
    items: [
      { left: '\\displaystyle\\int_a^b f(x) \\, dx', right: 'F(b) - F(a), \\quad F\' = f' },
      { left: '\\dfrac{d}{dx} \\displaystyle\\int_a^x f(t) \\, dt', right: 'f(x)' },
      { left: '\\displaystyle\\int_a^a f(x) \\, dx', right: '0' },
      { left: '\\displaystyle\\int_a^b f(x) \\, dx', right: '-\\displaystyle\\int_b^a f(x) \\, dx' },
      {
        left: '\\displaystyle\\int_a^b f + \\int_b^c f',
        right: '\\displaystyle\\int_a^c f(x) \\, dx',
      },
      {
        left: 'Area between curves',
        rel: false,
        right: '\\displaystyle\\int_a^b [\\, \\text{top} - \\text{bottom} \\,] \\, dx',
      },
    ],
  },
];
