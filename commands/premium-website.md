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
| `/web-design-research` | Pre-build design research — competitor analysis, 21st.dev component sourcing, LottieFiles animations, unique color system, multi-page marketing structure. Runs BEFORE /web-scope. Outputs DESIGN-BRIEF.md. |
| `/web-scope` | Define pages, design decisions, and product architecture before writing code — reads DESIGN-BRIEF.md as primary input |
| `/web-scaffold` | Bootstrap the full project: config files, design system, routes, AppLayout, TrialBanner, Sentry init — hero built in Phase 4 |
| `/web-animations` | Framer Motion patterns — Technique 3 STAGGER is the standard hero entrance |
| `/web-supabase` | Schema, RLS policies, auth, TypeScript types |
| `/web-page` | Build one page at a time with per-page self-review loop |
| `/web-component` | Add individual components to an existing page |
| `/web-review` | Design + a11y + performance audit (target 38+/40) before deploy |
| `/web-deploy` | Vercel (SPAs) or Railway (full-stack) with smoke tests |
| `/web-fix` | Fix a specific component, bug, or review failure |
| `/web-stripe` | Stripe checkout session, webhook handler, UpgradeButton + PricingCards components, trial-to-paid flow |
| `/web-table` | TanStack Table implementation — sorting, filtering, pagination, column visibility, row selection, export |
| `/web-onboarding` | Multi-step onboarding wizard — progress bar, step data collection, Supabase writes, trial activation |
| `/web-settings` | Settings page — profile, password change, Stripe billing portal, team invites, danger zone |
| `/web-email` | Transactional emails — Resend + React Email, 5 templates, FastAPI delivery, trial reminder cron |
| `/dashboard-design` | Enterprise dashboard patterns — KPI cards, sparklines, charts, sidebar, date range, filters, CMD+K, real-time |
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

## 21st.dev Component Registry

**Every section on a landing page must be sourced from 21st.dev — never invented from scratch.**

Component choices are made ONCE during `/web-design-research` and locked in DESIGN-BRIEF.md as a Component Lock table. Build skills read that table — they do NOT re-run MCP queries. The registry below is used by `/web-design-research` to understand defaults and selection criteria. It is a research reference, not a build-time instruction.

### Component Selection Criteria

Before calling MCP, classify the product:

| Product type | Characteristics | Component style to select |
|---|---|---|
| **Enterprise B2B SaaS** | Compliance, finance, HR, legal, operations | Clean grid layouts, minimal animation, structured typography, no gradients in features. Prefer: Features 4, simple FAQ, Footer 2 standard. |
| **Developer / technical tool** | APIs, DevOps, data infrastructure, code tools | Dark-first, mono-spaced accents, code snippets in features, grid lines. Prefer: BentoGrid with code preview, minimal testimonials, technical FAQ. |
| **Consumer / growth SaaS** | SMB tools, productivity, scheduling, marketing | Warmer palette, testimonials prominent, animated stats, friendly copy. Prefer: BentoGrid or Features 4, TestimonialSlider prominent, WaitlistHero if pre-launch. |
| **AI product** | AI writing, automation, agents, chatbots | Split-pane mockup, typewriter animation in hero, stats on tokens/speed/accuracy. Prefer: CaseStudies stats with AI numbers, BentoGrid showing AI output. |
| **Marketplace / platform** | Two-sided networks, directories, aggregators | Social proof heavy, logo cloud prominent, testimonials from both sides. Prefer: TestimonialSlider + CaseStudies combo. |

When MCP returns multiple options: pick the one whose visual weight and animation level matches the product type above. Heavy animations suit consumer/AI products. Clean/static layouts suit enterprise. Never pick based on personal preference — pick based on the product type criteria.

Then call `mcp__magic__21st_magic_component_builder` to generate it, then adapt tokens.

