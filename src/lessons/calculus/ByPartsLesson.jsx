import LessonLayout from '../../components/LessonLayout.jsx';
import PracticeSet from '../../components/PracticeSet.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { byPartsGenerators } from './byPartsProblems.js';

const questions = [
  {
    id: 'p1',
    prompt: 'For ∫ x cos(x) dx, which factor should be u?',
    options: ['u = cos(x)', 'u = x', 'u = x cos(x)', 'u = dx'],
    answer: 1,
    explanation: 'x differentiates to 1 and disappears, while cosine just cycles forever. Choose the factor that gets simpler.',
  },
  {
    id: 'p2',
    prompt: 'Integration by parts reverses which differentiation rule?',
    options: ['The chain rule', 'The product rule', 'The power rule', 'The quotient rule'],
    answer: 1,
    explanation: 'It is the product rule rearranged and integrated. Substitution undoes the chain rule; parts undoes the product rule.',
  },
  {
    id: 'p3',
    prompt: 'Why is u = ln(x) the right choice for ∫ x ln(x) dx?',
    options: [
      'Because ln(x) has no elementary antiderivative to reach for first',
      'Because ln(x) is the larger factor',
      'Because x cannot be integrated',
      'Because ln(x) differentiates to zero',
    ],
    answer: 0,
    explanation: 'You cannot easily make ln(x) into dv, and differentiating it gives 1/x, which cancels a power of x and simplifies the leftover integral.',
  },
];

export default function ByPartsLesson({ lessonId }) {
  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      intro="Integration by parts handles products that substitution cannot touch, by trading a hard integral for an easier one using the product rule in reverse."
      visual={<PracticeSet title="Step-by-step integration" generators={byPartsGenerators} />}
    >
      <h2>Derivation from the product rule</h2>
      <p>
        Differentiating a product gives two terms. Integrate that statement, move one term to the
        other side, and you have a way to swap an integral you cannot do for one you can.
      </p>

      <Formula label="Integration by parts" note="Trade ∫u dv for ∫v du, and hope the new integral is easier than the old one.">
        {String.raw`\int u \, dv = u\,v - \int v \, du`}
      </Formula>

      <h2>Choosing u and dv</h2>
      <p>
        The whole technique lives or dies on this choice. Pick <strong>u</strong> to be the factor
        that gets <em>simpler</em> when differentiated, and <strong>dv</strong> to be the part you
        can actually integrate. For ∫ x eˣ dx, x differentiates down to 1 and vanishes, while eˣ
        integrates to itself. Choose them the other way round and the integral gets worse, not
        better.
      </p>

      <Callout label="The LIATE ordering" tone="ok">
        When stuck, prefer u in this order: logarithms, inverse trigonometric, algebraic,
        trigonometric, exponential. It is a rule of thumb rather than a law, but it captures which
        functions simplify fastest under differentiation.
      </Callout>

      <h2>Verifying the choice</h2>
      <p>
        A good choice leaves a leftover integral that is plainly simpler than the one you started
        with, usually with the power of x reduced by one. If the leftover looks harder, back up and
        swap your choice rather than pressing on.
      </p>

      <Example label="Applications">
        It appears wherever two different kinds of quantity multiply: a decaying signal weighted by
        elapsed time, or a probability that falls off exponentially weighted by how large the
        outcome is. Expected values of that shape are integration by parts problems.
      </Example>
    </LessonLayout>
  );
}
