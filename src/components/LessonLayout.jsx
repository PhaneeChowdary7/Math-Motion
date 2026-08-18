import Feedback from './Feedback.jsx';
import LessonNav from './LessonNav.jsx';
import LessonStatus from './LessonStatus.jsx';
import Notes from './Notes.jsx';
import Quiz from './Quiz.jsx';
import { getLessonById } from '../lessons/catalog.js';

export default function LessonLayout({
  lessonId,
  intro,
  visual,
  reference,
  practice,
  quiz,
  children,
}) {
  const lesson = getLessonById(lessonId);

  return (
    <section className="lesson" id={lesson?.slug}>
      <div className="lesson-copy">
        <header>
          <span className="eyebrow">{lesson?.chapter}</span>
          <h1>{lesson?.title}</h1>
          <p>{intro}</p>
        </header>

        <LessonStatus lessonId={lessonId} />

        <article>{children}</article>
      </div>

      <div className="visual-card">{visual}</div>

      <div className="lesson-foot">
        {reference ?? null}
        {practice ?? null}
        {quiz?.length ? <Quiz questions={quiz} /> : null}
        <div className="lesson-extras">
          <Notes key={lessonId} lessonId={lessonId} />
          <Feedback key={`feedback-${lessonId}`} lessonId={lessonId} />
        </div>
        <LessonNav lessonId={lessonId} />
      </div>
    </section>
  );
}
