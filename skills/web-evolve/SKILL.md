---
name: web-evolve
description: >
  Auto-decided, score-driven continuous improvement loop for existing websites.
  Invoke with `/web-evolve` — no flags. Phase A.0 assesses the site and history
  (trajectory.json) and picks the target tier: Premium SaaS (90), Stripe/Linear
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

   **Measurement 2 — `Skill('critique', args='compare baseline vs post-run | screenshots: [path1, path2] | output: scored | dimensions: hero-impact, hierarchy, distinctiveness, product-visibility, motion, type, color, layout | tier: {target}')`** — the critique skill scores both screenshots independently on a 4-axis 1-5 scale (matching the Phase A.7.5 baseline axes). The orchestrator MUST use critique's returned scores, NOT its own.

   **`vq_delta = critique.post_run_vq - critique.baseline_vq`**

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
11.7 **Refinement-skill invocation floor — Phase C must invoke design skills.** At least `floor(max_iterations * 0.6)` iterations MUST invoke a skill from `{impeccable, overdrive, animate, typeset, colorize, polish, bolder, delight, layout, distill, clarify, adapt}` via the `Skill()` tool. Minima:
    - target 90 → ≥ 1 refinement-skill iteration
    - target 95 → ≥ 3 refinement-skill iterations
    - target 98 → ≥ 6 refinement-skill iterations (one per Phase R hero-signature commitment + one per major visual category)
    - target 100 → ≥ 8 refinement-skill iterations
    If the priority queue empties before the floor is met (rare — usually means the checklist found nothing visible to fix), the orchestrator MUST fire `Skill('critique', args='...')` to generate fresh visual targets, route them through the appropriate refinement skill, and continue Phase C. **Exiting Phase C with the refinement-skill floor unmet is a route-around failure** — trajectory.json records `status: "incomplete_refinement_floor"`.
12. **`impeccable teach` is mandatory once per project.** Refinement skills (typeset, colorize, layout, animate, polish, bolder, distill, quieter, delight, clarify) produce generic output without design context. Phase A MUST fire `Skill('impeccable', args='teach')` once per project. The "teach" output is cached in `.evolution/design-context.md` and passed to every subsequent skill call. Skipping = silent generic-output failure mode (AuditHQ v2 retro 2026-04-24).
13. **Design DNA loaded before any UI call.** `~/.claude/web-system-prompt.md` (token system, typography scale, color discipline, visual signatures) MUST be read in Phase A and re-cited in every Skill() args block as a token-discipline marker. Refinement skills must respect Design DNA over their own defaults.
14. **Self-audit at exit, with hard gates.** Phase F runs after Phase D and writes `.evolution/retro.md` with per-skill efficacy (KEEPs/REVERTs/VOIDs), proposed `fix-routing.md` edits, and a diff vs `/premium-website` contract. The loop never exits without producing this retro. **Three hard gates that override "completed" status:**
    - **Gate A (route-around):** if Phase C invoked zero refinement skills AND `target_score ≥ 90` → trajectory.json `status: "route_around_detected"`. User-facing summary leads with `⚠️ Route-around failure — this run optimised the score without invoking a single refinement skill. Visual quality delta: {x}. Re-run required.`
    - **Gate B (visual delta floor):** if `post_run_vq - baseline_vq < required_delta_for_tier` (see Rule 8) → trajectory.json `status: "vq_delta_below_floor"`. Summary leads with `⚠️ Score met but visual quality moved {x} — below the {required} threshold for target {tier}. Re-run required.`
    - **Gate C (refinement-skill floor):** if Phase C invocations of refinement skills < tier minimum (see Rule 11.7) → trajectory.json `status: "incomplete_refinement_floor"`. Summary leads with `⚠️ {n} refinement-skill iterations fired, {required} required for target {tier}. Re-run required.`
    The retro must then propose the specific skill invocations that should have fired (priority, skill, args) and offer to run them now via a single message: "Run the missed iterations now? They will be added to the same evolve branch."
15. **21st.dev pipeline is three-stage, not one.** Component-source flow is `inspiration` → `builder` → `refiner`, never just `inspiration`. Inspiration alone gives prose suggestions; builder generates actual JSX; refiner improves what is already in the repo (which is what `web-evolve` does most of the time).

---

## Cardinal rules — World-Class tier (apply when `--world-class` OR `target_score ≥ 98`)

These rules supersede their generic versions when world-class mode is active. Full spec: `references/world-class-tier.md`.

16. **Awwwards-aligned scoring.** Drop the flat 0–100 score. Use 4 dimensions on 10-point scale: Design (40%) / Usability (30%) / Creativity (20%) / Content (10%). Loop exits only when per-dimension minima are met AND weighted average ≥ target. SOTD = 8.0 avg. SOTM = 8.5 avg with Creativity ≥ 9.
17. **Pick ONE hero signature, execute fully. Combined / "all of the above" picks are BANNED.** Hero must be EXACTLY ONE of: (A) WebGL/3D scene via R3F+drei+postprocessing, (B) GSAP ScrollTrigger pinned narrative (2–4 viewports), (C) Kinetic typography with variable-axis animation. Half-committed heroes (small glow + gradient blob) fail this tier — visible signature or VOID. **At Phase R Step R.3 the orchestrator MUST reject answers that pick multiple options or say "all of them" / "combined" / "every one"** — re-surface the question with the explicit clarification: "Pick ONE. Combined heroes are half-committed by construction — A's R3F WebGL takes a 150KB bundle hit; B's pinned scroll choreography takes 2-3 viewports of scroll budget; C's kinetic-typography axis-on-scroll requires the variable font to be the visual centrepiece. They CONFLICT — pick the one that wins." If the user insists on combined → write `world_class_anchor.user_overrode_singularity: true` to trajectory.json and lower the gate-C minimum by 1 (since the user is paying for breadth not depth, the minimum count requirement softens) — but the run is flagged `quality: "combined-signature-warning"` for the retro. Run #2 on Orbit Digital (2026-05-16) declared "B+A+C combined" and delivered B-only at ~40% completeness — that was a Rule 17 violation enabled by ambiguous language. **Tightened 2026-05-16.**
18. **Lenis is mandatory** at world-class. Locomotive is deprecated. `lenis` package with `autoRaf: false syncTouch: false` when GSAP drives the ticker. No native CSS `scroll-behavior: smooth`.
19. **GSAP owns scroll choreography.** ScrollTrigger pins, SplitText reveals, Flip transitions, MorphSVG when relevant — all free post-Webflow acquisition (Apr 2024). Framer Motion is allowed for component state but never for scroll-narrative.
20. **Custom cursor + magnetic interactions required.** Replace native cursor. `data-magnetic="true"` on primary CTAs. Motion's `<Cursor>` primitive OR hand-rolled with `lenis` velocity. Touch devices replace hover with explicit tap states.
21. **View Transitions API on every route change.** Same-doc transitions (Chrome 111+, Safari 18+, Firefox 144+). `viewTransitionName` on shared elements. `prefers-reduced-motion` respected (skip if reduce).
22. **Variable font from foundry — not Inter from Google as the only choice.** Recommended free: Geist (Vercel, OFL). Commercial: Söhne, Calibre, GT America. At least one variable axis animated on hover or scroll. Pangram fonts are free-to-try ONLY — pay if shipping, do not auto-install.
23. **Real product UI in hero.** No gradient blob. No shadcn primitives playing dress-up. Either actual product screenshots/videos, OR an R3F scene that visualises the product concept.
24. **Performance traced by chrome-devtools-mcp, not synthetic PageSpeed.** Real Chrome traces against deployed URL with 4× CPU slowdown + Slow 4G emulation. Targets: LCP < 2.0s, INP < 150ms, CLS < 0.05 (target 98) — tighter at target 100.
25. **OKLCH color tokens. No shadcn defaults.** `slate`/`zinc`/`neutral` are the AI-template signature. 1 brand accent + 2 neutrals + 1 surface, period.

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

| `target_score` | Tier label | What it gates | Phase R / G run? |
|---|---|---|---|
| 90 | Premium SaaS | Generic high-quality SaaS landing | No |
| 95 | Stripe / Linear quality | Disciplined design system, real motion, mobile parity, a11y/SEO pass | No |
| 98 | **Awwwards SOTD candidate** | Awwwards 4-dimension avg ≥ 8.0, all per-dim minima, WC1–WC10 PASS, chrome-devtools-mcp perf trace ≥ 90 | **YES** |
| 100 | **Awwwards SOTM candidate** | Avg ≥ 8.5, Creativity ≥ 9.0, real Chrome trace ≥ 95, 60fps motion, foundry typography, custom cursor, View Transitions | **YES + stricter gates** |

`--world-class` auto-sets target=98. `--world-class --target=100` enters SOTM mode.

---

## Reference paths (always use tilde paths — never hardcode machine paths)

```
checklist:               ~/.claude/skills/shared/landing-page-checklist.md
fix-routing:             ~/.claude/skills/web-evolve/references/fix-routing.md
scoring-engine:          ~/.claude/skills/web-evolve/references/scoring-engine.md
world-class-tier:        ~/.claude/skills/web-evolve/references/world-class-tier.md
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
    # Will determine target from visual_quality_score in Step A.0.5 after puppeteer probe
    new_target = null  # to be set
```

**Step A.0.5 — For `fresh` mode only: visual_quality_score puppeteer probe:**

```
mcp__puppeteer__puppeteer_navigate(url={live_url})
mcp__puppeteer__puppeteer_screenshot(path={project_path}/.evolution/baseline/probe-1440.png, viewport={width:1440,height:900})
```

Visually assess on the 1–5 scale (4 axes: hero impact, hierarchy, distinctiveness, product visibility — same as Phase A.7.5). Compute `visual_quality_score`.

Apply the decision table from `multi-run-orchestration.md` Branch 3:

| visual_q | Client work? | Revenue critical? | → target |
|---|---|---|---|
| < 2.0 | any | any | 90 |
| 2.0–2.99 | any | any | 95 |
| 3.0–3.99 | yes OR yes | — | 98 |
| 3.0–3.99 | no AND no | — | 95 |
| ≥ 4.0 | any | any | 98 |
| ≥ 4.5 + custom hero detected (canvas/three/gsap globals via puppeteer_evaluate) | yes | yes | 100 |

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

1. Any check in `trajectory.runs[-1].uncompleted_wc_checks` — these are world-class gates that didn't close last time
2. Any check in `trajectory.runs[-1].next_run_recommendations` (Phase F output from last run)
3. New failures: re-baseline in Phase B and diff against last `final-score.json` — any newly-failing check goes to top

These focus items get `+500` priority bonus in the queue beyond their normal weighting.

**Step A.0.10 — Compute deliverable_target_score (NOT declared_target_score) + echo to user:**

The declared_target (Phase A.0 decision) is what the run aims for. The deliverable_target is what the run can actually achieve given installed tooling. They MUST match before the run starts — if they don't, surface upfront, not in retro.

Compute `deliverable_target_score`:
```
start with: declared_target
if declared_target >= 98:
  required tooling:
    - chrome-devtools-mcp connected (Phase G.5 Cardinal Rule 24)
    - Skill('critique') available (Cardinal Rule 8 + Gate B)
    - Skill('a11y-audit') available (Phase A.1.5 mandate)
    - Skill('seo-strategy') available (Phase A.1.5 mandate)
    - Phase R will run (Gate E artifact gate)
  for each missing → deliverable_target_score = min(deliverable_target_score, 95)
  if no R3F libs in package.json AND signature == A → cannot deliver A
  if no GSAP/lenis in package.json AND signature == B → cannot deliver B
  if no variable font in font config AND signature == C → cannot deliver C
if declared_target >= 95:
  required tooling:
    - Skill('critique') available
    - Skill('a11y-audit') available
    - Skill('seo-strategy') available
  for each missing → deliverable_target_score = min(deliverable_target_score, 90)
```

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

**Step A.0.11 — Write current run header to trajectory.json:**

If trajectory.json missing → create it with `project_path`, `live_url`, empty `runs[]`, and initial `current_run_state`.

