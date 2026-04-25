---
name: web-evolve
description: >
  Score-driven continuous improvement loop for existing websites. Captures
  screenshots, runs an auditable binary checklist (no self-grading), then
  iteratively fixes the lowest-scoring failed check via the right premium-website
  refinement skill. Each iteration must improve the score or the change is
  reverted. Stops when target score is reached or max iterations hit. Built to
  vastly improve generic-AI-slop landings without wiping what works. Score
  always comes with receipts — never a number alone.
---

# Skill: /web-evolve

**The closed-loop visual optimizer for the premium-website suite.**

Use this when an existing website needs to be made vastly better without a wipe-and-rebuild. Preserves anything already scoring well; targets effort at what's broken.

---

## Cardinal rules (load-bearing — do not weaken)

1. **No score without receipts — AND no capped score without showing the raw score underneath.** Every score emitted by this skill MUST show BOTH the capped final score AND the raw score percentage AND the specific check holding the cap. Iterations that do real work but hide progress behind a veto cap are demoralising — the user must see "raw 88%, capped 80 because B5 FAIL" so progress is legible. Every score is also accompanied by the full checklist with PASS / FAIL / N/A / WONTFIX per row, plus the proof for each PASS (grep result, count, screenshot path). A score number alone is invalid output. (See AuditHQ v2 retro 2026-04-24 — "98/100 self-graded" was the failure pattern; "iter 2 + iter 3 showed 80 → 80 and hid real work" was the secondary pattern.)

2. **The checklist is the authority, not Claude.** Read `~/.claude/skills/shared/landing-page-checklist.md` (or `app-page-checklist.md` for app pages) at start. Run every check. Compute score from results. **Do not invent or skip checks.** If a check is genuinely N/A for this product, mark it N/A with a one-line reason — do not silently drop it.

3. **Every fix invokes a real Skill tool.** When a check fails, route to the named refinement skill via `Skill('X')`. Do NOT paraphrase the skill's logic in main context. Do NOT use a generic subagent. (See `feedback_invoke_skills_never_synthesise.md` memory.)

4. **21st.dev maximalism.** When a section needs rebuilding, the FIRST move is `mcp__magic__21st_magic_component_inspiration` to find a real component. Building from scratch when 21st.dev has a fit is a Category B failure. Use as much from 21st.dev as possible — that's why we pay for it.

5. **Theme consistency.** If the project uses a themed `<Button>` with variants, every fix MUST use the same Button. Don't introduce a different button. Don't bypass the design tokens. Category C catches this.

6. **Score-anchored regression guard.** If a fix doesn't raise the score, REVERT the commit. Don't "trust the change is qualitatively better." The score is the contract. **Exception:** if the fix moved the target check from FAIL → PASS (so the raw score climbed under a veto cap, even if the displayed score didn't change), KEEP the commit and log the raw delta — real progress counts even when the cap hides it.

7. **Explicit WONTFIX path.** When a check genuinely doesn't apply to this repo AND N/A is too narrow (e.g. B5 in backfill when mode detection couldn't flip it automatically), the user can mark it WONTFIX with a one-sentence justification. WONTFIX items are excluded from the denominator (like N/A) but produce an audit-trail entry in BUILD-LOG.md: `check-id WONTFIX — [reason] — [user confirmation]`. Cannot be auto-applied; requires user decision.

8. **Visual-diff gate — no invisible wins.** After every fix, a Puppeteer screenshot of the affected section MUST be captured and compared to the pre-fix screenshot. If the before/after screenshots are pixel-identical (same layout, same content, no visible change), the iteration is null-delta: revert the commit, mark the iteration VOID in BUILD-LOG.md, do NOT count the score delta. "Committed code" ≠ "visibly improved page." The diff must be human-perceptible. Null-delta iterations do NOT count toward the max-iteration cap.

9. **No Skill call = no iteration credit.** Every fix applied during the loop MUST correspond to a `Skill('X')` tool invocation OR a direct named MCP tool call in this session's transcript. Fixes applied by direct Edit/Bash/Write without a Skill wrapper are process violations — mark iteration VOID under check H1 and re-run via the correct skill. The loop routes through skills; it does not synthesise their logic inline.

---

## Inputs

- **Working directory** — existing repo (auto-detected from current dir, or passed as arg)
- **Live URL** — production deploy URL to capture baseline screenshots from (read from BUILD-LOG.md or passed as arg)
- **Target score** — default 90, raise to 95 for "Stripe/Linear quality" mode
- **Scope** — default = all landing/marketing pages auto-detected from `src/pages/`. App pages are off-limits unless explicitly listed.
- **Mode** — auto-detected (`backfill` if DESIGN-BRIEF.md exists AND src/components/landing/ is populated; otherwise `greenfield`). Override with `--mode=backfill` or `--mode=greenfield`.
- **Max iterations** — default depends on mode: **greenfield = 8, backfill = 20** (backfill requires more iterations because per-file provenance backfill + component swaps add up). Tell the user the mode + cap at the start so expectations match reality.

