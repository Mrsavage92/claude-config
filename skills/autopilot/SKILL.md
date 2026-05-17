---
name: autopilot
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

# Skill: Autopilot — Autonomous Project Progression

You are operating in autonomous mode. The user is away. Keep progressing the project non-stop until you hit a genuine blocker or the iteration limit. Do not pause to ask questions. Do not wait for confirmation. Execute.

**Default iteration limit: 20 tasks.** Override with `/autopilot <N>` (e.g. `/autopilot 50`).

### Iteration accounting

- An **iteration** is one committed task OR one STUCK revert. Both count toward the limit.
- A decomposed L task is replaced by its subtasks in the queue — the parent does NOT count; each completed subtask counts as 1.
- A reprioritise / checkpoint / quality gate does NOT count.
- Retries within a single task (up to the 3-attempt limit before revert) do NOT count individually — the whole task is 1 iteration regardless of attempts.

### Model routing (token budget)

A 20-task session is expensive. Route subagents to the cheapest model that can do the job:

| Phase / step | Tool | Model |
|---|---|---|
| Phase 1 orient (read logs, git status, README) | Explore agent or direct Read | **haiku** |
| Phase 1 gap analysis (grep TODOs, find stubs) | Explore agent | **haiku** |
| Quality gate diff review (`git diff --stat`, log parsing) | Bash + Read | inherit (cheap, no subagent) |
| Parallel-dispatch subagents for S/M tasks | Agent | **sonnet** |
| Task execution in the main loop | (current model) | inherit |
| Handoff report generation | inherit | inherit |

Rule: FIND info → haiku. EDIT code → sonnet or inherit. Never spawn an Opus subagent during autopilot unless the task is explicitly client-quality output.

After a large file read or test-suite dump, run `/compact` before continuing if the conversation has grown past ~40% of context.

---

## Phase 0 — Context Anchor (MANDATORY — run before anything else)

**Scope this session to the current conversation's project only.**

1. Identify the **active project** from the current conversation context:
   - What directory/project was the user working in when they invoked `/autopilot`?
   - What task or codebase was the conversation about immediately before this was triggered?
2. **Mechanically verify the anchor.** Run `pwd` and state the resolved absolute path. The path MUST satisfy all of these:
   - Not equal to `~`, `~/.claude/`, `~/.claude/projects/`, `~/Documents/`, or any `claude-config` directory
   - Contains at least one of: `CLAUDE.md`, `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `composer.json`, `Gemfile`
   - If both checks pass → this is the anchor. State it: `Anchored to: <absolute path>`
   - If either fails → stop immediately, log NEEDS_HUMAN: "Working directory is not a project root — please cd into the project and re-invoke."
3. Set that path as the **sole working scope** for this session. All file reads, task discovery, and execution are confined to that project's directory.
4. **Do NOT read the global active-revenue-projects.md or CLAUDE.md project registry for task discovery.** Those lists are for routing new conversations — not for expanding autopilot scope.
5. **Do NOT start work on any project not in focus in the current conversation.** If the user was in a BDR conversation, this session is BDR only. If the user was in an AuditHQ conversation, this session is AuditHQ only. Never cross-contaminate.
6. Log the anchored project at the top of the session entry in AUTOPILOT_LOG.md: `**Anchored project:** [name] at [path]`

If the current conversation context is ambiguous (no clear project in scope), stop immediately and log NEEDS_HUMAN: "Cannot determine which project to anchor to — please specify."

---

## Phase 0.5 — Resume Check

Before anything else, check if this is a continuation of a previous session **within the anchored project**.

```
If AUTOPILOT_LOG.md exists:
  Read the LAST session entry
  If status == BLOCKED or NEEDS_HUMAN or STUCK:
    Read "Stopped because" and "Next action required"
    Check if the blocker has been resolved (credential added, decision made, etc.)
    If resolved → resume from where it left off, skip full Phase 1 orient
    If NOT resolved → log same blocker, stop immediately
  If status == NO_QUEUE:
    Run Phase 1 gap analysis to find new work before stopping
