---
name: web-evolve
disallowed-tools: AskUserQuestion
description: Session-scoped website improvement loop. One run = one area scored /100 (Hook + Visuals + Clarity + Function), fixed to ≥85, confirmed, persisted. Re-run to advance to the next area automatically. Zero decisions required. Use when the user says "improve the site", "web-evolve", "make the landing page better", "improve the dashboard", "iterate on [page]", "level up [page]", "fix [page] visually", or re-runs after a prior web-evolve session.
argument-hint: "[landing | dashboard | /route]"
---

# /web-evolve

One area. Score it. Fix it. Confirm ≥ 85. Remember it. Stop.

Re-run to pick the next area. You never decide what to work on.

**NOT for:** initial builds → `/web-page`; one-off fixes without state tracking → `/visual-uplift`; full-site gap analysis → `/saas-improve`.

---

## Invocation

| Command | Behaviour |
|---|---|
| `/web-evolve` | Continue last scope, or default to `landing` |
| `/web-evolve landing` | Work through landing page areas in priority order |
| `/web-evolve dashboard` | Work through all authenticated app routes |
| `/web-evolve /clients` | Laser-focus on the `/clients` route only |
| `/web-evolve /audit/new` | Laser-focus on that specific route |
| `/web-evolve [anything else]` | Halt: `⚠ Unrecognised scope "[arg]". Use: landing, dashboard, or a route starting with /` |

---

## Definitions

- **Project root** — the directory containing `package.json`. Run `git rev-parse --show-toplevel` if in doubt.
- **Scope** — the page group being worked on: `landing`, `dashboard`, or a specific route string like `/clients`.
- **Area** — one logical UI unit (hero section, pricing table, nav, etc.) with a `page` field matching the scope.
- **`run_counter`** — global integer in state.json, incremented by 1 each time a new area is first scored. Starts at 0.
- **`run` (per-area)** — the value of `run_counter` at the time this area was first scored. Set once, never updated.
- **`forbidden_additions`** — field in `tokens.lock.json` listing visual patterns absent from the reference site. No fix may introduce them.

**Multi-scope coexistence:** `state.json` holds areas from all scopes simultaneously. Running `/web-evolve /clients` only operates on areas where `page === "/clients"`. A pending `landing` area is unaffected. `last_scope` tracks the most recently active scope so a bare `/web-evolve` resumes it.

---

## Per-run flow

### Step 1 — Read state

Read `.web-evolve/state.json` at the project root.

- **Missing:** First run. Go to Step 1A.
- **Malformed JSON:** Rename to `.web-evolve/state.json.corrupt`, log `⚠ state.json corrupt — bootstrapping from scratch`, then go to Step 1A.
- **Present:** Filter areas by current scope. If no areas exist for the current scope (scope was switched mid-project, e.g. first time running `dashboard` when only `landing` areas were bootstrapped): execute Step 1A to bootstrap the new scope areas and add them to state.json, then go to Step 2.

**Step 1A — Bootstrap**

Create the state directory:
- Mac/Linux: `mkdir -p .web-evolve/`
- Windows (PowerShell): `New-Item -ItemType Directory -Force -Path ".web-evolve" | Out-Null`

Set `"project"` to the name of the project root directory (e.g. `"audithq-prod-live"`).

Execute the Area Enumeration procedure (see Area Enumeration section) for `[current scope]`. After enumeration is fully complete:

**Zero-match guard:** If enumeration produced zero areas, do NOT write state.json. Halt with: `⚠ No components found for scope [scope]. Check Area Enumeration glob paths and re-run.`

Otherwise, write `.web-evolve/state.json` **once** with:
- All discovered areas at `status: "pending"`, `"pass": 0`, `"function_verified": null`, `"issues": []`, `"fixes": []`, `"run": null`
- `"last_scope"`: for `landing` scope, write `"landing"`; for `dashboard` scope, write the specific first-picked route (e.g. `"/clients"`); for `/route` scope, write the route string.
- `"run_counter": 0`

One write, after enumeration is complete. Then go to Step 2.

### Step 2 — Pick target

1. First area with `status: "pending"` (never reviewed) — take it
2. None pending: lowest-scored area with `status: "needs-work"` — take it. Tiebreaker on equal scores: lower `priority` value first.
3. All `status: "done"` (≥ 85): report completion, suggest next scope, exit

Log: `▶ Target: [label] | [page] | [pending / needs-work: score]`

### Step 3 — Inspect

