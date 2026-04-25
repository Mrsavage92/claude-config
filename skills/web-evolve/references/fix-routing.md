# Fix Routing — checklist failure → refinement skill

When `Skill('web-evolve')` finds a failed check, this table is the authority for which skill to invoke. Every row is a Skill tool call, not a "do it inline" instruction.

---

## SKILL_LOOKUP (machine-readable — orchestrator reads this block, not the tables below)

```json
{
  "A1":  {"fix_skill": "typeset",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "A2":  {"fix_skill": "typeset",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "A3":  {"fix_skill": "typeset",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "A4":  {"fix_skill": "colorize",   "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "A5":  {"fix_skill": "colorize",   "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "A6":  {"fix_skill": "colorize",   "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "A7":  {"fix_skill": "overdrive",  "prereq": null,                                        "secondary": "animate", "edit_direct": false},
  "A8":  {"fix_skill": "web-component", "prereq": "mcp__magic__21st_magic_component_inspiration", "secondary": null, "edit_direct": false},
  "A9":  {"fix_skill": "web-component", "prereq": "mcp__magic__21st_magic_component_inspiration", "secondary": null, "edit_direct": false},
  "A10": {"fix_skill": null,          "prereq": null,                                        "secondary": "web-design-research", "edit_direct": true},
  "A11": {"fix_skill": "web-design-research", "prereq": null,                               "secondary": null,      "edit_direct": false},
  "B1":  {"fix_skill": "web-design-research", "prereq": null,                               "secondary": null,      "edit_direct": false},
  "B2":  {"fix_skill": "web-design-research", "prereq": null,                               "secondary": null,      "edit_direct": false},
  "B3":  {"fix_skill": "web-fix",    "prereq": "mcp__magic__21st_magic_component_inspiration", "secondary": null,  "edit_direct": false},
  "B4":  {"fix_skill": "web-design-research", "prereq": null,                               "secondary": null,      "edit_direct": false},
  "B5":  {"fix_skill": null,          "prereq": null,                                        "secondary": null,      "edit_direct": true},
  "B7":  {"fix_skill": "web-component", "prereq": null,                                     "secondary": null,      "edit_direct": false},
  "B8":  {"fix_skill": "web-fix",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "B9":  {"fix_skill": "web-component", "prereq": "mcp__magic__21st_magic_component_inspiration", "secondary": null, "edit_direct": false},
  "C1":  {"fix_skill": "polish",     "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "C2":  {"fix_skill": "polish",     "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "C3":  {"fix_skill": "polish",     "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "C4":  {"fix_skill": "colorize",   "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "C5":  {"fix_skill": "colorize",   "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "C6":  {"fix_skill": "typeset",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "C7":  {"fix_skill": "typeset",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "C8":  {"fix_skill": "polish",     "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "D1":  {"fix_skill": "animate",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "D2":  {"fix_skill": "animate",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "D3":  {"fix_skill": "animate",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "D4":  {"fix_skill": "animate",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "D5":  {"fix_skill": "overdrive",  "prereq": null,                                        "secondary": "animate", "edit_direct": false},
  "D6":  {"fix_skill": "web-fix",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "E1":  {"fix_skill": null,          "prereq": null,                                        "secondary": null,      "edit_direct": true},
  "E2":  {"fix_skill": "web-fix",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "E3":  {"fix_skill": "web-component", "prereq": "mcp__magic__21st_magic_component_inspiration", "secondary": null, "edit_direct": false},
  "E4":  {"fix_skill": "web-component", "prereq": null,                                     "secondary": null,      "edit_direct": false},
  "E5":  {"fix_skill": "web-component", "prereq": null,                                     "secondary": null,      "edit_direct": false},
  "E6":  {"fix_skill": "web-component", "prereq": null,                                     "secondary": null,      "edit_direct": false},
  "E7":  {"fix_skill": "web-component", "prereq": null,                                     "secondary": null,      "edit_direct": false},
  "E8":  {"fix_skill": "web-component", "prereq": null,                                     "secondary": null,      "edit_direct": false},
  "E9":  {"fix_skill": "web-component", "prereq": null,                                     "secondary": null,      "edit_direct": false},
  "E10": {"fix_skill": "web-component", "prereq": null,                                     "secondary": null,      "edit_direct": false},
  "F3":  {"fix_skill": "adapt",      "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "F4":  {"fix_skill": "typeset",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "F5":  {"fix_skill": "colorize",   "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "F6":  {"fix_skill": "overdrive",  "prereq": "mcp__magic__21st_magic_component_inspiration", "secondary": "web-component", "edit_direct": false},
  "G1":  {"fix_skill": null,          "prereq": null,                                        "secondary": null,      "edit_direct": true},
  "G2":  {"fix_skill": null,          "prereq": null,                                        "secondary": null,      "edit_direct": true},
  "G3":  {"fix_skill": "web-fix",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "G4":  {"fix_skill": "optimize",   "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "G5":  {"fix_skill": "optimize",   "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "G6":  {"fix_skill": "web-fix",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "I1":  {"fix_skill": "typeset",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "I2":  {"fix_skill": "typeset",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "I3":  {"fix_skill": "polish",     "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "I4":  {"fix_skill": "colorize",   "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "I5":  {"fix_skill": "animate",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "I6":  {"fix_skill": "animate",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "I7":  {"fix_skill": "animate",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "I8":  {"fix_skill": "polish",     "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "J1":  {"fix_skill": "clarify",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "J2":  {"fix_skill": "clarify",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "J3":  {"fix_skill": "clarify",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "J4":  {"fix_skill": "clarify",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "J5":  {"fix_skill": "clarify",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "J6":  {"fix_skill": "clarify",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "J7":  {"fix_skill": "clarify",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "J8":  {"fix_skill": "clarify",    "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "K1":  {"fix_skill": "layout",     "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "K2":  {"fix_skill": "web-component", "prereq": "mcp__magic__21st_magic_component_inspiration", "secondary": null, "edit_direct": false},
  "K3":  {"fix_skill": "layout",     "prereq": null,                                        "secondary": null,      "edit_direct": false},
  "K4":  {"fix_skill": "colorize",   "prereq": null,                                        "secondary": "overdrive", "edit_direct": false}
}
```

