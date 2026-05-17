---
name: web-evolve
description: Auto-decided, score-driven continuous improvement loop for existing websites. Invoke with `/web-evolve` — no flags. Re-invoke to advance one tier. Audits every public route, routes REBUILD verdicts through web-page, routes refinement through design skills, verifies visible delta per iter via Skill('critique'), deploys to evolve branch, merges to main only after preview-verify.
---

Base directory: `C:\Users\Adam\.claude\skills\web-evolve`

# Skill: /web-evolve

This skill replaces the previous 2553-line spec (Cardinal Rules 1–36) with **6 principles + 6 phase contracts**. Historical decisions are archived in `references/decisions.md`. The behaviour is the same; the framing is honest.

The skill never audits inline. The skill never edits inline. **Skills do the work; the orchestrator coordinates and verifies.**

---

## The 6 Principles

These compress the previous 36 cardinal rules. They are the LAW of the skill. Mechanical enforcement is in `~/.claude/hooks/web-evolve-guard.ps1`. Procedural enforcement is in the phase contracts below.

### Principle 1 — Verify outcome, not surface
Score deltas and HTTP 200s do not prove improvement. `Skill('critique')` is the only valid visual-quality signal. Self-rating by the orchestrator (`"this looks epic"`, `"dramatically better"`, `"production-grade"`) is banned. Per-iter visible delta is verified by Puppeteer pre/post + critique compare, not by orchestrator inspection. Compile-pass ≠ deploy-success ≠ live-content-correct: each requires its own check.

### Principle 2 — Skills are the only execution path. Direct Edit is for declared lookups.
`SKILL_LOOKUP[check_id].edit_direct === true` (the closed list A10, B5, E1, G1, G2 in `references/fix-routing.md`) is the ONLY whitelist for direct `Edit`/`Write`/`MultiEdit`. Anything else routes through `Skill(fix_skill)`. Orchestrator self-justification ("the fix is small enough", "I need tight control of framing", "Skill might lose context") is a phase failure — not an exception. Enforced mechanically by `web-evolve-guard.ps1` PreToolUse hook: hook blocks any Edit/Write on a file under an active iter (loop-state.iteration > 0) where `current_checks` contains an `edit_direct:false` check.

### Principle 3 — Default verdict is REBUILD. Refinement only after page clears tier floor.
Phase A.1.5 enumerates EVERY public route (sitemap + crawl, cap 20). Each route is scored against the sales-page-10 checklist. `≥ 2 FAILs` → REBUILD → `Skill('web-page')` only. `1 FAIL` → REFINE → refinement skill. `0 FAILs + tier-floor cleared` → KEEP. Refinement skills (`impeccable / overdrive / animate / typeset / colorize / polish / bolder / delight / layout / distill / clarify / adapt`) are BANNED on REBUILD verdicts. Polish-as-evolution is the failure mode this principle exists to prevent.

### Principle 4 — One scope commitment per run. AskUserQuestion limit = 1.
Phase A.0 either auto-decides scope or asks ONCE. After that single question, scope is locked. Mid-run AskUserQuestion is mechanically blocked by `web-evolve-guard.ps1`. Context-budget exhaustion forces honest HALT, not silent scope degradation. Run #4 silently degraded 8→4 iters mid-run with a "context budget" rationalization — this principle closes that hole.

### Principle 5 — Phase F → Phase A handoff is mechanical
Phase F writes `.evolution/next-run-priorities.json` with `{priorities: [{route, fix_type, fix_skill, rationale}], deferred: [...], corrective_actions_pending: [...]}`. Phase A.0 of the next run reads this file. If it exists and is fresh (< 14 days), the orchestrator MUST honor priorities unless the user explicitly overrides via `/web-evolve --fresh` or `--focus=...`. Advisory notes in `trajectory.json` are an audit log; this file is the executable handoff. Run #3 advised Run #4 to start with critique baseline; Run #4 ignored that — this principle prevents the same drift.

### Principle 6 — Honest framing > spec-compliance theatre
"Logged honestly" is necessary, not sufficient. Each run tracks `deviation_count`. **Hard cap: 3 deviations → HALT** with `status: deviation_cap_exceeded`. Each deviation in `trajectory.failed_gates` requires `corrective_action_for_next_run` populated. Soft-degrades from the original Cardinal Rule 28 dispatch table (moved to `references/soft-degrades.md`) remain available but each counts as 1 deviation. Run #1 + #3 + #4 each shipped with 3+ silent gate failures wrapped in retro prose — this principle makes that path mechanically capped.

---

## Reference paths

