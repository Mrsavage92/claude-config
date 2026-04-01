# /saas-improve

Autonomous multi-agent improvement swarm. Reads live production signals, dispatches 6 specialist agents in parallel, merges their intelligence into a unified priority stack, then executes every fix without stopping.

DO NOT TRIGGER when: user says "review [something]" — that is /review (audit + score + findings log).
TRIGGER when: user says "improve", "fix gaps", "make it production-ready", "run saas-improve", or resumes after a build session.

## When to Use
- After /saas-build completes (or after any build session)
- When a product was built in an earlier session and needs to be brought up to standard
- When BUILD-LOG.md shows STUCK or NEEDS_HUMAN items that have been resolved
- On a recurring improvement cycle for any live product

## What This Does
Six specialist agents scan the product simultaneously — each from a different angle. Their findings merge into a single IMPROVEMENT-STACK.md ranked by impact. The execution engine fixes everything it can touch, deploys, verifies, then checks if the market has moved since you launched.

---

## Phase 0 — Orient + Production Signal Read

### 0a. Read state
Read these files before doing anything else:
1. `BUILD-LOG.md` — last completed phase, STUCK items, deployed URL
2. `IMPROVEMENT-STACK.md` — previous stack (if exists and was generated in the last 24 hours: skip Phase 1 and Phase 2, jump directly to Phase 3 execution with the existing stack. If older than 24 hours: re-run Phase 1 and Phase 2 to refresh findings)
3. `SCOPE.md` — page inventory and feature set
4. `DESIGN-BRIEF.md` — locked color + typography contract
5. `MARKET-BRIEF.md` — competitor landscape and differentiator from launch
6. `~/.claude/commands/premium-website.md` — quality standard
7. `~/.claude/skills/shared/saas-gap-checklist.md` — base completeness checklist
8. `~/.claude/web-system-prompt.md` — Design DNA

Run `git log --oneline -20` and `git status`.

### 0b. Pull live production signals

Before any code analysis, check what the live product is telling us. Read these in parallel:

**Sentry (if VITE_SENTRY_DSN is set):**
Check for unresolved issues in the last 7 days. Each unresolved error = automatic P0 gap. Log: "Sentry: [N] unresolved issues" or "Sentry: unavailable".

**Railway logs (if Railway service exists):**
```bash
# Get last 100 lines of Railway logs for 5xx errors
npx railway logs --lines 100 2>/dev/null | grep -E "5[0-9]{2}|ERROR|CRITICAL" || echo "Railway: unavailable"
```
Each unique 5xx pattern = automatic P1 gap.

**Build health:**
```bash
npm run build 2>&1 | tail -20
```
Any build error = P0. Any warning about bundle size > 250KB = P1.

**TypeScript:**
```bash
npx tsc --noEmit 2>&1 | head -30
```
Any TS error = P1.

**Tests:**
```bash
npx vitest run --reporter=verbose 2>&1 | tail -20
```
Any failing test = P1.

Log all signal output. These findings are injected into the swarm as pre-seeded gaps.

---

## Phase 1 — Parallel Swarm Dispatch

Dispatch all 6 agents simultaneously. Each agent reads the full codebase independently and returns a structured findings list. Do not wait for one before starting the next — run them all at once.

---

### Agent 1: Security

Scope: every file touching auth, payments, user data, env vars, API routes.

```
CHECK — src/**/*.ts, src/**/*.tsx, **/*.py, **/*.env*

- [ ] No hardcoded secrets/API keys/tokens in source
- [ ] VITE_* prefix only on non-sensitive vars
- [ ] All private routes behind auth middleware
- [ ] User-supplied IDs never trusted (always from JWT/session)
- [ ] No SQL/NoSQL string interpolation (parameterised only)
- [ ] Stripe webhook signature verified before processing
- [ ] RLS enabled on ALL Supabase tables
- [ ] CORS not * in production
- [ ] No console.log with user data or tokens
- [ ] No sensitive data in localStorage
- [ ] CSRF on state-changing endpoints
- [ ] Password: bcrypt/argon2, never custom
- [ ] No eval() or dangerouslySetInnerHTML with user content
- [ ] Rate limiting on auth endpoints
- [ ] No stack traces in API error responses
- [ ] ErrorBoundary/catch blocks: check for `if (import.meta.env.PROD)` — this is an inverted condition (logs only in prod). Must be `DEV` or removed entirely
- [ ] signOut handler calls cache-clearing function (clearOrgCache, queryClient.clear, etc.) before navigating — stale cached IDs are a data-isolation risk

Return format:
AGENT: Security
[P0/P1/P2] [file:line] — [issue]
TOTAL: [N] findings
```

