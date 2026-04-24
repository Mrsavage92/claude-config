### Phase 4 — Pages

**Action: invoke `Skill('web-page')` for EACH page in SCOPE.md build order.** Do NOT read `~/.claude/skills/web-page/SKILL.md` and execute its steps inline per page. The Skill tool exists; use it once per page.

This is the core loop. For EACH page in SCOPE.md build order:

**4a. Pre-build check**
- Re-read SCOPE.md (full file) — the source of truth for page definitions and build order
- Re-read CLAUDE.md — confirm the COLOR JOB sentence and design decisions are fresh in context
- Confirm the page's design brief (purpose, data, empty state, loading state, error state, signature element) is clear before writing code

**4b. Build the page**
Invoke `Skill('web-page')` with the page's name and SCOPE.md entry. The skill enforces the per-page contract — do not paraphrase its rules in main context.

**Landing page — category compliance check + quality review, not rebuild:**
The landing page was built by /web-scaffold (Phase 2). Do NOT rebuild it here.
Instead: run the landing page category compliance check, then the standard quality review.

**Step 1 — Category compliance check (from Phase 1.5):**
Read BUILD-LOG.md and find the "Phase 1.5 complete" entry. Extract:
- Required sections checklist (from PRODUCT-CATEGORY-LIBRARY.md)
- Trust signals required
- Forbidden patterns
- Hero override description

Then read `src/pages/LandingPage.tsx` (or `src/components/landing/`) in full and verify:

```
Landing page category compliance — [category name]
Required sections:
- [ ] [Section 1 from category required list]
- [ ] [Section 2]
... (all required sections)

Trust signals:
- [ ] [Trust signal 1 from category]
- [ ] [Trust signal 2]
...

Forbidden patterns check (ANY of these present = FAIL):
- [ ] [Forbidden pattern 1] — ABSENT (pass) / PRESENT (fail)
...

Hero override:
- [ ] Hero matches category pattern: [description from Phase 1.5]
    Current hero type: [describe what's actually there]
    Match: YES / NO
```

**If any required section is missing:** add it now. Do not mark the landing page complete until all required sections are present.
**If any trust signal is missing:** add it now.
**If any forbidden pattern is present:** fix it now.
**If hero does not match category pattern:** redesign the hero before marking complete. A dark animated hero for a WHS compliance tool is an automatic failure.

**CATEGORY HARD GATES — these are binary BLOCK conditions. Do not proceed until each passes:**

| Category | Hard gate condition | Correct fix |
|---|---|---|
| Reputation/Reviews | Platform logos (Google + ProductReview.com.au + SEEK) not visible above or immediately below fold | Add platform logo strip before any other below-fold content |
| Reputation/Reviews | No animated score ring or review count in hero | Add animated counter or score ring to hero visual |
| Entity/Company Intelligence | No search bar visible above the fold | Add search bar as hero primary element — nothing else above it |
| Entity/Company Intelligence | No sample report or data preview shown | Add sample company profile section with real data shape |
| AML/CTF | No compliance urgency (compliance deadline 1 July 2026) | Enrolment is now open (March 31 deadline passed). Banner must say "Enrolment is now open — comply by 1 July 2026." Do NOT reference March 31 — that date has passed. |
| AML/CTF | Hero uses generic SaaS copy ("reduce financial crime risk" / "the modern way to manage AML") | Rewrite hero: "Get compliant by July 1, 2026." Tranche 2 SMBs are forced buyers with zero AML experience — they need direction, not aspiration. |
| AML/CTF | No sector-specific cards (real estate / accountants / lawyers / conveyancers) | Add profession cards section showing each profession's obligations |
| WHS/Psychosocial | Hero uses dark background / dark mode design | BLOCK and rebuild — dark UI for WHS tool is the wrong category signal. Must be light mode. |
| WHS/Psychosocial | Copy uses "upcoming" or "coming soon" for enforcement (deadline was Dec 2025) | Update all copy to "now in effect" / "now mandatory" |
| WHS/Psychosocial | Hero does not name "psychosocial" explicitly — uses generic "WHS software" or "workplace safety" | Rewrite hero to lead with "Psychosocial Hazard Register" or "Psychosocial Safety" — FlourishDx proves specialist naming outperforms generic WHS positioning |
| WHS/Psychosocial | Hero copy targets field workers ("inspections", "checklists") instead of HR/OHS professionals ("risk register", "control plan", "governance") | Rewrite for correct audience — HR managers + OHS specialists, not frontline workers |
| Procurement Intelligence | Tender feed/ticker is static (no animation, no scrolling) | Add animated scrolling tender feed or ticker to hero section |
| Procurement Intelligence | No data source citation ("Official AusTender API") visible above fold | Add trust bar immediately below hero with data source attribution |
| Procurement Intelligence | Hero uses generic SaaS copy without naming the portal fragmentation problem | Add explicit messaging: "No more monitoring 8 separate portals" — this is the #1 pain point and no competitor owns it |
| Procurement Intelligence | Hero is copy-heavy / image-heavy instead of data-heavy | Procurement intelligence heroes must be 60% data visualization (live tender cards, counts, agency names) + 30% copy + 10% CTA — reverse of generic SaaS |

