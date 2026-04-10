# Component Memory — learnings from previous builds

Last updated: 2026-04-10
Builds recorded: 0 (seed file — will grow after each build)

Read this file during Phase 0a (Orient) and Phase 2 (Scaffold). Update it during Phase 7 (Gap Analysis) and Phase 8 (Handoff).

---

## 21st.dev Components

### TestimonialSlider
- Default star rating uses yellow-400 which clashes with most brand palettes
- Fix: replace with `text-brand` or `text-amber-500/80`
- Minimum 3 testimonials or the slider feels empty
- AnimatePresence mode="wait" prevents overlap during transition

### Features 4 (border-grid)
- Works well for: Enterprise Authority, Data Intelligence, Trusted Productivity
- Feels too rigid for: Health & Care, Growth Engine — use BentoGrid instead
- Border color: `border-border/30` not `border-border` — too heavy otherwise
- Icon backgrounds: `bg-primary/10 text-primary` — never `bg-primary text-white`

### BackgroundGradientAnimation
- WebGL blob — kills performance on mobile if not lazy-loaded
- Always wrap in React.lazy + Suspense
- Opacity: 0.15-0.20 or it distracts from hero content
- Some browsers show white flash before WebGL init — add bg-background as fallback

### PricingCard
- Center card needs `relative z-10` or glow goes behind adjacent cards
- "Popular" badge: `absolute -top-3 left-1/2 -translate-x-1/2` — never inline
- Glass effect: `backdrop-blur-xl bg-card/80` — not `bg-card` (too opaque)

### Logo Cloud 4 (InfiniteSlider)
- ProgressiveBlur on edges is the premium touch — never omit it
- Logo SVGs from svgl.app — search by brand name
- Minimum 8 logos or the marquee looks sparse
- Heading "Trusted by teams at" in text-muted-foreground — not text-foreground

### Faqs 1 (Accordion)
- Minimum 5 questions — fewer feels incomplete
- Questions should be real buyer objections, not feature descriptions
- Two-column (RuixenAccordian02) works for products with 8+ FAQs
- Put FAQ before Final CTA, never after

### CaseStudies (CountUp)
- react-countup with enableScrollSpy: true — numbers animate on scroll
- Minimum 3 stats — 4 is ideal
- Stats must be product-specific, never generic ("10,000+ users")
- Good: "47 hazard categories" / "$2.3M saved" / "89% faster compliance"

---

## Patterns That Work

### Hero entrance (Technique 3 STAGGER)
- 0.12s stagger for 4-5 elements
- 0.08s stagger for 6+ elements (0.12s feels too slow with many items)
- Product visual delay: 0.6s — loads last for dramatic effect
- Never stagger more than 7 elements — group smaller items

### Empty states
- Icon in muted circle + heading + description + CTA button
- CTA must include time estimate ("takes 2 minutes")
- Background: bg-muted/30 rounded-xl p-12 — generous, not cramped
- Never just text — always the full EmptyState component

### Color budget
- CTA button bg + active nav indicator = the 2 roles that work universally
- Primary on card borders fights with content — avoid
- Status dots (green/amber/red) don't count against color budget

### Landing page section spacing
- py-16 md:py-24 lg:py-32 between major sections
- Alternating bg (background / muted/50) creates visual rhythm
- Logo cloud and stats sections can be tighter (py-12 md:py-16)

---

## Patterns That Don't Work

### Dark hero for Health & Care products
- Category hard gate catches this every time — just start light-mode

### Generic stat numbers
- "10,000+ users" and "99.9% uptime" are so overused they're negative trust signals
- Product-specific stats always perform better

### Centered hero for data products
- Entity intelligence and procurement tools need search bar or data feed as hero primary element
- Centered hero with tagline looks wrong for these categories

### "Get Started" as CTA
- Every reference product uses a specific CTA: "Start deploying", "Get Notion free", "Start compliance check"
- Generic "Get Started" signals the builder didn't think about the product

---

## Enforcement Rules

**These are machine-readable. Phase 0a and Phase 0c (saas-improve) grep for every rule automatically.**
**Each rule was created from a real build failure. If it's here, it happened.**

```
RULE: no-key-index
GREP: key={i} OR key={index} in any .tsx file with .map(
FIX: use stable identity key (key={item.id}, key={item.slug})
SEVERITY: P1
ADDED: seed — universal React anti-pattern

RULE: no-generic-stats
GREP: "10,000+" OR "99.9%" OR "happy users" OR "satisfied customers" in landing page
FIX: use product-specific numbers from COPY.md metrics section
SEVERITY: P2
ADDED: seed — from golden-reference copy standards

RULE: no-dark-health
GREP: --background: 240 10% 3.9% in index.css WHEN category is Health & Care or WHS
FIX: use light-mode base (--background: 0 0% 100%)
SEVERITY: P1
ADDED: seed — category hard gate, confirmed by SafetyCulture/FlourishDx research

RULE: no-generic-cta
GREP: "Get Started" OR "Learn More" OR "Sign up" as button text without product context
FIX: use specific action from COPY.md (e.g., "Start compliance check", "Create first hazard")
SEVERITY: P2
ADDED: seed — from golden-reference copy standards

RULE: no-heavy-border
GREP: border-border (without /30 or /20 or /40 suffix) on feature grid cards
FIX: use border-border/30 — full opacity overpowers content
SEVERITY: P3
ADDED: seed — from component quirks
```

(New rules added automatically by Phase 8c after each build)

## Performance Learnings

(Entries added by Phase 6g post-deploy measurement)

## Cross-Build Analysis

**This section is auto-generated after 3+ builds.** Phase 0a reads it to weight decisions.

| Build | Category | Personality | Score | Hero pattern | Fix iterations | LCP |
|---|---|---|---|---|---|---|
| (populated after each build) | | | | | | |

**Best patterns (auto-derived):**
- Highest-scoring personality: (needs data)
- Fastest hero pattern (fewest Phase 5 fixes): (needs data)
- Components to avoid: (needs data)

## Per-Build Log

(Entries added automatically after each build — Phase 8c)
