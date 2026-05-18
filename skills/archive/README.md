# Archived Skills

Skills in this folder have been moved out of the active skill library to reduce trigger noise and skill bloat. They are NOT loaded by Claude Code — moving a skill here is functionally equivalent to deleting it, but reversible.

## Why these were archived

Each skill in this folder met ALL of the following criteria when archived:

1. Zero structured `Skill()` tool_use invocations recorded in conversation history (~2.5 months of data)
2. Not referenced as `Skill('X')`, `` `/X` ``, `/X`, or as a bare kebab-case token in any OTHER active skill's SKILL.md / references/
3. Not mentioned in CLAUDE.md, web-system-prompt.md, settings.json, or global-context.md
4. SKILL.md not modified in the last 30 days

In short: nothing in the harness was reaching for them.

The skills here are mostly audit-suite sub-components (`ai-ready-*`, `geo-*`, `market-*`, `employer-*`, `privacy-*`, `reputation-*`, `security-*`, `techaudit-*`) whose parent orchestrator's prose describes routing to them but never actually invokes them via `Skill('child')`. They sat in the library but were never reached.

## How to restore one

```bash
mv ~/.claude/skills/archive/<skill-name> ~/.claude/skills/
```

That's it. Claude Code's skill discovery rescans on session start.

## How to find what else is archivable

```bash
python ~/.claude/skills/skill-forge/scripts/find_unused_skills.py
```

The "Archive candidates (orphaned)" list at the end is the next round of candidates. They were NOT auto-archived on the first pass because they look like standalone tools (no orchestrator parent), so they need a human eye before moving here.

## Archived on

2026-05-19 — initial archive pass after harness deep review. 25 skills moved.
