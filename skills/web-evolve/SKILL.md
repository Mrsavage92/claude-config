---
name: web-evolve
disallowed-tools: AskUserQuestion
description: Session-scoped website improvement loop. One run = one area scored /100 (Hook + Visuals + Clarity + Function), fixed to ≥85, confirmed, persisted. Re-run to advance to the next area automatically. Zero decisions required. Scope with an arg or omit to continue last scope. Use when improving an existing site iteratively — landing pages, dashboard routes, any specific page.
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

---

## Definitions

- **Project root** — the directory containing `package.json`. Run `git rev-parse --show-toplevel` if in doubt.
- **Scope** — the page group being worked on: `landing`, `dashboard`, or a specific route string like `/clients`.
- **Area** — one logical UI unit (hero section, pricing table, nav, etc.) with a `page` field matching the scope.
- **`run` counter** — the sequential run number that first scored this area. Set once on first score, never updated on re-score.
- **`forbidden_additions`** — field in `tokens.lock.json` listing visual patterns absent from the reference site. No fix may introduce them.

**Multi-scope coexistence:** `state.json` holds areas from all scopes simultaneously. Running `/web-evolve /clients` only operates on areas where `page === "/clients"`. A pending `landing` area is unaffected. `last_scope` tracks the most recently active scope so a bare `/web-evolve` resumes it.

---

## Per-run flow

### Step 1 — Read state

Read `.web-evolve/state.json` at the project root.

- **Missing:** First run. Go to Step 1A.
- **Malformed JSON:** Rename to `.web-evolve/state.json.corrupt`, log `⚠ state.json corrupt — bootstrapping from scratch`, then go to Step 1A.
- **Present:** Filter areas by current scope. Go to Step 2.

**Step 1A — Bootstrap**

Create the state directory: run `mkdir -p .web-evolve/` before any file write.

Enumerate areas for the current scope (see Area Enumeration). Write `.web-evolve/state.json` with all areas at `status: "pending"`. Then go to Step 2.

### Step 2 — Pick target

1. First area with `status: "pending"` (never reviewed) — take it
2. None pending: lowest-scored area with `status: "needs-work"` — take it
3. All `status: "done"` (≥ 85): report completion, suggest next scope, exit

Log: `▶ Target: [label] | [page] | [pending / needs-work: score]`

### Step 3 — Inspect

1. Screenshot the area if browser MCP available (puppeteer or chrome-devtools). If browser MCP disconnects mid-step: continue with code-only assessment, note `browser-mcp: unavailable` in state, do not abandon the run.
2. Read the component file(s) from the area's `files` list
3. Read `tokens.lock.json` if present at project root — note `forbidden_additions`. If malformed: skip replication mode, log `⚠ tokens.lock.json malformed — proceeding without lock`, continue.

### Step 4 — Score

Score each dimension independently (see Scoring Rubric). Write `dimensions` + `score` to state.

| Dimension | Max | Question |
|---|---|---|
| **Hook** | 25 | Does this area make the user act, lean in, or immediately understand the value? |
| **Visuals** | 25 | Does it look like 21st.dev / Awwwards quality, or like a shadcn default? |
| **Clarity** | 25 | Is every label, heading, and action obvious without thinking? |
| **Function** | 25 | Works on mobile, keyboard-accessible, all states handled (empty / loading / error)? |

### Step 5 — Fix (score < 85)

Route each failing dimension using the Fix Routing table. **One skill per dimension. Complete it before moving to the next.**

**Fix order:** largest gap first (lowest dimension score first). If tied: `clarify` before `visual-uplift` before `overdrive` — cheaper fixes before heavier ones.

**Context budget check:** Before calling `web-page` or `visual-uplift`, if the session has already consumed > 100k tokens, note the risk in the run report and recommend starting a fresh session for that fix. Do not attempt a heavy skill call when the window is nearly full — an incomplete run produces broken state.

After each skill call: re-screenshot (if browser MCP available). Visible change required — if none, try the next skill in the dimension's list.

Max 2 full fix passes per run. Still < 85 after pass 2: set `status: "needs-work"`, note the specific blocker, commit current state, exit. Next run retries this area.

