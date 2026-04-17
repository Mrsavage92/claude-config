---
name: mulesoft-bdr
description: "BDR Group MuleSoft integration project tracker. Reads the Implementation Playbook, tracks phase progress (0A→0B→0C→1A→1B→1C), flags blockers by owner (Ben/Anil/Dave/Julie/Ryan/Nikith), maintains credential state, generates stakeholder status updates. Use whenever Adam asks about BDR MuleSoft status, blockers, next steps, or phase gates. NOT for generic MuleSoft work — use /mulesoft or subskills for that."
---

# Skill: BDR MuleSoft Project Tracker

## Purpose
Track the BDR Group MuleSoft integration programme against the Implementation Playbook. Phase 1 scope is NetSuite entitystatus → Salesforce On Stop flag. Future phases expand to liquidations sync, event-driven workflows, and platform-wide integration per the 6-Phase Enterprise strategy.

## When to Use
- Status check — "where am I on BDR MuleSoft?"
- Blocker audit — "what am I waiting on and who owns it?"
- Phase gate check — "can I start building yet?"
- Stakeholder update — "draft a message for Dave/Ben/Julie"
- Discovery input review — "has Ben sent the TBA creds?"

## When NOT to Use
- Building flows, DataWeave, connector configs — use `/mulesoft-flow`, `/mulesoft-dataweave`, `/mulesoft-connector`
- Anypoint Platform admin tasks — use `/mulesoft-platform`
- Generic MuleSoft questions — use `/mulesoft`

## Canonical Sources
Always read these before answering:
1. `C:/Users/Adam/Documents/Claude/BDR/MuleSoft_Implementation_Playbook.docx` — primary truth
2. `C:/Users/Adam/Documents/Claude/BDR/MuleSoft/Phase 1-6 *.txt` — enterprise strategy
3. `~/.claude/projects/.../memory/project_bdr_mulesoft.md` — current state
4. `C:/Users/Adam/MuleSoft/bdr-integrations/` — actual project directory

## Modes

### Mode 1 — Status Check
Report current phase, % complete, active blockers, next 3 actions.
Read `references/playbook-summary.md` for the phase structure.

### Mode 2 — Blocker Audit
Who owes what. Include chase history and escalation path.
Read `references/blockers-matrix.md` for the full dependency grid.

### Mode 3 — Phase Gate Review
Before recommending "start building" or "deploy to prod", check gate criteria.
Read `references/phase-gates.md` for exit criteria per phase.

### Mode 4 — Stakeholder Comms
Generate WhatsApp/email update to team members.
Use `templates/status-report.md` as the base.

## Phase Map (Condensed)

| Phase | Dates | State | Owner |
|---|---|---|---|
| 0A Prep | By 2 Apr 2026 | SF Connected App, integration user, Anypoint audit | Adam |
| 0B Discovery | 3-14 Apr 2026 | TBA creds, entitystatus list, SF field names, liquidations source | Ben, Julie, Anil, Ryan |
| 0C Platform Setup | 14-18 Apr 2026 | CloudHub perms, Studio install, connectors tested | Adam + Dave |
| Gate Check | 18-21 Apr 2026 | All discovery inputs received, data model validated, Expert Coaching done | Adam |
| 1A Build | 21-25 Apr 2026 | Flow 1 (NS→SF On Stop set), Flow 2 (clear), Flow 3 (liquidations, may slip) | Adam |
| 1B Testing | 28 Apr-2 May 2026 | Dev + UAT, sign-off from Ben/Anil/Julie | Adam + owners |
| 1C Production | Week of 5 May 2026 | JWT upgrade, deploy, monitoring, smoke test | Adam |

## Key People Map

| Name | Role | What They Owe | Status Check |
|---|---|---|---|
| Dave Beach | Anypoint Org Owner | CloudHub Admin on all 3 envs | DONE per access management screenshot |
| Ben | NetSuite admin | 5 TBA credentials + Saved Search + sandbox confirmation | CHASED, pending |
| Julie | Business owner | entitystatus trigger list confirmation | CHASED |
| Anil | Salesforce admin | On Stop field API name + SF field review | CHASED |
| Ryan | Liquidations owner | Data source/format/trigger spec | CHASED |
| Nikith | MuleSoft Premier support | Expert Coaching session | Book via case 471920541 |

## Proactive Triggers

- If Adam mentions building flows and 0B discovery inputs aren't all received → flag gate risk
- If Adam mentions deploying to production and JWT auth isn't configured → flag security gap
- If a blocker has been "chased" for >3 business days without resolution → escalate to Dave Beach
- If Adam asks about NetSuite sandbox without it being confirmed → flag as testing risk
- If an action is taken against live production data without UAT sign-off → STOP and log

## Output Artifacts

| Request | Deliverable | Format |
|---|---|---|
| "Where am I on BDR MuleSoft?" | Phase status + blockers + next 3 actions | Markdown summary |
| "What am I chasing?" | Blocker table with owners + chase log | Markdown table |
| "Draft an update for Dave/Ben/team" | Stakeholder message | Copyable text |
| "Can I start building?" | Gate check report (pass/fail criteria) | Markdown checklist |
| "Update project memory" | Updated `project_bdr_mulesoft.md` | Memory file |

## Anti-Patterns (do NOT do these)

- **Assuming phase completion without verification** — always check actual state (files, credentials in config yaml, Anypoint screenshots) before marking done
- **Generic MuleSoft advice** — always ground in the playbook. If the playbook says OAuth Username-Password for dev and JWT for prod, don't recommend something else
- **Ignoring the enterprise strategy** — Phase 1 Account Suspension is scaffolding for the larger programme. Decisions here affect Phase 2-6. Don't optimise locally at the expense of the bigger architecture
- **Hardcoding credentials in docs or memory** — always reference by variable name (`${sf.consumer.key}`), never paste actual values

## Related Skills
- Use `/mulesoft-connector` when setting up the SF/NS connectors during Phase 0C
- Use `/mulesoft-flow` when building the polling flow during Phase 1A
- Use `/mulesoft-dataweave` for the NS→SF field mapping during Phase 1A
- Use `/mulesoft-platform` for Secrets Manager and deploy during Phase 1C
- Use `/mulesoft` for routing when the ask spans multiple subskills
