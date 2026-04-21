# Web Performance

> Extends [common/performance.md](../common/performance.md).

## Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| FCP | < 1.5s |
| TBT | < 200ms |

Measure in production (real user monitoring), not just local Lighthouse.

## Bundle Budgets

| Page Type | JS (gzipped) | CSS |
|-----------|--------------|-----|
| Landing page | < 150kb | < 30kb |
| App page | < 300kb | < 50kb |
| Microsite | < 80kb | < 15kb |

Monitor via `vite-bundle-visualizer` or equivalent.

## Loading Strategy

1. Inline critical above-the-fold CSS where justified.
2. Preload hero image and primary font only.
3. Defer non-critical CSS / JS.
4. Dynamic import heavy libraries:

```ts
const { default: gsap } = await import('gsap')
const { ScrollTrigger } = await import('gsap/ScrollTrigger')
```

- Route-level code splitting (Vite / React Router lazy).
- Never ship an unused library to the landing page.

## Image Optimization

- Explicit `width` and `height` attributes (prevents CLS).
- `loading="eager"` + `fetchpriority="high"` for hero media ONLY.
- `loading="lazy"` for below-the-fold.
- Prefer AVIF or WebP with fallbacks.
- Never ship source images dramatically larger than rendered size.
- Use responsive `srcset` / `sizes` for anything displayed at multiple breakpoints.

## Font Loading

- Max two font families unless there's a clear reason.
- `font-display: swap`.
- Subset where possible (Latin only if not international).
- Preload only the truly critical weight/style:

```html
<link rel="preload" href="/fonts/display-bold.woff2" as="font" type="font/woff2" crossorigin>
```

## Animation Performance

- Compositor-friendly properties only (transform, opacity).
- Use `will-change` narrowly and remove it once the animation completes.
- CSS for simple transitions; `requestAnimationFrame` or established libraries (GSAP, Framer Motion) for complex.
- Avoid scroll handler churn — use `IntersectionObserver` or library helpers.

## React Performance

- Memoize expensive computations with `useMemo`, but only after measuring — `useMemo` has its own cost.
- `React.memo` for components that receive stable props and re-render often.
- Virtualize long lists (>100 items): TanStack Virtual.
- Avoid creating new objects / functions in render paths that get passed as props to memoized children.

## Perf Checklist

- [ ] All images have explicit dimensions
- [ ] No render-blocking resources
- [ ] No layout shifts from dynamic content
- [ ] Motion on compositor properties only
- [ ] Third-party scripts async/defer, loaded only when needed
- [ ] Fonts preloaded + `font-display: swap`
- [ ] Bundle size within budget
- [ ] Lighthouse mobile score > 90 on critical pages
