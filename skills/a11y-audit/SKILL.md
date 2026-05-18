---
name: a11y-audit
description: "Scan a frontend project for WCAG 2.2 accessibility violations and optionally auto-fix them. Now load-bearing on runtime contrast — every public route is rendered in a browser, every visible text element is measured against the 4.5:1 / 3:1 thresholds, and globally-scoped CSS theme overrides are detected by static lint. Use when auditing for accessibility compliance, fixing missing alt text / labels / contrast, hunting invisible-text bugs, or validating before a release."
metadata:
  version: 2.0.0
  user-invocable: true
argument-hint: "[path] [--baseUrl http://localhost:3000] [--routes /,/about,/pricing]"
---

# /a11y-audit

Scan a frontend project for WCAG 2.2 issues and auto-fix what's safe. Three layers, in order:

1. **Static lint** — file-level checks for the failure modes that don't need a browser.
2. **Runtime contrast scan** — every public route, every visible text element, real cascaded colors.
3. **Manual review** — heading order, ARIA, focus traps. Reported only — never auto-fixed.

This skill exists because of the 2026-05-18 Orbit Digital invisible-nav bug: a global `:root` block overrode brand color tokens to white, and every marketing page rendered white nav text on a cream hero (~1.05:1 contrast). Source grep didn't catch it — the bug only emerges from the cascade. Hence the load-bearing runtime gate below.

---

## Cardinal rules

1. **Runtime contrast is mandatory, not optional.** Scoring contrast from CSS-source values alone misses the cascade. Every audit must include the puppeteer / chrome-devtools-mcp pass over every public route. If no MCP browser is available, HALT with `NEEDS_HUMAN: cannot run runtime contrast scan, no browser MCP connected`.
2. **Every public route, not the homepage.** The Orbit bug was visible on the homepage but the architectural cause affected every marketing page. Audit the whole sitemap — homepage, /about, /pricing, /services/*, /blog/*, /login, /reset-password, anything else served. If the sitemap is 50+ routes, sample one route per route-role (marketing-home, marketing-content, auth, dashboard) plus any route the user names.
3. **Composite translucent foregrounds before scoring.** `text-white/70` against a dark surface is NOT 1.38:1 — that's a false positive from naive contrast scorers that ignore alpha. Use the included `contrast_scorer.mjs` (handles rgb / rgba / hsl / hsla / hex / oklab / oklch with proper compositing).
4. **Report file:line for every finding.** A finding without a citation is unverifiable. For runtime findings, cite the route + selector + computed fg/bg + ratio. For static findings, cite the CSS file + line.
5. **Don't auto-fix anything that changes brand colors.** Auto-fix is for missing alt, missing aria-label, missing `lang`, missing `type="button"`, focus-visible restoration. Anything that touches color requires user confirmation — token recolor decisions are design decisions, not a11y decisions.

---

## Phase 0 — Inventory (mandatory, < 30 seconds)

Before running anything, build the route inventory:

1. Read `public/sitemap.xml` if it exists.
2. Otherwise glob `src/app/**/page.{tsx,ts,jsx,js}` (Next.js App Router) or `src/pages/**/*.{tsx,ts,jsx,js}` (Pages Router / Vite + React Router).
3. List the discovered routes. If > 50, group by role (marketing-home / marketing-content / auth / dashboard / admin / blog-index / blog-post / settings / other) and pick one canonical route per role plus any route the user names.

Capture:
- Total routes discovered
- Routes selected for audit (one per role + user-named)
- Base URL for the runtime scan (default `http://localhost:3000`, override with `--baseUrl`)
- CSS files to lint (default `src/**/*.css`, `src/**/*.scss`)

If no dev server is running at the base URL, start one. Default commands tried in order: `npm run dev`, `pnpm dev`, `yarn dev`. Wait until the server emits a "ready" or "Local:" line before proceeding.

---

## Phase 1 — Static lint (CSS theme-scope, ~1 second)

```bash
node ~/.claude/skills/a11y-audit/scripts/theme_scope_lint.mjs <css-files...>
```

Exit codes:
- `0` — no findings
- `1` — warnings only (e.g. body block hardcodes color)
- `2` — BLOCKING: unscoped `:root` brand-token shadow detected

**If exit 2:** the CSS contains a `:root` block that redefines tokens already set by an earlier `:root` without `.dark` or `[data-theme]` scope. This is the Orbit bug class. STOP — fix the override or move it under a class scope before continuing the audit. The runtime scan that follows will produce thousands of false positives on top of a broken cascade.

The lint also flags `body { background-color: …; color: …; }` blocks that hardcode colors instead of referencing CSS variables. Hardcoded body colors cannot be re-themed and frequently shadow brand tokens.

---

## Phase 2 — Runtime contrast scan (per route, ~3 seconds each)

For each selected route, the audit:

1. Navigates the browser to `<baseUrl><route>` (via `mcp__chrome-devtools__navigate_page` or `mcp__puppeteer__puppeteer_navigate`).
2. Sets viewport to 1440×900 (desktop). Repeat at 375×667 (mobile) if `--responsive` is passed.
3. Injects `contrast_scorer.mjs` via `evaluate_script` / `puppeteer_evaluate`.
4. Captures `{ url, viewport, checkedCount, failureCount, failures: [{ selector, text, fg, bg, ratio, threshold, large }] }`.

The scorer:
- Walks every `h1-h6, p, a, button, span, li, label, input, td, th, figcaption, summary, strong, em, dt, dd`.
- Skips invisible elements (`display:none`, `visibility:hidden`, `opacity:0`, zero-size box).
- Reads `getComputedStyle(...).color` AND `getComputedStyle(...).backgroundColor`.
- Walks ancestors to find the first fully opaque background, compositing translucent layers along the way.
- Composites the translucent foreground (`rgba(255,255,255,0.7)` etc.) onto the resolved background before computing relative luminance.
- Parses every CSS color form: `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()`, `hsl()`, `hsla()`, `oklab()`, `oklch()`.
- Fails when ratio < 4.5 for normal text or < 3 for large text (≥24px, or ≥18.66px bold per WCAG 2.2 SC 1.4.3 large-text definition).

