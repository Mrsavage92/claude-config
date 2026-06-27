# Weekly Maintenance Log — 2026-06-27

Observational only. No files modified. Adam reviews and applies fixes.

---

## 1. OVERSIZED SKILLS (>500 lines)

| Path | Lines |
|---|---|
| skills/social-audit/SKILL.md | 955 |
| skills/n8n-node-configuration/SKILL.md | 835 |
| skills/web-settings/SKILL.md | 800 |
| skills/n8n-code-javascript/SKILL.md | 784 |
| skills/n8n-validation-expert/SKILL.md | 761 |
| skills/saas-research/SKILL.md | 756 |
| skills/n8n-code-python/SKILL.md | 774 |
| skills/agent-browser/SKILL.md | 689 |
| skills/web-ai/SKILL.md | 581 |
| skills/web-onboarding/SKILL.md | 574 |
| skills/review/SKILL.md | 545 |
| skills/employer-audit/SKILL.md | 545 |
| skills/style-mirror/SKILL.md | 526 |
| skills/n8n-expression-syntax/SKILL.md | 525 |
| skills/web-email/SKILL.md | 527 |
| skills/market-competitors/SKILL.md | 542 |
| skills/ai-ready-audit/SKILL.md | 556 |
| skills/n8n-workflow-patterns/SKILL.md | 512 |
| skills/techaudit-audit/SKILL.md | 503 |

19 skills exceed the 500-line threshold. The n8n cluster (5 skills, 3,456 lines combined) is the largest contributor.

---

## 2. BANNED PHRASES

Hits in skills (genuine violations; meta-references and lint-exempted lines excluded):

| File | Line | Phrase |
|---|---|---|
| skills/ai-ready/SKILL.md | 8 | "comprehensive AI readiness assessment system" |
| skills/brand-dna/SKILL.md | 9 | "comprehensive Brand DNA document" |
| skills/dashboard-design/SKILL.md | 13 | "world-class SaaS dashboards" + "enterprise-grade" |
| skills/employer/SKILL.md | 8 | "comprehensive employer brand analysis and optimisation system" |
| skills/employer-audit/SKILL.md | 8 | "comprehensive, evidence-based audit" |
| skills/find-skills/SKILL.md | 46 | "battle-tested options" |
| skills/geo/SKILL.md | 8 | "comprehensive Generative Engine Optimization (GEO) system" |
| skills/n8n-code-javascript/SKILL.md | 784 | "production-ready examples" |
| skills/pipeline/SKILL.md | 3 | "production-ready CI/CD pipeline configs" |
| skills/plugin-audit/SKILL.md | 3 | "comprehensive 8-phase audit" |
| skills/reputation/SKILL.md | 8 | "comprehensive customer reputation and review analysis system" |
| skills/reputation-audit/SKILL.md | 8 | "comprehensive, evidence-based audit" |
| skills/scroll-stop-build/SKILL.md | 13 | "production-ready scroll-driven website" |
| skills/security/SKILL.md | 10 | "comprehensive evaluation" |
| skills/social-audit/SKILL.md | 8 | "comprehensive, evidence-based audit" |

Hits in agents (non-duplicate files only):

| File | Line | Phrase |
|---|---|---|
| agents/cs-audit-specialist.md | 3 | "comprehensive website audit" |
| agents/cs-orchestrator.md | 19 | "comprehensive deliverable" |

Most violations are in the opening `description:` line of audit-category skills — all use "comprehensive, evidence-based audit" as a boilerplate opener.

---

## 3. BROKEN SKILL REFERENCES

`Skill()` calls with no matching `skills/<name>/` folder:

| Reference | Found in | Resolution |
|---|---|---|
| `Skill('cold-email')` | skills/audithq-outbound/SKILL.md:107 | Only exists as commands/cold-email.md |
| `Skill('content-humanizer')` | skills/premium-website/SKILL.md:297 | Only exists as commands/content-humanizer.md |
| `Skill('page-cro')` | skills/audithq-convert/SKILL.md:112,124 | Only exists as commands/page-cro.md |
| `Skill('web-fix')` | skills/premium-website/SKILL.md:257 | Only exists as commands/web-fix.md |

Backtick `/name` refs with no matching skill folder AND no command file:

| Ref | Notes |
|---|---|
| `/bolder`, `/distill`, `/quieter` | Appear as web-evolve sub-modes in skill prose; no standalone skill or command |
| `/analytics`, `/route`, `/onboarding`, `/overview` | Referenced in various command/skill prose; no backing resource found |

Built-ins soft-allowed (not flagged): `/compact`, `/clear`, `/help`, `/init`, `/memory`, `/config`, `/model`.

---

## 4. RULE CONTRADICTIONS

**Contradiction 1 — "battle-tested" in a rule file:**
`rules/common/development-workflow.md:7` reads "Prefer **battle-tested** libraries over hand-rolled." The word `battle-tested` is explicitly banned in CLAUDE.md, `skills/critique/SKILL.md:28`, and `skills/skill-forge/SKILL.md:45`. A rule file that enforces quality conventions uses a phrase banned by the quality gate.

