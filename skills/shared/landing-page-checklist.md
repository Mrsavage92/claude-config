# Landing Page Quality Checklist (auditable scoring rubric)

The single source of truth for `Skill('web-evolve')` and any score claim about a landing page.

**Score = `passed_checks / (total_checks - n/a_checks - wontfix_checks)` × 100.**
A score without the full checklist filled in (PASS / FAIL / N/A / WONTFIX per row, with proof) is **invalid**. Phase fails. Self-grading is forbidden.

Every check is binary. Every check has a verification method. Every PASS must cite the proof (grep result, count, screenshot path, line number).

---

## Mode detection (run FIRST, before Category A)

`/web-evolve` runs in one of two modes. Some checks behave differently per mode.

**Greenfield mode** — the repo is brand-new OR being rebuilt. No pre-existing `DESIGN-BRIEF.md`. All components are being freshly sourced.

**Backfill mode** — an existing repo is being evolved. `DESIGN-BRIEF.md` already exists. Components already live in `src/components/`. No new sections being scaffolded.

**Auto-detection rule:**

```
if file_exists("DESIGN-BRIEF.md") AND directory_not_empty("src/components/landing/"):
  mode = "backfill"
else:
  mode = "greenfield"
```

Override with `--mode=greenfield` or `--mode=backfill` flag if auto-detect is wrong.

**Per-mode rules:**

