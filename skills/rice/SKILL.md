---
name: rice
description: "Score and rank product features using the RICE framework (Reach, Impact, Confidence, Effort) with capacity planning. Use when prioritising a backlog, making trade-off decisions, or preparing for a planning cycle."
---

# /rice

Prioritize features using RICE scoring (Reach, Impact, Confidence, Effort) with optional capacity constraints.

## Usage

```
/rice prioritize <features.csv>                              Score and rank features
/rice prioritize <features.csv> --capacity 20                Rank with effort capacity limit
```


## Quick Start

```
/rice prioritize features.csv       # score from CSV
/rice prioritize --interactive      # guided scoring session
```
## Input Format

```csv
feature,reach,impact,confidence,effort
Dark mode,5000,2,0.8,3
API v2,12000,3,0.9,8
SSO integration,3000,2,0.7,5
Mobile app,20000,3,0.5,13
```

## Examples

```
/rice prioritize features.csv
/rice prioritize features.csv --capacity 20
/rice prioritize features.csv --output json
```

## Scripts
- `product-team/product-manager-toolkit/scripts/rice_prioritizer.py` — RICE prioritizer (`<input.csv> [--capacity N] [--output text|json|csv]`)

## Skill Reference
> `product-team/product-manager-toolkit/SKILL.md`

## Related Skills

- /prd
- /okr
- cs-product-manager
