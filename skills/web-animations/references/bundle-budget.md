# Bundle Budget per Tier

Library × gzipped size × source URL × Tier-required-from.

All sizes are gzipped, measured 2026-05 via bundlephobia.com. Re-verify before quoting.

---

## Library sizes (verifiable)

| Library | Version | Gzipped | Source | Tier needed |
|---|---|---|---|---|
| `motion` (Framer Motion v12 successor) | ^12 | 38.1 kB | https://bundlephobia.com/package/motion | Tier 1+ (base) |
| `motion/react` (subpath) | ^12 | ~32 kB | tree-shaken from above, depends on used hooks | Tier 1+ |
| `gsap` (core only) | ^3.12 | 24.7 kB | https://bundlephobia.com/package/gsap | Tier 3 (T3.1) |
| `gsap/ScrollTrigger` | ^3.12 | +11.4 kB | https://gsap.com/docs/v3/Plugins/ScrollTrigger/ — plugin add | Tier 3 (T3.1) |
| `lenis` | ^1.1 | 9.8 kB | https://bundlephobia.com/package/lenis | Tier 3 (T3.2) |
| `three` (R3F minimum) | ^0.170 | ~140 kB | https://bundlephobia.com/package/three | Tier 4 only |
| `@react-three/fiber` | ^9 | ~28 kB | https://bundlephobia.com/package/@react-three/fiber | Tier 4 only |
| `@react-three/drei` | ^10 | varies; common subset 30–60 kB | https://bundlephobia.com/package/@react-three/drei | Tier 4 only |
| `@rive-app/canvas` | ^2 | ~85 kB | https://bundlephobia.com/package/@rive-app/canvas | Tier 4 only |
| `lottie-react` | ^2.4 | ~60 kB | https://bundlephobia.com/package/lottie-react | Tier 4 (avoid — use Rive) |

Sizes change between versions. The grader does not enforce these numbers; budget enforcement is the consuming project's responsibility (vite-bundle-visualizer or equivalent).

---

## Project budgets (from `~/.claude/rules/web/performance.md`)

| Page type | JS gzipped | CSS gzipped |
|---|---|---|
| Marketing landing | < 150 kB | < 30 kB |
| App page (in-product) | < 300 kB | < 50 kB |
| Microsite | < 80 kB | < 15 kB |
| Documentation | < 100 kB | < 20 kB |

Combining base framework + motion stack:
- React 19 + motion = ~46 kB + motion's own. Fits a marketing landing budget.
- + GSAP + ScrollTrigger = +36 kB. Now at ~82 kB. Still fits marketing — but leaves little headroom for shadcn/ui icons + analytics + Stripe.js.
- + Lenis = +10 kB → 92 kB. Tight.
- + three / R3F / drei = +200 kB → blown.

---

## Lazy-load pattern for Tier 3

If a Tier 3 component is below the fold (which it almost always is on a marketing landing page), lazy-load:

```ts
// IntersectionObserver-gated dynamic import — load only when near viewport
import { useEffect, useRef, useState } from 'react'

export function LazyTier3({ slot }: { slot: 'pinned' | 'smooth-scroll' }) {
  const ref = useRef<HTMLDivElement>(null)
  const [Comp, setComp] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return
      if (slot === 'pinned') {
        const mod = await import('@adam/web-animations-kit/src/tier3/PinnedSection')
        setComp(() => mod.PinnedSection)
      }
      // ...
      io.disconnect()
    }, { rootMargin: '200% 0px' })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [slot])

  return <div ref={ref}>{Comp ? <Comp /> : null}</div>
}
```

`rootMargin: '200% 0px'` triggers ~2 viewports before scroll arrives — enough lead time for the chunk download to complete invisibly.

---

## Tree-shaking checklist

- Always import from `motion/react`, NEVER the legacy `framer-motion` — the latter is a shim
- Import `gsap` core + plugins separately: `import gsap from 'gsap'` + `import { ScrollTrigger } from 'gsap/ScrollTrigger'`
- Avoid `import * as Drei from '@react-three/drei'` — pull each helper individually
- Avoid `lottie-web/build/player/lottie_svg.js` (legacy umd) — use ESM only

---

## When budget is blown

If kit + project ships > tier ceiling for the site type:

1. **First**: confirm site classification is right. A Local Service site with GSAP and Lenis is incorrectly classified — strip Tier 3 libraries entirely.
2. **Second**: lazy-load Tier 3 below fold (above pattern).
3. **Third**: replace one Tier 3 library with a zero-JS alternative — `CSSScrollReveal` replaces `PinnedSection` for content/portfolio sites. View Transitions API replaces GSAP page transitions for route changes.
4. **Last**: drop the Tier 3 feature. The animation budget exceeding the JS budget means motion is competing with content — content wins.
