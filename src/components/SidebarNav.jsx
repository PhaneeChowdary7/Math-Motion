import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronRight, Lock, Search, X } from 'lucide-react';
import {
  getChapterProgress,
  getChapters,
  getLessonById,
  searchLessons,
} from '../lessons/catalog.js';
import { prefetchLesson } from '../lessons/registry.js';

// Measuring the marker must happen before paint on the client; server renders
// have nothing to measure, and useLayoutEffect would only warn there. Probe for
// a real DOM rather than `window`, which the smoke harness shims.
const hasDom = typeof document !== 'undefined' && typeof document.createElement === 'function';
const useIsomorphicLayoutEffect = hasDom ? useLayoutEffect : useEffect;

const RING_RADIUS = 18;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

// Longest chapter-icon animation in styles.css, stagger included.
const ICON_MOTION_MS = 900;

// Play the chapter icon's motion once per hover. The class stays until the
// animation has finished, so leaving early never snaps an icon mid-turn.
function playChapterIcon(event) {
  const icon = event.currentTarget.querySelector('svg.lucide:not(.lucide-chevron-right)');
  if (!icon || icon.classList.contains('is-playing')) return;
  icon.classList.add('is-playing');
  window.setTimeout(() => icon.classList.remove('is-playing'), ICON_MOTION_MS);
}

