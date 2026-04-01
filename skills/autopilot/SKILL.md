---
name: autopilot
description: >
  Autonomous project progression engine. Reads current project state, determines next highest-value
  task, executes it, updates progress tracking, and repeats until blocked or iteration limit reached.
  Supports multi-session continuity, rollback on failure, quality gates, and parallel task dispatch.
  Use when the user needs to walk away and wants Claude Code to keep progressing non-stop.
  Trigger phrases: "keep going", "autopilot", "progress while I'm away", "run until blocked",
  "don't stop", "keep building", "autonomous mode", "just keep going".
  Override iteration limit: /autopilot 50
---

# Skill: Autopilot — Autonomous Project Progression

You are operating in autonomous mode. The user is away. Keep progressing the project non-stop until you hit a genuine blocker or the iteration limit. Do not pause to ask questions. Do not wait for confirmation. Execute.

**Default iteration limit: 20 tasks.** Override with `/autopilot <N>` (e.g. `/autopilot 50`).

---

## Phase 0 — Resume Check

Before anything else, check if this is a continuation of a previous session.

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
   - Run the build command (`npm run build` / `pytest` / `cargo build` / whatever the stack uses)
   - Run the test suite if one exists
   - If the build is broken, **fixing it is task #1** — do not proceed to feature work on a broken build
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
3. **Commit** with a conventional message: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`
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

---

## Phase 2.5 — Quality Gate

Runs automatically when:
- TASKS.md is fully complete, OR
- 10 tasks have been completed since the last gate, OR
- The session is about to end (approaching iteration limit)

### Gate checks:

1. **Build** — `npm run build` / equivalent must pass with zero errors
2. **Tests** — full suite must pass. Log any failures.
3. **Lint** — run linter if configured. Fix auto-fixable issues, log the rest.
4. **Bundle/output** — if a web project, check that bundle size hasn't ballooned (> 20% increase from session start = log a warning)
5. **Regression scan** — run `git diff --stat HEAD~N` (where N = tasks this session) to review total blast radius

If quality has degraded:
- Create a `fix: quality regression` task at the top of TASKS.md
- Execute it before continuing to feature work
- If unfixable, log in handoff report

---

## Parallel Task Dispatch

When the execute loop identifies 2+ tasks that are **fully independent** (different files, no shared state, no import dependencies):

1. Identify the independent set (max 3 parallel)
2. Execute the fastest one yourself
3. Spawn background agents for the others using the Agent tool with a clear brief:
   - What to build
   - Which files to touch
   - What tests to run
   - Commit message to use
4. Continue your own work. When agents complete, verify their output.
5. If an agent's work conflicts or fails tests, fix it as the next task.

**Only parallelise when independence is certain.** Two tasks touching the same component are NOT independent. When in doubt, run sequentially.

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

---

## Phase 3 — Handoff Report

When stopped, produce this report and **append** it to `AUTOPILOT_LOG.md`:

```
## Autopilot Session — [date] [time]

**Status:** [DONE / BLOCKED / NEEDS_HUMAN / STUCK / NO_QUEUE / PAUSED / DEGRADED]
**Tasks completed:** N / limit
**Build status:** [passing / failing]
**Tests:** [N passing, N failing, N skipped]

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
- **Never touch files listed in CLAUDE.md as off-limits.**
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
