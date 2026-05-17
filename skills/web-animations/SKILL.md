---
name: web-animations
description: Tiered motion system for the web-* skill suite. Covers baseline reveals (Tier 1), escalation micro-interactions (Tier 2), signature scroll/route moves (Tier 3), and links to overdrive territory (Tier 4). Used by web-scaffold, web-page, web-evolve, animate, overdrive, polish.
---

# /web-animations

Motion patterns for the web-* skill suite. **Pick a tier before writing code.** The default is Tier 1 — escalate intentionally, not accidentally.

**Package (2026):** Framer Motion v12 is now `motion`. Install: `npm install motion`. Import: `from 'motion/react'`. The legacy `framer-motion` package is a shim — never use it in new code.

**Runnable kit:** `~/.claude/skills/web-animations/kit/` ships every component below as a tested `.tsx`. `web-scaffold` and `web-page` COPY from there instead of regenerating snippets. Unit tests via `npm test`, reduced-motion compliance via `npm run test:e2e`. See `kit/README.md`.

**Grader:** `node ~/.claude/skills/web-animations/grader/audit-animations.mjs <project>` audits any project for tier markers + reduced-motion guards on Tier 3 code. Exit code non-zero on violations. Wire into `/web-evolve` Phase A.

---

## Tier Decision Matrix — read first

| Product type | Floor | Ceiling | Notes |
|---|---|---|---|
| SaaS app, dashboard, admin tool | Tier 1 | Tier 2 (selective) | Motion is functional feedback, not character. Tier 3 on a dashboard reads as juvenile. |
| Marketing landing page | Tier 1 + 2 | Tier 3 (1–2 signature moments) | One memorable move, not five. |
| Brand site, portfolio, agency, award site | Tier 2 + 3 | Tier 4 (`/overdrive`) | Tier 1 alone here = mid. Tier 4 is the differentiator. |
| Documentation, blog, content site | Tier 1 | Tier 1 | Don't animate prose. Reading > delight. |

**Anti-patterns:**
- Tier 1 only on a brand/portfolio site (looks like a template)
- Tier 3 GSAP pinning on a SaaS dashboard (childish)
- Tier 4 shaders behind body text (kills LCP, distracts)
- Animating EVERYTHING on a page (chaos beats stillness)

**Rule of one:** every page gets ONE signature animation moment. Everything else is Tier 1 supporting reveals. Lifting all elements to "signature" tier flattens the page.

---

## Skill Routing Matrix — when to use which

| Task | Use | Don't use |
|---|---|---|
| Build new motion for a new component/page | `/web-animations` (this skill) + `/web-scaffold` or `/web-page` | `/animate`, `/polish` |
| Review an existing component's animation quality | `/animate` | `/web-animations` |
| Add polish/micro-interactions to a working feature | `/polish` or `/delight` | `/web-animations` (Tier 1/2 patterns are already here — `/polish` calls them) |
| 3D, shaders, particles, R3F, Rive, Lottie | `/overdrive` | This skill — stops at Tier 3 |
| Score a route's animation tier compliance | grader script + `/web-evolve` | Manual review |
| Mirror another site's motion vocabulary | `/style-mirror` first (extracts), then `/web-animations` to implement | Either alone |

`/web-animations` is the **build-time** reference and component source. `/animate` is the **review-time** equivalent.  `/overdrive` is the **escalation** for anything beyond Tier 3. Don't pile them all into one prompt.

---

## Bundle Budget per Tier

Bundle costs gzipped. Stack must fit the project's overall budget (`~/.claude/rules/web/performance.md`: <150kb landing pages, <300kb app pages).

| Library | Gzipped | Tier required | Notes |
|---|---|---|---|
| `motion/react` (Framer Motion v12) | ~38kb | Tier 1+ | The base. Tree-shakeable — actual bundle smaller if you use only `motion`, `AnimatePresence`. |
| `gsap` core | ~32kb | Tier 3 (T3.1) | Plus +12kb for `ScrollTrigger`. |
| `gsap/ScrollTrigger` | ~12kb | Tier 3 (T3.1) | |
| `lenis` | ~10kb | Tier 3 (T3.2) | Pair with GSAP. |
| `three` (R3F minimum) | ~140kb | Tier 4 | + R3F + drei = ~180kb baseline. Lazy-load only. |
| `@rive-app/canvas` | ~85kb | Tier 4 | Use for character/state-machine vector anims. |
| `lottie-react` | ~60kb | Tier 4 | Prefer Rive — smaller, interactive. |

