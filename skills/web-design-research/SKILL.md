---
name: web-design-research
description: >
  Pre-build design research for SaaS products. Researches competitors, runs targeted MCP queries
  for every mandatory landing page section, locks specific 21st.dev component choices per product
  type, defines a unique design system, and outputs DESIGN-BRIEF.md as the single source of truth.
  Runs BEFORE web-scope. Build skills (web-scaffold, web-page) read the Component Lock from
  DESIGN-BRIEF.md and do NOT re-run MCP queries. Every product must look genuinely different.
---

# Skill: /web-design-research

**Runs BEFORE /web-scope on every new product. Not optional.**

This skill is the only place MCP component decisions are made. Build skills execute the locked plan — they do not re-research. If this step is skipped, every product gets the same structure with different colors. That is not acceptable.

---

## The Problem This Solves

Two failure modes destroy landing page quality:

1. **Vague MCP calls during build** — "search for features section" at scaffold time returns whatever comes first, under time pressure. The build skill picks the top result and moves on. Every product gets Features 4.

2. **Re-running MCP per session** — different sessions make different choices for the same product. The hero section was BentoGrid in one session, Features 4 in the next. Incoherent result.

This skill front-loads all component decisions in one dedicated research session. DESIGN-BRIEF.md becomes the locked contract. Build skills execute it.

---

## Step 0 — Trend Pulse (MANDATORY — runs before Step 1, every time)

**The static aesthetic table in Step 1b is a vocabulary, not a verdict.** Design trends move faster than skill files get updated. What was "bold and fresh" in 2024 may be "everyone did that" in 2026. Step 0 gets a live signal before any aesthetic decision is locked.

Run ALL FIVE of these WebSearch queries. Do not skip or batch — each targets a different signal:

```
WebSearch: "best SaaS landing page design [current year]"
WebSearch: "web design trends [current year] what's overdone"
WebSearch: "Awwwards site of the month [current month year]"
WebSearch: "[product category] website design [current year] award winning"
WebSearch: "typography trends [current year] web design"
```

From the results, produce a **Trend Pulse summary** — this is written into DESIGN-BRIEF.md under a `## Trend Pulse` section:

```markdown
## Trend Pulse — [date searched]

### Fresh / gaining momentum
- [aesthetic or pattern appearing on award-winning sites this cycle]
- [font pairing or type style being praised]
- [color territory appearing on new high-quality launches]

### Saturated / avoid
- [aesthetic being called "overdone", "tired", or mocked in design discourse]
- [font / color combination appearing in "every SaaS site" discourse]
- [pattern that dominated 12–18 months ago and now signals "lazy AI build"]

### Category-specific signal
- [what the top 2-3 sites in this product's category are doing visually right now]
- [what none of them are doing — the gap]
```

**How the Trend Pulse feeds Step 1b:**
- Any aesthetic in the **Saturated** list gets deprioritised — require a strong justification to use it.
- Any aesthetic in the **Fresh** list gets elevated — prefer it if it fits the personality.
- The **Category-specific gap** is the single most powerful differentiator: if every competitor uses dark mode with blue accents, go light with a warm hue. If every competitor uses geometric patterns, go organic. The gap is the opportunity.

**Rule:** if the Trend Pulse search returns nothing useful (paywalled, no results), try alternate queries substituting "UI design" or "product design" for "web design". If still empty, note "trend data unavailable — proceeding with static table only" in DESIGN-BRIEF.md and proceed. Do not skip Step 0 silently.

---

## Step 1 — Product Personality Classification

Map this product to ONE of 8 personalities. This drives every downstream decision.

| Personality | Industries | Emotional register | User type |
|---|---|---|---|
| **Enterprise Authority** | Compliance, legal, audit, regulation, finance | Trust, seriousness, stability | Accountants, lawyers, compliance officers |
| **Data Intelligence** | Analytics, CI, monitoring, business intelligence | Precision, depth, insight | Analysts, ops teams, growth teams |
| **Trusted Productivity** | HR, project management, CRM, scheduling | Collaboration, clarity, momentum | Team leads, PMs, HR managers |
| **Premium Professional** | Property, consulting, advisory, wealth management | Sophistication, value, status | Executives, advisors, high-net-worth users |
| **Bold Operator** | Trades, construction, logistics, field service | Reliability, action, strength | Tradespeople, site managers, supervisors |
| **Health & Care** | Aged care, NDIS, health, disability services | Warmth, human connection, safety | Carers, families, clinical staff |
| **Growth Engine** | Marketing SaaS, sales tools, creator tools | Energy, momentum, ambition | Founders, marketers, growth leads |
| **Civic/Government** | Migration, public records, government services | Authority, clarity, accessibility | Citizens, agents, administrators |

