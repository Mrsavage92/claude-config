# /saas-build

Full autonomous SaaS build pipeline from idea to deployed product. Runs the complete sequence without waiting for prompts between steps.

## When to Use
- Starting any new SaaS product from scratch
- User provides a product idea, name, or brief
- Executes 8 phases end-to-end: market research → design research → scope → scaffold → backend (Supabase + Stripe + email) → pages → quality gate → deploy → gap analysis

## What This Does
Executes the full build loop autonomously. Only stops for genuine blockers that require human action (external credentials, domain registration, Stripe live mode). Does NOT pause to ask "shall I proceed?" between steps.

---

## Autonomous Build Loop

### Phase 0 — Orient

Read these files in full — they are the source of truth for the entire build:
1. `~/.claude/commands/premium-website.md` — all suite rules, landing page non-negotiables, performance requirements, per-page quality bar, and pre-deploy checklist. Everything in that file applies automatically to every phase below.
2. `~/.claude/web-system-prompt.md` — Design DNA. Read before generating any UI.
3. `~/.claude/commands/web-animations.md` — Framer Motion patterns. Technique 3 STAGGER is mandatory for the hero. Read before writing any animated component.
4. `CLAUDE.md` (project root, if exists) — project-specific overrides.
5. `DESIGN-BRIEF.md` (project root, if exists) — locked color system, typography, marketing tier, and component decisions from Phase 0.5. If this file exists, all design decisions are already made — do NOT re-decide them.
6. `SCOPE.md` (project root, if exists) — page inventory and design decisions.

**Monorepo detection:** Check if the working directory contains `turbo.json` or an `apps/` directory. If yes, this is a monorepo build.
- In monorepo mode: the frontend lives in `apps/[product-slug]/`. All Phase 2-6 file operations target that subdirectory.
- The backend is the shared FastAPI service at `services/api/` — do NOT scaffold a new backend or create a new Railway service. Note the existing Railway URL from `CLAUDE.md` for VITE_API_URL.
- If `apps/[product-slug]/` already exists (created by `/product-add`): skip Phase 2 directory creation, only fill in the files.
- If `apps/[product-slug]/` does not exist: run `/product-add` first, then scaffold.

Check if BUILD-LOG.md exists in the project root (or `apps/[product-slug]/BUILD-LOG.md` in monorepo). This is the primary resume signal — not git log.

If BUILD-LOG.md does not exist: this is a fresh start. Begin at Phase 0.25.
If BUILD-LOG.md exists: read it to identify the last completed phase, then continue from the next one. If resuming from Phase 1 or later, verify DESIGN-BRIEF.md exists — if missing, run Phase 0.5 before continuing. Also verify MARKET-BRIEF.md exists — if missing, run Phase 0.25 before continuing.

Log every phase start and completion to `BUILD-LOG.md` in the project root (or `apps/[product-slug]/BUILD-LOG.md` in monorepo mode).

---

### Phase 0.25 — Feature & Market Research

Before any design work, answer: "What do competitors miss that our users need?"

Run 3 WebSearch queries:
1. `"[product category] SaaS features" site:reddit.com OR site:producthunt.com` — real user needs
2. `"[product category] SaaS alternatives"` — who exists, what they do, what they miss
3. `"[product category] missing feature" OR "wish it had"` — unmet needs that become your differentiator

Write `MARKET-BRIEF.md` to project root:
```markdown
# Market Brief — [product name]

## Top 3 competitors
| Name | Price | Strengths | Gaps |

## Features users consistently request that competitors miss
1.
2.
3.

## Our differentiator (one sentence)

## Must-have for v1 (without these we are not in the market)
-

## Nice-to-have post-launch
-
```

SCOPE.md (Phase 1) must include the "Must-have for v1" features in the page inventory. If a must-have feature has no page defined, add the page.

If resuming: check if MARKET-BRIEF.md exists. If yes, skip this phase.

