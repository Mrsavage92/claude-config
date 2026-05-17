# Forge Result — <skill name>

**Date**: <yyyy-mm-dd>
**Mode**: review | forge
**Target score**: <int>/100
**Final verdict**: PASS | FAIL | NEEDS_HUMAN

---

## Spec (Phase 0)

<paste from .forge-spec.md>

---

## Before — Initial scoring (Phase 2)

**Total**: <int>/100 — verdict: <PASS | FAIL>

| Dimension | Score | Max | Top deduction |
|---|---|---|---|
| Output existence | x | 10 | ... |
| Spec alignment | x | 20 | ... |
| External-pattern alignment | x | 20 | ... |
| Anti-pattern absence | x | 15 | ... |
| Verifiability | x | 10 | ... |
| Failure-mode coverage | x | 15 | ... |
| Honest self-bound | x | 10 | ... |

**Blocking issues**:
- ...

**Banned phrase hits**:
- ...

---

## Sourcing (Phase 3, forge mode only)

<count> external sources collected. Top patterns:

1. **<Pattern A>** — sources <urls>
2. **<Pattern B>** — sources <urls>
3. **<Pattern C>** — sources <urls>

Anti-patterns from sources (avoided in rebuild):
- ...

Full file: `.forge-sources.md`

---

## Gap diff (Phase 4, forge mode only)

| Source | Pattern | Was in skill? | Action taken |
|---|---|---|---|
| ... | ... | no | added to Phase N |
| ... | ... | partial | strengthened in Phase N |
| ... | (anti-pattern) | yes | stripped from Phase N |

Full file: `.forge-gaps.md`

---

## After — Re-verification (Phase 6, forge mode only)

Iterations run: <n>/3

**Final total**: <int>/100 — verdict: <PASS | FAIL>

| Dimension | Score | Max | Δ from before |
|---|---|---|---|
| Output existence | x | 10 | +x |
| Spec alignment | x | 20 | +x |
| External-pattern alignment | x | 20 | +x |
| Anti-pattern absence | x | 15 | +x |
| Verifiability | x | 10 | +x |
| Failure-mode coverage | x | 15 | +x |
| Honest self-bound | x | 10 | +x |

---

## Files changed

- `~/.claude/skills/<name>/SKILL.md` — rewritten, <lines> lines
- `~/.claude/skills/<name>/references/...` — added/updated
- `.forge-*` artifacts retained for audit trail

---

## Notes for next forge cycle

- ...
- ...

---

## If verdict = FAIL or NEEDS_HUMAN

**Root cause analysis** (one paragraph):
...

**Recommended user action**:
- [ ] ...
- [ ] ...
