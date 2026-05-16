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
6. **NULL_DELTA = VOID for design checks only.** For code-quality/documentation-only checks (B-series, H-series, D1, A11, I4, I8, I2 when fix_context is docs-only), NULL_DELTA does NOT trigger VOID — rescore only, KEEP if checks now PASS.
7. **Raw transparency.** Veto cap hiding >5 pts: show both numbers always.
8. **Visual impact is the primary success criterion.** The loop succeeds when a human looking at the site says "this looks dramatically better" — not just when checklist score reaches target. If score hits target but site looks unchanged → continue with visual improvements.
9. **Invisible checks must never block visible ones.** Code-quality checks (B-series, D1, H-series, C6, C7, I5, I6, A11, I4, I8, I2) must NEVER occupy iteration slots 1-3 if any visual check (A7, A9, D4, D5, F6, K2, K4, E-section checks) exists in the queue.
10. **Bold execution required.** Every call to overdrive/impeccable/bolder MUST include explicit boldness instructions. "Subtle" is a failure. The before/after screenshots must show obvious visible difference.
11. **CONTEXT.md is the anchor.** No iteration begins without a fresh CONTEXT.md (≤7 days, no newer commits). Every refinement is checked against Locked Decisions and Anti-Goals from CONTEXT.md before commit. A change that violates either is a VOID, not a KEEP — even if it improves the score.

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

## Phase 0 — Project Context Read (MANDATORY, runs before Phase A)

This phase exists because scoring against generic premium-SaaS criteria produces template-drift. The loop must improve toward what THIS product is meant to be, not toward what a SaaS-in-general looks like.

1. Check `{project_path}/CONTEXT.md` exists.
2. **If missing OR `Generated:` date is older than 7 days OR `git log -1` shows commits newer than `Generated:` date → fire `Skill('project-context')` now.** This is a literal Skill invocation. Do NOT self-synthesise the brief by reading docs inline.
3. Read CONTEXT.md after it exists.
4. Extract into loop state:
   - **Locked Decisions** (section 4) — anti-patterns: do NOT propose changes that contradict these.
   - **Landing Page Structure** (section 5) — if locked, the section order is FIXED. Refinement skills may not add/remove sections, only refine within them. If "NOT LOCKED" → skill may propose structure.
   - **Pricing & Packaging** (section 6) — if locked, refinement skills may NOT modify pricing copy or tiers.
   - **Anti-Goals** (section 9) — every refinement output must be checked against this list before commit. A "better" change that violates an anti-goal is a VOID.
   - **Open Questions / Gaps** (section 10) — surface to user at end of Phase A before iteration begins.
5. If CONTEXT.md reports validator verdict = `KILL` or `VALIDATE-FIRST` → HALT the loop. Surface verdict. Do not iterate on a product that shouldn't exist yet.

---

## Phase A — Setup

**Run all reads in parallel (single message):**

1. Read simultaneously: `{project_path}/CLAUDE.md`, `{project_path}/CONTEXT.md`, `{project_path}/DESIGN-BRIEF.md`, `{project_path}/SCOPE.md`, `{project_path}/BUILD-LOG.md`

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

6.5 **ENVIRONMENT PROBE — sub-agent resolution check:**

   Attempt to spawn a minimal Agent with `subagent_type: "web-score"`. If it errors with "Agent type not found" → set `USE_GENERAL_PURPOSE_FALLBACK = true` and log:
   ```
   ⚠️  web-score subagent_type not registered in this environment (Windows VS Code extension or non-standard install).
   Switching all Phase B/C agent calls to general-purpose mode.
   Agent spec paths will be injected into each prompt.
   ```

   **When USE_GENERAL_PURPOSE_FALLBACK = true**, every agent call in Phase B and Phase C that uses `subagent_type: "web-score"` etc. must instead use:
   ```
   subagent_type: "general-purpose"
   prompt: |
     Read your agent spec first: ~/.claude/agents/{agent_name}.md
     Then execute it with these inputs:
     {original prompt body}
   ```
   
   Where `{agent_name}` is `web-score`, `web-benchmark`, `web-screenshot`, or `web-patch` as appropriate.
   
   This fallback is transparent — the same JSON output format, the same file paths, the same behaviour. The only difference is the model routing and tool permissions come from `general-purpose` rather than the specialist agent definition.

