import { useRef } from 'react';
import Feedback from './Feedback.jsx';
import LessonNav from './LessonNav.jsx';
import LessonStatus from './LessonStatus.jsx';
import Notes from './Notes.jsx';
import Quiz from './Quiz.jsx';
import { getLessonById } from '../lessons/catalog.js';
import { useReveal } from '../lib/useReveal.js';

export default function LessonLayout({
  lessonId,
  intro,
  visual,
  reference,
  practice,
  quiz,
  belowVisual,
  children,
}) {
  const lesson = getLessonById(lessonId);
  const root = useRef(null);

  useReveal(root, lessonId);

  return (
    <section className="lesson" id={lesson?.slug} ref={root}>
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
        {belowVisual ? <div className="lesson-below"><article>{belowVisual}</article></div> : null}
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