Each hard gate is a STOP condition. The landing page CANNOT be marked complete until every hard gate for its category passes with YES.

**Step 2 — Standard quality review:**
Run the standard 13-item per-page checklist + fresh eyes pass.
Fix any failures before moving on.

Log: "Landing page quality review — category compliance [N/N sections] + self-review passed (13/13 + fresh eyes)" to BUILD-LOG.md.

- Auth (`/auth`) is ALWAYS first to BUILD in this loop — no exceptions
- Reset password (`/reset-password`) is ALWAYS third — replace the Phase 3 stub with the full ResetPasswordPage.tsx now. If not in SCOPE.md, add it. Route wrapper: `AuthRoute` (session-only, NOT `ProtectedRoute`) — the user is unauthenticated when clicking a reset link.
- Onboarding (`/setup` or `/onboarding`) is ALWAYS fourth for any SaaS product with auth — no exceptions. If SCOPE.md does not include it, add it now before continuing.
- **Auth-free products** (no login, no user accounts): skip auth/reset-password/onboarding positions. Build order is: `/` → app pages in SCOPE.md priority order → `/settings` (if applicable) → `/privacy` → `/terms`.
- App pages follow in SCOPE.md priority order after onboarding
- Settings (`/settings`) is ALWAYS built after all app pages and before /privacy + /terms — mandatory for all SaaS with auth. If SCOPE.md does not include it, add it now.
- `/privacy` and `/terms` are ALWAYS last (static pages, minimal build time). Both MUST be registered as `React.lazy()` imports with `Suspense` fallback — NOT eager imports. Even though they are static, they are non-critical and should not inflate the initial bundle.

**Dashboard page detection — invoke `Skill('dashboard-design')` before building:**
Before writing any page that is a dashboard, analytics view, monitoring screen, or data management list, **invoke `Skill('dashboard-design')` via the Skill tool**. Do NOT read `~/.claude/skills/dashboard-design/SKILL.md` and apply rules inline — the skill enforces the 28-item Pre-Ship Checklist; main-context paraphrase does not. The rules below are a summary of what the skill enforces:
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

**Data table detection — invoke `Skill('web-table')` before building:**
Before writing any page with a list of records (resources, users, transactions, logs, etc.), **invoke `Skill('web-table')` via the Skill tool**. Do NOT inline-execute by reading its SKILL.md. Summary of what the skill enforces:
- Generic `DataTable<TData, TValue>` component with TanStack Table v8
- Column definitions: selection checkbox, primary identifier, status (dot+text), date, row actions (DropdownMenu)
- Skeleton rows while loading — never blank table or spinner
- Bulk action bar: fixed bottom-center, visible on selection only
- FilterBar above table, export CSV in page header

**Settings page — invoke `Skill('web-settings')` before building:**
Before writing any `/settings` route, **invoke `Skill('web-settings')` via the Skill tool**. Do NOT inline-execute by reading its SKILL.md. Summary of what the skill enforces:
- Tab layout: Profile, Billing, Team, Danger Zone
- Profile tab: full_name, company_name (read-only email), password change
- Billing tab: plan status, Stripe Customer Portal redirect (never custom billing UI)
- Team tab: member list, invite by email + role, remove member dialog
- Danger Zone: typed confirmation phrase before delete