function SidebarNav({ variant, currentId, progress, onNavigate }) {
  const [query, setQuery] = useState('');
  const [flyout, setFlyout] = useState(null);
  const [marker, setMarker] = useState(null);
  const [settled, setSettled] = useState(false);
  const chapters = useMemo(() => getChapters(), []);
  const currentChapter = getLessonById(currentId)?.chapter;
  const activeRef = useRef(null);
  const isRail = variant === 'rail';

  const [closed, setClosed] = useState(
    () => new Set(chapters.map((c) => c.name).filter((name) => name !== currentChapter))
  );

  const [lastVariant, setLastVariant] = useState(variant);

  if (lastVariant !== variant) {
    setLastVariant(variant);
    if (flyout) setFlyout(null);
  }

  const [lastChapter, setLastChapter] = useState(currentChapter);

  if (lastChapter !== currentChapter) {
    setLastChapter(currentChapter);

    if (currentChapter && closed.has(currentChapter)) {
      const next = new Set(closed);
      next.delete(currentChapter);
      setClosed(next);
    }
  }

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [currentId, variant]);

  // Park the sliding indicator on the active lesson. `.nav-items` is the
  // offset parent, so these coordinates are already local to the list.
  useIsomorphicLayoutEffect(() => {
    const el = activeRef.current;

    if (!el || isRail) {
      setMarker(null);
      return undefined;
    }

    setMarker({ top: el.offsetTop, height: el.offsetHeight });

    if (settled) return undefined;

    const frame = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(frame);
  }, [currentId, closed, query, isRail, settled]);

  // Rail flyouts are desktop-hover affordances; Escape is the way out.
  useEffect(() => {
    if (!flyout) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setFlyout(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [flyout]);

  function toggleChapter(name) {
    setClosed((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function handleNavigate() {
    setFlyout(null);
    onNavigate?.();
  }

  function closeFlyout(event) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setFlyout(null);
  }

  function renderLesson(lesson, position, { showChapter = false } = {}) {
    const isCurrent = lesson.id === currentId;
    const isDone = Boolean(progress[lesson.id]);

    const gutter =
      lesson.status === 'soon' ? (
        <Lock size={11} strokeWidth={2.5} />
      ) : isDone ? (
        <Check size={12} strokeWidth={3} />
      ) : (
        position
      );

    const label = (
      <>
        <span className={`nav-index ${isDone ? 'is-done' : ''}`} aria-hidden="true">
          {gutter}
        </span>
        <span className="nav-label">
          <span className="nav-title">{lesson.title}</span>
          {showChapter && <small>{lesson.chapter}</small>}
        </span>
      </>
    );

    if (lesson.status === 'soon') {
      return (
        <span className="nav-item-disabled" key={lesson.id} title={`${lesson.title} (coming soon)`}>
          {label}
        </span>
      );
    }

    return (
      <a
        className={isCurrent ? 'active' : ''}
        href={`#${lesson.slug}`}
        key={lesson.id}
        ref={isCurrent ? activeRef : null}
        title={lesson.title}
        aria-label={isDone ? `${lesson.title} (completed)` : lesson.title}
        aria-current={isCurrent ? 'page' : undefined}
        onMouseEnter={() => prefetchLesson(lesson.id)}
        onFocus={() => prefetchLesson(lesson.id)}
        onClick={handleNavigate}
      >
        {label}
      </a>
    );
  }

  if (isRail) {
    return (
      <div className="nav-rail-groups" onMouseLeave={() => setFlyout(null)}>
        {chapters.map((chapter) => {
          const openable = chapter.lessons.some((lesson) => lesson.status !== 'soon');
          if (!openable) return null;

          const isCurrent = chapter.name === currentChapter;
          const isOpen = flyout === chapter.name;
          const { completed, total } = getChapterProgress(chapter.name, progress);
          const filled = total ? completed / total : 0;

          return (
            <div
              className="nav-rail-item"
              key={chapter.name}
              onMouseEnter={() => setFlyout(chapter.name)}
              onBlur={closeFlyout}
            >
              <button
                className={`nav-rail-chapter ${isCurrent ? 'active' : ''} ${isOpen ? 'is-open' : ''}`}
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label={`${chapter.name}, ${completed} of ${total} complete`}
                onPointerEnter={playChapterIcon}
                onFocus={(event) => {
                  playChapterIcon(event);
                  setFlyout(chapter.name);
                }}
                onClick={() => setFlyout((open) => (open === chapter.name ? null : chapter.name))}
              >
                <svg className="rail-ring" viewBox="0 0 42 42" aria-hidden="true">
                  <circle className="rail-ring-track" cx="21" cy="21" r={RING_RADIUS} />
                  <circle
                    className="rail-ring-fill"
                    cx="21"
                    cy="21"
                    r={RING_RADIUS}
                    strokeDasharray={RING_LENGTH}
                    strokeDashoffset={RING_LENGTH * (1 - filled)}
                  />
                </svg>
                {chapter.Icon ? (
                  <chapter.Icon size={17} />
                ) : (
                  <span>{chapter.name.slice(0, 1)}</span>
                )}
              </button>

              <div className="rail-flyout" hidden={!isOpen}>
                <div className="rail-flyout-head">
                  <span>{chapter.name}</span>
                  <small>
                    {completed}/{total}
                  </small>
                </div>
                <div className="nav-items is-flat">
                  {chapter.lessons.map((lesson, index) => renderLesson(lesson, index + 1))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const results = searchLessons(query);

  return (
    <>
      <div className="nav-search">
        <Search size={15} aria-hidden="true" />
        <input
          type="search"
          value={query}
          placeholder="Search lessons"
          aria-label="Search lessons"
          onChange={(event) => setQuery(event.target.value)}
        />
        {query && (
          <button type="button" aria-label="Clear search" onClick={() => setQuery('')}>
            <X size={14} />
          </button>
        )}
      </div>

      {results ? (
        results.length ? (
          <div className="nav-items is-flat">
            {results.map((lesson, index) => renderLesson(lesson, index + 1, { showChapter: true }))}
          </div>
        ) : (
          <p className="nav-empty">No lessons match “{query.trim()}”.</p>
        )
      ) : (
        chapters.map((chapter) => {
          const isClosed = closed.has(chapter.name);
          const { completed, total } = getChapterProgress(chapter.name, progress);
          const holdsMarker = marker && chapter.name === currentChapter && !isClosed;

          return (
            <div className="nav-section" key={chapter.name}>
              <button
                className="nav-chapter"
                type="button"
                aria-expanded={!isClosed}
                onPointerEnter={playChapterIcon}
                onFocus={playChapterIcon}
                onClick={() => toggleChapter(chapter.name)}
              >
                <ChevronRight className={isClosed ? '' : 'rotated'} size={14} />
                {chapter.Icon && <chapter.Icon className="nav-chapter-icon" size={15} />}
                <span>{chapter.name}</span>
                <small>
                  {completed}/{total}
                </small>
              </button>

              {!isClosed && (
                <div className="nav-items">
                  {holdsMarker && (
                    <span
                      className={`nav-marker ${settled ? 'is-settled' : ''}`}
                      aria-hidden="true"
                      style={{
                        transform: `translateY(${marker.top}px)`,
                        height: `${marker.height}px`,
                      }}
                    />
                  )}
                  {chapter.lessons.map((lesson, index) => renderLesson(lesson, index + 1))}
                </div>
              )}
            </div>
          );
        })
      )}
    </>
  );
}

export default memo(SidebarNav);
