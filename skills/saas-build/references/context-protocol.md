## Persistent Context Protocol

**This protocol runs throughout the entire build. It is not optional and does not stop between phases.**

### Two Canonical Context Sources

Every saas-build product has two persistent context anchors that survive context window resets:

| Anchor | What it stores | When to read | When to write |
|---|---|---|---|
| **GitHub repo** | All code + BUILD-LOG.md + SCOPE.md + DESIGN-BRIEF.md | Start of every session + before every phase | After every phase completes (git commit) |
| **Notion project doc** | Decisions, intent, blockers, sessions history, credential status | Start of every session + after every 10 user messages | After every phase completes (project-refresh PUSH) |

### Session Start Rule (applies to EVERY new conversation that resumes a build)

Before writing a single line of code, run ALL of these in parallel:
1. Read `BUILD-LOG.md` — identifies last completed phase and any STUCK/NEEDS_HUMAN items
2. Read `SCOPE.md` — page inventory and build order
3. Read `DESIGN-BRIEF.md` — locked color system and component decisions
4. Run `/project-refresh` PULL mode — fetches current Notion doc state into context

Do NOT skip this even if the user says "continue from where we left off." The context window may have been reset. Read the files, not your memory.

### After Every Phase Completes

Immediately after logging "Phase X complete" to BUILD-LOG.md, run both of these:

```bash
git add -A && git commit -m "phase X: [one-line description of what was built]"
```

Then run `/project-refresh` PUSH to update Notion with:
- Phase just completed
- What was built
- Any NEEDS_HUMAN items added
- Current score or status if applicable

**Never skip this.** A phase that is not committed and not in Notion does not exist from the next session's perspective.

### Mid-Session Context Refresh

After every 10 user messages within a build session:
- Re-read BUILD-LOG.md
- Run `/project-refresh` PULL to check if Notion has been updated externally

This prevents long sessions from drifting away from the locked decisions.

### Repo Creation Rule (fresh builds only)

If no GitHub repo exists for this product: create it in Phase 0 before writing any files. A build with no repo has no persistent context. See Phase 0 for the creation steps.

---