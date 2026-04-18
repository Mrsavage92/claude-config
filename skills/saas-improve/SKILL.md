# /saas-improve

Autonomous multi-agent improvement swarm. Reads live production signals, dispatches 7 specialist agents in parallel, merges their intelligence into a unified priority stack, then executes every fix without stopping.

DO NOT TRIGGER when: user says "review [something]" — that is /review (audit + score + findings log).
TRIGGER when: user says "improve", "fix gaps", "make it production-ready", "run saas-improve", or resumes after a build session.

## When to Use
- After /saas-build completes (or after any build session)
- When a product was built in an earlier session and needs to be brought up to standard
- When BUILD-LOG.md shows STUCK or NEEDS_HUMAN items that have been resolved
- On a recurring improvement cycle for any live product

## What This Does
Seven specialist agents scan the product simultaneously — each from a different angle. Their findings merge into a single IMPROVEMENT-STACK.md ranked by impact. The execution engine fixes everything it can touch, deploys, verifies, then checks if the market has moved since you launched.

---

## Phase 0 — Orient + Production Signal Read

### 0.0 REVENUE REALITY CHECK — run BEFORE any agent dispatch

Read the project's memory file (if it exists): `~/.claude/projects/c--Users-Adam--claude-projects/memory/project_{slug}.md`.

Determine the product's revenue status. Answer ONE of:
- **LIVE-WITH-PAYING-CUSTOMERS** — MRR > $0, real users exist
- **PRE-REVENUE-VALIDATED** — ≥3 named pre-committed buyers (documented in validator file or memory)
- **PRE-REVENUE-UNVALIDATED** — no paying customers, no pre-committed buyers

**If PRE-REVENUE-UNVALIDATED** → SCOPE LIMITATION applies for this session:
- Only P0 (broken/security) and P1 (ship-blocking) fixes permitted
- SKIP all P2 polish, P3 marketing, UX refinements, design tweaks, SEO
- SKIP Phase 1 swarm dispatch entirely — it wastes tokens polishing a product with no buyers
- Instead, output a one-paragraph recommendation:
  > "This product is pre-revenue with no validated buyers. Investing `/saas-improve` cycles here is low-ROI compared to either (a) running `/product-validator` with buyer interviews, or (b) redirecting to {active revenue project name from memory}. Continue anyway? Reply 'continue improve' to override."
- HALT until override received.

**If LIVE-WITH-PAYING-CUSTOMERS or PRE-REVENUE-VALIDATED** → proceed to 0a with full swarm.

This check exists because Tender Writer consumed ~40% of a token budget going from 23→37/40 while having zero buyers. Polish before proof is waste.

### 0a. Read state
Read these files before doing anything else:
1. `BUILD-LOG.md` — last completed phase, STUCK items, deployed URL
2. `IMPROVEMENT-STACK.md` — previous stack (if exists and was generated in the last 24 hours: skip Phase 1 and Phase 2, jump directly to Phase 3 execution with the existing stack. If older than 24 hours: re-run Phase 1 and Phase 2 to refresh findings)
3. `SCOPE.md` — page inventory and feature set
4. `DESIGN-BRIEF.md` — locked color + typography contract
5. `MARKET-BRIEF.md` — competitor landscape and differentiator from launch
6. `~/Documents/Claude/outputs/product-validation-{slug}.md` — validator verdict + locked moat/competitors (strategic spine)
7. `~/.claude/commands/premium-website.md` — quality standard
8. `~/.claude/skills/shared/saas-gap-checklist.md` — base completeness checklist
9. `~/.claude/web-system-prompt.md` — Design DNA

Run `git log --oneline -20` and `git status`.

### 0b. Pull live production signals

Read `references/production-signals.md` for Sentry, Railway, build, TS, and test signal collection.

---

## Phase 1 — Parallel Swarm Dispatch

Dispatch all 7 agents simultaneously. Each agent reads the full codebase independently and returns a structured findings list. Do not wait for one before starting the next — run them all at once.