---

### Agent 2: Performance

Scope: vite.config, package.json, all route components, all data-fetching hooks, build output.

```
CHECK — src/**/*.tsx, vite.config.ts, package.json

- [ ] No chunk > 250KB gzipped (read build output from Phase 0b)
- [ ] React.lazy on every route component in App.tsx
- [ ] TanStack Query / SWR on all data fetching (no useEffect for data)
- [ ] manualChunks defined in vite.config (vendor-react, vendor-motion, vendor-query, vendor-supabase)
- [ ] Images: loading="lazy" except hero (loading="eager")
- [ ] No N+1 queries (loop containing DB call)
- [ ] Heavy canvas/WebGL components lazy-loaded
- [ ] font-display: swap on all @font-face
- [ ] No blocking sync ops in request handlers
- [ ] useCallback/useMemo where referential equality matters
- [ ] No unnecessary re-renders (missing dep arrays, stale closures)

Return format:
AGENT: Performance
[P1/P2] [file:line] — [issue]
TOTAL: [N] findings
```

---

### Agent 3: UX & Friction

Scope: every page, every component that renders data, every form, mobile viewports.

```
CHECK — src/pages/**/*.tsx, src/components/**/*.tsx

- [ ] Every empty state has designed content with CTA (not just "no data")
- [ ] Every loading state uses skeleton (not spinner or blank)
- [ ] Every error state has a retry button (not a white screen)
- [ ] All forms have validation on submit
- [ ] All modals: role="dialog", aria-modal, focus trap, Escape closes
- [ ] All icon-only buttons have aria-label
- [ ] All inputs have label or aria-label
- [ ] All interactive divs/spans have role + tabIndex
- [ ] Skip-nav link in AppLayout
- [ ] All images have alt attribute
- [ ] Mobile: sidebar collapses to Sheet on <768px
- [ ] Mobile: data tables collapse to card stack on <768px
- [ ] Mobile: touch targets min 44px
- [ ] Onboarding wizard exists and is <= 4 steps
- [ ] Trial banner present if free-trial model
- [ ] ProtectedRoute checks onboarding_complete, redirects to onboarding_route (from SCOPE.md, default /setup) if false
- [ ] ProtectedRoute checks trial/subscription status — expired users redirected to billing/settings, not silently left in the app
- [ ] "Coming soon" buttons (those that fire toast.info instead of navigating) have `aria-disabled="true"` so assistive tech knows they are inactive

Return format:
AGENT: UX/Friction
[P1/P2/P3] [file:line] — [issue]
TOTAL: [N] findings
```

---

### Agent 4: SEO & GEO

Scope: index.html, public/, every page component (for useSeo calls), robots.txt, sitemap.xml.

```
CHECK — index.html, public/*, src/pages/**/*.tsx

- [ ] useSeo called on every page with unique title + description
- [ ] og:title, og:description, og:image (1200x630, not placeholder) in index.html
- [ ] twitter:card in index.html
- [ ] robots.txt in /public with correct domain (not placeholder)
- [ ] sitemap.xml in /public with correct domain (not placeholder)
- [ ] site.webmanifest in /public
- [ ] og:image file referenced in index.html actually exists in public/ — a missing file is a silent failure (social previews show blank)
- [ ] JSON-LD schema on landing page (WebApplication or SoftwareApplication)
- [ ] FAQ section on landing page (LLM citability)
- [ ] Comparison table vs competitors on landing page
- [ ] PostHog or GA4 snippet in index.html
- [ ] No noindex on public marketing pages
- [ ] Canonical URLs defined
- [ ] Page titles follow pattern: [Page] — [Product Name]

Return format:
AGENT: SEO/GEO
[P2/P3] [file:line] — [issue]
TOTAL: [N] findings
```

---

### Agent 5: Code Health

Scope: all source files. Grep-first approach — find patterns, then read context.

