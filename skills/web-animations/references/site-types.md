# Site-Type Classification Matrix

The skill MUST classify the target site before recommending any motion. This file lists 12 site types with their motion ceilings, recommended Tier, and what is banned regardless of user request.

`MAX_TIER` is the ceiling: the highest tier any motion on the site may use. `FLOOR_TIER` is the minimum (default for hero entrance). Anything between is allowed.

Pairs with [[feedback_taste_calibration]] and [[feedback_audithq_orbit_strict_separation]] — motion belongs to the audience and purpose, not the brand's aspirations.

---

## Classification questions (run in this order)

1. **What is the primary conversion action?** (form submit, purchase, signup, contact, read, browse, download)
2. **What is the audience's primary device & context?** (phone in transit, desktop at work, kiosk, large-screen TV)
3. **Is there a real "wow" budget?** (portfolios YES, contact forms NO)
4. **Does motion serve content or decorate it?** (serves: dashboard transitions, focus rings; decorates: hero gradient blob)
5. **Are there any per-route exceptions?** (marketing homepage at Tier 3, /docs at Tier 1 in the same site)

Output to `.evolution/site-profile.json` (or equivalent) BEFORE any kit components are imported.

---

## 12 Site Types

### 1. Local Service Business (plumber, dentist, makeup artist, builder)
- `MAX_TIER`: 1
- `FLOOR_TIER`: 1
- Primary action: phone, enquiry form, booking
- Banned: parallax, custom cursor, signature scroll moves, animated hero blobs, particle backgrounds, GSAP pinning
- Why: audience is typically transactional, often on mobile, often in transit. Motion competes with clarity and trust. Pairs with [[feedback_no_custom_cursor_by_default]].
- Allowed components from kit: `FadeUp` (mount, ≤ 2 per page), `SpringButton` (subtle), `StickyHeader` (collapse only). Nothing else.

### 2. Professional Services / Agency
- `MAX_TIER`: 2
- `FLOOR_TIER`: 1
- Primary action: enquiry, case study read, consultation booking
- Banned: shader backgrounds, scroll-jacking, infinite parallax
- Why: motion can signal craft, but agency sites that overdo motion lose enterprise buyers
- Allowed kit: `FadeUp`, `StaggerContainer`, `SpringButton`, `Marquee` (logo cloud only), `SharedLayoutCard` (work grid → modal), `ClipReveal` (sparingly on heading reveals)

### 3. SaaS Product (marketing site for app)
- `MAX_TIER`: 3 (selectively — one signature moment max)
- `FLOOR_TIER`: 1
- Primary action: signup, demo request, plan selection
- Banned: motion that obscures pricing, motion that delays CTA visibility
- Why: motion proves product is alive; one signature scroll moment is justifiable, but motion on every section is noise
- Allowed kit: most Tier 1-2, ≤ 1 Tier 3 per route (typically a `CardStack` or `PinnedSection` for "how it works")

### 4. SaaS App (in-product UI)
- `MAX_TIER`: 2 (no signature moves)
- `FLOOR_TIER`: 1
- Primary action: task completion, data manipulation, navigation between views
- Banned: ALL Tier 3, custom cursors, parallax, scroll-jacking, page transitions over 300ms
- Why: motion in an app is functional feedback (state changes, focus, presence) not delight. Tier 3 in an app reads as "vibe-coded toy"
- Allowed kit: `SpringButton`, `AnimatedModal`, `SharedLayoutCard` (row-to-detail), `NumberTicker` (for stat cards). All Tier 2 short durations (< 300ms)

### 5. Ecommerce
- `MAX_TIER`: 2 (Tier 3 only on hero of homepage, never on PDP or checkout)
- `FLOOR_TIER`: 1
- Primary action: add to cart, purchase
- Banned: motion that delays product image load, motion that hides price, modals on checkout
- Why: purchase confidence is fragile; motion that interrupts the buy flow costs revenue. Sources: WCAG 2.3.3 — interaction-triggered motion must not block essential information
- Allowed kit: `FadeUp` (collection grid), `SharedLayoutCard` (quick view modal), `NumberTicker` (price strikethrough only), `Marquee` (trust badges only)

### 6. Marketplace (two-sided: providers + buyers)
- `MAX_TIER`: 2
- `FLOOR_TIER`: 1
- Primary action: search, filter, contact provider
- Banned: Tier 3 anywhere; search UX must be instantaneous
- Why: marketplace UX is filter-driven; motion competes with search responsiveness
- Allowed kit: `FadeUp` (listing grid), `SpringButton` (filter chips), `AnimatedModal` (provider detail)

### 7. Portfolio (designer, developer, agency principal)
- `MAX_TIER`: 4 (this is one of the few site types where motion IS the product)
- `FLOOR_TIER`: 2
- Primary action: case study read, contact, hire decision
- Banned: motion that fails reduced-motion (must always have substitute path)
- Why: portfolio is the credential; motion that demonstrates craft is appropriate
- Allowed kit: anything in the kit + `/overdrive` for one signature moment. `CursorParallax`, `TiltCard`, `PinnedSection`, `ClipReveal` all defensible

