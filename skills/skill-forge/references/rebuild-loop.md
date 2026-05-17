# Rebuild Loop — Constraints for Phase 5

Read this before rewriting SKILL.md. The constraints are non-negotiable; violation = re-verify failure in Phase 6.

---

## Inputs (must read in this order)

1. `.forge-spec.md` — user's success criteria
2. `.forge-score.md` — Phase 2 deductions (every deduction is a rebuild target)
3. `.forge-sources.md` — external patterns to apply
4. `.forge-gaps.md` — pattern-vs-current diff with actions
5. Current `SKILL.md` of the target skill — to preserve trigger phrases

If any of these is missing → HALT. Do not rebuild from partial context.

---

## Frontmatter constraints

- Preserve the trigger phrases in `description`. Removing them changes when the skill fires.
- If the description includes adjective bloat (`comprehensive`, `production-grade`, etc.), strip those words but keep the trigger phrases intact.
- Keep `name` unchanged.
- `argument-hint` may be added/refined if the spec calls for arguments.

---

## Body constraints

### Length
- Body ≤ 500 lines OR 10 KB, whichever hits first
- If the body wants more, move detail to `references/<topic>.md` and reference it in the phase that needs it

### Structure (in order)
1. One-paragraph role statement — what the skill produces (output-focused, not "helps with")
2. When to use / When NOT to use — two short bullet lists
3. Cardinal rules — load-bearing constraints, numbered, 4–8 rules max
4. Phase 0 — Spec/input capture (every non-trivial skill has this)
5. Phases 1..N — each phase is a section with: purpose, inputs, action, output artifact
6. Output artifacts table
7. Anti-patterns — ≥3, each tied to a Phase 2 deduction or Phase 4 gap, NOT generic advice
8. Related skills

### Citation requirement
- Every cardinal rule cites a source: `# source: <url-or-slug>` inline OR a "pairs with [[memory-slug]]" link
- Every phase that uses an external pattern names the source
- Anti-patterns reference the Phase 2 deduction that motivated them: `# from forge: <deduction line>`

### Banned content (search-and-strip before saving)
- Banned phrases: `comprehensive, robust, production-ready, world-class, premium, perfect, 10/10, shit hot, epic, best-in-class, enterprise-grade, battle-tested, deeply, holistic, seamless, cutting-edge`
- Self-praise about the rebuild itself ("now produces a complete...")
- Adjective stacks ("clear, concise, actionable")
- Tense bloat: "will then proceed to..." → "next: ..."
- "In order to" → "to"; "utilise" → "use"; "in the process of" → cut
- Marketing voice: any sentence that could appear in a SaaS landing page is wrong here

### Required content (each phase)
- Real `Skill('X')`, `Agent(...)`, `Bash(...)` invocations where the original skill paraphrased
- Concrete failure path (`HALT with NEEDS_HUMAN: <reason>`) for every "if this isn't available" branch
- Output file path where the phase writes its artifact

---

## Pattern → action mapping

When applying an external source pattern, the rebuild must:

| Source pattern | Rebuild action |
|---|---|
| Evaluator agent with no producer context | Phase 2/6 already does this — verify retained |
| Verbatim excerpt as briefing | Update briefing template in `anti-cheats.md` if better wording found |
| Phase-gated state file | Add to output artifacts table, reference in phase entry conditions |
| Banned-phrase list | Merge into our list; strip duplicates |
| Plan-execute split | Verify Phase 0 → Phase 5 ordering preserves this |
| Retry-on-fail with budget | Phase 6 already has max 3 cycles; verify the cycle counter persists |

---

## After writing

Before declaring rebuild complete:

1. **Grep my own output** for banned phrases:
   ```
   Grep("comprehensive|robust|production-ready|world-class|premium|perfect|10/10|shit hot|epic|best-in-class|enterprise-grade|battle-tested|deeply|holistic|seamless|cutting-edge", file)
   ```
   If any hits → strip and rewrite that section. Do not proceed.

2. **Count lines**: SKILL.md > 500 → move content to references/. Re-check.

3. **Verify Skill calls are real**: every `Skill('X')` in the body must reference a skill that exists in the user's skill list. Paraphrased "use the audit skill" must become `Skill('audit')` or be removed.

4. **Verify HALT paths**: every "if external sourcing unavailable" / "if MCP not connected" / "if API key missing" branch produces a `NEEDS_HUMAN` halt with a specific reason. No silent fallbacks.

5. **Cross-reference Phase 2 deductions**: every blocking_issue from the score should map to a rebuild change. If a deduction has no corresponding change, the rebuild is incomplete.

6. **Verify references files exist** if the rebuilt SKILL.md instructs to read them.

---

## Phase 6 re-verification — what changes between iterations

If iteration 1 PASS → done.

If iteration 1 FAIL:
- Read the new `.forge-score.md` deductions
- Targeted edits only — do not rewrite sections that scored full marks
- Spawn a DIFFERENT general-purpose agent for iteration 2 scoring (cache invalidation)
- If iteration 2 FAIL → iteration 3
- If iteration 3 FAIL → HALT with `NEEDS_HUMAN: 3 forge cycles exhausted. Remaining deductions: <list>. Likely root cause: <one sentence>. Recommend: <user action>.`

Do not spin a 4th iteration without explicit user instruction.