```
CHECK — src/**/*.ts, src/**/*.tsx, **/*.py

- [ ] No TypeScript errors (from Phase 0b tsc output)
- [ ] No commented-out code blocks
- [ ] No console.log/console.error in components
- [ ] No duplicate components (same UI built twice)
- [ ] No duplicate utility functions
- [ ] No hardcoded hex/rgb/hsl colors outside index.css
- [ ] No direct Tailwind color literals (text-white, bg-black, text-gray-*)
- [ ] No inline style={{}} with color/spacing values
- [ ] No key={index} on dynamic lists
- [ ] No TypeScript `any` that can be typed
- [ ] No components over 200 lines without extraction
- [ ] No TODO comments in production paths
- [ ] No unused imports
- [ ] No hardcoded URLs that should be env vars
- [ ] No hardcoded contact emails in legal/policy pages (Privacy, Terms) — extract to constants
- [ ] Failing tests (from Phase 0b vitest output)

Return format:
AGENT: Code Health
[P1/P2/P3] [file:line] — [issue]
TOTAL: [N] findings
```

---

### Agent 6: Revenue & Conversion

Scope: landing page, pricing page, upgrade flows, Stripe integration, trial logic.

```
CHECK — src/pages/LandingPage.tsx, src/pages/Pricing*.tsx, src/components/Upgrade*, src/lib/stripe*

- [ ] Pricing section exists on landing page
- [ ] Social proof section exists on landing page (logos, testimonials, or review count)
- [ ] Hero CTA is specific (not just "Get started")
- [ ] UpgradeButton component exists and is wired to Stripe checkout
- [ ] Trial banner shows countdown + upgrade CTA (not just static text)
- [ ] Stripe webhook handles: checkout.session.completed, subscription.updated, subscription.deleted
- [ ] Stripe webhook signature verified (not just received)
- [ ] PricingCards component exists with feature comparison
- [ ] Settings > Billing tab has Stripe Customer Portal link
- [ ] Post-upgrade redirect lands on confirmation/dashboard (not /auth)
- [ ] Failed payment handling (dunning state shown to user)
- [ ] Free trial end = automatic downgrade state, not silent loss of access

Return format:
AGENT: Revenue/Conversion
[P1/P2/P3] [file:line] — [issue]
TOTAL: [N] findings
```

---

### Agent 7: Market Fit

Scope: landing page sections, pricing page, hero content, trust signals, product mockup.

