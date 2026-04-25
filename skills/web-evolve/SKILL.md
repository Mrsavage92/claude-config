---
name: web-evolve
description: >
  Score-driven continuous improvement loop for existing websites. Orchestrates
  a swarm of specialist agents — web-score (audit), web-benchmark (competitor gap),
  web-patch (commit-only), web-screenshot (visual diff) — to iteratively improve
  a landing page until it hits the target score. Skill() refinement skills are
  called directly in orchestrator context. Agents only audit, screenshot, or commit.
---

# Skill: /web-evolve

Coordinates four specialist agents. Never audits or fixes inline. Calls refinement skills directly in its own context. Delegates commit-only work to web-patch.

---

## Cardinal rules

1. **Never audit inline.** All scoring from web-score agent JSON output only.
2. **Never fix inline.** Code changes via `Skill('X')` or MCP tools in this context only.
3. **No score without receipt.** Every score cites `score.json` from web-score.
4. **No kept commit without VISIBLE_DIFF.** Every kept iteration cites web-screenshot verdict.
5. **Vision checks block until user confirms.** Surface NEEDS_HUMAN, wait, update, continue.
6. **NULL_DELTA = VOID.** Reclaim the slot. Try different fix strategy.
7. **Raw transparency.** Veto cap hiding >5 pts: show both numbers always.

---

## Inputs

| Input | Default | Notes |
|---|---|---|
| `project_path` | current directory | auto-detect |
| `live_url` | from BUILD-LOG.md | production URL — Phase E only |
| `dev_server_url` | none | if set, loop uses localhost — no deploy wait per iteration |
| `target_score` | 90 | 95 = Stripe/Linear quality mode |
| `benchmark_url` | auto by personality | override with `--benchmark=URL` |
| `mode` | auto-detect | backfill = DESIGN-BRIEF.md + src/components/landing/ populated |
| `max_iterations` | 8 (greenfield) / 20 (backfill) | VOID iters excluded from cap |

---

## Reference paths (always use tilde paths — never hardcode machine paths)

```
checklist:     ~/.claude/skills/shared/landing-page-checklist.md
fix-routing:   ~/.claude/skills/web-evolve/references/fix-routing.md
scoring-engine: ~/.claude/skills/web-evolve/references/scoring-engine.md
```

---

## Check → section map (for web-screenshot scroll targeting)

| Checks | Section |
|---|---|
| A7, A9, D4, D5, J1, J2, K4, E2 | hero |
| A1–A6, A8, A10, A11, B3, B9, C1–C8, D1–D3, D6, G1–G6, I1–I8, J3–J8 | global |
| E3 | trust-bar |
| E4 | stats |
| E5 | features |
| E6 | testimonials |
| E7 | pricing |
| E8 | faq |
| E9 | final-cta |
| E10 | footer |
| F1–F6, H1–H2, K1–K4 | full-page |

---

## Phase A — Setup

**Run all reads in parallel (single message):**

1. Read simultaneously: `{project_path}/CLAUDE.md`, `{project_path}/DESIGN-BRIEF.md`, `{project_path}/SCOPE.md`, `{project_path}/BUILD-LOG.md`

2. **Check for existing loop state** — if `.evolution/loop-state.json` exists, read it. Offer to resume:
   > "Existing loop state found at iteration {N}, score {S}. Resume? (yes/no)"
   If yes — skip Phases A-B, restore loop state, continue from Phase C. If no — proceed fresh (loop-state.json will be overwritten).

3. Detect mode: DESIGN-BRIEF.md exists AND `src/components/landing/` non-empty → `backfill`. Else → `greenfield`.

4. Extract personality — try in order:
   - `grep "^personality:" {project_path}/DESIGN-BRIEF.md` (top-level field)
   - `grep "Personality type:" {project_path}/DESIGN-BRIEF.md` (section heading)
   - Default: `Enterprise Authority` — log assumption to BUILD-LOG.md

5. Determine benchmark URL from personality:
   - Enterprise Authority → `https://stripe.com`
   - Data Intelligence → `https://linear.app`
   - Growth Engine → `https://vercel.com`
   - Trusted Productivity → `https://notion.so`
   - Premium Professional → `https://framer.com`
   - Bold Operator → `https://shopify.com`
   - Health & Care / Civic → user must specify `--benchmark=URL`

