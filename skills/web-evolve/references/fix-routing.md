# Fix Routing — checklist failure → refinement skill

When `Skill('web-evolve')` finds a failed check, this table is the authority for which skill to invoke. Every row is a Skill tool call, not a "do it inline" instruction.

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

---

## Category B — 21st.dev sourcing (max-21st-dev-or-justify)

| Check | Failure pattern | Fix skill | Rationale |
|---|---|---|---|
| B1 | Component Lock < 11 entries | `Skill('web-design-research')` step 6 to re-run all 11 MCP queries | only the design-research skill can populate the Lock table |
| B2 | Component Lock has placeholder values | `Skill('web-design-research')` step 6 | same |
| B3 | Section file missing 21st.dev source comment | `mcp__magic__21st_magic_component_inspiration` to confirm the source, then `Skill('web-fix')` to add the header comment | provenance is a one-line file edit |
| B4 | Transcript missing 11× MCP calls | This means design research was bypassed in the original build. Invoke `Skill('web-design-research')` to redo Phase 0.5 properly. | retroactive research |
| B5 | No 21st.dev component_builder invocations | **If backfill mode: mark N/A** per mode-detection rule in `shared/landing-page-checklist.md` (section already exists — builder is for fresh installs). **If greenfield: invoke `mcp__magic__21st_magic_component_builder`** per customised section to codify builder usage. | backfill retrofits should not require builder calls — retro correction from AuditHQ v2 |
| B6 | (merged into B3 — removed 2026-04-24 retro) | N/A — see B3 | redundant check removed |
| B7 | Component pattern drifted from Lock | `Skill('web-component')` to re-source from Lock OR update DESIGN-BRIEF if the change was deliberate | reconcile |
| B8 | New session lost 21st.dev citation | `Skill('web-fix')` to restore the comment from git history | undo accidental wipe |

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

---

## Cross-cutting rules

1. **Never invoke a skill listed here without first reading its SKILL.md to know what context to pass.**
2. **Multiple checks routing to the same skill** in one iteration → batch them: one `Skill('typeset')` call passing a list of failures, not 5 separate calls.
3. **If a fix skill is unavailable** → HALT, log NEEDS_HUMAN with skill name, skip this check, continue with next priority. Do NOT inline-fix in main context.
4. **`mcp__magic__21st_magic_component_inspiration` is FREE to call** — call it generously. Cost concern doesn't outweigh anti-slop value.
5. **If a fix skill returns "no improvement available" 3 times in a row for the same check** → mark the check WONTFIX with the reason and continue. Don't loop forever.
6. **Surgical Edit beats full skill re-run.** For any check that's a one-line markdown or file edit (e.g. A10 missing field, B3 missing header comment, E1 missing skip-nav attribute) — use the `Edit` tool directly. Only invoke the heavier skill (`web-design-research`, `colorize`, `typeset`) when the fix is genuinely structural, not cosmetic.

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
