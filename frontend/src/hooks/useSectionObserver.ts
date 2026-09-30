import { useEffect, useState } from 'react';

const ATTR = 'data-kito-section';
const RE_QUERY_MS = 2000;

export function useSectionObserver(names: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const setup = () => {
      const elements = names
        .map((n) => document.querySelector(`[${ATTR}="${n}"]`))
        .filter((el): el is Element => el !== null);

      if (elements.length === 0) return;

      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          let best: IntersectionObserverEntry | null = null;
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
          }
          if (best) {
            setActive(best.target.getAttribute(ATTR));
          }
        },
        { threshold: [0.3, 0.5, 0.7] }
      );

      elements.forEach((el) => observer!.observe(el));
    };

    setup();
    const interval = window.setInterval(setup, RE_QUERY_MS);

    return () => {
      observer?.disconnect();
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names.join('|')]);

  return active;
}