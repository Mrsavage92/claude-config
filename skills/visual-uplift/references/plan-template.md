# Plan template

Write Phase 3 output to `.visual-uplift/plan.md` at project root using this exact structure. Any missing section = plan invalid.

```markdown
# Visual Uplift Plan — <project-name>

Generated: <ISO-8601 timestamp>
Target tier: <90 | 95 | 98>
Project context: <one line — ICP, brand category, current quality bar>

## Baseline scores

| Route | vq_aggregate | Worst dimension | Verdict from /critique |
|---|---|---|---|
| <route1> | <0-5> / 5 | <dimension> (<score>) | <REFINE | KEEP | (skipped REBUILD)> |
| ... | ... | ... | ... |

## Ranked items

(Each item must have: tag, sizing, issue, tool, expected delta, memory check, risk.)

### Item N — [Quick | Medium | Big swing] · ~<N> min
**Issue:** <one-line issue from Phase 1, with the dimension score that triggered it>
**Tool:** `Skill('X')` OR `mcp__magic__Y` OR manual <description>
**Brief to pass to the tool:** <one paragraph of what to do, with reference if applicable>
**Expected delta:** <dimension> <baseline> → <target>; <secondary dimension> <baseline> → <target>
**Memory check:** PASSED | ⚠ FLAGGED (<rule citation>)
**Risk:** None | banned-default | requires-credentials | ...

(Items flagged ⚠ get `requires_opt_in: true` and a quoted rule line.)

## Recommended order

1. <item N> — <one-line rationale, e.g. "foundation; type underpins everything else">
2. <item M> — <rationale>
...

## How to proceed

- To execute the full plan: `/visual-uplift go`
- To execute a subset: `/visual-uplift go --items 1,2,3`
- To override a flagged item: `/visual-uplift go --accept-banned-defaults`
- To revise: tell me what to change about the plan.
```

## Quality bar — the plan PASSES gating if:

1. Every route in Phase 1 appears in the baseline scores table.
2. Every item has all six fields (tag, sizing, issue, tool, expected delta, memory check, risk).
3. Sizing tags map to AI wall-clock: Quick 5-10 min, Medium 15-30 min, Big swing 40-90 min. No days/weeks.
4. No banned phrases in the plan body (premium, comprehensive, world-class, etc. — see memory-rules.md).
5. Every ⚠ FLAGGED item quotes a specific rule line (file + line number from the memory file).
6. Recommended order is justified per-item, not just numbered.
7. The "How to proceed" footer is present verbatim.

## Quality bar — the plan FAILS if:

- Empty or missing baseline scores section.
- Any item missing the Memory check field.
- Any banned phrase from memory-rules.md present.
- Any size estimate in days/weeks/sprints.
- Any recommendation to add a custom cursor on a service-business brand without `requires_opt_in: true`.
- Any recommendation that routes to /web-page for a structural REBUILD (that's not visual-uplift's job — surface the issue but do NOT add it to the plan).

If FAILED, rewrite before showing to the user.
