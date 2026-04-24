### Phase 1 — Scope (run /web-scope)

Execute the full /web-scope process:
1. **Read DESIGN-BRIEF.md first** — all color, typography, and marketing structure decisions are already locked. Do NOT re-decide them. Import them directly from the brief.
2. **Read MARKET-BRIEF.md (if exists)** — extract the "Must-have for v1" list. Every item on that list must map to a page in the inventory. If a must-have has no page, create one before continuing.
3. Extract brief from user input
4. Produce complete page inventory with all 7 fields per page (use the marketing tier structure from DESIGN-BRIEF.md for public pages)
5. Write SCOPE.md to project root
6. Append initial SCOPE summary to BUILD-LOG.md — do NOT overwrite; Phase 0.25 already created this file

Do not proceed to Phase 2 until SCOPE.md exists and every page has all 7 fields defined.

SCOPE.md MUST also include an `onboarding_route` field at the top level (e.g. `/setup` or `/onboarding`). Phase 3a ProtectedRoute reads this field. If the brief does not specify, default to `/setup`.

**Mandatory pages — add to SCOPE.md regardless of brief:**
Every SaaS product MUST include these pages in the inventory. If the brief doesn't mention them, add them:
- `/privacy` — Privacy Policy (static, auto-generated)
- `/terms` — Terms of Service (static, auto-generated)
These are never optional. Add them to the build order in Phase 4 after `/settings`.

**Stop condition:** if the product description is too vague to identify the core feature category, make a documented assumption and log it — do NOT ask. Format: "Brief was vague — assumed [X] based on [Y]. Correct SCOPE.md if wrong." Only ask if the product domain is completely unidentifiable after analysis.

Log: "Phase 1 complete — SCOPE.md written" to BUILD-LOG.md.

---

### Phase 1.5 — Product Category Detection

**Run this phase between Phase 1 (Scope) and Phase 2 (Scaffold). It is not optional.**

Read SCOPE.md and MARKET-BRIEF.md. Classify the product into exactly one of these 8 categories from `PRODUCT-CATEGORY-LIBRARY.md` (located at the monorepo root, or `C:\Users\Adam\Documents\au-compliance-platform\PRODUCT-CATEGORY-LIBRARY.md`):

1. **Reputation/Reviews** — RepuTrack, BirdEye type
2. **Entity/Company Intelligence** — CorpWatch, Crunchbase type
3. **Regulatory Compliance** — AML/CTF, WHS, NDIS, Privacy Act type
4. **Procurement Intelligence** — TenderWatch type
5. **Practice Management** — Migration Agents, Aged Care type
6. **HR/People Ops** — leave management, onboarding, performance type
7. **Finance/Accounting** — cashflow, BAS, reconciliation type
8. **Document Management** — records, version control, audit trail type

**Detection rules (keyword matching in SCOPE.md + product brief):**

| Keywords found | Category |
|---|---|
| reviews, reputation, rating, review management, star rating | Reputation/Reviews |
| ASIC, ABN, company search, company intelligence, director, entity verification | Entity/Company Intelligence |
| AML, CTF, AUSTRAC, KYC, sanctions, WHS, psychosocial, hazard, NDIS, incident, aged care, migration agent, Privacy Act | Regulatory Compliance |
| tender, procurement, government contract, AusTender, BuyNSW, bid, watchlist | Procurement Intelligence |
| visa, case management, participant, resident, practitioner, MARA | Practice Management |
| leave, onboarding, performance review, payroll, WGEA, employees, rostering | HR/People Ops |
| BAS, cashflow, reconciliation, invoicing, Xero, MYOB, accounting | Finance/Accounting |
| document register, version control, policy library, records management, audit trail | Document Management |

**If multiple categories match:** pick the most specific one. "WHS psychosocial hazard register" = Regulatory Compliance, not Document Management even though it involves documents.

**After detection — mandatory steps:**

1. Read the full category entry from `PRODUCT-CATEGORY-LIBRARY.md` for the detected category.

2. **Override hero pattern** — the hero pattern from PRODUCT-CATEGORY-LIBRARY.md OVERRIDES the default dark animated hero from the generic scaffold. Write the overridden hero pattern to DESIGN-BRIEF.md under a new field: `hero_override`. Log the override with reasoning: "Hero override: [category hero pattern] — overrides default dark animated hero because [reason]."

