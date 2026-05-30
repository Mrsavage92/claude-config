---
name: deep-research
description: Deep research harness — fan-out web searches, fetch sources, adversarially verify claims, synthesize a cited report. When the user wants a deep, multi-source, fact-checked research report on any topic. BEFORE invoking, check if the question is specific enough — if underspecified, ask 2-3 clarifying questions to narrow scope. Then pass the refined question as args.
disallowed-tools: AskUserQuestion
---

# /deep-research

Multi-phase research harness: scope → parallel search → fetch+extract → adversarial verify → synthesize.

**Invoke:**
```
Workflow({ scriptPath: "C:/Users/Adam/.claude/workflows/deep-research.js", args: "<research question>" })
```

Pass the full research question as a single string in `args`. The workflow handles decomposition internally.

**Phases:**
1. **Scope** — decomposes question into 5 complementary search angles (Sonnet)
2. **Search** — 5 parallel WebSearch agents, one per angle (Sonnet)
3. **Fetch** — URL-dedup, fetch top 15 sources, extract falsifiable claims (Sonnet)
4. **Verify** — 3-vote adversarial verification per claim; 2/3 refutations required to kill (Sonnet)
5. **Synthesize** — merge semantic dupes, rank by confidence, cite sources (Sonnet)

**Returns:** `{ summary, findings[], caveats, openQuestions[], sources[], stats }`