Returns the bottom 50 failures sorted by ratio ascending. Report includes:
- Total elements checked per route
- Failure count per route
- Worst 10 failures globally (route + selector + ratio + computed colors)

To invoke the scorer inside an `evaluate_script` call:

```js
// Read scripts/contrast_scorer.mjs and pass its `contrastScorerSource` to evaluate.
// The source is an IIFE that returns the result object — no extra wiring needed.
```

If running outside an MCP context (e.g. CI), spawn puppeteer-core directly:

```bash
node ~/.claude/skills/a11y-audit/scripts/contrast_scan_cli.mjs \
  --baseUrl http://localhost:3000 \
  --routes /,/about,/pricing
```

(Note: `contrast_scan_cli.mjs` is an optional thin wrapper around `puppeteer-core` — add it when CI integration is needed. The MCP-driven path is the canonical one for interactive audits.)

---

## Phase 3 — Static HTML / JSX lint (auto-fixable)

Scan all `*.tsx / *.jsx / *.html` for the cheap stuff:

- Missing `alt` on `<img>` (auto-fix: add `alt=""` for decorative; ASK for descriptive).
- Missing `lang` on `<html>` (auto-fix: add `lang="en"` or project locale).
- Missing form labels (`<input>` without `<label htmlFor>` and without `aria-label` / `aria-labelledby`).
- Missing icon-only button labels (`<button>` with only an `<svg>` or icon child, no `aria-label`).
- `tabindex > 0` (auto-fix: set to 0).
- `<div onClick>` / `<span onClick>` without `role` and `tabIndex` (manual — needs intent).
- Heading-order violations (`<h1>` followed by `<h3>` skipping `<h2>`).
- Missing `type="button"` on non-submit `<button>` inside `<form>` (auto-fix).
- Skip-nav link missing from the root layout (auto-fix: add `<a href="#main-content" class="sr-only focus:not-sr-only ...">`).

Group findings by severity: critical (blocking submit, blocking nav) → serious (icon-only button without label) → moderate (heading skip) → minor (missing dir attribute).

---

## Phase 4 — Manual-review queue (reported, never auto-fixed)

These need human eyes:

- Color combinations that pass automated contrast but feel uncomfortable (review against design intent).
- Focus traps in modals — verify Escape + tab cycle actually works.
- ARIA role correctness — auto-detection produces noise.
- Animation that ignores `prefers-reduced-motion` — flagged by `web-animations` skill, cross-reference here.
- Auto-playing media without controls.

Output: a `manual-review.md` list at the end of the report.

---

## Phase 5 — Report

Write `a11y-report.md` at the project root with:

```
# a11y-audit report — <date>

## Summary
Routes audited:    X / Y total
Contrast failures: X (across N routes)
Static findings:   crit X | serious X | moderate X | minor X
Theme-scope lint:  PASS / FAIL — N findings
Verdict:           SHIP / FIX CRITICALS FIRST / DO NOT DEPLOY

## Theme-scope findings (load-bearing — fix before runtime scan trusted)
[file:line] [rule] [shadow tokens] [hint]

## Runtime contrast failures (sorted by ratio ascending)
[route] [selector] [text excerpt] [fg] [bg] [ratio] [threshold]

## Static HTML / JSX findings (auto-fixed unless USER ACTION REQUIRED)
[file:line] [rule] [before -> after]

## Manual review
[file:line] [issue] [why automated tools can't auto-fix]

## What was auto-fixed in this run
[file:line] [change applied]
```

---

## Anti-patterns

- **"Sampled one page, looked fine."** The bug pattern that triggered this skill rewrite was invisible on the homepage at one moment and broke every other marketing page at the same moment. Always audit the whole route set per Phase 0.
- **"Source contrast looked OK."** The CSS source had `color: hsl(var(--gl-charcoal-mid))` resolving to dark charcoal — but the cascaded computed value was white. Source inspection is insufficient. Run the runtime scan.
- **"Skipped the dev server — too slow."** Without a running server, there is no cascade to measure. HALT instead of pretending to audit.
- **"Auto-fixed a contrast failure by darkening the foreground token."** Token color changes are design decisions. Auto-fix only the structural / markup issues (Phase 3 list). For color, propose options to the user.
- **"Reported `failureCount: 130`, didn't read the failures."** The 130-failure number on Orbit's /pricing was almost entirely OKLab false positives caused by a buggy inline scorer. Always inspect the top 10 worst before reporting — the scorer in this skill handles OKLab correctly, but trust nothing until you've eyeballed the worst case.

---

## Related skills

- `/web-animations` — motion governance + grader (handles `prefers-reduced-motion`, complementary to this skill's color focus).
- `/critique` — design review (covers hierarchy, density, brand fit — not WCAG).
- `/review` — universal deep review (use `/review` first on a full project; this skill is the a11y-specific deep dive).
- `/tdd` — add accessibility-focused tests after fixing violations.

## File reference

- `SKILL.md` — this file.
- `scripts/contrast_scorer.mjs` — the runtime contrast scorer (IIFE source ready to inject via evaluate_script).
- `scripts/theme_scope_lint.mjs` — the CSS architecture lint.
- `scripts/__fixtures/bad_theme_override.css` — regression fixture for the Orbit bug class.
- `references/wcag-quick-ref.md` — optional reference; not load-bearing.
- `references/aria-patterns.md` — optional reference; not load-bearing.
