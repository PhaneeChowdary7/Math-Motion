import LessonLayout from '../../components/LessonLayout.jsx';
import PracticeSet from '../../components/PracticeSet.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { productQuotientGenerators } from './productQuotientProblems.js';

const questions = [
  {
    id: 'pq1',
    prompt: 'What is the derivative of y = x² sin x?',
    options: ['2x cos x', '2x sin x + x² cos x', '2x sin x − x² cos x', 'x² cos x'],
    answer: 1,
    explanation: 'Differentiate each factor in turn and keep the other intact: (2x)(sin x) + (x²)(cos x).',
  },
  {
    id: 'pq2',
    prompt: 'Is the derivative of a product equal to the product of the derivatives?',
    options: [
      'No, that is the classic mistake',
      'Yes, always',
      'Only for polynomials',
      'Only when both factors are positive',
    ],
    answer: 0,
    explanation: 'If it were, x · x would differentiate to 1 · 1 = 1, when the answer is 2x. Each factor must take its turn.',
  },
  {
    id: 'pq3',
    prompt: 'In the quotient rule, why does order matter in the numerator?',
    options: [
      'Because subtraction is not commutative, so u′v − uv′ is not uv′ − u′v',
      'Because the denominator is squared',
      'It does not matter',
      'Because v must be positive',
    ],
    answer: 0,
    explanation: 'Swapping the terms flips the sign of the whole answer. The derivative of the top always comes first.',
  },
];

export default function ProductQuotientLesson({ lessonId }) {
  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      intro="When two functions are multiplied or divided, their derivatives do not simply multiply or divide. Each factor takes a turn being differentiated while the other stands still."
      visual={<PracticeSet title="Differentiate step by step" generators={productQuotientGenerators} />}
    >
      <h2>Each factor takes a turn</h2>
      <p>
        The tempting guess is that the derivative of a product is the product of the derivatives.
        Test it on the simplest case: x times x is x², whose derivative is 2x. The product of the
        derivatives would be 1 times 1, which is 1. The guess fails immediately.
      </p>

      <Formula label="The product rule" note="Differentiate the first, keep the second; then keep the first, differentiate the second.">
        {String.raw`(uv)' = u'v + uv'`}
      </Formula>

      <p>
        The reason is that both factors are changing at once. Picture a rectangle whose width and
        height are both growing: the area gains a strip along the top and a strip along the side.
        Those two strips are the two terms.
      </p>

      <h2>Division flips one sign</h2>
      <p>
        The quotient rule follows from the product rule, and looks almost the same except that the
        second term is subtracted and the whole thing sits over v².
      </p>

      <Formula label="The quotient rule" note="Top derivative first. Reversing the order flips the sign of the answer.">
        {String.raw`\left(\frac{u}{v}\right)' = \frac{u'v - uv'}{v^2}`}
      </Formula>

      <Callout label="The order trap" tone="fail">
        Unlike the product rule, the quotient rule is <strong>not</strong> symmetric. Writing
        uv′ − u′v instead of u′v − uv′ negates the entire result. If your answer has the wrong sign,
        this is almost always why.
      </Callout>

      <h2>Choosing between them</h2>
      <p>
        A quotient can often be rewritten as a product with a negative exponent, and sometimes that
        is easier. But when the denominator is anything more complicated than a single power, the
        quotient rule is usually the shorter path.
      </p>

      <Example label="Where it shows up">
        Any rate expressed as a ratio: fuel efficiency as distance over fuel, or concentration as
        mass over volume. When both the numerator and denominator drift over time, the quotient rule
        is what tells you which way the ratio is heading.
      </Example>
    </LessonLayout>
  );
}