0. **Stale files check:** Before reading, verify every path in `area.files` exists on disk. If a file is missing (renamed or deleted since bootstrap): update `area.files` with the new path if you can find it (grep for the component name), or set `status: "needs-work"` with note `source-file-moved: [old path]` and go to Step 7.
1. Screenshot the area if browser MCP available (puppeteer or chrome-devtools). If browser MCP disconnects mid-step: continue with code-only assessment, note `browser-mcp: unavailable` in state, do not abandon the run.
2. Read the component file(s) from the area's `files` list. When `files` contains multiple entries: screenshot the first file (primary component), read all files. Fix operations apply to whichever file owns the failing dimension. Commit all changed files.
3. Read `tokens.lock.json` if present at project root — note `forbidden_additions`. If malformed: skip replication mode, log `⚠ tokens.lock.json malformed — proceeding without lock`. Treat as if `forbidden_additions` contains the common defaults (gradient_mesh, hover_scale, fade_up, glassmorphism, grain, grid_lines) to avoid introducing patterns that are typically locked out.

### Step 4 — Score

Score each dimension independently (see Scoring Rubric). Write to state:
- `dimensions` + `score`
- `run_counter` (global, in state root): **Always** increment by 1 when scoring a new area for the first time. Do NOT increment when re-scoring a `needs-work` area.
- `area.run`: **First score only** — set to the post-increment `run_counter` value. **Re-score** — keep the existing value unchanged. These are two separate actions; do not conflate them.
- `function_verified`: boolean — `true` if browser MCP was used to assess Function, `false` if code-only.
- `issues`: list every specific problem found (one string per issue, e.g. `"no hover state on primary CTA"`, `"pricing table overflows on 375px"`).
- `fixes`: set to `[]` — populated in Step 5.
- `pass`: keep existing value (already set to 0 at bootstrap); do not reset on re-score.

| Dimension | Max | Question |
|---|---|---|
| **Hook** | 25 | Does this area make the user act, lean in, or immediately understand the value? |
| **Visuals** | 25 | Does it look like 21st.dev / Awwwards quality, or like a shadcn default? |
| **Clarity** | 25 | Is every label, heading, and action obvious without thinking? |
| **Function** | 25 | Works on mobile, keyboard-accessible, all states handled (empty / loading / error)? |

### Step 5 — Fix (score < 85)

Route each failing dimension using the Fix Routing table. **One skill per dimension. Complete it before moving to the next.** After each skill call, append a one-line description of what changed to `area.fixes` in state.

**Fix order:** largest gap first (lowest dimension score first). If tied: `clarify` before `visual-uplift` before `overdrive` — cheaper fixes before heavier ones.

**Context budget check:**
- Before calling `web-page` (mode:rebuild): halt if you have called **any** skill earlier in this session — `web-page` is the heaviest call and warrants its own fresh context.
- Before calling `visual-uplift`, `overdrive`, `dashboard-design`, or `calibrate-amplitude`: halt if you have already called **2+** skills in this session.
- Halt message: `CONTEXT_BUDGET_EXCEEDED: start a fresh session to call [skill name]`. Before halting, write the current `pass` value to state.json. Do not proceed.
- "This session" = this conversation. The counter resets at the start of each new conversation (fresh context window). Re-invoking `/web-evolve` in a new conversation starts the skill-call counter at 0.

After each skill call: re-screenshot (if browser MCP available). Visible change required — if none, try the next skill in the dimension's list.

Track the pass number in `area.pass` in state (start at 0, increment before each pass). When all failing dimensions have been addressed for this pass, or `area.pass` reaches 2: go to Step 6. **Never exit from Step 5 directly** — always pass through Step 6 re-score then Step 7 commit, regardless of outcome. Persisting `pass` to state means a context flush mid-fix does not reset the counter.

### Step 6 — Re-score

Re-read all files in `area.files` plus any new `.tsx`/`.jsx` files created in the same directories by the fix skill. Re-screenshot if browser MCP available.

Apply the same rubric. Four mutually exclusive outcomes:

**A — Higher but < 85, pass 1:** Return to Step 5 for pass 2. (Do not go to Step 7 yet.)

**B — Higher but < 85, pass 2:** Set `status: "needs-work"`, note the specific remaining blocker. Go to Step 7.

