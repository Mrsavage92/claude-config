# Phase 5 — Quality Gate (impeccable sweep → review-fix loop)

Two stages. Both are mandatory. Do not skip to the review loop.

## Stage 5a — Impeccable final sweep

Run before the first web-review score. This is the whole-product design pass — catches cross-page inconsistencies that per-page sweeps in Phase 4c.5 cannot see.

Run all five in parallel:

- `Skill("polish")` — final micro-detail pass: alignment, spacing consistency, icon sizing, border radius uniformity
- `Skill("typeset")` — cross-page typography audit: heading scale consistent, body weight consistent, no orphaned font choices
- `Skill("colorize")` — cross-page color audit: accent used consistently, no rogue grays, contrast passing everywhere
- `Skill("animate")` — motion audit: transitions feel intentional, no jarring jumps, reduced-motion respected
- `Skill("distill")` — complexity audit: remove anything that doesn't earn its space, simplify over-engineered sections

Collect all findings. Categorise: APPLY NOW (blocks ship quality), LOG TO GAP-REPORT (nice-to-have).

Apply all APPLY NOW findings. Commit: `refactor: phase 5 impeccable sweep — [N] improvements applied`.

Then run `Skill("impeccable")` as a final gate check. It should confirm the product meets production-grade design quality. If it flags CRITICAL issues: fix them before proceeding to Stage 5b.

Log: "Phase 5a complete — impeccable sweep done, [N] issues applied" to BUILD-LOG.md.

### Phase 5a completion gate (transcript-verifiable — do not self-grade)

Phase 5a cannot be marked complete unless THIS conversation's tool-call log contains tool calls for ALL of:

- [ ] `Skill('polish')`
- [ ] `Skill('typeset')`
- [ ] `Skill('colorize')`
- [ ] `Skill('animate')`
- [ ] `Skill('distill')`
- [ ] `Skill('impeccable')` (final gate-check invocation)

If any are missing → re-invoke the missing skills. Self-review against a 13-item checklist is NOT a substitute. Writing "self-assessed 38/40" without these tool calls in the transcript is a phase failure (see AuditHQ v2 retro, April 2026).

## Stage 5a.5 — Lock Conformance Sweep (only if replication mode)

Run ONLY if `tokens.lock.json` exists at the project root. Otherwise skip directly to Stage 5b.

The lock-conformance sweep catches drift between the hero (built first, lock fresh in context) and later sections / pages (built last, lock recall stale). Visual self-diff at section boundaries can miss whole-product drift; this sweep makes it measurable at render-time.

### Procedure

1. Read `tokens.lock.json` and capture the full token set.
2. Use `mcp__puppeteer__puppeteer_navigate` to load the running dev server.
3. For every route in `SCOPE.md`, run `mcp__puppeteer__puppeteer_evaluate` to extract computed styles for these selectors and properties:

   | Selector | Properties to capture |
   |---|---|
   | `body` | `font-family`, `background-color`, `color` |
   | `h1` | `font-family`, `font-weight`, `font-size`, `letter-spacing` |
   | `h2` | `font-family`, `font-weight`, `font-size` |
   | `[data-cta="primary"]`, `button.primary`, first `<button>` | `background-color`, `color`, `border-radius`, `font-family` |
   | `nav`, `header > nav` | `background-color`, `backdrop-filter` |
   | `a` | `color` |

4. For every signature element in `lock.signature_elements` set to `false`, scan the rendered DOM for proof of injection:
   - `gradient_mesh: false` → no element should have `background-image` containing `radial-gradient(at ...)` with multiple stops
   - `glassmorphism: false` → no element should have `backdrop-filter` set to anything but `none`
   - `grid_lines: false` → no element should have a 1px linear-gradient repeating pattern
   - `gradient_text: false` → no element should have `-webkit-background-clip: text`

5. Compute a per-page conformance score:
   - +1 point per matching token (color, font, radius)
   - −1 point per signature-element violation
   - Express as percentage of the maximum possible

6. Aggregate across all pages. Output to `LOCK-CONFORMANCE.md`:

   ```markdown
   # Lock Conformance Report — {project}
   Lock: {tokens.lock.json captured_at}
   Pages tested: {N}

   | Page       | Score | Violations |
   | ---------- | ----- | ---------- |
   | /          | 100%  | none |
   | /dashboard | 67%   | h1 font-family is "Inter" (lock: "Mona Sans"); .stat-card has backdrop-filter (lock: false) |

   Overall: 84% conformant
   ```

7. **Halt rule:** if overall conformance < 90%, HALT Phase 5 and do NOT proceed to Stage 5b. Output the violations and require they be fixed (likely via `/web-fix` per failing page) before re-running the sweep.

### Why this exists

Style-mirror writes the lock; downstream skills now read it (per 2026-04-28 audits). The `tokens-lock-enforce.ps1` PreToolUse hook catches violations at write-time. This sweep catches violations at render-time, which catches:
- A correct token written but later overridden by a more specific selector
- A font-family set in CSS but the @import is missing, so the browser falls back
- A child component's inline style overriding the token system
- Drift compounding across pages built late in the session

This is the difference between "the code says X" and "the user sees X." All three layers (writer / hook / sweep) together turn replication from self-discipline into self-enforcement.

---

## Stage 5b — web-review loop

**Scoring note:** `/web-review` scores x/40 — visual + a11y + performance. Different from `/review` (x/100) which covers security and correctness. Use web-review here. Optionally run /review separately — its score does not gate deploy.

Loop until score ≥ 38 or 5 attempts:

1. Run `/web-review` in full — outputs `Overall: [X]/40`
2. Record score and list every failure
3. If score ≥ 38 AND pre-deploy checklist fully green: exit loop, proceed to Phase 6
4. If score < 38 OR any pre-deploy checklist item is red: run `/web-fix` per failure, commit `fix: quality gate — [N] issues resolved`, return to step 1
5. After 5 attempts still < 38: log STUCK with exact failures and current score. STOP — do not proceed to Phase 6.

**Never skip this loop.** A low score is a task list, not a delay.

Log each iteration: "Phase 5b attempt [N] — score [X]/40 — [N failures] remaining" to BUILD-LOG.md.

---