7. Create `.evolution/` directories (four separate calls):
   ```bash
   mkdir -p "{project_path}/.evolution/baseline"
   mkdir -p "{project_path}/.evolution/benchmark"
   mkdir -p "{project_path}/.evolution/scores"
   mkdir -p "{project_path}/.evolution/final"
   ```

7.5 **VISUAL QUALITY GATE** — Take a Puppeteer screenshot of `live_url` at 1440×900. Assess visually:

   ```
   Rate each 1–5:
   - Hero impact:        Does the above-fold experience stop a scroll? Flat text on plain bg = 1. Split-pane with visible product, atmospheric depth = 5.
   - Visual hierarchy:   Is there obvious size/weight contrast between sections? All same = 1.
   - Distinctiveness:    Does this look like a $10K product or a SaaS template? Template = 1.
   - Product visibility: Is the actual product UI visible above the fold without scrolling? Not visible = 1.
   
   visual_quality_score = average of 4 ratings
   ```
   
   **If visual_quality_score < 3.0 → INSERT these at the VERY START of the Phase C iteration queue (BEFORE checklist-driven checks):**
   - VQ-1: `Skill('impeccable')` on the hero section with BOLD execution mandate
   - VQ-2: `Skill('layout')` on the features/main content section
   - VQ-3: `Skill('bolder')` on overall visual weight
   
   **These visual overhaul iterations run FIRST regardless of what the checklist priority queue says.** Only after VQ-1/2/3 are KEPT does the normal checklist queue begin.
   
   **Re-evaluation:** After each VQ iteration that targets a visual check (A7, A9, D4, D5, F6, K2, K4), re-run the visual quality assessment. If visual_quality_score rises above 4.0, the forced VQ queue clears and the normal checklist queue resumes. If after all 3 VQ iterations the score is still < 3.0 → surface NEEDS_HUMAN.
   
   Log: `visual_quality_score: {score}/5 → {inserted VQ iterations | skipped (score >= 3.0)}`

8. **Discover CSS selectors for scroll targeting** — grep the main landing page file to build a section-to-selector map. Run:
   ```bash
   grep -nE 'id="[^"]*"' "{project_path}/src/pages/index.tsx" 2>/dev/null || grep -nE 'id="[^"]*"' "{project_path}/src/app/page.tsx" 2>/dev/null
   ```
   Also grep section component files:
   ```bash
   grep -rhE 'id="[^"]+"' "{project_path}/src/components/landing/" 2>/dev/null
   ```
   Build a `section_selectors` map, e.g.: `{"hero": "#hero", "features": "#features", "pricing": "#pricing"}`. Use `""` (empty — scroll to top) for any section without a discovered id. This map is used in Steps 2 and 4 to pass `scroll_to_selector` to web-screenshot.

9. Echo confirmation to user and wait:
   ```
   web-evolve starting
   Mode: {mode} | Cap: {max_iterations} | Target: {target_score}/100
   Benchmark: {benchmark_url}
   Loop screenshots: {dev_server_url if set, else "live URL — 45s wait per commit"}
   Pages in scope: {from SCOPE.md}
   Proceed?
   ```

