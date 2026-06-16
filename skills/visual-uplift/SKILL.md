---
name: visual-uplift
disable-model-invocation: true
description: "Diagnoses visual quality issues on an existing site and routes each issue to the correct tool (/typeset, /animate, /polish, /calibrate-amplitude, /overdrive, /delight, mcp__magic__21st_magic_component_inspiration, mcp__magic__21st_magic_component_refiner, mcp__magic__logo_search). Memory-aware: refuses to recommend banned moves (Geist/Inter, dark navy + gold, bento default, custom cursor on service brands) without surfacing the rule that bans it. Produces a gated plan first; executes opt-in with before/after SSIM verification. Use when the user says 'make this look better', 'visual uplift', 'improve the design', 'this looks mid', 'level up the visuals', 'better hero', 'fix the typography', 'this looks AI-template', or asks for surgical visual fixes WITHOUT a full /web-evolve rebuild loop. NOT for: initial scaffold (use /web-scaffold), whole-site autonomous rebuild (use /web-evolve), diagnostic-only critique (use /critique), single-axis adjustment when the axis is already known (call the axis skill directly)."
argument-hint: "[path-or-url] | --execute | --tier:90|95|98"
---

# /visual-uplift

**Role:** Diagnose → Route → Plan → Execute (opt-in). Sits between `/critique` (diagnostic only) and `/web-evolve` (whole-site autonomous rebuild). For users who want better visuals without sleeping through an autonomous rebuild loop.

**The skill's job is to choose the right tool for each issue, not to be the tool.** It calls `/typeset`, `/animate`, `/polish`, `/calibrate-amplitude`, `/overdrive`, `/delight`, and Magic MCP tools — it does not duplicate their work.

---

## When to use

| User intent | This skill |
|---|---|
| "Make this look better" / "uplift the visuals" / "this looks mid" | YES — diagnose + route + plan |
| "Improve the hero" / "the typography is off" | YES — single-issue uplift still goes through routing |
| "Rebuild the whole site" | NO — use `/web-evolve` |
| "Review the design" with no intent to change | NO — use `/critique` |
| "Make the type more elegant" with type already diagnosed | NO — call `/typeset` directly |

## When NOT to use

- Greenfield projects with no built routes yet (use `/web-scope` + `/web-scaffold`).
- Sites whose routes return errors / hydration failures (fix structural first via `/web-page`).
- Pure copy/content rewrites (use `/market-copy`).

---

## Four phases

| Phase | What | Default behaviour |
|---|---|---|
| 1. Diagnose | Screenshot every public route at 1440×900, run `/critique` per route in JSON mode, collect dimension scores and blocking issues. | Runs automatically. |
| 2. Route | For each ranked issue, decide which tool fixes it (decision tree in `references/routing-tree.md`). Cross-check memory rules. | Runs automatically. |
| 3. Plan | Write `.visual-uplift/plan.md` — ranked items, sized in AI wall-clock minutes, tool to run, memory-rule risk flags, expected visible delta, recommended order. | Runs automatically. **Stops here unless `--execute`.** |
| 4. Execute | For each plan item: screenshot before → invoke the routed tool → screenshot after → verify visible delta via `Skill('critique', mode: per-iter-delta)`. Stop on first invisible diff or user reject. | **Opt-in only.** Either pass `--execute`, or re-invoke with `go` after reviewing the plan. |

The gate on Phase 4 is intentional. Visual changes that look fine in isolation can collide — typography swap + amplitude bump + new logo set can compound into something Adam never asked for. The plan exists so the user reviews the *whole* set of moves before any of them land.

---

## Phase 1 — Diagnose

### 1.1 Enumerate routes

If a `SCOPE.md` or `DESIGN-BRIEF.md` exists at project root, read it for the route list. Otherwise:
- For Next.js: enumerate `app/**/page.tsx` and `pages/**/*.tsx`.
- For Vite + React Router: read the route config (search for `<Route` or `createBrowserRouter`).
- For a deployed URL: ask the user for the sitemap or fetch `/sitemap.xml`.

Authenticated routes are skipped unless the user passes credentials.

### 1.2 Screenshot every route

Use chrome-devtools MCP at 1440×900 (desktop primary). For each route:

```
mcp__chrome-devtools__navigate_page(url)
mcp__chrome-devtools__resize_page(width: 1440, height: 900)
mcp__chrome-devtools__take_screenshot(fullPage: false) → save to .visual-uplift/screenshots/<route-slug>-baseline.png
mcp__chrome-devtools__take_screenshot(fullPage: true) → save to .visual-uplift/screenshots/<route-slug>-full.png
```

