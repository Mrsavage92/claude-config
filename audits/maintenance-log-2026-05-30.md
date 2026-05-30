# Weekly Maintenance Log — 2026-05-30

Observational only. No files modified. Adam applies fixes.

---

## 1. OVERSIZED SKILLS (>500 lines)

| Path | Lines | Δ vs 2026-05-23 |
|------|-------|-----------------|
| skills/social-audit/SKILL.md | 955 | — |
| skills/n8n-node-configuration/SKILL.md | 835 | — |
| skills/web-settings/SKILL.md | 800 | — |
| skills/n8n-code-javascript/SKILL.md | 784 | — |
| skills/n8n-code-python/SKILL.md | 774 | — |
| skills/n8n-validation-expert/SKILL.md | 761 | — |
| skills/saas-research/SKILL.md | 756 | — |
| skills/agent-browser/SKILL.md | 689 | — |
| skills/web-ai/SKILL.md | 581 | +5 |
| skills/web-onboarding/SKILL.md | 574 | — |
| skills/ai-ready-audit/SKILL.md | 556 | — |
| skills/employer-audit/SKILL.md | 545 | — |
| skills/review/SKILL.md | 545 | — |
| skills/market-competitors/SKILL.md | 542 | +5 |
| skills/web-email/SKILL.md | 527 | — |
| skills/style-mirror/SKILL.md | 526 | +2 |
| skills/n8n-expression-syntax/SKILL.md | 525 | — |
| skills/n8n-workflow-patterns/SKILL.md | 512 | — |
| skills/techaudit-audit/SKILL.md | 503 | — |

No new entries vs last week; no reductions either. All 19 persist unchanged.

---

## 2. BANNED PHRASES

Hits in non-meta contexts (self-praise or opening description):

| File | Line | Phrase |
|------|------|--------|
| skills/ai-ready/SKILL.md | 8 | comprehensive |
| skills/employer/SKILL.md | 8 | comprehensive |
| skills/geo/SKILL.md | 8 | comprehensive |
| skills/reputation/SKILL.md | 8 | comprehensive |
| skills/techaudit/SKILL.md | 8 | comprehensive |
| skills/employer-audit/SKILL.md | 8 | comprehensive |
| skills/reputation-audit/SKILL.md | 8 | comprehensive |
| skills/social-audit/SKILL.md | 8 | comprehensive |
| skills/techaudit-audit/SKILL.md | 8 | comprehensive |
| skills/dashboard-design/SKILL.md | 13 | world-class, enterprise-grade |
| skills/web-review/SKILL.md | 3 | Comprehensive (frontmatter description) |
| skills/plugin-audit/SKILL.md | 3 | comprehensive (frontmatter description) |
| skills/pipeline/SKILL.md | 3 | production-ready (frontmatter description) |
| skills/web-stripe/SKILL.md | 3 | production-ready (frontmatter description) |
| skills/web-table/SKILL.md | 4 | Production-ready (frontmatter description) |
| skills/scroll-stop-build/SKILL.md | 13 | production-ready |
| skills/n8n-code-javascript/SKILL.md | 784 | production-ready |
| agents/mcp-server-builder.md | 3 | production-ready (frontmatter description) |
| agents/cto-architect.md | 8 | comprehensive |
| agents/test-engineer.md | 8 | comprehensive |
| agents/test-engineer.md | 42 | comprehensive |
| agents/test-engineer.md | 51 | comprehensive |
| agents/test-engineer.md | 52 | production-ready |
| agents/strategic-cto-mentor.md | 24 | battle-tested |
| skills/find-skills/SKILL.md | 46 | battle-tested |

Note: `skills/critique/SKILL.md`, `skills/rate/SKILL.md`, `skills/skill-forge/SKILL.md`, and `skills/impeccable/SKILL.md` contain banned words only as examples of the ban rule itself — not violations.

---

## 3. BROKEN SKILL REFERENCES