| Section | searchQuery | Default | Notes |
|---|---|---|---|
| Announcement banner | `announcement banner bar` | `Banner 1` | Mounts above navbar. Use for launches, feature flags, promotions. Optional — include when there's a real announcement. |
| Animated background | `animated background gradient` | `BackgroundGradientAnimation` | Interactive WebGL blobs. Opacity 0.15-0.2, z-index -1. Wrap in `useReducedMotion` check. |
| Navigation | `navigation header navbar` | `HeroSection 2` (extract its `HeroHeader`) | Scroll-aware blur header. `useScroll` from motion/react. |
| Hero section | `hero section landing page` | `HeroSection 2` | `AnimatedGroup` spring blur entrance built-in. Adapt stagger order to Technique 3. |
| Logo cloud | `logo cloud marquee` | `Logo Cloud 3` or `Logo Cloud 4` | `InfiniteSlider` + mask fade edges. Use `Logo Cloud 4` when ProgressiveBlur suits the style. |
| Stats / metrics | `stats metrics counter` | `CaseStudies` (CountUp layout) | `react-countup` with `enableScrollSpy`. Sits between Logo Cloud and Features. Minimum 3 numbers. |
| Features | `features grid section` | `Features 4` | Border-grid layout with icon + title + 2-sentence body. `whileInView` stagger. Use `BentoGrid` as alternative when a hero feature needs colSpan emphasis. |
| Testimonials | `testimonials social proof` | `TestimonialSlider` | Framer Motion `AnimatePresence` with photo, star rating, dot indicators. |
| Pricing | `pricing cards section` | `PricingCard` component | Glass-effect cards with `backdrop-blur`. Center card gets `border-primary/50`. |
| FAQ | `FAQ accordion` | `Faqs 1` or `RuixenAccordian02` | `Faqs 1` for single-column rounded-card style. `RuixenAccordian02` for two-column General/Billing/Technical layout. Mandatory before Final CTA. |
| CTA section | `call to action section` | `Cta 4` | Muted bg container, checklist on right, arrow button CTA. |
| Waitlist CTA | `waitlist email capture` | `WaitlistHero` or `WaitlistForm` | Use as primary CTA for pre-launch products. `WaitlistHero` = full-screen rotating rings + confetti. `WaitlistForm` = AnimatePresence input + confetti on submit. Replaces pricing section on waitlist builds. |
| Footer | `footer website` | `Footer 2` | Multi-column: logo+tagline left, 4 link columns, legal row at bottom. |

**Adapt rules after every 21st.dev component:**
1. Replace hardcoded hex/rgb with `hsl(var(--token))`
2. Replace raw Tailwind color classes (`text-gray-500`) with semantic tokens (`text-muted-foreground`)
3. Apply the project font via `font-sans`
4. Match `rounded-lg` to `--radius`
5. Verify dark mode works via CSS variables

**Mandatory landing page sections (all required, in this order):**
[Banner] → Nav → Hero (with animated bg) → Logo Cloud → Stats → Features → Testimonials → Pricing → FAQ → Final CTA → Footer

Note: Banner is optional — include when there's a real announcement. All other sections are mandatory.

---

## Landing Page — Non-Negotiables (enforced on every build)

### 1. Animated Background
- Use `BackgroundGradientAnimation` from 21st.dev (searchQuery: `animated background gradient`) — NOT a CSS grid fallback
- `opacity: 0.15-0.2`, `z-index: -1`, lazy-loaded (`React.lazy`), wrapped in `useReducedMotion` check
- This is the interactive WebGL blob animation — it is what separates the output from AI slop

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

### 0. Announcement Banner (optional — include when there's a real announcement)
- Use `Banner 1` from 21st.dev (searchQuery: `announcement banner bar`) — mounts above the navbar
- Use for product launches, beta access, major feature drops, or promotions
- Style: muted bg, small pill label ("New" / "Beta" / "Now live"), one-line message, optional arrow link
- If no real announcement exists: omit this section entirely — never fake an announcement

### 4. Logo Cloud (mandatory between hero and features)
- Use `Logo Cloud 3` or `Logo Cloud 4` from 21st.dev (searchQuery: `logo cloud marquee`)
- `Logo Cloud 4` preferred — `InfiniteSlider` + `ProgressiveBlur` fade on both edges
- Source logo SVGs from `svgl.app` — search by tool/brand name
- Heading pattern: muted text "Trusted by teams at" above the marquee