Log: "Phase 0.25 complete — MARKET-BRIEF.md written" to BUILD-LOG.md.

---

### Phase 0.5 — Design Research (run /web-design-research) — MANDATORY

**This phase runs before /web-scope on EVERY new product. It is not optional.**

Read `~/.claude/skills/web-design-research/SKILL.md` in full and execute it completely:
1. Identify product personality type (one of 8: Enterprise Authority, Data Intelligence, Trusted Productivity, Premium Professional, Bold Operator, Health & Care, Growth Engine, Civic/Government)
2. **Skip competitor research if MARKET-BRIEF.md exists.** Check if MARKET-BRIEF.md exists in the project root before doing anything else. If it exists: read the competitors section directly — do NOT run new WebSearch queries. If it does not exist: run Phase 0.25 now before continuing Phase 0.5.
3. Select a unique color system from the personality palette library — EXPLICITLY reject hsl(213 94% 58%) with a documented reason unless this is developer tooling. **Cross-product uniqueness check (monorepo):** before writing DESIGN-BRIEF.md, grep all existing `apps/*/DESIGN-BRIEF.md` files for the chosen primary HSL value. If the same hue (within ±15 degrees) is already in use by another product, select a different palette and document why.
4. Run 6 targeted `mcp__magic__21st_magic_component_inspiration` queries using product-specific terms (NOT generic "dark SaaS"). If MCP is unavailable or returns no results: use the CSS grid pattern from web-system-prompt.md as the animated background fallback and continue — do not stop.
5. Call `mcp__magic__21st_magic_component_builder` for the animated background. If MCP unavailable: write the CSS grid pattern inline in HeroSection.
6. Search LottieFiles for 3 animations relevant to this product
7. Choose marketing site tier (Tier 2 standard: /, /features, /pricing, /signin as separate routes)
8. Write DESIGN-BRIEF.md to the project root (or `apps/[product-slug]/` in monorepo)

Do not proceed to Phase 1 until DESIGN-BRIEF.md exists with all sections filled.

Log: "Phase 0.5 complete — DESIGN-BRIEF.md written" to BUILD-LOG.md.

---

### Phase 1 — Scope (run /web-scope)

Execute the full /web-scope process:
1. **Read DESIGN-BRIEF.md first** — all color, typography, and marketing structure decisions are already locked. Do NOT re-decide them. Import them directly from the brief.
2. **Read MARKET-BRIEF.md (if exists)** — extract the "Must-have for v1" list. Every item on that list must map to a page in the inventory. If a must-have has no page, create one before continuing.
3. Extract brief from user input
4. Produce complete page inventory with all 5 fields per page (use the marketing tier structure from DESIGN-BRIEF.md for public pages)
5. Write SCOPE.md to project root
6. Write initial BUILD-LOG.md

Do not proceed to Phase 2 until SCOPE.md exists and every page has all 5 fields defined.

**Mandatory pages — add to SCOPE.md regardless of brief:**
Every SaaS product MUST include these pages in the inventory. If the brief doesn't mention them, add them:
- `/privacy` — Privacy Policy (static, auto-generated)
- `/terms` — Terms of Service (static, auto-generated)
These are never optional. Add them to the build order in Phase 4 after `/settings`.

**Stop condition:** if the product description is too vague to identify the core feature category, make a documented assumption and log it — do NOT ask. Format: "Brief was vague — assumed [X] based on [Y]. Correct SCOPE.md if wrong." Only ask if the product domain is completely unidentifiable after analysis.

---

### Phase 2 — Scaffold (run /web-scaffold)

