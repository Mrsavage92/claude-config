# Weekly Maintenance Log — 2026-07-04

Scope: `Mrsavage92/claude-config` (observational only, no files modified)

---

## 1. OVERSIZED SKILLS (>500 lines)

21 non-archive skills exceed 500 lines. Top 10 by size:

| Lines | Path |
|------:|------|
| 955 | `skills/social-audit/SKILL.md` |
| 835 | `skills/n8n-node-configuration/SKILL.md` |
| 800 | `skills/web-settings/SKILL.md` |
| 784 | `skills/n8n-code-javascript/SKILL.md` |
| 774 | `skills/n8n-code-python/SKILL.md` |
| 761 | `skills/n8n-validation-expert/SKILL.md` |
| 756 | `skills/saas-research/SKILL.md` |
| 689 | `skills/agent-browser/SKILL.md` |
| 590 | `skills/docx/SKILL.md` |
| 581 | `skills/web-ai/SKILL.md` |

Remaining 11 (503–574 lines): `web-onboarding`, `claude-api`, `ai-ready-audit`, `review`, `employer-audit`, `market-competitors`, `web-email`, `style-mirror`, `n8n-expression-syntax`, `n8n-workflow-patterns`, `techaudit-audit`.

---

## 2. BANNED PHRASES

Genuine quality-claim violations (excluded: rule-definition contexts, technical licensing terms, negative examples). 16 hits across 14 files:

`skills/dashboard-design/SKILL.md:13` — "world-class SaaS dashboards" / "enterprise-grade"  
`skills/pipeline/SKILL.md:3` — "production-ready CI/CD pipeline configs"  
`skills/geo/SKILL.md:8`, `skills/employer/SKILL.md:8`, `skills/reputation/SKILL.md:8`, `skills/ai-ready/SKILL.md:8`, `skills/employer-audit/SKILL.md:8`, `skills/reputation-audit/SKILL.md:8`, `skills/brand-dna/SKILL.md:9`, `skills/plugin-audit/SKILL.md:3` — "comprehensive" in first-person skill description  
`skills/mcp-builder/SKILL.md:26,74` — "comprehensive API endpoint coverage" (×2)  
`skills/find-skills/SKILL.md:46` — "battle-tested options"  
`skills/saas-discover/SKILL.md:182` — "10/10 BUILD candidate"  
`skills/n8n-code-javascript/SKILL.md:784` — "production-ready examples"  
`skills/scroll-stop-build/SKILL.md:13` — "production-ready scroll-driven website"  
`skills/canvas-design/SKILL.md:114,122` — "perfect" (self-describing output)

---

## 3. BROKEN SKILL REFERENCES

All `Skill('<name>')` invocations resolve to a skill folder or command file. No broken `Skill()` calls.

Backtick slash-command refs with no backing file (non-routes, non-deprecated):

| File | Line | Ref | Notes |
|------|------|-----|-------|
| `skills/business-growth/SKILL.md` | 22 | `` `/revenue-ops-advisor` `` | No skill folder or command file |
| `skills/calibrate-amplitude/SKILL.md` | 130 | `` `/bolder` ``, `` `/distill` ``, `` `/quieter` `` | Documented as deprecated redirects but no folders exist; callers will fail |

Note: `` `/analytics` ``, `` `/dashboard` ``, `` `/settings` ``, `` `/auth` ``, `` `/pricing` `` etc. are web-app URL paths in table cells, not skill invocations — intentional.

---

## 4. RULE CONTRADICTIONS

No direct contradictions between `rules/common/`, `rules/typescript/`, `rules/python/`, and `rules/web/` files. All align on error handling (never swallow silently), immutability, and no-comments default.

One structural tension to watch:

- `rules/common/coding-style.md:35` sets an **800-line hard cap** on code files.
- No equivalent cap is enforced on `SKILL.md` files (21 skills exceed it; `social-audit` is at 955).

No Cardinal Rules referenced in skills that are absent from `CLAUDE.md`.

---

## 5. ORPHAN AGENTS

Agents with no reference in any `CLAUDE.md`, `SKILL.md`, or command file:

**Customer Success suite — 43 `cs-*` agents** (e.g. `cs-ceo-advisor`, `cs-cto-advisor`, `cs-orchestrator` … full list: `cs-{agile-product-owner,ai-advisor,audit-specialist,board-advisor,ceo-advisor,cfo-advisor,chief-of-staff,chro-advisor,ciso-advisor,cmo-advisor,content-creator,coo-advisor,cpo-advisor,cro-advisor,cto-advisor,customer-success,data-analyst,demand-gen-specialist,devops,employer-brand,engineering-lead,financial-analyst,founder-coach,growth-strategist,legal-advisor,ma-advisor,orchestrator,partnerships,product-analyst,product-manager,product-strategist,project-manager,quality-regulatory,reputation-manager,revenue-ops,sales-coach,sales-engineer,scenario-war-room,senior-engineer,seo-specialist,sre,ux-researcher,workspace-admin}`). No invocation found in any skill, command, or CLAUDE.md.

**Other orphans:** `agents/audithq-sales.md`, `agents/cto-orchestrator.md`, `agents/web-benchmark.md`, `agents/web-patch.md`, `agents/web-score.md`, `agents/web-screenshot.md`

**Structural issue — 44 duplicate `" 2.md"` files** in `agents/` (e.g. `agents/cs-orchestrator 2.md`). Diff-confirmed byte-identical to originals.

---

## 6. TOP 5 PRUNE CANDIDATES

| Rank | Skill | Lines | Reason |
|------|-------|------:|--------|
| 1 | `skills/design` | 21 | Thin agent-delegation stub; `commands/design.md` + CLAUDE.md routing table (cto-architect) cover it fully |
| 2 | `skills/validate` | 24 | Thin stub delegating to strategic-cto-mentor; `commands/validate.md` is the canonical entry point |
| 3 | `skills/decide` | 27 | Thin stub delegating to strategic-cto-mentor + systems-architect; `commands/decide.md` duplicates it |
| 4 | `skills/reputation-monitor` | 30 | Narrow monitoring-setup guide with no scripts/; absorbed by the `reputation` + `reputation-audit` skill pair |
| 5 | `skills/saas-health` | 49 | References scripts at `finance/saas-metrics-coach/scripts/` that don't exist in this repo; `financial-health` skill covers the same territory |

All five: last touched 2026-05-30 (initial bulk import), no `references/` or `scripts/` directories, no invocations found in any command or skill.

---

## 7. SUMMARY

The routing table in `CLAUDE.md` and the web-build skill suite (`saas-build` → `web-*`) are cohesive and well-maintained; core engineering-agent coverage is complete. The `agents/` directory has significant structural drift: 44 identical `" 2.md"` duplicates and ~43 orphan cs-*/web-* agents with no documented invocations represent dead weight that will confuse any automated harness scanning. The single highest-leverage action this week is removing the 44 duplicate `" 2.md"` agent files and collapsing the three thin delegation skills (`design`, `validate`, `decide`) into their existing command equivalents — zero risk, immediate noise reduction.