**C — Lower than the immediately preceding score (regression):**
  - For modified files: `git checkout -- [file]`
  - For newly created files staged by the fix skill — Bash: `git rm --cached [file] && rm [file]`; PowerShell: `git rm --cached [file]; Remove-Item [file]`
  - For new files never staged: `rm [file]` (Bash) or `Remove-Item [file]` (PowerShell)
  - Re-score after revert. If score is back to pre-fix level: set `status: "needs-work"` with note `fix-regressed-all-passes`. If score is still above original but below pre-pass-2 level: set `status: "needs-work"` with note `fix-regressed-at-pass-[N]`.
  - Go to Step 7.

**D — ≥ 85:** Run the taste gate:
  - PowerShell: `python "$env:USERPROFILE\.claude\skills\taste-skill\data\check_taste.py" [changed-file]`
  - Bash (Mac/Linux/Git Bash/WSL): `python ~/.claude/skills/taste-skill/data/check_taste.py [changed-file]`
  - Exit 1 = banned pattern — fix it, re-score. Do NOT set `status: "done"` yet; loop back to taste gate after fix.
  - Exit 2 = script not found; note `taste-gate: skipped (script not found)` in run report, set `status: "done"`. Go to Step 7.
  - Exit 0 = passed. Set `status: "done"`. Go to Step 7.

### Step 7 — Commit and report

```bash
git add [changed files] .web-evolve/state.json
git commit -m "fix([area-id]): [label] [old]→[new score]"
```

If the commit is rejected by a pre-commit hook: fix the hook failure first. Do not update `status` to `"done"` until the commit succeeds. A `status: "done"` entry with no corresponding commit means the state is ahead of git — the next run will re-score it and find the same issues.

Output the Run Report (see Output Format), then stop.

---

## Scoring rubric

### Hook (0–25)
| Range | What it means |
|---|---|
| 20–25 | Clear value, compelling CTA, user knows exactly what to do next |
| 13–19 | Value present but CTA weak or copy generic |
| 6–12 | Value buried or CTA easy to miss |
| 0–5 | No clear value prop or no CTA |

**Hook calibration — 10 sales-page tests (each is pass/fail, use to anchor your score):**
1. What you do is above the fold — H1 + primary CTA visible on 1440×900 without scrolling
2. Outcome not process — headline says what the buyer gets, not how you do it
3. Specific not generic — numbers/names dominate over vague adjectives (>2:1)
4. One primary CTA per fold — no competing calls-to-action
5. Evidence before claim — testimonials or numbers anchor every assertion
6. Friction-free next step — form asks only what's needed to proceed
7. Problem-aware before solution — visitor sees their problem named before the pitch
8. Trust signals visible — credibility without scrolling to footer
9. Mobile CTA reachable — primary action reachable with thumb on mobile
10. Every section earns its place — no section that could be cut without changing the message

Score 20–25 if ≥ 8 pass. Score 13–19 if 5–7 pass. Score 6–12 if 3–4 pass. Score 0–5 if ≤ 2 pass.

### Visuals (0–25)
| Range | What it means |
|---|---|
| 20–25 | Specific, opinionated, polished — looks like it belongs on Awwwards or 21st.dev. A designer would say "that's intentional." |
| 13–19 | Designed but safe — shadcn/Tailwind defaults with a colour on top. Would look identical to 50 other SaaS products. See Fix Routing for the calibrate-amplitude → visual-uplift path. |
| 6–12 | Template aesthetic — bento grid, Inter/Geist everywhere, dark navy + gold, undifferentiated card grid, or similar AI-slop patterns. A designer would cringe. |
| 0–5 | Broken, unstyled, or visually non-existent. |

### Clarity (0–25)
| Range | What it means |
|---|---|
| 20–25 | Every label obvious without context, hierarchy sharp, user knows what to click without reading twice. A non-technical user could navigate unaided. |
| 13–19 | Mostly clear, one label or message needs a second read |
| 6–12 | Multiple labels require context to decode, or hierarchy misleads attention |
| 0–5 | A first-time visitor would be stuck or confused about what to do |

**Clarity calibration — 6 tests:**
1. Every button label says what it does — not "Submit", "OK", "Click here"
2. Every input has a visible label, not just placeholder text
3. Error messages say what went wrong and what to do next — not "An error occurred"
4. Empty states tell the user why it's empty and what action to take
5. Section headers tell the visitor what they're about to read — not vague decorative phrases
6. CTAs use active verbs ("Start free scan", not "Free scan" or "Learn more")

Score 20–25 if ≥ 5 pass. Score 13–19 if 3–4 pass. Score 6–12 if 1–2 pass. Score 0–5 if 0 pass.