6. Verify `live_url` returns 200:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" "{live_url}"
   ```
   HALT if not 200.

7. Create `.evolution/` directories (four separate calls):
   ```bash
   mkdir -p "{project_path}/.evolution/baseline"
   mkdir -p "{project_path}/.evolution/benchmark"
   mkdir -p "{project_path}/.evolution/scores"
   mkdir -p "{project_path}/.evolution/final"
   ```

8. Echo confirmation to user and wait:
   ```
   web-evolve starting
   Mode: {mode} | Cap: {max_iterations} | Target: {target_score}/100
   Benchmark: {benchmark_url}
   Loop screenshots: {dev_server_url if set, else "live URL — 45s wait per commit"}
   Pages in scope: {from SCOPE.md}
   Proceed?
   ```

9. HALT if no DESIGN-BRIEF.md in greenfield mode → "Run `Skill('web-design-research')` first."

---

## Phase B — Parallel baseline audit (4 agents + benchmark)

For Tier 2 baseline, spawn **five** agents in a single message (all `run_in_background: true`) to prevent 79-check drift in one context:

```
Agent 1 — web-score (A+B categories, ~19 checks):
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {live_url}
    output_path: {project_path}/.evolution/scores
    tier: category:A,B
    mode: {mode}
    output_filename: score-AB.json
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md

Agent 2 — web-score (C+D+E categories, ~24 checks):
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {live_url}
    output_path: {project_path}/.evolution/scores
    tier: category:C,D,E
    mode: {mode}
    output_filename: score-CDE.json
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md

Agent 3 — web-score (F+G+H categories, ~12 checks):
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {live_url}
    output_path: {project_path}/.evolution/scores
    tier: category:F,G,H
    mode: {mode}
    output_filename: score-FGH.json
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md

Agent 4 — web-score (I+J+K categories, ~20 checks):
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {live_url}
    output_path: {project_path}/.evolution/scores
    tier: category:I,J,K
    mode: {mode}
    output_filename: score-IJK.json
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md

Agent 5 — web-benchmark:
  subagent_type: "web-benchmark"
  run_in_background: true
  prompt: |
    benchmark_url: {benchmark_url}
    benchmark_name: {benchmark_name}
    target_page_description: {aesthetic_direction + hero description from DESIGN-BRIEF.md}
    target_personality: {personality}
    output_path: {project_path}/.evolution/benchmark
```

Wait for all five to complete.

### After all complete — merge + enrich

1. Read all four partial score files. If any missing → re-run that agent once. Still missing → HALT NEEDS_HUMAN with which categories failed.

2. **Merge partial scores into `.evolution/scores/score.json`:**
   - Merge `checks` dictionaries from all four files
   - Recalculate `summary` (passed, failed, na, wontfix, needs_human, raw_score, veto logic, final_score)
   - Merge `priority_queue` lists and resort by priority
   - Write merged `score.json`

3. Read `~/.claude/skills/web-evolve/references/fix-routing.md` — parse the `SKILL_LOOKUP` JSON block at the top of the file.

4. **Enrich priority_queue with fix routing:**
   For each FAIL entry in merged priority_queue:
   - Look up `check_id` in SKILL_LOOKUP
   - Set `fix_skill`, `prereq`, `secondary`, `edit_direct`, `section` on the entry
   - Build `fix_context` from the fail_proof (one sentence: what is wrong + target state)

5. **Prepend benchmark gaps:** Read `.evolution/benchmark/gap-analysis.json`. For each in `top_5_priority_queue`: look up `maps_to_check` in SKILL_LOOKUP, set routing fields. Add to front of priority_queue with priority 400. Deduplicate by check_id.

6. **Surface NEEDS_HUMAN blocks** — one message to user listing all vision checks. Wait for replies. Update score.json check entries.

7. Write baseline score to BUILD-LOG.md (mandatory output format from checklist).

8. If `final_score >= target_score` → log "already at target", skip to Phase D.

9. **Write initial loop state:**
   ```bash
   # Write {project_path}/.evolution/loop-state.json
   ```
   ```json
   {
     "iteration": 0,
     "void_count": 0,
     "real_iterations": 0,
     "current_score": {final_score},
     "baseline_score": {final_score},
     "mode": "{mode}",
     "max_iterations": {max_iterations},
     "target_score": {target_score},
     "priority_queue": [{enriched queue}],
     "attempt_counts": {},
     "excluded_skills": {}
   }
   ```

---

## Phase C — Improvement loop

Read loop state from `loop-state.json` at start of each iteration. Write it after each decision.

Loop condition: `current_score < target_score AND real_iterations < max_iterations`

---

### Step 1 — Pick check(s) — with batching

**Batch detection:** Before picking a single check, scan the top of the priority queue for checks that share the same `fix_skill` AND have no `prereq`. If 2+ such checks exist at the top of the queue — batch them into one iteration.

**Batching rules:**
- J-series: all J-failures with `fix_skill: "clarify"` → always batch into one Skill('clarify') call
- I-series: group by fix_skill → one Skill('typeset') + one Skill('polish') + one Skill('animate') max per iter
- C-series: group by fix_skill → batch same-skill C failures
- All others: single check per iteration (changes are more structural, harder to batch safely)

Set `current_checks = [check_id]` (single) or `[check_id_1, check_id_2, ...]` (batched).

**Exhaustion check:** For each check in `current_checks`, verify `attempt_counts.get(check_id, 0) < 3`. If 3 → mark WONTFIX, remove, repick.

If secondary skill needed (primary in excluded_skills): set `fix_skill = secondary` from SKILL_LOOKUP.

If queue empty → log STUCK, exit loop.

---

### Step 2 — Pre-fix screenshot

```
Agent:
  subagent_type: "web-screenshot"
  prompt: |
    live_url: {dev_server_url if set, else live_url}
    section_name: {section from first check in current_checks}
    mode: capture-only
    output_path: {project_path}/.evolution/iter-{iteration}/before-{section}.png
    scroll_to_selector: {CSS selector if known, else empty}
    viewport: desktop
