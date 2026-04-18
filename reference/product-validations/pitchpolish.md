# Product Validation: PitchPolish

**Verdict:** KILL
**Date:** 2026-04-18
**Context:** Generated as self-test of the hardened gate. Not a real build candidate.

## Idea
AI pitch deck review tool for pre-seed/seed founders. Upload deck → AI scores 10 dimensions + rewrites weak slides. Pricing: $99/deck or $499/mo unlimited.

## Gate Results

| # | Gate | Result | Verdict |
|---|---|---|---|
| 1 | Who pays | Pre-seed founders + consultants (specific segment) | PASS |
| 2 | Competitors — 5+ free (ChatGPT GPT, OpenVC, Slidebean, yeschat, perfectit) + 5+ paid (PitchGrade, SaaStr, Evalyze, Alai, PitchLeague) | FAIL |
| 3 | Market gap | None. SaaStr free does it with VC-brain | FAIL |
| 4 | Revenue model | $99/deck or $499/mo | PASS |
| 5 | TAM | Commoditized by free players, <$50K ARR realistic | FAIL |
| 6 | Moat | No distribution, no data, no brand advantage | FAIL |
| 7 | Buyer pre-commitment | Zero named buyers | FAIL |
| 8 | Portfolio fit | AuditHQ still pre-revenue, blocks new builds | FAIL |

## Reasoning
- 6 FAILs = automatic KILL per skill rules
- Category is being commoditized free (SaaStr, OpenVC both free)
- Adam has zero distribution into the founder/pre-raise market
- AuditHQ is primary revenue focus ($0 MRR vs $10K target) — new builds blocked per active-revenue-projects.md

## Recommended Action
Archive idea. Focus on AuditHQ audit quality validation + first $1K MRR.

## Self-Test Result
This validation was generated to test the hardened suite:
- ✅ CLAUDE.md trigger detection fired on my own "natural adjacent idea" language
- ✅ `/product-validator` invoked BEFORE any design/scope discussion
- ✅ Gate 2 searched both free AND paid competitors
- ✅ Gate 6 (moat) correctly flagged no defensible advantage
- ✅ Gate 7 (buyers) flagged zero pre-commitment
- ✅ Gate 8 (portfolio) correctly referenced active-revenue-projects.md
- ✅ Verdict KILL delivered in one response, no build discussion initiated
- ✅ Retrospective log appended (PitchPolish entry)
- ✅ Verdict file saved locally and mirrored to repo

The gate held. PitchPolish would have been a second Tender Writer without it.
