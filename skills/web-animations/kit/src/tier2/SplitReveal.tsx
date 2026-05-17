'use client'

// web-animations: Tier 2 (T2.4 SplitReveal)
import { motion } from 'motion/react'
import { easings } from '../utils/easings'

interface SplitRevealProps {
  text: string
  by?: 'word' | 'char'
  stagger?: number
  blur?: boolean
  className?: string
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p'
}

export function SplitReveal({
  text,
  by = 'word',
  stagger,
  blur = true,
  className,
  as = 'span',
}: SplitRevealProps) {
  const parts = by === 'word' ? text.split(' ') : Array.from(text)
  const childStagger = stagger ?? (by === 'char' ? 0.02 : 0.05)
  const Tag = motion[as]

  const childVariants = {
    hidden: { opacity: 0, y: '0.5em', ...(blur ? { filter: 'blur(8px)' } : {}) },
    visible: {
      opacity: 1,
      y: 0,
      ...(blur ? { filter: 'blur(0px)' } : {}),
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
