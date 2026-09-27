import { Check } from 'lucide-react';

const RADIUS = 15;
const LENGTH = 2 * Math.PI * RADIUS;

/**
 * One progress element for both rail states: the ring is the collapsed form of
 * the bar, so the two never drift apart. CSS reveals the detail when expanded.
 */
export default function RailProgress({ completed, total }) {
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const isComplete = percent === 100;

  return (
    <div
      className={`rail-progress ${isComplete ? 'is-complete' : ''}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`${completed} of ${total} lessons complete`}
      aria-label="Lessons completed"
      title={`${completed} of ${total} lessons complete`}
    >
      <div className="rail-progress-ring">
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <circle className="rail-progress-track" cx="18" cy="18" r={RADIUS} />
          <circle
            className="rail-progress-fill"
            cx="18"
            cy="18"
            r={RADIUS}
            strokeDasharray={LENGTH}
            strokeDashoffset={LENGTH * (1 - percent / 100)}
          />
        </svg>
        <span aria-hidden="true">{isComplete ? <Check size={13} strokeWidth={3} /> : completed}</span>
      </div>

      <div className="rail-progress-detail">
        <div className="rail-progress-head">
          <span>Progress</span>
          <strong>
            {completed} of {total}
          </strong>
        </div>
        <div className="rail-progress-bar">
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}
