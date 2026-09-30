import { useEffect, useRef, useState } from 'react';

const IDLE_AFTER_MS = 2000;

export function useCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const lastMoveRef = useRef(0);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pendingRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
      lastMoveRef.current = performance.now();

      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          if (pendingRef.current) {
            setPos(pendingRef.current);
            setActive(true);
          }
          rafRef.current = null;
        });
      }
    };

    const idleCheck = window.setInterval(() => {
      if (performance.now() - lastMoveRef.current > IDLE_AFTER_MS) {
        setActive(false);
      }
    }, 500);

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.clearInterval(idleCheck);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { x: pos.x, y: pos.y, active };
}