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
raw_score = (passed_count / (total_count - n/a_count)) × 100

# Apply veto caps in order
if any A-category check is FAIL:
  score = min(60, raw_score)
elif any B-category check is FAIL:
  score = min(80, raw_score)
else:
  score = raw_score
```

**Always emit the raw_score AND the final score, with veto reason if applied.**

Example output:
```
Raw: 47/50 = 94.0
Veto: A4 FAIL → cap 60
Final: 60/100
```

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
### Evolution iteration N — [timestamp]
Page: [page]
Target check: [check-id] — [check name]
Skill invoked: [Skill name + args]
Pre-score: [N]/100
Post-score: [M]/100
Delta: [+X / -X / 0]
Decision: [KEPT | REVERTED | SKIPPED]
Reason (if REVERTED/SKIPPED): [text]
Commit: [sha or "(reverted)"]
```

No iteration may be omitted from this log. The audit trail IS the proof.

---

## When the loop stops

| Stop condition | Action |
|---|---|
| Overall score ≥ target | Exit Phase C, proceed to Phase D (visual diff log + deploy) |
| All failed checks attempted, no further improvement | Log STUCK with remaining failures, exit |
| Max iterations hit (default 20) | Log TIMEOUT with current state, exit |
| Same skill failed 3× on same check | Mark check WONTFIX, continue with next priority |
| Critical regression (build breaks twice in a row) | HALT, log STUCK, surface NEEDS_HUMAN |

---

## What CANNOT be in the score output

- Adjective-only assessments ("looks much better!", "feels more premium")
- Numbers without category breakdowns
- Numbers without per-check proof
- Comparative claims without baseline + current numbers
- Future tense ("will be 95 once X is done") — only current state

If the output of a `/web-evolve` run contains any of the above, the run has failed even if the score number is high.
