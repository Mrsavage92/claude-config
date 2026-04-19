# Active Revenue Projects Registry

Canonical source of truth for `/product-validator` Gate 8 (Portfolio Fit).

Update this file when a project hits revenue, hits a scaling milestone, or gets parked.

---

## Active Pre-Revenue Projects (TWO simultaneous — both need first customers)

### AuditHQ
- **Status:** PRE-REVENUE — audit/report quality gate open
- **Target:** $10,000/month MRR
- **Current MRR:** $0 (Anthropic credits withheld until quality validated)
- **Validator:** BUILD 2026 (needs re-run under hardened suite)
- **Fix plan:** validate audit quality with 3 paying customers, un-withhold credits

### GrowLocal (added to registry 2026-04-18 after discovery I'd been missing it)
- **Status:** PRE-REVENUE — fully built product, zero paying customers
- **Live:** [growlocal.com.au](https://growlocal.com.au)
- **Target:** $10,000/month MRR
- **Pricing:** $247/$397/$597/mo + $797-$2,997 setup
- **Validator verdict:** VALIDATE-FIRST 56/100 (saas-validation-growlocal.md) — held at VF by Dimension C override (no warm distribution, no named first-3-customers path)
- **Fix plan:** close 3 paying customers at full price in 30 days. Productise 72hr onboarding. Then re-validate.
- **Memory file:** `project_growlocal.md`
- **Planned feature (blocked):** Content Flow — see `C:\Users\Adam\Documents\Claude\growlocal\PRD-CONTENT-FLOW.md`

### Portfolio Question (needs human decision)
Running TWO pre-revenue products simultaneously is itself a portfolio anti-pattern. The `/saas-validator` Gate 8 would penalise both for starving each other. Honest option worth weighing:
- **Pick ONE as priority** (probably GrowLocal — it's further built, validated more recently, has clearer target segment) and park the other until first has revenue
- OR commit half-time to each and accept slower progress on both
- **Blocker on new builds:** YES — no new product builds until one of AuditHQ or GrowLocal hits $5K/mo

---

## Client Work (revenue-generating, not SaaS)

**BDR MuleSoft Integration Project**
- **Status:** DELIVERY — Phase 1 Account Suspension NS→SF
- **Go-live:** Week of 5 May 2026
- **Relevance to portfolio gate:** CLIENT work, not SaaS. Does NOT block SaaS builds on portfolio fit.

---

## Parked / Dead Products

**Tender Writer** — KILLED 2026-04-18 via `/product-validator`
**FlipTracker** — KILLED (date TBD) — Google Sheets already solved it

---

## Rules for updating this file

1. Every new build that passes `/product-validator` is logged under "Active Builds" with a start date + expected revenue date
2. When a product hits paying customers, move to "Generating Revenue"
3. When a product dies, move to "Parked / Dead"
4. The "Primary Revenue Focus" slot holds exactly ONE project at a time — the current priority
5. `/product-validator` Gate 8 reads this file — if "Primary Revenue Focus" is below its stated target, new builds require explicit override

---

## Active Builds (validated but not yet revenue)

_(none — AuditHQ is the only active focus)_

---

## Generating Revenue

_(none yet — this is the first goal)_
