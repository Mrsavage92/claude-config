'use client'

// web-animations: Tier 1 (T1.3 StaggerContainer)
import { motion, type HTMLMotionProps } from 'motion/react'
import { staggerContainer } from './variants'

interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  mode?: 'mount' | 'scroll'
  stagger?: number
  delayChildren?: number
}

export function StaggerContainer({
  children,
  mode = 'mount',
  stagger,
  delayChildren,
  ...rest
}: StaggerContainerProps) {
  const variants =
    stagger || delayChildren
      ? {
          hidden: {},
          visible: {
            transition: {
              staggerChildren: stagger ?? 0.1,
              delayChildren: delayChildren ?? 0.05,
            },
          },
        }
      : staggerContainer

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
