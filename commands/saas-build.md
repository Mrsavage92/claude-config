# /saas-build

Full autonomous SaaS build pipeline from idea to deployed product. Runs the complete sequence without waiting for prompts between steps.

## When to Use
- Starting any new SaaS product from scratch
- User provides a product idea, name, or brief
- Executes 8 phases end-to-end: market research → design research → scope → scaffold → backend (Supabase + Stripe + email) → pages → quality gate → deploy → gap analysis

## What This Does
Executes the full build loop autonomously. Only stops for genuine blockers that require human action (external credentials, domain registration, Stripe live mode). Does NOT pause to ask "shall I proceed?" between steps.

---

## Persistent Context Protocol

**This protocol runs throughout the entire build. It is not optional and does not stop between phases.**

### Two Canonical Context Sources

Every saas-build product has two persistent context anchors that survive context window resets:

| Anchor | What it stores | When to read | When to write |
|---|---|---|---|
| **GitHub repo** | All code + BUILD-LOG.md + SCOPE.md + DESIGN-BRIEF.md | Start of every session + before every phase | After every phase completes (git commit) |
| **Notion project doc** | Decisions, intent, blockers, sessions history, credential status | Start of every session + after every 10 user messages | After every phase completes (project-refresh PUSH) |

### Session Start Rule (applies to EVERY new conversation that resumes a build)

Before writing a single line of code, run ALL of these in parallel:
1. Read `BUILD-LOG.md` — identifies last completed phase and any STUCK/NEEDS_HUMAN items
2. Read `SCOPE.md` — page inventory and build order
3. Read `DESIGN-BRIEF.md` — locked color system and component decisions
4. Run `/project-refresh` PULL mode — fetches current Notion doc state into context

Do NOT skip this even if the user says "continue from where we left off." The context window may have been reset. Read the files, not your memory.

### After Every Phase Completes

Immediately after logging "Phase X complete" to BUILD-LOG.md, run both of these:

```bash
git add -A && git commit -m "phase X: [one-line description of what was built]"
```

Then run `/project-refresh` PUSH to update Notion with:
- Phase just completed
- What was built
- Any NEEDS_HUMAN items added
- Current score or status if applicable

**Never skip this.** A phase that is not committed and not in Notion does not exist from the next session's perspective.

### Sub-Step Logging (partial-phase recovery)

Multi-step phases (3a, 3b, 3c, 4) can fail mid-way. To enable recovery without re-running completed sub-steps, log granular progress to BUILD-LOG.md using this format:

```
Phase 3a step 2/7: RLS policies written
Phase 3a step 3/7: TypeScript types generated
Phase 3a STUCK at step 4/7: Supabase MCP timeout — retry from step 4
```

For Phase 4 (pages), each page is a sub-step:
```
Phase 4 page 1/9: LandingPage — discovery check 7/7, category compliance 8/8, self-review 13/13
Phase 4 page 2/9: AuthPage — self-review 13/13
Phase 4 STUCK at page 3/9: ResetPasswordPage — useAuth import error (Phase 3a may have been skipped)
```

When resuming: read BUILD-LOG.md sub-step entries. Skip completed sub-steps. Resume from the last incomplete one.

### Mid-Session Context Refresh

After every 10 user messages within a build session:
- Re-read BUILD-LOG.md
- Run `/project-refresh` PULL to check if Notion has been updated externally

This prevents long sessions from drifting away from the locked decisions.

### Repo Creation Rule (fresh builds only)

If no GitHub repo exists for this product: create it in Phase 0 before writing any files. A build with no repo has no persistent context. See Phase 0 for the creation steps.

---

## Autonomous Build Loop

### Phase 0a — Orient

Read these files in full — they are the source of truth for the entire build. Run all reads in parallel:
1. `~/.claude/commands/premium-website.md` — all suite rules, landing page non-negotiables, performance requirements, per-page quality bar, and pre-deploy checklist. Everything in that file applies automatically to every phase below.
2. `~/.claude/web-system-prompt.md` — Design DNA. Read before generating any UI. If this file does not exist: log "Design DNA missing — using premium-website.md design rules as substitute" and continue. Do NOT block.
3. `~/.claude/commands/web-animations.md` — CSS + Tailwind animation patterns. Technique 3 STAGGER is mandatory for the hero. **IMPORTANT: Do NOT use framer-motion.** Use CSS animations, Tailwind animate utilities, or `@keyframes` instead. Framer Motion causes production crashes on Vercel (proven in TradieJobFlow build — 7 fix commits to strip it). If web-animations.md references framer-motion patterns, implement them with CSS equivalents.
4. `CLAUDE.md` (project root, if exists) — project-specific overrides.
5. `DESIGN-BRIEF.md` (project root, if exists) — locked color system, typography, marketing tier, and component decisions from Phase 0.5. If this file exists, all design decisions are already made — do NOT re-decide them.
6. `SCOPE.md` (project root, if exists) — page inventory and design decisions.
7. `COPY.md` (project root, if exists) — all user-facing copy. If this file exists, Phase 2.5 already ran.

**Architecture: Each product is its own standalone repo.** No monorepo, no shared backend, no FastAPI, no Railway. Each product: React/Vite frontend + Supabase (backend/auth/db) + Stripe + Vercel.

Check if BUILD-LOG.md exists in the project root. This is the primary resume signal — not git log.

If BUILD-LOG.md does not exist: this is a fresh start. Run Phase 0b (repo + Notion) first, then Phase 0.25.
If BUILD-LOG.md exists: read it to identify the last completed phase, then continue from the next one. If resuming from Phase 1 or later, verify DESIGN-BRIEF.md exists — if missing, run Phase 0.5 before continuing. Also verify MARKET-BRIEF.md exists — if missing, run Phase 0.25 before continuing.

**If resuming (BUILD-LOG.md exists): also run `/project-refresh` PULL now before continuing.** Pull Notion state into context — decisions, blockers, and credential status may have changed since the last session.

Log every phase start and completion to `BUILD-LOG.md` in the project root.

### Phase 0b — GitHub Repo + Notion Doc (fresh builds only)

**For fresh builds (no BUILD-LOG.md), do this before Phase 0.25. For resuming builds, verify these exist and skip if already done. Phase 0a (Orient) runs first — this phase runs immediately after.**

**Step A — Create GitHub repo:**

Check if a repo exists for this product:
```
mcp__plugin_github_github__search_repositories query:"[product-slug] user:Mrsavage92"
```

If no repo found: create it:
```
mcp__plugin_github_github__create_repository name="[product-slug]" description="[product name] — [one-line pitch from brief]" private=true auto_init=true
```

Write the repo URL to BUILD-LOG.md and the project memory file as `github_repo`.

**Step B — Create Notion project doc:**

Run `/project-doc` with the product name and brief. This creates the Notion master doc under the Projects hub.

Write the Notion URL to BUILD-LOG.md and the project memory file as `notion_url`.

**Step C — Create project memory file:**

