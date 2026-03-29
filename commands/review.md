# /review

Universal deep review command. Works on code, products, pages, APIs, command specs, or entire projects. Exhaustive. Honest. Does not stop at 5 findings. Does not inflate scores.

TRIGGER when: user says "review [anything]", "review this", "review my code/app/skill/command/spec", "do a review", or opens a file in the IDE and asks for a review. This skill always wins over /saas-improve when the word "review" is used — /saas-improve is for autonomous improvement after a build, not for reviewing.

DO NOT TRIGGER when: user explicitly asks to "improve", "fix gaps", "make it production-ready", or "run saas-improve" on an existing build — use /saas-improve instead. Note: /review also fixes P0/P1/P2 findings it discovers — the distinction is about the user's starting intent (review/assess vs. improve/enhance), not the output.

## When to Use
- Before any deploy or merge
- After a build or sprint to find what was missed
- When you want the real picture, not reassurance
- Works on: React/TS apps, FastAPI backends, full-stack products, agent systems, any codebase, command/skill spec files
- "Products" and standalone pages are treated as Code projects — run passes A-H against their source files

---

## Core Rules (non-negotiable)

1. **Scan everything.** Glob all files. Read every component, route, hook, config, and style file. Do not intentionally sample or skip. If context limits force an early stop, list all unread files as UNREVIEWED in the report — never claim a file was reviewed that was not read. See Step 1 for priority read order.
2. **Score is math, not mood.** Score = 100 - (P0x10 + P1x5 + P2x2 + P3x1). A "fix" only raises the score if the specific file:line is verified changed.
3. **Never claim fixed without verifying.** After any fix, re-read the exact file and line. If it's still there, it counts.
4. **Log every finding.** Every issue gets a file:line reference, severity, and a 1-line description. If you found 40 issues, report 40 issues.
5. **Do not round up.** A 61 is a 61. Never call it "close to 70."
6. **Research the standard before scoring.** If you're scoring accessibility, check WCAG 2.1. Security — check OWASP Top 10. Performance — Lighthouse thresholds. Design — Linear/Stripe/Vercel bar.
7. **Never skip a pass that applies to your target type.** Target Detection defines which passes run for each target. Within those passes: not "probably fine" — run every one and confirm.
8. **Fix P0, P1, and P2.** All three severity levels are auto-fixed unless fixing requires external action (product decision, missing credential, external config) — in that case mark as USER ACTION REQUIRED and exclude from the fixed count. P3 is left to the user with a prioritised list.

---

## Target Detection

Before starting, identify what type of target is being reviewed. This determines which passes apply.

**Code project** — has src/, package.json, or requirements.txt: run all passes A-H.
**Python/FastAPI backend only** — no frontend: run passes A (security), B (correctness), G (quality), H (testing). From Pass C, run only the backend item: "No blocking synchronous operations in request handlers (no time.sleep, no blocking I/O)" — skip all other Pass C checks.
**Command/Skill spec file** — .md file that is a Claude command or skill: run Spec passes I-L instead of A-H.
**Mixed monorepo** — frontend + backend: run all passes, apply frontend checks to frontend files and backend checks to backend files.

---

## Process

**Before starting:** Verify the review target exists and is accessible. If the path, file, or directory does not exist: output "Target not found: [path]. Verify the path and retry." and stop. Do not proceed with a review of a non-existent target.

### Step 1 — Map the Target

Before reviewing a single line, build the complete inventory. Run in parallel:

**Frontend (React/TS):**
- Glob `src/**/*.tsx` - all React components
- Glob `src/**/*.ts` - all TypeScript modules
- Glob `src/pages/**` - all pages
- Glob `src/hooks/**` - all hooks
- Glob `src/lib/**` - all utility/lib files
- Glob `src/api/**` - all API clients
- Glob `*.config.*` - all config files (vite, tailwind, tsconfig)
- Read `package.json` - dependencies, scripts, versions
- Read `.env.example` - what env vars exist (if exists)

**Backend (Python/FastAPI):**
- Glob `**/*.py` - all Python files
- Glob `**/requirements*.txt` - dependencies
- Glob `**/alembic/**` or `**/migrations/**` - schema history
- Read `main.py` or `app.py` - entry point (if exists)

**Both:**
- Read `SCOPE.md` - what was planned (if exists)
- Read `CLAUDE.md` - project-specific rules (if exists)
- Read `BUILD-LOG.md` - what phases completed (if exists)