| Check | Greenfield | Backfill |
|---|---|---|
| B5 (component_builder invocations) | MUST PASS — new components need builder provenance | **N/A — backfill mode** (existing sections aren't being newly built; the builder is for fresh installs). Mark N/A with reason "backfill mode — section already exists in repo." |
| Iteration cap (default) | 8 | 20 |

Mode MUST be declared in the iteration 0 baseline receipt. Every iteration must echo mode for the audit trail.

---

## Category A — Anti-Slop (10 checks, hard veto on any FAIL ≤ 60% cap until fixed)

| # | Check | Verify how | PASS proof format |
|---|---|---|---|
| A1 | `Inter` is NOT used as display/heading font | grep `tailwind.config.ts` for `display:` and `fontFamily.display` | line + value showing non-Inter |
| A2 | `Space Grotesk` is NOT used as display | grep `tailwind.config.ts` | line + value |
| A3 | `Roboto`, `Arial`, `Helvetica`, `system-ui` are NOT display | grep `tailwind.config.ts` | line + value |
| A4 | `hsl(213 94% 58%)` does NOT appear in any `.ts/.tsx/.css` file | `grep -r "hsl(213 94% 58%)" src/` | empty result |
| A5 | No purple-to-pink gradient on white bg | `grep -rE "from-purple.*to-pink" src/` filtered to where bg is white | empty result OR location justified in DESIGN-BRIEF |
| A6 | No generic indigo `hsl(239 84% 67%)` or violet `hsl(258 90% 66%)` | grep | empty OR justified |
| A7 | Hero background is NOT a solid flat colour (must have grain / mesh / pattern / spotlight / photo / animated canvas) | Read hero file, check for SVG/canvas/grain class | line + element |
| A8 | No raw `<Card>` import count > 30% of section components (proxy: not just shadcn defaults) | `grep -r "import.*Card.*from.*ui/card" src/components/landing/ \| wc -l` ÷ section count | ratio < 0.3 |
| A9 | Hero contains a product visual / data viz / mockup — NOT a floating gradient blob | Vision check on desktop screenshot **(ADVISORY — vision-only. Cannot self-PASS. Requires user confirmation OR second independent model review. Mark `ADVISORY-PASS` until confirmed.)** | name the visual element seen + screenshot path + "user-confirmed" OR "pending-review" |
| A10 | Aesthetic direction is locked in DESIGN-BRIEF.md and is NOT "modern SaaS" / "clean minimal" | Read DESIGN-BRIEF.md `aesthetic_direction` field | quoted value |

**Hard veto:** any FAIL in A1–A10 caps the overall score at 60% until fixed. Doesn't matter how many other checks pass.

---

## Category B — 21st.dev Sourcing Maximalism (8 checks)

Use as much from 21st.dev as possible. Building generic from scratch when 21st.dev has a component is a failure.

| # | Check | Verify how | PASS proof format |
|---|---|---|---|
| B1 | `DESIGN-BRIEF.md` has a Component Lock table with ≥ 11 entries | Read DESIGN-BRIEF.md, count rows in Component Lock | row count |
| B2 | Every Component Lock row has a non-placeholder 21st.dev component name (not "TBD" / "Default") | Read table, check each value | row-by-row pass |
| B3 | Every landing section file has provenance — either a 21st.dev source citation OR a "no match" justification in the header (merged from old B3+B6) | `for f in src/components/landing/*.tsx; do head -5 "$f" \| grep -qE "21st.dev\|no 21st.dev match" \|\| echo "MISSING: $f"; done` returns empty | empty loop output + file count matches |
| B4 | Build session transcript contains ≥ 11 `mcp__magic__21st_magic_component_inspiration` invocations (one per mandatory section) | Read BUILD-LOG.md tool-call log | invocation count |
| B5 | Build session transcript contains ≥ 1 `mcp__magic__21st_magic_component_builder` invocation per section that ended up customised | BUILD-LOG.md grep. **N/A in backfill mode** (see Mode detection above) | count OR "N/A — backfill" |
| B6 | (merged into B3 — removed to eliminate redundancy with B3) | N/A — removed 2026-04-24 retro | skip |
| B7 | Each section file's component pattern matches its DESIGN-BRIEF Component Lock entry — verify by grep-extracting imported component names from each `.tsx` file and comparing to the Lock row for that section | `grep -hE "^import .+ from" src/components/landing/[Name].tsx` → cross-reference Lock row for [Name] | table of section → expected-component → found-component, all rows match |
| B8 | New session that modifies a section MUST re-cite its 21st.dev source (no silent edits losing provenance) | git diff HEAD~1 -- src/components/landing/*.tsx \| grep -E "^-.*21st.dev" returns empty | no provenance lines removed |
| B9 | **At least 60% of Component Lock rows have a section file whose default export actually imports from a 21st.dev-registry path (`@/components/magicui/*`, `@/components/aceternity/*`, or the exact path installed by `mcp__magic__21st_magic_component_builder`). Provenance comments are NOT sufficient.** Per row: grep the section file for the builder-installed import line. | `grep -hE "^import .+ from ['\"]@/components/(magicui\|aceternity\|21st)" src/components/landing/*.tsx \| wc -l` ÷ Lock row count | ratio ≥ 0.6 + row-level pass table. Added 2026-04-24 retro — B3 comment-only provenance was bypassing real integration. |

---

## Category C — Theme Consistency (8 checks — added at user request, "if you use a themed button, stick to it")

| # | Check | Verify how | PASS proof format |
|---|---|---|---|
| C1 | Single `Button` component import path used everywhere | `grep -rh "from.*Button" src/components/ src/pages/ \| sort -u` should return 1 line | sorted-unique import list |
| C2 | All `<Button>` usages use a variant from the defined CVA variant set (not arbitrary props) | Read `src/components/ui/button.tsx` to extract variants, then grep usages for each | variant-by-variant counts |
| C3 | Single `Card` component import path | as C1 for Card | sorted-unique import list |
| C4 | No hex colors in component or page files (all colors via design tokens) | `grep -rE "#[0-9a-fA-F]{3,6}\b" src/components/ src/pages/` excluding comments | empty result OR justified token override |
| C5 | No raw `oklch(...)` calls in component/page files (must go through CSS var) | `grep -r "oklch(" src/components/ src/pages/` | empty (CSS vars only) |
| C6 | No arbitrary Tailwind font classes like `font-['Custom']` outside design tokens | `grep -rE "font-\[.*\]" src/components/ src/pages/` | empty |
| C7 | No arbitrary text size classes like `text-[28px]` (must use scale tokens) | `grep -rE "text-\[.*px\]" src/components/ src/pages/` | empty |
| C8 | Border radius scale consistent — no arbitrary `rounded-[Xpx]` | `grep -rE "rounded-\[.*\]" src/components/ src/pages/` | empty OR justified |

---

## Category D — Animation & Motion (6 checks)

| # | Check | Verify how | PASS proof format |
|---|---|---|---|
| D1 | `motion/react` imported in ≥ 80% of landing section files — NEVER `framer-motion` (dead package, renamed in v12) | `grep -rl "from 'motion/react'" src/components/landing/ \| wc -l` ÷ total section file count | ratio + file list |
| D2 | At least 5 components use `whileInView` or staggered entrance | `grep -rE "whileInView\|stagger" src/components/landing/` | match count |
| D3 | `useReducedMotion()` referenced at least once (a11y respect) | `grep -r "useReducedMotion" src/` | match list |
| D4 | Hero has entrance animation (motion + initial/animate props) | grep hero file specifically | line + element |
| D5 | Hero has either an animated SVG, animated canvas, or shader background | Read hero file, check for `<motion.svg>` / canvas / shader / animated element | named element |
| D6 | Scroll-triggered reveal works (puppeteer evaluate after scrollTo) — elements with `whileInView` actually animate in | Puppeteer: scroll, then check transform/opacity changed | before/after CSS values |

---

## Category E — Section Completeness (8 checks)

| # | Check | Verify how | PASS proof format |
|---|---|---|---|
| E1 | Skip-nav link present targeting `#main-content`, and that target exists | grep `skip-nav` + grep `id="main-content"` | both lines |
| E2 | Hero section is the first `<main>` child | Read landing page file | line |
| E3 | Logo cloud / trust bar with ≥ 3 entries OR justified absence in DESIGN-BRIEF | Read landing-data, count entries OR check DESIGN-BRIEF skip note | count or note |
| E4 | Stats / numbers section with ≥ 3 stats | Read landing-data | count |
| E5 | Features / suites section ≥ 6 items | Read landing-data | count |
| E6 | Testimonials ≥ 3 | Read landing-data | count |
| E7 | Pricing tiers count matches SCOPE.md | Read both, compare | both counts |
| E8 | FAQ items ≥ 5 | Read landing-data | count |
| E9 | Final CTA banner present | grep landing page for FinalCTA | line |
| E10 | Footer with ≥ 4 columns | Read footer component, count column data | count |

---

## Category F — Visual Quality (Puppeteer + vision, 6 checks)

| # | Check | Verify how | PASS proof format |
|---|---|---|---|
| F1 | Desktop screenshot at 1440×900 captured | Puppeteer screenshot saved | file path |
| F2 | Mobile screenshot at 375×812 captured | Puppeteer screenshot saved | file path |
| F3 | No horizontal overflow at 375px | Puppeteer evaluate `document.documentElement.scrollWidth === window.innerWidth` | both values |
| F4 | ≥ 3 distinct text sizes visible in hero | Vision check on hero crop **(ADVISORY — vision-only. Mark `ADVISORY-PASS` until user-confirmed.)** | name 3 sizes with px estimates + "user-confirmed" OR "pending-review" |
| F5 | ≥ 4 semantic colors visible in viewport (not monochromatic) | Vision check **(ADVISORY — vision-only. Mark `ADVISORY-PASS` until user-confirmed.)** | name 4 colors with usage + "user-confirmed" OR "pending-review" |
| F6 | Signature element present in hero (data viz / score ring / mockup / animated background) | Vision check, must NAME the element **(ADVISORY — vision-only. Mark `ADVISORY-PASS` until user-confirmed.)** | element name + screenshot path + "user-confirmed" OR "pending-review" |

---

## Category G — Accessibility & Performance (4 checks)

| # | Check | Verify how | PASS proof format |
|---|---|---|---|
| G1 | All `.map(` renders use stable identity keys (no `key={index}`) | `grep -rE "key=\{i\b\|key=\{index\}" src/` | empty |
| G2 | All interactive icon-only elements have aria-label | grep `<button` and `<a` for icon imports without aria-label | none unguarded |
| G3 | Build green + tests passing | `npm run build` exit 0 + `npm test` exit 0 | exit codes |
| G4 | All chunks < 250KB gzipped | `npm run build` output | per-chunk sizes |

---

## Category H — Process Integrity (2 checks)

These checks exist to prevent the skill from self-reporting without doing the work. They audit the tool-call transcript, not the code.

| # | Check | Verify how | PASS proof format |
|---|---|---|---|
| H1 | Every iteration entry in BUILD-LOG.md maps to a `Skill('X')` tool invocation OR a direct MCP tool call in THIS session's transcript — no inline-synthesised fixes allowed | Cross-reference BUILD-LOG iteration log against this conversation's tool-call history. Every "fix applied" entry must cite a `Skill(...)` call or named MCP tool. If a fix was applied via direct Edit/Bash without a Skill call, the iteration is void. | Iteration count in log = Skill/MCP invocation count in transcript. List any gaps as FAIL. |
| H2 | Every iteration that claims a score improvement has a pre/post puppeteer screenshot pair that visibly differs — pixel-identical before/after means no real change occurred | Compare `.evolution/iter-N/` screenshots to the prior iteration. If screenshots are identical (same dimensions, same content, no visible diff), the iteration doesn't count and the claimed score delta is void. | File paths of before+after screenshots for each kept iteration. If identical: FAIL, mark iteration as null-delta, revert score claim. |

**H-category failures do NOT cap the score** — they invalidate the iteration entirely and require the iteration to be re-run or struck from the log.

---

## Total: 54 checks (after 2026-04-25 retro — B9 + H1 + H2 added)

| Category | Count | Weight |
|---|---|---|
| A. Anti-Slop | 10 | hard veto on FAIL (cap 60) |
| B. 21st.dev Sourcing | 8 (B6 merged into B3; B9 added 2026-04-25) | soft veto on FAIL (cap 80) |
| C. Theme Consistency | 8 | medium |
| D. Animation | 6 | medium |
| E. Section Completeness | 10 | medium |
| F. Visual Quality | 6 | medium (4 vision-advisory — cannot self-PASS) |
| G. A11y & Perf | 4 | medium |
| H. Process Integrity | 2 | iteration-voiding (not score-capping) |

**Score formula:**

```
passed = count of PASS
denominator = total_checks - n/a_checks - wontfix_checks

raw_score = (passed / denominator) × 100

if any A check is FAIL:   score = min(60, raw_score)
elif any B check is FAIL: score = min(80, raw_score)
else:                     score = raw_score
```

**Target score:** 90/100 by default. 95+ for "Stripe/Linear quality" mode.

**Vision-check confidence:** F4 / F5 / F6 / A9 rely on Claude-vision inspection of screenshots. These are **ADVISORY** — they cannot self-PASS. Record them as `ADVISORY-PASS` (tentative) until the user explicitly confirms the visual observation OR a second independent model review agrees. Never count an ADVISORY-PASS as a confirmed PASS in the final score without one of those two confirmations. If neither has occurred, treat as FAIL for scoring purposes. Mark receipts with `(vision-advisory — pending user confirmation)` suffix.

---

## Output format (mandatory — emitted by `Skill('web-evolve')` every iteration)

```
## Landing page score — iteration N — [timestamp] [mode: backfill | greenfield]

Raw: 45/48 checks passed (2 N/A, 1 WONTFIX) = 93.75%
Veto cap applied: B5 FAIL → capped at 80
Final score: 80/100 (raw 93.75% — see why veto is active below)

### Category breakdown
- A. Anti-slop: 10/10 ✓ (A9: ADVISORY-PASS — pending user confirmation)
- B. 21st.dev: 4/8 (1 N/A, 2 FAIL: B3, B5)
- C. Theme consistency: 7/8 (FAIL: C4)
- D. Animation: 6/6 ✓
- E. Sections: 10/10 ✓
- F. Visual: 3/6 ✓ + 3 ADVISORY-PASS (F4/F5/F6 — vision-advisory, pending user confirmation)
- G. A11y/Perf: 4/4 ✓
- H. Process: 2/2 ✓

### Veto holding the cap
- B5: FAIL — no mcp__magic__21st_magic_component_builder invocations. (If backfill mode: this should be N/A — check mode detection logic.)

### Failures (with proof)
- B3: `src/components/landing/NewCard.tsx` has no 21st.dev source header (grep returned MISSING: ...)
- B5: zero `mcp__magic__21st_magic_component_builder` calls in BUILD-LOG.md
- C4: hex `#0a0a0a` in `src/components/landing/Footer.tsx:14`. Replace with `var(--bg)`.

### N/A items (with justification)
- (none this iteration)

### WONTFIX items (with audit trail)
- (none this iteration — if you mark one, it requires a user-justified BUILD-LOG entry)

### Next fix queue (priority order)
1. B3 — provenance header missing (1 file)
2. B5 — requires component_builder call OR mode switch to backfill
3. C4 — hex → token refactor
```

Without this format (including raw score, mode, and cap-holder) in the BUILD-LOG, score claims are invalid.
