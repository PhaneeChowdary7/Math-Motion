import { useEffect } from 'react';

export const REVEAL_SELECTOR = '.lesson-copy, .visual-card, .lesson-side > .story, .lesson-foot > *';

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
          // A data attribute, not a class: React owns className on these
          // nodes and would wipe an imperatively added class on its next
          // render, stranding the element at opacity 0.
          entry.target.dataset.revealed = 'true';
          observer.unobserve(entry.target);
        }
      },

      { rootMargin: '0px 0px -48px 0px' }
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [ref, lessonId]);
}
