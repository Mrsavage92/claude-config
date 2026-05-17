---
name: sync-knowledge-base
description: Scan all installed commands, agents and skills, push changes to the claude-config GitHub repo as the shared source of truth, and update the Notion documentation hub. Run at the end of any session where skills were added or modified.
---

## Hardened Rules (load-bearing)

1. **Run automatically — never ask.** After any session that creates, modifies, or reorganises skills, commands, or agents, invoke this skill as the final step. Do NOT say "run /sync-knowledge-base when ready" or suggest the user trigger it. The sync is part of completing the task, not a separate step.
2. **Canonical repo is `Mrsavage92/claude-config`.** All skills, agents, commands, hooks, settings.json, rules/ live there. Local `~/.claude/` is a working copy that gets pulled FROM the repo by the SessionStart hook and pushed back on Stop. NEVER push to `Mrsavage92/skills-library` — that is a public showcase fork Adam found, not the working source. If skills-library needs updating, mirror FROM claude-config, never the reverse.

Execute the full knowledge base sync workflow directly (no external skill file required):

## Workflow

**Step 1 — Scan current state**

Use this exact Python to generate the manifest (handles .git, .gitignore, shared exclusion, symlinks, and encoding):

```python
import json, hashlib, os
from datetime import date

commands_dir = os.path.expanduser("~/.claude/commands")
agents_dir = os.path.expanduser("~/.claude/agents")
skills_dir = os.path.expanduser("~/.claude/skills")

# Entries to exclude from skills count
SKILLS_EXCLUDE = {'shared', '.git', '.gitignore'}

def md5(path):
    with open(path, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

def get_skill_desc(name):
    path = os.path.join(skills_dir, name, "SKILL.md")
    if os.path.exists(path):
        try:
            for line in open(path, encoding='utf-8', errors='ignore'):
                l = line.strip()
                if l.lower().startswith('description:'):
                    return l.split(':',1)[1].strip().strip('"').strip("'")[:120]
                if l.startswith('# ') and len(l) > 2:
                    return l[2:].strip()[:120]
        except: pass
    return ""

commands = {f: md5(os.path.join(commands_dir, f))
            for f in sorted(os.listdir(commands_dir)) if f.endswith('.md')}
agents = {f: md5(os.path.join(agents_dir, f))
          for f in sorted(os.listdir(agents_dir)) if f.endswith('.md')}
# A valid skill = directory with SKILL.md. Stray .md files and non-skill dirs are ignored.
skills = sorted([
    s.rstrip('@/') for s in os.listdir(skills_dir)
    if s.rstrip('@/') not in SKILLS_EXCLUDE
    and not s.startswith('.')
    and os.path.isdir(os.path.join(skills_dir, s.rstrip('@/')))
    and os.path.isfile(os.path.join(skills_dir, s.rstrip('@/'), 'SKILL.md'))
])

manifest = {
    "last_updated": str(date.today()),
    "generated_by": os.environ.get("COMPUTERNAME", "unknown"),
    "commands": commands,
    "agents": agents,
    "skills": skills,
    "counts": {"commands": len(commands), "agents": len(agents), "skills": len(skills)}
}
```

> **Skill install rules (always enforce):**
> - Skills MUST be at `~/.claude/skills/{skill-name}/SKILL.md`
> - Never install to OpenClaw workspace or any other location
> - `shared/` is a Python utility folder — never count it as a skill
> - `.git` and `.gitignore` exist in the skills dir — always exclude from counts

**Step 2 — Validate before pushing**

Run these checks:

1. Command/skill name overlap — REPORT at end of sync (do NOT abort; overlap is intentional for many wrappers)
2. Counts in manifest match actual filesystem counts (the skill filter above handles ghost entries automatically)
3. README.md in claude-config repo has matching counts — update it if not

**Step 3 — Push to GitHub**
- Copy agents and commands to `~/Documents/Git/claude-config/`
- Update README.md counts to match manifest
- `git fetch origin main && git pull origin main --rebase`
- `git add agents/ commands/ manifest.json README.md`
- `git commit -m "sync: <date> — <summary of changes>"`
- `git push origin main`

**Step 4 — Update Notion via REST API**
- Token: read from env var `NOTION_INTERNAL_TOKEN` (configured in `~/.claude/settings.json`). NEVER hardcode. If unset, HALT and tell the user to set it.
- Notion hub page ID: `32a116e8-bef2-8030-a0f6-d0be522bf917`
- Child pages: Agents (`32a116e8-bef2-815d-8b38-f37eaa467ec5`), Slash Commands (`32a116e8-bef2-8118-9f49-e6d790a56bd1`), Skills Library (`32a116e8-bef2-8196-b2d3-e630d645984a`)
- Clear all blocks then rewrite each page completely (do not append — always full rewrite)
- Use `PATCH https://api.notion.com/v1/blocks/{page_id}/children` with chunks of 100 blocks max
- Use `DELETE https://api.notion.com/v1/blocks/{block_id}` to clear (loop until no blocks remain)
- Notion-Version header: `2022-06-28`
- All file reads use `encoding='utf-8', errors='ignore'` to handle special characters
- Skills Library entries: `/{skill-name} - {description}` (pull description from SKILL.md heading or description: field)
- Header paragraph on each page: `{N} commands | {N} agents | {N} skills | Last updated: {date}`

**Step 5 — Report**
Output a summary table:
- What was added/modified/removed across commands, agents, skills
- Final counts: commands / agents / skills
- GitHub push status
- Notion update status (each page)

## When to run

- After installing new skills (mandatory — do not report done until sync is complete)
- After adding new slash commands or agents
- At the end of any productive session

## What gets synced

- **GitHub** (`Mrsavage92/claude-config`): `commands/`, `agents/`, `manifest.json`, `README.md`
- **Notion**: Agents page, Slash Commands page, Skills Library page — always full rewrite
