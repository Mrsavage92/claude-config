# Routing decision tree

For each issue identified in Phase 1, walk this tree top-down. Stop at the first matching rule.

## Tree

```
Is the route flagged REBUILD by /critique?
├── YES → not visual-uplift's scope. Halt and route to /web-page.
└── NO → continue
    │
    Is vq_by_dimension.structural_integrity < 4?
    ├── YES → halt; the route has hydration/blank issues; route to /web-page.
    └── NO → continue
        │
        For each dimension where score < tier_floor / 5:
        │
        ├── typography < tier_floor
        │   ├── current font is on banned list (Inter, Geist alone, default system)
        │   │   → /typeset, reference: Pangram Pangram OR ABC Dinamo OR Klim
        │   └── current font is OK but hierarchy is flat
        │       → /typeset, focus: hierarchy + scale contrast
        │
        ├── layout < tier_floor
        │   ├── card grid uniformity (cards same size, same padding, same shadow)
        │   │   → mcp__magic__21st_magic_component_inspiration(category: bento | asymmetric | editorial)
        │   │   → then /web-page to rebuild affected section
        │   │   ⚠ if proposing bento, flag feedback_taste_calibration line 41
        │   └── no section rhythm (all sections same height, same density)
        │       → mcp__magic__21st_magic_component_inspiration(category: editorial)
        │       → then /web-page
        │
        ├── color < tier_floor
        │   ├── using shadcn defaults (slate/zinc/neutral)
        │   │   → manual token swap; define 3-5 OKLCH roles in tokens.css
        │   │   → use /colorize if available; otherwise hand-edit CSS variables
        │   └── dark navy + warm gold on dark (the universal SaaS palette)
        │       ⚠ flag feedback_taste_calibration line 40
        │       → /colorize with a different palette direction
        │
        ├── motion < tier_floor
        │   ├── motion completely absent
        │   │   → /animate, focus: functional motion (state changes, focus indicators, scroll choreography)
        │   ├── motion is purely decorative (bouncing icons, idle loops)
        │   │   → /animate, focus: replace decorative with functional
        │   └── motion is OK but missing on a hero element
        │       → /animate, focus: hero
        │
        ├── distinctiveness < tier_floor (the "no memorable choice" case)
        │   │
        │   Pick ONE memorable_choice candidate that:
        │   - is brand-specific to THIS project (not generic Awwwards pattern)
        │   - hasn't been used in any of the last 3 projects (originality cross-check)
        │   - falls under one of: kinetic typography, custom WebGL letterforms,
        │     R3F product visualization, scroll-driven layout transitions,
        │     stagger orchestration, magnetic micro-physics
        │   │
        │   Then route based on amplitude:
        │   ├── memorable_choice is motion-based → /animate or /overdrive
        │   ├── memorable_choice is delight-based (one-off surprise) → /delight
        │   └── memorable_choice is structural (layout, type, color) → /web-page or /typeset
        │
        ├── hero_impact < tier_floor
        │   ├── product is shown but uninteresting → mcp__magic__21st_magic_component_refiner
        │   ├── gradient blob in place of product → /web-page; insert real product
        │   └── hero is text-only, generic → mcp__magic__21st_magic_component_inspiration(category: hero)
        │       → then /web-page for hero block rebuild
        │
        ├── product_visibility < tier_floor
        │   → /web-page; insert real product screenshot, R3F scene, or video
        │   ⚠ NEVER replace product with gradient blob
        │
        ├── content_clarity < tier_floor (the WHO YOU ARE / WHAT YOU DO / WHO IT'S FOR fail)
        │   → not visual-uplift's primary scope; flag and recommend /copywriting + /web-page
        │   (visual-uplift can still surface the issue but does not own the fix)
        │
        └── No dimension below floor, but vq_aggregate is just under
            → /calibrate-amplitude with dial = 0.5 + (tier_floor - vq_aggregate) × 0.4
            → e.g. tier_floor 3.6, current 3.3, gap 0.3 → dial 0.62
            → if gap > 0.5, calibrate-amplitude alone won't bridge it — pick a structural issue instead
```

## Magic MCP selection rules

| Tool | When | What it returns |
|---|---|---|
| `mcp__magic__21st_magic_component_inspiration` | Issue needs a *reference pattern* before rebuild. Cheaper than rebuilding blind. | Links to inspiration; not actual code. |
| `mcp__magic__21st_magic_component_refiner` | Existing component is close-but-mid. Same shape, better execution. | Refined version of the component. |
| `mcp__magic__21st_magic_component_builder` | Brand-new component is needed that isn't in the codebase. Rare in uplift mode. | New component code. |
| `mcp__magic__logo_search` | Missing real brand logos for testimonials, partner rows, footer. | SVG logos. |

Rules:
1. **Inspiration before refiner before builder.** Each step is more expensive than the last. Don't skip levels.
2. **Inspiration drives the brief — never the implementation.** Take the pattern, write the brief in your own words, then `/web-page` builds it. Don't paste inspiration code into the repo.
3. **Logo search before manual logos.** Real brand SVGs beat hand-drawn placeholders every time.

## Tier floors (for reference)

| Target tier | Floor on 0-5 vq scale |
|---|---|
| 90 | 3.0 |
| 95 | 3.5 |
| 98 | 4.0 |
| 100 | 4.5 |

If invoked without `--tier`, default to 95.

## Sizing rules (AI wall-clock)

| Tag | Range | Examples |
|---|---|---|
| Quick | 5-10 min | Logo search + drop-in, single token swap, micro-polish item |
| Medium | 15-30 min | Single skill invocation (typeset, animate, calibrate-amplitude), hero section rebuild |
| Big swing | 40-90 min | Full layout rebuild across 2+ routes via /web-page, signature moment from scratch |

Per `feedback_ai_time_not_human_time` — sizes are minutes/hours, never days/weeks. If something is genuinely a day of work, it's outside visual-uplift's scope.
