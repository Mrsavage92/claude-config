'use client'

// web-animations: Tier 3 (T3.7 CardStack - sticky-reveal scroll stack)
import { useRef, type ReactNode, type RefObject } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'

interface CardStackProps {
  cards: ReactNode[]
  className?: string
  topOffset?: string
}

export function CardStack({ cards, className, topOffset = '6rem' }: CardStackProps) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className={className}>
      {cards.map((card, i) => (
        <StackedCard
          key={i}
          index={i}
          total={cards.length}
          containerRef={ref}
          topOffset={topOffset}
        >
          {card}
        </StackedCard>
      ))}
    </div>
  )
}

interface StackedCardProps {
  children: ReactNode
  index: number
  total: number
  containerRef: RefObject<HTMLDivElement>
  topOffset: string
}

function StackedCard({ children, index, total, containerRef, topOffset }: StackedCardProps) {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })
  const segment = 1 / total
  const start = segment * index
  const end = segment * (index + 1)
  const scale = useTransform(scrollYProgress, [start, end], [1, 0.92])
  const y = useTransform(scrollYProgress, [start, end], [0, -40])

  return (
    <motion.div
      style={{
        scale: reduce ? 1 : scale,
        y: reduce ? 0 : y,
        position: 'sticky',
        top: topOffset,
      }}
    >
      {children}
    </motion.div>
  )
}
