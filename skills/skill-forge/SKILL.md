---
name: skill-forge
description: Brutally honest skill reviewer and rebuilder. Reviews an existing skill against its actual output (not its prose), spawns an independent scoring agent that hasn't read the skill, sources external implementations from the wild, and rebuilds to a verified score — not a self-claimed one. Use when a skill underperforms, when reviewing your own skills before shipping, or when a fresh conversation scored a skill lower than this one. Triggers — "review this skill", "is this skill any good", "/skill-forge", "fix /<skillname>", "rebuild skill", "make this skill actually work".
argument-hint: "<skill-name> [mode: review | forge]"
---

# Skill Forge — Honest Skill Reviewer & Rebuilder

This skill exists because the same Claude that writes a skill cannot honestly grade it. Self-rating inflates by 2–4 points on a 10-scale ([[feedback_no_self_quality_claims]], [[feedback_taste_calibration]]). This skill forces the grade to come from an agent that has never seen the skill, scored against its actual artifact, not its own prose.

Two modes:
- **review** — score honestly, stop. Returns score + deductions + sourced gap list.
- **forge** — review → source externally → rebuild → re-verify until a fresh agent confirms the target score, or HALT with `NEEDS_HUMAN`.

Default: `forge`. Review-only is `mode: review`.

---

## When to use

- A skill produced output that didn't work, but my prior review called it good
- A fresh chat scored a skill 4/10 that I scored 8/10
- Before shipping any new skill or major skill revision
- Auditing your skill library for self-flattery (`/skill-forge <skill> mode: review`)

## When NOT to use

- The skill is a tiny one-screen helper with no orchestration — overkill
- The skill has never been run on a real input — run it first, then forge
- **You are CREATING a new skill from scratch** — use `Skill('skill-creator')` instead. Skill-creator runs a dual-run benchmark (WITH vs WITHOUT the skill) and assertion grading, which is the correct pre-ship gate. Skill-forge is the post-hoc audit + rebuild tool, not the authoring tool.

## Relationship to skill-creator

- **skill-creator** (Anthropic's official) — authoring + benchmark loop. Use it FIRST whenever a new skill is needed.
- **skill-forge** (this skill) — independent post-hoc audit + rebuild for skills that escaped the benchmark gate or have degraded since.
- Both must agree before a skill is considered shippable: skill-creator's benchmark.json shows positive delta vs baseline, AND skill-forge's independent reviewer scores ≥ target. Either one failing = HALT.

---

## Cardinal rules (load-bearing)

1. **The reviewer agent has never seen the skill or this conversation.** I do not score. Ever. If I score, this skill has failed.
2. **Score the artifact, not the SKILL.md.** "Comprehensive review" prose is not output. Run the skill on a real input first.
3. **External sourcing is mandatory before rebuild.** ≥3 cited external implementations from outside this config. No sourcing = no rebuild = HALT.
4. **Banned phrases** in the skill, in the rubric, in the rebuild: `comprehensive, robust, production-ready, world-class, premium, perfect, 10/10, shit hot, epic, best-in-class, enterprise-grade, battle-tested`. If any appear in my own output, strip them. Pairs with [[feedback_no_self_quality_claims]].
5. **Default score is zero.** Every point earned must cite specific evidence (file:line, output excerpt, external pattern reference). Unjustified points are deductions.
6. **WebSearch / WebFetch unavailable → HALT.** Do not rebuild from training-data assumptions about how others do it. Pairs with [[feedback_verify_from_source_of_truth]].

---

## Phase 0 — Free lint pass (mandatory, blocks everything; cost: ~1 second)

Before spending money on the independent reviewer or rebuild loop, run the free lint tier:

```bash
python ~/.claude/skills/skill-forge/scripts/lint_skill.py <path-to-skill>
```

This catches the ~80% of issues that don't need an LLM: invalid frontmatter, banned-phrase hits (forces FAIL per rubric anyway), broken `Skill('X')` references, oversized SKILL.md, weak description triggers. Exit codes: 0 = clean, 1 = warnings, 2 = blocking errors.

**If exit 2 (errors):** STOP. Fix the errors first. There's no point spawning an expensive scoring agent against a skill that fails structural checks — the agent will deduct for the same things and you'll have paid for the privilege.

**If exit 1 (warnings) or 0:** continue to Phase 0.5.

## Phase 0.5 — Spec capture (mandatory, blocks everything)

Before any review or rebuild, capture from the user:

1. **What is this skill supposed to produce?** One sentence, output-focused. "A scored audit report PDF" not "comprehensive audit guidance."
2. **What broke?** Concrete failure: which input, what came out, why it was wrong. If the user can't name one, ask: "Run it once on a real input and paste the output — I'll review from that."
3. **Target score.** Default 90/100. The user can lower it ("just get it to 70, it's a helper").
4. **Constraints.** Length cap, dependencies, MCP availability, must-haves the user already decided.

Write the captured spec to `~/.claude/skills/<skill-name>/.forge-spec.md`. Every later phase reads this file. If a phase wants to drift from the spec, it must update the spec first with a one-line reason.

---

## Phase 1 — Produce a real artifact

The skill is reviewed by what it produces, not what it says.

1. Read the skill's SKILL.md to understand entry points.
2. Invoke the skill via `Skill('<name>', args=<realistic input>)` — the input must come from the user's actual workflow, not a contrived example.
3. Capture the full output. Save to `~/.claude/skills/<skill-name>/.forge-artifact.md` (or `.html`, `.pdf`, whatever it produced — note path).
4. If the skill cannot run end-to-end in this environment, document the gap precisely and HALT with `NEEDS_HUMAN: cannot produce artifact, reason X`. Do not proceed on a synthetic example.

---

## Phase 2 — Independent scoring (the load-bearing anti-cheat)

**Before spawning the agent**, lint your prompt with:

```bash
python ~/.claude/skills/skill-forge/scripts/lint_reviewer_prompt.py --string "<your full prompt>"
```

If the linter exits 1 (priming detected), rewrite the prompt. Phrases like "re-verification after fixes", "credit demonstrated improvements", or "should now PASS" bias the reviewer to confirm the outcome you want. See [[feedback_never_prime_reviewers]] — this rule exists because priming a reviewer on 2026-05-17 produced a false 95/PASS verdict when the cold truth was 56/FAIL with 3 unfound showstoppers.

Spawn a `general-purpose` Agent with this exact briefing pattern. The agent receives:

- `.forge-spec.md` (the success criteria)
- `.forge-artifact.md` (the actual output)
- `references/rubric.md` (the scoring rubric — read by the agent, not me)
- The skill's frontmatter `description` (the skill's own claim of what it does — so the agent can check claim-vs-reality)

