---
name: web-evolve
description: >
  Score-driven continuous improvement loop for existing websites. Orchestrates
  a swarm of specialist agents — web-score (audit), web-benchmark (competitor gap),
  web-patch (commit-only), web-screenshot (visual diff) — to iteratively improve
  a landing page until it hits the target score. The orchestrator calls Skill()
  refinement skills directly (in main context), then delegates commit to web-patch.
  Every score comes from web-score. Every diff comes from web-screenshot.
---

# Skill: /web-evolve

**Agent-swarm orchestrator for landing page quality improvement.**

Coordinates four specialist agents. Never audits or fixes inline. Calls refinement skills (`Skill('typeset')` etc.) directly in its own context — the only place Skill() reliably works — then hands the commit off to web-patch.

---

## Cardinal rules

1. **Never audit inline.** All scoring comes from `web-score` agent JSON output.
2. **Never fix inline.** All code changes happen via `Skill('X')` calls in this context, then committed by `web-patch`.
3. **No score without a receipt.** Every score claim cites `score.json` from web-score.
4. **No kept commit without VISIBLE_DIFF.** Every kept iteration cites web-screenshot verdict.
5. **Vision checks block until user confirms.** Surface every `NEEDS_HUMAN` block. Wait. Update score.json. Continue.
6. **NULL_DELTA = VOID.** Reclaim the iteration slot. Try a different fix strategy.
7. **Raw score transparency.** Veto cap hiding >5 pts: always show both numbers.

---

## Inputs

| Input | Default | Notes |
|---|---|---|
| `project_path` | current directory | auto-detect |
| `live_url` | from BUILD-LOG.md | production URL for Phase E only |
| `dev_server_url` | none | if set, loop screenshots use localhost — no deploy wait |
| `target_score` | 90 | use 95 for Stripe/Linear quality mode |
| `benchmark_url` | auto by personality | override with `--benchmark=URL` |
| `mode` | auto-detect | backfill = DESIGN-BRIEF.md exists + src/components/landing/ populated |
| `max_iterations` | 8 (greenfield) / 20 (backfill) | VOID iterations excluded from cap |

---

## Reference file paths (always use these — never hardcode machine paths)

- Checklist: `~/.claude/skills/shared/landing-page-checklist.md`
- Fix routing: `~/.claude/skills/web-evolve/references/fix-routing.md`
- Scoring engine: `~/.claude/skills/web-evolve/references/scoring-engine.md`

---

## Check → section mapping (used to tell web-screenshot where to scroll)

| Checks | Section |
|---|---|
| A7, A9, D4, D5, J1, J2, K4 | `hero` |
| A1–A6, A8, A10, A11, B3, B9 | `global` |
| C1–C8, I1–I8 | `global` |
| D1–D3, D6 | `global` |
| E3 | `trust-bar` |
| E4 | `stats` |
| E5 | `features` |
| E6 | `testimonials` |
| E7 | `pricing` |
| E8 | `faq` |
| E9 | `final-cta` |
| E10 | `footer` |
| F1–F6, H1–H2, G1–G6 | `full-page` |
| J3–J8 | `global` |
| K1 | `features` |
| K2–K3 | `full-page` |

---

## Phase A — Setup

**Run all file reads in parallel (single message, multiple Read tool calls):**

1. Read simultaneously: `{project_path}/CLAUDE.md`, `{project_path}/DESIGN-BRIEF.md`, `{project_path}/SCOPE.md`, `{project_path}/BUILD-LOG.md`

2. Detect mode: DESIGN-BRIEF.md exists AND `src/components/landing/` is non-empty → `backfill`. Otherwise → `greenfield`.

3. Extract personality from DESIGN-BRIEF.md by grepping for the line starting with `personality:` (added to template 2026-04-25). If not found, search for `Personality type:` in the Product Personality section. If still not found → default to `Enterprise Authority` and log assumption.

4. Determine benchmark URL:
   - Enterprise Authority → `https://stripe.com`
   - Data Intelligence → `https://linear.app`
   - Growth Engine → `https://vercel.com`
   - Trusted Productivity → `https://notion.so`
   - Premium Professional → `https://framer.com`
   - Bold Operator → `https://shopify.com`
   - Health & Care / Civic → user must specify `--benchmark=URL` (HALT if not provided)

5. Verify `live_url` returns 200:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" {live_url}
   ```
   HALT if not 200.

6. Create directory structure (four separate calls — no brace expansion):
   ```bash
   mkdir -p "{project_path}/.evolution/baseline"
   mkdir -p "{project_path}/.evolution/benchmark"
   mkdir -p "{project_path}/.evolution/scores"
   mkdir -p "{project_path}/.evolution/final"
   ```

7. Echo to user and wait for confirmation:
   ```
   web-evolve starting
   Mode: {mode} | Cap: {max_iterations} iterations | Target: {target_score}/100
   Benchmark: {benchmark_url}
   Loop screenshots: {dev_server_url if set, else "live URL — 30s wait after each commit"}
   Pages in scope: {from SCOPE.md}
   Proceed?
   ```

8. HALT if no DESIGN-BRIEF.md in greenfield mode → "Run `Skill('web-design-research')` first."

---

## Phase B — Parallel baseline + benchmark

Spawn both in a **single message** with `run_in_background: true`:

```
Agent tool call 1:
  description: "Baseline audit — Tier 2 full checklist"
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {live_url}
    output_path: {project_path}/.evolution/scores
    tier: 2
    mode: {mode}
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md

