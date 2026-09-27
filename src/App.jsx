import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { ChevronDown, Moon, PanelLeftClose, PanelLeftOpen, Sun, UserRound } from 'lucide-react';
import { availableLessons, firstLesson, getLessonBySlug } from './lessons/catalog.js';
import { getLessonComponent } from './lessons/registry.js';
import BrandMark from './components/BrandMark.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import LessonSkeleton from './components/LessonSkeleton.jsx';
import RailProgress from './components/RailProgress.jsx';
import SidebarNav from './components/SidebarNav.jsx';
import { recordLessonVisit } from './lib/activity.js';
import { useProgress } from './lib/progress.js';

const ProfilePage = lazy(() => import('./components/ProfilePage.jsx'));
const PROFILE_HASH = '#profile';

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])';

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

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return hash;
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('math-motion-theme') || 'light');
  const [contentsOpen, setContentsOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(
    () => (localStorage.getItem('math-motion-rail') ?? 'open') === 'open'
  );
  const progress = useProgress();
  const hash = useHash();
  const isProfile = hash === PROFILE_HASH;
  const current = getLessonBySlug(hash.replace(/^#/, '')) ?? firstLesson;
  const routeKey = isProfile ? PROFILE_HASH : current.id;
  const CurrentLesson = getLessonComponent(current.id);
  const isDesktop = useMediaQuery('(min-width: 1081px)');
  const railCollapsed = isDesktop && !railOpen;
  const contentsRef = useRef(null);
  const tocButtonRef = useRef(null);

  const completedCount = useMemo(
    () => availableLessons.reduce((total, lesson) => (progress[lesson.id] ? total + 1 : total), 0),
    [progress]
  );
  const percent = Math.round((completedCount / availableLessons.length) * 100);

  const closeContents = useCallback(() => setContentsOpen(false), []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('math-motion-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('math-motion-rail', railOpen ? 'open' : 'closed');
  }, [railOpen]);

  const [routedFrom, setRoutedFrom] = useState(routeKey);

  // The rail is a persistent surface now, so navigation only dismisses the
  // mobile contents sheet.
  if (routedFrom !== routeKey) {
    setRoutedFrom(routeKey);
    setContentsOpen(false);
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [routeKey]);

  useEffect(() => {
    if (!isProfile) recordLessonVisit(current.id);
  }, [isProfile, current.id]);

  useEffect(() => {
    if (!contentsOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setContentsOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [contentsOpen]);

  // The mobile contents sheet is modal: lock the page, trap the tab ring, and
  // hand focus back to the trigger on close.
  useEffect(() => {
    if (!contentsOpen || isDesktop) return undefined;

    const node = contentsRef.current;
    const trigger = tocButtonRef.current;
    if (!node) return undefined;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    node.focus({ preventScroll: true });

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return;

      const items = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (item) => item.offsetParent !== null
      );

      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !node.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !node.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      trigger?.focus({ preventScroll: true });
    };
  }, [contentsOpen, isDesktop]);

  const themeButton = (
    <button
      className="icon-button theme-toggle"
      type="button"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      onClick={() => setTheme((value) => (value === 'light' ? 'dark' : 'light'))}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );

  // Profile sits beside the theme switch wherever the switch lives: the
  // sidebar foot on desktop, the sidebar header on tablet and mobile.
  const utilityButtons = (
    <div className="utility-buttons">
      <a
        className={`icon-button profile-button ${isProfile ? 'is-active' : ''}`}
        href={PROFILE_HASH}
        aria-label="Your profile and activity"
        aria-current={isProfile ? 'page' : undefined}
        title="Your profile and activity"
      >
        <UserRound size={18} />
      </a>
      {themeButton}
    </div>
  );

  return (
    <div className={`app ${railOpen ? 'is-rail-open' : ''}`}>
      {/* Focus main directly: this app hash-routes, so a real #hash jump would
          be read as a lesson slug and bounce the reader to lesson one. */}
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        Skip to content
      </a>

      <div className="progress-hairline" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>

      {contentsOpen && (
        <div className="contents-scrim" onClick={closeContents} aria-hidden="true" />
      )}

      <aside className={`sidebar ${railOpen ? 'is-open' : ''}`}>
        <div className="sidebar-top">
          <a className="brand" href={`#${firstLesson.slug}`} aria-label="Math Motion home">
            <span className="brand-mark" aria-hidden="true">
              <BrandMark size={26} />
            </span>
            <span className="brand-text">
              <strong>Math Motion</strong>
              <small>Visual learning lab</small>
            </span>
          </a>

          <div className="sidebar-actions">
            <button
              className="icon-button rail-toggle"
              type="button"
              aria-expanded={railOpen}
              aria-label={railOpen ? 'Collapse the sidebar' : 'Expand the sidebar'}
              title={railOpen ? 'Collapse the sidebar' : 'Expand the sidebar'}
              onClick={() => setRailOpen((open) => !open)}
            >
              {railOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>

            {!isDesktop && utilityButtons}
          </div>
        </div>

        <div className="sidebar-nav">
          <button
            className="toc-toggle"
            type="button"
            ref={tocButtonRef}
            aria-expanded={contentsOpen}
            aria-controls="table-of-contents"
            aria-label={contentsOpen ? 'Close table of contents' : 'Open table of contents'}
            onClick={() => setContentsOpen((open) => !open)}
          >
            <span className="toc-toggle-text">
              <small>{isProfile ? 'Profile' : current.chapter}</small>
              <strong>{isProfile ? 'Progress & activity' : current.title}</strong>
            </span>
            <span className="toc-toggle-meta">
              <span className="toc-toggle-count">
                {completedCount}/{availableLessons.length}
              </span>
              <ChevronDown className={contentsOpen ? 'rotated' : ''} size={18} />
            </span>
          </button>

          <nav
            className={`nav ${contentsOpen ? 'open' : ''}`}
            id="table-of-contents"
            ref={contentsRef}
            tabIndex={isDesktop ? undefined : -1}
            role={isDesktop ? undefined : 'dialog'}
            aria-modal={!isDesktop && contentsOpen ? 'true' : undefined}
            aria-label="Table of contents"
          >
            <SidebarNav
              variant={railCollapsed ? 'rail' : 'full'}
              currentId={isProfile ? null : current.id}
              progress={progress}
              onNavigate={closeContents}
            />
          </nav>
        </div>

        {isDesktop && <div className="sidebar-foot">{utilityButtons}</div>}

        <RailProgress completed={completedCount} total={availableLessons.length} />
      </aside>

      <main className="main" id="main-content" tabIndex={-1}>
        <ErrorBoundary key={routeKey}>
          <Suspense fallback={<LessonSkeleton />}>
            {isProfile ? <ProfilePage /> : CurrentLesson && <CurrentLesson lessonId={current.id} />}
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
