import { memo } from 'react';
import { Check, CircleDashed } from 'lucide-react';
import { setLessonComplete, useProgress } from '../lib/progress.js';

function ProgressButton({ lessonId }) {
  const progress = useProgress();
  const complete = Boolean(progress[lessonId]);

  return (
    <button
      className={`progress-button ${complete ? 'is-complete' : ''}`}
      type="button"
      aria-pressed={complete}
      title={complete ? 'Mark this lesson as not complete' : 'Mark this lesson complete'}
      onClick={() => setLessonComplete(lessonId, !complete)}
    >
      {complete ? <Check size={15} strokeWidth={2.75} /> : <CircleDashed size={15} strokeWidth={2.25} />}
      {complete ? 'Completed' : 'Mark complete'}
    </button>
  );
}

export default memo(ProgressButton);
