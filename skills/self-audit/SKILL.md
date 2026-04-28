---
name: self-audit
description: >
  Run a structural audit of the Claude Code harness (skills, agents, system prompts,
  config) against expert design-replication and frontend-build practice. Identifies
  redundancy, opinion-injection that fights replication, missing re-grounding loops,
  and skill bloat. Logs findings to audits/YYYY-MM-DD-audit.md and tracks chronic
  issues across runs. Triggered by "audit yourself", "self-improve", "self-audit",
  or `/self-audit`.
tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
---

# Skill: /self-audit

## Purpose

Re-runs the same 7-step audit that produced the 2026-04-28 baseline. The output gets logged so chronic issues (the same finding across 2+ consecutive runs) can be flagged as load-bearing failures, not one-offs.

## Trigger phrases

Fire this skill when the user message contains any of:
- "audit yourself"
- "self-audit"
- "self-improve"
- "/self-audit"
- "what's wrong with your config"
- "why are builds drifting"
- "why does design replication fail"

## Step 1 — Inventory

List every active config component:
- All directories under `~/.claude/skills/` (count + names)
- All under `~/.claude/agents/` (count + names)
- All under `~/.claude/commands/` (count + names)
- `~/.claude/CLAUDE.md` (read in full)
- `~/.claude/web-system-prompt.md` (read in full)
- `~/.claude/settings.json` (read — note hooks, permissions, enabled MCPs)
- `~/.claude/rules/` (read README, list rule files)
- Any project-level `CLAUDE.md` files in the cwd

For each notable file, record:
- What it injects into context (size, content type)
- What behaviours it encourages
- What behaviours it forbids or constrains

## Step 2 — Diagnose against expert practice

For each of the 10 principles below, mark current setup as **ALIGNED / PARTIAL / MISSING / ACTIVELY FIGHTING** with one-sentence evidence:

1. Visual grounding over description
2. Design tokens as source of truth, re-read every section
3. Section-by-section builds, not page-at-once
4. Mandatory self-diff between sections
5. Final consistency sweep across all sections
6. Unopinionated execution mode
7. Re-grounding as first-class step
8. Browser MCP for DOM, computed styles, CSS variables — not just screenshots
9. Constraints stated as negatives
10. Iteration on diffs, not rewrites

## Step 3 — Identify root causes

Top 3-5 structural issues. Each must:
- Name the responsible skill, file, or config line
- Cite a specific quote or behaviour, not vibes
- Avoid politeness — if a skill the user built is causing drift, say so

## Step 4 — Propose fixes

Format as a change list:

| # | Fix | File/Skill | Action | Status |

Action ∈ {APPLY, STAGE, DEFER}. APPLY = additive + reversible. STAGE = destructive (removal/consolidation). DEFER = needs more investigation first.

## Step 5 — Execute or stage

For APPLY items: do them now, commit with `chore(audit): {short description}` message.
For STAGE items: write the proposed diff to `audits/YYYY-MM-DD-staged.md` and surface it for sign-off.
For DEFER items: log the open question.

## Step 6 — Verify

After applying:
- List what changed (filenames + what was added/edited)
- Show new active configuration where it differs
- Identify any remaining gaps not addressed

## Step 7 — Log

Write the full audit (Inventory + Diagnosis + Root Causes + Fixes + Applied + Staged + Remaining gaps) to `audits/{YYYY-MM-DD}-audit.md` at the cwd root.

If `audits/` doesn't exist, create it.

If a previous audit exists in `audits/`, read it and:
- Compare current Root Causes against previous Root Causes
- For any cause appearing in 2+ consecutive audits, flag as **CHRONIC** at the top of today's audit
- For any cause from a previous audit that is no longer present, mark as **RESOLVED** with the date it was applied

## Output format

```
## Inventory
[skill/config list — counts + key files]

## Diagnosis
[10-row alignment table]

## Root Causes
1. [cause] — [file path] — [evidence quote/line]
2. ...

## Fixes
| # | Fix | File/Skill | Action | Status |

## Applied
[committed changes with file paths]

## Staged for approval
[destructive changes awaiting sign-off]

## Remaining gaps
[what wasn't addressed and why]

## Chronic issues (if any)
[causes appearing in 2+ consecutive audits]

## Resolved since last audit (if any)
[previous causes no longer present]

## Audit logged to
[file path]
```

## Anti-patterns

- **Generating generic best-practice advice.** Every recommendation must cite a specific file or line. "Add re-grounding" without naming where = useless.
- **Defaulting to "more skills."** Often the fix is removal, consolidation, or a config change — not a new skill.
- **Politeness about skills the user built.** If a skill is causing the failure, say so. The user explicitly authorized blunt diagnosis.
- **Skipping verification.** After applying changes, list what's actually different — don't just claim it.
- **Re-running this skill without comparing to previous audit log.** Chronic issues are the highest-priority signal.

## Related skills

- `/style-mirror` — produces tokens.lock.json that the audit checks for
- `/sync-knowledge-base` — push fixes back to claude-config repo
- `/usage-report` — what's actually being used (complementary to this audit, which finds what's broken)
