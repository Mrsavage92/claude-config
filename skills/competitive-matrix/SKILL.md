---
name: competitive-matrix
description: "Build weighted competitive analysis matrices with gap analysis and market positioning maps. Use when evaluating competitors, preparing for a product launch, or deciding on feature prioritisation against the market."
---

# /competitive-matrix

Build competitive matrices with weighted scoring, gap analysis, and market positioning insights.

## Quick Start

```bash
/competitive-matrix analyze competitors.json
/competitive-matrix analyze competitors.json --weights pricing=2,ux=1.5
/competitive-matrix analyze competitors.json --format json --output matrix.json
```

## Input Format

```json
{
  "your_product": { "name": "MyApp", "scores": {"ux": 8, "pricing": 7, "features": 9} },
  "competitors": [
    { "name": "Competitor A", "scores": {"ux": 7, "pricing": 9, "features": 6} }
  ],
  "dimensions": ["ux", "pricing", "features"]
}
```

## Usage

```
/competitive-matrix analyze <competitors.json>                    Full analysis
/competitive-matrix analyze <competitors.json> --weights pricing=2,ux=1.5    Custom weights
/competitive-matrix analyze <competitors.json> --format json --output matrix.json
```

## Scripts

Scripts are optional — if unavailable, Claude will manually compute weighted scores, rank competitors, and identify gaps from the JSON input.

- `product-team/competitive-teardown/scripts/competitive_matrix_builder.py` — Matrix builder (optional)

**Fallback (no script):** Parse the input JSON, apply weights manually, compute weighted scores per competitor, rank them, and identify your product's competitive gaps and advantages.

## Skill Reference

`product-team/competitive-teardown/SKILL.md`

## Related Skills

- `/okr` — Translate competitive gaps into strategic OKR objectives
- `/rice` — Prioritize features to close identified competitive gaps
- `/prd` — Document competitive requirements as acceptance criteria