**How to read this lookup:**
- `fix_skill`: the primary Skill() to invoke. null means edit_direct=true (use Edit tool directly).
- `prereq`: MCP tool to call BEFORE the fix_skill (component sourcing). null means no prereq.
- `secondary`: fallback skill if primary causes regression or VOID (in excluded_skills).
- `edit_direct`: true means use Edit tool directly — too small for a full skill invocation.

---

## Category A — Anti-Slop fixes (hard veto, fix first)

| Check | Failure pattern | Fix skill | Rationale |
|---|---|---|---|
| A1 | Inter as display | `Skill('typeset')` | typeset chooses non-convergent display pair from typography library |
| A2 | Space Grotesk as display | `Skill('typeset')` | same |
| A3 | Roboto/Arial/Helvetica/system-ui as display | `Skill('typeset')` | same |
| A4 | hsl(213 94% 58%) found | `Skill('colorize')` | colorize re-routes through the personality palette library |
| A5 | Purple-pink-on-white gradient | `Skill('colorize')` | swap gradient stops + bg |
| A6 | Generic indigo/violet | `Skill('colorize')` | hue-shift via personality palette |
| A7 | Flat hero background | `Skill('overdrive')` first attempt; `Skill('animate')` if overdrive too aggressive | atmospheric background per DESIGN-BRIEF Step 6b.1 |
| A8 | Raw shadcn Card spam | `mcp__magic__21st_magic_component_inspiration` then `Skill('web-component')` to swap | source bespoke section components |
| A9 | No product visual in hero | `mcp__magic__21st_magic_component_inspiration` for "hero with product mockup" + `Skill('web-component')` to install + `Skill('animate')` to enliven | data-forward heroes need a real visual |
| A10 | `aesthetic_direction` field missing from DESIGN-BRIEF.md | **`Edit` tool direct** to add the field (surgical one-line fix) — only escalate to `Skill('web-design-research')` Step 1b if the existing brief is genuinely unset/wrong. A missing field is an Edit, not a full skill re-run. | proven on AuditHQ v2 iter 1 — surgical Edit cleared the hard veto in one iteration |
| A11 | Trend Pulse missing, stale (>90 days), or aesthetic not cross-referenced against it | Run `Skill('web-design-research')` Step 0 — the five WebSearch queries — then `Edit` DESIGN-BRIEF.md to add/update the `## Trend Pulse` section and update the `aesthetic_direction` rationale field. If the existing aesthetic IS supported by the fresh trend data, only the DESIGN-BRIEF needs updating (not a redesign). If the aesthetic is on the Saturated list, escalate to a full `Skill('web-design-research')` Step 1b re-run. | Trend data decays. A stale Pulse is as bad as no Pulse. |