Execute the full /web-scaffold process using decisions from SCOPE.md:
1. Generate all foundation files (package.json, tsconfig, vite.config, tailwind.config, index.css, main.tsx, App.tsx, CLAUDE.md)
2. Apply bundle splitting from premium-website performance rules (vendor-react, vendor-motion, vendor-query, vendor-supabase chunks)
3. tsconfig.json MUST include `"types": ["vite/client"]`
4. CLAUDE.md MUST include: color job definition, design reference site, page inventory summary
5. AppLayout MUST include skip-nav link as first element
6. Generate vercel.json with SPA rewrites at project root
7. Run install commands. If any command exits non-zero: read the full error output, fix the root cause (wrong Node version, missing lockfile, network issue), retry once. If retry fails, log STUCK with exact error and stop.
```bash
npm install
npx shadcn@latest init
npx shadcn@latest add button input label card dialog dropdown-menu sheet sonner separator badge skeleton avatar tabs table select textarea
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```
After install, create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: { environment: 'jsdom', setupFiles: ['./src/tests/setup.ts'] },
})
```
Create `src/tests/setup.ts`:
```ts
import '@testing-library/jest-dom'
```
8. Create `src/components/ErrorBoundary.tsx` — class component wrapping children, renders inline error + retry button on caught errors. Wrap every `React.lazy` route with it in App.tsx.
9. Create `src/pages/NotFoundPage.tsx` — 404 page with headline, sub, and back-to-home button. Register as `path="*"` catch-all in App.tsx.
10. Create `src/hooks/useSeo.ts` — sets `document.title` and `<meta name="description">` via useEffect. Accepts `{ title, description, noIndex? }`. Call on every page.
11. Add OG + Twitter meta tags to `index.html`: `og:title`, `og:description`, `og:image` (1200x630 placeholder), `twitter:card`.
12. Generate `public/robots.txt`:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://[product-domain]/sitemap.xml
   ```
   Leave domain as placeholder — user replaces after domain is live.
13. Generate `public/sitemap.xml` with all public routes from SCOPE.md (landing, features, pricing, terms, privacy). Set `<lastmod>` to today's date. Leave domain as placeholder.
14. Generate `public/site.webmanifest`:
   ```json
   { "name": "[Product Name]", "short_name": "[Slug]", "start_url": "/", "display": "standalone", "background_color": "#0a0a0a", "theme_color": "#0a0a0a", "icons": [{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }] }
   ```
   Add `<link rel="manifest" href="/site.webmanifest">` and `<link rel="apple-touch-icon" href="/icon-192.png">` to `index.html`. Log NEEDS_HUMAN: "Add icon-192.png and icon-512.png to /public — use a square version of the product logo."
15. Initialise Sentry in `main.tsx` conditionally — only if `VITE_SENTRY_DSN` is set, so local dev and deploys without a Sentry project don't silently fail:
   ```ts
   if (import.meta.env.VITE_SENTRY_DSN) {
     Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN })
   }
   ```
   Wrap `<App />` with `<Sentry.ErrorBoundary fallback={<p>Something went wrong</p>}>`. Add `VITE_SENTRY_DSN=` (blank, optional) to `.env.example` with comment: `# Get from sentry.io — create project → Client Keys → DSN`.

Log: "Phase 2 complete — scaffold generated" to BUILD-LOG.md.

---

### Phase 3 — Backend (run /web-supabase) — skip if no backend

If the product needs Supabase:
1. Get project URL and anon key via Supabase MCP
2. Apply schema migrations
3. Write RLS policies for all tables
4. Generate TypeScript types
5. Write `src/lib/supabase.ts` with hardcoded values — the anon key is safe to commit (it is public by design; RLS policies enforce access control)
6. Write `useAuth` hook and `ProtectedRoute` component
7. Write `AuthRoute` component (session-only check, no onboarding_complete guard) — wraps `/setup` and `/reset-password`
8. Register `/reset-password` route in App.tsx as a lazy-loaded stub pointing to a placeholder component — full `ResetPasswordPage.tsx` is built in Phase 4 (so it gets the per-page self-review pass). Mark it in SCOPE.md as a required auth page if not already present.

