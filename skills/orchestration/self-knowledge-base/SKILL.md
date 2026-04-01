---
Name: self-knowledge-base
Description: Scans all installed Claude Code skills, agents, and slash commands, pushes changes to the claude-config GitHub repo as the shared source of truth, and updates the Notion knowledge base. Run at the end of any session where skills were added or modified.
Category: orchestration
Tier: 1
Author: Claude Skills
Version: 1.0.0
Dependencies: []
Trigger: "update knowledge base", "sync docs", "update notion", "sync knowledge base", "update my docs", "push config"
---

# Self Knowledge Base

## Description

Keeps Claude Code configuration in sync across machines and documents everything in Notion.

**Source of truth architecture:**
- GitHub (`Mrsavage92/claude-config`) — the actual config files (commands, agents)
- GitHub (`Mrsavage92/skills-library`) — the skills library
- Notion — human-readable documentation

**Triggers:** "update knowledge base", "sync docs", "update Notion", "push config"

## Features

- Scans ~/.claude/commands/ and ~/.claude/agents/ for current state
- Diffs against last manifest to detect what changed
- Pushes changes to github.com/Mrsavage92/claude-config
- Updates Notion pages for only what changed
- Saves manifest for fast future diffs
- Other machines stay in sync by running sync.sh / sync.ps1

## Usage

At the end of any session where skills were added or modified:

```
update knowledge base
sync docs
update Notion
push config
```

## Examples

```
User: update knowledge base
Claude: [scans, diffs, pushes to GitHub, updates Notion, saves manifest]

User: we just added 3 new commands, push config
Claude: [detects 3 new commands, pushes to claude-config repo, appends to Notion]
```

---

## Workflow

### Step 1 — Scan Current State

Read all installed files:
- `~/.claude/commands/*.md` — extract `name` and `description` from frontmatter
- `~/.claude/agents/*.md` — extract `name` and `description` from frontmatter
- `~/.claude/skills/claude-skills/**/SKILL.md` — extract `Name`, `Category`, `Description`

### Step 2 — Diff Against Manifest

Load manifest from:
`~/.claude/skills/claude-skills/orchestration/self-knowledge-base/manifest.json`

Identify:
- **Added**: in current scan, not in manifest
- **Removed**: in manifest, not in current scan
- **Changed**: description differs

If no manifest exists → treat all as new (first run).

### Step 3 — Push to GitHub (claude-config repo)

```bash
CONFIG_REPO=~/Documents/Git/claude-config

# Copy current commands and agents into the repo
cp ~/.claude/commands/*.md $CONFIG_REPO/commands/
cp ~/.claude/agents/*.md $CONFIG_REPO/agents/

# Commit and push
cd $CONFIG_REPO
git add commands/ agents/
git diff --cached --quiet || git commit -m "sync: update commands and agents $(date +%Y-%m-%d)"
git push origin main
```

### Step 4 — Update Notion

**Notion page IDs (Adam Savage's Workspace):**
- Root / Hub: `32a116e8-bef2-8030-a0f6-d0be522bf917`
- Slash Commands: `32a116e8-bef2-8118-9f49-e6d790a56bd1`
- Agents: `32a116e8-bef2-815d-8b38-f37eaa467ec5`
- Skills Library: `32a116e8-bef2-8196-b2d3-e630d645984a`
- How to Use (Quick Reference): `32a116e8-bef2-8188-be9f-f67b5d3f5041`
- Scroll-Stop Suite: `32a116e8-bef2-8189-b61c-fe079c776743`
- MCP Integrations: `32a116e8-bef2-8173-9de7-f5f6b4c8e7f1`

For each added item, append a bullet to the relevant page.
For large changes (>5 items), offer to rebuild the page from scratch.

### Step 5 — Save Manifest

Write to `~/.claude/skills/claude-skills/orchestration/self-knowledge-base/manifest.json`:

```json
{
  "last_sync": "2026-03-21T12:00:00Z",
  "github_repo": "Mrsavage92/claude-config",
  "notion_hub": "32a116e8-bef2-8030-a0f6-d0be522bf917",
  "commands": [{"file": "name.md", "name": "...", "description": "..."}],
  "agents": [{"file": "name.md", "name": "...", "description": "..."}],
  "skills": [{"path": "...", "name": "...", "category": "...", "description": "..."}]
}
```

### Step 6 — Report

```
Knowledge base sync complete — 2026-03-21
  Commands: 24 total (+2 new)
  Agents: 18 total (no changes)
  Skills: 315 total (+3 new)
  GitHub: pushed to Mrsavage92/claude-config
  Notion: updated Slash Commands, Skills Library
  Manifest saved.

To sync your PC:
  Run .\sync.ps1 in the claude-config directory
  Or: git pull && .\sync.ps1
```
