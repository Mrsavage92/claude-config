# [Product] — Design System MASTER

This is the **single source of design truth** for the project. Every web-* skill reads this BEFORE building or refining any route.

When `design-system/pages/<route>.md` exists for a given route, that file's rules **override** the matching sections below for that route only. The rest of the route inherits from MASTER.

Update MASTER only when a decision applies project-wide. Per-route deviations belong in `pages/<route>.md`, not here.

---

## Tokens

```css
:root {
  /* Color — semantic roles, OKLCH for perceptual uniformity */
  --color-bg: oklch(<L>% <C> <H>);
  --color-surface: oklch(<L>% <C> <H>);
  --color-text: oklch(<L>% <C> <H>);
  --color-text-muted: oklch(<L>% <C> <H>);
  --color-primary: oklch(<L>% <C> <H>);
  --color-accent: oklch(<L>% <C> <H>);
  --color-border: oklch(<L>% <C> <H>);
  --color-danger: oklch(<L>% <C> <H>);

  /* Type scale — fluid clamps, system uses ONE display + ONE text family */
  --font-display: "<choice>", system-ui, sans-serif;
  --font-text:    "<choice>", system-ui, sans-serif;
  --font-mono:    "<choice>", ui-monospace, monospace;

  --text-xs:   clamp(0.75rem, 0.7rem + 0.2vw, 0.825rem);
  --text-sm:   clamp(0.875rem, 0.83rem + 0.2vw, 0.95rem);
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-lg:   clamp(1.125rem, 1.05rem + 0.4vw, 1.375rem);
  --text-xl:   clamp(1.5rem, 1.3rem + 0.8vw, 2rem);
  --text-2xl:  clamp(2rem, 1.7rem + 1.2vw, 2.875rem);
  --text-hero: clamp(2.5rem, 1.5rem + 5vw, 6.5rem);

  /* Spacing — 4px scale, fluid section spacing */
  --space-section: clamp(4rem, 3rem + 5vw, 9rem);

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  /* Motion */
  --duration-fast: 150ms;
  --duration-normal: 280ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Color job (locked)

The primary color appears in EXACTLY these semantic roles:
1. <role 1, e.g. "primary CTA button">
2. <role 2, e.g. "active nav indicator">

A single role used many times still counts as 1 role. Decorative use of primary on backgrounds, gradients, or icons that aren't CTAs is **banned** at this project level.

## Typography pairing (locked)

- **Display:** <choice + foundry + why>
- **Text:** <choice + foundry + why>
- **Mono:** <choice + foundry + why, or "none">

Banned alternatives for this project: <list — e.g. "Inter, Geist Sans solo, system-ui">

## Mode

`<light-first | dark-first | both>` — `<one-sentence why>`

## Motion strategy

One of:
- **Choreographed entrance** — hero stagger, no continuous motion
- **Continuous ambient** — always-on subtle motion in a single element
- **Scroll-driven** — view-transitions + scroll-driven CSS animations only
- **Silent** — no decorative motion; motion only on user interaction

Pick ONE. Mixing strategies = visible jank.

## Signature element (project memorable choice)

The ONE thing this site has that no comparable product has. Required — not optional.

- **What it is:** <e.g. "scroll-driven kinetic typography that splits the hero headline letter-by-letter as you scroll past 50% viewport, rebuilding into the services H1">
- **Where it lives:** <which route(s)>
- **Why it's not a banned reach:** check `~/.claude/skills/taste-skill/data/taste-rules.csv` — confirm not on the banned-reach list.

## Banned reaches for this project

Beyond the global `~/.claude/skills/taste-skill/data/taste-rules.csv`, project-specific bans:
- <e.g. "no dashboard mockup in hero — project is service-led, not product-led">
- <e.g. "no Lottie animations — too playful for the credible-service brand">

## Component primitives in use

The components below are the ONLY ones build skills are allowed to compose pages from. If a new pattern is needed, add to this list first (then build).

- `Container` — max-width + horizontal padding
- `Section` — vertical rhythm wrapper
- `Heading` — display type with locked scale
- `Body` — text type with locked measure
- `Button` — primary | secondary | ghost (radius/focus/cursor pre-set)
- `Card` — locked elevation tier + radius
- `Field` — input + label + error slot, focus-visible enforced
- <add others as scaffolded>

## Per-page override files

Stored at `design-system/pages/<slug>.md`. Slug uses kebab-case from the route — `/` → `home.md`, `/pricing` → `pricing.md`, `/services/audits` → `services-audits.md`.

When a route is built or rebuilt:
1. Read this MASTER.md first.
2. Read `pages/<slug>.md` if it exists.
3. For any section present in the override, use the override's value.
4. For sections absent from the override, inherit from MASTER.

Override-only fields (always per-route, never global):
- Hero signature variant
- Section composition order
- Per-route component locks (e.g. `/pricing` uses `PricingTable`; landing does not)
- Per-route motion intensity dial (0.0–1.0)
