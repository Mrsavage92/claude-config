# /web-animations

Framer Motion animation patterns for the web-* skill suite. Read this file when web-scaffold or web-page reference "web-animations Technique 3".

---

## Technique 1 — Simple Fade Up (single element)

```tsx
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

<motion.div
  variants={fadeUp}
  initial="hidden"
  animate="visible"
>
  {children}
</motion.div>
```

---

## Technique 2 — Fade Up on Scroll (whileInView)

Use for all sections below the fold. Never animate-on-scroll above the fold — that competes with the entrance animation.

```tsx
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

<motion.div
  variants={fadeUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: '-80px' }}
>
  {children}
</motion.div>
```

---

## Technique 3 — STAGGER (parent + children — the primary landing page pattern)

Use this for hero entrance (animate on mount) and section entrances (whileInView). The parent controls the stagger; children inherit via `variants`.

```tsx
import { motion } from 'framer-motion'

// Parent container — controls stagger timing
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

// Child item — each child inherits this
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

// Usage — hero entrance (animate on mount)
<motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
  className="flex flex-col items-center gap-6"
>
  <motion.div variants={fadeUp}>{pill}</motion.div>
  <motion.h1 variants={fadeUp}>{headline}</motion.h1>
  <motion.p variants={fadeUp}>{subheadline}</motion.p>
  <motion.div variants={fadeUp}>{ctaButtons}</motion.div>
  <motion.div variants={fadeUp}>{trustStats}</motion.div>
  <motion.div variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] } } }}>
    {productVisual}
  </motion.div>
</motion.div>

// Usage — section entrance (whileInView)
<motion.div
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: '-80px' }}
>
  {cards.map(card => (
    <motion.div key={card.id} variants={fadeUp}>{card}</motion.div>
  ))}
</motion.div>
```

**Hero entrance order** (always follow this sequence):
1. Pill / eyebrow label
2. Headline
3. Subheadline
4. CTA buttons
5. Trust stats row
6. Product visual (delayed last — lands after everything else for maximum impact)

---

## Technique 4 — Reduced Motion Guard

Always wrap animated backgrounds and decorative animations. Text/content animations can use the CSS `prefers-reduced-motion` media query in Tailwind instead.

```tsx
import { useReducedMotion } from 'framer-motion'

function AnimatedBackground() {
  const shouldReduce = useReducedMotion()
  if (shouldReduce) return <StaticBackground />
  return <FullAnimatedBackground />
}
```

For Tailwind: add `motion-reduce:animate-none motion-reduce:transition-none` to animated elements.

---

## Rules

- Technique 3 STAGGER is the standard for all landing pages — no exceptions
- `viewport={{ once: true }}` on all whileInView animations — never replay on scroll up
- Product visual always gets an extra delay (0.6s minimum) so it enters last
- Animated backgrounds: `opacity: 0.15-0.25`, `z-index: -1` — subtle, never foreground
- Never animate on scroll above the fold — use `animate="visible"` (mount) not `whileInView` for hero content