3. **Load required sections checklist** — copy the "Required Landing Sections (in order)" list from the category entry into BUILD-LOG.md as a checklist. This list is NON-NEGOTIABLE for Phase 4 (landing page build). Phase 4 must verify every section is present before marking the landing page complete.

4. **Set UX dominant pattern** — the UX dominant pattern from the category entry determines the first app page's primary UI metaphor. Write to BUILD-LOG.md: "UX pattern: [pattern] — first app view must reflect this." This overrides defaulting to a KPI dashboard.

5. **Flag trust signals** — list the trust signals required for this category in BUILD-LOG.md. Phase 4 (landing page) must include all of them. Phase 6 (/web-review) checks for their presence.

6. **Flag mobile requirements** — if the category is CRITICAL or HIGH mobile, add to BUILD-LOG.md: "Mobile requirement: [level] — sidebar must be bottom nav on mobile / touch targets must be 44px minimum."

7. **Flag forbidden patterns** — copy the "Forbidden landing patterns" list from the category into BUILD-LOG.md. These are automatic failures in Phase 5 (/web-review).

8. **Check for Regulatory Compliance sub-type** — if category is Regulatory Compliance, detect the sub-type:
   - Keywords: AML, CTF, AUSTRAC, KYC, sanctions, money laundering → Sub-type 3A (Financial Crime)
   - Keywords: WHS, psychosocial, hazard, SafeWork, WorkSafe → Sub-type 3B (Workplace Safety)
   - Keywords: NDIS, participant, provider → Sub-type: NDIS
   - Keywords: aged care, ACQSC, resident → Sub-type: Aged Care
   - Load the sub-type entry from PRODUCT-CATEGORY-LIBRARY.md, not the generic Category 3 entry.

Write to BUILD-LOG.md:
```
Phase 1.5 complete — Product category detected: [category name]
Hero override: [description from PRODUCT-CATEGORY-LIBRARY.md]
UX pattern: [pattern]
Required sections: [count] sections loaded to checklist
Forbidden patterns: [count] loaded
Trust signals required: [list]
Mobile requirement: [LOW/MEDIUM/HIGH/CRITICAL]
```

**Generate COPY.md immediately after category detection.**

COPY.md is the single source of truth for all user-facing strings. Without it, copy is reinvented per page, drifts between sessions, and cannot be audited. Generate it now — Phase 4 (`/web-page`) and Phase 5 (`/web-review` Pass I) both require it.

Write `COPY.md` to the project root with:

```markdown
# COPY.md — [Product Name]
Generated: [timestamp]
Source: SCOPE.md + DESIGN-BRIEF.md + product brief

## Hero
hero_headline: [primary headline — benefit-driven, specific, <10 words]
hero_subheadline: [expands headline with specificity, 1-2 sentences]
hero_cta_primary: [action-oriented, value-describing, not "Get started"]
hero_cta_secondary: [lower commitment alternative]

## Trust Stats (3 items)
stat_1: [number] — [label]
stat_2: [number] — [label]
stat_3: [number] — [label]

## CTA Labels (all buttons in the app)
trial_cta: [e.g. "Start free trial"]
upgrade_cta: [e.g. "Upgrade to Pro"]
onboarding_complete_cta: [e.g. "Go to dashboard"]
settings_save: [e.g. "Save changes"]
delete_confirm: [e.g. "Yes, delete"]

## Empty States (per page — add all pages from SCOPE.md)
empty_[page]: [Icon label + heading + description + CTA label]

## Error Messages
error_generic: [user-facing, no stack traces]
error_auth: [e.g. "Incorrect email or password"]
error_network: [e.g. "Connection lost — check your internet and try again"]

## Pricing Tiers
tier_1_name: [e.g. "Starter"]
tier_2_name: [e.g. "Pro"]
tier_3_name: [e.g. "Scale"]
```

Derive values from: product brief (hero), DESIGN-BRIEF.md personality type (tone), category CTA conventions (from PRODUCT-CATEGORY-LIBRARY.md), and SCOPE.md page list (empty states). Use the category-specific CTA framing (e.g. AML tool: "Get compliant by July 1", not "Get started").

Log: "Phase 1.5 complete — category [name] detected, rules loaded, COPY.md generated" to BUILD-LOG.md.

---
