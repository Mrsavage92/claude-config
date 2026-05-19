---
name: skill-miner
description: Mines your Claude Code session transcripts (JSONL files) to surface recurring prompt patterns that don't yet have a dedicated skill. Use this skill whenever the user asks "what prompts should be skills", "find missing skills", "mine my transcripts", "what am I repeating", "find skill gaps", or runs `/skill-miner`. Also use proactively when the user is about to author a new skill via `/skill-creator` — running this first reveals whether they're already repeating the work elsewhere, and which existing skills could be extended instead of creating new ones. Outputs a ranked report of prompt clusters with NEW SKILL / EXTEND / IGNORE recommendations.
---

# Skill Miner — Find prompt patterns that deserve to be skills

This skill answers a specific question: across all your past Claude Code sessions, **what are you repeatedly asking for that isn't a skill yet?**

It reads your JSONL session logs (the raw conversation transcripts that Claude Code writes for every session), clusters recurring user prompts, checks each cluster against your existing skill inventory, and emits a ranked report with recommendations.

It does NOT call an LLM. Clustering is done with Python stdlib trigram-overlap — fast, free, deterministic. The recommendation step is a structural lookup against your installed skills.

## When to use

- "What prompts should I turn into skills?"
- "Find the gaps in my skill library"
- Before authoring a new skill — to confirm you don't already have one that fits
- After a heavy week of Claude Code use, to mine new patterns
- As input for `/skill-creator` — the JSON sidecar feeds straight into authoring

## When NOT to use

- The skill *creation* itself — that's `/skill-creator`
- Auditing existing skills for quality — that's `/skill-forge`
- Listing what skills you have — that's `find-skills` / `ls ~/.claude/skills/`
- A specific question about a single skill — just read its SKILL.md

## How it works (one paragraph)

The Python script walks `~/.claude/projects/` and other configured paths for `*.jsonl` files, streams each line, extracts user messages (skipping assistant turns, tool results, system reminders, slash command echoes), normalizes the text, and computes overlapping word-trigrams. Prompts sharing ≥3 distinctive trigrams are merged into clusters. For each cluster with ≥5 members, the script reads every installed `SKILL.md`'s frontmatter description and checks whether ≥2 of the cluster's distinctive tokens already appear in an existing skill's trigger description. If yes → EXTEND that skill. If no → NEW SKILL. If the cluster's trigrams are generic (e.g. "let me know", "thanks for the") → IGNORE.

## Usage

```bash
# Default: scan default paths, last 90 days, top 10 clusters
python ~/.claude/skills/skill-miner/scripts/mine_transcripts.py

# Narrower time window
python ~/.claude/skills/skill-miner/scripts/mine_transcripts.py --days 30

# More clusters
python ~/.claude/skills/skill-miner/scripts/mine_transcripts.py --top 25

# Custom scan path
python ~/.claude/skills/skill-miner/scripts/mine_transcripts.py --path ~/.claude-work/projects

# JSON only (machine-readable)
python ~/.claude/skills/skill-miner/scripts/mine_transcripts.py --json
```

Default scan paths (cross-platform via `pathlib.Path.home()`):
- `~/.claude/projects/`
- `~/Documents/Claude/`
- `~/.claude-work/`

The script auto-detects which paths exist and skips missing ones. No error if a path doesn't exist.

Output goes to `~/.claude/skill-miner/`:
- `report-YYYY-MM-DD.md` — human-readable ranked report
- `report-YYYY-MM-DD.json` — machine-readable sidecar for `/skill-creator`

## Reading the report

Each cluster entry looks like this:

```markdown
### Cluster 3 — "audit response handling" (12 occurrences, 2026-03-04 → 2026-05-12)

**Sample prompts:**
- "the audit response shows blanks for some suites, can you check..."
- "audit run came back with 0 findings for security but it should have..."
- "why is the response missing the priority queue field..."

**Distinctive trigrams:** `audit response shows`, `response shows blanks`, `audit run came`

**Existing skill match:** none

**Recommendation:** NEW SKILL — propose name `audit-response-debug`

**Reason:** Recurring 12+ times, no existing skill description contains "audit response". Cluster is operationally specific (debug pattern), not a one-off question.
```

The JSON sidecar contains the same data in a flat array per cluster, with all distinctive tokens, the full prompt list (truncated to 80 chars per entry for privacy), and the recommended action.

## Output Artifacts

| Request | Deliverable | Format |
|---|---|---|
| `/skill-miner` | Ranked cluster report + JSON sidecar | `~/.claude/skill-miner/report-*.{md,json}` |
| `--json` only | JSON only (no markdown) | stdout + sidecar |
| `--days N --top M` | Filtered/limited report | Same paths, narrower content |

## Workflow integration

After the report writes, the skill prints:

```
Top recommendation: NEW SKILL — /audit-response-debug (12 occurrences).
Run: Skill('skill-creator') with arg @~/.claude/skill-miner/report-2026-05-19.json
```

Adam can copy that line straight into a new turn to author the top-ranked skill.

## Anti-Patterns (do NOT do these)

- **Reading entire JSONL into memory** — files routinely exceed 50MB. Stream line-by-line with `for line in f:`.
- **Calling Claude for clustering** — trigram overlap is sufficient, deterministic, and free. The whole point of this skill is to find *missing* skills, not to spend money finding them.
- **Reporting clusters that match an existing skill description as NEW SKILL** — must check `~/.claude/skills/*/SKILL.md` frontmatter descriptions first. Recommend EXTEND for matches.
- **Including full prompt bodies in shared output** — privacy. Truncate samples to 80 chars. Adam's transcripts contain client work and personal context.
- **Hardcoding Mac paths** — Adam runs on Windows primary, Mac secondary. Use `pathlib.Path.home()` and forward slashes.
- **Failing on malformed JSONL lines** — log-and-skip individual bad lines, never abort the whole run. Older session files have schema drift.
- **Counting assistant turns** — only `type=user` + `message.role=user` + `userType=external`. System reminders and tool results inflate counts.

## Proactive Triggers

- User is about to invoke `/skill-creator` → suggest running `/skill-miner` first to check for an EXTEND candidate
- User says "I keep asking for X" → run `/skill-miner` filtered to relevant terms
- Quarterly maintenance check → run with `--days 90` to find new patterns since last quarter
- After bulk transcript imports (e.g. moved a project's history) → re-run to refresh recommendations

## Related Skills

- `/skill-creator` — author a new skill once `/skill-miner` identifies a gap
- `/skill-forge` — audit and rebuild an existing skill that scored low
- `/self-audit` — broader harness audit (skills + agents + rules + config)
- `/usage-report` — *which* skills you use; this skill finds skills you don't yet have

## Exit codes

- `0` — report written successfully, ≥1 cluster found
- `1` — no qualifying clusters found (insufficient data or no recurring patterns)
- `2` — error (path inaccessible, malformed inventory, etc.)
