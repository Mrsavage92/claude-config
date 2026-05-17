# Quality Bar Reference

This file is the **canonical quality-bar definition** for the web-* suite. Both `/saas-build` (greenfield) and `/web-evolve` (brownfield) read it. Do NOT redefine quality bars in individual skill files.

---

## Canonical tier table

| Tier | Label | What it gates | Greenfield exit? | Brownfield target? | World-class phases? |
|---|---|---|---|---|---|
| **90** | Premium SaaS | Generic high-quality SaaS landing. Disciplined tokens, no AI-template tells, mobile parity. | Below default — log STUCK if `/saas-build` exits here | Run #1 default when site is mid-template | No (R + G skipped) |
| **95** | Stripe / Linear quality | Real motion, a11y/SEO pass, /critique scored, designer would not want to fix. **Default `/saas-build` exit. Default `/web-evolve` Run #1 if signals warrant.** | YES — default | Common Run #2 advance | No |
| **98** | Awwwards SOTD candidate | Awwwards 4-dim avg ≥ 8.0, per-dim minima, WC1–WC10 PASS, chrome-devtools-mcp perf ≥ 90, singular hero signature (A/B/C). | No — requires Phase R signature commitment | Run #2 or #3 advance after greenfield | **YES** (R + G run) |
| **100** | Awwwards SOTM candidate | Avg ≥ 8.5, Creativity ≥ 9.0, real Chrome trace ≥ 95, 60fps motion, foundry typography, View Transitions on every route. | No | Run #3+ advance only | **YES + stricter gates** |

---

## How the legacy 38/40 score maps in

`/web-review` produces a 0–40 score across 40 dimensions (design + a11y + performance). The mapping:

| `/web-review` raw | Tier equivalent | Action |
|---|---|---|
| < 36 (< 90%) | Below tier 90 | `/saas-build` STUCK — fix loop |
| 36–37 (90–94%) | Tier 90 | Premium SaaS — `/saas-build` may exit if `--target=90` set; otherwise keep iterating |
| **≥ 38 (≥ 95%)** | **Tier 95** | **Default `/saas-build` exit threshold** |
| n/a — `/web-review` does not score WC1–WC10 / Awwwards 4-dim | Tier 98+ | Requires `/web-evolve` with Phase R + G — `/web-review` cannot grant this tier |

**38/40 is not a separate quality system. It's the tier-95 exit threshold expressed in `/web-review`'s scoring grid.** Tier 98 and 100 are unreachable from `/web-review` alone — they require `/web-evolve`'s Phase R (world-class research + signature commitment) and Phase G (motion stack install).

---

## Quality Gate Loop (enforced by `/web-review` inside `/saas-build` Phase 5)

- **Exit condition**: `/web-review` score ≥ 38/40 (tier 95) AND pre-deploy checklist fully green.
- **Fix loop**: for each failure, run `Skill('web-fix')` targeting the exact failure, commit, re-run `Skill('web-review')`.
- **Hard stop**: after 5 iterations with score still < 38 → log `STUCK`, list remaining failures, STOP. Do not proceed to deploy.
- **Greenfield ceiling**: `/saas-build` does NOT push above tier 95. To reach tier 98/100, run `/web-evolve` after deploy — that's the brownfield path.

---

## Quality gate loop (enforced by `/web-evolve` Phase F)

- **Exit conditions** (all three must pass per Cardinal Rule 14):
  - Gate A — at least one refinement-skill invocation fired
  - Gate B — `post_run_vq - baseline_vq ≥ tier_vq_delta_floor` (0.5 / 0.7 / 1.0 / 1.5 for tiers 90 / 95 / 98 / 100)
  - Gate C — refinement-skill iteration floor met (1 / 3 / 6 / 8 for tiers 90 / 95 / 98 / 100)
- **Tier advance**: each successful exit writes `trajectory.runs[-1].final_score` → next `/web-evolve` invocation reads it and pushes one tier higher automatically.
- **No 38/40 inside `/web-evolve`** — it uses `target_score` (90/95/98/100) end to end. The 38/40 frame is greenfield-only.

