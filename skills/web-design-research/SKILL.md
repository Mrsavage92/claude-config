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

Answer these three before proceeding:
1. **Personality type:** [one of the 8 above]
2. **User emotion on open:** What is the user feeling when they arrive? (e.g. "Stressed about a compliance deadline", "Looking for competitive edge", "Worried about a client outcome")
3. **3-second message:** What must the design communicate before the user reads a word? (e.g. "This is official and trustworthy", "This is powerful and fast", "This is safe and caring")

---

## Step 2 — Competitor Design Research

**First: check if MARKET-BRIEF.md exists in the project root.** If it does, read the "Top 3 competitors" and "Features users consistently request" sections — these contain pre-fetched competitor data from Phase 0.25. Skip the WebSearch queries below and proceed directly to the analysis step. Do not duplicate research.

If MARKET-BRIEF.md does not exist, run these 4 WebSearch queries:

```
WebSearch: "[product category] SaaS website design 2025"
WebSearch: "[closest competitor] landing page hero"
WebSearch: "[closest competitor 2] landing page hero"
WebSearch: "best [industry] software landing page design"
```

From results, identify and document both angles:

**What's working (adopt or adapt):**
- **Proven hero patterns**: what are the top 2-3 competitors doing above the fold? If 2+ use the same approach (e.g. split-pane with product on right), that pattern converts in this category — use it as the baseline and differentiate through execution quality
- **Social proof formats that appear across multiple competitors**: logo strips, G2 badges, stat numbers — if everyone does it, users expect it
- **CTA patterns**: what's the dominant first CTA (free trial, get started, book demo)? Match this unless you have a specific reason not to

**What to avoid (cliches that make every competitor look identical):**
- **Dominant colors** in this category (the hue everyone defaults to)
- **Dark vs light** prevalence
- **Overused design motifs**: gradient blobs, generic dashboard screenshots, stock photos
- **One visual gap** — something no competitor is doing that would make this product stand out visually

Document in 5-6 sentences: 3 on what works, 2-3 on what to avoid. This directly informs Step 3 (color — differentiate from dominant hue), Step 4 (hero architecture — start from proven pattern, not blank canvas), and component choices.

---

## Step 3 — Color System

Select the palette based on personality + competitor research. The palette library below are starting points — adjust hue/lightness slightly to create distance from any competitor using the same base.

**Hard rules:**
- `hsl(213 94% 58%)` (electric blue) is banned unless this is a developer infrastructure tool
- `hsl(220 35% 4%)` (dark navy) is banned unless competitors actively avoid it
- Every color must have a written reason tied to the product's personality and users
- Mode (dark/light first) must match user environment — office workers get light-first, power users get dark-first

### Palette library by personality

**Enterprise Authority** (compliance, audit, legal)
```
Primary:    hsl(155 38% 36%)   -- Deep forest green: regulation, growth, stability
Background: hsl(150 20% 97%)   -- Off-white — light-first, office workers
Surface:    hsl(150 15% 100%)
Accent:     hsl(42 85% 52%)    -- Amber: deadline urgency, warnings
Mode: light-first | Reference: Xero, MYOB, ServiceNSW
```

**Data Intelligence** (analytics, monitoring, CI)
```
Primary:    hsl(199 92% 52%)   -- Electric cyan: precision, data, signal
Background: hsl(220 40% 4%)    -- Deep navy — dark-first, terminal users
Surface:    hsl(222 32% 8%)
Accent:     hsl(142 68% 45%)   -- Green: positive signals, upward trends
Mode: dark-first | Reference: Datadog, Grafana, Linear
```

**Trusted Productivity** (HR, PM, CRM)
```
Primary:    hsl(175 55% 42%)   -- Teal: collaboration, forward motion, trust
Background: hsl(180 20% 97%)   -- Warm white — light-first
Surface:    hsl(180 15% 100%)
Accent:     hsl(38 90% 55%)    -- Orange: priority, action, urgency
Mode: light-first | Reference: Notion, Asana, Intercom
```

**Premium Professional** (property, consulting, advisory)
```
Primary:    hsl(42 82% 48%)    -- Warm gold: value, premium, opportunity
Background: hsl(220 25% 7%)    -- Dark charcoal — dark-first, premium feel
Surface:    hsl(220 20% 11%)
Accent:     hsl(0 0% 95%)      -- Near-white: borders, secondary text
Mode: dark-first | Reference: Stripe, Mercury, CBRE
```

