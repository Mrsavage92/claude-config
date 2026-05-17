'use client'

// web-animations: Tier 3 (T3.6 CursorParallax)
import { useEffect, type ReactNode } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'

interface CursorParallaxProps {
  children: ReactNode
  strength?: number
  className?: string
}

export function CursorParallax({ children, strength = 20, className }: CursorParallaxProps) {
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 50, damping: 20 })
  const sy = useSpring(my, { stiffness: 50, damping: 20 })
  const x = useTransform(sx, [-0.5, 0.5], [-strength, strength])
  const y = useTransform(sy, [-0.5, 0.5], [-strength, strength])

  useEffect(() => {
    if (reduce) return
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(hover: hover)').matches) return

    const handle = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5)
      my.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('mousemove', handle)
    return () => window.removeEventListener('mousemove', handle)
  }, [mx, my, reduce])

  return (
    <motion.div className={className} style={{ x: reduce ? 0 : x, y: reduce ? 0 : y }}>
      {children}
    </motion.div>
  )
}
