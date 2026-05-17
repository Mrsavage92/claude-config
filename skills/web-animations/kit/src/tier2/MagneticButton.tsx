'use client'

// web-animations: Tier 2 (T2.2 MagneticButton)
import { useRef } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type HTMLMotionProps,
} from 'motion/react'

interface MagneticButtonProps extends HTMLMotionProps<'button'> {
  strength?: number
}

export function MagneticButton({
  strength = 0.3,
  onMouseMove,
  onMouseLeave,
  children,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 20 })
  const sy = useSpring(y, { stiffness: 200, damping: 20 })

  function handleMove(e: React.MouseEvent<HTMLButtonElement>) {
    onMouseMove?.(e)
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }

  function handleLeave(e: React.MouseEvent<HTMLButtonElement>) {
    onMouseLeave?.(e)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: reduce ? 0 : sx, y: reduce ? 0 : sy }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
