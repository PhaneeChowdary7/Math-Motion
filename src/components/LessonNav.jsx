import { memo } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getNeighbors } from '../lessons/catalog.js';
import { prefetchLesson } from '../lessons/registry.js';

function LessonNav({ lessonId }) {
  const { previous, next } = getNeighbors(lessonId);

  if (!previous && !next) return null;

  return (
    <nav className="lesson-nav" aria-label="Lesson navigation">
      {previous && (
        <a
          className="lesson-next is-back"
          href={`#${previous.slug}`}
          onMouseEnter={() => prefetchLesson(previous.id)}
          onFocus={() => prefetchLesson(previous.id)}
        >
          <ArrowLeft size={18} />
          <span>
            <small>Previous lesson</small>
            <span className="lesson-next-title">{previous.title}</span>
          </span>
        </a>
      )}

      {next && (
        <a
          className={`lesson-next ${previous ? '' : 'is-only'}`}
          href={`#${next.slug}`}
          onMouseEnter={() => prefetchLesson(next.id)}
          onFocus={() => prefetchLesson(next.id)}
        >
          <span>
            <small>Next lesson</small>
            <span className="lesson-next-title">{next.title}</span>
          </span>
          <ArrowRight size={18} />
        </a>
      )}
    </nav>
  );
}

export default memo(LessonNav);
