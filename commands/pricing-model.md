---
name: pricing-model
description: Design pricing strategy, packaging tiers, and pricing page structure for a product or service. Use when launching a new product, repositioning pricing, adding a tier, or optimising conversion on a pricing page.
---

# Pricing Model Designer

## Purpose

Produces a complete pricing strategy: model selection, tier design, price point rationale, and pricing page recommendations. Covers SaaS, services, marketplaces, and physical products.

## When to Use

- Launching a new product and need a pricing structure
- Repositioning pricing after market feedback
- Adding or removing a pricing tier
- Moving from one model to another (e.g. per-seat → usage-based)
- Optimising a pricing page for conversion
- Preparing pricing for a sales conversation or investor deck

## Input Required

- Product/service description
- Target customer segments (SMB, mid-market, enterprise)
- Key value metric (what drives value for customers — seats, usage, outcomes)
- Competitors and their pricing (if known)
- Current pricing (if repositioning)

## Workflow

### Step 1 — Identify the Value Metric

The value metric is what customers pay for as they get more value. Choose one:
- **Per seat/user** — collaboration tools, productivity
- **Usage-based** — APIs, infrastructure, AI tokens
- **Outcome-based** — revenue share, savings share
- **Feature-based** — free base + paid features
- **Flat rate** — simple, but scales poorly

Rule: the value metric should scale naturally with customer success.

### Step 2 — Choose the Pricing Model

| Model | Best for | Risk |
|-------|----------|------|
| Freemium | PLG, high-volume | Support cost, conversion rate |
| Free trial (time-limited) | Complex products needing setup | Activation friction |
| Per seat | Team tools | Seat minimisation behaviour |
| Usage-based | Infra, AI, APIs | Revenue unpredictability |
| Flat rate | Simple, one-segment | Leaves money on table |
| Tiered flat | Multi-segment | Tier cannibalisation |

### Step 3 — Design Tiers

Standard 3-tier structure:
- **Tier 1 (Starter/Free):** Enough to experience core value, not enough to run a business on it
- **Tier 2 (Growth/Pro):** The tier you want most customers on. Anchors the decision.
- **Tier 3 (Business/Enterprise):** For power users or large teams. Custom pricing optional.

For each tier define:
- Price point
- Included usage/seats/features
- The ONE feature that forces upgrade from tier below
- Who this tier is for (ICP)

### Step 4 — Set Price Points

Methods:
1. **Cost-plus** (floor): total cost to serve × target margin
2. **Competitive** (anchor): position vs nearest competitor (premium/parity/discount)
3. **Value-based** (ceiling): what is the outcome worth to the buyer? Price at 10-20% of value delivered.

Final price = balance of all three, skewed toward value-based.

Psychological pricing rules:
- $49 > $50 (charm pricing works for SMB, not enterprise)
- Annual discount: 15-20% to incentivise commitment
- Monthly pricing shown annually = more transparent, fewer objections

### Step 5 — Pricing Page Structure

1. Toggle: monthly / annual (annual default recommended)
2. 3 columns — middle tier visually highlighted
3. Feature list: comparison rows, checkmarks, not walls of text
4. Enterprise CTA: "Talk to sales" not a price
5. FAQ below: addresses top 5 pricing objections
6. Social proof: logos or quote near pricing

## Output Format

```
# Pricing Strategy — [Product Name]

## Recommended Model
[Model + rationale]

## Value Metric
[What customers pay for + why]

## Tier Design

### [Tier 1 Name] — $X/mo
**For:** [ICP]
**Includes:** [list]
**Upgrade trigger:** [what forces move to Tier 2]

### [Tier 2 Name] — $X/mo  ← RECOMMENDED
**For:** [ICP]
**Includes:** [list]
**Upgrade trigger:** [what forces move to Tier 3]

### [Tier 3 Name] — $X/mo or Custom
**For:** [ICP]
**Includes:** [list]

## Price Point Rationale
[Cost floor / competitive anchor / value ceiling analysis]

## Annual Discount Recommendation
[% and rationale]

## Pricing Page Recommendations
[Structure, copy, FAQ topics]

## Risks & Watch Points
[What to monitor after launch]
```