**Contradiction 2 — Dangling language override:**
`rules/common/coding-style.md` (Immutability section) states "Go and Rust have idiomatic mutation patterns — follow the language file for overrides." No `rules/go/` or `rules/rust/` directory exists. The override is promised but the override file is missing.

**Contradiction 3 — Orphaned `impeccable` name:**
`skills/impeccable/SKILL.md:38` explicitly states the skill name `impeccable` is "a structural violation" of the banned-phrase rule and says the correct name is `craft`. The folder was never renamed; the violation it self-documents is still live.

---

## 5. ORPHAN AGENTS

**44 duplicate " 2" agent files** with spaces in their filenames are unrouteable by the Agent tool and appear to be accidental duplicates of their non-spaced counterparts:
`cs-agile-product-owner 2.md`, `cs-ai-advisor 2.md`, `cs-audit-specialist 2.md`, `cs-board-advisor 2.md`, `cs-ceo-advisor 2.md`, `cs-cfo-advisor 2.md`, `cs-chief-of-staff 2.md`, `cs-chro-advisor 2.md`, `cs-ciso-advisor 2.md`, `cs-cmo-advisor 2.md`, `cs-content-creator 2.md`, `cs-cpo-advisor 2.md`, `cs-cro-advisor 2.md`, `cs-cto-advisor 2.md`, `cs-customer-success 2.md`, `cs-data-analyst 2.md`, `cs-demand-gen-specialist 2.md`, `cs-devops 2.md`, `cs-employer-brand 2.md`, `cs-engineering-lead 2.md`, `cs-financial-analyst 2.md`, `cs-founder-coach 2.md`, `cs-growth-strategist 2.md`, `cs-legal-advisor 2.md`, `cs-ma-advisor 2.md`, `cs-orchestrator 2.md`, `cs-partnerships 2.md`, `cs-product-analyst 2.md`, `cs-product-manager 2.md`, `cs-product-strategist 2.md`, `cs-project-manager 2.md`, `cs-quality-regulatory 2.md`, `cs-reputation-manager 2.md`, `cs-revenue-ops 2.md`, `cs-sales-coach 2.md`, `cs-sales-engineer 2.md`, `cs-scenario-war-room 2.md`, `cs-senior-engineer 2.md`, `cs-seo-specialist 2.md`, `cs-sre 2.md`, `cs-ux-researcher 2.md`, `cs-workspace-admin 2.md`, `cto-orchestrator 2.md`, `systems-architect 2.md`.

**Agents not appearing in CLAUDE.md routing table or any skill/command reference:**

| Agent | Notes |
|---|---|
| agents/audithq-sales.md | Not referenced anywhere in CLAUDE.md, skills, or commands |
| agents/web-benchmark.md | Not in CLAUDE.md routing table; no skill references found |
| agents/web-patch.md | Not in CLAUDE.md routing table; no skill references found |
| agents/web-score.md | Not in CLAUDE.md routing table; no skill references found |
| agents/web-screenshot.md | Not in CLAUDE.md routing table; no skill references found |
| agents/cto-orchestrator.md | Not in CLAUDE.md routing table; check if superseded by cto-architect |

---

## 6. TOP 5 PRUNE CANDIDATES

*Note: repo is 8 days old (initial commit 2026-06-19); the 90-day staleness signal does not apply this cycle. Rankings based on size, no extras directory, and description overlap.*

| Rank | Skill | Lines | Reason |
|---|---|---|---|
| 1 | skills/design | 21 | Single-paragraph stub; delegates entirely to `cto-architect` agent — fully covered by CLAUDE.md routing table and `skills/architecture` |
| 2 | skills/validate | 24 | Delegates entirely to `strategic-cto-mentor`; overlaps with `saas-validator` and `product-validator` which have fuller implementations |
| 3 | skills/decide | 27 | Thin decision-support stub; intent covered by `skills/rate` (0–100 scoring) and `skills/brainstorming` |
| 4 | skills/reputation-monitor | 30 | Sub-step of the reputation cluster; `reputation-audit` + `reputation` already cover this surface with full scoring rubrics |
| 5 | skills/sprint-plan | 38 | Nearly identical scope to `skills/sprint-health` (49 lines); both cover sprint planning with no meaningful differentiation |

---

## 7. SUMMARY

The repo's structure is clean: the agent routing table in CLAUDE.md is consistently applied, the n8n and geo skill clusters are well-organized specialist suites, and the premium-website build pipeline is coherently documented. The main drift is in the `agents/` directory, where 44 space-named duplicate files have accumulated and are silently unrouteable — this is the single highest-leverage cleanup. The coming week's highest-value action is deleting the 44 " 2" agent duplicates and renaming `skills/impeccable/` to `skills/craft/` per the skill's own self-documented correction.
