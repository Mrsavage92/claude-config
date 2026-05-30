---
name: autopilot
disallowed-tools: AskUserQuestion
description: >
  Autonomous project progression engine. Reads current project state, determines next highest-value
  task, executes it, updates progress tracking, and repeats until blocked or iteration limit reached.
  Supports multi-session continuity, rollback on failure, quality gates, and parallel task dispatch.
  Use when the user needs to walk away and wants Claude Code to keep progressing non-stop.
  Trigger phrases (explicit, autonomous-intent only): "/autopilot", "autopilot", "autonomous mode",
  "run until blocked", "progress while I'm away", "keep building until blocked".
  Do NOT trigger on conversational continuations like "keep going", "don't stop", or "just keep
  going" — those mean "continue the current line of work," not "enter 20-task autonomous mode."
  If unsure, ask once: "Did you mean /autopilot (autonomous, 20 tasks) or just continue this task?"
  Override iteration limit: /autopilot 50
---

# Autopilot — autonomous project progression

The user is away. Keep progressing the project non-stop until you hit a real blocker or the iteration limit. Decide and act — don't pause for confirmations.

## Cardinal rules (load-bearing — enforced by scripts, not prose)

Six behaviours have failed silently in past sessions when described in prose. They are now enforced by scripts under `scripts/`. **You must invoke these scripts — direct `git commit` and uninstrumented edits are forbidden.**

1. **Phase 0 anchor is `bash scripts/anchor-check.sh`.** If it exits non-zero, halt as NEEDS_HUMAN with its message. The skill MUST NOT read, glob, or `find` outside the path inside `.autopilot/anchor.txt`. No `find C:/Users/...` across the home directory — the anchor is the boundary.
2. **Every task begins with `bash scripts/start-task.sh <task-id>`.** This captures the pre-task HEAD SHA. Skipping this means there's no rollback if the task fails.
3. **Every task's commit is `bash scripts/commit-task.sh "<msg>" "<files>" "<test-status>"`.** This commits, appends a structured line to LOG.md, increments `.autopilot/task-count`, runs the no-op check, and auto-fires a checkpoint every 5 tasks. Direct `git commit` is forbidden because LOG.md and checkpoints have repeatedly gone unwritten when left to manual discipline. If `commit-task.sh` exits 4, you have hit the 3-consecutive-no-op circuit breaker — halt as DEGRADED.
4. **On test failure call `bash scripts/record-failure.sh <task-id>`.** If it exits 3, you MUST call `bash scripts/revert-task.sh <task-id>` and continue with the next task — the current task is STUCK.
5. **Quality gate is `bash scripts/quality-gate.sh --full` at session end, every 10 tasks, and when the queue empties.** It detects build/test/lint/typecheck commands and runs them OR logs "skipped (no command discoverable)" — the gate ALWAYS runs and ALWAYS logs to `.autopilot/gate-log` plus `AUTOPILOT_LOG.md`. Exit code 2 means FAIL — insert a `fix: quality regression` task at the top of TASKS.md.
6. **No-op detection runs inside `commit-task.sh`.** A commit whose staged diff is only whitespace/comments increments `.autopilot/noop-count`. Three in a row triggers exit code 4 from commit-task.sh, which halts the session as DEGRADED per circuit breaker 2h.

## Default iteration limit: 20 tasks. Override with `/autopilot N`.

### Iteration accounting
- An iteration = one `commit-task.sh` call OR one `revert-task.sh` call. Both count.
- A decomposed L task is replaced in the queue by its S/M subtasks — the parent does NOT count; each completed subtask counts as 1.
- Reprioritise, checkpoint, quality gate — none of these count.
- Retries within a task (up to the triple-failure cap) do NOT count individually.

### Model routing (token budget)

A 20-task session is expensive. Route subagents to the cheapest model that can do the job:

| Phase / step | Tool | Model |
|---|---|---|
| Phase 1 orient (read logs, git status, README) | Explore agent or direct Read | **haiku** |
| Phase 1 gap analysis (grep TODOs, find stubs) | Explore agent | **haiku** |
| Quality-gate diff review | Bash + Read | inherit |
| Parallel-dispatch subagents for S/M tasks | Agent | **sonnet** |
| Task execution in the main loop | (current model) | inherit |
| Handoff report | inherit | inherit |

