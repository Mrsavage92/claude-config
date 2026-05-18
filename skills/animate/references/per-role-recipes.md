# Per-Role Animation Recipes

Quick reference: what animations belong on which kind of route. Source: synthesised from `~/.claude/skills/web-animations/references/route-roles.md` + Phase 3 production examples (motion.dev, Vercel/Linear/Stripe pricing components).

Use this table BEFORE proposing edits. Read the host project's `.evolution/site-profile.json` to find the route's role, then pick from this row only.

---

## The matrix

| Role | MAX_TIER | Allowed moves | Banned moves | Hero moment |
|---|---|---|---|---|
| **Homepage (marketing)** | site-inherits | StaggerContainer + FadeUp on sections; one Tier 3 scroll moment | Custom cursor, full-page parallax stack | Scroll-driven reveal OR pinned section ONCE |
| **Pricing** | 1 | FadeUp on rows (mount); SpringButton on plan CTA only | Tier 2+, layoutId, magnetic, marquee | Hero heading stagger (one moment) |
| **Auth / Signup / Login** | 1 | FadeUp on form mount; spinner state-transition | Tier 2+, scroll motion, hero animation | None — task page |
| **Contact / Enquiry** | 1 | FadeUp on form mount; success state fade-in | Tier 2+, button springs at >1.05 scale | Submit-success acknowledgement |
| **About / Team** | 2 | FadeUp, Marquee (logos), SharedLayoutCard (team grid) | scroll-jacking, parallax | One narrative-flow moment |
| **Blog Index** | 1 | FadeUp (cards mount) | Tier 2+ on a list | None |
| **Article / Blog Post** | 1 (or 0) | `CSSScrollProgress` (reading bar), `StickyHeader` | All other motion (it's text — motion competes with reading) | None |
| **Case Study** | 2 | FadeUp, ClipReveal (headline), SharedLayoutCard (image gallery) | scroll-jacking | One editorial reveal |
| **Portfolio Project Detail** | 3 | Most of kit (CursorParallax, TiltCard, PinnedSection, ClipReveal) | None — this is where motion = craft proof | One signature scroll moment |
| **Comparison / Versus** | 2 | FadeUp, NumberTicker (deltas), Marquee (feature parity) | Motion that biases toward one side | None — comparison must be neutral |
| **Checkout — Cart** | 1 | SpringButton only | Modals, large entrance | Order confidence (mount) |
| **Checkout — Payment** | 0 | None | Everything | None — zero motion |
| **Order Confirmation** | 1 | FadeUp (success state), NumberTicker (total) | Tier 2+ | Confirmation reveal |
| **Dashboard Home** | 2 | SpringButton, NumberTicker, SharedLayoutCard, AnimatedModal | Tier 3, scroll-driven, parallax, custom cursor | None — functional motion only |
| **Dashboard Detail / Drill-in** | 2 | SharedLayoutCard (row → detail), AnimatedModal | Tier 3+ | Drill-in morph |
| **Settings / Account** | 1 | SpringButton, AnimatedModal (confirm), NumberTicker (usage) | Tier 2+, entrance choreography | None — task page |
| **Search Results** | 1 | FadeUp (cards, staggerChildren ≤ 0.03s) | Slow staggers (>0.05s) — speed perception matters | None |
| **Documentation Article** | 0–1 | `CSSScrollProgress`, `StickyHeader` | All other motion | None |
| **Legal / Terms / Privacy** | 0 | None | Everything | None |
| **404 / Error** | 1 | FadeUp (message mount) | Tier 2+ | One reveal |
| **Status Page** | 0 | None | Everything | None — calm + factual |

---

## How to use this in /animate

1. Read `<project>/.evolution/site-profile.json` (or `.audit/site-profile.json`).
2. Extract the route's `role` (or look up the URL pattern).
3. Match to a row above.
4. Constrain ALL proposals to `MAX_TIER` AND `Allowed moves` columns.
5. Designate hero moment per the `Hero moment` column.
6. Explicitly list `Banned moves` in the "What I deliberately did NOT propose" section of the artifact.

---

## Anti-patterns this table prevents

- Adding `magnetic-button` to a pricing page (Tier 2 on a Tier 1 route)
- Putting a parallax hero on a dashboard
- Animating text headings on a doc article
- Adding entrance choreography to /checkout/payment (purchase confidence destroyed)
- Adding three "delight moments" to a list of search results (speed perception destroyed)
- Marquee on a comparison page (motion in motion = visual noise)
- Custom cursor on anything except portfolio (per `feedback_no_custom_cursor_by_default`)
