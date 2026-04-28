# Execution Engine — saas-improve Phase 3

**This loop runs until all P0 + P1 + P2 + P3-quick items are DONE or BLOCKED. Do not stop early.**

```
LOOP:
  1. Read IMPROVEMENT-STACK.md — current state, not memory
  2. Find highest-priority item that is TODO (not BLOCKED, not STUCK, not in Won't Fix)
  3. If none remain: exit loop
  4. Select the right tool (routing table below)
  5. Execute the fix
  6. Re-read the affected file and confirm the issue is gone
  7. If confirmed: mark DONE in IMPROVEMENT-STACK.md
     If not fixed: mark STUCK with what was tried, skip
  8. Commit: "fix([agent]): [issue description] — [file]"
  9. Append to BUILD-LOG.md: "SWARM | [agent] | [item] | DONE | [timestamp]"
  10. Return to step 1

When loop exits (no TODO items remain): log "Phase 3 complete — [N] DONE, [N] BLOCKED, [N] STUCK" to BUILD-LOG.md.
```

## Tool Routing

| Gap type | Tool |
|---|---|
| Broken/missing component | /web-fix |
| New page needed | /web-page |
| New component on existing page | /web-component |
| Dashboard/analytics page | /dashboard-design |
| Data table | /web-table |
| Settings page | /web-settings |
| Onboarding wizard | /web-onboarding |
| Email flows | /web-email |
| Stripe/billing | /web-stripe |
| Design system violation | Fix directly per web-system-prompt.md |
| a11y failure | Fix inline — aria attrs, focus rings, semantic HTML |
| TypeScript error | Fix inline |
| Console.log | Grep and delete inline |
| SEO/meta | Fix in index.html or useSeo call |
| Hardcoded color | Replace with CSS variable |
| Test failure | Fix the code, not the test |
| Issue type not in this table | Use /web-fix for UI issues; fix inline for logic/config issues — judgment call based on scope |
| Sentry/Railway error | Read full stack trace, fix root cause |

## Priority Ordering

P0 → P1 → P2 → P3. Never do P3 while P1 gaps exist.

## Fix-Per-Commit Rules

**Batch commits are banned.** One gap = one commit. Unrelated fixes must not share a commit.

## Credential Blockers

If a fix requires an API key, external config, or product decision not available in the codebase: mark BLOCKED in the stack with exact variable name/action needed. Skip it. Continue with everything else.

## Stuck Limit

If the same fix fails 3 times on the same approach: mark STUCK, document exactly what was tried, skip and continue. Never loop forever.

## Re-Scan Loop

After Phase 3 loop exits, Phase 4 regression guard runs:

```bash
npm run build 2>&1
npx tsc --noEmit 2>&1
npx vitest run --reporter=verbose 2>&1
```

Compare results to Phase 0b baseline.

- **New errors that weren't in Phase 0b** = regressions. Do not deploy. Identify offending commit with `git log --oneline -10`, revert with `git revert <sha>`. Add regression as P0 to IMPROVEMENT-STACK.md and return to Phase 3.
- **Results equal or better** = proceed to Phase 5.

Log: "Phase 4 regression guard — [before] → [after]" to BUILD-LOG.md.
