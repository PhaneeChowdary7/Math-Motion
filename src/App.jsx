import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { BookOpen, Check, ChevronDown, ChevronRight, Moon, Sun } from 'lucide-react';
import { availableLessons, firstLesson, getLessonBySlug } from './lessons/catalog.js';
import { getLessonComponent } from './lessons/registry.js';
import BrandMark from './components/BrandMark.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import LessonSkeleton from './components/LessonSkeleton.jsx';
import SidebarNav from './components/SidebarNav.jsx';
import { useProgress } from './lib/progress.js';

const RING_RADIUS = 16;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function useMediaQuery(query) {
  const list = useMemo(() => window.matchMedia(query), [query]);

  const subscribe = useCallback(
    (onChange) => {
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [list]
  );

  return useSyncExternalStore(
    subscribe,
    () => list.matches,
    () => false
  );
}

function useCurrentLesson() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return getLessonBySlug(hash.replace(/^#/, '')) ?? firstLesson;
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('math-motion-theme') || 'light');
  const [contentsOpen, setContentsOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const progress = useProgress();
  const current = useCurrentLesson();
  const CurrentLesson = getLessonComponent(current.id);
  const isDesktop = useMediaQuery('(min-width: 1081px)');
  const railCollapsed = isDesktop && !railOpen;

  const completedCount = useMemo(
    () => availableLessons.reduce((total, lesson) => (progress[lesson.id] ? total + 1 : total), 0),
    [progress]
  );
  const percent = Math.round((completedCount / availableLessons.length) * 100);

  const closePanels = useCallback(() => {
    setRailOpen(false);
    setContentsOpen(false);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('math-motion-theme', theme);
  }, [theme]);

  const [routedFrom, setRoutedFrom] = useState(current.id);

  if (routedFrom !== current.id) {
    setRoutedFrom(current.id);
    setContentsOpen(false);
    setRailOpen(false);
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [current.id]);

  useEffect(() => {
    if (!railOpen && !contentsOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setRailOpen(false);
      setContentsOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [railOpen, contentsOpen]);

  useEffect(() => {
    if (!railOpen) return undefined;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [railOpen]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 1080px)');
    const onChange = (event) => {
      if (event.matches) setRailOpen(false);
    };

    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const themeButton = (
    <button
      className="icon-button theme-toggle"
      type="button"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );

  return (
    <div className="app">
      {railOpen && <div className="sidebar-scrim" onClick={() => setRailOpen(false)} aria-hidden="true" />}
      {contentsOpen && (
        <div className="contents-scrim" onClick={() => setContentsOpen(false)} aria-hidden="true" />
      )}

      <aside className={`sidebar ${railOpen ? 'is-open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <BrandMark size={24} />
            </span>
            <div className="brand-text">
              <strong>Math Motion</strong>
              <small>Visual learning lab</small>
            </div>
          </div>

          <div className="sidebar-actions">
            <button
              className="icon-button rail-toggle"
              type="button"
              aria-expanded={railOpen}
              aria-label={railOpen ? 'Collapse the menu' : 'Expand the menu'}
              title={railOpen ? 'Collapse the menu' : 'Expand the menu'}
              onClick={() => setRailOpen((open) => !open)}
            >
              <ChevronRight className={railOpen ? 'rotated' : ''} size={18} />
            </button>

            {!isDesktop && themeButton}
          </div>
        </div>

        <div className="sidebar-nav">
          <button
            className="toc-toggle"
            type="button"
            aria-expanded={contentsOpen}
            aria-controls="table-of-contents"
            onClick={() => setContentsOpen((open) => !open)}
          >
            <span>
              <BookOpen size={17} />
              Contents
            </span>
            <ChevronDown className={contentsOpen ? 'rotated' : ''} size={18} />
          </button>

          <nav className={`nav ${contentsOpen ? 'open' : ''}`} id="table-of-contents" aria-label="Table of contents">
            <SidebarNav
              variant={railCollapsed ? 'rail' : 'full'}
              currentId={current.id}
              progress={progress}
              onNavigate={closePanels}
            />
          </nav>
        </div>

        <div
          className={`progress-ring ${percent === 100 ? 'is-complete' : ''}`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={`${completedCount} of ${availableLessons.length} lessons complete`}
          aria-label="Lessons completed"
          title={`${completedCount} of ${availableLessons.length} lessons complete`}
        >
          <svg viewBox="0 0 38 38" aria-hidden="true">
            <circle className="progress-ring-track" cx="19" cy="19" r={RING_RADIUS} />
            <circle
              className="progress-ring-fill"
              cx="19"
              cy="19"
              r={RING_RADIUS}
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={RING_LENGTH * (1 - percent / 100)}
            />
          </svg>
          <span aria-hidden="true">
            {percent === 100 ? <Check size={14} strokeWidth={3} /> : completedCount}
          </span>
        </div>

        <div className="progress-meter">
          <div className="progress-meter-head">
            <span>Progress</span>
            <strong>
              {completedCount} of {availableLessons.length}
            </strong>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label="Lessons completed"
          >
            <span style={{ width: `${percent}%` }} />
          </div>
        </div>

        {isDesktop && <div className="sidebar-foot">{themeButton}</div>}
      </aside>

      <main className="main">

        <ErrorBoundary key={current.id}>
          <Suspense fallback={<LessonSkeleton />}>

            {CurrentLesson && <CurrentLesson lessonId={current.id} />}
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
