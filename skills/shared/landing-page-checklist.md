# Landing Page Quality Checklist (auditable scoring rubric)

The single source of truth for `Skill('web-evolve')` and any score claim about a landing page.

**Score = `passed_checks / (total_checks - n/a_checks)` × 100.**
A score without the full checklist filled in (PASS / FAIL / N/A per row, with proof) is **invalid**. Phase fails. Self-grading is forbidden.

Every check is binary. Every check has a verification method. Every PASS must cite the proof (grep result, count, screenshot path, line number).

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
| A9 | Hero contains a product visual / data viz / mockup — NOT a floating gradient blob | Vision check on desktop screenshot | name the visual element seen |
| A10 | Aesthetic direction is locked in DESIGN-BRIEF.md and is NOT "modern SaaS" / "clean minimal" | Read DESIGN-BRIEF.md `aesthetic_direction` field | quoted value |

**Hard veto:** any FAIL in A1–A10 caps the overall score at 60% until fixed. Doesn't matter how many other checks pass.

---

## Category B — 21st.dev Sourcing Maximalism (8 checks)

Use as much from 21st.dev as possible. Building generic from scratch when 21st.dev has a component is a failure.

| # | Check | Verify how | PASS proof format |
|---|---|---|---|
| B1 | `DESIGN-BRIEF.md` has a Component Lock table with ≥ 11 entries | Read DESIGN-BRIEF.md, count rows in Component Lock | row count |
| B2 | Every Component Lock row has a non-placeholder 21st.dev component name (not "TBD" / "Default") | Read table, check each value | row-by-row pass |
| B3 | Each landing section file has a header comment naming its 21st.dev source | `grep -l "21st.dev" src/components/landing/*.tsx` should match section count | file list + count |
| B4 | Build session transcript contains ≥ 11 `mcp__magic__21st_magic_component_inspiration` invocations (one per mandatory section) | Read BUILD-LOG.md tool-call log | invocation count |
| B5 | Build session transcript contains ≥ 1 `mcp__magic__21st_magic_component_builder` invocation per section that ended up customised | BUILD-LOG.md grep | count |
| B6 | Custom components that DON'T cite a 21st.dev source must have a written reason in the file header (e.g. "no suitable 21st.dev match found because…") | grep section files for "21st.dev" OR "no 21st.dev match" header | every section file passes |
| B7 | Each section file's component pattern matches its DESIGN-BRIEF Component Lock entry (not drifted) | Read both, compare per row | row-by-row pass |
| B8 | New session that modifies a section MUST re-cite its 21st.dev source (no silent edits losing provenance) | git diff check + grep | passes if 21st.dev comment preserved |

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
| D1 | `motion/react` (or `framer-motion`) imported in ≥ 80% of landing section files | grep imports, count files with motion ÷ total section files | ratio + file list |
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
| F4 | ≥ 3 distinct text sizes visible in hero | Vision check on hero crop | name 3 sizes |
| F5 | ≥ 4 semantic colors visible in viewport (not monochromatic) | Vision check | name 4 colors with usage |
| F6 | Signature element present in hero (data viz / score ring / mockup / animated background) | Vision check, must NAME the element | element name + screenshot ref |

---

## Category G — Accessibility & Performance (4 checks)

| # | Check | Verify how | PASS proof format |
|---|---|---|---|
| G1 | All `.map(` renders use stable identity keys (no `key={index}`) | `grep -rE "key=\{i\b\|key=\{index\}" src/` | empty |
| G2 | All interactive icon-only elements have aria-label | grep `<button` and `<a` for icon imports without aria-label | none unguarded |
| G3 | Build green + tests passing | `npm run build` exit 0 + `npm test` exit 0 | exit codes |
| G4 | All chunks < 250KB gzipped | `npm run build` output | per-chunk sizes |

---

## Total: 50 checks

| Category | Count | Weight (rough) |
|---|---|---|
| A. Anti-Slop | 10 | hard veto on FAIL |
| B. 21st.dev Sourcing | 8 | high (any FAIL caps at 80) |
| C. Theme Consistency | 8 | medium |
| D. Animation | 6 | medium |
| E. Section Completeness | 9 | medium |
| F. Visual Quality | 6 | medium |
| G. A11y & Perf | 4 | medium |

**Score formula:**
- If any A check fails: `score = min(60, raw_score)`
- If any B check fails: `score = min(80, raw_score)`
- Otherwise: `score = raw_score = (passed / (total - n/a)) × 100`

**Target score:** 90/100 by default. 95+ for "Stripe/Linear quality" mode.

---

## Output format (mandatory — emitted by `Skill('web-evolve')` every iteration)

```
## Landing page score — iteration N — [timestamp]

Raw: 42/47 checks passed (3 N/A) = 89%
Veto cap applied: A4 FAIL → capped at 60
Final score: 60/100

### Category breakdown
- A. Anti-slop: 9/10 (FAIL: A4)
- B. 21st.dev: 8/8 ✓
- C. Theme consistency: 7/8 (FAIL: C4)
- D. Animation: 6/6 ✓
- E. Sections: 9/9 ✓
- F. Visual: 6/6 ✓
- G. A11y/Perf: 4/4 ✓

### Failures (with proof)
- A4: hsl(213 94% 58%) found in `src/styles/index.css:42` — `--brand: 213 94% 58%`. Need to change.
- C4: hex color `#0a0a0a` found in 6 files (`src/components/landing/Footer.tsx:14, ...`). Replace with `var(--bg)`.

### Next fix queue (priority order)
1. A4 — hard veto, fix first
2. C4 — score gain +2.1 points
```

Without this format in the BUILD-LOG, score claims are invalid.