If chrome-devtools MCP is unavailable, fall back to `mcp__puppeteer__puppeteer_screenshot`. If both unavailable, HALT with `NEEDS_HUMAN: visual-uplift requires browser MCP; neither chrome-devtools nor puppeteer is connected.` Per the user's CLAUDE.md, never proceed on approximation.

### 1.3 Critique each route

For each screenshot, invoke `Skill('critique', mode: 'web-evolve', output_format: 'json')` with the per-route-baseline mode. Parse the returned JSON. Capture:

- `vq_aggregate` (the 0–5 overall)
- `vq_by_dimension` (the 10 canonical dimensions — see critique SKILL.md "Canonical dimensions")
- `checklist_fails` (sales-page-10 fails)
- `blocking_issues` (structural — hydration, blank routes)

If any route has a structural blocker (`structural_integrity: 0` or `blocking_issues` non-empty), HALT and tell the user: "Route `/X` is structurally broken — `/visual-uplift` is for visual refinement, not repair. Run `/web-page /X` first." Do not continue.

### 1.4 Rank issues by visual impact, not technical severity

Build the issue list across ALL routes. Each issue is one of these categories:

| Category | Detection signal |
|---|---|
| `typography_mid` | `vq_by_dimension.typography ≤ 2.5` OR banned font detected (Inter, Geist alone) |
| `layout_uniform` | `vq_by_dimension.layout ≤ 2.5` (card-grid sameness, no asymmetry) |
| `color_default` | `vq_by_dimension.color ≤ 2.5` (shadcn slate/zinc/neutral, dark navy + gold) |
| `motion_absent_or_decorative` | `vq_by_dimension.motion ≤ 2.0` AND motion is required for the brand tier |
| `no_signature_moment` | `vq_by_dimension.distinctiveness ≤ 2.5` (no memorable_choice present) |
| `hero_weak` | `vq_by_dimension.hero_impact ≤ 2.5` AND not flagged for REBUILD |
| `brand_assets_missing` | Missing favicon, OG image, real logos for social-proof row |
| `amplitude_off` | Two or more dimensions miss the tier floor by < 0.5 (close, just under-confident) |
| `product_invisible` | `vq_by_dimension.product_visibility ≤ 2.0` (gradient blob in place of real product) |
| `polish_drift` | `vq_aggregate ≥ tier_floor - 0.3` but specific micro-issues (alignment, spacing, hover states) |

Rank by `delta_to_tier_floor × dimension_weight`, where dimension_weight gives higher priority to `distinctiveness`, `hero_impact`, `typography` (the things visitors notice first).

---

## Phase 2 — Route each issue

Read `references/routing-tree.md` for the full decision tree. The summary:

| Issue category | Primary tool | Supporting MCP calls |
|---|---|---|
| `typography_mid` | `Skill('typeset')` | None — typeset has its own reference research |
| `layout_uniform` | `mcp__magic__21st_magic_component_inspiration` (category: editorial/bento/asymmetric) then `Skill('web-page')` for the route rebuild section | Inspiration first, then page-level rebuild |
| `color_default` | Manual token sweep + `Skill('colorize')` if available | Set tokens in CSS, no skill needed for the sweep |
| `motion_absent_or_decorative` | `Skill('animate')` | Reads existing animations, replaces decorative with functional |
| `no_signature_moment` | Propose memorable_choice → route to ONE of `Skill('animate')` / `Skill('delight')` / `Skill('overdrive')` based on amplitude budget | `mcp__magic__21st_magic_component_inspiration` for reference patterns |
| `hero_weak` | `mcp__magic__21st_magic_component_inspiration` (category: hero) → `Skill('web-page')` to rebuild the hero section | Inspiration drives the rebuild brief |
| `brand_assets_missing` | `mcp__magic__logo_search` for partner logos, generate favicon/OG via image tools | Logo search returns SVG; favicon is manual export |
| `amplitude_off` | `Skill('calibrate-amplitude')` with dial calculated from `tier_floor - vq_aggregate` | Computed dial, not guessed |
| `product_invisible` | `Skill('web-page')` to insert real product screenshot/mockup | Real product visibility beats gradient blob every time |
| `polish_drift` | `Skill('polish')` | Last item, after everything else has landed |

**Magic MCP selection rules:**

- `mcp__magic__21st_magic_component_inspiration` — when an issue needs a *pattern reference* before rebuild. Returns inspiration links. Cheaper than rebuilding blind.
- `mcp__magic__21st_magic_component_refiner` — when an existing component is close but mid (e.g., hero exists, fundamentally OK, but undercooked). Returns a refined version.
- `mcp__magic__21st_magic_component_builder` — when a brand-new component is needed that isn't in the codebase. Rare in uplift mode (we're refining, not building from scratch).
- `mcp__magic__logo_search` — when missing real brand logos for testimonials, partner rows, footer. Returns SVG.