---

## Category B — 21st.dev sourcing (max-21st-dev-or-justify)

| Check | Failure pattern | Fix skill | Rationale |
|---|---|---|---|
| B1 | Component Lock < 11 entries | `Skill('web-design-research')` step 6 to re-run all 11 MCP queries | only the design-research skill can populate the Lock table |
| B2 | Component Lock has placeholder values | `Skill('web-design-research')` step 6 | same |
| B3 | Section file missing 21st.dev source comment | `mcp__magic__21st_magic_component_inspiration` to confirm the source, then `Skill('web-fix')` to add the header comment | provenance is a one-line file edit. **If B3 passes (comment exists) but B9 fails (no real import) — escalate to B9 immediately. Comment-only provenance without actual component integration is B3 theatre.** |
| B4 | Transcript missing 11× MCP calls | This means design research was bypassed in the original build. Invoke `Skill('web-design-research')` to redo Phase 0.5 properly. | retroactive research |
| B5 | No 21st.dev component_builder invocations | **If backfill mode: mark N/A** per mode-detection rule in `shared/landing-page-checklist.md` (section already exists — builder is for fresh installs). **If greenfield: invoke `mcp__magic__21st_magic_component_builder`** per customised section to codify builder usage. | backfill retrofits should not require builder calls — retro correction from AuditHQ v2 |
| B6 | (merged into B3 — removed 2026-04-24 retro) | N/A — see B3 | redundant check removed |
| B7 | Component pattern drifted from Lock | `Skill('web-component')` to re-source from Lock OR update DESIGN-BRIEF if the change was deliberate | reconcile |
| B8 | New session lost 21st.dev citation | `Skill('web-fix')` to restore the comment from git history | undo accidental wipe |
| B9 | Section files have provenance comments but no actual 21st.dev component imports (ratio of real imports < 60% of Lock rows) | `mcp__magic__21st_magic_component_inspiration` to find the correct component, then `mcp__magic__21st_magic_component_builder` (greenfield) OR `Skill('web-component')` (backfill retrofit) to actually install the component and replace the hand-built code | Real integration beats comment theatre. Added 2026-04-25 retro — AuditHQ v2 passed B3 on comments with zero actual 21st.dev components installed. |

---

## Category H — Process Integrity

| Check | Failure pattern | Fix skill | Rationale |
|---|---|---|---|
| H1 | Fix applied via direct Edit/Bash/Write without a Skill() or MCP tool call | HALT. Mark iteration VOID. Re-run the correct fix via `Skill('X')` per fix-routing table. Do NOT proceed to re-score. | The loop routes through skills. Inline synthesis is the root cause failure this skill exists to prevent. |
| H2 | Before/after screenshots are pixel-identical (null-delta) | HALT. `git revert HEAD --no-edit`. Mark iteration VOID. The fix didn't visibly change anything — escalate the fix strategy: try a different skill, or mark the check WONTFIX if 3 attempts all null-delta. | Committed code ≠ visible improvement. Score only counts visible progress. |