### 4b. Stats / CountUp Section (mandatory between Logo Cloud and Features)
- Use `CaseStudies` component from 21st.dev (searchQuery: `stats metrics counter`)
- Install `react-countup` — use with `enableScrollSpy: true` so numbers animate when scrolled into view
- Minimum 3 stats pulled from real product value prop (e.g. "10,000+ businesses", "98% satisfaction", "2 min setup")
- Layout: large bold animated number + small muted label. Dark section bg to visually separate from logo cloud.
- This section is what builds trust before Features — do not skip it.

### 5. Features Section
- Use `Features 4` from 21st.dev (searchQuery: `features grid section`) — border-grid layout with icon + title + 2-sentence body
- 3-6 cards, `whileInView` stagger from web-animations Technique 3
- Alternative: use `BentoGrid` (searchQuery: `bento grid layout`) when one feature needs visual emphasis — hero feature spans 2 columns with screenshot/animation, supporting features fill the grid

### 5b. Testimonials (mandatory between features and pricing)
- Use `TestimonialSlider` from 21st.dev (searchQuery: `testimonials social proof`)
- Framer Motion `AnimatePresence` with photo, star rating, dot indicator navigation
- Minimum 3 testimonials with realistic names and roles

### 5c. Pricing
- Use `PricingCard` from 21st.dev (searchQuery: `pricing cards section`) — glass-effect cards with `backdrop-blur`
- 3 tiers. Center card: `border-primary/50 bg-primary/5 shadow-lg` + "Popular" badge. Each: name, price, description, feature list with `CheckCircle2`, CTA button.
- For pre-launch products: replace Pricing with Waitlist section (see 5f)

### 5d. FAQ Section (mandatory before Final CTA)
- Use `Faqs 1` from 21st.dev (searchQuery: `FAQ accordion`) — rounded card with shadcn Accordion component
- Alternative: `RuixenAccordian02` for two-column layout with General / Billing / Technical categories
- Minimum 5 questions. Write answers as real conversational copy — not corporate non-answers.
- Section heading: "Frequently asked questions" with short muted subheading

### 5e. Final CTA Section
- Use `Cta 4` from 21st.dev (searchQuery: `call to action section`) — muted bg container, checklist on right, arrow button

### 5f. Waitlist Form (replaces Pricing + Final CTA for pre-launch products)
- Use `WaitlistHero` from 21st.dev (searchQuery: `waitlist email capture`) for full-screen treatment
- Alternative: `WaitlistForm` — `AnimatePresence` input with confetti on submit
- Connect to Supabase `waitlist` table (email, created_at). Show position number after sign-up.
- This is the PRIMARY CTA for any product that doesn't have live pricing yet

### 5g. Footer
- Use `Footer 2` from 21st.dev (searchQuery: `footer website`) — multi-column: logo+tagline left, 4 link columns, legal bottom row
- No color in footer — pure `text-muted-foreground`. Include social icons.

### 6. Onboarding & Trial Gate (SaaS products with auth — mandatory)
- Every SaaS product with auth MUST have a `/setup` or `/onboarding` wizard built as the 3rd page (after landing + auth)
- The wizard MUST collect product-specific business profile data before the user reaches the dashboard
- Final wizard step MUST activate the trial or present Stripe Checkout — never let users skip straight to dashboard
- `ProtectedRoute` MUST check `onboarding_complete` on the org record and redirect to `/setup` if false
- AppLayout MUST include a trial banner when trial is active: persistent top bar showing days remaining + "Upgrade now" button
- The trial banner is hidden only when the user is on an active paid plan

### 6. Color Discipline
- **Landing page**: primary color used exactly twice — CTA button + feature icon backgrounds. Never more.
- **App/dashboard pages**: primary color allowed for active nav items, primary action buttons, and progress/score indicators only. Max 2 uses per page (same budget as landing page).
- **PRIMARY COLOR BUDGET rule**: count every `text-primary`, `bg-primary`, `border-primary`, `ring-primary` on the page. If the count exceeds 2: replace ambient/decorative uses with `text-muted-foreground`, `bg-muted`, or `text-brand`. Never use primary as a neutral fill.
- Enterprise design = restraint. If in doubt, use `text-muted-foreground` and `border-white/[0.07]`.