---

## Pass/Fail definition

- **Pass (greenfield, `/saas-build`)**: `/web-review` ≥ 38/40 AND pre-deploy checklist fully green.
- **Pass (brownfield, `/web-evolve`)**: all three Phase F gates pass at the auto-decided tier.
- "It renders" is not done. A page passes when a designer seeing it for the first time would not want to fix it.

---

## Context Refresh Rule (every 3rd page in `/web-page`)

After completing every 3rd page, re-read `DESIGN-BRIEF.md` and `SCOPE.md` in full before starting the next. Late pages drift from the locked design contract when this is skipped.

---

## Page Build Order (enforced by `/saas-build`)

1. `/` — Landing (non-negotiables apply: animated bg, product mockup, STAGGER hero)
2. `/auth` — Sign in / sign up
3. `/setup` — Onboarding wizard (mandatory for all SaaS with auth)
4. App pages in SCOPE.md priority order
5. `/settings` — Settings (mandatory for all SaaS with auth)

---

## Page Type Detection (enforced by `/saas-build` Phase 4b)

Before building any page, check the type and read the relevant sub-skill:

| Page type | Sub-skill | What it enforces |
|---|---|---|
| Dashboard / analytics / monitoring / data overview | `dashboard-design` | KpiCard + Sparkline, DateRangePicker, 28-item checklist |
| Any list of records (customers, transactions, logs) | `web-table` | TanStack Table v8, skeleton rows, bulk action bar |
| `/settings` route | `web-settings` | 4-tab layout, Stripe Customer Portal for billing tab |
| `/setup` or `/onboarding` wizard | `web-onboarding` | Max 4 steps, writes per-step, trial activation on final step |

---

## Dashboard pages (enforced by Phase 4b detection)

Before building any dashboard, analytics view, monitoring screen, or data management list — read `/dashboard-design`. These rules apply automatically:

- **Page type**: determine from skill's Page Types table (Overview / Analytics / List / Detail / Settings / Onboarding)
- **KPI cards**: use `KpiCard` + `Sparkline` from skill spec for any metric display — never ad-hoc stat boxes
- **Data tables**: use `/web-table` — TanStack Table v8 with skeleton rows, bulk action bar, FilterBar above
- **DateRangePicker**: required on all Analytics pages (4 presets: 7d/30d/90d/12mo)
- **FilterBar**: required above every data table (search + status filter + clear)
- **Export CSV**: button in page header on every List page
- **Animations**: Framer Motion stagger (0.08s) on KPI card entrance
- **Colors**: all via CSS variables — zero hardcoded grays, whites, or hex values
- **CMD+K CommandPalette**: mount in AppLayout for products with 8+ nav items
- **Self-review**: use the skill's 28-item Pre-Ship Checklist instead of the standard 13-item per-page bar

---

## Skill Trigger Guide

| Use | When |
|---|---|
| `/web-fix` | A specific element is broken, failing a review check, or visually wrong. Pass the exact component name and the failure. |
| `/web-component` | Adding a net-new UI element to an existing page. |
| `/web-page` | Building an entire page from scratch, OR a `/web-evolve` REBUILD-verdict iter rewriting a broken route. |
| `/web-review` | Final quality gate before deploy in greenfield — scores 40 dimensions. Maps to tier 95 at ≥ 38/40. |
| `/web-evolve` | Brownfield improvement. Auto-decides target tier (90/95/98/100). Re-invocation advances one tier. |
| `/web-stripe` | Adding paid plans or trial-to-paid flow. Run after Supabase, before building pages. |
| `/web-onboarding` | Building the `/setup` or `/onboarding` wizard. Mandatory for all SaaS products with auth. |
| `/web-settings` | Building the `/settings` page (profile, billing portal, team, danger zone). |
| `/web-email` | Adding transactional email — welcome, trial-ending, invites, password reset, invoices. |
| `/web-table` | Building any page with a sortable/filterable list of records. |
| `/dashboard-design` | Building any dashboard, analytics, monitoring, or data management page. |
