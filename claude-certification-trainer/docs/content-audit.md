# Content Audit

A review of all imported and authored content for quality, correctness, and
honest provenance. Last reviewed: **2026-07-17**.

## Content inventory

| Content | Count |
| --- | --- |
| Certifications | 1 (CCAO-F) |
| Domains | 7 (weightings sum to 1.0) |
| Task statements | 30 |
| Lessons | 30 (one per task statement) |
| Full practice questions | **60** (all enabled) |
| Flash Fire items | 25 |
| Labs | 20 |
| Sources | 41 |

### Question composition

| Dimension | Breakdown |
| --- | --- |
| Provenance | `official-sample` 3 · `repository-authored` 12 · `independently-authored` 45 |
| Difficulty | easy 11 · moderate 36 · difficult 13 |
| Type | single-choice 53 · multiple-response 7 |
| By domain | D1 8 · D2 12 · D3 9 · D4 8 · D5 7 · D6 10 · D7 6 |

Every domain has ≥ 5 questions; the mix leans scenario-based with a smaller number
of direct concept checks, matching the target.

## Method

1. **Automated validation** (`src/services/validateContent.ts`, run by the content
   test suite): schema conformance, no duplicate IDs, no broken internal
   references, single/multiple answer-count rules, an explanation for every
   option, valid provenance, resolvable sources, and domain weightings summing to
   1.0. **Result: 0 errors.**
2. **Manual review** of every question against the dimensions below.

### Manual review dimensions

Contradictory answers · ambiguous wording · more than one defensible answer ·
incorrect multiple-response counts · unsupported claims · outdated model/feature
names · broken URLs · weak distractors · trivia-only questions · explanations that
fail to address distractors · community claims presented as official · policy
guidance that may have changed.

## Provenance integrity

- Only the **3** questions reproduced from the official CCAO-F Exam Guide sample
  set are labelled `official-sample`. They are transcribed faithfully.
- The **12** additional practice items from the upstream study guide are labelled
  `repository-authored` — **not** official — and are grounded in the official docs
  the guide cites.
- The **45** questions authored for this trainer are labelled
  `independently-authored`. None claim to have appeared on the live exam; none are
  recalled or leaked exam questions; each tests an underlying principle with a new
  scenario and cites the official source it is grounded in.
- The app never surfaces `repository-authored`, `independently-authored`, or
  `unclear` content as "official".

## Findings

No question was found to be incorrect, contradictory, or to have more than one
defensible answer, so **0 questions were disabled**. Several items are **kept
enabled but flagged as time-sensitive** because they depend on model
specifications or policies that change over time. They are accurate against the
cited sources at the time of review; the relevant sources are marked
`medium` confidence in the registry, and these should be re-verified against live
Anthropic sources before relying on them.

| Item(s) | Concern | Source checked | Recommended action | Status |
| --- | --- | --- | --- | --- |
| Model-tier / pricing / context / output-cap items in **D3** (e.g. `q-off-02`, and the `q-d3-*` set), plus `ff-05` | Model names (Haiku 4.5, Sonnet 5, Opus 4.8, Fable 5), prices, context sizes, and the 64k output cap change with releases | `models-overview`, `choosing-a-model` (medium confidence) | Keep enabled; re-verify model table before exam; update if Anthropic revises tiers | Enabled |
| Commercial-vs-consumer training default (`q-off-13`, `ff-17`) | Consumer training defaults and opt-out mechanics are policy that can change | `commercial-terms`, `data-retention` (medium) | Keep enabled; re-verify against current Terms/Privacy | Enabled |
| Data-retention numbers and DPA specifics in **D6** (`q-d6-*`) | Retention windows (30d/2y/5y/7y), AES-256/TLS/48h notification are policy-specific | `data-retention`, `dpa`, `usage-policy` | Keep enabled; re-verify against current policies | Enabled |
| ASL / RSP items (`ff-19`, `q-d6-*`) | "All current models are ASL-2" is point-in-time | `rsp` | Keep enabled; re-verify current ASL status | Enabled |
| High-risk-area and human-review items (`q-off-01`, `q-off-03`, `q-off-07`, `q-d6-*`) | AUP wording/scope may be updated | `usage-policy` (high) | Keep enabled; principle is stable, wording may shift | Enabled |

### Non-issues confirmed

- **Distractors:** reviewed for plausibility — no obviously absurd distractors;
  none have multiple equally-defensible answers.
- **Explanations:** every option has a per-option explanation that addresses why
  it is right or wrong (enforced by validation).
- **Multiple-response counts:** all 7 multiple-response questions have ≥ 2 correct
  answers and state the required count in the stem.
- **URLs:** all source URLs are transcribed from the upstream guide's citations to
  official Anthropic domains; `lastVerifiedAt` records the transcription date, not
  an independent live re-crawl (noted in the source registry).

## Ongoing maintenance

Before a study cycle, re-verify the `medium`-confidence sources and the flagged
items above against the latest official Anthropic documentation and policies. If a
model name, price, retention window, or policy has changed, update the affected
question (and its `verifiedAt`) or disable it rather than leaving stale guidance.