**Bold Operator** (trades, construction, logistics)
```
Primary:    hsl(25 88% 50%)    -- Strong orange: action, reliability, energy
Background: hsl(220 18% 8%)    -- Dark charcoal — dark-first, outdoor high contrast
Surface:    hsl(220 15% 12%)
Accent:     hsl(200 80% 55%)   -- Sky blue: secondary actions
Mode: dark-first | Reference: SafetyCulture, Procore, ServiceNow
```

**Health & Care** (aged care, NDIS, health)
```
Primary:    hsl(155 48% 42%)   -- Sage green: life, care, wellbeing
Background: hsl(150 30% 97%)   -- Soft warm white — light-first, accessible
Surface:    hsl(0 0% 100%)
Accent:     hsl(200 65% 55%)   -- Calm blue: information, links
Mode: light-first | WCAG AA minimum | Reference: HealthEngine, HotDoc
```

**Growth Engine** (marketing SaaS, sales tools, creator)
```
Primary:    hsl(270 75% 58%)   -- Purple: creativity, ambition, premium energy
Background: hsl(265 30% 6%)    -- Deep purple-black — dark-first
Surface:    hsl(265 25% 10%)
Accent:     hsl(340 80% 58%)   -- Hot pink: CTAs, highlights, conversion moments
Mode: dark-first | Reference: Webflow, Figma, Beehiiv
```

**Civic/Government** (migration, public records, government)
```
Primary:    hsl(210 78% 42%)   -- Institutional blue: authority, trust, access
Background: hsl(0 0% 98%)      -- Clean white — light-first, high accessibility
Surface:    hsl(210 20% 97%)
Accent:     hsl(25 80% 50%)    -- Warm orange: actions, urgency
Mode: light-first | WCAG AA mandatory | Reference: Australia.gov.au, ServiceNSW
```

---

## Step 4 — Typography Lock

Select the font pairing based on personality. These are free Google Fonts — specify the import in DESIGN-BRIEF.md.

| Personality | Display / Heading font | Body font | Character |
|---|---|---|---|
| Enterprise Authority | DM Sans | Inter | Clean, official, no-nonsense |
| Data Intelligence | Space Mono (accents only) | Inter | Terminal precision with readable body |
| Trusted Productivity | Plus Jakarta Sans | Plus Jakarta Sans | Warm, modern, consistent |
| Premium Professional | Fraunces | Inter | Editorial serif display + clean body |
| Bold Operator | Space Grotesk | Inter | Strong, wide, construction-grade |
| Health & Care | Nunito | Plus Jakarta Sans | Rounded, warm, approachable |
| Growth Engine | Cal Sans | Plus Jakarta Sans | Bold display energy + modern body |
| Civic/Government | Source Sans 3 | Source Sans 3 | Institutional, readable, accessible |

**Heading scale (lock these in DESIGN-BRIEF.md):**
- Display (hero headline): `clamp(3rem, 6vw, 5rem)` — never smaller
- Title (section headings): `clamp(1.75rem, 3vw, 2.5rem)`
- Subheading: `1.125rem`
- Body: `1rem`
- Caption: `0.875rem`

**Letter spacing:**
- Enterprise/Civic: `letter-spacing: -0.01em` (tight but not aggressive)
- Growth/Bold/Premium: `letter-spacing: -0.03em` (aggressive tight — modern feel)
- Health/Productivity: `letter-spacing: 0` (normal — warmth and readability)

---

## Step 5 — Hero Architecture Decision

Choose the hero layout pattern before calling MCP. The pattern determines the visual structure of the most important section on the site.

| Pattern | Best for | Description |
|---|---|---|
| **Centered** | Enterprise Authority, Trusted Productivity, Civic | Headline centered, subheadline centered, CTAs centered, product mockup full-width below fold |
| **Split-pane** | Data Intelligence, AI products, Growth Engine | Text block left (40%), animated product output right (60%) — typewriter or live data |
| **Full-screen immersive** | Bold Operator, Premium Professional | Background fills viewport, headline overlaid large, single CTA, product mockup inset — add subtle film grain overlay (opacity 0.03-0.05) for texture |
| **Minimal editorial** | Premium Professional (alternative), Health & Care | Giant display typography dominant, minimal visual, emotional photography or soft illustration |

Lock this choice in DESIGN-BRIEF.md. It drives the hero MCP query in Step 6.

---

## Step 6 — 21st.dev Component Lock

