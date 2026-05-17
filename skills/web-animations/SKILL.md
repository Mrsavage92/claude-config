---
name: web-animations
description: Site-type-adaptive motion system for the web-* skill suite. Classifies the target site (12 types: local service, pro services, SaaS, ecommerce, portfolio, content, dashboard, documentation, nonprofit, etc.) and per-route role before choosing motion tier. Exports a tested kit of components (Tier 1–3 + zero-JS CSS scroll/View Transitions), a grader that audits projects for tier markers, reduced-motion guards, vestibular triggers, and site-type vs MAX_TIER compliance. Used by web-scaffold, web-page, web-evolve, animate, overdrive, polish.
---

# /web-animations

The decision matrix and runnable kit for web motion. Before any tier is chosen, the site is classified. The kit is the source of truth — SKILL.md describes the system, the kit ships the code.

**Runnable kit**: `~/.claude/skills/web-animations/kit/` — 19 tested components, `npm test` for vitest, `npm run test:e2e` for the reduced-motion Playwright spec. Components carry tier markers (`// web-animations: Tier N (Tn.m Name)`) so the grader can audit downstream projects.

**Grader**: `node ~/.claude/skills/web-animations/grader/audit-animations.mjs <project>` — emits JSON, exits non-zero on tier markers missing, reduce-guards missing, vestibular-trigger violations, or tier > site MAX_TIER. Reads optional `.evolution/site-profile.json` for site-type-aware checks.

---

## When to use this skill

- A new site (or section) needs motion and a tier has not yet been chosen
- A downstream skill (`web-scaffold`, `web-page`, `web-evolve`) is generating React + motion code and needs the routing rule
- An existing project needs a motion compliance audit (run the grader)

## When NOT to use

- Reviewing existing animation quality → `/animate`
- Polish / micro-state additions to a working feature → `/polish`
- 3D / shaders / R3F / Rive / Lottie → `/overdrive`
- Mirror another site's motion vocabulary → `/style-mirror` first, then this skill to implement

---

## Cardinal rules (load-bearing)

1. **Classify the site BEFORE choosing a tier.** See `references/site-types.md`. Output a `site-profile.json` even if the host project does not yet use one. Without classification, defaults bias toward marketing/brand sites — wrong for the majority of real projects. # source: `.forge-spec.md` Phase 0 capture rule
2. **Site MAX_TIER beats taste-skill defaults.** A Local Service site is Tier 1 even if the "design feels plain." Pairs with [[feedback_taste_calibration]] — my own instinct that "this needs motion" is the failure mode this rule exists to defeat.
3. **Per-route role can ratchet DOWN, never UP.** A SaaS Marketing site (MAX 3) has a `/pricing` route at MAX 1. See `references/route-roles.md`.
4. **Substitute reduced-motion, never strip.** `pulse → dissolve`, not `animation: none`. # source: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion + https://www.smashingmagazine.com/2020/09/design-reduced-motion-sensitivities/
5. **Six vestibular triggers fail the floor regardless of tier.** Scaling/zoom, spinning, parallax, plane-shift, peripheral, animated-blur. # source: https://webkit.org/blog/7551/responsive-design-for-motion/
6. **Kit components ARE the implementation.** SKILL.md describes routing; the kit ships code. Inline code samples in SKILL.md are banned (they drift from kit). # from forge: deduction C in `.forge-score.md` — inline code duplicates kit components.
7. **The grader is the contract.** If `grader/audit-animations.mjs` exits non-zero on the consuming project, the work is not done. Pairs with [[feedback_verify_outcome_not_surface]].
8. **User direction overrides everything.** "No animations" beats site type beats route role beats kit defaults. Pairs with [[feedback_no_gtm_nagging]] — when the user is fixing the product, do the fix, don't argue.

---

## Phase 0 — Site Diagnosis (mandatory first step)

Before importing any kit component, classify the target. Output `site-profile.json` to `.evolution/site-profile.json` (or `.audit/site-profile.json`) in the consuming project. Read `references/site-types.md` for the 12 classifications and their motion ceilings.

Minimum fields:

```json
{
  "type": "local-service | pro-services | saas-marketing | saas-app | ecommerce | marketplace | portfolio | content | nonprofit | event | documentation | dashboard | hybrid",
  "audience": "<one phrase>",
  "primary_action": "<verb>",
  "proof_maturity": "none | internal-only | sample-anon | one-case-study | several | mature",
  "motion_ceiling": 0,
  "motion_floor": 0,
  "routes": {
    "/path": { "role": "homepage | service-detail | pricing | contact | article | dashboard-home | ...", "motion_ceiling": 0 }
  }
}
```

For hybrid sites, every route gets its own `motion_ceiling` from `references/route-roles.md`.