Otherwise append a new entry to `current_run_state`:
```json
{
  "id": N,
  "started_at": "{now}",
  "status": "in_progress",
  "target_score": new_target,
  "tier": tier_label,
  "mode": mode,
  "phases_planned": phases_to_run,
  "focus_list": focus_list
}
```

Write to disk. This file is committed at the end of Phase F.

---

## Phase R — World-Class Research (runs when Phase A.0 plan includes R)

Runs BEFORE Phase 0. Skipped entirely otherwise.

This phase exists because Awwwards SOTM-tier quality cannot be reached by polishing checklist items — it requires reference-anchored signature decisions made before iteration begins. Phase R produces `.evolution/world-class-references.json` and updates `DESIGN-BRIEF.md` with hero-signature commitments.

**Step R.1 — Fetch reference galleries in parallel:**

```
WebFetch(url=https://www.awwwards.com/inspiration_search/sites_of_the_month/, prompt="List the 6 most recent Sites of the Month with site name, URL, hero technique (3D/scroll/typo/other), motion library detected from copy if mentioned, color palette description, typography pairing. Return JSON array.")
WebFetch(url=https://www.awwwards.com/websites/sites_of_the_day/, prompt="List the 8 most recent Sites of the Day with same fields as above. Return JSON array.")
WebFetch(url=https://godly.website/, prompt="List the 6 most recent curated picks. Same field schema. JSON array.")
WebFetch(url=https://thefwa.com/cases/site-of-the-day, prompt="List the 6 most recent FWA Site of the Day picks. Same fields. JSON array.")
WebFetch(url=https://land-book.com/, prompt="List 6 recent picks tagged as {personality from DESIGN-BRIEF.md}. Same fields. JSON array.")
WebFetch(url=https://www.awwwards.com/websites/webgl/, prompt="List 6 recent WebGL-tagged sites with hero scene description. JSON array.")
```

Aggregate into `.evolution/world-class-references.json` — deduplicate by URL, score each by relevance to the project's personality + industry from CONTEXT.md.

**Step R.2 — Probe top 6 candidates for live signature:**

For each top-6 reference (by relevance), run:
```
mcp__puppeteer__puppeteer_navigate(url={reference.url})
mcp__puppeteer__puppeteer_screenshot(path={path}, viewport={width:1440,height:900})
mcp__puppeteer__puppeteer_evaluate(script=`
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
`)
```

Record the live signature per reference in the JSON.

**Step R.3 — Surface to user for signature commitment:**

```
"World-Class Research complete. Top 6 references for your project:

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

Wait for user reply. Write hero signature + selected references back to `DESIGN-BRIEF.md` under a new `## World-Class Anchor` section. From now on every refinement skill receives `world_class_anchor: {hero_signature, primary_reference_url, secondary_reference_urls}` in its args.

**Step R.4 — Inject WC1–WC10 synthetic checks** into the priority queue (visual_bonus 2500 each — higher than checklist 2000-tier). Routing in `fix-routing.md` SKILL_LOOKUP. These checks lead the queue once Phase G completes.

**Step R.5 — HARD GATE: world-class-references.json MUST exist before Phase G can begin (Cardinal Rule 14 Gate E):**