**Budget audit:** if Tier 1+2 lands a marketing page over 150kb gzipped, something else is wrong — motion alone can't cause it. If Tier 3 lands over budget, lazy-load GSAP/Lenis on a `prefers-reduced-motion: no-preference` + scroll-near-target check.

```ts
// Lazy-load Tier 3 — fires only when user scrolls near
const loadScrollytelling = () => import('./PinnedSection')

const io = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) loadScrollytelling().then(/* mount */)
}, { rootMargin: '50%' })
```

---

## Performance Contract — non-negotiable

**Animate ONLY these properties:**
- `transform` (translate, scale, rotate, skew)
- `opacity`
- `clip-path`
- `filter` (sparingly — `blur` is expensive on large surfaces)

**BANNED — causes reflow every frame:**
- `width`, `height`
- `top`, `left`, `right`, `bottom`
- `margin`, `padding`, `border`
- `font-size`
- `background-color` on large surfaces (use overlay opacity instead)

**Rules:**
- `will-change: transform, opacity` ONLY while animating. Remove after. Permanent `will-change` is a memory leak.
- 60fps budget. Profile in DevTools Performance. If a frame drops below 16ms, you've broken the contract.
- Tier 2+ animations require a `prefers-reduced-motion` static fallback. Tier 3+ — mandatory and tested.
- Above-the-fold animations use `animate="visible"` (mount), never `whileInView`. Don't compete with entrance animations.
- Never use `setTimeout` for animation timing — use motion variants `delay`, GSAP timelines, or `requestAnimationFrame`.

---

## Reduced Motion — universal rule

Every tier respects `prefers-reduced-motion`. Three patterns:

```tsx
// Pattern A — hook (preferred for Tier 2+)
import { useReducedMotion } from 'motion/react'
const shouldReduce = useReducedMotion()
if (shouldReduce) return <StaticVersion />

// Pattern B — Tailwind utility
<div className="animate-fade-in motion-reduce:animate-none motion-reduce:opacity-100" />

// Pattern C — CSS media query (Tier 3 native CSS)
@media (prefers-reduced-motion: reduce) {
  .reveal, .parallax, .pinned { animation: none !important; }
}
```

Decorative animations and shaders MUST be replaced with a static visual. Functional micro-interactions (button feedback, dropdown open) can simply shorten duration to 0–50ms.

---

# TIER 1 — Baseline Reveals

The default landing-page motion vocabulary. Use everywhere unless escalating.

## T1.1 — Fade Up (single element)

```tsx
import { motion } from 'motion/react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

<motion.div variants={fadeUp} initial="hidden" animate="visible">
  {children}
</motion.div>
```

## T1.2 — Fade Up on Scroll (below the fold only)

```tsx
<motion.div
  variants={fadeUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: '-80px' }}
>
  {children}
</motion.div>
```

## T1.3 — STAGGER (parent + children) — primary landing pattern

```tsx
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

// Hero entrance (mount)
<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  <motion.div variants={fadeUp}>{pill}</motion.div>
  <motion.h1 variants={fadeUp}>{headline}</motion.h1>
  <motion.p variants={fadeUp}>{subheadline}</motion.p>
  <motion.div variants={fadeUp}>{ctaButtons}</motion.div>
  <motion.div variants={fadeUp}>{trustStats}</motion.div>
  <motion.div variants={{
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] } },
  }}>{productVisual}</motion.div>
</motion.div>

// Section entrance (scroll)
<motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
  {cards.map(c => <motion.div key={c.id} variants={fadeUp}>{c}</motion.div>)}
</motion.div>
```

