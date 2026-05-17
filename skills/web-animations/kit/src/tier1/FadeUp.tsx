'use client'

// web-animations: Tier 1 (T1.1 FadeUp)
import { motion, type HTMLMotionProps } from 'motion/react'
import { fadeUp } from './variants'
import { easings } from '../utils/easings'

interface FadeUpProps extends HTMLMotionProps<'div'> {
  delay?: number
  mode?: 'mount' | 'scroll'
}

export function FadeUp({ children, delay = 0, mode = 'scroll', ...rest }: FadeUpProps) {
  const variants = delay
    ? {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: easings.outExpo } },
      }
    : fadeUp

  const orchestration =
    mode === 'mount'
      ? { initial: 'hidden', animate: 'visible' }
      : { initial: 'hidden', whileInView: 'visible', viewport: { once: true, margin: '-80px' } }

  return (
    <motion.div variants={variants} {...orchestration} {...rest}>
      {children}
    </motion.div>
  )
}