Answer these four before proceeding:
1. **Personality type:** [one of the 8 above]
2. **User emotion on open:** What is the user feeling when they arrive? (e.g. "Stressed about a compliance deadline", "Looking for competitive edge", "Worried about a client outcome")
3. **3-second message:** What must the design communicate before the user reads a word? (e.g. "This is official and trustworthy", "This is powerful and fast", "This is safe and caring")
4. **Memorability hook:** What is the ONE thing a user will remember about this site 24 hours after leaving? (e.g. "the giant ticker scroll", "the brutalist serif headlines", "the dark canvas with grain", "the cursor that left a trail"). If you can't answer this — the design is too safe. Pick something.

---

## Step 1b — Aesthetic Direction Lock (NEW — anti-convergence)

Personality (Step 1) tells you **what the product feels like emotionally**. Aesthetic direction tells you **what it looks like visually**. Two products with the same personality must NOT land on the same aesthetic — that's how every AI-generated SaaS ends up looking identical.

**Pick ONE extreme aesthetic flavor and commit fully:**

| Aesthetic | Visual signature | Best fit personalities |
|---|---|---|
| **Brutally minimal** | Massive whitespace, single accent color, oversized typography, almost nothing on screen | Premium Professional, Enterprise Authority |
| **Maximalist chaos** | Dense layered elements, multiple typefaces, decorative borders, overlapping shapes | Growth Engine, creator tools |
| **Retro-futuristic** | CRT scanlines, terminal greens/ambers, monospace dominance, grid backgrounds | Data Intelligence, dev tools |
| **Organic / natural** | Hand-drawn elements, soft asymmetric shapes, earthy palette, paper textures | Health & Care, sustainability |
| **Luxury / refined** | Serif display, generous spacing, gold/cream/black, photographic hero, restrained motion | Premium Professional, advisory |
| **Editorial / magazine** | Multi-column text, large serif headlines, captioned imagery, footnotes, drop caps | Civic/Government, long-form content |
| **Brutalist / raw** | Default browser fonts subverted, exposed grid, harsh contrast, no rounded corners, chunky borders | Bold Operator, contrarian brands |
| **Art deco / geometric** | Symmetrical motifs, gold lines on dark, geometric patterns, ornate dividers | Premium Professional, hospitality |
| **Soft / pastel** | Muted candy palette, rounded everything, gentle shadows, friendly illustrations | Health & Care, family/parenting |
| **Industrial / utilitarian** | Visible grid lines, technical drawings, blueprint blue, monospaced labels, no decoration | Bold Operator, B2B logistics |

**Lock the aesthetic and write WHY this aesthetic differentiates from the dominant category look (from Step 2 competitor research).** This is the single biggest lever against AI convergence — without it, every product gets the same "modern SaaS" treatment.

