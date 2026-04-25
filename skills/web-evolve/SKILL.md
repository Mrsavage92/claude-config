---
name: web-evolve
description: >
  Score-driven continuous improvement loop for existing websites. Orchestrates
  a swarm of specialist agents — web-score (audit), web-benchmark (competitor gap),
  web-patch (single-check fix), web-screenshot (visual diff) — to iteratively
  improve a landing page until it hits the target score. Each iteration is
  agent-verified: score comes from web-score, diff comes from web-screenshot,
  fix comes from web-patch. The orchestrator never audits or fixes inline.
---

# Skill: /web-evolve

**Agent-swarm orchestrator for landing page quality improvement.**

This skill coordinates four specialist agents. It does not audit, fix, or score anything itself. Its only jobs are: spawn agents, read their structured outputs, make keep/revert/void decisions, and log every iteration to BUILD-LOG.md.

---

## Cardinal rules

1. **Never audit inline.** All scoring comes from `web-score` agent output. Never run grep checks or evaluate checks yourself.
2. **Never fix inline.** All fixes come from `web-patch` agent. Never edit source files directly.
3. **No score without a receipt.** Every score claim cites the `score.json` written by `web-score`.
4. **No kept commit without a visible diff.** Every kept iteration cites the `VISIBLE_DIFF` verdict from `web-screenshot`.
5. **Vision checks block until user confirms.** Surface every `NEEDS_HUMAN` block from `web-score` to the user. Do not proceed with those checks until the user replies. Update `score.json` with the reply before continuing.
6. **VOID beats revert for null-delta.** If `web-screenshot` returns `NULL_DELTA`, void the iteration (reclaim the slot), revert the commit, try a different fix approach.
7. **Raw score transparency.** When a veto cap is active and raw > final by >5 points, always show both: "raw 88% → capped 80 (B3 FAIL)".

---

## Inputs

- `project_path` — repo root (auto-detect from current directory)
- `live_url` — deployed URL (read from BUILD-LOG.md or passed as arg)
- `target_score` — default 90. Use 95 for "Stripe/Linear quality" mode.
- `benchmark_url` — override the auto-selected reference site (optional)
- `mode` — `backfill` | `greenfield` (auto-detect: DESIGN-BRIEF.md exists + src/components/landing/ populated = backfill)
- `max_iterations` — default: greenfield=8, backfill=20
- `--tier` — `1` (fast audit) or `2` (full audit). Default: 1 for loop iterations, 2 for baseline.

---

## Phase A — Setup (orchestrator only, no agents yet)

1. Read `CLAUDE.md`, `DESIGN-BRIEF.md`, `SCOPE.md`, `BUILD-LOG.md` from `project_path`.
2. Detect mode. Echo to user: "Mode: [backfill|greenfield] | Cap: [N] iterations | Target: [score]"
3. Auto-classify pages. Confirm target list with user — one message, then autonomous.
4. Verify `live_url` returns HTTP 200: `curl -s -o /dev/null -w "%{http_code}" [live_url]`
5. Create `.evolution/` directory structure:
   ```
   .evolution/
   ├── baseline/
   ├── benchmark/
   ├── scores/
   ├── iter-N/     (created per iteration)
   └── final/
   ```
6. Determine benchmark URL from DESIGN-BRIEF.md personality (see references/fix-routing.md Phase B.0 table) or user `--benchmark` arg.

---

## Phase B — Parallel baseline + benchmark (spawn two agents simultaneously)

Spawn both agents in a **single message** (parallel execution):

```
Agent(
  subagent_type='web-score',
  prompt="""
    project_path: {project_path}
    live_url: {live_url}
    output_path: {project_path}/.evolution/scores/
    tier: 2
    mode: {mode}
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md
  """
)

Agent(
  subagent_type='web-benchmark',
  prompt="""
    benchmark_url: {benchmark_url}
    benchmark_name: {benchmark_name}
    target_page_description: {one-paragraph description from DESIGN-BRIEF.md}
    target_personality: {personality from DESIGN-BRIEF.md}
    output_path: {project_path}/.evolution/benchmark/
  """
)
```

Wait for both to complete.

**After both complete:**
1. Read `.evolution/scores/score.json` → extract `priority_queue` and `needs_human_blocks`
2. Read `.evolution/benchmark/gap-analysis.json` → extract `top_5_priority_queue`
3. **Surface all NEEDS_HUMAN blocks to the user** — one message listing all vision checks needing confirmation. Wait for replies. Update `score.json` accordingly.
4. **Build final priority queue:** prepend benchmark `top_5_priority_queue` (priority 400) to score `priority_queue`. Sort descending by priority.
5. Write baseline score to BUILD-LOG.md in the mandatory format.
6. If `score.final_score >= target_score`: log "already at target — no evolution needed", skip to Phase D.

---

## Phase C — Improvement loop

```
while final_score < target_score AND iteration <= max_iterations:
  iteration += 1
```

### Step 1 — Pick top priority failure

Read the priority queue. Pick the highest-priority check that:
- Status is FAIL (not N/A, WONTFIX, or NEEDS_HUMAN-unconfirmed)
- Has not been attempted 3 times already (auto-WONTFIX if exhausted)

Look up `fix_skill` and `fix_context` from the check's priority_queue entry.

