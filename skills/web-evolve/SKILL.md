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

This skill coordinates four specialist agents. It does not audit, fix, or score anything itself. Its only jobs are: spawn agents, read their structured JSON outputs, make keep/revert/void decisions, and log every iteration to BUILD-LOG.md.

---

## Cardinal rules (non-negotiable)

1. **Never audit inline.** All scoring comes from `web-score` agent output. Never run grep checks yourself.
2. **Never fix inline.** All fixes come from `web-patch` agent. Never edit source files directly.
3. **No score without a receipt.** Every score claim cites a `score.json` written by `web-score`.
4. **No kept commit without VISIBLE_DIFF.** Every kept iteration cites the `web-screenshot` verdict.
5. **Vision checks block until user confirms.** Surface every `NEEDS_HUMAN` block from `web-score`. Wait. Update score.json. Then continue.
6. **NULL_DELTA = VOID, not revert.** Reclaim the iteration slot, try a different fix strategy.
7. **Raw score transparency.** When veto cap hides progress by >5 pts: show both "raw 88% → capped 80".

---

## Inputs

| Input | Default | Notes |
|---|---|---|
| `project_path` | current directory | auto-detect |
| `live_url` | from BUILD-LOG.md | production URL for Phase E verification |
| `dev_server_url` | none | if set, loop screenshots use localhost (faster — no deploy wait) |
| `target_score` | 90 | use 95 for Stripe/Linear quality mode |
| `benchmark_url` | auto by personality | override with `--benchmark=URL` |
| `mode` | auto-detect | backfill if DESIGN-BRIEF.md + src/components/landing/ exist; else greenfield |
| `max_iterations` | 8 (greenfield) / 20 (backfill) | VOID iterations don't count toward cap |
| `tier` | 1 for loop / 2 for baseline | 1 = ~20 highest-signal checks; 2 = all 79 |

---

## Phase A — Setup (orchestrator only, no agents)

**Steps — run all reads in parallel:**

1. Read these files simultaneously:
   - `{project_path}/CLAUDE.md`
   - `{project_path}/DESIGN-BRIEF.md`
   - `{project_path}/SCOPE.md`
   - `{project_path}/BUILD-LOG.md`

2. Detect mode: `DESIGN-BRIEF.md` exists AND `src/components/landing/` is non-empty → `backfill`. Otherwise → `greenfield`.

3. Echo to user (one message):
   ```
   web-evolve starting
   Mode: [backfill|greenfield] | Cap: [N] iterations | Target: [score]/100
   Benchmark: [benchmark_url]
   Screenshots: [dev_server_url if set, else "live URL — 30s deploy wait per iteration"]
   Pages in scope: [list]
   Proceed? (reply to confirm or adjust)
   ```
   Wait for user confirmation. After that — fully autonomous.

4. Verify `live_url` is reachable:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" {live_url}
   ```
   Must return 200. If not — HALT, surface NEEDS_HUMAN.

5. Create directory structure:
   ```bash
   mkdir -p {project_path}/.evolution/{baseline,benchmark,scores,final}
   ```

6. Determine benchmark URL from DESIGN-BRIEF.md `personality` field:
   - Enterprise Authority → https://stripe.com
   - Data Intelligence → https://linear.app
   - Growth Engine → https://vercel.com
   - Trusted Productivity → https://notion.so
   - Premium Professional → https://framer.com
   - Bold Operator → https://shopify.com
   - Health & Care / Civic → user must specify via `--benchmark=URL`

7. HALT if no DESIGN-BRIEF.md exists in greenfield mode — surface: "Run `Skill('web-design-research')` first."

---

## Phase B — Parallel baseline + benchmark

Spawn both agents **in a single message** using two simultaneous Agent tool calls with `run_in_background: true`. Do not wait for one before starting the other.

### Agent call format (exact — copy this pattern)

```
Agent tool call 1:
  description: "Baseline audit — landing page score"
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {live_url}
    output_path: {project_path}/.evolution/scores
    tier: 2
    mode: {mode}
    checklist_path: C:/Users/Adam/Documents/Git/claude-config/skills/shared/landing-page-checklist.md

Agent tool call 2:
  description: "Competitor benchmark — gap analysis"
  subagent_type: "web-benchmark"
  run_in_background: true
  prompt: |
    benchmark_url: {benchmark_url}
    benchmark_name: {benchmark_name}
    target_page_description: {aesthetic_direction and hero description from DESIGN-BRIEF.md}
    target_personality: {personality from DESIGN-BRIEF.md}
    output_path: {project_path}/.evolution/benchmark