**Before locking — cross-reference against the Step 0 Trend Pulse:**
- Is this aesthetic on the **Saturated** list? → Deprioritise. Pick the next-best fit from the table, or find a fresh variant (e.g. "Brutally minimal" can be made fresh with a distinctive typographic choice that's currently trending).
- Is this aesthetic on the **Fresh** list? → Elevate it if it fits the personality — current momentum + personality fit is the strongest combination.
- Does this aesthetic address the **Category-specific gap** from the Trend Pulse? → Prioritise it — being the only one doing something in a crowded category is worth more than being the best at what everyone else does.

**Rules:**
- "Modern SaaS" / "clean and minimal" / "professional" are NOT valid aesthetic directions. They are the convergence trap.
- The aesthetic must be visible from the first frame. A user closing their eyes after 1 second should be able to describe it in one word.
- Implementation complexity must MATCH the aesthetic. Maximalist needs elaborate code with extensive animations. Minimalist needs restraint, precision, careful spacing. Don't half-commit.
- **The table above is a starting vocabulary, not a closed list.** If the Trend Pulse surfaces an emerging aesthetic not in the table (e.g. "glassmorphism revival", "kinetic typography", "anti-grid organic layout"), you may adopt it — name it, describe it, and lock it. Do not feel constrained to the 10 rows above.

---

## Step 2 — Competitor Design Research

**First: check if MARKET-BRIEF.md exists in the project root.** If it does, read the "Top 3 competitors" and "Features users consistently request" sections — these contain pre-fetched competitor data from Phase 0.25. Skip the WebSearch queries below and proceed directly to the analysis step. Do not duplicate research.

If MARKET-BRIEF.md does not exist, run these 4 WebSearch queries (substitute `[current year]` with the actual current year):

```
WebSearch: "[product category] SaaS website design [current year]"
WebSearch: "[closest competitor] landing page hero"
WebSearch: "[closest competitor 2] landing page hero"
WebSearch: "best [industry] software landing page design [current year]"
```

From results, identify and document both angles:

**What's working (adopt or adapt):**
- Proven hero patterns — what are the top 2-3 competitors doing above the fold?
- Social proof formats that appear across multiple competitors
- CTA patterns — what's the dominant first CTA?

**What to avoid:**
- Dominant colors in this category
- Dark vs light prevalence
- Overused design motifs
- One visual gap — something no competitor is doing

Document in 5-6 sentences. This informs Step 3 (color), Step 4 (hero architecture), and component choices.

---

## Step 3 — Color System

Read `references/color-palettes.md` for the full palette library by personality type. Select based on personality + competitor research. Adjust hue/lightness slightly to create distance from any competitor using the same base.

**Hard rules (enforced here, not in the reference):**
- `hsl(213 94% 58%)` (electric blue) is banned unless this is a developer infrastructure tool
- **Purple-to-pink gradient on white background is banned.** It is the single most overused AI-SaaS gradient. No exceptions.
- **Generic indigo `hsl(239 84% 67%)`, generic violet `hsl(258 90% 66%)`, and any hsl with S>80% L 60-70% on white** require explicit justification — these are the "default LLM choices" and must be avoided unless deliberately matched to a brand.
- Solid flat backgrounds are the lazy default. The hero background MUST have ONE of: gradient mesh, noise/grain texture, geometric pattern, layered transparency, dramatic single-source shadow, or photographic backdrop. Pick one in Step 6b.
- Every color must have a written reason tied to the product's personality + chosen aesthetic
- Mode (dark/light first) must match user environment

---

## Step 4 — Typography Lock

Read `references/typography-library.md` for font pairings by personality type and the full heading scale. Lock the chosen pair and heading scale in DESIGN-BRIEF.md.

**Hard typography bans (cannot be display/heading font):**
- **Inter** — most overused AI-SaaS heading font on the planet. Banned as display.
- **Roboto, Arial, Helvetica, system-ui** — generic system stacks. Banned as display.
- **Space Grotesk** — convergence trap. Banned as display unless paired with deliberately contrarian aesthetic.

**Trend Pulse cross-reference for typography:** Before locking the font pair, check what the Step 0 Trend Pulse surfaced under "typography trends". If a specific font is appearing on award-winning sites this cycle, consider it. If a font you were planning to use appears in "everywhere right now" discourse, deprioritise it — even if it's not on the hard-ban list. The bans are a floor; trend-awareness is the ceiling.

**Body font allowance:** Inter is acceptable as a BODY font (not display) for Enterprise Authority and Civic personalities where reading volume justifies it. Every other personality must pick a body font with character (Plus Jakarta Sans, Geist, Manrope, IBM Plex Sans, Söhne alternatives, etc.).

**The pairing rule:** Pair a distinctive display font with a refined body font. Both fonts should be visible from a 1-second glance — if you can't tell two products apart by their type, you've failed.

---

## Step 5 — Hero Architecture Decision

Choose the hero layout pattern before calling MCP. The pattern drives the hero MCP query in Step 6.

| Pattern | Best for | Description |
|---|---|---|
| **Centered** | Enterprise Authority, Trusted Productivity, Civic | Headline centered, subheadline centered, CTAs centered, product mockup full-width below fold |
| **Split-pane** | Data Intelligence, AI products, Growth Engine | Text block left (40%), animated product output right (60%) — typewriter or live data |
| **Full-screen immersive** | Bold Operator, Premium Professional | Background fills viewport, headline overlaid large, single CTA, product mockup inset — add subtle film grain overlay (opacity 0.03-0.05) for texture |
| **Minimal editorial** | Premium Professional (alternative), Health & Care | Giant display typography dominant, minimal visual, emotional photography or soft illustration |

Lock this choice in DESIGN-BRIEF.md.

---

## Step 6 — 21st.dev Component Lock

Read `references/component-selection.md` for the full selection criteria tables and all 11 MCP search queries. Run every query using `mcp__magic__21st_magic_component_inspiration`. Lock every choice in DESIGN-BRIEF.md.

**Tool usage rule:** Only `mcp__magic__21st_magic_component_inspiration` is called here. `mcp__magic__21st_magic_component_builder` is NEVER called in research — it is called by build skills (web-scaffold, web-page) when constructing the actual component.

---

## Step 6b — Visual Atmosphere & Motion Strategy (NEW)

The hero is what stops the scroll. Solid backgrounds and stock product mockups don't. Lock both atmosphere and motion strategy here — build skills will execute, not invent.

### 6b.1 — Background Atmosphere (pick exactly ONE)

| Atmosphere | When to use | Implementation hint |
|---|---|---|
| **Gradient mesh** | Growth Engine, Trusted Productivity (warm, inviting) | Multi-radial-gradient SVG or CSS, 3-4 color stops, blur 80-120px |
| **Noise / grain texture** | Premium Professional, Bold Operator, Brutalist (tactile) | SVG turbulence filter overlay, opacity 0.03-0.06 |
| **Geometric pattern** | Civic, Editorial, Industrial (structured) | SVG grid/dots/diagonals, low opacity, fades to edges |
| **Layered transparency** | Data Intelligence, AI products (depth) | Stacked translucent shapes with backdrop-blur |
| **Dramatic shadow / spotlight** | Luxury, Bold Operator (focus) | Single radial gradient from one corner, 80% darkness elsewhere |
| **Photographic backdrop** | Health & Care, Premium Professional (human) | Subject-relevant photo with dark/light overlay for text contrast |
| **Animated canvas** | Bold/maximalist aesthetics only | Particles, flowfield, or shader. Disabled at `prefers-reduced-motion` |

**Banned:** plain white, plain hsl(0 0% 5%) black, single linear gradient with two stops. Lazy and convergent.

### 6b.2 — Motion Strategy

Pick ONE motion philosophy (do not mix):

- **Choreographed entrance** (default) — single orchestrated page-load reveal with staggered delays (`animation-delay: 100ms, 200ms, 300ms`). Hero copy → CTA → product visual. After load, the page is calm. **More delight per byte than scattered micro-interactions.**
- **Continuous ambient motion** — backgrounds drift, gradients pulse, particles float. No jarring entrances. Best for premium/luxury aesthetics. Must respect `prefers-reduced-motion`.
- **Scroll-driven transformation** — sections snap, hero pins, content morphs as user scrolls. Best for editorial, bold-operator, or product-tour pages. Use Motion library or CSS scroll-timeline. **Heavy — only when the product justifies it.**

**Surprise hover interaction (mandatory ONE):**  Pick one element that does something genuinely unexpected on hover/focus. Examples: cursor leaves trail, button text scrambles then resolves, card lifts and casts color shadow, icon morphs, subtle haptic-style scale + shadow. **One** surprise — not ten. Lock which element gets it.

### 6b.3 — Decorative Detail Layer (pick at least ONE)

Anti-convergence detail — adds personality the average AI SaaS skips:
- Custom cursor (only on desktop, only on bold/maximalist)
- Decorative dividers (geometric, hand-drawn, ASCII-style)
- Drop caps on first paragraph (editorial aesthetics)
- Marquee / ticker scroll (bold, growth)
- Asymmetric grid breaks (one section deliberately misaligned)
- Annotated callouts (highlighted text + handwritten arrow to feature)

Lock the chosen detail in DESIGN-BRIEF.md — build skills must implement it.

---

## Step 7 — LottieFiles Animation Research

Find 3 product-specific animations for empty states, success moments, and loading states.

```
WebSearch: "lottiefiles [product keyword] free animation"
WebSearch: "lottiefiles [core action of product] animation loop"
```

Target placements:
1. **Empty state (primary feature page)** — shown when user has no data yet (100-120px)
2. **Success/completion state** — onboarding finish, form submitted, action confirmed (160-200px)
3. **Processing state** — AI generating, analysis running, search in progress (80-100px)

Integration:
```tsx
import { Player } from '@lottiefiles/react-lottie-player'
import { useReducedMotion } from 'framer-motion'

function LottieEmptyState({ src, height = 120 }: { src: string; height?: number }) {
  const shouldReduce = useReducedMotion()
  if (shouldReduce) return null
  return <Player autoplay loop src={src} style={{ height: `${height}px` }} />
}
```

If no exact match found: note the search terms used and closest alternatives. Never skip.

---

## Step 8 — Differentiation Audit

Use Glob with pattern `~/.claude/projects/*/memory/*.md` to find all project memory files. Read any that reference a SaaS product built with this suite — identify the last 2-3 products and their recorded color choices.

If memory files exist but contain no color data: check for `DESIGN-BRIEF.md` files in sibling project directories. If none found, document "no prior builds found" and continue.

For each of these 5 dimensions, confirm this product makes a **different choice** from recent builds:

| Dimension | This product's choice | Different from recent builds? |
|---|---|---|
| Primary color hue | `hsl([H] ...)` | Yes / No — [name the conflict if No] |
| Background mode | dark-first / light-first | Yes / No |
| Hero pattern | Centered / Split-pane / Full-screen / Minimal | Yes / No |
| Features layout | Border-grid / BentoGrid / List / Editorial | Yes / No |
| Section count | Micro (5) / Standard (9) / Full (11) | Yes / No |

If any dimension conflicts: change this product's choice before locking. See `references/color-palettes.md` for hue-shift guidance.

---

## Step 9 — Marketing Site Structure

Choose tier based on product complexity and competitive environment:

### Tier 1 — Micro SaaS (simple utility, under 5 features)
```
/         Hero + stats + 3 features + pricing + CTA (single scroll)
/auth   Auth
```

### Tier 2 — Standard SaaS (most products — default)
```
/             Hero page (full section stack: hero → logos → stats → features → testimonials → pricing → FAQ → CTA → footer)
/features     Deep feature breakdown + how-it-works steps + comparisons
/pricing      Dedicated pricing page + feature comparison table + FAQ + guarantee
/auth       Auth
```

### Tier 3 — Full Marketing Site (crowded market, SEO priority)
```
/              Hero page
/features      Feature deep dive
/how-it-works  Illustrated workflow walkthrough
/pricing       Full pricing + comparison + FAQ
/blog          SEO content hub
/about         Founder story + credibility
/auth          Auth (signup / login via tabs)
/signin        Login shortcut (redirects to /auth?tab=login)
```

Default: Tier 2. The single-scroll landing page era is over.

---

## Step 9b — Dashboard Design

If the marketing site structure includes a `/dashboard` route, run the `dashboard-design` skill now to lock the dashboard layout before build starts.

Read `~/.claude/skills/dashboard-design/SKILL.md` and complete:
1. Category classification (Analytics, Operations, Finance, HR, CRM, DevOps, Health, Civic)
2. Layout pattern — Sidebar nav or Top nav? Single-panel or split-panel?
3. KPI card spec — how many KPI cards? What metric + sparkline per card?
4. Primary chart type (Area, Bar, Funnel, Heatmap, Table)
5. Empty state design — what does a brand new user see? Must have a CTA.

Add a `## Dashboard Design` section to DESIGN-BRIEF.md with these 5 decisions locked.

---

## Step 10 — Write DESIGN-BRIEF.md

Read `references/design-brief-template.md` for the full template. Write the completed file to the project root.

This file is the single source of truth. Build skills read it — they do not re-research.

---

## Anti-Patterns

- **Skipping Step 0 (Trend Pulse)** — picking an aesthetic from the static table without first running the 5 WebSearch queries is the single easiest way to produce dated, on-trend-for-last-year work. Step 0 is not optional. No Trend Pulse = A11 hard veto.
- **Treating the aesthetic table as a closed list** — the table is vocabulary, not verdict. If the Trend Pulse surfaces something fresher that fits the personality, use it and name it. Don't force a square product into a round aesthetic category just because it's in the table.
- **Generic MCP calls** — never use vague queries like "features section". Always use personality-specific queries from `references/component-selection.md`.
- **Re-running design research** — if DESIGN-BRIEF.md already exists in the project root, do not run this skill again. Read the existing brief and continue. **Exception:** if the existing brief's Trend Pulse is >90 days old, re-run Step 0 only and update the DESIGN-BRIEF — do not redo the full skill.
- **Electric blue `hsl(213 94% 58%)`** — banned for all non-developer-infrastructure products. No exceptions.
- **Purple-to-pink gradient on white** — most overused AI-SaaS background. Banned without exception.
- **"Modern SaaS" / "clean & minimal" as aesthetic direction** — not a direction, it's the convergence trap. Pick a real flavor (Step 1b).
- **Inter as display/heading font** — banned. Inter as body for Enterprise/Civic only.
- **Space Grotesk** — convergence font, banned as display unless paired with deliberately contrarian aesthetic.
- **Solid flat hero background** — banned. Pick an atmosphere from Step 6b.
- **Scattered micro-interactions** — better to do ONE choreographed page-load reveal than ten twitchy hover effects.
- **Picking components by personal preference** — every component choice must be justified by personality type and product criteria from `references/component-selection.md`.
- **Half-committing to the aesthetic** — maximalist needs elaborate code, minimalist needs precision. Don't water down the chosen direction.

---

## Completion Checklist

Before handoff to `/web-scope`:

- [ ] **Step 0 Trend Pulse run** — 5 WebSearch queries completed, Fresh/Saturated/Gap lists written into DESIGN-BRIEF.md `## Trend Pulse` section with today's date
- [ ] Personality type identified and justified
- [ ] **Memorability hook stated** (the one thing user remembers 24h later)
- [ ] **Aesthetic direction locked** from Step 1b — cross-referenced against Trend Pulse (NOT "modern SaaS" / "clean minimal", NOT on Saturated list)
- [ ] Aesthetic rationale cites trend data ("chosen because X is Fresh / avoids Y which is Saturated")
- [ ] 4 WebSearch competitor queries run — findings documented (color, mode, clichés)
- [ ] Color palette selected with explicit rejection of defaults + reasons
- [ ] **Banned colors confirmed avoided** (electric blue, purple-pink-on-white, generic indigo/violet)
- [ ] Typography pair locked — display font is NOT Inter/Roboto/Arial/Space Grotesk, cross-referenced against Trend Pulse typography findings
- [ ] Hero architecture pattern chosen (Centered / Split-pane / Full-screen / Minimal)
- [ ] All 11 MCP queries run — one per mandatory section
- [ ] Each component choice recorded with query used + product-specific reason
- [ ] **Background atmosphere chosen from Step 6b.1** (not solid flat)
- [ ] **Motion strategy locked** (Choreographed / Continuous ambient / Scroll-driven)
- [ ] **Surprise hover element chosen** (one specific element + interaction)
- [ ] **Decorative detail chosen from Step 6b.3**
- [ ] 3 LottieFiles animations found (or closest alternatives noted)
- [ ] Differentiation audit passed — 3+ dimensions differ from last build
- [ ] Marketing tier chosen (1/2/3)
- [ ] DESIGN-BRIEF.md written to project root with Component Lock + Aesthetic + Atmosphere + Motion sections complete

**If any item is unchecked: do not hand off. Complete it first.**

---

## Handoff to /web-scope

Output this summary:

```
DESIGN-BRIEF.md written and locked.

Product: [name]
Personality: [type]
Aesthetic direction: [brutalist | maximalist | retro-futuristic | luxury | editorial | etc.]
Memorability hook: [the one thing user remembers 24h later]
Mode: [dark/light]-first
Primary: hsl([value]) — [name]
Hero pattern: [Centered | Split-pane | Full-screen | Minimal]
Background atmosphere: [Gradient mesh | Noise/grain | Geometric | Layered | Spotlight | Photo | Animated canvas]
Motion strategy: [Choreographed entrance | Continuous ambient | Scroll-driven]
Surprise hover element: [which element + what happens]
Decorative detail: [custom cursor | drop caps | marquee | asymmetric break | etc.]
Marketing tier: [1/2/3] — [N] public + [N] app pages

Component Lock summary:
- Background: [component]
- Hero: [component]
- Features: [component] — [BentoGrid or Features 4 and why]
- Testimonials: [component]
- Pricing: [component]
- FAQ: [component]

Differentiation vs last build:
- Color: [this product] vs [last product]
- Hero: [this pattern] vs [last pattern]
- Features: [this layout] vs [last layout]

Lottie animations:
- Empty state ([page]): [URL/description]
- Success state: [URL/description]
- Processing state: [URL/description]

Next: /web-scope reads DESIGN-BRIEF.md as its primary input.
web-scaffold reads Component Lock table — does NOT re-run MCP.
```

---

## Related Skills

- `/web-scope` — reads DESIGN-BRIEF.md to plan the build
- `/web-scaffold` — reads Component Lock table, does not re-run MCP
- `/web-page` — reads Component Lock, builds individual pages
- `/dashboard-design` — locks dashboard layout (called from Step 9b)