```
checklist:               ~/.claude/skills/shared/landing-page-checklist.md
sales-page-checklist:    ~/.claude/skills/web-evolve/references/sales-page-checklist.md   (Rule 35, 10 rules)
fix-routing:             ~/.claude/skills/web-evolve/references/fix-routing.md            (SKILL_LOOKUP, edit_direct flags)
scoring-engine:          ~/.claude/skills/web-evolve/references/scoring-engine.md
multi-run-orchestration: ~/.claude/skills/web-evolve/references/multi-run-orchestration.md (Phase A.0 decision tree)
world-class-tier:        ~/.claude/skills/web-evolve/references/world-class-tier.md       (target ≥ 98 contracts)
decisions:               ~/.claude/skills/web-evolve/references/decisions.md              (CL-1..CL-5 changelog + 36-rule archive)
```

---

## Tier target table

| `target_score` | Tier | What it gates | Phase R signature pick? |
|---|---|---|---|
| 90 | Premium SaaS | Generic high-quality SaaS landing | No |
| 95 | Stripe/Linear | Disciplined design system, real motion, mobile parity, a11y/SEO pass | No |
| 98 | Awwwards SOTD candidate | 4-axis avg ≥ 8.0, real Chrome perf trace, world-class motion stack | **Yes** |
| 100 | Awwwards SOTM candidate | Avg ≥ 8.5, Creativity ≥ 9, foundry typography, View Transitions | **Yes (stricter)** |

---

## Phase A.0 — Auto-Decide Mode (MANDATORY, runs first)

Reads disk state + `.evolution/next-run-priorities.json` (Principle 5) + project signals to decide:
`target_score`, `mode` (fresh | resume | advance), `phases_to_run`, `max_iterations`, `focus_list`.

Full decision tree: `references/multi-run-orchestration.md`. The skill MUST read that at the start of Phase A.0.

**Step A.0.1 — Set `${PROJECT_PATH}` env var** (used by all subsequent phases).

**Step A.0.2 — Read disk state in parallel:**
`.evolution/trajectory.json`, `.evolution/loop-state.json`, `.evolution/next-run-priorities.json` (NEW per Principle 5), `.evolution/scores/final-score.json`, `CLAUDE.md`, `CONTEXT.md`.

**Step A.0.3 — Branch decision:**
- `loop-state.json` exists + `real_iterations < max_iterations` + no final score → `mode=resume`
- `trajectory.runs[-1].status == "completed"` → `mode=advance`, push one tier up
- `trajectory.runs[-1].status` is a failed-gate status → `mode=advance`, SAME target (failed-gate runs do NOT advance)
- `trajectory.runs[-1].status == "halted_needs_human"` → HALT, ask user to resolve
- `trajectory.json` missing OR `--fresh` → `mode=fresh`

**Step A.0.4 — Honor `next-run-priorities.json` (Principle 5):**
If file exists and `generated_at` is < 14 days old:
- Set `focus_list = priorities[].route`
- Set `fix_route_hints = priorities[].{fix_skill, fix_type}`
- Set `corrective_actions = priorities[].corrective_actions_pending` (these are GATES on the new run — e.g. "re-enable Skill('critique') at all 3 points" must be honored)
- Log `"Honoring Phase F handoff from Run #{N}: focus = {routes}, corrective_actions = {list}"`
- If user passed `--focus=...` or `--fresh`, override the priorities but corrective_actions still apply.
- If file is missing or stale (>14 days), derive focus from `trajectory.runs[-1].next_run_recommendations` (legacy path).

**Step A.0.5 — Compute deliverable_target_score + tier-mismatch echo.** Surface upfront. See `references/multi-run-orchestration.md` for the missing-tooling table.

**Step A.0.6 — Echo to user + init loop-state:** Single message stating mode, declared_target, deliverable_target, focus_list, iteration_cap. Init `loop-state.json` with:
```json
{
  "iteration": 0,
  "ask_user_count": 0,
  "deviation_count": 0,
  "real_iterations": 0,
  "void_count": 0,
  "current_checks": [],
  "priority_queue": [...],
  "target_score": ...
}
```
Proceed automatically. NO `AskUserQuestion` allowed here unless tier mismatch or `next-run-priorities.json` conflict requires resolution — and even then, only ONE question (Principle 4).

---

## Phase A.1.5 — Per-route baseline (MANDATORY, Principle 3)

Replaces homepage-only audits. Audits EVERY public route.

**Step A.1.5.1 — Enumerate routes** from `public/sitemap.xml` or `app/sitemap.ts` or homepage `<a href>` crawl. Cap at 20. Build `route_list`.

**Step A.1.5.2 — Per-route screenshot + critique (Principle 1):**
For each route:
```
mcp__puppeteer__puppeteer_navigate(url=<route>)
mcp__puppeteer__puppeteer_screenshot(name=baseline-<slug>, width=1440, height=900)
# Save to .evolution/baseline/<slug>.png via Write tool (base64 decode if needed)
```