### 8. Content / Publication (blog, news, magazine, newsletter)
- `MAX_TIER`: 1
- `FLOOR_TIER`: 1
- Primary action: read article, subscribe, share
- Banned: scroll-jacking, parallax, hero entrance > 600ms, infinite animations, ANY motion on body text
- Why: reading is the action; motion competes with reading. Source: Smashing classification — "Parallax effects → highly triggering"
- Allowed kit: `FadeUp` (cards on index page only), `StickyHeader` (collapse), `CSSScrollProgress` (reading-progress bar — zero JS). Nothing else.

### 9. Nonprofit / Cause
- `MAX_TIER`: 1 (Tier 2 allowed only on impact-stat ticker)
- `FLOOR_TIER`: 1
- Primary action: donate, volunteer, share
- Banned: anything that reads as "polished agency" — undermines authenticity. Custom cursors, signature moves, parallax all wrong
- Why: cause sites are evaluated on trust + clarity, not craft
- Allowed kit: `FadeUp`, `NumberTicker` (impact stats — single number), `SpringButton`. Nothing else.

### 10. Event / Venue
- `MAX_TIER`: 3 (Tier 3 only on event hero — date + location + CTA — never on ticketing flow)
- `FLOOR_TIER`: 2
- Primary action: buy ticket, RSVP, see schedule
- Banned: motion on ticketing checkout, modal stacks, autoplay video over CTA
- Why: events have an anticipation/excitement element that Tier 3 can serve, but ticketing is purchase UX and must be Tier 2 max
- Allowed kit: most of Tier 1-2 + `PinnedSection` or `CardStack` for schedule reveal

### 11. Documentation / Developer Tool
- `MAX_TIER`: 1 (zero motion on code blocks, examples, sidebar nav)
- `FLOOR_TIER`: 0
- Primary action: find answer, copy code, run example
- Banned: every Tier 3, parallax, page transitions > 200ms, hero animations on doc index
- Why: developer reading docs cannot read while things move. Tier 0 = no motion at all is often correct.
- Allowed kit: `StickyHeader` (TOC collapse), `CSSScrollProgress` (reading progress only). Nothing else.

### 12. App Dashboard / Internal Tool
- `MAX_TIER`: 2
- `FLOOR_TIER`: 1
- Primary action: scan KPIs, drill into row, take action
- Banned: motion on data viz axes (causes chart misread), Tier 3 anywhere, parallax, custom cursors
- Why: dashboard motion must be functional — state changes, focus, drill-in. Pairs with [[feedback_no_jargon_in_adam_marketing_copy]] applied to motion: motion in a dashboard is utility, not personality
- Allowed kit: `SpringButton`, `SharedLayoutCard` (row → detail), `AnimatedModal`, `NumberTicker` (KPI cards), `StickyHeader`

### 13. Hybrid (one site, multiple roles — e.g. marketing + app)
- `MAX_TIER`: per-route (use Route Role Matrix from `references/route-roles.md`)
- Action: each route gets its own ceiling. `/` = type 3 SaaS Marketing (Tier 3 OK on hero). `/app/*` = type 4 SaaS App (Tier 2 max). `/docs/*` = type 11 Documentation (Tier 1 max).
- This is where most real sites live. Don't classify the WHOLE site — classify per route.

---

## Classification → Tier matrix (quick reference)

| Site Type | MAX_TIER | FLOOR | Tier 3 OK? | Custom Cursor OK? | Parallax OK? |
|---|---|---|---|---|---|
| Local Service | 1 | 1 | NO | NO | NO |
| Pro Services / Agency | 2 | 1 | NO | NO | NO |
| SaaS Marketing | 3 | 1 | 1 moment max | NO (default) | Hero only |
| SaaS App | 2 | 1 | NO | NO | NO |
| Ecommerce | 2 (hero=3) | 1 | Hero only | NO | NO |
| Marketplace | 2 | 1 | NO | NO | NO |
| Portfolio | 4 | 2 | YES | If brand-authored | YES |
| Content / Publication | 1 | 1 | NO | NO | NO |
| Nonprofit | 1 | 1 | NO | NO | NO |
| Event / Venue | 3 | 2 | Hero only | NO | Hero only |
| Documentation | 1 | 0 | NO | NO | NO |
| App Dashboard | 2 | 1 | NO | NO | NO |
| Hybrid | per-route | per-route | per-route | per-route | per-route |

---

## Overrides

Three (and only three) things can override the matrix:

1. **User direction** — "Adam said: no animations at all" beats taste-skill, gap diffs, evolution priorities, everything. Pairs with [[feedback_anchor_to_revenue_not_easy]] (don't add features that don't serve revenue) and [[feedback_no_gtm_nagging]] (when fixing, fix — don't pivot).
2. **Per-route role** — homepage of a SaaS Marketing site may sit at Tier 3 even though /checkout on the same site sits at Tier 1. See `route-roles.md`.
3. **Replication mode** — if `/style-mirror` is active, the reference site's motion vocabulary IS the spec; this matrix is suspended for the duration. The mirror is honest replication, not opinion.

Without one of these three, the matrix is the answer. Adam's own past instinct ("this looks plain — add motion") is NOT an override. It's the thing this matrix is meant to defeat. Pairs with [[feedback_no_self_quality_claims]] and [[feedback_taste_calibration]].