The agent does NOT receive:
- The SKILL.md body (so it cannot grade the prose)
- This conversation
- My opinion
- Any prior score

The agent returns:
```json
{
  "total": <int 0–100>,
  "dimensions": {"<dim>": {"score": <int>, "max": <int>, "evidence": "<excerpt>", "deduction_reason": "<if not full marks>"}},
  "blocking_issues": ["<issue with file:line or output excerpt>", ...],
  "banned_phrase_hits": ["<phrase> at <location>", ...],
  "verdict": "PASS | FAIL"
}
```

PASS means `total >= target` AND `banned_phrase_hits == []` AND `blocking_issues == []`. Any one of those triggers FAIL.

Read `references/rubric.md` for the full 7-dimension scoring grid. Read `references/anti-cheats.md` for the briefing template that prevents agent flattery.

---

## Phase 3 — External sourcing (skip in `mode: review`)

Spawn a second `general-purpose` Agent with WebSearch + WebFetch. Brief it to find ≥5 external implementations of a skill that does what this skill claims to do.

Required sources (cast wide, do not stop at the first GitHub hit):
- GitHub: `anthropics/claude-cookbook`, `obra/claude-skills`, `simonw/llm`, `cline/cline`, `aider-ai/aider`, `Codium-ai/cover-agent`, agent-frameworks, MCP server repos
- Blog posts / newsletters from Anthropic, Simon Willison, Latent Space, Every, Hugging Face
- HackerNews / r/LocalLLaMA threads where practitioners share what works
- Published prompting guides (Anthropic docs, prompt engineering guide)

For each source, extract:
- **Pattern**: the concrete mechanism (e.g. "uses a separate evaluator LLM with no access to the producer's reasoning")
- **Anti-pattern**: what they explicitly call out as wrong
- **Code/prompt excerpt**: the actual artifact, not a paraphrase
- **URL**: live link

Output: `~/.claude/skills/<skill-name>/.forge-sources.md` — ≥5 sources, each with all four fields. Fewer than 5 = HALT with `NEEDS_HUMAN: insufficient external sourcing`.