```

Wait for both background agents to complete (you will be notified).

### After both complete

1. `Read {project_path}/.evolution/scores/score.json`
2. `Read {project_path}/.evolution/benchmark/gap-analysis.json`
3. If either file missing → the agent failed. Re-run that agent once. If still missing → HALT, NEEDS_HUMAN.
4. Extract `needs_human_blocks` from score.json. If non-empty → surface ALL of them to user in one message. Wait for user replies. Update score.json `checks` entries with confirmed PASS/FAIL.
5. Build final priority queue:
   - Take `top_5_priority_queue` from gap-analysis.json (priority 400 each)
   - Append `priority_queue` from score.json
   - Sort descending by priority value
   - Deduplicate (if a gap-analysis check is already in score queue, keep the gap-analysis entry)
6. Write baseline score block to BUILD-LOG.md (mandatory format from checklist).
7. If `score.final_score >= target_score` → log "already at target", skip to Phase D.

---

## Phase C — Improvement loop

Maintain a loop state object:
```json
{
  "iteration": 0,
  "void_count": 0,
  "real_iterations": 0,
  "current_score": {from score.json},
  "priority_queue": [{...}],
  "attempt_counts": {"A7": 0, "J3": 0}
}
```

Loop condition: `current_score < target_score AND real_iterations < max_iterations`

---

### Step 1 — Pick check

From priority queue, find the highest-priority entry where:
- `status == "FAIL"`
- `attempt_counts[check_id] < 3`

If `attempt_counts[check_id] == 3` → mark WONTFIX in BUILD-LOG.md, remove from queue, pick next.

If queue is empty → log STUCK, exit loop.

---

### Step 2 — Pre-fix screenshot

```
Agent tool call:
  description: "Pre-fix screenshot — {section_name} before iteration {iteration}"
  subagent_type: "web-screenshot"
  prompt: |
    live_url: {dev_server_url if set, else live_url}
    section_name: {section_affected_by_check}
    before_screenshot_path: NONE (this IS the before — save only)
    after_screenshot_output_path: {project_path}/.evolution/iter-{iteration}/before-{section}.png
    scroll_to_selector: {CSS selector for the section, if known}
    viewport: desktop
```

This screenshot becomes the `before` reference for the post-fix diff.

---

### Step 3 — Apply fix

```
Agent tool call:
  description: "Fix check {check_id} — iteration {iteration}"
  subagent_type: "web-patch"
  prompt: |
    check_id: {check_id}
    fail_proof: {exact fail_proof string from score.json checks[check_id]}
    fix_skill: {fix_skill from priority_queue entry}
    fix_context: {fix_context from priority_queue entry}
    project_path: {project_path}
    iteration_number: {iteration}
    output_path: {project_path}/.evolution/iter-{iteration}
```

Read `{project_path}/.evolution/iter-{iteration}/patch-{check_id}-iter{iteration}.json`.

If `status == "FAILED"` or `status == "NEEDS_HUMAN"`:
- Log NEEDS_HUMAN in BUILD-LOG.md
- Increment `attempt_counts[check_id]`
- Continue to next loop iteration (no screenshot, no rescore needed)

---

### Step 3.5 — Deploy (conditional)

**If `dev_server_url` is NOT set (using live URL):**
```bash
git -C {project_path} push origin main
```
Then wait 30 seconds for Vercel to deploy before proceeding to Step 4.

**If `dev_server_url` IS set:**
No push needed. The dev server serves current file state immediately. Skip wait.

---

### Step 4 — Post-fix screenshot + category rescore (parallel)

```
Agent tool call 1:
  description: "Post-fix screenshot — {section} after iteration {iteration}"
  subagent_type: "web-screenshot"
  run_in_background: true
  prompt: |
    live_url: {dev_server_url if set, else live_url}
    section_name: {section}
    before_screenshot_path: {project_path}/.evolution/iter-{iteration}/before-{section}.png
    after_screenshot_output_path: {project_path}/.evolution/iter-{iteration}/after-{section}.png
    scroll_to_selector: {CSS selector}
    viewport: desktop