### Function (0–25)
| Range | What it means |
|---|---|
| 20–25 | Mobile: renders without horizontal overflow at 375px viewport, all interactive elements ≥ 44×44px touch target. Keyboard: all actions reachable by Tab + Enter. All states handled and visually rendered: empty state shows a placeholder/message (not a blank white box), loading state shows a spinner/skeleton (not a frozen UI), error state shows an error message (not a silent failure). |
| 13–19 | Works but one state missing |
| 6–12 | Multiple functional gaps |
| 0–5 | Broken or inaccessible |

If Function cannot be verified (no dev server, no browser MCP): assess from code only. Mark `"function_verified": false` in state. A code-only Function score ≥ 20 still counts toward done — but flag it in the run report for human verification before shipping.

---

## Fix routing

Pass `lock:tokens.lock.json` as a first arg to every skill when `tokens.lock.json` exists at project root.

**If a skill is unavailable:** apply the fix directly in code. For Visuals: apply Tailwind class improvements and replace with a 21st.dev component via `mcp__magic__21st_magic_component_builder` directly. For Hook: edit copy in the file. For Function: fix the specific broken behaviour in code.

When `tokens.lock.json` exists at project root (and was successfully read in Step 3), prepend `lock:tokens.lock.json ` to every skill's args — e.g. `Skill('visual-uplift', args='lock:tokens.lock.json --execute src/components/Hero.tsx')`. If Step 3 logged a malformed warning, do not prepend the lock arg.

| Failing dimension | Visuals score | Page type | Skill to call |
|---|---|---|---|
| Visuals — generic/amplitude off | 13–19 | Any | `Skill('calibrate-amplitude', args='dial:0.75 [file]')` first — `0.75` pushes a generically-safe component toward distinctive (the 13–19 band needs MORE bold, not less; 0.75 is a conservative push toward 1.0=boldest). Adjust to `0.9` for maximum boldness. If Visuals still < 20 after → visual-uplift |
| Visuals — template/slop | 6–12 | Landing | Pass 1: `Skill('visual-uplift', args='--execute [file]')`. If still 6–12 after pass 1: score is now ≥ 85 total? → done. Total < 40? → rebuild. Otherwise: `status: "needs-work"` — do not add a 3rd pass. |
| Visuals — template/slop | 6–12 | Dashboard | Pass 1: `Skill('dashboard-design', args='[file]')` → `Skill('visual-uplift', args='--execute [file]')`. Same fallback logic as landing. |
| Visuals — broken or missing | 0–5 AND total < 50 | Any | `Skill('web-page', args='route:[route] mode:rebuild')` — too broken to refine in context |
| Visuals — broken or missing | 0–5 AND total ≥ 50 | Any | `Skill('visual-uplift', args='--execute [file]')` — other dimensions are passing; apply targeted styling only |
| Visuals 6–19 AND primary cause is motion | — | Any | `Skill('web-animations', args='[file]')` to pick tier → `Skill('animate', args='[file]')`. Use when animations are absent or wrong, not when layout/color is the core issue. Do NOT route here for Hook, Clarity, or Function failures. |
| Visuals 6–19 AND motion needs to be ambitious | — | Any | `Skill('overdrive', args='[file]')` — shaders, spring physics, scroll-driven. Do NOT route here for copy or layout failures. |
| Hook 13–19 — copy weak | — | Any | `Skill('clarify', args='[file]')` |
| Hook 6–12 — value buried | — | Any | `Skill('clarify', args='[file]')` then re-evaluate CTA placement in layout |
| Hook 0–5 — no CTA | — | Any | `Skill('web-page', args='route:[route] mode:rebuild')` — no CTA cannot be patched |
| Clarity 6–25 — copy/labels unclear | — | Any | `Skill('clarify', args='[file]')` |
| Clarity 0–5 — confusing/blocking | — | Any | `Skill('clarify', args='[file]')` — if Clarity re-score is still in the 0–5 band after 1 pass, escalate to `Skill('web-page', args='route:[route] mode:rebuild')` |
| Function 13–19 — one state missing | — | Any | Direct fix in file: add the missing empty/loading/error state component |
| Function 6–12 — multiple gaps | — | Any | `Skill('a11y-audit', args='[file]')` + direct fix for missing states |
| Function 0–5 — broken/inaccessible | — | Any | `Skill('web-page', args='route:[route] mode:rebuild')` |
| Personality, delight missing | — (only when total ≥ 60) | Any | `Skill('delight', args='[file]')` — do not add delight when the component has structural failures; fix those first |
| Total score < 40 | — | Any | `Skill('web-page', args='route:[route] mode:rebuild')` — full rebuild |