State the inventory count upfront: "X components, X pages, X hooks, X Python files."

This inventory is the contract. Every file in it gets reviewed. The review cannot close with unreviewed files.

**Priority read order for large projects (> 50 files):** auth handlers → payment/webhook handlers → API routes → custom hooks → page components → shared components → utilities → config files. If context pressure forces stopping before all files are read, list remaining files as UNREVIEWED in the final report. Never claim a file was reviewed that was not read.

---

### Step 2 — Run Tooling First (before reading files)

Run these commands and capture output. Findings from tools are P1 or P0 automatically — they are not negotiable.

```bash
# TypeScript — zero tolerance for errors
npx tsc --noEmit 2>&1

# Linting (if configured)
npm run lint 2>&1

# Build (catches import errors, missing modules)
npm run build 2>&1

# Tests + coverage (if they exist)
# Requires: npm install -D @vitest/coverage-v8 (or @vitest/coverage-istanbul)
npx vitest run --reporter=verbose --coverage 2>&1 || npx vitest run --reporter=verbose 2>&1

# Dependency vulnerabilities — never skip this
npm audit --json 2>&1
```

For Python:
```bash
python -m mypy . 2>&1
python -m flake8 . 2>&1
pytest -v --cov=. --cov-report=term-missing 2>&1
pip-audit 2>&1 || { echo "[pip-audit not installed — run: pip install pip-audit]"; }
```

Log all tool output. Every TypeScript error = P1 finding. Every build failure = P0 finding. Every failing test = P1 finding. Every lint error = P2 finding. Every `npm audit` critical = P0. Every `npm audit` high = P1. Every `npm audit` moderate = P2. Every `pip-audit` critical/high = P0.

If no package.json or tooling configuration exists (fresh project, bare script, or non-Node target): log a P2 finding "no build/test tooling configured" and proceed to Step 3 — do not block the review.

Do not proceed to Step 3 until tool output is captured.

---

### Step 3 — Run All Review Passes

Run these passes. Each is independent. Do all of them. Passes that do not apply to the target type must be listed as N/A in the report — not skipped silently and not reported as clean. Only passes that actually ran against the target and found nothing may be called clean.

#### Pass A — Security (OWASP-grounded)

Read every file that handles auth, user input, file uploads, payment webhooks, API calls, environment variables. Check:

- [ ] No hardcoded secrets, API keys, or tokens in source files
- [ ] `VITE_` prefix only on non-sensitive vars (browser-exposed)
- [ ] All private API routes behind auth middleware
- [ ] User-supplied IDs never trusted — always derived from JWT/session
- [ ] SQL/NoSQL injection: parameterised queries only, never string interpolation
- [ ] Stripe webhook signature verified before processing (not just "received") — if applicable; skip if no Stripe integration, but flag equivalent check for any payment processor used
- [ ] RLS enabled on ALL Supabase tables (check schema or migration files) — if applicable; skip if no Supabase, but flag equivalent auth/authorization check for your database layer
- [ ] File uploads: type validation, size limit, path traversal protection
- [ ] CORS not `*` in production
- [ ] No `console.log` statements that output user data or tokens
- [ ] No sensitive data stored in localStorage (tokens, PII)
- [ ] CSRF protection on state-changing endpoints
- [ ] Password hashing not custom — use bcrypt/argon2/scrypt
- [ ] No eval(), innerHTML with user content, dangerouslySetInnerHTML
- [ ] Rate limiting on auth endpoints (login, signup, password reset)
- [ ] No stack traces exposed in API error responses to clients

Severity: Each violation is P0.

#### Pass B — Correctness & Logic

Read every component, hook, and API handler. Check:

- [ ] Every async function has error handling (try/catch or .catch())
- [ ] No unhandled promise rejections
- [ ] Race conditions in concurrent operations (parallel state updates, competing fetches)
- [ ] Database transactions where multiple writes must be atomic
- [ ] Idempotency on webhook/payment handlers — check for: idempotency key stored and checked before processing, database upsert instead of insert, or duplicate event ID detection. A handler with no duplicate protection = P1.
- [ ] Forms: validation on submit, not just on blur
- [ ] Empty/null/undefined guarded at every access point
- [ ] Array operations guarded against empty arrays
- [ ] API responses checked for success before using data
- [ ] Loading/error/empty states handled in every data-dependent component
- [ ] No stale closures in useEffect dependencies
- [ ] No infinite re-render loops (missing or incorrect dep arrays)
- [ ] Optimistic updates roll back correctly on failure

