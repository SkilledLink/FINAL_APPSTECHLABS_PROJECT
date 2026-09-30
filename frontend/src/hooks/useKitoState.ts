import { useEffect, useMemo, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { useCursor } from './useCursor';
import { useScrollVelocity } from './useScrollVelocity';
import { useSectionObserver } from './useSectionObserver';
import { kitoOverlays } from '../state/kito/overlays';
import { timings } from '../state/kito/timings';
import type {
  KitoBase,
  KitoOverlay,
  KitoState,
  HandVariant,
  MouthVariant,
  BrowVariant,
} from '../state/kito/types';

// --- These are the section names Kito reacts to. -----------------------
// Mark the corresponding elements in your pages with
//   <section data-kito-section="pricing"> ... </section>
// Anything without a matching section simply falls through to look/idle.
const KITO_SECTIONS = ['services', 'how-it-works', 'pricing', 'about'] as const;

// Velocity thresholds (px / second)
const V_FAST = 800;
const V_WALK = 200;

function deriveSwap(
  base: KitoBase,
  overlay: KitoOverlay
): { hand: HandVariant; mouth: MouthVariant; brows: BrowVariant } {
  if (overlay === 'success') {
    return { hand: 'thumbsup', mouth: 'open', brows: 'raised' };
  }
  if (overlay === 'confused') {
    return { hand: 'grip', mouth: 'flat', brows: 'furrowed' };
  }
  if (base === 'point') {
    return { hand: 'point', mouth: 'smile', brows: 'neutral' };
  }
  return { hand: 'grip', mouth: 'smile', brows: 'neutral' };
}

export function useKitoState(): KitoState {
  const reducedMotion = usePrefersReducedMotion();
  const { x: cursorX, y: cursorY, active: cursorActive } = useCursor();
  const velocity = useScrollVelocity();
  const activeSection = useSectionObserver(KITO_SECTIONS);

  const [base, setBase] = useState<KitoBase>('idle');
  const [overlay, setOverlay] = useState<KitoOverlay>(null);

  // Refs so the base-state computation interval always reads fresh values.
  const ref = useRef({
    velocity: 0,
    cursorActive: false,
    activeSection: null as string | null,
    lastFast: 0,
  });

  useEffect(() => {
    ref.current.velocity = velocity;
    if (Math.abs(velocity) > V_WALK) ref.current.lastFast = performance.now();
  }, [velocity]);

  useEffect(() => {
    ref.current.cursorActive = cursorActive;
  }, [cursorActive]);

  useEffect(() => {
    ref.current.activeSection = activeSection;
  }, [activeSection]);

  // --- Overlays ---------------------------------------------------------
  useEffect(() => {
    return kitoOverlays.subscribe((o) => {
      setOverlay(o);
      const ms =
        o === 'success' ? timings.successDuration : timings.confusedDuration;
      window.setTimeout(() => {
        setOverlay((prev) => (prev === o ? null : prev));
      }, ms);
    });
  }, []);

  // --- Base state -------------------------------------------------------
  useEffect(() => {
    if (reducedMotion) {
      setBase('idle');
      return;
    }

    const compute = (): KitoBase => {
      const v = Math.abs(ref.current.velocity);
      const sinceFast = performance.now() - ref.current.lastFast;

      if (v > V_FAST) return 'fastScroll';
      if (v > V_WALK) return 'walk';
      if (sinceFast < timings.settleWindow && ref.current.lastFast > 0) {
        return 'settle';
      }

      switch (ref.current.activeSection) {
        case 'pricing':
          return 'point';
        case 'services':
          return 'search';
        case 'how-it-works':
          return 'plan';
        case 'about':
          return 'work';
      }

      if (ref.current.cursorActive) return 'look';
      return 'idle';
    };

    setBase(compute());
    const id = window.setInterval(() => {
      setBase((prev) => {
        const next = compute();
        return prev === next ? prev : next;
      });
    }, timings.stateTick);

    return () => window.clearInterval(id);
  }, [reducedMotion]);

  return useMemo(() => {
    const swap = deriveSwap(base, overlay);
    return {
      base,
      overlay,
      cursorX: reducedMotion ? 0 : cursorX,
      cursorY: reducedMotion ? 0 : cursorY,
      ...swap,
    };
  }, [base, overlay, cursorX, cursorY, reducedMotion]);
}