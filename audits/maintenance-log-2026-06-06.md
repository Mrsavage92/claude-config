# Maintenance Log — 2026-06-06

Observational audit. No files modified. All findings are for Adam to action.

---

## 1. OVERSIZED SKILLS (>500 lines)

19 skills exceed 500 lines. Top offenders:

`social-audit:955` · `n8n-node-configuration:835` · `web-settings:800` · `n8n-code-javascript:784` · `n8n-code-python:774` · `n8n-validation-expert:761` · `saas-research:756` · `agent-browser:689` · `web-ai:581` · `web-onboarding:574` · `ai-ready-audit:556` · `review:545` · `employer-audit:545` · `market-competitors:542` · `web-email:527` · `style-mirror:526` · `n8n-expression-syntax:525` · `n8n-workflow-patterns:512` · `techaudit-audit:503`

The n8n cluster alone (5 skills, 512–835 lines) accounts for a material share of context load.

---

## 2. BANNED PHRASES

Hits in system-description context (not inside anti-example/documentation blocks):

- `skills/ai-ready/SKILL.md:8` — "comprehensive"
- `skills/brand-dna/SKILL.md:9` — "comprehensive"
- `skills/dashboard-design/SKILL.md:13` — "world-class", "enterprise-grade"
- `skills/employer-audit/SKILL.md:8`, `skills/employer/SKILL.md:8`, `skills/geo/SKILL.md:8`, `skills/reputation-audit/SKILL.md:8`, `skills/reputation/SKILL.md:8` — "comprehensive" (opening self-description cluster)
- `skills/pipeline/SKILL.md:3`, `skills/plugin-audit/SKILL.md:3` — "production-ready", "comprehensive" (description fields)
- `skills/n8n-code-javascript/SKILL.md:784` — "production-ready"
- `skills/find-skills/SKILL.md:46` — "battle-tested"

Excluded: ban-gate documentation in `critique`/`review`, domain vocabulary ("premium connectors" in Power Automate), archive files.

---

## 3. BROKEN SKILL REFERENCES

**`Skill('name')` refs with no matching `skills/<name>/` folder:**
- `Skill('cold-email')` — `skills/audithq-outbound/SKILL.md:107`
- `Skill('content-humanizer')` — `skills/premium-website/SKILL.md:297`
- `Skill('page-cro')` — `skills/audithq-convert/SKILL.md:112,124`

**Backtick slash-command refs with no matching skill or command:**
- `/contract-writer`, `/revenue-ops-advisor`, `/sales-engineer` — `skills/business-growth/SKILL.md:22-24`
- `/cs-revenue-ops`, `/cs-sales-coach` — `skills/outbound/SKILL.md:157-197`

Note: app URL routes (`/clients`, `/dashboard`, `/settings`, `/setup`, etc.) and explicitly-deprecated aliases in `skills/calibrate-amplitude/SKILL.md` (`/bolder`, `/distill`, `/quieter`) are excluded.

---

## 4. RULE CONTRADICTIONS

**Error handling scope mismatch:**
- `rules/common/coding-style.md:42` — "Handle errors explicitly at **every level**."
- `CLAUDE.md` (system instruction) — "Don't add error handling, fallbacks, or validation for scenarios that can't happen. Trust internal code and framework guarantees. Only validate at system boundaries."

The rule file asserts universal coverage; CLAUDE.md restricts to boundary events only. Neither is wrong in intent, but the rule file overstates the prescription — code loading a rules file will see a broader mandate than the operating instruction intends.

**Banned phrase appearing in an authoritative rule file:**
- `rules/common/patterns.md:2` — "Search for battle-tested implementations" — uses a term banned from skill output inside a guidance document that skills are instructed to load and follow.

---

## 5. ORPHAN AGENTS

| Agent | References |
|-------|-----------|
| `agents/audithq-sales.md` | **0** — no `Agent(subagent_type="audithq-sales")` invocation, no prose reference in any CLAUDE.md, SKILL.md, or command file |

All other agents have at least one reference in the CLAUDE.md Agent Routing table or in a SKILL.md dispatch directive.

---

## 6. TOP 5 PRUNE CANDIDATES

No skill meets the 90-day staleness criterion — all were last committed 2026-05-29 or 2026-05-30 (~8 days ago). Ranking on remaining signals (size, no supporting dirs, description overlap):

1. `skills/design/` (21 lines) — single-line redirect to `cto-architect`; fully redundant with CLAUDE.md Agent Routing table
2. `skills/validate/` (24 lines) — thin viability checklist; description overlaps substantially with `product-validator`
3. `skills/decide/` (27 lines) — thin decision framework; covered by CLAUDE.md operating discipline
4. `skills/reputation-monitor/` (30 lines) — thin wrapper; overlaps `reputation` + `reputation-audit`
5. `skills/sprint-plan/` (38 lines) — thin template; overlaps `sprint-health` + `retro` + `standup` cluster

---

## 7. SUMMARY

The core build pipeline (web-*, saas-build/improve, rate, style-mirror, n8n cluster) is structurally intact with well-developed supporting references directories. Banned-phrase contamination is the clearest quality drift: 12 violations are concentrated in opening self-description lines (mostly "comprehensive" on line 8) across the audit-suite and reporting skills, all fixable in a single focused pass. The highest-leverage action this week is to sweep lines 1–15 of `employer-audit`, `employer`, `reputation-audit`, `reputation`, `geo`, `ai-ready`, `brand-dna`, `dashboard-design`, `pipeline`, and `plugin-audit` SKILL.md files and replace the banned terms with neutral action-oriented language.
