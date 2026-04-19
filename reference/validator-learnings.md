# Product Validator — Post-Mortem Log

Every failed product (ideas green-lit and later killed) gets a line here. The validator skill is updated to catch the failure mode next time.

## Log

### 2026-03-?? — FlipTracker — KILL after multiple sessions
- **Idea:** Reselling inventory tracker for resellers on eBay/Depop.
- **Why slipped through:** No Gate 2 existed — nobody searched for existing tools before building.
- **Should have been caught by:** Gate 2 (Google Sheets + existing reselling CRMs like ResellHub, Flyp, SellerCloud).
- **Rule added:** Gate 2 "What exists" + free-alternative search mandatory.

### 2026-04-18 — Discovery run (market mode) — 0 BUILD / 1 VF / 2 KILL
- **Source:** /saas-discover market (first live run)
- **Signals:** 35+ across Reddit, G2, ProductHunt+IndieHackers, HackerNews+Upwork
- **Surviving candidates:** ICP Lead Builder (VF, 62/100), CaptionHQ (KILL, 48 — reroute to AuditHQ feature), ReceiptFlow AU (KILL, 52 — Hubdoc free killer)
- **Pattern:** Broad market scan produces low-fit candidates when user lacks Adam-specific advantages (distribution, domain expertise). `clients` or `pipeline` modes would score higher. `market` mode best for exploration, not commitment.
- **Validator effectiveness:** Portfolio gate blocked all builds (AuditHQ pre-revenue). Suite worked as designed — caught that even the "best" candidate needs buyer interviews before build.

### 2026-04-18 — PitchPolish — KILL (self-test, pre-build)
- **Idea:** AI pitch deck reviewer for pre-seed founders, $99/deck or $499/mo
- **Gate(s) triggered kill:** 2 (crowded free+paid), 3 (no gap), 5 (TAM commoditized), 6 (no moat), 7 (no buyers), 8 (portfolio — AuditHQ still pre-revenue)
- **Competitors named:** [SaaStr AI Analyzer](https://www.saastr.com/the-new-saastr-ai-vc-pitch-deck-review-tool-know-exactly-what-investors-will-think-of-your-pitch-before-you-pitch/), [OpenVC](https://www.openvc.app/blog/pitch-deck-reviews-now-free-for-everyone), [PitchGrade](https://aicloudbase.com/tool/pitchgrade)
- **Would have wasted:** ~6 days (same as Tender Writer trajectory)
- **Pattern:** Claude self-caught the trigger language ("natural adjacent idea would be..."), gate ran pre-build. First end-to-end test of the hardened suite — passed.

### 2026-04-18 — Tender Writer — KILL after 6 days of build
- **Idea:** AI tender discovery + bid writing for AU SMBs.
- **Why slipped through:** Prior session claimed "no one does find+write combined" without verifying. Validator was never run pre-build. Gate 2 only searched free tools — paid AU-native incumbents (Doreva, TenderPilot, GovBid, mytender.io, AutogenAI) were never discovered. User had no moat beyond "transparent pricing" which is not defensible. Zero pre-committed buyers.
- **Should have been caught by:** Gate 2b (paid competitor search), Gate 6 (moat), Gate 7 (buyer pre-commitment), Gate 8 (portfolio fit — AuditHQ is active revenue project).
- **Rules added:**
  - Gate 2 split into 2a (free) + 2b (paid) — both mandatory
  - Gate 6 (Moat / Unfair Advantage) — added
  - Gate 7 (Buyer Pre-Commitment) — added, triggers VALIDATE-FIRST verdict
  - Gate 8 (Portfolio Fit) — added, blocks new builds while active revenue project is under goal
  - `/saas-build` Phase 0.0 now HARD-ENFORCES validator verdict file
  - `/saas-improve` Phase 0.0 now HARD-BLOCKS polish on pre-revenue-unvalidated products
  - Verdict trinary: BUILD / VALIDATE-FIRST / KILL
  - "First to market" / "we combine X and Y" moats must be verified against Gate 2 findings — no self-reported moats

## Pattern Recognition

Both failures shared:
- User excited by the idea, validator never gated
- Claude provided green-light without Gate 2 search
- Build proceeded on vibes-based moat ("it's different because…")
- Sunk cost dawned only after significant token spend

The structural fix is: `/product-validator` is now a hard gate, not a suggestion. No validator file = no build. Saves six-day losses.
