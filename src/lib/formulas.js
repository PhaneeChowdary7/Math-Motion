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

export const kappaFormulas = [
  {
    heading: 'Cohen’s kappa',
    items: [
      { left: '\\kappa', right: '\\dfrac{p_o - p_e}{1 - p_e}' },
      { left: 'p_o', right: '\\dfrac{a + d}{n}' },
      { left: 'p_e', right: '\\sum_i \\dfrac{\\text{row}_i \\times \\text{col}_i}{n^2}' },
      { left: '\\kappa = 0', rel: '\\Rightarrow', right: '\\text{no better than chance}' },
      { left: '\\kappa = 1', rel: '\\Rightarrow', right: '\\text{every case on the diagonal}' },
    ],
  },
  {
    heading: 'Weighted kappa (ordinal scales)',
    items: [
      { left: '\\kappa_w', right: '1 - \\dfrac{D_o}{D_e}' },
      { left: 'w_{ij} \\text{ (linear)}', right: '\\dfrac{|i - j|}{k - 1}' },
      { left: 'w_{ij} \\text{ (quadratic)}', right: '\\dfrac{(i - j)^2}{(k - 1)^2}' },
      { left: 'Choosing between them', rel: false, right: '\\text{quadratic punishes big gaps harder}' },
    ],
  },
  {
    heading: 'More than two raters',
    items: [
      { left: '\\kappa_{\\text{Fleiss}}', right: '\\dfrac{\\bar{P} - \\bar{P_e}}{1 - \\bar{P_e}}' },
      { left: '\\kappa_{\\text{Light}}', right: '\\dfrac{1}{m} \\sum_{\\text{pairs}} \\kappa_{\\text{Cohen}}' },
      { left: '\\kappa_{\\text{Conger}}', right: '\\dfrac{p_o - \\bar{p_e}}{1 - \\bar{p_e}}' },
      { left: 'Pairs from r raters', rel: false, right: 'm = \\dfrac{r\\,(r - 1)}{2}' },
    ],
  },
  {
    heading: 'When one category dominates',
    items: [
      { left: '\\text{PABAK}', right: '2 p_o - 1' },
      { left: '\\text{high } p_o \\text{, low } \\kappa', rel: '\\Rightarrow', right: '\\text{the prevalence paradox}' },
    ],
  },
];

export const numberFormulas = [
  {
    heading: 'Number sets',
    items: [
      { left: '\\mathbb{N}', right: '\\{1, 2, 3, \\ldots\\} \\text{ the natural numbers}' },
      { left: '\\mathbb{Z}', right: '\\{\\ldots, -1, 0, 1, \\ldots\\} \\text{ the integers}' },
      { left: '\\mathbb{Q}', right: '\\left\\{ \\tfrac{a}{b} : a, b \\in \\mathbb{Z},\\; b \\neq 0 \\right\\}' },
      { left: '\\mathbb{R}', right: '\\text{every point on the number line}' },
      { left: '\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q}', rel: '\\subset', right: '\\mathbb{R}' },
    ],
  },
  {
    heading: 'Primes and factors',
    items: [
      { left: 'n \\text{ is prime}', rel: '\\iff', right: '\\text{exactly two divisors: } 1 \\text{ and } n' },
      { left: 'n', right: 'p_1^{a_1} p_2^{a_2} \\cdots p_k^{a_k}' },
      { left: '360', right: '2^3 \\times 3^2 \\times 5' },
      { left: 'Trial division stops at', rel: false, right: '\\sqrt{n}' },
    ],
  },
];

export const planeFormulas = [
  {
    heading: 'Points and distance',
    items: [
      { left: 'd', right: '\\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}' },
      { left: 'M', right: '\\left( \\dfrac{x_1 + x_2}{2}, \\; \\dfrac{y_1 + y_2}{2} \\right)' },
      { left: 'Quadrant I', rel: false, right: 'x > 0,\\; y > 0' },
      { left: 'Quadrant II', rel: false, right: 'x < 0,\\; y > 0' },
      { left: 'Quadrant III', rel: false, right: 'x < 0,\\; y < 0' },
      { left: 'Quadrant IV', rel: false, right: 'x > 0,\\; y < 0' },
    ],
  },
  {
    heading: 'Lines',
    items: [
      { left: 'm', right: '\\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{\\Delta y}{\\Delta x}' },
      { left: 'Slope-intercept form', rel: false, right: 'y = mx + c' },
      { left: 'Point-slope form', rel: false, right: 'y - y_1 = m(x - x_1)' },
      { left: '\\text{Parallel}', rel: '\\Rightarrow', right: 'm_1 = m_2' },
      { left: '\\text{Perpendicular}', rel: '\\Rightarrow', right: 'm_1 m_2 = -1' },
    ],
  },
];

