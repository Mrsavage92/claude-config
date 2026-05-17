---
name: cost-report
description: Reports AuditHQ Anthropic spend from `suite_call_costs`. Shows today / last-7-days / last-30-days rollups, top-spending suites, average cost per run, and current cap headroom. Use when the user asks "how much are we spending on AuditHQ?", "/cost-report", "show audithq costs", "what's our anthropic bill", or wants visibility into per-suite spend.
---

# AuditHQ cost report

Reads `suite_call_costs` + `check_daily_anthropic_cap` + `suite_cost_rollup` and prints a compact summary the user can read at a glance.

## Pre-conditions

- Supabase project `nstpbwflegwmknwcmsey` reachable.
- `suite_call_costs` table populated (auto via n8n suite workflows post-2026-05-16).
- `AUDITHQ_DAILY_COST_CAP_USD` Edge Function env var sets the cap (default $20).

## Args

- `cost-report` — default — last 7 days summary + today's cap status
- `cost-report month` — last 30 days view
- `cost-report today` — just today
- `cost-report suite <name>` — drill into one suite (marketing | technical | geo | security | privacy | social | reputation | employer_brand | ai_readiness)

## Workflow

### Step 1 — Today + cap status (always)

```sql
SELECT public.check_daily_anthropic_cap(20.0);
SELECT COUNT(*) AS calls_today,
       COUNT(DISTINCT audit_id) AS audits_today,
       ROUND(SUM(cost_usd)::numeric, 4) AS spend_usd_today
FROM suite_call_costs
WHERE created_at >= date_trunc('day', now());
```

### Step 2 — 7-day rollup (default)

```sql
SELECT day, SUM(calls) AS calls, SUM(cost_usd) AS spend_usd
FROM suite_cost_rollup
WHERE day > current_date - 7
GROUP BY day ORDER BY day DESC;
```

### Step 3 — Per-suite breakdown (last 7d default)

```sql
SELECT suite,
       SUM(calls) AS calls,
       ROUND(SUM(cost_usd)::numeric, 4) AS spend_usd,
       ROUND((SUM(cost_usd) / NULLIF(SUM(calls), 0))::numeric, 4) AS avg_per_call,
       ROUND(SUM(cache_read_tok)::numeric / NULLIF(SUM(input_tok + cache_create_tok + cache_read_tok), 0) * 100, 1) AS cache_hit_pct
FROM suite_cost_rollup
WHERE day > current_date - 7
GROUP BY suite
ORDER BY spend_usd DESC NULLS LAST;
```

### Step 4 — Quality signals (cheap join)

```sql
-- Recent audits where suite cost was unusually high (>2x median)
WITH suite_medians AS (
  SELECT suite, percentile_cont(0.5) WITHIN GROUP (ORDER BY cost_usd) AS median_cost
  FROM suite_call_costs
  WHERE created_at > now() - interval '7 days'
  GROUP BY suite
)
SELECT scc.suite, scc.audit_id, a.domain, scc.cost_usd, sm.median_cost
FROM suite_call_costs scc
JOIN audits a ON a.id = scc.audit_id
JOIN suite_medians sm ON sm.suite = scc.suite
WHERE scc.created_at > now() - interval '7 days'
  AND scc.cost_usd > sm.median_cost * 2
  AND sm.median_cost > 0
ORDER BY scc.cost_usd DESC
LIMIT 10;
```

### Step 5 — Render

Output a single compact block per the template below. Numbers go in plain USD with 4 decimals where < $1, 2 decimals otherwise. **Always show cap headroom prominently** — that's the bleed protection signal.

```
AuditHQ cost — {window} (as of {timestamp})
───────────────────────────────────────────

Today: {spend_today} / ${cap}  {warning_emoji if over 75% of cap else ""}
       {calls_today} calls across {audits_today} audits

Daily totals:
  Day         Audits  Calls   Spend
  {day}       {a}     {c}     ${spend}
  ...

Per-suite (last {N} days):
  Suite           Calls  Spend     Avg/run   Cache hit %
  {suite}         {c}    ${s}      ${avg}    {pct}%
  ...

Outliers (>2× median, last 7d):
  {suite} — {domain} — ${cost}  (median ${median})
  ...

Cap status: {OK | WARNING | EXCEEDED}
Next reset: {midnight UTC time}
```

If there's no data yet (table is empty), say so plainly: "No telemetry rows yet. Run an audit and the data starts populating." Don't fabricate numbers.

## Don't

- Don't invent rows if the table is empty. Be honest.
- Don't query `audits` or `audit_suite_results` for cost data — those don't have the token info. Only `suite_call_costs` does.
- Don't include PII (org_id, user_id) in the output. Just `audit_id` and `domain` are enough.
- Don't auto-fix anything based on the report. Reporting only.

## Notes

- Cache hit % is the most useful efficiency metric. Above 50% = caching is paying off. Below 20% = suite prompt is changing too often or audits are spread > 5 min apart.
- "Avg cost per run" is roughly $0.40 per audit at current volumes. Anything materially above that for a single suite is a flag.
- The daily cap defaults to $20. Raising it requires deliberate intent (set `AUDITHQ_DAILY_COST_CAP_USD` env var on the audit-from-n8n function).
