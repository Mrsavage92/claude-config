export const easings = {
  outExpo: [0.22, 1, 0.36, 1] as const,
  outQuart: [0.25, 1, 0.5, 1] as const,
  inOutCubic: [0.65, 0, 0.35, 1] as const,
  outBack: [0.34, 1.56, 0.64, 1] as const,
} as const

export const springs = {
  snappy: { type: 'spring', stiffness: 400, damping: 25, mass: 0.8 } as const,
  smooth: { type: 'spring', stiffness: 200, damping: 20 } as const,
  bouncy: { type: 'spring', stiffness: 300, damping: 12 } as const,
  lazy: { type: 'spring', stiffness: 100, damping: 30 } as const,
}
