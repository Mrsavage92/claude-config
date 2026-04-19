Generate a session handoff document and save it as `whats-next.md` in the current project directory (or `~/Documents/Claude/handoffs/{slug}-{date}.md` if there is no project directory).

The handoff must pass the **cold-read test**: a fresh Claude instance (or engineer) with zero prior conversation context can open this file and be productive within 60 seconds, without needing to read git logs, grep the codebase, or ask the user a single orientation question.

Most handoffs fail because they assume the next reader knows who the user is, what the project does, where it lives, and what was just discussed. This skill eliminates all of those assumptions.

## Non-negotiable Rules

1. **No pronouns without antecedent.** Never write "this", "the dashboard", "the fix" without naming it first. Every noun resolves on first mention.
2. **Every file reference is absolute.** `C:\Users\Adam\audit-genius\src\pages\Dashboard.tsx` — never `Dashboard.tsx` or `the dashboard file`.
3. **Every change is locatable.** Include file path + line range or commit SHA for every claim of work done.
4. **Every command is copy-paste-ready.** Include the exact `cd` target, exact shell syntax, no placeholders.
5. **No reference to "our prior conversation"** — the next chat doesn't have one with you.
6. **No acronyms without expansion on first use** — PWA, RLS, DoH, JSON-LD, etc.
7. **If a memory file, CLAUDE.md rule, or product-validator verdict constrains the work, surface it explicitly** — don't assume the next chat will re-read it.

## Document Structure (ordered — do not reorder)

Write the file using exactly these section headings:

### `# Handoff — {Project name} — {YYYY-MM-DD}`

### `## 1. Orientation (read first — 30 seconds)`

A single paragraph that answers: **who**, **what**, **where**, **stage**.

Template to fill:
> **User:** {name}, {role/context}. {Any working-style notes the next chat needs — e.g. "never asks yes/no, just act", "pre-revenue product, don't polish without validation"}.
>
> **Project:** {Project name} — {one-sentence product pitch}. {Tech stack in one line}. Live at `{URL}`. Repo: `{git remote URL}`. Local path: `{absolute path}`.
>
> **Revenue stage:** {LIVE-WITH-PAYING-CUSTOMERS / PRE-REVENUE-VALIDATED / PRE-REVENUE-UNVALIDATED}. {One sentence on what that means for what the next chat is allowed to do.}
>
> **Session goal:** {what the user asked for, verbatim if short}.

### `## 2. Get oriented in 60 seconds`

Exact commands, in order, that reproduce the current state. Must be copy-pasteable as-is. Include expected outputs where useful.

Example:
```bash
cd C:/Users/Adam/audit-genius
git log --oneline -5               # Latest should be: 35f3cde feat(dashboard): ...
git status                         # Expected: clean working tree
curl -s -o /dev/null -w "%{http_code}" https://audithq.com.au   # Expected: 200
```

### `## 3. What shipped this session`

A table, not prose. Columns: **Commit** (SHA), **Files** (absolute paths), **What** (one sentence per commit, no jargon).

Below the table, a "Why it mattered" paragraph — the user-visible or business problem each commit solved, in plain English.

### `## 4. What's still open`

A numbered list. Each item MUST have:
- **What** — the task in imperative mood ("Add X", not "X should be added")
- **Where** — absolute file path(s) or system name
- **Acceptance criteria** — how the next chat knows it's done
- **Est. effort** — rough minutes/hours

Bad: "Clean up upload-pdf dedupe"
Good:
> **Dedupe inserts in `upload-pdf` edge function.**
> **Where:** `C:\Users\Adam\audit-genius\supabase\functions\upload-pdf\index.ts`
> **Acceptance:** uploading the same audit PDF twice results in exactly one row in the `reports` table with `storage_path` matching the key (not two). Test via two consecutive POSTs with the same `audit_id` + `key`.
> **Est.:** 30 min.

### `## 5. Ghost context — things that look obvious but aren't`

Gotchas, non-obvious decisions, and things the next chat would waste tokens re-discovering.

Examples of the kind of things that belong here:
- "The audit PDF engine is synced byte-identical between `~/.claude/skills/shared/audit_pdf_engine.py` and `audit-genius/api/audit_pdf_engine.py`. If you edit one, md5-check the other."
- "The `reports` edge function dedupes by storage key at read time because `upload-pdf` inserts duplicates (tracked in §4)."
- "Pre-revenue product → `/saas-improve` is configured to halt. The dashboard pass was an explicit scoped exception, not a bypass."

### `## 6. Do NOT`

A short list of rules the next chat must follow, learned the hard way in this session. Each with a one-line reason.

Examples:
- **Do not re-run `/saas-improve`** — product is pre-revenue-unvalidated, skill is supposed to halt.
- **Do not add a PWA manifest to `index.html`** — removed in `13a7d92` after it triggered a confusing browser "Open in app" prompt with no offline capability behind it.
- **Do not treat the Claude auto-compaction summary as current state** — it describes the session start, not the present.

### `## 7. How to resume`

Three lines, maximum. The exact first action the next chat should take.

Example:
> Open `C:\Users\Adam\audit-genius\supabase\functions\upload-pdf\index.ts`, locate the `INSERT INTO reports` statement, convert to `UPSERT` keyed on `(audit_id, storage_path)`. Deploy via the Supabase MCP. Verify per §4 acceptance criteria.

## Pre-save self-check

Before saving the file, verify every item below. If any fails, fix the handoff and re-check. Do not hand over a document that fails any of these.

- [ ] Section 1 names the user, project, URLs, paths, and revenue stage explicitly.
- [ ] Section 2 commands would run successfully with zero edits on the user's machine.
- [ ] Every file reference in the document is an absolute path.
- [ ] Every "what shipped" item has a commit SHA or a precise file:line range.
- [ ] Every open item in section 4 has acceptance criteria a different engineer could verify.
- [ ] Section 5 contains at least one item the next chat genuinely could not derive from the code alone.
- [ ] Section 6 contains at least one "do NOT" learned in this session.
- [ ] No phrase in the document reads "as discussed", "as before", "the previous change", "our conversation", or similar.
- [ ] No acronym is used without expansion on first occurrence.

## Output

Save the handoff, then output **only**:

> Handoff saved to `{absolute path}`.
> Cold-read test: passed / flagged. {If flagged, list the unresolved items.}
> To resume in next chat, paste this single line: `Read {absolute path} in full before doing anything else.`

Do not summarise the handoff contents in chat — the whole point is that the file is self-sufficient.
