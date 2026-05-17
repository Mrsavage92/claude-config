# Forge Spec — <skill name>

**Captured**: <yyyy-mm-dd>
**Mode**: review | forge
**Target score**: <int>/100  (default 90)

---

## What the skill is supposed to produce

<one-sentence, output-focused. e.g. "An HTML audit report with per-suite scores, top 5 findings per suite, and a prioritised action list.">

---

## What broke (the trigger for this forge)

**Concrete failure**:
- Input that was run: <command + args>
- Output that came back: <excerpt or path>
- Why it was wrong: <one sentence>
- Where it was scored differently: <if a prior chat scored it differently>

If no concrete failure yet → run the skill on a real input first. Do not proceed.

---

## Success criteria (each criterion is checkable, output-focused)

1. ...
2. ...
3. ...
4. ...
5. ...

Each must be verifiable from the artifact alone — not from the SKILL.md prose.

---

## Constraints

- **Length cap**: <if any>
- **Dependencies available**: <MCP servers, tools, API keys>
- **Dependencies unavailable**: <so the rebuild does not assume them>
- **Must-haves locked**: <user decisions that the rebuild must respect>
- **Banned approaches**: <patterns the user has already rejected>

---

## Edge cases to cover

The artifact must demonstrate handling of:
- ...
- ...
- ...

Edge cases mentioned only in SKILL.md prose but absent from the artifact will score 0 on Failure-Mode Coverage.

---

## Score-down triggers (user-defined deductions, beyond rubric)

If any of these appear in the artifact, treat as blocking_issue regardless of dimension scores:
- ...
- ...