```
CHECK — src/pages/Landing*.tsx, src/components/landing/**/*.tsx

Step 1 — Identify product category:
Read PRODUCT-CATEGORY-LIBRARY.md (at monorepo root, or C:\Users\Adam\Documents\au-compliance-platform\PRODUCT-CATEGORY-LIBRARY.md).
Read SCOPE.md and BUILD-LOG.md. Find the "Phase 1.5 complete" entry for the detected category.
If no Phase 1.5 entry exists: detect the category now from SCOPE.md keywords using the detection table in PRODUCT-CATEGORY-LIBRARY.md.

Detected category: [write here before running checks]

Step 2 — Category compliance checks:
Load the required sections list, trust signals, and forbidden patterns for the detected category.

- [ ] Hero pattern matches category expectation (not generic dark animated hero for a non-tech-tool category)
  - Expected pattern (from PRODUCT-CATEGORY-LIBRARY.md): [write here]
  - Actual pattern (from Landing.tsx): [write here]
  - Match: YES / NO
- [ ] All required landing sections present for this category (check each from the category's required list)
  - [section name]: PRESENT / MISSING
  - [repeat for all required sections]
- [ ] No forbidden patterns for this category (check each from the category's forbidden list)
  - [pattern name]: ABSENT (pass) / PRESENT (fail)
- [ ] Trust signals correct for this category
  - [trust signal]: PRESENT / MISSING
  - [repeat for all required trust signals]
- [ ] Pricing page structure matches category expectation (outcome-based / volume-based / compliance-tier)
- [ ] Copy tone matches category (not generic "enterprise" for field-worker tools, not casual for compliance tools)
- [ ] Mobile treatment appropriate for category (CRITICAL categories: mobile-first required)
- [ ] Category-specific CTA framing (not generic "Get started" — must name the specific outcome)
- [ ] At least 1 live data point or animated counter in hero (review count, tender count, company count, compliance score, deadline countdown, etc.)
- [ ] Product demo/preview shows category-relevant content — not a generic dark dashboard with abstract charts
  - Expected mockup content (from category): [describe]
  - Actual mockup content: [describe from Landing.tsx]
  - Match: YES / NO

Step 3 — Category-specific deep checks:

If Reputation/Reviews:
- [ ] AU-specific platform logos visible (ProductReview.com.au, SEEK, HiPages) — not just US platforms (BirdEye AU and Podium AU both fail this test — it is our moat)
- [ ] Star rating or score ring animated in mockup
- [ ] Before/after rating visualization present
- [ ] No USD pricing
- [ ] "Every review drives 600+ Google searches" stat OR equivalent local SEO ROI stat present in social proof section
- [ ] Hero CTA is "Start free trial" or "See your score" — NOT "Learn more" or "Book a demo"
- [ ] Comparison table includes ProductReview.com.au support as a column — this is the AU differentiator competitors can't match
- [ ] Copy uses SMB-accessible language — NOT "reputation intelligence platform" (say "see all your reviews in one place")
- [ ] SMS/WhatsApp review request shown — Podium explicitly lacks this; 98% SMS open rate vs 20% email; AU mobile-first behavior makes this a structural win. Must be visible as a named feature or shown in product mockup.
- [ ] "Respond within 48 hours" SLA messaging — AU industry norm; no competitor calls it out. Signals AU market specificity and professionalism.
- [ ] White-label agency resell mentioned (or separate /agencies page) — Grade.us proves the B2B2C model for AU marketing/SEO agencies wanting to resell review management to SMB clients. Even a single mention ("For agencies: white-label RepuTrack for your clients") unlocks a B2B revenue stream no AU competitor is serving.

If Entity/Company Intelligence:
- [ ] Search bar visible above the fold as the PRIMARY hero element — nothing before it (Dye & Durham buries search below service listings — that is the failure pattern)
- [ ] Sample company profile/report shown (real or realistic data) — this is the #1 conversion driver in the category. Users must see what they're buying.
- [ ] Data source cited (ASIC, ABN Lookup) above the fold — "Official ASIC data" callout in trust bar
- [ ] "Free search" or freemium hook present
- [ ] Use case cards (not generic feature cards) — legal due diligence, credit decisions, sales intelligence, supplier vetting
- [ ] Integration partner logos (legal software: LEAP, Actionstep, PracticeEvolve) — Dye & Durham shows 15+, this builds credibility with professional users
- [ ] Pay-as-you-go or credit model explained clearly — AU professional users expect this from Dye & Durham / InfoTrack

If Regulatory Compliance (AML/CTF):
- [ ] TWO-DATE URGENCY present: "AUSTRAC enrolment opens 31 March 2026 — compliance required by 1 July 2026" — after March 31, update to "Enrol now, comply by 1 July 2026." Single-date countdown misses the enrolment urgency window. easyAML and First AML both lead with dual-date framing.
- [ ] "FORCED BUYER" framing in hero — NOT "the modern way to manage AML." Tranche 2 brings 80,000+ SMBs with zero AML experience. Hero must say "Get compliant by July 1" not "reduce financial crime risk." Generic SaaS hero copy signals the product was not built for this market.
- [ ] "Are you affected?" section present with business type checklist
- [ ] Sector-specific profession cards present (real estate agents, accountants, lawyers, conveyancers) — easyAML uses full separate pages per profession. Cards are the minimum. Generic "all businesses" copy leaves half the audience unsure they're covered.
- [ ] "Compliance co-pilot" positioning present — "You ARE the compliance officer. Here's what to do Week 1, Week 2, Week 3." easyAML says "no compliance experience required" but does not guide the solo practitioner step by step. This is the biggest gap across all competitors. Narrative-driven onboarding beats feature lists for first-time compliance officers.
- [ ] SMSF + Trust UBO verification explained — complex AU structures (SMSF, discretionary trust, unit trust) are the #1 compliance headache for real estate agents and accountants. No competitor addresses this explicitly. Must appear in "How it works" or profession cards for real estate/accounting.
- [ ] STR templates by profession visible or referenced — pre-built suspicious transaction triggers (real estate: cash transactions, rushed settlements, beneficial owner refusal; accountants: offshore transfers, source-of-funds mismatch). Low-volume practitioners (3 transactions/month) do not know what triggers a STR — this is a core value prop no competitor owns.
- [ ] Compliance gap assessment CTA present (quiz or checklist) — highest-intent lead gen tool in this category
- [ ] Regulator acknowledgement (AUSTRAC) above the fold
- [ ] Security certifications visible (ISO 27001 / AU data residency minimum — SOC 2 if available)
- [ ] Compliance-framed pricing (not feature-list pricing) — anchor to "$179/month vs $6,020/yr compliance consultant" framing (easyAML uses this)
- [ ] Non-compliance penalty stated: "fines up to $31,300,000 for corporations" — this is the urgency anchor
- [ ] "No compliance experience required" or equivalent accessibility copy — this is the conversion hook for SMBs anxious about complexity
- [ ] Hero visual is timeline or regulatory gauge ("where you are vs deadline") — NOT generic dark dashboard. A compliance progress visual (steps completed, enrolment status, days to deadline) converts anxious forced-buyers better than any feature screenshot.

If Regulatory Compliance (WHS):
- [ ] ENFORCEMENT DATE CORRECT: Copy says "NOW IN EFFECT" / "now mandatory as of 1 December 2025" — NOT "upcoming" or "coming soon." Deadline passed December 2025. Stale urgency copy signals abandoned product.
- [ ] "PSYCHOSOCIAL" named explicitly in hero headline — FlourishDx leads with "Simplify Psychosocial Safety at Work." SafetyCulture/Donesafe/Riskware all bury psychosocial as a sub-feature of general WHS. Generic "WHS software" or "workplace safety" hero = losing positioning against specialists.
- [ ] Audience framing is HR managers + OHS specialists (risk-management language) — NOT field workers (SafetyCulture's lane). Operational efficiency copy ("better way of working", "digitize inspections") signals the wrong product for this category. Look for: "risk register," "control plan," "assessment framework," "governance" — not "checklists," "inspections," "field teams."
- [ ] Regulatory framework badge section present — must cite ALL FOUR: WHS 2023 Amendments, Respect@Work, Code of Practice 2024, ISO 45003. FlourishDx explicitly maps to all four. Competitors (SafetyCulture, Donesafe, Riskware) cite none. This is the single strongest trust signal for OHS professionals.
- [ ] Regulation name cited: "WHS Psychosocial Regulations — Safe Work Australia" — not just "WHS amendments"
- [ ] Safe Work Australia referenced above the fold
- [ ] Consultation evidence tracking mentioned — WHS 2023 Amendments legally require documented consultation records. No competitor addresses this governance layer explicitly. Should appear as a named feature ("Consultation log" / "Evidence trail"). This is the gap ReFresh ($1.3M pre-seed) is building for.
- [ ] ROI modeling or health impact prediction mentioned — FlourishDx uniquely offers "predict ROI from hazard reduction" and "predict health and productivity impacts." No other competitor makes this visible. A CFO-facing ROI calculator or even a stat ("Reducing psychosocial hazards saves $X per employee") unlocks the budget conversation.
- [ ] Industry-specific hazard examples with named industries (healthcare: patient aggression, retail: customer hostility, construction: isolation) — FlourishDx maps 50+ hazards across industries. This is the conversion hook.
- [ ] LIGHT-MODE DESIGN — dark hero for a WHS/HR tool is automatic P1 failure. FlourishDx, SafetyCulture, Donesafe, Riskware all use light mode. Dark mode signals "developer tool."
- [ ] Hazard count visible: "X psychosocial hazard types" — FlourishDx shows 50+. Anything under 14 (Safe Work Australia's published count) looks incomplete.
- [ ] Per-user-band pricing shown (up to 5/20/unlimited users) — this is the expected model from all WHS tools
- [ ] "Now compliant with WHS legislation + Respect@Work + IR legislation" — triple compliance statement FlourishDx uses that signals comprehensive coverage
- [ ] "Pure SaaS" speed positioning — FlourishDx mixes software with org psychology consulting (slow, expensive). If copy says "build your psychosocial risk register in 2 weeks, no consultant needed" — this is HazardIQ's structural advantage over the category leader. Must appear in hero or how-it-works.

If Procurement Intelligence:
- [ ] Live tender ticker or animated feed — this must be ANIMATED (scrolling or updating). A static screenshot of tenders is not acceptable. TenderLink and Tendertrace both show live/dynamic data patterns.
- [ ] PORTAL FRAGMENTATION MESSAGING — hero or subheading must name the problem explicitly: "No more monitoring 8 separate portals." The 8 sources are: AusTender (Commonwealth) + NSW, VIC, QLD, WA, SA, TAS, ACT, NT + 500+ local councils. No competitor owns this message yet — it is white space.
- [ ] Hero visual hierarchy: 60% data visualization / 30% copy / 10% CTA — the opposite of generic SaaS. A tender intelligence hero must be data-heavy (live feed cards, counts, agency names) not image-heavy. "542 new tenders this week" counter with live feed = signals platform has real content.
- [ ] Market size stat ($200B+) or live contract counter — Tendertrace leads with this
- [ ] Government coverage map/list (federal + which states) — users care about their jurisdiction before anything else. Must name ALL: Commonwealth + 6 states + 2 territories + local councils. Vague "across Australia" is not enough.
- [ ] Data source: "Official AusTender API" or equivalent citation in trust bar — #1 purchase decision factor
- [ ] Alert/watchlist feature as NAMED SECTION (not buried in features) — this is the primary value prop over AusTender
- [ ] MARKET LANE CLARITY: Is the product positioned as "intelligence" (Tendertrace lane) or "bid writing" (TenderPilot lane)? Copy must be unambiguous. Generic "tender management" language leaves users unsure which lane they're in.
- [ ] Transparent flat-rate pricing shown — Tendertrace (demo-only) and TenderPilot (waitlist) both hide pricing. Showing pricing is a structural SMB advantage. Most SMBs currently use AusTender free; sweet spot is $29-49/month with freemium.
- [ ] "No AusTender account required" visible — this is a real friction point users worry about
- [ ] Tender feed shows real data patterns: agency name, dollar value, close date, tender type (ATM/CN) — not "Tender #1234 - $50,000" generic placeholders
- [ ] AI relevance score or match score mentioned — no competitor owns "AI-powered opportunity discovery for SMBs" (Tendertrace = incumbent intel; TenderPilot = bid writing; TenderLink = dumb directory). If a relevance/match score feature exists, it must be prominently named. This is the biggest white-space differentiator in the market.
- [ ] Government security trust signals present (IRAP certification or "Australian servers" or "Data sovereignty compliant") — government is the buyer; IRAP and AU data residency are real procurement requirements, not nice-to-haves. TenderPilot leads with ISO27001 + IRAP on Microsoft Azure. Absence signals the tool was not built for government procurement contexts.

Return format:
AGENT: Market Fit
Category detected: [name]
[P1/P2/P3] [component:section] — [issue] — [what [competitor] does instead]
TOTAL: [N] findings

Severity guide:
- P1 = hero pattern wrong for category, required section missing, forbidden pattern present, trust signal completely absent
- P2 = copy tone wrong, pricing structure doesn't match category, mockup shows wrong content type
- P3 = minor category conventions not followed, optional improvements
```

