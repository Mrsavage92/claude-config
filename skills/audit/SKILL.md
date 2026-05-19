---
name: audit
description: Run technical quality checks across accessibility, performance, theming, responsive design, and anti-patterns. Generates a scored report with P0-P3 severity ratings and actionable plan. Use when the user wants an accessibility check, performance audit, or technical quality review.
argument-hint: "[area (feature, page, component...)]"
metadata:
  version: 2.1.1
  user-invocable: true
---

## MANDATORY PREPARATION

Invoke /impeccable — it contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no design context exists yet, you MUST run /impeccable teach first.

---

Run systematic **technical** quality checks and generate a scored report. Don't fix issues — document them for other commands to address.

This is a code-level audit, not a design critique. Check what's measurable and verifiable in the implementation.

## Measurement Availability Gate (load-bearing)

Before scoring any dimension, confirm what you can measure in the current environment:

| Tool | Available? | If unavailable, mode |
|---|---|---|
| `mcp__chrome-devtools__lighthouse_audit` | check by attempting `mcp__chrome-devtools__new_page` first | heuristic-mode for Accessibility + Performance |
| `mcp__chrome-devtools__performance_start_trace` | requires chrome-devtools-mcp connected | heuristic-mode for Performance, score CAPPED at 2/4 |
| Live URL or dev server reachable | curl / fetch the URL first | source-only mode for Responsive + Theming |
| Source files on disk | `Read`/`Grep` the component file | required — without this, HALT and ask the user for the file path |

**Severity assignment rule (from source: `[[forge-sources]]` Source 1 + Source 5):**

- Findings VERIFIED by an available measurement → assign `P0`/`P1`/`P2`/`P3` per the severity definitions below.
- Findings NOT verifiable in the current environment → tag `[UNMEASURED]` and route to the "Deferred / Re-run with tools" section. Do NOT assign a P-tier to unmeasured items.
- Heuristic-mode dimensions are score-capped at 2/4 — the cap is explicit, not implicit.

Reasoning: assigning P-severity to unmeasured findings is the anti-pattern flagged in the cycle 2026-05-18 review. Severity must be earned by evidence.

## Citation Hygiene (load-bearing)

Every quantitative or structural claim in the artifact must include the cited evidence INLINE, not as a reference to another file.

- WRONG: "Per the input bundle, header has `position: fixed`."
- RIGHT: "Header has `position: fixed; z-index: 9999` — captured value from `getComputedStyle(headerEl).position` at 2026-05-18 capture."

If the cited source is a screenshot, embed a one-line description ("desktop 1440×900: bottom border invisible") instead of pointing the reader at the screenshot file. The reader of the artifact does not have the source files you do.

## Diagnostic Scan

Run checks across 5 dimensions. Score each dimension 0-4 using the criteria below.

### 1. Accessibility (A11y)

**Measure first (preferred):** if a dev server or live URL is reachable:
- `mcp__chrome-devtools__lighthouse_audit(device="mobile")` and `(device="desktop")` — captures the Accessibility category with audit-by-audit detail (colour contrast, ARIA, semantic HTML, form labels, etc.)
- `mcp__chrome-devtools__take_snapshot()` — accessibility tree (verify ARIA roles, landmarks, focus order, interactive element labelling)

Use Lighthouse Accessibility score as the primary score. Code-inspect for source-level fixes.

**Check for** (code-level — root causes):
- **Contrast issues**: Text contrast ratios < 4.5:1 (or 7:1 for AAA)
- **Missing ARIA**: Interactive elements without proper roles, labels, or states
- **Keyboard navigation**: Missing focus indicators, illogical tab order, keyboard traps
- **Semantic HTML**: Improper heading hierarchy, missing landmarks, divs instead of buttons
- **Alt text**: Missing or poor image descriptions
- **Form issues**: Inputs without labels, poor error messaging, missing required indicators

**Score 0-4**: 0=Inaccessible (fails WCAG A), 1=Major gaps (few ARIA labels, no keyboard nav), 2=Partial (some a11y effort, significant gaps), 3=Good (WCAG AA mostly met, minor gaps), 4=Excellent (WCAG AA fully met, approaches AAA)

### 2. Performance

**Measure first (preferred):** if a dev server or live URL is reachable, capture real-Chrome data before code inspection:

1. `mcp__chrome-devtools__new_page(url={url})`
2. `mcp__chrome-devtools__performance_start_trace(reload=true, autoStop=true)` → `performance_stop_trace()` — returns LCP, INP, CLS, TBT, and a list of blocking insights
3. For each insight: `mcp__chrome-devtools__performance_analyze_insight(insightName=...)` — exact blocking resources + estimated savings
4. `mcp__chrome-devtools__lighthouse_audit(device="mobile")` — Best Practices score (image format, caching, compression)
5. `mcp__chrome-devtools__list_console_messages(types=["error","warn"])` — runtime perf warnings (e.g. forced reflow)
6. `mcp__chrome-devtools__list_network_requests()` — payload sizes; sort by `transferSize` desc

