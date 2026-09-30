export const palette = {
  blue: '#1E40AF',
  blueDark: '#0F172A',
  yellow: '#FBBF24',
  yellowDark: '#D97706',
  yellowLight: '#FDE68A',
  gray: '#334155',
  grayLight: '#E5E7EB',
  white: '#F8FAFC',
  boot: '#B45309',
  outline: '#0F172A',
  skin: '#8A5A3A',
  skinShadow: '#6B4229',
  skinHighlight: '#A97350',
  beard: '#2B1F17',
} as const;

export const viewBox = { width: 400, height: 700 } as const;

export const pivots = {
  head: { x: 200, y: 190 },
  helmet: { x: 200, y: 100 },
  torso: { x: 200, y: 375 },
  arm_left: { x: 255, y: 212 },
  arm_right: { x: 145, y: 212 },
  forearm_left: { x: 267, y: 305 },
  forearm_right: { x: 133, y: 305 },
  hand_left: { x: 263, y: 400 },
  hand_right: { x: 133, y: 400 },
  leg_left: { x: 222, y: 395 },
  leg_right: { x: 178, y: 395 },
  shin_left: { x: 222, y: 540 },
  shin_right: { x: 178, y: 540 },
  boot_left: { x: 222, y: 645 },
  boot_right: { x: 178, y: 645 },
  blueprint: { x: 230, y: 415 },
  pupil_left: { x: 181, y: 112 },
  pupil_right: { x: 219, y: 112 },
} as const;

export type JointName = keyof typeof pivots;

export const sizes = {
  desktop: 300,
  tablet: 250,
  mobile: 180,
} as const;