# Golden Reference — SaaS Design Patterns Library

Read this file during Phase 0a (Orient) and Phase 2 (Scaffold). It contains proven patterns extracted from 10 benchmark SaaS products. Use these as the standard — not generic LLM defaults.

**This is not a template to copy identically.** Each product uses DESIGN-BRIEF.md personality + MARKET-BRIEF.md competitor data to select which patterns apply. The reference shows what excellent execution looks like across different personalities.

---

## Reference Products

| Product | Personality | Key pattern to learn |
|---|---|---|
| Linear | Dark premium minimalism | Ultra-concise copy, dot-grid animation, keyboard-first UX |
| Stripe | Trust through transparency | Hard metrics in hero, gradient mesh, AU-localized |
| Vercel | Sophisticated platform | Navigation architecture, orchestrated scroll reveals |
| Notion | Approachable enterprise | Bento cards, cost calculator, warm copy tone |
| Vanta | Compliance authority | Sells trust without being boring, purple accent, IDC badges |
| Raycast | Visual wow | 3D glass hero, testimonial-with-favorite-feature |
| SafetyCulture | AU compliance (light mode) | Industry segmentation, field-worker photography, AU logos |
| Loom | Product-as-hero | Embeds actual product in landing, multi-color feature accents |
| Cal.com | Compliance-forward | SOC 2/HIPAA/GDPR badges in hero, named authority testimonials |
| Loops | Focused simplicity | Minimal animation, tight copy, API code as trust signal |

---

## Hero Patterns (pick one per product based on personality + category)

### Pattern 1: Declarative Minimum (Linear, Loops)
```
Structure: short headline (4-8 words) + one-line sub + single CTA
Background: dark, animated dot-grid or subtle gradient
Animation: stagger entrance, 0.12s between elements
Copy tone: declarative, no marketing fluff — "Plan. Build. Ship."
```
**Use for:** Developer tools, technical products, Enterprise Authority personality

### Pattern 2: Metrics-Led Trust (Stripe, Vanta)
```
Structure: outcome headline + sub with specific metric + dual CTAs + logo strip
Background: gradient mesh animation (2-3 hues at 10-20% opacity)
Social proof: hard numbers immediately visible — "$1.9tn processed", "15,000+ customers"
Copy tone: enterprise-grade but readable, balances technical depth with business outcomes
```
**Use for:** Fintech, compliance, security products, Enterprise Authority / Trusted Productivity

### Pattern 3: Product Visual (Notion, Loom, SafetyCulture)
```
Structure: benefit headline + sub + dual CTAs + product screenshot/video below
Background: light or dark, minimal — the product visual IS the hero
Visual: real product UI, not abstract shapes — dashboard mockup, video embed, or bento grid
Copy tone: warm, human, approachable — "A better way of working"
```
**Use for:** Productivity, operations, team tools, Health & Care / Trusted Productivity

### Pattern 4: Urgency + Compliance (Cal.com, Vanta)
```
Structure: deadline/compliance headline + badges row + CTA
Badges: SOC 2, HIPAA, GDPR, ISO 27001 — visible in or immediately below hero
Copy tone: authoritative but not scary — "Get compliant by [date]"
```
**Use for:** AML/CTF, WHS, privacy, regulatory compliance products

### Pattern 5: Visual Spectacle (Raycast)
```
Structure: short headline + 3D animated element (WebGL cube, morphing shape)
Background: deep navy/black with electric accent colors
Animation: real-time 3D rotation, chromatic aberration, glass-morphism
Copy tone: punchy, feature-focused
```
**Use for:** Consumer products needing differentiation, Bold Operator personality

---

## Social Proof Patterns

### Logo Strip (Stripe, Notion, SafetyCulture, Loops)
```
Format: InfiniteSlider marquee with ProgressiveBlur edges
Position: immediately below hero, before any content
Heading: "Trusted by teams at" (muted text)
Count: 8-12 logos minimum, recognisable brands
AU products: use Qantas, Coles, Toyota, Telstra, CBA, BHP, Woolworths
```

### Hard Metrics Bar (Stripe, SafetyCulture, Notion)
```
Format: 3-4 large animated numbers with CountUp + enableScrollSpy
Examples: "$1.9tn processed" / "76,000+ organisations" / "1 billion+ checks"
Position: between logo strip and features
Rule: numbers must be real and specific to the product — never "10,000+ happy users"
```