---

## Stripe / Payments (enforced by Phase 3b)

For any product with paid plans or a trial-to-paid flow — run `/web-stripe` after Supabase setup, before building pages:

- Stripe checkout session: always server-side (FastAPI endpoint or Supabase edge function) — never client-side price creation
- Webhook handler MUST handle: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- `UpgradeButton` + `PricingCards` components written from `/web-stripe` skill — never ad-hoc checkout buttons
- Trial banner "Upgrade now" CTA wires to checkout session — never to a pricing page link
- Billing tab in `/settings` uses Stripe Customer Portal redirect — never a custom billing UI
- Required env vars: `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_STRIPE_PRO_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- Webhook endpoint registered in Stripe dashboard before deploy is considered done — log as NEEDS_HUMAN if not yet done
- Smoke test end-to-end with test card `4242 4242 4242 4242` — subscription activates and trial banner disappears

---

## Testing (enforced by Phase 2 and Phase 4.5)

### Test scaffolding — installed at scaffold time
At scaffold time (`/web-scaffold`), the following are always generated:
- `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react`
- `vitest.config.ts` with jsdom environment + `./src/tests/setup.ts` setupFile
- `src/tests/setup.ts` — contains `import '@testing-library/jest-dom'`
- The `src/tests/` directory exists from day one — never created mid-build

### Phase 4.5 — Core test coverage (before quality gate)
After all pages are built and self-reviewed, before `/web-review`, write three test files:

- `src/tests/auth.test.ts` — 4 scenarios: signup, wrong password, protected route without session, /setup redirect after onboarding done
- `src/tests/onboarding.test.ts` — 3 scenarios: complete wizard, partial completion, trial activation
- `src/tests/core.test.ts` — 2 scenarios: primary query returns empty (expect EmptyState with CTA), primary query errors (expect error state + retry, not white screen)

Use Vitest + `@testing-library/react`. Mock Supabase with `vi.mock('@/lib/supabase')`. All tests must pass before `/web-review` runs. If a test fails: fix the code, not the test.

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

- All auth-gated routes MUST use a `ProtectedRoute` wrapper — never `useEffect` redirects
- **`ProtectedRoute` requires THREE checks (all mandatory):**
  - (a) session exists — redirect to `/auth` if null
  - (b) skeleton layout while session loads — never a blank flash (use shadcn Skeleton matching app layout)
  - (c) `onboarding_complete` on the org record — redirect to `/setup` if false
- **`AuthRoute`** (separate component, session-only, no onboarding check) wraps `/setup` and `/reset-password` specifically — using `ProtectedRoute` on `/setup` causes a redirect loop
- Auth pages (login, signup, reset-password) are exempt from the product visual mockup rule
- Auth pages quality bar: form labels, error states, redirect-after-login, mobile layout at 375px
- `/web-scope` MUST produce a `SCOPE.md` containing: page list, auth flow diagram, design decisions, color palette choice, component inventory. saas-build uses this as the build contract.

## Webmanifest (enforced at scaffold time)

`public/site.webmanifest` is generated at scaffold time — not deferred. Add to `index.html`:
```html
<link rel="manifest" href="/site.webmanifest" />
<link rel="apple-touch-icon" href="/icon-192.png" />
```
Log NEEDS_HUMAN: "Add icon-192.png and icon-512.png to /public."

## Page Type Detection (enforced by Phase 4b)

Before building any page, check the type and read the relevant sub-skill:

| Page type | Sub-skill | What it enforces |
|---|---|---|
| Dashboard / analytics / monitoring / data overview | `dashboard-design` | KpiCard + Sparkline, DateRangePicker, 28-item checklist |
| Any list of records (customers, transactions, logs) | `web-table` | TanStack Table v8, skeleton rows, bulk action bar |
| `/settings` route | `web-settings` | 4-tab layout, Stripe Customer Portal for billing tab |
| `/setup` or `/onboarding` wizard | `web-onboarding` | Max 4 steps, writes per-step, trial activation on final step |

## Two-Pass Self-Review (enforced per page in web-page)

Every page requires two passes before moving to the next:
- **Pass 1**: 13-item checklist (or 28-item dashboard checklist). Fix all failures.
- **Pass 2**: Fresh eyes — 5 questions: Would I know what to do? Does the empty state have a reason to act? Does loading feel intentional? Is the color doing one job? Would I be embarrassed to show this to a designer? Fix anything that fails.

Both passes are required. Pass 1 alone is not sufficient.

## Context Refresh Rule (every 3rd page in web-page)

After completing every 3rd page, re-read `DESIGN-BRIEF.md` and `SCOPE.md` in full before starting the next. Late pages drift from the locked design contract when this is skipped.

## Skill Trigger Guide

| Use | When |
|---|---|
| `/web-fix` | A specific element is broken, failing a review check, or visually wrong. Pass the exact component name and the failure. |
| `/web-component` | Adding a net-new UI element to an existing page. |
| `/web-page` | Building an entire page from scratch. |
| `/web-review` | Final quality gate before deploy — scores 40 dimensions across design, a11y, and performance. |
| `/web-stripe` | Adding paid plans or trial-to-paid flow. Run after Supabase, before building pages. |
| `/web-onboarding` | Building the `/setup` or `/onboarding` wizard. Mandatory for all SaaS products with auth. |
| `/web-settings` | Building the `/settings` page (profile, billing portal, team, danger zone). |
| `/web-email` | Adding transactional email — welcome, trial-ending, invites, password reset, invoices. |
| `/web-table` | Building any page with a sortable/filterable list of records. |
| `/dashboard-design` | Building any dashboard, analytics, monitoring, or data management page. |

---

## Dashboard Pages (enforced by Phase 4b detection)

Before building any page that is a dashboard, analytics view, monitoring screen, or data management list — read `/dashboard-design` skill. These rules apply automatically:

- **Page type**: determine from skill's Page Types table (Overview / Analytics / List / Detail / Settings / Onboarding)
- **KPI cards**: use `KpiCard` + `Sparkline` from skill spec for any metric display — never ad-hoc stat boxes
- **Data tables**: use `/web-table` skill — TanStack Table v8 with skeleton rows, bulk action bar, FilterBar above
- **DateRangePicker**: required on all Analytics pages (4 presets: 7d/30d/90d/12mo)
- **FilterBar**: required above every data table (search + status filter + clear)
- **Export CSV**: button in page header on every List page
- **Animations**: Framer Motion stagger (0.08s) on KPI card entrance
- **Colors**: all via CSS variables — zero hardcoded grays, whites, or hex values
- **CMD+K CommandPalette**: mount in AppLayout for products with 8+ nav items
- **Self-review**: use the skill's 28-item Pre-Ship Checklist instead of the standard 13-item per-page bar

---

## Per-Page Quality Bar

Every page must pass before moving to the next:

```
[ ] Zero-data state: page makes sense with no data
[ ] Empty state: has CTA button (not just text)
[ ] Loading state: skeleton layout (not blank or spinner)
[ ] Error state: inline error + retry button
[ ] Color budget: count text-primary/bg-primary/border-primary/ring-primary — total <= 2. If > 2: replace with text-muted-foreground or bg-muted.
[ ] useSeo: called on this page — title + description set; noIndex: true on auth/settings/onboarding pages
[ ] document.title: never set at render scope — useSeo handles it via useEffect
[ ] User knows next action: clear without reading docs
[ ] Typography: at least 2 size/weight levels (not all text-sm)
[ ] Mobile: layout works at 375px
[ ] Focus rings: all interactive elements have focus-visible:ring-2
[ ] Aria labels: all icon-only buttons have aria-label
[ ] Modals (if any): close button aria-label="Close", Escape closes