```

---

## Phase 1 — Orient

Read the project state before doing anything:

1. Read `CLAUDE.md` — project instructions, stack, conventions, **off-limits files**
2. Read `TASKS.md` or `TODO.md` if present — your primary work queue
3. Read `README.md` for project overview
4. Run `git log --oneline -20` to see what was last done
5. Run `git status` to see any in-progress work
6. **Health check** — verify the project actually builds:
   - Detect the build command from project files in this order: `package.json` `scripts.build`, `Makefile` `build:` target, `pyproject.toml` build system, `Cargo.toml`, `go.mod`, CLAUDE.md instructions. If none of those are found → log "No build command discoverable" and skip the build step (do NOT invent a command).
   - Run the discovered build command with a **3-minute timeout** (Bash `timeout: 180000`). If it times out, log a NEEDS_HUMAN: "Build exceeds 3-minute autopilot budget — please confirm or supply a faster check command."
   - Run the test suite if one exists, same 3-minute timeout. If the full suite is too slow, prefer a fast subset (e.g. `npm run test:unit`, `pytest -m "not slow"`) if defined; otherwise log a NEEDS_HUMAN.
   - If the build is broken, **fixing it is task #1** — do not proceed to feature work on a broken build.
   - Record `**Build command:** <cmd>` and `**Test command:** <cmd>` at the top of the session entry so all later steps use the same commands.
7. Check for uncommitted changes — if someone left WIP, commit or stash it before starting
8. Read last 3 AUTOPILOT_LOG.md entries if they exist — **do not repeat failed approaches**

### Priority Queue

Identify tasks in this order:

1. Broken build or failing tests (always first)
2. Incomplete tasks already started (half-done work is waste)
3. STUCK items from previous sessions where the fix is now obvious
4. Critical path features blocking other work
5. Next unchecked item in TASKS.md
6. Obvious gaps visible from the codebase

Summarise orientation in 3 bullets: what the project is, what was last done, what you'll do first.

### Task Generation (if no queue exists)

If no TASKS.md exists or all items are checked, generate one before stopping:

1. Compare `SCOPE.md` features vs implemented routes/pages
2. Grep for `TODO`, `FIXME`, `HACK`, `XXX` comments in code
3. Check for empty pages, stub components, or placeholder content
4. Check for missing tests on critical paths
5. Check for missing error handling on API calls
6. Generate TASKS.md with up to 15 prioritised items

**Each generated task MUST satisfy ALL of these to enter the queue:**

- **Concrete file scope** — names at least one specific file or directory (`src/auth/login.tsx`, not "the auth flow").
- **Verifiable outcome** — has an observable check ("test X passes", "page Y returns 200", "lint clean on file Z"). "Improve performance" is NOT verifiable; "reduce home-page LCP below 2.5s as measured by Lighthouse" is.
- **Size-tagged** — every task carries `(S)`, `(M)`, or `(L)`. `(L)` items must be decomposed into S/M before execution.
- **Not a duplicate** — grep TASKS.md and the last 3 AUTOPILOT_LOG.md entries; reject if substantially similar work was already done or already STUCK.
- **Not aspirational** — no "consider X", "investigate Y", "explore Z". Investigation tasks must produce a concrete artifact (a doc, an issue, a decision logged).
- **Inside scope guardrails** — does not require touching off-limits files; does not require destructive ops.

Tasks failing any check are rejected, not added. If fewer than 3 valid tasks survive → NO_QUEUE is valid; don't pad with filler.

If after all this there is genuinely nothing to do → NO_QUEUE is valid.

---

## Phase 2 — Execute Loop

Repeat until a stop condition is hit:

### 2a. Size the Task

Before each task, estimate its size:

| Size | Estimate | Action |
|------|----------|--------|
| **S** | < 5 min of work | Execute immediately |
| **M** | 5-20 min of work | Execute, make a checkpoint commit halfway if touching multiple files |
| **L** | 20+ min of work | **Break into S/M subtasks first**, insert them into TASKS.md, then execute the first one |

Never start an L task as a single unit. Decompose it.

### 2b. Snapshot Before Starting

```
Record pre-task commit: SHA=$(git rev-parse HEAD)
```

This is your rollback point if the task fails.

### 2c. Execute

1. **Execute** the task fully — write code, create files, wire up imports
2. **Test** — run the relevant test suite (not just "does it compile")
   - If tests fail: fixing them is now the current task, not the next one
   - If tests fail 3 times on the same issue: **revert to pre-task SHA**, log STUCK, move to next task
3. **Mid-task blocker rule** — if a credential need, human decision, or destructive op surfaces partway through a task:
   - **Revert to pre-task SHA.** Do not leave WIP in the working tree.
   - Log the blocker against the task with `**Blocked at:** <step>` and `**Needed:** <what>`.
   - Never stash or commit half-finished work as `WIP:`.
4. **Commit** with a conventional message: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`
   - One commit per task. Never batch multiple tasks into one commit.
   - Never commit `.env`, credentials, or secrets.
   - If adding a dependency, include WHY in the commit body.

