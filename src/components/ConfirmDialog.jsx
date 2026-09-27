import { useEffect, useId, useRef } from 'react';

/**
 * An in-app replacement for window.confirm that wears the site's theme. Built on
 * <dialog>, so showModal() supplies the focus trap, Escape and the inert page.
 */
export default function ConfirmDialog({ open, title, children, confirmLabel, tone = 'default', onConfirm, onCancel }) {
  const ref = useRef(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      className="confirm-dialog"
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        // A click on the backdrop lands on the dialog element itself.
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="confirm-dialog-body">
        <h2 id={titleId}>{title}</h2>
        <p id={bodyId}>{children}</p>
        <div className="confirm-dialog-actions">
          <button className="chip" type="button" autoFocus onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`chip confirm-dialog-confirm ${tone === 'danger' ? 'is-danger' : ''}`}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