If the consuming skill (e.g. `web-evolve`) cannot determine `type` from the project's `CLAUDE.md` or directory structure, **HALT with `NEEDS_HUMAN: cannot classify site type. Ask user.`** Do not proceed on a guess.

---

## Phase 1 — Floor rules (apply to every site, every tier)

See `references/floor-rules.md` for full text. Summary:

| Floor | Check |
|---|---|
| WCAG 2.3.3 — interaction-triggered motion must be disableable | Grader: every motion file has a reduce-guard in scope |
| Substitute, don't strip | Reduce path swaps property (transform → opacity), keeps duration |
| Six vestibular triggers (scaling, spin, parallax, plane-shift, peripheral, blur) | Grader detects via regex on animated properties; flags un-guarded usage |
| Dual-branch GSAP `matchMedia` | Every Tier 3 GSAP component uses `gsap.matchMedia()` with both `no-preference` and `reduce` branches |
| Compositor-only animated properties | `transform, opacity, clip-path, filter` only — NEVER `width, height, top, left, margin, padding, border, font-size, background-color` on large surfaces |
| Above-the-fold uses `animate="visible"` (mount), not `whileInView` | Inspection rule (no grader yet) |
| `whileInView` always has `viewport={{ once: true }}` | Inspection rule |

---

## Phase 2 — Tier selection

Tier comes from `site-profile.json`. The matrix is fixed; my role is to APPLY it, not negotiate it.

| Tier | What it includes | When justified |
|---|---|---|
| **0** | No motion at all | Legal pages, checkout payment, status pages, documentation articles |
| **1 — Baseline** | Mount fade-up, stagger, sticky header collapse, CSS scroll-progress bar | Default for most surfaces of most sites |
| **2 — Escalation** | Spring buttons, magnetic CTAs, number tickers, split-text reveals, marquees, animated modals, shared layout morphs | Marketing landing pages, dashboards (functional motion), portfolios |
| **3 — Signature** | GSAP pinned scrollytelling, Lenis smooth scroll, clip-path text reveals, cursor parallax, card stacks, 3D card tilt, CSS scroll-driven reveals, View Transitions API | ONE moment per page on SaaS Marketing / Portfolio / Event Hero |
| **4 — Overdrive** | R3F, shaders, Rive, Lottie, particles, generative art | Hand off to `/overdrive` — not in this kit |

See `references/site-types.md` for the per-type table and `references/route-roles.md` for per-route ceilings.

---

## Phase 3 — Import from the kit

Once tier is locked, import components from `~/.claude/skills/web-animations/kit/`. The kit is the implementation; SKILL.md describes which to use when.

| Tier | Kit components |
|---|---|
| 1 | `FadeUp`, `StaggerContainer`, plus the variants (`fadeUp`, `staggerContainer`, `fadeIn`) |
| 2 | `SpringButton`, `MagneticButton`, `NumberTicker`, `SplitReveal`, `Marquee`, `AnimatedModal`, `SharedLayoutCard` |
| 3 (JS) | `PinnedSection` (GSAP), `SmoothScroll` (Lenis), `ClipReveal`, `CursorParallax`, `CardStack`, `TiltCard`, `StickyHeader` |
| 3 (zero-JS) | `CSSScrollReveal` (uses `animation-timeline: view()`), `CSSScrollProgress` (uses `animation-timeline: scroll()`), `TransitionLink` + `startTransition()` (View Transitions API) |
| 4 | Not in this kit. `/overdrive`. |

**Default to zero-JS Tier 3 for content/blog/docs/portfolio site types.** The JS Tier 3 components are for SaaS Marketing where motion is one of multiple complex orchestrated effects per page. # source: https://developer.chrome.com/articles/scroll-driven-animations/ + https://developer.chrome.com/docs/web-platform/view-transitions/same-document

Every kit component carries a tier marker comment (`// web-animations: Tier N (Tn.m Name)`). Preserve markers on copy — the grader reads them.

---

## Phase 4 — Skill routing (which skill fires when)

| Task | Fire | Don't fire |
|---|---|---|
| Build motion for a NEW component/page | `/web-animations` (this skill) + `/web-scaffold` or `/web-page` | `/animate`, `/polish` |
| Review existing animation quality | `/animate` | `/web-animations` |
| Add polish to a working feature | `/polish` or `/delight` | `/web-animations` (the kit is already what `/polish` reaches for) |
| 3D / shaders / particles / R3F / Rive / Lottie | `/overdrive` | This skill — stops at Tier 3 |
| Score a route's animation tier compliance | grader script + `/web-evolve` | Manual review |
| Mirror another site's motion vocabulary | `/style-mirror` FIRST (extracts the tokens), then `/web-animations` to implement | Either alone — `/style-mirror` alone doesn't extract motion timings |

