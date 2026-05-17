# Route Role Matrix

For hybrid sites (most real sites), motion ceilings are per-route, not per-site. Use this matrix after classifying the site type.

A route role describes its job: what the user does there. Roles inherit from the site-type `MAX_TIER`, then can be ratcheted DOWN — never up.

---

## How to use this file

1. Classify the site with `references/site-types.md` — get `SITE_MAX_TIER`.
2. For each public route, identify the role from the table below.
3. The route's ceiling is `min(SITE_MAX_TIER, ROLE_MAX_TIER)`. Never higher.
4. Write the per-route ceiling to `.evolution/site-profile.json` under `routes.{path}.motion_ceiling`.

---

## Role catalogue

| Role | MAX_TIER | Allowed kit components | Reason |
|---|---|---|---|
| Homepage (marketing) | inherits site | `FadeUp`, `StaggerContainer`, `Marquee`, `SpringButton`, `MagneticButton`, `SharedLayoutCard`, `ClipReveal`, `PinnedSection` (one max) | The signature surface |
| Service / Product Index | 2 | `FadeUp`, `StaggerContainer`, `SharedLayoutCard` | Lists need to be scannable, not theatrical |
| Service / Product Detail | 2 | `FadeUp`, `SpringButton`, `NumberTicker` (stats), `Marquee` (proof logos) | Detail is read-then-act, not awe |
| Pricing | 1 | `FadeUp` (rows, mount), `SpringButton` (plan CTA) | Pricing must be readable instantly. NO Tier 3 |
| Contact / Enquiry | 1 | `FadeUp` (form mount only), `SpringButton` | Form completion is the action; motion is friction |
| About / Team | 2 | `FadeUp`, `Marquee` (logos/clients), `SharedLayoutCard` (team grid) | Story-driven, low-stakes |
| Blog Index | 1 | `FadeUp` (cards mount) | Index is a list. Tier 2+ on a blog index is wrong |
| Article / Blog Post | 1 (or 0) | `CSSScrollProgress` (reading bar), `StickyHeader` (TOC collapse) | Reading is the action; motion competes |
| Case Study | 2 | `FadeUp`, `ClipReveal` (headline reveals), `SharedLayoutCard` (image gallery) | Case study can have one editorial moment, not five |
| Portfolio Project Detail | 3 | most of kit, including `PinnedSection`, `CardStack`, `CursorParallax` | This is the place where motion = craft proof |
| Pricing Comparison Table | 1 | none — table needs to be static and scannable | Tables and motion mix poorly |
| Checkout — Cart | 1 | `SpringButton` only | Every motion here costs trust |
| Checkout — Payment | 0 | none | Zero motion. Payment is reassurance-driven |
| Order Confirmation | 1 | `FadeUp` (success state mount), `NumberTicker` (order total) | One reassurance moment, then done |
| Login / Signup | 1 | `SpringButton`, `AnimatedModal` (forgot password) | Authentication needs zero distraction |
| Dashboard Home | 2 | `SpringButton`, `NumberTicker`, `SharedLayoutCard`, `AnimatedModal` | Functional motion — state changes, presence, drill-in |
| Dashboard Detail / Drill-in | 2 | `SharedLayoutCard` (row → detail), `AnimatedModal` | The morph IS the affordance |
| Settings / Account | 1 | `SpringButton`, `AnimatedModal` (confirm dialogs), `NumberTicker` (usage stats) | Settings is task-completion, not delight |
| Documentation Home | 1 | `FadeUp` (card index), `StickyHeader` | One paint, then static |
| Documentation Article | 0–1 | `CSSScrollProgress` (reading bar), `StickyHeader`, NO other motion | Devs read; motion is harmful |
| Legal / Terms / Privacy | 0 | none — pure HTML | Never animate legal text |
| 404 / Error | 1 | `FadeUp` (message mount) | One reveal, done |
| Search Results | 1 | `FadeUp` (result cards mount, staggerChildren ≤ 0.03s) | Speed perception > delight |
| Comparison / Versus | 2 | `FadeUp`, `NumberTicker` (deltas), `Marquee` (feature parity) | Reader is comparing — motion that draws attention to one side biases |
| Status Page | 0 | none | Honest, factual, calm |
| Landing Page (campaign) | 3 | full Tier 3 if site type allows | Often the ONE place a Tier 3 site moment is justified |

---

## Examples (real sites)

### Orbit Digital (audit-led managed service)
- Site type: Pro Services / Agency
- `SITE_MAX_TIER`: 2
- Routes:
  - `/` → Homepage (marketing), inherits site → MAX 2 → `FadeUp` + `Marquee` + `SharedLayoutCard`
  - `/services/[slug]` → Service Detail, MAX 2 → `FadeUp` + `SpringButton` + `NumberTicker`
  - `/contact` → Contact, MAX 1 → `FadeUp` (form) + `SpringButton` only
  - `/work/[slug]` → Case Study, MAX 2 → `FadeUp` + `ClipReveal` (heading) + `SharedLayoutCard` (images)

### AuditHQ (SaaS Product — marketing + app)
- Site type: Hybrid (SaaS Marketing for `/`, SaaS App for `/app/*`, Documentation for `/docs/*`)
- Routes:
  - `/` → Homepage (marketing), SITE_MAX 3 → up to one Tier 3 moment (e.g. `PinnedSection` for "how the audit works")
  - `/pricing` → Pricing, MAX 1 (overrides SITE_MAX) → `FadeUp` + `SpringButton` only
  - `/app/audits` → Dashboard Home, MAX 2 → functional motion only
  - `/app/audits/[id]` → Dashboard Detail, MAX 2 → `SharedLayoutCard` morph
  - `/docs/[slug]` → Documentation Article, MAX 0–1 → `CSSScrollProgress` + `StickyHeader` only

### Gloss Beauty (local service business — mobile-bridal makeup)
- Site type: Local Service Business
- `SITE_MAX_TIER`: 1
- Routes:
  - `/` → Homepage, MAX 1 → `FadeUp` (hero text) + `SpringButton` (book button) only
  - `/gallery` → Service / Product Detail with images, MAX 1 (NOT 2 — local service ceiling beats role) → `FadeUp` (image grid mount only)
  - `/contact` → Contact, MAX 1 → static form + `SpringButton`
- NO custom cursors, NO Marquee, NO Tier 3. Pairs with [[feedback_no_custom_cursor_by_default]].

### Personal Portfolio (designer)
- Site type: Portfolio
- `SITE_MAX_TIER`: 4
- Routes:
  - `/` → Homepage, MAX 4 → `PinnedSection` or `CardStack` defensible
  - `/projects/[slug]` → Portfolio Project Detail, MAX 3 → `CursorParallax`, `TiltCard`, `ClipReveal` all in play
  - `/contact` → Contact, MAX 1 (overrides site) → form + button

---

## What this prevents

- **Cargo-culting motion ceiling from homepage to every route.** Pricing pages on a Tier-3 SaaS marketing site sit at Tier 1.
- **Forcing Tier 3 on routes where motion is harmful.** A documentation route on a SaaS Marketing site is still a documentation route.
- **Local-service Tier 2 drift.** Once the matrix says MAX 1, no route in a local-service site escalates.