Landing page additional checks:
[ ] BackgroundGradientAnimation present — not a CSS grid fallback
[ ] Logo Cloud present (InfiniteSlider + ProgressiveBlur)
[ ] Stats/CountUp section present with react-countup + enableScrollSpy
[ ] Features section uses Features 4 (border-grid) or BentoGrid
[ ] Testimonials section present (TestimonialSlider, min 3)
[ ] FAQ section present before Final CTA (min 5 questions)
[ ] Footer uses Footer 2 multi-column layout with social icons
[ ] Pre-launch products: Waitlist form present + connects to Supabase
```

"It renders" is not done. A page passes when a designer seeing it for the first time would not want to fix it.

---

## Quality Gate Loop (enforced by Phase 5 / web-review)

`/web-review` runs inside an explicit loop when called from `/saas-build`:
- **Exit condition**: score >= 38 AND pre-deploy checklist fully green
- **Fix loop**: for each failure, run `/web-fix` targeting the exact failure, commit, re-run `/web-review`
- **Hard stop**: after 5 iterations with score still < 38 — log `STUCK`, list all remaining failures, and STOP. Do not proceed to deploy.

## Deploy Rules (enforced by Phase 6 / web-deploy)

- **Vercel project existence**: confirm the Vercel project exists via MCP before deploying. Create it if missing. Never deploy to a non-existent project.
- **Env vars + mandatory redeploy**: set ALL env vars from `.env.example` in Vercel after initial deploy, then trigger a second deploy. Env vars set after the first deploy do not take effect until the next deploy.
- **Automated smoke test**: use `agent-browser` Skill (10 checks). Create test user via Supabase MCP, run the sequence, clean up. All 10 checks must pass. Not a manual checklist — automated.
- **Bundle audit auto-fix**: after deploy, run `npm run build` and check chunk sizes. Any chunk > 250KB gzipped: add `manualChunks` in `vite.config.ts`, redeploy. Auto-fix, not just flag.
- **CORS**: in monorepo mode — append new Vercel URL to comma-separated `FRONTEND_URL` in Railway, never replace existing URLs. In standalone mode — set `FRONTEND_URL` to the production Vercel URL. Backend CORS must never be `*` in production.

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
[ ] NotFoundPage exists and registered as path="*" catch-all route in App.tsx
[ ] useSeo hook called on every page — title, description set; auth/settings/onboarding use noIndex: true
[ ] index.html has OG + Twitter meta tags (og:title, og:description, og:image, twitter:card)
[ ] Settings page exists at /settings — profile, billing portal, team tabs all functional
[ ] web-review score 38+/40
```