---

## Phase 5 — Verify (the grader is the contract)

```bash
node ~/.claude/skills/web-animations/grader/audit-animations.mjs ./apps/marketing
```

Output (JSON to stdout):

```json
{
  "siteProfile": { "path": ".evolution/site-profile.json", "type": "saas-marketing", "maxTier": 3 },
  "summary": {
    "totalFilesScanned": 42,
    "filesWithMarkers": 8,
    "filesUsingMotionWithoutMarker": 0,
    "tier3FilesMissingReducedMotionGuard": 0,
    "tier3GsapFilesMissingDualBranch": 0,
    "vestibularTriggersWithoutGuards": 0,
    "tierExceedingSiteMax": 0,
    "tierBreakdown": { "1": 4, "2": 3, "3": 1, "4": 0 }
  }
}
```

Non-zero exit on any of:
- `filesUsingMotionWithoutMarker > 0`
- `tier3FilesMissingReducedMotionGuard > 0`
- `vestibularTriggersWithoutGuards > 0`
- `tierExceedingSiteMax > 0`

`/web-evolve` should call this after every iter and treat failures as P0 fixes.

---

## Anti-patterns (≥6 ship-blockers, each tied to a forge deduction)

1. **Forcing Tier 3 on a Local Service / Content / Docs / Dashboard site.** # from forge: Phase 2 deduction "Tier 3 gating absent". Local-service Tier 1 ceiling is enforced by `references/site-types.md` + grader's `tierExceedingSiteMax` check.
2. **Inline animation code in SKILL.md that drifts from kit.** # from forge: Phase 2 deduction C — "inline snippets in SKILL.md duplicate kit components". Kit is now the source of truth.
3. **Awwwards / SOTM / Bruno Simon defaults applied to non-marketing sites.** # from forge: spec score-down trigger. Pairs with [[feedback_taste_calibration]]. Override path: `references/site-types.md` per-type matrix.
4. **Custom cursor by default.** Banned across every site type EXCEPT Portfolio with explicit user authorization. Pairs with [[feedback_no_custom_cursor_by_default]]. Grader does not yet detect; flagged in `references/site-types.md`.
5. **`animation: none` as the reduce-motion path.** Substitute, don't strip. # source: MDN + Smashing classification table in `references/animation-classification.md`.
6. **Parallax on a Local Service or Content site even with reduce-guard.** Six-trigger rule — parallax is in category 3, banned on sites with MAX_TIER ≤ 1 regardless of guard. # source: WebKit blog. Grader catches via `vestibularTriggersWithoutGuards` + `tierExceedingSiteMax`.
7. **GSAP single-branch reduce check instead of `matchMedia` dual-branch.** Single-branch `if (matchMedia(...).matches) return` leaves the reduce path untested. Dual-branch keeps both code paths runnable. # source: https://gsap.com/resources/getting-started/accessibility/. Grader catches via `tier3GsapFilesMissingDualBranch`.
8. **Motion on data viz axes / chart drawings.** Causes chart misread. Dashboard-specific failure mode. `references/site-types.md` row 12 spells this out.

---

## Output artifacts

| File | Purpose |
|---|---|
| `references/site-types.md` | 12 site classifications × MAX_TIER × banned moves |
| `references/route-roles.md` | 24 route roles × MAX_TIER × allowed kit components |
| `references/floor-rules.md` | WCAG 2.3.3, six vestibular triggers, substitute-not-strip, compositor-only |
| `references/animation-classification.md` | Smashing triggering/safe/substitution table + per-kit-component class |
| `references/bundle-budget.md` | Library sizes (bundlephobia-cited) × tier-required-from × lazy-load recipe |
| `references/debugging.md` | Top 10 failure modes + grader-violation interpretation |
| `references/a11y.md` | 8 a11y layers beyond reduced-motion — focus, screen-reader, modals, pause/stop/hide |
| `kit/src/` | 19 tested component .tsx files (Tier 1/2/3) |
| `kit/tests/` | vitest unit tests + Playwright reduced-motion spec |
| `grader/audit-animations.mjs` | Project compliance auditor |

---

## Related skills

- `/web-scaffold` — scaffold new project; reads this skill's kit + `references/site-types.md` to set initial motion ceiling
- `/web-page` — build a single route; reads `references/route-roles.md` for the route's MAX_TIER
- `/web-evolve` — improvement loop; runs the grader after every iter, treats violations as P0
- `/animate` — reviews existing motion (read-side counterpart to this skill's build-side)
- `/polish` — applies the kit's Tier 1/2 components to a working feature
- `/overdrive` — Tier 4 (R3F, shaders, Rive, Lottie) — not covered here
- `/style-mirror` — extract a reference site's motion tokens; this skill implements them
