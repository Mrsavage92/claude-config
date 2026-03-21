# Claude Config — Architecture & Context

This repository is the **shared source of truth** for Claude Code configuration across all machines (Mac + Windows PC).

## What lives here

| Directory/File | Purpose |
|---|---|
| `commands/` | Slash commands → installed to `~/.claude/commands/` |
| `agents/` | Specialist agents → installed to `~/.claude/agents/` |
| `settings-template.json` | Settings structure without secrets (tokens replaced with placeholders) |
| `sync.sh` | Mac/Linux: pull latest config from this repo |
| `sync.ps1` | Windows: pull latest config from this repo |

Skills (SKILL.md files) live in a separate repo: `Mrsavage92/skills-library`, installed at `~/.claude/skills/claude-skills/`.

## How sync works

Both machines have identical hooks in `~/.claude/settings.json`:

**On session start (SessionStart hook):** pulls latest from this repo and skills-library → installs to `~/.claude/`. This ensures each session begins with whatever the other machine pushed last.

**On session end (Stop hook):** copies current `commands/` and `agents/` into this repo, commits with machine name + date (e.g. `auto-sync: mac-2026-03-21`), pushes to GitHub. Also pushes any new/changed skills to skills-library.

Errors are logged to `~/.claude/sync-errors.log` on each machine.

## Machines

- **Mac** — `Savagess-MacBook-Air.local` — primary development machine
- **PC** — Windows, VS Code extension — secondary machine

## Repos

- Config: `https://github.com/Mrsavage92/claude-config`
- Skills: `https://github.com/Mrsavage92/skills-library`

## Notion documentation hub

Human-readable docs: `https://www.notion.so/Claude-32a116e8bef28030a0f6d0be522bf917`

Use `/sync-knowledge-base` inside Claude Code to update Notion after adding new skills, commands, or agents.

## Adding new commands or agents

1. Create the `.md` file in `~/.claude/commands/` or `~/.claude/agents/`
2. It will be pushed to this repo automatically when the session ends
3. The other machine will pull it automatically at the start of its next session

No manual steps required.

## First-time setup on a new machine

### Mac / Linux
```bash
git clone https://github.com/Mrsavage92/claude-config.git ~/Documents/Git/claude-config
cd ~/Documents/Git/claude-config
bash sync.sh
```

### Windows (PowerShell)
```powershell
git clone https://github.com/Mrsavage92/claude-config.git "$env:USERPROFILE\Documents\Git\claude-config"
cd "$env:USERPROFILE\Documents\Git\claude-config"
.\sync.ps1
```

Then add the hooks below to `~/.claude/settings.json` (Mac) or `%USERPROFILE%\.claude\settings.json` (Windows).

## Hook config for settings.json

### Mac / Linux
```json
"hooks": {
  "SessionStart": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "LOG=~/.claude/sync-errors.log; (cd ~/Documents/Git/claude-config && git pull origin main --rebase && cp commands/*.md ~/.claude/commands/ && cp agents/*.md ~/.claude/agents/) 2>>$LOG; (cd ~/.claude/skills/claude-skills && git pull origin main) 2>>$LOG || true",
          "async": true
        }
      ]
    }
  ],
  "Stop": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "MACHINE=$(hostname -s); LOG=~/.claude/sync-errors.log; MSG=\"auto-sync: $MACHINE $(date +%Y-%m-%d)\"; (cd ~/Documents/Git/claude-config && git pull origin main --rebase && cp ~/.claude/commands/*.md commands/ && cp ~/.claude/agents/*.md agents/ && git add commands/ agents/ && git diff --cached --quiet || git commit -m \"$MSG\" && git push origin main) 2>>$LOG; (cd ~/.claude/skills/claude-skills && git add -A && git diff --cached --quiet || git commit -m \"$MSG\" && git push origin main) 2>>$LOG || true",
          "async": true
        }
      ]
    }
  ]
}
```

### Windows (PowerShell)
```json
"hooks": {
  "SessionStart": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "$LOG=\"$env:USERPROFILE\\.claude\\sync-errors.log\"; try { cd \"$env:USERPROFILE\\Documents\\Git\\claude-config\"; git pull origin main --rebase; cp commands\\*.md \"$env:USERPROFILE\\.claude\\commands\\\"; cp agents\\*.md \"$env:USERPROFILE\\.claude\\agents\\\" } catch { $_ >> $LOG }; try { cd \"$env:USERPROFILE\\.claude\\skills\\claude-skills\"; git pull origin main } catch { $_ >> $LOG }",
          "shell": "powershell",
          "async": true
        }
      ]
    }
  ],
  "Stop": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "$MACHINE=$env:COMPUTERNAME; $LOG=\"$env:USERPROFILE\\.claude\\sync-errors.log\"; $MSG=\"auto-sync: $MACHINE $(Get-Date -Format yyyy-MM-dd)\"; try { cd \"$env:USERPROFILE\\Documents\\Git\\claude-config\"; git pull origin main --rebase; cp \"$env:USERPROFILE\\.claude\\commands\\*.md\" commands\\; cp \"$env:USERPROFILE\\.claude\\agents\\*.md\" agents\\; git add commands/ agents/; $diff = git diff --cached --quiet; if ($LASTEXITCODE -ne 0) { git commit -m $MSG }; git push origin main } catch { $_ >> $LOG }; try { cd \"$env:USERPROFILE\\.claude\\skills\\claude-skills\"; git add -A; $diff = git diff --cached --quiet; if ($LASTEXITCODE -ne 0) { git commit -m $MSG }; git push origin main } catch { $_ >> $LOG }",
          "shell": "powershell",
          "async": true
        }
      ]
    }
  ]
}
```