**This is the most important step.** Run `mcp__magic__21st_magic_component_inspiration` for every mandatory landing page section. For each, apply the selection criteria below to choose the specific variant. Lock every choice in DESIGN-BRIEF.md.

**Tool usage rule:** Only `mcp__magic__21st_magic_component_inspiration` is called in this research phase. `mcp__magic__21st_magic_component_builder` is NEVER called here — it is called by build skills (web-scaffold, web-page) when constructing the actual component from the locked name.

Build skills DO NOT re-run these queries. They read the locked choices from DESIGN-BRIEF.md and execute.

### Selection criteria by personality

| Personality | Visual weight | Animation level | Layout preference |
|---|---|---|---|
| Enterprise Authority | Light — lots of whitespace | Minimal — entrance only, no loops | Grid-based, structured, symmetric |
| Data Intelligence | Dense — information rich | Moderate — data animations, counters | Dark cards, chart elements, monospace accents |
| Trusted Productivity | Medium — airy but content-rich | Subtle — hover states, smooth transitions | Clean columns, task-list feel |
| Premium Professional | Heavy visual impact | Low — quality over motion | Full-bleed, large typography, editorial |
| Bold Operator | High contrast, punchy | Moderate — bold hover, strong CTAs | Large cards, strong borders, action-oriented |
| Health & Care | Light and soft | Very low — gentle only | Rounded cards, icons, warm imagery |
| Growth Engine | Visually intense | High — animated gradients, particles | Bold sections, gradient borders, glow effects |
| Civic/Government | Clean and minimal | None — static layouts | Table-like, structured, accessibility-first |

### Run these 11 MCP queries — one per section

For each query below: replace `[PRODUCT-SPECIFIC]` with the format `[dark/light mode] [personality keyword] [product category]` from Steps 1 and 3. The mode descriptor comes first to bias MCP results toward the correct visual register.

**Example replacements:**
- Enterprise Authority + AML compliance: "clean light compliance", "enterprise authority"
- Data Intelligence + analytics: "dark cyan data", "dark analytics dashboard"
- Growth Engine + marketing SaaS: "bold animated dark marketing", "growth engine purple"

---

**Query 1 — Animated Background**
```
searchQuery: "[PRODUCT-SPECIFIC] animated background [dark/light]"
```
Pick from results based on:
- Enterprise/Civic: subtle grid lines or very slow particle drift — opacity max 0.1
- Data/Growth: active WebGL blobs or particle network — opacity 0.15-0.2
- Health/Productivity: soft gradient wave, no particles — opacity 0.08
- Bold/Premium: geometric grid or blueprint lines — opacity 0.12

Default if nothing product-specific found: `BackgroundGradientAnimation` at `opacity: 0.15`

---

**Query 2 — Navigation Header**
```
searchQuery: "[PRODUCT-SPECIFIC] navigation header [dark/light] [mode]"
```
Pick from results based on:
- Scroll-aware behavior (blur on scroll) preferred for all personality types
- Enterprise/Civic: logo left, nav links center, CTA right — no mobile hamburger drama
- Data/Growth: sticky dark nav with glow on scroll
- Health/Productivity: simple, clean, minimal height

Default if nothing fits: `HeroSection 2` header extraction

---

**Query 3 — Hero Section**
```
searchQuery: "[hero pattern from Step 5] hero [personality adjective] [product category]"
```
Examples:
- "centered hero clean enterprise compliance"
- "split pane hero dark data analytics typewriter"
- "full screen hero bold orange trades"
- "minimal editorial hero premium property dark"

Pick from results based on the architecture decision in Step 5. The hero component must match the chosen pattern.

Default if MCP returns nothing: `HeroSection 2` with `AnimatedGroup` spring blur entrance (centered layout).

---

**Query 4 — Logo Cloud**
```
searchQuery: "logo cloud marquee [dark/light] [personality adjective]"
```
Pick from results based on:
- Enterprise/Civic: static logos, two rows, no animation — credibility over motion
- Data/Growth/Bold: `InfiniteSlider` with `ProgressiveBlur` fade edges — momentum feel
- Health/Productivity: slow marquee, muted logos, soft fade

Default: `Logo Cloud 4` (InfiniteSlider + ProgressiveBlur) for dynamic personalities

---

**Query 5 — Stats / CountUp**
```
searchQuery: "stats metrics animated counter [dark/light] [personality adjective]"
```
Pick from results based on:
- All personalities: `react-countup` with `enableScrollSpy` is mandatory — static numbers are dead
- Enterprise/Civic: minimal layout, 3 numbers, muted section bg
- Data/Growth: add chart sparklines or trend arrows alongside numbers
- Health: soft bg, rounded numbers with icon context