---

## Phase 2 — Stack Merge

Collect all agent findings + Phase 0b production signals. Merge into a single deduplicated IMPROVEMENT-STACK.md.

```markdown
# Improvement Stack — [product name]
Generated: [timestamp]
Production URL: [URL from BUILD-LOG.md]
Sessions run: [increment each time this runs]

## Production Signals (Phase 0b)
- Build: [CLEAN / N errors]
- TypeScript: [CLEAN / N errors]
- Tests: [N passing / N failing]
- Sentry: [N unresolved issues / unavailable]
- Railway 5xx: [N patterns / unavailable]

## Agent Summary
| Agent | Findings | Top severity |
|---|---|---|
| Security | N | P0/P1/P2 |
| Performance | N | P1/P2 |
| UX/Friction | N | P1/P2 |
| SEO/GEO | N | P2/P3 |
| Code Health | N | P1/P2 |
| Revenue | N | P1/P2 |
| Market Fit | N | P1/P2 |
| **Total** | **N** | |

## P0 — Fix Immediately (production broken)
| # | Source | File:Line | Issue | Status |
|---|---|---|---|---|

## P1 — Fix This Session (ship-blocking)
| # | Source | File:Line | Issue | Status |
|---|---|---|---|---|

## P2 — Fix This Session (quality)
| # | Source | File:Line | Issue | Status |
|---|---|---|---|---|

## P3 — Fix When P1+P2 Done (marketing/polish)
| # | Source | File:Line | Issue | Status |
|---|---|---|---|---|

## Credential Blockers
| # | Issue | What's needed |
|---|---|---|

## Won't Fix (not applicable to this product)
[items skipped with reason]
```

