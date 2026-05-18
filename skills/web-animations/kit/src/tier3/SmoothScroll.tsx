'use client'

// web-animations: Tier 3 (T3.2 SmoothScroll - Lenis + GSAP integration)
import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface SmoothScrollProps {
  children: ReactNode
  duration?: number
}

export function SmoothScroll({ children, duration = 1.2 }: SmoothScrollProps) {
  useEffect(() => {
    // gsap.matchMedia() dual-branch — Floor 4. Reduce branch leaves native scroll
    // intact (the substitute for Lenis); no-preference branch wires Lenis + GSAP ticker.
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({
        duration,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })

      const onScroll = () => ScrollTrigger.update()
      lenis.on('scroll', onScroll)

      const raf = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(raf)
      gsap.ticker.lagSmoothing(0)

      return () => {
        lenis.off('scroll', onScroll)
        gsap.ticker.remove(raf)
        lenis.destroy()
      }
    })

    // reduce branch: explicit no-op. Native scroll is the substitute.
    mm.add('(prefers-reduced-motion: reduce)', () => {})

    return () => mm.revert()
  }, [duration])

  return <>{children}</>
}