If FastAPI backend: note the Railway service URL needed in BUILD-LOG.md as a blocker item for the user. The FastAPI service itself is pre-existing in `services/api/` — do not scaffold a new one.

Log: "Phase 3 complete — backend configured" to BUILD-LOG.md.

---

### Phase 3b — Stripe (run /web-stripe) — skip if no paid plans

**How to determine if this phase runs:** Read `SCOPE.md` and look for a Monetization or Trial section. If resuming a build, also check `BUILD-LOG.md` — if it contains "Phase 3b complete", skip this phase. Run this phase if ANY of these are true:
- Trial model is `free-trial` or `paid-only`
- Any pricing tier exists beyond a permanent free plan
- SCOPE.md mentions Stripe, subscription, upgrade, or billing

Skip this phase only if the product is explicitly free with no upgrade path.

If the product has any paid plan or trial-to-paid flow:
1. Read `~/.claude/skills/web-stripe/SKILL.md` in full
2. Create Stripe checkout session endpoint in FastAPI (or Supabase edge function for standalone)
3. Create webhook handler — verify signature first with `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`, then handle `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Reject any request that fails signature verification with 400.
4. Write `UpgradeButton` component and `PricingCards` component
5. Wire trial banner "Upgrade now" CTA to checkout session
6. Add `VITE_STRIPE_PUBLISHABLE_KEY` + `VITE_STRIPE_PRO_PRICE_ID` to `.env.example`
7. Add webhook endpoint to `.env.example` as `STRIPE_WEBHOOK_SECRET`

Log NEEDS_HUMAN: "Set STRIPE_WEBHOOK_SECRET — register [product-url]/api/webhooks/stripe in Stripe dashboard for: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted"

Log: "Phase 3b complete — Stripe integrated" to BUILD-LOG.md.

---

### Phase 3c — Email (run /web-email) — skip if no transactional email

**How to determine if this phase runs:** Run if ANY of these are true:
- Trial model is `free-trial` (requires trial-ending reminders)
- Product has team invites (requires invite email)
- Product has auth with password reset (requires reset email)
- SCOPE.md mentions welcome email, notifications, or email flows

Skip only if the product is a pure landing page with no auth.

1. Read `~/.claude/skills/web-email/SKILL.md` in full
2. Set up Resend integration in `services/api/email_service.py` (or equivalent)
3. Write React Email templates: welcome, trial-ending (if free-trial), team-invite (if team features), password-reset, invoice (if paid)
4. Wire welcome email to auth signup trigger
5. Add `RESEND_API_KEY` to `.env.example`

Log NEEDS_HUMAN: "Add RESEND_API_KEY — verify sending domain at resend.com/domains before emails will deliver"

Log: "Phase 3c complete — email configured" to BUILD-LOG.md.

---

### Phase 4 — Pages (run /web-page per page, in SCOPE.md build order)

This is the core loop. For EACH page in SCOPE.md build order:

**4a. Pre-build check**
- Re-read SCOPE.md (full file) — the source of truth for page definitions and build order
- Re-read CLAUDE.md — confirm the COLOR JOB sentence and design decisions are fresh in context
- Confirm the page's design brief (purpose, data, empty state, loading state, error state, signature element) is clear before writing code

**4b. Build the page**
Follow /web-page rules. Apply all landing page non-negotiables from premium-website.md for the `/` page.
- Landing page (`/`) is ALWAYS first — no exceptions
- Auth (`/signin`) is ALWAYS second
- Reset password (`/reset-password`) is ALWAYS third — replace the Phase 3 stub with the full ResetPasswordPage.tsx now. If not in SCOPE.md, add it.
- Onboarding (`/setup` or `/onboarding`) is ALWAYS fourth for any SaaS product with auth — no exceptions. If SCOPE.md does not include it, add it now before continuing.
- App pages follow in SCOPE.md priority order after onboarding
- Settings (`/settings`) is ALWAYS built after all app pages and before /privacy + /terms — mandatory for all SaaS with auth. If SCOPE.md does not include it, add it now.
- `/privacy` and `/terms` are ALWAYS last (static pages, minimal build time)

**Dashboard page detection — read `/dashboard-design` skill before building:**
Before writing any page that is a dashboard, analytics view, monitoring screen, or data management list, read `~/.claude/skills/dashboard-design/SKILL.md` in full. Apply these rules automatically:
- Determine page type (Overview / Analytics / List / Detail / Settings) from the skill's Page Types table
- Use KpiCard + Sparkline components (from skill spec) for any metric display
- Use TanStack Query for all data fetching — never useEffect
- DateRangePicker required on Analytics pages
- FilterBar required above every data table
- Export CSV button in page header for every List page
- Framer Motion stagger (0.08s) on KPI card entrance
- All colors via CSS variables — zero hardcoded grays or whites
- CMD+K CommandPalette mounted in AppLayout if product has 8+ nav items
- Skeleton loaders (not spinners) for all async data — use shadcn Skeleton matching exact card/row dimensions
- Dark mode via ThemeProvider + CSS variables — never hardcode colors, use hsl(var(--chart-1)) etc. for Recharts
- Mobile: Sheet drawer sidebar on <768px, data tables collapse to card stack, touch targets min 44px, hide secondary columns
- Run the skill's Pre-Ship Checklist (28 items) as the per-page self-review for dashboard pages instead of the standard 13-item checklist

**Data table detection — read `/web-table` skill before building:**
Before writing any page with a list of records (resources, users, transactions, logs, etc.), read `~/.claude/skills/web-table/SKILL.md`. Apply automatically:
- Generic `DataTable<TData, TValue>` component with TanStack Table v8
- Column definitions: selection checkbox, primary identifier, status (dot+text), date, row actions (DropdownMenu)
- Skeleton rows while loading — never blank table or spinner
- Bulk action bar: fixed bottom-center, visible on selection only
- FilterBar above table, export CSV in page header

**Settings page — read `/web-settings` skill before building:**
Before writing any `/settings` route, read `~/.claude/skills/web-settings/SKILL.md`. Apply automatically:
- Tab layout: Profile, Billing, Team, Danger Zone
- Profile tab: full_name, company_name (read-only email), password change
- Billing tab: plan status, Stripe Customer Portal redirect (never custom billing UI)
- Team tab: member list, invite by email + role, remove member dialog
- Danger Zone: typed confirmation phrase before delete

**Onboarding wizard — read `/web-onboarding` skill before building:**
Before writing any `/setup` or `/onboarding` route, read `~/.claude/skills/web-onboarding/SKILL.md`. Apply automatically:
- Max 4 steps with AnimatePresence slide transition (220ms)
- Write to `organizations` table on each step completion — never batch at end
- Final step activates trial: sets `onboarding_complete = true`, `trial_ends_at`, `subscription_status = 'trial'`
- `ProtectedRoute` must check `onboarding_complete` — redirect to `/setup` if false
- `AuthRoute` (session-only check) wraps `/setup` — not `ProtectedRoute`

**4c. Per-page self-review (two passes — not one)**

Pass 1 — checklist: run the 13-item checklist from premium-website.md. Fix any failures inline before moving on.

Pass 2 — fresh eyes: re-read the page component from line 1 as if you are a new user opening this product for the first time with zero data. Ask:
- Would I know what to do on this page right now?
- Does the empty state give me a reason to act (not just explain why it's empty)?
- Does the loading state feel intentional or like something broke?
- Is the signature color doing exactly one job on this page?
- Would I be embarrassed to show this to a designer?

Fix anything that fails Pass 2. Log: "Page [name] complete — self-review passed (13/13 + fresh eyes)" to BUILD-LOG.md. Only then move to the next page.

**4d. Context refresh (every 3 pages)**
After completing every 3rd page (i.e. pages 3, 6, 9...), re-read DESIGN-BRIEF.md and SCOPE.md in full before starting the next page. Long build sessions compress early context — this prevents late pages drifting from the locked design contract.

**4e. App.tsx**
After each page, add the route with React.lazy + Suspense. Never leave routes unregistered.

---

### Phase 4.5 — Core Test Coverage

Run after all pages are built, before the quality gate. If resuming: check BUILD-LOG.md — if it contains "Phase 4.5 complete" and `npx vitest run` exits 0, skip this phase.

Write tests for the three flows that break silently in production:

**1. Auth flow** (`src/tests/auth.test.ts`):
- Sign up with valid email/password → expect session created
- Sign in with wrong password → expect error message rendered
- Access protected route without session → expect redirect to /auth
- Access /setup after onboarding_complete = true → expect redirect to /dashboard

**2. Onboarding flow** (`src/tests/onboarding.test.ts`):
- Complete all wizard steps → expect onboarding_complete = true in org record
- Partial completion → expect redirect back to /setup on next login
- Trial activation → expect subscription_status = 'trial' and trial_ends_at set

**3. Core feature smoke** (`src/tests/core.test.ts`):
- Primary data query returns empty → expect EmptyState with CTA rendered (not blank)
- Primary data query errors → expect error state + retry button rendered (not white screen)

Use Vitest + @testing-library/react. Mock Supabase client (vi.mock('@/lib/supabase')).

Run tests:
```bash
npx vitest run --reporter=verbose 2>&1
```

If tests fail: fix the code, not the test. If a test cannot pass because the feature doesn't exist yet, that is a build gap — implement the feature.

Log: "Phase 4.5 complete — [N] tests passing" to BUILD-LOG.md.

---

### Phase 5 — Quality Gate (review-fix loop)

This is an explicit loop. Run it until the product passes or you hit 5 attempts.

**Scoring note:** Phase 5 uses `/web-review` (x/40) — a web-specific visual + a11y + performance gate. This is different from `/review` (x/100) which is a code-depth audit covering security, correctness, and maintainability. Use /web-review here. Optionally run /review separately as an additional code audit — its score does not replace or gate deploy.

**Loop:**
1. Run the full /web-review audit:
   - If `~/.claude/skills/web-review/SKILL.md` exists: follow it exactly — it outputs `Overall: [X]/40`
   - If not: manually audit every page against the 13-item per-page checklist in premium-website.md (1 point per item × all pages, normalised to /40), then check every item in the pre-deploy checklist (each failure = -1). Sum the result. Document which items failed.
2. Record the score (X/40) and list every failure
3. If score >= 38 AND pre-deploy checklist fully green: exit loop, proceed to Phase 6
4. If score < 38 OR any pre-deploy checklist item is red:
   - For each failure: run /web-fix targeting the exact component and failure reason
   - After all fixes: commit with `fix: quality gate — [N] issues resolved`
   - Return to step 1
5. If after 5 loop iterations the score is still < 38: log STUCK with exact failures and current score, then STOP — do NOT proceed to Phase 6. A score below 38 means the product is not ready to deploy. List every remaining failure and halt. Do not skip this rule.

**Never skip this loop.** A low score is not a reason to delay — it is a list of tasks to execute.

Log each loop iteration to BUILD-LOG.md: "Phase 5 attempt [N] — score [X]/40 — [N failures] remaining"

---

### Phase 6 — Deploy (run /web-deploy)

**6a. Pre-deploy gates**
Run through the pre-deploy checklist in premium-website.md. All items must pass.

**6b. Vercel deploy**
```bash
npx vercel --prod --yes
```
Capture the production URL from output.

**6c. Set all env vars in Vercel**
For each var in `.env.example`:
```bash
npx vercel env add [VAR_NAME] production --value [value] --yes
```
VITE_API_URL is required if there is a backend — set it now, not later.

**6d. Smoke test (present to user — do not skip)**

Read SCOPE.md to get: the product name, the primary CTA label on the landing page, and the name of the core feature page. Use these in the checklist below — do not hardcode generic text.

```
Smoke Test — [product name] ([product URL])
──────────────────────────────────────────────────────
ACTION REQUIRED: Open [URL] in a browser and verify each item.
Report back which pass and which fail — Claude will fix failures before marking deploy done.