Agent tool call 2:
  description: "Competitor benchmark — gap analysis vs {benchmark_name}"
  subagent_type: "web-benchmark"
  run_in_background: true
  prompt: |
    benchmark_url: {benchmark_url}
    benchmark_name: {benchmark_name}
    target_page_description: {aesthetic_direction + hero description from DESIGN-BRIEF.md, 1-2 sentences}
    target_personality: {personality}
    output_path: {project_path}/.evolution/benchmark
```

Wait for both to complete.

### After both complete — fix-routing enrichment (critical step)

1. `Read {project_path}/.evolution/scores/score.json`
2. `Read {project_path}/.evolution/benchmark/gap-analysis.json`
3. `Read ~/.claude/skills/web-evolve/references/fix-routing.md`

If score.json missing → re-run web-score once. Still missing → HALT NEEDS_HUMAN.
If gap-analysis.json missing → log "benchmark failed — continuing without gap priority" and proceed (non-fatal).

4. **Enrich priority_queue with fix_skill:** For each FAIL entry in score.json's priority_queue, look up the check ID in fix-routing.md and extract the fix skill name (e.g. "typeset", "colorize", "overdrive"). Add:
   - `fix_skill`: skill name (e.g. `"overdrive"`)
   - `fix_context`: a one-sentence description of exactly what is wrong and what the target state is (synthesised from fail_proof + fix-routing rationale)
   - `section`: from the check→section mapping table above

5. **Prepend benchmark gaps:** Take `top_5_priority_queue` from gap-analysis.json. For each, map `maps_to_check` through fix-routing.md to get `fix_skill`. Prepend to priority_queue with `priority: 400`.

6. Sort full priority_queue descending by priority. Deduplicate by check_id (keep highest priority entry).

7. **Surface NEEDS_HUMAN blocks** from score.json `needs_human_blocks` to user in one message. Wait for replies. Update score.json check entries accordingly.

8. Write baseline score block to BUILD-LOG.md (mandatory format from checklist output format section).

9. If `score.final_score >= target_score` → log "already at target", skip to Phase D.

---

## Phase C — Improvement loop

Maintain loop state in memory:
```
iteration = 0
void_count = 0
real_iterations = 0
current_score = score.summary.final_score
priority_queue = [enriched queue from Phase B]
attempt_counts = {}   # check_id → number of attempts
excluded_skills = {}  # check_id → [skill_names that caused regression]
```

Loop condition: `current_score < target_score AND real_iterations < max_iterations`

---

### Step 1 — Pick check

Highest-priority entry where `status == "FAIL"` AND `attempt_counts.get(check_id, 0) < 3`.

If `attempt_counts[check_id] == 3` → mark WONTFIX in BUILD-LOG.md, remove, pick next.
If `fix_skill` is in `excluded_skills[check_id]` → skip to next best fix_skill from fix-routing.md.
If queue empty → log STUCK, exit loop.

---

### Step 2 — Pre-fix screenshot

```
Agent tool call:
  description: "Pre-fix screenshot — {section} — iter {iteration}"
  subagent_type: "web-screenshot"
  prompt: |
    live_url: {dev_server_url if set, else live_url}
    section_name: {section from priority_queue entry}
    before_screenshot_path: NONE
    after_screenshot_output_path: {project_path}/.evolution/iter-{iteration}/before-{section}.png
    scroll_to_selector: {CSS selector if known, else empty}
    viewport: desktop
```

This becomes the `before` reference.

---

### Step 3 — Apply fix (Skill call in main context)

**This is the only place Skill() is called — in this orchestrator context, not inside an agent.**

Create the iter directory:
```bash
mkdir -p "{project_path}/.evolution/iter-{iteration}"
```

Call the fix skill directly:
```
Skill('{fix_skill}', args='{fix_context} | check_id: {check_id} | fail_proof: {fail_proof}')
```

Wait for the skill to complete. If it errors or returns "no changes made" → log NEEDS_HUMAN, increment `attempt_counts[check_id]`, continue loop (skip steps 3.5–6 for this iteration).

---

### Step 3.5 — Commit via web-patch

```
Agent tool call:
  description: "Commit fix for {check_id} — iter {iteration}"
  subagent_type: "web-patch"
  prompt: |
    mode: commit-only
    check_id: {check_id}
    fix_skill: {fix_skill}
    project_path: {project_path}
    iteration_number: {iteration}
    output_path: {project_path}/.evolution/iter-{iteration}
