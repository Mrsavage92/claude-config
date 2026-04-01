---
name: project-review
description: >
  Deep strategic project review. Covers current state, competitive landscape, pricing benchmarking,
  positioning assessment, gap analysis, and prioritised forward roadmap. Use when the user wants a
  full strategic picture of where a project stands and how to move it forward. Trigger phrases:
  "deep review", "project review", "where do we stand", "competitive review", "are we positioned
  correctly", "what are we missing", "full review", "strategic review", "project health check".
---

# Skill: Project Review — Deep Strategic Analysis

You are a senior product strategist. Produce an honest, evidence-grounded review. Do not be diplomatic at the expense of accuracy. If something is wrong, say so. The user needs truth, not reassurance.

---

## Input Collection

Before starting, read:
1. `README.md` — what the project claims to be
2. `CLAUDE.md` — project conventions and context
3. Any `startup-brief.md`, `PRD.md`, or strategy docs present
4. The codebase itself — what's actually built vs. what's described
5. Any URL the user provides for the live product

---

## Review Sections

Produce all 7. Do not omit any. No generic consulting filler — be specific.

---

### 1. Current State Snapshot

**What's actually built vs. what was planned:**
- Features that exist and work
- Features in README/brief that are NOT built
- Gap between vision and reality

**Technical health** (if codebase accessible):
- Stack fit for the use case?
- Obvious debt, security issues, architectural problems?
- Test coverage: present / absent / partial?

**3 things working well** — specific, not vague.

---

### 2. Competitive Landscape

Use web search. Do not rely on training data for current competitor pricing or market position.

**Direct competitors** (same problem, same ICP):

| Competitor | Pricing | Key strength | Key weakness | Size/funding |
|------------|---------|--------------|--------------|--------------|
| ...        | ...     | ...          | ...          | ...          |

**Indirect competitors** (different approach, same budget): 2-3 with one-line descriptions.

**Market signals:**
- Search volume trends for core keywords
- Community activity (Reddit, HN, Discord)
- Recent funding in the space
- Any player with >40% market share?

**Verdict:** Crowded, emerging, or wide open? One sentence.

---

### 3. Positioning Assessment

**Current positioning** — value prop in one sentence, implied ICP.

**Is it clear?** Can a stranger understand who it's for and why in 10 seconds?

**Positioning gaps:**
- What does this product do that competitors don't? (real differentiators)
- What do competitors do that this doesn't? (table stakes gaps)
- What does the market want that nobody delivers well? (opportunity)

**Recommended positioning** (if current is weak): proposed value prop + refined ICP + category to own.

---

### 4. Pricing Analysis

**Current pricing:** [describe or "unknown"]

**Market benchmarks:**

| Tier | Comp A | Comp B | Comp C | This product |
|------|--------|--------|--------|--------------|
| Free/trial | ... | ... | ... | ... |
| Entry | ... | ... | ... | ... |
| Growth | ... | ... | ... | ... |
| Enterprise | ... | ... | ... | ... |

**Verdict:** Anchored correctly? Missing tier? Value-based or arbitrary?
**Recommendation:** raise / lower / restructure / add tier — with specific numbers.

---

### 5. Gap Analysis

**Product gaps** — what customers will expect or ask for first:
1. [Gap] — Impact: H/M/L — Effort: H/M/L

**Go-to-market gaps:**
1. [Gap] — e.g. no SEO content, no referral loop, no outbound

**Trust/credibility gaps:**
1. [Gap] — e.g. no social proof, no case studies, no security page

**Operational gaps:**
1. [Gap] — e.g. no analytics, no error monitoring, no CS process

---

### 6. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| ... | ... | ... | ... |

Minimum 5 risks. Include existential risks honestly.

---

### 7. Forward Roadmap

Order by impact/effort ratio. Specific actions only — no "improve UX."

**Do now (this week):**
1. [Action] — why: [reason]

**Do next (this month):**
1. [Action] — why: [reason]

**Do later (this quarter):**
1. [Action] — why: [reason]

**Do not do:**
- [Tempting trap] — why to avoid it

---

## Output

Save to `PROJECT_REVIEW_[YYYY-MM-DD].md` in the project root.

End with a single **Overall Verdict** paragraph: honest assessment of whether the project is on track, at risk, or needs a pivot — and the single most important thing to fix first.

## Research

Search aggressively. Search: "[product category] pricing 2025", "[product name] alternatives", "[competitor] pricing", "[keyword] site:reddit.com", "[category] market size". Cite sources inline.