export const trigFormulas = [
  {
    heading: 'On the unit circle',
    items: [
      { left: '\\cos\\theta', right: '\\text{the horizontal coordinate}' },
      { left: '\\sin\\theta', right: '\\text{the vertical coordinate}' },
      { left: '\\sin^2\\theta + \\cos^2\\theta', right: '1' },
      { left: '\\tan\\theta', right: '\\dfrac{\\sin\\theta}{\\cos\\theta}' },
    ],
  },
  {
    heading: 'Exact values',
    items: [
      { left: '\\sin 0,\\; \\cos 0', right: '0,\\; 1' },
      { left: '\\sin \\tfrac{\\pi}{6},\\; \\cos \\tfrac{\\pi}{6}', right: '\\tfrac{1}{2},\\; \\tfrac{\\sqrt{3}}{2}' },
      { left: '\\sin \\tfrac{\\pi}{4},\\; \\cos \\tfrac{\\pi}{4}', right: '\\tfrac{\\sqrt{2}}{2},\\; \\tfrac{\\sqrt{2}}{2}' },
      { left: '\\sin \\tfrac{\\pi}{3},\\; \\cos \\tfrac{\\pi}{3}', right: '\\tfrac{\\sqrt{3}}{2},\\; \\tfrac{1}{2}' },
      { left: '\\sin \\tfrac{\\pi}{2},\\; \\cos \\tfrac{\\pi}{2}', right: '1,\\; 0' },
    ],
  },
  {
    heading: 'Shape of the waves',
    items: [
      { left: 'Period', rel: false, right: '2\\pi \\text{ for both } \\sin \\text{ and } \\cos' },
      { left: 'Range', rel: false, right: '-1 \\le y \\le 1' },
      { left: '\\cos\\theta', right: '\\sin\\left(\\theta + \\tfrac{\\pi}{2}\\right)' },
      { left: 'y = a\\sin(b\\theta)', rel: '\\Rightarrow', right: '\\text{amplitude } |a|, \\text{ period } \\tfrac{2\\pi}{|b|}' },
    ],
  },
];

export const functionFormulas = [
  {
    heading: 'Definitions',
    items: [
      { left: 'f : X \\to Y', rel: '\\Rightarrow', right: '\\text{one output for each input}' },
      { left: 'Domain', rel: false, right: '\\text{the inputs that are allowed}' },
      { left: 'Range', rel: false, right: '\\text{the outputs actually reached}' },
      { left: '\\text{Vertical line test}', rel: '\\Rightarrow', right: '\\text{a graph is a function}' },
    ],
  },
  {
    heading: 'Symmetry',
    items: [
      { left: 'f(-x) = f(x)', rel: '\\Rightarrow', right: '\\text{even, mirrored in the } y \\text{-axis}' },
      { left: 'f(-x) = -f(x)', rel: '\\Rightarrow', right: '\\text{odd, rotated about the origin}' },
    ],
  },
];

export const exponentFormulas = [
  {
    heading: 'Index laws',
    items: [
      { left: 'b^m \\times b^n', right: 'b^{m+n}' },
      { left: '\\dfrac{b^m}{b^n}', right: 'b^{m-n}' },
      { left: '(b^m)^n', right: 'b^{mn}' },
      { left: 'b^0', right: '1' },
      { left: 'b^{-n}', right: '\\dfrac{1}{b^n}' },
      { left: 'b^{1/n}', right: '\\sqrt[n]{b}' },
    ],
  },
  {
    heading: 'Logarithms',
    items: [
      { left: 'b^y = x', rel: '\\iff', right: '\\log_b x = y' },
      { left: '\\log_b(mn)', right: '\\log_b m + \\log_b n' },
      { left: '\\log_b\\!\\left(\\dfrac{m}{n}\\right)', right: '\\log_b m - \\log_b n' },
      { left: '\\log_b(m^k)', right: 'k \\log_b m' },
      { left: '\\log_b 1', right: '0' },
      { left: 'Change of base', rel: false, right: '\\log_b x = \\dfrac{\\ln x}{\\ln b}' },
    ],
  },
  {
    heading: 'The natural base',
    items: [
      { left: 'e', right: '2.71828\\ldots' },
      { left: '\\ln x', right: '\\log_e x' },
      { left: 'Domain of a logarithm', rel: false, right: 'x > 0' },
    ],
  },
];

export const sequenceFormulas = [
  {
    heading: 'Arithmetic',
    items: [
      { left: 'a_n', right: 'a_1 + (n - 1)d' },
      { left: 'd', right: 'a_{n+1} - a_n' },
      { left: 'S_n', right: '\\dfrac{n}{2}\\left[\\,2a_1 + (n-1)d\\,\\right]' },
      { left: 'S_n', right: '\\dfrac{n}{2}(a_1 + a_n)' },
    ],
  },
  {
    heading: 'Geometric',
    items: [
      { left: 'a_n', right: 'a_1 r^{\\,n-1}' },
      { left: 'r', right: '\\dfrac{a_{n+1}}{a_n}' },
      { left: 'S_n', right: 'a_1 \\dfrac{1 - r^n}{1 - r}, \\quad r \\neq 1' },
      { left: 'S_\\infty', right: '\\dfrac{a_1}{1 - r}, \\quad |r| < 1' },
    ],
  },
  {
    heading: 'Convergence',
    items: [
      { left: '|r| < 1', rel: '\\Rightarrow', right: '\\text{the geometric series converges}' },
      { left: '|r| \\ge 1', rel: '\\Rightarrow', right: '\\text{it grows without bound}' },
      { left: 'a_n \\to 0', rel: '\\;\\not\\Rightarrow\\;', right: '\\textstyle\\sum a_n \\text{ converges}' },
      { left: 'Harmonic series', rel: false, right: '\\textstyle\\sum \\frac{1}{n} \\text{ diverges}' },
    ],
  },
];
