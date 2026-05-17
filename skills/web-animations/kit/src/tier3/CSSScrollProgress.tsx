'use client'

// web-animations: Tier 3 (T3.11 CSSScrollProgress - zero-JS reading progress bar)
// Source: https://developer.chrome.com/articles/scroll-driven-animations/
// Renders a fixed-top progress bar that fills via CSS animation-timeline: scroll().
// Falls back to hidden under prefers-reduced-motion: reduce or unsupported browsers.

import { useEffect } from 'react'

interface CSSScrollProgressProps {
  className?: string
  height?: string
  color?: string
}

const STYLE_TAG_ID = 'web-animations-css-scroll-progress'

function ensureStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_TAG_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_TAG_ID
  style.textContent = `
    @supports (animation-timeline: scroll()) {
      .web-anim-css-progress {
        position: fixed;
        left: 0;
        top: 0;
        height: var(--web-anim-progress-height, 3px);
        width: 100%;
        background: var(--web-anim-progress-color, currentColor);
        transform-origin: 0 50%;
        transform: scaleX(0);
        animation: web-anim-progress-grow auto linear;
        animation-timeline: scroll();
        z-index: 100;
      }
      @media (prefers-reduced-motion: reduce) {
        .web-anim-css-progress {
          display: none;
        }
      }
    }
    @supports not (animation-timeline: scroll()) {
      .web-anim-css-progress {
        display: none;
      }
    }
    @keyframes web-anim-progress-grow {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }
  `
  document.head.appendChild(style)
}

export function CSSScrollProgress({
  className = '',
  height = '3px',
  color = 'currentColor',
}: CSSScrollProgressProps) {
  useEffect(() => {
    ensureStyles()
  }, [])

  const style: React.CSSProperties = {
    ['--web-anim-progress-height' as string]: height,
    ['--web-anim-progress-color' as string]: color,
  }

  return <div className={`web-anim-css-progress ${className}`.trim()} style={style} aria-hidden />
}
