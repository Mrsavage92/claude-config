---
name: web-evolve
description: >
  Auto-decided, score-driven continuous improvement loop for existing websites.
  Invoke with `/web-evolve` — no flags. Phase A.0 assesses the site and history
  (trajectory.json) and picks the target tier: High-tier SaaS (90), Stripe/Linear
  (95), Awwwards SOTD (98), or Awwwards SOTM (100). Re-invoke in any chat to
  advance — the skill reads disk state and pushes one tier higher. Phrases like
  "repeat", "again", "level up" trigger the same advance path. Orchestrates four
  specialist agents (web-score, web-benchmark, web-patch, web-screenshot) plus
  refinement skills (impeccable, overdrive, animate, typeset, colorize, polish,
  etc.) and MCPs (21st.dev builder/refiner, chrome-devtools, puppeteer).
---

# Skill: /web-evolve

**Single command, auto-decided.** Run `/web-evolve` with no flags. The skill examines the live site, the project signals (CLAUDE.md, CONTEXT.md, Vercel presence, motion stack), and `.evolution/trajectory.json` if it exists, then picks the right target tier and phase plan automatically. Re-running it (same chat or new chat) advances to the next tier. See `references/multi-run-orchestration.md` for the full decision tree.

Coordinates four specialist agents (web-score, web-benchmark, web-patch, web-screenshot). Never audits or fixes inline. Calls refinement skills directly in its own context. Delegates commit-only work to web-patch.

---

## Cardinal rules

1. **Never audit inline.** All scoring from web-score agent JSON output only.
2. **Never fix inline.** Code changes via `Skill('X')` or MCP tools in this context only.
3. **No score without receipt.** Every score cites `score.json` from web-score.
4. **No kept commit without VISIBLE_DIFF.** Every kept iteration cites web-screenshot verdict.
5. **Vision checks block until user confirms.** Surface NEEDS_HUMAN, wait, update, continue.
6. **NULL_DELTA = VOID for design checks only.** For code-quality/documentation-only checks (B-series, H-series, D1, A11, I4, I8, I2 when fix_context is docs-only), NULL_DELTA does NOT trigger VOID — rescore only, KEEP if checks now PASS.
7. **Raw transparency.** Veto cap hiding >5 pts: show both numbers always.
8. **Visual impact is the primary success criterion. Score is a proxy, not the goal — and the proxy can be gamed. Independent measurement is mandatory.** The loop succeeds when a human (or independent skill) looking at before/after says "this looks dramatically better." Enforcement happens via TWO independent measurements at exit-attempt, NOT via orchestrator self-scoring:

   **Measurement 1 — Puppeteer screenshots** (objective evidence): capture baseline_screenshot (from Phase A.7.5 archived to `.evolution/baseline/`) + post_run_screenshot (fresh, post-final-deploy).

   **Measurement 2 — `Skill('critique', args='compare baseline vs post-run | screenshots: [path1, path2] | output_format: json | output_schema: {dimensions: [{name, score_0_to_5, evidence_summary, screenshot_hash}], aggregate_vq: number, screenshots_analyzed: [{path, sha256}]} | dimensions: hero-impact, hierarchy, distinctiveness, product-visibility, motion, type, color, layout | tier: {target}')`** — the critique skill scores both screenshots independently on a 4-axis 1-5 scale (matching the Phase A.7.5 baseline axes), returning STRUCTURED JSON with a defined schema. The orchestrator MUST use critique's returned scores, NOT its own.

   **Output contract (mandatory — orchestrator validates):**
   ```json
   {
     "screenshots_analyzed": [
       { "path": "<exact path passed in args>", "sha256": "<hash of file content>" },
       { "path": "<exact path passed in args>", "sha256": "<hash of file content>" }
     ],
     "dimensions": [
       { "name": "hero-impact", "score_0_to_5": 4.2, "evidence_summary": "..." },
       ...
     ],
     "aggregate_vq_baseline": 4.0,
     "aggregate_vq_post_run": 4.5
   }
   ```

   **Hash verification (P10 — proves critique saw the actual files, not stale/cached):**
   Before invoking critique, orchestrator computes `sha256sum` of each screenshot file. After critique returns, orchestrator compares the returned `sha256` hashes against the locally-computed ones. **If they don't match → critique returned without actually reading the files → REJECT result, retry once, then HALT NEEDS_HUMAN.** This catches the failure mode where the skill returns generic scores based on file paths in args without actually reading file content.

   **Schema validation:** If returned JSON is missing required fields, has type mismatches, or `aggregate_vq_*` is outside [0, 5] → REJECT, retry once with explicit schema reminder in args, then HALT.

   **`vq_delta = critique.aggregate_vq_post_run - critique.aggregate_vq_baseline`**

   **Required delta:** `≥ 0.5` at target 90, `≥ 0.7` at target 95, `≥ 1.0` at target 98, `≥ 1.5` at target 100. If the delta floor is not met, the score does not matter — the run is NOT complete. Re-enter Phase C with the priority queue re-sorted by `visual_bonus` and force the top 3 unflipped visual checks through their refinement skill.

   **Self-scoring is BANNED.** Run #2 on Orbit Digital (2026-05-16) "measured" post_run_vq = 4.5 via orchestrator self-grading — that is exactly the failure mode this rule exists to prevent. If `Skill('critique')` is unavailable (skill missing, error), the run HALTs NEEDS_HUMAN: `"Independent VQ measurement requires Skill('critique'). Install or fix critique skill before re-running."` Do not fall back to self-scoring.

   The OR-clause exit ("score met OR baseline_vq already high") is **banned** — it lets runs report complete without visible change. This rule was tightened 2026-05-16 after Run #1 hit 60 → 99 score with 4.0 → 4.1 self-scored delta (user verified "looks no different"), and re-tightened the same day after Run #2 self-scored its own 4.0 → 4.5 delta to claim partial success.
9. **Invisible checks must never block visible ones.** Code-quality checks (B-series, D1, H-series, C6, C7, I5, I6, A11, I4, I8, I2) must NEVER occupy iteration slots 1-3 if any visual check (A7, A9, D4, D5, F6, K2, K4, E-section checks) exists in the queue.
10. **Bold execution required.** Every call to overdrive/impeccable/bolder MUST include explicit boldness instructions. "Subtle" is a failure. The before/after screenshots must show obvious visible difference.
11. **CONTEXT.md is the anchor.** No iteration begins without a fresh CONTEXT.md (≤7 days, no newer commits). Every refinement is checked against Locked Decisions and Anti-Goals from CONTEXT.md before commit. A change that violates either is a VOID, not a KEEP — even if it improves the score.
11.5 **Auto-decide everything from disk + signals — no flags required.** Phase A.0 decides target_score, mode (fresh/resume/advance), phases to run, max_iterations, and focus list. The user invokes `/web-evolve` with nothing and gets the right plan. Re-invocation (any chat, any time) reads `.evolution/trajectory.json` and advances one tier. Repeat-signal phrases (`repeat`, `again`, `level up`, `continue`, `next`, etc.) map to "advance" mode. Flags exist as escape hatches only — see `references/multi-run-orchestration.md`. **NEVER ask the user "Resume? yes/no" or "Target tier?" — decide and proceed.**
11.6 **SKILL_LOOKUP is the routing authority — orchestrator MAY NEVER self-promote `edit_direct`.** Before applying any fix, the orchestrator MUST read `references/fix-routing.md` `SKILL_LOOKUP[check_id]`. If `edit_direct === false`, the iteration MUST invoke `Skill(fix_skill, ...)` via the Skill tool. Direct `Edit`, `Write`, `Bash sed`, or `npm install + Edit` for that check is a **PHASE FAILURE**:
    - The iteration does NOT count toward `real_iterations`
    - The check is re-queued (not flipped to PASS)
    - The run is logged in trajectory.json with `status: "route_around_detected"`, blocking the next-tier advance
    - The user-facing summary leads with `⚠️ Route-around detected on checks: [list]`
    **Why this rule exists:** Run #1 on Orbit Digital (2026-05-16) fired ZERO refinement skills across 5 iterations by treating `edit_direct` as the default for A1/E10/J2/C4/I1/I2/I8/D1 — all of which had `edit_direct: false` in SKILL_LOOKUP. Score went 60 → 99, visual quality went 4.0 → 4.1. The user said "looks no different to me." The orchestrator was scoring the proxy and skipping the work. **Only checks with `edit_direct: true` in SKILL_LOOKUP (A10, B5, E1, G1, G2 — the small process/admin/declarative ones) are eligible for direct Edit. Everything else MUST route through the named skill, even if the orchestrator can "see" a one-line fix.**
11.7 **Refinement-skill invocation floor — Phase C must invoke design skills, AND each invocation must be tied to a specific Phase A finding.** The floor is a minimum, not a counter to game.

    **Counting rules (updated 2026-05-17):**

    - At least `floor(max_iterations * 0.6)` iterations MUST invoke a skill from `{impeccable, overdrive, animate, typeset, colorize, polish, bolder, delight, layout, distill, clarify, adapt}` via the `Skill()` tool. Minima:
        - target 90 → ≥ 1 refinement-skill iteration
        - target 95 → ≥ 3 refinement-skill iterations
        - target 98 → ≥ 6 refinement-skill iterations (one per Phase R hero-signature commitment + one per major visual category)
        - target 100 → ≥ 8 refinement-skill iterations
    - **Each counting invocation MUST cite a specific `page-baselines.json` finding ID or `blocking_issue` in its args.** Skill calls that don't reference a Phase A finding by ID are not counted toward the floor. (Stops orchestrator from manufacturing busywork iters to pad the count.)
    - **Iters VOIDED by Rule 30 (invisible diff, SSIM > 0.985) are subtracted from the count.** A VOIDED iter is not a counted iter. (Stops orchestrator from gaming the floor with no-op refinements.)

    If the priority queue empties before the floor is met (rare — usually means the checklist found nothing visible to fix), the orchestrator MUST fire `Skill('critique', args='...')` to generate fresh visual targets, route them through the appropriate refinement skill, and continue Phase C. **Exiting Phase C with the refinement-skill floor unmet is a route-around failure** — trajectory.json records `status: "incomplete_refinement_floor"`.

    **Why the tightening:** Run #3 (2026-05-17) "met" the target-98 floor of 6 with 3 invisible iters (border-token swap, 0.85→0.72 alpha shift, hex-to-token cleanup — all SSIM ≥ 0.99). The count was met; the spirit (visible improvement) was violated. The two new clauses force every counted iter to (a) address a real Phase A finding and (b) produce a visible delta.
