# Claude Config

Shared source of truth for Claude Code configuration across all machines.

## What's in here

- `commands/` — 70 slash commands (installed to `~/.claude/commands/`)
- `agents/` — 61 specialist agents (installed to `~/.claude/agents/`)
- `skills/` — 132 skills (installed to `~/.claude/skills/`)
- `rules/` — language/domain rulebooks (installed to `~/.claude/rules/`)
- `settings-template.json` — settings structure without secrets
- `sync.sh` — Mac/Linux sync script
- `sync.ps1` — Windows sync script
- `manifest.json` — auto-generated hash index, counts updated on every sync

Skills library: https://github.com/Mrsavage92/skills-library

## First-time setup on a new machine

### Mac / Linux
```bash
git clone https://github.com/Mrsavage92/claude-config.git ~/Documents/Git/claude-config
cd ~/Documents/Git/claude-config
bash sync.sh
```

### Windows (VS Code terminal — PowerShell)
```powershell
git clone https://github.com/Mrsavage92/claude-config.git "$env:USERPROFILE\Documents\Git\claude-config"
cd "$env:USERPROFILE\Documents\Git\claude-config"
.\sync.ps1
```

After first run, edit `~/.claude/settings.json` and replace `YOUR_NOTION_TOKEN_HERE` with the real token.

## Keeping in sync

Whenever skills/commands are added on one machine:
1. Say **"update knowledge base"** to Claude — it pushes changes to this repo and updates Notion
2. On the other machine, run `bash sync.sh` (Mac) or `.\sync.ps1` (Windows)

## Notion documentation

Human-readable docs live at: https://www.notion.so/Claude-32a116e8bef28030a0f6d0be522bf917