Severity: P1 per violation.

#### Pass C — Performance

Read package.json, vite.config.ts, all route files, all data-fetching code. Also use tool output from Step 2 build.

- [ ] No chunk > 250KB gzipped (from build output)
- [ ] No data fetching in useEffect — use TanStack Query or SWR
- [ ] React.lazy on all route-level components
- [ ] manualChunks in vite.config: vendor-react, vendor-motion, vendor-query, vendor-supabase (or equivalent vendor splits for your stack)
- [ ] Images: `loading="lazy"` except hero (`loading="eager"`)
- [ ] No N+1 queries: check every loop that contains a database call
- [ ] Heavy operations not on the main thread (crypto, large data transforms)
- [ ] useCallback/useMemo where referential equality matters
- [ ] Heavy WebGL/canvas components are lazy-loaded (e.g. AnimatedBackground, particle systems, 3D renderers — anything that blocks the main thread)
- [ ] Font: `display=swap` on all @font-face declarations
- [ ] No blocking synchronous operations in request handlers (Python: no time.sleep, no blocking I/O)

Severity: chunk > 250KB = P1. Others = P2.

#### Pass D — Design System

Read every component and page file. Check:

- [ ] Zero hardcoded hex/rgb/hsl colors outside index.css
- [ ] Zero direct Tailwind color literals: `text-white`, `bg-black`, `text-gray-*`, `bg-gray-*`
- [ ] Zero inline `style={{}}` with color or spacing values
- [ ] Spacing uses scale (p-4, not p-[13px])
- [ ] No TypeScript `any` that can be typed
- [ ] No components over 200 lines without clear extraction logic
- [ ] No `key={index}` on dynamic lists
- [ ] Tailwind config defines all semantic tokens
- [ ] Color budget: brand color max 3 uses per page
- [ ] All interactive elements have hover and focus states
- [ ] Consistent border-radius via design token

Severity: hardcoded colors = P2. Others = P2/P3.

#### Pass E — Accessibility (WCAG 2.1 AA)

Scan every component. Check:

- [ ] All `<img>` have `alt` attribute
- [ ] All icon-only buttons have `aria-label`
- [ ] All modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, close with `aria-label="Close"`, Escape handler, focus trap
- [ ] All form inputs have `<label>` or `aria-label`
- [ ] All interactive `<div>`/`<span>` have `role` and `tabIndex`
- [ ] All interactive elements have `focus-visible:ring-2 focus-visible:ring-ring`
- [ ] Skip-nav link in main layout
- [ ] `aria-live` region for async feedback
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] No `<button>` inside `<a>` or vice versa
- [ ] Color contrast ratio meets 4.5:1 (AA)
- [ ] Tab order is logical

Severity: missing alt, missing aria-label on interactive = P1. Others = P2.

#### Pass F — Completeness

- [ ] Every page in SCOPE.md exists as a route in App.tsx
- [ ] Every route renders content (not a shell/stub)
- [ ] Landing page exists at `/`
- [ ] vercel.json exists with SPA rewrites
- [ ] All auth flows complete: signup, login, logout, password reset, email verification
- [ ] All empty states have designed content with CTA
- [ ] 404 page exists
- [ ] Loading states on all async operations (skeleton preferred over spinner)
- [ ] Error boundaries exist on major route segments
- [ ] robots.txt exists in /public
- [ ] sitemap.xml exists in /public
- [ ] favicon / apple-touch-icon in /public

Severity: missing landing page, missing auth flow = P0. Missing 404, empty states without CTA = P1. Missing SEO files = P2.

#### Pass G — Code Quality & Maintainability

- [ ] No commented-out blocks of dead code
- [ ] No console.log/console.error in components (only in explicit debug utils)
- [ ] No duplicate components (same UI built twice)
- [ ] No duplicate utility functions
- [ ] No hardcoded URLs that should be env vars
- [ ] Consistent naming: camelCase TS/JS, snake_case Python
- [ ] Functions/components named for what they do
- [ ] No deeply nested conditionals (> 3 levels) without early returns
- [ ] API error messages not leaking stack traces to clients
- [ ] No unused imports (flagged by lint — already captured in Step 2)
- [ ] No TODO comments in production paths

Severity: P2/P3 per item.

#### Pass H — Testing