Default: `CaseStudies` component with CountUp integration

---

**Query 6 — Features Section**
```
searchQuery: "features section [personality adjective] [layout style] [dark/light]"
```
Layout style to include in query:
- Enterprise/Civic/Health: "grid cards clean"
- Data/Growth: "bento grid dark animated hover"
- Productivity: "feature list icon text minimal"
- Bold: "feature cards high contrast bordered"
- Premium: "feature showcase editorial large"

Pick from results based on:
- Data/Growth: `BentoGrid` — hero feature spans 2 columns with screenshot/animation
- Enterprise/Productivity/Health: `Features 4` border-grid — clean, equal cards
- Bold/Premium: large feature blocks with strong visual hierarchy

Default if MCP returns nothing: `Features 4` border-grid (Enterprise/Productivity/Health) or `BentoGrid` (Data/Growth).

---

**Query 7 — Testimonials**
```
searchQuery: "testimonials social proof [personality adjective] [dark/light]"
```
Pick from results based on:
- Enterprise/Civic: company logo + name + role prominent — authority signals
- Data/Growth: animated slider with avatar, stars, `AnimatePresence` transitions
- Health: warm photography, care-focused testimonials, soft card bg
- Bold: outcome-focused ("saved 4 hours a week"), contractor/operator names

Default: `TestimonialSlider` with `AnimatePresence`

---

**Query 8 — Pricing**
```
searchQuery: "pricing cards [personality adjective] [dark/light] [tier count] plans"
```
Pick from results based on:
- Enterprise: light cards, minimal decoration, emphasis on feature comparison table
- Data/Growth: glass-effect dark cards, glow on popular tier, bold price display
- Health/Productivity: soft cards, checkmarks, emphasis on simplicity
- Bold/Premium: high-contrast, outcome-focused plan names

Default: `PricingCard` with `backdrop-blur` glass effect

---

**Query 9 — FAQ Accordion**
```
searchQuery: "FAQ accordion [personality adjective] [dark/light]"
```
Pick from results based on:
- Enterprise/Civic: single-column, structured, compact — professional document feel
- Data/Growth: two-column layout with category tabs (General / Billing / Technical)
- Health/Productivity: rounded cards, friendly tone, single column

Default: `Faqs 1` (single column) — use `RuixenAccordian02` for two-column when product has complex FAQ needs

---

**Query 10 — Final CTA Section**
```
searchQuery: "call to action section [personality adjective] [dark/light]"
```
Pick from results based on:
- Enterprise: benefit checklist right side, muted background, professional copy
- Growth/Bold: full-width gradient section, large headline, single high-contrast CTA
- Health: soft background, reassurance copy, no pressure CTA

Default: `Cta 4`

---

**Query 11 — Footer**
```
searchQuery: "footer [personality adjective] [dark/light] multi-column"
```
Pick from results based on:
- All personalities: multi-column layout (logo+tagline + 3-4 link columns + legal row)
- Enterprise/Civic: light bg, minimal, regulatory disclaimers prominent
- Growth/Bold: dark bg, social icons prominent, newsletter signup optional

Default: `Footer 2` multi-column

---

---

**Query 0 (Optional) — Announcement Banner**
Run only if product has a launch announcement, active promotion, or breaking news.
```
searchQuery: "announcement banner [dark/light] dismissible top"
```
Default: `Banner 1` (single line, dismissible, top of page above nav).

---

**Query 11b (Optional) — Waitlist / Pre-launch Hero**
Run only if product is pre-launch or collecting signups before going live.
```
searchQuery: "waitlist signup hero [personality adjective] [dark/light]"
```
Default: `WaitlistHero` with `WaitlistForm` — email input + submit + counter showing signups so far.

---

**After all queries:** For each section, record:
- Which component was selected
- Which query returned it
- One-sentence reason why it fits this product's personality (not generic)

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