**Taste gate:** Before declaring ≥ 85 done, run:
- Windows: `python "$env:USERPROFILE\.claude\skills\taste-skill\data\check_taste.py" [changed-file]`
- Mac/Linux: `python ~/.claude/skills/taste-skill/data/check_taste.py [changed-file]`

Exit 1 = banned pattern present, fix before committing. Exit 2 = script not found, skip gate and note in run report.

### Step 6 — Re-score

Re-read all files in `area.files` plus any new `.tsx`/`.jsx` files created in the same directories by the fix skill. Re-screenshot if browser MCP available.

Apply the same rubric. 

- Re-score **higher** than pre-fix and ≥ 85: `status: "done"`.
- Re-score **higher** but < 85: `status: "needs-work"`, note remaining blocker, continue to Step 7.
- Re-score **lower** than pre-fix: the fix made things worse. Run `git checkout -- [changed files]` to revert. Set `status: "needs-work"` with note `fix-regressed: [dimension]`. Commit only the reverted state. Exit — do not retry in this session.

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
| 20–25 | Specific, opinionated, polished — looks like it belongs on Awwwards or 21st.dev |
| 13–19 | Designed but safe — shadcn/Tailwind defaults with a colour on top. If the component renders correctly but feels generically loud/quiet/safe rather than specifically broken, route to `calibrate-amplitude` before `visual-uplift`. |
| 6–12 | Template aesthetic — bento grid, Inter everywhere, dark navy + gold, or similar |
| 0–5 | Broken, unstyled, or visually non-existent |

### Clarity (0–25)
| Range | What it means |
|---|---|
| 20–25 | Every label obvious, hierarchy sharp, nothing requires thought |
| 13–19 | Mostly clear, one label or message needs decoding |
| 6–12 | Multiple unclear labels or misleading hierarchy |
| 0–5 | Confusing enough to block the user |

### Function (0–25)
| Range | What it means |
|---|---|
| 20–25 | Mobile works, keyboard works, all states (empty / loading / error) handled |
| 13–19 | Works but one state missing |
| 6–12 | Multiple functional gaps |
| 0–5 | Broken or inaccessible |

If Function cannot be verified (no dev server, no browser MCP): assess from code only. Mark `"function_verified": false` in state. A code-only Function score ≥ 20 still counts toward done — but flag it in the run report for human verification before shipping.

---

## Fix routing

Pass `lock: tokens.lock.json` as a first arg to every skill when `tokens.lock.json` exists at project root.

**If a skill is unavailable:** apply the fix directly in code. For Visuals: apply Tailwind class improvements and replace with a 21st.dev component via `mcp__magic__21st_magic_component_builder` directly. For Hook: edit copy in the file. For Function: fix the specific broken behaviour in code.

When `tokens.lock.json` exists at project root, prepend `lock:tokens.lock.json ` to every skill's args. Example: `Skill('visual-uplift', args='lock:tokens.lock.json --execute src/components/Hero.tsx')`.

`forbidden_additions` is a field in `tokens.lock.json` listing visual patterns the reference site does not use (e.g. gradient_mesh, hover_scale). No fix skill may introduce those patterns.

| Failing dimension | Visuals score | Page type | Skill to call |
|---|---|---|---|
| Visuals — generic/amplitude off | 13–19 | Any | `Skill('calibrate-amplitude', args='dial:0.6 [file]')` first; if still failing → visual-uplift |
| Visuals — template/slop | 6–12 | Landing | `Skill('visual-uplift', args='--execute [file]')` — routes to mcp__magic / typeset / animate / colorize / overdrive |
| Visuals — template/slop | 6–12 | Dashboard | `Skill('dashboard-design', args='[file]')` → `Skill('visual-uplift', args='--execute [file]')` |
| Visuals — broken or missing | 0–5 | Any | `Skill('web-page', args='route:[route] mode:rebuild')` — score too low to refine |
| Motion weak or missing | — | Any | `Skill('web-animations', args='[file]')` to pick tier → `Skill('animate', args='[file]')` |
| Motion — push further | — | Any | `Skill('overdrive', args='[file]')` |
| Hook, copy, CTA | — | Any | `Skill('clarify', args='[file]')` |
| Personality, delight missing | — | Any | `Skill('delight', args='[file]')` |
| Function — accessibility | — | Any | `Skill('a11y-audit', args='[file]')` — find dev server port from `package.json` scripts.dev |
| Total score < 40 | — | Any | `Skill('web-page', args='route:[route] mode:rebuild')` — full rebuild |

