---
name: "cloud-cost-optimizer"
description: "Analyse and reduce AWS/GCP/Azure cloud spend through right-sizing, reserved instances, spot usage, waste elimination, and cost allocation. Use when cloud bills are growing faster than revenue, preparing a cloud cost review, right-sizing compute, implementing tagging for chargebacks, or building a FinOps practice."
Name: "Cloud Cost Optimizer"
  Tier: "STANDARD"
  Category: "Engineering"
  Dependencies: "None"
  Author: "claude-skills"
  Version: "2.1.2"
---

# Cloud Cost Optimizer

## Overview

Cloud costs are typically the #2–3 COGS line for SaaS companies. Unmanaged, they grow 30–50% YoY. This skill applies FinOps principles to identify waste, right-size resources, leverage commitments (reserved/spot), and implement governance to sustain savings.

## When to Use

- Cloud spend growing faster than revenue
- Preparing a cost review for the board or CFO
- Right-sizing EC2/GKE/VMs after initial deployment
- Implementing tagging strategy for cost allocation
- Evaluating reserved instances vs on-demand vs spot
- Setting up budget alerts and anomaly detection

## Quick Start

```
# Identify waste
Share AWS Cost Explorer CSV or describe architecture → waste analysis

# Right-sizing
List your instance types + CPU/memory utilisation → right-size recommendations

# RI/Savings Plan analysis
Current on-demand spend by service → commitment purchase recommendations
```

## Cost Reduction Playbook

### Phase 1: Visibility (Week 1–2)
1. Enable Cost Explorer and detailed billing
2. Implement tagging strategy: `env`, `team`, `product`, `owner`
3. Create cost allocation reports by tag
4. Set up budget alerts at 80% and 100% of monthly target
5. Enable AWS Compute Optimizer / GCP Recommender

### Phase 2: Quick Wins (Week 2–4)
| Action | Typical Savings | Effort |
|--------|----------------|--------|
| Delete unattached EBS volumes | 5–10% | Low |
| Release unused Elastic IPs | 1–2% | Low |
| Rightsize dev/staging instances | 10–20% | Low |
| Delete old snapshots | 5–15% | Low |
| Move infrequent S3 to Glacier | 5–10% | Low |
| Turn off dev environments nights/weekends | 20–30% of dev spend | Medium |

### Phase 3: Commitments (Month 2)
- **Reserved Instances** — 1-year, no upfront: 30–40% savings vs on-demand
- **Savings Plans** — Compute Savings Plans cover EC2, Fargate, Lambda: 17–66% savings
- **Committed Use Discounts** (GCP) — 1-year: 20–57% depending on machine type
- **Rule:** Only commit what you'd run at 100% utilisation for the term

### Phase 4: Architecture (Month 3+)
- Move batch workloads to spot/preemptible instances (60–90% savings)
- Implement auto-scaling with scheduled scale-down
- Right-size databases — Aurora Serverless for variable workloads
- Implement S3 Intelligent-Tiering for unknown access patterns
- Use CDN (CloudFront/Cloudflare) to reduce data transfer costs

## Cost Allocation Framework
```
Tags required on all resources:
- env: production | staging | development
- team: engineering | data | infra | ml
- product: authmark | growlocal | platform
- owner: email of responsible engineer
```

## Key Metrics
- **Cloud spend as % of revenue** — target < 15% at scale
- **Cost per unit** (per API call, per user, per transaction)
- **Waste %** — unattached/idle resources as % of total spend
- **RI/SP coverage** — % of eligible spend under commitment
- **Savings vs baseline** — monthly delta from optimisation actions

## Monthly FinOps Review Checklist
- [ ] Review Cost Explorer anomaly alerts
- [ ] Check utilisation of reserved instances (target > 90%)
- [ ] Review top 10 cost drivers vs last month
- [ ] Identify new waste from Compute Optimizer recommendations
- [ ] Update cost allocation tags for new resources

## Related Skills
- sre
- observability-designer
- cs-cto-advisor


<!-- Auto-generated required sections -->

## Name

Cloud Cost Optimizer

## Description

Cloud Cost Optimisation skill for Claude Code. Provides workflows, templates, and automation tools.

## Features

- Production-ready workflows
- Step-by-step guidance
- Reusable templates
- Best practices embedded

## Usage

Describe your task to Claude and this skill will be applied automatically based on context.

```
# Trigger this skill by describing your need:
"Help me with cloud cost optimisation"
```

## Examples

**Example 1:** Ask Claude to apply this skill to your current project.

**Example 2:** Reference the workflows in SKILL.md to guide your implementation.