---

## Category C — Theme Consistency

| Check | Failure pattern | Fix skill | Rationale |
|---|---|---|---|
| C1 | Multiple Button import paths | `Skill('polish')` consolidates to a single import | refactor pattern |
| C2 | Buttons use arbitrary props instead of variants | `Skill('polish')` to constrain to defined variants | variant discipline |
| C3 | Multiple Card import paths | `Skill('polish')` | same as C1 |
| C4 | Hex colors in components/pages | `Skill('colorize')` to swap to design tokens | token discipline |
| C5 | Raw oklch() outside CSS vars | `Skill('colorize')` | same as C4 |
| C6 | Arbitrary `font-[Custom]` classes | `Skill('typeset')` to consolidate to scale tokens | typography discipline |
| C7 | Arbitrary `text-[28px]` classes | `Skill('typeset')` to scale | same as C6 |
| C8 | Arbitrary `rounded-[Xpx]` classes | `Skill('polish')` to scale tokens | radius discipline |

---

## Category D — Animation

| Check | Failure pattern | Fix skill |
|---|---|---|
| D1 | motion not imported in landing sections | `Skill('animate')` |
| D2 | Fewer than 5 whileInView/stagger uses | `Skill('animate')` |
| D3 | useReducedMotion not referenced | `Skill('animate')` (its checklist enforces it) |
| D4 | Hero has no entrance animation | `Skill('animate')` with hero-stagger pattern |
| D5 | Hero has no animated bg/svg/canvas | `Skill('overdrive')` first, fallback `Skill('animate')` |
| D6 | Scroll-trigger doesn't fire | `Skill('web-fix')` to wire viewport observer correctly |

---

## Category E — Section Completeness

| Check | Failure pattern | Fix skill |
|---|---|---|
| E1 | Missing skip-nav | `Skill('web-fix')` direct |
| E2 | Hero not first child | `Skill('web-fix')` direct |
| E3 | Logo cloud < 3 entries | `Skill('web-component')` to add LogoCloud component (sourced via `mcp__magic__21st_magic_component_inspiration` if not present) |
| E4–E10 | Missing section / under-populated | `Skill('web-component')` to add — for new sections, `mcp__magic__21st_magic_component_inspiration` first |

---

## Category F — Visual Quality (vision-led)

