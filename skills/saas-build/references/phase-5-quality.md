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
