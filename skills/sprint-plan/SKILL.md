---
name: sprint-plan
description: "Generate a sprint plan with capacity allocation, user stories, and acceptance criteria from a goal and team capacity. Use when starting a new sprint, grooming a backlog into a sprint, or planning after unplanned work disrupted capacity."
---

# /sprint-plan

Create a sprint plan with prioritized stories and capacity guardrails.

## Usage

```bash
/sprint-plan <goal> [capacity]
```


## Quick Start

```
/sprint-plan "launch payments MVP" 40  # goal + capacity (points)
/sprint-plan "fix auth bugs" 25
```
## Output Structure

- Sprint goal
- Committed scope
- Stretch scope
- Risks and dependencies
- Story-level acceptance criteria checks

## Skill Reference
- `product-team/agile-product-owner/SKILL.md`

## Related Skills

- /user-story
- /retro
- cs-agile-product-owner