**Deduplication rule:** if two agents flag the same file:line, keep the higher severity, merge the descriptions.

**Injection rule:** every Sentry error = P0 in the stack. Every Railway 5xx = P1. Every failing test = P1. These are non-negotiable — production is telling you something is broken.

---

## Phase 3 — Execution Engine

**This loop runs until all P0 + P1 + P2 + P3-quick items are DONE or BLOCKED. Do not stop early.**

```
LOOP:
  1. Read IMPROVEMENT-STACK.md — current state, not memory
  2. Find highest-priority item that is TODO (not BLOCKED, not STUCK, not in Won't Fix)
  3. If none remain: exit loop
  4. Select the right tool (routing table below)
  5. Execute the fix
  6. Re-read the affected file and confirm the issue is gone
  7. If confirmed: mark DONE in IMPROVEMENT-STACK.md
     If not fixed: mark STUCK with what was tried, skip
  8. Commit: "fix([agent]): [issue description] — [file]"
  9. Append to BUILD-LOG.md: "SWARM | [agent] | [item] | DONE | [timestamp]"
  10. Return to step 1

When loop exits (no TODO items remain): log "Phase 3 complete — [N] DONE, [N] BLOCKED, [N] STUCK" to BUILD-LOG.md.
```

**Tool routing:**
| Gap type | Tool |
|---|---|
| Broken/missing component | /web-fix |
| New page needed | /web-page |
| New component on existing page | /web-component |
| Dashboard/analytics page | /dashboard-design |
| Data table | /web-table |
| Settings page | /web-settings |
| Onboarding wizard | /web-onboarding |
| Email flows | /web-email |
| Stripe/billing | /web-stripe |
| Design system violation | Fix directly per web-system-prompt.md |
| a11y failure | Fix inline — aria attrs, focus rings, semantic HTML |
| TypeScript error | Fix inline |
| Console.log | Grep and delete inline |
| SEO/meta | Fix in index.html or useSeo call |
| Hardcoded color | Replace with CSS variable |
| Test failure | Fix the code, not the test |
| Issue type not in this table | Use /web-fix for UI issues; fix inline for logic/config issues — judgment call based on scope |
| Sentry/Railway error | Read full stack trace, fix root cause |

