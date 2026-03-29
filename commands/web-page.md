# /web-page

Build one complete, production-quality page with a per-page review loop before moving on.

## When to Use
- Building any page in an existing scaffolded project
- Called per-page by /saas-build — not all pages at once

## Critical Rule
**One page at a time. Build it. Review it. Fix it. Only then move to the next.**
The old pattern (build all pages, review at the end) produced thin, empty-feeling pages. This skill enforces the per-page loop.

---

## Process

### Step 1 — Read Context
Read `~/.claude/web-system-prompt.md`. If missing: continue — use sensible dark SaaS defaults (HSL color variables, Inter/Geist font, 4px grid spacing) and flag NEEDS_HUMAN "Install web-system-prompt.md — Design DNA is missing."
Read `SCOPE.md` for the page definition (purpose, data, empty state, loading state, error state, signature element).
Read `CLAUDE.md` for color job, design decisions. If missing: continue — read SCOPE.md and DESIGN-BRIEF.md for color decisions.
Read `src/styles/index.css` and Glob `src/components/**/*.tsx` for existing component inventory. If `src/styles/index.css` missing: continue.

If SCOPE.md does not have a definition for the requested page: define it now (all 5 fields) and add it to SCOPE.md before building.

### Step 2 — Enforce Page Order

**Is this a landing page request?**
YES → build it. This is always valid.

**Is this an app page request, and does `/` (landing page) exist?**
NO → build the landing page first. No exceptions. The landing page is the product's first impression and must exist before any dashboard or feature page.

### Step 3 — Page Design Brief (per page)

Before writing a single component, answer these for this specific page:

1. **What does a brand-new user with zero data see?** Define the empty state CTA.
2. **What is the signature element?** One thing that makes this page visually interesting. Not decoration — something that makes the data/purpose feel alive. Examples: animated stat counter, progress arc, timeline, data visualisation, contextual illustration.
3. **Where does the primary color appear?** Maximum 2 semantic roles (e.g. "primary CTA button" and "feature icon accent"). A single semantic role used many times (e.g. 6 feature icon instances) counts as 1 role, not 6. Name the 2 roles explicitly.
4. **What is the typography hierarchy?** At minimum: one heading (font-semibold text-base or larger) + body text (text-sm) + captions (text-xs). Never all text-sm.

### Step 3b — Page Type Detection (read sub-skills BEFORE building)

Check the page type against the table below. If it matches, read the listed skill in full before writing a single component. These triggers are mandatory — building first and reading after produces sub-standard output.

| Page type | Trigger | Sub-skill to read | What it enforces |
|---|---|---|---|
| Landing page | Route is `/` or any marketing page with a Hero section | `~/.claude/commands/web-animations.md` | Technique 3 STAGGER mandatory for hero entrance: pill → headline → sub → CTAs → stats → visual |
| Dashboard, analytics, monitoring, data overview | Route is `/dashboard`, `/analytics`, `/overview`, `/monitor`, or any page displaying KPI metrics | `~/.claude/skills/dashboard-design/SKILL.md` | KpiCard + Sparkline components, DateRangePicker on analytics pages, 28-item Pre-Ship Checklist instead of standard 13-item |
| Data list / table page | Page contains a list of records (customers, transactions, logs, reports, users) | `~/.claude/skills/web-table/SKILL.md` | Generic `DataTable<TData, TValue>` with TanStack Table v8, skeleton rows, bulk action bar, FilterBar, export CSV |
| Settings | Route is `/settings` or any sub-route of settings | `~/.claude/skills/web-settings/SKILL.md` | 4-tab layout (Profile, Billing, Team, Danger Zone), Stripe Customer Portal for billing, typed delete confirmation |
| Onboarding / setup wizard | Route is `/setup` or `/onboarding` | `~/.claude/skills/web-onboarding/SKILL.md` | Max 4 steps with AnimatePresence, writes to `organizations` on each step, final step activates trial, wrapped in AuthRoute not ProtectedRoute |

If the sub-skill file does not exist: continue building but flag as NEEDS_HUMAN "Install [skill-name] — read it before building this page type."

### Step 4 — Page-Type Templates

#### Landing Page (`/`)

**Before writing a single component: read DESIGN-BRIEF.md in the project root.**

- **If DESIGN-BRIEF.md exists with a Component Lock table** → use those exact components. Do NOT call `mcp__magic__21st_magic_component_inspiration`. The `/web-design-research` phase already made these decisions for this specific product.
- **If no DESIGN-BRIEF.md** → stop and run `/web-design-research` first. Do not proceed without it.

