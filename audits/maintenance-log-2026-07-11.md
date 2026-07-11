# Weekly Maintenance Log — 2026-07-11

Auditor: automated harness. Observational only — no files modified.

---

## 1. OVERSIZED SKILLS (> 500 lines)

21 skill files exceed the 500-line threshold:

| Path | Lines |
|------|-------|
| skills/social-audit/SKILL.md | 955 |
| skills/n8n-node-configuration/SKILL.md | 835 |
| skills/web-settings/SKILL.md | 800 |
| skills/n8n-code-javascript/SKILL.md | 784 |
| skills/n8n-validation-expert/SKILL.md | 761 |
| skills/n8n-code-python/SKILL.md | 774 |
| skills/saas-research/SKILL.md | 756 |
| skills/agent-browser/SKILL.md | 689 |
| skills/docx/SKILL.md | 590 |
| skills/web-ai/SKILL.md | 581 |
| skills/web-onboarding/SKILL.md | 574 |
| skills/claude-api/SKILL.md | 561 |
| skills/ai-ready-audit/SKILL.md | 556 |
| skills/review/SKILL.md | 545 |
| skills/employer-audit/SKILL.md | 545 |
| skills/market-competitors/SKILL.md | 542 |
| skills/style-mirror/SKILL.md | 526 |
| skills/n8n-expression-syntax/SKILL.md | 525 |
| skills/web-email/SKILL.md | 527 |
| skills/n8n-workflow-patterns/SKILL.md | 512 |
| skills/techaudit-audit/SKILL.md | 503 |

---

## 2. BANNED PHRASES

Actual banned-phrase hits in skill/agent content (excluding meta-discussion lines that list banned words):

| File | Line | Phrase |
|------|------|--------|
| skills/dashboard-design/SKILL.md | 13 | world-class, enterprise-grade |
| skills/find-skills/SKILL.md | 46 | battle-tested |
| skills/n8n-code-javascript/SKILL.md | 784 | production-ready |
| skills/pipeline/SKILL.md | 3 | production-ready (in description field) |
| skills/plugin-audit/SKILL.md | 246 | production-ready (in checklist) |
| skills/premium-website/SKILL.md | 122 | world-class |
| skills/premium-website/SKILL.md | 309 | world-class |
| skills/review/SKILL.md | 7 | production-ready (quoting a user intent phrase) |
| skills/saas-discover/SKILL.md | 182 | 10/10 |
| skills/scroll-stop-build/SKILL.md | 13 | production-ready |
| skills/web-stripe/SKILL.md | 3 | production-ready (in description) |
| skills/web-table/SKILL.md | 4 | production-ready (in description) |
| agents/mcp-server-builder.md | 3 | production-ready (in description) |
| agents/strategic-cto-mentor.md | 24 | battle-tested |
| agents/test-engineer.md | 52 | production-ready |

---

## 3. BROKEN SKILL REFERENCES

### Missing `Skill('<name>')` — no matching `skills/<name>/` folder

These four are referenced via `Skill()` in skill files but only exist as `commands/*.md`, not as `skills/` directories:

| Reference | Appears In |
|-----------|------------|
| `Skill('cold-email')` | skills/audithq-outbound/SKILL.md:107 |
| `Skill('content-humanizer')` | skills/premium-website/SKILL.md:297 |
| `Skill('page-cro')` | skills/audithq-convert/SKILL.md:112,124 |
| `Skill('web-fix')` | skills/premium-website/SKILL.md:257 |

### Missing backtick slash-command refs — no matching `skills/` OR `commands/` file

These appear as `` `/name` `` in skill/command prose but resolve to neither a skills folder nor a commands file. App-route-like names (analytics, dashboard, auth, settings, etc.) may be intentional URL references rather than skill invocations; the ones most likely to be real skill gaps are:

`/bolder`, `/clients`, `/distill`, `/free-scan`, `/monitor`, `/overview`, `/quieter`

---

## 4. RULE CONTRADICTIONS

**A. "Cardinal Rules" orphaned references**
Eight skills reference "Cardinal Rule N" with specific rule numbers, but no "Cardinal Rules" section or index exists anywhere in CLAUDE.md or the `rules/` tree. All references are dangling:

- skills/adapt/SKILL.md:20 — "Cardinal Rule 30"
- skills/animate/SKILL.md:57,94 — "Cardinal Rule 30", "Cardinal Rule 1"
- skills/clarify/SKILL.md:22 — "Cardinal Rule 30"
- skills/critique/SKILL.md:205 — "Cardinal Rule 8"
- skills/layout/SKILL.md:19 — "Cardinal Rule 30"
- skills/optimize/SKILL.md:20 — "Cardinal Rule 30"
- skills/overdrive/SKILL.md:26 — "Cardinal Rule 30"
- skills/polish/SKILL.md:17 — "Cardinal Rule 30"
- skills/premium-website/SKILL.md:261 — "Cardinal Rule 14"
- skills/style-mirror/SKILL.md:23 — "Cardinal Rules as before"
- skills/typeset/SKILL.md:86 — "Cardinal Rule 30"
- skills/web-component/SKILL.md:14 — "Cardinal Rule 30"
- skills/web-page/SKILL.md:64 — "Cardinal Rule 31"