[ ] 1. Landing page loads — hero visible, animated background present, [CTA label from SCOPE.md] button visible
[ ] 2. Primary CTA navigates to /signin (or /signup)
[ ] 3. Sign up — complete a full signup. Confirm user appears in Supabase auth.users dashboard.
[ ] 4. Onboarding — complete the [onboarding route from SCOPE.md] wizard fully. Confirm it redirects to [main app route from SCOPE.md] on completion. MANDATORY — if the onboarding route does not exist, it is a build failure.
[ ] 5. Trial banner — after onboarding, confirm the AppLayout shows a trial banner (days remaining + Upgrade button) if trial model is free-trial.
[ ] 6. [Core feature page from SCOPE.md] — loads and shows correct empty state with CTA.
[ ] 7. Settings page — loads and form submits without error.
[ ] 8. /privacy and /terms — both pages load without errors.

For each failure: paste the error or screenshot and Claude will fix before marking done.
```

**6e. Update CORS**
In monorepo mode: append the new Vercel URL to the existing comma-separated `FRONTEND_URL` env var in Railway — do not replace existing product URLs. In standalone mode: set `FRONTEND_URL` to the production Vercel URL. Either way, backend CORS must never be `*` in production.

**6f. Bundle audit and auto-fix**

Run build and capture output:
```bash
npm run build 2>&1 | grep -E "\.js|\.css|gzip"
```

Report sizes:
```
Bundle sizes (gzipped):
  vendor-react:    XX KB
  vendor-motion:   XX KB
  vendor-query:    XX KB
  vendor-supabase: XX KB
  [page chunks]:   XX KB each
  Total:           XX KB
