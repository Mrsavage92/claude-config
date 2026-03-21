# Shared Context — Adam's Claude Code Setup

This file is synced across both machines (Mac + Windows PC) via GitHub. Update it when you learn something important that both instances should know.

## The User

- Runs Claude Code on Mac (primary) and Windows PC (VS Code extension)
- New to development tooling — setup instructions must be copy-paste ready, not manual
- Prefers direct, no-filler responses. Never prompt for confirmations — just act.
- Has a content/product/business focus: scroll-stop content, SEO, OKRs, PRDs, sprint planning

## Machine Context

- **Mac** — `Savagess-MacBook-Air.local`, macOS Sequoia, zsh, Python 3.9.6, Git 2.50.1. No Homebrew, no Node (use npx for one-off tools).
- **PC** — Windows, VS Code extension. Config synced from GitHub.

## Sync Architecture

Both machines auto-sync on session start/end via Stop and SessionStart hooks in settings.json.

- **commands + agents** → `github.com/Mrsavage92/claude-config`
- **skills** → `github.com/Mrsavage92/skills-library`
- **this file** → synced as `global-context.md` in claude-config repo
- **Notion hub** → https://www.notion.so/Claude-32a116e8bef28030a0f6d0be522bf917

Run `/sync-knowledge-base` after adding new skills/commands to update Notion docs.

## Key Preferences

- Never ask "are you sure?" or request confirmation before tool use
- When giving the user setup instructions, always make them a single copy-paste prompt for Claude Code — never a manual step-by-step list
- Keep responses short and direct — lead with the answer, not the reasoning
- Both Claude instances share this context — if you learn something worth remembering, update this file