### Named Authority Testimonials (Cal.com, Raycast)
```
Format: photo + name + role + company + specific quote
Best practice: include competitive positioning — "More elegant than [competitor]"
Raycast pattern: testimonial card with "Favorite Feature" callout per person
Position: between features and pricing
```

### Compliance Badges (Cal.com, Vanta)
```
Format: row of certification badges (SOC 2, ISO 27001, GDPR, etc.)
Position: in hero OR immediately below hero — above the fold
Why: for compliance products, badges ARE the social proof
AU equivalents: Privacy Act, APRA, AUSTRAC, SafeWork, NDIS registered
```

---

## Features Section Patterns

### Border Grid (Linear, Loops — Enterprise/Technical)
```
Layout: 2x3 or 3x2 grid with visible border lines
Each card: icon + title (semibold) + 2-sentence description
Animation: whileInView stagger 0.08s
Tone: feature-focused, no marketing adjectives
```

### Bento Grid (Notion, Raycast — Consumer/Productivity)
```
Layout: asymmetric grid, hero feature spans 2 columns
Each card: screenshot/demo + title + description
Interaction: hover to reveal detail, flip animation
Tone: "show don't tell" — embed product UI in the cards
```

### Industry Segmentation (SafetyCulture — Compliance/Operations)
```
Layout: horizontal cards or tabs, one per industry vertical
Each card: industry name + relevant image + "X templates" or "X customers"
Industries: Manufacturing, Construction, Hospitality, Healthcare, Retail, etc.
Why: B2B products serve multiple verticals — show them you understand each
```

---

## Pricing Patterns

### Three-Tier Glass Cards (Stripe, Cal.com)
```
Layout: 3 cards, center card elevated with "Popular" badge
Style: backdrop-blur-xl bg-card/80, center gets border-primary/50
Each: plan name, price, description, feature list with CheckCircle2, CTA
```

### Free Tier Prominent (SafetyCulture, Loom, Cal.com)
```
Hero CTA: "Get [Product] for free" — not "Start free trial"
Pricing page: free tier clearly defined, upgrade path obvious
Why: AU SMBs prefer to try before committing
```

### Sales-Led with Demo (Vanta)
```
No public pricing — "Book a demo" as primary CTA
Hero includes segmented lead form: "How can we help?" dropdown
Why: enterprise compliance products often need sales qualification
```

---

## Dashboard / App Patterns

### KPI Cards + Data Table (Linear, Vercel)
```
Top: 3-4 KPI cards with sparkline and trend indicator
Below: data table with status dots, row actions, bulk select
Sidebar: icon-only on collapse, full labels on expand
Animation: stagger 0.08s on KPI card entrance
```

### Getting Started Track (Notion, Loom)
```
Position: top of dashboard for users with < 3 actions completed
Format: checklist with progress bar — "3 of 5 steps complete"
Each step: action name + "takes 2 min" estimate + CTA button
Dismissible: "Skip setup" link, but track in analytics
```

### Empty States (all products)
```
Format: muted icon in circle + heading + description + CTA button
Heading: tells user what this page WILL show — not "No data"
Description: specific next action with time estimate
CTA: exact verb — "Create your first [entity]" not "Get Started"
Background: bg-muted/30 rounded-xl p-12 — generous, not cramped
```

---

## Copy Quality Standards (extracted from the best)

### What Linear does
- "Plan. Build. Ship." — 3 words, complete product description
- Zero adjectives. Zero "AI-powered." Zero "streamline."
- Every word earns its place

### What Stripe does
- "$1.9 trillion" — leads with the biggest number
- "Financial infrastructure to grow your revenue" — outcome, not feature
- Technical depth available but not forced on you

### What SafetyCulture does
- "A better way of working" — warm, inclusive
- Industry-specific copy per vertical — not one-size-fits-all
- "76,000+ organisations" then immediately shows Qantas/Toyota

### What Cal.com does
- "More elegant than Calendly, more open than SavvyCal" — names competitors
- Compliance badges speak louder than copy — shows, doesn't tell
- Named CEO testimonials carry more weight than anonymous quotes

### The anti-pattern (what none of them do)
- None say "Streamline your workflow"
- None say "All-in-one platform"
- None say "AI-powered" without showing the AI doing something
- None use "Get Started" as a CTA — each is specific to the product
- None have generic empty states ("No data found")