- [ ] Test files exist (`src/tests/` or `tests/`)
- [ ] Auth flow has tests (signup, signin, protected route redirect)
- [ ] Core feature has at least one smoke test (empty state, error state)
- [ ] All tests pass (from Step 2 tool output)
- [ ] Auth and payment code paths have >= 60% line coverage (from Step 2 coverage report) — below 60% on these critical paths = P1
- [ ] Tests mock external services (Supabase, Stripe) — not calling real APIs
- [ ] No test that always passes regardless of code (testing the mock, not the behaviour)
- [ ] No skipped tests (`test.skip`, `pytest.mark.skip`) without a documented reason

Severity: no tests at all = P1. Failing tests = P1. Auth/payment coverage < 60% = P1. Skipped tests without reason = P2.

---

### Step 4 — Compile All Findings

Before scoring, list EVERY finding. Tool findings from Step 2 come first.

```
FINDINGS LOG
─────────────────────────────────────────────────────
Files reviewed: X
Tool findings (tsc/lint/build/tests): X
Manual findings: X
Total: X

[SEV] [PASS] [file:line] — description
     [P0/P1 only] Blast radius: [what else this breaks or exposes]
[P0] [Build] — TypeScript error: cannot find module '@/lib/supabase'
     Blast radius: all authenticated routes fail to load at runtime
[P0] [Security] src/lib/api.ts:14 — hardcoded Stripe secret key
     Blast radius: any attacker with source access can make arbitrary charges
[P1] [Tests] src/tests/auth.test.ts:22 — test failing: expected redirect to /dashboard
[P1] [Correctness] src/hooks/useProjects.ts:34 — unhandled promise rejection in fetch
     Blast radius: silent failure on every project load — user sees blank state, no error
[P2] [Performance] src/pages/Dashboard.tsx:12 — data fetching in useEffect, not TanStack Query
[P2] [Design] src/components/Card.tsx:5 — hardcoded bg-white, use bg-card
[P3] [Quality] src/components/Header.tsx:23 — commented-out navigation block
...
(ALL P0/P1 findings include blast radius. ALL findings listed — none omitted)
```

---

### Step 5 — Score

```
P0 findings: X x 10 = X points deducted
P1 findings: X x 5  = X points deducted
P2 findings: X x 2  = X points deducted
P3 findings: X x 1  = X points deducted
Total deducted: X (ceiling at 100, floor at 0 — score cannot exceed 100 or go negative)
─────────────────────────────────────────
Score: 100 - X = XX/100
```

**N/A passes:** Do not count toward the score in any direction. List them separately in the report. A 100/100 on a 3-file script where 9 of 11 passes were N/A must be reported with the N/A count — never presented as equivalent to 100/100 on a full-stack app.

**Score bands:**
- 90-100: Ship it
- 75-89: Fix criticals, re-review
- 50-74: Major fixes needed, do not deploy
- Below 50: Significant rework required

---

### Step 6 — Report

```
/review Results — [Target]
══════════════════════════════════════════════
Files reviewed:   X
Tool findings:    X
Manual findings:  X
Total findings:   X (P0: X | P1: X | P2: X | P3: X)
Score:            XX/100

CRITICAL — BLOCK EVERYTHING (P0):
  [file:line] — [issue]
  Fix: [exact change needed]

MAJOR — FIX BEFORE DEPLOY (P1):
  [file:line] — [issue]
  Fix: [exact change needed]

MODERATE — FIX THIS SPRINT (P2):
  [file:line] — [issue]
  Fix: [exact change needed]

MINOR — FIX WHEN TOUCHING (P3):
  [file:line] — [issue]
  Fix: [exact change needed]

PASSES WITH NO FINDINGS (ran, confirmed nothing):
  [PassName] — clean

PASSES NOT APPLICABLE TO THIS TARGET:
  [PassName] — N/A (reason: no frontend / no Stripe integration / no test suite)

NOTE: N/A passes do not affect the score. Always state how many passes ran vs were N/A.
Example: "100/100 (5 passes ran, 6 passes N/A — score reflects only applicable passes)"

VERDICT: [SHIP / FIX CRITICALS FIRST / DO NOT DEPLOY]
```

---

### Step 7 — Fix All P0, P1, and P2 Issues

Without asking, execute every P0, P1, and P2 fix in order of severity. If a fix requires information not available in the codebase (e.g. external config value, product decision, missing credential), mark it USER ACTION REQUIRED — do not attempt to fix it, and exclude it from the fixed count. After each fix:
1. Re-read the specific file and line
2. Confirm the issue is gone (do not assume — verify)
3. Mark it FIXED in the findings log with the line that changed