Use measured numbers to score. Then code-inspect for the source-level causes below.

**Check for** (code-level — root causes that produced the measured numbers above):
- **Layout thrashing**: Reading/writing layout properties in loops
- **Expensive animations**: Animating layout properties (width, height, top, left) instead of transform/opacity
- **Missing optimization**: Images without lazy loading, unoptimized assets, missing will-change
- **Bundle size**: Unnecessary imports, unused dependencies
- **Render performance**: Unnecessary re-renders, missing memoization

**Score 0-4 (when chrome-devtools-mcp connected — measured)**:
- 0: LCP > 4s OR CLS > 0.25 OR Lighthouse Best Practices < 50
- 1: LCP 3-4s, INP > 500ms, multiple major blocking resources
- 2: LCP 2.5-3s, INP 200-500ms, several insights with > 200ms savings each
- 3: LCP 1.5-2.5s, INP < 200ms, CLS < 0.1, Best Practices ≥ 90
- 4: LCP < 1.5s, INP < 100ms, CLS < 0.05, Best Practices ≥ 95

**Score 0-4 (chrome-devtools-mcp NOT connected — heuristic)**: 0=Severe issues (layout thrash, unoptimized everything), 1=Major problems (no lazy loading, expensive animations), 2=Partial (some optimization, gaps remain), 3=Good (mostly optimized, minor improvements possible), 4=Excellent (fast, lean, well-optimized). Flag the report as heuristic-mode in this case.

### 3. Theming

**Check for**:
- **Hard-coded colors**: Colors not using design tokens
- **Broken dark mode**: Missing dark mode variants, poor contrast in dark theme
- **Inconsistent tokens**: Using wrong tokens, mixing token types
- **Theme switching issues**: Values that don't update on theme change

**Score 0-4**: 0=No theming (hard-coded everything), 1=Minimal tokens (mostly hard-coded), 2=Partial (tokens exist but inconsistently used), 3=Good (tokens used, minor hard-coded values), 4=Excellent (full token system, dark mode works perfectly)

### 4. Responsive Design

**Check for**:
- **Fixed widths**: Hard-coded widths that break on mobile
- **Touch targets**: Interactive elements < 44x44px
- **Horizontal scroll**: Content overflow on narrow viewports
- **Text scaling**: Layouts that break when text size increases
- **Missing breakpoints**: No mobile/tablet variants

**Score 0-4**: 0=Desktop-only (breaks on mobile), 1=Major issues (some breakpoints, many failures), 2=Partial (works on mobile, rough edges), 3=Good (responsive, minor touch target or overflow issues), 4=Excellent (fluid, all viewports, proper touch targets)

### 5. Anti-Patterns (CRITICAL)

Check against ALL the **DON'T** guidelines in the impeccable skill. Look for AI slop tells (AI color palette, gradient text, glassmorphism, hero metrics, card grids, generic fonts) and general design anti-patterns (gray on color, nested cards, bounce easing, redundant copy).

**Score 0-4**: 0=AI slop gallery (5+ tells), 1=Heavy AI aesthetic (3-4 tells), 2=Some tells (1-2 noticeable), 3=Mostly clean (subtle issues only), 4=No AI tells (distinctive, intentional design)

## Generate Report

### Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | ? | [most critical a11y issue or "--"] |
| 2 | Performance | ? | |
| 3 | Responsive Design | ? | |
| 4 | Theming | ? | |
| 5 | Anti-Patterns | ? | |
| **Total** | | **??/20** | **[Rating band]** |

**Rating bands**: 18-20 Excellent (minor polish), 14-17 Good (address weak dimensions), 10-13 Acceptable (significant work needed), 6-9 Poor (major overhaul), 0-5 Critical (fundamental issues)

### Anti-Patterns Verdict
**Start here.** Pass/fail: Does this look AI-generated? List specific tells. Be brutally honest.

### Executive Summary
- Audit Health Score: **??/20** ([rating band])
- Total issues found (count by severity: P0/P1/P2/P3)
- Top 3-5 critical issues
- Recommended next steps

### Detailed Findings by Severity

Tag every measurable issue with **P0-P3 severity**. Severity maps to **user impact**, not detection availability (source: microsoft/skills issue-creator pattern):

- **P0 Blocking**: Prevents task completion / data loss / WCAG A violation — fix immediately
- **P1 Major**: Significant difficulty, no workaround, or WCAG AA violation — fix before release
- **P2 Minor**: Annoyance, workaround exists — fix in next pass
- **P3 Polish**: Nice-to-fix, no real user impact — fix if time permits

