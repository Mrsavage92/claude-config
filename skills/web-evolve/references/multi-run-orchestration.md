# Multi-Run Orchestration — auto-decide + repeat

`/web-evolve` runs without flags. The skill examines the site + history and picks the right target tier itself. Re-invocation (in the same chat, a new chat, or even days later) reads disk state and advances the trajectory.

This file is the contract for that decision logic.

---

## Decision tree (Phase A.0 — runs before anything else)

```
INPUTS available at decision time:
  - project_path (cwd by default, or arg)
  - live_url (from BUILD-LOG.md or argument)
  - .evolution/trajectory.json (if exists) — every prior run logged
  - .evolution/loop-state.json (if exists) — interrupted run mid-flight
  - visual_quality_score (computed by puppeteer screenshot assessment, 1-5)
  - chrome-devtools-mcp connected? (probe attempt)
  - Vercel project? (presence of vercel.json or .vercel/)
  - CLAUDE.md flags: client_work=true? revenue_critical=true? target_audience=stated?
  - User prompt contains: "repeat", "again", "continue", "keep going", "level up", "next"? → repeat_signal=true
  - Time since last run: now - trajectory.runs[-1].completed_at

OUTPUT:
  - target_score: 90 | 95 | 98 | 100
  - mode: "fresh" | "resume" | "advance"
  - phases_to_run: [R?, G?, 0, A, B, C, D, E, F]
  - max_iterations: derived from gap between baseline and target
  - reasoning: human-readable explanation for the user
```

### Branch 1 — Interrupted run mid-flight

If `loop-state.json` exists AND `loop-state.real_iterations < max_iterations` AND `final-score.json` does NOT exist for this run id:
- `mode = "resume"`
- Skip Phase R, G, 0, A, B — they ran last time
- Restore loop state, continue Phase C from `iteration + 1`
- Reasoning: "Resuming interrupted run #{N} at iteration {it}, score {s}. Continuing toward target {t}."

**Auto-resume — do NOT ask the user.** The skill takes the conservative continuation. If the user wanted to start fresh they would have deleted `.evolution/` or explicitly passed `--fresh`.

### Branch 2 — Repeat/advance (trajectory exists, last run completed)

If `trajectory.json` exists AND `trajectory.runs[-1].status == "completed"`:
- This is a follow-up run.
- `mode = "advance"`
- New `target_score`:
  - Last final ≥ 99 → target = 100 (hold + polish — likely already at ceiling)
  - Last final ≥ 95 → target = 100 (push to SOTM)
  - Last final ≥ 90 → target = 98 (push to world-class)
  - Last final ≥ 80 → target = 95 (push to premium)
  - Else → target = `min(95, last_final + 8)` (keep climbing 8 points at a time)
- **Skip Phase R if completed in any prior run** (references locked in DESIGN-BRIEF.md)
- **Skip Phase G if motion stack already installed** (check `package.json` for lenis + gsap)
- Phase A still runs (re-read CONTEXT.md — may have changed)
- Phase B always runs (rescore — site may have drifted since last run via other commits)
- Priority queue weighted toward: (a) uncompleted WC checks from prior trajectory, (b) checks marked NEEDS_HUMAN that the user might now want to re-decide on, (c) new failures since last run.
- Reasoning: "Run #{N+1}. Last run finished at {last_final}/100 ({last_tier}). Advancing to target {new_target} ({new_tier}). Focus: {top 3 uncompleted WC checks or new failures}."

### Branch 3 — First run (no trajectory)

If `.evolution/` is empty or missing:
- `mode = "fresh"`
- Determine target from `visual_quality_score` (puppeteer-assessed 1–5) + project signals:

| visual_q | Client work? | Revenue critical? | → target | Tier |
|---|---|---|---|---|
| < 2.0 | any | any | 90 | Premium SaaS (climb the floor first) |
| 2.0–2.99 | any | any | 95 | Stripe/Linear quality |
| 3.0–3.99 | yes OR | yes OR | 98 | Awwwards SOTD candidate |
| 3.0–3.99 | no | no | 95 | Stripe/Linear (no need to overreach personal projects) |
| ≥ 4.0 | any | any | 98 | SOTD (already good, push to world-class) |
| ≥ 4.5 + custom hero detected | yes | yes | 100 | SOTM (already exceptional, attempt the ceiling) |

- Phase R runs if target ≥ 98
- Phase G runs if target ≥ 98 AND motion stack not yet installed
- Reasoning: "First run. Visual quality {v}/5, {signals}. Targeting {target}/100 ({tier}). Estimated {iters} iterations."

### Branch 4 — User explicit override

If user passes `--target=N` OR mentions a specific tier in the prompt ("make this SOTM-quality"):
- Use exactly that target. Skip auto-decide.
- All phase gating still applies (Phase R/G run if target ≥ 98).
- Reasoning: "User-specified target {target}/100."

---

## Trajectory file schema (`.evolution/trajectory.json`)

Single source of truth across runs. Written at the end of Phase F every run.