---

## Phase A — Survey & guard rails

1. Read `CLAUDE.md`, `package.json`, `DESIGN-BRIEF.md` (if exists), `SCOPE.md`, `BUILD-LOG.md`.
2. **Detect mode** per `~/.claude/skills/shared/landing-page-checklist.md` Mode detection section. Backfill = DESIGN-BRIEF.md exists AND src/components/landing/ is populated. Greenfield = otherwise. Echo the detected mode AND the iteration cap to the user as the first output line.
3. Auto-classify pages: marketing (in scope) vs app/dashboard (off-limits).
4. Confirm target page list with user via `Skill('AskUserQuestion')` — one prompt, then autonomous. Include mode confirmation: "Detected [mode] mode, iteration cap [N]. Proceed?"
5. Verify the deployed URL is reachable: `curl -s -o /dev/null -w "%{http_code}" [URL]` must return 200.
6. Create working directory `.evolution/` for screenshots, scores, diffs, baseline backups.
7. **HALT** if mode = greenfield AND no DESIGN-BRIEF.md exists — `Skill('web-evolve')` requires a design contract to score against. Surface NEEDS_HUMAN: "Run `Skill('web-design-research')` first to produce DESIGN-BRIEF.md." (In backfill mode this is unreachable because the mode detection requires DESIGN-BRIEF.md to exist.)

---

## Phase B — Baseline capture & score

For each target page:

1. **Puppeteer baseline screenshots:**
   - `mcp__puppeteer__puppeteer_navigate` to the live URL
   - `mcp__puppeteer__puppeteer_screenshot` at 1440×900 (desktop) → `.evolution/baseline/[page]-desktop.png`
   - Resize to 375×812, screenshot again → `.evolution/baseline/[page]-mobile.png`
   - For each section: scroll to it, capture cropped screenshot → `.evolution/baseline/[page]-[section].png`

2. **Run the checklist** from `~/.claude/skills/shared/landing-page-checklist.md`:
   - Execute each check via its named verification method (Bash grep, file Read, puppeteer evaluate, vision inspect)
   - Record PASS / FAIL / N/A with proof for every row
   - Compute score using the formula in the checklist (with veto caps)
   - Save to `.evolution/scores/baseline-[page].json` AND emit the full output to BUILD-LOG.md

3. **Build the priority queue:** sort failed checks by potential score gain (hard-veto failures first, then by category weight, then alphabetical).

4. **Self-check:** if the baseline score is already ≥ target, log "[page] already at target ([score]) — no evolution needed" and skip to Phase D for that page.

---

## Phase C — Improvement loop (per page, per failed check)

Loop while overall score < target AND iterations < max:

1. **Pick the highest-priority failed check** from the queue.

2. **Diagnose**: read the check's category and FAIL detail. Match to a fix path.

3. **Route to the correct fix skill** (see `references/fix-routing.md` for the full table). Examples:
   - A1 (Inter as display) → `Skill('typeset')` to swap font pairing
   - A4 (banned hsl found) → `Skill('colorize')` to replace token
   - A7 (flat hero bg) → `Skill('overdrive')` or `Skill('animate')` to add atmosphere
   - A9 (no product visual) → `mcp__magic__21st_magic_component_inspiration` for hero pattern + `Skill('web-component')` to install
   - B-series (21st.dev sourcing missing) → `mcp__magic__21st_magic_component_inspiration` for the section + `Skill('web-component')` swap
   - C-series (theme drift) → `Skill('polish')` for token consolidation
   - D-series (motion missing) → `Skill('animate')`
   - E-series (section incomplete) → `Skill('web-component')` to add missing item
   - F-series (visual quality) → vision-led: route by sub-category
   - G1 (key={index}) → `Skill('web-fix')` direct
   - G3 (build broken) → `Skill('web-fix')` direct

4. **Apply the fix**, then commit per-iteration: `git commit -m "evolve: [page] iteration N — fix [check-id]"`.

5. **Re-screenshot the affected section + page.** Save to `.evolution/iter-N/[section].png`. Compare against the previous iteration's screenshot for this section.

6. **Visual-diff check (mandatory before re-scoring).** If the before/after screenshots for the affected section are pixel-identical — same layout, same content, no visible change — mark the iteration VOID: revert the commit, log `iter N: VOID — null-delta, no visible change despite code change`, and do NOT re-score. A null-delta iteration does NOT consume one of the max-iteration slots.

7. **Re-run the full checklist for this page.** Compute new score. (Only reached if step 6 confirms a visible diff.)

8. **Decision:**
   - **Score went UP** → keep commit, log to `EVOLUTION-LOG.md` with delta AND screenshot paths, update priority queue, continue loop.
   - **Score stayed SAME** → keep commit IF the failed check is now PASS (other checks may have shifted N/A), otherwise revert.
   - **Score went DOWN** → `git revert HEAD --no-edit`, log "REGRESSION: tried [skill] for [check], score dropped from X to Y, reverted", remove that skill from candidates for this check, try the next-best skill or skip if exhausted.

