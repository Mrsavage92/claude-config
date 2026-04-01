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

### Mid-Session Context Refresh

After every 10 user messages within a build session:
- Re-read BUILD-LOG.md
- Run `/project-refresh` PULL to check if Notion has been updated externally

This prevents long sessions from drifting away from the locked decisions.

### Repo Creation Rule (fresh builds only)

If no GitHub repo exists for this product: create it in Phase 0 before writing any files. A build with no repo has no persistent context. See Phase 0 for the creation steps.

---

## Autonomous Build Loop

### Phase 0 — Orient

Read these files in full — they are the source of truth for the entire build. Run all reads in parallel:
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
- **Scaffold copy cleanup (MANDATORY if the app directory was created by copying another product's directory):** Before writing any content, run these checks in `apps/[product-slug]/`:
  1. Delete `.vercel/project.json` if it exists — it points to the source product's Vercel project and will silently deploy to the wrong project on first deploy. Vercel creates a fresh `project.json` automatically on next deploy.
  2. Grep for the source product's `product_id` string (e.g. `whs-psychosocial`) across all src files and replace all occurrences with the new product's id.
  3. Check `src/styles/index.css` for the old `--brand:` HSL value and replace with the new product's brand colour.
  4. Grep `src/pages/*.tsx` for any imported type names that have been removed from `src/types/index.ts`. TypeScript compiles ALL files in the project, not just routes imported in App.tsx — orphan pages with deleted type imports will fail `tsc --noEmit` even if they are unreachable at runtime. Stub those files to `// Unused - replaced by [NewPage].tsx\nexport {}` immediately.

Check if BUILD-LOG.md exists in the project root (or `apps/[product-slug]/BUILD-LOG.md` in monorepo). This is the primary resume signal — not git log.

If BUILD-LOG.md does not exist: this is a fresh start. Begin at Phase 0.25.
If BUILD-LOG.md exists: read it to identify the last completed phase, then continue from the next one. If resuming from Phase 1 or later, verify DESIGN-BRIEF.md exists — if missing, run Phase 0.5 before continuing. Also verify MARKET-BRIEF.md exists — if missing, run Phase 0.25 before continuing.

**If resuming (BUILD-LOG.md exists): also run `/project-refresh` PULL now before continuing.** Pull Notion state into context — decisions, blockers, and credential status may have changed since the last session.

Log every phase start and completion to `BUILD-LOG.md` in the project root (or `apps/[product-slug]/BUILD-LOG.md` in monorepo mode).

### Phase 0 — GitHub Repo + Notion Doc (fresh builds only)

**For fresh builds (no BUILD-LOG.md), do this before Phase 0.25. For resuming builds, verify these exist and skip if already done.**

**Step A — Create GitHub repo:**

Check if a repo exists for this product:
```
mcp__plugin_github_github__search_repositories query:"[product-slug] user:Mrsavage92"
```

If no repo found: create it:
```
mcp__plugin_github_github__create_repository name="[product-slug]" description="[product name] — AU compliance SaaS" private=true auto_init=true
```

In monorepo mode: skip repo creation — the monorepo (`saas-platform` or `au-compliance-platform`) is already the repo. Just verify the `apps/[product-slug]/` directory will be committed there.

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

Every time a "Log: Phase X complete" line is reached:
1. Write the log entry to BUILD-LOG.md
2. `git add -A && git commit -m "phase X: [one-line description]" && git push origin main`
3. Run `/project-refresh` PUSH with phase name + what was built + any new NEEDS_HUMAN items

This is not optional. A phase not committed and not in Notion does not exist from the next session's perspective.

In monorepo mode: commit from the monorepo root (`C:/Users/Adam/Documents/au-compliance-platform`), not the app subdirectory.

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

Read `~/.claude/skills/web-design-research/SKILL.md` in full and execute all 10 steps:

1. **Personality** — classify product into one of 8 types (Enterprise Authority / Data Intelligence / Trusted Productivity / Premium Professional / Bold Operator / Health & Care / Growth Engine / Civic/Government)
2. **Product category** — identify the product category (from PRODUCT-CATEGORY-LIBRARY.md categories 1-8): Reputation/Reviews, Entity Intelligence, Regulatory Compliance, Procurement Intelligence, Practice Management, HR/People Ops, Finance/Accounting, Document Management. This determines the landing page structure — it is separate from personality type and supersedes the generic dark SaaS template.
3. **Category-specific competitor research** — look at 3 direct competitors IN THE SAME CATEGORY (not just "enterprise dark SaaS" broadly). For reputation tools, study BirdEye/Podium. For WHS tools, study SafetyCulture/FlourishDx. For tender tools, study Tendertrace/TenderPilot. Generic "B2B SaaS design inspiration" is not sufficient. If MARKET-BRIEF.md exists and has category-specific research, read it instead. If not, run 3 WebSearch queries: "[product category] software Australia landing page," "[top competitor] homepage," "[product category] SaaS design pattern."
4. **Category hero override** — after competitor research, check if the category has a mandatory hero pattern in PRODUCT-CATEGORY-LIBRARY.md. If yes, lock this as the hero architecture. The generic dark animated hero is WRONG for: WHS tools (light-mode field tools), entity intelligence (search-bar-first), AML/CTF (deadline-urgency banner). Write the override to DESIGN-BRIEF.md.
5. **Color system** — select from personality palette library. Explicitly reject hsl(213 94% 58%). **Monorepo cross-check:** grep `apps/*/DESIGN-BRIEF.md` AND `apps/*/src/styles/index.css` for existing `--brand:` values — if same hue (±15 degrees) already used in either file, pick different palette and document why. (DESIGN-BRIEF.md may be stale or missing; index.css is the ground truth for what colour is actually deployed.) **Category check:** WHS/health tools should NOT use dark-first. Regulatory compliance tools should NOT use bold consumer colors. Cross-check against category conventions.
6. **Typography lock** — select font pairing per personality type (not just "Inter"). Lock heading weight and tracking.
7. **Hero architecture** — choose pattern: Centered / Split-pane / Full-screen immersive / Minimal editorial. Tie choice to personality + user type + category convention. The category hero pattern (from step 4) overrides this if it specifies a mandatory pattern.
6. **Component Lock** — run `mcp__magic__21st_magic_component_inspiration` for ALL 11 mandatory sections using personality-specific search terms (not generic "dark SaaS"). Apply selection criteria (visual weight, animation level, layout) to pick the right variant for each. If MCP unavailable: use defaults from Component Registry in `premium-website.md` and continue. Record all choices in DESIGN-BRIEF.md Component Lock table.
7. **LottieFiles** — find 3 product-specific animations (empty state, success state, processing state). WebSearch `"lottiefiles.com [product-category] animation"`. Note "unavailable" if nothing fits — do not block.
8. **Differentiation audit** — grep recent `apps/*/DESIGN-BRIEF.md` files, confirm 3+ dimensions differ from last build (color, hero pattern, features layout).
9. **Marketing tier** — choose Tier 1/2/3. Default: Tier 2 (/, /features, /pricing, /auth as separate routes).
10. **Write DESIGN-BRIEF.md** — must include: Product Personality, Color System, Typography, Hero Architecture, Component Lock table (all 11 sections), LottieFiles, Differentiation Audit, Marketing Structure, Build Order.

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

### Phase 1.5 — Product Category Detection

**Run this phase between Phase 1 (Scope) and Phase 2 (Scaffold). It is not optional.**

Read SCOPE.md and MARKET-BRIEF.md. Classify the product into exactly one of these 8 categories from `PRODUCT-CATEGORY-LIBRARY.md` (located at the monorepo root, or `C:\Users\Adam\Documents\au-compliance-platform\PRODUCT-CATEGORY-LIBRARY.md`):

1. **Reputation/Reviews** — RepuTrack, BirdEye type
2. **Entity/Company Intelligence** — CorpWatch, Crunchbase type
3. **Regulatory Compliance** — AML/CTF, WHS, NDIS, Privacy Act type
4. **Procurement Intelligence** — TenderWatch type
5. **Practice Management** — Migration Agents, Aged Care type
6. **HR/People Ops** — leave management, onboarding, performance type
7. **Finance/Accounting** — cashflow, BAS, reconciliation type
8. **Document Management** — records, version control, audit trail type

**Detection rules (keyword matching in SCOPE.md + product brief):**

| Keywords found | Category |
|---|---|
| reviews, reputation, rating, review management, star rating | Reputation/Reviews |
| ASIC, ABN, company search, company intelligence, director, entity verification | Entity/Company Intelligence |
| AML, CTF, AUSTRAC, KYC, sanctions, WHS, psychosocial, hazard, NDIS, incident, aged care, migration agent, Privacy Act | Regulatory Compliance |
| tender, procurement, government contract, AusTender, BuyNSW, bid, watchlist | Procurement Intelligence |
| visa, case management, participant, resident, practitioner, MARA | Practice Management |
| leave, onboarding, performance review, payroll, WGEA, employees, rostering | HR/People Ops |
| BAS, cashflow, reconciliation, invoicing, Xero, MYOB, accounting | Finance/Accounting |
| document register, version control, policy library, records management, audit trail | Document Management |

**If multiple categories match:** pick the most specific one. "WHS psychosocial hazard register" = Regulatory Compliance, not Document Management even though it involves documents.

**After detection — mandatory steps:**

1. Read the full category entry from `PRODUCT-CATEGORY-LIBRARY.md` for the detected category.

2. **Override hero pattern** — the hero pattern from PRODUCT-CATEGORY-LIBRARY.md OVERRIDES the default dark animated hero from the generic scaffold. Write the overridden hero pattern to DESIGN-BRIEF.md under a new field: `hero_override`. Log the override with reasoning: "Hero override: [category hero pattern] — overrides default dark animated hero because [reason]."

3. **Load required sections checklist** — copy the "Required Landing Sections (in order)" list from the category entry into BUILD-LOG.md as a checklist. This list is NON-NEGOTIABLE for Phase 4 (landing page build). Phase 4 must verify every section is present before marking the landing page complete.

4. **Set UX dominant pattern** — the UX dominant pattern from the category entry determines the first app page's primary UI metaphor. Write to BUILD-LOG.md: "UX pattern: [pattern] — first app view must reflect this." This overrides defaulting to a KPI dashboard.

5. **Flag trust signals** — list the trust signals required for this category in BUILD-LOG.md. Phase 4 (landing page) must include all of them. Phase 6 (/web-review) checks for their presence.

6. **Flag mobile requirements** — if the category is CRITICAL or HIGH mobile, add to BUILD-LOG.md: "Mobile requirement: [level] — sidebar must be bottom nav on mobile / touch targets must be 44px minimum."

7. **Flag forbidden patterns** — copy the "Forbidden landing patterns" list from the category into BUILD-LOG.md. These are automatic failures in Phase 5 (/web-review).

8. **Check for Regulatory Compliance sub-type** — if category is Regulatory Compliance, detect the sub-type:
   - Keywords: AML, CTF, AUSTRAC, KYC, sanctions, money laundering → Sub-type 3A (Financial Crime)
   - Keywords: WHS, psychosocial, hazard, SafeWork, WorkSafe → Sub-type 3B (Workplace Safety)
   - Keywords: NDIS, participant, provider → Sub-type: NDIS
   - Keywords: aged care, ACQSC, resident → Sub-type: Aged Care
   - Load the sub-type entry from PRODUCT-CATEGORY-LIBRARY.md, not the generic Category 3 entry.

Write to BUILD-LOG.md:
```
Phase 1.5 complete — Product category detected: [category name]
Hero override: [description from PRODUCT-CATEGORY-LIBRARY.md]
UX pattern: [pattern]
Required sections: [count] sections loaded to checklist
Forbidden patterns: [count] loaded
Trust signals required: [list]
Mobile requirement: [LOW/MEDIUM/HIGH/CRITICAL]
```

Log: "Phase 1.5 complete — category [name] detected and rules loaded" to BUILD-LOG.md.

---

### Phase 2 — Scaffold (run /web-scaffold)

Execute the full /web-scaffold process using decisions from SCOPE.md and DESIGN-BRIEF.md:
0. **Read DESIGN-BRIEF.md Component Lock table** — every landing page section has a specific 21st.dev component assigned. Use these during the landing page build. Do NOT re-run MCP queries.
1. Generate all foundation files (package.json, tsconfig, vite.config, tailwind.config, index.css, main.tsx, App.tsx, CLAUDE.md)
2. Apply bundle splitting from premium-website performance rules (vendor-react, vendor-motion, vendor-query, vendor-supabase chunks)
3. tsconfig.json MUST include `"types": ["vite/client"]`
4. CLAUDE.md MUST include: color job definition, design reference site, page inventory summary
5. AppLayout MUST include skip-nav link as first element. LandingNav (the public landing page header) MUST ALSO include a skip-nav link as its first child, targeting `#main-content`. LandingHero `<section>` MUST have `id="main-content"` on its root element — the skip-nav target must exist.
5a. SVG gradient stops MUST use the React `style` prop for CSS variables — NOT presentation attributes. Correct: `<stop style={{ stopColor: 'hsl(var(--brand))', stopOpacity: 0.55 }} />`. Wrong: `<stop stopColor="hsl(148, 60%, 45%)" />`. CSS variables are NOT resolved in SVG presentation attributes — only in inline `style`.
6. Generate vercel.json with SPA rewrites at project root
7. Run install commands. If any command exits non-zero: read the full error output, fix the root cause (wrong Node version, missing lockfile, network issue), retry once. If retry fails, log STUCK with exact error and stop.
```bash
npm install
npx shadcn@latest init
npx shadcn@latest add button input label card dialog dropdown-menu sheet sonner separator badge skeleton avatar tabs table select textarea switch radio-group checkbox
npm install @sentry/react
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
10. Create `src/hooks/useSeo.ts` — sets `document.title` and `<meta name="description">` via useEffect. MUST accept both object form `({ title, description?, noIndex? })` AND positional form `(title: string, description?: string)` via a union type overload — scaffold copies will use one form, page authors the other, and a mismatch causes silent TypeScript errors:
    ```ts
    type SeoOptions = { title: string; description?: string; noIndex?: boolean }
    export function useSeo(options: SeoOptions | string, description?: string) {
      const title = typeof options === 'string' ? options : options.title
      const desc = typeof options === 'string' ? description : options.description
      useEffect(() => {
        document.title = `${title} | [Product Name]`
        const meta = document.querySelector('meta[name="description"]')
        if (meta) meta.setAttribute('content', desc ?? '')
      }, [title, desc])
    }
    ```
    Call on every page.
11. Add OG + Twitter meta tags to `index.html`: `og:title`, `og:description`, `og:image` (set to `/og-image.jpg` — auto-generated in step 14 below), `twitter:card`.
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
   Add `<link rel="manifest" href="/site.webmanifest">` and `<link rel="apple-touch-icon" href="/icon-192.png">` to `index.html`.

   **Auto-generate icons via ai-image-generation skill (no human required):**

   Before writing the prompt: read DESIGN-BRIEF.md to extract (a) the exact primary color HSL value, (b) the product personality type, and (c) the product's core action/metaphor (what does it fundamentally DO — track, connect, analyse, protect, automate?).

   Construct a craft-level prompt using this template:
   ```
   App icon for [Product Name]. [One sentence: what the product does, who it's for].
   Visual concept: [specific metaphor derived from core action — e.g. "an upward arrow dissolving into data points" for analytics, "a shield with a circuit line" for security, "interlocking gears morphing into a checkmark" for workflow automation].
   Style: flat vector, ultra-clean, [personality adjective from DESIGN-BRIEF — e.g. "precision enterprise" / "bold consumer" / "calm healthcare"].
   Color: [primary HSL from DESIGN-BRIEF] icon on #0a0a0a background, subtle inner glow matching primary color.
   Quality reference: Stripe, Linear, Vercel app icon aesthetic — not generic, not clipart.
   Format: square, centered, 10% padding from edge. No text. No gradients unless glassy/frosted effect.
   ```

   Run with Seedream 4.5 for maximum quality. The command outputs JSON — extract the URL with jq:
   ```bash
   ICON_URL=$(infsh app run bytedance/seedream-4-5 --input '{"prompt": "[constructed prompt above]"}' | jq -r '.output // .images[0].url // .image_url // empty')
   ```

   If ICON_URL is non-empty, download to /public:
   ```bash
   curl -sL "$ICON_URL" -o public/icon-512.png
   cp public/icon-512.png public/icon-192.png
   ```

   Update site.webmanifest to include both: `"icons": [{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }, { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }]`

   **Also generate the OG social image** (replaces the 1200x630 placeholder set in step 11):
   Write a second prompt for a wide-format hero: same brand colors and visual metaphor, but landscape layout showing the product in context — dashboard mockup, key UI element, or abstract brand scene. Aspect ratio 1200x630.
   ```bash
   OG_URL=$(infsh app run xai/grok-imagine-image --input '{"prompt": "[og-hero-prompt]", "aspect_ratio": "16:9"}' | jq -r '.output // .images[0].url // .image_url // empty')
   [ -n "$OG_URL" ] && curl -sL "$OG_URL" -o public/og-image.jpg
   ```
   Update index.html og:image to `/og-image.jpg` if downloaded successfully.

   > **Platform note (Windows):** The `jq`, `curl`, and `cp` commands above are Unix/Mac only. On Windows without WSL, skip the download steps and log NEEDS_HUMAN "Download icon from ICON_URL to public/icon-512.png and public/icon-192.png manually" then continue.

   If infsh is unavailable or ICON_URL is empty: run the `/ai-image-generation` skill with the same constructed prompt to generate and download the icon. If that also fails: log NEEDS_HUMAN: "Add icon-192.png, icon-512.png, and og-image.jpg to /public." and continue.
15. Initialise Sentry in `main.tsx` conditionally — only if `VITE_SENTRY_DSN` is set, so local dev and deploys without a Sentry project don't silently fail:
   ```ts
   if (import.meta.env.VITE_SENTRY_DSN) {
     Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN })
   }
   ```
   Wrap `<App />` with `<Sentry.ErrorBoundary fallback={<p>Something went wrong</p>}>`. Add `VITE_SENTRY_DSN=` (blank, optional) to `.env.example` with comment: `# Get from sentry.io — create project → Client Keys → DSN`.

