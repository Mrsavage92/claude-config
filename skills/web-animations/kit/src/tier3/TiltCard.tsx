'use client'

// web-animations: Tier 3 (T3.8 TiltCard - 3D mouse-position tilt)
import { useRef, type ReactNode } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'

interface TiltCardProps {
  children: ReactNode
  intensity?: number
  className?: string
  perspective?: number
}

export function TiltCard({
  children,
  intensity = 10,
  className,
  perspective = 1000,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 200, damping: 20 })
  const sy = useSpring(my, { stiffness: 200, damping: 20 })
  const rotateY = useTransform(sx, [-0.5, 0.5], [-intensity, intensity])
  const rotateX = useTransform(sy, [-0.5, 0.5], [intensity, -intensity])

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }

  function handleLeave() {
    mx.set(0)
    my.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        transformStyle: 'preserve-3d',
        perspective,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
