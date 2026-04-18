# Product Validation: Tender Writer

**Verdict:** KILL
**Date:** 2026-04-18
**Notion:** https://notion.so/343116e8bef2810e9cecc164a472190d

## Idea
AI tender discovery + bid-writing SaaS for Australian SMBs bidding on government contracts. Pivot direction discussed: first-time bidders with zero prior wins.

## Gate Results

| # | Gate | Result | Verdict |
|---|---|---|---|
| 1 | Who pays | AU SMB gov bidders — proven segment, but zero-wins sub-segment is weak | PASS (caveat) |
| 2 | What exists | Doreva, TenderPilot, GovBid, mytender.io, AutogenAI (AU-native); DeepRFP, AutoRFP.ai, Jenova, MyPitchFlow (global, free trials) | FAIL |
| 3 | Market gap | Stated moat "transparent pricing + find+write combined" is not defensible — Doreva does both with evaluator credibility | FAIL |
| 4 | Revenue model | $49/$149/$299/mo subscription — valid | PASS |
| 5 | TAM | ~50K AU SMB gov bidders; realistic 2yr capture <100 customers = <$180K ARR; likely <$50K yr 1 | FAIL |

## Reasoning
- 3 FAIL gates = automatic KILL per skill policy
- 4+ AU-native AI tender writers already operating, all with stronger positioning (domain credibility, funding, existing integrations)
- Zero-wins pivot worsens unit economics (low ACV, high churn, high support cost)
- User's own memory flags: "NEVER build without confirming it solves a problem free tools don't. FlipTracker was wasted."
- Product was questioned by user before this session; validation confirms those doubts

## Recommended Action
1. **Primary:** Archive Tender Writer. Redirect cycles to AuditHQ ($10K/mo target, already in flight)
2. **Secondary:** Reuse the React + Supabase + Stripe scaffold as a template if needed for AuditHQ customer app
3. **Pivot option (only if obsessed):** Pick ONE underserved vertical (IPP First Nations bid writing; NDIS provider registration) — but interview 5 buyers BEFORE writing code

## Gate for /saas-build
This KILL verdict blocks any further /saas-build, /web-scaffold, or build-pipeline execution on Tender Writer. To override, run /product-validator again with a genuinely new angle (narrow vertical + pre-validated buyers).