12. **`impeccable teach` is mandatory once per project.** Refinement skills (typeset, colorize, layout, animate, polish, bolder, distill, quieter, delight, clarify) produce generic output without design context. Phase A MUST fire `Skill('impeccable', args='teach')` once per project. The "teach" output is cached in `.evolution/design-context.md` and passed to every subsequent skill call. Skipping = silent generic-output failure mode (AuditHQ v2 retro 2026-04-24).
13. **Design DNA loaded before any UI call.** `~/.claude/web-system-prompt.md` (token system, typography scale, color discipline, visual signatures) MUST be read in Phase A and re-cited in every Skill() args block as a token-discipline marker. Refinement skills must respect Design DNA over their own defaults.
14. **Self-audit at exit, with hard gates.** Phase F runs after Phase D and writes `.evolution/retro.md` with per-skill efficacy (KEEPs/REVERTs/VOIDs), proposed `fix-routing.md` edits, and a diff against this skill's own Cardinal Rules + `tier-contracts.md`. The loop never exits without producing this retro. **Three hard gates that override "completed" status:**
    - **Gate A (route-around):** if Phase C invoked zero refinement skills AND `target_score ≥ 90` → trajectory.json `status: "route_around_detected"`. User-facing summary leads with `⚠️ Route-around failure — this run optimised the score without invoking a single refinement skill. Visual quality delta: {x}. Re-run required.`
    - **Gate B (visual delta floor):** if `post_run_vq - baseline_vq < required_delta_for_tier` (see Rule 8) → trajectory.json `status: "vq_delta_below_floor"`. Summary leads with `⚠️ Score met but visual quality moved {x} — below the {required} threshold for target {tier}. Re-run required.`
    - **Gate C (refinement-skill floor):** if Phase C invocations of refinement skills < tier minimum (see Rule 11.7) → trajectory.json `status: "incomplete_refinement_floor"`. Summary leads with `⚠️ {n} refinement-skill iterations fired, {required} required for target {tier}. Re-run required.`
    The retro must then propose the specific skill invocations that should have fired (priority, skill, args) and offer to run them now via a single message: "Run the missed iterations now? They will be added to the same evolve branch."
15. **21st.dev pipeline is three-stage, not one.** Component-source flow is `inspiration` → `builder` → `refiner`, never just `inspiration`. Inspiration alone gives prose suggestions; builder generates actual JSX; refiner improves what is already in the repo (which is what `web-evolve` does most of the time).

---

## Cardinal rules — Top-Tier tier (apply when `--top-tier` OR `target_score ≥ 98`)

These rules supersede their generic versions when top-tier mode is active. Full spec: `references/top-tier-tier.md`.

