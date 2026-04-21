# Web Coding Style

> Extends [common/coding-style.md](../common/coding-style.md) with frontend-specific content.

## File Organization

Organize by feature or surface area, not by file type:

```
src/
├── components/
│   ├── hero/
│   │   ├── Hero.tsx
│   │   ├── HeroVisual.tsx
│   │   └── hero.css
│   ├── scrolly-section/
│   │   ├── ScrollySection.tsx
│   │   └── StickyVisual.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── SurfaceCard.tsx
│       └── AnimatedText.tsx
├── hooks/
│   ├── useReducedMotion.ts
│   └── useScrollProgress.ts
├── lib/
│   ├── animation.ts
│   └── color.ts
└── styles/
    ├── tokens.css
    ├── typography.css
    └── global.css
```

## Design Tokens — CSS Custom Properties

Define tokens once. Never hardcode palette, typography, or spacing repeatedly:

```css
:root {
  /* Color — OKLCH for perceptual uniformity */
  --color-surface: oklch(98% 0 0);
  --color-text: oklch(18% 0 0);
  --color-accent: oklch(68% 0.21 250);

  /* Fluid type */
  --text-base: clamp(1rem, 0.92rem + 0.4vw, 1.125rem);
  --text-hero: clamp(3rem, 1rem + 7vw, 8rem);

  /* Fluid spacing */
  --space-section: clamp(4rem, 3rem + 5vw, 10rem);

  /* Motion */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Animation — Compositor-Only

**Animate these:**
- `transform`
- `opacity`
- `clip-path`
- `filter` (sparingly)

**Never animate:**
- `width`, `height`
- `top`, `left`, `right`, `bottom`
- `margin`, `padding`, `border`
- `font-size`

Animating layout-bound properties causes reflow on every frame — janky and battery-killing.

## Semantic HTML First

```html
<header>
  <nav aria-label="Main navigation">...</nav>
</header>
<main>
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">...</h1>
  </section>
</main>
<footer>...</footer>
```

Do not default to `<div>` stacks when a semantic element exists. Accessibility and SEO both benefit.

## Tailwind

- Follow the theme's token system — don't reach for arbitrary values (`w-[247px]`) unless there's a reason.
- Extract repeated class strings into components, not into `@apply` in CSS (Tailwind maintainers discourage `@apply`).
- Use `clsx` or `cn` helper for conditional classes.
- Prefer `gap-*` on flex/grid parents over margins on children.

## shadcn/ui

- Install components once, customize freely — shadcn is source code you own, not a dependency.
- Use the CLI to add: `npx shadcn@latest add button`.
- Edit the generated files to match your design tokens.
- Don't `npm update @shadcn/ui` — it doesn't work that way.

## Naming

| Kind | Convention | Example |
|---|---|---|
| Components | `PascalCase` | `ScrollySection`, `SurfaceCard` |
| Hooks | `use` prefix, camelCase | `useReducedMotion` |
| CSS classes | kebab-case | `.hero-visual` |
| Animation timelines | camelCase with intent | `heroRevealTl` |
| Types / props | `PascalCase`, `Props` suffix for component props | `HeroProps` |

## Responsive Breakpoints

Standard set (align with Tailwind defaults):
- `sm` 640px — large phones
- `md` 768px — tablets
- `lg` 1024px — small laptops
- `xl` 1280px — desktops
- `2xl` 1536px — large desktops

Mobile-first: write base styles, add breakpoint modifiers up.
