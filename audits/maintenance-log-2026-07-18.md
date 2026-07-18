# Weekly Maintenance Log — 2026-07-18

Repo: `Mrsavage92/claude-config` | Auditor: scheduled harness | Observational only.

---

## 1. OVERSIZED SKILLS (>500 lines)

21 skills exceed the threshold. Top offenders: `skills/social-audit/SKILL.md:955`, `skills/n8n-node-configuration/SKILL.md:835`, `skills/web-settings/SKILL.md:800`, `skills/n8n-code-javascript/SKILL.md:784`, `skills/n8n-validation-expert/SKILL.md:761`, `skills/n8n-code-python/SKILL.md:774`, `skills/saas-research/SKILL.md:756`, `skills/agent-browser/SKILL.md:689`, `skills/docx/SKILL.md:590`, `skills/web-ai/SKILL.md:581`, `skills/web-onboarding/SKILL.md:574`, `skills/claude-api/SKILL.md:561`, `skills/ai-ready-audit/SKILL.md:556`, `skills/review/SKILL.md:545`, `skills/employer-audit/SKILL.md:545`, `skills/market-competitors/SKILL.md:542`, `skills/web-email/SKILL.md:527`, `skills/style-mirror/SKILL.md:526`, `skills/n8n-expression-syntax/SKILL.md:525`, `skills/n8n-workflow-patterns/SKILL.md:512`, `skills/techaudit-audit/SKILL.md:503`.

---

## 2. BANNED PHRASES

Clear violations (not in meta-commentary or external quotation):

- `skills/dashboard-design/SKILL.md:13` — "world-class" and "enterprise-grade" in description
- `skills/pipeline/SKILL.md:3` — "production-ready" in frontmatter description
- `agents/mcp-server-builder.md:3` — "production-ready" in frontmatter description
- `agents/test-engineer.md:8,42,51,52` — "comprehensive" (×3) and "production-ready" (line 52)
- `agents/cto-architect.md:8` — "comprehensive" in opening self-description
- `skills/n8n-code-javascript/SKILL.md:784` — "production-ready" in closing line

Borderline (contextual, not self-praise): `rules/common/development-workflow.md:9` uses "battle-tested" as a recommending criterion — see Section 4.

---

## 3. BROKEN SKILL REFERENCES

Four `Skill('<name>')` calls point to folders that do not exist:

- `Skill('cold-email')` — `skills/audithq-outbound/SKILL.md:107`
- `Skill('page-cro')` — `skills/audithq-convert/SKILL.md:112,124`
- `Skill('web-fix')` — `skills/premium-website/SKILL.md:257`
- `Skill('content-humanizer')` — `skills/premium-website/SKILL.md:297`

Note: `Skill('X')` in `premium-website/SKILL.md:29,196` and `saas-build/SKILL.md:61` are documented placeholders — not broken.

---

## 4. RULE CONTRADICTIONS

1. **"battle-tested" clash.** `rules/common/development-workflow.md:9` recommends "battle-tested libraries"; `skills/critique/SKILL.md:28` and `skills/rate/SKILL.md:153` list "battle-tested" as a banned phrase in outputs. The rule file normalises a term the output scanner would reject.

2. **Human timelines in an AI-invoked agent.** CLAUDE.md bans "2 weeks", "few days" etc. for AI-executed work. `agents/cs-product-strategist.md:147` states "Time Estimate: 2-3 weeks" and line 193 "2-4 weeks" — timelines an AI agent would echo back as its own task estimates.

3. **Cardinal Rules without a canonical registry.** Rules 2, 3, 6, 8, 10, 11.6, 17, 30 are cited in `skills/web-evolve/references/` scripts, `skills/web-component/SKILL.md:14`, and `skills/shared/refinement-contract.md:66`, but no single authoritative definition file exists — definitions are scattered across shell scripts.

---

## 5. ORPHAN AGENTS

- **`agents/audithq-sales.md`** — true orphan; appears only in `manifest.json` and its own file; not invoked from `audithq-outbound` or any active skill.
- **`cs-*` advisor suite (27 agents)** — unrouted from CLAUDE.md or any active skill/command (persistent, flagged for 4+ weeks).
- **44 duplicate ` 2` files** — confirmed byte-for-byte identical to base files (e.g. `cs-agile-product-owner 2.md`); sync artefacts; persist for the fourth consecutive week.

Note: `web-benchmark`, `web-patch`, `web-score`, `web-screenshot` are routed via `subagent_type` in `skills/web-evolve/references/` — not orphans.

---

## 6. TOP 5 PRUNE CANDIDATES

| Rank | Skill | Lines | Reason |
|------|-------|-------|--------|
| 1 | `skills/design/` | 21 | Pure delegator to `cto-architect` + `strategic-cto-mentor`; fully covered by CLAUDE.md agent table and `skills/architecture/`. |
| 2 | `skills/validate/` | 24 | Near-identical to `decide` — both route to `strategic-cto-mentor` for plan stress-testing; redundant pair. |
| 3 | `skills/decide/` | 27 | Routes same agents as `validate`; no scripts or references; overlap is near-total. |
| 4 | `skills/reputation-monitor/` | 30 | 1 non-audit reference; no scripts/refs; monitoring-setup content is a subset of `reputation-audit`. |
| 5 | `skills/employer-social/` | 39 | 1 non-audit reference; no scripts/refs; LinkedIn audit step is already a phase inside `skills/employer-audit/`. |

---

## 7. SUMMARY

The rule hierarchy (`rules/common/` → language-specific) is structurally sound with clean documented overrides and no coding-style contradictions. The repo is drifting in two areas: (1) four dead `Skill()` references in the primary revenue skill chain (`audithq-outbound`, `audithq-convert`, `premium-website`) point to deleted skills and will silently fail under real usage; (2) 44 duplicate ` 2` agent files and the unrouted `cs-*` suite persist for the fourth consecutive week without resolution. The single highest-leverage action this week is restoring or redirecting the four broken Skill() references — they sit in the revenue path and will produce invisible failures when triggered.
