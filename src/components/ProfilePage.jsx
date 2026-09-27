import { useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Download, Flame, GraduationCap, Pencil, RotateCcw, Trophy, User } from 'lucide-react';
import ActivityHeatmap from './ActivityHeatmap.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import {
  availableLessons,
  getChapterProgress,
  getChapters,
  getLessonById,
} from '../lessons/catalog.js';
import {
  buildCalendar,
  clearActivity,
  getStreaks,
  parseKey,
  setProfileName,
  useActivity,
} from '../lib/activity.js';
import { useProgress } from '../lib/progress.js';

const shortDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const monthYear = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });

function exportData() {
  const data = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith('math-motion')) continue;
    try {
      data[key] = JSON.parse(localStorage.getItem(key));
    } catch {
      data[key] = localStorage.getItem(key);
    }
  }

  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'math-motion-progress.json';
  link.click();
  URL.revokeObjectURL(url);
}

function NameEditor({ name }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  function save() {
    setProfileName(draft.trim());
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="profile-name">
        <h1>{name || 'Your profile'}</h1>
        <button
          className="icon-button"
          type="button"
          aria-label="Edit your name"
          title="Edit your name"
          onClick={() => {
            setDraft(name);
            setEditing(true);
          }}
        >
          <Pencil size={15} />
        </button>
      </div>
    );
  }

  return (
    <form
      className="profile-name is-editing"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <input
        aria-label="Your name"
        autoFocus
        maxLength={40}
        placeholder="Your name"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setEditing(false);
        }}
      />
      <button className="chip selected" type="submit">
        Save
      </button>
    </form>
  );
}

export default function ProfilePage() {
  const activity = useActivity();
  const progress = useProgress();
  const [confirmClear, setConfirmClear] = useState(false);
  const chapters = getChapters();

  const completed = availableLessons.filter((lesson) => progress[lesson.id]).length;
  const percent = Math.round((completed / availableLessons.length) * 100);
  const streaks = useMemo(() => getStreaks(activity.days), [activity.days]);
  const { activeDays } = useMemo(() => buildCalendar(activity.days), [activity.days]);

  const latest = useMemo(
    () =>
      Object.entries(activity.completedOn)
        .map(([id, key]) => ({ lesson: getLessonById(id), key }))
        .filter((entry) => entry.lesson && progress[entry.lesson.id])
        .sort((a, b) => b.key.localeCompare(a.key))[0] ?? null,
    [activity.completedOn, progress]
  );

  const lastLesson = activity.lastLesson ? getLessonById(activity.lastLesson) : null;
  const nextLesson = availableLessons.find((lesson) => !progress[lesson.id]) ?? null;
  const initial = activity.name.trim().charAt(0).toUpperCase();

  const stats = [
    { Icon: GraduationCap, label: 'Lessons completed', value: `${completed}`, detail: `of ${availableLessons.length} · ${percent}%` },
    { Icon: Flame, label: 'Current streak', value: `${streaks.current}`, detail: streaks.current === 1 ? 'day' : 'days' },
    { Icon: Trophy, label: 'Longest streak', value: `${streaks.longest}`, detail: streaks.longest === 1 ? 'day' : 'days' },
    { Icon: CalendarDays, label: 'Active days', value: `${activeDays}`, detail: 'in the last year' },
  ];

  return (
    <section className="profile" aria-labelledby="profile-heading">
      <header className="profile-head">
        <span className="profile-avatar" aria-hidden="true">
          {initial || <User size={26} />}
        </span>
        <div>
          <span className="eyebrow" id="profile-heading">
            Profile
          </span>
          <NameEditor key={activity.name} name={activity.name} />
          <p>
            {activity.since
              ? `Learning since ${monthYear.format(parseKey(activity.since))}.`
              : 'Open a lesson to start your activity history.'}
          </p>
        </div>
      </header>

      <div className="profile-stats">
        {stats.map(({ Icon, label, value, detail }) => (
          <div className="profile-stat" key={label}>
            <span className="profile-stat-label">
              <Icon size={15} aria-hidden="true" />
              {label}
            </span>
            <strong>{value}</strong>
            <small>{detail}</small>
          </div>
        ))}
      </div>

      <section className="profile-card">
        <div className="profile-card-head">
          <h2>Activity</h2>
        </div>
        <ActivityHeatmap days={activity.days} since={activity.since} />
      </section>

      <div className="profile-columns">
        <section className="profile-card">
          <div className="profile-card-head">
            <h2>Progress by chapter</h2>
          </div>
          <ul className="chapter-progress">
            {chapters.map((chapter) => {
              const { completed: done, total } = getChapterProgress(chapter.name, progress);
              const Icon = chapter.Icon;
              return (
                <li key={chapter.name}>
                  <div className="chapter-progress-head">
                    <span>
                      {Icon ? <Icon size={15} aria-hidden="true" /> : null}
                      {chapter.name}
                    </span>
                    <strong>
                      {done}/{total}
                    </strong>
                  </div>
                  <div
                    className="chapter-progress-bar"
                    role="progressbar"
                    aria-label={`${chapter.name} progress`}
                    aria-valuemin={0}
                    aria-valuemax={total}
                    aria-valuenow={done}
                  >
                    <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="profile-card">
          <div className="profile-card-head">
            <h2>Keep going</h2>
          </div>
          <div className="profile-links">
            {lastLesson ? (
              <a className="profile-link" href={`#${lastLesson.slug}`}>
                <span>
                  <small>Last opened</small>
                  {lastLesson.title}
                </span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            ) : null}
            {nextLesson && nextLesson.id !== lastLesson?.id ? (
              <a className="profile-link" href={`#${nextLesson.slug}`}>
                <span>
                  <small>Next not completed</small>
                  {nextLesson.title}
                </span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            ) : null}
          </div>

          <h3 className="profile-subhead">Recently completed</h3>
          {latest ? (
            <ul className="profile-recent">
              <li>
                <a href={`#${latest.lesson.slug}`}>{latest.lesson.title}</a>
                <span>{shortDate.format(parseKey(latest.key))}</span>
              </li>
            </ul>
          ) : (
            <p className="profile-empty">Mark a lesson complete and it will appear here.</p>
          )}
        </section>
      </div>

      <footer className="profile-data">
        <button className="chip" type="button" onClick={exportData}>
          <Download size={14} aria-hidden="true" />
          Export my data
        </button>
        <button
          className="chip"
          type="button"
          onClick={() => setConfirmClear(true)}
        >
          <RotateCcw size={14} aria-hidden="true" />
          Clear activity history
        </button>
      </footer>

      <ConfirmDialog
        open={confirmClear}
        title="Clear activity history?"
        confirmLabel="Clear history"
        tone="danger"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearActivity();
          setConfirmClear(false);
        }}
      >
        Your activity map and streaks will be reset. Completed lessons and notes are kept.
      </ConfirmDialog>
    </section>
  );
}