Rule: FIND info → haiku. EDIT code → sonnet or inherit. Never spawn an Opus subagent during autopilot unless the task is explicitly client-quality output.

After a large file read or test-suite dump, run `/compact` before continuing if context has grown past ~40%.

---

## Phase 0 — Anchor check (BLOCKING)

```bash
bash scripts/anchor-check.sh
```

This validates `pwd` and writes the resolved anchor path to `.autopilot/anchor.txt`. Non-zero exit = halt as NEEDS_HUMAN with the script's message.

After it succeeds, **read `.autopilot/anchor.txt`. That path is the only directory you may read from or write to for the rest of this session.** Reads outside the anchor (other projects, the home directory, the global active-revenue-projects.md, the skills directory) are forbidden. This is the mechanical fix for the BDR→AuditHQ scope drift documented in `[feedback_autopilot_context_anchor]`.

Append to `AUTOPILOT_LOG.md` at the anchor root:
```
## Autopilot Session — <ISO date+time>
**Anchored project:** <name> at <path-from-anchor.txt>
```

## Phase 0.5 — Resume check (within the anchor only)

If `<anchor>/AUTOPILOT_LOG.md` exists, read its LAST session entry:
- `BLOCKED` / `NEEDS_HUMAN` / `STUCK` → if the blocker reads as resolved (credential added, decision made), resume from where it left off and skip the full Phase 1 orient. If not resolved, log the same blocker and stop.
- `NO_QUEUE` → run Phase 1 gap analysis before stopping.
- `PAUSED` / `DEGRADED` / `DONE` → proceed to Phase 1.

## Phase 1 — Orient (within the anchor only)

1. Read `CLAUDE.md` — project instructions, stack, conventions, **off-limits files**.
2. Read `TASKS.md` or `TODO.md` if present — primary work queue.
3. Read `README.md` for project overview.
4. `git log --oneline -20` — what was last done.
5. `git status` — any in-progress work.
6. **Health check:**
   - Detect the build command from project files in this order: `package.json scripts.build` → `Makefile build:` target → `pyproject.toml` build system → `Cargo.toml` → `go.mod` → CLAUDE.md instructions. If none found, log "No build command discoverable" and skip the build step. Do not invent a command.
   - Run the build with a **3-minute timeout**. If it times out, log NEEDS_HUMAN: "Build exceeds 3-minute autopilot budget — supply a faster check command."
   - Run the test suite, same 3-minute timeout. Prefer a fast subset if defined (`npm run test:unit`, `pytest -m "not slow"`).
   - If the build is broken, fixing it is task #1.
   - Record `**Build command:** <cmd>` and `**Test command:** <cmd>` in the session entry.
7. If `git status` shows uncommitted changes, commit or stash before starting new work.
8. Read the last 3 session entries from `AUTOPILOT_LOG.md` — do not repeat previously-failed approaches.

### Priority queue

In order:
1. Broken build or failing tests (always first)
2. Incomplete tasks already started
3. STUCK items from previous sessions where the fix is now obvious
4. Critical path features blocking other work
5. Next unchecked item in TASKS.md
6. Obvious gaps visible from the codebase

Summarise in 3 bullets: what the project is, what was last done, what you'll do first.

### Task generation (if no queue)

If no TASKS.md exists or all items are checked, generate one before stopping:
1. Compare `SCOPE.md` (if any) features vs implemented routes/pages.
2. Grep for `TODO`, `FIXME`, `HACK`, `XXX` in code.
3. Check for empty pages, stub components, placeholder content.
4. Check for missing tests on critical paths.
5. Check for missing error handling on API calls.
6. Write TASKS.md with up to 15 prioritised items.

**Every generated task must satisfy ALL of:**
- Concrete file scope (names a specific file or directory).
- Verifiable outcome (observable check — "test X passes", "page Y returns 200", "lint clean on Z").
- Size-tagged S/M/L. L items decompose to S/M before execution.
- Not a duplicate — grep TASKS.md and recent session logs.
- Not aspirational — no "consider X", "investigate Y". Investigation tasks must produce a concrete artifact.
- Inside scope guardrails — no off-limits files, no destructive ops.

