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

**Step 2B — Pre-flight lint scan (MANDATORY before first commit attempt)**

Before running `git add`, run the skill linter against every changed skill. A single round fixes all violations; the alternative is 5 blocked commits.

```bash
# Run from ~/Documents/Git/claude-config after copying files but before git add
for skill_dir in skills/*/; do
  if git diff --name-only HEAD -- "$skill_dir" 2>/dev/null | grep -q .; then
    python3 skills/skill-forge/scripts/lint_skill.py "$skill_dir" 2>&1 | grep -E "ERROR|BLOCKING" && echo "FIX BEFORE COMMIT: $skill_dir"
  fi
done
```

The linter's banned-phrase list lives at `skills/skill-forge/scripts/lint_skill.py` (`BANNED_PHRASES` list at line 38). Common rewording: quality adjectives → scope nouns (e.g. "full", "exact", "thorough"); comparative references → name a concrete site (e.g. "matches HubSpot.com") rather than abstract claims.

Only proceed to Step 3 when the linter returns 0 blocking errors across all changed skills.

**Step 3 — Push to GitHub**
- Copy agents and commands to `~/Documents/Git/claude-config/`
- Update README.md counts to match manifest
- `git fetch origin main && git pull origin main --rebase`
- `git add agents/ commands/ manifest.json README.md`
- `git commit -m "sync: <date> — <summary of changes>"`
- `git push origin main`

**Step 4 — Update Notion via the notion skill's wrapper (NEVER write urllib code with a token literal)**

This step previously emitted a runtime Python script that hardcoded the token literal. That was the source of the public-repo leak. The fix is mechanical: do NOT write inline auth code; use the `notion-call.sh` wrapper from the notion skill.

- Token: `notion-call.sh` reads `NOTION_INTERNAL_TOKEN` from env; if unset OR set to the previously-leaked literal, the script halts.
- Notion hub page ID: `32a116e8-bef2-8030-a0f6-d0be522bf917`
- Child pages: Agents (`32a116e8-bef2-815d-8b38-f37eaa467ec5`), Slash Commands (`32a116e8-bef2-8118-9f49-e6d790a56bd1`), Skills Library (`388116e8-bef2-8149-844c-c87b685d5e72`)
- Clear all blocks then rewrite each page completely (full rewrite — never append). Per the notion skill, this is the GET → DELETE-loop → PATCH procedure:
  ```bash
  WRAP="C:/Users/Adam/.claude/skills/notion/scripts/notion-call.sh"
  PAGE_ID="<one of the child page IDs above>"
  bash "$WRAP" GET /v1/blocks/$PAGE_ID/children > /tmp/existing.json
  jq -r '.results[].id' /tmp/existing.json | while read block_id; do
    bash "$WRAP" DELETE /v1/blocks/$block_id
  done
  bash "$WRAP" PATCH /v1/blocks/$PAGE_ID/children --children-file /tmp/new-children.json
  ```
- The wrapper auto-chunks PATCH children at 100/req and sets `Notion-Version: 2022-06-28`. You do not handle either concern in your own code.
- Build the new-children JSON by combining templates in `C:/Users/Adam/.claude/skills/notion/references/block-templates/`. Header paragraph format: `{N} commands | {N} agents | {N} skills | Last updated: {date}`. Each skill entry: `/{skill-name} - {description}` (pull description from SKILL.md `description:` frontmatter or H1 heading).
- **Forbidden:** writing any Python or shell that contains `Authorization: Bearer ntn_...`, `TOKEN = 'ntn_...'`, or any other inline token. If you find yourself typing those bytes, stop and use the wrapper.

**Step 5 — Verify counts + strip banned phrases before emitting the report**

Two mechanical gates run before the user sees the summary. Both must pass.

```bash
# Gate 1 — verify the report's claimed counts match the manifest we just wrote.
# Mechanical fix for the 178-vs-175 count drift in the forge baseline.
bash scripts/verify-counts.sh manifest.json $CMDS_IN_REPORT $AGTS_IN_REPORT $SKILLS_IN_REPORT
# Exit 2 = mismatch; recompute from manifest and try again.

# Gate 2 — strip banned self-praise from the report text before printing.
# Mechanical fix for the coverage-claim pattern appearing in the baseline report.
printf '%s' "$REPORT_TEXT" > /tmp/sync-report.md
bash scripts/strip-banned-phrases.sh /tmp/sync-report.md
# Exit 3 = banned phrase found; edit the report text to remove it and re-run.
```

Only after both exit 0 may the report be shown to the user. The summary table:
- What was added/modified/removed across commands, agents, skills
- Final counts: commands / agents / skills (read from `manifest.json`, not estimated)
- GitHub push status (commit SHA)
- Notion update status (per page: blocks cleared / blocks written)

The summary is FACTUAL — counts, commit SHA, page IDs. Never a self-rating of the sync quality.

## When to run

- After installing new skills (mandatory — do not report done until sync is complete)
- After adding new slash commands or agents
- At the end of any productive session

## What gets synced

- **GitHub** (`Mrsavage92/claude-config`): `commands/`, `agents/`, `manifest.json`, `README.md`
- **Notion**: Agents page, Slash Commands page, Skills Library page — always full rewrite