16. **Awwwards-aligned scoring.** Drop the flat 0–100 score. Use 4 dimensions on 10-point scale: Design (40%) / Usability (30%) / Creativity (20%) / Content (10%). Loop exits only when per-dimension minima are met AND weighted average ≥ target. SOTD = 8.0 avg. SOTM = 8.5 avg with Creativity ≥ 9.
17. **Pick ONE hero signature, execute fully. Combined picks are BANNED at base tier.** Hero must be EXACTLY ONE of: (A) WebGL/3D scene via R3F+drei+postprocessing, (B) GSAP ScrollTrigger pinned narrative (2–4 viewports), (C) Kinetic typography with variable-axis animation. Half-committed heroes fail this tier. **Phase R Step R.3 rejects combined picks** — see `references/top-tier-tier.md` for the full singularity prompt + combined-override contract (raises Gate F bar AND raises Gate C floor proportionally to the number of signatures picked, not softens — combined is HARDER, not easier). Run #2 on Orbit Digital (2026-05-16) declared "B+A+C combined" and delivered B-only at ~40% — that was a Rule 17 violation enabled by both ambiguous language and a softening clause that contradicted Phase F.1.5 (Gate F). Both fixed 2026-05-16.
18. **Lenis is mandatory** at top-tier. Locomotive is deprecated. `lenis` package with `autoRaf: false syncTouch: false` when GSAP drives the ticker. No native CSS `scroll-behavior: smooth`.
19. **GSAP owns scroll choreography.** ScrollTrigger pins, SplitText reveals, Flip transitions, MorphSVG when relevant — all free post-Webflow acquisition (Apr 2024). Framer Motion is allowed for component state but never for scroll-narrative.
20. **Custom cursor + magnetic interactions — OPT-IN only, never auto-shipped.** ~~Required~~ Removed-as-default 2026-05-17 after user rejected the iter-1 custom cursor on Orbit Digital ("wtf is that mouse animation - omg no remove immediately"). Custom cursors are an Awwwards-portfolio aesthetic that read as "agency show-off" on service-business sites — wrong tone for diagnostic / professional / Linear-tier brands.

    **The new contract:** custom cursors are OPT-IN per project. They ship ONLY when:
    1. The project's CLAUDE.md or DESIGN-BRIEF.md explicitly authorises a custom cursor, OR
    2. The user explicitly asks for one in their `/web-evolve` invocation (e.g. `/web-evolve --custom-cursor`), OR
    3. `tokens.lock.json` shows the reference site uses one (replication mode).

    Absent any of those signals, **DO NOT ship a custom cursor**. The native OS cursor is the correct default for service-business sites. `data-magnetic="true"` on CTAs is allowed only when the cursor is opted-in (it's a no-op otherwise).

    **Why:** Run #3 on Orbit Digital (2026-05-17) shipped a 166-line custom dot+ring magnetic cursor as iter 1 because Rule 20 said "required." User's verdict on seeing it: immediate reject. The cursor was reverted same day. Rule 20 was too prescriptive — Awwwards-tier ≠ Awwwards-portfolio-aesthetic ≠ correct for every project's audience. **Demoted 2026-05-17.**
21. **View Transitions API on every route change.** Same-doc transitions (Chrome 111+, Safari 18+, Firefox 144+). `viewTransitionName` on shared elements. `prefers-reduced-motion` respected (skip if reduce).
22. **Variable font from foundry — not Inter from Google as the only choice.** Recommended free: Geist (Vercel, OFL). Commercial: Söhne, Calibre, GT America. At least one variable axis animated on hover or scroll. Pangram fonts are free-to-try ONLY — pay if shipping, do not auto-install.
23. **Real product UI in hero.** No gradient blob. No shadcn primitives playing dress-up. Either actual product screenshots/videos, OR an R3F scene that visualises the product concept.
24. **Performance traced by chrome-devtools-mcp, not synthetic PageSpeed.** Real Chrome traces against deployed URL with 4× CPU slowdown + Slow 4G emulation. Targets: LCP < 2.0s, INP < 150ms, CLS < 0.05 (target 98) — tighter at target 100.
25. **OKLCH color tokens. No shadcn defaults.** `slate`/`zinc`/`neutral` are the AI-template signature. 1 brand accent + 2 neutrals + 1 surface, period.

26. **Originality Gate — defer to `Skill('taste-skill')` as the full authority.** The orchestrator's reflex picks ARE the AI-generic aesthetic. The `taste-skill` skill (installed at `~/.claude/skills/taste-skill/SKILL.md`, source: `github.com/Leonxlnx/taste-skill`) is the canonical source of banned patterns + approved alternatives — much more researched than the orchestrator's own instincts. **Read that skill at Phase R + reference it in every Phase C refinement skill call.**

    **Skill('taste-skill') sections most relevant to web-evolve:**
    - Section 3: Design Engineering Directives (typography / color / layout / materiality / interactive states / forms — the bias-correction rule set)
    - Section 4: Creative Proactivity (liquid glass, magnetic micro-physics, perpetual micro-interactions, layout transitions, staggered orchestration)
    - Section 5: Performance Guardrails (DOM cost, hardware acceleration, z-index restraint)
    - Section 7: AI Tells — Forbidden Patterns (banned fonts, banned colors, banned content patterns, banned external resources — the canonical "what NOT to do" list)
    - Section 8: The Creative Arsenal (high-end inspiration patterns by category — Navigation / Layouts / Cards / Scroll-Animations / Galleries / Typography / Micro-Interactions)
    - Section 9: The Motion-Engine Bento Paradigm (5-card archetypes for SaaS dashboard sections — perpetual motion specs)
    - Section 10: Final Pre-Flight Check (the 7-item checklist orchestrator runs in Phase F)

    **MANDATORY taste-skill integration points:**

    1. **Phase R Step R.3 (signature commitment):** after user picks A/B/C, invoke `Skill('taste-skill')` to surface taste-skill's Section 7 banned patterns + Section 3 bias-correction directives. The orchestrator MUST cross-check the proposed signature + DESIGN-BRIEF font/color/layout picks against taste-skill's banned list. Conflict → re-surface to user with the specific taste-skill rule violated.

    2. **Phase A Step A.8.5 (impeccable teach):** when firing `Skill('impeccable', args='teach')`, ALSO fire `Skill('taste-skill')` in parallel — both outputs are merged into `.evolution/design-context.md`. Subsequent refinement skills receive BOTH impeccable's design context AND taste-skill's banned-list / approved-list / dial values in their args.

    3. **Every Phase C refinement skill call:** args MUST include marker `taste_skill_rules: see ~/.claude/skills/taste-skill/SKILL.md sections 3, 4, 5, 7` so the refinement skill respects taste rules at generation time.

    4. **Phase F.1.5 (signature delivery check):** in addition to Puppeteer runtime verification of the signature, fire `Skill('taste-skill')` against the final deployed URL with args `pre-flight-check-mode | url: {live_url} | screenshots: [...]`. Skill returns a verdict against its Section 10 pre-flight checklist. Failures block exit + add `taste_violation: [list]` to trajectory.failed_gates.

    5. **Project-to-project trajectory cross-check (preserved from earlier draft):** at Phase R Step R.3, orchestrator reads trajectory.json across ALL prior web-evolve projects on this machine. If proposed signature (font + palette + hero pattern) matches any prior project's final state by ≥2 dimensions → reject + re-pick. **Project-to-project visual collision is THE failure mode.** Every project must be visually distinguishable.

    **Where my earlier banned-list disagrees with taste-skill — defer to taste-skill** (it's more researched). Notable diff: my draft banned Geist; taste-skill explicitly allows Geist (Section 3 Rule 1 — `Geist + Geist Mono` is the recommended pairing for Dashboard/Software UIs). Resolution: Geist is allowed only when paired with Geist Mono in technical UI contexts; banned for "high-tier" or "creative" briefs. Defer to Section 3 Rule 1 for full pairing logic.

    **"One memorable choice" rule (preserved):** before Phase F exit, orchestrator must name the ONE thing about this site that no other site has. Cross-reference against taste-skill Section 8 (Creative Arsenal — 50+ high-end concept categories). If unable to name a memorable choice OR if the named choice is generic per taste-skill Section 7 → re-enter Phase C with `Skill('overdrive', args='originality-emergency')` + `Skill('taste-skill', args='propose-memorable-choice-from-section-8 | current_signature: {sig} | banned_overlaps: {list}')`. **Status `mid_tier_no_originality` blocks exit.**

    **Why this exists:** Run #2 on Orbit Digital (2026-05-16) shipped Geist + dark navy `#0d1117` + dashboard mockup in hero + bento services + Lucide-tinted-squares + GSAP pinned scroll. Every choice was the most-common version of the choice. User's feedback: "no style, no true unique designs, everything you generate for me is 2020 same copy and paste AI design." The taste-skill (added to this project's harness 2026-05-17) is the canonical source for bias-correction; this rule mandates its use at every taste-relevant gate. **Added 2026-05-16, taste-skill integration added 2026-05-17 (CL-4 below).**

27. **NEVER self-rate the visual output as a quality claim.** The orchestrator's instinct is to say "this looks major / dramatically better / first-rate / top-tier." That's the same self-scoring loophole Cardinal Rule 8 closes for VQ delta — extended to all visual judgment. **At Phase D and Phase F user-facing summaries, the orchestrator may state ONLY facts** ("deployed to commit X, GSAP timeline pinned for 100vh, font swapped from Inter to {foundry}{font}") — never quality claims about its own output. Quality assessment is `Skill('critique')`'s job, not the orchestrator's. Run #2's "MAJOR hero!" / "Services rebuild!" / "TRANSFORMATION!" framing was exactly this failure mode. **Added 2026-05-16.**

28. **HALT NEEDS_HUMAN paths are SUPERVISED-mode-only by default. `--unsupervised` mode converts them to soft-degrades.** Run #1 + Run #2's failure was orchestrator self-completion; the patch series in CL-1/CL-2/CL-3 fixed that by adding ~15 HALT gates. But HALT = wait for human = run dies overnight. For autonomous overnight runs the gates should DOWNGRADE the outcome (mark in trajectory.failed_gates) not BLOCK execution.

    **Read at Phase A.0 startup:** if `--unsupervised` flag is set, write `UNSUPERVISED_MODE=true` to env + loop-state.json. All subsequent HALT NEEDS_HUMAN dispatches read this flag.

    **HALT dispatch table (canonical — every HALT in the spec routes through this):**

    | Original HALT trigger | Supervised behaviour (default) | Unsupervised behaviour |
    |---|---|---|
    | chrome-devtools-mcp missing at target≥98 (Phase G.5 / Cardinal Rule 24) | HALT for install | Auto-downgrade `deliverable_target_score = 95`, log `chrome-devtools-mcp unavailable, downgraded to deliverable_target=95 for this run`, continue |
    | Mandated agents (a11y/seo/critique) skipped or errored (Phase A.1.5 / Gate D) | HALT | Continue with `gate_d.failed=true, missing_artifacts: [list]`, Gate B (VQ delta) marks `confidence: low` |
    | `Skill('critique')` unavailable for baseline VQ (Phase A.7.5 / Cardinal Rule 8) | HALT | **HARD HALT (updated 2026-05-17 by Rule 36) — critique unavailability now blocks ALL runs, supervised or not. Cannot fly blind on the primary VQ signal. If critique skill is missing/errored, the run dies before iter 1 with `HALT NEEDS_HUMAN: Install or fix Skill(critique) before re-running`.** |
    | `Skill('critique')` JSON schema invalid (Cardinal Rule 8 / P6) | retry once + HALT | retry once + loose-parse what came back + log warning + continue |
    | Critique screenshot hash mismatch (Cardinal Rule 8 / P10) | retry + HALT | log warning + continue (it's a verification, not a contract) |
    | CONTEXT anti-goal vs Phase R signature conflict (Phase R.3.6 / P14) | Surface to user, 30s soft-pause | Default to "respect anti-goal" (re-pick signature OR if no fallback, lock signature with `anti_goal_overridden: true` flag) |
    | Phase R artifacts missing (Phase R.5 / Gate E) | HALT for re-run | Auto-run R.1-R.4 inline (don't HALT, just do the work) |
    | Vercel preview URL unresolvable (Phase D Step 5 / P5) | HALT or `--no-preview-verify` | Auto-act as if `--no-preview-verify` is set, log `preview-verify skipped, prod-verify only` |
    | Above-fold check fails post-corrective (Phase C Step 3.4 / P6) | HALT abort iter | Force one corrective size-pass; if STILL fails, commit anyway + flag iter `above_fold_unrecoverable` + continue |
    | Complexity gate >500 lines or >100 lines across >5 files (Phase C Step 3 / P8) | HALT for user decision | Auto-act as `--allow-large-change`, commit + flag iter `complexity: high+autoapproved` |
    | Tier mismatch declared vs deliverable (Phase A.0.10 / P10) | 5s soft-pause | Auto-act as if `--allow-tier-mismatch`, run at deliverable, log mismatch |
    | trajectory.json schema mismatch / unparseable (P15) | HALT | Back up old trajectory to `.evolution/trajectory.backup-{ts}.json` + start fresh trajectory, log warning |
    | HALT escalation counter ≥3 (P20) | Fire root-cause-analyzer | Same — but root-cause-analyzer fires in background, run continues (don't await its result, just log to trajectory) |
    | Tier 98 + Phase R signature lib missing (Phase R.3.5 / P4) | HALT | If Phase G is scheduled → continue (Phase G installs); if not → auto-add to package.json + run npm install + continue |
    | mtime fingerprint shows zero file changes after Skill (Cardinal Rule 11.6 / P1) | log NEEDS_HUMAN | Same as supervised — this one stays as-is (it's a critical signal that orchestrator can't bypass) but increments `consecutive_no_op_skill_calls` counter; if counter ≥3 → HALT even in unsupervised (legitimately stuck, no point continuing) |

    **HARD HALTs preserved in `--unsupervised` mode** (these must HALT even autonomously — continuing causes prod breakage or data loss):

    1. **TypeScript / build errors** — `npx tsc --noEmit` fails. Cannot deploy broken code.
    2. **Dirty working tree at Phase A.1.7 pre-branch-create** — uncommitted user changes might be lost in branch switching. HALT regardless.
    3. **>5 consecutive iteration VOIDs** — the run is stuck; continuing wastes the rest of the night burning Opus tokens on no-ops.
    4. **Vercel prod deploy returns BUILD FAILURE on main push** — Phase D Step 9 polls for prod deploy; if Vercel reports `failed` status, HALT immediately (don't keep iterating against a broken main).
    5. **`Skill()` invocation infrastructure errors** (skill not found, MCP server down, network error preventing any tool calls) — run can't proceed at all.
    6. **`Skill('critique')` unavailable** (added 2026-05-17 by Rule 36) — primary VQ signal; orchestrator cannot self-rate per Rules 8 + 27. Without critique the run is gate-blind.
    7. **Phase A.1.5 page enumeration produces zero routes** (added 2026-05-17 by Rule 29) — sitemap unreadable + homepage crawl returned no internal links. Cannot establish per-route baselines. Without baselines Phase R-IA mode (Rule 31) cannot run.

    **Morning review pattern:** when user wakes up to an unsupervised run, the first thing they read is `trajectory.runs[-1].failed_gates` (P8 fix array). Each soft-degrade logs there with structured detail. Decision tree:
    - All gates passed → run completed cleanly, review the diff
    - Some gates failed but run completed → review which gates, decide whether to re-run vs accept
    - Run HALTed early on a hard-HALT → trajectory.halted_at field shows where + why

    **Why this rule exists:** Adam called out 2026-05-17 that the gate-tightening series turned every uncertainty into a HALT path, making overnight runs unviable. Architecturally the gates should DOWNGRADE outcomes, not BLOCK execution. **Added 2026-05-17 (CL-5).**

29. **Phase A enumerates EVERY public route — not just the homepage. NO EXCEPTIONS, including --unsupervised. Default verdict per route is REBUILD, not REFINE.** Hero-only baseline is the route to "you didn't evolve anything" failure. Polish-as-evolution is the failure mode that follows.

    **Phase A.1.5 NEW spec (replaces "baseline screenshot homepage only"):**

    1. **Read the sitemap.** Prefer (in order): `public/sitemap.xml`, `app/sitemap.ts`, `.next/server/app/sitemap.xml`, OR crawl internal `<a href>` links from the homepage. Build `route_list: string[]`. Cap at 20 routes; if more, take the 20 most-linked-from-homepage.
    2. **For each route, screenshot + critique.** Use chrome-devtools (preferred) or puppeteer. Save to `.evolution/baseline/{route-slug}.png`. Fire `Skill('critique', args='per-route VQ baseline | screenshots: [...] | dimensions: hierarchy, content-density, hero-impact, layout, distinctiveness, content-clarity, structural-integrity | tier: {target} | output: {vq_aggregate, vq_by_dimension, blocking_issues, content_problems, verdict: REBUILD_OR_REFINE_OR_KEEP}')`.
    3. **Critique MUST return a per-route verdict in `{REBUILD, REFINE, KEEP}`** — not just a score:
        - **REBUILD** = page needs to be rewritten from scratch. Use this for: structural failures (renders blank, broken layout), content failures (tile-soup with no service-by-service clarity, vague headlines, no value prop), or vq_aggregate below the tier floor (see table below).
        - **REFINE** = page structure + content are sound; polish would improve it. Use ONLY when vq_aggregate is at-or-above tier floor AND no blocking_issues AND no content_problems.
        - **KEEP** = page is already at-or-above tier; no work needed.
    4. **Tier floor table (per-route vq must clear this to AVOID a REBUILD verdict):**
        - target 90 → floor 3.0
        - target 95 → floor 3.5
        - target 98 → floor 4.0
        - target 100 → floor 4.5
    5. **Write `.evolution/page-baselines.json`** with one entry per route: `{ route, screenshot_path, vq_aggregate, vq_by_dimension, blocking_issues: [], content_problems: [], verdict: REBUILD|REFINE|KEEP, priority_rank }`. Routes are ranked by `(verdict === 'REBUILD' ? 1000 : 0) + (blocking_issues.length × 100) + (floor - vq_aggregate) × 10 + traffic_proxy`.
    6. **Resolving ambiguity — use the sales-page best-practices checklist (Rule 35), not a default-to-rebuild reflex.** Critique uses the Rule 35 checklist (who-you-are, what-you-do, who-it's-for, outcome-not-process, social proof early, clear CTA, sections-earn-their-place, you-vs-we language, pricing transparency) to score each route. If the page FAILS ≥ 2 checklist items → REBUILD verdict. If it PASSES the checklist but vq is below tier floor → REFINE. If it PASSES the checklist AND clears tier floor → KEEP. **Rebuild only when warranted by checklist failures or below-floor vq. Don't rebuild for the sake of rebuilding.** Updated 2026-05-17 after user clarified: "but dont rebuild for the sake of rebuilding it.. only if its shit."

    **--unsupervised does NOT skip this rule.** Without per-route baselines + verdicts the run is flying blind. The route-crawl + screenshot batch costs ~30s and ~5 critique calls — cheap.

    **Why:** Run #3 on Orbit Digital (2026-05-17) shipped 8 iters all touching the homepage hero + global CSS. User opened `/services` (tile-soup, zero service-by-service clarity) and `/services/digital-ecosystem-audit` (page rendered fully BLACK). Verdict: "you didn't evolve anything. We are fixing you first as you're being a spaz. This is evolve. not polish a turd skill." Phase A had only screenshotted the homepage hero — neither broken page was visible to the orchestrator at any point in the run, and even if it had been, the prior version of Rule 29's vq < 2.0 threshold would have only caught the fully-broken page, not the tile-soup. **Added 2026-05-17, tightened 2026-05-17 same day after first version still allowed polish-as-evolution.**

30. **Visible-delta floor per iter — invisible iters are VOIDED, not committed.** Cardinal Rule 11.7's refinement-skill floor was being gamed by iters that produced zero visible change. Rule 30 closes that loophole.

    **Per-iter contract (Phase C.iter):**

    1. **Pre-iter snapshot** of the affected route:
       - `mcp__chrome-devtools__navigate_page(url={route_url}, type="url")` (or `new_page` if no tab)
       - `mcp__chrome-devtools__take_screenshot(filePath=".evolution/iter-{n}-before.png")`
       - `mcp__chrome-devtools__list_console_messages(types=["error","warn"])` → save as `.evolution/iter-{n}-before.console.json`
       - `mcp__chrome-devtools__list_network_requests()` → save as `.evolution/iter-{n}-before.network.json` (record failed requests = status ≥ 400)
    2. **Apply the iter** via the chosen Skill().
    3. **Post-iter snapshot** (same as pre, but `iter-{n}-after.*`):
       - `mcp__chrome-devtools__navigate_page(type="reload", ignoreCache=true)` to flush HMR caching artifacts
       - `mcp__chrome-devtools__take_screenshot(filePath=".evolution/iter-{n}-after.png")`
       - `mcp__chrome-devtools__list_console_messages(types=["error","warn"])` → `.evolution/iter-{n}-after.console.json`
       - `mcp__chrome-devtools__list_network_requests()` → `.evolution/iter-{n}-after.network.json`
    4. **Compare visual.** Either (a) compute SSIM via Bash `python -c "from PIL import Image; ..."` if Pillow available, OR (b) fire `Skill('critique', args='compare iter-{n}-before vs iter-{n}-after | output: visible_delta_verdict_0_to_5 | screenshots: [before, after]')`. Compare is REQUIRED. Skipping = VOID by default.
    5. **Compare behavioural (NEW — Rule 30.1):** diff the console + network captures:
       - **New console errors** (errors in after that weren't in before) → REGRESSION. VOID + `git reset --hard HEAD~1`. Log `void_reason: introduced_console_errors | new_errors: [...]`.
       - **New failed network requests** (status ≥ 400 in after that weren't in before, excluding analytics/3p) → REGRESSION. VOID + revert. Log `void_reason: introduced_failed_requests | new_failures: [...]`.
       - **Same or fewer errors/failures** → continue to step 6.
    6. **VOID if:** SSIM > 0.985 OR critique visible_delta_verdict < 1.0. Run `git reset --hard HEAD~1`. Log `void_reason: invisible_change`. Iter does NOT count toward refinement-skill floor (Rule 11.7).
    7. **KEEP if:** SSIM ≤ 0.985 AND critique visible_delta_verdict ≥ 1.0 AND no new console/network regressions. Commit stays, count increments.

    **Exception:** code-quality-only iters (B-series checks, fix-routing changes, lazy-init bug fixes) are exempt from Rule 30's visible-delta check but NOT from Rule 30.1's behavioural-regression check — a "code quality" iter that introduces a runtime error is still a regression. Flag them `iter_class: code_quality` in trajectory and exclude from refinement-floor count.

    **Why behavioural diff matters:** the visual diff catches "nothing changed". The behavioural diff catches "looks fine, behaves broken" — a refactor that throws at runtime, a hover that 404s an asset, a broken import path Vite served as 200 but the browser rejected. Pre-2026-05-17 the loop only saw what its screenshots showed; this rule closes that hole.

    **Why:** Run #3 (2026-05-17) gamed the 6-iter refinement floor with three iters that produced SSIM ≥ 0.99: iter 5 (border-white/8 → border-gl-border, same visual color), iter 6 (alpha 0.85 → 0.72, near-imperceptible), iter 7 (hex literal → token of same value, by-construction zero delta). The floor was met by counting, not by producing visible improvement. User verdict: "you literally add a few words, a shitty animation or two — nothing has evolved." **Added 2026-05-17.**

31. **Phase R defers to REBUILD work when ANY route has a REBUILD verdict. Rebuilds route through `Skill('web-page')` or `Skill('web-scaffold')`, NEVER through refinement skills.**

    A SOTD hero on top of broken services pages is still a broken site. Phase R Step R.0 (NEW — runs BEFORE Step R.1) is the rebuild gate.

    **Phase R Step R.0 spec:**

    1. Read `.evolution/page-baselines.json` (produced by Rule 29 Phase A.1.5).
    2. Build `rebuild_queue: route[]` — every entry where `verdict === "REBUILD"`. Sort by `priority_rank` descending.
    3. **If `rebuild_queue.length >= 1`:** activate **Phase R-REBUILD mode**. SKIP Steps R.1-R.4 (hero signature pick — no hero polish until rebuilds are done). Build `focus_list` from `rebuild_queue`. Each becomes a P0 REBUILD iter — see rule below for how rebuild iters work. Trajectory records `phase_r_mode: "REBUILD"`. Hero signature pick is DEFERRED to Run #N+1.
    4. **If `rebuild_queue.length === 0`:** proceed with normal Phase R Steps R.1-R.4 hero signature pick. Only routes in `verdict === "REFINE"` or `verdict === "KEEP"` exist; the site has earned the right to hero polish.

    **REBUILD iter contract (Phase C-REBUILD):**

    - **Skill routing:** REBUILD iters MUST invoke `Skill('web-page', args='rebuild | route: {route} | current_problems: {blocking_issues + content_problems from page-baselines} | tier: {target} | references: {3 competitor URLs} | content_brief: {what each section should say at minimum, sourced from CLAUDE.md + project doc} | preserve: {URL slug, any locked decisions}')` OR `Skill('web-scaffold', args='...')` for full new-section work. **Refinement skills (impeccable / polish / typeset / colorize / animate / overdrive) are BANNED inside a REBUILD iter** — they polish, they don't rebuild. The orchestrator records `route_around_rebuild_to_refine` failure in trajectory if it tries to route a REBUILD iter through a refinement skill.
    - **Acceptance:** after the rebuild ships, re-screenshot the route and re-fire `Skill('critique')` against the new screenshot. The route must clear the tier floor (Rule 29 tier-floor table) OR the iter is VOIDED and the orchestrator re-attempts with a different reference set / different brief, up to 2 retries.
    - **No partial rebuilds.** A REBUILD iter that ships only a banner + new headline (not the full page) is a polish iter wearing a rebuild costume — VOID it.

    **At target ≥ 98 in Phase R-REBUILD mode:** before iter 1, fire `Skill('critique', args='for each rebuild route, propose: (a) full content rewrite — what each section should say at minimum, sourced from CLAUDE.md project doc + services-data.ts + any internal docs in the repo; (b) structural pattern — bento / sticky-rail / single-column-narrative / split-screen-comparison etc., chosen for the page''s job-to-be-done; (c) 3 reference URLs from competitors who solve this exact IA problem at-tier; (d) which existing components in the project to reuse vs which to scaffold new')`. The output is the `rebuild_brief` for each iter, passed to `web-page` skill args.

    **Why:** Run #3 (2026-05-17) locked Phase R to "singular B signature" and shipped 8 hero-focused iters. User then opened `/services` (tile-soup) and `/services/digital-ecosystem-audit` (fully blank page). User's verdict on the run + on the prior version of this rule: "I dont trust it reviews everything and changes it if its bad. This is evolve. not polish a turd skill." The prior rule's "ia_bottlenecks" framing was too soft — orchestrator could route a flagged route through a refinement skill and call it done. The new contract is: REBUILD verdict → `web-page` only, no exceptions, and the rebuilt page must clear the tier floor before the iter is accepted. **Added 2026-05-17, rewritten 2026-05-17 same day to force `web-page` routing instead of refinement-skill polish.**

33. **Default verdict is REBUILD, not REFINE. Refinement skills are only invoked AFTER a page has cleared the tier floor.**

    **The orchestrator's natural bias is to reach for `polish` / `impeccable` / `typeset` / `colorize` — because those skills are safer, faster, and produce committable diffs. That bias is the failure mode this rule prevents.**

    **Rules of engagement:**

    1. **A route can only enter the refinement queue (Phase C iters routed through `impeccable` / `overdrive` / `polish` / `typeset` / `colorize` / `animate` / `layout` / `delight` / `bolder` / `clarify` / `distill` / `adapt`) if its current critique verdict is `REFINE` or `KEEP`.**
    2. **A route with `verdict === "REBUILD"` cannot be polished — it must be rebuilt first via `web-page` or `web-scaffold`, re-scored, and re-verdicted. Only when the new score clears the tier floor (Rule 29) does the route become eligible for refinement skills.**
    3. **Orchestrator MUST log skill routing per iter:** `trajectory.real_iterations_detail[n].skill_class ∈ {rebuild, refine}` and `trajectory.real_iterations_detail[n].route_verdict_at_dispatch ∈ {REBUILD, REFINE, KEEP}`. Mismatch (e.g. `skill_class: refine, route_verdict_at_dispatch: REBUILD`) is a Phase failure — iter is voided + `route_around_rebuild_to_refine` logged in trajectory.failed_gates.

    **Mental model the orchestrator should use:**

    > "Would a senior designer at Linear / Stripe / Vercel look at this page and reach for the polish tool, or would they tear it down and rewrite it? If the honest answer is 'tear it down', I invoke `web-page`. Only if the honest answer is 'this is already good, just needs the last 10%' do I invoke a refinement skill. The bias to polish is the AI failure mode — defaulting to rebuild is the correction."

    **Why:** Run #3 (2026-05-17) shipped 8 iters across 6 refinement-skill invocations. ZERO `web-page` invocations, ZERO `web-scaffold` invocations. The `/services` page was tile-soup and the `/services/digital-ecosystem-audit` page was blank — both should have been routed through `web-page` for a structural rebuild, but the orchestrator never even saw them (Rule 29 closes that). Even if it had seen them, the prior rules would have allowed it to route them through `polish` or `impeccable` ("rebuild the structure with a polish skill"), which would have produced another invisible-delta iter. Rule 33 forces the routing decision: REBUILD verdict → `web-page` only, REFINE verdict → refinement skills only. **Added 2026-05-17.**

35. **Sales-page best-practices checklist — every public route is scored against the 10 golden rules of a service-business website.** This is the checklist `Skill('critique')` uses in Rule 29's per-route verdict logic. Failing ≥ 2 items = REBUILD verdict.

    **The 10 golden rules of a service-business website (apply per route):**

    1. **WHO YOU ARE clear in <5 seconds.** Visitor lands; within 5 seconds of viewing, can they identify the company name + what category of business it is (audit firm? web agency? SaaS tool? consultancy?). If the brand name + business category is not visible above the fold → FAIL.
    2. **WHAT YOU DO is one sentence above the fold.** Plain English, no jargon. "We audit, fix and monitor your digital presence for local businesses" passes. "Transforming digital ecosystems through deterministic synthesis" fails. If the visitor has to scroll or infer → FAIL.
    3. **WHO IT'S FOR is named.** Target audience explicit in the hero or just below ("for local service businesses with 1-50 staff", "for SaaS founders pre-Series-A"). Generic "for businesses" or unnamed audience → FAIL.
    4. **OUTCOME, not process.** Sections describe what the visitor GETS (more leads, fewer missed enquiries, less admin time), not what you DO methodologically (we audit, we deliberate, we synthesise). Process descriptions belong on the about page, not the home / services pages. Process-heavy without outcome-naming → FAIL.
    5. **Sections EARN their place.** Every section answers a visitor question or moves them down the funnel. **A "problem awareness" section ("here are your problems!") MUST be followed immediately by a "here's what we do about it" answer section — never standalone.** Standalone problem-awareness sections that leave the visitor asking "okay so what does this company DO?" → FAIL. *(This rule explicitly added 2026-05-17 from the Orbit Digital "Your website is only one part of the picture" section that listed 6 problems with no "what we do" response.)*
    6. **Social proof early.** Logos, testimonials, case studies, review counts, or named clients near the top — at minimum within the first 2 scroll-screens. Social proof only in the footer → FAIL.
    7. **Clear primary CTA above the fold.** One unambiguous "do this next" button (Book a call / Start free scan / Get a quote / See pricing). Two competing primary CTAs → FAIL. No CTA above the fold → FAIL.
    8. **"You" language, not "we" language, in the first 3 sections.** Hero + first 2 sections frame the visitor's pain and outcome, not the company's history or methodology. Sections that start with "We at [Company]…" or "Our team…" within the first 3 scrolls → FAIL.
    9. **Pricing transparency or pricing tease.** If you don't have a number on the site, you need at least a "from $X" / "starts at $Y" / "free quote in 30 sec" tease in the hero or pricing-section CTA. Mystery-meat pricing with no number anywhere → FAIL.
    10. **Mobile parity.** The above 9 rules apply at 375px viewport too. If "WHO YOU ARE" + "WHAT YOU DO" + primary CTA aren't visible at 375px above-the-fold (768px tall viewport) → FAIL.

    **Per-route scoring (used by Rule 29 critique):**
    - Count FAILs per route.
    - 0 FAILs → eligible for REFINE or KEEP verdict (further determined by tier-floor vq).
    - 1 FAIL → REFINE (the fix is content/copy-level, not structural).
    - ≥ 2 FAILs → REBUILD (structural sales-page failure that polish can't fix).

    **Per-route page-baselines.json schema extension:**
    ```json
    {
      "route": "/services",
      "checklist_fails": ["sections_earn_place", "outcome_not_process", "clear_primary_cta"],
      "checklist_pass_rate": "7/10",
      "verdict": "REBUILD"
    }
    ```

    **EXACT critique invocation args (orchestrator MUST use this shape — matches critique's Web-evolve Targeted Mode contract):**

    Phase A.1.5 per-route baseline:
    ```
    Skill('critique', args='mode: web-evolve | output_format: json | checklist: sales-page-10 | run_mode: per-route-baseline | screenshots: [.evolution/baseline/home.png, .evolution/baseline/services.png, .evolution/baseline/services-digital-ecosystem-audit.png, ...] | routes: [/, /services, /services/digital-ecosystem-audit, ...] | tier: 98')
    ```

    Phase C iter visible-delta check (Rule 30):
    ```
    Skill('critique', args='mode: web-evolve | output_format: json | run_mode: per-iter-delta | screenshots: [.evolution/iter-{n}-before.png, .evolution/iter-{n}-after.png] | route: /services | tier: 98')
    ```

    Phase F exit aggregate (Rule 36):
    ```
    Skill('critique', args='mode: web-evolve | output_format: json | run_mode: exit-aggregate | baseline_screenshots: [...] | post_run_screenshots: [...] | routes: [...] | tier: 98')
    ```

    **Expected JSON response shape:** see `~/.claude/skills/critique/SKILL.md` "Web-evolve Targeted Mode" section for the exact contract. Orchestrator MUST validate the response against this schema and HARD HALT if it doesn't match (Rule 28 dispatch table).

    **REBUILD routing (orchestrator action after critique returns):**

    For every route where `verdict: "REBUILD"`, the orchestrator builds the Phase C iter args as:
    ```
    Skill('web-page', args='mode: rebuild | route: {route} | rebuild_brief: "{critique.rebuild_brief}" | checklist_fails: {critique.checklist_fails} | tier: 98 | tokens_lock_present: {bool} | existing_components: [...] | data_sources: [src/lib/services-data.ts, ...]')
    ```

    The orchestrator does NOT pick the skill itself — critique's `recommended_skill` field is the source of truth. For REBUILD verdicts, this is always `"web-page"` or `"web-scaffold"` (critique's Web-evolve Targeted Mode enforces this).

    **Why:** Rule 35 was added 2026-05-17 after user pointed at a specific section ("Your website is only one part of the picture" on Orbit Digital home) — 6 problem cards (Weak trust signals, Low visibility, Poor enquiry flow, Missed follow-ups, Outdated structure, No monitoring) listed as pain points with **no answer section** describing what Orbit actually does about them. User's verdict: "okay.. what does orbit digital do. as this isnt clear at all." That's a Rule 35 #5 + #4 + #2 triple-fail — the section enumerates problems without naming what the business does. Critique flagging this requires an explicit checklist, not just an aesthetic vibe score. **Added 2026-05-17.**

36. **`Skill('critique')` fires at three points, not just exit. Missing any of them is a Phase failure.**

    **Three mandatory critique invocations per run:**

    1. **Phase A.1.5 — per-route baseline.** Output written to `.evolution/page-baselines.json` (Rule 29).
    2. **Phase C.iter.4 — per-iter visible delta verification.** Output flips iter status to KEEP or VOID (Rule 30).
    3. **Phase F.0 — paired baseline-vs-post-run aggregate.** For each route critiqued in Phase A, capture a post-run screenshot, fire `Skill('critique')` against the paired set, compute `route_vq_delta`. Aggregate vq_delta is the **mean across ALL routes**, not just the homepage. A run that improved the homepage by 1.5 but left `/services` at the same broken baseline shows aggregate ~0.3 — fails the target-98 floor (≥1.0).

    **Self-scoring is BANNED at all three points.** If `Skill('critique')` is unavailable, the run HALTs even under --unsupervised (cannot fly blind on the primary signal). Cardinal Rule 28 dispatch table updated: critique unavailability is now a HARD HALT.

    **Why:** Run #3 (2026-05-17) cited Rule 8 (independent VQ measurement) as a "would-be" requirement but the orchestrator never actually fired `Skill('critique')` once across the entire run. Result: 8 iters shipped with zero independent measurement, exit retro acknowledged the gap but couldn't quantify the failure. Rule 36 closes the "would-be" hole by naming the three invocation points and refusing to exit Phase F without all three. **Added 2026-05-17.**

---

## Inputs

**Normal invocation:** `/web-evolve` — no flags, no args. The skill decides everything.

**Optional escape-hatch overrides** (only used when the user explicitly contradicts auto-decided defaults):

| Override | What it does |
|---|---|
| `--target=N` | Force target_score = N (90/95/98/100). Skips Phase A.0 auto-decide. |
| `--fresh` | Ignore `.evolution/trajectory.json` and start as if Run #1. Use to reset trajectory. |
| `--no-branch` | Don't create `evolve/{date}` branch. Work on current branch. |
| `--benchmark=URL` | Override auto-picked benchmark URL. |
| `--pages=/,/pricing` | Multi-page run. Default: just landing. |
| `--dev-server=http://localhost:3000` | Use localhost instead of live URL (faster iterations, no deploy wait). |
| `--allow-large-change` | Override P8 complexity gate (Phase C). Required when a single Skill() returns >500 lines or changes >5 files in one iter. Use with caution — blast radius is real. |
| `--allow-tier-mismatch` | Override P10 tier-mismatch warning (Phase A.0.10). Auto-proceed at deliverable_target without surfacing 5s soft-pause. Use when tooling install is known to be coming next session. |
| `--allow-anti-goal-override` | Override Phase R.3.6 CONTEXT.md anti-goal conflict warning. Use when user explicitly chose signature despite anti-goal collision (e.g. agency-portfolio look intentional). |
| `--no-preview-verify` | Skip Phase D Step 7 preview-deploy-verify (push directly to main). Use only when Vercel preview deploys are disabled or unavailable. Trade safety for speed. |
| `--unsupervised` | Overnight / autonomous mode. Converts ~15 soft-failure HALT NEEDS_HUMAN paths into "log + soft-degrade + continue" so the run doesn't sit at a prompt all night. Hard HALTs preserved: TS/build errors, dirty working tree pre-Phase-A, >5 consecutive VOIDs, Vercel prod deploy build failure. Everything else degrades + records in trajectory.failed_gates for morning review. Cardinal Rule 28 spec. |

**Everything else is auto-decided** by Phase A.0 from disk state + visual assessment + project signals. See `references/multi-run-orchestration.md` for the full decision tree.

### What gets auto-decided (no flags needed)

| Decision | Auto-source |
|---|---|
| `target_score` | Phase A.0 — first run uses visual_quality_score + project signals; advance run reads `trajectory.runs[-1].final_score` and pushes one tier higher |
| `mode` (fresh/resume/advance) | `.evolution/` state — interrupted run with no final-score = resume; trajectory exists + last completed = advance; nothing = fresh |
| `phases_to_run` | target ≥ 98 + no prior run with `world_class_anchor` → Phase R + G run; otherwise skipped |
| `world_class_anchor` (hero signature) | Phase R user pick on Run #1, locked in trajectory for all subsequent runs |
| `motion_stack` install | Phase G if missing; subsequent runs skip — already installed |
| `mobile_loop` | true when target ≥ 95 |
| `a11y + seo + /critique` parallel agents | run when target ≥ 95 |
| `chrome-devtools-mcp` for perf | used when connected AND target ≥ 95; mandatory at target ≥ 98 |
| `branch_isolation` | true by default — `evolve/{YYYY-MM-DD}` branch |
| `max_iterations` | Run #1: 8 greenfield / 20 backfill. Advance runs: `last_iterations × 0.7` (diminishing returns) |
| `project_path` | current working directory |
| `live_url` | from `BUILD-LOG.md` last successful deploy entry; failing that, from `vercel.json` or `package.json` deploy URL field |

---

## Target tier table

**Canonical source:** `~/.claude/skills/web-evolve/references/tier-contracts.md` (sibling file). The table below is a summary view. If they disagree, `tier-contracts.md` wins.

| `target_score` | Tier label | What it gates | Phase R / G run? |
|---|---|---|---|
| 90 | High-tier SaaS | Generic high-quality SaaS landing. Disciplined tokens, no AI-template tells, mobile parity. | No |
| 95 | Stripe / Linear quality | Real motion, a11y/SEO pass, /critique scored. **Same threshold as `/web-review` ≥ 38/40 in greenfield.** | No |
| 98 | **Awwwards SOTD candidate** | Awwwards 4-dimension avg ≥ 8.0, all per-dim minima, WC1–WC10 PASS, chrome-devtools-mcp perf trace ≥ 90. **Unreachable from `/saas-build` alone — requires `/web-evolve` Phase R + G.** | **YES** |
| 100 | **Awwwards SOTM candidate** | Avg ≥ 8.5, Creativity ≥ 9.0, real Chrome trace ≥ 95, 60fps motion, foundry typography, View Transitions on every route. | **YES + stricter gates** |

`--top-tier` auto-sets target=98. `--top-tier --target=100` enters SOTM mode.

---

## Reference paths (always use tilde paths — never hardcode machine paths)

```
checklist:               ~/.claude/skills/shared/landing-page-checklist.md
fix-routing:             ~/.claude/skills/web-evolve/references/fix-routing.md
scoring-engine:          ~/.claude/skills/web-evolve/references/scoring-engine.md
top-tier-tier:        ~/.claude/skills/web-evolve/references/top-tier-tier.md
multi-run-orchestration: ~/.claude/skills/web-evolve/references/multi-run-orchestration.md
```

---

## Check → section map (for web-screenshot scroll targeting)

| Checks | Section |
|---|---|
| A7, A9, D4, D5, J1, J2, K4, E2 | hero |
| A1–A6, A8, A10, A11, B3, B9, C1–C8, D1–D3, D6, G1–G6, I1–I8, J3–J8 | global |
| E3 | trust-bar |
| E4 | stats |
| E5 | features |
| E6 | testimonials |
| E7 | pricing |
| E8 | faq |
| E9 | final-cta |
| E10 | footer |
| F1–F6, H1–H2, K1–K4 | full-page |

---

## Phase A.0 — Auto-Decide Mode (MANDATORY, runs before every other phase)

This phase reads disk state + signals and decides: target_score, mode (fresh/resume/advance), which phases run, max_iterations, and the focus list. No user prompts unless decision is genuinely ambiguous.

Full decision tree: `~/.claude/skills/web-evolve/references/multi-run-orchestration.md`. The skill MUST read that file at the start of Phase A.0.

**Step A.0.1 — Detect explicit overrides from invocation:**

If user passed `--target=N`, `--fresh`, `--no-branch`, `--benchmark=URL`, `--pages=...`, or `--dev-server=...` → store overrides, will be applied in subsequent steps. Override takes precedence over auto-decide for that specific dimension.

**Step A.0.2 — Detect repeat-signal phrases in the invoking message:**

If the user's prompt contains any of: `repeat`, `again`, `continue`, `keep going`, `next`, `level up`, `push further`, `more`, `another pass`, `iterate again`, `round 2`, `next round`, `do another`, `go again` → set `repeat_signal = true`. Treat the same as "trajectory exists and last completed". Force `mode = "advance"` regardless of how recently the prior run finished.

**Step A.0.3 — Read disk state (parallel):**

```
Read in parallel: 
  - {project_path}/.evolution/trajectory.json
  - {project_path}/.evolution/loop-state.json
  - {project_path}/.evolution/scores/final-score.json
  - {project_path}/CLAUDE.md  (extract: client_work, revenue_critical flags)
  - {project_path}/CONTEXT.md  (extract: explicit target_score if set)
```

Any of these missing is fine — that's a signal.

**Step A.0.4 — Branch decision:**

```
if loop-state.json exists AND loop-state.real_iterations < max_iterations AND no final-score.json for current run:
    mode = "resume"
    skip_phases = [R, G, 0, A, B]
    restore from loop-state
    target_score = loop-state.target_score
    
elif trajectory.json exists AND last_run.status == "completed":
    mode = "advance"
    last_final = trajectory.runs[-1].final_score
    if last_final >= 99:  new_target = 100
    elif last_final >= 95: new_target = 100
    elif last_final >= 90: new_target = 98
    elif last_final >= 80: new_target = 95
    else: new_target = min(95, last_final + 8)
    skip_phases = [R if anchor locked, G if motion stack installed, A.8.5 if design-context fresh]
    
elif trajectory.json exists AND last_run.status == "halted_needs_human":
    HALT NEEDS_HUMAN — "Last run halted: {reason}. Resolve and re-run, or pass --fresh to start over."
    
elif trajectory.json missing OR --fresh:
    mode = "fresh"
    # Will determine target from visual_quality_score in Step A.0.5 after chrome-devtools probe (puppeteer fallback)
    new_target = null  # to be set
```

**Step A.0.5 — For `fresh` mode only: visual_quality_score chrome-devtools probe:**

```
mcp__chrome-devtools__new_page(url={live_url})
mcp__chrome-devtools__resize_page(width=1440, height=900)
mcp__chrome-devtools__take_screenshot(filePath={project_path}/.evolution/baseline/probe-1440.png)
```

(Puppeteer fallback: `mcp__puppeteer__puppeteer_navigate(url={live_url})` + `mcp__puppeteer__puppeteer_screenshot(path=..., viewport={width:1440,height:900})`.)

Visually assess on the 1–5 scale (4 axes: hero impact, hierarchy, distinctiveness, product visibility — same as Phase A.7.5). Compute `visual_quality_score`.

Apply the decision table from `multi-run-orchestration.md` Branch 3:

| visual_q | Client work? | Revenue critical? | → target |
|---|---|---|---|
| < 2.0 | any | any | 90 |
| 2.0–2.99 | any | any | 95 |
| 3.0–3.99 | yes OR yes | — | 98 |
| 3.0–3.99 | no AND no | — | 95 |
| ≥ 4.0 | any | any | 98 |
| ≥ 4.5 + custom hero detected (canvas/three/gsap globals via chrome-devtools evaluate_script — puppeteer_evaluate fallback) | yes | yes | 100 |

Set `new_target` accordingly.

**Step A.0.6 — Apply explicit overrides:**

If `--target=N` was passed in A.0.1, `new_target = N` (override).

If `target_score:` field in CONTEXT.md AND no `--target=N` override, use CONTEXT.md value.

**Step A.0.7 — Compute phase plan:**

```
phases_to_run = ["A.0", "0"]                                  # always

if new_target >= 98 AND trajectory.world_class_anchor missing:
    phases_to_run.append("R")
if new_target >= 98 AND trajectory.motion_stack missing or incomplete:
    phases_to_run.append("G")

phases_to_run += ["A", "B", "C", "D", "E", "F"]              # always

# Per-phase skips for advance mode
if mode == "advance":
    skip_phases.add("R") if trajectory.world_class_anchor decided
    skip_phases.add("G.1-G.7") if all motion stack libs present
    skip_phases.add("A.8.5") if design-context.md fresh (<30 days)
    skip_phases.add("A.8.6") if Trend Pulse fresh (<30 days)
```

**Step A.0.8 — Compute max_iterations:**

```
if mode == "advance":
    max_iterations = max(5, int(trajectory.runs[-1].real_iterations * 0.7))  # diminishing returns
elif mode == "fresh":
    max_iterations = 8 if greenfield else 20
elif mode == "resume":
    max_iterations = loop-state.max_iterations (unchanged)
```

**Step A.0.9 — Compute focus list (advance mode):**

If mode == "advance", build a prioritised list of what to attack this run:

1. Any check in `trajectory.runs[-1].uncompleted_wc_checks` — these are top-tier gates that didn't close last time
2. Any check in `trajectory.runs[-1].next_run_recommendations` (Phase F output from last run)
3. New failures: re-baseline in Phase B and diff against last `final-score.json` — any newly-failing check goes to top

These focus items get `+500` priority bonus in the queue beyond their normal weighting.

**Step A.0.10 — Compute deliverable_target_score (TOOLING-ONLY check, NOT declared_target_score) + echo to user:**

The declared_target (Phase A.0 decision) is what the run aims for. The deliverable_target is what the run can actually achieve given installed tooling. They MUST match before the run starts — if they don't, surface upfront, not in retro.

**This check is TOOLING-ONLY at Phase A.0.10** — signature-specific lib checks happen in Phase R.3.5 AFTER signature is picked (see P4 fix below). Compute `deliverable_target_score`:
```
start with: declared_target
if declared_target >= 98:
  required tooling (signature-agnostic):
    - chrome-devtools-mcp connected (Phase G.5 Cardinal Rule 24)
    - Skill('critique') available (Cardinal Rule 8 + Gate B)
    - Skill('a11y-audit') available (Phase A.1.5 mandate)
    - Skill('seo-strategy') available (Phase A.1.5 mandate)
    - Phase R will run (Gate E artifact gate)
  for each missing → deliverable_target_score = min(deliverable_target_score, 95)
  # NOTE: signature-specific lib checks (R3F for A / GSAP+lenis for B / variable font for C)
  # cannot run here — signature isn't picked yet. They're enforced in Phase R Step R.3.5 below
  # as a SECOND deliverable_target check that runs after R.3 signature lock.
if declared_target >= 95:
  required tooling:
    - Skill('critique') available
    - Skill('a11y-audit') available
    - Skill('seo-strategy') available
  for each missing → deliverable_target_score = min(deliverable_target_score, 90)
```

**Iteration cap (P13 — math actually adds up at target ≥ 98):**
At target ≥ 98 the floors add up to MORE than the default 8-iter cap (6 refinement skills + 3 mandated agents + 1 signature delivery + 1 perf trace = 11 must-happens). Apply this corrected cap math:
```
if declared_target == 98 AND mode == "fresh": max_iterations = 12
if declared_target == 98 AND mode == "advance": max_iterations = max(8, int(last_run.real_iterations * 0.7))
if declared_target == 100: max_iterations = 16 fresh / max(12, int(last_run.real_iterations * 0.7)) advance
```
Mandated agents (a11y/seo/critique) DO NOT consume Phase C iterations — they fire in Phase B as parallel-background spawns. Only refinement-skill iterations consume the Phase C cap.

If `deliverable_target_score < declared_target` → SURFACE TO USER (single message, then proceed only if user confirms or 5s passes without interrupt):

```
⚠️ TIER MISMATCH — declared target {declared_target} but only {deliverable_target} is deliverable with current setup.

Missing for target {declared_target}:
  - chrome-devtools-mcp: NOT installed (run npx chrome-devtools-mcp@latest first)
  - Skill('critique'): {available|missing}
  - {other missing items}

Options:
  (a) Install missing tooling, re-run /web-evolve to attempt target={declared_target} properly
  (b) Run at deliverable_target={deliverable_target} now (Trajectory will record this)
  (c) Interrupt and decide

Continuing in 5s with deliverable_target={deliverable_target}. Trajectory will record both numbers.
```

This prevents Run #2's failure mode: declaring 98, delivering 95, and only surfacing the gap in retro. Now the gap is surfaced at run start so the user makes an informed choice.

Then the standard echo:

```
web-evolve — Run #{N} ({mode})

{Reasoning sentence}

Declared target:    {declared_target}/100 ({declared_tier})
Deliverable target: {deliverable_target}/100 ({deliverable_tier})   ← what gates evaluate against
{If fresh:} Baseline visual quality: {v}/5
{If advance:} Last run finished at {last_final}/100 ({last_tier}). Pushing to {deliverable_target}.
Phases this run: {phases_to_run join space}
Estimated iterations: {max_iterations}
Focus this run: {top 3 priorities from focus list, or "full audit" if fresh}

Continuing automatically. Interrupt to stop.
```

**No user prompt UNLESS tier mismatch exists.** The skill proceeds. If the user wanted different behaviour they would have passed an override flag or interrupted.

**Step A.0.11 — Write current run header to trajectory.json (with schema_version — P15 fix):**

If trajectory.json missing → create it with `schema_version: 2`, `project_path` (use the env-var pattern `${PROJECT_PATH}` for template expansion per P17 — set at Phase 0 start so all phases reference the same value), `live_url`, empty `runs[]`, and initial `current_run_state`.

If trajectory.json exists BUT has no `schema_version` field (old Run #1-era trajectory) → migration step:
```
1. Read entire old trajectory.json
2. Each entry in runs[]: backfill `failed_gates: []` (P8 fix — see Phase F.7), `schema_version_at_write: 1`
3. Top-level: add `schema_version: 2`, `migration_applied_at: now()`
4. Write back
5. Log: "Migrated trajectory.json schema 1 → 2 (added failed_gates array, schema_version field)"
```

If trajectory.json has `schema_version: 2` already → continue normally.

If trajectory.json has `schema_version > 2` (newer code wrote it) → HALT NEEDS_HUMAN: `"trajectory.json schema_version is {n}, this orchestrator only supports schema_version 2. Update web-evolve skill or back up + delete trajectory.json to start fresh."`

Append a new entry to `current_run_state`:
```json
{
  "id": N,
  "schema_version": 2,
  "started_at": "{now}",
  "status": "in_progress",
  "declared_target_score": declared_target,
  "deliverable_target_score": deliverable_target,
  "tier": tier_label,
  "mode": mode,
  "phases_planned": phases_to_run,
  "focus_list": focus_list,
  "failed_gates": []
}
```

Write to disk. This file is committed at the end of Phase F.

---

## Phase R — Top-Tier Research (runs when Phase A.0 plan includes R)

Runs BEFORE Phase 0. Skipped entirely otherwise.

This phase exists because Awwwards SOTM-tier quality cannot be reached by polishing checklist items — it requires reference-anchored signature decisions made before iteration begins. Phase R produces `.evolution/top-tier-references.json` and updates `DESIGN-BRIEF.md` with hero-signature commitments.

**Step R.1 — Fetch reference galleries in parallel:**

```
WebFetch(url=https://www.awwwards.com/inspiration_search/sites_of_the_month/, prompt="List the 6 most recent Sites of the Month with site name, URL, hero technique (3D/scroll/typo/other), motion library detected from copy if mentioned, color palette description, typography pairing. Return JSON array.")
WebFetch(url=https://www.awwwards.com/websites/sites_of_the_day/, prompt="List the 8 most recent Sites of the Day with same fields as above. Return JSON array.")
WebFetch(url=https://godly.website/, prompt="List the 6 most recent curated picks. Same field schema. JSON array.")
WebFetch(url=https://thefwa.com/cases/site-of-the-day, prompt="List the 6 most recent FWA Site of the Day picks. Same fields. JSON array.")
WebFetch(url=https://land-book.com/, prompt="List 6 recent picks tagged as {personality from DESIGN-BRIEF.md}. Same fields. JSON array.")
WebFetch(url=https://www.awwwards.com/websites/webgl/, prompt="List 6 recent WebGL-tagged sites with hero scene description. JSON array.")
```

Aggregate into `.evolution/top-tier-references.json` — deduplicate by URL, score each by relevance to the project's personality + industry from CONTEXT.md.

**Step R.2 — Probe top 6 candidates for live signature:**

For each top-6 reference (by relevance), run:
```
mcp__chrome-devtools__new_page(url={reference.url})
mcp__chrome-devtools__resize_page(width=1440, height=900)
mcp__chrome-devtools__take_screenshot(filePath={path})
mcp__chrome-devtools__evaluate_script(function=`() => {
  return {
    has_three_js: typeof THREE !== 'undefined' || !!document.querySelector('canvas[data-engine="three.js"]'),
    has_lenis: typeof Lenis !== 'undefined' || !!document.documentElement.dataset.lenisPrevent,
    has_gsap: typeof gsap !== 'undefined',
    has_rive: !!document.querySelector('canvas[data-rive]') || typeof Rive !== 'undefined',
    has_lottie: !!document.querySelector('[data-lottie], .lottie-animation'),
    custom_cursor: getComputedStyle(document.body).cursor === 'none',
    has_view_transitions: !!document.startViewTransition,
    canvas_count: document.querySelectorAll('canvas').length,
    color_tokens: getComputedStyle(document.documentElement).cssText.match(/--[\\w-]+: oklch/g)?.length || 0,
    font_families: Array.from(new Set(Array.from(document.querySelectorAll('h1,h2,p,button')).map(el => getComputedStyle(el).fontFamily))),
    fps_estimate: 'see chrome-devtools-mcp trace'
  };
}`)
```

Record the live signature per reference in the JSON.

**Step R.3 — Surface to user for signature commitment:**

```
"Top-Tier Research complete. Top 6 references for your project:

1. Bruno Simon Portfolio (bruno-simon.com) — WebGL 3D scene, R3F+drei, Lenis
2. Renaissance Edition (shopify.com/editions/winter2026) — Scroll-narrative, GSAP ScrollTrigger
3. Oryzo AI (oryzo.ai) — Kinetic typography, SplitText reveals, custom cursor
4. Resend (resend.com) — Variable font signature (Söhne), View Transitions
5. Linear (linear.app) — Disciplined motion + product-UI hero
6. Vercel (vercel.com) — Geist variable font, GSAP, scroll-driven product reveal

Pick your hero signature direction (Cardinal Rule 17):
  A) WebGL/3D scene  (like 1)
  B) Scroll-narrative (like 2, 5)
  C) Kinetic typography (like 3, 6)

Pick 2–3 references to anchor refinements against:"
```

Wait for user reply. Write hero signature + selected references back to `DESIGN-BRIEF.md` under a new `## Top-Tier Anchor` section. From now on every refinement skill receives `world_class_anchor: {hero_signature, primary_reference_url, secondary_reference_urls}` in its args.

**Step R.3.5 — Second deliverable_target check (signature-specific libs — P4 fix):**

Phase A.0.10's deliverable_target check was tooling-only because signature wasn't picked yet. NOW we know the signature. Re-check libs:

```
signature = world_class_anchor.hero_signature  # one of A, B, C, or combined array
required_libs_per_signature = {
  "A": ["@react-three/fiber", "@react-three/drei", "@react-three/postprocessing", "three"],
  "B": ["gsap", "lenis"],  # ScrollTrigger + SplitText come via gsap package
  "C": ["geist", "<some-variable-font-with-font-variation-settings>"],
}

for sig in (signature if combined else [signature]):
  for lib in required_libs_per_signature[sig]:
    if lib not in package.json dependencies:
      missing_libs.append((sig, lib))

if missing_libs is non-empty:
  if Phase G is scheduled to run → Phase G will install them, log "Phase G will install: {libs}" and continue
  else (Phase G already ran or skipped) → HALT NEEDS_HUMAN:
    "Signature {sig} requires {libs} but they're not in package.json. Install via Phase G (npm install) or re-pick signature. Phase R will not lock until libs match signature."
```

**Step R.3.6 — CONTEXT.md anti-goal conflict check (P14 fix):**

Read CONTEXT.md §9 anti-goals. If any anti-goal string matches the locked signature's natural description, SURFACE the conflict:

```
CONFLICT_PATTERNS = {
  "A": ["3d", "webgl", "agency-portfolio", "decorative", "wow-for-wow-sake"],
  "B": ["scroll-narrative", "pinned-hero", "longform-scroll"],
  "C": ["typographic-art", "type-as-hero", "no-product-visible"],
}

for anti_goal in CONTEXT.md §9 anti-goals (text):
  for pattern in CONFLICT_PATTERNS[signature]:
    if pattern matches anti_goal substring (case-insensitive, fuzzy):
      → surface to user: "CONFLICT: signature {sig} ({pattern}) conflicts with CONTEXT.md anti-goal '{anti_goal}'. Pick: (a) override anti-goal (write 'world_class_anchor.overrides_anti_goal: {anti_goal}' to trajectory), (b) re-pick signature, (c) interrupt."
      Wait for user reply. Default after 30s soft-pause = (b) re-pick signature.
```

This catches the Orbit Digital case: CONTEXT.md §9 = "NOT generic agency portfolio aesthetic" — signature A (WebGL) and signature C (kinetic typography centrepiece) both naturally land in agency-portfolio territory. Was implicit in Run #2, now explicit.

**Step R.4 — Inject WC1–WC10 synthetic checks** into the priority queue (visual_bonus 2500 each — higher than checklist 2000-tier). Routing in `fix-routing.md` SKILL_LOOKUP. These checks lead the queue once Phase G completes.

**Step R.5 — HARD GATE: top-tier-references.json MUST exist before Phase G can begin (Cardinal Rule 14 Gate E):**

Verify that Steps R.1–R.4 actually produced their artifacts. The orchestrator cannot bypass Phase R by writing a signature commitment to DESIGN-BRIEF directly from memory (this happened in Run #2 on Orbit Digital 2026-05-16 — Phase R was claimed "complete" with zero reference probing).

```bash
# Hard gate — all three MUST be true before Phase G starts:
[ -s "{project_path}/.evolution/top-tier-references.json" ] || HALT
[ -s "{project_path}/.evolution/top-tier-references.json" ] && \
  jq '.references | length' "{project_path}/.evolution/top-tier-references.json" | grep -qE "^([6-9]|[1-9][0-9])$" || HALT  # >= 6 references
grep -q "## Top-Tier Anchor" "{project_path}/DESIGN-BRIEF.md" || HALT
grep -qE "hero_signature: \"[ABC]\"" "{project_path}/DESIGN-BRIEF.md" || HALT  # singular A or B or C only
```

If any check fails → HALT NEEDS_HUMAN: `"Phase R artifacts missing or malformed. top-tier-references.json (≥6 references), DESIGN-BRIEF ## Top-Tier Anchor section with hero_signature one of A/B/C — required before Phase G installs the motion stack. Re-run Phase R from R.1."`

**Add Gate E to Cardinal Rule 14 evaluation:**
- Gate E — `phase_r_artifacts_present` (target ≥ 98 only):
  - `.evolution/top-tier-references.json` exists with ≥6 reference entries
  - `DESIGN-BRIEF.md` contains `## Top-Tier Anchor` section
  - `hero_signature` is one of "A", "B", "C" (literal — combined banned per Cardinal Rule 17)
  - If false → status `phase_r_skipped`

---

## Phase G — Generative Motion Stack Setup (runs when Phase A.0 plan includes G)

Triggered automatically when Phase A.0 sets `target_score ≥ 98` AND trajectory.json shows motion stack not yet installed. Subsequent runs skip this phase entirely — the stack persists across runs.

Runs after Phase A but before Phase B. Installs and wires the top-tier motion stack. Idempotent — safe to re-run.

**Step G.1 — Detect existing motion stack:**
```bash
grep -E '"(lenis|gsap|@react-three/fiber|@rive-app/react-canvas)"' "{project_path}/package.json"
```

**Step G.2 — Install missing dependencies:**

Based on hero signature from Phase R.3:

```bash
# Always install (baseline top-tier):
npm i lenis gsap

# If hero signature = A (WebGL/3D):
npm i three @react-three/fiber @react-three/drei @react-three/postprocessing

# If hero signature = B (scroll-narrative):
# GSAP ScrollTrigger covered above — no additional installs

# If hero signature = C (kinetic typography):
# GSAP SplitText covered above — no additional installs

# If user wants Rive (interactive stateful animation):
npm i @rive-app/react-canvas

# Variable font from Geist (free, OFL):
npm i geist
```

**Step G.3 — Wire Lenis at app root via `Skill('animate')`:**

```
Skill('animate', args='install-lenis-root |
  Create or update {project_path}/src/app/layout.tsx (or app root equivalent) to wire Lenis with autoRaf:false syncTouch:false, driven by gsap.ticker, with cleanup on unmount |
  ScrollTrigger.update bound to lenis scroll event |
  prefers-reduced-motion: reduce → disable Lenis entirely |
  fail_proof: grep "new Lenis" returns the wiring file; grep "autoRaf" shows false |
  design_dna_tokens: NA |
  bold_execution: NA — config wiring, must be exact')
```

**Step G.4 — Wire GSAP registration:**

```
Skill('animate', args='register-gsap-plugins |
  Create or update {project_path}/src/lib/gsap.ts to call gsap.registerPlugin(ScrollTrigger, SplitText, Flip, MorphSVGPlugin) ONCE in a use-client boundary |
  Export configured gsap instance |
  fail_proof: grep "registerPlugin" returns the registration')
```

**Step G.5 — chrome-devtools-mcp install or HALT (target ≥ 98 — Cardinal Rule 24 enforcement):**

Probe MCP availability:
```bash
# Detect via settings.json mcpServers block
grep -E "chrome-devtools-mcp|chrome_devtools" ~/.claude/settings.json
```

**Branching logic:**

- **If connected** → log `"chrome-devtools-mcp: ready for perf traces"`. Continue.

- **If NOT connected AND target ≥ 98** → this is a HARD HALT, not a warning. Auto-install path:
  ```bash
  # Try auto-install via npx (Sept 2025 official launch from Google Chrome team)
  npx -y chrome-devtools-mcp@latest --install
  # OR via Edit to ~/.claude/settings.json mcpServers block:
  ```
  Edit `~/.claude/settings.json`, insert into `mcpServers`:
  ```json
  "chrome-devtools": {
    "command": "npx",
    "args": ["-y", "chrome-devtools-mcp@latest"]
  }
  ```
  Then HALT NEEDS_HUMAN: `"chrome-devtools-mcp config added to ~/.claude/settings.json. RESTART Claude Code to load the MCP, then re-invoke /web-evolve to continue. Target=98 cannot proceed without real Chrome perf traces (Cardinal Rule 24)."`

  **NEVER silently fall back to WebFetch PageSpeed at target ≥ 98.** Run #2 on Orbit Digital (2026-05-16) did exactly that — synthetic puppeteer PerformanceObserver was used as fallback and the run claimed target=98 perf-trace gate met when it wasn't. That violation is now blocked at this gate.

- **If NOT connected AND target = 95** → log the warning + fall back to WebFetch PageSpeed (fallback IS acceptable at target ≤ 95).

**Step G.6 — Install custom cursor scaffold (WC4):**

```
Skill('web-component', args='install-custom-cursor |
  Create {project_path}/src/components/ui/Cursor.tsx with: dot + ring follower, magnetic snap to [data-magnetic="true"], hover-state morph on links/buttons, hidden on touch devices, prefers-reduced-motion respected (replace with native cursor) |
  Use Motion library Cursor primitive if installed, else hand-roll with Lenis velocity |
  Mount in root layout |
  fail_proof: grep "data-magnetic" returns CTA elements; computed cursor:none on body desktop')
```

**Step G.7 — Wire View Transitions baseline (WC5):**

For Next.js App Router:
```
Skill('web-fix', args='enable-view-transitions |
  In src/app/layout.tsx add <meta name="view-transition" content="same-origin"> |
  For React Router 7: wrap Link with viewTransition prop |
  For Next.js: add experimental.viewTransition: true in next.config.js |
  Add CSS @view-transition rule and ::view-transition-* pseudo-element styling for hero, nav, footer |
  Respect prefers-reduced-motion via @media query |
  fail_proof: grep "view-transition" returns wiring')
```

**Step G.8 — Log baseline + commit:**

Write `.evolution/motion-stack.json` with installed versions, then:
```bash
git -C "{project_path}" add package.json package-lock.json src/lib/gsap.ts src/components/ui/Cursor.tsx src/app/layout.tsx
git -C "{project_path}" commit -m "top-tier: install motion stack (lenis + gsap + cursor + view-transitions)"
```

This commit is the top-tier baseline. From here, Phase B baseline scores measure the lifted floor — not the pre-stack state.

---

## Phase 0 — Project Context Read (MANDATORY, runs before Phase A)

This phase exists because scoring against generic high-tier-SaaS criteria produces template-drift. The loop must improve toward what THIS product is meant to be, not toward what a SaaS-in-general looks like.

**Template variable convention (P17):** All paths in this skill use `${PROJECT_PATH}` as the env-var pattern. The orchestrator sets this at Phase 0 start via `export PROJECT_PATH=<resolved absolute path>` so every subsequent bash invocation expands consistently. Legacy `{project_path}` literal markers in this file are equivalent placeholders the orchestrator replaces at template-expansion time. **Never paste a literal `{project_path}` into a bash command** — that fails. Use `"${PROJECT_PATH}"` (double-quoted env var) for bash, `{project_path}` only in prompt template strings to subagents (which the orchestrator pre-expands).

0. **Set `${PROJECT_PATH}`:** `export PROJECT_PATH=$(realpath .)` (or pass via subagent prompt as the explicit absolute path).

1. Check `${PROJECT_PATH}/CONTEXT.md` exists.
2. **If missing OR `Generated:` date is older than 7 days OR `git log -1` shows commits newer than `Generated:` date → fire `Skill('project-context')` now.** This is a literal Skill invocation. Do NOT self-synthesise the brief by reading docs inline.
3. Read CONTEXT.md after it exists.
4. Extract into loop state:
   - **Locked Decisions** (section 4) — anti-patterns: do NOT propose changes that contradict these.
   - **Landing Page Structure** (section 5) — if locked, the section order is FIXED. Refinement skills may not add/remove sections, only refine within them. If "NOT LOCKED" → skill may propose structure.
   - **Pricing & Packaging** (section 6) — if locked, refinement skills may NOT modify pricing copy or tiers.
   - **Anti-Goals** (section 9) — every refinement output must be checked against this list before commit. A "better" change that violates an anti-goal is a VOID.
   - **Open Questions / Gaps** (section 10) — surface to user at end of Phase A before iteration begins.
5. If CONTEXT.md reports validator verdict = `KILL` or `VALIDATE-FIRST` → HALT the loop. Surface verdict. Do not iterate on a product that shouldn't exist yet.

---


---

## Operational phase implementations

Phase A through Phase F (Setup, baseline audit, improvement loop, final report, post-deploy verification, self-audit retrospective) live in `phase-protocols.md` (sibling). This file holds active rules, the tier table, reference paths, and Phase A.0 / Phase R / Phase G architecture.

When implementing Phase A-F, read `phase-protocols.md`. When deciding *what* to do, read `decisions.md`.

