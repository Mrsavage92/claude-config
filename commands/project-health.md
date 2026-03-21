---
name: project-health
description: "Generate a portfolio health dashboard and risk matrix across multiple projects or workstreams. Use when reviewing project status with stakeholders, identifying at-risk initiatives, or running a quarterly programme review."
---

# /project-health

Generate portfolio health dashboards and risk matrices for project oversight.

## Quick Start

```bash
/project-health dashboard portfolio-q2.json
/project-health risk risk-register.json
/project-health dashboard portfolio-q2.json --format json
```

## Usage

```
/project-health dashboard <project_data.json>                Portfolio health dashboard
/project-health risk <risk_data.json>                        Risk matrix analysis
```

## Input Format

```json
{
  "project_name": "Platform Rewrite",
  "schedule": {"planned_end": "2026-06-30", "projected_end": "2026-07-15", "milestones_hit": 4, "milestones_total": 6},
  "budget": {"allocated": 500000, "spent": 320000, "forecast": 520000},
  "scope": {"features_planned": 40, "features_delivered": 28, "change_requests": 3},
  "quality": {"defect_rate": 0.05, "test_coverage": 0.82},
  "risks": [{"description": "Key engineer leaving", "probability": 0.3, "impact": 0.8}]
}
```

## Scripts

Scripts are optional — if unavailable, Claude will compute health scores and risk ratings directly from the input data.

- `project-management/senior-pm/scripts/project_health_dashboard.py` — Health dashboard (optional): `<data_file> [--format text|json]`
- `project-management/senior-pm/scripts/risk_matrix_analyzer.py` — Risk matrix analyzer (optional): `<data_file> [--format text|json]`

**Fallback (no script):** Parse the JSON input and compute schedule variance, budget variance, scope completion rate, and risk exposure scores manually, then format as a dashboard.

## Skill Reference

`project-management/senior-pm/SKILL.md`

## Related Skills

- `/sprint-health` — Drill into sprint-level delivery and velocity metrics
- `/retro` — Surface project-level patterns from retrospective history
- `/financial-health` — Combine with budget and forecast analysis
