'use client'

// web-animations: Tier 3 (T3.9 StickyHeader - scroll-collapse via class toggle)
import { useEffect, useState, type ReactNode } from 'react'

interface StickyHeaderProps {
  children: ReactNode
  threshold?: number
  className?: string
  scrolledClassName?: string
}

export function StickyHeader({
  children,
  threshold = 80,
  className = '',
  scrolledClassName = '',
}: StickyHeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return (
    <header
      data-scrolled={scrolled ? 'true' : 'false'}
      className={`${className} ${scrolled ? scrolledClassName : ''}`.trim()}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {children}
    </header>
  )
}
