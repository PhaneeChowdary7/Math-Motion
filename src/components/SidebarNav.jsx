import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronRight, Search, X } from 'lucide-react';
import {
  getChapterProgress,
  getChapters,
  getLessonById,
  searchLessons,
} from '../lessons/catalog.js';
import { prefetchLesson } from '../lessons/registry.js';

function SidebarNav({ variant, currentId, progress, onNavigate }) {
  const [query, setQuery] = useState('');
  const chapters = useMemo(() => getChapters(), []);
  const currentChapter = getLessonById(currentId)?.chapter;
  const activeRef = useRef(null);
  const isRail = variant === 'rail';

  const [closed, setClosed] = useState(
    () => new Set(chapters.map((c) => c.name).filter((name) => name !== currentChapter))
  );

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

  function toggleChapter(name) {
    setClosed((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function renderLesson(lesson, { showChapter = false } = {}) {
    const isCurrent = lesson.id === currentId;

    if (lesson.status === 'soon') {
      return (
        <span className="nav-item-disabled" key={lesson.id} title={`${lesson.title} (coming soon)`}>
          <span className="nav-label">{lesson.title}</span>
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
        aria-label={lesson.title}
        aria-current={isCurrent ? 'page' : undefined}
        onMouseEnter={() => prefetchLesson(lesson.id)}
        onFocus={() => prefetchLesson(lesson.id)}
        onClick={onNavigate}
      >
        <span className="nav-label">
          {lesson.title}
          {showChapter && <small>{lesson.chapter}</small>}
        </span>
        {progress[lesson.id] && <Check className="nav-check" size={14} strokeWidth={2.75} />}
      </a>
    );
  }

  if (isRail) {
    return (
      <div className="nav-rail-groups">
        {chapters.map((chapter) => {
          const firstAvailable = chapter.lessons.find((lesson) => lesson.status !== 'soon');
          if (!firstAvailable) return null;

          const isCurrent = chapter.name === currentChapter;

          return (
            <a
              className={`nav-rail-chapter ${isCurrent ? 'active' : ''}`}
              href={`#${firstAvailable.slug}`}
              key={chapter.name}
              title={chapter.name}
              aria-label={`Open ${chapter.name}`}
              aria-current={isCurrent ? 'location' : undefined}
              onMouseEnter={() => prefetchLesson(firstAvailable.id)}
              onFocus={() => prefetchLesson(firstAvailable.id)}
              onClick={onNavigate}
            >
              {chapter.Icon ? <chapter.Icon size={17} /> : <span>{chapter.name.slice(0, 1)}</span>}
            </a>
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
            {results.map((lesson) => renderLesson(lesson, { showChapter: true }))}
          </div>
        ) : (
          <p className="nav-empty">No lessons match “{query.trim()}”.</p>
        )
      ) : (
        chapters.map((chapter) => {
          const isClosed = closed.has(chapter.name);
          const { completed, total } = getChapterProgress(chapter.name, progress);

          return (
            <div className="nav-section" key={chapter.name}>
              <button
                className="nav-chapter"
                type="button"
                aria-expanded={!isClosed}
                onClick={() => toggleChapter(chapter.name)}
              >
                <ChevronRight className={isClosed ? '' : 'rotated'} size={15} />
                {chapter.Icon && <chapter.Icon className="nav-chapter-icon" size={16} />}
                <span>{chapter.name}</span>
                <small>
                  {completed}/{total}
                </small>
              </button>

              {!isClosed && (
                <div className="nav-items">
                  {chapter.lessons.map((lesson) => renderLesson(lesson))}
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