```

**Auto-fix any chunk > 250KB — do not just flag it:**
1. Identify the chunk in vite.config.ts `manualChunks`
2. Split it further: e.g. if `vendor-supabase` is large, separate `@supabase/auth-ui-react` into its own chunk `vendor-supabase-ui`
3. If a page chunk is large, move its heaviest dependency import to a dedicated chunk
4. Re-run build and verify all chunks are < 250KB gzipped
5. If a chunk cannot be reduced below 250KB after splitting: log as NEEDS_HUMAN with exact module name and size

---

### Phase 7 — Gap Analysis Loop (post-build self-improvement)

**This phase runs after every deploy. It does not require human instruction to begin.**

If resuming: read GAP-REPORT.md. If it exists and shows 0 P1 and 0 P2 gaps, skip to Phase 8.

The purpose is to answer: "What does a production-ready SaaS have that we haven't built yet?"

**Loop:**
1. Read `~/.claude/skills/shared/saas-gap-checklist.md` in full. If the file does not exist: use the P1/P2/P3/P4 gap definitions in the "What counts as a gap" sections below as the checklist — do not skip this phase.
2. Audit the current codebase against every checklist item
3. Write `GAP-REPORT.md` to the project root with:
   - Every NO item (what's missing)
   - Priority bucket for each: P1 (Foundation/Auth/Security) | P2 (UX/Quality) | P3 (Marketing/SEO) | P4 (Nice-to-have)
   - Estimated fix complexity: Quick (< 30 min) | Medium (30-90 min) | Large (90+ min)
4. If no P1 or P2 gaps remain: exit loop and proceed to Phase 8
5. Execute ALL P1 gaps first (never skip a P1 gap)
6. Execute ALL P2 gaps
7. Execute P3 gaps that are quick or medium complexity
8. After each batch of fixes: commit, re-read checklist, update GAP-REPORT.md
9. Return to step 4

**What counts as a P1 gap:**
- Missing /privacy page
- Missing /terms page
- Missing password reset flow
- No onboarding wizard
- Trial banner missing
- ProtectedRoute not checking onboarding_complete
- Any broken mobile layout
- Any missing empty state CTA
- TypeScript errors in build
- console.log in src/
- Hardcoded hex colors

**What counts as a P2 gap:**
- Missing useSeo on any page
- Any loading state is a blank screen or spinner (not skeleton)
- Any error state is a white screen
- Settings page missing tabs
- Any icon-only button missing aria-label
- Social proof section missing from landing page
- Pricing section missing from landing page

**What counts as a P3 gap (Marketing/SEO):**
- robots.txt missing from /public
- sitemap.xml missing from /public (or not registered in robots.txt)
- og:image is still the 1200x630 placeholder — needs a real image
- Landing page missing FAQ section (LLM citability — AIs cite pages with Q&A)
- Landing page missing comparison table vs competitors
- No analytics snippet (Google Analytics or PostHog) in index.html
- No structured data (JSON-LD schema) on landing page
- sitemap.xml domain is still placeholder — needs updating once domain is live

**What counts as a P4 gap (Nice-to-have):**
- Dark mode toggle not accessible in AppLayout header
- CMD+K palette not implemented (product has 8+ nav items)
- PWA icons (icon-192.png, icon-512.png) not yet added to /public
- Error page links back to home AND to status page
- Empty states use illustrations rather than icon + text
- Toast notification on every destructive user action (delete, remove)
- Keyboard shortcut hints visible in UI (e.g. button tooltips showing Ctrl+S)

**Execution rules:**
- Do not ask whether to fix gaps — just fix them
- Do not batch changes — one gap = one commit
- If a gap requires credentials (email API key, etc): log NEEDS_HUMAN and skip, continue with others
- Never stop because there are many gaps — that is the point of this phase

Log: "Phase 7 gap analysis — [N] gaps found, [N] fixed, [N] skipped (credentials needed)" to BUILD-LOG.md.

---

### Phase 8 — Handoff

Write final BUILD-LOG.md entry:

```markdown
## Build Complete — [timestamp]

