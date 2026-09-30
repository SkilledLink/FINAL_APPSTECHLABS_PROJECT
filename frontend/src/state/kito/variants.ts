import type { TargetAndTransition, Transition } from 'framer-motion';
import type { KitoBase, KitoOverlay } from './types';
import { timings } from './timings';

interface JointMotion {
  animate: TargetAndTransition;
  transition?: Transition;
}

type StateKey = KitoBase | Exclude<KitoOverlay, null>;
type VariantMap = Partial<Record<string, JointMotion>>;

const loop = (duration: number): Transition => ({
  duration,
  repeat: Infinity,
  ease: 'easeInOut',
});

export const variants: Record<StateKey, VariantMap> = {
  idle: {
    torso: {
      animate: { scaleY: [1, 1.015, 1] },
      transition: loop(timings.breath),
    },
    head: {
      animate: { y: [0, -1, 0] },
      transition: loop(timings.breath),
    },
    arm_left: {
      animate: { rotate: [0, 0.8, 0] },
      transition: loop(timings.breath),
    },
    arm_right: {
      animate: { rotate: [0, -0.8, 0] },
      transition: loop(timings.breath),
    },
  },

  look: {
    // Head handled dynamically in useJointMotion (cursor-driven).
  },

  walk: {
    leg_left: {
      animate: { rotate: [0, 16, 0, -16, 0] },
      transition: loop(timings.walkCycle),
    },
    leg_right: {
      animate: { rotate: [0, -16, 0, 16, 0] },
      transition: loop(timings.walkCycle),
    },
    arm_left: {
      animate: { rotate: [0, -10, 0, 10, 0] },
      transition: loop(timings.walkCycle),
    },
    arm_right: {
      animate: { rotate: [0, 10, 0, -10, 0] },
      transition: loop(timings.walkCycle),
    },
    torso: {
      animate: { y: [0, -3, 0, -3, 0] },
      transition: loop(timings.walkCycle),
    },
    head: {
      animate: { rotate: [0, -1.5, 0, 1.5, 0] },
      transition: loop(timings.walkCycle),
    },
  },

  fastScroll: {
    torso: {
      animate: { y: [0, -5, 0, -5, 0], rotate: 5 },
      transition: loop(timings.fastCycle),
    },
    leg_left: {
      animate: { rotate: [0, 26, 0, -26, 0] },
      transition: loop(timings.fastCycle),
    },
    leg_right: {
      animate: { rotate: [0, -26, 0, 26, 0] },
      transition: loop(timings.fastCycle),
    },
    arm_left: {
      animate: { rotate: [0, -18, 0, 18, 0] },
      transition: loop(timings.fastCycle),
    },
    arm_right: {
      animate: { rotate: [0, 18, 0, -18, 0] },
      transition: loop(timings.fastCycle),
    },
    head: {
      animate: { rotate: [0, -3, 0, 3, 0], y: -2 },
      transition: loop(timings.fastCycle),
    },
  },

  settle: {
    // Empty on purpose. Joints without a variant here fall through to the
    // neutral default in useJointMotion, which tweens them back to rest.
  },

  point: {
    arm_right: {
      animate: { rotate: -58 },
      transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
    },
    forearm_right: {
      animate: { rotate: -12 },
      transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
    },
    torso: {
      animate: { rotate: 2 },
      transition: { duration: 0.4 },
    },
    head: {
      animate: { rotate: 6 },
      transition: { duration: 0.4 },
    },
  },

  search: {
    head: {
      animate: { rotate: [-10, 10, -10] },
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    arm_left: {
      animate: { rotate: -30 },
      transition: { duration: 0.4 },
    },
    forearm_left: {
      animate: { rotate: -35 },
      transition: { duration: 0.4 },
    },
  },

  plan: {
    head: {
      animate: { rotate: 14, y: 3 },
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    arm_left: {
      animate: { rotate: -12 },
      transition: { duration: 0.4 },
    },
    forearm_left: {
      animate: { rotate: -22 },
      transition: { duration: 0.4 },
    },
    blueprint: {
      animate: { rotate: 8 },
      transition: { duration: 0.4 },
    },
  },

  work: {
    arm_right: {
      animate: { rotate: [0, -20, 0, -20, 0] },
      transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
    },
    forearm_right: {
      animate: { rotate: [0, -14, 0, -14, 0] },
      transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
    },
    head: {
      animate: { rotate: 6 },
      transition: { duration: 0.4 },
    },
  },

  success: {
    torso: {
      animate: { y: [0, -8, 0] },
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    head: {
      animate: { rotate: [0, -4, 0], y: [0, -3, 0] },
      transition: { duration: 0.5 },
    },
    arm_right: {
      animate: { rotate: -68 },
      transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] },
    },
    forearm_right: {
      animate: { rotate: -22 },
      transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] },
    },
  },

  confused: {
    head: {
      animate: { rotate: -12 },
      transition: { duration: 0.35, ease: 'easeOut' },
    },
  },
};

export const NEUTRAL: JointMotion = {
  animate: { x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1 },
  transition: { duration: timings.defaultEase, ease: 'easeOut' },
};