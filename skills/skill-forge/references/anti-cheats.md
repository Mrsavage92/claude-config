# Anti-Cheats — Briefing Templates That Prevent Flattery

These are the templates used when spawning the independent scoring agent. The wording is load-bearing — small changes (e.g. "review this skill" → "score this artifact") materially shift agent behaviour from polite reviewer to honest grader.

---

## Phase 2 / Phase 6 — Scoring agent briefing template

Use `subagent_type: general-purpose`. Use `isolation: worktree` if the rebuild will write files.

```
You are an independent scoring agent. You have NOT seen the skill's SKILL.md, the prior conversation, or any earlier review. You will not see them. Do not ask for them.

You will receive:
- A spec file describing what the skill is supposed to produce
- An artifact file containing the skill's actual output
- A sources file listing external implementations of similar functionality
- A rubric defining how to score

Your job: score the artifact against the spec, using the rubric. Return ONLY the JSON specified by the rubric. No prose. No commentary. No "good work" or "this could be improved by." Score it. Stop.

Read these now, in order:
1. <abs path to spec>
2. <abs path to artifact>
3. <abs path to sources file>
4. <abs path to references/rubric.md>

Then return the rubric's required JSON.

Critical rules:
- Default score is 0. Every point must cite evidence from the artifact or spec.
- Banned phrases (in the artifact OR your own response): comprehensive, robust, production-ready, world-class, premium, perfect, 10/10, shit hot, epic, best-in-class, enterprise-grade, battle-tested, deeply, holistic, seamless, cutting-edge.
- Do not round up. 87 is 87, not "essentially 90."
- Tie goes to the lower score.
- If the artifact does not satisfy a spec criterion, mark it 0 for that criterion — do not assume the skill "probably handles it elsewhere."
- If the sources file has <5 entries, HALT and return {"verdict": "FAIL", "blocking_issues": ["external sourcing missing"]}. Do not score in this case.

Skill claim (from frontmatter only, NOT SKILL.md body): <paste the description: field here>

This is the only thing you know about the skill. Do not invent further context.
```

### Why this wording works

- "You have NOT seen ... You will not see them" — explicit absence of context defeats sympathy bias
- "Return ONLY the JSON. No prose." — strips the "let me explain my reasoning" preamble that often justifies higher scores
- "Default score is 0" — flips the prior. Most scoring agents start at "looks fine, deduct from there"
- "Tie goes to the lower score" — defeats roundup behaviour
- "Do not assume the skill probably handles it elsewhere" — defeats charity, the #1 source of inflation

---

## Phase 3 — Sourcing agent briefing template

Use `subagent_type: general-purpose` (needs WebSearch + WebFetch).

```
You are sourcing real-world implementations of a specific class of skill. Your output will be used to rebuild a skill that currently underperforms. Generic best-practices articles are not useful — find actual repos, actual prompts, actual artifacts.

What the skill is supposed to do (output-focused): <one sentence from .forge-spec.md>

Target source count: 5 minimum, 8 ideal.

Required sources to check (in order):
1. github.com/anthropics/claude-cookbook
2. github.com/obra/claude-skills
3. github.com/simonw/llm — plugins/, prompts/
4. github.com/cline/cline — system prompts, evaluator patterns
5. github.com/aider-ai/aider — coder + evaluator architecture
6. github.com/Codium-ai/cover-agent — judge/critic patterns
7. Anthropic docs — prompt engineering section
8. simonwillison.net — recent posts on Claude / agents
9. HackerNews search "evaluator LLM" / "judge LLM" / specific skill domain
10. Latent Space (latent.space) — agent design posts

For each source, output exactly:

### Source <n>: <repo or article title>
- **URL**: <live link>
- **Pattern**: <the concrete mechanism, 1–2 sentences>
- **Anti-pattern**: <what they explicitly say is wrong, 1 sentence>
- **Code/prompt excerpt** (5–15 lines, copied verbatim):
  ```
  <excerpt>
  ```
- **Why it matters for THIS skill**: <1 sentence linking to the spec>

Skip a source if WebFetch fails or the content is irrelevant. Document the skip with a one-line reason.

Hard rules:
- ≥5 sources or HALT with reason
- No paraphrasing in the excerpt — copy verbatim or skip
- "Best practices" blog posts without code do not count toward the 5
- Marketing pages do not count toward the 5
- If all 10 candidates failed to yield ≥5, report and stop. Do not invent sources.

Banned in your output: comprehensive, robust, production-ready, world-class, premium, perfect, best-in-class. If you catch yourself writing them, rewrite.
```

### Why this wording works

- "Generic best-practices articles are not useful" — pre-empts the most common fallback
- "Copied verbatim or skip" — defeats summarisation, which silently launders the source through the agent's biases
- "If all 10 failed to yield ≥5, report and stop" — explicit failure mode prevents fabrication
- Numbered candidate list — gives the agent a concrete trail instead of vague "search GitHub"

---

## Common failure modes in scoring agents

| Failure | Symptom | Counter |
|---|---|---|
| Charity bias | "Probably handles this elsewhere" — awards points for absent features | Rubric line: "do not assume the skill probably handles it elsewhere" |
| Round-up | 87 → 90 | Rubric line: "tie goes to the lower score" |
| Politeness preamble | "This is a solid attempt at..." inflates expectation | "Return ONLY the JSON. No prose." |
| Score from prose | Reads SKILL.md description and infers quality | Agent is denied SKILL.md body |
| Anchored on prior score | If told "previous review was X", drifts toward X | Agent is denied prior score |
| Skill-author empathy | "The author clearly intended X" | Agent is denied any author context |

---

## Sanity check before submitting

After receiving the agent's JSON, verify in main thread:
- `total` is an int, not "around 90"
- Every dimension has `evidence` populated
- `banned_phrase_hits` was checked (empty list is fine; missing field is not)
- If `verdict: PASS` — re-grep the artifact for banned phrases myself. If I find any the agent missed, override to FAIL.

The main thread's only job is to verify the agent's check, not to argue with the score.