### 2d. Update Progress

- Mark done in TASKS.md: `[ ]` → `[x]`
- Append to LOG.md: `[HH:MM] DONE | task description | files changed | tests passing`

### 2e. Checkpoint (every 5 tasks)

After every 5 completed tasks, write a mid-session checkpoint to AUTOPILOT_LOG.md:

```
### Checkpoint — [timestamp]
Tasks done this session: N/limit
Current task: [what you're about to do]
Build status: [passing/failing]
Decisions made: [any non-obvious choices and why]
```

This gives the user breadcrumbs if they check back mid-session.

### 2f. Reprioritise (every 10 tasks)

After every 10 tasks, pause the loop and:

1. Re-read TASKS.md — has the priority shifted based on what was built?
2. Re-run the full test suite — has anything regressed?
3. Check bundle size / build output if applicable — has quality degraded?
4. Reorder remaining tasks if needed
5. Continue

### 2g. Check for Blockers

If the next task requires a human decision, external credential, or is ambiguous → stop.
Otherwise → loop back to 2a.

### 2h. Session-Level Circuit Breakers

These halt the entire session, not just the current task:

- **3 STUCK in a row** → halt as DEGRADED. Something systemic is wrong; stop burning iterations on it.
- **3 consecutive committed tasks with no functional change** (git diff shows only whitespace, comments, log edits, or formatting) → halt as DEGRADED. Likely thrash or hallucinated work.
- **Quality gate fails twice in the same session** → halt as DEGRADED.
- **Any guardrail violation** (off-limits file touched, secret nearly committed, destructive command attempted) → halt immediately as NEEDS_HUMAN, regardless of iteration count.

---

## Phase 2.5 — Quality Gate

Runs automatically when:
- TASKS.md is fully complete, OR
- 10 tasks have been completed since the last gate, OR
- The session is about to end (approaching iteration limit)

### Gate checks (with thresholds — gate FAILS if any threshold is breached):

1. **Build** — `npm run build` / equivalent. **Threshold:** zero errors. Any build error = FAIL.
2. **Tests** — full suite. **Threshold:** net new failing tests = 0 vs session start. 1+ new failure = FAIL.
3. **Lint** — run linter if configured. Fix auto-fixable. **Threshold:** net new lint errors = 0. Net new warnings ≤ 5 = pass with note, > 5 = FAIL.
4. **Bundle/output** — if a web project. **Threshold:** > 20% size increase from session start = WARN (log + continue), > 40% = FAIL.
5. **Type check** — `tsc --noEmit` / `mypy` if configured. **Threshold:** net new type errors = 0. Any new = FAIL.
6. **Regression scan** — run `git diff --stat HEAD~N` (where N = tasks this session) to review total blast radius. **Threshold:** files touched outside the scope listed in any task's description = FAIL (scope creep).

If the gate FAILS:
- Create a `fix: quality regression` task at the top of TASKS.md describing exactly which threshold breached
- Execute it before continuing to feature work
- If a single fix task can't resolve it, halt the session as DEGRADED — do not paper over it across multiple tasks
- A second gate failure in the same session triggers the circuit breaker (see 2h)

---

## Parallel Task Dispatch

When the execute loop identifies 2+ tasks that are **fully independent** (different files, no shared state, no import dependencies):

1. Identify the independent set (max 3 parallel)
2. Execute the fastest one yourself in the main worktree
3. Spawn background agents for the others using the Agent tool with:
   - `isolation: "worktree"` — **mandatory**. Subagents NEVER commit to the main worktree directly.
   - `model: "sonnet"` — see model routing table.
   - A clear brief: what to build, which files to touch, what tests to run, what to return.
   - **Explicit instruction: "Do NOT commit. Make the changes, run tests, return: (a) list of files changed, (b) a unified diff via `git diff`, (c) test output. The parent will review and commit."**
4. Continue your own work.
5. When agents return, parent reviews each diff:
   - Apply only if: tests passed in the worktree, no off-limits files touched, diff is scoped to the briefed files only.
   - If pass → apply the diff to the main worktree (`git apply` or re-create the changes), run the test suite again locally, commit under autopilot's per-task discipline.
   - If fail → discard the worktree, log the task as STUCK, move on. Never apply a partial or failing diff.
6. If two applied diffs conflict, the second one becomes a STUCK and reverts; do not merge by hand mid-session.

**Only parallelise when independence is certain.** Two tasks touching the same component are NOT independent. When in doubt, run sequentially. Parallel dispatch is opt-in optimisation — sequential is the safe default.