**Hero entrance order (locked):**
1. Pill / eyebrow
2. Headline
3. Subheadline
4. CTA buttons
5. Trust stats
6. Product visual (extra +0.6s delay — lands LAST)

---

# TIER 2 — Escalation Patterns

Use selectively. Each one carries weight — don't combine more than 2–3 on a single page.

## T2.1 — Spring Physics (replace tween for interactions)

Tweens feel mechanical. Springs feel alive. Use for ALL hover/tap/drag micro-interactions.

```tsx
<motion.button
  whileHover={{ scale: 1.04, y: -2 }}
  whileTap={{ scale: 0.96 }}
  transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
>
  Click
</motion.button>
```

**Spring presets:**
- **Snappy UI** — `stiffness: 400, damping: 25` (buttons, toggles)
- **Smooth** — `stiffness: 200, damping: 20` (cards, panels)
- **Bouncy** — `stiffness: 300, damping: 12` (playful CTAs, brand sites — sparingly)
- **Lazy** — `stiffness: 100, damping: 30` (large drag handles, sheets)

## T2.2 — Magnetic Button (mouse follows cursor within hover radius)

```tsx
import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

export function MagneticButton({ children, strength = 0.3 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 20 })
  const springY = useSpring(y, { stiffness: 200, damping: 20 })

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => { x.set(0); y.set(0) }

  return (
    <motion.button ref={ref} style={{ x: springX, y: springY }} onMouseMove={onMove} onMouseLeave={reset}>
      {children}
    </motion.button>
  )
}
```

## T2.3 — Number Ticker (count up on scroll-in)

```tsx
import { motion, useMotionValue, useTransform, animate, useInView } from 'motion/react'
import { useEffect, useRef } from 'react'

export function NumberTicker({ to, duration = 1.5, format = (n: number) => n.toLocaleString() }: {
  to: number; duration?: number; format?: (n: number) => string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const count = useMotionValue(0)
  const display = useTransform(count, v => format(Math.round(v)))

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, to, { duration, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [inView, to, duration, count])

  return <motion.span ref={ref}>{display}</motion.span>
}

// Usage: <NumberTicker to={12500} format={n => `$${n.toLocaleString()}`} />
```

## T2.4 — SplitText Word/Char Reveal

```tsx
import { motion } from 'motion/react'

export function SplitReveal({ text, by = 'word' }: { text: string; by?: 'word' | 'char' }) {
  const parts = by === 'word' ? text.split(' ') : text.split('')
  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ staggerChildren: by === 'char' ? 0.02 : 0.05 }}
      aria-label={text}
    >
      {parts.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden
          variants={{
            hidden: { opacity: 0, y: '0.5em', filter: 'blur(8px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
          }}
          className="inline-block"
          style={{ marginRight: by === 'word' ? '0.25em' : 0 }}
        >
          {p === ' ' ? ' ' : p}
        </motion.span>
      ))}
    </motion.span>
  )
}
```

Keep `aria-label` on the parent and `aria-hidden` on parts — screen readers read the whole string once, not letter-by-letter.

## T2.5 — Marquee (infinite scroller for logo strips, testimonials)

```tsx
import { motion } from 'motion/react'

export function Marquee({ children, speed = 30, direction = 'left' }: {
  children: React.ReactNode; speed?: number; direction?: 'left' | 'right'
}) {
  const range = direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%']
  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        className="flex gap-12 whitespace-nowrap w-max"
        animate={{ x: range }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  )
}
```

The mask-image fade prevents hard cut at viewport edges. Duplicate children to seamless-loop.

## T2.6 — AnimatePresence (exits: modals, route changes, list removals)

```tsx
import { AnimatePresence, motion } from 'motion/react'

<AnimatePresence mode="wait">
  {open && (
    <motion.div
      key="modal"
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 8 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
    </motion.div>
  )}
</AnimatePresence>
```

`mode="wait"` for route transitions (old exits before new enters). `mode="sync"` (default) for list items. `mode="popLayout"` when items leave a flex/grid and others should reflow.

## T2.7 — Shared Element Transition (`layoutId`)

Framer Motion's standout feature. Element morphs from one position to another across component trees.