```

Read `{project_path}/.evolution/iter-{iteration}/patch-{check_id}-iter{iteration}.json`.

If `status == "FAILED"` (nothing to commit — no files changed):
- The Skill() call made no changes. Log VOID, increment `attempt_counts[check_id]`, continue loop.

---

### Step 3.6 — Deploy (conditional)

**If `dev_server_url` NOT set (live URL mode):**
```bash
git -C "{project_path}" push origin main
```
Then sleep 45 seconds for Vercel deploy.

**If `dev_server_url` IS set:**
Skip. Dev server serves current file state immediately.

---

### Step 4 — Post-fix screenshot + category rescore (parallel)

```
Agent tool call 1:
  description: "Post-fix screenshot — {section} — iter {iteration}"
  subagent_type: "web-screenshot"
  run_in_background: true
  prompt: |
    live_url: {dev_server_url if set, else live_url}
    section_name: {section}
    before_screenshot_path: {project_path}/.evolution/iter-{iteration}/before-{section}.png
    after_screenshot_output_path: {project_path}/.evolution/iter-{iteration}/after-{section}.png
    scroll_to_selector: {CSS selector if known}
    viewport: desktop

Agent tool call 2:
  description: "Category rescore — {category} — iter {iteration}"
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {dev_server_url if set, else live_url}
    output_path: {project_path}/.evolution/iter-{iteration}
    tier: category:{affected_category_letter}
    mode: {mode}
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md
```

Wait for both. Read output files.

---

### Step 5 — Decision

Read `diff-verdict-{section}.json` and `score.json` from `.evolution/iter-{iteration}/`.

| Screenshot verdict | Score delta | Decision |
|---|---|---|
| `NULL_DELTA` | any | **VOID** — `git -C "{project_path}" revert HEAD --no-edit`. `void_count++`. Do NOT increment `real_iterations` or `attempt_counts`. Try different approach next loop. |
| `VISIBLE_DIFF` | up | **KEEP** — update `current_score`. `real_iterations++`. |
| `VISIBLE_DIFF` | same + check now PASS | **KEEP** — log raw delta (veto cap). `real_iterations++`. |
| `VISIBLE_DIFF` | same + check still FAIL | **REVERT** — `git -C "{project_path}" revert HEAD --no-edit`. `attempt_counts[check_id]++`. `real_iterations++`. |
| `VISIBLE_DIFF` | down | **REVERT** + add fix_skill to `excluded_skills[check_id]`. `attempt_counts[check_id]++`. `real_iterations++`. |
| `UNCERTAIN` | any | Re-run web-screenshot once after 10s. Still UNCERTAIN → treat as NULL_DELTA. |

---

### Step 6 — BUILD-LOG entry (every iteration, including VOID)

Append to `{project_path}/BUILD-LOG.md`:

```markdown
### Evolution iteration {iteration} — {timestamp} [mode: {mode}]
Page: {page}
Target check: {check_id} — {check_name}
Fix skill: {fix_skill} (called directly in orchestrator context)
Attempt #{attempt_counts[check_id]} for this check
Pre-score: {capped}/100 (raw {raw}%)
Post-score: {capped}/100 (raw {raw}%)
Delta capped: {+X / -X / 0}
Delta raw: {+X% / -X% / 0}
Screenshots: {before_path} → {after_path}
Diff verdict: {VISIBLE_DIFF | NULL_DELTA | UNCERTAIN} — {diff_description}
H1: PASS (Skill('{fix_skill}') called in orchestrator context — transcript-verifiable)
H2: {PASS (VISIBLE_DIFF confirmed) | VOID (NULL_DELTA) | UNCERTAIN}
Decision: {KEPT | REVERTED | VOID | WONTFIX}
Commit: {sha from patch JSON | "(reverted)" | "(voided — null-delta)"}
```

---

### Stop conditions

| Condition | Action |
|---|---|
| `current_score >= target_score` | Exit loop → Phase D |
| `real_iterations >= max_iterations` | Log TIMEOUT → Phase D |
| Priority queue empty | Log STUCK with remaining failures → Phase D |
| Check attempted 3× | Auto-WONTFIX, continue |
| Build breaks twice | HALT → NEEDS_HUMAN |

---

## Phase D — Final report + push

1. Spawn web-score tier 2 → `.evolution/scores/final-score.json`
2. Spawn web-screenshot full-page desktop + mobile → `.evolution/final/`
3. Write `EVOLUTION-LOG.md`:
   - Baseline → Final score, category delta table
   - Per-section before/after screenshot pairs
   - Full iteration log (KEPT / REVERTED / VOID / WONTFIX)
4. Commit and push:
   ```bash
   git -C "{project_path}" add EVOLUTION-LOG.md BUILD-LOG.md
   git -C "{project_path}" commit -m "evolve: {page} final — score {baseline} → {final}"
   git -C "{project_path}" push origin main
   ```
5. Wait 45s for Vercel deploy.

---

## Phase E — Post-deploy verification

Spawn web-score tier 1 against `live_url` → confirm deployed page matches local final. Append result to EVOLUTION-LOG.md.

---

## Hard stops — this skill must NEVER do

- Run grep/Read/Bash to audit — always via web-score agent
- Call `Skill('X')` from inside a spawned agent — only in this orchestrator context
- Edit source files directly — Skill() handles edits, web-patch handles commit
- Self-grade vision checks — always surface NEEDS_HUMAN
- Skip BUILD-LOG entry (including VOID)
- Count VOID toward max_iterations