**Product:** [name]
**URL:** [production URL]
**Score:** [web-review score]/40

### What was built
[list of all pages]

### Remaining human actions required
- [ ] Register domain and point DNS to Vercel
- [ ] Switch Stripe to live mode and replace test price IDs
- [ ] [any other items that needed credentials]

### Architecture notes
[anything non-obvious about the build that future sessions should know]
```

---

## Stop Conditions (the only times autonomous execution pauses)

| Condition | Action |
|---|---|
| Domain registration needed | Log as NEEDS_HUMAN, continue with .vercel.app URL |
| Stripe live price IDs needed | Log as NEEDS_HUMAN with test prices in place |
| Railway auth token needed | Log as NEEDS_HUMAN, document which env vars to set |
| External API key not in env | Log as NEEDS_HUMAN with exact variable name needed |
| Same error 3 times on a single fix attempt | Log as STUCK, explain what was tried, skip and continue with other work |
| Ambiguous product requirements | Log assumption and continue — format: "Brief was vague — assumed [X] based on [Y]. Correct SCOPE.md if wrong." |

Never stop for:
- "Shall I proceed to the next page?"
- "Ready to move to /web-review?"
- "Should I deploy now?"
- "Is this design direction correct?" (make the decision, log the reasoning)

---

## Rules
- Phase 0 reads premium-website.md — all suite rules are inherited automatically. Do not duplicate them here.
- Read SCOPE.md before every phase — it is the source of truth for page definitions.
- Landing page is always Phase 4 page 1. No exceptions. Ever.
- Per-page self-review is mandatory. It is not optional.
- Never deploy with a web-review score below 38/40
- BUILD-LOG.md is updated after every completed phase
- The user should be able to walk away after typing the product brief and return to a deployed product
