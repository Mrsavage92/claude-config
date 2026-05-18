# /web-evolve - Phase Protocols (Phase A through Phase F)

_Archived from `decisions.md` 2026-05-18 to keep that file under the 1000-line lint cap. These are operational implementation details for the loop's phases - the active decisions/rules live in `decisions.md`._

_To read the active decisions, see `decisions.md`. To read the phase implementations (this file), look for the phase by name._

---

# Phases A/B/C only - D/E/F moved to phase-protocols-def.md

## Phase A — Setup

**Run all reads in parallel (single message):**

1. Read simultaneously: `{project_path}/CLAUDE.md`, `{project_path}/CONTEXT.md`, `{project_path}/DESIGN-BRIEF.md`, `{project_path}/SCOPE.md`, `{project_path}/BUILD-LOG.md`, `~/.claude/web-system-prompt.md` (**Design DNA** — token system, typography scale, color discipline, visual signatures. Cardinal Rule 13 — loaded once, re-cited in every Skill() args block), `~/.claude/skills/web-evolve/references/tier-contracts.md` (canonical tier table + `/web-review` 38/40 → target_score mapping), and the local DESIGN-BRIEF.md (21st.dev component lock — used by Step 3 Case B for builder pipeline)

1.5 **Apply target-tier behaviour (auto from Phase A.0) — MANDATED, not "enabled":**

   Read `target_score` from Phase A.0 decision. The agents below are MANDATORY for their tier. "Enable" was the old wording — actual semantics is "MUST RUN OR HALT NEEDS_HUMAN." Skipping them to save tool calls is a route-around (Run #2 on Orbit Digital 2026-05-16 skipped all three at target=98 — this gate now prevents that).

   - `target ≥ 95` → mobile_loop MUST be set, and ALL of these MUST fire in Phase B:
     - `Skill('a11y-audit', ...)` — accessibility WCAG 2.2 audit
     - `Skill('seo-strategy', ...)` — site-wide SEO audit
     - `Skill('critique', ...)` — UX critique with persona-based testing + anti-pattern detection
     - Set `visual_quality_exit_floor = 4.5`
     If ANY of these three fails to fire (skill unavailable, agent error, orchestrator deliberately skipped) → trajectory.json `status: "mandated_agents_skipped"` (per Cardinal Rule 14 Gate D — see below) AND user-facing summary leads with `⚠️ MANDATED AGENTS SKIPPED — re-run required.`
   - `target ≥ 98` → all of the above PLUS:
     - `chrome-devtools-mcp` MUST be connected (Phase G.5 auto-install + HALT path enforces this)
     - Phase R MUST produce `.evolution/top-tier-references.json` (P4 below — Phase R gate)
     - Phase R signature commitment MUST be singular (Cardinal Rule 17 — P1 above)
   - `target = 100` → tighter perf gates (LCP < 1.5s, INP < 100ms, CLS < 0.01), foundry typography mandatory, custom cursor required, View Transitions on every route

   Log: `"Tier behaviour: target {target}/100 → MANDATED agents: {list}. HALT if any cannot fire."`

   **Add Gate D to Cardinal Rule 14 evaluation** (Phase F.7 reads this):
   - Gate D — `mandated_agents_effective_count` per tier (P7 fix — counts ARTIFACTS, not firings):
     - target 95+: requires ALL of these artifact files to exist + parse as valid JSON:
       - `${PROJECT_PATH}/.evolution/a11y.json` (from `Skill('a11y-audit')`)
       - `${PROJECT_PATH}/.evolution/seo.json` (from `Skill('seo-strategy')`)
       - `${PROJECT_PATH}/.evolution/critique.json` (from `Skill('critique')` cross-check at Phase B)
     - target 98+: above 3 + `${PROJECT_PATH}/.evolution/perf-trace.json` (from chrome-devtools-mcp).
     - For each artifact: check exists AND is non-empty AND parses as JSON. Count is the number that pass all three checks. Firing the skill but producing no artifact = doesn't count.
     - If `count < required` → status `mandated_agents_skipped` with detail string listing which artifacts are missing/malformed.
   - This catches: skill invoked but errored, skill invoked but returned text instead of JSON, skill invoked but wrote to wrong path. ALL of these previously counted as "fired" under the original spec.

1.6 **Multi-page detection:**
   - If `--pages` flag provided → parse comma-separated list into `pages_to_evolve`
   - Else → read SCOPE.md for `## Page Inventory`. If found, default to first page (landing). If absent, default to `["/"]`.
   - Phase C will loop over `pages_to_evolve`. Each page gets its own `.evolution/{page-slug}/` subdir, its own loop-state, its own iteration cap. Phase D produces one EVOLUTION-LOG.md covering all pages.

1.7 **Branch isolation (unless `--no-branch`):**
   ```bash
   git -C "{project_path}" status --porcelain
   ```
   - If clean → `git -C "{project_path}" checkout -b "evolve/$(date +%Y-%m-%d-%H%M)"`
   - If dirty → HALT NEEDS_HUMAN: "Working tree dirty. Commit or stash before running web-evolve, or pass `--no-branch` to evolve current branch."
   - Log new branch name to BUILD-LOG.md.
   - Phase D's final commit goes to this branch. Merge to main is a user decision after reviewing EVOLUTION-LOG.md.

2. **Loop state handling — automated, not asked.** Phase A.0 already decided `mode` (resume / advance / fresh). For this step:
   - `mode == "resume"` → restore `.evolution/loop-state.json`, skip Phases A.1.5–A.8.7 and Phase B, jump to Phase C. The user will see "Resuming Run #N at iteration {it}" in the A.0.10 echo.
   - `mode == "advance"` → archive last run's loop-state.json to `.evolution/archive/run-{last_run_id}-loop-state.json` (in case user wants to inspect), then create fresh loop-state.json for the new run.
   - `mode == "fresh"` → if loop-state.json exists, archive then overwrite. No "are you sure" — the user passed `--fresh` or there was no trajectory, both intentional.

3. Detect mode: DESIGN-BRIEF.md exists AND `src/components/landing/` non-empty → `backfill`. Else → `greenfield`.

4. Extract personality — try in order:
   - `grep "^personality:" {project_path}/DESIGN-BRIEF.md` (top-level field)
   - `grep "Personality type:" {project_path}/DESIGN-BRIEF.md` (section heading)
   - Default: `Enterprise Authority` — log assumption to BUILD-LOG.md

5. Determine benchmark URL from personality:
   - Enterprise Authority → `https://stripe.com`
   - Data Intelligence → `https://linear.app`
   - Growth Engine → `https://vercel.com`
   - Trusted Productivity → `https://notion.so`
   - High-tier Professional → `https://framer.com`
   - Bold Operator → `https://shopify.com`
   - Health & Care / Civic → user must specify `--benchmark=URL`

6. Verify `live_url` returns 200:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" "{live_url}"
   ```
   HALT if not 200.

6.5 **ENVIRONMENT PROBE — sub-agent resolution check:**

   Attempt to spawn a minimal Agent with `subagent_type: "web-score"`. If it errors with "Agent type not found" → set `USE_GENERAL_PURPOSE_FALLBACK = true` and log:
   ```
   ⚠️  web-score subagent_type not registered in this environment (Windows VS Code extension or non-standard install).
   Switching all Phase B/C agent calls to general-purpose mode.
   Agent spec paths will be injected into each prompt.
   ```

   **When USE_GENERAL_PURPOSE_FALLBACK = true**, every agent call in Phase B and Phase C that uses `subagent_type: "web-score"` etc. must instead use:
   ```
   subagent_type: "general-purpose"
   prompt: |
     Read your agent spec first: ~/.claude/agents/{agent_name}.md
     Then execute it with these inputs:
     {original prompt body}
   ```
   
   Where `{agent_name}` is `web-score`, `web-benchmark`, `web-screenshot`, or `web-patch` as appropriate.
   
   This fallback is transparent — the same JSON output format, the same file paths, the same behaviour. The only difference is the model routing and tool permissions come from `general-purpose` rather than the specialist agent definition.

7. Create `.evolution/` directories (four separate calls):
   ```bash
   mkdir -p "{project_path}/.evolution/baseline"
   mkdir -p "{project_path}/.evolution/benchmark"
   mkdir -p "{project_path}/.evolution/scores"
   mkdir -p "{project_path}/.evolution/final"
   ```

7.5 **VISUAL QUALITY GATE — via `Skill('critique')`, NOT self-scored (P3 fix):**

   **Step 7.5.a — Capture baseline screenshot to mandated path (P11):**
   ```
   mcp__chrome-devtools__new_page(url={live_url})
   mcp__chrome-devtools__resize_page(width=1440, height=900)
   mcp__chrome-devtools__take_screenshot(filePath="${PROJECT_PATH}/.evolution/baseline/probe-1440.png")
   ```
   The screenshot MUST be saved to `${PROJECT_PATH}/.evolution/baseline/probe-1440.png` (chrome-devtools writes the file directly to `filePath` — no copy step needed). Cardinal Rule 8 reads this exact path at exit-attempt — without it, post-run VQ comparison has no anchor.

   (Puppeteer fallback if chrome-devtools unavailable: `mcp__puppeteer__puppeteer_navigate` + `puppeteer_screenshot` → then `cp <puppeteer_path> "${PROJECT_PATH}/.evolution/baseline/probe-1440.png"`.)

   **Step 7.5.b — Compute baseline VQ via `Skill('critique')` (NOT orchestrator self-score):**

   Same independent measurement as Cardinal Rule 8 post-run. Self-scoring was the loophole that defeated Rules 8 + 14 even after they were patched — closing it at the baseline side too.

   ```
   Skill('critique', args='baseline-mode | screenshots: ["${PROJECT_PATH}/.evolution/baseline/probe-1440.png"] | output_format: json | output_schema: {dimensions: [{name, score_0_to_5, evidence_summary, screenshot_hash}], aggregate_vq: number, screenshots_analyzed: [{path, sha256}]} | dimensions: hero-impact, hierarchy, distinctiveness, product-visibility | tier: {target}')
   ```

   Orchestrator computes sha256 of the screenshot file before invoking critique, validates the returned `screenshots_analyzed[0].sha256` matches (same hash verification as Cardinal Rule 8). If mismatch → REJECT, retry once, then HALT NEEDS_HUMAN.

   Parse `aggregate_vq` from critique's JSON output → `visual_quality_score`. Schema validation: must be in [0, 5]. Reject + retry if malformed.

   **If `Skill('critique')` unavailable at this stage** → HALT NEEDS_HUMAN: `"Baseline VQ measurement requires Skill('critique'). Run cannot proceed at target ≥ 90 without it (self-scoring banned per Cardinal Rule 8 + memory:feedback_no_self_quality_claims)."` No silent fallback to orchestrator scoring.

   **If visual_quality_score < 3.0 → INSERT these at the VERY START of the Phase C iteration queue (BEFORE checklist-driven checks):**
   - VQ-1: `Skill('impeccable')` on the hero section with BOLD execution mandate
   - VQ-2: `Skill('layout')` on the features/main content section
   - VQ-3: `Skill('calibrate-amplitude', args='bolder')` on overall visual weight
   
   **These visual overhaul iterations run FIRST regardless of what the checklist priority queue says.** Only after VQ-1/2/3 are KEPT does the normal checklist queue begin.
   
   **Re-evaluation:** After each VQ iteration that targets a visual check (A7, A9, D4, D5, F6, K2, K4), re-run the visual quality assessment. If visual_quality_score rises above 4.0, the forced VQ queue clears and the normal checklist queue resumes. If after all 3 VQ iterations the score is still < 3.0 → surface NEEDS_HUMAN.
   
   Log: `visual_quality_score: {score}/5 → {inserted VQ iterations | skipped (score >= 3.0)}`

8. **Discover CSS selectors for scroll targeting (hybrid grep + live DOM):**

   **Step 8a — grep source** (fast path):
   ```bash
   grep -nE 'id="[^"]*"' "{project_path}/src/pages/index.tsx" 2>/dev/null || grep -nE 'id="[^"]*"' "{project_path}/src/app/page.tsx" 2>/dev/null
   grep -rhE 'id="[^"]+"' "{project_path}/src/components/landing/" 2>/dev/null
   ```

   **Step 8b — live DOM verification** (catches runtime-generated IDs grep misses):
   ```
   mcp__chrome-devtools__navigate_page(url={dev_server_url or live_url}, type="url")
   mcp__chrome-devtools__evaluate_script(function=`() => {
     const ids = Array.from(document.querySelectorAll('[id]')).map(el => ({
       id: el.id,
       tag: el.tagName.toLowerCase(),
       text: el.textContent?.slice(0,40),
       y: el.getBoundingClientRect().top + window.scrollY
     })).sort((a,b) => a.y - b.y);
     const datasections = Array.from(document.querySelectorAll('[data-section]')).map(el => ({
       selector: '[data-section="' + el.dataset.section + '"]',
       section: el.dataset.section,
       y: el.getBoundingClientRect().top + window.scrollY
     }));
     return { ids, datasections };
   }`)
   ```

   Merge grep + DOM results. Build `section_selectors` map (e.g. `{"hero": "#hero", "features": "#features", "pricing": "#pricing"}`). Prefer `[data-section]` when present. Use `""` (empty — scroll to top) for any section without a discovered id. This map is used in Steps 2 and 4 to pass `scroll_to_selector` to web-screenshot.

8.5 **Fire `Skill('impeccable')` with `args: 'teach'` ONCE per project (Cardinal Rule 12):**

   Check if `.evolution/design-context.md` exists with `Generated:` date ≤ 30 days:
   - YES → skip, read existing file into loop state as `design_context`
   - NO or stale → fire now:
     ```
     Skill('impeccable', args='teach | project: {project_path} | personality: {personality} | design_brief: {project_path}/DESIGN-BRIEF.md | context: {project_path}/CONTEXT.md | design_dna: ~/.claude/web-system-prompt.md | output: {project_path}/.evolution/design-context.md')
     ```
   - Read the produced `.evolution/design-context.md`. This text is **appended to every refinement Skill() args string in Phase C** under the marker `| design_context: {first 800 chars}`. This is how typeset, colorize, etc. avoid producing generic output.
   - Log: `"impeccable teach: {NEW | CACHED} → design-context.md ready"`

8.6 **If `--high-tier` AND DESIGN-BRIEF.md Trend Pulse is >30 days old or missing:**

   Refresh trend pulse via WebSearch:
   ```
   WebSearch(query="awwwards site of the year 2026 {industry from CONTEXT.md} winners")
   WebSearch(query="godly.website {personality} 2026 trending design patterns")
   ```
   Update DESIGN-BRIEF.md `## Trend Pulse` section with top 5 patterns and `search_date: {today}`. This blocks personality drift on long-running projects.

8.7 **If `--benchmark-search` set:**

   Auto-pick a benchmark via WebSearch instead of the personality table:
   ```
   WebSearch(query="awwwards {industry} {personality} winner 2026 site:awwwards.com")
   WebSearch(query="godly.website {industry} top sites")
   ```
   Score top 3 candidates by:
   - Page weight < 2MB (fetch with WebFetch, count bytes)
   - At least 5 sections detectable
   - Has hero animation (regex `motion|gsap|three|lottie` in returned HTML)
   Select highest score. Set `benchmark_url` and `benchmark_name`. Log the choice + reasoning to BUILD-LOG.md.

9. Echo confirmation to user and wait:
   ```
   web-evolve starting
   Mode: {mode} | Cap: {max_iterations} | Target: {target_score}/100
   Benchmark: {benchmark_url}
   Loop screenshots: {dev_server_url if set, else "live URL — 45s wait per commit"}
   Pages in scope: {from SCOPE.md}
   Proceed?
   ```

9. **DESIGN-BRIEF.md missing → auto-generate, do NOT halt:**

   If DESIGN-BRIEF.md does not exist, generate a minimal one from codebase inspection before proceeding. Do NOT halt. Follow these steps:

   ```
   a) Grep for font imports in layout.tsx / globals.css → identify display + body fonts
   b) Grep for color tokens (hsl vars, oklch values) in globals.css → identify palette
   c) Grep src/app/page.tsx for imported section components → identify page structure
   d) Take a Puppeteer screenshot at 1440×900 → assess visual direction
   e) Map to nearest personality from Step 4's table based on: industry keywords in
      page.tsx/metadata, color temperature (warm/cool/neutral), typography style (serif/sans)
   f) Write DESIGN-BRIEF.md to project_path with: personality, aesthetic_direction,
      colour palette (observed), typography (observed), hero description (from screenshot),
      and a ## Trend Pulse stub with search_date = today and placeholder lists
   g) Compute confidence score for the personality mapping:
      - HIGH (3 signals agree: industry keywords + color temp + typography style) → proceed silently
      - MEDIUM (2 signals agree) → log: "⚠️ DESIGN-BRIEF auto-generated with MEDIUM confidence. Personality: {X}. If wrong, edit DESIGN-BRIEF.md before continuing."
      - LOW (only 1 signal or signals conflict) → surface to user: "Personality auto-detected as {X} but signals conflict. Does '{X}' match your product? (or tell me: enterprise/growth/high-tier/bold/health)" — wait for one-word reply, update DESIGN-BRIEF, then proceed.
   
   h) Log: "DESIGN-BRIEF.md auto-generated from codebase inspection. Confidence: {HIGH|MEDIUM|LOW}."
   ```

   This replaces the old HALT with a 30-second auto-detect. HIGH confidence: fully unblocked. LOW confidence: one-question user check before proceeding — still faster than halting entirely.

---

## Phase B — Parallel baseline audit (4 score agents + benchmark + deep signals)

For Tier 2 baseline, spawn agents in a single message (all `run_in_background: true`) to prevent 79-check drift in one context. The standard spawn count is **5** (4 score + 1 benchmark). When **Phase A.0 set target_score ≥ 95**, add **3 more** (a11y, seo, critique) and **1 inline** (PageSpeed or chrome-devtools-mcp) for **9 total signals** before merging. (Previously gated on `--high-tier` — now auto-gated on target_score.)

```
Agent 1 — web-score (A+B categories, ~19 checks):
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {live_url}
    output_path: {project_path}/.evolution/scores
    tier: category:A,B
    mode: {mode}
    output_filename: score-AB.json
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md

Agent 2 — web-score (C+D+E categories, ~24 checks):
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {live_url}
    output_path: {project_path}/.evolution/scores
    tier: category:C,D,E
    mode: {mode}
    output_filename: score-CDE.json
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md

Agent 3 — web-score (F+G+H categories, ~12 checks):
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {live_url}
    output_path: {project_path}/.evolution/scores
    tier: category:F,G,H
    mode: {mode}
    output_filename: score-FGH.json
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md

Agent 4 — web-score (I+J+K categories, ~20 checks):
  subagent_type: "web-score"
  run_in_background: true
  prompt: |
    project_path: {project_path}
    live_url: {live_url}
    output_path: {project_path}/.evolution/scores
    tier: category:I,J,K
    mode: {mode}
    output_filename: score-IJK.json
    checklist_path: ~/.claude/skills/shared/landing-page-checklist.md

Agent 5 — web-benchmark:
  subagent_type: "web-benchmark"
  run_in_background: true
  prompt: |
    benchmark_url: {benchmark_url}
    benchmark_name: {benchmark_name}
    target_page_description: {aesthetic_direction + hero description from DESIGN-BRIEF.md}
    target_personality: {personality}
    output_path: {project_path}/.evolution/benchmark
    fetch_html: true                       # NEW — pull raw HTML via WebFetch
    extract_sections: true                 # NEW — parse benchmark section structure
    extract_color_tokens: true             # NEW — pull computed CSS custom props from :root

(if target ≥ 95) Agent 6 — a11y-audit:
  Skill('a11y-audit', args='url: {live_url} | mode: audit-only | output: {project_path}/.evolution/a11y.json | wcag_level: AA')
  Run in background.

(if target ≥ 95) Agent 7 — seo-strategy:
  Skill('seo-strategy', args='url: {live_url} | mode: audit | output: {project_path}/.evolution/seo.json | check: meta+og+jsonld+headings+image-alt+sitemap+robots+canonical')
  Run in background.

(if target ≥ 95) Agent 8 — /critique cross-check:
  Skill('critique', args='url: {live_url} | mode: scored | output: {project_path}/.evolution/critique.json | dimensions: hierarchy,IA,emotional,cognitive-load,anti-pattern-detection')
  Run in background.
```

Wait for all (5 standard, 8 with --high-tier) to complete.

**Inline performance trace — chrome-devtools-mcp when available, PageSpeed Insights fallback:**

**Primary path (target ≥ 98 OR chrome-devtools-mcp connected):**

Real Chrome trace via the official Chrome DevTools MCP server (launched Sept 2025):
```
mcp__chrome-devtools__performance_start_trace(
  url={live_url},
  reload=true,
  autoStop=true,
  network_throttling="Slow 4G",
  cpu_throttling=4
)
mcp__chrome-devtools__performance_stop_trace()
mcp__chrome-devtools__performance_analyze_insight(
  trace_id={returned trace id},
  insights=["LCPBreakdown","INPBreakdown","CLSCulprits","DocumentLatency","RenderBlocking","ThirdPartyImpact","ImageDelivery","FontDisplay","MainThreadBlocking","UnusedCode"]
)
```

Parse the structured insights. Write to `.evolution/perf-trace.json` with: LCP, INP, CLS, TBT, TTI, Lighthouse category scores, and the per-insight breakdown (which third-party blocked, which image delayed LCP, which font caused FOIT etc).

The per-insight breakdown enables targeted fixes — `ImageDelivery` issue routes to `optimize` with the offending image src; `FontDisplay` routes to `typeset` with the font-face fix. This is the difference between "score went down" and "fix the exact image at line N".

**Fallback path (chrome-devtools-mcp not connected, target < 98):**
```
WebFetch(
  url=`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={encodeURIComponent(live_url)}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo`,
  prompt="Extract lighthouseResult.audits['largest-contentful-paint'].numericValue, ['interaction-to-next-paint'].numericValue, ['cumulative-layout-shift'].numericValue, ['total-blocking-time'].numericValue, ['speed-index'].numericValue. Also extract category scores: performance, accessibility, best-practices, seo. Return JSON."
)
```
Write to `.evolution/pagespeed.json`. PageSpeed uses Lighthouse 10 as of 2026.

**At target ≥ 98, fallback is NOT acceptable** — if chrome-devtools-mcp is missing, HALT NEEDS_HUMAN: "chrome-devtools-mcp required for top-tier perf gates. Install via npx chrome-devtools-mcp@latest or add to ~/.claude/settings.json mcpServers block."

These values become the authoritative source for G4/G5/G6 + WC9 in the merge — overrides any local Puppeteer CWV estimate.

### After all complete — merge + enrich

1. Read all four partial score files. If any missing → re-run that agent once. Still missing → HALT NEEDS_HUMAN with which categories failed.

2. **Merge partial scores into `.evolution/scores/score.json`:**

   ```
   merged_checks = {}
   for each partial file (score-AB, score-CDE, score-FGH, score-IJK):
     merged_checks.update(partial.checks)

   # Visual weight multipliers — visual checks count 3×, code quality 0.5×, process 0×
   # At target >= 98 (top-tier), motion (D-series) + hero (A7/A9) become 4×, WC-series 5×
   # NOTE: no duplicate keys — each check_id appears exactly once
   VISUAL_WEIGHT_STANDARD = {
     # 3× — hero depth, product visibility, layout quality (directly visible to users)
     "A7":3, "A9":3, "D4":3, "D5":3, "F6":3, "K2":3, "K4":3,
     # 2× — section presence and copy quality (visible, conversion impact)
     "E3":2, "E4":2, "E5":2, "E6":2, "E9":2, "E10":2,
     "J1":2, "J2":2, "J3":2, "J6":2,
     # 0.5× — code quality / invisible to users
     "A11":0.5, "I4":0.5, "I8":0.5, "I2":0.5,
     "D1":0.5, "I5":0.5, "I6":0.5, "C6":0.5, "C7":0.5,
     # 0× — process checks and 21st.dev sourcing (WONTFIX for pre-existing projects)
     "B1":0, "B2":0, "B3":0, "B4":0, "B7":0, "B8":0, "B9":0,
     "H1":0, "H2":0,
   }
   VISUAL_WEIGHT_WORLD_CLASS = {
     # 5× — WC-series synthetic checks (motion stack, cursor, view transitions, fonts)
     "WC1":5, "WC2":5, "WC3":5, "WC4":5, "WC5":4, "WC6":4, "WC7":4, "WC8":5, "WC9":5, "WC10":3,
     # 4× — hero atmosphere + motion + product visibility (Awwwards Design + Creativity axes)
     "A7":4, "A9":4, "D4":4, "D5":4, "F6":4, "K2":4, "K4":4,
     # 3× — color/typography signature (Design axis)
     "A1":3, "A2":3, "A3":3, "A4":3, "A5":3, "A6":3,
     "C4":3, "C5":3, "C6":3, "C7":3,
     # 2× — sections + copy
     "E3":2, "E4":2, "E5":2, "E6":2, "E9":2, "E10":2,
     "J1":2, "J2":2, "J3":2, "J6":2,
     # 0.5× — code quality
     "A11":0.5, "I4":0.5, "I8":0.5, "I2":0.5, "D1":0.5,
     "I5":0.5, "I6":0.5,
     # 0× — process / sourcing
     "B1":0, "B2":0, "B3":0, "B4":0, "B7":0, "B8":0, "B9":0,
     "H1":0, "H2":0,
   }
   VISUAL_WEIGHT = VISUAL_WEIGHT_WORLD_CLASS if world_class else VISUAL_WEIGHT_STANDARD
   default_weight = 1  # all other checks (A1-A6, A8, A10, C1-C5, C8, D2, D3, D6, E1-E2, E7-E8, F1-F5, G-series, I1, I3, I7, J4-J5, J7-J8, K1, K3)

   weighted_passed = sum(VISUAL_WEIGHT.get(k, default_weight)
                         for k,v in merged_checks.items() if v.status=="PASS")
   weighted_total  = sum(VISUAL_WEIGHT.get(k, default_weight)
                         for k,v in merged_checks.items()
                         if v.status not in ("N/A","WONTFIX","NEEDS_HUMAN")
                         and VISUAL_WEIGHT.get(k, default_weight) > 0)

   raw_score = (weighted_passed / weighted_total) * 100 if weighted_total > 0 else 0

   # Veto logic — evaluated on raw_score BEFORE veto cap is applied
   # The veto cap applies to the WEIGHTED raw_score, not a simple pass count.
   # This means: a site with A7 FAIL has already lost 3× score weight from that check
   # PLUS gets capped at 60. Both penalties apply — they don't cancel each other.
   any_A_fail = any(k.startswith("A") and v.status=="FAIL"
                    for k,v in merged_checks.items())
   any_B_fail = any(k.startswith("B") and v.status=="FAIL"
                    and VISUAL_WEIGHT.get(k, 1) > 0  # skip zero-weight B checks
                    for k,v in merged_checks.items())
   if any_A_fail:   final_score = min(60, raw_score); veto_check = "first A FAIL"
   elif any_B_fail: final_score = min(80, raw_score); veto_check = "first non-WONTFIX B FAIL"
   else:            final_score = raw_score;           veto_check = None

   # Mandatory transparency log (output this every merge):
   # "Weighted score: {weighted_passed:.1f} / {weighted_total:.1f} = {raw_score:.1f}%
   #  Veto: {veto_check or 'none'}  →  Final: {final_score:.1f}
   #  3× visual checks: A7={status} A9={status} D5={status} F6={status} K2={status}
   #  0.5× code checks: D1={status} I5={status} I6={status} (these barely move the score)"

   merged_priority_queue = sorted(
     [entry for partial in partials for entry in partial.priority_queue if entry.status=="FAIL"],
     key=lambda x: -x.priority
   )
   ```

   Use the Write tool to write merged `score.json` to `{project_path}/.evolution/scores/score.json`.

3. Read `~/.claude/skills/web-evolve/references/fix-routing.md` — parse the `SKILL_LOOKUP` JSON block at the top of the file.

4. **Enrich priority_queue with fix routing:**
   For each FAIL entry in merged priority_queue:
   - Look up `check_id` in SKILL_LOOKUP
   - Set `fix_skill`, `prereq`, `secondary`, `edit_direct`, `section` on the entry
   - Build `fix_context` from the fail_proof (one sentence: what is wrong + target state)

4.5 **AUTO-WONTFIX invisible checks** — Before building the priority queue, mark these as WONTFIX (they produce no visible change and waste iteration slots):
   - **B-series (B1–B9):** 21st.dev component sourcing workflow — zero visual impact, never visible to users
   - **H1, H2:** Process integrity checks — BUILD-LOG citation format, not a visual concern
   - **D1 (import naming):** `framer-motion` vs `motion/react` — identical visual output
   - **A11, I4, I8, I2** when `fix_context` contains only DESIGN-BRIEF.md edits with no code changes
   
   Rule: **If the fix requires ONLY editing markdown/documentation files with ZERO React/CSS/TS code changes → auto-WONTFIX. Do not put in the queue.**
   
   Exception: A11 is allowed in the queue IF the DESIGN-BRIEF aesthetic direction is genuinely saturated/wrong and needs a redesign → only then escalate to web-design-research.

5. **Prepend benchmark gaps:** Read `.evolution/benchmark/gap-analysis.json`. For each in `top_5_priority_queue`: look up `maps_to_check` in SKILL_LOOKUP, set routing fields. Add to front of priority_queue with priority 400. Deduplicate by check_id.

5.1 **Override CWV checks with PageSpeed data:** Read `.evolution/pagespeed.json`. For G4 (LCP), G5 (INP), G6 (CLS): override `status` and `proof` with PageSpeed numericValue. Thresholds: LCP < 2.5s = PASS, INP < 200ms = PASS, CLS < 0.1 = PASS. Cite the PageSpeed run ID in `proof` so the source is auditable.

5.2 **Inject a11y findings into priority_queue (if target ≥ 95):** Read `.evolution/a11y.json`. For each violation with `severity: serious|critical`:
   - Create synthetic check entry `A11Y-{rule-id}` with priority 350 (between benchmark 400 and quality 300)
   - `fix_skill = "polish"` for contrast/focus issues, `clarify` for label/alt-text issues, `web-fix` for landmark/ARIA structural issues
   - Mark `wcag_level` in the entry so the rescore can verify the fix improved the actual a11y score

5.3 **Inject SEO findings into priority_queue (if target ≥ 95):** Read `.evolution/seo.json`. For each FAIL:
   - meta tags / og / canonical / robots / sitemap → synthetic `SEO-{check}` with priority 200, `fix_skill: null`, `edit_direct: true` (these are edit-the-head fixes)
   - Image alt missing → route to `clarify` with the image src list
   - JSON-LD missing → synthetic, `edit_direct: true`, priority 150

5.4 **Reconcile /critique findings (if target ≥ 95):** Read `.evolution/critique.json`. If critique flags a dimension that web-score scored PASS:
   - Demote that check's PASS to NEEDS_HUMAN with note `"web-score PASS but /critique flagged: {critique reason}"`
   - User confirms which source to trust → update score.json before iteration begins
   This is the cross-check that catches checklist blind spots.

6. **Surface NEEDS_HUMAN blocks** — one message to user listing all vision checks. Wait for replies. Update score.json check entries.

7. Write baseline score to BUILD-LOG.md (mandatory output format from checklist).

8. If `final_score >= target_score` → log "already at target", skip to Phase D.

9. **Write initial loop state** using the Write tool (not bash echo):
   Path: `{project_path}/.evolution/loop-state.json`
   ```json
   {
     "iteration": 0,
     "void_count": 0,
     "real_iterations": 0,
     "current_score": {final_score},
     "baseline_score": {final_score},
     "mode": "{mode}",
     "max_iterations": {max_iterations},
     "target_score": {target_score},
     "priority_queue": [{enriched queue}],
     "attempt_counts": {},
     "excluded_skills": {}
   }
   ```

---

