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
      { left: '\\displaystyle\\int_a^a f(x) \\, dx', right: '0' },
      { left: '\\displaystyle\\int_a^b f(x) \\, dx', right: '-\\displaystyle\\int_b^a f(x) \\, dx' },
      {
        left: '\\displaystyle\\int_a^b f + \\int_b^c f',
        right: '\\displaystyle\\int_a^c f(x) \\, dx',
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

export const vectorFormulas = [
  {
    heading: 'Vectors',
    items: [
      { left: '\\mathbf{v}', right: '\\begin{pmatrix} v_1 \\\\ v_2 \\end{pmatrix}' },
      { left: '\\mathbf{v} + \\mathbf{w}', right: '\\begin{pmatrix} v_1 + w_1 \\\\ v_2 + w_2 \\end{pmatrix}' },
      { left: 'a\\mathbf{v}', right: '\\begin{pmatrix} a v_1 \\\\ a v_2 \\end{pmatrix}' },
      { left: '\\lVert \\mathbf{v} \\rVert', right: '\\sqrt{v_1^2 + v_2^2}' },
      { left: '\\mathbf{v} \\cdot \\mathbf{w}', right: 'v_1 w_1 + v_2 w_2' },
    ],
  },
  {
    heading: 'Span and independence',
    items: [
      { left: '\\operatorname{span}\\{\\mathbf{v}, \\mathbf{w}\\}', right: '\\{\\, a\\mathbf{v} + b\\mathbf{w} \\;:\\; a, b \\in \\mathbb{R} \\,\\}' },
      { left: 'v_1 w_2 - v_2 w_1 \\neq 0', right: '\\text{independent, spans the plane}', rel: '\\Rightarrow' },
      { left: 'v_1 w_2 - v_2 w_1 = 0', right: '\\text{parallel, spans a line}', rel: '\\Rightarrow' },
      { left: '\\mathbf{0}', right: '\\text{lies in every span}', rel: '\\in' },
    ],
  },
  {
    heading: 'What the pieces mean',
    items: [
      { left: 'A vector', right: 'a displacement: how far across, then how far up', rel: false },
      { left: 'Scaling', right: 'stretch, shrink, or flip through the origin', rel: false },
      { left: 'Span', right: 'every point some combination can reach', rel: false },
    ],
  },
];

export const matrixFormulas = [
  {
    heading: 'Matrices as maps',
    items: [
      { left: 'A', right: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
      { left: 'A\\hat{\\imath}', right: '\\begin{pmatrix} a \\\\ c \\end{pmatrix}' },
      { left: 'A\\hat{\\jmath}', right: '\\begin{pmatrix} b \\\\ d \\end{pmatrix}' },
      { left: 'A\\mathbf{v}', right: '\\begin{pmatrix} ax + by \\\\ cx + dy \\end{pmatrix}' },
      { left: '\\det A', right: 'ad - bc' },
    ],
  },
  {
    heading: 'Linearity',
    items: [
      { left: 'T(a\\mathbf{v} + b\\mathbf{w})', right: 'aT(\\mathbf{v}) + bT(\\mathbf{w})' },
      { left: 'T(\\mathbf{0})', right: '\\mathbf{0}' },
      { left: 'A^{-1}', right: '\\dfrac{1}{ad - bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}' },
      { left: '\\det A = 0', right: '\\text{no inverse exists}', rel: '\\Rightarrow' },
    ],
  },
  {
    heading: 'What survives a linear map',
    items: [
      { left: 'Straight lines', right: 'stay straight', rel: false },
      { left: 'Parallel lines', right: 'stay parallel', rel: false },
      { left: 'Even spacing', right: 'stays even', rel: false },
      { left: 'The origin', right: 'never moves', rel: false },
    ],
  },
];

export const systemFormulas = [
  {
    heading: 'A 2×2 system',
    items: [
      { left: 'a_1 x + b_1 y', right: 'c_1' },
      { left: 'a_2 x + b_2 y', right: 'c_2' },
      { left: 'A\\mathbf{x}', right: '\\mathbf{b}' },
      { left: '\\det', right: 'a_1 b_2 - a_2 b_1' },
    ],
  },
  {
    heading: 'The three outcomes',
    items: [
      { left: '\\det \\neq 0', right: '\\text{lines cross once: one solution}', rel: '\\Rightarrow' },
      { left: '\\det = 0', right: '\\text{lines parallel: none or infinitely many}', rel: '\\Rightarrow' },
      { left: '\\mathbf{x}', right: 'A^{-1}\\mathbf{b} \\quad (\\det A \\neq 0)' },
    ],
  },
  {
    heading: "Cramer's rule",
    items: [
      { left: 'x', right: '\\dfrac{c_1 b_2 - b_1 c_2}{a_1 b_2 - a_2 b_1}' },
      { left: 'y', right: '\\dfrac{a_1 c_2 - c_1 a_2}{a_1 b_2 - a_2 b_1}' },
      { left: 'Zero determinant', right: 'the rule does not apply', rel: false },
    ],
  },
];

export const determinantFormulas = [
  {
    heading: 'Determinant',
    items: [
      { left: '\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', right: 'ad - bc' },
      { left: '|\\det A|', right: '\\text{area of the parallelogram}' },
      { left: '\\det(\\mathbf{w}, \\mathbf{v})', right: '-\\det(\\mathbf{v}, \\mathbf{w})' },
      { left: '\\det(AB)', right: '\\det(A)\\,\\det(B)' },
      { left: '\\det(A^{-1})', right: '\\dfrac{1}{\\det A}' },
    ],
  },
  {
    heading: 'What the sign means',
    items: [
      { left: '\\det > 0', right: '\\text{orientation preserved}', rel: '\\Rightarrow' },
      { left: '\\det < 0', right: '\\text{the plane is reflected}', rel: '\\Rightarrow' },
      { left: '\\det = 0', right: '\\text{squashed flat, no inverse}', rel: '\\Rightarrow' },
    ],
  },
  {
    heading: 'One collapse, three names',
    items: [
      { left: 'Span', right: 'drops from a plane to a line', rel: false },
      { left: 'System', right: 'loses its unique solution', rel: false },
      { left: 'Matrix', right: 'loses its inverse', rel: false },
    ],
  },
];

export const eigenFormulas = [
  {
    heading: 'Eigenvalues and eigenvectors',
    items: [
      { left: 'A\\mathbf{v}', right: '\\lambda \\mathbf{v}, \\quad \\mathbf{v} \\neq \\mathbf{0}' },
      { left: '\\det(A - \\lambda I)', right: '0' },
      { left: '\\lambda^2 - (a+d)\\lambda + (ad - bc)', right: '0' },
      { left: '\\lambda_1 + \\lambda_2', right: 'a + d = \\operatorname{tr} A' },
      { left: '\\lambda_1 \\lambda_2', right: 'ad - bc = \\det A' },
    ],
  },
  {
    heading: 'Reading the eigenvalue',
    items: [
      { left: '|\\lambda| > 1', right: '\\text{stretches along its own line}', rel: '\\Rightarrow' },
      { left: '0 < |\\lambda| < 1', right: '\\text{compresses toward the origin}', rel: '\\Rightarrow' },
      { left: '\\lambda < 0', right: '\\text{reverses the direction}', rel: '\\Rightarrow' },
      { left: '\\lambda = 0', right: '\\text{collapses the line to a point}', rel: '\\Rightarrow' },
    ],
  },
  {
    heading: 'When none are real',
    items: [
      { left: 'Discriminant', right: '(a+d)^2 - 4(ad - bc)' },
      { left: 'Negative discriminant', right: 'no invariant direction in the plane', rel: false },
      { left: 'A rotation', right: 'turns every direction, so has none', rel: false },
    ],
  },
];

export const describeFormulas = [
  {
    heading: 'Centre',
    items: [
      { left: '\\bar{x}', right: '\\dfrac{1}{n}\\sum_{i=1}^{n} x_i' },
      { left: '\\tilde{x}', right: '\\text{middle value of the sorted data}' },
      { left: '\\text{Even } n', right: '\\text{average the two middle values}', rel: false },
    ],
  },
  {
    heading: 'Spread',
    items: [
      { left: '\\sigma^2', right: '\\dfrac{1}{n}\\sum_{i=1}^{n}(x_i - \\bar{x})^2' },
      { left: '\\sigma', right: '\\sqrt{\\sigma^2}' },
      { left: 's^2', right: '\\dfrac{1}{n-1}\\sum_{i=1}^{n}(x_i - \\bar{x})^2' },
      { left: '\\text{IQR}', right: 'Q_3 - Q_1' },
      { left: '\\text{Range}', right: 'x_{\\max} - x_{\\min}' },
    ],
  },
  {
    heading: 'Which to report',
    items: [
      { left: 'Symmetric data', right: 'mean with standard deviation', rel: false },
      { left: 'Long tail', right: 'median with interquartile range', rel: false },
      { left: 'Centre alone', right: 'never enough on its own', rel: false },
    ],
  },
];

export const probabilityFormulas = [
  {
    heading: 'Basic rules',
    items: [
      { left: '0 \\le P(A)', right: '1', rel: '\\le' },
      { left: 'P(\\text{sample space})', right: '1' },
      { left: "P(A^{c})", right: '1 - P(A)' },
      { left: 'P(A \\cup B)', right: 'P(A) + P(B) - P(A \\cap B)' },
    ],
  },
  {
    heading: 'Independence',
    items: [
      { left: 'P(A \\cap B)', right: 'P(A)\\,P(B)' },
      { left: 'P(A \\cap B) = 0', right: '\\text{mutually exclusive}', rel: '\\Rightarrow' },
      { left: '\\text{Exclusive and positive}', right: '\\text{never independent}', rel: '\\Rightarrow' },
    ],
  },
  {
    heading: 'Reading the square',
    items: [
      { left: 'Area of the square', right: '1, the certain outcome', rel: false },
      { left: 'Area of a region', right: 'the probability of that event', rel: false },
      { left: 'Overlapping area', right: 'both events together', rel: false },
    ],
  },
];

export const bayesFormulas = [
  {
    heading: 'Conditional probability',
    items: [
      { left: 'P(A \\mid B)', right: '\\dfrac{P(A \\cap B)}{P(B)}' },
      { left: 'P(A \\cap B)', right: 'P(A \\mid B)\\,P(B)' },
      { left: 'P(A \\mid B)', right: 'P(A) \\text{ when independent}' },
    ],
  },
  {
    heading: "Bayes' theorem",
    items: [
      { left: 'P(A \\mid B)', right: '\\dfrac{P(B \\mid A)\\,P(A)}{P(B)}' },
      { left: 'P(B)', right: 'P(B \\mid A)P(A) + P(B \\mid A^{c})P(A^{c})' },
      { left: 'P(D \\mid +)', right: '\\dfrac{\\text{sens}\\cdot\\text{prev}}{\\text{sens}\\cdot\\text{prev} + (1-\\text{spec})(1-\\text{prev})}' },
    ],
  },
  {
    heading: 'Reading a test',
    items: [
      { left: 'Sensitivity', right: 'share of affected people it catches', rel: false },
      { left: 'Specificity', right: 'share of healthy people it clears', rel: false },
      { left: 'Prevalence', right: 'how common the condition is', rel: false },
      { left: 'Rare condition', right: 'false positives dominate', rel: false },
    ],
  },
];

export const expectationFormulas = [
  {
    heading: 'Expectation',
    items: [
      { left: 'E[X]', right: '\\sum_i x_i\\, p_i' },
      { left: 'E[aX + b]', right: 'aE[X] + b' },
      { left: 'E[X + Y]', right: 'E[X] + E[Y]' },
      { left: '\\sum_i p_i', right: '1' },
    ],
  },
  {
    heading: 'Variance',
    items: [
      { left: '\\operatorname{Var}(X)', right: '\\sum_i p_i (x_i - E[X])^2' },
      { left: '\\operatorname{Var}(X)', right: 'E[X^2] - (E[X])^2' },
      { left: '\\operatorname{Var}(aX + b)', right: 'a^2 \\operatorname{Var}(X)' },
      { left: '\\sigma', right: '\\sqrt{\\operatorname{Var}(X)}' },
    ],
  },
  {
    heading: 'Reading the two together',
    items: [
      { left: 'Expectation', right: 'the long-run average', rel: false },
      { left: 'Variance', right: 'how far results stray from it', rel: false },
      { left: 'Equal means', right: 'can hide very unequal risk', rel: false },
    ],
  },
];

export const normalFormulas = [
  {
    heading: 'Densities',
    items: [
      { left: 'P(a \\le X \\le b)', right: '\\displaystyle\\int_a^b f(x)\\, dx' },
      { left: '\\displaystyle\\int_{-\\infty}^{\\infty} f(x)\\, dx', right: '1' },
      { left: 'P(X = a)', right: '0 \\text{ for a continuous } X' },
    ],
  },
  {
    heading: 'The normal distribution',
    items: [
      { left: 'f(x)', right: '\\dfrac{1}{\\sigma\\sqrt{2\\pi}}\\, e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}' },
      { left: 'z', right: '\\dfrac{x - \\mu}{\\sigma}' },
      { left: 'P(|X - \\mu| < \\sigma)', right: '\\approx 0.68' },
      { left: 'P(|X - \\mu| < 2\\sigma)', right: '\\approx 0.95' },
      { left: 'P(|X - \\mu| < 3\\sigma)', right: '\\approx 0.997' },
    ],
  },
  {
    heading: 'Reading the curve',
    items: [
      { left: '\\mu', right: 'where the curve is centred', rel: false },
      { left: '\\sigma', right: 'how wide it spreads', rel: false },
      { left: 'Fixed total area', right: 'wider means flatter', rel: false },
      { left: 'Skewed data', right: 'the normal understates the tails', rel: false },
    ],
  },
];

export const samplingFormulas = [
  {
    heading: 'The sample mean',
    items: [
      { left: 'E[\\bar{X}]', right: '\\mu' },
      { left: '\\operatorname{SE}(\\bar{X})', right: '\\dfrac{\\sigma}{\\sqrt{n}}' },
      { left: '\\bar{X}', right: 'N\\!\\left(\\mu, \\dfrac{\\sigma^2}{n}\\right) \\text{ for large } n', rel: '\\to' },
    ],
  },
  {
    heading: 'Intervals and proportions',
    items: [
      { left: '\\text{95\\% interval}', right: '\\bar{x} \\pm 1.96\\,\\dfrac{\\sigma}{\\sqrt{n}}' },
      { left: '\\operatorname{SE}(\\hat{p})', right: '\\sqrt{\\dfrac{p(1-p)}{n}}' },
      { left: '\\text{Margin of error}', right: '1.96 \\times \\operatorname{SE}' },
    ],
  },
  {
    heading: 'What the theorem does and does not say',
    items: [
      { left: 'The sample mean', right: 'becomes normal as n grows', rel: false },
      { left: 'The population', right: 'never changes shape', rel: false },
      { left: 'Halving the error', right: 'costs four times the sample', rel: false },
      { left: 'Population size', right: 'does not enter the formula', rel: false },
    ],
  },
];

export const countingFormulas = [
  {
    heading: 'The two principles',
    items: [
      { left: 'N', right: 'n_1 \\times n_2 \\times \\cdots \\times n_k' },
      { left: '|A \\cup B|', right: '|A| + |B| \\text{ when disjoint}' },
      { left: '|A \\cup B|', right: '|A| + |B| - |A \\cap B| \\text{ in general}' },
    ],
  },
  {
    heading: 'Sequences of length k from n',
    items: [
      { left: '\\text{With repetition}', right: 'n^k' },
      { left: '\\text{Without repetition}', right: 'n(n-1)\\cdots(n-k+1)' },
      { left: '\\text{All of them}', right: 'n!' },
    ],
  },
  {
    heading: 'Choosing the right rule',
    items: [
      { left: 'One from each stage', right: 'multiply', rel: false },
      { left: 'One from disjoint groups', right: 'add', rel: false },
      { left: 'Groups that overlap', right: 'add, then subtract the overlap', rel: false },
    ],
  },
];

export const combinationFormulas = [
  {
    heading: 'The two counts',
    items: [
      { left: 'P(n, k)', right: '\\dfrac{n!}{(n-k)!}' },
      { left: '\\binom{n}{k}', right: '\\dfrac{n!}{k!\\,(n-k)!}' },
      { left: 'P(n, k)', right: '\\binom{n}{k} \\cdot k!' },
      { left: 'P(n, n)', right: 'n!' },
    ],
  },
  {
    heading: 'Identities',
    items: [
      { left: '\\binom{n}{k}', right: '\\binom{n}{n-k}' },
      { left: '\\binom{n}{k}', right: '\\binom{n-1}{k-1} + \\binom{n-1}{k}' },
      { left: '\\displaystyle\\sum_{k=0}^{n} \\binom{n}{k}', right: '2^n' },
      { left: '\\binom{n}{0} = \\binom{n}{n}', right: '1' },
    ],
  },
  {
    heading: 'Which one applies',
    items: [
      { left: 'Order matters', right: 'permutation', rel: false },
      { left: 'Order does not', right: 'combination', rel: false },
      { left: 'Repetition allowed', right: 'neither formula applies unchanged', rel: false },
    ],
  },
];

export const pigeonholeFormulas = [
  {
    heading: 'The principle',
    items: [
      { left: 'n \\text{ into } m', right: '\\text{some box holds} \\ge \\left\\lceil n/m \\right\\rceil', rel: '\\Rightarrow' },
      { left: 'n > m', right: '\\text{some box holds at least } 2', rel: '\\Rightarrow' },
      { left: 'n > km', right: '\\text{some box holds at least } k+1', rel: '\\Rightarrow' },
    ],
  },
  {
    heading: 'Why the bound holds',
    items: [
      { left: '\\text{Suppose every box} < \\lceil n/m \\rceil', right: '\\text{the total falls short of } n', rel: '\\Rightarrow' },
      { left: '\\text{Contradiction}', right: '\\text{so some box reaches the bound}', rel: '\\Rightarrow' },
    ],
  },
  {
    heading: 'What it does and does not give',
    items: [
      { left: 'Gives', right: 'that an overfull box exists', rel: false },
      { left: 'Does not give', right: 'which box, or by how much', rel: false },
      { left: 'Holds for', right: 'every arrangement, not just typical ones', rel: false },
    ],
  },
];

export const logicFormulas = [
  {
    heading: 'Connectives',
    items: [
      { left: 'A \\land B', right: '\\text{true only when both are}' },
      { left: 'A \\lor B', right: '\\text{true unless both are false}' },
      { left: 'A \\Rightarrow B', right: '\\text{false only when } A=T,\\; B=F' },
      { left: 'A \\Leftrightarrow B', right: '\\text{true when they agree}' },
    ],
  },
  {
    heading: 'Related implications',
    items: [
      { left: '\\text{Contrapositive}', right: '\\lnot B \\Rightarrow \\lnot A \\;\\; \\text{(equivalent)}' },
      { left: '\\text{Converse}', right: 'B \\Rightarrow A \\;\\; \\text{(not equivalent)}' },
      { left: '\\text{Inverse}', right: '\\lnot A \\Rightarrow \\lnot B \\;\\; \\text{(not equivalent)}' },
      { left: 'A \\Rightarrow B', right: '\\lnot A \\lor B' },
    ],
  },
  {
    heading: 'Quantifiers',
    items: [
      { left: '\\lnot \\forall x\\, P(x)', right: '\\exists x\\, \\lnot P(x)' },
      { left: '\\lnot \\exists x\\, P(x)', right: '\\forall x\\, \\lnot P(x)' },
      { left: '\\lnot (A \\land B)', right: '\\lnot A \\lor \\lnot B' },
      { left: '\\lnot (A \\lor B)', right: '\\lnot A \\land \\lnot B' },
    ],
  },
];

export const inductionFormulas = [
  {
    heading: 'The method',
    items: [
      { left: '\\text{Base case}', right: 'P(n_0) \\text{ is true}' },
      { left: '\\text{Inductive step}', right: 'P(k) \\Rightarrow P(k+1)' },
      { left: '\\text{Conclusion}', right: 'P(n) \\text{ for all } n \\ge n_0' },
    ],
  },
  {
    heading: 'Standard results',
    items: [
      { left: '1 + 2 + \\cdots + n', right: '\\dfrac{n(n+1)}{2}' },
      { left: '1 + 3 + \\cdots + (2n-1)', right: 'n^2' },
      { left: '1^2 + 2^2 + \\cdots + n^2', right: '\\dfrac{n(n+1)(2n+1)}{6}' },
      { left: '2^0 + 2^1 + \\cdots + 2^{n}', right: '2^{n+1} - 1' },
    ],
  },
  {
    heading: 'Common errors',
    items: [
      { left: 'No base case', right: 'the chain never starts', rel: false },
      { left: 'Assuming all n', right: 'circular, not induction', rel: false },
      { left: 'Checking many cases', right: 'evidence, not proof', rel: false },
    ],
  },
];

export const algebraFormulas = [
  {
    heading: 'Square identities',
    items: [
      { left: '(a + b)^2', right: 'a^2 + 2ab + b^2' },
      { left: '(a - b)^2', right: 'a^2 - 2ab + b^2' },
      { left: 'a^2 - b^2', right: '(a + b)(a - b)' },
      { left: '(a + b)^2 - (a - b)^2', right: '4ab' },
      { left: '(a + b)^2 + (a - b)^2', right: '2(a^2 + b^2)' },
      { left: 'a^2 + b^2', right: '(a + b)^2 - 2ab' },
      { left: '(a + b + c)^2', right: 'a^2 + b^2 + c^2 + 2ab + 2bc + 2ca' },
      { left: '(x + a)(x + b)', right: 'x^2 + (a + b)x + ab' },
    ],
  },
  {
    heading: 'Cube identities',
    items: [
      { left: '(a + b)^3', right: 'a^3 + 3a^2b + 3ab^2 + b^3' },
      { left: '(a + b)^3', right: 'a^3 + b^3 + 3ab(a + b)' },
      { left: '(a - b)^3', right: 'a^3 - 3a^2b + 3ab^2 - b^3' },
      { left: 'a^3 + b^3', right: '(a + b)(a^2 - ab + b^2)' },
      { left: 'a^3 - b^3', right: '(a - b)(a^2 + ab + b^2)' },
      {
        left: 'a^3 + b^3 + c^3 - 3abc',
        right: '(a + b + c)(a^2 + b^2 + c^2 - ab - bc - ca)',
      },
      { left: 'a + b + c = 0', rel: '\\Rightarrow', right: 'a^3 + b^3 + c^3 = 3abc' },
    ],
  },
  {
    heading: 'Quadratic equations',
    items: [
      { left: 'ax^2 + bx + c = 0', rel: '\\Rightarrow', right: 'x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
      { left: 'D', right: 'b^2 - 4ac' },
      { left: 'D > 0,\\; D = 0,\\; D < 0', rel: '\\Rightarrow', right: '\\text{two, one, no real roots}' },
      { left: '\\alpha + \\beta', right: '-\\dfrac{b}{a}' },
      { left: '\\alpha\\beta', right: '\\dfrac{c}{a}' },
      { left: 'Vertex', rel: false, right: 'x = -\\dfrac{b}{2a}' },
    ],
  },
  {
    heading: 'Binomial theorem',
    items: [
      { left: '(a + b)^n', right: '\\textstyle\\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k' },
      { left: 'T_{k+1}', right: '\\binom{n}{k} a^{n-k} b^k \\quad \\text{(general term)}' },
      { left: '(1 + x)^n', right: '1 + nx + \\dfrac{n(n-1)}{2!}x^2 + \\cdots' },
    ],
  },
];

export const trigIdentityFormulas = [
  {
    heading: 'Ratios in a right triangle',
    items: [
      { left: '\\sin\\theta', right: '\\dfrac{\\text{opposite}}{\\text{hypotenuse}}' },
      { left: '\\cos\\theta', right: '\\dfrac{\\text{adjacent}}{\\text{hypotenuse}}' },
      { left: '\\tan\\theta', right: '\\dfrac{\\text{opposite}}{\\text{adjacent}}' },
      { left: '\\csc\\theta', right: '\\dfrac{1}{\\sin\\theta}' },
      { left: '\\sec\\theta', right: '\\dfrac{1}{\\cos\\theta}' },
      { left: '\\cot\\theta', right: '\\dfrac{1}{\\tan\\theta} = \\dfrac{\\cos\\theta}{\\sin\\theta}' },
    ],
  },
  {
    heading: 'Pythagorean identities',
    items: [
      { left: '1 + \\tan^2\\theta', right: '\\sec^2\\theta' },
      { left: '1 + \\cot^2\\theta', right: '\\csc^2\\theta' },
    ],
  },
  {
    heading: 'Tangent at standard angles',
    items: [
      { left: '\\tan 0,\\; \\tan \\tfrac{\\pi}{6}', right: '0,\\; \\tfrac{1}{\\sqrt{3}}' },
      { left: '\\tan \\tfrac{\\pi}{4},\\; \\tan \\tfrac{\\pi}{3}', right: '1,\\; \\sqrt{3}' },
      { left: '\\tan \\tfrac{\\pi}{2}', right: '\\text{undefined}' },
    ],
  },
  {
    heading: 'Negative and complementary angles',
    items: [
      { left: '\\sin(-\\theta)', right: '-\\sin\\theta' },
      { left: '\\cos(-\\theta)', right: '\\cos\\theta' },
      { left: '\\tan(-\\theta)', right: '-\\tan\\theta' },
      { left: '\\sin(90^\\circ - \\theta)', right: '\\cos\\theta' },
      { left: '\\cos(90^\\circ - \\theta)', right: '\\sin\\theta' },
      { left: '\\tan(90^\\circ - \\theta)', right: '\\cot\\theta' },
      { left: '\\sin(180^\\circ - \\theta)', right: '\\sin\\theta' },
      { left: '\\cos(180^\\circ - \\theta)', right: '-\\cos\\theta' },
    ],
  },
  {
    heading: 'Sum and difference',
    items: [
      { left: '\\sin(A \\pm B)', right: '\\sin A \\cos B \\pm \\cos A \\sin B' },
      { left: '\\cos(A \\pm B)', right: '\\cos A \\cos B \\mp \\sin A \\sin B' },
      { left: '\\tan(A \\pm B)', right: '\\dfrac{\\tan A \\pm \\tan B}{1 \\mp \\tan A \\tan B}' },
    ],
  },
  {
    heading: 'Double and triple angle',
    items: [
      { left: '\\sin 2\\theta', right: '2 \\sin\\theta \\cos\\theta = \\dfrac{2\\tan\\theta}{1 + \\tan^2\\theta}' },
      { left: '\\cos 2\\theta', right: '\\cos^2\\theta - \\sin^2\\theta' },
      { left: '\\cos 2\\theta', right: '2\\cos^2\\theta - 1 = 1 - 2\\sin^2\\theta' },
      { left: '\\tan 2\\theta', right: '\\dfrac{2\\tan\\theta}{1 - \\tan^2\\theta}' },
      { left: '\\sin 3\\theta', right: '3\\sin\\theta - 4\\sin^3\\theta' },
      { left: '\\cos 3\\theta', right: '4\\cos^3\\theta - 3\\cos\\theta' },
      { left: '\\tan 3\\theta', right: '\\dfrac{3\\tan\\theta - \\tan^3\\theta}{1 - 3\\tan^2\\theta}' },
    ],
  },
  {
    heading: 'Half angle and power reduction',
    items: [
      { left: '\\sin^2\\theta', right: '\\dfrac{1 - \\cos 2\\theta}{2}' },
      { left: '\\cos^2\\theta', right: '\\dfrac{1 + \\cos 2\\theta}{2}' },
      { left: '\\sin\\dfrac{\\theta}{2}', right: '\\pm\\sqrt{\\dfrac{1 - \\cos\\theta}{2}}' },
      { left: '\\cos\\dfrac{\\theta}{2}', right: '\\pm\\sqrt{\\dfrac{1 + \\cos\\theta}{2}}' },
      { left: '\\tan\\dfrac{\\theta}{2}', right: '\\dfrac{1 - \\cos\\theta}{\\sin\\theta} = \\dfrac{\\sin\\theta}{1 + \\cos\\theta}' },
    ],
  },
  {
    heading: 'Product to sum',
    items: [
      { left: '2\\sin A \\cos B', right: '\\sin(A + B) + \\sin(A - B)' },
      { left: '2\\cos A \\sin B', right: '\\sin(A + B) - \\sin(A - B)' },
      { left: '2\\cos A \\cos B', right: '\\cos(A + B) + \\cos(A - B)' },
      { left: '2\\sin A \\sin B', right: '\\cos(A - B) - \\cos(A + B)' },
    ],
  },
  {
    heading: 'Sum to product',
    items: [
      { left: '\\sin C + \\sin D', right: '2\\sin\\dfrac{C + D}{2}\\cos\\dfrac{C - D}{2}' },
      { left: '\\sin C - \\sin D', right: '2\\cos\\dfrac{C + D}{2}\\sin\\dfrac{C - D}{2}' },
      { left: '\\cos C + \\cos D', right: '2\\cos\\dfrac{C + D}{2}\\cos\\dfrac{C - D}{2}' },
      { left: '\\cos C - \\cos D', right: '-2\\sin\\dfrac{C + D}{2}\\sin\\dfrac{C - D}{2}' },
    ],
  },
  {
    heading: 'Any triangle',
    items: [
      { left: 'Sine rule', rel: false, right: '\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C}' },
      { left: 'Cosine rule', rel: false, right: 'c^2 = a^2 + b^2 - 2ab\\cos C' },
      { left: 'Area', rel: false, right: '\\tfrac{1}{2}ab\\sin C' },
      { left: 'Radians', rel: false, right: '\\pi \\text{ rad} = 180^\\circ' },
      { left: 'Arc length', rel: false, right: 's = r\\theta \\quad (\\theta \\text{ in radians})' },
    ],
  },
];

export const geometryFormulas = [
  {
    heading: 'Area and perimeter',
    items: [
      { left: 'Square', rel: false, right: 'A = s^2, \\quad P = 4s' },
      { left: 'Rectangle', rel: false, right: 'A = lw, \\quad P = 2(l + w)' },
      { left: 'Triangle', rel: false, right: 'A = \\tfrac{1}{2}bh' },
      { left: 'Heron', rel: false, right: 'A = \\sqrt{s(s-a)(s-b)(s-c)}, \\quad s = \\tfrac{a+b+c}{2}' },
      { left: 'Parallelogram', rel: false, right: 'A = bh' },
      { left: 'Trapezium', rel: false, right: 'A = \\tfrac{1}{2}(a + b)h' },
      { left: 'Circle', rel: false, right: 'A = \\pi r^2, \\quad C = 2\\pi r' },
      { left: 'Sector', rel: false, right: 'A = \\tfrac{1}{2}r^2\\theta' },
      { left: 'Pythagoras', rel: false, right: 'a^2 + b^2 = c^2' },
    ],
  },
  {
    heading: 'Surface area and volume',
    items: [
      { left: 'Cube', rel: false, right: 'V = s^3, \\quad S = 6s^2' },
      { left: 'Cuboid', rel: false, right: 'V = lwh, \\quad S = 2(lw + wh + hl)' },
      { left: 'Cylinder', rel: false, right: 'V = \\pi r^2 h, \\quad S = 2\\pi r(r + h)' },
      { left: 'Cone', rel: false, right: 'V = \\tfrac{1}{3}\\pi r^2 h, \\quad S = \\pi r(r + l)' },
      { left: 'Sphere', rel: false, right: 'V = \\tfrac{4}{3}\\pi r^3, \\quad S = 4\\pi r^2' },
      { left: 'Hemisphere', rel: false, right: 'V = \\tfrac{2}{3}\\pi r^3, \\quad S = 3\\pi r^2' },
    ],
  },
];

export const lhopitalFormulas = [
  {
    heading: "L'Hôpital's rule",
    items: [
      {
        left: '\\lim_{x \\to a} \\dfrac{f(x)}{g(x)}',
        right: '\\lim_{x \\to a} \\dfrac{f\'(x)}{g\'(x)}',
      },
      { left: 'Requires', rel: false, right: '\\tfrac{0}{0} \\text{ or } \\tfrac{\\infty}{\\infty}, \\text{ and the new limit exists}' },
      { left: 'Differentiate', rel: false, right: 'f \\text{ and } g \\text{ separately, not } \\tfrac{f}{g} \\text{ as a quotient}' },
      { left: 'Still indeterminate', rel: '\\Rightarrow', right: '\\text{apply the rule again}' },
    ],
  },
  {
    heading: 'Rewriting other indeterminate forms',
    items: [
      { left: '0 \\cdot \\infty', rel: '\\to', right: '\\dfrac{f}{1/g} \\;\\text{ gives }\\; \\tfrac{0}{0}' },
      { left: '\\infty - \\infty', rel: '\\to', right: '\\text{combine into one fraction}' },
      { left: '1^\\infty,\\; 0^0,\\; \\infty^0', rel: '\\to', right: '\\lim f^g = e^{\\lim g \\ln f}' },
    ],
  },
  {
    heading: 'Worked limits',
    items: [
      { left: '\\lim_{x \\to 0} \\dfrac{\\sin x}{x}', right: '\\lim_{x \\to 0} \\dfrac{\\cos x}{1} = 1' },
      { left: '\\lim_{x \\to \\infty} \\dfrac{\\ln x}{x}', right: '\\lim_{x \\to \\infty} \\dfrac{1/x}{1} = 0' },
      { left: '\\lim_{x \\to \\infty} \\dfrac{x^2}{e^x}', right: '\\lim_{x \\to \\infty} \\dfrac{2}{e^x} = 0' },
    ],
  },
];

export const implicitFormulas = [
  {
    heading: 'Differentiating terms in y',
    items: [
      { left: '\\dfrac{d}{dx}\\,[\\, y \\,]', right: '\\dfrac{dy}{dx}' },
      { left: '\\dfrac{d}{dx}\\,[\\, y^n \\,]', right: 'n\\, y^{n-1} \\dfrac{dy}{dx}' },
      { left: '\\dfrac{d}{dx}\\,[\\, xy \\,]', right: 'y + x \\dfrac{dy}{dx}' },
      { left: '\\dfrac{d}{dx}\\,[\\, \\sin y \\,]', right: '\\cos y \\, \\dfrac{dy}{dx}' },
      { left: '\\dfrac{d}{dx}\\,[\\, e^y \\,]', right: 'e^y \\dfrac{dy}{dx}' },
    ],
  },
  {
    heading: 'Method',
    items: [
      { left: '1.', rel: false, right: '\\text{differentiate both sides with respect to } x' },
      { left: '2.', rel: false, right: '\\text{collect the } \\tfrac{dy}{dx} \\text{ terms on one side}' },
      { left: '3.', rel: false, right: '\\text{factor out } \\tfrac{dy}{dx} \\text{ and divide}' },
    ],
  },
  {
    heading: 'Standard curves',
    items: [
      { left: 'x^2 + y^2 = r^2', rel: '\\Rightarrow', right: '\\dfrac{dy}{dx} = -\\dfrac{x}{y}' },
      { left: 'xy = c', rel: '\\Rightarrow', right: '\\dfrac{dy}{dx} = -\\dfrac{y}{x}' },
      { left: '\\dfrac{dy}{dx} = 0', rel: '\\Rightarrow', right: '\\text{horizontal tangent}' },
      { left: '\\dfrac{dy}{dx} \\text{ undefined}', rel: '\\Rightarrow', right: '\\text{vertical tangent}' },
    ],
  },
];

export const areaBetweenFormulas = [
  {
    heading: 'Vertical slices',
    items: [
      { left: 'A', right: '\\displaystyle\\int_a^b \\big[\\, f(x) - g(x) \\,\\big] \\, dx, \\quad f \\ge g' },
      { left: 'Slice height', rel: false, right: '\\text{top curve} - \\text{bottom curve}' },
      { left: 'Limits a, b', rel: false, right: '\\text{where } f(x) = g(x), \\text{ or the given interval}' },
    ],
  },
  {
    heading: 'Horizontal slices',
    items: [
      { left: 'A', right: '\\displaystyle\\int_c^d \\big[\\, x_R(y) - x_L(y) \\,\\big] \\, dy' },
      { left: 'Use when', rel: false, right: '\\text{the curves are easier to write as } x = h(y)' },
    ],
  },
  {
    heading: 'Curves that cross',
    items: [
      { left: 'A', right: '\\displaystyle\\int_a^b \\big|\\, f(x) - g(x) \\,\\big| \\, dx' },
      { left: 'In practice', rel: false, right: '\\text{split at each crossing and add the pieces}' },
      { left: '\\displaystyle\\int_a^b (f - g)\\,dx < 0', rel: '\\Rightarrow', right: '\\text{top and bottom were swapped}' },
    ],
  },
];

export const lineFormulas = [
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
  {
    heading: 'Other forms of a line',
    items: [
      { left: 'General form', rel: false, right: 'Ax + By + C = 0, \\quad m = -\\dfrac{A}{B}' },
      { left: 'Intercept form', rel: false, right: '\\dfrac{x}{a} + \\dfrac{y}{b} = 1' },
      { left: 'Horizontal line', rel: false, right: 'y = k, \\quad m = 0' },
      { left: 'Vertical line', rel: false, right: 'x = k, \\quad m \\text{ undefined}' },
      { left: 'm', right: '\\tan\\theta \\quad (\\theta \\text{ = angle with the } x\\text{-axis})' },
      {
        left: 'Distance from a point',
        rel: false,
        right: 'd = \\dfrac{|Ax_0 + By_0 + C|}{\\sqrt{A^2 + B^2}}',
      },
    ],
  },
];

export const productQuotientFormulas = [
  {
    heading: 'The two rules',
    items: [
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
    ],
  },
  {
    heading: 'Extensions',
    items: [
      { left: '(uvw)\'', right: 'u\'vw + uv\'w + uvw\'' },
      { left: '\\left(\\dfrac{1}{v}\\right)\'', right: '-\\dfrac{v\'}{v^2}' },
      { left: '\\left(\\dfrac{c}{v}\\right)\'', right: '-\\dfrac{c\\,v\'}{v^2}' },
      { left: '\\dfrac{u}{v}', right: 'u \\cdot v^{-1} \\quad \\text{(a quotient is a product)}' },
    ],
  },
  {
    heading: 'Worked results',
    items: [
      { left: '\\dfrac{d}{dx}\\,[\\, x e^x \\,]', right: '(x + 1)\\,e^x' },
      { left: '\\dfrac{d}{dx}\\,[\\, x \\ln x \\,]', right: '\\ln x + 1' },
      { left: '\\dfrac{d}{dx}\\left[\\dfrac{x}{x + 1}\\right]', right: '\\dfrac{1}{(x + 1)^2}' },
    ],
  },
];

export const chainRuleFormulas = [
  {
    heading: 'The chain rule',
    items: [
      {
        left: '\\dfrac{d}{dx}\\,[\\, f(g(x)) \\,]',
        right: 'f\'(g(x)) \\cdot g\'(x)',
        check: {
          kind: 'derivative',
          f: (x) => Math.sin(x * x + 1),
          df: (x) => Math.cos(x * x + 1) * 2 * x,
        },
      },
      { left: '\\dfrac{dy}{dx}', right: '\\dfrac{dy}{du} \\cdot \\dfrac{du}{dx}' },
      { left: '\\dfrac{d}{dx}\\,[\\, f(g(h(x))) \\,]', right: 'f\'(g(h)) \\cdot g\'(h) \\cdot h\'(x)' },
    ],
  },
  {
    heading: 'General forms, with u = g(x)',
    items: [
      { left: '\\dfrac{d}{dx}\\,[\\, u^n \\,]', right: 'n\\,u^{n-1}\\, u\'' },
      { left: '\\dfrac{d}{dx}\\,[\\, e^u \\,]', right: 'e^u\\, u\'' },
      { left: '\\dfrac{d}{dx}\\,[\\, \\ln u \\,]', right: '\\dfrac{u\'}{u}' },
      { left: '\\dfrac{d}{dx}\\,[\\, \\sin u \\,]', right: '\\cos u \\cdot u\'' },
      { left: '\\dfrac{d}{dx}\\,[\\, \\cos u \\,]', right: '-\\sin u \\cdot u\'' },
      { left: '\\dfrac{d}{dx}\\,[\\, \\sqrt{u} \\,]', right: '\\dfrac{u\'}{2\\sqrt{u}}' },
    ],
  },
  {
    heading: 'Worked results',
    items: [
      { left: '\\dfrac{d}{dx}\\,[\\, \\sin(x^2) \\,]', right: '2x \\cos(x^2)' },
      { left: '\\dfrac{d}{dx}\\,[\\, e^{3x} \\,]', right: '3e^{3x}' },
      { left: '\\dfrac{d}{dx}\\,[\\, \\ln(x^2 + 1) \\,]', right: '\\dfrac{2x}{x^2 + 1}' },
    ],
  },
];

export const relatedRatesFormulas = [
  {
    heading: 'Method',
    items: [
      { left: '1.', rel: false, right: '\\text{name every quantity that changes with time}' },
      { left: '2.', rel: false, right: '\\text{write one equation that links them}' },
      { left: '3.', rel: false, right: '\\text{differentiate both sides with respect to } t' },
      { left: '4.', rel: false, right: '\\text{substitute the numbers only after differentiating}' },
    ],
  },
  {
    heading: 'Common relationships',
    items: [
      { left: 'A = \\pi r^2', rel: '\\Rightarrow', right: '\\dfrac{dA}{dt} = 2\\pi r \\dfrac{dr}{dt}' },
      { left: 'V = \\tfrac{4}{3}\\pi r^3', rel: '\\Rightarrow', right: '\\dfrac{dV}{dt} = 4\\pi r^2 \\dfrac{dr}{dt}' },
      { left: 'V = s^3', rel: '\\Rightarrow', right: '\\dfrac{dV}{dt} = 3s^2 \\dfrac{ds}{dt}' },
      {
        left: 'x^2 + y^2 = z^2',
        rel: '\\Rightarrow',
        right: 'x\\dfrac{dx}{dt} + y\\dfrac{dy}{dt} = z\\dfrac{dz}{dt}',
      },
      {
        left: 'V = \\tfrac{1}{3}\\pi r^2 h',
        rel: '\\Rightarrow',
        right: '\\text{use similar triangles to remove } r \\text{ or } h \\text{ first}',
      },
    ],
  },
  {
    heading: 'Signs',
    items: [
      { left: '\\dfrac{dx}{dt} > 0', rel: '\\Rightarrow', right: 'x \\text{ is increasing}' },
      { left: '\\dfrac{dx}{dt} < 0', rel: '\\Rightarrow', right: 'x \\text{ is decreasing}' },
    ],
  },
];

export const meanValueFormulas = [
  {
    heading: 'The theorem',
    items: [
      { left: 'f\'(c)', right: '\\dfrac{f(b) - f(a)}{b - a} \\quad \\text{for some } c \\in (a, b)' },
      { left: 'Requires', rel: false, right: 'f \\text{ continuous on } [a, b], \\text{ differentiable on } (a, b)' },
      { left: 'Rolle\'s theorem', rel: false, right: 'f(a) = f(b) \\;\\Rightarrow\\; f\'(c) = 0 \\text{ for some } c' },
      { left: 'In words', rel: false, right: '\\text{some tangent is parallel to the secant}' },
    ],
  },
  {
    heading: 'Consequences',
    items: [
      { left: 'f\' = 0 \\text{ on an interval}', rel: '\\Rightarrow', right: 'f \\text{ is constant there}' },
      { left: 'f\' = g\' \\text{ on an interval}', rel: '\\Rightarrow', right: 'f = g + C' },
      { left: '|f\'| \\le M', rel: '\\Rightarrow', right: '|f(b) - f(a)| \\le M\\,|b - a|' },
    ],
  },
];

export const optimizationFormulas = [
  {
    heading: 'Finding candidates',
    items: [
      { left: 'Critical point', rel: false, right: 'f\'(c) = 0 \\text{ or } f\'(c) \\text{ undefined}' },
      { left: 'Closed interval', rel: false, right: '\\text{also test the endpoints } a \\text{ and } b' },
      { left: 'Absolute extremes', rel: false, right: '\\text{largest and smallest of all candidate values}' },
    ],
  },
  {
    heading: 'Classifying',
    items: [
      { left: 'f\' \\text{ changes } + \\to -', rel: '\\Rightarrow', right: '\\text{local maximum}' },
      { left: 'f\' \\text{ changes } - \\to +', rel: '\\Rightarrow', right: '\\text{local minimum}' },
      { left: 'f\'\'(c) < 0', rel: '\\Rightarrow', right: '\\text{local maximum}' },
      { left: 'f\'\'(c) > 0', rel: '\\Rightarrow', right: '\\text{local minimum}' },
      { left: 'f\'\'(c) = 0', rel: '\\Rightarrow', right: '\\text{inconclusive: use the first derivative test}' },
    ],
  },
  {
    heading: 'Word problems',
    items: [
      { left: '1.', rel: false, right: '\\text{write the quantity to optimise}' },
      { left: '2.', rel: false, right: '\\text{use the constraint to reduce it to one variable}' },
      { left: '3.', rel: false, right: '\\text{differentiate, solve, and check the domain}' },
      { left: 'Fixed perimeter', rel: false, right: '\\text{the rectangle of largest area is a square}' },
    ],
  },
];

export const ftcFormulas = [
  {
    heading: 'Part 1: accumulation',
    items: [
      { left: '\\dfrac{d}{dx} \\displaystyle\\int_a^x f(t) \\, dt', right: 'f(x)' },
      { left: '\\dfrac{d}{dx} \\displaystyle\\int_a^{g(x)} f(t) \\, dt', right: 'f(g(x))\\, g\'(x)' },
      { left: 'A(x) = \\displaystyle\\int_a^x f(t)\\,dt', rel: '\\Rightarrow', right: 'A\'(x) = f(x)' },
    ],
  },
  {
    heading: 'Part 2: evaluation',
    items: [
      { left: '\\displaystyle\\int_a^b f(x) \\, dx', right: 'F(b) - F(a), \\quad F\' = f' },
      { left: '\\Big[ F(x) \\Big]_a^b', right: 'F(b) - F(a)' },
      { left: 'Constant of integration', rel: false, right: '\\text{cancels, so any antiderivative works}' },
    ],
  },
  {
    heading: 'Applications',
    items: [
      { left: '\\displaystyle\\int_a^b f\'(x)\\,dx', right: 'f(b) - f(a) \\quad \\text{(net change)}' },
      { left: '\\bar{f}', right: '\\dfrac{1}{b - a} \\displaystyle\\int_a^b f(x) \\, dx \\quad \\text{(average value)}' },
      { left: '\\displaystyle\\int_a^b v(t)\\,dt', right: '\\text{displacement from } t = a \\text{ to } t = b' },
    ],
  },
];

export const substitutionFormulas = [
  {
    heading: 'The substitution',
    items: [
      {
        left: '\\displaystyle\\int f(g(x))\\, g\'(x) \\, dx',
        right: '\\displaystyle\\int f(u) \\, du, \\quad u = g(x)',
      },
      { left: 'du', right: 'g\'(x)\\, dx' },
      {
        left: '\\displaystyle\\int_a^b f(g(x))\\, g\'(x)\\, dx',
        right: '\\displaystyle\\int_{g(a)}^{g(b)} f(u) \\, du',
      },
    ],
  },
  {
    heading: 'Standard patterns',
    items: [
      { left: '\\displaystyle\\int \\dfrac{f\'(x)}{f(x)} \\, dx', right: '\\ln |f(x)| + C' },
      { left: '\\displaystyle\\int f\'(x)\\, e^{f(x)} \\, dx', right: 'e^{f(x)} + C' },
      {
        left: '\\displaystyle\\int f\'(x) \\,[f(x)]^n \\, dx',
        right: '\\dfrac{[f(x)]^{n+1}}{n + 1} + C, \\quad n \\neq -1',
      },
      { left: '\\displaystyle\\int f(ax + b) \\, dx', right: '\\dfrac{1}{a} F(ax + b) + C' },
    ],
  },
  {
    heading: 'Choosing u',
    items: [
      { left: 'Pick u', rel: false, right: '\\text{an inner function whose derivative is also a factor}' },
      { left: 'Leftover x', rel: false, right: '\\text{rewrite it in terms of } u, \\text{ or choose again}' },
    ],
  },
];

export const byPartsFormulas = [
  {
    heading: 'The formula',
    items: [
      { left: '\\displaystyle\\int u \\, dv', right: 'u\\,v - \\displaystyle\\int v \\, du' },
      {
        left: '\\displaystyle\\int_a^b u \\, dv',
        right: '\\Big[ u\\,v \\Big]_a^b - \\displaystyle\\int_a^b v \\, du',
      },
      { left: 'Origin', rel: false, right: '\\text{integrate the product rule } (uv)\' = u\'v + uv\'' },
    ],
  },
  {
    heading: 'Choosing u',
    items: [
      { left: 'LIATE order', rel: false, right: '\\text{Log, Inverse trig, Algebraic, Trig, Exponential}' },
      { left: 'Pick u', rel: false, right: '\\text{whichever factor comes first in that list}' },
      { left: 'Goal', rel: false, right: '\\int v\\,du \\text{ should be simpler than } \\int u\\,dv' },
    ],
  },
  {
    heading: 'Worked results',
    items: [
      { left: '\\displaystyle\\int x e^x \\, dx', right: '(x - 1)\\,e^x + C' },
      { left: '\\displaystyle\\int x \\sin x \\, dx', right: '\\sin x - x \\cos x + C' },
      { left: '\\displaystyle\\int e^x \\sin x \\, dx', right: '\\tfrac{1}{2} e^x (\\sin x - \\cos x) + C' },
    ],
  },
];
