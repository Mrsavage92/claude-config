'use client'

// web-animations: Tier 2 (T2.1 SpringButton)
import { motion, type HTMLMotionProps } from 'motion/react'
import { springs } from '../utils/easings'

type Preset = keyof typeof springs

interface SpringButtonProps extends HTMLMotionProps<'button'> {
  preset?: Preset
}

export function SpringButton({ preset = 'snappy', children, ...rest }: SpringButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={springs[preset]}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
