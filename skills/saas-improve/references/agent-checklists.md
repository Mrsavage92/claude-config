# Agent Checklists — saas-improve

All 8 specialist agents for Phase 1 parallel swarm dispatch. Each agent reads the full codebase independently and returns a structured findings list.

---

## Agent 1: Security

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

## Agent 2: Performance

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

## Agent 3: UX & Friction

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

## Agent 4: SEO & GEO

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

## Agent 5: Code Health

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

## Agent 6: Revenue & Conversion

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

## Agent 7: Market Fit

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

## Agent 8: Design Quality

Scope: every page and component with user-facing UI. Read DESIGN-BRIEF.md and `.agents/context.json` before running checks — these define the expected design direction. If context files are missing, flag as P1 "impeccable teach never run — design checks cannot be grounded."

```text
CHECK — src/pages/**/*.tsx, src/components/**/*.tsx, src/styles/index.css

DESIGN SYSTEM INTEGRITY:
- [ ] Zero hardcoded hex/rgb/hsl colors outside index.css → /colorize if failing
- [ ] Zero direct Tailwind color literals (text-white, bg-black, text-gray-*) → /colorize
- [ ] Primary color used in max 2 semantic roles per page (not sprayed everywhere) → /colorize
- [ ] All spacing uses scale (no p-[13px], mt-[37px] magic numbers) → /layout

TYPOGRAPHY:
- [ ] Clear hierarchy on every page: at least 3 levels (display/heading, body, caption) → /typeset if failing
- [ ] Not everything at text-sm — hero headline must be display/hero size → /typeset
- [ ] Negative letter-spacing on display text → /typeset
- [ ] Consistent font pairing (not switching between unrelated faces) → /typeset

LAYOUT & COMPOSITION:
- [ ] No monotonous card grids with identical spacing and no hierarchy → /layout
- [ ] Alternating section backgrounds for visual rhythm → /layout
- [ ] Generous whitespace: section gaps 24px+, card padding 20px+ → /layout
- [ ] At least one "signature element" per page (not all pages have identical structure) → /bolder if generic

MOTION & INTERACTION:
- [ ] Framer Motion entrance animations on all major landing sections (not static) → /animate if missing
- [ ] All animations use compositor properties only (transform, opacity) — no layout-bound properties → /animate
- [ ] viewport={{ once: true }} on all whileInView animations (never re-animates on scroll up) → /animate
- [ ] Hover states designed on all interactive cards and buttons (not just cursor:pointer) → /delight
- [ ] At least one micro-interaction or delight moment per page → /delight

COPY QUALITY:
- [ ] No generic AI copy: "Streamline", "All-in-one", "Powerful yet simple", "Take control" → /clarify
- [ ] CTA labels are value-describing (not "Submit", "Click here", "Learn more") → /clarify
- [ ] Empty state copy matches COPY.md (not builder-invented strings) → /clarify
- [ ] Error messages are human-readable (not "Error 422" or raw exception text) → /clarify

MOBILE DESIGN:
- [ ] Touch targets minimum 44px → /adapt if failing
- [ ] No horizontal overflow on any viewport → /adapt
- [ ] Sidebar collapses to bottom nav or Sheet on <768px → /adapt
- [ ] Typography readable without zooming (16px minimum body) → /adapt

ANTI-GENERIC CHECKS (automatic P2 — flag every instance):
- [ ] Default dark gradient blob hero with no product visual → /bolder
- [ ] Unmodified shadcn card grid with uniform spacing → /layout + /bolder
- [ ] Safe gray-on-white with one accent color and no personality → /colorize + /bolder
- [ ] No texture, depth, layering, or atmosphere → /bolder
- [ ] All components at same border-radius and shadow depth → /layout

Route design failures to the correct impeccable skill (see Design Skill Router in saas-improve SKILL.md). Do not write raw CSS fixes for design findings — invoke the skill.

Return format:
AGENT: Design Quality
[P1/P2/P3] [file:line] — [issue] → [impeccable skill to invoke]
TOTAL: [N] findings

Severity guide:
- P1 = no design context established (impeccable teach missing), completely broken mobile layout, zero hierarchy
- P2 = generic anti-patterns present, wrong motion properties, copy drift, missing signature element
- P3 = minor polish items, optional delight additions
```