// Usage inside a React component:
function LottieEmptyState({ src, height = 120 }: { src: string; height?: number }) {
  const shouldReduce = useReducedMotion()
  if (shouldReduce) return null
  return <Player autoplay loop src={src} style={{ height: `${height}px` }} />
}
```

If no exact match found: note the search terms used and closest alternatives. Never skip — even a close match is better than a generic icon.

---

## Step 8 — Differentiation Audit

Before writing DESIGN-BRIEF.md, run this check against recent products.

Use Glob with pattern `~/.claude/projects/*/memory/*.md` to find all project memory files on this machine. Read any that reference a SaaS product built with this suite — identify the last 2-3 products and their recorded color choices.

If memory files exist but contain no color data: check for `DESIGN-BRIEF.md` files in sibling project directories. If none found, skip the color dimension of this audit, document "no prior builds found" in DESIGN-BRIEF.md, and continue.

For each of these 5 dimensions, confirm this product makes a **different choice** from recent builds:

| Dimension | This product's choice | Different from recent builds? |
|---|---|---|
| Primary color hue | `hsl([H] ...)` | Yes / No — [name the conflict if No] |
| Background mode | dark-first / light-first | Yes / No |
| Hero pattern | Centered / Split-pane / Full-screen / Minimal | Yes / No |
| Features layout | Border-grid / BentoGrid / List / Editorial | Yes / No |
| Section count | Micro (5) / Standard (9) / Full (11) | Yes / No |

If any dimension conflicts with a recent product: change this product's choice before locking. Two consecutive dark-first enterprise products in similar hues is a failure of this phase.

**Resolving color conflicts:** If the personality-matched palette hue is already taken by a recent build, shift the primary hue by +20 to -20 degrees before locking. For example, if last build used `hsl(155 38% 36%)` forest green and this product also maps to Enterprise Authority, shift to `hsl(175 38% 36%)` teal-green or `hsl(135 38% 36%)` emerald — same personality register, different visual identity. Document the shift reason in DESIGN-BRIEF.md.

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

## Step 9b — Dashboard Design (run only if product has a /dashboard route)

If the marketing site structure includes a `/dashboard` route, run the `dashboard-design` skill now to lock the dashboard layout before build starts. Do not skip this — dashboard design decisions made at build time without a spec produce inconsistent, low-quality app interiors.

Read `~/.claude/skills/dashboard-design/SKILL.md` and complete the following from it:

1. **Category classification** — which of the 8 dashboard categories fits this product? (Analytics, Operations, Finance, HR, CRM, DevOps, Health, Civic)
2. **Layout pattern** — Sidebar nav or Top nav? Single-panel or split-panel? Choose based on feature count and user workflow
3. **KPI card spec** — how many KPI cards on the primary dashboard? What metric + sparkline does each show?
4. **Primary chart type** — what is the hero chart for this product? (Area, Bar, Funnel, Heatmap, Table)
5. **Empty state design** — what does the dashboard look like for a brand new user with zero data? Must have a CTA.

Add a `## Dashboard Design` section to DESIGN-BRIEF.md with these 5 decisions locked. `web-page` reads this when building `/dashboard`.

---

## Step 10 — Write DESIGN-BRIEF.md

Write to project root. This file is the single source of truth. Build skills read it — they do not re-research.

```markdown
# [Product Name] — Design Brief

> This file is locked at research time. web-scaffold and web-page read it and execute — they do not re-run MCP queries or change component choices.

## Product Personality
- **Personality type:** [one of 8]
- **User emotion on open:** [what they feel]
- **3-second message:** [what design communicates instantly]
- **Mode:** dark-first | light-first
- **Why this mode:** [tied to user environment]

## Color System
- **Primary:** hsl([H] [S]% [L]%) — [color name + reason it fits this product]
- **Background:** hsl([H] [S]% [L]%)
- **Surface:** hsl([H] [S]% [L]%)
- **Accent:** hsl([H] [S]% [L]%) — [use case]
- **Color job:** Primary used ONLY for [CTA buttons] and [active nav]. Accent used for [warnings/highlights].
- **Rejected:** hsl(213 94% 58%) electric blue — [reason rejected for this product]
- **Rejected:** hsl(220 35% 4%) dark navy — [reason rejected, or "used — justified by: [reason]"]

## Typography
- **Display font:** [font name] — [reason it fits personality]
- **Body font:** [font name]
- **Heading weight:** 700 | 800
- **Display tracking:** [tight -0.03em | normal | standard -0.01em]
- **Google Fonts import:** `[full @import URL]`

## Hero Architecture
- **Pattern:** Centered | Split-pane | Full-screen | Minimal editorial
- **Why:** [one sentence tied to personality + user type]
- **Product visual:** Browser mockup | Lottie animation | Split-pane output | Large typography only

## Component Lock — 21st.dev (read by web-scaffold and web-page — do not override)

| Section | Component chosen | Query used | Why this product |
|---|---|---|---|
| Animated background | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Navigation | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Hero | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Logo cloud | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Stats / CountUp | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Features | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Testimonials | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Pricing | [component name] | `[exact searchQuery]` | [product-specific reason] |
| FAQ | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Final CTA | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Footer | [component name] | `[exact searchQuery]` | [product-specific reason] |
| Banner (optional) | [component name or N/A] | `[exact searchQuery or —]` | [reason included / excluded] |
| Waitlist (optional) | [component name or N/A] | `[exact searchQuery or —]` | [reason included / excluded] |

## LottieFiles Animations
1. **Empty state ([page]):** [URL or description] — trigger: [condition]
2. **Success state:** [URL or description] — trigger: [condition]
3. **Processing state:** [URL or description] — trigger: [condition]

## Competitor Research
- **Dominant color in category:** [hue + why we're avoiding it]
- **Mode prevalence:** [dark-first / light-first / mixed in this category]
- **Patterns that convert (adopt):** [2-3 things all top competitors do that we'll match]
- **Clichés to avoid:** [2-3 things every competitor does that we will not]
- **Visual gap (opportunity):** [one thing no competitor is doing that we'll own]

## Design References
- **Primary:** [site] — borrow [specific elements e.g. "their card hover states and sidebar density"]
- **Secondary:** [site] — borrow [specific elements]

## Marketing Site Structure
**Tier:** [1 | 2 | 3]

**Public routes:**
- `/` — [one-line brief]
- `/features` — [one-line brief]
- `/pricing` — [one-line brief]
- `/auth` — Auth

**App routes:**
- `/dashboard` — [one-line brief]
- `/setup` — Onboarding wizard
- `/settings` — Profile, billing, team, danger zone
- [additional feature routes]

## Differentiation Audit (vs recent builds)
| Dimension | This product | Last build | Different? |
|---|---|---|---|
| Primary color | hsl([H]...) [name] | hsl([H]...) [name] | Yes / No |
| Mode | dark/light | dark/light | Yes / No |
| Hero pattern | [pattern] | [pattern] | Yes / No |
| Features layout | [layout] | [layout] | Yes / No |
| Section count | Micro (5) / Standard (9) / Full (11) | [last build count] | Yes / No |

## Dashboard Design (if /dashboard exists)
- **Category:** [Analytics / Operations / Finance / HR / CRM / DevOps / Health / Civic]
- **Layout:** [Sidebar nav | Top nav] + [Single-panel | Split-panel]
- **KPI cards:** [N cards — metric names + sparkline type each]
- **Hero chart:** [chart type + what it shows]
- **Empty state:** [what new user sees + CTA text]

## Design Anti-Patterns (banned for this product)
- Electric blue primary — [reason]
- Dark navy background — [reason, or "approved — justified by [reason]"]
- Gradient blob hero visual — always replaced with real product mockup or lottie
- [Any product-specific anti-patterns from competitor research]

## Build Order
1. `/` (full landing page — all sections from Component Lock)
2. `/features`
3. `/pricing`
4. `/auth`
5. `/setup` (onboarding wizard)
6. `/dashboard`
7. [feature pages by priority]
8. `/settings` (last)
```

---

## Completion Checklist

Before handoff to `/web-scope`:

- [ ] Personality type identified and justified
- [ ] 4 WebSearch competitor queries run — findings documented (color, mode, clichés)
- [ ] Color palette selected with explicit rejection of defaults + reasons
- [ ] Typography pair locked (not just "Inter")
- [ ] Hero architecture pattern chosen (Centered / Split-pane / Full-screen / Minimal)
- [ ] All 11 MCP queries run — one per mandatory section
- [ ] Each component choice recorded with query used + product-specific reason
- [ ] 3 LottieFiles animations found (or closest alternatives noted)
- [ ] Differentiation audit passed — 3+ dimensions differ from last build
- [ ] Marketing tier chosen (1/2/3)
- [ ] DESIGN-BRIEF.md written to project root with Component Lock table complete

**If any item is unchecked: do not hand off. Complete it first.**

---

## Handoff to /web-scope

Output this summary:

```
DESIGN-BRIEF.md written and locked.

Product: [name]
Personality: [type]
Mode: [dark/light]-first
Primary: hsl([value]) — [name]
Hero pattern: [Centered | Split-pane | Full-screen | Minimal]
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