```

Wait for completion. This is the `before` reference.

---

### Step 3 — Apply fix

**Determine fix type from SKILL_LOOKUP for the check(s):**

**Case A — `edit_direct: true`** (A10, B5, E1, G1, G2 etc):
Use the Edit tool directly. The `fix_context` from the priority_queue entry contains the exact change needed. Log to BUILD-LOG: "H1: PASS (Edit tool — edit_direct fix, too small for skill invocation)".

**Case B — `prereq` is not null** (A8, A9, B3, B9, E3, F6, K2 etc):
1. Call the prereq MCP tool first:
   ```
   mcp__magic__21st_magic_component_inspiration(query="{fix_context}")
   ```
2. Then call `Skill('{fix_skill}', args='{fix_context} | inspired_by: {MCP result summary} | checks: {current_checks} | fail_proof: {fail_proofs}')`.

**Case C — standard Skill() fix:**
```
Skill('{fix_skill}', args='{fix_context} | checks: {current_checks joined} | fail_proof: {fail_proofs joined}')
```
For batched checks: pass all check IDs and fail proofs in the args so the skill knows what to target.

If Skill() errors or returns "no changes" → log NEEDS_HUMAN for each check_id, increment `attempt_counts`, continue loop (skip 3.5 onwards).

---

### Step 3.5 — Commit

```
Agent:
  subagent_type: "web-patch"
  prompt: |
    mode: commit-only
    check_id: {current_checks joined with +}
    fix_skill: {fix_skill}
    project_path: {project_path}
    iteration_number: {iteration}
    output_path: {project_path}/.evolution/iter-{iteration}
```

Read patch JSON. If `status: "FAILED"` → no files changed, log VOID, increment `attempt_counts` for each check, continue.

---

### Step 3.6 — Deploy (conditional)

If `dev_server_url` not set:
```bash
git -C "{project_path}" push origin main
```
Then sleep 45 seconds.

If `dev_server_url` is set: skip — dev server serves changes immediately.

---

### Step 4 — Post-fix screenshot + rescore (parallel)

```
Agent 1 — web-screenshot:
  subagent_type: "web-screenshot"
  run_in_background: true
  prompt: |
    live_url: {dev_server_url if set, else live_url}
    section_name: {section}
    mode: diff
    before_path: {project_path}/.evolution/iter-{iteration}/before-{section}.png
    output_path: {project_path}/.evolution/iter-{iteration}/after-{section}.png
    scroll_to_selector: {CSS selector if known}
    viewport: desktop

