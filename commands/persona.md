---
name: persona
description: "Generate data-driven user personas with goals, frustrations, behaviours, and jobs-to-be-done for UX research. Use when kicking off product discovery, designing features, or aligning team understanding of target users."
---

# /persona

Generate structured user personas with demographics, goals, pain points, and behavioral patterns.

## Quick Start

```bash
/persona generate
/persona generate json
/persona generate json > persona-eng-manager.json
```

## Usage

```
/persona generate                                            Generate persona (interactive)
/persona generate json                                       Generate persona as JSON
```

## Input Format

Interactive mode prompts for product context. Alternatively, provide context inline:

```
/persona generate
> Product: B2B project management tool
> Target: Engineering managers at mid-size companies
> Key problem: Cross-team visibility
```

## Scripts

Scripts are optional — if unavailable, Claude will generate a structured persona directly from the interactive prompts.

- `product-team/ux-researcher-designer/scripts/persona_generator.py` — Persona generator (optional): positional `json` arg for JSON output

**Fallback (no script):** Interactively gather product context, then generate a complete persona with demographics, goals, frustrations, typical day, and behavioral patterns.

## Skill Reference

`product-team/ux-researcher-designer/SKILL.md`

## Related Skills

- `/user-story` — Turn persona pain points into sprint-ready user stories
- `/prd` — Reference personas as target users in product requirements
- `/rice` — Weight feature reach scores using persona audience size