9. **Stop conditions:**
   - Overall score ≥ target → exit loop, proceed to Phase D
   - All failed checks attempted with no improvement → log STUCK, exit loop
   - Max iterations hit (null-delta iterations excluded from count) → exit loop, log remaining failures

---

## Phase D — Visual diff log + final score report

1. Capture **post-evolution screenshots** at the same viewports as baseline.
2. Generate `EVOLUTION-LOG.md`:
   ```markdown
   # Evolution Log — [page]
   Baseline score: 42/100
   Final score: 91/100
   Iterations: 14
   Commits: 12 (2 reverted)

   ## Score delta by category
   - A. Anti-slop: 6/10 → 10/10
   - B. 21st.dev: 3/8 → 8/8
   - C. Theme: 5/8 → 8/8
   - D. Animation: 2/6 → 6/6
   - ...

   ## Per-section before/after
   ### Hero
   ![baseline](.evolution/baseline/landing-hero.png) → ![final](.evolution/final/landing-hero.png)
   Score: 38 → 92

   [...]

   ## Iteration log
   - N=1: A4 (hsl banned) → Skill('colorize') → +6 → kept
   - N=2: A7 (flat hero bg) → Skill('overdrive') → +4 → kept
   - N=3: D5 (no animated bg) → Skill('animate') → -2 → REVERTED, tried Skill('overdrive') → +5 → kept
   - [...]
   ```
3. Final commit: `git commit -m "evolve: [page] final — score [baseline] → [final]"`
4. Push to GitHub. The deploy is triggered by the existing GitHub→Vercel auto-deploy if connected; otherwise invoke `Skill('web-deploy')`.

---

## Phase E — Post-deploy verification

1. Wait 30s for Vercel.
2. `mcp__puppeteer__puppeteer_navigate` to live URL.
3. `mcp__puppeteer__puppeteer_screenshot` at 1440 + 375.
4. Re-run a **trimmed checklist** (just the visual + a11y categories F + G) against the live URL — no source-code grep needed for the live verify, just confirm the deployed page matches the local final.
5. Append "deployed verified — live score [N]/100" to EVOLUTION-LOG.md.

---

## Phase F — Completion gate (transcript-verifiable)

`/web-evolve` cannot be marked complete unless THIS conversation's tool-call log contains:

- [ ] `Skill('AskUserQuestion')` invocation confirming target page list
- [ ] `mcp__puppeteer__puppeteer_navigate` + `mcp__puppeteer__puppeteer_screenshot` baseline captures
- [ ] `EVOLUTION-LOG.md` written with full per-iteration record
- [ ] `.evolution/scores/baseline-*.json` and `.evolution/scores/final-*.json` exist
- [ ] At least one fix-skill invocation per failed check that the loop attempted (no skips)
- [ ] Final score report emitted in the format defined in `landing-page-checklist.md`
- [ ] If target score not reached: STUCK log entry with remaining failures listed

If any of the above are missing → phase has NOT completed. Do NOT claim "evolved" status. Do NOT push to main with a misleading commit.

---

## Anti-patterns

- **Score without receipts** — emitting a number without the full checklist + proof is the exact failure this skill exists to prevent. Phase fails.
- **Self-vision-rating** — "I think this looks better" is not a score. Re-run the puppeteer checks.
- **Skipping checks because they're hard to verify** — every check has a method. If a method is unworkable in this environment, log NEEDS_HUMAN, don't silently drop it.
- **Trusting the fix without re-scoring** — every commit must be followed by a re-score. No score-up = revert.
- **Building generic instead of using 21st.dev** — Category B will catch this. Don't even try.
- **Drifting from the existing theme** — Category C will catch this. Use the existing Button. Use the existing tokens.

---

## Related skills

- `Skill('web-design-research')` — required to exist before web-evolve runs (DESIGN-BRIEF.md is the design contract)
- `Skill('web-page')`, `Skill('web-component')`, `Skill('web-fix')` — the fix skills
- `Skill('typeset')`, `Skill('layout')`, `Skill('colorize')`, `Skill('animate')`, `Skill('bolder')`, `Skill('quieter')`, `Skill('distill')`, `Skill('polish')`, `Skill('overdrive')`, `Skill('delight')`, `Skill('clarify')` — the refinement skills the loop routes to
- `mcp__magic__21st_magic_component_inspiration` + `mcp__magic__21st_magic_component_builder` — sourced when components need replacing
- `mcp__puppeteer__*` — screenshot capture
- `Skill('web-deploy')` — final deploy

---

## When to use this vs other skills

| Goal | Skill |
|---|---|
| Build new product from zero | `Skill('saas-build')` |
| Find and fix issues across whole product (security/perf/UX/SEO/code health) | `Skill('saas-improve')` |
| **Vastly improve a generic landing without wiping** | **`Skill('web-evolve')`** |
| Add one new page | `Skill('web-page')` |
| Fix one specific bug | `Skill('web-fix')` |
| Pre-build design research | `Skill('web-design-research')` |
