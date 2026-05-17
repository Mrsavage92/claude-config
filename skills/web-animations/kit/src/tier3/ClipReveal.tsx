'use client'

// web-animations: Tier 3 (T3.5 ClipReveal)
import { motion, type HTMLMotionProps } from 'motion/react'
import { easings } from '../utils/easings'

type Direction = 'left' | 'right' | 'up' | 'down'

const clipMap: Record<Direction, { from: string; to: string }> = {
  left: { from: 'inset(0 100% 0 0)', to: 'inset(0 0 0 0)' },
  right: { from: 'inset(0 0 0 100%)', to: 'inset(0 0 0 0)' },
  up: { from: 'inset(100% 0 0 0)', to: 'inset(0 0 0 0)' },
  down: { from: 'inset(0 0 100% 0)', to: 'inset(0 0 0 0)' },
}

interface ClipRevealProps extends HTMLMotionProps<'div'> {
  direction?: Direction
  duration?: number
  delay?: number
}

export function ClipReveal({
  children,
  direction = 'left',
  duration = 0.9,
  delay = 0,
  ...rest
}: ClipRevealProps) {
  const clip = clipMap[direction]
  return (
    <motion.div
      initial={{ clipPath: clip.from }}
      whileInView={{ clipPath: clip.to }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration, delay, ease: easings.inOutCubic }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