Do not mark anything FIXED unless you have read the file after the change and confirmed it.

**After all fixes — re-run tooling on touched files:**
```bash
npx tsc --noEmit 2>&1
npx vitest run --reporter=verbose --coverage 2>&1 || npx vitest run --reporter=verbose 2>&1
```

If new failures appear that weren't there before: these are regressions introduced by your fixes. Log them as new findings and fix them before recalculating the score.

---

### Step 8 — Final Score

Recalculate using only unfixed findings: USER ACTION REQUIRED P2s (still count against score until actioned), P3 items that remain, and any new regressions found.

```
POST-FIX SCORE
══════════════════════════════════════════════
Before fixes:     XX/100
P0 fixed:         X
P1 fixed:         X
P2 fixed:         X
Regressions:      X (new issues introduced by fixes)
Remaining P3:     X
Final score:      XX/100

STILL NEEDS ATTENTION (P3 — left to user):
[file:line] — [issue] — [why it matters]
(ranked by impact, highest first)

NEXT ACTIONS FOR USER:
1. [most impactful remaining item]
2. [second]
3. ...
```

---

## Spec/Command File Mode

When the target is a `.md` command or skill file (not a codebase):

**Steps 1-2 are replaced by this spec inventory step (run before passes I-L):**
Read the file in full. State upfront:
- Total line count
- Number of phases/steps/passes defined
- Every external file referenced (check each exists or note "if missing" clause)
- Every skill/command referenced (verify each exists in the skills list)
- Every MCP tool referenced (note which are required vs optional)

This inventory is the contract — every section gets reviewed. The review cannot close with unreviewed sections. Exit this inventory step when: line count stated, all external references listed with exists/missing status, all skills verified. Then proceed to passes I-L.

**Steps 4-8 (findings log, scoring, report, fix, final score) apply unchanged to spec mode.**

---

#### Pass I — Logic & Contradictions
- [ ] No two rules that directly contradict each other
- [ ] Every "if X do Y" has a defined fallback for "if not X"
- [ ] Resume/restart logic is unambiguous (not based on vague signals like "check git log")
- [ ] No instruction that references a file or path that may not exist, without a fallback
- [ ] No numerical value (counts, timeouts, sizes) stated twice with different values

#### Pass J — Completeness
- [ ] Every phase/step has a defined exit condition (not open-ended)
- [ ] Every external dependency (MCP, file, skill) has a fallback if unavailable
- [ ] Every loop has a termination condition
- [ ] No step says "do X" without defining what X is or where to find it
- [ ] Every file the spec says to read is either verified to exist or has an "if missing" clause

#### Pass K — Clarity & Executability
- [ ] No vague instructions ("think about", "consider", "close the file mentally")
- [ ] Every action is concrete: what to read, what to write, what command to run
- [ ] Numbers are consistent throughout (same item not called "12-item" in one place and "13-item" elsewhere)
- [ ] Smoke tests reference dynamic values from SCOPE.md/config, not hardcoded route names
- [ ] "When to Use" description accurately reflects what the command actually does

#### Pass L — Cross-Reference Integrity
- [ ] Every skill/command referenced (e.g. `/web-review`, `/web-scope`) — run Glob on `~/.claude/commands/*.md` AND `~/.claude/skills/*/SKILL.md` to verify each exists. Skills may live at either location. Missing from both = P1.
- [ ] Every file path referenced (`~/.claude/...`) — run Glob or Read to verify the path exists. Note: skills live at `~/.claude/skills/{name}/SKILL.md`, commands at `~/.claude/commands/{name}.md`. Check both locations before flagging as missing. If absent from both: P1 finding.
- [ ] Score/quality thresholds are consistent (if one section says 38/40, no other section says 36/40)
- [ ] Phase ordering is consistent (no phase referenced before it's defined)

Scoring for spec files uses the same formula. Contradiction = P0. Logic gap = P1. Vague instruction = P2. Minor clarity = P3.

---

## Honesty Rules

- **Never claim the project is "looking great" if the score is below 80.**
- **Never omit findings to make the report shorter.**
- **Never fix something silently — every fix is in the findings log.**
- **Never report a post-fix score higher than the math supports.**
- **If a fix introduced a regression, report it as a new finding and subtract accordingly.**
- **If you cannot fix something (requires product decision, new design, or external config), say so explicitly — mark it as USER ACTION REQUIRED, not FIXED.**
- **Never skip a pass because it "probably has no issues" — run it and confirm.**
