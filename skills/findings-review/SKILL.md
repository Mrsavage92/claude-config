---
name: findings-review
description: Internal QA loop for AuditHQ. Walks through unreviewed check_ids in `check_catalog`, asks the user to verdict each as verified_true / false_positive / unclear / context_dependent, writes the verdict + canonical fix or FP-pattern back to Supabase. Use when the user says "review findings", "QA findings", "/findings-review", or wants to catch false positives the audit engine is producing.
---

# Findings Review — Internal QA loop

## What this is

AuditHQ's audit engine produces 9-suite findings via deterministic checks + LLM enrichment. Some of those findings are wrong (false positives, vague recommendations, platform-mismatched advice). This skill is the human-in-the-loop curator.

Verdicts are written to `check_catalog` (one row per `check_id`) so a single verdict applies to every current and future audit. The verdict survives suite re-runs (which `DELETE+INSERT` rows in `audit_check_results`).

**Output:** verdicts in the DB, plus a few-shot text block per suite (via the exporter script) that the user pastes into n8n suite workflows to teach future runs.

## Pre-conditions

- AuditHQ Supabase project (`nstpbwflegwmknwcmsey`) reachable.
- `check_catalog.review_status` column exists (migration `findings_review_qa_loop`).
- `findings_review_queue` view exists (same migration).
- Default reviewer name: `adam`. Override via `args` if needed.

## Workflow

When invoked:

### Step 1 — Pull the queue

Use Supabase MCP to fetch the next batch of unreviewed checks, ordered by recent volume (highest impact first):

```sql
SELECT check_id, suite, category, default_severity, times_seen,
       recent_30d_count, sample_title, sample_evidence
FROM findings_review_queue
WHERE review_status = 'unreviewed'
LIMIT 10;
```

If queue is empty, report "no unreviewed checks — current curation is current" and stop.

### Step 2 — For each check, pull 2-3 concrete instances

```sql
SELECT a.url, a.domain, acr.severity, acr.title, acr.description,
       acr.evidence, acr.business_impact, acr.recommendation, acr.facts,
       acr.confidence, acr.page
FROM audit_check_results acr
JOIN audits a ON a.id = acr.audit_id
WHERE acr.check_id = $1
ORDER BY acr.created_at DESC
LIMIT 3;
```

### Step 3 — Present to the user

For each check, output a compact card:

```
─────────────────────────────────────────
{N}. {check_id}  ({suite}/{category}, default {severity})
    Seen {times_seen}× total, {recent_30d_count}× in last 30 days

    Sample finding:
      Title:    {sample_title}
      Evidence: {sample_evidence}
      Site:     {domain}
      Rec:      {recommendation}

    Verdict?
      [t] verified_true       — check is sound, findings are real
      [f] false_positive      — produces noise; should be suppressed
      [c] context_dependent   — sometimes true, sometimes not (note pattern)
      [u] unclear             — need more data
      [s] skip this one
─────────────────────────────────────────
```

Wait for user input. Accept `t`/`f`/`c`/`u`/`s` plus a one-line note.

### Step 4 — Capture verdict + canonical fix or FP pattern

- If `verified_true`: ask "What's the canonical fix for this check? (one paragraph, platform-aware, will be injected as the recommended fix when this check fires)"
- If `false_positive`: ask "What's the pattern that makes it false? (e.g. 'SPA sites where the value is set by JS post-load', 'Vercel sites where header is at edge')"
- If `context_dependent`: ask "What's the deciding context? (e.g. 'true for ecomm, false for marketing sites')"
- If `unclear`: just save the note.

### Step 5 — Write the verdict

```sql
UPDATE check_catalog
SET review_status = $1,
    review_note = $2,
    verified_fix = $3,      -- only for verified_true
    fp_pattern = $4,         -- only for false_positive
    reviewed_at = NOW(),
    reviewed_by = $5
WHERE check_id = $6;
```

### Step 6 — Loop until user types `done` or batch is exhausted

After every 5 verdicts, offer to break and resume later: "Done 5. Keep going (y) or stop (n)?"

### Step 7 — Final report

```
─────────────────────────────────────────
Session summary
  Reviewed:           {N}
  Verified true:      {a}
  False positives:    {b}
  Context-dependent:  {c}
  Unclear:            {d}
  Skipped:            {e}

Next step: run `scripts/export_few_shots.py` to regenerate per-suite
few-shot blocks. Paste each block into the corresponding n8n suite
workflow's system prompt under "## Known patterns from QA".
─────────────────────────────────────────
```

## Don't

- Don't write verdicts to `audit_check_results` — they get wiped on re-write.
- Don't auto-decide. Every verdict is an explicit user call.
- Don't run on more than 10 checks per session by default — keeps the cognitive load sane.
- Don't fabricate evidence. If the 2-3 sample findings don't show a clear pattern, the verdict is `unclear`.

## Notes

- The queue surfaces by *recent* volume so we curate the high-impact noise first.
- Once `verified_true` verdicts pile up, the `verified_fix` field becomes a canonical fix library — feed it into n8n suite prompts so future findings cite the same fix instead of reinventing it.
- This is a sustained, periodic activity. Run weekly or after batches of new audits.
