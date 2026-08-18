import { Component } from 'react';
import { RotateCcw, TriangleAlert } from 'lucide-react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <section className="lesson-error" role="alert">
        <span className="lesson-error-mark" aria-hidden="true">
          <TriangleAlert size={20} />
        </span>
        <h2>This lesson could not be loaded</h2>
        <p>
          The connection may have dropped, or the site may have been updated while this page was
          open. Reloading usually fixes it.
        </p>
        <button className="progress-button" type="button" onClick={() => window.location.reload()}>
          <RotateCcw size={15} />
          Reload the page
        </button>
      </section>
    );
  }
}
