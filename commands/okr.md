---
name: okr
description: "Generate cascading OKRs from company strategy down to team-level objectives with alignment scoring. Use when running quarterly planning, aligning team goals to company strategy, or reviewing OKR health mid-cycle."
---

# /okr

Generate cascaded OKR frameworks from company-level strategy down to team-level key results.

## Quick Start

```bash
/okr generate growth
/okr generate retention
/okr generate revenue --json
```

## Usage

```
/okr generate <strategy>                                     Generate OKR cascade
/okr generate <strategy> --teams "Engineering,Product,Sales" --contribution 0.3 --json
```

Supported strategies: `growth`, `retention`, `revenue`, `innovation`, `operational`

## Input Format

Pass a strategy keyword directly. The generator produces company, department, and team-level OKRs aligned to the chosen strategy.

## Scripts

Scripts are optional — if unavailable, Claude will construct a cascaded OKR framework directly from the strategy keyword using standard OKR best practices.

- `product-team/product-strategist/scripts/okr_cascade_generator.py` — OKR cascade generator (optional): `<strategy> [--teams "A,B,C"] [--contribution 0.3] [--json]`

**Fallback (no script):** Generate company-level O+KRs, then cascade to 3-4 department objectives, then team-level key results — each with measurable targets and owners.

## Skill Reference

`product-team/product-strategist/SKILL.md`

## Related Skills

- `/rice` — Prioritize features that map to specific key results
- `/sprint-plan` — Align sprint goals to active OKR key results
- `/competitive-matrix` — Translate competitive gaps into strategic OKR objectives