### Step 2 — Capture pre-fix screenshot

```
Agent(
  subagent_type='web-screenshot',
  prompt="""
    live_url: {live_url}
    section_name: {affected_section}
    before_screenshot_path: {project_path}/.evolution/iter-{N-1}/{affected_section}.png
      (or baseline path if iteration 1)
    after_screenshot_output_path: {project_path}/.evolution/iter-{iteration}/pre-fix-{affected_section}.png
    viewport: desktop
  """
)
```

Save this as the `before` reference for the post-fix diff.

### Step 3 — Apply fix

```
Agent(
  subagent_type='web-patch',
  prompt="""
    check_id: {check_id}
    fail_proof: {fail_proof from score.json}
    fix_skill: {fix_skill}
    fix_context: {fix_context}
    project_path: {project_path}
    iteration_number: {iteration}
    output_path: {project_path}/.evolution/iter-{iteration}/
  """
)
```

Read `patch-{check_id}-iter{iteration}.json`. If `status == FAILED` or `status == VOID`: log NEEDS_HUMAN, skip this check, continue loop.

### Step 4 — Verify visual diff + rescore (parallel)

```
Agent(
  subagent_type='web-screenshot',
  prompt="""
    live_url: {live_url}
    section_name: {affected_section}
    before_screenshot_path: {project_path}/.evolution/iter-{iteration}/pre-fix-{affected_section}.png
    after_screenshot_output_path: {project_path}/.evolution/iter-{iteration}/post-fix-{affected_section}.png
    viewport: desktop
  """
)

Agent(
  subagent_type='web-score',
  prompt="""
    project_path: {project_path}
    live_url: {live_url}
    output_path: {project_path}/.evolution/iter-{iteration}/
    tier: category:{affected_category}
    mode: {mode}
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md
  """
)
```

### Step 5 — Decision

Read `diff-verdict-{section}.json` and `score.json` from the iteration output:

| Screenshot verdict | Score delta | Decision |
|---|---|---|
| NULL_DELTA | any | **VOID** — `git revert HEAD --no-edit`, mark iter VOID (doesn't count toward cap), try different approach |
| VISIBLE_DIFF | score up | **KEEP** — log delta to BUILD-LOG.md |
| VISIBLE_DIFF | score same + target check now PASS | **KEEP** — log raw delta (veto cap hiding progress) |
| VISIBLE_DIFF | score same + target check still FAIL | **REVERT** — fix didn't resolve the check |
| VISIBLE_DIFF | score down | **REVERT** — regression, exclude this skill for this check |
| UNCERTAIN | any | Wait 10s, re-run web-screenshot once. If still UNCERTAIN → treat as NULL_DELTA. |

### Step 6 — Log iteration to BUILD-LOG.md

```markdown
### Evolution iteration N — [timestamp] [mode]
Page: [page]
Target check(s): [check_id] — [check name]
Skill(s) invoked: [fix_skill] (via web-patch agent)
Pre-score: [capped]/100 (raw [raw]%)
Post-score: [capped]/100 (raw [raw]%)
Delta capped: [+X / -X / 0]
Delta raw: [+X% / -X% / 0]
Visual diff: [before_path] → [after_path] — [diff_description]
H1 check: PASS (web-patch agent used — Skill invocation confirmed in patch JSON)
H2 check: [PASS (VISIBLE_DIFF) | VOID (NULL_DELTA) | UNCERTAIN]
Decision: [KEPT | REVERTED | VOID | WONTFIX]
Commit: [sha or "(reverted)" or "(voided)"]
```

---

## Phase D — Final report

1. Spawn `web-score` with `tier=2` against final state → `.evolution/scores/final-score.json`
2. Spawn `web-screenshot` for full desktop + mobile → `.evolution/final/`
3. Write `EVOLUTION-LOG.md`:
   - Baseline score → Final score
   - Score delta by category
   - Per-section before (`.evolution/baseline/`) → after (`.evolution/final/`) screenshots
   - Full iteration log (all kept + reverted + voided)
4. Final commit: `git commit -m "evolve: [page] final — score [baseline] → [final]"`
5. Push. Vercel auto-deploy if connected.

---

## Phase E — Post-deploy verification

1. Wait 30s.
2. Spawn `web-score` with `tier=1` against live URL → confirm deployed state matches local final.
3. Append "deployed verified — live score [N]/100" to EVOLUTION-LOG.md.

---

## Stop conditions

| Condition | Action |
|---|---|
| `final_score >= target_score` | Exit loop → Phase D |
| All failed checks attempted, no improvement | Log STUCK with remaining failures → Phase D |
| `iteration >= max_iterations` (VOID iters excluded) | Log TIMEOUT → Phase D |
| Same check failed 3× (all REVERT or VOID) | Auto-WONTFIX with "skill exhausted", continue |
| Build breaks twice in a row | HALT → NEEDS_HUMAN |
| User marks check WONTFIX | Log to BUILD-LOG, exclude from denominator |

---

## What this skill must NOT do

- Audit or score anything inline — always via `web-score` agent
- Fix or edit source files directly — always via `web-patch` agent
- Self-grade vision checks — always surface NEEDS_HUMAN to user
- Claim score improvement without `web-screenshot` VISIBLE_DIFF verdict
- Skip the BUILD-LOG entry for any iteration (including VOID)
