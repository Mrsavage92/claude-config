# Scoring Engine — how `/web-evolve` computes the score

This file describes how to mechanically execute the checklist in `~/.claude/skills/shared/landing-page-checklist.md` and turn the results into a score.

---

## Per-check execution

For each row in the checklist:

1. **Read the verification method.** Examples:
   - "grep `tailwind.config.ts` for `display:`" → use `Grep` tool with that pattern
   - "Read DESIGN-BRIEF.md, count rows in Component Lock" → use `Read` tool, count
   - "Puppeteer evaluate `document.documentElement.scrollWidth === window.innerWidth`" → use `mcp__puppeteer__puppeteer_evaluate`
   - "Vision check on desktop screenshot" → use `Read` tool on the screenshot file path, inspect visually, name the element

2. **Execute the method.** Capture the actual result (grep output, count, JS return value, vision observation).

3. **Determine PASS / FAIL / N/A.**
   - PASS only if the result matches the proof format defined in the checklist row
   - FAIL if the result violates the check
   - N/A only if the check genuinely doesn't apply (e.g. logo cloud check on a product that's pre-launch with no agency logos to use) AND the reason is documented in DESIGN-BRIEF.md

4. **Record the proof.** Mandatory format:
   ```
   [check-id] [PASS|FAIL|N/A]
     Method: [grep | count | puppeteer | vision]
     Proof: [grep result | numeric count | screenshot path + observation | "N/A because X (DESIGN-BRIEF line Y)"]
   ```

---

## Score computation

```
denominator = total_count - n/a_count - wontfix_count
raw_score = (passed_count / denominator) × 100

# Apply veto caps in order
if any A-category check is FAIL:
  score = min(60, raw_score)
elif any B-category check is FAIL:
  score = min(80, raw_score)
else:
  score = raw_score
```

**Always emit the raw_score AND the final score AND name the check holding the cap if one is active.**

Example output format:

```
Raw: 47/49 = 95.9% (2 N/A, 0 WONTFIX)
Cap: B5 FAIL → 80
Final: 80/100 (raw 95.9% under cap)
Cap-holder reason: "No mcp__magic__21st_magic_component_builder invocations this session."
```

**Transparency rule:** when the cap is active and the raw score is materially higher than the displayed score (delta > 5 points), BOTH numbers MUST appear in the user-facing output for that iteration. This is how iter 2 + iter 3 of AuditHQ v2 retro should have displayed — "80 → 80" hid 8 points of real progress.

---

## Priority queue ordering

When picking which failed check to fix next:

```
priority = (
  veto_severity,        # A-category FAIL = 1000, B-category FAIL = 500, others = 0
  potential_score_gain, # 100 / (total - n/a)  i.e. each PASS = same point gain
  category_alphabetical # A < B < C ... so A breaks ties first
)
```

Sort failed checks by descending priority. Pick top of queue.

---

## Re-scoring after a fix

After a fix is applied + committed:

1. Re-run ONLY the affected category (not the whole checklist) for speed.
2. If the affected category is A or B (veto-bearing), also re-check the veto status.
3. Compute new score.
4. Compare to pre-fix score.

**Decision:**
- new_score > old_score → keep commit, log delta
- new_score == old_score AND target check now PASS → keep (other check may have flipped N/A)
- new_score == old_score AND target check still FAIL → revert (the fix didn't actually fix it)
- new_score < old_score → revert, log REGRESSION, exclude that fix-skill for that check

---

## Per-iteration BUILD-LOG entry

Every iteration MUST emit this block to BUILD-LOG.md:

```markdown
### Evolution iteration N — [timestamp] [mode: backfill | greenfield]
Page: [page]
Target check(s): [check-id] — [check name]  (list all if batch)
Skill(s) invoked: [Skill name + args]  (list all if batch)
Pre-score: [capped]/100 (raw [raw]%)
Post-score: [capped]/100 (raw [raw]%)
Delta capped: [+X / -X / 0]
Delta raw: [+X% / -X% / 0]  ← MUST appear, especially when capped hides progress
Decision: [KEPT | REVERTED | SKIPPED | WONTFIX]
Reason (if REVERTED/SKIPPED/WONTFIX): [text]
Commit: [sha or "(reverted)"]
```

No iteration may be omitted from this log. The audit trail IS the proof.

---

## Batch-edit pattern (same-skill fixes across N files)

When multiple checks in one category route to the same fix skill (e.g. C5 + C7 + C8 all route to `Skill('polish')` or `Skill('colorize')`), or when one check requires the same edit across many files (e.g. B3 provenance headers across 14 landing components):

1. **Group them into a single iteration**, not N iterations.
2. **Fire parallel Edit tool calls** in one message where possible — 14 header comments added in one iter-3 batch is cheaper than 14 separate iterations.
3. **Single commit** summarising all batched fixes — message format: `evolve: iter N — batch fix [check-ids] across [N] files`.
4. **Single re-score** after all batch edits land — not one per file.

This is how AuditHQ v2 iter 3 covered B3 + B6 across 14 files in one iteration with zero regressions. Document in the iteration entry what was batched so the next session sees the pattern.

---

## Vision-check confidence

Checks F4 / F5 / F6 / A9 use Claude-vision inspection of screenshots. They cannot be programmatically verified pixel-by-pixel. Guidance:

- Mark vision checks with `(vision-confidence)` suffix in the receipt
- Include the screenshot file path AND a specific named observation ("5 text sizes visible: hero headline ~88px, eyebrow ~11px, sub ~16px, CTA button ~14px, trust micro ~10px")
- If vision check disagrees with user feedback, user vision wins — re-run the check and update
- Do NOT escalate vision-check PASS to high confidence — known soft spot, treat as advisory

---

## When the loop stops

| Stop condition | Action |
|---|---|
| Overall score ≥ target | Exit Phase C, proceed to Phase D (visual diff log + deploy) |
| All failed checks attempted, no further improvement | Log STUCK with remaining failures, exit |
| Max iterations hit (greenfield 8 / backfill 20) | Log TIMEOUT with current state, exit |
| Same skill failed 3× on same check | Auto-mark check WONTFIX with "skill exhausted" reason, continue with next priority |
| Critical regression (build breaks twice in a row) | HALT, log STUCK, surface NEEDS_HUMAN |
| User marks a check WONTFIX with justification | Log WONTFIX entry, exclude from denominator, continue |

---

## What CANNOT be in the score output

- Adjective-only assessments ("looks much better!", "feels more premium")
- Numbers without category breakdowns
- Numbers without per-check proof
- Comparative claims without baseline + current numbers
- Future tense ("will be 95 once X is done") — only current state

If the output of a `/web-evolve` run contains any of the above, the run has failed even if the score number is high.
