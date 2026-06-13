# Harness Maintenance Log — 2026-06-13

## 1. OVERSIZED SKILLS (> 500 lines)

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

Genuine violations (not meta-references explaining the ban):

| File | Line | Phrase |
|---|---|---|
| skills/dashboard-design/SKILL.md | 13 | world-class, enterprise-grade |
| skills/pipeline/SKILL.md | 3 | production-ready (in frontmatter `description`) |
| skills/plugin-audit/SKILL.md | 3 | comprehensive (in frontmatter `description`) |
| skills/plugin-audit/SKILL.md | 246 | production-ready |
| skills/n8n-code-javascript/SKILL.md | 784 | production-ready |
| skills/ai-ready/SKILL.md | 8 | comprehensive |
| skills/employer-audit/SKILL.md | 8 | comprehensive |
| skills/employer/SKILL.md | 8 | comprehensive |
| skills/geo/SKILL.md | 8 | comprehensive |
| skills/reputation-audit/SKILL.md | 8 | comprehensive |
| skills/reputation/SKILL.md | 8 | comprehensive |
| skills/brand-dna/SKILL.md | 9 | comprehensive |
| skills/saas-discover/SKILL.md | 182 | 10/10 |
| skills/find-skills/SKILL.md | 46 | battle-tested |

---

## 3. BROKEN SKILL REFERENCES

`Skill('<name>')` calls where no matching skill folder exists:

| Reference | Found in | Note |
|---|---|---|
| `Skill('cold-email')` | audithq-outbound/SKILL.md, audithq-pipeline/SKILL.md | Exists only as `commands/cold-email.md`, not a skill folder |
| `Skill('content-humanizer')` | premium-website/SKILL.md:157 | Exists only as `commands/content-humanizer.md` |
| `Skill('page-cro')` | audithq-convert/SKILL.md (×3) | Exists only as `commands/page-cro.md` |
| `Skill('web-fix')` | premium-website/SKILL.md:55 | Exists only as `commands/web-fix.md` |
| `` `/bolder` `` | audit/SKILL.md:168,196; critique/SKILL.md:345,410 | No skill folder, no command file, no redirect stub (calibrate-amplitude deprecates it but skill is not named in the commands that reference `/bolder`) |

Additionally: `audit/SKILL.md` and `critique/SKILL.md` both list `/distill`, `/quieter`, `/harden` as valid commands to recommend — none of these have skill folders or command files.

---

## 4. RULE CONTRADICTIONS

| Issue | Files | Conflicting Text |
|---|---|---|
| Banned phrase used in rules | `rules/common/patterns.md:5` | "Search for battle-tested implementations" — "battle-tested" is banned in skill/agent output per `critique/SKILL.md:18` |
| Deprecated commands still recommended | `skills/audit/SKILL.md:168,196` vs `skills/calibrate-amplitude/SKILL.md:15` | audit/critique recommend `/bolder`, `/distill`, `/quieter` as valid commands; calibrate-amplitude explicitly states these are deprecated and replaced |
| Cardinal Rules defined in one file, cross-referenced in twelve | `skills/web-evolve/SKILL.md` (definition) vs `skills/adapt`, `animate`, `clarify`, `layout`, `optimize`, `overdrive`, `polish`, `typeset`, `web-component`, `web-page` | "web-evolve Cardinal Rule 30" / "Cardinal Rule 1 / 8 / 14 / 31" are referenced with no canonical stub; if web-evolve is removed the rule chain breaks |

---

## 5. ORPHAN AGENTS

Agents with no reference in CLAUDE.md, any SKILL.md, or any command file:

**Structural issue:** 44 duplicate `" 2.md"` files exist in `agents/` (e.g. `cs-agile-product-owner 2.md` is a byte-for-byte copy of `cs-agile-product-owner.md`). All 44 are dead weight.

**Entire cs-* suite (38 agents)** — `cs-orchestrator` itself has no entry point in any skill or command; the whole suite is unreachable from the harness. All agents prefixed `cs-` fall here (cs-agile-product-owner through cs-workspace-admin).

**Individual orphans outside cs-*:** `audithq-sales`, `cto-orchestrator`, `web-benchmark`, `web-patch`, `web-score`, `web-screenshot`, `systems-architect`.

---

## 6. TOP 5 PRUNE CANDIDATES

| Rank | Skill | Lines | Last Touch | Reason |
|---|---|---|---|---|
| 1 | `validate` | 24 | 2026-05-30 | Thin wrapper over `strategic-cto-mentor`; `saas-validator` covers the same stress-test use case with more depth |
| 2 | `decide` | 27 | 2026-05-30 | Thin wrapper over `strategic-cto-mentor` + `systems-architect`; no unique logic |
| 3 | `design` | 21 | 2026-05-30 | Single-line delegation to `cto-architect`; provides no value over calling the agent directly |
| 4 | `reputation-monitor` | 30 | 2026-05-30 | Monitoring setup guide with no scripts/refs; overlaps with `reputation-audit` + `reputation` |
| 5 | `scroll-stop-prompt` | 41 | 2026-05-30 | Narrow ad-copy utility; fully superseded by `scroll-stop-build` which also covers prompts |

---

## 7. SUMMARY

The rules system and web-build pipeline are structurally healthy — the `web-evolve` / `calibrate-amplitude` / `premium-website` skill chain is well-composed and the common-rules inheritance pattern is consistent. The harness is drifting in two places: banned phrases have crept into frontmatter descriptions of over a dozen skills (the hardest place to spot them), and the `agents/` directory has bloated to ~120 files with 44 exact duplicates and an entire 33-agent `cs-*` suite that has no call-site in any skill or command. The single highest-leverage action this week is deleting the 44 `" 2.md"` duplicate agent files and either wiring `cs-orchestrator` into a skill or archiving the full suite — that alone cuts agent-directory clutter by over 60%.
