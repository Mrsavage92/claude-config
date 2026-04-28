# Improvements Applied — 2026-04-28 (third pass, same day)

Follow-on execution of the five "further improvements" surfaced after the followup audit. All five applied.

## What changed

### 1. Orchestrator lock gate — `saas-build` and `saas-improve`

- `saas-build/SKILL.md` Phase 0.1 — TOKENS LOCK GATE preamble before context-file reads
- `saas-improve/SKILL.md` Phase 0a — TOKENS LOCK GATE preamble before state reads

Closes the orchestrator-side gap left by the followup audit (which patched only the inner skills).

### 2. Write-blocking enforcement hook

- New hook: `~/.claude/hooks/tokens-lock-enforce.ps1`
- Wired into `settings.json` PreToolUse on Write|Edit|MultiEdit
- Walks up from the file path looking for `tokens.lock.json` (canonical project root) or `.style-mirror/tokens.lock.json` (archival). When found, scans Write/Edit content for divergence from the lock and exits 2 with a descriptive blocker message.
- Catches: gradient mesh, glassmorphism, grain, grid lines, gradient text, Framer hover scale, fadeUp entrances, font-family swaps in token-bearing files.
- Escape hatch: `CLAUDE_TOKENS_LOCK_OFF=1`.
- PowerShell parse-validated. Lints clean (after fixing two warnings flagged by the IDE diagnostics hook).

This turns lock-honoring from self-discipline into self-enforcement — the third layer alongside writer (style-mirror) and readers (impeccable + 7 build skills).

### 3. Style-mirror canonical-path consolidation

- `style-mirror/SKILL.md` Step 2D updated: lock is now written to BOTH `<project>/tokens.lock.json` (canonical) AND `<project>/.style-mirror/tokens.lock.json` (archival).
- All downstream skills check the canonical path; the enforcement hook checks both.
- Resolves a path inconsistency caught mid-execution: previous patches assumed root-level placement but style-mirror only wrote to `.style-mirror/`.

### 4. Regression fixture harness

- New: `~/.claude/skills/style-mirror/regression/run-fixture.mjs` (Node ESM, stdlib-only)
- New: `~/.claude/skills/style-mirror/regression/README.md`
- Asserts: locked colors / heading_family / radius present in generated tokens; signature elements that the lock forbids do NOT appear in generated CSS or Tailwind config.
- Smoke-tested with synthetic fixture: 9/9 PASS clean, 7/9 FAIL (exit 1) when violations injected — both directions verified.
- Fixture procedure documented for adding new replication targets.

### 5. Phase 5a.5 lock-conformance sweep

- New section in `saas-build/references/phase-5-quality.md` between Stage 5a and Stage 5b.
- Activates ONLY if `tokens.lock.json` exists (no-op for non-replication builds).
- Procedure: `mcp__puppeteer__puppeteer_evaluate` on every route in `SCOPE.md`, capture computed styles for `body`/`h1`/`h2`/CTA/nav/links, scan for forbidden signature elements, compute per-page conformance score, write `LOCK-CONFORMANCE.md`, halt Phase 5 if overall < 90%.
- Catches the failure mode the write-time hook can't: correctly-written tokens overridden later by a more specific selector, missing @import causing browser fallback, child inline styles overriding the system, drift compounding across pages built late.

### 6. Refinement-skill consolidation — `/refine`

- New: `~/.claude/skills/refine/SKILL.md`
- Single user-facing entry point that routes to one of 9 specialists by mode (`typography`/`layout`/`color`/`motion`/`simplify`/`calmer`/`joy`/`copy`/`bolder`).
- 9 specialists kept in place for backward compatibility — `saas-build` Phase 5a's transcript-verifiable gate explicitly requires `Skill('typeset')`/`Skill('polish')` etc. by name. Removing them would break the build.
- Net skill count: 178 → 179 (router added). Routing improvement comes from /refine matching first when the user says "fix the typography" instead of the model picking between 9 similarly-described skills.

## Verification

- PowerShell hook syntax: `[scriptblock]::Create()` parse-OK after lint fixes
- Regression fixture positive case: 9/9 PASS, exit 0
- Regression fixture negative case: 7/9 PASS, exit 1, violations correctly identified (gradient-mesh, glassmorphism)
- All 7 file edits via Edit tool succeeded (no Read-first-required errors after first iteration)
- Markdown lint warnings on phase-5-quality.md table example fixed

## Files created (7)

- `~/.claude/hooks/tokens-lock-enforce.ps1`
- `~/.claude/skills/refine/SKILL.md`
- `~/.claude/skills/style-mirror/regression/run-fixture.mjs`
- `~/.claude/skills/style-mirror/regression/README.md`
- `~/.claude/audits/2026-04-28-improvements.md` (this file)

## Files modified (8)

- `~/.claude/settings.json` — wired tokens-lock-enforce hook
- `~/.claude/skills/style-mirror/SKILL.md` — Step 2D dual-write, cardinal rule 7 path clarification
- `~/.claude/skills/saas-build/SKILL.md` — Phase 0.1 lock gate
- `~/.claude/skills/saas-build/references/phase-5-quality.md` — Stage 5a.5 lock-conformance sweep
- `~/.claude/skills/saas-improve/SKILL.md` — Phase 0a lock gate

(Followup-audit modifications from earlier today still in place: impeccable, web-page, web-scaffold, web-component, web-review, web-fix, polish.)

## Defense in depth — replication mode now has

| Layer | What | Where |
|---|---|---|
| 1. Suspension preamble | Design DNA suspended at lock detection | `web-system-prompt.md` lines 7–22 |
| 2. Writer | Lock written, dual-location | `style-mirror/SKILL.md` Step 2D |
| 3. Reader (orchestrators) | saas-build / saas-improve check lock first | this audit |
| 4. Reader (build skills) | web-page / web-scaffold / web-component / web-review / web-fix / polish check lock first | followup audit |
| 5. Reader (refinement) | impeccable Context Gathering Step 0 suspends Design Direction | followup audit |
| 6. Write-time enforcement | PreToolUse hook blocks divergent writes | this audit |
| 7. Render-time enforcement | Phase 5a.5 puppeteer-evaluate sweep | this audit |
| 8. Regression test | Fixture harness asserts lock honoring across builds | this audit |

If the next audit still finds drift, the failure isn't structural — it'll be a specific bug in one of these layers that the regression harness will isolate.

## Remaining

- Run `/sync-knowledge-base` to push everything to claude-config repo.
- Add the first real fixture under `regression/fixtures/` once a project is ready (e.g. github-com or linear-app).
- Re-run `/self-audit` in a week to verify no chronic-issue regression.