`Skill('name')` calls with no matching `skills/<name>/` folder:

| Reference | Caller | Note |
|-----------|--------|------|
| `Skill('content-humanizer')` | skills/premium-website/SKILL.md:297 | No skills/content-humanizer/ folder; archive copy exists at skills/archive/marketing-skill/content-humanizer/ |
| `Skill('distill')` | skills/saas-build/references/phase-5-quality.md:33 | No skills/distill/ folder anywhere |
| `Skill('web-fix')` | skills/saas-build/references/phase-6-deploy.md:127, skills/premium-website/SKILL.md:257, skills/premium-website/references/quality-bar.md:36 | commands/web-fix.md exists but no skills/web-fix/ folder — Skill() wrapper won't resolve to a command |

Backtick route refs in commands (`/auth`, `/dashboard`, `/settings`, etc.) are internal app page routes in generated scaffolds, not skill invocations — excluded.

---

## 4. RULE CONTRADICTIONS

**Naming convention implicit override (low severity):**
- `rules/common/coding-style.md` naming table specifies `camelCase` for variables and functions.
- `rules/python/coding-style.md` naming table specifies `snake_case` for functions and variables.
- Neither file includes an explicit "this overrides common" note. CLAUDE.md says "Language rules override common where they conflict" but that cross-reference is absent from both rule files. A developer loading only `rules/common/coding-style.md` would apply camelCase to Python.

No other direct contradictions found between common/typescript/python/web rule files. Testing rules are consistent across all three layers (all agree: don't mock the DB in integration tests; mock paid external APIs).

---

## 5. ORPHAN AGENTS

No fully orphaned agents found. All 21 agents have at least one external reference.

**Potentially narrow-use agents** (referenced only within `web-evolve` reference files, not in CLAUDE.md routing table):

| Agent | External Refs | Referenced In |
|-------|--------------|---------------|
| agents/web-benchmark.md | 3 | skills/web-evolve/references/, skills/shared/ |
| agents/web-patch.md | 3 | skills/web-evolve/references/ |
| agents/web-screenshot.md | 3 | skills/web-evolve/references/ |
| agents/web-score.md | 4 | skills/web-evolve/references/, skills/shared/ |

These are sub-agents for `web-evolve` only — valid, but not discoverable via the CLAUDE.md routing table.

---

## 6. TOP 5 PRUNE CANDIDATES

Ranked by (small + no scripts/refs + untouched since May 19 + description overlap):

| Rank | Skill | Lines | Last Touch | Reason |
|------|-------|-------|------------|--------|
| 1 | skills/design | 21 | 2026-05-19 | Ultra-thin stub; "use cto-architect agent" — fully superseded by `agents/cto-architect.md` |
| 2 | skills/validate | 24 | 2026-05-19 | Minimal wrapper; functionality covered by `skills/product-validator` and `skills/saas-validator` |
| 3 | skills/decide | 27 | 2026-05-19 | Small decision-framing skill; overlaps with `agents/strategic-cto-mentor` and `skills/prd` |
| 4 | skills/reputation-monitor | 30 | 2026-05-19 | Thin sub-skill; `skills/reputation-audit` covers monitoring as a phase |
| 5 | skills/sprint-plan | 38 | 2026-05-19 | Overlaps with `skills/standup`, `skills/retro`, and `skills/project-manager`; no unique logic |

---

## 7. SUMMARY

The harness structure remains sound: agent routing table is complete, all 21 agents are referenced, rule files are internally consistent, and the n8n/geo/web skill families are well-fleshed out. The main drift is that banned phrases (especially "comprehensive" and "production-ready") have re-accumulated in 25 locations across agent frontmatter and skill opening descriptions — the same pattern flagged May 23 with no reduction. The single highest-leverage action this week is purging "comprehensive / production-ready" from the 9 audit-family skill intros (lines 8) and the 4 agent frontmatter descriptions — those are 13 one-line fixes that enforce the harness's own quality rule.