Agent tool call 2:
  description: "Category rescore — {category} after iteration {iteration}"
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {dev_server_url if set, else live_url}
    output_path: {project_path}/.evolution/iter-{iteration}
    tier: category:{affected_category_letter}
    mode: {mode}
    checklist_path: C:/Users/Adam/Documents/Git/claude-config/skills/shared/landing-page-checklist.md
```

Wait for both to complete. Read both output files.

---

### Step 5 — Decision

| `web-screenshot` verdict | Score change | Decision |
|---|---|---|
| `NULL_DELTA` | any | **VOID** — `git -C {project_path} revert HEAD --no-edit`. Increment `void_count`. Do NOT increment `real_iterations`. Do NOT increment `attempt_counts`. Try next fix strategy. |
| `VISIBLE_DIFF` | up | **KEEP** — update `current_score`. Increment `real_iterations`. |
| `VISIBLE_DIFF` | same, target check now PASS | **KEEP** — log raw delta. Increment `real_iterations`. |
| `VISIBLE_DIFF` | same, target check still FAIL | **REVERT** — `git revert HEAD --no-edit`. Increment `attempt_counts[check_id]`. Increment `real_iterations`. |
| `VISIBLE_DIFF` | down | **REVERT** — regression. Mark fix_skill excluded for this check. Increment `attempt_counts[check_id]`. Increment `real_iterations`. |
| `UNCERTAIN` | any | Re-run web-screenshot once after 10s. If still UNCERTAIN → treat as NULL_DELTA (VOID). |

---

### Step 6 — BUILD-LOG entry (mandatory every iteration, including VOID)

Append to BUILD-LOG.md:

```markdown
### Evolution iteration {iteration} — {timestamp} [mode: {mode}]
Page: {page}
Target check: {check_id} — {check_name}
Fix skill: {fix_skill} (via web-patch agent)
Attempt #{attempt_counts[check_id]} for this check
Pre-score: {capped}/100 (raw {raw}%)
Post-score: {capped}/100 (raw {raw}%)
Delta capped: {+X / -X / 0}
Delta raw: {+X% / -X% / 0}
Screenshots: {before_path} → {after_path}
Diff verdict: {VISIBLE_DIFF | NULL_DELTA | UNCERTAIN} — {diff_description}
H1: PASS (web-patch agent — Skill invoked per patch JSON)
H2: {PASS | VOID | UNCERTAIN}
Decision: {KEPT | REVERTED | VOID | WONTFIX}
Commit: {sha | "(reverted)" | "(voided)"}
```

Update priority_queue: move fixed check to end if KEPT, keep at top if REVERTED.

---

### Stop conditions

| Condition | Action |
|---|---|
| `current_score >= target_score` | Exit loop → Phase D |
| `real_iterations >= max_iterations` | Log TIMEOUT → Phase D |
| Priority queue empty | Log STUCK with remaining failures → Phase D |
| Check attempted 3× | Auto-WONTFIX, continue |
| Build breaks twice in a row | HALT → NEEDS_HUMAN |

---

## Phase D — Final report + push

1. **Final full audit:**
   ```
   Agent: web-score | tier: 2 | output: .evolution/scores/final-score.json
   ```

2. **Final screenshots:**
   ```
   Agent: web-screenshot | full-page desktop + mobile | output: .evolution/final/
   ```

3. Write `EVOLUTION-LOG.md` with:
   - Baseline → Final score
   - Category delta table
   - Per-section before/after screenshot pairs
   - Full iteration log (KEPT / REVERTED / VOID / WONTFIX per iteration)

4. Final commit:
   ```bash
   git -C {project_path} add EVOLUTION-LOG.md BUILD-LOG.md
   git -C {project_path} commit -m "evolve: {page} final — score {baseline} → {final}"
   git -C {project_path} push origin main
   ```

5. Vercel auto-deploys. Proceed to Phase E after 30s.

---

## Phase E — Post-deploy verification

1. Navigate to `live_url` via Puppeteer.
2. Spawn `web-score` with `tier: 1` against `live_url` → confirm live matches local final.
3. Append to EVOLUTION-LOG.md: `deployed verified — live score {N}/100`

---

## What this skill must NOT do

- Run grep, Read, or Bash checks to audit — always via `web-score` agent
- Edit source files — always via `web-patch` agent
- Answer vision checks itself — always surface NEEDS_HUMAN and wait
- Skip BUILD-LOG entry for any iteration including VOID
- Count VOID iterations toward `max_iterations`
- Claim KEEP without reading `VISIBLE_DIFF` from web-screenshot output file
