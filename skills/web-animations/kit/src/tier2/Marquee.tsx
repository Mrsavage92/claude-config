'use client'

// web-animations: Tier 2 (T2.5 Marquee)
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

interface MarqueeProps {
  children: ReactNode
  speed?: number
  direction?: 'left' | 'right'
  className?: string
  gap?: string
}

export function Marquee({
  children,
  speed = 30,
  direction = 'left',
  className,
  gap = '3rem',
}: MarqueeProps) {
  const reduce = useReducedMotion()
  const range = direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%']

  if (reduce) {
    return (
      <div
        className={className}
        style={{ display: 'flex', gap, overflow: 'hidden', flexWrap: 'wrap' }}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{
        overflow: 'hidden',
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
      }}
    >
      <motion.div
        animate={{ x: range }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
        style={{ display: 'flex', gap, width: 'max-content', whiteSpace: 'nowrap' }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  )
}
