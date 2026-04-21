# Web Design Quality Standards

> Extends [common/patterns.md](../common/patterns.md) with design-quality guidance.

## Anti-Template Policy

Frontend output must look intentional, opinionated, and specific to the product. **Generic template aesthetics are a bug.**

### Banned Patterns

- Default card grids with uniform spacing and no hierarchy
- Stock hero: centered headline, gradient blob, generic CTA
- Unmodified shadcn/Tailwind defaults passed off as finished design
- Flat layouts with zero layering, depth, or motion
- Uniform radius, spacing, and shadows across every component
- Safe gray-on-white styling with one accent color
- Dashboard-by-numbers: sidebar + cards + charts with no point of view
- Default font stacks used without a deliberate reason

### Required Qualities

Every meaningful frontend surface should demonstrate **at least four** of:

1. Clear hierarchy through scale contrast
2. Intentional rhythm in spacing (not uniform padding everywhere)
3. Depth / layering via overlap, shadows, surfaces, or motion
4. Typography with character and a real pairing strategy
5. Color used semantically, not decoratively
6. Hover, focus, and active states that feel designed
7. Grid-breaking editorial / bento composition where appropriate
8. Texture, grain, or atmosphere when it fits the direction
9. Motion that clarifies flow, not distracts from it
10. Data visualization treated as part of the design system

## Before Writing Frontend Code

1. Pick a specific style direction. No vague "clean minimal".
2. Define a palette intentionally (OKLCH, 3–5 semantic roles).
3. Choose typography deliberately (one display + one text pairing).
4. Gather real references — screenshots, product galleries.
5. Use the `/web-design-research` skill for research-first workflow.

## Worthwhile Style Directions

- Editorial / magazine
- Neo-brutalism
- Glassmorphism (with real depth, not sticker-flat)
- Dark luxury / light luxury with disciplined contrast
- Bento layouts
- Scrollytelling
- 3D integration
- Swiss / International typographic
- Retro-futurism

**Do not default to dark mode.** Choose the visual direction the product actually wants.

## Component Checklist

Before shipping a component:

- [ ] Does it avoid looking like a default Tailwind/shadcn template?
- [ ] Intentional hover / focus / active / disabled states?
- [ ] Uses hierarchy rather than uniform emphasis?
- [ ] Would this look believable in a real product screenshot?
- [ ] If supporting both themes, do light AND dark feel intentional?
- [ ] Loading and empty states designed (not placeholder text)?
- [ ] Error states clear and branded (not browser-default)?

## Related Skills

- `/web-design-research` — pre-build research
- `/dashboard-design` — 20 Laws of Dashboard Design, pattern library
- `/premium-website` — premium landing page suite