9. **DESIGN-BRIEF.md missing → auto-generate, do NOT halt:**

   If DESIGN-BRIEF.md does not exist, generate a minimal one from codebase inspection before proceeding. Do NOT halt. Follow these steps:

   ```
   a) Grep for font imports in layout.tsx / globals.css → identify display + body fonts
   b) Grep for color tokens (hsl vars, oklch values) in globals.css → identify palette
   c) Grep src/app/page.tsx for imported section components → identify page structure
   d) Take a Puppeteer screenshot at 1440×900 → assess visual direction
   e) Map to nearest personality from Step 4's table based on: industry keywords in
      page.tsx/metadata, color temperature (warm/cool/neutral), typography style (serif/sans)
   f) Write DESIGN-BRIEF.md to project_path with: personality, aesthetic_direction,
      colour palette (observed), typography (observed), hero description (from screenshot),
      and a ## Trend Pulse stub with search_date = today and placeholder lists
   g) Compute confidence score for the personality mapping:
      - HIGH (3 signals agree: industry keywords + color temp + typography style) → proceed silently
      - MEDIUM (2 signals agree) → log: "⚠️ DESIGN-BRIEF auto-generated with MEDIUM confidence. Personality: {X}. If wrong, edit DESIGN-BRIEF.md before continuing."
      - LOW (only 1 signal or signals conflict) → surface to user: "Personality auto-detected as {X} but signals conflict. Does '{X}' match your product? (or tell me: enterprise/growth/premium/bold/health)" — wait for one-word reply, update DESIGN-BRIEF, then proceed.
   
   h) Log: "DESIGN-BRIEF.md auto-generated from codebase inspection. Confidence: {HIGH|MEDIUM|LOW}."
   ```

   This replaces the old HALT with a 30-second auto-detect. HIGH confidence: fully unblocked. LOW confidence: one-question user check before proceeding — still faster than halting entirely.

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

   ```
   merged_checks = {}
   for each partial file (score-AB, score-CDE, score-FGH, score-IJK):
     merged_checks.update(partial.checks)

   # Visual weight multipliers — visual checks count 3×, code quality 0.5×, process 0×
   # NOTE: no duplicate keys — each check_id appears exactly once
   VISUAL_WEIGHT = {
     # 3× — hero depth, product visibility, layout quality (directly visible to users)
     "A7":3, "A9":3, "D4":3, "D5":3, "F6":3, "K2":3, "K4":3,
     # 2× — section presence and copy quality (visible, conversion impact)
     "E3":2, "E4":2, "E5":2, "E6":2, "E9":2, "E10":2,
     "J1":2, "J2":2, "J3":2, "J6":2,
     # 0.5× — code quality / invisible to users
     "A11":0.5, "I4":0.5, "I8":0.5, "I2":0.5,
     "D1":0.5, "I5":0.5, "I6":0.5, "C6":0.5, "C7":0.5,
     # 0× — process checks and 21st.dev sourcing (WONTFIX for pre-existing projects)
     "B1":0, "B2":0, "B3":0, "B4":0, "B7":0, "B8":0, "B9":0,
     "H1":0, "H2":0,
   }
   default_weight = 1  # all other checks (A1-A6, A8, A10, C1-C5, C8, D2, D3, D6, E1-E2, E7-E8, F1-F5, G-series, I1, I3, I7, J4-J5, J7-J8, K1, K3)

   weighted_passed = sum(VISUAL_WEIGHT.get(k, default_weight)
                         for k,v in merged_checks.items() if v.status=="PASS")
   weighted_total  = sum(VISUAL_WEIGHT.get(k, default_weight)
                         for k,v in merged_checks.items()
                         if v.status not in ("N/A","WONTFIX","NEEDS_HUMAN")
                         and VISUAL_WEIGHT.get(k, default_weight) > 0)

   raw_score = (weighted_passed / weighted_total) * 100 if weighted_total > 0 else 0

   # Veto logic — evaluated on raw_score BEFORE veto cap is applied
   # The veto cap applies to the WEIGHTED raw_score, not a simple pass count.
   # This means: a site with A7 FAIL has already lost 3× score weight from that check
   # PLUS gets capped at 60. Both penalties apply — they don't cancel each other.
   any_A_fail = any(k.startswith("A") and v.status=="FAIL"
                    for k,v in merged_checks.items())
   any_B_fail = any(k.startswith("B") and v.status=="FAIL"
                    and VISUAL_WEIGHT.get(k, 1) > 0  # skip zero-weight B checks
                    for k,v in merged_checks.items())
   if any_A_fail:   final_score = min(60, raw_score); veto_check = "first A FAIL"
   elif any_B_fail: final_score = min(80, raw_score); veto_check = "first non-WONTFIX B FAIL"
   else:            final_score = raw_score;           veto_check = None

   # Mandatory transparency log (output this every merge):
   # "Weighted score: {weighted_passed:.1f} / {weighted_total:.1f} = {raw_score:.1f}%
   #  Veto: {veto_check or 'none'}  →  Final: {final_score:.1f}
   #  3× visual checks: A7={status} A9={status} D5={status} F6={status} K2={status}
   #  0.5× code checks: D1={status} I5={status} I6={status} (these barely move the score)"

   merged_priority_queue = sorted(
     [entry for partial in partials for entry in partial.priority_queue if entry.status=="FAIL"],
     key=lambda x: -x.priority
   )
   ```

   Use the Write tool to write merged `score.json` to `{project_path}/.evolution/scores/score.json`.

