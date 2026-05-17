# Animation Classification — Triggering / Safe / Substitution

Source: https://www.smashingmagazine.com/2020/09/design-reduced-motion-sensitivities/

This table is the load-bearing rubric for what the grader flags. Every kit component is classified.

---

## Smashing classification table (verbatim)

| Pattern | Class | Strategy |
|---|---|---|
| Large movements, zooms, spinning | Triggering | Remove or significantly reduce |
| Parallax effects | Highly triggering | Remove entirely |
| Large page transitions | Triggering | Replace with crossfade |
| Color fades, opacity changes | Safe | Keep |
| Small scale changes (< 1.5×) | Safe | Keep |
| Hover effects | Safe | Can remain in reduced mode |

---

## Kit component classification

Each kit component is tagged: `Class` = what bucket it falls into, `Reduce path` = what it does when `prefers-reduced-motion: reduce`.

### Tier 1

| Component | Class | Reduce path |
|---|---|---|
| `FadeUp` | Safe (opacity + small y) | Keeps opacity, drops y or keeps small y — either is safe |
| `StaggerContainer` | Inherits from children | Whatever children do |
| Variants (`fadeUp`, `fadeIn`, `staggerContainer`) | Safe | n/a (just data) |

### Tier 2

| Component | Class | Reduce path |
|---|---|---|
| `SpringButton` | Safe (small scale ≤ 1.04) | Keep — small scale is in the "safe" column |
| `MagneticButton` | Borderline (small movement, but mouse-driven) | `useReducedMotion` returns true → no spring motion, no follow. Render becomes plain button |
| `NumberTicker` | Safe (text content change, no spatial motion) | Sets final value instantly, skips animation |
| `SplitReveal` | Safe (opacity + small y + optional blur) | Blur disabled on reduce; opacity keeps |
| `Marquee` | TRIGGERING (peripheral, infinite, #5 vestibular) | `useReducedMotion` → render as static flex layout, no movement |
| `AnimatedModal` | Safe (small scale 0.96–1, opacity) | Reduce path can omit scale, keep opacity |
| `SharedLayoutCard` | Safe (FLIP via transform, contained morph) | Layout prop respects reduce via motion library defaults; opacity remains |

### Tier 3

| Component | Class | Reduce path |
|---|---|---|
| `PinnedSection` | TRIGGERING (#1 scaling, #3 multi-speed) | matchMedia early return — renders all slides stacked, no pin, no scrub |
| `SmoothScroll` (Lenis) | TRIGGERING (#3 multi-speed) | matchMedia early return — Lenis never instantiated; native scroll preserved |
| `ClipReveal` | Safe (clip-path is opacity-equivalent — Smashing-safe) | Can keep, or skip; opacity-only fallback acceptable |
| `CursorParallax` | TRIGGERING (#3 multi-speed) | `useReducedMotion` + `(hover: hover)` guards → static children, no follow |
| `CardStack` | TRIGGERING (#1 scaling via scroll progress) | `useReducedMotion` → cards render normally, no sticky scroll-driven scale/y |
| `TiltCard` | TRIGGERING (#4 dimensionality) | `useReducedMotion` → no rotateX/Y; flat card |
| `StickyHeader` | Safe (class-based) | Always safe; class toggle has zero motion default |
| `CSSScrollReveal` (new) | Safe (opacity + transform, CSS-level reduce-motion strip) | `@media (prefers-reduced-motion: reduce)` removes `animation-timeline`; falls back to opacity-1 static |
| `CSSScrollProgress` (new) | Safe (scaleX bar) | CSS @media reduce strips animation; bar shows at 100% or hidden |
| `ViewTransition` (new) | Safe (cross-fade or directional; CSS-controlled) | CSS @media reduce → `animation-duration: 0s` on view-transition pseudo-elements |

---

## Grading actions per class

### Class: Safe
- Allowed in any tier on any site type subject to MAX_TIER ceiling
- Reduce path optional (but recommended)
- No grader flag

### Class: Borderline
- Reduce path REQUIRED
- Acceptable on any tier
- Grader checks for `useReducedMotion` or `matchMedia` guard

### Class: Triggering
- Reduce path REQUIRED — non-negotiable
- Forbidden on site types where Tier ≤ 1 (Local Service, Content/Publication, Documentation, Nonprofit) regardless of guard
- Grader flags BOTH conditions: missing guard, AND presence on a banned site type (when site-profile.json is present)

---

## How the grader uses this

`grader/audit-animations.mjs` reads:
1. The project's `.evolution/site-profile.json` (or `.audit/site-profile.json`) if present — determines per-site/per-route MAX_TIER
2. Source files — detects kit component imports + tier markers
3. This file (via Tier classification) — looks up each imported component's class
4. WCAG / Floor compliance — verifies reduce-guards present

Grader output enriched JSON:
```json
{
  "summary": { ... },
  "violations": [
    {
      "file": "src/components/Hero.tsx",
      "rule": "triggering-component-on-banned-site-type",
      "evidence": "imports Marquee (Class: Triggering) but site-profile.json:type = 'local-service' (MAX_TIER 1)",
      "fix": "remove import, replace with static logo grid"
    }
  ]
}
```