Then ONE batched critique invocation:
```
Skill('critique', args='mode: web-evolve | run_mode: per-route-baseline | output_format: json |
  checklist: sales-page-10 | screenshots: [<path1>, <path2>, ...] | routes: [<route1>, ...] |
  tier: {target}')
```

Critique returns per-route `{verdict: REBUILD|REFINE|KEEP, checklist_fails: [...], blocking_issues: [...], rebuild_brief: "...", recommended_skill: "web-page|clarify|...", aggregate_vq: 0.0-5.0}`.

**Step A.1.5.3 — Write `.evolution/page-baselines.json`** with one entry per route. This is the truth that Phase R reads.

**Step A.1.5.4 — Write `.evolution/critique-baseline.json`** — aggregate VQ baseline that Phase F.0 will diff against. **MANDATORY: Phase C iter 1 cannot start until this file exists.** Enforced procedurally in Step C.0 below.

**FALLBACK (degraded mode):** If `Skill('critique')` is unavailable, spawn 3 parallel general-purpose Agent calls using the same checklist contract. Log as `deviation_count++` with `corrective_action_for_next_run: "install or fix Skill('critique')"`. This is a Principle 6 deviation.

---

## Phase R Step R.0 — REBUILD-mode gate (Principle 3)

Read `.evolution/page-baselines.json`.
- If `rebuild_queue.length >= 1` → **Phase R-REBUILD mode**. Skip Steps R.1–R.4 (hero signature pick — full spec in `references/world-class-tier.md`). Hero polish is deferred until rebuild queue is empty.
- If `rebuild_queue.length == 0` → proceed with standard Phase R hero signature pick.

REBUILD iters MUST invoke `Skill('web-page')` or `Skill('web-scaffold')`. Refinement skills are BANNED inside a REBUILD iter (Principle 3). Hook enforcement: any Edit/Write on a REBUILD-routed file is blocked unless the file path is under `.evolution/`.

---

## Phase C — Improvement loop (per-iter contract)

Loop condition: `current_score < target_score AND real_iterations < max_iterations AND deviation_count < 3`.

### Step C.0 — Iter precondition (NEW, Principle 1 + Principle 2)

Before iter 1 starts:
```bash
[ -f "${PROJECT_PATH}/.evolution/critique-baseline.json" ] || \
  { echo "HALT: critique-baseline.json missing. Phase A.1.5 must complete before iter 1."; exit 1; }
```

Before iter N starts, write the iter's `current_checks` to `loop-state.json`:
```json
{ "iteration": N, "current_checks": ["A1", "E10"], ... }
```
This populates the field the hook reads to enforce Principle 2.

### Step C.1 — Pre-iter screenshot
Puppeteer screenshot of affected route, save to `.evolution/iter-{n}-before-<slug>.png`.

### Step C.2 — Apply fix via correct route
- `edit_direct: true` → direct Edit (whitelisted in SKILL_LOOKUP)
- `edit_direct: false` → `Skill(fix_skill, args=...)` — the hook will block direct Edit attempts
- REBUILD verdict route → `Skill('web-page')` only

### Step C.3 — Post-iter screenshot + re-audit (NEW, fixes Run #4 self-validation gap)
```
mcp__puppeteer__puppeteer_screenshot(name=iter-{n}-after-<slug>, ...)
```
Then fire critique against THIS route to verify the FAILs you claimed to fix are actually fixed:
```
Skill('critique', args='mode: web-evolve | run_mode: per-iter-delta |
  screenshots: [iter-{n}-before-<slug>.png, iter-{n}-after-<slug>.png] |
  route: <route> | tier: {target} | output_format: json |
  prior_fails: [<list of checklist FAILs from page-baselines.json for this route>]')
```
Returns `{visible_delta_verdict: 0-5, ssim_estimate: 0-1, checklist_status_change: [{rule, was, now}], verdict: KEEP|REVERT|VOID}`.

### Step C.4 — Decision
- `verdict: KEEP` AND `visible_delta_verdict >= 1.0` AND `checklist_status_change` shows targeted FAILs now PASS → **KEEP**: commit, advance iter
- `verdict: VOID` (visible_delta < 1.0 OR ssim > 0.985) → **VOID**: `git reset --hard HEAD~1`, void_count++, don't increment real_iterations
- `verdict: REVERT` (visible diff but FAILs still present OR new FAILs introduced) → **REVERT**: `git revert HEAD --no-edit`, attempt_counts[check]++, real_iterations++

### Step C.5 — Commit + persist state
Web-patch agent commits. Update loop-state.json with new iteration count, ask_user_count preserved, deviation_count current.

### Step C.6 — Per-iter deviation check (NEW, Principle 6)
If `deviation_count >= 3` → HALT with `status: deviation_cap_exceeded`. Phase F still runs (writes retro + next-run-priorities) but no more iters this run.