---

## Area enumeration

### Landing (`/web-evolve landing`)

Glob `src/components/landing/`, `src/components/sections/`, `src/components/layout/`. Map by filename pattern. When a pattern matches multiple files, pick the one whose filename most closely matches the area ID (e.g. `HeroQuickScan.tsx` over `HeroVisual.tsx` for `hero-cta`). Log all matches in the run report so the user can correct if wrong.

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
1. **React Router projects** — read `src/App.tsx` or `src/router.tsx`. Extract every `path=` or `<Route path=` value that is NOT in the public/marketing set (landing, pricing, about, contact, legal). These are the app routes.
2. **Next.js projects** — glob `app/**/page.tsx` excluding `(marketing)/` route group. Each directory is a route.
3. List discovered routes to the user in the run report before picking the first.
4. Create one state group per route. Pick the highest-priority route with `status: "pending"` to work on this session.

Set `last_scope` to the specific route worked on (e.g. `/clients`), not `"dashboard"` — so a bare `/web-evolve` resumes that route correctly.

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
      "issues": ["no animation on scan submit", "sub-headline generic"],
      "fixes": ["added loading state animation", "rewrote sub-headline"],
      "run": 2
    },
    {
      "id": "pricing",
      "label": "Pricing section",
      "page": "landing",
      "priority": 2,
      "files": ["src/components/landing/PricingSection.tsx"],
      "status": "pending",
      "score": null,
      "dimensions": null
    }
  ]
}
```

`status` progression: `"pending"` → `"needs-work"` → `"done"`

---

## Output format

```
▶ web-evolve — run #N | scope: [page]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Area:    [label]
File:    [primary file]

Before:  [N]/100  (Hook [N] | Visuals [N] | Clarity [N] | Function [N])
Issues:
  - [specific problem 1]
  - [specific problem 2]

[after fixing:]
After:   [N]/100  (Hook [N] | Visuals [N] | Clarity [N] | Function [N])
Fixes:
  - [what changed 1]
  - [what changed 2]

✅ Done — committed "fix([id]): [label] [before]→[after]"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Next:  [next area label] ([page]) — run /web-evolve [scope] to continue
```

If all areas done: `All [scope] areas ≥ 85. Try /web-evolve dashboard (or /web-evolve /[other-route]).`

---

## Anti-patterns

- **Declaring done before re-scoring.** Always re-apply the rubric after fixes — do not assume the fix worked.
- **Fixing adjacent things.** Fix only the specific issues identified in the failing dimension. Don't refactor the whole file because one button lacked a hover state. The fix scope is the issue, not the component.
- **Moving on at 84.** If the re-score is 84, fix the remaining gap or mark `needs-work`. Do not round up.
- **Inventing files.** Only add areas to state for components that exist on disk. Skip patterns that return no glob match.
- **Skipping the taste gate.** A visually polished component that passes slop patterns (bento default, Geist on everything) is not done.
- **Scope contamination.** After `/web-evolve dashboard`, `last_scope` is set to the specific route worked on, not `"dashboard"`. A bare `/web-evolve` resumes that route — correct behaviour, but always print the active scope in the run header so the user isn't surprised.
- **Setting `status: "done"` before the commit succeeds.** State is only authoritative when git agrees. If the commit fails, revert the status and fix the commit blocker first.

---

## References

This skill is self-contained — all logic lives in this SKILL.md.

`references/archive/` contains the previous v1 engine (multi-phase bash-script orchestrator, Phases A–F, Awwwards tier contracts, critique briefings, fix-routing table, decisions log). Archived 2026-05-29. Do not invoke files from archive/.
