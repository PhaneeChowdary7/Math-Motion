import FormulaReference from '../../components/FormulaReference.jsx';
import LessonLayout from '../../components/LessonLayout.jsx';
import PracticeSet from '../../components/PracticeSet.jsx';
import { Callout, Example, Formula, WorkedExample } from '../../components/content.jsx';
import { chainRuleGenerators } from './chainRuleProblems.js';
import { chainRuleFormulas } from '../../lib/formulas.js';
import { GearsStory } from '../../stories/calculus.jsx';

const questions = [
  {
    id: 'c1',
    prompt: 'What is the derivative of y = (4x + 1)³?',
    options: ['3(4x + 1)²', '12(4x + 1)²', '12(4x + 1)³', '3(4x + 1)³'],
    answer: 1,
    explanation: 'The outer power gives 3(4x + 1)², and the inner derivative is 4. Multiplying gives 12(4x + 1)².',
  },
  {
    id: 'c2',
    prompt: 'Which mistake does the chain rule most often catch people out on?',
    options: [
      'Forgetting to multiply by the derivative of the inside',
      'Reducing the exponent',
      'Differentiating the outside function',
      'Writing dy/dx instead of dx/dy',
    ],
    answer: 0,
    explanation: 'Differentiating the outside is the instinctive half. The inner derivative is the factor people leave off.',
  },
  {
    id: 'c3',
    prompt: 'If u = g(x) and y = f(u), the chain rule says dy/dx equals which product?',
    options: ['dy/du × du/dx', 'dy/du + du/dx', 'du/dy × dx/du', 'dy/dx × du/dx'],
    answer: 0,
    explanation: 'Rates multiply through the link. If y changes 3× as fast as u, and u changes 5× as fast as x, then y changes 15× as fast as x.',
  },
];

export default function ChainRuleLesson({ lessonId }) {
  return (
    <LessonLayout
      lessonId={lessonId}
      story={<GearsStory />}
      quiz={questions}
      reference={<FormulaReference title="Chain rule reference" groups={chainRuleFormulas} />}
      intro="The chain rule differentiates a function tucked inside another function, by multiplying the rate of the outer change by the rate of the inner one."
      visual={<PracticeSet title="Step-by-step differentiation" generators={chainRuleGenerators} />}
    >
      <h2>Composition of rates</h2>
      <p>
        Suppose a car travels twice as fast as a bike, and the bike travels three times as fast as a
        walker. The car is six times the walking speed, because rates through a chain{' '}
        <strong>multiply</strong>. That is the whole idea, and the notation says exactly the same
        thing.
      </p>

      <Formula label="The chain rule" note="Differentiate the outside, keep the inside intact, then multiply by the inside's derivative.">
        {String.raw`\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx}`}
      </Formula>

      <h2>Identifying the inner function</h2>
      <p>
        Every chain rule problem starts with one question: what is wrapped inside what? In{' '}
        <strong>(3x + 1)⁵</strong> the inside is 3x + 1 and the outside is "raise to the fifth". In{' '}
        <strong>sin(2x)</strong> the inside is 2x and the outside is sine. Name the inside u and the
        problem becomes two easy derivatives instead of one hard one.
      </p>

      <Callout label="Common error" tone="fail">
        Almost everyone differentiates the outer function correctly and then forgets to multiply by
        the inner derivative. If your answer for (3x + 1)⁵ has no factor of 3 in it, you have made
        exactly this mistake.
      </Callout>

      <h2>Developing fluency</h2>
      <p>
        Unlike the ideas earlier in this chapter, this one is not learned by watching. It becomes
        automatic through repetition until spotting the inner function takes no conscious thought.
        The panel beside this text generates a fresh problem every time you ask.
      </p>

      <WorkedExample
      variant="applied"
      label="Application - cooling rate during a climb"
      problem="Air temperature falls by 6.5°C for every kilometre of altitude. A balloon is ascending at 0.4 kilometres per minute. Determine the rate at which the temperature outside the balloon is falling."
      steps={[
        {
          text: 'Identify the composition: temperature depends on altitude, and altitude depends on time.',
          math: String.raw`T = T(h), \qquad h = h(t)`,
        },
        {
          text: 'The chain rule multiplies the two rates.',
          math: String.raw`\frac{dT}{dt} = \frac{dT}{dh} \cdot \frac{dh}{dt}`,
        },
        {
          text: 'Substitute the two given rates, with the temperature gradient negative because temperature falls with height.',
          math: String.raw`\frac{dT}{dt} = (-6.5) \times (0.4)`,
        },
        {
          text: 'Evaluate, checking that the units compose correctly.',
          math: String.raw`\frac{dT}{dt} = -2.6 \; \frac{^\circ\mathrm{C}}{\mathrm{km}} \cdot \frac{\mathrm{km}}{\mathrm{min}} = -2.6\;^\circ\mathrm{C}\,\text{per minute}`,
        },
      ]}
      result="The outside temperature falls at 2.6°C per minute."
      note="The cancelling of kilometres between the two factors is the chain rule made visible. Whenever a quantity is reached through an intermediate variable, the rates multiply and the intermediate unit cancels."
    />

    <Example label="Applications">
        Anything measured indirectly relies on it. A weather balloon's volume depends on its radius,
        the radius depends on time, so working out how fast the volume grows means chaining the two
        rates together. That is the next lesson.
      </Example>
    </LessonLayout>
  );
}
