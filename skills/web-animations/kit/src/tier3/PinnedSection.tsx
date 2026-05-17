'use client'

// web-animations: Tier 3 (T3.1 PinnedSection - GSAP ScrollTrigger)
import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface PinnedSectionProps {
  slides: ReactNode[]
  className?: string
  pinDurationPerSlide?: number
}

export function PinnedSection({
  slides,
  className,
  pinDurationPerSlide = 100,
}: PinnedSectionProps) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!root.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const slideEls = gsap.utils.toArray<HTMLElement>('.pinned-slide', root.current)
      if (slideEls.length < 2) return

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: `+=${slideEls.length * pinDurationPerSlide}%`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      })

      slideEls.forEach((_, i) => {
        const current = slideEls[i]
        const next = slideEls[i + 1]
        if (!current || !next) return
        tl.to(current, { autoAlpha: 0, scale: 0.92 })
          .from(next, { autoAlpha: 0, scale: 1.08 }, '<')
      })
    }, root)

    return () => ctx.revert()
  }, [slides.length, pinDurationPerSlide])

  return (
    <section
      ref={root}
      className={className}
      style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className="pinned-slide"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === 0 ? 1 : 0,
          }}
        >
          {slide}
        </div>
      ))}
    </section>
  )
}
