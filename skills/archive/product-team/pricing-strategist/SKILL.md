---
name: "pricing-strategist"
description: "Design and optimise SaaS pricing models (flat, tiered, usage-based, per-seat), packaging decisions, discount strategy, and willingness-to-pay analysis. Use when launching a new pricing tier, analysing churn by price point, restructuring packaging, modelling price sensitivity, or preparing a pricing change for a board or go-to-market review."
Name: "Pricing Strategist"
  Tier: "STANDARD"
  Category: "Product"
  Dependencies: "None"
  Author: "claude-skills"
  Version: "2.1.2"
---

# Pricing & Packaging Strategist

## Overview

Pricing is the highest-leverage growth lever in SaaS. This skill covers pricing model design, packaging architecture, discount governance, and price testing — from early-stage startups finding product-market fit to growth-stage companies optimising LTV.

## When to Use

- Designing pricing tiers for a new product or feature
- Evaluating a move from flat to usage-based pricing
- Analysing churn patterns by price point or plan
- Building a discount approval framework
- Preparing a pricing change for board or GTM review
- Running willingness-to-pay (WTP) research

## Quick Start

```
# Design pricing tiers
Share your product, ICP, and competitors → I'll design 3-tier pricing with rationale

# Analyse pricing vs churn
Paste your churn data by plan → I'll identify price sensitivity signals

# Model a price increase
Current pricing + cohort data → impact model with churn risk estimate
```

## Core Frameworks

### Pricing Model Selection Matrix

| Model | Best For | Pros | Cons |
|-------|----------|------|------|
| **Flat rate** | Simple product, 1 ICP | Easy to sell | Leaves money on table |
| **Per-seat** | Collaboration tools | Scales with usage | Punishes adoption |
| **Usage-based** | API, infra, data | Aligns value to cost | Unpredictable revenue |
| **Tiered** | Multi-segment | Captures WTP across segments | Complex to manage |
| **Hybrid** | Enterprise SaaS | Flexibility | Hard to explain |

### 3-Tier Packaging Template (Good/Better/Best)

```
FREE / STARTER
- Core value prop only
- Usage limits that create upgrade pressure
- No support SLA
- Goal: acquisition and habit formation

GROWTH (primary revenue tier)
- Full feature set for core use case
- Higher limits or unlimited on core metrics
- Standard support
- Goal: 70%+ of revenue

ENTERPRISE
- Everything in Growth
- SSO, audit logs, SLAs, dedicated CSM
- Custom contracts, invoicing
- Goal: ARPU expansion + logo acquisition
```

### Willingness-to-Pay Research
1. **Van Westendorp Price Sensitivity Meter** — 4 questions:
   - Too cheap (quality concern)?
   - Cheap (good deal)?
   - Expensive (would consider)?
   - Too expensive (would not buy)?
2. **Conjoint analysis** — rank feature/price bundles
3. **Competitor benchmarking** — map features to price points
4. **Win/loss analysis** — was price cited as a reason?

### Discount Framework
| Discount Level | Approval Required | Max Discount | Conditions |
|----------------|-------------------|--------------|------------|
| < 10% | AE self-serve | 10% | Annual only |
| 10–20% | Sales Manager | 20% | Multi-year preferred |
| 20–30% | VP Sales | 30% | Strategic account |
| > 30% | CEO | 40% | Pilot/proof-of-concept |

### Price Change Playbook
1. **Segment impact analysis** — model churn risk by cohort at new price
2. **Grandfather existing customers** — 6–12 month grace period
3. **Value communication** — document what customers get for more $
4. **Rollout sequence** — new customers first, then existing at renewal
5. **Win-back plan** — for churned customers post-increase

## Key Metrics
- **ACV** (Annual Contract Value) by tier
- **ARPU** trend by cohort
- **Expansion MRR** — upsell/cross-sell as % of new MRR
- **Churn by plan** — identify price elasticity
- **Conversion rate** — free-to-paid, tier-to-tier

## Related Skills
- cs-product-strategist
- cs-growth-strategist
- cs-financial-analyst


<!-- Auto-generated required sections -->

## Name

Pricing Strategist

## Description

Pricing and Packaging Strategy skill for Claude Code. Provides workflows, templates, and automation tools.

## Features

- Production-ready workflows
- Step-by-step guidance
- Reusable templates
- Best practices embedded

## Usage

Describe your task to Claude and this skill will be applied automatically based on context.

```
# Trigger this skill by describing your need:
"Help me with pricing and packaging strategy"
```

## Examples

**Example 1:** Ask Claude to apply this skill to your current project.

**Example 2:** Reference the workflows in SKILL.md to guide your implementation.