---

## Full Build Loop

```
saas-build 0.25   → MARKET-BRIEF.md: competitor website deep-dive (hero patterns, social proof format, pricing model), feature gaps, differentiator
/web-design-research → DESIGN-BRIEF.md: reads MARKET-BRIEF.md competitor data, 21st.dev components, LottieFiles, unique color system, multi-page structure
/web-scope        → SCOPE.md — reads DESIGN-BRIEF.md, imports all design decisions, defines page inventory
/web-scaffold     → foundation: config, design system, routes, AppLayout, TrialBanner, Sentry
/web-supabase     → schema, RLS policies, auth, TypeScript types (if backend)
/web-stripe       → checkout session, webhooks, UpgradeButton (if paid plans)
/web-email        → transactional email setup (if email flows required)
/web-page × N     → one page at a time — landing first, auth second, /setup third
                    (dashboard pages: read /dashboard-design first)
                    (list pages: read /web-table first)
/web-settings     → /settings page (always required for SaaS with auth)
/web-review       → audit before deploy (38+/40 required)
/web-deploy       → Vercel (SPA) or Railway (full-stack)
```

Page build order enforced by saas-build:
1. `/` — Landing (non-negotiables apply: animated bg, product mockup, STAGGER hero)
2. `/auth` — Sign in / sign up
3. `/setup` — Onboarding wizard (mandatory for all SaaS with auth)
4. App pages in SCOPE.md priority order
5. `/settings` — Settings (mandatory for all SaaS with auth)

Orchestrated autonomously by `/saas-build`. Update this file when the suite changes — saas-build reads it at Phase 0 and inherits everything automatically.
