'use client'

// web-animations: Tier 2 (T2.3 NumberTicker)
import { useEffect, useRef } from 'react'
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react'
import { easings } from '../utils/easings'

interface NumberTickerProps {
  to: number
  from?: number
  duration?: number
  format?: (n: number) => string
  className?: string
}

export function NumberTicker({
  to,
  from = 0,
  duration = 1.5,
  format = (n) => n.toLocaleString(),
  className,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion()
  const count = useMotionValue(from)
  const display = useTransform(count, (v) => format(Math.round(v)))

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      count.set(to)
      return
    }
    const controls = animate(count, to, { duration, ease: easings.outExpo })
    return () => controls.stop()
  }, [inView, to, duration, count, reduce])

  return (
    <span ref={ref} className={className} aria-label={format(to)}>
      <motion.span aria-hidden>{display}</motion.span>
    </span>
  )
}
