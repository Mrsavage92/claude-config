# Premium Website Suite

## Replication Mode Override (read FIRST)

If `tokens.lock.json` exists at the project root, OR the user has invoked `/style-mirror`, OR the user message contains "mirror"/"look like"/"match this site"/"replicate"/"copy the style of" with a target URL — this entire suite operates in **replication mode**:

- The "Mandatory sections" list (Banner→Nav→Hero→Logos→Stats→Features→Testimonials→Pricing→FAQ→CTA→Footer) is **SUSPENDED**. Use only the section structure the reference actually has. Do NOT invent missing sections to satisfy the suite.
- The "every section sourced from 21st.dev" rule is **SUSPENDED**. Do NOT call `mcp__magic__21st_magic_component_inspiration` or `mcp__magic__21st_magic_component_builder` during build. Build to match the reference's actual layout.
- The Component Lock in DESIGN-BRIEF.md is **SUSPENDED** (or never produced). The lock file `tokens.lock.json` is the contract.
- Animated background, product mockup, STAGGER hero entrance, InfiniteSlider logo cloud, CountUp stats, BentoGrid features, TestimonialSlider, FAQ minimum count — all suspended unless the reference has the equivalent.
- Color discipline (2 brand uses per page max), enterprise restraint, "every page has a CTA" — suspended in favor of the reference's actual choices.
- The 38/40 quality gate is suspended. The new gate is **per-section computed-style match against the reference** (see style-mirror Step 6b).
- Phase 0.5 / `/web-design-research` does not run. Replication has no "research" phase — extraction is the research.

If you find yourself reaching for any rule below to override what the reference does, **stop**. The reference is the ground truth. The suite's opinions exist to defeat AI convergence on net-new builds; in replication mode they ARE the convergence.

---

The premium website suite is the full set of web-* skills that together replace Lovable. It produces Awwwards/Linear/Stripe quality output — not generic AI UI.

**saas-build reads this file once at Phase 0. All rules here apply to every phase automatically. When the suite is updated, only this file needs changing.**

## Cardinal rule — invoke skills, never paraphrase them

Every `/skill-name` reference in this file (and in any phase reference) is a literal **Skill tool invocation directive**, not a "go read the file" instruction. When you see `/web-page`, fire `Skill('web-page')`. When you see `/critique`, fire `Skill('critique')`. When you see `mcp__magic__21st_magic_component_inspiration`, call that MCP tool — do NOT WebSearch and intuit a result.

Reading a SKILL.md and synthesising its output in main context is a **suite-level failure**, not phase completion. It produces output indistinguishable from no skills at all (see AuditHQ v2 retro 2026-04-24). If a Skill tool is unavailable in this environment → HALT and surface NEEDS_HUMAN with the exact missing skill name. Do NOT continue without it. Do NOT delegate to a generic subagent that paraphrases the skill — same failure, different shape.

If a background agent fails (usage limit, timeout, error): the next move is `Skill('X')` directly in main context, NOT main-context self-synthesis.

## Maintenance Rule

