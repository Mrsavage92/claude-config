# /saas-build

Full autonomous SaaS build pipeline from idea to deployed product. Runs the complete sequence without waiting for prompts between steps.

## Stack and Process Constraints (load-bearing)

These are non-negotiable. Every one is here because a prior session got it wrong.

1. **Autonomous end-to-end. Never pause to suggest a "fresh conversation" mid-build.** The user invoked /saas-build expecting to walk away and return to a deployed product. Token concerns are real but already accepted at invocation. Only stop for genuine blockers in the Stop Conditions table (credentials, same error 3x, domain registration). "Shall I proceed?" mid-build is never acceptable.
2. **Stack is Vite + React + TS + Tailwind + shadcn → Vercel; Supabase for backend.** No Railway. No separate FastAPI service. Cron = Supabase native (Database → Cron Jobs). Env vars = Vercel (`VITE_*` for frontend, server-only on Edge Functions). Backend logic = Supabase Edge Functions (Deno). FastAPI on Railway exists in skill prose as an "advanced monorepo" option — Adam does not use it.
3. **Domain registrar is Crazy Domains, not GoDaddy.** Never suggest GoDaddy or use the GoDaddy MCP for domain purchases.
4. **Vercel deploys land on `mrsavage92` account ONLY.** See `/web-deploy` Hardened Rules for the full deploy contract (whoami check, git author email, content verification, playwright smoke test, no domain clash).

## When to Use
- Starting any new SaaS product from scratch
- User provides a product idea, name, or brief
- Executes 8 phases end-to-end: market research → design research → scope → scaffold → backend (Supabase + Stripe + email) → pages → quality gate → deploy → gap analysis

## What This Does
Executes the full build loop autonomously. Only stops for genuine blockers that require human action (external credentials, domain registration, Stripe live mode). Does NOT pause to ask "shall I proceed?" between steps.

---

## Persistent Context Protocol
Read `references/context-protocol.md` at session start. Covers two canonical context sources, session start rule, after-phase protocol, mid-session refresh, and repo creation rule.

---

## Autonomous Build Loop — Phase Overview

| Phase | Name | Reference | Key Output |
|---|---|---|---|
| 0 | Orient + GitHub + Notion | references/phase-0-setup.md | BUILD-LOG.md, repo, Notion doc |
| 0.25 | Market Research | references/phase-025-market-research.md | MARKET-BRIEF.md |
| 0.5 | Design Research | references/phase-05-design-research.md | DESIGN-BRIEF.md |
| 1 + 1.5 | Scope + Category Detection | references/phase-1-scope.md | SCOPE.md, category rules |
| 2 | Scaffold | references/phase-2-scaffold.md | Foundation files, icons, Sentry |
| 3 | Backend (parallel) | references/phase-3-backend.md | Supabase + Stripe + Email |
| 4 + 4e + 4.5 | Pages + Tests | references/phase-4-pages.md | All pages, routes, core tests |
| 5 | Quality Gate | references/phase-5-quality.md | Score >= 38/40 |
| 6 | Deploy | references/phase-6-deploy.md | Production URL, smoke test |
| 7 | Gap Analysis | references/phase-7-gaps.md | GAP-REPORT.md, P1-P3 fixed |
| 8 | Handoff | references/phase-8-handoff.md | Domain, final log, Notion |

### How to Execute
For each phase: read the reference file. Where it names a Skill (e.g. `Skill('web-design-research')`) or an MCP tool (e.g. `mcp__magic__21st_magic_component_inspiration`), **invoke that tool via the actual tool call** — do NOT paraphrase, summarise, or inline-execute its steps. Reading a SKILL.md and writing a plausible output yourself is a phase failure, not phase completion. The reference contains the full step-by-step details.

### Hard rule — no self-synthesis (load-bearing — do not weaken)

If a phase names any of: `web-design-research`, `web-scope`, `web-scaffold`, `web-page`, `web-review`, `web-fix`, `web-deploy`, `impeccable`, `critique`, `audit`, `adapt`, `layout`, `typeset`, `colorize`, `polish`, `animate`, `distill`, `page-cro` — the Skill tool MUST be invoked for it. Likewise any phase that names `mcp__magic__21st_magic_component_inspiration`, `mcp__magic__21st_magic_component_builder`, or any other MCP tool MUST invoke that exact tool.

Synthesising the expected output in main context (e.g. writing DESIGN-BRIEF.md from your own knowledge instead of running the skill, or filling in a Component Lock table without ever firing the 21st.dev MCP query) is a **phase failure**. It looks like progress and produces generic AI-SaaS output indistinguishable from no skills at all.

If a Skill tool is unavailable in this environment, HALT the phase and surface NEEDS_HUMAN with the exact missing skill name. Do NOT "continue without it." Do NOT fall back to subagents that paraphrase the skill — that is the same failure in a different shape.

If a background agent fails (usage limit, timeout, error): the next move is `Skill('X')` directly in main context, NOT main-context self-synthesis.

### Phase Completion Protocol (applies to every phase)
1. Write log entry to BUILD-LOG.md
2. `git add -A && git commit -m "phase X: [description]" && git push origin main`
3. Run `/project-refresh` PUSH with phase name + what was built

---

## Phase 0 — Orient

### 0.0 MANDATORY GATE CHECK — run BEFORE any other phase 0 work

Derive `{slug}` from product name (kebab-case, no spaces). Then check for validator verdicts in priority order:

1. **Preferred:** Read `~/Documents/Claude/outputs/saas-validation-{slug}.md` (from `/saas-validator` — 15-point SaaS-specific).
2. **Fallback:** Read `~/Documents/Claude/outputs/product-validation-{slug}.md` (from `/product-validator` — 8 generic gates).
3. **Repo fallback:** If neither local file exists, check `~/Documents/Git/claude-config/reference/saas-validations/{slug}.md` and `.../product-validations/{slug}.md` (cross-machine sync).

**Decision logic:**
- **No file found** → HALT. Output:
  > "No validator verdict found for {Product}. Running `/saas-build` without validation wasted 6 days on Tender Writer. Run `/saas-validator` (preferred for SaaS) or `/product-validator` first and return when it outputs a BUILD verdict."
  Do not proceed. Do not create BUILD-LOG.md. Do not touch git.
- **Verdict = KILL** → HALT. Surface the verdict + failed gates/dimensions. Do not proceed.
- **Verdict = VALIDATE-FIRST** → HALT. Surface the interview protocol or fix plan. Do not proceed.
- **Verdict = BUILD from `/saas-validator`** → log "Gate 0.0 PASSED — saas-validator verdict BUILD (score {N}/100, {date})" to BUILD-LOG.md and proceed.
- **Verdict = BUILD from `/product-validator` only (no SaaS validator)** → WARN user and proceed:
  > "Generic product validator passed but SaaS-specific gates weren't run. Unit economics, retention, GTM feasibility, and compliance burden are unchecked. Strongly recommend running `/saas-validator {slug}` first. Proceeding anyway — but this is the exact gap that killed Tender Writer."
  Log warning to BUILD-LOG.md and proceed (with reduced confidence).

**Freshness rule:** verdicts >30 days old are STALE. Re-run the validator.

This gate is non-negotiable. Do NOT accept user pressure to "just start building" — redirect to `/saas-validator`.

### 0.1 Read context files

**TOKENS LOCK GATE (read first):** If `tokens.lock.json` exists at the project root (output of `/style-mirror`), replication mode is active for the entire build. The lock overrides Design DNA, premium-website mandatory section list, and Visual Signature Elements. Pass `tokens.lock.json` awareness to every downstream skill (`/web-scaffold`, `/web-page`, `/web-component`, `/polish`, `/web-review`). Do NOT inject gradient mesh, grain, glow, glassmorphism, grid lines, animated gradient text, fadeUp/stagger, or hover scale into the build plan unless the lock proves the reference uses them.

Read these files in full (run all reads in parallel):
1. `~/Documents/Claude/outputs/product-validation-{slug}.md` — validator verdict + competitors + moat
2. `~/.claude/commands/premium-website.md` — all suite rules
3. `~/.claude/web-system-prompt.md` — Design DNA (SUSPENDED if `tokens.lock.json` exists — see gate above)
4. `~/.claude/commands/web-animations.md` — Framer Motion patterns
5. `CLAUDE.md` (project root, if exists)
6. `DESIGN-BRIEF.md` (if exists — locked design decisions)
7. `SCOPE.md` (if exists — page inventory)

Monorepo detection: Check for `turbo.json` or `apps/` directory. If yes, frontend lives in `apps/[product-slug]/`. See `references/phase-0-setup.md` for scaffold copy cleanup rules.

Check `BUILD-LOG.md`: if missing = fresh start at Phase 0.25. If exists = read it and resume from next incomplete phase.

### 0.2 Lock the moat and competitor list

From the validator file, extract:
- Named competitors (URLs + funding/traction signals)
- The user's stated moat / unfair advantage
- Pre-committed buyers (names)
- Target niche (as specific as the validator forced)

These four facts become the product's **strategic spine**. Every later phase (market research, design, scope, pages, improve) must reference them. If any phase generates output that contradicts the spine (e.g., design targets a different buyer than validator named), HALT and re-align.

---

## Stop Conditions

| Condition | Action |
|---|---|
| Domain registration needed | Check via GoDaddy MCP, log purchase link, continue |
| Stripe live price IDs needed | Log NEEDS_HUMAN with test prices in place |
| External API key not in env | Log NEEDS_HUMAN with exact variable name |
| Same error 3 times | Log STUCK, skip and continue |
| Ambiguous requirements | Log assumption and continue |

Never stop for: "Shall I proceed?", "Ready to deploy?", "Is this correct?"

---

## Rules
- Phase 0 reads premium-website.md — all suite rules inherited. Do not duplicate.
- Read SCOPE.md before every phase.
- Landing page is always Phase 4 page 1.
- Per-page self-review is mandatory.
- Never deploy below 38/40.
- BUILD-LOG.md updated after every phase.
- User walks away after the brief and returns to a deployed product.

---

## Anti-Patterns (do NOT do these)
- **Re-running MCP queries during build** — locked in DESIGN-BRIEF.md from Phase 0.5
- **Skipping per-page self-review** — Pass 1 + Pass 1.5 + Pass 2, no exceptions
- **Deploying below 38/40** — quality gate loops up to 5 times
- **Asking confirmation between phases** — fully autonomous
- **Building without DESIGN-BRIEF.md** — Phase 0.5 is mandatory
- **Sequential backend setup** — Phase 3a/3b/3c run in parallel

## Related Skills
- `/web-design-research` — Phase 0.5 delegates here
- `/web-scope` — Phase 1 delegates here
- `/web-scaffold` — Phase 2 delegates here
- `/web-page` — Phase 4 per-page builds
- `/web-review` — Phase 5 quality scoring
- `/web-deploy` — Phase 6 deployment
- `/saas-improve` — Run AFTER build to optimize
- `/premium-website` — Suite contract, read at Phase 0