**Onboarding wizard — invoke `Skill('web-onboarding')` before building:**
Before writing any `/setup` or `/onboarding` route, **invoke `Skill('web-onboarding')` via the Skill tool**. Do NOT inline-execute by reading its SKILL.md. Summary of what the skill enforces:
- Max 4 steps with AnimatePresence slide transition (220ms)
- Write to `organizations` table on each step completion — never batch at end
- Final step activates trial: sets `onboarding_complete = true`, `trial_ends_at`, `subscription_status = 'trial'`
- `ProtectedRoute` must check `onboarding_complete` — redirect to `/setup` if false
- `AuthRoute` (session-only check) wraps `/setup` — not `ProtectedRoute`

**4c. Per-page self-review (two passes — not one)**

Pass 1 — checklist: for dashboard pages, run the 28-item Pre-Ship Checklist from the dashboard-design skill (as specified in Phase 4b dashboard detection) — not the standard 13-item checklist. For all other pages, run the 13-item checklist from premium-website.md. Fix any failures inline before moving on.

Pass 1.5 — React key hygiene check: grep the page component for `.map(` and verify EVERY render call uses a stable identity key — never `key={index}`. Acceptable: `key={item.id}`, `key={item.slug}`, `key={label}`, `` key={`star-${i}`} ``. If any `.map(` uses `key={i}` or `key={index}`: fix it before marking the page complete.