```tsx
// Grid card
<motion.div layoutId={`card-${id}`} onClick={() => setActive(id)} className="rounded-2xl overflow-hidden">
  <motion.img layoutId={`image-${id}`} src={src} className="w-full h-48 object-cover" />
  <motion.h3 layoutId={`title-${id}`} className="text-xl">{title}</motion.h3>
</motion.div>

// Expanded overlay (when active === id)
<AnimatePresence>
  {active && (
    <motion.div layoutId={`card-${active}`} className="fixed inset-4 z-50 rounded-2xl overflow-hidden bg-white">
      <motion.img layoutId={`image-${active}`} src={src} className="w-full h-96 object-cover" />
      <motion.h3 layoutId={`title-${active}`} className="text-4xl">{title}</motion.h3>
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}>Close</motion.button>
    </motion.div>
  )}
</AnimatePresence>
```

Wrap both with the same `layoutId`. Motion handles the morph.

---

# TIER 3 — Signature Moves

The differentiating layer. Use 1, maybe 2, per page. These are what people remember.

## T3.1 — GSAP + ScrollTrigger (pinned scrollytelling)

GSAP is free for everyone since 2024. The only credible option for pinned/scrubbed/timeline-orchestrated scroll. Motion `whileInView` cannot do this.

```bash
npm install gsap
```

```tsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function PinnedStory() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!root.current) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      })
      tl.to('.slide-1', { autoAlpha: 0, scale: 0.92 })
        .from('.slide-2', { autoAlpha: 0, scale: 1.08 }, '<')
        .to('.slide-2', { autoAlpha: 0, scale: 0.92 })
        .from('.slide-3', { autoAlpha: 0, scale: 1.08 }, '<')
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="h-screen relative">
      <div className="slide-1 absolute inset-0">{slide1}</div>
      <div className="slide-2 absolute inset-0">{slide2}</div>
      <div className="slide-3 absolute inset-0">{slide3}</div>
    </section>
  )
}
```

`gsap.context()` + `ctx.revert()` is the React cleanup contract. Forgetting it leaks ScrollTriggers across hot reloads.

## T3.2 — Lenis Smooth Scroll (pair with GSAP)

```bash
npm install lenis
```

```tsx
'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(time => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
    return () => { lenis.destroy(); gsap.ticker.remove(() => {}) }
  }, [])
  return <>{children}</>
}
```

Wrap your app root. Lenis hijacks scroll — test thoroughly on iOS (touch handoff can feel weird). Skip Lenis entirely on documentation or accessibility-critical sites.

## T3.3 — Native CSS Scroll-Driven Animations (zero JS)

Chrome/Edge 115+, Safari 18+ (Tech Preview). Progressive enhancement — falls back gracefully.

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(2rem); }
  to   { opacity: 1; transform: translateY(0); }
}

.reveal {
  animation: fade-up linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 30%;
}

@keyframes parallax-up {
  to { transform: translateY(-15%); }
}
.parallax-bg {
  animation: parallax-up linear;
  animation-timeline: scroll(root);
}

