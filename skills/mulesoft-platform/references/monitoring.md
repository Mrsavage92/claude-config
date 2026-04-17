# Runtime Manager Monitoring & Alerts

## What to Monitor

| Metric | Why | Alert Threshold |
|---|---|---|
| App status | Is it running? | Any state != Running → alert |
| Error rate | Are flows failing? | > 5 errors in 10 min → alert |
| Response time | Is it degraded? | > 2x baseline p95 → alert |
| CPU usage | Under-provisioned? | Sustained > 80% → alert |
| Memory | Leaking? | > 80% of worker heap → alert |
| Inbound requests | Traffic patterns | Sudden drop vs baseline → alert (silent failure) |
| Flow last triggered | Scheduler running? | No execution in expected window → alert |

## Setting Up Alerts

1. Runtime Manager → select app → **Alerts** tab
2. Click **New Alert**
3. Configure:
   - Name (e.g. "BDR Prod App Stopped")
   - Severity (Info / Warning / Critical)
   - Condition (metric + threshold)
   - Recipients (email addresses or teams)
   - Actions

## Recommended Alert Set (BDR Production)

### Critical — page immediately

| Name | Condition | Recipients |
|---|---|---|
| App Stopped | App status changes to STOPPED or FAILED | Adam |
| High Error Rate | Errors > 5 in 10 min | Adam |
| Flow Unresponsive | Last flow execution > 20 min ago (expecting 15-min polling) | Adam |

### Warning — review within business hours

| Name | Condition | Recipients |
|---|---|---|
| CPU High | CPU > 80% for 10 min | Adam |
| Memory High | Memory > 80% | Adam |
| Moderate Errors | Errors > 10 in 1 hour | Adam |

### Info — log for trends

| Name | Condition | Recipients |
|---|---|---|
| Daily Record Count | Log daily record count | None (dashboard only) |

## Accessing Logs

Runtime Manager → select app → **Logs** tab.

Filter by:
- Time range
- Log level (DEBUG, INFO, WARN, ERROR)
- Priority
- Thread
- Search by correlation ID

### Log Downloading

For offline analysis:
1. Logs tab → **Download Logs**
2. Select time range
3. Downloads as `.zip` with rotating log files

## Correlation IDs

Every flow invocation gets a correlation ID. Log it at key points:

```xml
<logger level="INFO"
  message='#["Sync started. correlationId=" ++ correlationId]' />

<logger level="ERROR"
  message='#["Sync failed: " ++ error.description ++ " correlationId=" ++ correlationId]' />
```

Search Runtime Manager logs by correlation ID to trace a specific invocation end-to-end.

## Built-In Dashboards

Runtime Manager → **Insights** (for specific app) shows:

- Message throughput
- Error rate
- CPU / memory over time
- Top error types

For richer dashboards, integrate with Anypoint Monitoring (separate product, additional cost).

## External Monitoring Integration

### Send logs to external system (SIEM, Datadog, Splunk)

1. Runtime Manager → app → **Settings** → **Logging**
2. Enable log forwarding (requires Enterprise/Titanium plan)
3. Configure destination

### Send metrics via StatsD / Prometheus

Use Mule's custom logging in flows to emit metrics to your preferred backend.

## Alert Response Runbook (BDR)

### "App Stopped" alert

1. Open Runtime Manager → check app status
2. Check **Logs** for last error before stop
3. Common causes:
   - Out of memory → increase worker size
   - Startup config error → check property file + Secrets Manager
   - Network issue → check connectivity to NS / SF
4. Fix → **Redeploy** or **Start**
5. Monitor for 30 min

### "High Error Rate" alert

1. Check **Logs** for error patterns
2. If auth errors (SF/NS) → check Secrets Manager + credentials
3. If connectivity errors → transient? check SF/NS status pages
4. If data errors → check NS Saved Search, SF field names
5. If validation errors → check DataWeave mapping

### "Flow Unresponsive" alert

1. Check app status — is it running?
2. Check **Flow** tab — is the specific flow active?
3. Check scheduler config — correct frequency?
4. Check last watermark in Object Store — has it advanced?
5. If watermark stuck, flow is polling but finding 0 records → check NS source

## Object Store Monitoring

Runtime Manager → **Object Stores** — view keys, sizes, TTL.

For BDR: watch `ns-customer-watermark` — should advance on every successful poll.

## vCore / Resource Usage

Access Management → **Subscription Usage** shows:
- Total vCores subscribed
- Currently deployed
- Available

Alert if usage > 80% of allocation — request more vCores before you run out during a deploy.

## Stakeholder Reporting

### Weekly status email (automated via cron)

Generate from Runtime Manager data:
- Total records synced this week
- Error rate %
- Uptime %
- Any alerts fired

Can be built via Mule flow that queries Runtime Manager API on schedule.

### Monthly operational review

1. Pull logs for the month
2. Aggregate: error types, root causes, incidents, resolution times
3. Review with stakeholders
4. Identify patterns → feed into next phase planning
