# Development Workflow

> Extends [common/git-workflow.md](./git-workflow.md) with the full feature development process that happens before git operations.

The pipeline: research → plan → TDD → review → commit.

## Feature Implementation Workflow

### 0. Research & Reuse (mandatory before any net-new implementation)

- **GitHub code search first:** Run `gh search repos` and `gh search code` to find existing implementations.
- **Library docs second:** Use primary vendor docs (Supabase, FastAPI, shadcn, TanStack Query) to confirm API behavior.
- **Web search only when the first two are insufficient.**
- **Check package registries:** Search npm and PyPI before writing utility code. Prefer battle-tested libraries over hand-rolled.
- **Prefer adopting a proven approach** over net-new code when it meets the requirement.

### 1. Plan First

- For non-trivial work, produce a plan before coding.
- Use `/prd` for feature scope, `/scaffold` for new projects, `/sprint-plan` for breakdown.
- Identify dependencies, risks, and the **verification criterion** (how we'll know it's done).

### 2. TDD Approach (where practical)

- Use `senior-qa` agent for test strategy.
- RED: write failing test first.
- GREEN: minimal implementation to pass.
- REFACTOR: improve while staying green.
- Target 80%+ coverage on new logic (aspirational, not blocking).

**When TDD doesn't fit:** UI work with visual judgment, exploratory spikes, one-off scripts. Say so explicitly rather than pretending to TDD.

### 3. Self-Review

- Immediately after writing code, run the checklist in [code-review.md](./code-review.md).
- For non-trivial PRs, invoke `pr-review-expert`.
- Fix CRITICAL and HIGH before committing.

### 4. Commit & Push

- Follow conventional commits (see [git-workflow.md](./git-workflow.md)).
- Never skip hooks (`--no-verify`) unless explicitly authorized.
- Never force-push to `main`.

### 5. Verify the Outcome, Not the Surface

- **HTTP 200 is not success.** Read the HTML, check the content.
- **Compile pass is not success.** Run the feature end-to-end.
- **Tests green on your machine is not success.** Run them in CI.
- For deployed UI: load the live URL and verify the NEW content appears.
- If verification isn't possible in this environment, say so explicitly — don't imply success.
