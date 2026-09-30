import { useEffect, useRef, useState } from 'react';

export function useScrollVelocity(): number {
  const [velocity, setVelocity] = useState(0);
  const ref = useRef({
    lastY: 0,
    lastT: 0,
    lastEventT: 0,
    smoothed: 0,
  });

  useEffect(() => {
    ref.current.lastY = window.scrollY;
    ref.current.lastT = performance.now();
    ref.current.lastEventT = performance.now();

    let raf: number | null = null;

    const compute = () => {
      const now = performance.now();
      const dt = now - ref.current.lastT;
      const dy = window.scrollY - ref.current.lastY;
      if (dt > 0) {
        const raw = (dy / dt) * 1000;
        // Exponential smoothing so a single jittery event doesn't spike the state.
        ref.current.smoothed = ref.current.smoothed * 0.7 + raw * 0.3;
        setVelocity(ref.current.smoothed);
      }
      ref.current.lastY = window.scrollY;
      ref.current.lastT = now;
      ref.current.lastEventT = now;
      raf = null;
    };

    const onScroll = () => {
      if (raf === null) raf = requestAnimationFrame(compute);
    };

    const decay = window.setInterval(() => {
      const since = performance.now() - ref.current.lastEventT;
      if (since > 80 && ref.current.smoothed !== 0) {
        ref.current.smoothed *= 0.6;
        if (Math.abs(ref.current.smoothed) < 5) ref.current.smoothed = 0;
        setVelocity(ref.current.smoothed);
      }
    }, 60);

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearInterval(decay);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return velocity;
}