---

## Area enumeration

### Landing (`/web-evolve landing`)

Glob across: `src/components/landing/`, `src/components/sections/`, `src/components/layout/`, `src/app/(marketing)/`, `app/(marketing)/`. Map by filename pattern. When a pattern matches multiple files, pick by highest line count. Log all matches. Fallback globs (used when primary paths return nothing):

| ID | Primary patterns | Fallback |
|---|---|---|
All globs match `.tsx` and `.jsx`. Add `.vue` and `.svelte` fallbacks for non-React projects.

| ID | Primary patterns | Fallback |
|---|---|---|
| `hero-cta` | `*Hero*`, `*hero*` | `**/components/**/Hero*` |
| `pricing` | `*Pricing*`, `*pricing*` | `**/components/**/Pric*` |
| `nav` | `*Nav*`, `*Header*` | `**/components/**/Nav*` |
| `form` | `*Form*`, `*Signup*`, `*Subscribe*` | `**/components/**/*Form*` |
| `features` | `*Features*`, `*HowIt*` | `**/components/**/*Feature*` |
| `social-proof` | `*Testimonial*`, `*Trust*`, `*Review*` | `**/components/**/*Testimon*` |
| `footer` | `*Footer*` | `**/components/**/Footer*` |

| Priority | ID | Label | File pattern |
|---|---|---|---|
| 1 | `hero-cta` | Hero / primary CTA | `*Hero*`, `*hero*` |
| 2 | `pricing` | Pricing section | `*Pricing*`, `*pricing*` |
| 3 | `nav` | Navigation | `*Nav*`, `*Header*` |
| 4 | `form` | Primary form | `*Form*`, `*Signup*`, `*Subscribe*` |
| 5 | `features` | Features / how-it-works | `*Features*`, `*HowIt*` |
| 6 | `social-proof` | Testimonials / trust | `*Testimonial*`, `*Trust*`, `*Review*` |
| 7 | `footer` | Footer | `*Footer*` |

Skip any pattern that returns no file. Do not create state entries for components that do not exist.

### Route / dashboard (`/web-evolve /route` or `dashboard`)

**When scope is `dashboard` (all app routes):**

Discover routes before picking the first area:
1. **React Router / TanStack Router** — read `src/App.tsx`, `src/router.tsx`, or `src/routes.tsx`. Extract every `path=` or `<Route path=` value that is NOT in the public/marketing set (landing, pricing, about, contact, legal).
2. **Next.js (App Router)** — glob `app/**/page.tsx` excluding `(marketing)/` route group. Each directory is a route.
3. **Remix / Astro** — read `app/routes/` (Remix) or `src/pages/` (Astro). Extract authenticated routes by looking for auth guard imports or `loader` functions that check session.
3. Create one state group per discovered route. If no routes were discovered (empty App.tsx, no app/ pages): halt with `⚠ No app routes found for dashboard scope. Check router config path and re-run.` — do not write empty state.
4. Pick the first route with `status: "pending"` (alphabetical order as tiebreaker). This is the `last_scope` value that Step 1A will write to state.json. Log which route was picked in the run report — do not ask the user to choose.

**When scope is a specific `/route`:**

1. Find the page file: glob `**/pages/[slug]*.tsx` and `**/app/*[slug]*/page.tsx`
2. Read it, extract all named imports from `src/` (one level deep only)
3. Group into logical areas:

| Priority | ID | Label | What to look for |
|---|---|---|---|
| 1 | `[route]-data` | Primary data view | Component rendering the main list / table / grid |
| 2 | `[route]-stats` | Stats / metrics row | Stat cards, metric counts |
| 3 | `[route]-action` | Primary action | "New X" button, primary CTA |
| 4 | `[route]-filters` | Filters / controls | Filter bar, search, sort |
| 5 | `[route]-empty` | Empty state | Empty state component |

---

## State schema

