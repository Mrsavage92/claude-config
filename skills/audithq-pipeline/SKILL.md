---
name: audithq-pipeline
description: "Orchestrates and activates the existing AuditHQ n8n outbound automation pipeline and Supabase edge functions. Always starts with a DETECT phase — reads actual current state of all workflows and edge functions before proposing any action. Hard compliance gate: refuses to enable real sends until unsubscribe link and sender identification are verified present in the email template. Triggers: 'activate the pipeline', 'activate n8n', 'check if automation is ready', 'enable outbound sends', 'run the outbound automation', 'what state is the pipeline in', 'test the n8n workflow', 'schedule the outbound batch', 'is the pipeline live'. NOT for: writing the prospect messages or finding prospects (use audithq-outbound); writing drip emails for inbound leads (use audithq-convert); building new n8n workflows from scratch (use cto-architect)."
---

# AuditHQ Pipeline — Orchestrate & Activate Existing Outbound Automation

This skill operates the outbound automation Adam has already built. It does **not** build new workflows, and it does **not** write messages. Its entire reason to exist is to answer "what state is the pipeline actually in?" honestly, and to flip it from dormant to live **safely** — meaning: never enabling a real send that would breach the Spam Act, and never assuming state from documentation.

The governing rule: **DETECT before ENABLE, every single time.** The docs in the repo are snapshots and have been wrong before. Read the live state.

## Critical safety stance

Two systems exist and they are **not** equal:

- **Edge-function system (the compliant path)** — `outbound-discover` → `outbound-batch-scan` → `outbound-generate-email` → `outbound-send-email`. The send function renders a Spam Act §18/§19-compliant footer + unsubscribe token. This is the path to activate.
- **n8n system (DO NOT activate as-is)** — 4 workflows that currently send with **no unsubscribe, no sender-ID, and a CTA that gives away the full report** (breaches the funnel). Its compose template also hardcodes a stale check count. Treat n8n as **blocked** until those are fixed; surface the blockers, don't route around them.

Neither system has ever completed a production send end-to-end. So the first real send is a **test-to-self**, never to a stranger.

## Known identifiers (verify they still exist in DETECT — don't trust this list blindly)

**n8n workflows** (`audithq.app.n8n.cloud`):
- Ingest Prospects — `MX7h74Dkeq0CrCtD`
- Compose Email Draft — `hafxzPaJ18FQYXlR`
- Send Approved Draft — `M9t2ZocLithBk4dI`
- Resend Events — `veGJAhXsJqj0DgDq`