---

## Phase D — Deploy + verify (per-iter or per-run)

1. Push evolve branch (`evolve/{date}-runN`) to remote.
2. Poll `gh api repos/{org}/{repo}/deployments?sha=HEAD` for preview deployment status.
3. On preview success: Puppeteer-verify + `Skill('critique')` compare against page-baseline screenshots.
4. On preview failure: inspect logs via `npx vercel inspect <dep_id> --logs`. If env-var related → soft-degrade per `references/multi-run-orchestration.md` (preview-skip path), increment `deviation_count`. If TS/build error → HALT immediately.
5. On preview-verify pass: FF-merge evolve → main, push main, wait for prod build, Puppeteer-verify against live URL.

**Preview env vars (lesson from Run #3 + #4):** Many projects ship with Production-scoped env vars only, causing Preview builds to fail at static-prerender. Fix once per project via `vercel env add <NAME> preview` for each required var. Do not let env-var-failure soft-degrade become the default — it makes preview-verify a fake gate.

---

## Phase F — Retro + handoff (MANDATORY, Principle 5 + 6)

**Step F.1 — Read run data:** loop-state, BUILD-LOG, scores, all `.evolution/*.json`.

**Step F.2 — Compute gate status:** `failed_gates: [{gate, name, severity, detail, corrective_action_for_next_run}]`. Each failed gate MUST have `corrective_action_for_next_run` populated (Principle 6 contract).

**Step F.3 — Write `.evolution/next-run-priorities.json` (NEW, Principle 5):**

```json
{
  "generated_at": "<ISO timestamp>",
  "generated_by_run_id": N,
  "priorities": [
    {
      "route": "/path",
      "rank": 1,
      "fix_type": "REBUILD" | "REFINE" | "KEEP",
      "fix_skill": "web-page" | "clarify" | "...",
      "rationale": "1-sentence why this is the next-run priority",
      "rebuild_brief": "from page-baselines.json (if REBUILD)",
      "estimated_iters": 1
    }
  ],
  "deferred": [
    { "route": "/path", "reason": "lower-priority, queued for run N+2" }
  ],
  "corrective_actions_pending": [
    "Specific spec-compliance items the next run MUST honor"
  ]
}
```

**Step F.4 — Update trajectory.json** with run entry including:
- `status` (worst-severity from failed_gates)
- `failed_gates[].corrective_action_for_next_run` populated
- `deviation_count` total
- `next_run_priorities_written: true`

**Step F.5 — Commit retro + push:**
```bash
git add .evolution/{trajectory.json,next-run-priorities.json,retro.md}
git commit -m "evolveN phase-F: retro + Run #{N+1} handoff"
git push
```

**Step F.6 — Final echo to user:** facts only (no quality claims about own output). Score delta, iter count, deviation count, what next run should focus on. State which `Skill()` invocations fired vs were bypassed. State whether preview-verify was a real gate or a soft-degrade.

---

## Hard stops (preserved from previous spec)

This skill MUST NOT:
- Run grep/Read/Bash for auditing — always via web-score or critique
- Edit source files directly when `edit_direct:false` — hook will block AND spec forbids
- Self-grade visual quality — `Skill('critique')` only
- Skip BUILD-LOG entry for any iteration (including VOID)
- Count VOID toward `max_iterations`
- Skip Phase F retro or next-run-priorities.json
- Touch `main` directly before Phase D preview-verify (unless explicit override flag)
- Exceed `ask_user_count = 1` per run — hook blocks
- Exceed `deviation_count = 3` per run — Phase C halts

---

## Migration note (from the 36-rule spec)

The 36 Cardinal Rules are not deleted — they are compressed into 6 principles. The full historical spec is archived in `references/decisions.md` (CL-1 through CL-5 changelogs + the run-by-run failure analysis that drove each rule addition). If you need to understand WHY a principle exists, that file has the context.

Rough mapping:
- Old rules 1–10, 13–15, 21–25 → Principle 1 + Phase contracts
- Old rules 11.6, 17, 19–20 → Principle 2 + `web-evolve-guard.ps1` hook
- Old rules 28–30, 34 → Principle 6 + soft-degrade dispatch
- Old rules 8, 27, 36 → Principle 1 + Step C.3 re-audit
- Old rules 11.7, 14, 26, 33 → Principle 3 + tier targets
- Old rules 18, 31, 35 → Principle 3 + Phase R.0
- Old rules 29, 32 → Phase A.1.5 (per-route enumeration)

---

## Sync

After modifying this skill, run `/sync-knowledge-base` (per global CLAUDE.md). The hook `web-evolve-guard.ps1` lives in `~/.claude/hooks/` and is wired in `~/.claude/settings.json` PreToolUse block.
