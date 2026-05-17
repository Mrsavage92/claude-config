# Floor Rules — Non-Negotiable for Every Tier

These rules apply to EVERY site type, EVERY route role, EVERY tier. Failing any of them is a P0 fix regardless of design intent.

Sources cited inline (see `.forge-sources.md` for the full briefings).

---

## Floor 1 — WCAG 2.3.3 (Animation from Interactions)

Source: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html

> "Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed."

**Rule**: every animation that fires on a user interaction MUST have a disable path — either:
- a `useReducedMotion()` check that skips it, OR
- a CSS `@media (prefers-reduced-motion: reduce)` override, OR
- a UI control (toggle / setting) the user can flip

The grader at `grader/audit-animations.mjs` checks for this. Any file using `gsap.`, `useScroll`, `useTransform`, `motion.*` without a reduce-guard in scope = grader exit non-zero.

---

## Floor 2 — Substitute, don't strip

Sources:
- https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- https://www.smashingmagazine.com/2020/09/design-reduced-motion-sensitivities/

The MDN example shows `pulse` (scale) → `dissolve` (opacity) under reduced motion — NOT `animation: none`.

**Rule**: under reduced motion, replace the animating PROPERTY (transform → opacity), keep duration and easing. Do not strip animation entirely. The user experience should still feel responsive; only the spatial/scale element is removed.

```css
/* DO */
.reveal { animation: pulse 1s ease both; }
@media (prefers-reduced-motion: reduce) {
  .reveal { animation: dissolve 1s ease both; }
}

/* DON'T */
@media (prefers-reduced-motion: reduce) {
  .reveal { animation: none; }
}
```

---

## Floor 3 — Six vestibular triggers

Source: https://webkit.org/blog/7551/responsive-design-for-motion/

WebKit names six categories of animation that are known vestibular triggers and must be gated behind `prefers-reduced-motion: no-preference` regardless of tier:

1. **Scaling and Zooming** — anything that grows/shrinks ≥ 1.5× over the viewport
2. **Spinning and Vortex Effects** — full rotations, multi-rotation loops
3. **Multi-Speed / Multi-Directional Movement** — parallax (any kind), Lenis smooth scroll
4. **Dimensionality or Plane Shifting** — 3D card tilts, perspective transitions
5. **Peripheral Motion** — Marquee, infinite scrollers, ambient background loops
6. **Animated Blurring** — `filter: blur()` transitions over text or large surfaces

**Rule**: every kit component that triggers ANY of these six MUST guard with `useReducedMotion()` or `matchMedia('(prefers-reduced-motion: no-preference)').matches`. A local-service site that includes a parallax hero fails the floor even though parallax is "below" Tier 3 ceiling — the trigger type is what fails, not the tier.

Components in this kit that touch these triggers:
- `CursorParallax` (#3 Multi-Speed) — guards via `useReducedMotion` + `(hover: hover)` check
- `TiltCard` (#4 Dimensionality) — guards via `useReducedMotion`
- `Marquee` (#5 Peripheral) — guards via `useReducedMotion` (returns static flex layout)
- `PinnedSection` (#1 Scaling, #3 Multi-Speed) — guards via `matchMedia` early return
- `SmoothScroll` / Lenis (#3 Multi-Speed) — guards via `matchMedia` early return
- `CardStack` (#1 Scaling) — guards via `useReducedMotion`

---

## Floor 4 — Dual-branch architecture (GSAP)

Source: https://gsap.com/resources/getting-started/accessibility/

The recommended pattern for GSAP is `gsap.matchMedia()` with TWO branches — one for `no-preference`, one for `reduce` — both code paths live, both runnable, both testable. Not a single branch with an `if` inside.

```js
let mm = gsap.matchMedia()
mm.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.from('.box', { opacity: 0, rotation: 360, ease: 'back.out' })
})
mm.add('(prefers-reduced-motion: reduce)', () => {
  gsap.from('.box', { opacity: 0 })
})
```

**Rule**: every kit Tier 3 component that uses GSAP MUST use `gsap.matchMedia()` for the reduced-motion split. The `kit/src/tier3/PinnedSection.tsx` currently uses single-branch early return — Phase 5d upgrades it.

---

## Floor 5 — Compositor-only properties

Animating any of these triggers reflow on every frame and breaks 60fps on commodity hardware:

**BANNED**: `width`, `height`, `top`, `left`, `right`, `bottom`, `margin`, `padding`, `border`, `font-size`, `background-color` on large surfaces

**ALLOWED**: `transform`, `opacity`, `clip-path`, `filter` (with bounded subjects, no full-screen blur transitions)

This is non-negotiable. The grader v2 will scan for animated CSS properties via AST and flag banned-property animations.

---

## Floor 6 — Above-the-fold animations use mount, not scroll

Above-the-fold elements are visible at `IntersectionObserver` time zero. Using `whileInView` for them creates a double-animation flicker (mount + scroll-in). Use `animate="visible"` (mount) instead.

Floor: any `motion.*` element rendered above the fold MUST use mount orchestration. The grader does not check this yet; it's an inspection rule.

---

## Floor 7 — Once-only reveals

`viewport={{ once: true }}` is the default for every `whileInView`. Replaying on scroll-up makes the user re-watch animations they've already seen — annoying and disrespectful of attention.

Floor: any `whileInView` without `once: true` is a P0 fix.

---

## Summary — what every kit component must satisfy

| Component | Reduced-motion guard | Six-trigger compliance | Compositor-only | Once-only |
|---|---|---|---|---|
| `FadeUp` | OK (opacity + y transform — y is safe small movement, opacity is safe) | clean | yes | yes (default) |
| `StaggerContainer` | OK (inherits from children) | clean | yes | yes |
| `SpringButton` | OK (small scale, ≤ 1.04) | clean (small scale is safe) | yes | n/a |
| `MagneticButton` | guards via `useReducedMotion` | clean | yes | n/a |
| `NumberTicker` | guards (sets final value immediately) | clean | n/a (text content) | n/a |
| `SplitReveal` | OK (opacity + small y, no blur on reduce) | clean | yes | yes |
| `Marquee` | guards (returns static flex layout under reduce) | #5 peripheral — guarded | yes | n/a (infinite) |
| `AnimatedModal` | OK (small scale + opacity, ≤ 0.96–1) | clean | yes | n/a |
| `SharedLayoutCard` | OK (layout-prop, FLIP via transform) | clean | yes | n/a |
| `PinnedSection` | guards via matchMedia | #1, #3 — guarded | yes | n/a |
| `SmoothScroll` | guards (skips Lenis init) | #3 — guarded | n/a (scroll handler) | n/a |
| `ClipReveal` | OK (clip-path is safe per Smashing) | clean | yes | yes |
| `CursorParallax` | guards via `useReducedMotion` + `(hover: hover)` | #3 — guarded | yes | n/a |
| `CardStack` | guards via `useReducedMotion` | #1 — guarded | yes | n/a |
| `TiltCard` | guards via `useReducedMotion` | #4 — guarded | yes (rotateX/Y) | n/a |
| `StickyHeader` | OK (class-based, no animation on reduce) | clean | yes (delegated to consumer CSS) | n/a |
| `CSSScrollReveal` (new) | OK (CSS @media reduce strips animation-timeline) | depends on keyframes — author rule | yes (transform/opacity only) | yes (auto via CSS) |
| `CSSScrollProgress` (new) | OK (CSS @media reduce strips animation-timeline) | clean (scaleX) | yes | n/a |
| `ViewTransition` (new) | OK (auto-bypass on `e.hasUAVisualTransition`) | depends on transition CSS — author rule | yes (animation property) | n/a |
