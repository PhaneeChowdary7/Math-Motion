import { useCallback, useEffect, useRef, useState } from 'react';

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function usePlayback(step) {
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef(0);
  const stepRef = useRef(step);

  useEffect(() => {
    stepRef.current = step;
  });

  const stop = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    setPlaying(false);
  }, []);

  const start = useCallback(
    (duration = 2400) => {
      cancelAnimationFrame(frameRef.current);

      if (prefersReducedMotion()) {
        stepRef.current(1);
        return;
      }

      const startedAt = performance.now();
      setPlaying(true);

      const tick = (now) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        stepRef.current(easeOutCubic(progress));

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          setPlaying(false);
        }
      };

      frameRef.current = requestAnimationFrame(tick);
    },
    []
  );

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  return { playing, start, stop };
}
