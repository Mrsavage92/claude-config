'use client'

// web-animations: Tier 2 (T2.4 SplitReveal)
import { motion, useReducedMotion } from 'motion/react'
import { easings } from '../utils/easings'

interface SplitRevealProps {
  text: string
  by?: 'word' | 'char'
  stagger?: number
  blur?: boolean
  className?: string
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p'
}

// Default blur=false (safe). Animated filter:blur() on text is WebKit vestibular
// trigger category 6 (floor-rules.md Floor 3). Consumers can opt in by passing
// blur={true} — the component STILL substitutes opacity-only under
// prefers-reduced-motion: reduce regardless of the opt-in.
export function SplitReveal({
  text,
  by = 'word',
  stagger,
  blur = false,
  className,
  as = 'span',
}: SplitRevealProps) {
  const reduce = useReducedMotion()
  const parts = by === 'word' ? text.split(' ') : Array.from(text)
  const childStagger = stagger ?? (by === 'char' ? 0.02 : 0.05)
  const Tag = motion[as]
  const applyBlur = blur && !reduce

  const childVariants = {
    hidden: { opacity: 0, y: '0.5em', ...(applyBlur ? { filter: 'blur(8px)' } : {}) },
    visible: {
      opacity: 1,
      y: 0,
      ...(applyBlur ? { filter: 'blur(0px)' } : {}),
      transition: { duration: 0.6, ease: easings.outExpo },
    },
  }

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ staggerChildren: childStagger }}
      aria-label={text}
    >
      {parts.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden
          variants={childVariants}
          className="inline-block"
          style={{ marginRight: by === 'word' ? '0.25em' : 0, whiteSpace: 'pre' }}
        >
          {p === ' ' ? ' ' : p}
        </motion.span>
      ))}
    </Tag>
  )
}
