---
name: sync-knowledge-base
description: Scan all installed commands, agents and skills, push changes to the claude-config GitHub repo as the shared source of truth, and update the Notion documentation hub. Run at the end of any session where skills were added or modified.
---

Execute the full knowledge base sync workflow directly (no external skill file required):

## Workflow

**Step 1 — Scan current state**
- Commands: `~/.claude/commands/` (*.md files)
- Agents: `~/.claude/agents/` (*.md files)
- Skills: `~/.claude/skills/` (top-level directories — each skill is a folder containing `SKILL.md`)
- Load `~/Documents/Git/claude-config/manifest.json` if it exists — diff to find what changed

> **Note:** New skills must be created at `~/.claude/skills/{skill-name}/SKILL.md` only.
> Do NOT save skills to the OpenClaw workspace (`~/.openclaw/workspace/skills/`) — that repo is unrelated and not used.

**Step 2 — Push to GitHub**
- Copy agents and commands to `~/Documents/Git/claude-config/`
- `git fetch origin main && git pull origin main --rebase`
- `git add agents/ commands/ manifest.json`
- `git commit -m "sync: <date> — <summary of changes>"`
- `git push origin main`

**Step 3 — Update Notion via REST API**
- Token from settings.json env: `OPENAPI_MCP_HEADERS` or use `ntn_K46793192822yLb12pUWso1QC0gaYtsA6dENpcn0xjhfKB`
- Notion hub page ID: `32a116e8-bef2-8030-a0f6-d0be522bf917`
- Child pages: Agents (`32a116e8-bef2-815d-8b38-f37eaa467ec5`), Slash Commands (`32a116e8-bef2-8118-9f49-e6d790a56bd1`), Skills Library (`32a116e8-bef2-8196-b2d3-e630d645984a`)
- Update only pages where content changed (compare against manifest)
- Use `PATCH https://api.notion.com/v1/blocks/{page_id}/children` to append blocks
- Use `DELETE https://api.notion.com/v1/blocks/{block_id}` to clear before rewriting
- Notion-Version header: `2022-06-28`
- Block format requires `"object": "block"` and `"type"` fields on every block

**Step 4 — Save manifest.json**
Generate with Python using `hashlib.md5` on each file. Schema:
```json
{
  "last_updated": "YYYY-MM-DD",
  "generated_by": "COMPUTERNAME",
  "commands": {"filename.md": "hash"},
  "agents": {"filename.md": "hash"},
  "skills": ["skill-name", ...],
  "counts": {"commands": N, "agents": N, "skills": N}
}
```
Save to `~/Documents/Git/claude-config/manifest.json` and commit with step 2.

**Step 5 — Report**
Output a summary table of what changed (added/modified/removed) across commands, agents, and skills.

## When to run

- After adding new slash commands
- After adding new agents
- After installing new skills
- At the end of any productive session

## What gets synced

- **GitHub** (`Mrsavage92/claude-config`): `commands/`, `agents/`, `manifest.json`
- **Notion**: Agents page, Slash Commands page, Skills Library page — only changed sections rewritten
