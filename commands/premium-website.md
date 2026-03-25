# Premium Website Suite

The premium website suite is the full set of web-* skills that together replace Lovable. It produces Awwwards/Linear/Stripe quality output — not generic AI UI.

## What It Is

A coordinated skill pipeline for building production-grade React web apps inside Claude Code. Every skill reads `~/.claude/web-system-prompt.md` (the Design DNA) before generating anything.

## Skills in the Suite

| Skill | Role |
|---|---|
| `/web-scope` | Define pages, design decisions, and product architecture before writing code |
| `/web-scaffold` | Bootstrap the full project: config files, design system, landing page with animated hero |
| `/web-animations` | Framer Motion patterns — Technique 3 STAGGER is the standard hero entrance |
| `/web-supabase` | Schema, RLS policies, auth, TypeScript types |
| `/web-page` | Build one page at a time with per-page self-review loop |
| `/web-component` | Add individual components to an existing page |
| `/web-review` | Design + a11y + performance audit (target 38+/40) before deploy |
| `/web-deploy` | Vercel (SPAs) or Railway (full-stack) with smoke tests |
| `/web-fix` | Fix a specific component, bug, or review failure |

## The Engine Behind Every Landing Page

Two things are non-negotiable on every landing page:

**1. Animated background**
- Call `mcp__magic__21st_magic_component_inspiration` with "animated background hero [dark/enterprise/grid]"
- Then `mcp__magic__21st_magic_component_builder` to generate
- `opacity: 0.15-0.25`, `z-index: -1`, wrapped in `useReducedMotion` check
- CSS grid pattern is the minimum — 21st.dev animated canvas is preferred

**2. Product visual mockup**
- Built from shadcn primitives shaped like the real app — never a gradient blob
- Browser chrome: 3 colored dots + URL bar
- Sidebar: muted icon-shaped divs, first one `bg-primary/80`
- Content: 3 stat cards + 3-4 data table rows
- Wrapped in glow: `absolute -inset-4 rounded-3xl bg-gradient-to-b from-brand/15 to-transparent blur-2xl`

**Hero entrance animation (Technique 3 STAGGER from web-animations):**
Pill → headline → subheadline → CTAs → stats → product visual (0.6s delay, loads last for effect)

## Design DNA

`~/.claude/web-system-prompt.md` is the master design reference. Read it before any UI generation. It contains:
- Token system (HSL variables only — never hardcoded hex/rgb)
- Typography scale (text-display / text-hero / text-title)
- Color discipline rules
- Visual signature elements (grid lines, grain texture, glow effects)
- Component quality standards

## Full Build Loop (orchestrated by /saas-build)

```
/web-scope      → SCOPE.md with all design decisions
/web-scaffold   → foundation files + landing page hero
/web-supabase   → schema + auth (if backend)
/web-page × N   → one page at a time, review loop after each
/web-review     → audit before deploy (38+/40 required)
/web-deploy     → Vercel or Railway
```

## Quality Bar

"It renders" is not done. A page passes when:
- It looks correct with zero data (new user)
- It looks correct with real data
- It looks correct when loading (skeleton layout)
- It looks correct when the API fails (inline error + retry)
- A designer seeing it for the first time would not want to fix it
