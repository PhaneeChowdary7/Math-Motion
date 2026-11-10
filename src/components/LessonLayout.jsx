import { useRef } from 'react';
import { ArrowUpRight, Compass } from 'lucide-react';
import Feedback from './Feedback.jsx';
import LessonNav from './LessonNav.jsx';
import LessonStatus from './LessonStatus.jsx';
import Notes from './Notes.jsx';
import Quiz from './Quiz.jsx';
import { getLessonById } from '../lessons/catalog.js';
import { getChapterMotivation } from '../lessons/motivations.js';
import { useReveal } from '../lib/useReveal.js';

export default function LessonLayout({
  lessonId,
  intro,
  visual,
  reference,
  story,
  practice,
  quiz,
  belowVisual,
  children,
}) {
  const lesson = getLessonById(lessonId);
  const motivation = getChapterMotivation(lesson?.chapter);
  const root = useRef(null);

  useReveal(root, lessonId);

  return (
    <section className="lesson" id={lesson?.slug} ref={root}>
      <div className="lesson-copy">
        <header>
          <div className="lesson-heading-meta">
            <span className="eyebrow">{lesson?.chapter}</span>
            {motivation && (
              <a className="lesson-motivation-link" href={`#${motivation.slug}`}>
                <Compass size={14} aria-hidden="true" />Why learn this chapter?<ArrowUpRight size={13} aria-hidden="true" />
              </a>
            )}
          </div>
          <h1>{lesson?.title}</h1>
          <p>{intro}</p>
        </header>

        <LessonStatus lessonId={lessonId} />

        <article>{children}</article>
      </div>

      {/* The story sits under the visual in the right column, where it stays in
          view beside the lesson text on wide screens. */}
      <div className="lesson-side">
        <div className="visual-card">{visual}</div>
        {story ?? null}
      </div>

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
