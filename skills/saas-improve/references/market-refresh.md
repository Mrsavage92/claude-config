# Market Refresh Protocol — saas-improve Phase 6

**Run this phase every 3rd improvement session** (track count in IMPROVEMENT-STACK.md `Sessions run` field). Do not run on session 1 (Sessions run must be > 0 and divisible by 3).

The product was scoped against market research from launch day. Markets move. This phase detects if you've fallen behind.

## Competitor Re-Scan

Run the same 3 searches as Phase 0.25 in saas-build:
1. `"[product category] SaaS features" site:reddit.com OR site:producthunt.com`
2. `"[product category] SaaS alternatives"`
3. `"[product category] missing feature" OR "wish it had"`

## Feature Gap Update

Compare results against MARKET-BRIEF.md. For each new pattern found that isn't in MARKET-BRIEF.md:
- Update MARKET-BRIEF.md with the new competitor/feature data
- If a competitor shipped a feature that was in your "Nice-to-have post-launch" list: upgrade it to P2 and add to IMPROVEMENT-STACK.md
- If a new competitor emerged: log it as a P3 awareness item

## Logging

Log: "Phase 6 competitive drift check — [N] new patterns found, [N] added to stack" to BUILD-LOG.md.

If this is not a 3rd-session run: skip Phase 6, log "Phase 6 skipped (session [N] of 3)".
