import { RotateCcw } from 'lucide-react';

export default function ResetButton({ values, defaults, onReset }) {
  const pristine = Object.keys(defaults).every((key) => values[key] === defaults[key]);

  return (
    <button
      className="icon-button reset-button"
      type="button"
      disabled={pristine}
      onClick={onReset}
      title={pristine ? 'Plot is at its starting state' : 'Reset the plot'}
      aria-label="Reset the plot to its starting state"
    >
      <RotateCcw size={16} />
    </button>
  );
}