---

## Stop Conditions

| Condition | Log as | Action before stopping |
|-----------|--------|----------------------|
| Needs API key / credential not in .env | BLOCKED | Log exactly which key and where to set it |
| Ambiguous requirements needing human decision | NEEDS_HUMAN | Log the specific question and your best guess |
| Same error 3 times despite fix attempts | STUCK | **Revert to pre-task SHA**, log what was tried |
| All TASKS.md items complete | DONE | Run quality gate first |
| No queue after gap analysis | NO_QUEUE | Confirm gap analysis was run |
| Destructive action required (drop table, force push, delete data) | NEEDS_HUMAN | Log the exact command and why it's needed |
| Iteration limit reached | PAUSED | Run quality gate, log remaining tasks |
| Build/test quality degraded and unfixable | DEGRADED | Log what regressed and suspected cause |
| Circuit breaker tripped (3 STUCK in a row, 3 no-op commits in a row, 2 gate fails) | DEGRADED | Log which breaker fired and the preceding 3 task IDs |

---

## Phase 3 — Handoff Report

When stopped, produce this report and **append** it to `AUTOPILOT_LOG.md`:

```
## Autopilot Session — [date] [time]

**Status:** [DONE / BLOCKED / NEEDS_HUMAN / STUCK / NO_QUEUE / PAUSED / DEGRADED]
**Anchored project:** [name] at [path]
**Wall clock:** [start HH:MM] → [end HH:MM]  ([duration])
**Tasks completed:** N / limit
**Reverts:** N STUCK reverts
**Avg task time:** [duration / tasks completed]
**Build status:** [passing / failing]  (command: `<cmd>`)
**Tests:** [N passing, N failing, N skipped]  (command: `<cmd>`)
**Build command:** `<cmd>`
**Test command:** `<cmd>`

### What was done
- [task 1] (S) — [1-line outcome]
- [task 2] (M) — [1-line outcome]
- ...

### Decisions made
- [any non-obvious choice and the reasoning]

### Stopped because
[One sentence — specific, not vague]

### Next action required
[Exactly what the human needs to do, or "nothing — project complete"]

### Remaining queue
- [ ] [next task 1]
- [ ] [next task 2]
- ...
```

---

## Scope Guardrails

These are hard rules. No exceptions.

- **Never modify files outside the project directory.**
- **Never touch off-limits files.** Built-in default block (applies even if CLAUDE.md says nothing):
  - `.env*` (any file starting with `.env`)
  - `*.pem`, `*.key`, `*.crt`, `*_rsa`, `*_ed25519`, anything matching `**/secrets/**` or `**/credentials/**`
  - Deploy configs: `vercel.json`, `netlify.toml`, `railway.toml`, `fly.toml`, `app.yaml`, `Procfile`
  - CI/CD: `.github/workflows/*`, `.gitlab-ci.yml`, `.circleci/*`, `azure-pipelines.yml`
  - Migrations once applied: `supabase/migrations/*`, `prisma/migrations/*`, `alembic/versions/*` (read-only — never edit existing migration files; only add new ones, and only if the task explicitly asks)
  - Lockfiles: `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `Cargo.lock`, `poetry.lock` (only modified as a side-effect of an approved dependency add)
  - CLAUDE.md adds to this list, it does not replace it.
  - Touching any of these = halt as NEEDS_HUMAN with the file path and what was needed.
- **Never add dependencies without logging WHY in the commit body.** "Seemed useful" is not a reason.
- **Never change the build pipeline, deploy config, or CI/CD without logging NEEDS_HUMAN.**
- **Never run destructive commands** (drop table, rm -rf, force push, delete branch). Log NEEDS_HUMAN instead.
- **Never commit .env, credentials, API keys, or secrets.** Check `git diff --cached` before every commit.
- **Never refactor code that isn't related to the current task.** Stay on target.
- If uncertain about a choice, make the most conservative option and log the decision with reasoning.
- Always leave the repo in a clean, buildable, committable state when stopping. If you can't, revert to the last clean commit.

---

## Rules Summary

1. Never ask a question mid-session. Decide and log.
2. Never skip a failing test — fix it or revert the task that broke it.
3. Never start an L-sized task without decomposing it first.
4. Never proceed past a broken build — fixing it is always task #1.
5. Never repeat an approach that failed in a previous session — read the logs.
6. Always snapshot before starting a task. Always revert on triple failure.
7. Always run the quality gate before reporting DONE.
8. Always leave breadcrumbs — checkpoints every 5 tasks, decisions logged, handoff report complete.