**Edge functions** (`supabase/functions/` in `C:\Users\Adam\audit-genius\`):
- `outbound-discover` (Google Places → `growth_accounts`; needs `GOOGLE_PLACES_API_KEY`)
- `outbound-batch-scan` (claims `discovered` rows, runs quick-scan, checks `growth_suppressions`)
- `outbound-generate-email` (worst finding → Claude draft → `growth_proof_drafts`)
- `outbound-send-email` (approved drafts → Resend, renders unsubscribe + footer)

**Auth/secrets these need:** `AUDITHQ_INTERNAL_SECRET`, `GOOGLE_PLACES_API_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SUPABASE_SERVICE_ROLE_KEY`, plus `AUDITHQ_LEGACY_SERVICE_KEY` (the auto-injected service key is rejected by the gateway). Business address comes from `system_flags.audithq_business_address`.

## The procedure

### 1. DETECT (always first)

Read live state — do not summarise from docs. Gather:

- **n8n:** are the 4 workflows present and active? Last execution? Is there a scheduler/cron, or are they passive webhooks? Is `system_flags.growth_send_test_mode` true? Use the n8n cloud API (key at `~/.n8n-cloud-api-key`) or the n8n MCP tools.
- **Edge functions:** which of the 4 are actually deployed? Use `npx supabase functions list` (CLI is linked) or the Supabase MCP `list_edge_functions`.
- **Crons:** are `audithq-outbound-batch-scan` / `-generate-email` / `-send-email` active in `cron.job`? (Query via Supabase MCP `execute_sql`.)
- **Secrets present?** Especially `GOOGLE_PLACES_API_KEY` — without it `outbound-discover` throws immediately and the whole chain is dead.
- **Data state:** counts in `growth_accounts` by status, `growth_proof_drafts` by status, `growth_suppressions` size.

### 2. State report (what Adam sees first, every run)

Present a table, not prose:

```
SYSTEM B — edge functions
| Function              | Deployed | Cron      | Secret OK | Last run | Notes |
|-----------------------|----------|-----------|-----------|----------|-------|
| outbound-discover     | ?        | inactive  | KEY?      | —        |       |
| outbound-batch-scan   | ?        | inactive  | —         | —        |       |
| outbound-generate-email| ?       | inactive  | —         | —        |       |
| outbound-send-email   | ?        | inactive  | —         | —        |       |

SYSTEM A — n8n  [BLOCKED: §18/§19 + funnel CTA]
| Workflow            | Active | Test-mode | Last run | Blocker |
|---------------------|--------|-----------|----------|---------|
...

Data: growth_accounts {n by status} · drafts {n by status} · suppressions {n}
Verdict: {what's ready, what's blocking, the single next safe action}
```

### 3. Compliance gate (HARD BLOCK)

Before enabling **any** real send, verify in the actual send path:

1. **Functional unsubscribe** — a real link + a working handler (`growth-unsubscribe` function) + the `List-Unsubscribe` header.
2. **Sender identification** — sender name, business name (AuditHQ), and a physical/postal address (from `system_flags.audithq_business_address` — confirm it's set and real).
3. **Suppression check at send time** — `outbound-send-email` must check `growth_suppressions` immediately before each send.
4. **Funnel correctness** — the email CTA links the **free 3-suite scan**, not a full free report. (This is the specific thing the n8n composer gets wrong.)

If any fail: **refuse to enable**, show the exact gap and the file/line to fix, and stop. No "enable anyway" path exists.

### 4. Activation sequence (only after gate passes)

For the edge-function path, in order:
1. Set `GOOGLE_PLACES_API_KEY` if missing: `npx supabase secrets set GOOGLE_PLACES_API_KEY=...`
2. **Test-to-self first.** Run discover → batch-scan → generate-email manually (Step 5), approve one draft, and send it **to Adam's own inbox** to confirm the footer/unsubscribe render correctly in a real client. Verify the received email visually.
3. Only after a clean self-test: activate the three crons:
   ```sql
   SELECT cron.alter_job(jobid, active := true) FROM cron.job
   WHERE jobname IN ('audithq-outbound-batch-scan','audithq-outbound-generate-email','audithq-outbound-send-email');
   ```
4. Start with a **tiny** first batch (`max_accounts: 5`, `max_sends: 1`) and watch it before scaling.

### 5. Manual trigger reference (testing / first runs)

```bash
# 1. Discover (5 prospects in one vertical+area)
curl -X POST {SUPABASE_URL}/functions/v1/outbound-discover \
  -H "x-audithq-internal-secret: {AUDITHQ_INTERNAL_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{"category":"lawyer","location":"Geelong VIC","max_results":5}'

# 2. Batch scan the discovered rows
curl -X POST {SUPABASE_URL}/functions/v1/outbound-batch-scan \
  -H "x-audithq-internal-secret: {AUDITHQ_INTERNAL_SECRET}" \
  -H "Content-Type: application/json" -d '{"max_accounts":5}'

# 3. Generate a draft for one scanned account
curl -X POST {SUPABASE_URL}/functions/v1/outbound-generate-email \
  -H "x-audithq-internal-secret: {AUDITHQ_INTERNAL_SECRET}" \
  -H "Content-Type: application/json" -d '{"account_id":"<uuid>"}'

# 4. Approve (SQL — no UI yet). Review the draft body FIRST.
#    UPDATE growth_proof_drafts SET status='approved'
#    WHERE id='<uuid>' AND draft_type='outbound-cold';

# 5. Send (to self on first run — point RESEND_FROM / recipient at Adam)
curl -X POST {SUPABASE_URL}/functions/v1/outbound-send-email \
  -H "x-audithq-internal-secret: {AUDITHQ_INTERNAL_SECRET}" \
  -H "Content-Type: application/json" -d '{"max_sends":1}'
```

Read the real `SUPABASE_URL` + secrets from the AuditHQ repo env — never hardcode.

### 6. Error recovery runbook

| Symptom | Likely cause | Fix |
|---|---|---|
| discover throws instantly | `GOOGLE_PLACES_API_KEY` unset | set the secret (Step 4.1) |
| generate-email produces no draft | `quick_scans.preview_findings` shape drifted / empty | inspect a recent `quick_scans` row; if shape changed, fix the field read before proceeding |
| send rejected by gateway (bad JWT) | using auto-injected service key | use `AUDITHQ_LEGACY_SERVICE_KEY` |
| send with no footer/unsubscribe | template regression | STOP — re-run compliance gate, do not send |
| recipient re-emailed after opt-out | suppression not checked / no auto-suppress on bounce | verify send-time suppression check; add bounce→`growth_suppressions` wiring before scaling |

## What this skill owns vs delegates

- **Owns:** state detection, the compliance gate, activation choreography, the test-to-self discipline, the error runbook.
- **Delegates:** message wording → `audithq-outbound` (or `cold-email`); drip copy → `audithq-convert`; building/repairing a workflow's internals (e.g. fixing the n8n §18/§19 nodes) → `cto-architect` or `senior-backend`. This skill turns the machine on safely; it doesn't write what the machine says.
```