The section instructions below show default MCP queries. They are fallback reference only — when a Component Lock exists, ignore the defaults entirely and use what's locked.

Structure: [Banner] → Nav → Hero (with animated bg) → Logo Cloud → Stats → Features → Testimonials → Pricing → FAQ → Final CTA → Footer

**Announcement Banner (optional — include when there's a real announcement):**
- `mcp__magic__21st_magic_component_inspiration` searchQuery: `announcement banner bar`. Use `Banner 1` — mounts above navbar. Muted bg, pill label + one-line message + optional arrow link.
- Omit if there is no real announcement to make.

**Hero build sequence — follow in order:**

1. **Animated background first** — `mcp__magic__21st_magic_component_inspiration` searchQuery: `animated background gradient`. Use `BackgroundGradientAnimation` (interactive WebGL blobs). Set `opacity: 0.15-0.2`, `z-index: -1`, lazy-loaded. Wrap in `useReducedMotion` check. This is NON-NEGOTIABLE — no CSS fallback.

2. **Product visual mockup** — built from shadcn primitives shaped like the real app:
   - Browser chrome: three colored dots (`bg-destructive/50`, `bg-yellow-400/50`, `bg-green-500/50`) + URL bar showing `app.[product].com.au`
   - Sidebar: column of muted icon-shaped divs, first one `bg-primary/80` (active nav state)
   - Content: 3 stat cards (`border border-border/40 bg-background/60`), each with a muted label div + bold value div + colored bottom bar
   - Data table: 3-4 rows, each with a colored dot + muted line divs + status pill shape
   - Wrap entire mockup in a glow container: `absolute -inset-4 rounded-3xl bg-gradient-to-b from-brand/15 to-transparent blur-2xl`
   - This is NOT optional. Every hero must have this.

3. **Headline** — display size (`text-display`), `text-balance`, negative letter-spacing. Key phrase wrapped in `.gradient-text` class. Never the full headline — just 2-3 words.

4. **CTAs** — Primary: `Button size="lg"` (bg-primary — this is one of the 2 allowed uses of primary color on this page). Secondary: `Button size="lg" variant="outline"`.

5. **Trust stats row** — 3 real numbers from the product value prop. Format: large bold number + small muted label.

6. **Framer Motion entrance** — stagger using `web-animations` skill Technique 3 STAGGER pattern. Order: pill → headline → subheadline → CTAs → stats → product visual (slight delay so it "loads in" last).

**Logo Cloud (after hero — mandatory):**
- `mcp__magic__21st_magic_component_inspiration` searchQuery: `logo cloud marquee`. Use `Logo Cloud 4` (`InfiniteSlider` + `ProgressiveBlur` fade edges).
- Source logo SVGs from `svgl.app`. Heading: `"Trusted by teams at"` in `text-muted-foreground`.

**Stats / CountUp section (after logo cloud — mandatory):**
- `mcp__magic__21st_magic_component_inspiration` searchQuery: `stats metrics counter`. Use `CaseStudies` component.
- Install `react-countup`. Use `enableScrollSpy: true` so numbers animate on scroll.
- Minimum 3 stats from real product value prop (e.g. "10,000+ businesses", "98% uptime", "2 min setup").
- Dark/muted section background to visually break from the logo cloud above.

**Features section:**
- `mcp__magic__21st_magic_component_inspiration` searchQuery: `features grid section`. Use `Features 4` — border-grid layout, lucide icon + title + 2-sentence body per card.
- 3-6 cards. Icon in `bg-primary/10 rounded-lg p-2 w-fit`, icon color `text-primary` (second allowed use). `whileInView` stagger from `web-animations` Technique 3.
- Alternative: `mcp__magic__21st_magic_component_inspiration` searchQuery: `bento grid layout`. Use `BentoGrid` when one feature needs visual emphasis — hero card spans 2 columns with screenshot/animation.

**Testimonials (after features — mandatory):**
- `mcp__magic__21st_magic_component_inspiration` searchQuery: `testimonials social proof`. Use `TestimonialSlider` — Framer Motion `AnimatePresence`, photo, star rating, dot indicators, prev/next navigation.
- Minimum 3 realistic testimonials.

**Pricing:**
- `mcp__magic__21st_magic_component_inspiration` searchQuery: `pricing cards section`. Use `PricingCard` — glass-effect with `backdrop-blur`.
- 3 tiers. Center: `border-primary/50 bg-primary/5 shadow-lg` + "Popular" badge. Each: name, price, feature list with `CheckCircle2`, CTA button.
- Pre-launch products: skip Pricing, use Waitlist section instead (see below).

**FAQ (before Final CTA — mandatory):**
- `mcp__magic__21st_magic_component_inspiration` searchQuery: `FAQ accordion`. Use `Faqs 1` (rounded card + shadcn Accordion).
- Alternative: `RuixenAccordian02` for two-column layout (General / Billing / Technical categories).
- Minimum 5 questions with real conversational answers.

**Final CTA:**
- `mcp__magic__21st_magic_component_inspiration` searchQuery: `call to action section`. Use `Cta 4` — muted bg container, benefit checklist on right, arrow CTA button.

**Waitlist (replaces Pricing + Final CTA for pre-launch products):**
- `mcp__magic__21st_magic_component_inspiration` searchQuery: `waitlist email capture`. Use `WaitlistHero` (full-screen with rotating rings + confetti) or `WaitlistForm` (AnimatePresence input + confetti on submit).
- Connect to Supabase `waitlist` table. Show position number after sign-up.

**Footer:**
- `mcp__magic__21st_magic_component_inspiration` searchQuery: `footer website`. Use `Footer 2` — multi-column: logo+tagline left, 4 link columns, legal bottom row. No color — `text-muted-foreground` only. Include social icon links.

#### Dashboard
MUST include a "getting started" track for users with zero data:
```tsx
// If user has no data yet, show this instead of empty stat cards
function GettingStarted({ steps }: { steps: Step[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Get started</h2>
      <p className="mt-1 text-xs text-muted-foreground">Complete these steps to set up your account</p>
      <div className="mt-4 space-y-3">
        {steps.map(step => (
          <div key={step.id} className="flex items-center gap-3">
            <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
              step.done ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground'
            )}>
              {step.done ? <Check className="h-3 w-3" /> : step.num}
            </div>
            <span className={cn('text-xs', step.done ? 'line-through text-muted-foreground' : 'text-foreground')}>
              {step.label}
            </span>
            {!step.done && <Link to={step.href} className="ml-auto text-xs text-primary hover:underline">{step.action}</Link>}
          </div>
        ))}
      </div>
    </div>
  )
}
```

Stat cards show skeleton on load. Empty state per-section shows EmptyState component with relevant CTA.

#### Settings Page
NOT a single bare form. Structure:
- Left: section navigation (vertical list of setting categories)
- Right: content area with grouped fields separated by dividers
- Each field group: heading + description + inputs
- Save pattern: autosave on blur OR explicit save button with "Saved" confirmation that resets after 2s
- Use shadcn Form + Input + Select — never raw HTML form elements

```tsx
// Settings section pattern
function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="py-6 first:pt-0 last:pb-0">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
```

#### Data Table Pages (customers, transactions, reports)
Always include:
- Column headers with sort indicators
- Loading: skeleton rows (same height as real rows)
- Empty: EmptyState component with CTA to add first item
- Error: inline error with retry button
- Row hover: `hover:bg-muted/40`
- For tables with expand/actions: Fragment key pattern, never nested interactive elements

#### Reports Page
Never just download buttons. Always show live data preview at the top:
- Compliance score / summary metric displayed as a number or progress bar
- Last generated date
- Then download buttons below the preview
- If no data yet: EmptyState explaining what the report contains and how to generate data

### Step 5 — Build the Page

Write components following these rules:
- All colors via CSS variables — never hardcoded hex/rgb
- EmptyState from `src/components/ui/EmptyState.tsx` — never write inline empty states. If `src/components/ui/EmptyState.tsx` does not exist: create it now (accepts `{ title: string, description: string, action?: { label: string, href: string } }`, renders a centered container with icon, text, and optional CTA button) before building the page.
- Loading states use skeleton divs at the same dimensions as real content
- Status indicators: muted colored dot (`before:content-['•']` with text-[color]) + text label — never full colored badge fills
- framer-motion whileInView + viewport={{ once: true }} on all major sections
- Named exports only, max 150 lines per file

### Step 6 — Add Route to App.tsx
Add the new page to App.tsx with React.lazy + Suspense immediately. Never leave routes unregistered.

### Step 6b — Cross-Page Component Dedup Check

Before finalising the page, scan `src/components/` for existing components that do the same job as anything you just built:
- Did you write an inline empty state? → replace with `EmptyState` from `ui/EmptyState.tsx`
- Did you write a custom skeleton div pattern? → check if a `LoadingSkeleton` component already exists
- Did you write a stat card? → check if a `StatCard` component already exists from a previous page
- Did you write a data table? → check for an existing `DataTable` wrapper

If a duplicate exists: refactor to use the shared component. If the new pattern is better: update the shared component and remove the old implementation everywhere it was used. One version per pattern — no silent copies.

### Step 6c — Context Refresh (every 3rd page)

After completing every 3rd page (pages 3, 6, 9...), before starting the next page — re-read `DESIGN-BRIEF.md` and `SCOPE.md` in full. Long build sessions compress early context and late pages drift from the locked design contract. This is mandatory — skip it and color choices, typography, and component patterns decay by page 6.

### Step 7 — Per-Page Self-Review (TWO PASSES — both mandatory)

**Pass 1 — Checklist.** For dashboard pages use the 28-item Pre-Ship Checklist from the `dashboard-design` skill. For all other pages, run the 13-item checklist below. Fix every failure inline before moving to Pass 2.

```
Per-page review — Pass 1: [page name]
───────────────────────────────────────────────
[ ] Zero-data state: page makes sense with no data
[ ] Empty state: has CTA button (not just text)
[ ] Loading state: skeleton layout (not blank or spinner on empty)
[ ] Error state: inline error + retry button
[ ] Color budget: count every text-primary, bg-primary, border-primary, ring-primary. Total must be <= 2. If > 2: replace with text-muted-foreground, bg-muted, or text-brand.
[ ] useSeo: called on this page — title + description set; noIndex: true on auth/settings/onboarding pages
[ ] document.title: never set at render scope — useSeo handles it via useEffect
[ ] User knows next action: clear without reading docs
[ ] Typography: at least 2 size/weight levels used (not all text-sm)
[ ] Mobile: layout works at 375px
[ ] Focus rings: all buttons, links, inputs have focus-visible:ring-2
[ ] Aria labels: all icon-only buttons have aria-label
[ ] Modals (if any): close button has aria-label="Close", Escape closes
```

**Pass 2 — Fresh eyes.** Re-read the page component from line 1 as if you are a new user opening this product for the first time with zero data. Ask these 5 questions:

1. Would I know what to do on this page right now?
2. Does the empty state give me a reason to act (not just explain why it's empty)?
3. Does the loading state feel intentional or like something broke?
4. Is the signature color doing exactly one job on this page?
5. Would I be embarrassed to show this to a designer?

Fix anything that fails Pass 2. Both passes are required — passing Pass 1 alone is not sufficient to move on.

Log: "Page [name] — self-review passed (13/13 + fresh eyes)" before proceeding.

### Step 8 — Output

```
Built: [page name] ([route])
Files: [list]
Self-review: 13/13 passed
Signature element: [what makes this page visually interesting]
Empty state: [CTA label]

Next page: [name] | All pages complete — run /web-review
```

---

## After All Pages Complete — Test Coverage (Phase 4.5)

Run this once after all pages are built and self-reviewed, before handing off to `/web-review`. Write three test files covering the flows that break silently in production.

**`src/tests/auth.test.ts`** — 4 scenarios:
1. Sign up with valid email/password → expect session created
2. Sign in with wrong password → expect error message rendered
3. Access protected route without session → expect redirect to `/auth`
4. Access `/setup` after `onboarding_complete = true` → expect redirect to `/dashboard`

**`src/tests/onboarding.test.ts`** — 3 scenarios:
1. Complete all wizard steps → expect `onboarding_complete = true` in org record
2. Partial completion → expect redirect back to `/setup` on next login
3. Trial activation → expect `subscription_status = 'trial'` and `trial_ends_at` set

**`src/tests/core.test.ts`** — 2 scenarios:
1. Primary data query returns empty → expect `EmptyState` with CTA rendered (not blank)
2. Primary data query errors → expect error state + retry button rendered (not white screen)

Use Vitest + `@testing-library/react`. Mock Supabase with `vi.mock('@/lib/supabase')`.

Run all tests before proceeding to `/web-review`:
```bash
npx vitest run --reporter=verbose 2>&1
```

If tests fail: fix the code, not the test. A failing test means a build gap — implement the missing behaviour.

---

## Page Quality Standards

A page is DONE when:
- It looks correct with zero data (new user)
- It looks correct with real data (populated state)
- It looks correct when loading
- It looks correct when the API fails
- A designer seeing it for the first time would not feel the need to fix it

"It renders" is not done. "It compiles" is not done. These standards are the bar.
