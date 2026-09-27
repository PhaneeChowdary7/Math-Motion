import { useCallback, useEffect, useRef, useState } from 'react';

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * A linear, scrubbable clock for story scenes. `t` runs 0 → 1 over `duration`
 * ms. Unlike usePlayback there is no easing: scenes map time to motion
 * themselves, so a car at constant speed really moves at constant speed.
 */
export function useTimeline(duration, initial = 0) {
  const [t, setT] = useState(initial);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const frame = useRef(0);
  const tRef = useRef(initial);
  const speedRef = useRef(1);

  // Read by the running frame loop, so a change applies mid-play without a restart.
  const setSpeed = useCallback((value) => {
    speedRef.current = value;
    setSpeedState(value);
  }, []);

  const set = useCallback((value) => {
    tRef.current = value;
    setT(value);
  }, []);

  const pause = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    cancelAnimationFrame(frame.current);

    // Reduced motion: show the finished scene rather than animating to it.
    if (prefersReducedMotion()) {
      set(1);
      setPlaying(false);
      return;
    }

    if (tRef.current >= 1) set(0);
    setPlaying(true);
    let last = performance.now();

    const tick = (now) => {
      const next = Math.min(1, tRef.current + (Math.min(now - last, 64) * speedRef.current) / duration);
      last = now;
      set(next);

      if (next < 1) frame.current = requestAnimationFrame(tick);
      else {
        frame.current = 0;
        setPlaying(false);
      }
    };

    frame.current = requestAnimationFrame(tick);
  }, [duration, set]);

  const seek = useCallback(
    (value) => {
      pause();
      set(Math.min(1, Math.max(0, value)));
    },
    [pause, set]
  );

  const replay = useCallback(() => {
    set(0);
    play();
  }, [play, set]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return { t, playing, speed, setSpeed, play, pause, seek, replay };
}

// Helpers scenes use to turn global time into local motion.
export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const lerp = (a, b, k) => a + (b - a) * k;
/** Progress 0 → 1 through the window [start, end] of the timeline. */
export const phase = (t, start, end) => clamp((t - start) / (end - start));
export const smooth = (k) => k * k * (3 - 2 * k);

/** A small seeded PRNG so random-looking scenes replay identically. */
export function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let x = Math.imul(state ^ (state >>> 15), 1 | state);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