Whenever a web-* skill is created or meaningfully updated (new non-negotiable, new MCP call, new checklist item, new pattern), the session that made the change MUST:
1. Update the Skills table below if a new skill was added
2. Update the relevant section in this file AND the relevant reference file in `references/` to reflect the new rule
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
| `/web-deploy` | Vercel deploy (Supabase handles backend) with smoke tests |
| `/web-fix` | Fix a specific component, bug, or review failure |
| `/web-evolve` | Score-driven continuous improvement loop. Captures screenshots, runs the binary checklist (`shared/landing-page-checklist.md`), iteratively fixes the lowest-scoring failure via the right refinement skill, reverts any fix that doesn't raise the score. Use when an existing site needs to be vastly improved without a wipe-and-rebuild. |
| `/web-stripe` | Stripe checkout session, webhook handler, UpgradeButton + PricingCards components, trial-to-paid flow |
| `/web-table` | TanStack Table implementation — sorting, filtering, pagination, column visibility, row selection, export |
| `/web-onboarding` | Multi-step onboarding wizard — progress bar, step data collection, Supabase writes, trial activation |
| `/web-settings` | Settings page — profile, password change, Stripe billing portal, team invites, danger zone |
| `/web-email` | Transactional emails — Resend + React Email, 5 templates, FastAPI delivery, trial reminder cron |
| `/dashboard-design` | Enterprise dashboard patterns — KPI cards, sparklines, charts, sidebar, date range, filters, CMD+K, real-time |
| `/vercel-react-best-practices` | Bundle splitting, Core Web Vitals, image optimization, Vercel deploy checklist |
| `/shape` | Feature-level UX/UI planning — discovery interview → design brief. Use before building any complex feature page. Product-level design → /web-design-research. Feature-level design → /shape. |
| `/impeccable` | High-quality UI implementation engine. Three modes: `teach` (establish design context), `craft` (build components), `extract` (pull reusable tokens). Called by /web-page before building. |
| `/critique` | UX evaluation — hierarchy, information architecture, visual design. Called by /web-review when Visual Quality < 8/10. |
| `/layout` | Fixes monotonous grids, inconsistent spacing, poor rhythm. Called by /web-review on cramped/uniform layouts. |
| `/typeset` | Fixes font choices, hierarchy, sizing, weight, line-height. Called by /web-review when typography scores Poor. |
| `/colorize` | Adds strategic color to monochromatic features. Called by /web-review when color usage is flat. |
| `/bolder` | Amplifies safe or boring designs. Called by /saas-improve on P2 visual findings. |
| `/distill` | Strips unnecessary complexity. Called by /saas-improve when UX/Friction agent flags cognitive overload. |
| `/quieter` | Tones down overstimulating designs. Called by /saas-improve when contrast or density is excessive. |
| `/animate` | Adds purposeful animations and micro-interactions. Called by /web-review or /saas-improve when motion is absent or wrong. |
| `/delight` | Adds moments of joy and personality. Called by /saas-improve P3 pass. |
| `/polish` | Final quality pass — alignment, spacing, consistency, pixel perfection. Called by /web-review Step 5 and before every /web-deploy. |
| `/optimize` | UI performance — loading, rendering, animation. Called by /web-review Pass D when Performance < 8/10. |
| `/adapt` | Responsive — makes designs work across screen sizes. Called by /web-review when mobile breakpoints fail. |
| `/clarify` | Improves UX copy, microcopy, error messages, labels. Called by /web-review Pass I and /saas-improve Revenue agent findings. |
| `/web-ai` | AI streaming + cost tracking + chat UI + prompt templates via Supabase Edge Functions. Use when any feature needs Claude integration. |
| `/web-analytics` | PostHog setup — event taxonomy, route tracking, user identity, feature flags, session recording. Use on every product. |
| `/web-storage` | Supabase Storage — file upload hook, drag-and-drop UI, signed URLs, avatar upload, bucket RLS policies. |
| `/web-realtime` | Supabase Realtime — table subscriptions → TanStack Query invalidation, presence tracking, broadcast channels. |
| `/web-rbac` | Role-based access control — org_members schema, RLS policies, permission hook, PermissionGate component, WorkspaceSwitcher. |
| `/web-search` | CMD+K command palette (cmdk), Supabase full-text search (tsvector + GIN), Fuse.js fuzzy search, recent items, inline SearchBar. |
| `/web-legal` | Cookie consent banner (GDPR/CCPA/AU), useConsent hook, PostHog opt-in wiring, Privacy Policy page, Terms of Service page. |
| `/web-oauth` | OAuth social login — Google, GitHub, Apple via Supabase Auth. PKCE flow, callback route, account linking, user metadata extraction. |
| `/web-supabase-local` | Local dev workflow — Supabase CLI, Docker stack, migration authoring, seed data, type generation, Edge Function local testing. |
| `/web-pdf` | PDF export — @react-pdf/renderer (structured reports) or Puppeteer Edge Function (HTML capture). Download button, preview modal, lazy loading. |

---

---

## Stack Currency (May 2026) — read before scaffolding

These are the current breaking or significant changes that affect code generated by this suite. Check package versions before installing. Updated 2026-05-17 after 2026 SOTA research pass.

