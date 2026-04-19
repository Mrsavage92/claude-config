# SaaS Discover Backlog

Candidates that passed the validator or got VALIDATE-FIRST but are blocked by the portfolio gate (primary revenue project under target). Revisit when AuditHQ hits $5K MRR.

Sorted by confidence score (highest first).

---

## VALIDATE-FIRST (needs buyer interviews before build)

### ICP Lead Builder — 62/100 — added 2026-04-18
- **Source:** /saas-discover market (2026-04-18)
- **Pain signal:** [$200-$1,500 per 100 leads on Upwork](https://www.upwork.com/hire/prospect-lists-freelancers/), Apollo/Clay priced out of SMB
- **Value prop:** "Describe ICP in English → AI builds + verifies 100 leads/mo with LinkedIn + email"
- **Target:** AU marketing agencies + solo consultants, $39-$89/mo
- **Verdict file:** `~/Documents/Claude/outputs/saas-validation-icp-lead-builder.md`
- **Blockers:**
  1. Portfolio gate (AuditHQ at $0/$10K target)
  2. Zero pre-committed buyers — needs 5 agency interviews with credit-card commit
  3. LinkedIn data path unresolved (Apollo API partnership vs scraping legal risk)
  4. Moat thin (competitors could copy natural-language ICP input in weeks)
- **Revisit condition:** AuditHQ ≥$5K MRR AND ≥3 named pre-committed buyers from cs-partnerships list
- **Fix plan:**
  1. Interview 5 agency owners this week (even while AuditHQ pushes continue)
  2. Test: "Would you pay $39/mo for 100 validated leads/month matching your ICP described in plain English? Credit card today?"
  3. If 3+ yes → document buyers, re-run `/saas-validator icp-lead-builder`

---

## BUILD-Ready (validator passed but portfolio gate blocks)

_(none yet — ICP Lead Builder would move here once buyers pre-commit)_

---

## KILL (archived — do not revisit without new signal)

### CaptionHQ — 48/100 — 2026-04-18
- **Reroute:** Fold into AuditHQ as "post-audit content generator" feature (build after AuditHQ hits target, not as separate product)

### ReceiptFlow AU — 52/100 — 2026-04-18
- **Kill reason:** Hubdoc free with Xero = zero-cost incumbent beats any $19-49/mo pricing

### Tender Writer — KILL — 2026-04-18 (retrospective)
- Built 6 days before validation caught Doreva/TenderPilot/GovBid incumbents

### PitchPolish — KILL — 2026-04-18 (self-test)
- SaaStr + OpenVC offer pitch deck AI review free

### FlipTracker — KILL — earlier
- Google Sheets already solved inventory tracking for resellers

---

## How to Update This File

Entries are added automatically by `/saas-discover` Phase 6 when portfolio gate blocks a BUILD/VALIDATE-FIRST candidate. Move to "BUILD-Ready" when:
1. Primary revenue project hits its target (see `active-revenue-projects.md`)
2. Candidate's fix plan conditions are met
3. Re-running `/saas-validator {slug}` returns BUILD verdict

KILL entries stay here as memory — don't re-propose them without genuinely new signal.
