---
name: sync-knowledge-base
description: Scan all installed commands, agents and skills, push changes to the claude-config GitHub repo as the shared source of truth, and update the Notion documentation hub. Run at the end of any session where skills were added or modified.
---

Run the self-knowledge-base sync using the skill at ~/.claude/skills/claude-skills/orchestration/self-knowledge-base/SKILL.md.

Follow the full workflow:
1. Scan ~/.claude/commands/, ~/.claude/agents/, ~/.claude/skills/claude-skills/ for current state
2. Diff against manifest.json to find what changed
3. Push commands/ and agents/ to github.com/Mrsavage92/claude-config
4. Update only the changed Notion pages
5. Save updated manifest.json
6. Report what changed and remind user to run sync.ps1 on their PC

## Quick Start

```
/sync-knowledge-base
```

No input needed. Runs automatically.

## When to run

- After adding new slash commands
- After adding new agents
- After building new skills
- At the end of any productive session

## What gets synced

- GitHub repo (Mrsavage92/claude-config): commands/ and agents/
- Notion hub: documentation pages updated for new/changed items

## PC sync (after running this)

Windows PowerShell:
```powershell
cd "$env:USERPROFILE\Documents\Git\claude-config"
.\sync.ps1
```

## Related Skills

- /scroll-stop-prompt
- /scroll-stop-build
- /seo-strategy
