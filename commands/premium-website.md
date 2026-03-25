# Premium Website Suite

The premium website suite is the full set of web-* skills that together replace Lovable. It produces Awwwards/Linear/Stripe quality output — not generic AI UI.

**saas-build reads this file once at Phase 0. All rules here apply to every phase automatically. When the suite is updated, only this file needs changing.**

## Maintenance Rule

Whenever a web-* skill is created or meaningfully updated (new non-negotiable, new MCP call, new checklist item, new pattern), the session that made the change MUST:
1. Update the Skills table below if a new skill was added
2. Update the relevant section in this file (Landing Page, Performance, Quality Bar, or Pre-Deploy) to reflect the new rule
3. Push both files to GitHub in the same commit

This file is the contract. If a rule lives only in an individual skill file and not here, saas-build will not enforce it.

---

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
| `/vercel-react-best-practices` | Bundle splitting, Core Web Vitals, image optimization, Vercel deploy checklist |

---

## Design DNA

Read `~/.claude/web-system-prompt.md` before any UI generation. It contains:
- Token system (HSL variables only — never hardcoded hex/rgb)
- Typography scale (text-display / text-hero / text-title)
- Color discipline rules
- Visual signature elements (grid lines, grain texture, glow effects)
- Component quality standards

---

## Landing Page — Non-Negotiables (enforced on every build)

### 1. Animated Background
- Call `mcp__magic__21st_magic_component_inspiration` with "animated background hero [dark/enterprise/grid]" BEFORE writing the hero
- Then `mcp__magic__21st_magic_component_builder` to generate it
- `opacity: 0.15-0.25`, `z-index: -1`, lazy-loaded, wrapped in `useReducedMotion` check
- CSS grid pattern is the minimum — 21st.dev animated canvas preferred

### 2. Product Visual Mockup
- Built from shadcn primitives shaped like the real app — NEVER a gradient blob
- Browser chrome: 3 colored dots (`bg-destructive/50`, `bg-yellow-400/50`, `bg-green-500/50`) + URL bar showing `app.[product].com.au`
- Sidebar: column of muted icon-shaped divs, first one `bg-primary/80` (active state)
- Content: 3 stat cards + 3-4 data table rows with colored dot + muted line divs + status pill
- Glow wrapper: `absolute -inset-4 rounded-3xl bg-gradient-to-b from-brand/15 to-transparent blur-2xl`
- This is NOT optional. Every hero must have this.

### 3. Hero Entrance Animation
Read `/web-animations` Technique 3 STAGGER. Entrance order is always:
Pill → headline → subheadline → CTAs → trust stats → product visual (0.6s delay — loads last for effect)

### 4. Features Section
- Call `mcp__magic__21st_magic_component_inspiration` for "feature cards dark enterprise SaaS" BEFORE writing
- 3-6 cards, `whileInView` stagger from web-animations Technique 3

### 5. Color Discipline
- Primary color used exactly twice on the landing page: CTA button + feature icon backgrounds
- Never more. Enterprise design = restraint.

---

## Performance Rules (from vercel-react-best-practices)

Apply from scaffold onwards — not just at review time:

- `vite.config.ts` MUST have `manualChunks` splitting vendor-react, vendor-motion, vendor-query, vendor-supabase
- All routes in App.tsx MUST use `React.lazy` + `Suspense`
- No `useEffect` for data fetching — TanStack Query only
- All images: `alt`, `loading="lazy"`, explicit `width` + `height`
- Hero image: `loading="eager"` (LCP)
- AnimatedBackground: lazy-loaded (`React.lazy`)
- Font: `display=swap`
- No chunk exceeds 250KB gzipped

---

## Per-Page Quality Bar

Every page must pass before moving to the next:

```
[ ] Zero-data state: page makes sense with no data
[ ] Empty state: has CTA button (not just text)
[ ] Loading state: skeleton layout (not blank or spinner)
[ ] Error state: inline error + retry button
[ ] Color budget: primary appears <= 2 times on this page
[ ] User knows next action: clear without reading docs
[ ] Typography: at least 2 size/weight levels (not all text-sm)
[ ] Mobile: layout works at 375px
[ ] Focus rings: all interactive elements have focus-visible:ring-2
[ ] Aria labels: all icon-only buttons have aria-label
[ ] Modals (if any): close button aria-label="Close", Escape closes
```

"It renders" is not done. A page passes when a designer seeing it for the first time would not want to fix it.

---

## Pre-Deploy Checklist

Run before any deploy:

```
[ ] npm run build — no TypeScript errors
[ ] No chunk exceeds 250KB gzipped
[ ] All routes use React.lazy + Suspense
[ ] All images have alt, loading="lazy", explicit dimensions
[ ] Hero image uses loading="eager"
[ ] vercel.json at project root with SPA rewrites
[ ] CORS not * — locked to production domain
[ ] VITE_* env vars set in Vercel dashboard
[ ] Landing page animated background present
[ ] Landing page product visual mockup present (not a blob)
[ ] web-review score 38+/40
```

---

## Full Build Loop

```
/web-scope      → SCOPE.md with all design decisions
/web-scaffold   → foundation files + landing page hero
/web-supabase   → schema + auth (if backend)
/web-page × N   → one page at a time, review loop after each
/web-review     → audit before deploy (38+/40 required)
/web-deploy     → Vercel or Railway
```

Orchestrated autonomously by `/saas-build`. Update this file when the suite changes — saas-build reads it at Phase 0 and inherits everything automatically.