Agent 2 — web-score (affected categories only):
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {dev_server_url if set, else live_url}
    output_path: {project_path}/.evolution/iter-{iteration}
    tier: category:{affected_categories}
    mode: {mode}
    output_filename: score-rescore.json
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md
```

Wait for both. Read outputs.

Merge rescore results into current score: update only the checks in the rescored categories. Recalculate summary and final_score.

---

### Step 5 — Decision

| Screenshot | Score | Decision |
|---|---|---|
| NULL_DELTA | any | **VOID** — `git -C "{project_path}" revert HEAD --no-edit`. void_count++. Do NOT increment real_iterations or attempt_counts. |
| CAPTURE_ONLY | any | First iteration had no before. Accept screenshot. Re-run Step 4 next iter when before exists. |
| VISIBLE_DIFF | up | **KEEP** — update current_score, real_iterations++. Mark checked checks as PASS in priority_queue. |
| VISIBLE_DIFF | same + all checks now PASS | **KEEP** — log raw delta (veto cap). real_iterations++. |
| VISIBLE_DIFF | same + checks still FAIL | **REVERT** — `git revert HEAD --no-edit`. attempt_counts[check_id]++. real_iterations++. |
| VISIBLE_DIFF | down | **REVERT** — add fix_skill to excluded_skills[check_id]. attempt_counts[check_id]++. real_iterations++. |
| UNCERTAIN | any | Wait 10s, re-run web-screenshot once. Still UNCERTAIN → VOID. |

---

### Step 6 — BUILD-LOG entry + loop state persist

**BUILD-LOG entry** (append to `{project_path}/BUILD-LOG.md`):

```markdown
### Evolution iteration {iteration} — {timestamp} [mode: {mode}]
Page: {page}
Target check(s): {current_checks joined} — {check names}
Fix type: {edit_direct | prereq+skill | skill}
Fix skill: {fix_skill} (called in orchestrator context)
Attempt: #{attempt_counts per check}
Pre-score: {capped}/100 (raw {raw}%)
Post-score: {capped}/100 (raw {raw}%)
Delta capped: {+X / -X / 0}
Delta raw: {+X% / -X% / 0}
Screenshots: {before_path} → {after_path}
Diff verdict: {verdict} — {diff_description}
H1: {PASS — Skill('{fix_skill}') in orchestrator | PASS — Edit tool (edit_direct) | PASS — MCP prereq + Skill()}
H2: {PASS (VISIBLE_DIFF) | VOID (NULL_DELTA) | UNCERTAIN}
Decision: {KEPT | REVERTED | VOID | WONTFIX}
Commit: {sha | "(reverted)" | "(voided)"}
```

**Write loop state** to `{project_path}/.evolution/loop-state.json` after every iteration (including VOID):
```json
{
  "iteration": {iteration},
  "void_count": {void_count},
  "real_iterations": {real_iterations},
  "current_score": {current_score},
  "baseline_score": {baseline_score},
  "mode": "{mode}",
  "max_iterations": {max_iterations},
  "target_score": {target_score},
  "priority_queue": [{current queue with updated statuses}],
  "attempt_counts": {current},
  "excluded_skills": {current}
}
```

---

### Stop conditions

| Condition | Action |
|---|---|
| `current_score >= target_score` | Exit → Phase D |
| `real_iterations >= max_iterations` | Log TIMEOUT → Phase D |
| Queue empty | Log STUCK → Phase D |
| Check attempted 3× | Auto-WONTFIX, continue |
| Build breaks twice | HALT → NEEDS_HUMAN |

---

## Phase D — Final report + push

1. Spawn 4 parallel web-score agents (same category split as Phase B) against current state → merge into `.evolution/scores/final-score.json`
2. Spawn web-screenshot for full-page desktop + mobile → `.evolution/final/`
3. Write `EVOLUTION-LOG.md`:
   - Baseline → Final score + category delta table
   - Per-section before/after screenshot pairs
   - Full iteration log from BUILD-LOG entries
4. Commit + push:
   ```bash
   git -C "{project_path}" add EVOLUTION-LOG.md BUILD-LOG.md
   git -C "{project_path}" commit -m "evolve: {page} final — score {baseline} → {final}"
   git -C "{project_path}" push origin main
   ```
5. Wait 45s for Vercel.

---

## Phase E — Post-deploy verification

Spawn web-score (tier: category:A,G) against `live_url` — the two most likely categories to have deploy-specific regressions (fonts not loading, Puppeteer CWV values). Append result to EVOLUTION-LOG.md.

---

## Hard stops — this skill MUST NOT

- Run grep/Read/Bash for auditing — always via web-score
- Edit source files directly — Skill() does that, web-patch commits it
- Call `Skill('mcp__...')` — MCP tools are called directly, not via Skill wrapper
- Self-grade vision checks — always NEEDS_HUMAN
- Skip BUILD-LOG entry for any iteration (including VOID)
- Count VOID toward max_iterations
