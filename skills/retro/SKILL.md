---
name: retro
description: "Analyse sprint retrospective data for recurring patterns and generate trackable action items. Use when facilitating a sprint retro, identifying systemic team issues, or tracking whether previous retro actions were resolved."
---

# /retro

Analyze retrospective data for recurring themes, sentiment trends, and action item effectiveness.

## Quick Start

```bash
/retro analyze sprint-24-retro.json
/retro analyze sprint-24-retro.json --format json
```

## Usage

```
/retro analyze <retro_data.json>                             Full retrospective analysis
```

## Input Format

```json
{
  "sprint_name": "Sprint 24",
  "went_well": ["CI pipeline improvements", "Pair programming sessions"],
  "improvements": ["Too many meetings", "Flaky integration tests"],
  "action_items": [
    {"description": "Reduce standup to 10 min", "owner": "SM", "status": "done"},
    {"description": "Fix flaky tests", "owner": "QA Lead", "status": "in_progress"}
  ],
  "participants": 8
}
```

## Scripts

Scripts are optional — if unavailable, Claude will analyse the JSON data directly and surface themes, sentiment trends, and action item completion rates.

- `project-management/scrum-master/scripts/retrospective_analyzer.py` — Retrospective analyzer (optional): `<data_file> [--format text|json]`

**Fallback (no script):** Parse the JSON input, group went_well and improvements by theme, calculate action item completion rate, and identify recurring patterns across sprints if multiple entries are provided.

## Skill Reference

`project-management/scrum-master/SKILL.md`

## Related Skills

- `/sprint-health` — Correlate retro findings with sprint delivery metrics
- `/sprint-plan` — Feed retro action items into next sprint planning
- `/project-health` — Surface project-level patterns from retrospective history
