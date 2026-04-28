# Self-Audit — 2026-04-28 (follow-up, same day)

Second run, ~hours after baseline. Compares against `2026-04-28-audit.md`.

## Inventory

- Skills: 178 directories under `~/.claude/skills/` (was 177 — net +1, no consolidation applied).
- Agents: 64 under `~/.claude/agents/`.
- Commands: 67 under `~/.claude/commands/`.
- Global: `~/.claude/CLAUDE.md` unchanged — Visual Mirroring Protocol present, Product Idea Gate present.
- Design DNA: `~/.claude/web-system-prompt.md` (635 lines) — REPLICATION MODE OVERRIDE preamble from baseline still in place at lines 7–22.
- Settings: hooks intact (gateguard, config-protection, build-context-inject, log-tools, start-dev-server, safe-session-start, safe-session-stop). MCPs: notion, magic, cloudflare, vercel, supabase + puppeteer + github.
- Rules: `~/.claude/rules/` index present (common/typescript/python/web), unchanged.
- Project CLAUDE.md in cwd: NONE (`c--Users-Adam--claude-projects` has no project-level CLAUDE.md). Per CLAUDE.md protocol this would normally trigger `/project-doc` — but cwd is the harness scratch directory, not a product, so deferred.
- READ this run: impeccable, web-page, web-scaffold, web-component, web-review, web-fix, polish, typeset, layout, colorize. Previous run had marked these as DEFER/UNREAD.

## Diagnosis

| # | Principle | Status | Evidence |
|---|---|---|---|
| 1 | Visual grounding over description | PARTIAL | `style-mirror` extracts computed styles + screenshots; `impeccable craft` still leans on prose direction-setting before any reference is gathered |
| 2 | Tokens as source of truth, re-read every section | PARTIAL → IMPROVED | Lock file written by style-mirror; downstream skills (web-page, web-scaffold, web-component, web-review, web-fix, polish, impeccable) now read it after this audit's patches |
| 3 | Section-by-section, not page-at-once | PARTIAL | style-mirror Step 6b enforces it; web-page/web-scaffold do not — they still build whole pages, then review |
| 4 | Mandatory self-diff between sections | PARTIAL | style-mirror does it; web-page review loop is per-page not per-section |
| 5 | Final consistency sweep across all sections | MISSING | No skill performs a global token-conformance audit at the end of `/saas-build` |
| 6 | Unopinionated execution mode | PARTIAL → IMPROVED | impeccable Context Gathering now has Step 0 lock-gate that suspends Design Direction; previous patch only suspended font ban |
| 7 | Re-grounding as first-class step | MISSING | No periodic re-read of lock file mid-build is enforced; only at section start in style-mirror Step 6b |
| 8 | Browser MCP for DOM/computed/CSS-vars | PARTIAL | Only style-mirror uses it; web-review still relies on visual screenshots without computed-style assertion |
| 9 | Constraints stated as negatives | ALIGNED | Forbidden additions block in style-mirror, replication overrides in 7 other skills now explicitly list "do NOT add gradient mesh / grain / glow / glassmorphism / fadeUp / hover scale" |
| 10 | Iteration on diffs, not rewrites | PARTIAL | web-fix is diff-only (good); polish, web-page still read-then-rewrite full files |

## Root Causes

1. **Tokens lock file was written but never read.** Baseline patched only `style-mirror`, `impeccable` (font block), `premium-website`, `web-system-prompt`. Downstream skills (`web-page`, `web-scaffold`, `web-component`, `web-review`, `web-fix`, `polish`) all opened with `Read web-system-prompt.md` and never checked for `tokens.lock.json`. Result: style-mirror locked the values, then the next skill in the pipeline immediately overwrote them with Design DNA defaults. — fixed this run.

2. **Impeccable's Context Gathering Protocol bypassed the lock.** `impeccable/SKILL.md:41-44` listed three sources (loaded instructions, `.impeccable.md`, run `teach`) but did not check `tokens.lock.json`. Since 9 refinement skills (typeset/layout/colorize/animate/distill/quieter/delight/clarify/bolder) and `polish` invoke `/impeccable` as MANDATORY PREPARATION, the lock got bypassed every time a refinement skill fired. — fixed this run via Step 0 in the gathering order.

3. **Skill bloat got worse, not better.** Baseline counted 177 skills; today 178. STAGE item from baseline (consolidate 9 refinement skills into `/refine`) was never approved or applied. Routing failure mode unchanged.

4. **No global consistency sweep.** `/saas-build` builds N pages via `/web-page`, each runs its own per-page review, but nothing compares all pages against the lock at the end. Drift between the hero (built first, lock fresh) and the FAQ (built last, lock recall stale) is not measurable.

5. **`web-review` does not use computed-style inspection.** It reads screenshots and the codebase, but does not Puppeteer-evaluate the actual rendered DOM against the lock. So a font-family swap that survives compile but renders wrong (e.g., font-import missing) goes undetected.

## Fixes