**Batch commits are banned.** One gap = one commit. Unrelated fixes must not share a commit.

**Credential blockers** — if a fix requires an API key, external config, or product decision not available in the codebase: mark BLOCKED in the stack with exact variable name/action needed. Skip it. Continue with everything else.

**Stuck limit** — if the same fix fails 3 times on the same approach: mark STUCK, document exactly what was tried, skip and continue. Never loop forever.

---

## Phase 4 — Regression Guard

After all fixes are committed:

```bash
npm run build 2>&1
npx tsc --noEmit 2>&1
npx vitest run --reporter=verbose 2>&1
```

Compare results to Phase 0b baseline.

**If new errors appeared that weren't in Phase 0b:** these are regressions introduced by this session's fixes. Do not deploy. Identify the offending commit with `git log --oneline -10`, then revert it with `git revert <sha>` (creates a new commit, does not destroy history). Add the regression as a P0 to IMPROVEMENT-STACK.md and return to Phase 3. Regressions are P0 — they supersede everything.

**If results are equal or better:** proceed to Phase 5.

Log: "Phase 4 regression guard — [before] → [after]" to BUILD-LOG.md.

---

## Phase 5 — Deploy + Live Verification

If any fixes were made since the last deploy, redeploy. If Phase 3 produced zero DONE items (all BLOCKED or STUCK): skip Phase 5 entirely, log "Phase 5 skipped — no fixes to deploy", proceed to Phase 6.

**Railway products** (if `railway.toml` exists or `package.json` references railway):
```bash
npx railway up --detach 2>&1
```

**Vercel SPA products** (default) — MCP preferred, CLI fallback:

Step 1 — read the Vercel project name from `BUILD-LOG.md` or `package.json` (`"name"` field). This is the `projectId`.

Step 2 — trigger deploy via MCP:
```
mcp__vercel__vercel_create_deployment({
  projectId: "[project-name-from-package-json]",
  gitSource: { type: "github", ref: "main" },
  target: "production"
})
```
If MCP is unavailable or returns an error: fall back to `npx vercel --prod --yes`.

Step 3 — poll until ready: call `mcp__vercel__vercel_get_deployment({ deploymentId: "[id from step 2 response]" })` every 15 seconds until `state` is `"READY"` or `"ERROR"`. Max 10 polls (2.5 minutes). If state is `"ERROR"`: read `mcp__vercel__vercel_get_deployment_events` to get build logs, fix the error, redeploy.

After deploy is `"READY"`, verify both surface and depth:

> **Platform note (Windows):** The `curl` commands below require WSL or Git Bash. On PowerShell, use `(Invoke-WebRequest -Uri [url] -UseBasicParsing).StatusCode` instead.

```bash
# Surface check — CDN edge responds
curl -s -o /dev/null -w "%{http_code}" [production-url]
# Must be 200

# Depth check — SPA rewrites work
curl -s -o /dev/null -w "%{http_code}" [production-url]/auth
# Must be 200

# App loads actual content (not empty HTML shell)
curl -s [production-url] | grep -c "<title>" || echo "No title found"
# Must return 1
```

If any check fails: read Vercel build logs, fix the error, redeploy, verify again. Do not call Phase 5 done until all three return expected values.

Update BUILD-LOG.md: "Deploy [timestamp] — all 3 live checks passed — [URL]"

---

## Phase 6 — Competitive Drift Check

**Run this phase every 3rd improvement session** (track count in IMPROVEMENT-STACK.md `Sessions run` field). Do not run on session 1 (Sessions run must be > 0 and divisible by 3).

The product was scoped against market research from launch day. Markets move. This phase detects if you've fallen behind.

Run the same 3 searches as Phase 0.25 in saas-build:
1. `"[product category] SaaS features" site:reddit.com OR site:producthunt.com`
2. `"[product category] SaaS alternatives"`
3. `"[product category] missing feature" OR "wish it had"`

Compare results against MARKET-BRIEF.md. For each new pattern found that isn't in MARKET-BRIEF.md:
- Update MARKET-BRIEF.md with the new competitor/feature data
- If a competitor shipped a feature that was in your "Nice-to-have post-launch" list: upgrade it to P2 and add to IMPROVEMENT-STACK.md
- If a new competitor emerged: log it as a P3 awareness item

Log: "Phase 6 competitive drift check — [N] new patterns found, [N] added to stack" to BUILD-LOG.md.

If this is not a 3rd-session run: skip Phase 6, log "Phase 6 skipped (session [N] of 3)".

---

## Phase 7 — Intelligence Sync

Push the session's output to all intelligence layers:

**Update IMPROVEMENT-STACK.md:**
- Mark session complete with timestamp
- Increment `Sessions run` counter
- Summarize what was fixed vs what remains

**Update BUILD-LOG.md final entry:**
```markdown
## Swarm Session Complete — [timestamp]

**Session:** #[N]
**Agents run:** 6 (Security, Performance, UX/Friction, SEO/GEO, Code Health, Revenue)
**Total findings:** [N]
**Fixed:** [N]
**Blocked (credentials):** [N]
**Regressions:** [N]
**Deploy URL:** [URL]
**Live verification:** PASSED / FAILED

### Fixed this session
- [finding] — [what changed] ([agent])

### Still blocked (needs human)
- [item] — [exact credential/action needed]

### Next session priority
[top 3 remaining items]
```

**Commit Phase 7 updates to Git:**
```bash
git add IMPROVEMENT-STACK.md BUILD-LOG.md
git commit -m "chore(swarm): session [N] — [N] fixed, [N] blocked"
git push origin main
```

**Push to Notion (if project has Notion URL in memory):**
Run `/project-refresh` PUSH mode with the above summary.

---

## Stop Conditions

| Condition | Action |
|---|---|
| All P0+P1+P2+P3-quick items DONE or BLOCKED | Exit Phase 3, run Phase 4-7 |
| Fix fails 3 times same approach | Mark STUCK, document, skip, continue |
| Build breaks after a fix | Revert that file, mark STUCK, continue with others |
| Credential not in env | Mark BLOCKED with exact var name, skip, continue |
| Sentry/Railway MCP unavailable | Log "signal unavailable", continue without it |

**Never stop because:**
- There are many items — that is expected, swarm handles scale
- A fix takes many steps — break it down and execute
- "The product works" — working and production-ready are different
- An agent found nothing — clean is good, log it and move on

---

## Rules

- One gap = one commit. No batching.
- P0 → P1 → P2 → P3. Never do P3 while P1 gaps exist.
- Credential blockers are not reasons to stop — skip them, fix everything else.
- Every fix verified by re-reading the file after the change.
- IMPROVEMENT-STACK.md is always the source of truth — never work from memory.
- Sentry errors and Railway 5xx patterns are P0/P1 by definition — live production outranks static analysis.
- The swarm finds what the checklist misses. Both inputs matter.