### 2.1 Memory rule cross-check (mandatory)

After routing, read `references/memory-rules.md`. For each routed item, check if the recommended approach conflicts with any of:

- `feedback_taste_calibration` — banned fonts (Inter, Geist alone), banned palettes (dark navy + gold), banned components (Lucide-tinted-squares, bento default, dashboard mockup hero), banned defaults (GSAP pinned scroll as the safe signature).
- `feedback_no_custom_cursor_by_default` — never propose a custom cursor for service-business brands.
- `feedback_no_self_quality_claims` — banned self-flattery words (forbidden in plan output: see memory-rules.md for the full banlist).
- `feedback_ai_time_not_human_time` — size estimates in minutes/hours, never days/weeks.

If a recommended approach hits a banned-rule, the plan must:
1. Tag the item with `RISK: banned-default` and quote the rule line.
2. Propose an alternative (e.g. "instead of Geist, try Pangram Pangram or ABC Dinamo").
3. Mark the item `requires_opt_in: true` so Phase 4 will not execute it without explicit user override.

---

## Phase 3 — Plan (the deliverable)

Write the plan to `.visual-uplift/plan.md` at the project root. Use this exact template:

```markdown
# Visual Uplift Plan — <project name>
Generated: <ISO timestamp>
Target tier: <90 | 95 | 98>
Project context: <one line, e.g. "AU SMB managed-service brand, Orbit Digital">

## Baseline scores

| Route | vq_aggregate | Worst dimension | Verdict |
|---|---|---|---|
| / | 2.8 / 5 | distinctiveness (1.5) | REFINE |
| /services | 2.4 / 5 | layout (1.8) | REBUILD (skip — not visual-uplift's scope) |
| /pricing | 3.1 / 5 | typography (2.0) | REFINE |

## Ranked items

### Item 1 — [Quick | Medium | Big swing] · ~15 min
**Issue:** Typography is default-Inter throughout. `vq_by_dimension.typography = 1.8`.
**Tool:** `Skill('typeset')` with extracted reference from Pangram Pangram free weights.
**Expected delta:** typography 1.8 → 3.5, distinctiveness 1.5 → 2.5.
**Memory check:** PASSED (proposed type stack is not on banned list).
**Risk:** None.

### Item 2 — Medium · ~25 min
**Issue:** Hero section reads as generic SaaS template. No memorable choice. `vq_by_dimension.distinctiveness = 1.5`.
**Tool:** `mcp__magic__21st_magic_component_inspiration` (category: editorial-hero), then `Skill('web-page')` to rebuild the hero block only.
**Proposed memorable_choice:** "Variable-axis weight morph on H1 tied to scroll progress (0→100% scroll = weight 100→900)."
**Expected delta:** hero_impact 2.2 → 3.8, distinctiveness 1.5 → 3.0.
**Memory check:** PASSED. Memorable choice is brand-specific (not "dashboard mockup in hero").
**Risk:** None.

### Item 3 — Quick · ~5 min
**Issue:** Logos in testimonial row are generic SVG placeholders.
**Tool:** `mcp__magic__logo_search` for the 5 named partner brands → drop SVGs into `/public/logos/`.
**Expected delta:** trust signals improved; product_visibility 2.8 → 3.2.
**Memory check:** PASSED.
**Risk:** None.

### Item 4 — Big swing · ~40 min · ⚠ REQUIRES OPT-IN
**Issue:** Layout is uniform card grid throughout services and pricing.
**Tool:** `mcp__magic__21st_magic_component_inspiration` (category: bento OR asymmetric), then `Skill('web-page')` per route.
**Proposed direction:** Asymmetric editorial layout — large feature card + 3 supporting cards offset.
**Memory check:** ⚠ FLAGGED. `feedback_taste_calibration` line 41: "Banned components without rebuild: Lucide-icons-in-tinted-squares, ... bento grid services." If accepting bento direction, must commit to a custom variation that doesn't read as the universal SaaS bento. Editorial-asymmetric is the safer of the two.
**Risk:** banned-default. User must explicitly accept the direction before this runs.

## Recommended order

1. Item 1 (typography) — foundation; all subsequent items inherit better type.
2. Item 3 (logos) — quick, no dependency.
3. Item 2 (hero) — depends on typography.
4. Item 4 (layout) — biggest swing; do last so prior wins compound.

## How to proceed

- To run the full plan: `/visual-uplift go`
- To run a subset: `/visual-uplift go --items 1,2,3` (skips item 4)
- To revise: tell me what to change about the plan.
- To bail: do nothing. Plan is committed to `.visual-uplift/plan.md` for later.
```

