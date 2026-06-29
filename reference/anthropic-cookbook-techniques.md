# Anthropic Cookbook — Techniques Worth Taking (mapped to our stack)

Curated index of the genuinely reusable techniques from [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks) (scanned 2026-06-29, 83 recipes, 41 relevant). The cookbook is notebooks, not installable skills — value is in the *technique*. Each item below = what to take + the source path + how it maps to our products. Pull the notebook only when building the mapped thing.

## 1. Security products (Orbit AI-Exposure-Validation + AuditHQ) — revenue
- **Vulnerability-detection agent** — `claude_agent_sdk/06_The_vulnerability_detection_agent.ipynb`. Threat-models a target, hunts memory-safety bugs via Read/Grep/Glob, writes reviewer-actionable findings. Its whole thesis ("static analyzers produce so many false positives that reviewers stop reading") is the AuditHQ FP problem. → feed into `findings-review` + the audit engine's validation pass.
- **Threat-intelligence enrichment agent** — `tool_use/threat_intel_enrichment_agent.ipynb`. Autonomously investigates IOCs across multiple intel sources, cross-references, maps to **MITRE ATT&CK**, emits structured SIEM/SOAR reports. → directly an Orbit `ai-exposure-validation` engagement capability.

## 2. AuditHQ findings quality / false-positive war — revenue
- **Outcome grader (verify-your-own-work)** — `managed_agents/CMA_verify_with_outcome_grader.ipynb`. Writer drafts a cited brief; a *stateless* grader fetches and grades; revise loop. → the canonical pattern for a findings-validation pass before report render (attacks the exact problem `findings-review` exists for).
- **Citations** — `misc/using_citations.ipynb`. Claude returns source citations for verification. → every AuditHQ finding should carry evidence; this is the API mechanism.
- **Prompt versioning + rollback** — `managed_agents/CMA_prompt_versioning_and_rollback.ipynb`. Eval v2 against a labelled test set, detect regression, pin/rollback. → version the LLM that writes findings; stop silent quality regressions.
- **Building evals + synthetic test data** — `misc/building_evals.ipynb`, `misc/generate_test_cases.ipynb`. → we have no formal eval harness; findings QA is manual. This systematizes it.
- **Evaluator-optimizer pattern** — `patterns/agents/evaluator_optimizer.ipynb`. Generation LLM + evaluation LLM feedback loop.

## 3. Token/cost efficiency — our Opus budget pain
- **Haiku sub-agent → Opus synthesis** — `multimodal/using_sub_agents.ipynb`. Haiku extracts, Opus synthesizes. → literally our token-routing rule (FIND→haiku, THINK→sonnet, PRODUCE→opus) as working code.
- **Programmatic tool calling (PTC)** — `tool_use/programmatic_tool_calling_ptc.ipynb`. Claude writes code that calls tools in the execution env → fewer round-trips, less token burn.
- **Context engineering / auto-compaction** — `tool_use/automatic-context-compaction.ipynb`, `tool_use/context_engineering/context_engineering_tools.ipynb`, `misc/session_memory_compaction.ipynb`. When/what to compact, costs, tool-result clearing.
- **Speculative prompt caching** — `misc/speculative_prompt_caching.ipynb`. Warm the cache while the user is still typing → lower TTFT. Relevant to the chatbots we deploy.
- **Usage & cost Admin API** — `observability/usage_cost_api.ipynb`. Programmatic cost data. → feeds `cost-report` / `usage-report`.

## 4. RAG / AI search (rag-architect, AuditHQ knowledge)
- **Contextual retrieval** — `capabilities/contextual-embeddings/guide.ipynb`. Prepend chunk context before embedding (+ prompt caching). Anthropic's flagship retrieval-accuracy technique. → the default for any RAG we build.
- **RAG guide (summary indexing + reranking)** — `capabilities/retrieval_augmented_generation/guide.ipynb`, with a real **eval harness** (`evaluation/eval_retrieval.py`, `eval_end_to_end.py`).
- **Knowledge graph construction** — `capabilities/knowledge_graph/guide.ipynb`. Entity/relation extraction, dedup, multi-hop query.
- **Text-to-SQL** — `capabilities/text_to_sql/guide.ipynb`. NL→SQL via RAG + CoT + self-improvement. → relevant to Supabase-backed analytics.

## 5. Agent architecture reference
- **Effective-agents patterns** — `patterns/agents/` (routing, orchestrator-workers, async multi-agent with peer messaging). Canonical reference for [Building Effective Agents].
- **Chief-of-staff agent** — `claude_agent_sdk/01_*.ipynb` + its `.claude/hooks/` (report-tracker, script-usage-logger) — reusable hook patterns.
- **SRE / observability agents** — `claude_agent_sdk/02,03`, `managed_agents/sre_incident_responder.ipynb`. Alert→logs→root-cause→fix-PR→approval. → observability-designer reference.

## 6. Model-specific
- **Fable 5 fallback billing** — `fable_5_fallback_billing/guide.ipynb`. Detect Fable 5 safety-classifier blocks, fall back to Opus 4.8. Relevant if we ship on Fable 5.

## How to apply
This is an index, not a build. When a task matches a cluster, open the one notebook and adapt the technique to our stack — do NOT clone the repo. Highest revenue leverage: cluster 2 (outcome-grader → AuditHQ findings validation) and cluster 1 (threat-intel → Orbit). See [[reference-claude-code-plugins]] for the plugin/LSP level-up from the same session.