Check if `~/.claude/projects/.../memory/project_[slug].md` exists. If not, create it now:
```markdown
---
name: [Product Name]
description: [one-line product description]
type: project
---

[Product Name] — [brief description]

**Why:** [product rationale]
**How to apply:** Next session = continue from last BUILD-LOG.md phase.

GitHub: [repo URL]
Notion: [notion URL]
Build state: Phase 0 started [date]
```

Add the memory file to MEMORY.md index.

After Steps A-C complete: commit the initial files (BUILD-LOG.md, memory file) and push to GitHub:
```bash
git add BUILD-LOG.md && git commit -m "init: [product-name] saas-build started" && git push origin main
```

Log: "Phase 0 complete — context loaded, repo created, Notion doc created" to BUILD-LOG.md.

---

### Phase Completion Protocol (applies to every phase in this file)

**Step 1 — Phase Progress Review (mandatory before commit).**
Every phase that produces output (0.25, 0.5, 1, 1.5, 2, 3a/b/c, 4, 4.5, 5) must pass its phase-specific review gate BEFORE committing. This prevents bad output from ever entering the repo. No rollback needed if nothing bad is committed.

Run the review gate for the phase that just completed (see table below). If it fails: fix inline, re-run the gate, and only commit once it passes. Max 3 review-fix attempts per phase — if still failing after 3, log STUCK with exact failures.

| Phase | Review gate | Pass criteria |
|---|---|---|
| 0.25 | MARKET-BRIEF.md has all 7 sections populated | No empty sections, differentiator is one sentence (not generic), must-haves list has 3+ items |
| 0.5 | DESIGN-BRIEF.md has Component Lock table | All 11 sections have a named component, personality type set, color system differs from last build |
| 1 | SCOPE.md has all pages with 7 fields each | Every page has: route, purpose, data source, empty state, loading state, error state, signature element |
| 1.5 | BUILD-LOG.md has category rules loaded | Hero override, UX pattern, required sections count, forbidden patterns count, trust signals — all non-empty |
| 2 | `npm run build` exits 0 + landing page renders | TypeScript compiles, no blank landing page, hero uses MARKET-BRIEF differentiator (not placeholder) |
| 3a | `src/lib/supabase.ts` exists + types generated | Supabase client connects, TypeScript types match schema, RLS policies exist for all tables |
| 3b | `.env.example` has Stripe vars | Price ID is real (starts with `price_`), UpgradeButton component exists, webhook handler exists |
| 3c | Email templates exist in expected path | At least welcome + password-reset templates, Resend API key in `.env.example` |
| 4 (per page) | Per-page self-review passes (13-item or 28-item) | Zero failures on checklist + fresh-eyes pass + anti-generic check. **This runs per page, not once at end.** |
| 4 (overall) | All SCOPE.md pages built + routes reconciled | Every page in SCOPE.md has a matching lazy route in App.tsx, `npm run build` exits 0 |
| 4.5 | `npx vitest run` exits 0 | All test files pass, no skipped tests |

**The Phase 4 per-page gate is the key improvement.** Previously a bad page could be committed and only caught in Phase 5. Now: each page is reviewed immediately after build. If it fails, the page is fixed before the next page starts. A broken AuthPage is caught before SettingsPage is built — not 6 pages later in Phase 5.

**Step 2 — Commit + push context.**
Only after the review gate passes: follow the "After Every Phase Completes" protocol defined in the Persistent Context Protocol section above (git commit + `/project-refresh` PUSH).

---

### Phase 0.25 — Feature & Market Research

Two questions to answer before any design work:
1. "What are active, successful competitors doing that works?"
2. "What do they miss that users need?"

If they are active and growing, their approach is a proven system. Study it before inventing your own.

**Step A — Discover competitors and user needs (5 WebSearch queries):**
1. `"[product category] SaaS features" site:reddit.com OR site:producthunt.com` — real user needs
2. `"[product category] SaaS alternatives"` — who exists, what they do
3. `"[product category] missing feature" OR "wish it had"` — unmet needs
4. `"[product category] best software" site:g2.com OR site:capterra.com` — which products are rated highest and why
5. `"[top competitor name] review"` — what users love and hate about the market leader

**Step B — Competitor website deep-dive (WebFetch top 3):**
For each of the top 3 competitors identified in Step A, WebFetch their homepage. Capture:
- **Hero pattern**: what's above the fold — product visual or abstract? What's the headline framing? What does the primary CTA say?
- **Social proof format**: logos only? testimonial quotes? stat numbers ("10,000 teams")? G2/Capterra badges?
- **Pricing model**: free trial / freemium / demo-only / paid-only? Number of tiers?
- **Navigation**: what top-level pages do they have — this reveals what features they consider primary
- **One thing that clearly works**: the single strongest element of their site that would perform well for any product in this category

If WebFetch is blocked or returns no content: run `WebSearch "[competitor name] homepage design [year]"` and extract the same fields from search snippets.

**Step C — Competitor screenshots (visual benchmark):**
For each top 3 competitor: use `agent-browser` to navigate to their homepage, take a full-page screenshot, and save to `research/competitor-screenshots/[name].png` in the project root. These screenshots are used by the Critic agent in Phase 4 and 5 to visually compare our output against real competitors — not against a generic "good SaaS" ideal. If agent-browser is unavailable: log "Competitor screenshots skipped — agent-browser unavailable" and continue. The Critic agent will use the text-based Competitor website analysis table as fallback.

