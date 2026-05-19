---
name: project-triage
description: Scans a parent directory for dormant project folders, reads each one's README + last commit date + git activity + LOC, then verdicts every folder as REVIVE, KILL, or IGNORE with a one-line reason. Use this skill whenever the user says "what projects do i have laying around", "find my dormant projects", "what should i revive or kill", "/project-triage", "audit my unfinished projects", "scan ~/Documents for half-built stuff", or wants to clean up a folder full of abandoned scaffolds. Outputs a ranked CSV + markdown table that the user can act on. Especially useful before starting a new project — surfaces existing work that could be resurrected instead of starting from zero.
---

# Project Triage — Verdict every dormant folder

Most builders have folders full of half-finished projects. This skill walks a parent directory, gathers structural signals for each child folder, and emits a verdict per project: **REVIVE**, **KILL**, or **IGNORE**.

It does NOT call an LLM. Everything is structural: git activity, file counts, README presence, package.json + Cargo.toml + pyproject.toml inspection, last-modified timestamps. The verdict logic is deterministic and explainable.

## When to use

- "What projects do I have lying around?"
- "Find the half-finished scaffolds in ~/Documents/Claude"
- Before starting something new — check if a dormant version already exists
- Quarterly cleanup of `~/projects/`, `~/Documents/Claude/`, or `~/.claude-work/`
- After a pivot (e.g. rebranding) — find the old folder, decide if it should be archived

## When NOT to use

- Auditing ONE active project for quality — that's `/audit` or `/full-audit`
- Picking the next task within an active project — that's `/autopilot` or backlog grooming
- Project status reporting to stakeholders — that's `project-health`
- The user wants to read a specific README — just use Read directly

## How it works

The Python script walks one or more parent directories (one level deep — does not recurse into project internals). For each child folder, it gathers signals:

1. **Last git commit timestamp** (`git log -1 --format=%ct`) → days since last activity
2. **Total commits** (`git rev-list --count HEAD`) → effort invested
3. **README presence + length** → user-facing intent / docs / nothing
4. **package.json / pyproject.toml / Cargo.toml / go.mod** → recognized stack
5. **Source file count** (top-level src/ or app/ or pages/) → LOC magnitude
6. **Active project registry match** — checks if folder appears in `~/Documents/Claude/outputs/active-revenue-projects.md`, `~/.claude/CLAUDE.md`, or as a project CLAUDE.md location → never KILL an active project
7. **`.untangler/state.json` presence** → mid-refactor, never KILL

Verdict logic (in order):

| Condition | Verdict |
|---|---|
| Folder is in active project registry | IGNORE (active) |
| `.untangler/state.json` exists | IGNORE (mid-refactor) |
| No git history AND README < 200 chars AND < 5 source files | KILL (nothing of value) |
| Last commit > 180 days ago AND < 20 commits total AND no recent edits | KILL (stale stub) |
| Last commit > 90 days ago AND README present AND ≥ 20 commits | REVIVE (substantive but dormant) |
| Last commit > 90 days ago AND README absent | KILL (no intent captured) |
| Last commit < 90 days ago | IGNORE (active or recent) |
| Default | IGNORE |

## Usage

```bash
# Scan default parents (auto-detects what exists)
python ~/.claude/skills/project-triage/scripts/triage.py

# Scan a specific parent
python ~/.claude/skills/project-triage/scripts/triage.py --path ~/Documents/Claude

# Adjust dormancy threshold (default 90 days for REVIVE, 180 for KILL)
python ~/.claude/skills/project-triage/scripts/triage.py --revive-days 60 --kill-days 180

# JSON output
python ~/.claude/skills/project-triage/scripts/triage.py --json

# Skip the active-project registry check (force verdicts on everything)
python ~/.claude/skills/project-triage/scripts/triage.py --no-registry-check
```

Default parents (auto-detected via `pathlib.Path.home()`):
- `~/Documents/Claude/`
- `~/.claude-work/projects/`
- `~/projects/` (if it exists)

Output goes to `~/.claude/project-triage/`:
- `triage-YYYY-MM-DD.md` — sorted table with verdict and one-line reason
- `triage-YYYY-MM-DD.csv` — for spreadsheet import
- `triage-YYYY-MM-DD.json` — machine-readable

## Reading the report

```markdown
| Project | Days dormant | Commits | README? | Stack | Verdict | Reason |
|---|---|---|---|---|---|---|
| growlocal-old | 247 | 4 | no | none | KILL | No git history, no README, abandoned scaffold |
| broadband-mvp | 132 | 87 | yes (2.4kb) | python | REVIVE | Substantive (87 commits, 132 days dormant, has README) |
| audithq-archive-2026-03 | 84 | 312 | yes | typescript | IGNORE | Listed in active project registry |
| test-vite-thing | 312 | 1 | no | typescript | KILL | Stale stub: 1 commit, no README, 312 days |
```

## Output Artifacts

| Request | Deliverable | Format |
|---|---|---|
| `/project-triage` | Verdict table + CSV + JSON | `~/.claude/project-triage/triage-*.{md,csv,json}` |
| `--path <dir>` | Same outputs, scoped to one parent | Same paths |
| `--json` | JSON only | stdout |

## Anti-patterns

- **Calling Claude or an LLM to verdict** — purely structural. Deterministic, free, fast.
- **Recursing into project internals** — one level deep only. Don't try to grade code quality; that's `/audit`.
- **Killing without checking the active project registry** — Adam's `[project_registry]` matters. KILLing AuditHQ because it had no recent commits = disaster.
- **Ignoring `.untangler/state.json`** — mid-refactor folders look dormant but are actively in progress.
- **Hardcoded Mac/Linux paths** — use `pathlib.Path.home()` and forward slashes. Adam runs on Windows primary.
- **Verdicting hidden/system folders** — skip `.git`, `node_modules`, `.next`, `.venv`, `__pycache__`, anything starting with `.` (except project roots themselves).

## Proactive Triggers

- User mentions starting a new project → suggest running `/project-triage` first to find dormant relatives
- User describes a rebrand or pivot → run to find the orphaned old version
- Folder name in user message matches a known dormant project → flag and offer to triage

## Related Skills

- `/skill-miner` — same pattern (mine your past for value) but for prompts, not projects
- `/audit` — once REVIVE is decided, audit the project for quality
- `/codebase-untangler` — heavy refactor for tangled REVIVE candidates
- `/project-doc` — write a Notion doc for REVIVE candidates worth resurrecting

## Exit codes

- `0` — report written, at least one project verdicted
- `1` — no projects found (empty parent or all skipped)
- `2` — error (parent missing, git not installed, etc.)
