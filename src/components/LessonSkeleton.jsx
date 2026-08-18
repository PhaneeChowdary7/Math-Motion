export default function LessonSkeleton() {
  return (
    <section className="lesson" aria-busy="true" aria-label="Loading lesson">
      <div className="lesson-copy">
        <span className="skeleton-line is-eyebrow" />
        <span className="skeleton-line is-title" />
        <span className="skeleton-line" />
        <span className="skeleton-line is-short" />
        <span className="skeleton-block" />
        <span className="skeleton-line" />
        <span className="skeleton-line is-short" />
      </div>

      <div className="visual-card">
        <span className="skeleton-line is-eyebrow" />
        <span className="skeleton-line is-short" />
        <span className="skeleton-plot" />
        <span className="skeleton-line" />
      </div>
    </section>
  );
}