3. Read `~/.claude/skills/web-evolve/references/fix-routing.md` — parse the `SKILL_LOOKUP` JSON block at the top of the file.

4. **Enrich priority_queue with fix routing:**
   For each FAIL entry in merged priority_queue:
   - Look up `check_id` in SKILL_LOOKUP
   - Set `fix_skill`, `prereq`, `secondary`, `edit_direct`, `section` on the entry
   - Build `fix_context` from the fail_proof (one sentence: what is wrong + target state)

4.5 **AUTO-WONTFIX invisible checks** — Before building the priority queue, mark these as WONTFIX (they produce no visible change and waste iteration slots):
   - **B-series (B1–B9):** 21st.dev component sourcing workflow — zero visual impact, never visible to users
   - **H1, H2:** Process integrity checks — BUILD-LOG citation format, not a visual concern
   - **D1 (import naming):** `framer-motion` vs `motion/react` — identical visual output
   - **A11, I4, I8, I2** when `fix_context` contains only DESIGN-BRIEF.md edits with no code changes
   
   Rule: **If the fix requires ONLY editing markdown/documentation files with ZERO React/CSS/TS code changes → auto-WONTFIX. Do not put in the queue.**
   
   Exception: A11 is allowed in the queue IF the DESIGN-BRIEF aesthetic direction is genuinely saturated/wrong and needs a redesign → only then escalate to web-design-research.

5. **Prepend benchmark gaps:** Read `.evolution/benchmark/gap-analysis.json`. For each in `top_5_priority_queue`: look up `maps_to_check` in SKILL_LOOKUP, set routing fields. Add to front of priority_queue with priority 400. Deduplicate by check_id.

6. **Surface NEEDS_HUMAN blocks** — one message to user listing all vision checks. Wait for replies. Update score.json check entries.

7. Write baseline score to BUILD-LOG.md (mandatory output format from checklist).

8. If `final_score >= target_score` → log "already at target", skip to Phase D.

9. **Write initial loop state** using the Write tool (not bash echo):
   Path: `{project_path}/.evolution/loop-state.json`
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

**Visual progress gate (evaluated alongside loop condition):**
Track `visual_checks_flipped` = count of checks with `visual_bonus >= 1000` that flipped FAIL→PASS this session.

When `current_score >= target_score`:
- If `visual_checks_flipped >= 1` OR `baseline_visual_quality_score >= 4.0` → exit normally to Phase D.
- If `visual_checks_flipped == 0` AND `baseline_visual_quality_score < 4.0` → **do NOT exit**. Log: `"Score target met via invisible fixes — forcing visual iteration before exit."` Insert one more VQ-1 iteration (Skill('impeccable') on hero) then exit. This prevents the loop declaring victory when only copy/docs/code-quality checks improved.

Store `visual_checks_flipped` in loop-state.json alongside `current_score`.

---

### Step 0 — Iteration guard (run at start of EVERY iteration before picking a check)

This guard enforces the cardinal rules mechanically. Complete all checks in order. If any FAIL → resolve before proceeding.

```
[ ] 0.1  fix_type from previous iteration was determined via git diff (not judgment) — or this is iteration 1
[ ] 0.2  visual_checks_flipped counter is current in loop-state.json
[ ] 0.3  priority_queue is sorted: visual_bonus applied, no check with visual_bonus < 300 in position 1-3 IF any check with visual_bonus >= 1000 exists
[ ] 0.4  attempt_counts loaded — no check being picked has attempt_count >= 3
[ ] 0.5  excluded_skills loaded — if primary fix_skill is excluded, secondary is set
[ ] 0.6  If current_score >= target_score AND visual_checks_flipped == 0 AND baseline_vq < 4.0 → this must be the forced VQ-1 iteration, not a normal pick
[ ] 0.7  BUILD-LOG has an entry for every completed iteration (no silent drops)
```

If any guard check fails → log `"GUARD FAIL: 0.X — {reason}"` and resolve before Step 1.

---

### Step 1 — Pick check(s) — with batching