Write `MARKET-BRIEF.md` to project root:
```markdown
# Market Brief — [product name]

## Top 3 competitors
| Name | Price | Strengths | Gaps |

## Competitor website analysis
| Competitor | Hero pattern | Social proof | Pricing model | Nav structure | What works |
|---|---|---|---|---|---|
| [name] | | | | | |
| [name] | | | | | |
| [name] | | | | | |

## Patterns worth adopting (proven across 2+ competitors)
- [e.g. "All 3 use large customer logo strips above the fold — this clearly builds trust in this category"]
- [e.g. "Free trial is the universal CTA — no competitor uses demo-only"]

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

**Phase 0.5 (design research) reads the "Competitor website analysis" and "Patterns worth adopting" sections** to inform hero architecture, social proof placement, and pricing section design. Do not duplicate the research — pass it forward.

SCOPE.md (Phase 1) must include the "Must-have for v1" features in the page inventory. If a must-have feature has no page defined, add the page.

If resuming: check if MARKET-BRIEF.md exists. If yes, skip this phase.

Log: "Phase 0.25 complete — MARKET-BRIEF.md written" to BUILD-LOG.md.

---

### Phase 0.5 — Design Research (run /web-design-research) — MANDATORY

**This phase runs before /web-scope on EVERY new product. It is not optional.**

Read `~/.claude/skills/web-design-research/SKILL.md` in full and execute all 12 steps:

1. **Personality** — classify product into one of 8 types (Enterprise Authority / Data Intelligence / Trusted Productivity / Premium Professional / Bold Operator / Health & Care / Growth Engine / Civic/Government)
2. **Product category** — identify the product category (from PRODUCT-CATEGORY-LIBRARY.md categories 1-8): Reputation/Reviews, Entity Intelligence, Regulatory Compliance, Procurement Intelligence, Practice Management, HR/People Ops, Finance/Accounting, Document Management. This determines the landing page structure — it is separate from personality type and supersedes the generic dark SaaS template.
3. **Category-specific competitor research** — look at 3 direct competitors IN THE SAME CATEGORY (not just "enterprise dark SaaS" broadly). For reputation tools, study BirdEye/Podium. For WHS tools, study SafetyCulture/FlourishDx. For tender tools, study Tendertrace/TenderPilot. Generic "B2B SaaS design inspiration" is not sufficient. If MARKET-BRIEF.md exists and has category-specific research, read it instead. If not, run 3 WebSearch queries: "[product category] software Australia landing page," "[top competitor] homepage," "[product category] SaaS design pattern."
4. **Category hero override** — after competitor research, check if the category has a mandatory hero pattern in PRODUCT-CATEGORY-LIBRARY.md. If yes, lock this as the hero architecture. The generic dark animated hero is WRONG for: WHS tools (light-mode field tools), entity intelligence (search-bar-first), AML/CTF (deadline-urgency banner). Write the override to DESIGN-BRIEF.md.
5. **Color system** — select from personality palette library. Explicitly reject hsl(213 94% 58%). **Monorepo cross-check:** grep `apps/*/DESIGN-BRIEF.md` AND `apps/*/src/styles/index.css` for existing `--brand:` values — if same hue (±15 degrees) already used in either file, pick different palette and document why. (DESIGN-BRIEF.md may be stale or missing; index.css is the ground truth for what colour is actually deployed.) **Category check:** WHS/health tools should NOT use dark-first. Regulatory compliance tools should NOT use bold consumer colors. Cross-check against category conventions.
6. **Typography lock** — select font pairing per personality type (not just "Inter"). Lock heading weight and tracking.
7. **Hero architecture** — choose pattern: Centered / Split-pane / Full-screen immersive / Minimal editorial. Tie choice to personality + user type + category convention. The category hero pattern (from step 4) overrides this if it specifies a mandatory pattern.
8. **Component Lock** — run `mcp__magic__21st_magic_component_inspiration` for ALL 11 mandatory sections using personality-specific search terms (not generic "dark SaaS"). Apply selection criteria (visual weight, animation level, layout) to pick the right variant for each. If MCP unavailable: use defaults from Component Registry in `premium-website.md` and continue. Record all choices in DESIGN-BRIEF.md Component Lock table.
9. **LottieFiles** — find 3 product-specific animations (empty state, success state, processing state). WebSearch `"lottiefiles.com [product-category] animation"`. Note "unavailable" if nothing fits — do not block.
10. **Differentiation audit** — grep recent `apps/*/DESIGN-BRIEF.md` files, confirm 3+ dimensions differ from last build (color, hero pattern, features layout).
11. **Marketing tier** — choose Tier 1/2/3. Default: Tier 2 (/, /features, /pricing, /auth as separate routes).
12. **Write DESIGN-BRIEF.md** — must include: Product Personality, Color System, Typography, Hero Architecture, Component Lock table (all 11 sections), LottieFiles, Differentiation Audit, Marketing Structure, Build Order.

**Build skills (web-scaffold, web-page) read the Component Lock from DESIGN-BRIEF.md — they do NOT re-run MCP queries.**

Do not proceed to Phase 1 until DESIGN-BRIEF.md exists with the Component Lock table fully populated.

Log: "Phase 0.5 complete — DESIGN-BRIEF.md written" to BUILD-LOG.md.

---

### Phase 1 — Scope (run /web-scope)

Execute the full /web-scope process:
1. **Read DESIGN-BRIEF.md first** — all color, typography, and marketing structure decisions are already locked. Do NOT re-decide them. Import them directly from the brief.
2. **Read MARKET-BRIEF.md (if exists)** — extract the "Must-have for v1" list. Every item on that list must map to a page in the inventory. If a must-have has no page, create one before continuing.
3. Extract brief from user input
4. Produce complete page inventory with all 7 fields per page (use the marketing tier structure from DESIGN-BRIEF.md for public pages)
5. Write SCOPE.md to project root
6. Append initial SCOPE summary to BUILD-LOG.md — do NOT overwrite; Phase 0.25 already created this file

Do not proceed to Phase 2 until SCOPE.md exists and every page has all 7 fields defined.

SCOPE.md MUST also include an `onboarding_route` field at the top level (e.g. `/setup` or `/onboarding`). Phase 3a ProtectedRoute reads this field. If the brief does not specify, default to `/setup`.

**Mandatory pages — add to SCOPE.md regardless of brief:**
Every SaaS product MUST include these pages in the inventory. If the brief doesn't mention them, add them:
- `/privacy` — Privacy Policy (static, auto-generated)
- `/terms` — Terms of Service (static, auto-generated)
These are never optional. Add them to the build order in Phase 4 after `/settings`.

**Stop condition:** if the product description is too vague to identify the core feature category, make a documented assumption and log it — do NOT ask. Format: "Brief was vague — assumed [X] based on [Y]. Correct SCOPE.md if wrong." Only ask if the product domain is completely unidentifiable after analysis.

Log: "Phase 1 complete — SCOPE.md written" to BUILD-LOG.md.

---

### Phase 1.5 — Personality Rule Loading

**Run this phase between Phase 1 (Scope) and Phase 2 (Scaffold). It is not optional.**

Phase 0.5 already detected the product personality and wrote it to DESIGN-BRIEF.md. This phase reads the `personality` field and derives build rules from it — no external file dependency.

Read DESIGN-BRIEF.md and extract the `personality` field. If missing: run Phase 0.5 now.

**Derive rules from personality type:**

1. **Hero pattern** — derive from personality:
   - Enterprise Authority / Civic: Centered hero, formal headline, compliance language
   - Bold Operator: Split-pane hero, punchy headline, product mockup right
   - Data Intelligence: Search-bar-first hero, data preview below
   - Trusted Productivity / Premium Professional: Minimal editorial hero, clean typography
   - Health & Care: Light-mode hero (NOT dark), warm reassuring tone
   - Growth Engine: Stats-forward hero, ROI language
   Write the hero pattern to DESIGN-BRIEF.md as `hero_override` if it differs from the default.

2. **Required landing sections** — every product needs these (log as checklist to BUILD-LOG.md):
   - Hero with product-specific headline (from MARKET-BRIEF.md differentiator)
   - Social proof (format from competitor research)
   - Feature highlights (from MARKET-BRIEF.md must-haves)
   - Pricing section
   - FAQ section (minimum 5 questions — critical for SEO and AI citability)
   - CTA section

3. **UX dominant pattern** — what the first app page should look like:
   - Job management / field service → Kanban/dispatch board
   - CRM / client management → Pipeline view
   - Checklist / SOP → Daily task list with completion tracking
   - Analytics / intelligence → Dashboard with KPI cards
   - Process design → Canvas/editor
   Write to BUILD-LOG.md: "UX pattern: [pattern] — first app view must reflect this."

4. **Forbidden patterns** — log to BUILD-LOG.md:
   - Generic "Streamline your [X]" hero copy
   - Dark mode for health/safety/care products
   - Dashboard-first for products where the core action is NOT monitoring
   - Stock photo hero images (always use product mockup or illustration)

5. **Mobile requirement** — field service / trades / checklist products = CRITICAL mobile. All others = MEDIUM minimum.

Write to BUILD-LOG.md:
```
Phase 1.5 complete — Personality: [type]
Hero pattern: [description]
UX pattern: [pattern]
Required sections: [count] loaded
Forbidden patterns: [count] loaded
Mobile requirement: [level]
```

Log: "Phase 1.5 complete — personality [type] rules loaded" to BUILD-LOG.md.

---

### Phase 2 — Scaffold (run /web-scaffold)

Execute the full /web-scaffold process using decisions from SCOPE.md, DESIGN-BRIEF.md, and MARKET-BRIEF.md:

0. **Read all three research files before writing any code:**
   - **DESIGN-BRIEF.md Component Lock table** — every landing page section has a specific 21st.dev component assigned. Use these during the landing page build. Do NOT re-run MCP queries.
   - **MARKET-BRIEF.md** — extract these fields and use them in the scaffold landing page:
     - `Competitor website analysis` → adopt the hero pattern that 2+ competitors use (not the generic dark SaaS hero)
     - `Patterns worth adopting` → implement every pattern listed here. If competitors use logo strips, use logo strips. If they use stat counters, use stat counters.
     - `Our differentiator` → this IS the hero headline. Not "The modern way to [verb]" — the actual differentiator sentence.
     - `Top 3 competitors: Gaps` → these gaps become feature highlight cards or a comparison table section
     - `Features users consistently request` → these become landing page feature section bullets, not generic "AI-powered" filler
   - **DESIGN-BRIEF.md personality + category** → determines tone. Enterprise Authority = formal, no emoji, "trusted by" language. Bold Operator = punchy, short sentences, action verbs. Health & Care = warm, reassuring, compliance-focused.

**PHASE 2.5 GATE: Do NOT proceed to Phase 3 without COPY.md.** Phase 2.5 (below) writes COPY.md. If it does not exist after Phase 2 completes, Phase 2.5 MUST run before Phase 3. This was the single biggest quality failure in the first build — all copy was invented inline, making every page sound generic. COPY.md is non-negotiable.

**Steps 1-15 — run the full /web-scaffold process.** Read `~/.claude/commands/web-scaffold.md` for all 15 steps. The following saas-build-specific overrides apply on top of web-scaffold:

- **Step 4 override — CLAUDE.md as single builder context:** CLAUDE.md is the ONE file the per-page builder reads. It must contain everything needed to build any page without reading other files. Include:
  - Color job definition (brand HSL, 2 primary roles, max uses)
  - Product personality type (from DESIGN-BRIEF.md)
  - Differentiator sentence (from MARKET-BRIEF.md)
  - Page inventory summary (from SCOPE.md)
  - Category (from Phase 1.5) and any hero/UX overrides
  - `## Content Sources` section: "All copy: COPY.md. Design decisions: DESIGN-BRIEF.md."
  This prevents the builder from reading 7 files per page — it reads CLAUDE.md + COPY.md only.
- **Step 14 — icon generation on Windows:** If `infsh`/`jq`/`curl` are unavailable, run the `/ai-image-generation` skill with the icon prompt from DESIGN-BRIEF.md. The skill handles download cross-platform. If that also fails: log NEEDS_HUMAN "Add icon-192.png, icon-512.png, and og-image.jpg to /public — required before Phase 6 deploy." Continue building, but Phase 6 pre-deploy checks MUST verify these files exist before deploying.

Log: "Phase 2 complete — scaffold generated" to BUILD-LOG.md.

---

### Phase 2.5 — Copy Document (COPY.md) — copy-first, code-second

**This is the single biggest quality lever in the entire pipeline.** Products look generic because copy is invented inline during page builds. This phase writes ALL user-facing copy BEFORE any page code exists. The builder (Phase 4) implements COPY.md literally — it never invents its own copy.

**Why this exists:** Linear, Stripe, Basecamp — every premium product writes copy first, designs second. The copy IS the design. If the words are wrong, no amount of animation or component polish fixes it.

Read MARKET-BRIEF.md, DESIGN-BRIEF.md, and SCOPE.md. For every page in SCOPE.md, write the following to `COPY.md` in the project root:

```markdown
# Copy Document — [product name]
Personality: [from DESIGN-BRIEF.md]
Differentiator: [from MARKET-BRIEF.md]
Voice rules: [tone guidelines for this personality type]

## Landing Page
hero_headline: "[derived from differentiator — NOT generic]"
hero_sub: "[1-2 sentences, addresses the user's pain directly]"
hero_cta_primary: "[specific action — 'Start 14-day trial' not 'Get Started']"
hero_cta_secondary: "[low-commitment alternative — 'See how it works']"
social_proof_format: "[from competitor analysis — logos/testimonials/stats]"
feature_1_headline: "[from MARKET-BRIEF must-haves]"
feature_1_body: "[one sentence, benefit-first]"
feature_2_headline: "..."
...
pricing_headline: "[value framing, not 'Pricing']"
faq_items:
  - q: "[real question a buyer would ask — from competitor gap analysis]"
    a: "[direct answer]"

## Auth Page
headline: "[welcome back framing]"
signup_cta: "[matches landing CTA for consistency]"
error_wrong_password: "[helpful, not robotic]"
error_email_taken: "[guide to sign in instead]"

## Onboarding (/setup)
step_1_heading: "[what we need from them]"
step_1_sub: "[why we need it — builds trust]"
step_2_heading: "..."
completion_message: "[celebrates + tells them what to do next]"

## [Each app page from SCOPE.md]
page_headline: "[action-oriented, not noun-label]"
empty_state_headline: "[reason to act, not description of emptiness]"
empty_state_body: "[specific next step with time estimate]"
empty_state_cta: "[exact button label]"
error_state: "[what happened + what they can do]"
loading_text: "[if visible > 2s, what to show]"

## Settings
profile_heading: "Your profile"
billing_heading: "[plan name] plan"
danger_zone_confirmation: "Type [product-name] to confirm deletion"

## Transactional Emails (if Phase 3c applies)
welcome_subject: "[personal, not corporate]"
welcome_preview: "[first line visible in inbox]"
trial_ending_subject: "[urgency without panic]"
trial_ending_body: "[what they lose + one-click upgrade path]"
```

**Rules for writing COPY.md:**
- Every string must be product-specific. If you could paste it into a different SaaS and it would still work, it's too generic. Rewrite it.
- Hero headline derives from MARKET-BRIEF.md `Our differentiator` — if the differentiator is "Only AML platform built for Tranche 2 SMBs", the hero is NOT "Streamline your compliance" — it's "Get AML compliant before July 1, 2026."
- Empty states must include a time estimate and a specific action — "Add your first hazard — takes about 2 minutes" not "No hazards found."
- Error messages must be helpful, not technical — "Wrong password. Reset it here" not "Authentication failed."
- CTA buttons must state the outcome, not the action — "Start 14-day trial" not "Sign up."
- Tone must match DESIGN-BRIEF.md personality consistently throughout. Read the personality tone map from Phase 4a pre-build check.

**Phase 2.5 review gate:** COPY.md has no empty fields, no placeholder text, no generic phrases (grep for "streamline", "all-in-one", "powerful", "take control", "Get Started", "Learn More"). The differentiator sentence appears in hero_headline. Every page in SCOPE.md has a corresponding section.

**Phase 4 consumption rule:** The builder reads COPY.md for EVERY string. It does not invent copy. If a string is missing from COPY.md, the builder adds it to COPY.md first (maintaining tone), then uses it. COPY.md is the single source of truth for all user-facing text.

Log: "Phase 2.5 complete — COPY.md written, [N] pages, [N] strings" to BUILD-LOG.md.

---

### Critic Agent Protocol

**The builder should never review its own output.** After these phases, spawn a separate Critic agent (subagent_type: general-purpose) that reviews the output adversarially:

| Trigger | What the Critic reviews |
|---|---|
| After Phase 2.5 (COPY.md written) | "Would a $49/month buyer read this and understand the product in 5 seconds? Does the hero make me want to try it or does it sound like every other SaaS?" |
| After Phase 4 (all pages built) | "If I compare this to [top competitor from MARKET-BRIEF], what do they do better? Name 3 specific things." + if competitor screenshots exist in `research/competitor-screenshots/`, compare visually. |
| After Phase 5 (quality gate passed) | "Would I be embarrassed to share this URL in a Slack channel? What's the weakest page and why?" |

**Critic agent brief template:**
```
You are reviewing [product name], a [category] SaaS product.
Read these files: MARKET-BRIEF.md, DESIGN-BRIEF.md, COPY.md, SCOPE.md.
Top competitor: [name from MARKET-BRIEF].

Your job is NOT to check a rubric. Your job is to answer:
1. If I landed on this cold, would I understand what it does in 5 seconds?
2. Does this look like a $[price]/month product or a free template?
3. What does [top competitor] do better on their equivalent page?
4. What's the single weakest element and how would you fix it?

Be specific. "The hero is weak" is useless. "The hero says 'Streamline your compliance' 
which could be any product — should say 'Get AML compliant before July 1' because that's 
the actual deadline driving purchases" is useful.

Output: CRITIQUE.md with specific rewrites for every issue found.
```

The Critic outputs `CRITIQUE.md`. The builder reads CRITIQUE.md and implements every rewrite before the phase commits. If the Critic finds zero issues, it logs "Critic: no issues found" — this is expected to be rare. The Critic exists to catch the things self-review misses: taste, positioning, and competitive gap.

**Critic is not optional.** It runs at the three trigger points above. If context is too long to spawn a subagent, re-read COPY.md + MARKET-BRIEF.md and self-critique using the same 4 questions — but log "Critic: self-critique (subagent unavailable)" so the limitation is visible.

---

### Phase 3 — Backend Setup (parallel dispatch)

Phases 3a, 3b, and 3c are independent of each other — Supabase schema, Stripe price creation, and email template setup do not depend on each other's outputs. Determine which apply (read SCOPE.md for monetization model and email requirements), then dispatch all applicable phases simultaneously:

| Phase | Condition to run |
|---|---|
| 3a (Supabase) | Product needs auth or database |
| 3b (Stripe) | Any paid plan or trial-to-paid flow exists |
| 3c (Email) | Product has auth, team invites, or email flows |

Run all applicable phases in parallel. If only one applies, run it alone. Do not run 3a → wait → 3b → wait → 3c sequentially when all three can run at once.

After all three complete: verify that `src/lib/supabase.ts` exists (if Phase 3a ran), `.env.example` has all required vars, and BUILD-LOG.md has entries for each completed phase.

**Phase 3 → Phase 4 dependency gate:** Before starting Phase 4, check BUILD-LOG.md for skipped phases:
- If Phase 3a was skipped (no Supabase): pages MUST NOT import from `@/lib/supabase`, `useAuth`, or `ProtectedRoute`. Remove auth-dependent pages from SCOPE.md build order and log: "Phase 3a skipped — auth pages removed from build order."
- If Phase 3b was skipped (no Stripe): pages MUST NOT import `UpgradeButton`, `PricingCards`, or reference `VITE_STRIPE_*` env vars. Remove pricing page from SCOPE.md if present.
- If Phase 3c was skipped (no email): remove any email-triggered flows from page specs (welcome email on signup, invite flows, etc.).

---

### Phase 3a — Supabase (run /web-supabase) — skip if no backend

If the product needs Supabase:
1. Get project URL and anon key via Supabase MCP. If Supabase MCP is unavailable and no project URL is known: log NEEDS_HUMAN "Provide Supabase project URL and anon key to continue Phase 3a" and skip Phase 3a entirely — do not attempt to scaffold auth without a real project URL.
2. Apply schema migrations
3. Write RLS policies for all tables
4. Generate TypeScript types
5. Write `src/lib/supabase.ts` with hardcoded values — the anon key is safe to commit (it is public by design; RLS policies enforce access control)
6. Write `useAuth` hook and `ProtectedRoute` component. ProtectedRoute must: (a) check session — redirect to `/auth` if null; (b) show a skeleton layout while session is loading; (c) check `onboarding_complete` on the org record — redirect to the onboarding route defined in SCOPE.md (field: `onboarding_route`, default `/setup`) if false. All three checks are required.
7. Write `AuthRoute` component (session-only check, no onboarding_complete guard) — wraps `/setup` and `/reset-password`
8. Register `/reset-password` route in App.tsx as a lazy-loaded stub pointing to a placeholder component — full `ResetPasswordPage.tsx` is built in Phase 4 (so it gets the per-page self-review pass). Mark it in SCOPE.md as a required auth page if not already present.

Log: "Phase 3a complete — Supabase configured" to BUILD-LOG.md.

---

### Phase 3b — Stripe (run /web-stripe) — skip if no paid plans

**How to determine if this phase runs:** Read `SCOPE.md` and look for a Monetization or Trial section. If resuming a build, also check `BUILD-LOG.md` — if it contains "Phase 3b complete", skip this phase. Run this phase if ANY of these are true:
- Trial model is `free-trial` or `paid-only`
- Any pricing tier exists beyond a permanent free plan
- SCOPE.md mentions Stripe, subscription, upgrade, or billing

Skip this phase only if the product is explicitly free with no upgrade path.

If the product has any paid plan or trial-to-paid flow:
1. Read `~/.claude/commands/web-stripe.md` in full
2. **Auto-create Stripe test price (requires STRIPE_SECRET_KEY in env):**
   **Price creation priority order (try each, use first that works):**
   1. Stripe MCP: run `mcp__plugin_stripe_stripe__authenticate` then use the Stripe MCP tools to create the product and price. This works on all platforms including Windows.
   2. Stripe CLI: `stripe --version 2>&1` — if available, use CLI commands below.
   3. curl fallback: if both MCP and CLI are unavailable, use curl (Unix/Mac only).
   4. If none work: log NEEDS_HUMAN "Create a test price in Stripe dashboard → Products → Add Product → $[amount]/month → copy price ID to VITE_STRIPE_PRO_PRICE_ID" and continue.

   **Check Stripe CLI availability first:** `stripe --version 2>&1`. If command not found: skip CLI approach, use the curl fallback below.
   If Stripe CLI is available AND `STRIPE_SECRET_KEY` is in env:
   ```bash
   stripe prices create \
     --unit-amount [price in cents from SCOPE.md, e.g. 4900 for $49] \
     --currency aud \
     --recurring[interval]=month \
     --product-data[name]="[Product Name] Pro" \
     --lookup-key "[product-slug]-pro-monthly"
   ```
   Capture the `id` field from output (format: `price_xxx`). This is `VITE_STRIPE_PRO_PRICE_ID`.
   **If Stripe CLI unavailable:** use the Stripe REST API directly to create the price:
   ```bash
   curl -s https://api.stripe.com/v1/prices \
     -u "$STRIPE_SECRET_KEY:" \
     -d "unit_amount=[price in cents]" \
     -d "currency=aud" \
     -d "recurring[interval]=month" \
     -d "product_data[name]=[Product Name] Pro"
   ```
   Capture the publishable key:
   ```bash
   # Unix/Mac:
   curl -s https://api.stripe.com/v1/account \
     -u "$STRIPE_SECRET_KEY:" \
     | grep -o '"pk_test_[^"]*"' | tr -d '"'
   ```
   **Windows (no grep/tr):** Use the Stripe MCP `authenticate` tool to connect, then get the publishable key from the Stripe dashboard at stripe.com/apikeys. Or read the full curl JSON output and extract the `pk_test_` value manually from the response.

   Write both values to `.env.local` and Vercel env vars (Phase 6c).
   If the curl returns empty: the secret key is live mode (`sk_live_`) — get the live publishable key from stripe.com/apikeys and log as NEEDS_HUMAN.
   If `STRIPE_SECRET_KEY` is not in env: log NEEDS_HUMAN: "Add STRIPE_SECRET_KEY to env — then re-run Phase 3b to auto-create price ID."
3. Create Stripe checkout session endpoint as a Supabase edge function
4. Create webhook handler — verify signature first with `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`, then handle `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Reject any request that fails signature verification with 400.
5. Write `UpgradeButton` component and `PricingCards` component
6. Wire trial banner "Upgrade now" CTA to checkout session
7. Add `VITE_STRIPE_PUBLISHABLE_KEY` + `VITE_STRIPE_PRO_PRICE_ID` to `.env.example`
8. Add webhook endpoint to `.env.example` as `STRIPE_WEBHOOK_SECRET`

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
2. Set up Resend integration as a Supabase edge function
3. Write React Email templates: welcome, trial-ending (if free-trial), team-invite (if team features), password-reset, invoice (if paid)
4. Wire welcome email to auth signup trigger (Supabase auth hook or database trigger)
5. If trial model is `free-trial`: create a Supabase edge function for trial reminders — triggered by a Vercel cron job (`/api/cron/trial-reminders`, schedule `0 9 * * *`) that queries orgs where `trial_ends_at` is 7, 3, or 1 day away.
6. Add `RESEND_API_KEY` to `.env.example`

Log NEEDS_HUMAN: "Add RESEND_API_KEY — verify sending domain at resend.com/domains before emails will deliver"

Log: "Phase 3c complete — email configured" to BUILD-LOG.md.

---

### Phase 4 — Pages (run /web-page per page, in SCOPE.md build order)

This is the core loop. For EACH page in SCOPE.md build order:

**4a. Pre-build check**
- Re-read SCOPE.md (full file) — the source of truth for page definitions and build order
- Re-read CLAUDE.md — confirm the COLOR JOB sentence and design decisions are fresh in context
- Re-read DESIGN-BRIEF.md `personality` field — this determines the tone of ALL copy on this page:
  - **Enterprise Authority**: formal, third-person, no contractions, "trusted by", compliance language
  - **Data Intelligence**: precise, numbers-forward, "powered by [N] data points", analytical tone
  - **Trusted Productivity**: friendly-professional, second-person, "your team", efficiency language
  - **Premium Professional**: clean, minimal, confident — fewer words, more whitespace
  - **Bold Operator**: punchy, short sentences, action verbs, urgency, "stop wasting time on"
  - **Health & Care**: warm, reassuring, first-person plural "we", duty-of-care language, compliance-aware
  - **Growth Engine**: optimistic, metrics-forward, "grow your", ROI language
  - **Civic/Government**: neutral, accessible, plain English, compliance-first, no marketing superlatives
- Re-read MARKET-BRIEF.md `Our differentiator` — this sentence must echo through the product, not just the landing page. Empty states, onboarding copy, and page headers should reinforce the same positioning.
- Confirm the page's design brief (purpose, data, empty state, loading state, error state, signature element) is clear before writing code

**4b. Build the page**
Read the page's section from COPY.md. Use every string from COPY.md literally — headlines, CTAs, empty states, error messages. The builder does NOT invent copy. If a string is missing from COPY.md, add it there first (maintaining personality tone), then use it. Follow /web-page rules for everything else.

**Landing page — category compliance check + targeted fixes, not full rebuild:**
The landing page was built by /web-scaffold (Phase 2). Do NOT rebuild it from scratch.
Instead: run the category compliance check below. Add any missing required sections or trust signals inline. Fix any forbidden patterns. This is targeted modification, not a rebuild.

**Step 1 — Discovery-driven content check (MARKET-BRIEF.md + DESIGN-BRIEF.md):**
Re-read MARKET-BRIEF.md and verify every discovery output is reflected in the landing page:
- [ ] Hero headline uses the `Our differentiator` sentence (or a close derivative) — NOT generic "The modern way to [verb]"
- [ ] Hero CTA label matches the proven CTA pattern from `Patterns worth adopting` (e.g. "Start Free Trial" if all competitors use free trial)
- [ ] Social proof section uses the format competitors use (logos / testimonials / stat counters / G2 badges) — from `Competitor website analysis: Social proof` column
- [ ] Feature section bullets come from `Features users consistently request` — NOT invented copy
- [ ] Competitor gaps from `Top 3 competitors: Gaps` appear as feature highlights or a "Why us" comparison row
- [ ] Pricing section structure matches `Competitor website analysis: Pricing model` pattern (free trial / freemium / demo-only)
- [ ] Tone matches DESIGN-BRIEF.md personality type throughout (formal for Enterprise Authority, punchy for Bold Operator, warm for Health & Care)

**If any of the above are NO:** rewrite that section using the MARKET-BRIEF.md data. This is the single biggest quality lever — generic copy is why products look templated.

**Step 2 — Category compliance check (from Phase 1.5):**
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
| AML/CTF | No dual-date urgency (enrolment 31 March 2026 + compliance 1 July 2026) | Add banner with both dates. After March 31 enrolment opens: update to "Enrolment is now open — comply by 1 July 2026." |
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

**Step 3 — Standard quality review:**
Run the standard 13-item per-page checklist + fresh eyes pass.
Fix any failures before moving on.

Log: "Landing page quality review — discovery check [N/7 items] + category compliance [N/N sections] + self-review passed (13/13 + fresh eyes)" to BUILD-LOG.md.

- **If Phase 3a completed (auth exists):** Auth (`/auth`) is ALWAYS first to BUILD, reset password (`/reset-password`) ALWAYS third (replace the Phase 3a stub with the full ResetPasswordPage.tsx — route wrapper: `AuthRoute`, NOT `ProtectedRoute`), onboarding (`/setup` or `/onboarding`) ALWAYS fourth. If any of these are missing from SCOPE.md, add them now.
- **If Phase 3a was skipped (no auth):** skip auth/reset-password/onboarding entirely. Build order is: `/` → app pages in SCOPE.md priority order → `/settings` (if applicable) → `/privacy` → `/terms`. Do NOT import `useAuth`, `ProtectedRoute`, or `AuthRoute` in any page.
- App pages follow in SCOPE.md priority order after onboarding
- Settings (`/settings`) is ALWAYS built after all app pages and before /privacy + /terms — mandatory for all SaaS with auth. If SCOPE.md does not include it, add it now.
- `/privacy` and `/terms` are ALWAYS last (static pages, minimal build time). Both MUST be registered as `React.lazy()` imports with `Suspense` fallback — NOT eager imports. Even though they are static, they are non-critical and should not inflate the initial bundle.

**Page type detection — read the matching skill BEFORE building each page:**

| Page type | Detection trigger | Skill to read | Self-review |
|---|---|---|---|
| Dashboard / analytics / monitoring | KPI cards, charts, metrics | `~/.claude/skills/dashboard-design/SKILL.md` | 28-item Pre-Ship Checklist (not 13-item) |
| Data table / list of records | Users, transactions, logs, resources | `~/.claude/skills/web-table/SKILL.md` | Standard 13-item |
| Settings | `/settings` route | `~/.claude/skills/web-settings/SKILL.md` | Standard 13-item |
| Onboarding wizard | `/setup` or `/onboarding` route | `~/.claude/skills/web-onboarding/SKILL.md` | Standard 13-item |

Read the skill file in full and apply ALL its rules. The skills contain the implementation details — do not duplicate them here.

**4c. Per-page self-review (two passes — not one)**

Pass 1 — checklist: for dashboard pages, run the 28-item Pre-Ship Checklist from the dashboard-design skill (as specified in Phase 4b dashboard detection) — not the standard 13-item checklist. For all other pages, run the 13-item checklist from premium-website.md. Fix any failures inline before moving on.

Pass 1.5 — React key hygiene check: grep the page component for `.map(` and verify EVERY render call uses a stable identity key — never `key={index}`. Acceptable: `key={item.id}`, `key={item.slug}`, `key={label}`, `` key={`star-${i}`} ``. If any `.map(` uses `key={i}` or `key={index}`: fix it before marking the page complete.

Pass 2 — fresh eyes: re-read the page component from line 1 as if you are a new user opening this product for the first time with zero data. Ask:
- Would I know what to do on this page right now?
- Does the empty state give me a reason to act (not just explain why it's empty)?
- Does the loading state feel intentional or like something broke?
- Is the signature color doing exactly one job on this page?
- Would I be embarrassed to show this to a designer?
- **Anti-generic check**: grep this page for these phrases — if ANY appear, rewrite using MARKET-BRIEF.md data:
  - "The modern way to" / "Streamline your" / "All-in-one" / "Powerful yet simple" / "Take control of"
  - "AI-powered" (unless the product's core feature is literally AI)
  - "Lorem ipsum" or placeholder text of any kind
  - Button labels that say "Learn More" or "Get Started" without specificity — should reference the actual action ("Start 14-day trial" / "Create your first [entity]")

Fix anything that fails Pass 2. Log: "Page [name] complete — self-review passed (13/13 + fresh eyes)" to BUILD-LOG.md. **This per-page log entry is critical for session resume** — if the context window resets mid-Phase 4, the next session reads BUILD-LOG.md to identify which pages are already built and skips them. Only then move to the next page.

**4d. Context refresh (every 3 pages)**
After completing every 3rd page (i.e. pages 3, 6, 9...), re-read DESIGN-BRIEF.md and SCOPE.md in full before starting the next page. Long build sessions compress early context — this prevents late pages drifting from the locked design contract.

**Per-page route registration**
After each page, add the route with React.lazy + Suspense. Never leave routes unregistered.

**4e. Route reconciliation (final Phase 4 step, runs before "Phase 4 complete" is logged):**
1. Read the app-tier page inventory from SCOPE.md
2. Grep `src/App.tsx` for React.lazy route definitions
3. For every app-tier page in SCOPE.md: verify a matching lazy-loaded `<Route>` exists in App.tsx
4. If any SCOPE.md page has no route: write the missing import and `<Route>` entry now
5. Do NOT log "Phase 4 complete" until every SCOPE.md app-tier page has a route in App.tsx

**4f. Phase 4 overall review gate:**
Before logging Phase 4 complete, run the overall Phase 4 gate from the Phase Completion Protocol table: verify all SCOPE.md pages built, all routes reconciled, `npm run build` exits 0. Fix any failures. Only then log and commit.

Log: "Phase 4 complete — all pages built, routes reconciled, build clean" to BUILD-LOG.md.

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

### Phase 5 — Quality Gate (review-fix loop)

This is an explicit loop. Run it until the product passes or you hit 5 attempts.

**Scoring note:** Phase 5 uses `/web-review` (x/40) — a web-specific visual + a11y + performance gate. This is different from `/review` (x/100) which is a code-depth audit covering security, correctness, and maintainability. Use /web-review here. Optionally run /review separately as an additional code audit — its score does not replace or gate deploy.

**Pre-loop: discovery alignment check + web-review.md verification.**

Before scoring, re-read MARKET-BRIEF.md and DESIGN-BRIEF.md. Spot-check 2 pages (landing page + one app page) against:
- [ ] Copy tone matches DESIGN-BRIEF.md personality type (not generic SaaS)
- [ ] Hero headline derives from MARKET-BRIEF.md `Our differentiator` (not "The modern way to...")
- [ ] Component choices match DESIGN-BRIEF.md Component Lock table (not substituted)
- [ ] Color system uses only the locked brand HSL — zero hardcoded hex outside the design system

If 2+ checks fail: fix BEFORE entering the scoring loop. These are design contract violations that /web-review won't catch because web-review scores structure and a11y, not brand fidelity.

Read `~/.claude/commands/web-review.md`. If it does not exist: use the fallback scoring method below. If it exists: check that it references the same scoring dimensions as premium-website.md (13-item per-page checklist + pre-deploy checklist). If web-review.md references checks that don't exist in premium-website.md or vice versa, log the discrepancy to BUILD-LOG.md and use the fallback scoring.

**Loop:**
1. Run the full /web-review audit by reading `~/.claude/commands/web-review.md` and following it exactly — it outputs `Overall: [X]/40`.
   Fallback (if web-review.md is somehow unavailable): score = 40 minus (count of failed items in the 13-item per-page checklist across all pages, plus count of red items in the pre-deploy checklist). Each failure = -1. Document every failure explicitly.
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

**First: confirm the Vercel project exists.** Via MCP: check if a project named `[product-slug]` already exists. If not, create it first before deploying — never deploy to a non-existent project.


Use the `vercel` MCP server (preferred — no CLI auth issues on Windows):
- Call `createDeployment` with `target: production`
- Capture the production URL from the response

Fallback if MCP unavailable:
```bash
npx vercel --prod --yes
```

**6c. Set all env vars in Vercel**

Use the `vercel` MCP `addEnvVar` tool for each var in `.env.example` with `target: production`. Skip vars with blank placeholder values (e.g. `VITE_SENTRY_DSN=`, `STRIPE_WEBHOOK_SECRET=` with no value) — only set vars that have actual values.

Fallback if MCP unavailable:
```bash
npx vercel env add [VAR_NAME] production --value [value] --yes
```

**Redeploy after env vars are set.** Env vars set after the initial deploy do not take effect until the next deploy. Trigger a redeploy:
```bash
npx vercel --prod --yes
```
Or via Vercel MCP redeploy. Do not skip — without this, the app launches with empty VITE_API_URL, VITE_STRIPE_PUBLISHABLE_KEY, and VITE_SENTRY_DSN.

**Parallelise 6d + 6f:** Start the bundle audit (6f) at the same time as setting up the smoke test user (6d Step 1). Bundle analysis does not require a live test session, and test user creation does not require the bundle report. Merge both outputs before deciding whether to deploy-fix.

**6d. Automated smoke test (agent-browser — no human required)**

Read SCOPE.md to get: the product name, the primary CTA label, the onboarding route, and the core feature page route.

**Step 1 — Create a test user via Supabase MCP (bypasses email confirmation):**
```
supabase.auth.admin.createUser({
  email: "smoke-test+[unix-epoch-seconds, e.g. $(date +%s)]@[product-slug].test",
  password: "SmokeTest123!",
  email_confirm: true
})
```
Save the returned user ID for cleanup.
If Supabase MCP is unavailable: log NEEDS_HUMAN "Create a test account manually at [production-url]/auth to run smoke test, then delete it after. Supabase MCP was unavailable for automated test user creation." and skip to Step 2 using a manually-created account — do not block Phase 6d entirely.

**Step 2 — Run the browser sequence via the `agent-browser` Skill:**
Invoke agent-browser via the Skill tool (it is NOT a bash CLI command). The sequence to execute covers 10 checks:

1. Open [production-url] — verify landing page loads, hero text "[product name]" visible, CTA "[CTA label from SCOPE.md]" visible
2. Click CTA — verify navigation to /auth
3. Sign in with test user credentials — verify redirect to [onboarding-route]
4. Click through all onboarding wizard steps — verify redirect to [main-app-route] on completion
5. Verify trial banner visible ("days remaining" text) — skip if trial model is not free-trial
6. Open [production-url]/[core-feature-route] — verify empty state with CTA renders (not blank)
7. Open [production-url]/settings — verify "Profile" tab visible
8. Open [production-url]/privacy — verify page loads without 404
9. Open [production-url]/terms — verify page loads without 404
10. Set viewport to 375px, open [production-url] — verify no horizontal overflow, hero readable

Take a screenshot at each step for the record.

**Step 3 — For each failed check:** use /web-fix with the exact failure description, then re-verify that specific check manually or via agent-browser before marking it passed. Do not mark smoke test done until all 10 checks pass.

If agent-browser is unavailable: log NEEDS_HUMAN "Run Phase 6d smoke test manually - sign in at [production-url], complete onboarding, verify trial banner, check all routes. agent-browser was unavailable." and proceed to Phase 6e.

**Step 4 — Clean up test user via Supabase MCP:**
```
supabase.auth.admin.deleteUser([saved-user-id])
```

Log: "Phase 6d smoke test complete — all checks passed" to BUILD-LOG.md.

**6e. Supabase CORS**
No separate CORS step needed — Supabase handles CORS automatically. The Supabase anon key + RLS policies enforce access control. No Railway, no FastAPI, no separate backend to configure.

**6f. Bundle audit and auto-fix**

Run build and capture output:
```bash
npm run build 2>&1
```
Parse the output for chunk sizes (lines containing `.js`, `.css`, or `gzip`). On Windows without grep, read the full build output directly — the chunk sizes are printed by Vite at the end of the build.

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

**What counts as a P2 gap (Design/Code quality — fix after P1):**
- Hardcoded hex colors (zero hardcoded hex/rgb in any component)

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
- og:image still using placeholder — re-run Phase 2 icon generation block to auto-generate og-image.jpg
- Landing page missing FAQ section (LLM citability — AIs cite pages with Q&A)
- Landing page missing comparison table vs competitors
- No analytics snippet (Google Analytics or PostHog) in index.html
- No structured data (JSON-LD schema) on landing page
- sitemap.xml domain is still placeholder — needs updating once domain is live

**What counts as a P4 gap (Nice-to-have):**
- Dark mode toggle not accessible in AppLayout header
- CMD+K palette not implemented (product has 8+ nav items)
- PWA icons (icon-192.png, icon-512.png) need replacing with brand-accurate version (auto-generated in Phase 2 but may need refinement)
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

**8a. Domain availability check**

Infer the desired domain from the product name in SCOPE.md. Log to BUILD-LOG.md:
```
NEEDS_HUMAN: Check domain availability for [product-slug].com.au and [product-slug].com
  - Search: godaddy.com/domainsearch/find?domainToCheck=[product-slug].com.au
  - After purchase: point DNS A record → 76.76.21.21, then add custom domain in Vercel dashboard
```

**8b. Write final BUILD-LOG.md entry:**

```markdown
## Build Complete — [timestamp]

**Product:** [name]
**URL:** [production Vercel URL]
**Score:** [web-review score]/40

### Domain
- [product-slug].com.au — [AVAILABLE / NOT AVAILABLE]
- [product-slug].com — [AVAILABLE / NOT AVAILABLE]
- Purchase link: godaddy.com/domainsearch/find?domainToCheck=[product-slug].com.au
- After purchase: point DNS A record → 76.76.21.21, add domain in Vercel dashboard

### What was built
[list of all pages]

### Remaining human actions required
- [ ] Purchase domain (link above) and point DNS to Vercel
- [ ] Switch Stripe to live mode: stripe.com/dashboard → Products → copy live price IDs → update Vercel env vars
- [ ] [any other NEEDS_HUMAN items from this build]

### Architecture notes
[anything non-obvious about the build that future sessions should know]
```

**8c. Push build summary to Notion via `/project-refresh` PUSH mode.**
Updates the project's Notion master doc with deploy URL, review score, and remaining human actions — required for cross-session context.

---

## Stop Conditions (the only times autonomous execution pauses)

| Condition | Action |
|---|---|
| Domain registration needed | Log NEEDS_HUMAN with purchase link (Phase 8a), continue with .vercel.app URL |
| Stripe live price IDs needed | Log as NEEDS_HUMAN with test prices in place |
| Supabase project URL needed | Log as NEEDS_HUMAN, document which env vars to set |
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