Read `references/external-sources.md` for the briefing template and source-quality bar.

---

## Phase 4 — Gap diff

I do this in the main thread, reading `.forge-sources.md` and the current SKILL.md.

For each external source, list:
- **Pattern present in source, absent in current skill** → add to rebuild
- **Anti-pattern current skill commits** → strip in rebuild
- **Mechanism source uses that current skill paraphrases instead of invokes** ([[feedback_skill_pipeline_no_self_synthesis]]) → wire it as a real Skill/Agent/Tool call

Output a one-page gap table to `~/.claude/skills/<skill-name>/.forge-gaps.md`. Format: `| Source | Pattern | Currently in skill? | Action |`.

---

## Phase 5 — Rebuild

Rewrite SKILL.md following `references/rebuild-loop.md`. Constraints:

- Every meaningful section cites a source from `.forge-sources.md` (`# source: <url>` inline comment OK).
- Banned phrases stripped — search-and-strip before writing.
- No adjectives about the rebuild's quality. Describe what it does, not how good it is.
- Sub-skill invocations are real `Skill('X')` calls, not paraphrased instructions.
- Anti-patterns section lists ≥3 specific failure modes observed in Phase 2 deductions or Phase 4 gap diff.
- File under 500 lines / 10 KB. Heavy content goes to `references/`.

Preserve the user's frontmatter description trigger phrases — do not rewrite the description in a way that changes when the skill fires.

---

## Phase 6 — Re-verify (fresh agent, same rubric)

Re-run Phase 1 (produce artifact with rebuilt skill) → Phase 2 (independent score).

**The Phase 6 scoring agent is a different `general-purpose` agent than Phase 2's.** Do not send Phase 2's agent the new artifact — it has already anchored on the first version.

If `verdict == PASS`: write `.forge-result.md` with before/after scores, sources cited, gap-diff actions taken. Done.

If `verdict == FAIL`: feed the deduction list back into another rebuild iteration. **Maximum 3 rebuild loops.** After 3 fails, HALT with `NEEDS_HUMAN: cannot reach target after 3 forge cycles. Deductions remaining: ...`.

---

## Output artifacts

| File | Phase | Purpose |
|---|---|---|
| `.forge-spec.md` | 0 | Success criteria — every later phase reads this |
| `.forge-artifact.md` | 1, 6 | Real output from running the skill |
| `.forge-score.md` | 2, 6 | Independent agent's score JSON |
| `.forge-sources.md` | 3 | ≥5 external references with patterns |
| `.forge-gaps.md` | 4 | What the skill is missing vs sources |
| `.forge-result.md` | 6 | Final before/after diff + verdict |

All written under `~/.claude/skills/<skill-name>/` so they live with the skill and can be re-read on next forge cycle.

---

## Anti-patterns (do NOT do these)

- **Scoring the skill myself.** Always spawn an independent agent. If I'm tempted to "estimate the score real quick" — STOP, that's the failure mode this skill exists to prevent.
- **Reviewing the SKILL.md prose instead of the artifact.** A skill that says "produces a comprehensive audit" has produced nothing. Run it first.
- **Rebuilding from "what I think good looks like."** That's how generic skills happen. Phase 3 external sourcing is non-negotiable.
- **Hitting target on iteration 1 and stopping.** Re-verify with a fresh agent. The first agent has anchored.
- **Using banned self-praise phrases anywhere** in spec, rubric, sources, gaps, rebuild, or result. Search-and-strip before writing each file.
- **Skipping Phase 3 because "I already know how others do it."** I have a 1.5 year stale view of how others do it. Pairs with [[feedback_verify_from_source_of_truth]].
- **Inflating the rubric to make scores feel good.** Default low. Earn every point.
- **Producing a synthesised "review" instead of invoking the scoring agent.** Pairs with [[feedback_skill_pipeline_no_self_synthesis]].

---

## Related skills

- Use `/critique` for design output review (frontend pages, components) — different domain.
- Use `/self-audit` for harness-wide structural audit — that's about config, not a specific skill.
- Use `/usage-report` to find which skills are actually getting invoked before deciding what to forge.
- Use `/sync-knowledge-base` after a successful forge to push the rebuilt skill to the shared config repo.

Do NOT use this skill for:
- Reviewing PRs / code → `/review`, `pr-review-expert`
- Reviewing entire harness → `/self-audit`
- Designing a brand-new skill from scratch → that's authoring, this is forging.
