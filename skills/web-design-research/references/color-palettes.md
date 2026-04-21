# Color Palettes by Personality Type

Full palette library for `/web-design-research`. Selected in Step 3 based on personality + competitor research. These are starting points — adjust hue/lightness slightly to create distance from any competitor using the same base.

**Hard rules:**
- `hsl(213 94% 58%)` (electric blue) is banned unless this is a developer infrastructure tool
- `hsl(220 35% 4%)` (dark navy) is banned unless competitors actively avoid it
- Every color must have a written reason tied to the product's personality and users
- Mode (dark/light first) must match user environment — office workers get light-first, power users get dark-first

---

## Enterprise Authority (compliance, audit, legal)
```
Primary:    hsl(155 38% 36%)   -- Deep forest green: regulation, growth, stability
Background: hsl(150 20% 97%)   -- Off-white — light-first, office workers
Surface:    hsl(150 15% 100%)
Accent:     hsl(42 85% 52%)    -- Amber: deadline urgency, warnings
Mode: light-first | Reference: Xero, MYOB, ServiceNSW
```

## Data Intelligence (analytics, monitoring, CI)
```
Primary:    hsl(199 92% 52%)   -- Electric cyan: precision, data, signal
Background: hsl(220 40% 4%)    -- Deep navy — dark-first, terminal users
Surface:    hsl(222 32% 8%)
Accent:     hsl(142 68% 45%)   -- Green: positive signals, upward trends
Mode: dark-first | Reference: Datadog, Grafana, Linear
```

## Trusted Productivity (HR, PM, CRM)
```
Primary:    hsl(175 55% 42%)   -- Teal: collaboration, forward motion, trust
Background: hsl(180 20% 97%)   -- Warm white — light-first
Surface:    hsl(180 15% 100%)
Accent:     hsl(38 90% 55%)    -- Orange: priority, action, urgency
Mode: light-first | Reference: Notion, Asana, Intercom
```

## Premium Professional (property, consulting, advisory)
```
Primary:    hsl(42 82% 48%)    -- Warm gold: value, premium, opportunity
Background: hsl(220 25% 7%)    -- Dark charcoal — dark-first, premium feel
Surface:    hsl(220 20% 11%)
Accent:     hsl(0 0% 95%)      -- Near-white: borders, secondary text
Mode: dark-first | Reference: Stripe, Mercury, CBRE
```

## Bold Operator (trades, construction, logistics)
```
Primary:    hsl(25 88% 50%)    -- Strong orange: action, reliability, energy
Background: hsl(220 18% 8%)    -- Dark charcoal — dark-first, outdoor high contrast
Surface:    hsl(220 15% 12%)
Accent:     hsl(200 80% 55%)   -- Sky blue: secondary actions
Mode: dark-first | Reference: SafetyCulture, Procore, ServiceNow
```

## Health & Care (aged care, NDIS, health)
```
Primary:    hsl(155 48% 42%)   -- Sage green: life, care, wellbeing
Background: hsl(150 30% 97%)   -- Soft warm white — light-first, accessible
Surface:    hsl(0 0% 100%)
Accent:     hsl(200 65% 55%)   -- Calm blue: information, links
Mode: light-first | WCAG AA minimum | Reference: HealthEngine, HotDoc
```

## Growth Engine (marketing SaaS, sales tools, creator)
```
Primary:    hsl(270 75% 58%)   -- Purple: creativity, ambition, premium energy
Background: hsl(265 30% 6%)    -- Deep purple-black — dark-first
Surface:    hsl(265 25% 10%)
Accent:     hsl(340 80% 58%)   -- Hot pink: CTAs, highlights, conversion moments
Mode: dark-first | Reference: Webflow, Figma, Beehiiv
```

## Civic/Government (migration, public records, government)
```
Primary:    hsl(210 78% 42%)   -- Institutional blue: authority, trust, access
Background: hsl(0 0% 98%)      -- Clean white — light-first, high accessibility
Surface:    hsl(210 20% 97%)
Accent:     hsl(25 80% 50%)    -- Warm orange: actions, urgency
Mode: light-first | WCAG AA mandatory | Reference: Australia.gov.au, ServiceNSW
```

---

## Resolving Color Conflicts (from Step 8 — Differentiation Audit)

If the personality-matched palette hue is already taken by a recent build, shift the primary hue by +20 to -20 degrees before locking. For example, if last build used `hsl(155 38% 36%)` forest green and this product also maps to Enterprise Authority, shift to `hsl(175 38% 36%)` teal-green or `hsl(135 38% 36%)` emerald — same personality register, different visual identity. Document the shift reason in DESIGN-BRIEF.md.