```json
{
  "project": "audithq-prod-live",
  "last_scope": "landing",
  "run_counter": 2,
  "areas": [
    {
      "id": "hero-cta",
      "label": "Hero / primary CTA",
      "page": "landing",
      "priority": 1,
      "files": ["src/components/landing/HeroQuickScan.tsx"],
      "status": "done",
      "score": 91,
      "dimensions": { "hook": 24, "visuals": 22, "clarity": 23, "function": 22 },
      "function_verified": true,
      "issues": ["no animation on scan submit", "sub-headline generic"],
      "fixes": ["added loading state animation", "rewrote sub-headline"],
      "run": 2,
      "pass": 1
    },
    {
      "id": "pricing",
      "label": "Pricing section",
      "page": "landing",
      "priority": 2,
      "files": ["src/components/landing/PricingSection.tsx"],
      "status": "pending",
      "score": null,
      "dimensions": null,
      "function_verified": null,
      "issues": [],
      "fixes": [],
      "run": null,
      "pass": 0
    }
  ]
}
```

`status` progression: `"pending"` → `"done"` (direct, when first fix reaches ≥ 85) OR `"pending"` → `"needs-work"` → `"done"` (when multiple passes needed). `"needs-work"` is not mandatory.

---

## Output format

```
▶ web-evolve — run #[run_counter post-increment value] | scope: [last_scope]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Area:    [label]
File:    [primary file]

Before:  [N]/100  (Hook [N] | Visuals [N] | Clarity [N] | Function [N])   [re-work: use score from state.json | new area: "unscored"]
Issues:
  - [specific problem 1]
  - [specific problem 2]

[after fixing:]
After:   [N]/100  (Hook [N] | Visuals [N] | Clarity [N] | Function [N])
Fixes:
  - [what changed 1]
  - [what changed 2]

✅ Done — committed "fix([id]): [label] [before]→[after]"  [pass: N]
⚠ Needs more work — [specific blocker]. Re-run to retry.   ← use this line instead when status is needs-work
State: [N done] / [N needs-work] / [N pending] in scope [last_scope]
[if function_verified:false] ⚠ Function scored from code only — verify on a real device before shipping.
[if Visuals scored without screenshot] ⚠ Visuals scored from code only — confirm rendered output before treating as done.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Next:  [next area label] ([page]) — run /web-evolve to continue
```

If all areas done: `All [scope] areas ≥ 85. Try /web-evolve dashboard (or /web-evolve /[other-route]).`

---

## Anti-patterns

- **Declaring done before re-scoring.** Always re-apply the rubric after fixes — do not assume the fix worked.
- **Fixing adjacent things.** Fix only the specific issues identified in the failing dimension. Don't refactor the whole file because one button lacked a hover state. The fix scope is the issue, not the component.
- **Moving on at 84.** If the re-score is 84, fix the remaining gap or mark `needs-work`. Do not round up.
- **Inventing files.** Only add areas to state for components that exist on disk. Skip patterns that return no glob match.
- **Skipping the taste gate.** A visually polished component that passes slop patterns (bento default, Geist on everything) is not done.
- **Scope resume surprise.** After `/web-evolve dashboard`, `last_scope` is the specific route worked on (e.g. `/clients`). A bare `/web-evolve` resumes `/clients`, not `dashboard`. This is correct behaviour — print the active scope in the run header so the user isn't surprised.
- **Visual scoring without a screenshot.** Scoring Visuals from code alone produces unreliable results — compiled Tailwind class names don't tell you what actually renders. If browser MCP is unavailable: note "Visuals assessed from code only" in the run report and accept that the score has higher uncertainty.
- **Setting `status: "done"` before the commit succeeds.** State is only authoritative when git agrees. If the commit fails, revert the status and fix the commit blocker first.
- **Using stale `area.files`.** If a source file has been renamed or deleted since the area was bootstrapped, the files list is stale. Before Step 3, verify each path in `area.files` exists. If missing: update `area.files` with the new path, or mark `status: "needs-work"` with note `source-file-moved`.
- **Incrementing `run_counter` during a regression revert.** A revert does not count as a new run. Do not increment `run_counter` when reverting; it only increments on first-score of a new area.
- **Routing by skill name rather than dimension.** Calling `overdrive` because you want animation doesn't mean the Visuals dimension is failing. Check the score first. Calling `clarify` for a Visuals failure makes no sense. Always route by the lowest-scoring dimension, not by what sounds good.

---

## References

This skill is self-contained — all logic lives in this SKILL.md.

`references/archive/` contains the previous v1 engine (multi-phase bash-script orchestrator, Phases A–F, Awwwards tier contracts, critique briefings, fix-routing table, decisions log). Archived 2026-05-29. Do not invoke files from archive/.
