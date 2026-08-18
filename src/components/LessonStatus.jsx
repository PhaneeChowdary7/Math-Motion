import { memo } from 'react';
import ProgressButton from './ProgressButton.jsx';
import { getPosition } from '../lessons/catalog.js';

function LessonStatus({ lessonId }) {
  const position = getPosition(lessonId);

  return (
    <div className="status-row">
      <span>
        {position ? `Lesson ${position.index} of ${position.total} · ${position.chapter}` : null}
      </span>
      <ProgressButton lessonId={lessonId} />
    </div>
  );
}

export default memo(LessonStatus);
