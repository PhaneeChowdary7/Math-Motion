import { memo, useState } from 'react';
import { Check, ChevronDown, Download, MessageSquare, Pencil, Star, Trash2 } from 'lucide-react';
import {
  clearLessonFeedback,
  exportFeedback,
  setLessonFeedback,
  useFeedbackCount,
  useLessonFeedback,
} from '../lib/feedback.js';

const RATINGS = [1, 2, 3, 4, 5];
const LABELS = ['Confusing', 'Rough', 'Fine', 'Good', 'Excellent'];

function download() {
  const payload = JSON.stringify(exportFeedback(), null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const link = document.createElement('a');

  link.href = url;
  link.download = 'math-motion-feedback.json';
  link.click();

  URL.revokeObjectURL(url);
}

function Feedback({ lessonId }) {
  const saved = useLessonFeedback(lessonId);
  const total = useFeedbackCount();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(saved?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(saved?.comment ?? '');

  const showForm = editing || !saved;
  const shown = hovered || rating;
  const canSubmit = Boolean(rating) || comment.trim().length > 0;

  function submit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setLessonFeedback(lessonId, { rating: rating || null, comment });
    setEditing(false);
  }

  function edit() {
    setRating(saved?.rating ?? 0);
    setComment(saved?.comment ?? '');
    setEditing(true);
  }

  function remove() {
    clearLessonFeedback(lessonId);
    setRating(0);
    setComment('');
    setEditing(false);
  }

  function onStarKeyDown(event) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') setRating((r) => Math.min(5, r + 1));
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') setRating((r) => Math.max(1, r - 1));
    else return;

    event.preventDefault();
  }

  const summary = saved?.rating ? `${saved.rating}/5` : saved?.comment ? 'commented' : null;

  return (
    <section className={`feedback ${open ? 'is-open' : ''}`} aria-labelledby="feedback-heading">
      <button
        className="feedback-head"
        type="button"
        aria-expanded={open}
        aria-controls="feedback-panel"
        onClick={() => setOpen((current) => !current)}
      >
        <MessageSquare size={16} />
        <span id="feedback-heading">How was this lesson?</span>
        {summary && <small>{summary}</small>}
        <ChevronDown className={open ? 'rotated' : ''} size={18} />
      </button>

      {!open ? null : showForm ? (
        <form className="feedback-body" id="feedback-panel" onSubmit={submit}>
          <div
            className="feedback-stars"
            role="radiogroup"
            aria-label="Rate this lesson"
            onMouseLeave={() => setHovered(0)}
            onKeyDown={onStarKeyDown}
          >
            {RATINGS.map((value) => (
              <button
                className={`feedback-star ${value <= shown ? 'is-on' : ''}`}
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                aria-label={`${value} of 5, ${LABELS[value - 1]}`}
                tabIndex={rating === value || (!rating && value === 1) ? 0 : -1}
                onMouseEnter={() => setHovered(value)}
                onClick={() => setRating((current) => (current === value ? 0 : value))}
              >
                <Star size={22} strokeWidth={2} />
              </button>
            ))}

            <span className="feedback-stars-label">{shown ? LABELS[shown - 1] : 'Tap a star'}</span>
          </div>

          <textarea
            className="feedback-comment"
            value={comment}
            placeholder="What worked, what did not, anything you would change?"
            aria-label="Feedback comment"
            onChange={(event) => setComment(event.target.value)}
          />

          <div className="feedback-actions">
            <button className="feedback-submit" type="submit" disabled={!canSubmit}>
              {saved ? 'Update feedback' : 'Send feedback'}
            </button>

            {saved && (
              <button className="feedback-link" type="button" onClick={() => setEditing(false)}>
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="feedback-body" id="feedback-panel">
          <div className="feedback-saved">
            <span className="feedback-saved-mark">
              <Check size={14} strokeWidth={3} />
            </span>
            <div>
              <strong>Thanks for the feedback.</strong>
              {saved.rating ? (
                <span className="feedback-saved-stars" aria-label={`You rated ${saved.rating} of 5`}>
                  {RATINGS.map((value) => (
                    <Star
                      className={value <= saved.rating ? 'is-on' : ''}
                      key={value}
                      size={14}
                      strokeWidth={2.5}
                    />
                  ))}
                  <small>{LABELS[saved.rating - 1]}</small>
                </span>
              ) : null}
            </div>
          </div>

          {saved.comment ? <p className="feedback-saved-comment">{saved.comment}</p> : null}

          <div className="feedback-actions">
            <button className="feedback-link" type="button" onClick={edit}>
              <Pencil size={13} />
              Edit
            </button>
            <button className="feedback-link is-danger" type="button" onClick={remove}>
              <Trash2 size={13} />
              Remove
            </button>
          </div>
        </div>
      )}

      {open && total > 0 && (
        <button className="feedback-export" type="button" onClick={download}>
          <Download size={13} />
          Export all feedback ({total} {total === 1 ? 'lesson' : 'lessons'})
        </button>
      )}
    </section>
  );
}

export default memo(Feedback);
