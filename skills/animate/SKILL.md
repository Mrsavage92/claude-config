---
name: animate
description: Review a feature and enhance it with purposeful animations, micro-interactions, and motion effects that improve usability and delight. Use when the user mentions adding animation, transitions, micro-interactions, motion design, hover effects, or making the UI feel more alive.
argument-hint: "[target]"
metadata:
  version: 3.0.0
  user-invocable: true
---

# /animate

Produce concrete `Edit`/`Write` proposals that add purposeful entrance, micro-interaction, state-transition, and feedback animations to a target file — within the host project's tier ceiling, with reduced-motion guards and ARIA-state replacements on every change.

The output is code, not advice. A `/animate` invocation that returns bullet-list suggestions has failed.

---

## Cardinal rules (load-bearing — non-negotiable)

1. **Output is code, not prose.** The artifact MUST contain ≥3 concrete before/after `Edit` proposals OR an explicit "no enhancement needed — page already at ceiling" finding. Bullet-list recommendations without diffs = phase failure. # source: feedback_skill_pipeline_no_self_synthesis
2. **Respect the host project's site-profile.** Before any proposal, read `<project>/.evolution/site-profile.json` (or `.audit/site-profile.json`). Use the route's `motion_ceiling` as a hard cap. Proposing Tier N+1 on a Tier N-capped route = phase failure. # source: web-animations/references/site-types.md
3. **Context loading is MANDATORY PREPARATION.** The Phase 0 instructions above replace the old context-loading skill call. Follow them — do not paraphrase or skip. # source: feedback_skill_pipeline_no_self_synthesis
4. **`from 'motion/react'`, never `'framer-motion'`.** Framer Motion v12 renamed the package. Any `from 'framer-motion'` import in a proposal = phase failure. # source: motion.dev v12 docs
5. **Every motion proposal includes both a reduced-motion guard AND, where the motion communicates state, an ARIA-state replacement.** Visual-state-only proposals without `aria-pressed` / `aria-expanded` / `aria-current` etc. = phase failure. # source: references/aria-state-replacements.md
6. **One signature moment per route, not maximalism.** Designate exactly ONE hero animation; everything else is micro-interactions, feedback, or removal. # source: motion.dev best practices + Vercel/Linear/Stripe production patterns
7. **Compositor-only properties.** Animate `transform`, `opacity`, `clip-path`, `filter` only. Never `width`/`height`/`top`/`left`/`margin`/`padding`/`font-size`. # source: web-animations/floor-rules.md Floor 5
8. **`background-color` transitions are banned by default** — even on small surfaces. Floor 5 lists `background-color` outright. Replace with overlay-opacity or filter-brightness pattern; if a consumer genuinely needs a CSS color transition, the proposal MUST wrap it in `@media (prefers-reduced-motion: reduce) { .x { transition: none; } }` AND cite the floor-rules.md exception (none currently — escalate). # source: forge-score-v2 deduction
9. **Cite Floor rule on every numeric threshold.** "Scale 0.985 is Tier 1" must cite the floor-rules.md line that defines the 1.015-delta threshold. # source: feedback_verify_from_source_of_truth
---

## When to use

- User asks to "add animation", "make this feel alive", "add motion", "make it pop", "add transitions"
- A feature lacks feedback on a critical action (button click, form submit, state change)
- A page has zero entrance animation and feels static at load
- An existing motion needs an upgrade (replace ad-hoc CSS with a kit component, fix reduced-motion gap)

## When NOT to use

- Building a brand-new component from scratch → use `Skill('web-page')` or `Skill('web-component')`; they import from the web-animations kit directly
- Reviewing existing motion for COMPLIANCE only (no enhancement intent) → use the `/web-animations` grader instead
- 3D / shaders / R3F / Rive / Lottie → escalate to `Skill('overdrive')` — out of scope here
- Documentation / blog / legal pages → MAX_TIER 0 or 1 per role; usually NO animation needed

---

## Web-evolve targeted mode

If args contain `checks:` and `fail_proof:`, you are invoked by `web-evolve`. In this mode:

1. Skip MANDATORY PREPARATION (project context is in args).
2. Parse args: leading text = fix_context; `checks:` = check IDs; `fail_proof:` = exact failure evidence.
3. Apply ONE targeted fix that addresses `fail_proof` — do not audit the whole file.
4. Do not ask questions — all context is in args.
5. Output ONE sentence: which file changed and what changed.
6. **Refuse invisible diffs (web-evolve Cardinal Rule 30).** Before returning, check if your edit changes a rendered pixel. If you're only swapping a token for an identical-value token, shifting alpha by < 0.1, or making a structural change with no visible impact, return `INVISIBLE_DIFF: <reason>` instead of committing. Special case: edits to scroll-driven timing/easing ARE visible but only in motion — return `INVISIBLE_STATIC_DIFF_VISIBLE_IN_MOTION` so the orchestrator flags the iter for video-capture comparison instead of viewport screenshot.

Skip directly to Phase 4 (Implement Animations) below. Skip Phases 0–3.

---

## Phase 0 — MANDATORY PREPARATION

**Context loading — read in this order, stop at the first match:**
1. `tokens.lock.json` at project root → replication mode. Check `forbidden_additions` — if `"hover_scale"` or `"fade_up"` is in the list, those motions are banned for this project.
2. `.agents/context.json` or `DESIGN-CONTEXT.md` at project root → read for motion constraints and design context.
3. Neither exists → **HALT with NEEDS_HUMAN:** "No design context. Run `Skill('style-mirror')` first to establish the lock, or create `DESIGN-CONTEXT.md`."

Note: the original context-loading skill (impeccable) is no longer installed. The above order replaces it.

Then read the host project's motion governance:

- `<project>/.evolution/site-profile.json` — per-route MAX_TIER ceiling
- `<project>/CLAUDE.md` (if present) — locked decisions
- `~/.claude/skills/web-animations/SKILL.md` — tier system + floor rules
- `~/.claude/skills/web-animations/references/floor-rules.md` — every threshold this skill cites must come from here
- `references/per-role-recipes.md` (this skill's references/) — what's allowed per route role
- `references/aria-state-replacements.md` (this skill's references/) — required when removing state-bearing motion

If any of these files are absent in the host project, HALT with `NEEDS_HUMAN: project lacks motion governance — run /web-animations Phase 0 first`.

---

## Phase 1 — Read the target

`<target>` is whichever file/path the user named (or "this page" / "the pricing flow" inferred from context).

Read:
- The target file in full.
- Every component the target file imports from the project (one level deep).
- Whatever currently animates in the target. Build a `Pre-existing motion` inventory with file:line citations.

If the target has zero motion to enhance and the route ceiling is already met by current implementation, output an honest "no enhancement needed" finding — that IS a valid artifact under Cardinal Rule 1. Do not invent proposals.

---

## Phase 2 — Classify the target

From `site-profile.json`, find the route's `role` (`pricing`, `dashboard-home`, `homepage-marketing`, etc.) and `motion_ceiling`.

Open `references/per-role-recipes.md`. Find the matching row. Read:
- `MAX_TIER` (hard cap)
- `Allowed moves` (proposals must come from this set)
- `Banned moves` (explicit exclusions — list these in the artifact's "What I deliberately did NOT propose")
- `Hero moment` (the one signature place where motion concentrates)

If the route doesn't match any row, HALT with `NEEDS_HUMAN: route role <X> not in per-role-recipes.md — define it before proposing motion`.

---

## Phase 2.5 — Enumerate Allowed moves NOT proposed (mandatory rationale)

Before writing proposals, list EVERY entry in the recipe row's `Allowed moves` column. For each one, decide: PROPOSE or SKIP. Every SKIP must come with a one-sentence rationale.

This prevents the skill from silently omitting moves the recipe authorises. A blocking gap surfaced in v2 review: SpringButton on plan CTA was an `Allowed move` and the artifact neither proposed nor explicitly skipped it — silent omission counts as a coverage gap.

Format in the artifact:

```markdown
### Allowed-moves audit (per recipe row)
- **FadeUp (rows mount only)**: PROPOSED (Proposal 1)
- **SpringButton on plan CTA**: SKIPPED — reason: <one sentence>
- ... (every Allowed move from the recipe row)
```

Then proceed to Phase 3.

---

## Phase 3 — Plan (≤6 proposals, one of them is the hero)

A `/animate` artifact is a small set of high-leverage changes, not a sweep. Pick:

- **1 hero moment.** The signature animation per the recipe row.
- **≤3 feedback / micro-interaction additions.** Where action lacks acknowledgement, where state-change is abrupt, where the route role's `Allowed moves` permit.
- **≤2 removals.** If the target violates its tier ceiling, REMOVING motion is a valid proposal.

≥6 total proposals on one route = artifact violates the "one signature moment" rule.

---

## Phase 4 — Write proposals

For each proposal, the artifact MUST contain ALL of:

1. **File path** (absolute)
2. **Tier label** (`Tier 1 entrance`, `Tier 2 micro-interaction`, etc.) — must be ≤ route MAX_TIER
3. **Before** code (verbatim from current file, ≥3 lines context)
4. **After** code (the proposed change, complete and copy-pasteable)
5. **Rationale** (one sentence — why this serves the route role's UX)
6. **A11y** — explicit statement of:
   - Reduced-motion handling (`useReducedMotion()` check OR `motion-reduce:` Tailwind variant OR explicit "no spatial motion — no guard needed")
   - ARIA-state replacement when removing/replacing a state indicator (per `references/aria-state-replacements.md`)
   - Focus management when relevant (modals, route transitions)
7. **Floor citation** — for any threshold (scale delta, duration, y-offset, stagger), cite the floor-rules.md line that authorises it
8. **Compositor check** — confirm the animation only touches `transform / opacity / clip-path / filter`

Removal proposals must additionally include a **cascade check**: after the removal, are there orphaned imports, hooks, or state variables to clean up? If yes, propose those removals too.

---

## Phase 5 — Artifact format

Save the artifact to `<project>/.review/animate-artifact.md` (or wherever the host workflow expects).

```markdown
### Target
<file path>

### Files read
- (full list, one per line, real paths only)

### Site profile findings
- Route role: <X>
- Route motion_ceiling: <N>
- Allowed moves: <list from recipe row>
- Banned moves: <list>
- Hero moment per recipe: <description>

### Pre-existing motion in target
- <file:line>: <what's there> (Tier N — compliant / non-compliant)
- ...

### Proposals

#### Proposal 1 — <name> (HERO)
**File**: <path>
**Type**: <Tier label>
**Before**: <code>
**After**: <code>
**Rationale**: <one sentence>
**A11y**: reduced-motion: <how>; ARIA-state: <if applicable>; focus: <if applicable>
**Floor**: <citation>

#### Proposal 2 — ... (micro-interaction)
...

#### Proposal N — ... (removal — if any)
...

### What I deliberately did NOT propose
- <banned move 1 — why>
- <banned move 2 — why>

### Hero moment designation
Proposal <N> is the single hero moment for this route. Other proposals are feedback or removal.
```

---

## Anti-patterns (do NOT do these)

1. **Returning prose bullets instead of code diffs.** "I recommend adding a fade-up to the hero" is a failure. The artifact must be edits.
2. **Skipping Phase 0 context loading.** Proceeding without reading tokens.lock.json, .agents/context.json, or DESIGN-CONTEXT.md when one exists is the failure mode this skill explicitly bans.
3. **Proposing Tier N+1 on a Tier N-capped route.** Read site-profile.json BEFORE choosing tier — not after.
4. **Removing a layoutId or motion.span without adding the ARIA-state replacement.** Visual-only motion that communicated state needs `aria-pressed`/`aria-expanded`/`aria-current` when stripped.
5. **Inventing edge cases.** If the target has no form, don't fabricate a form-submit proposal. Note "no form on this route — N/A" and move on.
6. **Asserting numeric thresholds without floor-rules.md source.** "Scale 1.05 is OK" must cite the line that says so.
7. **Importing `from 'framer-motion'`.** Use `'motion/react'` — Framer renamed the package in v12.
8. **More than 6 proposals on one route.** Violates the one-signature-moment rule and produces motion noise.

---

## Output artifacts

| File | Purpose |
|---|---|
| `<project>/.review/animate-artifact.md` | The concrete proposals from this run |
| `references/per-role-recipes.md` | What's allowed per route role |
| `references/aria-state-replacements.md` | ARIA equivalents when removing state-bearing motion |

---

## Related skills

- Context loading (Phase 0) — tokens.lock.json → .agents/context.json → DESIGN-CONTEXT.md → HALT
- `Skill('web-animations')` — the tier system + kit + grader this skill obeys
- `Skill('polish')` — smaller scope: micro-interactions only, no entrance choreography
- `Skill('overdrive')` — escalation for Tier 4 (3D, shaders, Rive, Lottie)
- `Skill('web-page')` — building a new page from scratch (imports from kit directly)