Log: "Phase 2 complete — scaffold generated" to BUILD-LOG.md.

---

### Phase 3 — Backend Setup (parallel dispatch)

Phases 3a, 3b, and 3c are independent of each other — Supabase schema, Stripe price creation, and email template setup do not depend on each other's outputs. Determine which apply (read SCOPE.md for monetization model and email requirements), then dispatch all applicable phases simultaneously:

| Phase | Condition to run |
|---|---|
| 3a (Supabase) | Product needs auth or database |
| 3b (Stripe) | Any paid plan or trial-to-paid flow exists |
| 3c (Email) | Product has auth, team invites, or email flows |

Run all applicable phases in parallel. If only one applies, run it alone. Do not run 3a → wait → 3b → wait → 3c sequentially when all three can run at once.

After all three complete: verify that `src/lib/supabase.ts` exists (if Phase 3 ran), `.env.example` has all required vars, and BUILD-LOG.md has entries for each completed phase.

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

If FastAPI backend: note the Railway service URL needed in BUILD-LOG.md as a blocker item for the user. The FastAPI service itself is pre-existing in `services/api/` — do not scaffold a new one.

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
   curl -s https://api.stripe.com/v1/account \
     -u "$STRIPE_SECRET_KEY:" \
     | grep -o '"pk_test_[^"]*"' | tr -d '"'
   ```
   Write both values to `.env.local` and Vercel env vars (Phase 6c).
   If the curl returns empty: the secret key is live mode (`sk_live_`) — get the live publishable key from stripe.com/apikeys and log as NEEDS_HUMAN.
   If `STRIPE_SECRET_KEY` is not in env: log NEEDS_HUMAN: "Add STRIPE_SECRET_KEY to env — then re-run Phase 3b to auto-create price ID."
3. Create Stripe checkout session endpoint in FastAPI (or Supabase edge function for standalone)
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
2. Set up Resend integration in `services/api/email_service.py` (or equivalent)
3. Write React Email templates: welcome, trial-ending (if free-trial), team-invite (if team features), password-reset, invoice (if paid)
4. Wire welcome email to auth signup trigger
5. If trial model is `free-trial`: write `services/api/trial_reminders.py` — cron job that queries orgs where `trial_ends_at` is 7, 3, or 1 day away and sends the trial-ending template. Deploy as Railway cron (`0 9 * * *`).
6. Add `RESEND_API_KEY` to `.env.example`

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
Follow /web-page rules.

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

Pass 1 — checklist: for dashboard pages, run the 28-item Pre-Ship Checklist from the dashboard-design skill (as specified in Phase 4b dashboard detection) — not the standard 13-item checklist. For all other pages, run the 13-item checklist from premium-website.md. Fix any failures inline before moving on.

Pass 1.5 — React key hygiene check: grep the page component for `.map(` and verify EVERY render call uses a stable identity key — never `key={index}`. Acceptable: `key={item.id}`, `key={item.slug}`, `key={label}`, `` key={`star-${i}`} ``. If any `.map(` uses `key={i}` or `key={index}`: fix it before marking the page complete.

Pass 2 — fresh eyes: re-read the page component from line 1 as if you are a new user opening this product for the first time with zero data. Ask:
- Would I know what to do on this page right now?
- Does the empty state give me a reason to act (not just explain why it's empty)?
- Does the loading state feel intentional or like something broke?
- Is the signature color doing exactly one job on this page?
- Would I be embarrassed to show this to a designer?

Fix anything that fails Pass 2. Log: "Page [name] complete — self-review passed (13/13 + fresh eyes)" to BUILD-LOG.md. Only then move to the next page.

**4d. Context refresh (every 3 pages)**
After completing every 3rd page (i.e. pages 3, 6, 9...), re-read DESIGN-BRIEF.md and SCOPE.md in full before starting the next page. Long build sessions compress early context — this prevents late pages drifting from the locked design contract.

**Per-page route registration**
After each page, add the route with React.lazy + Suspense. Never leave routes unregistered.

Log: "Phase 4 complete — all pages built" to BUILD-LOG.md once every page in the SCOPE.md inventory has been built and self-reviewed.

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

### Phase 5 — Quality Gate (review-fix loop)

This is an explicit loop. Run it until the product passes or you hit 5 attempts.

**Scoring note:** Phase 5 uses `/web-review` (x/40) — a web-specific visual + a11y + performance gate. This is different from `/review` (x/100) which is a code-depth audit covering security, correctness, and maintainability. Use /web-review here. Optionally run /review separately as an additional code audit — its score does not replace or gate deploy.

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

**Monorepo: check for stale `.vercel/project.json`.** Before deploying, check if `apps/[product-slug]/.vercel/project.json` exists. If it does, read it and verify the `projectId` matches a project named `[product-slug]` (not another product). If the project name doesn't match, delete the file — it was inherited from a scaffold copy and will deploy to the wrong Vercel project. After deleting, Vercel will create a fresh one pointing to the correct project.

Use the `vercel` MCP server (preferred — no CLI auth issues on Windows):
- Call `createDeployment` with `target: production`
- For monorepo: set `rootDirectory: apps/[product-slug]`
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

VITE_API_URL is required if there is a backend — set it now, not later.

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

**6e. Update CORS**
In monorepo mode: append the new Vercel URL to the existing comma-separated `FRONTEND_URL` env var in Railway — do not replace existing product URLs. In standalone mode: set `FRONTEND_URL` to the production Vercel URL. Either way, backend CORS must never be `*` in production.

Use the Railway GraphQL mutation to update the env var (see `~/.claude/projects/C--Users-Adam/memory/reference_railway.md` for the `upsertVariable` mutation template and service/env IDs — if that path does not exist on this machine, check `~/.claude/projects/*/memory/reference_railway.md`). If Railway MCP is unavailable: log NEEDS_HUMAN "Update FRONTEND_URL in Railway dashboard to include [production-url] — required for CORS."

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

**8a. Domain availability check (GoDaddy MCP)**

Infer the desired domain from the product name in SCOPE.md. Check both .com.au and .com variants:
```
mcp__claude_ai_GoDaddy__domains_check_availability({ domain: "[product-slug].com.au" })
mcp__claude_ai_GoDaddy__domains_check_availability({ domain: "[product-slug].com" })
```

If available: log to BUILD-LOG.md: "Domain [name] is available — purchase at godaddy.com/domainsearch/find?domainToCheck=[name] then point DNS A record to Vercel IP: 76.76.21.21"

If not available: call `mcp__claude_ai_GoDaddy__domains_suggest({ query: "[product-slug]", country: "AU", limit: 5 })` and log the top 3 available alternatives to BUILD-LOG.md.

If GoDaddy MCP is unavailable: log to BUILD-LOG.md: "Domain check skipped - GoDaddy MCP unavailable. Check [product-slug].com.au and [product-slug].com manually at godaddy.com" and proceed to Phase 8b.

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
| Domain registration needed | Check availability via GoDaddy MCP (Phase 8a), log purchase link, continue with .vercel.app URL |
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