The plan is the deliverable. Do not execute. Tell the user briefly: "Plan written to `.visual-uplift/plan.md`. N items, M flagged for opt-in. Reply `go` to execute, or tell me to revise."

---

## Phase 4 — Execute (opt-in only)

Fires when:
- The skill was invoked with `--execute` flag.
- OR the user invokes `/visual-uplift go [--items 1,2,3]` after seeing the plan.

For each item in plan order:

1. **Pre-screenshot.** Take the route screenshot at 1440×900 → `.visual-uplift/screenshots/<route>-iter<N>-before.png`.
2. **Invoke the routed tool** with the item's brief.
3. **Post-screenshot.** Same route, same viewport → `<route>-iter<N>-after.png`.
4. **Verify visible delta.** Invoke `Skill('critique', mode: 'per-iter-delta', screenshot_before, screenshot_after)`. Parse `visible_delta_0_to_5`.
5. **Verdict:**
   - `visible_delta ≥ 1.0` → COMMIT the changes. Append to `.visual-uplift/log.md`.
   - `visible_delta < 1.0` → REVERT the changes (git checkout). Mark item VOIDED in log. Do NOT advance the rest of the plan — surface to user: "Item N produced no visible delta. Reverted. Should I try the alternative tool, or skip?"
6. **Memory-flagged items:** Before invoking the tool, re-confirm the user accepted the opt-in. Show the rule one more time. If the user has not explicitly opted in via the original invocation (e.g. `--accept-banned-defaults` flag), skip the item and note in the log.

Stop on first VOID or rejection. Do NOT auto-advance.

After all items: write `.visual-uplift/result.md` with before/after vq_aggregate per route, total time, items completed vs voided.

---

## Output artifacts

| Phase | Artifact | Path |
|---|---|---|
| 1 | Per-route screenshots | `.visual-uplift/screenshots/<route>-baseline.png` |
| 1 | Per-route critique JSON | `.visual-uplift/critique/<route>.json` |
| 3 | The plan | `.visual-uplift/plan.md` |
| 4 | Iter log | `.visual-uplift/log.md` |
| 4 | Final result | `.visual-uplift/result.md` |

---

## Anti-patterns (do NOT do these)

1. **Routing every issue to /polish.** `/polish` is the LAST resort, not the default. It's for drift, not for systemic issues. If every item routes to polish, the plan is wrong.
2. **Recommending bento or dashboard-mockup-hero without flagging.** These are on the banned list. Surface the rule and require opt-in, never silent.
3. **Executing without an explicit user `go`.** The opt-in gate is load-bearing. Visual changes compound; the user reviews the whole set before any land.
4. **Sizing in days or weeks.** This is the user's own work running on AI wall-clock. Sizes are minutes/hours, never days. See `feedback_ai_time_not_human_time`.
5. **Calling `mcp__magic__21st_magic_component_builder` to build whole-page replacements.** That's `/web-page`'s job. The builder is for single-component generation; the inspiration tool drives the rebuild brief.
6. **Skipping the memory-rule check.** If `references/memory-rules.md` exists and you didn't read it, the plan will recommend banned defaults — exactly the failure mode this skill exists to prevent.
7. **Voiding then continuing.** If an item produces no visible delta and gets reverted, STOP. Don't advance to the next item — the routing decision was wrong, surface it to the user.

---

## Related skills

- Use `/critique` for diagnostic only (read-only review, no plan, no execution).
- Use `/web-evolve` for autonomous whole-site rebuild loops (heavier, takes hours).
- Use `/web-page` for whole-route rebuilds when `/critique` returns `verdict: REBUILD`.
- Use `/typeset`, `/animate`, `/polish`, `/calibrate-amplitude`, `/overdrive`, `/delight` directly if you ALREADY know which single axis to fix — this skill exists for when you don't.
- Use `/style-mirror` if the user wants to match a specific reference site exactly (replication mode, not uplift mode).

---

## Proactive triggers (flag without being asked)

- If the user types "make it look better" + a path/URL → invoke this skill.
- If `/critique` finishes with `verdict: REFINE` on 2+ routes and the user asks "now what?" → propose this skill.
- If the user lists 3+ visual issues at once ("the type is bland, the hero is weak, the logos are missing") → this skill, not three separate skill calls.
- If the user says "I don't want a full rebuild but..." → this skill is the answer.
