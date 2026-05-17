'use client'

// web-animations: Tier 3 (T3.10 CSSScrollReveal - zero-JS scroll reveal)
// Source: https://developer.chrome.com/articles/scroll-driven-animations/
// Reveals child via CSS animation-timeline: view() — no motion lib, no JS event loop.
// Falls back to opacity:1 static on browsers without animation-timeline support
// or under prefers-reduced-motion: reduce.

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

interface CSSScrollRevealProps {
  children: ReactNode
  range?: string
  fromY?: string
  className?: string
}

const STYLE_TAG_ID = 'web-animations-css-scroll-reveal'

function ensureStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_TAG_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_TAG_ID
  style.textContent = `
    @supports (animation-timeline: view()) {
      .web-anim-css-reveal {
        animation: web-anim-fade-up linear both;
        animation-timeline: view();
        animation-range: var(--web-anim-range, entry 0% cover 30%);
      }
      @media (prefers-reduced-motion: reduce) {
        .web-anim-css-reveal {
          animation: none;
          opacity: 1;
          transform: none;
        }
      }
    }
    @supports not (animation-timeline: view()) {
      .web-anim-css-reveal {
        opacity: 1;
        transform: none;
      }
    }
    @keyframes web-anim-fade-up {
      from {
        opacity: 0;
        transform: translateY(var(--web-anim-from-y, 24px));
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `
  document.head.appendChild(style)
}

export function CSSScrollReveal({
  children,
  range = 'entry 0% cover 30%',
  fromY = '24px',
  className = '',
}: CSSScrollRevealProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    ensureStyles()
    setMounted(true)
  }, [])

  const style: React.CSSProperties = {
    ['--web-anim-range' as string]: range,
    ['--web-anim-from-y' as string]: fromY,
  }

  return (
    <div className={`web-anim-css-reveal ${className}`.trim()} style={mounted ? style : undefined}>
      {children}
    </div>
  )
}
