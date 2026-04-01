---
name: tech-debt
description: "Scan, prioritise, and report technical debt across a codebase with effort/impact scoring. Use when planning a tech debt reduction sprint, justifying refactoring to stakeholders, or auditing a legacy codebase before migration."
---

# /tech-debt

Scan codebases for technical debt, score severity, and generate prioritized remediation plans.

## Usage

```
/tech-debt scan <project-dir>           Scan for debt indicators
/tech-debt prioritize <inventory.json>  Prioritize debt backlog
/tech-debt report <project-dir>         Full dashboard with trends
```


## Quick Start

```
/tech-debt scan ./src         # scan for debt
/tech-debt prioritize        # rank by impact/effort
/tech-debt report            # generate stakeholder report
```
## Examples

```
/tech-debt scan ./src
/tech-debt scan . --format json
/tech-debt report . --format json --output debt-report.json
```

## Scripts
- `engineering/tech-debt-tracker/scripts/debt_scanner.py` — Scan for debt patterns (`debt_scanner.py <directory> [--format json] [--output file]`)
- `engineering/tech-debt-tracker/scripts/debt_prioritizer.py` — Prioritize debt backlog (`debt_prioritizer.py <inventory.json> [--framework cost_of_delay|wsjf|rice] [--format json]`)
- `engineering/tech-debt-tracker/scripts/debt_dashboard.py` — Generate debt dashboard (`debt_dashboard.py [files...] [--input-dir dir] [--period weekly|monthly|quarterly] [--format json]`)

## Skill Reference
→ `engineering/tech-debt-tracker/SKILL.md`

## Related Skills

- /tdd
- /pipeline
- cs-senior-engineer
