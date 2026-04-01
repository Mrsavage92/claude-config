---
name: user-story
description: "Generate INVEST-compliant user stories with Given/When/Then acceptance criteria and story point estimates. Use when writing stories for sprint planning, decomposing epics, or creating a backlog for a new feature."
---

# /user-story

Generate structured user stories with acceptance criteria, story points, and sprint capacity planning.

## Usage

```
/user-story generate                                         Generate user stories (interactive)
/user-story sprint <capacity>                                Plan sprint with story point capacity
```


## Quick Start

```
/user-story generate "user login with SSO"   # generate stories
/user-story sprint "payments epic" 40       # sprint-ready stories with capacity
```
## Input Format

Interactive mode prompts for feature context. For sprint planning, provide capacity as story points:

```
/user-story generate
> Feature: User authentication
> Persona: Engineering manager
> Epic: Platform Security

/user-story sprint 21
> Stories are ranked by priority and fit within 21-point capacity
```

## Examples

```
/user-story generate
/user-story sprint 34
/user-story sprint 21
```

## Scripts
- `product-team/agile-product-owner/scripts/user_story_generator.py` — User story generator (positional args: `sprint <capacity>`)

## Skill Reference
> `product-team/agile-product-owner/SKILL.md`

## Related Skills

- /sprint-plan
- /prd
- cs-agile-product-owner
