# Debugging — Top Failure Modes

Moved from SKILL.md body to keep main file under 500 lines. Read this when a kit component misbehaves.

---

## Top 10 failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Hero stagger doesn't fire | Used `whileInView` on above-fold element while it's already in view at mount | Switch to `mode="mount"` (kit) or `animate="visible"` (raw motion) for above-fold |
| Animation replays every time element scrolls back into view | Missing `viewport={{ once: true }}` | Kit `FadeUp` defaults to `once: true` for scroll mode; for raw motion, add `once: true` |
| ScrollTrigger pin jumps at start | Missing `anticipatePin: 1` or content height shifts after mount | `kit/src/tier3/PinnedSection.tsx` sets `anticipatePin: 1`. After dynamic content loads, call `ScrollTrigger.refresh()` |
| Lenis fights iOS touch scroll | Lenis is hijacking native momentum | Disable Lenis on touch: skip init when `'ontouchstart' in window` — current kit only guards `prefers-reduced-motion`; add touch check in your wrapper |
| Motion stagger only animates first child | Children passed as fragment or component without `motion.*` wrapper | Each direct child of `StaggerContainer` MUST be `motion.div` (or kit `FadeUp`) — fragments break variant inheritance |
| `layoutId` morph teleports instead of animates | Same `layoutId` used in two simultaneously-rendered components | Wrap with `AnimatePresence`; render only ONE at a time. Kit `SharedLayoutCard` enforces this |
| `NumberTicker` jumps to final value with no animation | `useInView` triggers before content paints (server-render race) | Add `margin: '-80px'` or wait for `requestAnimationFrame` after mount |
| Custom cursor causes layout shift | Cursor element on `body` shifts when scrollbar appears | Position cursor `fixed` with `pointer-events: none`, `transform: translate3d()` not `top/left` |
| GSAP ScrollTrigger memory leak on hot reload | Missing `gsap.context()` + `ctx.revert()` cleanup | Kit `PinnedSection` includes this. If hand-rolling, wrap every effect in `gsap.context(() => {...}, ref)` and return `ctx.revert()` |
| Animation runs at 30fps on mobile | Animated property is not compositor-only (likely `width`/`height`/`top`) OR too many simultaneous animations | DevTools Performance → check for layout/paint frames; replace with `transform`/`opacity`; throttle simultaneous tweens to 3–5 |

---

## Standard debugging steps

1. DevTools Performance — record, look for red frames and layout/paint events
2. DevTools Rendering panel → enable "Paint flashing" and "Layer borders" to see what's actually painting
3. Emulate reduced motion + slow CPU 4× to expose perf bugs (DevTools → Rendering → Emulate CSS media + CPU throttling)
4. `document.getAnimations()` in console to list every running animation
5. `gsap.globalTimeline.totalTime()` to inspect GSAP state
6. For Lenis: `lenis.raf` is being called by GSAP ticker — if you also added a manual `requestAnimationFrame` loop, you have double-RAF
7. Grader self-check: `node ~/.claude/skills/web-animations/grader/audit-animations.mjs <project>` — flags unmarked motion files and missing reduce-guards

---

## When the grader fails

Exit code 1 = at least one violation. Reasons:

1. **`unmarkedMotionFiles` non-empty** — a file uses `motion.*` or `useMotion*` etc. without a `// web-animations: Tier N (Tn.m Name)` marker. Add the marker as the first non-import line.
2. **`tier3FilesMissingReducedMotionGuard` non-empty** — a file imports `gsap` or `lenis` but does not contain `useReducedMotion`, `prefers-reduced-motion`, or `matchMedia('reduce')`. Add the guard.

The grader does NOT yet enforce:
- Six-vestibular-trigger detection without explicit naming (it checks for library imports, not animated CSS properties)
- Compositor-only enforcement (it does not parse animated `width`/`height`)
- Tier-vs-site-type compliance (requires `.evolution/site-profile.json` — not yet wired)

These are Phase 5d grader upgrade scope.

---

## Common mistakes when reading kit components

- The kit's `useReducedMotion` returns `null` on first render (motion library default). Treat `null` as "loading" — most components fall through to the animated path because `null !== true`. This is intentional; the alternative (default-on) would flash motion before the hook resolved.
- `gsap.context()` scope MUST be passed as the second argument (`useEffect(() => { const ctx = gsap.context(..., root.current) ... }, [])`) for selectors to resolve correctly inside the ref.
- `Lenis` v1.1 + GSAP integration needs `gsap.ticker.lagSmoothing(0)` after `gsap.ticker.add` — otherwise Lenis stutters on tab-switch.

---

## SSR pitfalls (Next.js App Router, Remix, Astro)

### CSSScrollReveal + CSSScrollProgress inject styles at runtime

Both components call `document.createElement('style')` inside `useEffect` to mount the keyframes + `animation-timeline` rules. This runs CLIENT-SIDE ONLY. SSR consequence:

- First server-rendered paint shows the content WITHOUT the reveal animation
- Hydration adds the styles, then the animation runs from "0%" → end if the user is still above the trigger range
- This produces a brief visible "snap" on hydration for elements already in view at first paint

**Fix when shipping these on a server-rendered route:**

Move the keyframes + `animation-timeline` declarations to a global stylesheet (e.g. `app/globals.css`), import once at the root layout, and remove the `useEffect`-based injection.

```css
/* globals.css — server-renderable, no JS injection */
@supports (animation-timeline: view()) {
  .web-anim-css-reveal {
    animation: web-anim-fade-up linear both;
    animation-timeline: view();
    animation-range: var(--web-anim-range, entry 0% cover 30%);
  }
  @media (prefers-reduced-motion: reduce) {
    .web-anim-css-reveal { animation: none; opacity: 1; transform: none; }
  }
}
@keyframes web-anim-fade-up {
  from { opacity: 0; transform: translateY(var(--web-anim-from-y, 24px)); }
  to   { opacity: 1; transform: translateY(0); }
}
```

The kit's runtime-injection version is fine for CSR-only projects (Vite + SPA), Storybook, and codesandbox previews — but not for `next start` or SSR-first deploys.

### `'use client'` directive — already present on every Tier 2/3 component

Every kit component above Tier 1 starts with `'use client'`. Next.js App Router compiles them as Client Components. Importing into a Server Component is allowed (children stay server-rendered) but the component itself hydrates.

For Server Component-only routes (most marketing pages), `FadeUp` Tier 1 and the variants are the only kit pieces that ship without `'use client'` boundary cost. Use them deliberately on the highest-leverage routes.

### View Transitions in Next.js App Router

`TransitionLink` works in Pages Router and external routers. In App Router, prefer `unstable_ViewTransition` from `next` (15.2+) — it integrates with the App Router's transition machinery. The kit's `TransitionLink` is a generic fallback for routers that don't have a native wrapper.

---

## Node version requirement for the grader

`grader/audit-animations.mjs` uses `readdir(dir, { withFileTypes: true, recursive: true })` and top-level `await`. Requires:

- **Node ≥ 20.x** (recursive readdir landed in 20.1)
- **ESM** project (`"type": "module"` in package.json) OR call with `.mjs` extension (the script already uses `.mjs`)

If Node < 20:

```
TypeError: readdir(...) doesn't take 'recursive' option
```

…and the grader crashes silently from a CI perspective (exit code 1 looks like a violation, not a runtime fault).

**Recommended**: every CI workflow that invokes the grader pins `node-version: 20` or higher in the setup step. The grader does NOT yet self-check Node version at startup. Open follow-up.
