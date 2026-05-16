# Active Revenue Projects Registry

Canonical source of truth for `/product-validator` Gate 8 (Portfolio Fit).

Update this file when a project hits revenue, hits a scaling milestone, or gets parked.

---

## Active Pre-Revenue Projects (TWO simultaneous, both "big" — different segments)

> **Strategic note (2026-05-16):** AuditHQ + Orbit Digital are intentionally run in parallel. Orbit Digital is the client-facing managed service that uses AuditHQ as its internal 500+ check engine — but AuditHQ also sells direct as a SaaS to agencies/consultants/white-label. Different buyers, different motions, mutually reinforcing IP.


### AuditHQ
- **Status:** PRE-REVENUE — audit/report quality gate open
- **Target:** $10,000/month MRR
- **Current MRR:** $0 (Anthropic credits withheld until quality validated)
- **Validator:** BUILD 2026 (needs re-run under hardened suite)
- **Fix plan:** validate audit quality with 3 paying customers, un-withhold credits

### Orbit Digital (rebranded from GrowLocal 2026-05-16; audit-led pivot 2026-05-13 → 2026-05-16)
- **Status:** PRE-REVENUE — code rebranded + pushed, zero paying customers
- **Live:** `growlocal-v2.vercel.app` (working audit-led product). Domains `orbitdigital.au` + `orbitdigital.com.au` purchased 2026-05-16, DNS not yet wired.
- **Target:** $10,000/month MRR
- **Business model:** Audit-led managed service. Audit → Fix → Rescan → Monitor. Powered internally by **AuditHQ's 500+ check engine** (AuditHQ relationship is confidential — never mentioned to prospects).
- **Pricing (locked):** Audit from $1,950 / Fix Pack from $950 / Monitoring from $350/mo. NOTE: `src/lib/pricing.ts` still encodes legacy SaaS tiers — migration pending.
- **Old business model (DEAD as of 2026-05-13):** done-for-you SaaS at $247/$397/$597/mo + $797-$2,997 setup.
- **Validator verdict:** **VALIDATE-FIRST (2026-05-16)** — fresh validation under audit-led positioning. 7 of 8 gates PASS; only Gate 7 (buyer pre-commitment) fails. White space confirmed (no AU competitor at audit+fix+monitor bundle), TAM $1.8M-$2.2M cumulative 2-year, moat strong (proprietary AuditHQ engine + AU compliance specifics + rescan methodology). Source: `product-validation-orbit-digital.md`. **Unblocks on:** 5 customer interviews → ≥3 named "$1,950 yes" responses → re-validate → BUILD.
- **Fix plan:** wire domain → Vercel, migrate `pricing.ts` to audit/fix/monitor SKUs, re-validate, close first 3 audit clients at $1,950 each (case studies + rescan proof).
- **Memory file:** none yet (was `project_growlocal_*.md`, never created — see CONTEXT.md + project CLAUDE.md instead).
- **Repo:** `Mrsavage92/Orbit-Digital` (renamed from `Mrsavage92/growlocal`)

### Portfolio Question — RESOLVED 2026-05-16
Both AuditHQ and Orbit Digital are now intentionally "big" simultaneously. They serve different customer segments:
- **AuditHQ** = SaaS platform — agencies, consultants, founders, white-label resellers. Self-serve audits + credits.
- **Orbit Digital** = managed service — AU SMB local services. Premium done-for-you audit + implementation + monitoring, using AuditHQ as the engine.
- **Blocker on NEW product builds:** YES — no third product until one of these two hits $5K/mo MRR.

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

- **Automation Agency** — validator KILL 2026-04-28, USER OVERRIDE accepted same day. Marketing site for AU NDIS/healthcare/social care automation consultancy. Setup packages $1.2k / $2.5k + $500/mo support. No named buyers yet — must run cold-outreach validation in week 1 post-launch. Verdict file: `product-validation-automation-agency.md`. **Risk: directly competes with AuditHQ + Orbit Digital for attention.**

---

## Generating Revenue

_(none yet — this is the first goal)_