Tasks failing any check are rejected, not added. Fewer than 3 valid tasks → NO_QUEUE is valid.

---

## Phase 2 — Execute loop

Repeat until a stop condition fires:

### 2a. Size the task

| Size | Estimate | Action |
|------|----------|--------|
| S | < 5 min | Execute immediately |
| M | 5–20 min | Execute; checkpoint commit halfway if touching multiple files |
| L | 20+ min | Decompose into S/M subtasks first |

Never start an L task as a single unit.

### 2b. Snapshot

```bash
bash scripts/start-task.sh <task-id>
```

`<task-id>` is a short slug — kebab-case alphanumeric (e.g. `fix-og-image-test`, `P0-D-credit-recon`). The script writes `.autopilot/snapshots/<task-id>.sha` and initialises `.autopilot/failures/<task-id>`.

### 2c. Execute

1. Make code changes.
2. Run the relevant tests (not just "does it compile").
3. **On test failure:**
   ```bash
   bash scripts/record-failure.sh <task-id>
   ```
   If exit code is 0: fix the issue and re-run tests.
   If exit code is 3: run `bash scripts/revert-task.sh <task-id>`, log STUCK, move to the next task. The current task is done.
4. **Mid-task blocker (credential need, human decision, destructive op):**
   - Run `bash scripts/revert-task.sh <task-id>`. Do not leave WIP in the tree.
   - Log the blocker against the task with `**Blocked at:** <step>` and `**Needed:** <what>`.
   - Never stash or commit half-finished work as `WIP:`.

### 2d. Commit + log + count + maybe-checkpoint

Stage specific files only (never `git add -A` or `git add .`):
```bash
git add <file1> <file2> ...
bash scripts/commit-task.sh "<conventional commit msg>" "<comma-separated-files>" "<test-status>"
```

The script will: commit, write the LOG.md line, increment `.autopilot/task-count`, fire a checkpoint to AUTOPILOT_LOG.md if `count % 5 == 0`. Pre-commit secret-scan rejects `.env`, `*.pem`, `*.key`, `_rsa`, `_ed25519`, `secrets/`, `credentials/`.

Conventional prefixes: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`, `perf:`, `ci:`, `build:`. One commit per task. Never batch multiple tasks. If adding a dependency, put WHY in the commit body.

### 2e. Mark progress

After `commit-task.sh` succeeds:
- Mark `[x]` in TASKS.md for the task.
- The LOG.md line is already appended by the script.
- The AUTOPILOT_LOG.md checkpoint (if any) is already appended by the script.

### 2f. Reprioritise (every 10 tasks)

After every 10 tasks:
1. Re-read TASKS.md — has priority shifted?
2. Re-run the full test suite — anything regressed?
3. Check bundle size / build output — quality degraded?
4. Reorder remaining tasks if needed.

### 2g. Check for blockers

If the next task requires a human decision, external credential, or is ambiguous → stop. Otherwise → loop to 2a.

### 2h. Session-level circuit breakers

These halt the entire session:
- **3 STUCK in a row** → halt as DEGRADED. Something systemic is wrong.
- **3 consecutive committed tasks with no functional change** (diff = whitespace, comments, logs, formatting only) → halt as DEGRADED. Likely thrash.
- **Quality gate fails twice in the same session** → halt as DEGRADED.
- **Any guardrail violation** (off-limits file touched, secret nearly committed, destructive command attempted) → halt as NEEDS_HUMAN.

---

## Phase 2.5 — Quality gate (mechanically enforced)

Auto-runs when:
- TASKS.md fully complete, OR
- 10 tasks completed since last gate, OR
- Session about to end.

Always invoke via:

```bash
bash scripts/quality-gate.sh --full
```

The script detects commands deterministically (package.json, Makefile, Cargo.toml, go.mod, pyproject.toml, tsconfig.json) and runs:

1. **Build** — `npm run build`, `make build`, `cargo build`, `go build ./...`, or `python -m build` if the relevant file exists. Skipped (logged) if no command discoverable.
2. **Tests** — `npm test`, `cargo test`, `go test ./...`, `pytest -q`. Skipped if no command.
3. **Lint** — `npm run lint`, `cargo clippy`, `ruff check .`. Skipped if no command.
4. **Type check** — `tsc --noEmit`, `mypy .`. Skipped if no command.

"Skipped" is logged as part of the gate-result line and does NOT count as FAIL — but a real environment must surface either a check result or an explicit "no command discoverable" entry. There is no "n/a" outcome that bypasses the gate.

The script writes a result line to `.autopilot/gate-log` and a structured block (`### Quality gate — <ts>`) to `AUTOPILOT_LOG.md`. Exit code 2 = FAIL.

