/**
 * Motion Foundations Tokens & Springs for RuneDice
 * Adheres to motion-foundations & motion-patterns skills
 */

export const motionTokens = {
  duration: {
    instant: 0.08,
    fast: 0.18,
    normal: 0.35,
    slow: 0.5,
  },
  distance: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
  },
  scale: {
    tap: 0.96,
    hover: 1.02,
    subtle: 0.98,
  },
} as const

export const springs = {
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
    mass: 1,
  },
  gentle: {
    type: 'spring' as const,
    stiffness: 220,
    damping: 25,
    mass: 1,
  },
  bouncy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 15,
    mass: 1,
  },
  instant: {
    type: 'spring' as const,
    stiffness: 600,
    damping: 35,
    mass: 0.5,
  },
} as const

export function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