Verify that Steps R.1–R.4 actually produced their artifacts. The orchestrator cannot bypass Phase R by writing a signature commitment to DESIGN-BRIEF directly from memory (this happened in Run #2 on Orbit Digital 2026-05-16 — Phase R was claimed "complete" with zero reference probing).

```bash
# Hard gate — all three MUST be true before Phase G starts:
[ -s "{project_path}/.evolution/world-class-references.json" ] || HALT
[ -s "{project_path}/.evolution/world-class-references.json" ] && \
  jq '.references | length' "{project_path}/.evolution/world-class-references.json" | grep -qE "^([6-9]|[1-9][0-9])$" || HALT  # >= 6 references
grep -q "## World-Class Anchor" "{project_path}/DESIGN-BRIEF.md" || HALT
grep -qE "hero_signature: \"[ABC]\"" "{project_path}/DESIGN-BRIEF.md" || HALT  # singular A or B or C only
```

If any check fails → HALT NEEDS_HUMAN: `"Phase R artifacts missing or malformed. world-class-references.json (≥6 references), DESIGN-BRIEF ## World-Class Anchor section with hero_signature one of A/B/C — required before Phase G installs the motion stack. Re-run Phase R from R.1."`

**Add Gate E to Cardinal Rule 14 evaluation:**
- Gate E — `phase_r_artifacts_present` (target ≥ 98 only):
  - `.evolution/world-class-references.json` exists with ≥6 reference entries
  - `DESIGN-BRIEF.md` contains `## World-Class Anchor` section
  - `hero_signature` is one of "A", "B", "C" (literal — combined banned per Cardinal Rule 17)
  - If false → status `phase_r_skipped`

---

## Phase G — Generative Motion Stack Setup (runs when Phase A.0 plan includes G)

Triggered automatically when Phase A.0 sets `target_score ≥ 98` AND trajectory.json shows motion stack not yet installed. Subsequent runs skip this phase entirely — the stack persists across runs.

Runs after Phase A but before Phase B. Installs and wires the world-class motion stack. Idempotent — safe to re-run.

**Step G.1 — Detect existing motion stack:**
```bash
grep -E '"(lenis|gsap|@react-three/fiber|@rive-app/react-canvas)"' "{project_path}/package.json"
```

**Step G.2 — Install missing dependencies:**

Based on hero signature from Phase R.3:

```bash
# Always install (baseline world-class):
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
git -C "{project_path}" commit -m "world-class: install motion stack (lenis + gsap + cursor + view-transitions)"
```

This commit is the world-class baseline. From here, Phase B baseline scores measure the lifted floor — not the pre-stack state.

---

## Phase 0 — Project Context Read (MANDATORY, runs before Phase A)

This phase exists because scoring against generic premium-SaaS criteria produces template-drift. The loop must improve toward what THIS product is meant to be, not toward what a SaaS-in-general looks like.

1. Check `{project_path}/CONTEXT.md` exists.
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

## Phase A — Setup

**Run all reads in parallel (single message):**

1. Read simultaneously: `{project_path}/CLAUDE.md`, `{project_path}/CONTEXT.md`, `{project_path}/DESIGN-BRIEF.md`, `{project_path}/SCOPE.md`, `{project_path}/BUILD-LOG.md`, `~/.claude/web-system-prompt.md` (**Design DNA** — token system, typography scale, color discipline, visual signatures. Cardinal Rule 13 — loaded once, re-cited in every Skill() args block), `~/.claude/skills/premium-website/SKILL.md` (cross-check contract — Phase F diffs against this), `~/.claude/skills/premium-website/references/component-registry.md` (21st.dev registry — used by Step 3 Case B for builder pipeline)

1.5 **Apply target-tier behaviour (auto from Phase A.0) — MANDATED, not "enabled":**

   Read `target_score` from Phase A.0 decision. The agents below are MANDATORY for their tier. "Enable" was the old wording — actual semantics is "MUST RUN OR HALT NEEDS_HUMAN." Skipping them to save tool calls is a route-around (Run #2 on Orbit Digital 2026-05-16 skipped all three at target=98 — this gate now prevents that).

   - `target ≥ 95` → mobile_loop MUST be set, and ALL of these MUST fire in Phase B:
     - `Skill('a11y-audit', ...)` — accessibility WCAG 2.2 audit
     - `Skill('seo-strategy', ...)` — site-wide SEO audit
     - `Skill('critique', ...)` — UX critique with persona-based testing + anti-pattern detection
     - Set `visual_quality_exit_floor = 4.5`
     If ANY of these three fails to fire (skill unavailable, agent error, orchestrator deliberately skipped) → trajectory.json `status: "mandated_agents_skipped"` (per Cardinal Rule 14 Gate D — see below) AND user-facing summary leads with `⚠️ MANDATED AGENTS SKIPPED — re-run required.`
   - `target ≥ 98` → all of the above PLUS:
     - `chrome-devtools-mcp` MUST be connected (Phase G.5 auto-install + HALT path enforces this)
     - Phase R MUST produce `.evolution/world-class-references.json` (P4 below — Phase R gate)
     - Phase R signature commitment MUST be singular (Cardinal Rule 17 — P1 above)
   - `target = 100` → tighter perf gates (LCP < 1.5s, INP < 100ms, CLS < 0.01), foundry typography mandatory, custom cursor required, View Transitions on every route

   Log: `"Tier behaviour: target {target}/100 → MANDATED agents: {list}. HALT if any cannot fire."`

   **Add Gate D to Cardinal Rule 14 evaluation** (Phase F.7 reads this):
   - Gate D — `mandated_agents_fired_count` per tier:
     - target 95+: a11y + seo + critique = 3 mandatory. If `count < 3` → status `mandated_agents_skipped`.
     - target 98+: above 3 + chrome-devtools-mcp perf trace = 4 mandatory. If `count < 4` → status `mandated_agents_skipped`.

1.6 **Multi-page detection:**
   - If `--pages` flag provided → parse comma-separated list into `pages_to_evolve`
   - Else → read SCOPE.md for `## Page Inventory`. If found, default to first page (landing). If absent, default to `["/"]`.
   - Phase C will loop over `pages_to_evolve`. Each page gets its own `.evolution/{page-slug}/` subdir, its own loop-state, its own iteration cap. Phase D produces one EVOLUTION-LOG.md covering all pages.

1.7 **Branch isolation (unless `--no-branch`):**
   ```bash
   git -C "{project_path}" status --porcelain
   ```
   - If clean → `git -C "{project_path}" checkout -b "evolve/$(date +%Y-%m-%d-%H%M)"`
   - If dirty → HALT NEEDS_HUMAN: "Working tree dirty. Commit or stash before running web-evolve, or pass `--no-branch` to evolve current branch."
   - Log new branch name to BUILD-LOG.md.
   - Phase D's final commit goes to this branch. Merge to main is a user decision after reviewing EVOLUTION-LOG.md.

2. **Loop state handling — automated, not asked.** Phase A.0 already decided `mode` (resume / advance / fresh). For this step:
   - `mode == "resume"` → restore `.evolution/loop-state.json`, skip Phases A.1.5–A.8.7 and Phase B, jump to Phase C. The user will see "Resuming Run #N at iteration {it}" in the A.0.10 echo.
   - `mode == "advance"` → archive last run's loop-state.json to `.evolution/archive/run-{last_run_id}-loop-state.json` (in case user wants to inspect), then create fresh loop-state.json for the new run.
   - `mode == "fresh"` → if loop-state.json exists, archive then overwrite. No "are you sure" — the user passed `--fresh` or there was no trajectory, both intentional.

3. Detect mode: DESIGN-BRIEF.md exists AND `src/components/landing/` non-empty → `backfill`. Else → `greenfield`.

4. Extract personality — try in order:
   - `grep "^personality:" {project_path}/DESIGN-BRIEF.md` (top-level field)
   - `grep "Personality type:" {project_path}/DESIGN-BRIEF.md` (section heading)
   - Default: `Enterprise Authority` — log assumption to BUILD-LOG.md

5. Determine benchmark URL from personality:
   - Enterprise Authority → `https://stripe.com`
   - Data Intelligence → `https://linear.app`
   - Growth Engine → `https://vercel.com`
   - Trusted Productivity → `https://notion.so`
   - Premium Professional → `https://framer.com`
   - Bold Operator → `https://shopify.com`
   - Health & Care / Civic → user must specify `--benchmark=URL`

6. Verify `live_url` returns 200:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" "{live_url}"
   ```
   HALT if not 200.

6.5 **ENVIRONMENT PROBE — sub-agent resolution check:**

   Attempt to spawn a minimal Agent with `subagent_type: "web-score"`. If it errors with "Agent type not found" → set `USE_GENERAL_PURPOSE_FALLBACK = true` and log:
   ```
   ⚠️  web-score subagent_type not registered in this environment (Windows VS Code extension or non-standard install).
   Switching all Phase B/C agent calls to general-purpose mode.
   Agent spec paths will be injected into each prompt.
   ```

   **When USE_GENERAL_PURPOSE_FALLBACK = true**, every agent call in Phase B and Phase C that uses `subagent_type: "web-score"` etc. must instead use:
   ```
   subagent_type: "general-purpose"
   prompt: |
     Read your agent spec first: ~/.claude/agents/{agent_name}.md
     Then execute it with these inputs:
     {original prompt body}
   ```
   
   Where `{agent_name}` is `web-score`, `web-benchmark`, `web-screenshot`, or `web-patch` as appropriate.
   
   This fallback is transparent — the same JSON output format, the same file paths, the same behaviour. The only difference is the model routing and tool permissions come from `general-purpose` rather than the specialist agent definition.

7. Create `.evolution/` directories (four separate calls):
   ```bash
   mkdir -p "{project_path}/.evolution/baseline"
   mkdir -p "{project_path}/.evolution/benchmark"
   mkdir -p "{project_path}/.evolution/scores"
   mkdir -p "{project_path}/.evolution/final"
   ```

7.5 **VISUAL QUALITY GATE** — Take a Puppeteer screenshot of `live_url` at 1440×900. Assess visually:

   ```
   Rate each 1–5:
   - Hero impact:        Does the above-fold experience stop a scroll? Flat text on plain bg = 1. Split-pane with visible product, atmospheric depth = 5.
   - Visual hierarchy:   Is there obvious size/weight contrast between sections? All same = 1.
   - Distinctiveness:    Does this look like a $10K product or a SaaS template? Template = 1.
   - Product visibility: Is the actual product UI visible above the fold without scrolling? Not visible = 1.
   
   visual_quality_score = average of 4 ratings
   ```
   
   **If visual_quality_score < 3.0 → INSERT these at the VERY START of the Phase C iteration queue (BEFORE checklist-driven checks):**
   - VQ-1: `Skill('impeccable')` on the hero section with BOLD execution mandate
   - VQ-2: `Skill('layout')` on the features/main content section
   - VQ-3: `Skill('bolder')` on overall visual weight
   
   **These visual overhaul iterations run FIRST regardless of what the checklist priority queue says.** Only after VQ-1/2/3 are KEPT does the normal checklist queue begin.
   
   **Re-evaluation:** After each VQ iteration that targets a visual check (A7, A9, D4, D5, F6, K2, K4), re-run the visual quality assessment. If visual_quality_score rises above 4.0, the forced VQ queue clears and the normal checklist queue resumes. If after all 3 VQ iterations the score is still < 3.0 → surface NEEDS_HUMAN.
   
   Log: `visual_quality_score: {score}/5 → {inserted VQ iterations | skipped (score >= 3.0)}`

8. **Discover CSS selectors for scroll targeting (hybrid grep + live DOM):**

   **Step 8a — grep source** (fast path):
   ```bash
   grep -nE 'id="[^"]*"' "{project_path}/src/pages/index.tsx" 2>/dev/null || grep -nE 'id="[^"]*"' "{project_path}/src/app/page.tsx" 2>/dev/null
   grep -rhE 'id="[^"]+"' "{project_path}/src/components/landing/" 2>/dev/null
   ```

   **Step 8b — live DOM verification** (catches runtime-generated IDs grep misses):
   ```
   mcp__puppeteer__puppeteer_navigate(url={dev_server_url or live_url})
   mcp__puppeteer__puppeteer_evaluate(script=`
     const ids = Array.from(document.querySelectorAll('[id]')).map(el => ({
       id: el.id,
       tag: el.tagName.toLowerCase(),
       text: el.textContent?.slice(0,40),
       y: el.getBoundingClientRect().top + window.scrollY
     })).sort((a,b) => a.y - b.y);
     const datasections = Array.from(document.querySelectorAll('[data-section]')).map(el => ({
       selector: '[data-section="' + el.dataset.section + '"]',
       section: el.dataset.section,
       y: el.getBoundingClientRect().top + window.scrollY
     }));
     return { ids, datasections };
   `)
   ```

   Merge grep + DOM results. Build `section_selectors` map (e.g. `{"hero": "#hero", "features": "#features", "pricing": "#pricing"}`). Prefer `[data-section]` when present. Use `""` (empty — scroll to top) for any section without a discovered id. This map is used in Steps 2 and 4 to pass `scroll_to_selector` to web-screenshot.

8.5 **Fire `Skill('impeccable')` with `args: 'teach'` ONCE per project (Cardinal Rule 12):**

   Check if `.evolution/design-context.md` exists with `Generated:` date ≤ 30 days:
   - YES → skip, read existing file into loop state as `design_context`
   - NO or stale → fire now:
     ```
     Skill('impeccable', args='teach | project: {project_path} | personality: {personality} | design_brief: {project_path}/DESIGN-BRIEF.md | context: {project_path}/CONTEXT.md | design_dna: ~/.claude/web-system-prompt.md | output: {project_path}/.evolution/design-context.md')
     ```
   - Read the produced `.evolution/design-context.md`. This text is **appended to every refinement Skill() args string in Phase C** under the marker `| design_context: {first 800 chars}`. This is how typeset, colorize, etc. avoid producing generic output.
   - Log: `"impeccable teach: {NEW | CACHED} → design-context.md ready"`

8.6 **If `--premium` AND DESIGN-BRIEF.md Trend Pulse is >30 days old or missing:**

   Refresh trend pulse via WebSearch:
   ```
   WebSearch(query="awwwards site of the year 2026 {industry from CONTEXT.md} winners")
   WebSearch(query="godly.website {personality} 2026 trending design patterns")
   ```
   Update DESIGN-BRIEF.md `## Trend Pulse` section with top 5 patterns and `search_date: {today}`. This blocks personality drift on long-running projects.

8.7 **If `--benchmark-search` set:**

   Auto-pick a benchmark via WebSearch instead of the personality table:
   ```
   WebSearch(query="awwwards {industry} {personality} winner 2026 site:awwwards.com")
   WebSearch(query="godly.website {industry} top sites")
   ```
   Score top 3 candidates by:
   - Page weight < 2MB (fetch with WebFetch, count bytes)
   - At least 5 sections detectable
   - Has hero animation (regex `motion|gsap|three|lottie` in returned HTML)
   Select highest score. Set `benchmark_url` and `benchmark_name`. Log the choice + reasoning to BUILD-LOG.md.

9. Echo confirmation to user and wait:
   ```
   web-evolve starting
   Mode: {mode} | Cap: {max_iterations} | Target: {target_score}/100
   Benchmark: {benchmark_url}
   Loop screenshots: {dev_server_url if set, else "live URL — 45s wait per commit"}
   Pages in scope: {from SCOPE.md}
   Proceed?
   ```

9. **DESIGN-BRIEF.md missing → auto-generate, do NOT halt:**

   If DESIGN-BRIEF.md does not exist, generate a minimal one from codebase inspection before proceeding. Do NOT halt. Follow these steps:

   ```
   a) Grep for font imports in layout.tsx / globals.css → identify display + body fonts
   b) Grep for color tokens (hsl vars, oklch values) in globals.css → identify palette
   c) Grep src/app/page.tsx for imported section components → identify page structure
   d) Take a Puppeteer screenshot at 1440×900 → assess visual direction
   e) Map to nearest personality from Step 4's table based on: industry keywords in
      page.tsx/metadata, color temperature (warm/cool/neutral), typography style (serif/sans)
   f) Write DESIGN-BRIEF.md to project_path with: personality, aesthetic_direction,
      colour palette (observed), typography (observed), hero description (from screenshot),
      and a ## Trend Pulse stub with search_date = today and placeholder lists
   g) Compute confidence score for the personality mapping:
      - HIGH (3 signals agree: industry keywords + color temp + typography style) → proceed silently
      - MEDIUM (2 signals agree) → log: "⚠️ DESIGN-BRIEF auto-generated with MEDIUM confidence. Personality: {X}. If wrong, edit DESIGN-BRIEF.md before continuing."
      - LOW (only 1 signal or signals conflict) → surface to user: "Personality auto-detected as {X} but signals conflict. Does '{X}' match your product? (or tell me: enterprise/growth/premium/bold/health)" — wait for one-word reply, update DESIGN-BRIEF, then proceed.
   
   h) Log: "DESIGN-BRIEF.md auto-generated from codebase inspection. Confidence: {HIGH|MEDIUM|LOW}."
   ```

   This replaces the old HALT with a 30-second auto-detect. HIGH confidence: fully unblocked. LOW confidence: one-question user check before proceeding — still faster than halting entirely.

---

## Phase B — Parallel baseline audit (4 score agents + benchmark + deep signals)

For Tier 2 baseline, spawn agents in a single message (all `run_in_background: true`) to prevent 79-check drift in one context. The standard spawn count is **5** (4 score + 1 benchmark). When **Phase A.0 set target_score ≥ 95**, add **3 more** (a11y, seo, critique) and **1 inline** (PageSpeed or chrome-devtools-mcp) for **9 total signals** before merging. (Previously gated on `--premium` — now auto-gated on target_score.)

```
Agent 1 — web-score (A+B categories, ~19 checks):
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {live_url}
    output_path: {project_path}/.evolution/scores
    tier: category:A,B
    mode: {mode}
    output_filename: score-AB.json
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md

Agent 2 — web-score (C+D+E categories, ~24 checks):
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {live_url}
    output_path: {project_path}/.evolution/scores
    tier: category:C,D,E
    mode: {mode}
    output_filename: score-CDE.json
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md

Agent 3 — web-score (F+G+H categories, ~12 checks):
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {live_url}
    output_path: {project_path}/.evolution/scores
    tier: category:F,G,H
    mode: {mode}
    output_filename: score-FGH.json
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md

Agent 4 — web-score (I+J+K categories, ~20 checks):
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {live_url}
    output_path: {project_path}/.evolution/scores
    tier: category:I,J,K
    mode: {mode}
    output_filename: score-IJK.json
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md

Agent 5 — web-benchmark:
  subagent_type: "web-benchmark"
  run_in_background: true
  prompt: |
    benchmark_url: {benchmark_url}
    benchmark_name: {benchmark_name}
    target_page_description: {aesthetic_direction + hero description from DESIGN-BRIEF.md}
    target_personality: {personality}
    output_path: {project_path}/.evolution/benchmark
    fetch_html: true                       # NEW — pull raw HTML via WebFetch
    extract_sections: true                 # NEW — parse benchmark section structure
    extract_color_tokens: true             # NEW — pull computed CSS custom props from :root

(if target ≥ 95) Agent 6 — a11y-audit:
  Skill('a11y-audit', args='url: {live_url} | mode: audit-only | output: {project_path}/.evolution/a11y.json | wcag_level: AA')
  Run in background.

(if target ≥ 95) Agent 7 — seo-strategy:
  Skill('seo-strategy', args='url: {live_url} | mode: audit | output: {project_path}/.evolution/seo.json | check: meta+og+jsonld+headings+image-alt+sitemap+robots+canonical')
  Run in background.

(if target ≥ 95) Agent 8 — /critique cross-check:
  Skill('critique', args='url: {live_url} | mode: scored | output: {project_path}/.evolution/critique.json | dimensions: hierarchy,IA,emotional,cognitive-load,anti-pattern-detection')
  Run in background.
```

Wait for all (5 standard, 8 with --premium) to complete.

**Inline performance trace — chrome-devtools-mcp when available, PageSpeed Insights fallback:**

**Primary path (target ≥ 98 OR chrome-devtools-mcp connected):**

Real Chrome trace via the official Chrome DevTools MCP server (launched Sept 2025):
```
mcp__chrome-devtools__performance_start_trace(
  url={live_url},
  reload=true,
  autoStop=true,
  network_throttling="Slow 4G",
  cpu_throttling=4
)
mcp__chrome-devtools__performance_stop_trace()
mcp__chrome-devtools__performance_analyze_insight(
  trace_id={returned trace id},
  insights=["LCPBreakdown","INPBreakdown","CLSCulprits","DocumentLatency","RenderBlocking","ThirdPartyImpact","ImageDelivery","FontDisplay","MainThreadBlocking","UnusedCode"]
)
```

Parse the structured insights. Write to `.evolution/perf-trace.json` with: LCP, INP, CLS, TBT, TTI, Lighthouse category scores, and the per-insight breakdown (which third-party blocked, which image delayed LCP, which font caused FOIT etc).

The per-insight breakdown enables targeted fixes — `ImageDelivery` issue routes to `optimize` with the offending image src; `FontDisplay` routes to `typeset` with the font-face fix. This is the difference between "score went down" and "fix the exact image at line N".

**Fallback path (chrome-devtools-mcp not connected, target < 98):**
```
WebFetch(
  url=`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={encodeURIComponent(live_url)}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo`,
  prompt="Extract lighthouseResult.audits['largest-contentful-paint'].numericValue, ['interaction-to-next-paint'].numericValue, ['cumulative-layout-shift'].numericValue, ['total-blocking-time'].numericValue, ['speed-index'].numericValue. Also extract category scores: performance, accessibility, best-practices, seo. Return JSON."
)
```
Write to `.evolution/pagespeed.json`. PageSpeed uses Lighthouse 10 as of 2026.

**At target ≥ 98, fallback is NOT acceptable** — if chrome-devtools-mcp is missing, HALT NEEDS_HUMAN: "chrome-devtools-mcp required for world-class perf gates. Install via npx chrome-devtools-mcp@latest or add to ~/.claude/settings.json mcpServers block."

These values become the authoritative source for G4/G5/G6 + WC9 in the merge — overrides any local Puppeteer CWV estimate.

### After all complete — merge + enrich

1. Read all four partial score files. If any missing → re-run that agent once. Still missing → HALT NEEDS_HUMAN with which categories failed.

2. **Merge partial scores into `.evolution/scores/score.json`:**

   ```
   merged_checks = {}
   for each partial file (score-AB, score-CDE, score-FGH, score-IJK):
     merged_checks.update(partial.checks)

   # Visual weight multipliers — visual checks count 3×, code quality 0.5×, process 0×
   # At target >= 98 (world-class), motion (D-series) + hero (A7/A9) become 4×, WC-series 5×
   # NOTE: no duplicate keys — each check_id appears exactly once
   VISUAL_WEIGHT_STANDARD = {
     # 3× — hero depth, product visibility, layout quality (directly visible to users)
     "A7":3, "A9":3, "D4":3, "D5":3, "F6":3, "K2":3, "K4":3,
     # 2× — section presence and copy quality (visible, conversion impact)
     "E3":2, "E4":2, "E5":2, "E6":2, "E9":2, "E10":2,
     "J1":2, "J2":2, "J3":2, "J6":2,
     # 0.5× — code quality / invisible to users
     "A11":0.5, "I4":0.5, "I8":0.5, "I2":0.5,
     "D1":0.5, "I5":0.5, "I6":0.5, "C6":0.5, "C7":0.5,
     # 0× — process checks and 21st.dev sourcing (WONTFIX for pre-existing projects)
     "B1":0, "B2":0, "B3":0, "B4":0, "B7":0, "B8":0, "B9":0,
     "H1":0, "H2":0,
   }
   VISUAL_WEIGHT_WORLD_CLASS = {
     # 5× — WC-series synthetic checks (motion stack, cursor, view transitions, fonts)
     "WC1":5, "WC2":5, "WC3":5, "WC4":5, "WC5":4, "WC6":4, "WC7":4, "WC8":5, "WC9":5, "WC10":3,
     # 4× — hero atmosphere + motion + product visibility (Awwwards Design + Creativity axes)
     "A7":4, "A9":4, "D4":4, "D5":4, "F6":4, "K2":4, "K4":4,
     # 3× — color/typography signature (Design axis)
     "A1":3, "A2":3, "A3":3, "A4":3, "A5":3, "A6":3,
     "C4":3, "C5":3, "C6":3, "C7":3,
     # 2× — sections + copy
     "E3":2, "E4":2, "E5":2, "E6":2, "E9":2, "E10":2,
     "J1":2, "J2":2, "J3":2, "J6":2,
     # 0.5× — code quality
     "A11":0.5, "I4":0.5, "I8":0.5, "I2":0.5, "D1":0.5,
     "I5":0.5, "I6":0.5,
     # 0× — process / sourcing
     "B1":0, "B2":0, "B3":0, "B4":0, "B7":0, "B8":0, "B9":0,
     "H1":0, "H2":0,
   }
   VISUAL_WEIGHT = VISUAL_WEIGHT_WORLD_CLASS if world_class else VISUAL_WEIGHT_STANDARD
   default_weight = 1  # all other checks (A1-A6, A8, A10, C1-C5, C8, D2, D3, D6, E1-E2, E7-E8, F1-F5, G-series, I1, I3, I7, J4-J5, J7-J8, K1, K3)

   weighted_passed = sum(VISUAL_WEIGHT.get(k, default_weight)
                         for k,v in merged_checks.items() if v.status=="PASS")
   weighted_total  = sum(VISUAL_WEIGHT.get(k, default_weight)
                         for k,v in merged_checks.items()
                         if v.status not in ("N/A","WONTFIX","NEEDS_HUMAN")
                         and VISUAL_WEIGHT.get(k, default_weight) > 0)

   raw_score = (weighted_passed / weighted_total) * 100 if weighted_total > 0 else 0

   # Veto logic — evaluated on raw_score BEFORE veto cap is applied
   # The veto cap applies to the WEIGHTED raw_score, not a simple pass count.
   # This means: a site with A7 FAIL has already lost 3× score weight from that check
   # PLUS gets capped at 60. Both penalties apply — they don't cancel each other.
   any_A_fail = any(k.startswith("A") and v.status=="FAIL"
                    for k,v in merged_checks.items())
   any_B_fail = any(k.startswith("B") and v.status=="FAIL"
                    and VISUAL_WEIGHT.get(k, 1) > 0  # skip zero-weight B checks
                    for k,v in merged_checks.items())
   if any_A_fail:   final_score = min(60, raw_score); veto_check = "first A FAIL"
   elif any_B_fail: final_score = min(80, raw_score); veto_check = "first non-WONTFIX B FAIL"
   else:            final_score = raw_score;           veto_check = None

   # Mandatory transparency log (output this every merge):
   # "Weighted score: {weighted_passed:.1f} / {weighted_total:.1f} = {raw_score:.1f}%
   #  Veto: {veto_check or 'none'}  →  Final: {final_score:.1f}
   #  3× visual checks: A7={status} A9={status} D5={status} F6={status} K2={status}
   #  0.5× code checks: D1={status} I5={status} I6={status} (these barely move the score)"

   merged_priority_queue = sorted(
     [entry for partial in partials for entry in partial.priority_queue if entry.status=="FAIL"],
     key=lambda x: -x.priority
   )
   ```

   Use the Write tool to write merged `score.json` to `{project_path}/.evolution/scores/score.json`.

3. Read `~/.claude/skills/web-evolve/references/fix-routing.md` — parse the `SKILL_LOOKUP` JSON block at the top of the file.

4. **Enrich priority_queue with fix routing:**
   For each FAIL entry in merged priority_queue:
   - Look up `check_id` in SKILL_LOOKUP
   - Set `fix_skill`, `prereq`, `secondary`, `edit_direct`, `section` on the entry
   - Build `fix_context` from the fail_proof (one sentence: what is wrong + target state)

4.5 **AUTO-WONTFIX invisible checks** — Before building the priority queue, mark these as WONTFIX (they produce no visible change and waste iteration slots):
   - **B-series (B1–B9):** 21st.dev component sourcing workflow — zero visual impact, never visible to users
   - **H1, H2:** Process integrity checks — BUILD-LOG citation format, not a visual concern
   - **D1 (import naming):** `framer-motion` vs `motion/react` — identical visual output
   - **A11, I4, I8, I2** when `fix_context` contains only DESIGN-BRIEF.md edits with no code changes
   
   Rule: **If the fix requires ONLY editing markdown/documentation files with ZERO React/CSS/TS code changes → auto-WONTFIX. Do not put in the queue.**
   
   Exception: A11 is allowed in the queue IF the DESIGN-BRIEF aesthetic direction is genuinely saturated/wrong and needs a redesign → only then escalate to web-design-research.

5. **Prepend benchmark gaps:** Read `.evolution/benchmark/gap-analysis.json`. For each in `top_5_priority_queue`: look up `maps_to_check` in SKILL_LOOKUP, set routing fields. Add to front of priority_queue with priority 400. Deduplicate by check_id.

5.1 **Override CWV checks with PageSpeed data:** Read `.evolution/pagespeed.json`. For G4 (LCP), G5 (INP), G6 (CLS): override `status` and `proof` with PageSpeed numericValue. Thresholds: LCP < 2.5s = PASS, INP < 200ms = PASS, CLS < 0.1 = PASS. Cite the PageSpeed run ID in `proof` so the source is auditable.

5.2 **Inject a11y findings into priority_queue (if target ≥ 95):** Read `.evolution/a11y.json`. For each violation with `severity: serious|critical`:
   - Create synthetic check entry `A11Y-{rule-id}` with priority 350 (between benchmark 400 and quality 300)
   - `fix_skill = "polish"` for contrast/focus issues, `clarify` for label/alt-text issues, `web-fix` for landmark/ARIA structural issues
   - Mark `wcag_level` in the entry so the rescore can verify the fix improved the actual a11y score

5.3 **Inject SEO findings into priority_queue (if target ≥ 95):** Read `.evolution/seo.json`. For each FAIL:
   - meta tags / og / canonical / robots / sitemap → synthetic `SEO-{check}` with priority 200, `fix_skill: null`, `edit_direct: true` (these are edit-the-head fixes)
   - Image alt missing → route to `clarify` with the image src list
   - JSON-LD missing → synthetic, `edit_direct: true`, priority 150

5.4 **Reconcile /critique findings (if target ≥ 95):** Read `.evolution/critique.json`. If critique flags a dimension that web-score scored PASS:
   - Demote that check's PASS to NEEDS_HUMAN with note `"web-score PASS but /critique flagged: {critique reason}"`
   - User confirms which source to trust → update score.json before iteration begins
   This is the cross-check that catches checklist blind spots.

6. **Surface NEEDS_HUMAN blocks** — one message to user listing all vision checks. Wait for replies. Update score.json check entries.

7. Write baseline score to BUILD-LOG.md (mandatory output format from checklist).

8. If `final_score >= target_score` → log "already at target", skip to Phase D.

9. **Write initial loop state** using the Write tool (not bash echo):
   Path: `{project_path}/.evolution/loop-state.json`
   ```json
   {
     "iteration": 0,
     "void_count": 0,
     "real_iterations": 0,
     "current_score": {final_score},
     "baseline_score": {final_score},
     "mode": "{mode}",
     "max_iterations": {max_iterations},
     "target_score": {target_score},
     "priority_queue": [{enriched queue}],
     "attempt_counts": {},
     "excluded_skills": {}
   }
   ```

---

## Phase C — Improvement loop

Read loop state from `loop-state.json` at start of each iteration. Write it after each decision.

Loop condition: `current_score < target_score AND real_iterations < max_iterations`

**Visual progress gate (evaluated alongside loop condition) — see Stop Conditions table below for full spec:**
Track in `loop-state.json`:
- `visual_checks_flipped` = count of checks with `visual_bonus >= 1000` that flipped FAIL→PASS this session
- `refinement_skill_invocations_count` = count of Phase C iterations that called `Skill(...)` for a refinement skill from `{impeccable, overdrive, animate, typeset, colorize, polish, bolder, delight, layout, distill, clarify, adapt}`
- `baseline_vq` = visual quality score from Phase A.7.5 probe (4-axis assessment)
- `post_run_vq` = re-probed visual quality score at exit-attempt (Puppeteer + 4-axis assessment)

When `current_score >= target_score`, the orchestrator MUST re-probe `post_run_vq` then evaluate ALL THREE GATES from the Stop Conditions table below:
1. `visual_checks_flipped >= tier_visual_floor`
2. `(post_run_vq - baseline_vq) >= tier_vq_delta_floor`
3. `refinement_skill_invocations_count >= tier_refinement_floor`

If any gate fails → do NOT exit. Force one more iteration through the highest-visual-bonus unflipped check via its refinement skill. Re-evaluate gates after. The old "exit if score met OR baseline_vq high" path is **banned** (Cardinal Rule 8) — it allowed runs to declare complete without visible change, which is the route-around failure mode this skill was designed to prevent, not enable.

---

### Step 0 — Iteration guard (run at start of EVERY iteration before picking a check)

This guard enforces the cardinal rules mechanically. Complete all checks in order. If any FAIL → resolve before proceeding.

```
[ ] 0.1  fix_type from previous iteration was determined via git diff (not judgment) — or this is iteration 1
[ ] 0.2  visual_checks_flipped counter is current in loop-state.json
[ ] 0.3  priority_queue is sorted: visual_bonus applied, no check with visual_bonus < 300 in position 1-3 IF any check with visual_bonus >= 1000 exists
[ ] 0.4  attempt_counts loaded — no check being picked has attempt_count >= 3
[ ] 0.5  excluded_skills loaded — if primary fix_skill is excluded, secondary is set
[ ] 0.6  If current_score >= target_score AND visual_checks_flipped == 0 AND baseline_vq < 4.0 → this must be the forced VQ-1 iteration, not a normal pick
[ ] 0.7  BUILD-LOG has an entry for every completed iteration (no silent drops)
[ ] 0.8  **edit_direct enforcement (Cardinal Rule 11.6):** for every check in `current_checks`, read `SKILL_LOOKUP[check_id].edit_direct`. If `false` for ANY check in the batch, the iteration MUST use `Skill(fix_skill, ...)` via the Skill tool — direct Edit / Bash sed / npm install + Edit are FORBIDDEN. The orchestrator may NOT decide "the fix is small enough to edit directly" — that judgment is SKILL_LOOKUP's, not the orchestrator's. If about to invoke Edit on a `edit_direct: false` check → STOP, route through `Skill(fix_skill)` instead.
[ ] 0.9  **Refinement-skill floor tracking (Cardinal Rule 11.7):** read `loop-state.json.refinement_skill_invocations_count` and `tier_minimum`. If `current_iteration_index ≥ max_iterations - (tier_minimum - count)` AND count < tier_minimum → the remaining iteration slots are RESERVED for refinement-skill invocations. Pick from the queue only checks routed through refinement skills (impeccable/overdrive/animate/typeset/colorize/polish/bolder/delight/layout/distill/clarify/adapt); skip non-refinement checks even if they have higher visual_bonus. If no refinement-routed checks remain in queue → fire `Skill('critique', args='generate-visual-targets')` to synthesise some.
```

If any guard check fails → log `"GUARD FAIL: 0.X — {reason}"` and resolve before Step 1.

---

### Step 1 — Pick check(s) — with batching

**VISUAL PRIORITY RE-SORT (mandatory before every pick):**
Before selecting from the queue, apply these visual impact bonuses to the sort key:

```
visual_bonus = {
  # World-class synthetic checks (only present when --world-class)
  "WC1": 2500, "WC2": 2500, "WC3": 2500, "WC4": 2500, "WC8": 2500,  # hero, lenis, gsap, cursor, real product UI
  "WC9": 2400,                                                        # 60fps performance gate
  "WC5": 2200, "WC10": 2200,                                          # view transitions + reduced motion
  "WC6": 2100, "WC7": 2100,                                           # typography + color tokens
  # Critical visual impact — product visible, hero depth, layout quality
  "A7": 2000, "A9": 2000, "D4": 2000, "D5": 2000, "F6": 2000, "K2": 1500, "K4": 1500,
  # Section presence — visible to all users
  "E5": 1200, "E6": 1200, "E9": 1200, "E10": 1000, "E3": 800, "E4": 800,
  # Copy quality — affects conversion
  "J1": 800, "J2": 800, "J3": 800, "J6": 600,
  # Design system — visible but subtle
  "C6": 300, "C7": 300, "I1": 300, "I8": 300,
  # Code quality — invisible to users
  "D1": 0, "I5": 0, "I6": 0, "G1": 0,
  # Documentation only — always WONTFIX if fix is docs-only
  "A11": 0, "I4": 0, "I2": 0, "H1": 0, "H2": 0,
}
sorted_queue = sorted(queue, key=lambda x: -(x.priority + visual_bonus.get(x.check_id, 0)))
```

**Cardinal Rule 9 enforcement:** If any check with visual_bonus >= 1000 exists in the queue, it MUST be selected before any check with visual_bonus < 300.

**Batch detection:** Before picking a single check, scan the top of the priority queue for checks that share the same `fix_skill` AND have no `prereq`. If 2+ such checks exist at the top of the queue — batch them into one iteration.

**Batching rules:**
- J-series: all J-failures with `fix_skill: "clarify"` → always batch into one Skill('clarify') call
- I-series: group by fix_skill → one Skill('typeset') + one Skill('polish') + one Skill('animate') max per iter
- C-series: group by fix_skill → batch same-skill C failures
- All others: single check per iteration (changes are more structural, harder to batch safely)

Set `current_checks = [check_id]` (single) or `[check_id_1, check_id_2, ...]` (batched).

**Exhaustion check:** For each check in `current_checks`, verify `attempt_counts.get(check_id, 0) < 3`. If 3 → mark WONTFIX, remove, repick.

If secondary skill needed (primary in excluded_skills): set `fix_skill = secondary` from SKILL_LOOKUP.

If queue empty → log STUCK, exit loop.

---

### Step 2 — Pre-fix screenshot

```
Agent:
  subagent_type: "web-screenshot"
  prompt: |
    live_url: {dev_server_url if set, else live_url}
    section_name: {section from first check in current_checks}
    mode: capture-only
    output_path: {project_path}/.evolution/iter-{iteration}/before-{section}.png
    scroll_to_selector: {CSS selector if known, else empty}
    viewport: desktop
```

Wait for completion. This is the `before` reference.

---

### Step 3 — Apply fix

**Determine fix type from SKILL_LOOKUP for the check(s):**

**BOLD EXECUTION MANDATE (applies to ALL design skill calls — overdrive, impeccable, bolder, layout, colorize, animate):**

Append this to every `args` string when calling a design skill:
```
EXECUTE BOLDLY. No atmospheric opacity below 0.15. No subtle-only changes. The visual difference must be immediately obvious when comparing before/after screenshots at 1440x900. If a human looking at the screenshots cannot immediately say "yes, that's clearly different and better" — the fix has FAILED and must be redone with more dramatic execution. For hero sections: commit to a direction and execute fully. A half-committed hero (tiny glow, imperceptible grain) is worse than no change.
```

**Case A — `edit_direct: true`** (ONLY A10, B5, E1, G1, G2 per `SKILL_LOOKUP` — this list is closed):

**Hard gate (Cardinal Rule 11.6) — re-check before invoking Edit:**
```
for check_id in current_checks:
    routing = SKILL_LOOKUP[check_id]
    if routing.edit_direct is False:
        ABORT — this iteration is misrouted.
        Re-pick via Case C (refinement skill).
        Log to BUILD-LOG: "GUARD 0.8 FAIL: about to Edit a edit_direct:false check ({check_id}). Routing to Skill('{routing.fix_skill}') instead."
        DO NOT proceed with Edit.
```

Only AFTER the gate passes:
Use the Edit tool directly. The `fix_context` from the priority_queue entry contains the exact change needed. Log to BUILD-LOG: "{check_id}: PASS (Edit tool — edit_direct fix per SKILL_LOOKUP, too small for skill invocation)".

**The orchestrator's judgment that a fix "looks small enough to edit directly" is NOT sufficient.** SKILL_LOOKUP is the authority. If you find yourself thinking "I could just sed this across 7 files faster than calling Skill('colorize')" — STOP. That is the route-around failure mode (Cardinal Rule 11.6). Call the skill.

**Case B — `prereq` is not null** (A8, A9, B3, B9, E3, F6, K2 etc) — **three-stage 21st.dev pipeline (Cardinal Rule 15):**

1. **Stage 1 — Inspiration:**
   ```
   mcp__magic__21st_magic_component_inspiration(message="{fix_context}", searchQuery="{section name + personality + 2-word descriptor}")
   ```
   Returns prose suggestions and reference component URLs. Read top 3.

2. **Stage 2 — Decide builder vs refiner (deterministic):**

   Check if the section already exists in the repo:
   ```bash
   ls "{project_path}/src/components/landing/{Section}*" 2>/dev/null
   ```
   - **No file exists** → use **builder** (new component generation):
     ```
     mcp__magic__21st_magic_component_builder(
       message="{fix_context} | inspired_by: {stage 1 top pick} | design_dna: {first 300 chars of ~/.claude/web-system-prompt.md} | tokens_only: hsl(var(--token)) no hex",
       searchQuery="{section} component {personality}",
       absolutePathToCurrentFile="{project_path}/src/components/landing/{Section}.tsx",
       absolutePathToProjectDirectory="{project_path}",
       standaloneRequestQuery="Generate {section} for {personality} landing with: {fail_proofs joined}"
     )
     ```
   - **File exists** → use **refiner** (improve existing component — the common case for web-evolve):
     ```
     mcp__magic__21st_magic_component_refiner(
       userMessage="{fix_context} | bold-execution-mandate | inspired_by: {stage 1 top pick} | design_dna: {token contract} | preserve-section-structure (CONTEXT.md locked landing structure)",
       absolutePathToRefiningFile="{project_path}/src/components/landing/{Section}.tsx",
       context="{design_context first 800 chars} | failing checks: {current_checks} | fail_proof: {fail_proofs}"
     )
     ```

3. **Stage 3 — Refinement skill polishes the output:**
   ```
   Skill('{fix_skill}', args='{fix_context} | post_21st: builder|refiner produced new component, polish it | checks: {current_checks} | fail_proof: {fail_proofs} | design_context: {first 800 chars of .evolution/design-context.md} | design_dna_tokens: hsl(var(--token)) only, no hex | bold_execution: yes')
   ```

**Special prereq cases:**
- **E3 (logo cloud)** — replace inspiration with logo_search:
  ```
  mcp__magic__logo_search(queries=["{logo1}","{logo2}",...], format="TSX", variant="GrayscaleColored")
  ```
  Then refiner on the logo cloud section.

- **A7 / D4 / D5 / F6 (hero atmosphere, scroll choreography, immersion)** — when `fix_skill = "overdrive"`, the prereq Stage 1 inspiration MAY also call `WebFetch(url=https://lottiefiles.com/featured, prompt="Find 3 trending hero animations matching {personality}. Return JSON [{name,url,download_url}].")`. Lottie animations integrate into overdrive output for scroll-driven choreography.

**Case C — standard Skill() fix:**

Use the `Skill` tool with:
- `skill`: the fix_skill name (e.g. `"typeset"`, `"clarify"`, `"animate"`)
- `args`: structured string with these mandatory markers (Cardinal Rules 12 + 13):

```
{fix_context}
 | checks: {current_checks joined with comma}
 | fail_proof: {fail_proofs joined with semicolon}
 | design_context: {first 800 chars of .evolution/design-context.md}
 | design_dna_tokens: hsl(var(--token)) only — no hex, no rgb literals, use semantic tokens (text-muted-foreground not text-gray-500)
 | bold_execution: yes — see Cardinal Rule 10
 | locked_decisions: {bullet list from CONTEXT.md section 4}
 | anti_goals: {bullet list from CONTEXT.md section 9}
```

Example: `"Hero H1 uses Inter — replace with Geist font | checks: A1, A2 | fail_proof: tailwind.config.ts fontFamily.display is 'Inter'; globals.css same | design_context: {first 800 chars of design-context.md} | design_dna_tokens: hsl tokens only | bold_execution: yes | locked_decisions: hero section position fixed; pricing tiers locked at $49/$99/$249 | anti_goals: do not add testimonial section; no AI emoji in headers"`

The refinement skills read the `checks:` and `fail_proof:` markers to enter Targeted Mode (skip impeccable, apply only what args describe).

If Skill() errors or returns "no changes" → log NEEDS_HUMAN for each check_id, increment `attempt_counts`, continue loop (skip 3.5 onwards).

**Complexity budget gate (post-Skill, pre-commit):** After the Skill returns and before commit, check the diff size:
```bash
git -C "{project_path}" diff --shortstat
```

Apply the budget:
- **≤ 200 lines changed in single file** → normal commit, no gate.
- **201-500 lines changed in single file** → log `"⚠️ Large change: {n} lines in {file}. Single-shot rebuild — high blast radius."` Continue, but flag iteration as `complexity: "high"` in BUILD-LOG.
- **> 500 lines changed in single file** → HALT NEEDS_HUMAN: `"Iteration produced {n}-line change in {file}. That's too large for a single iteration — risk of unverifiable regression. Options: (a) split into 2-3 smaller iterations targeting specific sub-elements, (b) override and continue (`/web-evolve --allow-large-change`), (c) discard this iter and replan."` Do NOT auto-commit.
- **> 100 lines changed across > 5 files** → same HALT path. Spanning too many files in one iter blocks verification.

Run #2 on Orbit Digital (2026-05-16) made a 440-line single-file rebuild of `ServicesSection.tsx` via `Skill('impeccable')` in one iteration. Worked, but the spec had no gate — pure luck. This budget surfaces blast radius before commit. **Added 2026-05-16.**

---

### Step 3.4 — Above-fold sanity check BEFORE commit (mandatory for hero/CTA-touching iters)

Before committing the change, simulate the change locally via dev-server OR run the dev build and probe with Puppeteer to verify the **primary CTA is visible above the 900px viewport** on desktop AND above the 800px viewport on mobile.

**When this step fires:** iter touches any of `HeroSection.tsx`, `CTABand.tsx`, `Navbar.tsx`, or anything that changes font sizes / heights / layout in the first viewport-worth of the page.

**Probe script (Puppeteer evaluate on dev_server_url or staged change):**
```javascript
(async () => {
  await new Promise(r => setTimeout(r, 1500)); // wait for layout settle
  const cta = document.querySelector('a[href*="get-started"], button[type="submit"], a[href*="signup"]');
  if (!cta) return JSON.stringify({ status: 'no-cta-found' });
  const r = cta.getBoundingClientRect();
  return JSON.stringify({
    status: r.bottom < 900 ? 'pass-desktop' : 'fail-desktop',
    cta_top: Math.round(r.top), cta_bottom: Math.round(r.bottom),
    viewport_h: 900,
  });
})()
```

Then probe at 390×844 (iPhone 14 Pro mobile dimensions) for mobile gate.

**Branching:**
- **PASS both desktop + mobile** → continue to Step 3.5 commit
- **FAIL desktop** → log `"CTA below fold (y={cta_bottom}/900) — forcing size-pass iteration before commit"`, do NOT commit. Re-fire `Skill('layout', args='reduce vertical-space: H1 size step down, mb-* step down, leading step down — CTA MUST be above 900px')` once. Re-probe. If still failing → log NEEDS_HUMAN and abort the iter (do not commit a hero that hides the CTA).
- **FAIL mobile but PASS desktop** → log warning + commit, but flag the iter for mobile fix in the queue.

Run #2 on Orbit Digital (2026-05-16) shipped a hero with 128px H1 that pushed the CTA below the 900px fold — caught by Puppeteer probe AFTER commit and required 2 corrective size-pass commits (9407778, c2bda00). This gate moves the check BEFORE commit so a single commit suffices.

---

### Step 3.5 — Commit

```
Agent:
  subagent_type: "web-patch"
  prompt: |
    mode: commit-only
    check_id: {current_checks joined with +}
    fix_skill: {fix_skill}
    project_path: {project_path}
    iteration_number: {iteration}
    output_path: {project_path}/.evolution/iter-{iteration}
```

Read patch JSON. If `status: "FAILED"` → no files changed, log VOID, increment `attempt_counts` for each check, continue.

---

### Step 3.6 — Deploy (conditional)

If `dev_server_url` not set:
```bash
git -C "{project_path}" push origin main
```
Then sleep 45 seconds.

If `dev_server_url` is set: skip — dev server serves changes immediately.

---

### Step 4 — Post-fix screenshot + rescore (parallel)

```
Agent 1 — web-screenshot (desktop):
  subagent_type: "web-screenshot"
  run_in_background: true
  prompt: |
    live_url: {dev_server_url if set, else live_url}
    section_name: {section}
    mode: diff
    before_path: {project_path}/.evolution/iter-{iteration}/before-{section}-desktop.png
    output_path: {project_path}/.evolution/iter-{iteration}/after-{section}-desktop.png
    scroll_to_selector: {CSS selector if known}
    viewport: desktop

(if mobile_loop) Agent 1b — web-screenshot (mobile, 390x844 iPhone 14 Pro):
  subagent_type: "web-screenshot"
  run_in_background: true
  prompt: |
    live_url: {dev_server_url if set, else live_url}
    section_name: {section}
    mode: diff
    before_path: {project_path}/.evolution/iter-{iteration}/before-{section}-mobile.png
    output_path: {project_path}/.evolution/iter-{iteration}/after-{section}-mobile.png
    scroll_to_selector: {CSS selector if known}
    viewport: mobile

Agent 2 — web-score (affected categories only):
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {dev_server_url if set, else live_url}
    output_path: {project_path}/.evolution/iter-{iteration}
    tier: category:{affected_categories}
    mode: {mode}
    output_filename: score-rescore.json
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md
```

`affected_categories` = comma-joined unique category letters from `current_checks`. Examples:
- `current_checks = ["A7"]` → `affected_categories = "A"`
- `current_checks = ["J3", "J7"]` → `affected_categories = "J"`
- `current_checks = ["I1", "I3", "I5"]` → `affected_categories = "I"`
- `current_checks = ["C4", "I3"]` → `affected_categories = "C,I"`

Wait for both/three agents. Read `diff-verdict-{section}-desktop.json`, `diff-verdict-{section}-mobile.json` (if mobile_loop), and `score-rescore.json`.

**Desktop + mobile reconciliation (when mobile_loop = true):**

| Desktop | Mobile | Combined verdict |
|---|---|---|
| VISIBLE_DIFF | VISIBLE_DIFF | VISIBLE_DIFF (both improved) |
| VISIBLE_DIFF | NULL_DELTA | **MOBILE_REGRESSION** — desktop improved but mobile unchanged. Decision: KEEP only if `--no-mobile-parity` flag set, else REVERT and add `mobile-broken-fix` to excluded_skills for this check |
| NULL_DELTA | VISIBLE_DIFF | **DESKTOP_NO_OP** — likely a mobile-only fix landed correctly. KEEP. |
| NULL_DELTA | NULL_DELTA | VOID (consistent — fix did nothing) |
| VISIBLE_DIFF | UNCERTAIN | Wait 10s, re-run mobile once. Still UNCERTAIN → trust desktop, log mobile flag |
| any | any-down (visual regression on either) | REVERT |

The combined verdict feeds into the Step 5 decision table as the single `Screenshot` value.

Merge rescore into current score: update only the checks whose category letters match `affected_categories`. Recalculate summary and final_score across ALL merged checks (re-apply full veto logic).

---

### Step 4.5 — Determine fix_type via git diff (deterministic, no judgment required)

After the fix is applied and committed (Step 3.5), run:

```bash
git -C "{project_path}" diff --name-only HEAD~1 HEAD
```

Parse the output:

```
changed_files = [list of files changed in the commit]

if ALL changed_files match *.md → fix_type = "docs-only"
elif ANY changed_file matches *.tsx|*.ts|*.css|*.js|*.jsx → fix_type = "visual" or "copy"
  then: if fix_skill in [clarify] → fix_type = "copy"
        else → fix_type = "visual"
```

This is deterministic — no judgment call. The git diff output is ground truth for what actually changed. Pass `fix_type` in the web-screenshot prompt.

**docs-only fast path:** If `fix_type == "docs-only"` → SKIP Steps 2 and 4 (no screenshots needed). Go directly to rescore.

**docs-only fast path:** If `fix_type == "docs-only"` → SKIP Steps 2 and 4 (no screenshots needed). Go directly to rescore. If checks now PASS → KEEP. If still FAIL → REVERT. No screenshot verdict needed, no NULL_DELTA risk.

---

### Step 5 — Decision

**If `fix_type == "docs-only"` → use this table (no screenshot verdict):**

| Rescore result | Decision |
|---|---|
| Checks now PASS | **KEEP** — update current_score. real_iterations++. |
| Checks still FAIL | **REVERT** — `git -C "{project_path}" revert HEAD --no-edit`. attempt_counts[check_id]++. real_iterations++. |
| Score down | **REVERT** — regression. excluded_skills. real_iterations++. |

**If `fix_type == "visual"` or `"copy"` → use the standard screenshot decision table:**

| Screenshot | Score | Decision |
|---|---|---|
| NULL_DELTA | any | **VOID** — `git -C "{project_path}" revert HEAD --no-edit`. void_count++. Do NOT increment real_iterations or attempt_counts. |
| CAPTURE_ONLY | up | **KEEP** — first iteration, no before to diff. Trust rescore only. Update current_score. real_iterations++. |
| CAPTURE_ONLY | same + checks now PASS | **KEEP** — log raw delta. real_iterations++. |
| CAPTURE_ONLY | same + checks still FAIL | **REVERT** — fix didn't resolve the check. attempt_counts[check_id]++. real_iterations++. |
| CAPTURE_ONLY | down | **REVERT** — regression. excluded_skills. attempt_counts[check_id]++. real_iterations++. |
| VISIBLE_DIFF | up | **KEEP** — update current_score. real_iterations++. Mark checks as PASS in queue. If visual_bonus[check_id] >= 1000 → increment visual_checks_flipped. |
| VISIBLE_DIFF | same + all checks now PASS | **KEEP** — log raw delta (veto cap hiding progress). real_iterations++. |
| VISIBLE_DIFF | same + checks still FAIL | **REVERT** — `git -C "{project_path}" revert HEAD --no-edit`. attempt_counts[check_id]++. real_iterations++. |
| VISIBLE_DIFF | down | **REVERT** — add fix_skill to excluded_skills[check_id]. attempt_counts[check_id]++. real_iterations++. |
| UNCERTAIN | any | Wait 10s, re-run web-screenshot once. Still UNCERTAIN → VOID. |
| NULL_DELTA (visual fix) | any | **Pixel-diff fallback before VOIDing:** Run `mcp__puppeteer__puppeteer_evaluate` with this script to count changed pixels between before and after screenshots — if changed_pixels > 500 → override NULL_DELTA to VISIBLE_DIFF and KEEP. If changed_pixels <= 500 → VOID as normal. Script: `const img1 = await fetch('{before_path}').then(r=>r.arrayBuffer()); const img2 = await fetch('{after_path}').then(r=>r.arrayBuffer()); /* compare pixel arrays, count diffs > threshold 10 */`. This catches subtle grain/opacity changes that Sonnet's vision misses but that are real pixel-level changes. Only applies when fix_type == "visual" — docs-only and copy NULL_DELTA never invoke pixel-diff. |

---

### Step 6 — BUILD-LOG entry + loop state persist

**BUILD-LOG entry** (append to `{project_path}/BUILD-LOG.md`):

```markdown
### Evolution iteration {iteration} — {timestamp} [mode: {mode}]
Page: {page}
Target check(s): {current_checks joined} — {check names}
Fix type: {edit_direct | prereq+skill | skill}
Fix skill: {fix_skill} (called in orchestrator context)
Attempt: #{attempt_counts per check}
Pre-score: {capped}/100 (raw {raw}%)
Post-score: {capped}/100 (raw {raw}%)
Delta capped: {+X / -X / 0}
Delta raw: {+X% / -X% / 0}
Screenshots: {before_path} → {after_path}
Diff verdict: {verdict} — {diff_description}
H1: {PASS — Skill('{fix_skill}') in orchestrator | PASS — Edit tool (edit_direct) | PASS — MCP prereq + Skill()}
H2: {PASS (VISIBLE_DIFF) | VOID (NULL_DELTA) | UNCERTAIN}
Decision: {KEPT | REVERTED | VOID | WONTFIX}
Commit: {sha | "(reverted)" | "(voided)"}
```

**Write loop state** using the Write tool to `{project_path}/.evolution/loop-state.json` after every iteration (including VOID):
```json
{
  "iteration": {iteration},
  "void_count": {void_count},
  "real_iterations": {real_iterations},
  "current_score": {current_score},
  "baseline_score": {baseline_score},
  "mode": "{mode}",
  "max_iterations": {max_iterations},
  "target_score": {target_score},
  "priority_queue": [{current queue with updated statuses}],
  "attempt_counts": {current},
  "excluded_skills": {current}
}
```

---

### Stop conditions

| Condition | Action |
|---|---|
| `current_score >= target_score` AND `visual_checks_flipped >= tier_visual_floor` AND `(post_run_vq - baseline_vq) >= tier_vq_delta_floor` AND `refinement_skill_invocations >= tier_refinement_floor` | Exit → Phase D |
| `current_score >= target_score` but ANY of the three visual/refinement gates above fail | Do NOT exit. Force one more iteration via `Skill('overdrive')` on the highest-visual-bonus unflipped check (or `Skill('critique', args='generate-visual-targets')` if queue empty), re-test gates after. Max 3 forced iterations before HALT NEEDS_HUMAN (`"score met but visual gates cannot be satisfied — manual decision required"`). |
| `real_iterations >= max_iterations` AND any gate unmet | Log TIMEOUT-WITH-GATE-FAILURE → Phase D BUT trajectory.json `status: "incomplete_*"` per Rule 14 Gates A/B/C |
| `real_iterations >= max_iterations` AND all gates met | Log TIMEOUT-COMPLETE → Phase D, status `completed` |
| Queue empty AND any gate unmet | Fire `Skill('critique')` to refill queue with visual targets, continue. If still empty after critique → HALT NEEDS_HUMAN |
| Queue empty AND all gates met | Log STUCK-COMPLETE → Phase D |
| Check attempted 3× | Auto-WONTFIX, continue |
| Build breaks twice | HALT → NEEDS_HUMAN |

**Tier floor table** (read by orchestrator at start of Phase C, written to loop-state.json):

| Target | `visual_checks_flipped` floor | `vq_delta` floor | `refinement_skill_invocations` floor |
|---|---|---|---|
| 90 | ≥ 1 | ≥ 0.5 | ≥ 1 |
| 95 | ≥ 2 | ≥ 0.7 | ≥ 3 |
| 98 | ≥ 4 | ≥ 1.0 | ≥ 6 |
| 100 | ≥ 6 | ≥ 1.5 | ≥ 8 |

The orchestrator MUST measure `post_run_vq` via Puppeteer screenshot + 4-axis assessment at exit-attempt — not assume "baseline was already 4.0, no change needed." See Cardinal Rule 8.

---

## Phase D — Final report + push

1. Spawn 4 parallel web-score agents (same category split as Phase B) against current state → merge into `.evolution/scores/final-score.json`
2. Spawn web-screenshot for full-page desktop + mobile → `.evolution/final/`
3. Write `EVOLUTION-LOG.md`:
   - Baseline → Final score + category delta table
   - Per-section before/after screenshot pairs
   - Full iteration log from BUILD-LOG entries
   - PageSpeed delta (LCP / INP / CLS baseline → final)
   - a11y delta (violation count baseline → final, if --premium)
   - SEO delta (if target ≥ 95)
   - /critique scored dimensions (if target ≥ 95)
4. Commit + push to **evolve branch first** (never directly to main):
   ```bash
   # CRITICAL: never push directly to main from Phase D.
   # All evolve-branch changes go to remote, get a Vercel preview URL,
   # get visually verified, THEN merged to main.
   git -C "{project_path}" add EVOLUTION-LOG.md BUILD-LOG.md
   git -C "{project_path}" commit -m "evolve: {page} final — score {baseline} → {final}"
   git -C "{project_path}" push -u origin {evolve_branch}
   ```

5. **Resolve Vercel preview URL for the evolve branch:**
   ```bash
   # Wait for Vercel webhook to fire (usually 5s)
   sleep 5
   # Query GitHub deployments API for the latest deploy on the evolve branch
   gh api "repos/{org}/{repo}/deployments?sha=$(git rev-parse HEAD)&per_page=1" \
     --jq '.[0].statuses_url' | xargs -I {} gh api {} --jq '.[0].target_url'
   # Returns the preview deployment URL (e.g. https://{slug}-git-{branch}-{team}.vercel.app)
   ```

   If preview URL not available within 90s → log NEEDS_HUMAN: `"Vercel preview URL not resolved within 90s. Check Vercel dashboard for build failure, then re-run /web-evolve to retry."`

6. **Poll preview URL until deploy completes** (HTTP 200 + new content marker present):
   ```bash
   PREVIEW_URL="<from step 5>"
   # Use a marker unique to this run — e.g. a new check/visual you know just landed
   MARKER="<unique-string-from-the-iter-2-or-later-change>"
   until curl -fsS "$PREVIEW_URL" 2>/dev/null | grep -q "$MARKER"; do sleep 5; done
   ```

7. **Visual-verify on preview URL with Puppeteer + critique (THE preview-deploy-verify gate):**
   - Puppeteer navigate to preview URL
   - Screenshot at 1440×900 desktop + 390×844 mobile
   - `Skill('critique', args='compare preview vs Phase A baseline | screenshots: [{baseline}, {preview-desktop}, {preview-mobile}] | scored | dimensions: hero-impact, hierarchy, distinctiveness, product-visibility')` — same critique invocation as Cardinal Rule 8 VQ measurement
   - If critique's delta ≥ tier_vq_delta_floor → proceed to step 8
   - If critique's delta < floor → trajectory.json status `vq_delta_below_floor_at_preview`, HALT NEEDS_HUMAN: `"Preview deployed but visual delta below floor ({delta} < {required}). Inspect preview URL: {PREVIEW_URL}. Decide: (a) merge anyway (override), (b) discard branch, (c) run more iterations."`

8. **Fast-forward merge evolve → main + push to main** (only AFTER preview verify):
   ```bash
   git -C "{project_path}" checkout main
   git -C "{project_path}" merge --ff-only {evolve_branch}
   git -C "{project_path}" push origin main
   ```

9. Wait 45s for Vercel production rebuild (main triggers prod alias auto-deploy).

10. **Production verify** (final sanity check on live URL):
    ```bash
    until curl -fsS "{live_url}" 2>/dev/null | grep -q "$MARKER"; do sleep 5; done
    ```
    If marker doesn't appear within 120s on prod → HALT NEEDS_HUMAN: `"Prod deploy didn't propagate marker '{MARKER}' within 120s. Vercel/CDN may need cache invalidation. Check {live_url} manually."`

**Why this flow:** Run #2 on Orbit Digital (2026-05-16) shipped a broken hero (everything opacity:0 at landing) directly to prod via `git push origin main` from Phase D — discovered only via Puppeteer probe AFTER prod was already broken. The preview-deploy-verify gate moves the visual check BEFORE main, so prod never sees a regression that hadn't been verified on a preview URL first. **Added 2026-05-16.**

---

## Phase E — Post-deploy verification (puppeteer-driven, not curl)

**Step E.1 — Status code:**
```bash
curl -s -o /dev/null -w "%{http_code}" "{live_url}"
```
HALT if not 200.

**Step E.2 — Hydration + font + console error sweep (puppeteer):**
```
mcp__puppeteer__puppeteer_navigate(url={live_url})
mcp__puppeteer__puppeteer_evaluate(script=`
  const result = {
    title: document.title,
    h1_text: document.querySelector('h1')?.textContent || null,
    has_react_root: !!document.querySelector('#__next, #root, [data-reactroot]'),
    hydration_complete: !document.querySelector('[data-react-loading]'),
    fonts_loaded: document.fonts.ready.then(() => Array.from(document.fonts).map(f => ({family: f.family, status: f.status}))),
    failed_requests: performance.getEntriesByType('resource').filter(r => r.responseStatus >= 400).map(r => r.name),
    css_var_root_color: getComputedStyle(document.documentElement).getPropertyValue('--background'),
    section_count: document.querySelectorAll('section').length,
    images_with_alt: Array.from(document.querySelectorAll('img')).map(i => ({src: i.src, alt: i.alt, loaded: i.complete && i.naturalHeight !== 0}))
  };
  return JSON.stringify(result);
`)
```

Parse the result. HALT NEEDS_HUMAN if any:
- `h1_text` does NOT contain the expected hero text from CONTEXT.md (deploy is showing stale content)
- `has_react_root` is false
- `fonts_loaded` includes any font with `status: 'error'` or `status: 'unloaded'`
- `failed_requests` is non-empty
- `css_var_root_color` is empty string (token system not loaded)
- `section_count` differs from local-build expected count by >1
- Any image has `loaded: false`

**Step E.3 — Console error capture:**
```
mcp__puppeteer__puppeteer_evaluate(script=`
  // Capture console errors that occurred since navigation
  return JSON.stringify(window.__pp_console_errors || []);
`)
```
If non-empty → log to EVOLUTION-LOG.md and flag as deploy_warning (do not HALT — sometimes 3rd-party scripts log harmlessly).

**Step E.4 — Re-run perf trace on the deployed URL:**
- World-class: `mcp__chrome-devtools__performance_start_trace` on live_url, compare to Phase B `.evolution/perf-trace.json`
- Standard: WebFetch PageSpeed on live_url, compare to `.evolution/pagespeed.json`

If LCP regressed >500ms or INP regressed >50ms or CLS regressed >0.05 → flag deploy_regression in EVOLUTION-LOG.md.

**Step E.4b — Vercel Speed Insights RUM (if project deploys to Vercel AND `@vercel/speed-insights` is installed):**

Real-user monitoring data is the ultimate truth — synthetic Lighthouse can't catch what users actually experience. Read the deployed RUM data:
```
WebFetch(
  url=`https://vercel.com/api/web-vitals/{project_id}?since=24h`,
  prompt="Extract p75 LCP, INP, CLS, FCP, TTFB across all real visitors in the last 24h. Compare to synthetic targets (LCP < 2.0s, INP < 150ms, CLS < 0.05). Return JSON."
)
```
Note: requires Vercel API token in env. If unavailable, log "Vercel Speed Insights RUM skipped (no token)" — do not HALT.

If p75 RUM values regress vs Phase E.4 synthetic by >30% on any metric → flag rum_real_world_regression in EVOLUTION-LOG.md. This is the strongest possible signal — synthetic looked fine but real users are suffering.

**Step E.5 — Final rescore (tier A+G):**
Spawn web-score (tier: category:A,G) against `live_url` — the two most likely categories to have deploy-specific regressions (fonts not loading, real-world CWV values). Append result to EVOLUTION-LOG.md.

---

## Phase F — Self-audit retrospective (MANDATORY — Cardinal Rule 14)

The loop never exits without Phase F. This is how `/web-evolve` improves itself between runs. Output: `.evolution/retro.md` + a separate commit `evolve-retro: {date}` to a `retro/` folder.

**Step F.1 — Read run data:**
- `.evolution/loop-state.json` (final state)
- `BUILD-LOG.md` (all iteration entries this session)
- `.evolution/scores/score.json` + `.evolution/scores/final-score.json`
- `.evolution/{a11y,seo,critique,pagespeed}.json` (if target ≥ 95)

**Step F.1.5 — Phase R signature delivery checklist (target ≥ 98 only — Cardinal Rule 17 + Gate F):**

Read `DESIGN-BRIEF.md` `## World-Class Anchor` section → extract `hero_signature` (A, B, or C). Then verify the signature was ACTUALLY delivered, not just that a skill was invoked claiming to deliver it. This is the gate that Run #2 on Orbit Digital (2026-05-16) bypassed — it declared "B+A+C combined" and delivered B-only at ~40%, calling it done.

**Signature A (WebGL/3D via R3F):**
```bash
# All MUST be true:
grep -rE "from ['\"]@react-three/fiber['\"]" "{project_path}/src/" | grep -q "Canvas"  # <Canvas> imported
grep -rE "<Canvas[^>]*>" "{project_path}/src/components/" | head -1  # <Canvas> rendered
grep -rE "@react-three/(drei|postprocessing)" "{project_path}/src/" | head -1  # supporting libs used
# Bundle check: a R3F bundle chunk ≥ 80KB exists (lazy-loaded)
find "{project_path}/.next/static/chunks/" -name "*.js" -size +80k | xargs grep -l "react-three" | head -1
```
If any fail → Gate F status `signature_a_undelivered`, retro lists missing pieces.

**Signature B (GSAP ScrollTrigger pinned narrative, 2-4 viewports):**
```bash
# All MUST be true:
grep -rE "ScrollTrigger\.create\|gsap\.timeline\(.*scrollTrigger" "{project_path}/src/" | grep -q "pin: *true"  # pin: true used
grep -rE "end: ['\"]?\+=([0-9]+)" "{project_path}/src/" | grep -qE "\+=(15[0-9]|[2-3][0-9][0-9])"  # ≥ 150% extra viewport
grep -rE "SplitText" "{project_path}/src/components/" | head -1  # SplitText used for typography reveal
# Scroll-DRIVEN, not mount-driven (timeline must bind to ScrollTrigger.scrub, not gsap.timeline().play())
grep -rE "scrub:" "{project_path}/src/" | grep -qE "scrub: *(true|1)"
```
If any fail → Gate F status `signature_b_undelivered`.

**Signature C (Kinetic typography with variable-axis animation on scroll):**
```bash
# All MUST be true:
grep -rE "font-variation-settings" "{project_path}/src/" | head -1  # font-variation CSS used
grep -rE "useScroll\|scrollYProgress\|ScrollTrigger" "{project_path}/src/components/.*HeroSection" | head -1  # scroll-driven
grep -rE "wght|wdth|opsz|GRAD|YOPQ" "{project_path}/src/" | head -1  # variable axis named in code (wght/wdth/opsz/etc)
# Variable font installed
grep -rE "variable=true|--font-.*-variable|@font-face.*variation-settings" "{project_path}/src/app/" | head -1
```
If any fail → Gate F status `signature_c_undelivered`.

**Combined signature (Cardinal Rule 17 — user-overrode_singularity = true):** verify ALL applicable signature gates above. Combined doesn't lower the bar — it raises it (must deliver all 2-3 picks). If user-overrode happened, the orchestrator MUST surface in retro: "User declared combined signature. Verified pieces: A={pass/fail}, B={pass/fail}, C={pass/fail}. Anything `fail` = signature_combined_partial_delivery."

**Add Gate F to Cardinal Rule 14 evaluation:**
- Gate F — `signature_delivered` (target ≥ 98 only):
  - signature A → R3F Canvas in DOM + bundle chunk present
  - signature B → ScrollTrigger pin + scrub + ≥150% viewport + SplitText
  - signature C → font-variation-settings + scroll-driven + variable font registered
  - If false → status `signature_{a|b|c}_undelivered`

**Step F.2 — Compute per-skill efficacy table:**

For each fix_skill that was invoked this run:
```
{
  "typeset":   { "calls": 7, "keeps": 4, "reverts": 2, "voids": 1, "keep_rate": 0.57, "avg_delta_score": +0.6 },
  "overdrive": { "calls": 3, "keeps": 3, "reverts": 0, "voids": 0, "keep_rate": 1.00, "avg_delta_score": +4.2 },
  ...
}
```

Flag any skill with `keep_rate < 0.5` AND `calls >= 3` → recommend routing edit.

**Step F.3 — Propose `fix-routing.md` edits:**

For each flagged skill:
- If a `secondary` was set and outperformed primary → recommend swapping primary↔secondary in SKILL_LOOKUP
- If no secondary set → propose one based on which skill produced the cleanest unrelated improvements

Output as a unified diff in retro.md that the user can apply with `git apply` if they agree.

**Step F.4 — Propose `SKILL.md` (this file) edits:**

Catalog this run's friction:
- Steps that produced GUARD FAIL — what condition? Tighten the guard.
- Iterations that needed UNCERTAIN → 10s retry — was the selector wrong? Was the scroll position off? Recommend selector-map improvement.
- VOID rate above 30% — what was the common cause? (skill choice, selector, scope mismatch)
- Cardinal rule violations — any iteration where a rule was bent? Strengthen the wording.

Output as a "Recommended SKILL.md edits" section in retro.md.

**Step F.5 — Diff against `/premium-website` contract:**

Read `~/.claude/skills/premium-website/SKILL.md` and `~/.claude/skills/premium-website/references/*.md`. Compare against what this run actually did. Flag drift:
- Any premium-website rule not enforced here?
- Any premium-website cardinal not in this skill's Cardinal Rules?
- Any premium-website MCP/Skill the suite uses that web-evolve skipped this run?

Output as a "Contract Drift" table in retro.md.

**Step F.6 — Update Trend Pulse / fix-routing if user approves:**

After writing retro.md, surface the top-3 recommended edits to the user:
> "Self-audit complete. 3 recommended edits to web-evolve config:
>  1. fix-routing.md: swap A7 primary/secondary (overdrive keep_rate 1.00 > impeccable 0.40)
>  2. SKILL.md: tighten Step 4.5 fix_type detection (3 mis-classifications this run)
>  3. fix-routing.md: add `delight` as secondary for D5 (animate REVERTed twice on hero)
>  Apply now? (yes/no/edit)"

If yes — apply via Edit tool, commit `evolve-retro: route updates from {date}`. If no — retro.md still exists for future review.

**Step F.7 — Update trajectory.json with this run's completion + EVALUATE HARD GATES (Cardinal Rule 14):**

Before writing the run entry, compute `status` by evaluating the three hard gates in order. The status is NOT "completed" if any gate fails:

```
# Gate A — route-around detection (Cardinal Rule 14 Gate A)
if refinement_skill_invocations_count == 0 AND target_score >= 90:
    status = "route_around_detected"
    severity = "CRITICAL"

# Gate B — visual quality delta floor (Cardinal Rule 14 Gate B + Rule 8)
elif (post_run_vq - baseline_vq) < tier_vq_delta_floor:
    status = "vq_delta_below_floor"
    severity = "HIGH"

# Gate C — refinement-skill floor (Cardinal Rule 14 Gate C + Rule 11.7)
elif refinement_skill_invocations_count < tier_refinement_floor:
    status = "incomplete_refinement_floor"
    severity = "HIGH"

# All gates passed
else:
    status = "completed"
    severity = "OK"
```

Then write the run entry:

```json
{
  "id": N,
  "started_at": "...",
  "completed_at": "{now}",
  "status": "{computed above — completed | route_around_detected | vq_delta_below_floor | incomplete_refinement_floor}",
  "gate_a_route_around": {"failed": bool, "refinement_skill_invocations_count": N, "iterations_via_edit_direct_only": [list of check_ids]},
  "gate_b_vq_delta": {"failed": bool, "baseline_vq": x, "post_run_vq": y, "delta": z, "required": w},
  "gate_c_refinement_floor": {"failed": bool, "count": N, "required": M, "tier_min": K},
  "target_score": ...,
  "tier": "...",
  "mode": "...",
  "baseline_score": ...,
  "final_score": ...,
  "real_iterations": ...,
  "void_count": ...,
  "visual_quality_baseline": ...,
  "visual_quality_final": ...,
  "refinement_skill_invocations_count": ...,
  "refinement_skills_used": ["overdrive", "typeset", ...],
  "awwwards": {"design": ..., "usability": ..., "creativity": ..., "content": ..., "avg": ...},
  "perf_trace": {"lcp_ms": ..., "inp_ms": ..., "cls": ..., "lighthouse_perf": ...},
  "uncompleted_wc_checks": [...],
  "next_run_recommendations": [
    "Top 3 fixes the loop ran out of iterations on, ordered by visual_bonus",
    "Any check stuck at WONTFIX that the user might want to revisit",
    "Any NEEDS_HUMAN that was never resolved"
  ],
  "phase_f_retro_path": ".evolution/retro.md",
  "skill_efficacy": { "typeset": {"keeps": 4, "reverts": 1, ...}, ... }
}
```

**If any gate failed, the Phase F.9 user-facing summary MUST lead with the failure (see Rule 14):**

```
⚠️ ROUTE-AROUND DETECTED — Run #{N} did not invoke any refinement skill.
   Score moved {baseline} → {final} via edit_direct on checks the SKILL_LOOKUP
   says require refinement skills: {list}.
   Visual quality moved {baseline_vq} → {post_run_vq} (delta {x}, required {y}).
   This run does NOT count as a tier-advance. Re-run required.

   Refinement skills that should have fired:
   - Skill('typeset')  on A1 (font swap requires typography judgment, not edit)
   - Skill('layout')   on E10 (footer restructure)
   - Skill('clarify')  on J2 (copy quality)
   - Skill('colorize') on C4 (token migration)
   - Skill('animate')  on D1 (motion adoption)

   Run them now? (yes / pick subset / no)
```

The next `/web-evolve` invocation reads `trajectory.runs[-1].status` — if it is anything other than `"completed"`, it MUST NOT advance the target tier. It re-runs at the SAME target with `mode: "advance"` carrying the failed-gates as `focus_list`.

If this run set `world_class_anchor` (Phase R) or installed motion stack (Phase G), update those fields at the trajectory root level (not under any specific run — they are cross-run invariants).

Clear `current_run_state` (set to null).

Write trajectory.json back to disk.

**Step F.8 — Commit trajectory + retro:**
```bash
git -C "{project_path}" add .evolution/retro.md .evolution/trajectory.json
git -C "{project_path}" commit -m "evolve-retro: Run #{N} {baseline}→{final} ({tier}) — trajectory updated"
git -C "{project_path}" push origin {evolve_branch_or_main}
```

**Step F.9 — Final echo to user:**

```
✓ web-evolve Run #{N} complete.

  Baseline:  {baseline}/100 ({baseline_tier})
  Final:     {final}/100 ({final_tier})
  Delta:     +{delta} ({iterations} iterations, {void_count} VOIDs)

Awwwards-equivalent score: {design}D / {usability}U / {creativity}Cr / {content}Co = {avg}/10 avg
Perf: LCP {lcp}ms · INP {inp}ms · CLS {cls} · Lighthouse {lh}/100

Next-run recommendations:
  1. {rec 1}
  2. {rec 2}
  3. {rec 3}

To advance to the next tier, run /web-evolve again (here or in a new chat).
The skill will read trajectory.json and push toward {next_target}/100.
```

This is the explicit invitation for the user to re-invoke. The trajectory.json now has everything the next run needs.

---

## Hard stops — this skill MUST NOT

- Run grep/Read/Bash for auditing — always via web-score
- Edit source files directly — Skill() does that, web-patch commits it
- Call `Skill('mcp__...')` — MCP tools are called directly, not via Skill wrapper
- Self-grade vision checks — always NEEDS_HUMAN
- Skip BUILD-LOG entry for any iteration (including VOID)
- Count VOID toward max_iterations
- **Skip `Skill('impeccable', args='teach')` in Phase A** — every refinement skill needs design context to avoid generic output (Cardinal Rule 12)
- **Call refinement Skills without `design_context:` and `design_dna_tokens:` markers** — those markers are how the skills enter targeted mode (Cardinal Rule 13)
- **Use inspiration MCP without the builder/refiner follow-up** — three-stage pipeline is mandatory (Cardinal Rule 15)
- **Exit without Phase F retro** — the loop must self-audit (Cardinal Rule 14)
- **Touch `main` directly when `branch_isolation = true`** — Phase A creates `evolve/{date}`, Phase D pushes there, user merges to main