| # | Fix | File/Skill | Action | Status |
|---|---|---|---|---|
| 1 | Tokens Lock Gate in Context Gathering Step 0 | `impeccable/SKILL.md` | APPLY | DONE |
| 2 | Tokens Lock Gate in Step 1 | `web-page/SKILL.md` | APPLY | DONE |
| 3 | Tokens Lock Gate in Step 1 | `web-scaffold/SKILL.md` | APPLY | DONE |
| 4 | Tokens Lock Gate in Step 1 | `web-component/SKILL.md` | APPLY | DONE |
| 5 | Tokens Lock Gate in Step 1 | `web-review/SKILL.md` | APPLY | DONE |
| 6 | Tokens Lock Gate as Step 0 | `web-fix/SKILL.md` | APPLY | DONE |
| 7 | Lock-priority entry in Design System Discovery | `polish/SKILL.md` | APPLY | DONE |
| 8 | Consolidate 9 refinement skills → `/refine` | typeset/layout/colorize/animate/distill/quieter/delight/clarify/bolder | STAGE | OPEN (re-staged from baseline; no sign-off received) |
| 9 | Add final global lock-conformance sweep step | `saas-build/SKILL.md` | DEFER | OPEN — needs design of the sweep before implementing |
| 10 | Add Puppeteer computed-style assertions | `web-review/SKILL.md` | DEFER | OPEN — needs a check spec (which selectors, which props) |
| 11 | Section-by-section build (not page-at-once) | `web-page/SKILL.md` | DEFER | OPEN — would conflict with current per-page loop architecture |

## Applied

Modified (7 files):
- `~/.claude/skills/impeccable/SKILL.md` — Context Gathering Protocol Step 0 lock gate (suspends Design Direction)
- `~/.claude/skills/web-page/SKILL.md` — Step 1 TOKENS LOCK GATE preamble
- `~/.claude/skills/web-scaffold/SKILL.md` — Step 1 TOKENS LOCK GATE preamble
- `~/.claude/skills/web-component/SKILL.md` — Step 1 TOKENS LOCK GATE preamble
- `~/.claude/skills/web-review/SKILL.md` — Step 1 TOKENS LOCK GATE preamble
- `~/.claude/skills/web-fix/SKILL.md` — Step 0 lock gate
- `~/.claude/skills/polish/SKILL.md` — Design System Discovery Step 0 lock gate

Created:
- `~/.claude/audits/2026-04-28-followup-audit.md` (this file)

## Staged for approval

**Refinement-skill consolidation (re-staged from baseline, still pending):**
Merge `typeset` + `layout` + `colorize` + `animate` + `distill` + `quieter` + `delight` + `clarify` + `bolder` → single `/refine` with sub-args (e.g. `/refine typography`, `/refine spacing`, `/refine color`). Each currently has near-identical scaffolding (`Web-evolve Targeted Mode`, `MANDATORY PREPARATION → /impeccable`, generic body). Reduces 9 entries in skill list noise → 1, reduces /impeccable invocations 9× → 1×. After merge, `premium-website.md` skill table needs the 9-row replacement. Reply "approve consolidation" to apply.

**Final global lock-conformance sweep (DEFER):**
Need to spec what the sweep checks. Candidate: after `/saas-build` finishes the page list, walk every built page's CSS imports, computed font-family on `body`/`h1`, and primary CTA `background-color`, then diff against `tokens.lock.json`. Output a conformance score; halt if <90%.

## Remaining gaps

1. **Skill bloat unchanged at 178.** Consolidation needs sign-off — re-staged.
2. **No regression test** for replication. A fixture `style-mirror github.com → scaffold → screenshot diff` would catch lock-bypass regressions before they ship to client work.
3. **`saas-build` and `saas-improve`** read `web-system-prompt.md` but were NOT patched this run. The lock gate fixes the inner skills; these orchestrators still need the same preamble. Adding to next audit's pile.
4. **Computed-style verification** (root cause #5) is unaddressed. `/web-review` is the right home but needs a check spec.
5. **Section-by-section over page-at-once** (root cause for principle #3 PARTIAL) is architecturally larger than a preamble patch — would change `web-page` from "build full page → review" to "build hero → diff → build features → diff → ...". Deferred.
6. **No project-level CLAUDE.md** in `c--Users-Adam--claude-projects/` — by design (it's the harness scratch dir, not a product). Not a gap.

## Chronic issues

1. **Skill bloat (177 → 178).** Same root cause across both audits. Consolidation staged twice, never applied. Highest-priority sign-off ask.
2. **Token-lock not honored end-to-end** (was baseline #1, half-fixed). Baseline patched the writer; this audit patched the readers. If the next audit still finds drift, the next root cause is enforcement (a hook that blocks Write to `index.css`/`tailwind.config.ts` when the new value diverges from the lock).

## Resolved since last audit

1. **Refinement skills bypassed font override** (baseline root cause #5, partial). The `impeccable` font-only override is now superseded by a full Context Gathering Step 0 that suspends Design Direction entirely. Resolved 2026-04-28.
2. **`web-page`/`web-review`/`web-fix` Design DNA leakage** (baseline DEFER #9). Now have explicit lock-gate preambles. Resolved 2026-04-28.
3. **`polish` aligning to Design DNA defaults instead of reference** (baseline DEFER #10 / root cause #4). Design System Discovery now has a Step 0 that prioritises the lock. Resolved 2026-04-28.

## Audit logged to

`C:\Users\Adam\.claude\audits\2026-04-28-followup-audit.md`
