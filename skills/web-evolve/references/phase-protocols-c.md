# /web-evolve - Phase Protocol C (Improvement loop)

_Archived from `phase-protocols.md` 2026-05-18 to stay under 1000-line cap. Phases A/B live in `phase-protocols.md`. Phases D/E/F live in `phase-protocols-def.md`._

---

## Phase C — Improvement loop

Read loop state from `loop-state.json` at start of each iteration. Write it after each decision.

Loop condition: `current_score < target_score AND real_iterations < max_iterations`

**Visual progress gate (evaluated alongside loop condition) — see Stop Conditions table below for full spec:**
Track in `loop-state.json`:
- `visual_checks_flipped` = count of checks with `visual_bonus >= 1000` that flipped FAIL→PASS this session
- `refinement_skill_invocations_count` = count of Phase C iterations that called `Skill(...)` for a refinement skill from `{impeccable, overdrive, animate, typeset, colorize, polish, bolder, delight, layout, distill, clarify, adapt}`
- `baseline_vq` = visual quality score from Phase A.7.5 probe (4-axis assessment)
- `post_run_vq` = re-probed visual quality score at exit-attempt (Puppeteer + 4-axis assessment)

When `current_score >= target_score`, the orchestrator MUST re-probe `post_run_vq` then evaluate ALL THREE GATES from the Stop Conditions table below:
1. `visual_checks_flipped >= tier_visual_floor`
2. `(post_run_vq - baseline_vq) >= tier_vq_delta_floor`
3. `refinement_skill_invocations_count >= tier_refinement_floor`