Gate FAIL handling (when exit code is 2):
- Insert a `fix: quality regression` task at the top of TASKS.md describing which check broke.
- Execute it before continuing.
- If a single fix task can't resolve it, halt as DEGRADED.
- Second gate failure in the same session → circuit breaker (2h).

---

## Parallel task dispatch

When 2+ tasks are fully independent (different files, no shared state, no import deps):

1. Identify the independent set (max 3 parallel).
2. Execute the fastest one yourself in the main worktree.
3. Spawn background agents for the others using the Agent tool with:
   - `isolation: "worktree"` — mandatory. Subagents never commit to the main worktree.
   - `model: "sonnet"` per the routing table.
   - A clear brief: what to build, files to touch, tests to run, what to return.
   - Explicit instruction: "Do NOT commit. Make changes, run tests, return: (a) files changed, (b) `git diff`, (c) test output. The parent will review and commit."
4. Continue your own work.
5. On return, parent reviews each diff:
   - Apply only if: tests passed in the worktree, no off-limits files touched, diff is scoped to the briefed files only.
   - If pass → re-create changes in main worktree, run test suite locally, commit via `commit-task.sh`.
   - If fail → discard the worktree, log STUCK, move on.
6. If two applied diffs conflict, the second becomes STUCK and reverts.

Only parallelise when independence is certain. When in doubt, sequential.

---

## Stop conditions

| Condition | Log as | Action before stopping |
|-----------|--------|----------------------|
| Needs API key / credential not in .env | BLOCKED | Log exactly which key and where to set it |
| Ambiguous requirements needing human decision | NEEDS_HUMAN | Log the specific question and your best guess |
| Same error 3 times despite fix attempts | STUCK | `revert-task.sh` was called; log what was tried |
| All TASKS.md complete | DONE | Run quality gate first |
| No queue after gap analysis | NO_QUEUE | Confirm gap analysis ran |
| Destructive action required | NEEDS_HUMAN | Log the exact command and why |
| Iteration limit reached | PAUSED | Run quality gate, log remaining tasks |
| Build/test degraded and unfixable | DEGRADED | Log what regressed and suspected cause |
| Circuit breaker tripped | DEGRADED | Log which breaker fired and the preceding 3 task IDs |

---

## Phase 3 — Handoff report

Append to `<anchor>/AUTOPILOT_LOG.md`:

All timestamp + duration fields below MUST be computed from `LOG.md` and `.autopilot/gate-log`, not estimated. Use:

```bash
FIRST_TS=$(head -n 1 LOG.md | grep -oE '^\[[0-9:]+\]' | tr -d '[]')
LAST_TS=$(tail -n 1 LOG.md  | grep -oE '^\[[0-9:]+\]' | tr -d '[]')
TASKS_DONE=$(grep -c '^\[[0-9:]\+\] DONE' LOG.md || echo 0)
REVERTS=$(grep -c '^\[[0-9:]\+\] STUCK' LOG.md || echo 0)
```

LOG.md timestamps are written as `HH:MM:SS` by `commit-task.sh` and `revert-task.sh` — second-level precision is required so the avg-task-time computation below is honest even in short sessions.

`Avg task time` = `(LAST_TS − FIRST_TS) / TASKS_DONE` in seconds, formatted as `m:ss`:

```bash
F=$(date -d "$FIRST_TS" +%s); L=$(date -d "$LAST_TS" +%s)
DUR=$((L - F))
AVG=$(( TASKS_DONE > 0 ? DUR / TASKS_DONE : 0 ))
printf '%d:%02d\n' $((AVG/60)) $((AVG%60))
```

If you can't compute it from the file, write `not-computable: <reason>` — do not estimate.

