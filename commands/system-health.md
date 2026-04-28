---
description: "Weekly system health check — prunes dead skills, audits config integrity, reports what's broken"
---

# System Health Check

Run a comprehensive health audit of the Claude Code configuration.

## Step 1 — Config Integrity

Check these files exist and are non-empty:
- `~/.claude/settings.json`
- `~/.claude/CLAUDE.md`
- `~/.claude/web-system-prompt.md`
- `~/.claude/keybindings.json` (warn if missing, not critical)

Check these directories exist:
- `~/.claude/commands/`
- `~/.claude/agents/`
- `~/.claude/skills/`
- `~/.claude/logs/`

Report: `✅ exists` or `❌ MISSING` for each.

## Step 2 — Sync Health

Run `cd ~/Documents/Git/claude-config && git status` to check for:
- Uncommitted changes (stale sync)
- Diverged branches (sync conflict)
- Last commit date (stale if >3 days old)

Check `~/.claude/sync-errors.log` — report the last 10 lines if non-empty.

## Step 3 — Skill Inventory

Count files across skill directories:
- `~/.claude/skills/` top-level category folders
- Any nested skill folders containing `SKILL.md`
- Any non-standard skill directories

Flag if total exceeds 5,000 (bloat warning).

## Step 4 — Dead Skill Detection

For each `.md` file in `~/.claude/commands/`:
1. Read the first 5 lines
2. If the file is empty or has no `description` in frontmatter: flag as broken
3. Count total commands, broken commands, and healthy commands

## Step 5 — MCP Server Status

Read `~/.claude/mcp-needs-auth-cache.json` and list any servers that still need authentication. For each, provide the one-liner to authenticate.

## Step 6 — Memory Audit

Read `~/.claude/projects/-Users-savages-Documents-Git/memory/MEMORY.md`:
- Count total memory entries
- Flag any entries whose linked `.md` file doesn't exist (orphaned pointers)
- Flag any `.md` files in memory/ that aren't in MEMORY.md (unindexed memories)

## Step 7 — Report

Output a single summary table:

```
┌─────────────────────────────────┬──────────┐
│ Check                           │ Status   │
├─────────────────────────────────┼──────────┤
│ Config files                    │ X/Y OK   │
│ Sync status                     │ clean/stale │
│ Skills count                    │ N total  │
│ Commands (healthy/broken)       │ H/B      │
│ MCP servers needing auth        │ N        │
│ Memory entries (indexed/orphan) │ I/O      │
│ Sync errors (last 24h)          │ N lines  │
└─────────────────────────────────┴──────────┘
```

End with a prioritised list of actions: what to fix first, second, third.
