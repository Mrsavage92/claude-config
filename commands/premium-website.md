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
| `/web-stripe` | Stripe checkout session, webhook handler, UpgradeButton + PricingCards components, trial-to-paid flow |
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
Technique 3 STAGGER (Framer Motion) — entrance order is always:
Pill → headline → subheadline → CTAs → trust stats → product visual (0.6s delay — loads last for effect)

Implementation pattern:
```tsx
const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } } };
// Wrap section in <motion.div variants={container} initial="hidden" animate="show">
// Wrap each element in <motion.div variants={item}>
// Product visual gets delay={0.6} override
```
Full detail: `/web-animations` Technique 3.

### 4. Features Section
- Call `mcp__magic__21st_magic_component_inspiration` for "feature cards dark enterprise SaaS" BEFORE writing
- 3-6 cards, `whileInView` stagger from web-animations Technique 3

### 5. Onboarding & Trial Gate (SaaS products with auth — mandatory)
- Every SaaS product with auth MUST have a `/setup` or `/onboarding` wizard built as the 3rd page (after landing + auth)
- The wizard MUST collect product-specific business profile data before the user reaches the dashboard
- Final wizard step MUST activate the trial or present Stripe Checkout — never let users skip straight to dashboard
- `ProtectedRoute` MUST check `onboarding_complete` on the org record and redirect to `/setup` if false
- AppLayout MUST include a trial banner when trial is active: persistent top bar showing days remaining + "Upgrade now" button
- The trial banner is hidden only when the user is on an active paid plan

### 6. Color Discipline
- **Landing page**: primary color used exactly twice — CTA button + feature icon backgrounds. Never more.
- **App/dashboard pages**: primary color allowed for active nav items, primary action buttons, and progress/score indicators only. Max 3 uses per page.
- **PRIMARY COLOR BUDGET rule**: count every `text-primary`, `bg-primary`, `border-primary`, `ring-primary` on the page. If the count exceeds the budget: replace ambient/decorative uses with `text-muted-foreground`, `bg-muted`, or `text-brand`. Never use primary as a neutral fill.
- Enterprise design = restraint. If in doubt, use `text-muted-foreground` and `border-white/[0.07]`.

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

## Routing & Auth Rules

- All auth-gated routes MUST use a `ProtectedRoute` wrapper component — never `useEffect` redirects
- `ProtectedRoute` pattern: check session from Supabase, show skeleton while loading, redirect to `/auth` if null
- Auth pages (login, signup, reset-password) are exempt from the product visual mockup rule
- Auth pages quality bar: form labels, error states, redirect-after-login, mobile layout at 375px
- `/web-scope` MUST produce a `SCOPE.md` containing: page list, auth flow diagram, design decisions, color palette choice, component inventory. saas-build uses this as the build contract.

## Skill Trigger Guide

| Use | When |
|---|---|
| `/web-fix` | A specific element is broken, failing a review check, or visually wrong. Pass the exact component name and the failure. |
| `/web-component` | Adding a net-new UI element to an existing page. |
| `/web-page` | Building an entire page from scratch. |
| `/web-review` | Final quality gate before deploy — scores 40 dimensions across design, a11y, and performance. |

---

## Per-Page Quality Bar

Every page must pass before moving to the next:

```
[ ] Zero-data state: page makes sense with no data
[ ] Empty state: has CTA button (not just text)
[ ] Loading state: skeleton layout (not blank or spinner)
[ ] Error state: inline error + retry button
[ ] Color budget: count text-primary/bg-primary/border-primary/ring-primary — total <= 2. If > 2: replace with text-muted-foreground or bg-muted.
[ ] document.title: any page title change uses useEffect(() => { document.title = '...' }, []) — never at render scope
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
[ ] Each lazy route wrapped in ErrorBoundary
[ ] ProtectedRoute used on all auth-gated routes (no useEffect redirects)
[ ] All images have alt, loading="lazy", explicit dimensions
[ ] Hero image uses loading="eager"
[ ] vercel.json at project root with SPA rewrites
[ ] CORS not * — locked to production domain
[ ] VITE_* env vars set in Vercel dashboard
[ ] Landing page animated background present
[ ] Landing page product visual mockup present (not a blob)
[ ] Auth pages: form labels, error states, redirect-after-login working
[ ] No duplicate component patterns — EmptyState, skeleton, stat card, data table each exist once
[ ] All page title changes use useEffect — none at render scope
[ ] /setup or /onboarding wizard exists — mandatory for all SaaS products with auth
[ ] ProtectedRoute checks onboarding_complete and redirects to /setup if false
[ ] AppLayout trial banner present (days remaining + Upgrade button) when trial model is free-trial
[ ] TrialBanner hidden when subscription_status === 'active' — verified on a paid test account
[ ] Stripe checkout tested end-to-end with test card 4242 4242 4242 4242 — subscription activates and banner disappears
[ ] VITE_STRIPE_PUBLISHABLE_KEY + VITE_STRIPE_PRO_PRICE_ID set in Vercel dashboard
[ ] Stripe webhook endpoint registered in Stripe dashboard — correct prod URL, correct events
[ ] Sentry initialised in main.tsx — VITE_SENTRY_DSN set in Vercel dashboard
[ ] Sentry.ErrorBoundary wraps root <App /> — unhandled render errors are captured
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
