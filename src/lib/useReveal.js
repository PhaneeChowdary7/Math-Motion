import { useEffect } from 'react';

export const REVEAL_SELECTOR = '.lesson-copy, .visual-card, .lesson-foot > *';

export function useReveal(ref, lessonId) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const targets = Array.from(root.querySelectorAll(REVEAL_SELECTOR));
    if (!targets.length) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      document.documentElement.classList.remove('reveal-ready');
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      },

      { rootMargin: '0px 0px -48px 0px' }
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [ref, lessonId]);
}
