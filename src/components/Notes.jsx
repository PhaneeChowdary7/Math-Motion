import { memo, useEffect, useRef, useState } from 'react';
import { ChevronDown, NotebookPen, Trash2 } from 'lucide-react';
import { setLessonNote, useLessonNote } from '../lib/notes.js';

const SAVE_DELAY = 400;

const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

function Notes({ lessonId }) {
  const saved = useLessonNote(lessonId);
  const [draft, setDraft] = useState(saved);
  const [open, setOpen] = useState(() => Boolean(saved));
  const [confirmingClear, setConfirmingClear] = useState(false);

  const pending = draft !== saved;
  const words = countWords(draft);

  const latest = useRef({ lessonId, draft, saved });

  useEffect(() => {
    latest.current = { lessonId, draft, saved };
  });

  useEffect(() => {
    if (!pending) return undefined;

    const timer = setTimeout(() => setLessonNote(lessonId, draft), SAVE_DELAY);
    return () => clearTimeout(timer);
  }, [draft, pending, lessonId]);

  useEffect(() => {
    const flush = () => {
      const current = latest.current;
      if (current.draft !== current.saved) setLessonNote(current.lessonId, current.draft);
    };

    window.addEventListener('pagehide', flush);

    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);

  function clear() {
    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }

    setDraft('');
    setLessonNote(lessonId, '');
    setConfirmingClear(false);
  }

  return (
    <section className={`notes ${open ? 'is-open' : ''}`} aria-labelledby="notes-heading">
      <button
        className="notes-head"
        type="button"
        aria-expanded={open}
        aria-controls="notes-panel"
        onClick={() => setOpen((current) => !current)}
      >
        <NotebookPen size={16} />
        <span id="notes-heading">My notes</span>
        {words > 0 && <small>{words} {words === 1 ? 'word' : 'words'}</small>}
        <ChevronDown className={open ? 'rotated' : ''} size={18} />
      </button>

      {open && (
        <div className="notes-panel" id="notes-panel">
          <textarea
            className="notes-input"
            value={draft}
            placeholder="Jot down what clicked, what did not, and anything to revisit."
            aria-label={`Notes for this lesson`}
            spellCheck="true"
            onChange={(event) => {
              setDraft(event.target.value);
              setConfirmingClear(false);
            }}
          />

          {(words > 0 || confirmingClear) && (
            <div className="notes-foot">
              <button
                className={`notes-clear ${confirmingClear ? 'is-confirming' : ''}`}
                type="button"
                onClick={clear}
                onBlur={() => setConfirmingClear(false)}
              >
                <Trash2 size={13} />
                {confirmingClear ? 'Tap again to erase' : 'Clear'}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default memo(Notes);
