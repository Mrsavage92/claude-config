---
name: mulesoft
description: "MuleSoft integration suite orchestrator. Routes MuleSoft work to the right specialist subskill — connector config, flow construction, DataWeave transforms, platform ops, or BDR project tracking. Use as entry point when a MuleSoft request spans multiple areas or when not sure which subskill fits. NOT for a single narrow task — use the specific subskill directly."
---

# Skill: MuleSoft Suite Orchestrator

## Purpose
Entry point for MuleSoft integration work. Reads the request, identifies which subskill(s) apply, loads them, and coordinates cross-skill work. Use when the request spans multiple areas (e.g. "build the Phase 1A flow end-to-end" needs connector + flow + dataweave + platform).

## When to Use
- Request spans multiple MuleSoft areas
- Not sure which subskill fits
- Starting a new integration project from scratch
- Orchestrating a full phase (design → build → test → deploy)

## When NOT to Use
- Single narrow task — go direct to the subskill
- BDR project status / blockers — use `/mulesoft-bdr` directly

## Subskill Map

| Skill | Responsibility |
|---|---|
| `/mulesoft-bdr` | BDR project tracker, playbook state, blockers, stakeholder comms |
| `/mulesoft-connector` | Connector config (SF, NS, HTTP, DB, JMS, FTP), auth patterns |
| `/mulesoft-flow` | Flow construction, triggers, error handling, idempotency |
| `/mulesoft-dataweave` | DataWeave 2.0 transforms, field mapping |
| `/mulesoft-platform` | Anypoint Platform ops, deploy, monitoring, Secrets Manager |

## Routing Logic

| Request pattern | Subskill |
|---|---|
| "Where am I on BDR?" / "What's blocked?" | `mulesoft-bdr` |
| "Set up / configure a connector" / "Test connection" | `mulesoft-connector` |
| "Build / debug a flow" / "Add error handling" | `mulesoft-flow` |
| "Map these fields" / "Transform JSON to XML" | `mulesoft-dataweave` |
| "Deploy" / "Secrets Manager" / "CloudHub alerts" | `mulesoft-platform` |

## Multi-Step Workflows

### Workflow: New Integration (end-to-end)

1. `mulesoft-bdr` — confirm phase gate passed
2. `mulesoft-connector` — add connector, store credentials
3. `mulesoft-flow` — build flow structure with trigger + error handler
4. `mulesoft-dataweave` — write transforms for field mapping
5. `mulesoft-platform` — deploy to Design, then Sandbox, then Production
6. `mulesoft-bdr` — update phase status, notify stakeholders

### Workflow: Debug Production Issue

1. `mulesoft-platform` — check Runtime Manager logs, error rate, last run
2. `mulesoft-bdr` — is there a related blocker (credential rotation, etc.)?
3. `mulesoft-connector` — is the connection still valid?
4. `mulesoft-dataweave` — if data error, check transform logic
5. `mulesoft-flow` — if flow error, check error handler coverage

### Workflow: Phase Gate Check

1. `mulesoft-bdr` — read gate criteria for current phase
2. Check each criterion against actual project state
3. Report pass/fail with specific missing items
4. Route unblocking tasks to relevant subskill

## BDR Programme Context

Phase 1 scope (Account Suspension):
- Source: NetSuite Customer `entityStatus`
- Target: Salesforce Account `On_Stop__c` flag
- Pattern: 15-min polling, watermarked, idempotent upsert
- Timeline: Build 21-25 Apr → Test 28 Apr-2 May → Prod 5 May 2026

Future phases (per Enterprise strategy docs Phase 1-6):
- Phase 2: Broader enterprise integration architecture
- Phase 3: Use case catalogue
- Phase 4: Multi-system implementation
- Phase 5: Governance & observability
- Phase 6: AI & advanced automation

## Core Principles (apply across all subskills)

1. **Environment promotion is Design → Sandbox → Production.** Never shortcut.
2. **Credentials in Secrets Manager, never plaintext.** Especially production.
3. **Every flow is idempotent.** Retries safe. No duplicate writes.
4. **Every external call has retry + error handler.** No silent failures.
5. **Every polling flow uses watermarks.** Object Store tracks last-run time.
6. **Every production deploy is tagged in Git.** Rollback must be trivial.
7. **Every integration ships with Runtime Manager alerts.** Unmonitored = broken.

## Proactive Triggers

- Request mentions "production" without "JWT auth" mentioned → flag auth upgrade
- Request mentions "deploy" without mentioning UAT sign-off → flag promotion risk
- Request mentions "new connector" without mentioning Secrets Manager → flag credential handling
- Request spans 3+ subskills → suggest breaking into sequential sub-tasks via this orchestrator

## Anti-Patterns (do NOT do these)

- Skipping straight to a subskill when the request actually needs orchestration across 3+ skills
- Loading all 5 subskills at once — only load what's needed for the current step
- Trying to answer MuleSoft questions without grounding in the playbook
- Inventing MuleSoft features — verify with official docs or the Expert Coaching session

## Related Skills
- All `mulesoft-*` subskills (routed to above)
- `/sync-knowledge-base` — after updating any skill, sync to GitHub + Notion
- `/project-refresh` — if BDR project context seems stale