```
## Autopilot Session — <date> <time>

**Status:** <DONE / BLOCKED / NEEDS_HUMAN / STUCK / NO_QUEUE / PAUSED / DEGRADED>
**Anchored project:** <name> at <path>
**Wall clock:** <FIRST_TS> → <LAST_TS>  (<computed duration>)
**Tasks completed:** N / limit
**Reverts:** N STUCK reverts
**No-op streak at session end:** <value from .autopilot/noop-count or "n/a">
**Avg task time:** <computed mm:ss, or "not-computable: <reason>">
**Quality gate (final):** <last line of .autopilot/gate-log>
**Build command:** `<detected cmd or "no command discoverable">`
**Test command:** `<detected cmd or "no command discoverable">`

### What was done
- <task-1> (S) — <1-line outcome>
- <task-2> (M) — <1-line outcome>
- ...

### Decisions made
- <non-obvious choice and reasoning>

### Stopped because
<one specific sentence>

### Next action required
<exact human action needed, or "nothing — project complete">

### Remaining queue
- [ ] <next task 1>
- [ ] <next task 2>
- ...
```

The session-end `AUTOPILOT_LOG.md` write does NOT replace the mid-session checkpoints — both must be present in a healthy run.

---

## Scope guardrails

Hard rules. No exceptions.

- **Never modify files outside `.autopilot/anchor.txt`'s path.**
- **Never touch off-limits files.** Built-in default block (applies even if CLAUDE.md says nothing):
  - `.env*` (any file starting with `.env`)
  - `*.pem`, `*.key`, `*.crt`, `*_rsa`, `*_ed25519`, `**/secrets/**`, `**/credentials/**`
  - Deploy configs: `vercel.json`, `netlify.toml`, `railway.toml`, `fly.toml`, `app.yaml`, `Procfile`
  - CI/CD: `.github/workflows/*`, `.gitlab-ci.yml`, `.circleci/*`, `azure-pipelines.yml`
  - Migrations once applied: `supabase/migrations/*`, `prisma/migrations/*`, `alembic/versions/*` (read-only — new migrations only if the task explicitly asks)
  - Lockfiles: `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `Cargo.lock`, `poetry.lock` (only modified as a side-effect of an approved dependency add)
  - CLAUDE.md adds to this list, does not replace.
  - Any touch → halt as NEEDS_HUMAN.
- **Never add dependencies without logging WHY in the commit body.** "Seemed useful" is not a reason.
- **Never change build pipeline, deploy config, or CI/CD without logging NEEDS_HUMAN.**
- **Never run destructive commands** (`DROP TABLE`, `rm -rf`, `git push --force`, branch delete). Log NEEDS_HUMAN.
- **Never commit `.env`, credentials, API keys, secrets.** The `commit-task.sh` script enforces this.
- **Never refactor code unrelated to the current task.** Stay on target.
- If uncertain, choose the most conservative option and log the reasoning.
- Always leave the repo clean, buildable, committable when stopping. If you can't, revert.

---

## Rules summary

1. Never ask a question mid-session. Decide and log.
2. Never skip a failing test — fix it or revert the task.
3. Never start an L task without decomposing.
4. Never proceed past a broken build — fixing it is task #1.
5. Never repeat an approach that failed in a previous session — read the logs.
6. Always `start-task.sh` before a task. Always `commit-task.sh` after.
7. Always run the quality gate before reporting DONE.
8. Always leave breadcrumbs — mid-session checkpoints are written by `commit-task.sh` every 5 tasks.

---

## Observable proof of compliance

A healthy session will leave these artifacts at the anchor root:
- `.autopilot/anchor.txt` — the locked anchor path
- `.autopilot/task-count` — integer matching the count of `[<HH:MM>] DONE` lines in LOG.md
- `.autopilot/noop-count` — current no-op streak (`0` for any healthy session, never reaches 3)
- `.autopilot/snapshots/*.sha` — one file per task started
- `.autopilot/gate-log` — one line per `quality-gate.sh` run (--quick or --full)
- `LOG.md` — one `DONE` line per task completed, one `STUCK` line per task reverted
- `AUTOPILOT_LOG.md` — session header, one `### Checkpoint —` block per 5 completed tasks, one `### Quality gate —` block per `--full` gate run, the final session entry

If any of these are missing after a session, the session was non-compliant. Reviewers (forge, audits) check exactly these files.