Read `references/agent-checklists.md` for all agent scopes and checklists (Security, Performance, UX/Friction, SEO/GEO, Code Health, Revenue/Conversion, Market Fit).

---

## Phase 2 — Stack Merge

Collect all agent findings + Phase 0b production signals. Merge into a single deduplicated IMPROVEMENT-STACK.md.

```markdown
# Improvement Stack — [product name]
Generated: [timestamp]
Production URL: [URL from BUILD-LOG.md]
Sessions run: [increment each time this runs]

## Production Signals (Phase 0b)
- Build: [CLEAN / N errors]
- TypeScript: [CLEAN / N errors]
- Tests: [N passing / N failing]
- Sentry: [N unresolved issues / unavailable]
- Railway 5xx: [N patterns / unavailable]

## Agent Summary
| Agent | Findings | Top severity |
|---|---|---|
| Security | N | P0/P1/P2 |
| Performance | N | P1/P2 |
| UX/Friction | N | P1/P2 |
| SEO/GEO | N | P2/P3 |
| Code Health | N | P1/P2 |
| Revenue | N | P1/P2 |
| Market Fit | N | P1/P2 |
| **Total** | **N** | |

## P0 — Fix Immediately (production broken)
| # | Source | File:Line | Issue | Status |
|---|---|---|---|---|

## P1 — Fix This Session (ship-blocking)
| # | Source | File:Line | Issue | Status |
|---|---|---|---|---|

## P2 — Fix This Session (quality)
| # | Source | File:Line | Issue | Status |
|---|---|---|---|---|

## P3 — Fix When P1+P2 Done (marketing/polish)
| # | Source | File:Line | Issue | Status |
|---|---|---|---|---|

## Credential Blockers
| # | Issue | What's needed |
|---|---|---|

## Won't Fix (not applicable to this product)
[items skipped with reason]
```

**Deduplication rule:** if two agents flag the same file:line, keep the higher severity, merge the descriptions.

**Injection rule:** every Sentry error = P0 in the stack. Every Railway 5xx = P1. Every failing test = P1. These are non-negotiable — production is telling you something is broken.

---

## Phase 3 — Execution Engine

Read `references/execution-engine.md` for the fix-per-commit loop, tool routing table, priority ordering, credential blocker rules, stuck limit, and re-scan loop.

---

## Phase 4 — Regression Guard

After all fixes are committed:

```bash
npm run build 2>&1
npx tsc --noEmit 2>&1
npx vitest run --reporter=verbose 2>&1
```

Compare results to Phase 0b baseline. New errors = regressions — revert offending commit with `git revert <sha>`, add as P0, return to Phase 3. Results equal or better = proceed to Phase 5.

Log: "Phase 4 regression guard — [before] → [after]" to BUILD-LOG.md.

---

## Phase 5 — Deploy + Live Verification

If any fixes were made since the last deploy, redeploy. If Phase 3 produced zero DONE items (all BLOCKED or STUCK): skip Phase 5 entirely, log "Phase 5 skipped — no fixes to deploy", proceed to Phase 6.

**Railway products** (if `railway.toml` exists or `package.json` references railway):
```bash
npx railway up --detach 2>&1
```

**Vercel SPA products** (default) — git push is the primary deploy method:

Step 1 — commit all changes and push to GitHub:
```bash
git add -A && git commit -m "fix(swarm): [summary of fixes]" && git push origin main
```
If the GitHub repo is connected to Vercel (check BUILD-LOG.md), the push triggers auto-deploy. Wait 30 seconds then verify.

Step 2 — if git push doesn't trigger a deploy (no GitHub connection), fall back to Vercel CLI:
```bash
npx vercel deploy --prod --yes 2>&1
```
If the CLI returns `"status": "error"` with an empty message (known Windows issue), the Vercel project may be corrupted. Create a fresh project:
```bash
rm -rf .vercel && npx vercel link --project [product-slug]-au --yes
```
Re-set env vars from `.env`, then retry deploy.

Step 3 — if both methods fail, check `npx vercel ls` for the last successful deploy URL. Log STUCK with exact error output.

