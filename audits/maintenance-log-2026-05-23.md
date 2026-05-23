# Weekly Maintenance Log — 2026-05-23

Observational only. No files modified. Adam applies fixes.

---

## 1. OVERSIZED SKILLS (>500 lines)

| Path | Lines |
|------|-------|
| skills/social-audit/SKILL.md | 955 |
| skills/n8n-node-configuration/SKILL.md | 835 |
| skills/web-settings/SKILL.md | 800 |
| skills/n8n-code-javascript/SKILL.md | 784 |
| skills/n8n-code-python/SKILL.md | 774 |
| skills/n8n-validation-expert/SKILL.md | 761 |
| skills/saas-research/SKILL.md | 756 |
| skills/agent-browser/SKILL.md | 689 |
| skills/web-ai/SKILL.md | 576 |
| skills/web-onboarding/SKILL.md | 574 |
| skills/ai-ready-audit/SKILL.md | 556 |
| skills/employer-audit/SKILL.md | 545 |
| skills/review/SKILL.md | 545 |
| skills/market-competitors/SKILL.md | 537 |
| skills/web-email/SKILL.md | 527 |
| skills/n8n-expression-syntax/SKILL.md | 525 |
| skills/style-mirror/SKILL.md | 524 |
| skills/n8n-workflow-patterns/SKILL.md | 512 |
| skills/techaudit-audit/SKILL.md | 503 |

---

## 2. BANNED PHRASES

Hits in SKILL.md and agents/*.md (self-referential listing contexts excluded):

| File | Line | Phrase |
|------|------|--------|
| skills/dashboard-design/SKILL.md | 13 | world-class |
| skills/brand-dna/SKILL.md | 9 | comprehensive |
| skills/ai-ready/SKILL.md | 8 | comprehensive |
| skills/employer-audit/SKILL.md | 8 | comprehensive |
| skills/geo-audit/SKILL.md | 3, 17 | comprehensive |
| skills/geo/SKILL.md | 8 | comprehensive |
| skills/market-competitors/SKILL.md | 3 | comprehensive |
| skills/market-report/SKILL.md | 4 | comprehensive |
| skills/market-seo/SKILL.md | 4 | comprehensive |
| skills/reputation/SKILL.md | 8 | comprehensive |
| skills/techaudit-audit/SKILL.md | 8 | comprehensive |
| skills/pipeline/SKILL.md | 3 | production-ready |
| skills/saas-discover/SKILL.md | 182 | 10/10 |
| skills/product-validator/SKILL.md | 132 | perfect |
| agents/strategic-cto-mentor.md | 24 | battle-tested |
| agents/mcp-server-builder.md | 3 | production-ready |
| agents/cto-architect.md | 8 | comprehensive |
| agents/test-engineer.md | 8, 52 | comprehensive, production-ready |

---

## 3. BROKEN SKILL REFERENCES

**Missing skill folders — `Skill()` calls:**
- `Skill('content-humanizer')` at skills/web-page/SKILL.md:318 — no `skills/content-humanizer/` folder; skill lives only in `skills/archive/`.
- `Skill('web-fix')` at skills/web-evolve/references/decisions.md:924 — no folder; fix-routing.md:19 confirms removal, but world-class-tier.md:240,245 and tier-contracts.md:240,245 still name it as a `fix_skill`.

**Missing skill folders — `/slash` refs in active files:**
- `/web-fix` — skills/README.md:70, SKILL-AUTHORING-STANDARD.md:122, senior-frontend/SKILL.md:12, saas-improve/SKILL.md:338.
- `/scaffold` — product-validator/SKILL.md:8,211 lists it as a build-gated skill; no `skills/scaffold/` folder.
- `/seo-auditor` — referenced in commands; no folder (nearest is `seo-strategy`).

**Missing agent — referenced in SKILL.md prose:**
- `systems-architect` — called by name in skills/decide/SKILL.md:1 and skills/design/SKILL.md. No `agents/systems-architect.md` exists.

---

## 4. RULE CONTRADICTIONS

- `rules/common/patterns.md:5` — "Search for battle-tested implementations" embeds the banned phrase `battle-tested` in a file that is auto-loaded during code work, contradicting the ban enforced in critique/SKILL.md and review/SKILL.md.
- No explicit always-X vs never-X contradictions found between common/, typescript/, python/, or web/ rule files. Cardinal Rule refs in web-evolve/web-component are internal to that skill's numbering system, not CLAUDE.md.

---

## 5. ORPHAN AGENTS

(none) — all 21 agents appear in at least one of: CLAUDE.md routing table, a SKILL.md file, or a command file. The four web-suite specialists (web-benchmark, web-patch, web-score, web-screenshot) are wired through skills/web-evolve/ references.

---

## 6. TOP 5 PRUNE CANDIDATES

1. **skills/design** (21 lines, no scripts/refs) — one-sentence delegator to `cto-architect`; fully superseded by the agent and `skills/architecture`.
2. **skills/validate** (24 lines, no scripts/refs) — thin wrapper calling `strategic-cto-mentor`; CLAUDE.md routing table already routes "validating a plan" directly to that agent.
3. **skills/decide** (27 lines, no scripts/refs) — delegates to `strategic-cto-mentor` + non-existent `systems-architect`; broken agent ref makes it unreliable.
4. **skills/reputation-monitor** (30 lines, no scripts/refs) — setup guide with heavy overlap against `reputation` + `reputation-audit`; no scripted value.
5. **skills/sprint-plan** (38 lines, no scripts/refs) — narrow wrapper overlapping `sprint-health` / `standup` / `retro` cluster; no capability that `sprint-health` Phase 0 doesn't cover.

---

## 7. SUMMARY

The harness skeleton is healthy: 21 agents registered and wired, rules files extend cleanly with no file-vs-file contradictions, and skill cross-references are active. Banned-phrase contamination is the worst drift — "comprehensive" appears in 12+ SKILL.md and agent description lines that load into every invocation of those skills, and `dashboard-design` still says "world-class" in its opening line. Two deleted skills (`web-fix`, `content-humanizer`) have live `Skill()` calls in active SKILL.md files that will silently mis-route at runtime. Highest-leverage action this week: strip banned phrases from the 12 affected SKILL.md/agent description lines — each is a 1–2 word swap with zero functional change.