```json
{
  "project_path": "C:/Users/Adam/audit-genius",
  "live_url": "https://audithq.app",
  "personality": "Data Intelligence",
  "world_class_anchor": {
    "hero_signature": "scroll-narrative",
    "primary_references": ["linear.app", "vercel.com"],
    "decided_at_run": 1
  },
  "motion_stack": {
    "lenis": "1.1.0",
    "gsap": "3.13.0",
    "r3f": null,
    "rive": null,
    "geist": "1.3.0",
    "installed_at_run": 1
  },
  "runs": [
    {
      "id": 1,
      "started_at": "2026-05-16T09:00:00Z",
      "completed_at": "2026-05-16T11:34:00Z",
      "status": "completed",
      "target_score": 95,
      "tier": "premium-saas",
      "baseline_score": 47,
      "final_score": 88,
      "real_iterations": 12,
      "void_count": 3,
      "visual_quality_baseline": 2.5,
      "visual_quality_final": 4.0,
      "awwwards": {
        "design": 8.2,
        "usability": 7.6,
        "creativity": 6.8,
        "content": 7.5,
        "avg": 7.78
      },
      "perf_trace": {
        "lcp_ms": 1850,
        "inp_ms": 110,
        "cls": 0.04,
        "lighthouse_perf": 92
      },
      "uncompleted_wc_checks": ["WC1", "WC4", "WC8"],
      "next_run_recommendations": [
        "Hero signature still pending — WC1 fails. Phase R reference committed but not implemented. Run #2 should start with Skill('overdrive') on hero.",
        "Custom cursor not added — WC4. Quick win for Run #2.",
        "Real product UI in hero — WC8. Currently gradient blob. Highest visual-bonus win available."
      ]
    },
    {
      "id": 2,
      "started_at": "2026-05-17T14:20:00Z",
      "completed_at": "2026-05-17T16:45:00Z",
      "status": "completed",
      "target_score": 98,
      "tier": "awwwards-sotd",
      "baseline_score": 88,
      "final_score": 94,
      ...
    }
  ],
  "current_run_state": {
    "id": 3,
    "status": "in_progress",
    "started_at": "2026-05-18T..."
  }
}
```

**Status values:** `in_progress` | `completed` | `halted_needs_human` | `interrupted`

**Cross-run invariants** (set once, never overwritten):
- `world_class_anchor` — once committed in Run #1, locked. Future runs implement against it.
- `motion_stack.installed_at_run` — once Phase G runs, never re-runs in subsequent runs (only adds missing libraries).

---

## Repeat signal detection

The user does not need to say "repeat" — but if they do, behaviour is identical to running `/web-evolve` again with no args. Phrases that map to "advance":

`repeat` · `again` · `continue` · `keep going` · `next` · `level up` · `push further` · `more` · `another pass` · `iterate again` · `round 2` · `next round` · `do another` · `go again`

These trigger Branch 2 (advance) even if the user is in the SAME chat as the last run. The skill checks `trajectory.runs[-1].status` — if `completed`, it advances.

In a NEW chat with no memory of the prior run, just running `/web-evolve` in the same project dir is enough — trajectory.json on disk is the memory.

---

## What "advance" looks like vs "fresh"

| Behavior | Fresh (Run 1) | Advance (Run N+1) |
|---|---|---|
| Phase R (research) | Runs if target ≥ 98 | Skipped — anchor locked in trajectory |
| Phase G (motion stack install) | Runs if target ≥ 98 | Skipped if stack present; adds only missing libs |
| Phase 0 (CONTEXT.md) | Reads, regenerates if stale | Reads, regenerates if stale OR commits since last run |
| Phase A (setup) | Full | Full but reads trajectory.json |
| Phase A.8.5 (impeccable teach) | Always runs | Skipped if `.evolution/design-context.md` ≤30 days |
| Phase B (baseline audit) | Full Tier 2 across all 79 checks | Full Tier 2 — site may have drifted via other commits |
| Phase B priority queue weighting | Standard | Boosted: uncompleted WC checks from last trajectory + NEEDS_HUMAN revisits get +500 priority |
| Phase C iteration cap | 8 (greenfield) / 20 (backfill) | `last_iterations × 0.7` — diminishing returns expected |
| Phase D (final commit) | Commits to `evolve/{date}` branch | Commits to same `evolve/{date}` branch if same day, else new branch |
| Phase E (deploy verification) | Full puppeteer + perf + RUM | Full |
| Phase F (retro) | Writes trajectory.runs[N] | Appends trajectory.runs[N+1] |

---

## When NOT to auto-advance

The skill HALTs with NEEDS_HUMAN if:
- `trajectory.runs[-1].status == "halted_needs_human"` AND the original blocker is unresolved
- Last run's `final_score < baseline_score` (regression — investigate before another run)
- 5+ runs in a 24h window (cooldown — likely unproductive thrashing)
- `world_class_anchor.hero_signature` exists but the hero file shows no implementation after 2 advance runs (skill is stuck — the anchor commitment isn't translating to code; user needs to step in)

In these cases, surface the trajectory summary and ask: "Last run halted at {reason}. Resolve and re-run, or change direction?"

---

## Output format on every run

Before Phase B starts, echo to user (one short block):

```
web-evolve — Run #{N} ({mode})

{Reasoning sentence — see decision tree branch}

Target: {target}/100 ({tier})
Baseline visual quality: {v}/5
Phases this run: {R? G? 0 A B C D E F}
Estimated iterations: {iters}
Focus this run: {top 3 priorities}

Continuing automatically. To stop, interrupt the command.
```

No yes/no prompt. The skill commits to the plan and runs. If the user wants different, they interrupt and edit trajectory.json or pass an override flag.