**VISUAL PRIORITY RE-SORT (mandatory before every pick):**
Before selecting from the queue, apply these visual impact bonuses to the sort key:

```
visual_bonus = {
  # Critical visual impact — product visible, hero depth, layout quality
  "A7": 2000, "A9": 2000, "D4": 2000, "D5": 2000, "F6": 2000, "K2": 1500, "K4": 1500,
  # Section presence — visible to all users
  "E5": 1200, "E6": 1200, "E9": 1200, "E10": 1000, "E3": 800, "E4": 800,
  # Copy quality — affects conversion
  "J1": 800, "J2": 800, "J3": 800, "J6": 600,
  # Design system — visible but subtle
  "C6": 300, "C7": 300, "I1": 300, "I8": 300,
  # Code quality — invisible to users
  "D1": 0, "I5": 0, "I6": 0, "G1": 0,
  # Documentation only — always WONTFIX if fix is docs-only
  "A11": 0, "I4": 0, "I2": 0, "H1": 0, "H2": 0,
}
sorted_queue = sorted(queue, key=lambda x: -(x.priority + visual_bonus.get(x.check_id, 0)))
```

**Cardinal Rule 9 enforcement:** If any check with visual_bonus >= 1000 exists in the queue, it MUST be selected before any check with visual_bonus < 300.

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

**BOLD EXECUTION MANDATE (applies to ALL design skill calls — overdrive, impeccable, bolder, layout, colorize, animate):**

Append this to every `args` string when calling a design skill:
```
EXECUTE BOLDLY. No atmospheric opacity below 0.15. No subtle-only changes. The visual difference must be immediately obvious when comparing before/after screenshots at 1440x900. If a human looking at the screenshots cannot immediately say "yes, that's clearly different and better" — the fix has FAILED and must be redone with more dramatic execution. For hero sections: commit to a direction and execute fully. A half-committed hero (tiny glow, imperceptible grain) is worse than no change.
```

**Case A — `edit_direct: true`** (A10, B5, E1, G1, G2 etc):
Use the Edit tool directly. The `fix_context` from the priority_queue entry contains the exact change needed. Log to BUILD-LOG: "H1: PASS (Edit tool — edit_direct fix, too small for skill invocation)".

**Case B — `prereq` is not null** (A8, A9, B3, B9, E3, F6, K2 etc):
1. Call the prereq MCP tool first:
   ```
   mcp__magic__21st_magic_component_inspiration(query="{fix_context}")
   ```
2. Then call `Skill('{fix_skill}', args='{fix_context} | inspired_by: {MCP result summary} | checks: {current_checks} | fail_proof: {fail_proofs}')`.

**Case C — standard Skill() fix:**

Use the `Skill` tool with:
- `skill`: the fix_skill name (e.g. `"typeset"`, `"clarify"`, `"animate"`)
- `args`: a structured string in this exact format: `{fix_context} | checks: {current_checks joined with comma} | fail_proof: {fail_proofs joined with semicolon}`

Example args string: `"Hero H1 uses Inter — replace with Geist font | checks: A1, A2 | fail_proof: tailwind.config.ts fontFamily.display is 'Inter'; same in globals.css"`

The refinement skills read the `checks:` and `fail_proof:` markers to enter Targeted Mode (skip impeccable, apply only what args describe).

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

`affected_categories` = comma-joined unique category letters from `current_checks`. Examples:
- `current_checks = ["A7"]` → `affected_categories = "A"`
- `current_checks = ["J3", "J7"]` → `affected_categories = "J"`
- `current_checks = ["I1", "I3", "I5"]` → `affected_categories = "I"`
- `current_checks = ["C4", "I3"]` → `affected_categories = "C,I"`

Wait for both agents. Read `diff-verdict-{section}.json` and `score-rescore.json`.

Merge rescore into current score: update only the checks whose category letters match `affected_categories`. Recalculate summary and final_score across ALL merged checks (re-apply full veto logic).

---

### Step 4.5 — Determine fix_type via git diff (deterministic, no judgment required)

After the fix is applied and committed (Step 3.5), run:

```bash
git -C "{project_path}" diff --name-only HEAD~1 HEAD
```

Parse the output:

```
changed_files = [list of files changed in the commit]

if ALL changed_files match *.md → fix_type = "docs-only"
elif ANY changed_file matches *.tsx|*.ts|*.css|*.js|*.jsx → fix_type = "visual" or "copy"
  then: if fix_skill in [clarify] → fix_type = "copy"
        else → fix_type = "visual"
```

This is deterministic — no judgment call. The git diff output is ground truth for what actually changed. Pass `fix_type` in the web-screenshot prompt.

**docs-only fast path:** If `fix_type == "docs-only"` → SKIP Steps 2 and 4 (no screenshots needed). Go directly to rescore.

**docs-only fast path:** If `fix_type == "docs-only"` → SKIP Steps 2 and 4 (no screenshots needed). Go directly to rescore. If checks now PASS → KEEP. If still FAIL → REVERT. No screenshot verdict needed, no NULL_DELTA risk.

---

### Step 5 — Decision

**If `fix_type == "docs-only"` → use this table (no screenshot verdict):**

| Rescore result | Decision |
|---|---|
| Checks now PASS | **KEEP** — update current_score. real_iterations++. |
| Checks still FAIL | **REVERT** — `git -C "{project_path}" revert HEAD --no-edit`. attempt_counts[check_id]++. real_iterations++. |
| Score down | **REVERT** — regression. excluded_skills. real_iterations++. |

**If `fix_type == "visual"` or `"copy"` → use the standard screenshot decision table:**

| Screenshot | Score | Decision |
|---|---|---|
| NULL_DELTA | any | **VOID** — `git -C "{project_path}" revert HEAD --no-edit`. void_count++. Do NOT increment real_iterations or attempt_counts. |
| CAPTURE_ONLY | up | **KEEP** — first iteration, no before to diff. Trust rescore only. Update current_score. real_iterations++. |
| CAPTURE_ONLY | same + checks now PASS | **KEEP** — log raw delta. real_iterations++. |
| CAPTURE_ONLY | same + checks still FAIL | **REVERT** — fix didn't resolve the check. attempt_counts[check_id]++. real_iterations++. |
| CAPTURE_ONLY | down | **REVERT** — regression. excluded_skills. attempt_counts[check_id]++. real_iterations++. |
| VISIBLE_DIFF | up | **KEEP** — update current_score. real_iterations++. Mark checks as PASS in queue. If visual_bonus[check_id] >= 1000 → increment visual_checks_flipped. |
| VISIBLE_DIFF | same + all checks now PASS | **KEEP** — log raw delta (veto cap hiding progress). real_iterations++. |
| VISIBLE_DIFF | same + checks still FAIL | **REVERT** — `git -C "{project_path}" revert HEAD --no-edit`. attempt_counts[check_id]++. real_iterations++. |
| VISIBLE_DIFF | down | **REVERT** — add fix_skill to excluded_skills[check_id]. attempt_counts[check_id]++. real_iterations++. |
| UNCERTAIN | any | Wait 10s, re-run web-screenshot once. Still UNCERTAIN → VOID. |
| NULL_DELTA (visual fix) | any | **Pixel-diff fallback before VOIDing:** Run `mcp__puppeteer__puppeteer_evaluate` with this script to count changed pixels between before and after screenshots — if changed_pixels > 500 → override NULL_DELTA to VISIBLE_DIFF and KEEP. If changed_pixels <= 500 → VOID as normal. Script: `const img1 = await fetch('{before_path}').then(r=>r.arrayBuffer()); const img2 = await fetch('{after_path}').then(r=>r.arrayBuffer()); /* compare pixel arrays, count diffs > threshold 10 */`. This catches subtle grain/opacity changes that Sonnet's vision misses but that are real pixel-level changes. Only applies when fix_type == "visual" — docs-only and copy NULL_DELTA never invoke pixel-diff. |

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

**Write loop state** using the Write tool to `{project_path}/.evolution/loop-state.json` after every iteration (including VOID):
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
| `current_score >= target_score` AND `(visual_checks_flipped >= 1 OR baseline_visual_quality_score >= 4.0)` | Exit → Phase D |
| `current_score >= target_score` AND `visual_checks_flipped == 0` AND `baseline_visual_quality_score < 4.0` | Force one VQ-1 iteration (Skill('impeccable') on hero, BOLD), then exit → Phase D |
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