/* Scroll-progress bar */
@keyframes scaleX {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
.progress-bar {
  transform-origin: left;
  animation: scaleX linear;
  animation-timeline: scroll(root);
}

@media (prefers-reduced-motion: reduce) {
  .reveal, .parallax-bg, .progress-bar { animation: none; opacity: 1; transform: none; }
}
```

Detect support before relying on it:
```css
@supports (animation-timeline: view()) {
  .reveal { /* native version */ }
}
@supports not (animation-timeline: view()) {
  .reveal { /* JS fallback or static */ }
}
```

## T3.4 — View Transitions API (route/state morphs, zero library)

Stable in Chrome/Edge 111+, Safari 18+. Use for app-router pages and state changes.

```tsx
// React Router 7+ supports natively; for manual control:
function navigate(to: string) {
  if (!document.startViewTransition) {
    router.push(to); return
  }
  document.startViewTransition(() => router.push(to))
}
```

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

/* Element-level morph */
.hero-image { view-transition-name: hero-image; }
/* Same name on destination page = morph */

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
}
```

For Next.js App Router: pair with `unstable_ViewTransition` (15.2+) or wrap `router.push` calls.

## T3.5 — Clip-Path / Mask Text Reveal

Editorial reveal. Use on hero headlines instead of fade-up when the brand wants more theatre.

```tsx
<motion.h1
  initial={{ clipPath: 'inset(0 100% 0 0)' }}
  whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
  viewport={{ once: true }}
  transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
>
  Headline reveals from left
</motion.h1>

// Vertical wipe
<motion.h1
  initial={{ clipPath: 'inset(0 0 100% 0)' }}
  whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
  viewport={{ once: true }}
  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
>
  Reveal up
</motion.h1>
```

Pair with SplitText (T2.4) for word-by-word mask reveal — that's the SOTM signature move.

## T3.6 — Cursor-Driven Parallax

```tsx
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useEffect } from 'react'

export function CursorParallax({ children, strength = 20 }: { children: React.ReactNode; strength?: number }) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 50, damping: 20 })
  const sy = useSpring(my, { stiffness: 50, damping: 20 })
  const x = useTransform(sx, [-0.5, 0.5], [-strength, strength])
  const y = useTransform(sy, [-0.5, 0.5], [-strength, strength])

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5)
      my.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('mousemove', handle, { passive: true })
    return () => window.removeEventListener('mousemove', handle)
  }, [mx, my])

  return <motion.div style={{ x, y }}>{children}</motion.div>
}
```

Use on hero blobs, decorative SVGs, product mockups. Strength 10–30. Skip on touch devices (`@media (hover: hover)` guard if needed).

## T3.7 — Layout Animation (`layout` prop, FLIP)

```tsx
// Auto-animates layout changes (add/remove from list, expand/collapse)
<motion.div layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
  {expanded ? <FullView /> : <Summary />}
</motion.div>

// List that reflows when items removed
{items.map(item => (
  <motion.div key={item.id} layout>{item.label}</motion.div>
))}
```

Motion uses FLIP under the hood — measures before/after, animates the delta via transform. Works for `width/height` changes WITHOUT breaking the performance contract (still transform-based).

---

# Debugging — top 10 failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Hero stagger doesn't fire | Used `whileInView` on above-fold element while it's already in view at mount | Switch to `animate="visible"` (mount) for above-fold |
| Animation replays every time element scrolls back into view | Missing `viewport={{ once: true }}` | Add `once: true` |
| ScrollTrigger `pin` jumps at start | Missing `anticipatePin: 1` or content height shifts after mount | Add `anticipatePin: 1`; call `ScrollTrigger.refresh()` after async content loads |
| Lenis fights iOS touch scroll | Lenis is hijacking native momentum | Disable Lenis on touch: skip init when `('ontouchstart' in window)` or use Lenis 1.1+ `prevent` API |
| Motion stagger only animates first child | Children passed as fragment or component without `motion.*` wrapper | Each direct child of `StaggerContainer` MUST be `motion.div` (or kit `FadeUp`) — fragments break variant inheritance |
| `layoutId` morph teleports instead of animates | Same `layoutId` used in two simultaneously-rendered components | Wrap with `AnimatePresence`; render only ONE at a time |
| Number ticker jumps to final value, no animation | `useInView` triggers before content paints (server-render race) | Add `margin: '-80px'` or check `inView` after a `requestAnimationFrame` |
| Custom cursor causes layout shift | Cursor element on `body` shifts when scrollbar appears | Position cursor `fixed` with `pointer-events: none`, `transform: translate3d()` not `top/left` |
| GSAP ScrollTrigger memory leak on hot reload | Missing `gsap.context()` + `ctx.revert()` cleanup | Wrap every effect in `gsap.context(() => {...}, ref)` and return `ctx.revert()` |
| Animation runs at 30fps on mobile | Animated property is not compositor-only (likely `width`/`height`/`top`) OR too many simultaneous animations | DevTools Performance → check for layout/paint frames; replace with `transform`/`opacity`; throttle simultaneous tweens to 3–5 |

**Standard debugging steps:**
1. DevTools Performance — record, look for red frames and layout/paint events
2. DevTools Rendering panel → enable "Paint flashing" and "Layer borders" to see what's actually painting
3. Emulate reduced motion + slow CPU 4x to expose perf bugs
4. `document.getAnimations()` in console to list every running animation

---

## Accessibility — beyond reduced motion

`prefers-reduced-motion` is necessary, not sufficient. Full a11y for motion:

**1. Vestibular safety**
- Reduced motion ALWAYS disables: parallax, autoplay video, infinite spinning, large-area motion, looping anims
- Tier 3 features (`PinnedSection`, `SmoothScroll`, `CardStack`, `CursorParallax`) MUST early-return on `useReducedMotion()` — kit components do this
- Test by toggling Settings → Display → Reduce motion (macOS) or Animations off (Windows)

**2. Focus management on route/state transitions**
- `AnimatePresence mode="wait"` exits old content before new mounts → focus is lost
- Move focus to new page's `<h1>` (or first interactive element) on transition complete
- Use `tabindex="-1"` on the heading and `.focus()` programmatically

```tsx
const headingRef = useRef<HTMLHeadingElement>(null)
useEffect(() => { headingRef.current?.focus() }, [pathname])
return <h1 ref={headingRef} tabIndex={-1}>...</h1>
```

**3. Screen reader announcements**
- Number tickers, count-ups, value changes: WRAP visible content in `aria-hidden`, expose final value via `aria-label` on the parent (kit `NumberTicker` does this)
- Live regions (`aria-live="polite"`) only for legitimate status changes, NOT for decorative animation triggers — verbose

**4. Keyboard parity for hover-driven animations**
- Anything triggered by `onMouseMove` (magnetic buttons, cursor parallax, tilt cards) MUST also have a keyboard equivalent or graceful fallback
- Kit components use `(hover: hover)` media query — touch/keyboard users see the static version automatically

**5. SplitText reveals**
- Set `aria-label="full text"` on the parent
- Set `aria-hidden` on each split word/character so screen readers don't read "H. e. l. l. o."
- Test with VoiceOver (macOS), NVDA (Windows), or Chrome Lighthouse a11y audit

**6. Modal focus traps**
- Kit `AnimatedModal` handles Escape, but YOU must trap Tab inside the modal and restore focus on close
- Use `react-focus-lock` or `@radix-ui/react-focus-scope` — don't hand-roll
- Restore focus to the trigger element on close

**7. Tab order doesn't change with animations**
- An element being scaled, rotated, or off-stage visually is STILL in tab order
- Hide truly-removed elements with `aria-hidden="true"` + `tab index="-1"` or remove from DOM via `AnimatePresence` exit

**8. Lighthouse + axe in CI**
- Reduced motion: emulate via Playwright `reducedMotion: 'reduce'` project
- Run axe-playwright on key flows
- Manual smoke: keyboard-only nav, screen reader pass on critical pages

---

# TIER 4 — Overdrive Territory

When motion is the product. Hand off to `/overdrive`:

- **Three.js / R3F** — 3D scenes, product viewers, particles, GPGPU
- **GLSL shaders** — gradient meshes, distortion, post-processing
- **Rive** — designer-driven state machines, characters, complex SVG anims
- **Lottie** — After Effects exports (use Rive instead where possible — smaller, interactive)
- **Canvas 2D experiences** — generative art, data viz beyond library defaults
- **WebGPU** — when WebGL isn't enough (rare today)

Trigger phrases that escalate to Tier 4: "wow", "go all-out", "make this insane", "Bruno Simon vibes", "Awwwards", "SOTM", "make it move when scrolled", "particle background".

**Don't reimplement Tier 4 patterns in motion.** It will look worse and cost more frames.

---

## Install Matrix

```bash
# Tier 1–2
npm install motion

# Tier 3 scroll/timeline
npm install gsap

# Tier 3 smooth scroll
npm install lenis

# Tier 4 — handled by /overdrive
npm install three @react-three/fiber @react-three/drei
npm install @rive-app/canvas @rive-app/react-canvas
npm install lottie-react
```

---

## Common Anti-Patterns (don't ship these)

- **Stagger everywhere** — every card on the page fades up sequentially. Looks juvenile. Use stagger for hero, top section, and ONE feature grid max.
- **`whileInView` above the fold** — competes with mount entrance, creates double-animation flicker.
- **Replay on scroll up** — missing `once: true`. The user has already seen it. Don't make them watch again.
- **`will-change` on everything permanently** — promotes every element to its own GPU layer. Memory leak.
- **Animating `height` from 0** — even via motion. Use `clip-path: inset()` or `max-height` with overflow:hidden + transform.
- **Loops without `prefers-reduced-motion` guard** — vestibular triggers.
- **`duration: 1.2s` for a button hover** — interactions should feel under 200ms. Reveals can be 400–800ms.
- **Easing soup** — pick ONE easing curve per project and use it everywhere. `[0.22, 1, 0.36, 1]` (out-expo) is the safe default. Brand sites may justify a second (e.g. `[0.65, 0, 0.35, 1]` in-out for theatrical reveals).

---

## Easing Library (pick one project default, vary by 5%)

| Curve | Cubic-bezier | Feel | Use |
|---|---|---|---|
| out-expo (default) | `[0.22, 1, 0.36, 1]` | Confident finish | Reveals, page entrance |
| out-quart | `[0.25, 1, 0.5, 1]` | Slightly softer | Subtle reveals, body text |
| in-out-cubic | `[0.65, 0, 0.35, 1]` | Theatrical | Clip-path reveals, signature moves |
| out-back | `[0.34, 1.56, 0.64, 1]` | Bouncy overshoot | Playful brand only |
| spring (snappy) | `{type:'spring', stiffness:400, damping:25}` | Alive | All interactions |

Banned: `ease-in` alone (drags), `linear` for anything not infinite/scroll-linked.

---

## Hand-off Contract (for web-scaffold / web-page / web-evolve)

When another skill references this file:

- "use Tier 1 staggered hero" → import `StaggerContainer` + `FadeUp` from the kit, NOT inline snippets
- "add Tier 2 magnetic CTAs" → import `MagneticButton`, wrap primary CTA
- "Tier 3 pinned scrollytelling" → import `PinnedSection` + `SmoothScroll`
- "Tier 3 view transitions" → T3.4 wired into route navigation (no kit component — browser-native)
- "Tier 4 hero" → STOP, invoke `Skill('overdrive')` instead

**Marker requirement:** Generated code that uses kit components MUST keep the `// web-animations: Tier N (Tn.m Name)` marker (kit components include it). The grader script audits these markers + reduced-motion guards on Tier 3 imports.

**Grader integration:**

```bash
# In CI or /web-evolve Phase A
node ~/.claude/skills/web-animations/grader/audit-animations.mjs ./apps/marketing

# Output (JSON to stdout):
{
  "summary": {
    "totalFilesScanned": 42,
    "filesWithMarkers": 8,
    "filesUsingMotionWithoutMarker": 0,
    "tier3FilesMissingReducedMotionGuard": 0,
    "tierBreakdown": { "1": 4, "2": 3, "3": 1, "4": 0 }
  }
}
# Non-zero exit if violations found
```

`/web-evolve` should call this after every iter and treat unmarked motion or missing reduced-motion guards as a P0 fix.

---

## Verification Checklist (before shipping)

- [ ] One tier chosen intentionally, matches product type from matrix
- [ ] Performance contract obeyed — only transform/opacity/clip-path/filter animated
- [ ] `prefers-reduced-motion` tested with DevTools rendering panel
- [ ] DevTools Performance: no frame > 16ms during scroll/animation
- [ ] `viewport={{ once: true }}` on all `whileInView`
- [ ] Mount animations use `animate`, NOT `whileInView`
- [ ] One signature moment per page, not five
- [ ] Easing consistent across the project (1–2 curves max)
- [ ] No `will-change` left permanent on any element
- [ ] Touch devices verified — no hover-dependent animations breaking on mobile