Pass 2 — fresh eyes: re-read the page component from line 1 as if you are a new user opening this product for the first time with zero data. Ask:
- Would I know what to do on this page right now?
- Does the empty state give me a reason to act (not just explain why it's empty)?
- Does the loading state feel intentional or like something broke?
- Is the signature color doing exactly one job on this page?
- Would I be embarrassed to show this to a designer?

Fix anything that fails Pass 2. Log: "Page [name] complete — self-review passed (13/13 + fresh eyes)" to BUILD-LOG.md. Only then move to the next page.

## 4c.5 — Impeccable refinement sweep (transcript-verifiable — do not self-grade)

Runs after 4c self-review, before moving to the next page. **Not optional, not summarisable, not self-gradable** — every page goes through real Skill tool invocations before being marked complete. Self-review against a checklist is NOT a substitute for invoking the named skills (see AuditHQ v2 retro 2026-04-24 — that build skipped this entire phase by self-grading and shipped generic output).

### Landing page and marketing pages

Run these three in parallel (dispatch as background agents if context allows):

- `Skill("critique")` — UX/design evaluation: hierarchy, cognitive load, emotional resonance, information architecture
- `Skill("audit")` — technical quality: accessibility, performance, anti-patterns, responsive breakpoints
- `Skill("adapt")` — responsive/cross-device: verify mobile, tablet, desktop all render correctly

Collect findings from all three. Apply every HIGH or CRITICAL finding before marking the page complete. LOW findings: apply if under 5 minutes, otherwise log to GAP-REPORT.md.

Then run the design polish pass in parallel:

- `Skill("layout")` — spacing rhythm, grid consistency, visual hierarchy
- `Skill("typeset")` — font pairing, weight contrast, size scale, readability
- `Skill("colorize")` — color semantics, accent usage, contrast ratios

Apply findings. If colorize/typeset conflict with the DESIGN-BRIEF.md Component Lock, DESIGN-BRIEF.md wins. Log the conflict.

### App pages (dashboard, settings, auth, onboarding)

Run these three in parallel:

- `Skill("critique")` — UX clarity, empty states, error states, cognitive load
- `Skill("audit")` — accessibility (aria labels, focus states, keyboard nav), performance
- `Skill("adapt")` — mobile layout, touch targets ≥44px, table collapse to card stack

Apply HIGH/CRITICAL findings. Skip the design polish pass for app pages — they inherit the design system; that refinement belongs in Phase 5.

### Refinement findings that block page completion

- Any missing aria-label on interactive elements
- Any focus state not visible
- Any mobile breakpoint where content overflows horizontally
- Any color contrast failure (WCAG AA minimum)
- Any empty state that shows blank space instead of a CTA

### Per-page 4c.5 completion gate (per page, not per phase)

Each page's 4c.5 sweep cannot be marked complete unless THIS conversation's tool-call log contains, FOR THIS PAGE:

- Landing/marketing pages: `Skill('critique')` + `Skill('audit')` + `Skill('adapt')` + `Skill('layout')` + `Skill('typeset')` + `Skill('colorize')` (6 invocations minimum)
- App pages (dashboard/settings/auth/onboarding): `Skill('critique')` + `Skill('audit')` + `Skill('adapt')` (3 invocations minimum)

If a sub-agent invocation fails (usage limit, timeout, error): the next move is to invoke the same `Skill('X')` directly in main context — NOT to skip and self-grade. Self-graded "applied N findings" without these tool calls in transcript is a phase failure.

Log: "Page [name] — impeccable sweep complete — Skill('critique')/'audit'/'adapt' (+ design polish for landing) all invoked, [N] findings applied, [N] logged to GAP-REPORT.md" to BUILD-LOG.md.

**4d. Context refresh (every 3 pages)**
After completing every 3rd page (i.e. pages 3, 6, 9...), re-read DESIGN-BRIEF.md and SCOPE.md in full before starting the next page. Long build sessions compress early context — this prevents late pages drifting from the locked design contract.

**Per-page route registration**
After each page, add the route with React.lazy + Suspense. Never leave routes unregistered.

### Phase 4 completion gate (transcript-verifiable)

Phase 4 cannot be marked complete unless THIS conversation's tool-call log contains:

- [ ] At least one `Skill('web-page')` invocation per page in SCOPE.md (count must match SCOPE.md page count exactly — no skips)
- [ ] For any dashboard page: at least one `Skill('dashboard-design')` invocation
- [ ] For any list-table page: at least one `Skill('web-table')` invocation
- [ ] For `/settings`: at least one `Skill('web-settings')` invocation
- [ ] For `/setup` or `/onboarding`: at least one `Skill('web-onboarding')` invocation
- [ ] Per-page 4c.5 gate satisfied for every page (see above)

Log: "Phase 4 complete — N pages built via Skill('web-page'), refinement sweep invoked per page" to BUILD-LOG.md.

---

### Phase 4e — Route Reconciliation

After all SCOPE.md pages are built, before Phase 4.5:
1. Read the app-tier page inventory from SCOPE.md
2. Grep `src/App.tsx` for React.lazy route definitions
3. For every app-tier page in SCOPE.md: verify a matching lazy-loaded `<Route>` exists in App.tsx
4. If any SCOPE.md page has no route: write the missing `const XPage = React.lazy(...)` import and `<Route path="..." element={<XPage />} />` entry now
5. Do NOT proceed to Phase 4.5 until every SCOPE.md app-tier page has a route in App.tsx

Log: "Phase 4e complete — all routes reconciled" to BUILD-LOG.md.

---

### Phase 4.5 — Core Test Coverage

Run after all pages are built, before the quality gate. If resuming: check BUILD-LOG.md — if it contains "Phase 4.5 complete" and `npx vitest run` exits 0, skip this phase.

Write tests for the three flows that break silently in production:

**1. Auth flow** (`src/tests/auth.test.ts`):
- Sign up with valid email/password → expect session created
- Sign in with wrong password → expect error message rendered
- Access protected route without session → expect redirect to /auth
- Access /setup after onboarding_complete = true → expect redirect to the main app route (read first app-tier route from SCOPE.md — do not hardcode /dashboard)

**2. Onboarding flow** (`src/tests/onboarding.test.ts`):
- Complete all wizard steps → expect onboarding_complete = true in org record
- Partial completion → expect redirect back to /setup on next login
- Trial activation → expect subscription_status = 'trial' and trial_ends_at set

**3. Core feature smoke** (`src/tests/core.test.ts`):
- Primary data query returns empty → expect EmptyState with CTA rendered (not blank)
- Primary data query errors → expect error state + retry button rendered (not white screen)

Use Vitest + @testing-library/react. Mock Supabase client (vi.mock('@/lib/supabase')). **All Supabase calls in tests MUST use the mock — never hit real Supabase. If a test makes a real network call, the mock is misconfigured — fix the mock, not the test.**

Run tests:
```bash
npx vitest run --reporter=verbose 2>&1
```

If tests fail: fix the code, not the test. If a test cannot pass because the feature doesn't exist yet, that is a build gap — implement the feature.

Log: "Phase 4.5 complete — [N] tests passing" to BUILD-LOG.md.

---