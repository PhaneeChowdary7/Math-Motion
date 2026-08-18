import LessonLayout from '../../components/LessonLayout.jsx';
import PracticeSet from '../../components/PracticeSet.jsx';
import { Callout, Example, Formula } from '../../components/content.jsx';
import { uSubstitutionGenerators } from './uSubstitutionProblems.js';

const questions = [
  {
    id: 'u1',
    prompt: 'For ∫ x(x² + 5)⁴ dx, which substitution works?',
    options: ['u = x', 'u = x² + 5', 'u = (x² + 5)⁴', 'u = 4x'],
    answer: 1,
    explanation: 'Take the inside of the bracket. Its derivative is 2x, and there is already an x sitting outside to supply it.',
  },
  {
    id: 'u2',
    prompt: 'What makes a substitution the right one to choose?',
    options: [
      'Its derivative already appears in the integrand',
      'It is the largest term',
      'It contains no constants',
      'It is whatever sits outside the bracket',
    ],
    answer: 0,
    explanation: 'Substitution only works if du is available to absorb the leftover factor. That is why the stray x in front matters so much.',
  },
  {
    id: 'u3',
    prompt: 'Substitution is the reverse of which differentiation rule?',
    options: ['The product rule', 'The chain rule', 'The quotient rule', 'The power rule'],
    answer: 1,
    explanation: 'The chain rule leaves behind an inner derivative as a factor. Substitution recognises that factor and undoes it.',
  },
];

export default function USubstitutionLesson({ lessonId }) {
  return (
    <LessonLayout
      lessonId={lessonId}
      quiz={questions}
      intro="Substitution runs the chain rule backwards, renaming an awkward inner expression as a single letter so the integral collapses into a standard one."
      visual={<PracticeSet title="Integrate step by step" generators={uSubstitutionGenerators} />}
    >
      <h2>Undoing the chain rule</h2>
      <p>
        Differentiating a composed function leaves a fingerprint: the derivative of the inside is
        left multiplying everything else. Substitution is the art of noticing that fingerprint and
        working backwards from it.
      </p>

      <Formula label="The substitution" note="Replace the inner expression with u, replace its derivative times dx with du.">
        {String.raw`\int f(g(x))\, g'(x)\, dx = \int f(u) \, du`}
      </Formula>

      <h2>Choosing u</h2>
      <p>
        The rule of thumb is simple: pick the inner expression whose derivative is{' '}
        <strong>already present</strong> in the integrand, give or take a constant. In{' '}
        <strong>∫ x(x² + 4)³ dx</strong> choosing u = x² + 4 gives du = 2x dx, and that lone x out
        front is exactly what is needed. Constants are never a problem, because a factor of 2 or 1/2
        can be moved outside the integral freely.
      </p>

      <Callout label="How to check yourself" tone="ok">
        Every integral answer is self-checking. Differentiate what you got: if the chain rule hands
        the original integrand back, the answer is right. No need to wonder.
      </Callout>

      <h2>When it does not work</h2>
      <p>
        If the leftover factor is not the inner derivative, substitution stalls. ∫ (x² + 1)³ dx has
        no stray x, so u = x² + 1 leaves an unusable du. Recognising a dead end quickly is as much a
        part of the skill as the substitution itself, and it is what sends you to the next technique.
      </p>

      <Example label="Where it shows up">
        Any time a quantity accumulates against a changing scale: fuel burned against a varying
        speed, charge collected against a fluctuating current. Substitution converts the awkward
        variable into one the integral already understands.
      </Example>
    </LessonLayout>
  );
}