For findings that depend on a measurement the environment cannot make right now, do NOT assign a P-tier. Use `[UNMEASURED]` and place them in the "Deferred / Re-run with tools" section (see below).

For each issue, document:
- **[P?] Issue name**
- **Location**: Component, file, line
- **Category**: Accessibility / Performance / Theming / Responsive / Anti-Pattern
- **Impact**: How it affects users
- **WCAG/Standard**: Which standard it violates (if applicable)
- **Recommendation**: How to fix it
- **Suggested command**: Which command to use (prefer: /animate, /quieter, /shape, /optimize, /adapt, /clarify, /layout, /distill, /delight, /audit, /harden, /polish, /bolder, /typeset, /critique, /colorize, /overdrive)

### Deferred / Re-run with tools (mandatory section if any UNMEASURED items exist)

List every `[UNMEASURED]` finding here with:
- The exact measurement that would resolve it (e.g. "Lighthouse Accessibility category", "computed contrast on `text-muted-foreground` over `--background`", "focus-trap behaviour on keyboard `Tab` cycle in the open mobile menu")
- The tool that would provide it (e.g. `mcp__chrome-devtools__lighthouse_audit(device="mobile")`, axe-core CLI, manual screen-reader pass)
- The expected re-run command (e.g. "Re-run `/audit` after closing the locked chrome-profile at `C:\Users\Adam\.cache\chrome-devtools-mcp\chrome-profile`")

If this section has items, the artifact closes with: "Re-run /audit with the listed tools available to upgrade these findings from UNMEASURED to severity-rated."

### Patterns & Systemic Issues

Identify recurring problems that indicate systemic gaps rather than one-off mistakes:
- "Hard-coded colors appear in 15+ components, should use design tokens"
- "Touch targets consistently too small (<44px) throughout mobile experience"

### Strengths (mandatory — never omit)

Note what's working well — good practices to maintain and replicate. Every audit ships with this section even if short. A critique that returns only negatives is incomplete (source: anthropics/knowledge-work-plugins design-critique; davila7 scientific-critical-thinking 5-part verdict).

## Recommended Actions

List recommended commands in priority order (P0 first, then P1, then P2):

1. **[P?] `/<command-name>`** — Brief description (specific context from audit findings)
2. **[P?] `/<command-name>`** — Brief description (specific context)

**Rules**: Only recommend commands from: /animate, /quieter, /shape, /optimize, /adapt, /clarify, /layout, /distill, /delight, /audit, /harden, /polish, /bolder, /typeset, /critique, /colorize, /overdrive. Map findings to the most appropriate command. End with `/polish` as the final step if any fixes were recommended.

After presenting the summary, tell the user:

> You can ask me to run these one at a time, all at once, or in any order you prefer.
>
> Re-run `/audit` after fixes to see your score improve.

**IMPORTANT**: Be thorough but actionable. Too many P3 issues creates noise. Focus on what actually matters.

**NEVER**:
- Report issues without explaining impact (why does this matter?)
- Provide generic recommendations (be specific and actionable)
- Skip positive findings (celebrate what works)
- Forget to prioritize (everything can't be P0)
- Report false positives without verification

Remember: You're a technical quality auditor. Document systematically, prioritize ruthlessly, cite specific code locations, and provide clear paths to improvement.

## Anti-patterns (failure modes to avoid)

These are the specific failure modes prior /audit runs have committed. Read this section before assigning any severity.

1. **Severity on unmeasured items.** Assigning P0/P1/P2/P3 to a finding the environment cannot verify. Caught cycle 2026-05-18 — Performance P2s labelled "INP impact unmeasured" still received P2. Fix: use `[UNMEASURED]` and route to the Deferred section.
2. **Citation by reference, not inline.** Writing "per the input bundle, header has X" instead of inlining the captured value. The artifact reader does not have the input bundle. Always quote the captured value.
3. **Heuristic-mode score inflation.** When chrome-devtools-mcp is unavailable, scoring Performance as 3/4 because "the code looks fine" — heuristic mode is capped at 2/4. The cap exists because code-level inspection cannot verify runtime behaviour.
4. **Acknowledging an edge case without handling it.** "Focus-trap behaviour was not tested" placed in a footnote is not handling — it's a `[UNMEASURED]` finding that belongs in the Deferred section with the exact tool to resolve it.
5. **All-negative reports.** Omitting the Strengths section because "nothing was great" — every audit has at least one positive observation. Source 1 and Source 3 of forge-sources.md call this out.
6. **False AI-slop accusations.** Calling intentional design choices "AI slop" without specific tells. The Anti-Patterns dimension is 0-4 — assign based on concrete tells (purple gradients, 3-column icon grids, decorative blobs, generic hero copy), not on aesthetic dislike.