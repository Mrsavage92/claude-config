# /saas-improve

Autonomous post-build improvement engine. Takes an existing SaaS product and makes it production-ready by finding every gap and fixing it — without stopping until done.

## When to Use
- After /saas-build completes (or after any build session)
- When a product was built in an earlier session and needs to be brought up to standard
- When you want to resume improvement on a half-finished product
- When BUILD-LOG.md shows STUCK or NEEDS_HUMAN items that have since been resolved

## What This Does
Reads the current product state, audits it against the full SaaS completeness standard, generates a prioritised improvement list, then executes every improvement autonomously until the product is ship-ready or a genuine credential blocker is hit.

---

## Execution

### Step 1 — Read State

Read these files before doing anything:
1. `BUILD-LOG.md` — what was built, what phase was last completed, what's still pending
2. `GAP-REPORT.md` — previous gap analysis (if exists, skip Step 2 and go straight to Step 3)
3. `SCOPE.md` — page inventory and design decisions
4. `DESIGN-BRIEF.md` — locked design contract
5. `~/.claude/commands/premium-website.md` — quality standard
6. `~/.claude/skills/shared/saas-gap-checklist.md` — completeness checklist
7. `~/.claude/web-system-prompt.md` — Design DNA

Run `git log --oneline -20` to see recent work. Run `git status` to see in-progress changes.

### Step 2 — Gap Analysis

Audit the codebase against every item in `saas-gap-checklist.md`. For each item:
- Mark YES (done), NO (missing), or SKIP (not applicable to this product)
- For every NO: assign priority P1/P2/P3/P4 and complexity Quick/Medium/Large

Write `GAP-REPORT.md` with this structure:

```markdown
# Gap Report — [product name]
Generated: [timestamp]
Build URL: [Vercel URL from BUILD-LOG.md]

## P1 Gaps (Fix first — foundation/security/auth)
| # | Item | Complexity | Status |
|---|---|---|---|
| 1.1 | Missing /privacy page | Quick | TODO |

## P2 Gaps (Fix second — UX/quality)
| # | Item | Complexity | Status |
|---|---|---|---|

## P3 Gaps (Fix when P1+P2 done — marketing/SEO)
| # | Item | Complexity | Status |
|---|---|---|---|

## P4 Gaps (Nice to have)
| # | Item | Complexity | Status |
|---|---|---|---|

## Skipped (not applicable)
[items not relevant to this product]

## Credential Blockers (can't fix without human action)
[items that need API keys, Stripe live mode, etc]
```

### Step 3 — Improvement Loop

**This loop runs until all P1 + P2 + P3-quick gaps are fixed. Do not stop early.**

```
LOOP:
  1. Read GAP-REPORT.md
  2. Find the highest-priority unresolved gap that is not a credential blocker
  3. If none: exit loop
  4. Fix it:
     - Quick gap: fix inline, commit
     - Medium gap: use appropriate web-* skill (/web-fix, /web-page, /web-component)
     - Large gap: break into sub-tasks, execute each, commit each
  5. Mark gap as DONE in GAP-REPORT.md
  6. Append to BUILD-LOG.md: "IMPROVE | [gap item] | [what was changed] | [timestamp]"
  7. Return to step 1
```

**Skill routing per gap type:**
| Gap type | Use |
|---|---|
| Broken/missing component | /web-fix |
| New page needed | /web-page |
| New component on existing page | /web-component |
| Dashboard improvements | /dashboard-design skill |
| Data table on any page | /web-table skill |
| Settings page issues | /web-settings skill |
| Onboarding issues | /web-onboarding skill |
| Email flows missing | /web-email skill |
| Stripe/billing issues | /web-stripe skill |
| Design system violations | Fix directly using web-system-prompt.md rules |
| a11y failures | Fix inline — aria-label, focus rings, semantic HTML |
| TypeScript errors | Fix inline |
| Console.log removal | Fix inline — grep and delete |

### Step 4 — Re-review

After all fixes are committed:
1. Run npm run build — must pass with zero errors
2. Re-run /web-review audit (or apply premium-website.md quality bar manually)
3. If score is below previous score: investigate what regressed and fix it
4. If score improved: log new score to BUILD-LOG.md

### Step 5 — Final Deploy + Verification

If fixes were made since the last deploy:
```bash
npx vercel --prod --yes
```

After deploy completes, verify it is actually live — not a 404, crash, or stale cache:
```bash
# Extract the production URL from deploy output, then verify
curl -s -o /dev/null -w "%{http_code}" [production-url]
# Must return 200. If not: check Vercel build logs for the error before continuing.

# Verify the main app route loads (not just the CDN edge)
curl -s -o /dev/null -w "%{http_code}" [production-url]/signin
# Must return 200 (Vercel SPA rewrites must be working)
```

If either check returns non-200: check Vercel dashboard build logs, fix the error, redeploy, verify again. Do not mark the session done until both return 200.

Update BUILD-LOG.md with new deployment timestamp and HTTP status confirmation.

### Step 6 — Report

Write final GAP-REPORT.md update and BUILD-LOG.md entry:

```markdown
## Improvement Session Complete — [timestamp]

**Gaps resolved:** [N]
**Gaps skipped (credentials):** [N] — see Credential Blockers section
**web-review score:** [X]/40
**Deploy URL:** [URL]

### Fixed in this session
- [gap item 1] — [what was changed]
- [gap item 2] — [what was changed]

### Still needs human action
- [credential blocker 1 with exact variable/action needed]
```

---

## Stop Conditions

| Condition | Action |
|---|---|
| All P1+P2+P3-quick gaps resolved | Exit loop, run Step 4-6 |
| Gap requires credential not in env | Mark BLOCKED in GAP-REPORT.md, skip and continue |
| Same fix attempt fails 3 times | Mark STUCK, document what was tried, skip and continue |
| npm run build fails after fix | Revert the fix (git checkout -- [file]), mark STUCK |

**Never stop because:**
- There are many gaps — that is expected, keep working
- A fix takes a long time — break it down and keep going
- "The product already works" — working and production-ready are different things

---

## Rules
- Read GAP-REPORT.md before every fix — always work from the current state, not memory
- One gap = one commit — do not batch unrelated fixes
- Fix P1 gaps before P2 gaps before P3 gaps — never do P3 work when P1 gaps exist
- Credential blockers are NOT reasons to stop the session — skip them and fix everything else
- Every fix must leave the codebase in a clean, committable state
