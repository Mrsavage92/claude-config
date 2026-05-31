# Sales-Page Checklist (the 10 rules)

Each rule is binary PASS/FAIL. Applied to every public route in Phase A.2.

A route with **≥ 2 FAILs** → `FAIL_REBUILD`.
A route with **1 FAIL** + `vq_aggregate >= 2.0` → `FAIL_REFINE`.
A route with **0 FAILs** + `vq_aggregate >= 3.5` + `taste_violations.length == 0` → `PASS`.

---

## The 10 rules

### Rule 1 — Sections earn their place

Every section answers a specific buyer question. If you cut the section, does the buyer leave with the same information? If yes → cut it. PASS only if every section is load-bearing.

### Rule 2 — What you do is above the fold

The H1 + first paragraph + primary CTA fit on a 1440×900 viewport. A first-time visitor knows what the product does without scrolling. PASS only if H1 is product-clear (not vision-clear).

### Rule 3 — Outcome not process

Headlines describe what the buyer gets, not how you do it. "Ship faster" not "AI-powered DevOps platform." PASS only if every headline passes the so-what test.

### Rule 4 — Specific not generic

Numbers, names, screenshots — not vague adjectives (the banned-phrase list in `references/parse-verdict.sh` defines what to reject) or "trusted by businesses" or "industry-leading" filler. PASS only if specifics dominate over generic claims by >2:1.

### Rule 5 — One primary CTA per fold

Each visible page section has one obvious next action. Buttons compete in visual weight only when they are NOT primary. PASS only if scrolled-into-view sections have a clear primary CTA.

### Rule 6 — Pricing is visible or one click away

Either /pricing exists and is linked from primary nav, OR pricing appears on the landing page. Hiding pricing behind "Contact sales" only for enterprise-only ICP. PASS only if a self-serve buyer can find pricing in ≤ 2 clicks.

### Rule 7 — Social proof is specific and recent

Logos, testimonials, case studies — each must be attributable, recent (≤ 24 months), and specific (no "We saved time"). PASS only if visible proof points are real and named.

### Rule 8 — Mobile is not an afterthought

The same hero + value prop + CTA flow at 375px width. Type ≥ 16px. Touch targets ≥ 44px. Above-the-fold content visible on a phone without horizontal scroll. PASS only at 375px parity.

### Rule 9 — Loading + error states are designed

Empty state has a CTA. Error state has a recovery path. Loading state is not a generic spinner. PASS only if states are visible and intentional in the build.

### Rule 10 — The page works without JS for static content

H1, hero copy, primary CTA, pricing visible with JS disabled. SEO + accessibility floor. PASS only if SSR-rendered core content survives JS-off.

---

## Failure encoding

When `Skill('critique')` returns a fail, the entry in `checklist_fails` is `sales-page-10:rule_N` where N matches the rule number above. The critique agent must populate from this fixed enum — `references/parse-verdict.sh` regex-validates the format.

Banned in checklist_fails entries: free-form prose. The orchestrator's parser rejects anything that doesn't match `^sales-page-10:rule_[1-9]|10$`.
