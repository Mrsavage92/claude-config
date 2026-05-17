# External Sources — Where to Look, Quality Bar

Read this in Phase 3 before spawning the sourcing agent. The briefing template lives in `anti-cheats.md`; this file is the candidate map.

---

## Tier 1 — Repos with real skill/prompt artifacts (start here)

| Source | Why | What to extract |
|---|---|---|
| `anthropics/claude-cookbook` | Official patterns | Tool use, evaluator loops, multi-agent |
| `obra/claude-skills` | Community skills with structure | SKILL.md patterns, multi-mode workflows |
| `anthropics/anthropic-quickstarts` | Reference implementations | Project structure, prompt patterns |
| `simonw/llm` + plugins | Production agent infra | Templates, command structure |
| `cline/cline` | Production coding agent | Evaluator/judge patterns, plan-execute loops |
| `aider-ai/aider` | Long-running real-world use | Coder + reviewer split, repo-map, retry loops |
| `Codium-ai/cover-agent` | Test-gen with evaluator | Judge prompt structure |
| `langchain-ai/langgraph` | Agent graph patterns | State machine, evaluator nodes |
| `microsoft/autogen` | Multi-agent reference | Critic agents, group-chat patterns |
| `microsoft/promptflow` | Eval-driven prompt dev | LLM-as-judge patterns |

## Tier 2 — Curated prompt collections

| Source | Why |
|---|---|
| `dair-ai/Prompt-Engineering-Guide` | Survey of techniques with citations |
| `f/awesome-chatgpt-prompts` | Wide net; cherry-pick the role-specific ones |
| Anthropic prompt library (docs.anthropic.com/prompt-library) | Official, vetted |

## Tier 3 — Practitioner writeups

| Source | Why |
|---|---|
| `simonwillison.net` | Daily LLM practitioner, code-first |
| `latent.space` | Agent design deep dives |
| `every.to/p/...` (Dan Shipper) | Builder perspective |
| HackerNews — search the skill's domain | What practitioners say works/breaks |
| `r/LocalLLaMA`, `r/PromptEngineering` | Failure stories |

## Tier 4 — Domain-specific (varies by skill being forged)

If forging a code-review skill, also check:
- `getgrit/marzano` patterns
- `github/copilot-workspace` writeups
- `coderabbit-ai` blog

If forging a UI-critique skill, also check:
- `vercel/v0` evaluation criteria
- Design system docs (Material, Apple HIG) for evaluation rubrics
- `growthbook` and similar A/B platforms — visual diff patterns

If forging an audit/scoring skill, also check:
- `securego/gosec` rule architecture
- `eslint` rule documentation patterns
- `lighthouse` audit category structure

---

## Quality bar — what counts as a "source"

Count toward the ≥5 minimum:
- A repo with concrete SKILL.md, prompt file, or evaluator implementation
- An article with copy-pasteable prompts or code blocks
- A documented rubric / scoring system used in production

Does NOT count:
- "Best practices" listicles with no code
- Marketing pages
- Tweet threads without permalink artifacts
- Generic "how to write a good prompt" articles
- A repo's README that paraphrases without showing the artifact

---

## Source-quality red flags

If a "source" matches any of these, demote or reject:
- Posted before 2024 — likely pre-Claude 3 / pre-modern tool-use patterns
- Generated-content site (auto-translated blog spam, AI-generated articles with no author)
- Single author, no production deployment, no GitHub stars/forks evidence
- Says "the secret to X" / "10 prompts that will" — marketing veneer

---

## Output file structure (`.forge-sources.md`)

```markdown
# External Sources — <skill name>

Spec referenced: <one-line spec summary>
Sourced on: <date>
Agent: <subagent_type used>

## Sources (5+ required)

### Source 1: <repo / title>
- **URL**: <link>
- **Pattern**: <2 sentences>
- **Anti-pattern**: <1 sentence>
- **Excerpt** (verbatim, 5–15 lines):
  ```
  ...
  ```
- **Relevance**: <1 sentence linking to spec>

### Source 2: ...

...

## Skipped candidates
- <URL> — <reason>
- ...

## Summary patterns (read in Phase 4)
- Pattern A: <appears in sources 1, 3, 7>
- Pattern B: <appears in sources 2, 4>
- Anti-pattern X: <called out in sources 1, 5, 6>
```

The Phase 4 gap-diff step uses this summary section to identify which patterns the current skill is missing.
