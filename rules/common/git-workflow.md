# Git Workflow

## Commit Message Format

```
<type>: <description>

<optional body>
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`, `build`

**Rules:**
- Focus on the *why*, not the *what* — the diff already says what.
- 1–2 sentences in the summary line.
- No trailing attribution lines unless project convention requires them.

## Staging

- Prefer `git add <specific-files>` over `git add -A` — avoids accidentally staging `.env`, credentials, or large binaries.
- If `.env` appears in `git status`, verify `.gitignore` before staging anything.

## Never Amend Published Commits

- Always create a NEW commit rather than amending.
- `--amend` on a failed-hook commit can destroy work — the failed commit didn't happen, so amend modifies the PREVIOUS one.

## Never Skip Hooks

- No `--no-verify`.
- No `--no-gpg-sign`.
- If a hook fails, fix the underlying issue — don't bypass.

## Never Force-Push to Main

- `git push --force` on `main` is almost always wrong.
- Use `--force-with-lease` on feature branches if rewriting history is necessary and communicated.

## Pull Request Workflow

1. Analyze full commit history (not just latest commit).
2. Use `git diff [base-branch]...HEAD` to see all changes.
3. Draft a PR summary that explains the *why*.
4. Include a test plan checklist.
5. Push with `-u` flag if new branch.

## Branching

- `main` is always deployable.
- Feature branches: `feat/short-name`, `fix/short-name`, `chore/short-name`.
- Delete merged branches.

## Investigate Before Destroying

Before `git reset --hard`, `git checkout -- .`, `git clean -f`, or `git branch -D`:
- Understand what will be lost.
- If unfamiliar files/branches appear, investigate — they may be in-progress work.
- Prefer non-destructive alternatives (stash, new branch, cherry-pick).

> For the full development process (planning, TDD, review) before git operations, see [development-workflow.md](./development-workflow.md).