After deploy is `"READY"`, verify both surface and depth:

> **Platform note (Windows):** The `curl` commands below require WSL or Git Bash. On PowerShell, use `(Invoke-WebRequest -Uri [url] -UseBasicParsing).StatusCode` instead.

```bash
# Surface check — CDN edge responds
curl -s -o /dev/null -w "%{http_code}" [production-url]
# Must be 200

# Depth check — SPA rewrites work
curl -s -o /dev/null -w "%{http_code}" [production-url]/auth
# Must be 200

# App loads actual content (not empty HTML shell)
curl -s [production-url] | grep -c "<title>" || echo "No title found"
# Must return 1
```

If any check fails: read Vercel build logs, fix the error, redeploy, verify again. Do not call Phase 5 done until all three return expected values.

Update BUILD-LOG.md: "Deploy [timestamp] — all 3 live checks passed — [URL]"

---

## Phase 6 — Competitive Drift Check

Read `references/market-refresh.md` for the full competitor re-scan and feature gap update protocol. Runs every 3rd session only.

---

## Phase 7 — Intelligence Sync

Push the session's output to all intelligence layers:

**Update IMPROVEMENT-STACK.md:**
- Mark session complete with timestamp
- Increment `Sessions run` counter
- Summarize what was fixed vs what remains

**Update BUILD-LOG.md final entry:**
```markdown
## Swarm Session Complete — [timestamp]

**Session:** #[N]
**Agents run:** 7 (Security, Performance, UX/Friction, SEO/GEO, Code Health, Revenue, Market Fit)
**Total findings:** [N]
**Fixed:** [N]
**Blocked (credentials):** [N]
**Regressions:** [N]
**Deploy URL:** [URL]
**Live verification:** PASSED / FAILED

### Fixed this session
- [finding] — [what changed] ([agent])

### Still blocked (needs human)
- [item] — [exact credential/action needed]

### Next session priority
[top 3 remaining items]
```

**Commit Phase 7 updates to Git:**
```bash
git add IMPROVEMENT-STACK.md BUILD-LOG.md
git commit -m "chore(swarm): session [N] — [N] fixed, [N] blocked"
git push origin main
```

**Push to Notion (if project has Notion URL in memory):**
Run `/project-refresh` PUSH mode with the above summary.

---

## Anti-Patterns

- Running agents sequentially instead of in parallel — all 7 must launch simultaneously
- Fixing findings without committing each one — one gap = one commit, no batching
- Skipping the re-scan loop after fixes — Phase 4 regression guard is mandatory
- Asking permission before fixing P0/P1 issues — fix first, log after

---

## Stop Conditions

| Condition | Action |
|---|---|
| All P0+P1+P2+P3-quick items DONE or BLOCKED | Exit Phase 3, run Phase 4-7 |
| Fix fails 3 times same approach | Mark STUCK, document, skip, continue |
| Build breaks after a fix | Revert that file, mark STUCK, continue with others |
| Credential not in env | Mark BLOCKED with exact var name, skip, continue |
| Sentry/Railway MCP unavailable | Log "signal unavailable", continue without it |

**Never stop because:**
- There are many items — that is expected, swarm handles scale
- A fix takes many steps — break it down and execute
- "The product works" — working and production-ready are different
- An agent found nothing — clean is good, log it and move on

---

## Rules

- One gap = one commit. No batching.
- P0 → P1 → P2 → P3. Never do P3 while P1 gaps exist.
- Credential blockers are not reasons to stop — skip them, fix everything else.
- Every fix verified by re-reading the file after the change.
- IMPROVEMENT-STACK.md is always the source of truth — never work from memory.
- Sentry errors and Railway 5xx patterns are P0/P1 by definition — live production outranks static analysis.
- The swarm finds what the checklist misses. Both inputs matter.

---

## Related Skills

- `/saas-build` — initial build orchestrator (runs before this)
- `/saas-health` — lightweight health check (runs between improve sessions)
- `/web-fix` — single-component fix tool used by the execution engine
- `/project-refresh` — pushes session summary to Notion
