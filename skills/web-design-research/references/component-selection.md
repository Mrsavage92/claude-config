# Component Selection — 21st.dev MCP Queries

Full component research reference for `/web-design-research` Step 6.

**Tool usage rule:** Only `mcp__magic__21st_magic_component_inspiration` is called in this research phase. `mcp__magic__21st_magic_component_builder` is NEVER called here — it is called by build skills (web-scaffold, web-page) when constructing the actual component from the locked name.

Build skills DO NOT re-run these queries. They read the locked choices from DESIGN-BRIEF.md and execute.

---

## Selection Criteria by Personality

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

---

## Query Format

For each query below: replace `[PRODUCT-SPECIFIC]` with the format `[dark/light mode] [personality keyword] [product category]` from Steps 1 and 3. The mode descriptor comes first to bias MCP results toward the correct visual register.

**Example replacements:**
- Enterprise Authority + AML compliance: "clean light compliance", "enterprise authority"
- Data Intelligence + analytics: "dark cyan data", "dark analytics dashboard"
- Growth Engine + marketing SaaS: "bold animated dark marketing", "growth engine purple"

---

## The 11 Mandatory MCP Queries

### Query 1 — Animated Background
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

### Query 2 — Navigation Header
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

### Query 3 — Hero Section
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

### Query 4 — Logo Cloud
```
searchQuery: "logo cloud marquee [dark/light] [personality adjective]"
```
Pick from results based on:
- Enterprise/Civic: static logos, two rows, no animation — credibility over motion
- Data/Growth/Bold: `InfiniteSlider` with `ProgressiveBlur` fade edges — momentum feel
- Health/Productivity: slow marquee, muted logos, soft fade

Default: `Logo Cloud 4` (InfiniteSlider + ProgressiveBlur) for dynamic personalities

---

### Query 5 — Stats / CountUp
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

### Query 6 — Features Section
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

### Query 7 — Testimonials
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

### Query 8 — Pricing
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

### Query 9 — FAQ Accordion
```
searchQuery: "FAQ accordion [personality adjective] [dark/light]"
```
Pick from results based on:
- Enterprise/Civic: single-column, structured, compact — professional document feel
- Data/Growth: two-column layout with category tabs (General / Billing / Technical)
- Health/Productivity: rounded cards, friendly tone, single column

Default: `Faqs 1` (single column) — use `RuixenAccordian02` for two-column when product has complex FAQ needs

---

### Query 10 — Final CTA Section
```
searchQuery: "call to action section [personality adjective] [dark/light]"
```
Pick from results based on:
- Enterprise: benefit checklist right side, muted background, professional copy
- Growth/Bold: full-width gradient section, large headline, single high-contrast CTA
- Health: soft background, reassurance copy, no pressure CTA

Default: `Cta 4`

---

### Query 11 — Footer
```
searchQuery: "footer [personality adjective] [dark/light] multi-column"
```
Pick from results based on:
- All personalities: multi-column layout (logo+tagline + 3-4 link columns + legal row)
- Enterprise/Civic: light bg, minimal, regulatory disclaimers prominent
- Growth/Bold: dark bg, social icons prominent, newsletter signup optional

Default: `Footer 2` multi-column

---

## Optional Queries

### Query 0 — Announcement Banner
Run only if product has a launch announcement, active promotion, or breaking news.
```
searchQuery: "announcement banner [dark/light] dismissible top"
```
Default: `Banner 1` (single line, dismissible, top of page above nav).

### Query 11b — Waitlist / Pre-launch Hero
Run only if product is pre-launch or collecting signups before going live.
```
searchQuery: "waitlist signup hero [personality adjective] [dark/light]"
```
Default: `WaitlistHero` with `WaitlistForm` — email input + submit + counter showing signups so far.

---

## After All Queries

For each section, record:
- Which component was selected
- Which query returned it
- One-sentence reason why it fits this product's personality (not generic)
