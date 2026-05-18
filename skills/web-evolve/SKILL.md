---
name: web-evolve
description: Auto-decided, score-driven continuous improvement loop for existing websites. Invoke with `/web-evolve` — no flags. Re-invoke to advance one tier. Audits every public route, routes REBUILD verdicts through web-page, routes refinement through design skills, verifies visible delta per iter via Skill('critique'), deploys to evolve branch, merges to main only after preview-verify.
---

# /web-evolve

Continuous improvement loop. Every gate is a bash script returning an exit code; the loop reads the exit code, not LLM prose. The orchestrator does not write files that audit agents read. The retro is authored by a separate agent. Each cardinal rule has a script in `references/` that enforces it without depending on orchestrator self-discipline.

This is a structural rebuild after a Phase 2 forge score of 8/100 (see `.forge-score.md`). The 9 failure modes the rebuild closes are documented in `.forge-spec.md`. External patterns sourced from 8 implementations are in `.forge-sources.md` (Anthropic cookbook, Aider, cover-agent, OpenAI evals, DSPy, LangGraph, Anthropic multi-agent research).

---

## Cardinal rules (mechanical — each maps to a script in references/)

1. **Verdict-as-token gate.** `Skill('critique')` is called with `output_format: tokens`. The agent must return one of `{PASS, FAIL_REBUILD, FAIL_REFINE, FAIL_VOID}`. The orchestrator passes the response through `references/parse-verdict.sh`. Anything outside that set → `__invalid__` → HALT. # source: openai/evals + cookbook/evaluator_optimizer
2. **Capability-stripped producer.** All writes to `.evolution/*` go through bash scripts (`append-retro.sh`, `enumerate-routes.sh`, `iter-step.sh`, etc.) using `python3 … > tmp && mv tmp file` redirects — not the `Edit`/`Write` tools. The existing `web-evolve-guard.ps1` hook is iter-aware: it inspects `loop-state.json.current_checks` and blocks `Edit`/`Write` on source files routed via `fix-routing.md` with `edit_direct: false`. A `WriterAgent` subagent invocation handles file writes the orchestrator cannot directly perform (TasteFetcher writes taste-rules.md, RetroAgent's output is appended via `append-retro.sh`). The role separation is enforced by the script contracts, not by a settings.json deny rule (the harness has no per-role permission concept). # source: aider ArchitectCoder (capability separation via different tool paths)
3. **Ground-truth reward.** Every gate is a bash function in `references/gate-checks.sh` returning exit code. The loop reads `$?`. LLM prose ("the page improved") never reaches the gate. # source: cover-agent + dspy.Refine
4. **Cache integrity.** Every file in `.evolution/` that downstream agents read has a sha256 in `.evolution/.hashes.json` recorded by the agent that wrote it. Phase 0.5 + every phase entry re-verifies hashes. Orchestrator-modified file → HALT. # source: aider's separate-role architecture
5. **Live-HTML verification.** Each entry in `page-baselines.json` is asserted via `references/verify-live-html.sh <route>` before Phase R reads it. Hashes the live H1, primary CTA, visible pricing strings; compares against the agent's claim. Mismatch → entry dropped, route re-audited. # source: cover-agent rollback-on-mismatch
6. **Independent retro.** Phase F is `Agent(subagent_type=general-purpose)` — `RetroAgent` — with read-only access to `.evolution/*.json`, `git log`, `~/.claude/tool-use.log`. It writes `trajectory.runs[N]`. Orchestrator commits the file but does not modify content. # source: Anthropic multi-agent CitationAgent
7. **Session-scoped ask counter.** Counter lives at `~/.claude/state/web-evolve-asks-<session-id>.json`. Hook reads it. 2nd ask in a session is blocked regardless of phase. # source: langgraph state-graph pattern
8. **Constrained status vocab.** Status field is regex-validated against `{PASS, halted_before_phase_c, halted_at_iter_N, deviation_cap_exceeded, taste_pre_flight_failed}`. No free-form status. No "honest halt" string. # source: openai/evals choice_strings
9. **Loop exit is Python, not prose.** `references/loop-condition.sh` is the only loop predicate. Orchestrator "I think we should halt" has no path to ending the loop. # source: langgraph should_continue

The previous version's 8 principles + Phase 0.4 cross-run check are archived in `references/decisions.md`. They are not deleted — they are demoted from "load-bearing" to "documentation," because principles that depend on orchestrator self-discipline failed across Runs #1–#5.

---

## Phase 0 — Boot gates (HALT-gated, runs before everything)

```bash
bash references/boot-gates.sh
```

Returns exit 0 only if ALL pass:
- `wc -l SKILL.md` ≤ 500 (current bloat guard)
- `bash references/smoke-test.sh` returns exit 2 (hook actually blocks a violation attempt)
- `~/.claude/state/web-evolve-asks-<session-id>.json` exists or is created with `count: 0`
- `Skill('taste-skill')` available (dry-run probe)
- Settings.json has the `.evolution/*` deny rule active for the orchestrator role
- `references/.hashes.json` matches sha256 of every `references/*.sh` (no orchestrator tampering)

Any failure → HALT with the failing gate name. No soft-degrade. The exit code is the gate.

---

## Phase 0.5 — Taste cache via TasteFetcher (hash-verified)

The orchestrator cannot write `.evolution/taste-rules.md`. Instead:

```
Agent(subagent_type=general-purpose, prompt="
  TasteFetcher role. Capability: Write to .evolution/taste-rules.md ONLY.
  Invoke Skill('taste-skill', args='mode: load-for-web-evolve | output_path: .evolution/taste-rules.md').
  After write, compute sha256 of taste-rules.md and append to .evolution/.hashes.json as {file: 'taste-rules.md', sha256: '<hash>', written_by: 'TasteFetcher', skill_tool_use_id: '<id>'}.
  Return only the sha256 string. No prose.
")
```

Orchestrator parses the returned sha256, reads `.evolution/.hashes.json`, asserts they match. Mismatch → HALT.

Subsequent phases pass `taste_rules_hash: <sha256>` in every Skill('critique') call. The critique agent re-hashes the file at read time and exits invalid if it doesn't match — proving the orchestrator hasn't injected prose into the cache between TasteFetcher writing it and the critique reading it.

---

## Phase A — Audit (route enumeration + parallel critique)

### A.1 — Enumerate routes

```bash
bash references/enumerate-routes.sh
```

Crawls sitemap.xml / app/sitemap.ts / homepage `<a href>`. Cap 20. Writes `.evolution/route-list.json` + sha256. Orchestrator cannot edit the file after the script writes it.

### A.2 — Per-route critique (parallel, token-constrained)

For each route, spawn one critique invocation:

```
Skill('critique', args='
  mode: web-evolve | run_mode: per-route-baseline |
  output_format: tokens-only |
  taste_rules_hash: <sha256 from Phase 0.5> |
  screenshot_path: <abs path> |
  route: <slug> |
  checklist: sales-page-10 |
  briefing_file: references/critique-brief.md
')
```

The briefing file (read by the critique agent) is read-only and the critique agent must return:
```json
{
  "verdict": "PASS | FAIL_REBUILD | FAIL_REFINE | FAIL_VOID",
  "checklist_fails": ["sales-page-10:rule_N", ...],
  "taste_violations": ["section_7:banned_font", ...],
  "vq_aggregate": 0.0-5.0,
  "tool_use_id_for_screenshot_read": "<the tool_use_id of the Read call that loaded the screenshot>"
}
```

If `tool_use_id_for_screenshot_read` is absent OR does not appear in the transcript, the response is rejected (agent claimed to read the screenshot but didn't). The orchestrator runs `references/verify-tool-use-id.sh <id>` and the script exits non-zero on mismatch.

### A.3 — Parse + persist

```bash
bash references/parse-handoff.sh per-route-baseline
```

Validates schema via `python3` (stdlib `json` + `re`). Malformed entries dropped to `.evolution/parse-failures.json`. The script writes `.evolution/page-baselines.json` (under WriterAgent role). Orchestrator cannot modify after write.

### A.4 — Live-HTML verification (the cover-agent rollback pattern)

```bash
for route in $(python3 -c "import json; [print(r.get('slug','')) for r in json.load(open('.evolution/page-baselines.json')).get('routes',[])]"); do
  bash references/verify-live-html.sh "$route"
done
```

For each route the script:
- Puppeteer-probes the live URL
- Extracts H1, primary CTA text, visible pricing strings
- Hashes them
- Compares hash against the agent's claim in `page-baselines.json`
- Exit 1 on mismatch → entry deleted, route added to `.evolution/re-audit-queue.txt`

Routes re-audited max 1 time. Still-mismatched → HALT for that route, surface to user.

---

## Phase R — REBUILD-mode gate

```bash
bash references/rebuild-gate.sh
```

Reads `.evolution/page-baselines.json`. If `rebuild_queue.length >= 1` → enters REBUILD mode and emits per-route `rebuild-iter` commands. REBUILD iters invoke `Skill('web-page')` ONLY. The hook blocks any Edit/Write to source files unless `Skill('web-page')` is the active context (verified via tool-use chain in the transcript).

If `rebuild_queue.length == 0` → proceed to standard Phase R hero signature pick (full spec in `references/tier-contracts.md`).

---

## Phase C — Improvement loop (Python predicate)

```bash
while bash references/loop-condition.sh; do
  bash references/iter-step.sh
done
```

`loop-condition.sh` reads `loop-state.json` and exits 0 only if:
- `iteration < max_iterations`
- `current_score < target_score`
- `deviation_count < 3`
- `void_count < max_voids`
- No HALT flag set by any prior phase

`iter-step.sh` does (each step is its own exit-coded check):
1. Pre-screenshot via puppeteer
2. Dispatch via `references/fix-routing.md` (SKILL_LOOKUP)
3. Post-screenshot
4. Skill('critique') per-iter-delta with `output_format: tokens-only` returning `{KEEP, VOID, REVERT}`
5. Parse via `references/parse-verdict.sh`
6. Apply verdict mechanically: KEEP→commit, VOID→`git reset --hard HEAD~1`, REVERT→`git revert HEAD --no-edit`
7. Update loop-state.json under WriterAgent role
8. Run `references/per-iter-gates.sh` (verifies tool-use IDs for the critique call, increments deviation_count on any failed sub-check)

---

## Phase D — Deploy + verify (no soft-degrade)

```bash
bash references/deploy-and-verify.sh
```

The script:
1. Pushes evolve branch
2. Polls `vercel inspect <deployment>` for status
3. **Asserts** `vercel env ls preview` shows all required env vars with `scope=all-preview-branches` OR with the current branch name listed. Mismatch → exit 1, HALT. No soft-degrade fallback.
4. Puppeteer-verifies the preview URL against post-iter screenshots
5. FF-merges to main only on exit 0
6. Puppeteer-verifies prod URL after main build

If step 3 fails for the first time on a project: HALT with a one-time-setup instruction printed to the user — they go to the Vercel dashboard and set the env vars to "All Preview Branches" scope once. Run is not resumable until that's done. This breaks the per-branch dependency that broke Run #6.

---

## Phase F — Independent retro (RetroAgent, not orchestrator)

```
Agent(subagent_type=general-purpose, prompt=<contents of references/retro-agent-brief.md>)
```

RetroAgent role:
- Read-only access to `.evolution/*.json`, `git log --oneline -50`, `~/.claude/tool-use.log` (filtered to this session)
- NO access to the orchestrator's reasoning, conversation history, or prior trajectory entries beyond run N-1
- Required output: a single `trajectory.runs[N]` JSON entry matching `references/trajectory-schema.json`
- Constrained verdict vocab (cardinal rule 8)
- MUST flag every gate the orchestrator failed even if the orchestrator's prose claimed pass — RetroAgent reads tool-use log, not prose

Orchestrator runs:
```bash
bash references/append-retro.sh "<RetroAgent JSON output>"
```

This script validates schema, appends to trajectory.json, writes `.evolution/next-run-priorities.json` from the RetroAgent's `next_run_priorities` field, and commits. Orchestrator cannot edit either file's content — only invokes the script.

If RetroAgent's verdict is `PASS`: deviation_count == 0, all gates green, score ≥ target.
If `FAIL`: the run's status field is one of the constrained tokens (Cardinal rule 8). The user-facing summary is generated by the script from the structured fields — orchestrator does not write the summary.

---

## Phase 0.5–F handoff schema

Every phase reads inputs and writes outputs through `references/parse-handoff.sh <phase-name>`. The script knows the schema for each phase from `references/schemas/`. Malformed inputs are dropped (per orchestrator_workers pattern). The orchestrator cannot "fix up" an agent's malformed response — it must reject.

---

## Anti-patterns (each blocked by a mechanism, not a warning)

- **Producer-grades-producer.** Blocked by Cardinal rule 6 (Phase F is separate agent) + Cardinal rule 1 (critique returns constrained tokens) + critique-brief.md banning self-grading.
- **Orchestrator-written cache.** Blocked by Cardinal rule 2 (capability-stripped via hook deny on `.evolution/*`) + Cardinal rule 4 (hash verification at every read).
- **Trust-the-claim.** Blocked by Cardinal rule 5 (verify-live-html.sh) + tool_use_id verification in Phase A.2.
- **Soft-degrade fallback.** Removed. Every gate is exit-code; failure = HALT. Phase D's Vercel env-var check is the first place soft-degrade existed and is now exit-1 only.
- **Comfort framing of incomplete runs.** Blocked by Cardinal rule 8 (constrained status vocab) + Cardinal rule 6 (RetroAgent writes the summary, not the orchestrator).
- **Principle-based fixes.** Every cardinal rule has a script. If a future failure requires a new rule, it requires a new script. No rule that depends on orchestrator self-discipline ships.
- **Spec line-count bloat.** Phase 0 boot gate halts if `SKILL.md > 500 lines`. The bloat pattern is now mechanically capped.

---

## Reference paths

```
boot-gates:           references/boot-gates.sh           — Phase 0 entry checks
smoke-test:           references/smoke-test.sh           — hook violation attempt, asserts exit 2
gate-checks:          references/gate-checks.sh          — every cardinal-rule check, exit-coded
parse-verdict:        references/parse-verdict.sh        — token-vocab regex validator
parse-handoff:        references/parse-handoff.sh        — python schema validator between phases
loop-condition:       references/loop-condition.sh       — non-LLM loop predicate
verify-live-html:     references/verify-live-html.sh     — puppeteer ground-truth check
verify-tool-use-id:   references/verify-tool-use-id.sh   — tool_use_id transcript verification
enumerate-routes:     references/enumerate-routes.sh     — sitemap + crawl
rebuild-gate:         references/rebuild-gate.sh         — REBUILD-mode entry
iter-step:            references/iter-step.sh            — single Phase C iter
deploy-and-verify:    references/deploy-and-verify.sh    — Phase D (no soft-degrade)
append-retro:         references/append-retro.sh         — Phase F write (script writes, not orchestrator)
critique-brief:       references/critique-brief.md       — critique agent briefing (read-only, token-constrained)
retro-agent-brief:    references/retro-agent-brief.md    — RetroAgent briefing
schemas/:             references/schemas/                — python-validated schemas per phase
trajectory-schema:    references/trajectory-schema.json  — trajectory.runs[N] structure
hashes:               references/.hashes.json            — sha256 of every references/*.sh
```

Preserved from previous version (still sound):

```
fix-routing:             references/fix-routing.md            — SKILL_LOOKUP, edit_direct flags
sales-page-checklist:    references/sales-page-checklist.md   — 10-rule baseline checklist
scoring-engine:          references/scoring-engine.md
multi-run-orchestration: references/multi-run-orchestration.md — Phase A.0 decision tree
tier-contracts:          references/tier-contracts.md         — tier 98+ contracts (preserved)
decisions:               references/decisions.md              — historical principle archive
```

---

## What the rebuild changed vs SKILL.md.pre-forge

| Failure mode (forge spec #) | Mechanical fix |
|---|---|
| 1 (Skill('critique') not invoked) | tool_use_id required in agent response; verify-tool-use-id.sh exits 1 on mismatch |
| 2 (hook untested) | Phase 0 boot gate runs smoke-test.sh which attempts a violation and asserts exit 2 |
| 3 (orchestrator-authored cache) | TasteFetcher sub-agent + hook deny on `.evolution/*` + hash verification |
| 4 (comfort-blanket honest halt) | Constrained status vocab (cardinal rule 8); RetroAgent writes status, not orchestrator |
| 5 (Vercel preview per-branch) | Phase D asserts scope=all-preview-branches or matching branch list; exit 1 = HALT, no fallback |
| 6 (spec line-count growth) | Phase 0 boot gate `wc -l SKILL.md ≤ 500` |
| 7 (ask counter narrow) | Session-scoped counter file in `~/.claude/state/`; hook reads it |
| 8 (self-graded Phase F) | RetroAgent is a separate Agent invocation with read-only access |
| 9 (audit hallucinations) | verify-live-html.sh + tool_use_id verification |

Run #5's SKILL.md was 358 lines. This SKILL.md is 298 (verified via `wc -l`). Below the 500-line cap with all 9 fixes added because the mechanical machinery lives in `references/`.

---

## Related skills

- `/skill-forge` — used to produce this rebuild. Re-run if a fresh chat scores /web-evolve lower than this one does.
- `/critique` — only valid visual-quality signal; called with constrained-token args (cardinal rule 1)
- `/web-page` — only valid REBUILD execution path
- `/taste-skill` — Phase 0.5 cache source (hash-verified)
- `/style-mirror` — extracts reference tokens if no reference provided

Do NOT use this skill for:
- Building a new site → `/saas-build` then `/web-scaffold`
- One-off page fixes → `/impeccable` (web-fix was removed and replaced by impeccable per fix-routing.md)
- Single-component refactors → `/web-component`