**B. Immutability strength mismatch**
`rules/common/coding-style.md:5` declares "ALWAYS create new objects, NEVER mutate existing ones" (absolute). `rules/python/coding-style.md:25` says "Prefer immutable data structures" (soft). The common rule notes Go/Rust have documented overrides, but Python is not listed as an exception — the weaker "prefer" wording in Python rules undercuts the blanket ALWAYS/NEVER without explicit acknowledgement.

---

## 5. ORPHAN AGENTS

37 agent files are not referenced in any CLAUDE.md, SKILL.md, or commands file via `Agent(subagent_type=...)` or plain name. The entire `cs-*` advisor suite (except cs-agile-product-owner, cs-content-creator, cs-customer-success, cs-financial-analyst, cs-growth-strategist, cs-partnerships, cs-product-manager, cs-project-manager, cs-quality-regulatory, cs-revenue-ops, cs-sales-coach, cs-senior-engineer) is unrouted:

`audithq-sales`, `cs-ai-advisor`, `cs-audit-specialist`, `cs-board-advisor`, `cs-ceo-advisor`, `cs-cfo-advisor`, `cs-chief-of-staff`, `cs-chro-advisor`, `cs-ciso-advisor`, `cs-cmo-advisor`, `cs-coo-advisor`, `cs-cpo-advisor`, `cs-cro-advisor`, `cs-cto-advisor`, `cs-data-analyst`, `cs-demand-gen-specialist`, `cs-devops`, `cs-employer-brand`, `cs-engineering-lead`, `cs-founder-coach`, `cs-legal-advisor`, `cs-ma-advisor`, `cs-orchestrator`, `cs-product-analyst`, `cs-product-strategist`, `cs-reputation-manager`, `cs-sales-engineer`, `cs-scenario-war-room`, `cs-seo-specialist`, `cs-sre`, `cs-ux-researcher`, `cs-workspace-admin`, `cto-orchestrator`, `web-benchmark`, `web-patch`, `web-score`, `web-screenshot`

**Duplicate ` 2` files:** 44 agent files have a `name 2.md` sibling that is byte-for-byte or near-identical (e.g. `cs-agile-product-owner 2.md` alongside `cs-agile-product-owner.md`). These appear to be sync artefacts and consume no routing but do create confusion. Affected files: all cs-* agents plus `cto-orchestrator 2.md` and `systems-architect 2.md`.

---

## 6. TOP 5 PRUNE CANDIDATES

Note: all candidates below were last committed 2026-05-30 (42 days ago), below the 90-day staleness threshold, but score on all other dimensions.

| Rank | Skill | Lines | Reason |
|------|-------|-------|--------|
| 1 | `skills/design/` | 21 | Trivial redirect to `cto-architect` agent; no independent content; fully covered by `architecture` skill + agent routing in CLAUDE.md. |
| 2 | `skills/validate/` | 24 | Thin wrapper routing to `strategic-cto-mentor`; purpose duplicates `decide` (both stress-test plans via the same agent); neither has scripts or references. |
| 3 | `skills/deep-research/` | 25 | Thin wrapper; `deep-research` is already a system-listed built-in skill in the Claude Code harness — this file shadows the built-in without adding substance. |
| 4 | `skills/decide/` | 27 | Routes to `strategic-cto-mentor` + `systems-architect`; purpose overlap with `validate` is near-total; no scripts or references. |
| 5 | `skills/reputation-monitor/` | 30 | Small, no scripts/references, description overlaps with `reputation` (comprehensive reputation system) and `reputation-audit` (evidence-based audit skill). |

---

## 7. SUMMARY

The rule files and core CLAUDE.md routing table are structurally sound — language-specific rules extend common/ cleanly with documented overrides, and the agent routing table covers the primary specialist roles. The repo is drifting in two areas: (1) the `agents/` folder contains 37 unrouted `cs-*` advisor agents plus 44 `" 2"` duplicate files that exist only as sync artefacts — they consume folder space, slow ToolSearch, and make agent selection ambiguous; (2) "Cardinal Rules" referenced by number in 13 skill files point to documentation that does not exist anywhere in the repo, leaving downstream skills anchored to an invisible contract. The single highest-leverage action this week is deciding whether the `cs-*` advisor suite belongs in this repo at all — wire the ones that are active into CLAUDE.md routing or prune them, and delete all `" 2"` duplicates.