**Framework — Next.js 15 App Router is the new default for marketing-led SaaS:**
- **Default for greenfield SaaS that ship a marketing site**: Next.js 15 (App Router) — Next.js 16 graduates PPR (Partial Prerendering) to default, ship the static shell + stream the dynamic fills. Required for the perf tablestakes below (Speculation Rules, cross-doc View Transitions, RSC streaming, first-class `next/og`, `next/font` foundry loaders).
- **Default for app-shell-first products** (dashboard / data tool / SPA with no marketing surface): Vite 6 + React 19 + React Router 7. Faster HMR, full bundle control, no RSC overhead.
- `/web-scaffold` asks at start: marketing-led → Next.js, app-shell-first → Vite. If user is unsure, default Next.js.
- Adoption signal: Linear / Loom / Resend / Vercel itself all ship Next.js App Router for marketing.

**Tailwind v4 is the new default — v3 is the legacy path:**
- v4 ships the entire palette in OKLCH/P3 wide-gamut natively — the "no shadcn defaults" mandate is now free (the framework's defaults are already OKLCH).
- `tailwind.config.js` is gone — config moves to `@theme {}` in CSS.
- `@tailwind base/components/utilities` → `@import "tailwindcss"`.
- `bg-gradient-to-*` → `bg-linear-to-*`.
- Codemod from v3: `npx @tailwindcss/upgrade`.
- **This suite now targets Tailwind v4 by default.** If the project is locked to v3 (older codebase, plugin compat), note it in CLAUDE.md and `/web-scaffold` switches to v3 templates.

**shadcn CLI v4 (Mar 2026) — registry-as-design-system:**
- `registry:base` payload: distribute the entire design system as one resource (components + CSS vars + fonts + config). `/web-scaffold` emits `registry.json` at project init.
- `--diff` flag: inspect what a `shadcn add` will overwrite before running.
- `shadcn/skills`: built-in agent-context payload (correct component shapes for AI tools).
- `npx shadcn@latest add` is the canonical install. `npx shadcn create` for Base UI under the hood (Radix is the default).
- New components since Oct 2025: `Spinner`, `Kbd`, `ButtonGroup`, `InputGroup`, `Field`, `Item`, `Empty`.

**Animation — `motion` v12 + Lenis + GSAP layered stack:**
- `motion` package (was `framer-motion`): `npm install motion`, import `from 'motion/react'`. Never revert.
- v12 added native **OKLCH color interpolation** — `animate({ background: 'oklch(...)' })` works without manual conversion.
- Lenis (smooth scroll, ~3kB) + GSAP (ScrollTrigger / SplitText / Flip / MorphSVG, free post-Webflow Apr 2024) for scroll choreography. See `world-class-tier.md` motion stack.
- Rive for stateful animation (Spotify / Duolingo / Google use it, 90% smaller than Lottie, 120fps).

**TanStack Query v5 — API changed from v4:**
- `isLoading` → `isPending`, `cacheTime` → `gcTime`, `keepPreviousData` → `placeholderData`
- `onSuccess`/`onError`/`onSettled` callbacks removed from `useQuery` — use `useEffect` or handle in `useMutation`
- All overloads removed — single object signature: `useQuery({ queryKey, queryFn })`
- Codemod: `npx jscodeshift@latest -t @tanstack/query-v5-codemod`

**React 19 is the default (stable since Dec 2024):**
- `use()` hook for async resources + context reading
- Actions API for form handling (replaces manual submit state)
- `useOptimistic()` for optimistic updates (simpler than manual rollback)
- `<Suspense>` streaming SSR supported natively — required for Next.js PPR
- **Suite targets React 19 by default.** React 18 only for codebases locked to it.

**Vercel AI SDK 6 (2026) — `Agent` abstraction:**
- New `Agent` abstraction for reusable agentic workflows with type-safe UI streaming.
- `/web-ai` skill uses this for chat / streaming / cost-tracking patterns. SDK 4/5 patterns are legacy.

**Performance tablestakes (Mar 2026 Google core update + new APIs):**
- LCP target tightened to **< 2.0s** (was 2.5s) in Mar 2026 core update.
- INP < 200ms (replaced FID Mar 2024). FID is gone, do not target it.
- **Speculation Rules API** (Chrome 126+, WordPress 6.8 native): inject `<script type="speculationrules">` for prefetch/prerender. p75 prefetched-nav TTFB ≈ 45ms. `/web-scaffold` outputs the rules block by default.
- **Cross-document View Transitions**: Chrome 126+, Safari 18.5+, Firefox 146+ partial. `@view-transition { navigation: auto; }` in CSS + named `view-transition-name` on shared elements. Same-doc transitions (in `/web-evolve` WC5) are still valid for SPA routes; cross-doc applies to multi-page Next.js sites.

**OG image generation — `@vercel/og` (Edge) or Satori on Workers:**
- Every SaaS page needs a dynamic OG. `/web-page` scaffolds the `app/opengraph-image.tsx` (Next.js) or `api/og` Edge Function (Vite) at page-create time.
- Template: brand-tokens (color, font, logo) baked in; page title + tagline injected per route.

**AI image generation at build — wire `/ai-image-generation` skill:**
- For hero/feature images: FLUX.1-pro and Seedream 3.0 via fal.ai / Replicate. Banned alternatives: gradient blobs, generic stock photography (Unsplash defaults).
- `/web-page` hero step calls `/ai-image-generation` with the DESIGN-BRIEF style tokens as the prompt prefix.

**Content humanizer — wire `/content-humanizer` skill:**
- AI-written landing copy runs through a humanizer pass before commit. Strips perplexity-lowering markers ("delve", "leverage", "robust", em-dash overuse, sentence-length uniformity).
- `/web-page` and `/saas-improve` invoke it as the final step on any AI-written copy section.

**Figma Dev Mode MCP — design-to-code (2025+):**
- If the user has Figma designs, connect the Figma Dev Mode MCP before running `/web-design-research`.
- Exposes live Figma layer structure into context — Claude generates code from the actual design, eliminating intent/implementation gap.

**Sequential Thinking MCP — for complex architectural decisions:**
- Forces step-by-step reasoning before committing to patterns.
- Recommended for Phase 0.5 (design research) and Phase 3 (backend architecture).

---

## Design Refinement Layer (Impeccable Suite)

The impeccable suite operates as a second pass over work the build skills produce. It does not replace them — it sharpens the output.

**When each skill fires in the pipeline:**

| Stage | Trigger | Impeccable skill |
|---|---|---|
| Pre-feature planning | Building a complex feature page | `/shape` — plan before code |
| Start of /web-page | No design context established yet | `/impeccable teach` |
| /web-review Visual Quality < 8/10 | Typography scores Poor | `/typeset` |
| /web-review Visual Quality < 8/10 | Layout/spacing scores Poor | `/layout` |
| /web-review Visual Quality < 8/10 | Color is flat or overused | `/colorize` |
| /web-review Visual Quality < 8/10 | Motion absent or wrong | `/animate` |
| /web-review Visual Quality < 8/10 | Microcopy unclear | `/clarify` |
| /web-review Visual Quality < 8/10 | Design is generic/safe | `/bolder` |
| /web-review Pass D Performance < 8/10 | UI perf issues | `/optimize` |
| /web-review mobile breakpoint failures | Responsive gaps | `/adapt` |
| Before every /web-deploy | Final consistency pass | `/polish` |
| /saas-improve P2 (visual) | Overcrowded or complex UI | `/distill` |
| /saas-improve P2 (visual) | Contrast/density excessive | `/quieter` |
| /saas-improve P3 (delight) | No personality/joy | `/delight` |
| /saas-improve Revenue agent | Generic or weak copy | `/clarify` |

**Invoke `Skill('impeccable')` with `args: 'teach'` once per project to establish design context.** Without it, impeccable skills produce generic output — they need the target audience, brand personality, and use cases to make good decisions. The "teach" mode is mandatory; skipping it is the silent failure mode that wasted weeks of refinement-skill development (AuditHQ v2 retro 2026-04-24).

**Every entry in the table above is a `Skill('X')` tool call when its trigger fires** — not a "consider running" suggestion. If `/web-review` flags Visual Quality < 8/10 with Typography Poor → fire `Skill('typeset')`. If a sub-agent fails → fire the same `Skill()` directly in main context. Self-grading "I would have run typeset but I'll just fix the typography myself" is a phase failure.

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

Component choices are made ONCE during `/web-design-research` and locked in DESIGN-BRIEF.md as a Component Lock table. Build skills read that table — they do NOT re-run MCP queries.

Full registry table, selection criteria by product type, and adapt rules after component use:
→ Read `references/component-registry.md`

---

## Landing Page Rules

Mandatory sections (in order): [Banner] → Nav → Hero (with animated bg) → Logo Cloud → Stats → Features → Testimonials → Pricing → FAQ → Final CTA → Footer

Non-negotiables enforced on every build: animated background (WebGL blobs, not CSS grid), product visual mockup (shadcn primitives, never a gradient blob), Technique 3 STAGGER hero entrance, logo cloud with InfiniteSlider, CountUp stats section, Features 4 or BentoGrid, TestimonialSlider (min 3), FAQ (min 5 questions), Footer 2 multi-column.

Color discipline: primary color budget = 2 uses per page max. Enterprise design = restraint.

Full section specs, per-page 13-item checklist, two-pass self-review rules, and category-specific overrides (auth pages, SaaS onboarding gate, dashboard pages):
→ Read `references/landing-page-rules.md`

---

## Pre-Deploy Checklist & Performance

No chunk exceeds 250KB gzipped. All routes use React.lazy + Suspense. ProtectedRoute on all auth-gated routes. web-review score 38+/40 before any deploy.

Full 33-item pre-deploy checklist, performance requirements, bundle size rules, deploy rules, routing & auth rules, Webmanifest requirements, testing requirements, and Stripe/payments rules:
→ Read `references/pre-deploy-checklist.md`

---

## Quality Bar (canonical — both `/saas-build` and `/web-evolve` read this)

The suite uses a **single tier system: 90 / 95 / 98 / 100**. `/web-review`'s 0–40 score is one expression of it (38/40 = tier 95). `/web-evolve`'s `target_score` is the same scale at a different name.

| Tier | Greenfield exit (`/saas-build`) | Brownfield target (`/web-evolve`) |
|---|---|---|
| **90** — Premium SaaS | `/web-review` ≥ 36/40 if `--target=90` | Run #1 default when site is mid-template |
| **95** — Stripe/Linear quality | **DEFAULT** — `/web-review` ≥ 38/40 + pre-deploy green | Common advance from 90 |
| **98** — Awwwards SOTD | Not reachable greenfield — requires `/web-evolve` Phase R/G | Awwwards 4-dim ≥ 8.0 + WC1–WC10 PASS |
| **100** — Awwwards SOTM | Not reachable greenfield | Awwwards 4-dim ≥ 8.5 + Creativity ≥ 9.0 |

**Greenfield ceiling**: `/saas-build` does NOT push above tier 95. To reach tier 98/100, run `/web-evolve` after deploy.

**Fix loop** (greenfield): for each `/web-review` failure, run `Skill('web-fix')` targeting the exact failure, commit, re-run `Skill('web-review')`.

**Hard stop** (greenfield): after 5 iterations with score still < 38 — log `STUCK` and STOP. Do not proceed to deploy.

**Brownfield gates** (`/web-evolve` Phase F Cardinal Rule 14): exit requires all of — Gate A (≥ 1 refinement-skill invocation), Gate B (VQ delta ≥ tier floor 0.5/0.7/1.0/1.5), Gate C (refinement-skill floor 1/3/6/8). Score alone is not enough.

Full tier mapping, fix-loop semantics, page type detection table, dashboard rules, skill trigger guide, and context refresh rule:
→ Read `references/quality-bar.md`

---

## Anti-Patterns

- **Inventing sections from scratch instead of 21st.dev** — every landing page section must come from the registry in `references/component-registry.md`. No exceptions.
- **Skipping per-page self-review** — both passes are required (13-item checklist + 5-question fresh-eyes). Pass 1 alone is not sufficient.
- **Self-grading instead of invoking the skill** — writing "I assessed this 38/40 against the checklist" without firing `Skill('web-review')` is a phase failure, not phase completion. Same for any refinement skill. The transcript MUST contain the tool call.
- **Reading a SKILL.md to "execute its steps inline"** — that is the bypass pattern that produced AuditHQ v2's generic landing. Always invoke via the Skill tool.
- **Deploying without 38/40 quality gate** — `Skill('web-review')` must score 38+ before `Skill('web-deploy')` runs. Never skip or lower the bar.
- **Hardcoded hex/rgb instead of CSS variables** — every color must use `hsl(var(--token))`. Raw Tailwind color classes (`text-gray-500`) must be replaced with semantic tokens (`text-muted-foreground`).
- **Duplicating rules in individual skill files instead of here** — if a rule is not in this file (or its references), saas-build will not enforce it. Individual skill files may elaborate; they must not contradict or replace this contract.

---

## Full Build Loop (May 2026)

```
saas-build 0.25       → MARKET-BRIEF.md: competitor website deep-dive (hero patterns, social proof format, pricing model), feature gaps, differentiator
/web-design-research  → DESIGN-BRIEF.md: reads MARKET-BRIEF.md competitor data, 21st.dev components, LottieFiles, unique color system, multi-page structure
/web-scope            → SCOPE.md — reads DESIGN-BRIEF.md, imports all design decisions, defines page inventory + framework decision (nextjs | vite)
/web-scaffold         → foundation: framework-specific scaffold (Next.js App Router OR Vite + React Router 7),
                        Tailwind v4 + shadcn CLI v4 (registry:base), Speculation Rules, cross-doc View Transitions (Next.js),
                        OG image template, Sentry, motion + lenis + gsap installed
/web-supabase         → schema, RLS policies, auth, TypeScript types (if backend)
/web-stripe           → checkout session, webhooks, UpgradeButton (if paid plans)
/web-email            → transactional email setup (if email flows required)
/web-page × N         → one page at a time — landing first, auth second, /setup third
                        (Next.js: writes to app/{route-group}/page.tsx | Vite: writes to src/pages/{Name}.tsx)
                        Per-page steps include:
                          5.5 — Skill('ai-image-generation') for hero/feature imagery (banned: gradient blob, stock)
                          5.6 — per-page OG image (opengraph-image.tsx on Next.js | api/og.tsx on Vite)
                          5.7 — Skill('content-humanizer') on AI-written copy before commit
                        (dashboard pages: read /dashboard-design first)
                        (list pages: read /web-table first)
/web-rbac             → org roles, team invites, PermissionGate (if multi-user)
/web-storage          → file uploads, buckets, signed URLs (if any file feature)
/web-realtime         → live subscriptions, presence (if live updates needed)
/web-ai               → Vercel AI SDK 6 Agent + Anthropic via Supabase Edge proxy + streaming UI (if AI feature)
/web-analytics        → PostHog setup, event taxonomy (every product)
/web-settings         → /settings page (always required for SaaS with auth)
/web-review           → audit before deploy (≥ 38/40 = tier 95 — see references/quality-bar.md)
/web-deploy           → Vercel default. Cloudflare Pages+Workers when bandwidth/region/cold-start signals warrant.
/web-evolve           → POST-DEPLOY brownfield loop. Auto-decides target tier (90/95/98/100).
                        Tier 98+ adds Phase R (world-class research) + Phase G (motion stack install).
                        Re-invocation advances one tier per run.
```

Page build order enforced by saas-build:
1. `/` — Landing (non-negotiables apply: animated bg, product mockup, STAGGER hero)
2. `/auth` — Sign in / sign up
3. `/setup` — Onboarding wizard (mandatory for all SaaS with auth)
4. App pages in SCOPE.md priority order
5. `/settings` — Settings (mandatory for all SaaS with auth)

`/web-scope` MUST produce a `SCOPE.md` containing: page list, auth flow diagram, design decisions, color palette choice, component inventory. saas-build uses this as the build contract.

Orchestrated autonomously by `/saas-build`. Update this file when the suite changes — saas-build reads it at Phase 0 and inherits everything automatically.
