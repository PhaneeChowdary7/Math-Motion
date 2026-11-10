import { ArrowDown, ArrowRight, ArrowUpRight, Compass } from 'lucide-react';
import { chapterMotivations } from '../lessons/motivations.js';
import { getChapterProgress, getChapters, getLessonById } from '../lessons/catalog.js';
import { prefetchLesson } from '../lessons/registry.js';
import { useProgress } from '../lib/progress.js';

// Conceptual chapter artwork, rather than a plot of measured data.
function ChapterArt({ theme }) {
  return (
    <svg viewBox="0 0 280 240" fill="none" aria-hidden="true" className="motivation-art">
      <g className="motivation-art-grid">
        {[40, 80, 120, 160, 200, 240].map((x) => <path key={x} d={`M${x} 20V220`} />)}
        {[40, 80, 120, 160, 200].map((y) => <path key={y} d={`M20 ${y}H260`} />)}
      </g>
      <g className="motivation-art-ink" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {theme === 'ochre' && <>
          <path d="M28 120C58 22 88 22 118 120S178 218 208 120S238 22 258 80" />
          <path d="M28 145C88 145 128 135 158 110S208 55 258 30" className="motivation-art-secondary" />
          <circle cx="118" cy="120" r="6" className="motivation-art-dot" />
        </>}
        {theme === 'coral' && <>
          <path d="M32 200Q150 195 245 38V200Z" className="motivation-art-area" />
          <path d="M32 200Q150 195 245 38" />
          <path d="M95 208L235 78" className="motivation-art-secondary" />
          <circle cx="174" cy="135" r="6" className="motivation-art-dot" />
        </>}
        {theme === 'blue' && <>
          <path d="M55 190V70H175V190Z" className="motivation-art-secondary" />
          <path d="M55 190L110 50L238 85L183 225Z" className="motivation-art-area" />
          <path d="M55 190L110 50M55 190L183 225" />
          <path d="M98 58L110 50L113 65M173 214L183 225L168 228" />
          <circle cx="55" cy="190" r="5" className="motivation-art-dot" />
        </>}
        {theme === 'violet' && <>
          <path d="M140 35L75 110L38 200M75 110L112 200M140 35L205 110L168 200M205 110L242 200" className="motivation-art-secondary" />
          <path d="M140 35L205 110L168 200" />
          {[[140, 35], [75, 110], [205, 110], [38, 200], [112, 200], [168, 200], [242, 200]].map(([x, y]) =>
            <circle key={`${x}-${y}`} cx={x} cy={y} r="8" className="motivation-art-dot" />
          )}
        </>}
        {theme === 'teal' && <>
          <path d="M25 200C88 200 92 50 140 50S192 200 255 200" />
          <path d="M140 50V200M65 200H215" className="motivation-art-secondary" />
          {[58, 84, 110, 136, 162, 188, 214].map((x, i) =>
            <path key={x} d={`M${x} 200v-${[24, 57, 110, 138, 110, 57, 24][i]}`} strokeWidth="16" opacity="0.2" />
          )}
        </>}
      </g>
    </svg>
  );
}

export default function ChapterMotivation({ motivation }) {
  const progress = useProgress();
  const { chapter, theme, title, intro, applications, takeaway } = motivation;
  const chapters = getChapters();
  const chapterIndex = chapters.findIndex((entry) => entry.name === chapter);
  const lessons = chapters[chapterIndex].lessons.filter((lesson) => lesson.status !== 'soon');
  const { completed, total } = getChapterProgress(chapter, progress);
  const next = lessons.find((lesson) => !progress[lesson.id]) ?? getLessonById(motivation.start);
  const words = [title, intro, takeaway, ...applications.flatMap((entry) => [entry.title, entry.body, entry.connection])].join(' ').split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));

  return (
    <section className={`motivation-page motivation-theme-${theme}`} aria-labelledby="motivation-title">
      <header className="motivation-hero">
        <div className="motivation-kicker">
          <span>Chapter {String(chapterIndex + 1).padStart(2, '0')} / {chapter}</span>
          <span>{minutes} min read</span>
        </div>
        <div className="motivation-hero-grid">
          <div>
            <p className="motivation-overline"><Compass size={15} aria-hidden="true" /> Why learn this?</p>
            <h1 id="motivation-title">{title}</h1>
            <p className="motivation-intro">{intro}</p>
            <a className="motivation-begin" href={`#${next.slug}`} onMouseEnter={() => prefetchLesson(next.id)} onFocus={() => prefetchLesson(next.id)}>
              {completed > 0 && completed < total ? 'Continue this chapter' : 'Explore this chapter'}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
          <div className="motivation-cover">
            <span className="motivation-cover-index">{String(chapterIndex + 1).padStart(2, '0')}</span>
            <ChapterArt theme={theme} />
            <span className="motivation-cover-caption">{chapter}<ArrowDown size={16} aria-hidden="true" /></span>
          </div>
        </div>
      </header>

      <div className="motivation-body">
        <div className="motivation-applications">
          <h2 className="motivation-section-label">Where this shows up</h2>
          {applications.map((application, index) => {
            const lesson = getLessonById(application.lesson);
            return (
              <article className="motivation-application" key={application.title}>
                <span className="motivation-case-number" aria-hidden="true">0{index + 1}</span>
                <div>
                  <span className="motivation-field">{application.field}</span>
                  <h3>{application.title}</h3>
                  <p>{application.body}</p>
                  <a className="motivation-source" href={application.url} target="_blank" rel="noreferrer">
                    {application.source}<ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  <a className="motivation-lesson-link" href={`#${lesson.slug}`} onMouseEnter={() => prefetchLesson(lesson.id)} onFocus={() => prefetchLesson(lesson.id)}>
                    <span><strong>{application.connection}</strong><small>{lesson.title}</small></span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="motivation-takeaway" aria-labelledby="motivation-takeaway-title">
          <Compass size={26} strokeWidth={1.4} aria-hidden="true" />
          <h2 id="motivation-takeaway-title">What you take<br />with you.</h2>
          <p>{takeaway}</p>
          <div className="motivation-chapter-meta"><span>{total} interactive lessons</span><span>{completed} completed</span></div>
          <a href={`#${next.slug}`} onMouseEnter={() => prefetchLesson(next.id)} onFocus={() => prefetchLesson(next.id)}>
            <span>{completed > 0 && completed < total ? 'Next for you' : 'Start here'}<strong>{next.title}</strong></span>
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </aside>
      </div>

      <footer className="motivation-other-chapters">
        <h2>Follow your curiosity.</h2>
        <p>See where the other chapters lead.</p>
        <nav aria-label="Other chapter motivations">
          {chapterMotivations.filter((entry) => entry.chapter !== chapter).map((entry) => (
            <a className={`motivation-theme-${entry.theme}`} href={`#${entry.slug}`} key={entry.slug}>
              <span>{entry.chapter}</span><ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </footer>
    </section>
  );
}