| Check | Failure pattern | Fix skill |
|---|---|---|
| F1, F2 | Screenshots not captured | `mcp__puppeteer__puppeteer_screenshot` direct (this is the loop's responsibility) |
| F3 | Horizontal overflow at 375px | `Skill('adapt')` for responsive fix |
| F4 | < 3 text sizes in hero | `Skill('typeset')` to expand scale |
| F5 | < 4 colors visible | `Skill('colorize')` to add semantic accent |
| F6 | No signature element in hero | `Skill('overdrive')` to add ambitious element OR `mcp__magic__21st_magic_component_inspiration` for a hero with signature |

---

## Category G — A11y & Performance

| Check | Failure pattern | Fix skill |
|---|---|---|
| G1 | key={index} found | `Skill('web-fix')` direct |
| G2 | Icon-only without aria-label | `Skill('web-fix')` direct (or `Skill('clarify')` for label wording) |
| G3 | Build broken / tests failing | `Skill('web-fix')` direct |
| G4 | Chunk > 250KB | `Skill('optimize')` for bundle splitting |
| G5 | LCP > 2.5s | `Skill('optimize')` — target: hero image `fetchpriority="high"`, eliminate render-blocking resources, preload critical font. Pass measured LCP value + waterfall as context. |
| G6 | CLS > 0.1 | `Skill('web-fix')` — target: explicit width/height on all images, no dynamically injected content above fold, font `font-display: swap`. Pass measured CLS value as context. |

---

## Category I — Design Consistency

**Priority: medium-high — ranked above C/D in the fix queue.** I-failures are user-visible immediately. Batch all I-failures in one iteration since they almost always route to the same skill.

| Check | Failure pattern | Fix skill | Rationale |
|---|---|---|---|
| I1 | Section H2s use mixed text-size classes for same semantic role | `Skill('typeset')` to standardise heading scale — pass all variant classes found as context | typography discipline + visible inconsistency |
| I2 | Display font bleeding into body copy OR body font on headings | `Skill('typeset')` to enforce font role boundaries | font role discipline |
| I3 | Primary CTA Buttons use mixed variant values for same semantic role | `Skill('polish')` to standardise variant — one variant per semantic role | component variant discipline |
| I4 | Section backgrounds deviate from declared alternation pattern in DESIGN-BRIEF | `Skill('colorize')` to realign — pass declared pattern + deviating files as context | color system discipline |
| I5 | whileInView animations use inline easing arrays instead of the shared constant | `Skill('animate')` to extract inline values into the motion constants file | animation consistency — AuditHQ v2 had `EASE_OUT_EXPO` constant but inline arrays coexisted |
| I6 | Hover animations inconsistent across same component type (some scale, some don't) | `Skill('animate')` to apply uniform hover pattern — pass the canonical pattern and all deviating files | hover consistency |
| I7 | Entrance animation durations scattered (outliers beyond declared band) | `Skill('animate')` to normalise durations — pass min/max outliers as context | duration consistency |
| I8 | Section wrapper padding inconsistent (mixed py-16/py-24/py-32 without documented reason) | `Skill('polish')` to standardise — pass deviating sections as context | spacing discipline |

**Batch rule for I-category:** All I-failures in one iteration → one `Skill('polish')` call (spacing/variant) + one `Skill('typeset')` call (fonts) + one `Skill('animate')` call (motion). Three skill calls max for the entire category. Never one call per check.

---

## Category J — Copy Quality

**Priority: high — ranked alongside I/K.** Bad copy is the most immediately credibility-destroying failure on a landing page. GitHub earns every claim with specificity. Batch all J-failures into one iteration — they all route to `Skill('clarify')`.

| Check | Failure pattern | Fix skill | Rationale |
|---|---|---|---|
| J1 | Hero headline > 12 words OR generic/claim-free | `Skill('clarify')` — pass current headline + product context. Target: ≤12 words, concrete claim. | specificity over length |
| J2 | Subheadline doesn't name problem or outcome | `Skill('clarify')` — pass current subheadline + top user pain from PRODUCT-CONTEXT.md | user-problem alignment |
| J3 | Primary CTA is generic ("Get Started", "Learn More") | `Skill('clarify')` — pass current CTA + what the action actually does. Target: names the outcome. | action-specific CTA converts higher |
| J4 | Unsubstantiated superlatives without stat backup | `Skill('clarify')` — either remove the superlative OR replace with a specific stat from PRODUCT-CONTEXT.md | credibility |
| J5 | Stats use vague quantifiers instead of numbers with units | `Skill('clarify')` — pass each vague stat + the real underlying data from PRODUCT-CONTEXT.md | specificity |
| J6 | Testimonials are generic praise without named outcome | `Skill('clarify')` — rewrite testimonials to include before/after metric or named action. If no real testimonials exist, flag NEEDS_HUMAN — do not fabricate. | earned social proof |
| J7 | AI-slop phrases found (transform/revolutionize/seamlessly/etc.) | `Skill('clarify')` — surgical replacement. Pass the exact phrase + surrounding context. Target: concrete replacement. | credibility + differentiation |
| J8 | FAQ answers are deflecting or incomplete | `Skill('clarify')` — pass each failing Q+A pair. Rewrite to fully resolve the question. | user trust |

**Batch rule for J-category:** All J-failures → one `Skill('clarify')` invocation passing the complete list of failing copy elements. Single iteration, single commit.

**NEVER fabricate testimonials, stats, or claims.** If real data doesn't exist, mark J5/J6 as NEEDS_HUMAN, not PASS.

---

## Category K — Section Differentiation

**Priority: high — ranked alongside I/J.** Section sameness is the primary reason users stop scrolling. GitHub's sections feel independently designed. Route K-failures to layout and visual skills.

| Check | Failure pattern | Fix skill | Rationale |
|---|---|---|---|
| K1 | Two adjacent sections share background + layout pattern | `Skill('layout')` to differentiate — pass the two offending sections. Options: flip layout orientation, change density, add full-bleed image/color break, switch to bento. | scroll depth — sameness = users stop reading |
| K2 | Fewer than 3 sections have a visual anchor | `mcp__magic__21st_magic_component_inspiration` for section-specific visual (animated code block, data viz, product screenshot, terminal) + `Skill('web-component')` to install. One anchor per failing section. | memorability |
| K3 | No density contrast — all sections same visual weight | `Skill('layout')` to add one sparse break section (pull quote, single stat, lone CTA) between dense sections | rhythm and breathing room |
| K4 | Hero background treatment reused in other sections | `Skill('colorize')` or `Skill('overdrive')` to give each reusing section its own distinct treatment | hero must be the unique opening |

---

## Cross-cutting rules

1. **Multiple checks routing to the same skill** in one iteration → batch them: one `Skill('typeset')` call passing a list of failures, not 5 separate calls. Pass the specific check-IDs and FAIL proof as context arguments so the skill knows exactly what to target. Do NOT read the skill's SKILL.md and synthesise inline — that is the failure pattern.
2. **If a fix skill is unavailable** → HALT, log NEEDS_HUMAN with skill name, skip this check, continue with next priority. Do NOT inline-fix in main context.
3. **`mcp__magic__21st_magic_component_inspiration` is FREE to call** — call it generously. Cost concern doesn't outweigh anti-slop value.
4. **If a fix skill returns "no improvement available" 3 times in a row for the same check** → mark the check WONTFIX with the reason and continue. Don't loop forever.
5. **Surgical Edit beats full skill re-run.** For any check that's a one-line markdown or file edit (e.g. A10 missing field, B3 missing header comment, E1 missing skip-nav attribute) — use the `Edit` tool directly. Only invoke the heavier skill (`web-design-research`, `colorize`, `typeset`) when the fix is genuinely structural, not cosmetic.

---

## Batch-fix recipes (same-skill / same-edit patterns)

When the priority queue shows multiple failures routing to one tool, batch them into one iteration:

| Pattern | Example | How to batch |
|---|---|---|
| **Same refinement skill across categories** | C5 + C7 + C8 all → `Skill('polish')` / `Skill('colorize')` / `Skill('typeset')` | Fire one skill call per skill type per iteration, passing the full list of failures as context. Not one skill call per file. |
| **Same edit across N files** | B3 "add 21st.dev header" across 14 landing files | Fire parallel `Edit` calls in one message. Single commit. Single re-score. (AuditHQ v2 iter 3 pattern.) |
| **Category sweep** | 4 failures in Cat C (theme consistency) | One `Skill('polish')` invocation with all 4 passed as structured input. Not 4 separate invocations. |
| **MCP lookup batch** | 11 sections needing 21st.dev sourcing | Fire all 11 `mcp__magic__21st_magic_component_inspiration` queries in one message (AuditHQ v2 iter 2 pattern). |

**Golden rule:** if you catch yourself writing "iteration N: fix [file1], iteration N+1: fix [file2]" with the same skill/edit both times — they should be one iteration.