If any gate fails → do NOT exit. Force one more iteration through the highest-visual-bonus unflipped check via its refinement skill. Re-evaluate gates after. The old "exit if score met OR baseline_vq high" path is **banned** (Cardinal Rule 8) — it allowed runs to declare complete without visible change, which is the route-around failure mode this skill was designed to prevent, not enable.

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
[ ] 0.8  **edit_direct enforcement (Cardinal Rule 11.6):** for every check in `current_checks`, read `SKILL_LOOKUP[check_id].edit_direct`. If `false` for ANY check in the batch, the iteration MUST use `Skill(fix_skill, ...)` via the Skill tool — direct Edit / Bash sed / npm install + Edit are FORBIDDEN. The orchestrator may NOT decide "the fix is small enough to edit directly" — that judgment is SKILL_LOOKUP's, not the orchestrator's. If about to invoke Edit on a `edit_direct: false` check → STOP, route through `Skill(fix_skill)` instead.
[ ] 0.9  **Refinement-skill floor tracking (Cardinal Rule 11.7):** read `loop-state.json.refinement_skill_invocations_count` and `tier_minimum`. If `current_iteration_index ≥ max_iterations - (tier_minimum - count)` AND count < tier_minimum → the remaining iteration slots are RESERVED for refinement-skill invocations. Pick from the queue only checks routed through refinement skills (impeccable/overdrive/animate/typeset/colorize/polish/bolder/delight/layout/distill/clarify/adapt); skip non-refinement checks even if they have higher visual_bonus. If no refinement-routed checks remain in queue → fire `Skill('critique', args='generate-visual-targets')` to synthesise some.
```

If any guard check fails → log `"GUARD FAIL: 0.X — {reason}"` and resolve before Step 1.

---

### Step 1 — Pick check(s) — with batching

**VISUAL PRIORITY RE-SORT (mandatory before every pick):**
Before selecting from the queue, apply these visual impact bonuses to the sort key:

```
visual_bonus = {
  # Top-tier synthetic checks (only present when --top-tier)
  "WC1": 2500, "WC2": 2500, "WC3": 2500, "WC4": 2500, "WC8": 2500,  # hero, lenis, gsap, cursor, real product UI
  "WC9": 2400,                                                        # 60fps performance gate
  "WC5": 2200, "WC10": 2200,                                          # view transitions + reduced motion
  "WC6": 2100, "WC7": 2100,                                           # typography + color tokens
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

**Case A — `edit_direct: true`** (ONLY A10, B5, E1, G1, G2 per `SKILL_LOOKUP` — this list is closed):

**Hard gate (Cardinal Rule 11.6) — re-check before invoking Edit:**
```
for check_id in current_checks:
    routing = SKILL_LOOKUP[check_id]
    if routing.edit_direct is False:
        ABORT — this iteration is misrouted.
        Re-pick via Case C (refinement skill).
        Log to BUILD-LOG: "GUARD 0.8 FAIL: about to Edit a edit_direct:false check ({check_id}). Routing to Skill('{routing.fix_skill}') instead."
        DO NOT proceed with Edit.
```

Only AFTER the gate passes:
Use the Edit tool directly. The `fix_context` from the priority_queue entry contains the exact change needed. Log to BUILD-LOG: "{check_id}: PASS (Edit tool — edit_direct fix per SKILL_LOOKUP, too small for skill invocation)".

**The orchestrator's judgment that a fix "looks small enough to edit directly" is NOT sufficient.** SKILL_LOOKUP is the authority. If you find yourself thinking "I could just sed this across 7 files faster than calling Skill('colorize')" — STOP. That is the route-around failure mode (Cardinal Rule 11.6). Call the skill.

**Case B — `prereq` is not null** (A8, A9, B3, B9, E3, F6, K2 etc) — **three-stage 21st.dev pipeline (Cardinal Rule 15):**

1. **Stage 1 — Inspiration:**
   ```
   mcp__magic__21st_magic_component_inspiration(message="{fix_context}", searchQuery="{section name + personality + 2-word descriptor}")
   ```
   Returns prose suggestions and reference component URLs. Read top 3.

2. **Stage 2 — Decide builder vs refiner (deterministic):**

   Check if the section already exists in the repo:
   ```bash
   ls "{project_path}/src/components/landing/{Section}*" 2>/dev/null
   ```
   - **No file exists** → use **builder** (new component generation):
     ```
     mcp__magic__21st_magic_component_builder(
       message="{fix_context} | inspired_by: {stage 1 top pick} | design_dna: {first 300 chars of ~/.claude/web-system-prompt.md} | tokens_only: hsl(var(--token)) no hex",
       searchQuery="{section} component {personality}",
       absolutePathToCurrentFile="{project_path}/src/components/landing/{Section}.tsx",
       absolutePathToProjectDirectory="{project_path}",
       standaloneRequestQuery="Generate {section} for {personality} landing with: {fail_proofs joined}"
     )
     ```
   - **File exists** → use **refiner** (improve existing component — the common case for web-evolve):
     ```
     mcp__magic__21st_magic_component_refiner(
       userMessage="{fix_context} | bold-execution-mandate | inspired_by: {stage 1 top pick} | design_dna: {token contract} | preserve-section-structure (CONTEXT.md locked landing structure)",
       absolutePathToRefiningFile="{project_path}/src/components/landing/{Section}.tsx",
       context="{design_context first 800 chars} | failing checks: {current_checks} | fail_proof: {fail_proofs}"
     )
     ```

3. **Stage 3 — Refinement skill polishes the output:**
   ```
   Skill('{fix_skill}', args='{fix_context} | post_21st: builder|refiner produced new component, polish it | checks: {current_checks} | fail_proof: {fail_proofs} | design_context: {first 800 chars of .evolution/design-context.md} | design_dna_tokens: hsl(var(--token)) only, no hex | bold_execution: yes')
   ```

**Special prereq cases:**
- **E3 (logo cloud)** — replace inspiration with logo_search:
  ```
  mcp__magic__logo_search(queries=["{logo1}","{logo2}",...], format="TSX", variant="GrayscaleColored")
  ```
  Then refiner on the logo cloud section.

- **A7 / D4 / D5 / F6 (hero atmosphere, scroll choreography, immersion)** — when `fix_skill = "overdrive"`, the prereq Stage 1 inspiration MAY also call `WebFetch(url=https://lottiefiles.com/featured, prompt="Find 3 trending hero animations matching {personality}. Return JSON [{name,url,download_url}].")`. Lottie animations integrate into overdrive output for scroll-driven choreography.

**Case C — standard Skill() fix:**

Use the `Skill` tool with:
- `skill`: the fix_skill name (e.g. `"typeset"`, `"clarify"`, `"animate"`)
- `args`: structured string with these mandatory markers (Cardinal Rules 12 + 13):

```
{fix_context}
 | checks: {current_checks joined with comma}
 | fail_proof: {fail_proofs joined with semicolon}
 | design_context: {first 800 chars of .evolution/design-context.md}
 | design_dna_tokens: hsl(var(--token)) only — no hex, no rgb literals, use semantic tokens (text-muted-foreground not text-gray-500)
 | bold_execution: yes — see Cardinal Rule 10
 | locked_decisions: {bullet list from CONTEXT.md section 4}
 | anti_goals: {bullet list from CONTEXT.md section 9}
```

Example: `"Hero H1 uses Inter — replace with Geist font | checks: A1, A2 | fail_proof: tailwind.config.ts fontFamily.display is 'Inter'; globals.css same | design_context: {first 800 chars of design-context.md} | design_dna_tokens: hsl tokens only | bold_execution: yes | locked_decisions: hero section position fixed; pricing tiers locked at $49/$99/$249 | anti_goals: do not add testimonial section; no AI emoji in headers"`

The refinement skills read the `checks:` and `fail_proof:` markers to enter Targeted Mode (skip impeccable, apply only what args describe).

**Effect verification (P1 fix — Gate A counts Skill EFFECT, not invocations):**

Before invoking Skill, snapshot mtimes of all files in the iter scope:
```bash
# Snapshot mtimes BEFORE Skill call
declare -A mtime_before
for f in $(git -C "${PROJECT_PATH}" ls-files src/components src/app src/lib); do
  mtime_before["$f"]=$(stat -c %Y "${PROJECT_PATH}/$f" 2>/dev/null || echo 0)
done
```

After Skill returns, compare:
```bash
mtime_changes=0
for f in "${!mtime_before[@]}"; do
  mtime_after=$(stat -c %Y "${PROJECT_PATH}/$f" 2>/dev/null || echo 0)
  if [ "${mtime_before[$f]}" != "$mtime_after" ]; then
    mtime_changes=$((mtime_changes + 1))
  fi
done

if [ "$mtime_changes" == "0" ]; then
  # Skill produced no file changes despite being invoked
  log "SKILL EFFECT GATE FAILED: Skill('${fix_skill}') returned without modifying any file. DOES NOT count toward Gate A refinement_skill_invocations_count."
  # Iteration is effectively a no-op. Log VOID, increment attempt_counts, continue (skip 3.4-3.6).
  # Critical: the orchestrator MUST NOT then manually Edit the file as a workaround — that's Rule 11.6 bypass.
  # If Skill produces nothing → check the prompt args, re-route to secondary skill, or escalate to NEEDS_HUMAN.
fi
```

The Gate A counter only increments when `mtime_changes > 0`. This closes the loophole where orchestrator could fire `Skill(...)` with empty/bad args, get back "no changes", then manually Edit the file — Skill was "invoked" so old Gate A passed but no Skill effect actually happened.

If Skill() errors or returns "no changes" AND mtime_changes is 0 → log NEEDS_HUMAN for each check_id, increment `attempt_counts`, continue loop (skip 3.4-3.6 onwards).

**Complexity budget gate (post-Skill effect-verified, pre-commit):** After the Skill returns AND mtime gate passes, check the diff size:
```bash
git -C "{project_path}" diff --shortstat
```

Apply the budget:
- **≤ 200 lines changed in single file** → normal commit, no gate.
- **201-500 lines changed in single file** → log `"⚠️ Large change: {n} lines in {file}. Single-shot rebuild — high blast radius."` Continue, but flag iteration as `complexity: "high"` in BUILD-LOG.
- **> 500 lines changed in single file** → HALT NEEDS_HUMAN: `"Iteration produced {n}-line change in {file}. That's too large for a single iteration — risk of unverifiable regression. Options: (a) split into 2-3 smaller iterations targeting specific sub-elements, (b) override and continue (`/web-evolve --allow-large-change`), (c) discard this iter and replan."` Do NOT auto-commit.
- **> 100 lines changed across > 5 files** → same HALT path. Spanning too many files in one iter blocks verification.

**Disposal step on user-discard (P12 fix):** If user picks "(c) discard this iter and replan" OR interrupts during HALT, the orchestrator MUST clean up working tree to remove the unkept changes — otherwise next iter's diff measurement is contaminated by leftover uncommitted Skill output:
```bash
# Get list of files Skill modified (via mtime fingerprint snapshot from effect verification above):
modified_files=$(git -C "${PROJECT_PATH}" diff --name-only)
# Revert each in working tree:
for f in $modified_files; do
  git -C "${PROJECT_PATH}" checkout HEAD -- "$f"
done
# Also clean any untracked files Skill may have created:
git -C "${PROJECT_PATH}" clean -fd src/
# Log the disposal:
log "Discarded iter ${iteration} via complexity gate: ${n} lines reverted across ${file_count} files."
# Increment attempt_counts and continue with next iter pick (skip this check_id for the rest of run via excluded_skills)
```

On `(a) split into smaller iters` → same disposal, then re-queue the same check_id with a `split_hint: true` flag so the next iter's Skill call gets `args='SPLIT MODE: prior attempt at this fix was too large. Target ONLY {sub-element-X} this iter.'`

On `(b) --allow-large-change override` → proceed to commit + flag iter `complexity: high+overridden` in BUILD-LOG + trajectory.

Run #2 on Orbit Digital (2026-05-16) made a 440-line single-file rebuild of `ServicesSection.tsx` via `Skill('impeccable')` in one iteration. Worked, but the spec had no gate — pure luck. This budget surfaces blast radius before commit + defines exact cleanup. **Added 2026-05-16.**

---

### Step 3.4 — Above-fold sanity check BEFORE commit (mandatory for hero/CTA-touching iters)

Before committing the change, simulate the change locally via dev-server OR run the dev build and probe with Puppeteer to verify the **primary CTA is visible above the 900px viewport** on desktop AND above the 800px viewport on mobile.

**When this step fires — explicit trigger detection (P18 fix):**

After Skill returns + mtime fingerprint confirmed effect + complexity gate passed, run:
```bash
# Determine which files changed in working tree (uncommitted):
touched_files=$(git -C "${PROJECT_PATH}" diff --name-only HEAD)
```

The above-fold check FIRES when `touched_files` matches any of:
- `**/Hero*.tsx` (HeroSection, HeroBackground, HeroDashboardMockup, HeroMockup, etc.)
- `**/CTABand.tsx`
- `**/Navbar.tsx`
- `**/layout.tsx` (root or section layouts — may change header height / inject providers that affect first-viewport)
- `**/globals.css` (if grep `touched_files` for globals.css → ALWAYS fires; CSS changes can affect any first-viewport layout)
- `**/tailwind.config.*` (theme changes affect entire site)
- Any component imported INTO `page.tsx` for routes `/`, `/index`, `/[slug]` where the section is in the first 900px (resolved via SSR HTML inspection — if Puppeteer landing-page screenshot shows the section in viewport at y < 900 before scroll)

**If `touched_files` matches none of the above glob patterns** → SKIP this check, proceed directly to Step 3.5 commit. (Pure backend / CMS / non-first-viewport changes don't need the above-fold probe.)

**If `touched_files` matches one or more** → run the probe below.

**Probe script (Puppeteer evaluate on dev_server_url or staged change):**
```javascript
(async () => {
  await new Promise(r => setTimeout(r, 1500)); // wait for layout settle
  const cta = document.querySelector('a[href*="get-started"], button[type="submit"], a[href*="signup"]');
  if (!cta) return JSON.stringify({ status: 'no-cta-found' });
  const r = cta.getBoundingClientRect();
  return JSON.stringify({
    status: r.bottom < 900 ? 'pass-desktop' : 'fail-desktop',
    cta_top: Math.round(r.top), cta_bottom: Math.round(r.bottom),
    viewport_h: 900,
  });
})()
```

Then probe at 390×844 (iPhone 14 Pro mobile dimensions) for mobile gate.

**Branching:**
- **PASS both desktop + mobile** → continue to Step 3.5 commit
- **FAIL desktop** → log `"CTA below fold (y={cta_bottom}/900) — forcing size-pass iteration before commit"`, do NOT commit. Re-fire `Skill('layout', args='reduce vertical-space: H1 size step down, mb-* step down, leading step down — CTA MUST be above 900px')` once. Re-probe. If still failing → log NEEDS_HUMAN and abort the iter (do not commit a hero that hides the CTA).
- **FAIL mobile but PASS desktop** → log warning + commit, but flag the iter for mobile fix in the queue.

Run #2 on Orbit Digital (2026-05-16) shipped a hero with 128px H1 that pushed the CTA below the 900px fold — caught by Puppeteer probe AFTER commit and required 2 corrective size-pass commits (9407778, c2bda00). This gate moves the check BEFORE commit so a single commit suffices.

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
Agent 1 — web-screenshot (desktop):
  subagent_type: "web-screenshot"
  run_in_background: true
  prompt: |
    live_url: {dev_server_url if set, else live_url}
    section_name: {section}
    mode: diff
    before_path: {project_path}/.evolution/iter-{iteration}/before-{section}-desktop.png
    output_path: {project_path}/.evolution/iter-{iteration}/after-{section}-desktop.png
    scroll_to_selector: {CSS selector if known}
    viewport: desktop

(if mobile_loop) Agent 1b — web-screenshot (mobile, 390x844 iPhone 14 Pro):
  subagent_type: "web-screenshot"
  run_in_background: true
  prompt: |
    live_url: {dev_server_url if set, else live_url}
    section_name: {section}
    mode: diff
    before_path: {project_path}/.evolution/iter-{iteration}/before-{section}-mobile.png
    output_path: {project_path}/.evolution/iter-{iteration}/after-{section}-mobile.png
    scroll_to_selector: {CSS selector if known}
    viewport: mobile

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

Wait for both/three agents. Read `diff-verdict-{section}-desktop.json`, `diff-verdict-{section}-mobile.json` (if mobile_loop), and `score-rescore.json`.

**Desktop + mobile reconciliation (when mobile_loop = true):**

| Desktop | Mobile | Combined verdict |
|---|---|---|
| VISIBLE_DIFF | VISIBLE_DIFF | VISIBLE_DIFF (both improved) |
| VISIBLE_DIFF | NULL_DELTA | **MOBILE_REGRESSION** — desktop improved but mobile unchanged. Decision: KEEP only if `--no-mobile-parity` flag set, else REVERT and add `mobile-broken-fix` to excluded_skills for this check |
| NULL_DELTA | VISIBLE_DIFF | **DESKTOP_NO_OP** — likely a mobile-only fix landed correctly. KEEP. |
| NULL_DELTA | NULL_DELTA | VOID (consistent — fix did nothing) |
| VISIBLE_DIFF | UNCERTAIN | Wait 10s, re-run mobile once. Still UNCERTAIN → trust desktop, log mobile flag |
| any | any-down (visual regression on either) | REVERT |

The combined verdict feeds into the Step 5 decision table as the single `Screenshot` value.

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
| `current_score >= target_score` AND `visual_checks_flipped >= tier_visual_floor` AND `(post_run_vq - baseline_vq) >= tier_vq_delta_floor` AND `refinement_skill_invocations >= tier_refinement_floor` | Exit → Phase D |
| `current_score >= target_score` but ANY of the three visual/refinement gates above fail | Do NOT exit. Force one more iteration via `Skill('overdrive')` on the highest-visual-bonus unflipped check (or `Skill('critique', args='generate-visual-targets')` if queue empty), re-test gates after. Max 3 forced iterations before HALT NEEDS_HUMAN (`"score met but visual gates cannot be satisfied — manual decision required"`). |
| `real_iterations >= max_iterations` AND any gate unmet | Log TIMEOUT-WITH-GATE-FAILURE → Phase D BUT trajectory.json `status: "incomplete_*"` per Rule 14 Gates A/B/C |
| `real_iterations >= max_iterations` AND all gates met | Log TIMEOUT-COMPLETE → Phase D, status `completed` |
| Queue empty AND any gate unmet | Fire `Skill('critique')` to refill queue with visual targets, continue. If still empty after critique → HALT NEEDS_HUMAN |
| Queue empty AND all gates met | Log STUCK-COMPLETE → Phase D |
| Check attempted 3× | Auto-WONTFIX, continue |
| Build breaks twice | HALT → NEEDS_HUMAN |

**Tier floor table** (read by orchestrator at start of Phase C, written to loop-state.json):

| Target | `visual_checks_flipped` floor | `vq_delta` floor | `refinement_skill_invocations` floor |
|---|---|---|---|
| 90 | ≥ 1 | ≥ 0.5 | ≥ 1 |
| 95 | ≥ 2 | ≥ 0.7 | ≥ 3 |
| 98 | ≥ 4 | ≥ 1.0 | ≥ 6 |
| 100 | ≥ 6 | ≥ 1.5 | ≥ 8 |

The orchestrator MUST measure `post_run_vq` via Puppeteer screenshot + 4-axis assessment at exit-attempt — not assume "baseline was already 4.0, no change needed." See Cardinal Rule 8.

---

