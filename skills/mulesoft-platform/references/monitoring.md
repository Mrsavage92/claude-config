# MuleSoft Monitoring & Alerts — full picture

> **Updated 2026-05-19** after Adam's tier-discovery session. Previous version of this doc dramatically understated what's available natively. **Before proposing any custom monitoring build in Mule, check the Anypoint subscription tier FIRST.** Most enterprise tiers ("Integration Advanced", "Titanium", anything above base CloudHub) include Anypoint Monitoring + Functional Monitoring — the products that handle 95% of monitoring use cases without writing a line of code.

---

## The hierarchy — 4 native layers, use them in this order

```
1. Runtime Manager Alerts          (basic, free with CloudHub)
2. Anypoint Monitoring             (rich alerts + dashboards + log search)
3. Functional Monitoring           (synthetic API tests — formerly APIfortress)
4. Custom Mule scheduler flow      (last resort — only if all above are absent)
```

**Default position when asked about monitoring:** assume layers 2 + 3 are available unless evidence shows they aren't. The user's subscription tier is the load-bearing answer.

---

## How to check the subscription tier FIRST (5 min, you make the user do this)

Before recommending any custom code, ask the user to verify what's in their Anypoint subscription:

1. https://eu1.anypoint.mulesoft.com → top-right org menu → **Access Management** → **Subscription** sidebar
2. **Runtime Manager** section shows: vCore caps, Mule Public Flows cap, Mule Messages cap, Data Throughput cap, VPCs cap, Network Connections cap
3. **Object Store** section shows: API Requests cap + current usage
4. Top-level "Subscription Tier" line — e.g. "Customer - Integration Advanced", "Titanium", "Gold"

Then check the Anypoint left-nav for **Monitoring** — if the sidebar shows:
- ✅ Built-in dashboards
- ✅ Custom dashboards
- ✅ Insights
- ✅ Traces
- ✅ Telemetry Exporter
- ✅ Reports
- ✅ Alerts
- ✅ Custom Metrics
- ✅ **Functional Monitoring** ← the synthetic test product

→ Anypoint Monitoring is FULLY active. Do NOT build a custom monitoring Mule app.

If only the basic CloudHub dashboards are visible and the Monitoring nav is sparse → lower tier, custom build is justifiable.

---

## Layer 1 — Runtime Manager Alerts (basic)

**Always available, included with CloudHub 2.0.** Per-app, UI-configured, email delivery.

### What CloudHub 2.0 supports

CH2 supports a more limited alert surface than CH1. Confirmed per `https://docs.mulesoft.com/runtime-manager/alerts-on-runtime-manager`: *"For applications deployed to CloudHub 2.0, custom alerts indicate whether an app was successfully deployed and whether it is behaving as expected."* The exact alert types available per-app:

| Condition | CH2 supported? |
|---|---|
| App status (Stopped / Failed) | ✅ Yes |
| App deployment outcome | ✅ Yes |
| Replica count drops | ✅ Yes (in Anypoint Monitoring tier, see Layer 2) |
| 5xx response rate threshold | ⚠️ Use Anypoint Monitoring custom KPI (Layer 2) |
| Response time threshold | ⚠️ Use Anypoint Monitoring custom KPI (Layer 2) |
| CPU/memory threshold | ⚠️ Use Anypoint Monitoring (Layer 2) |
| Custom log content match | ❌ Not in basic Runtime Manager — use Anypoint Monitoring log search alerts |

### Setting up

1. Runtime Manager → select app → **Settings** → **Alerts** tab
2. Click **New Alert**
3. Configure: Name, Severity, Condition, Recipients (up to 20 users + 20 emails per alert)
4. Email-only delivery

### When this is enough

If the user has ONLY base CloudHub (no Anypoint Monitoring SKU), Layer 1 is all they get. Configure:
- App Stopped (per app)
- App Deployment Failed (per app)

That's it. For anything richer, they need Layer 2.

---

## Layer 2 — Anypoint Monitoring (rich)

**Separate paid SKU**, bundled into mid-tier Anypoint subscriptions (Integration Advanced, Titanium, Gold).

### Capabilities

| Feature | What it does |
|---|---|
| **Built-in dashboards** | Per-app: CPU, memory, response time, throughput, error rate, top errors — no setup |
| **Custom dashboards** | Build your own panel layout with custom queries |
| **Insights** | Per-flow drill-down |
| **Traces (Beta)** | Distributed tracing across Mule apps |
| **Alerts** | Threshold-based on ANY metric — including log content patterns ("ERROR-level log containing 'VENDOR_AUTH_FAILED' in last 5 min") |
| **Custom Metrics** | Emit your own metrics from Mule app code; chart + alert on them |
| **Log Search** | Cross-app log search by correlation ID, time, level, content |
| **Log Points** | Mark specific points in flows for sampling/tracing |
| **Telemetry Exporter** | Push logs/metrics to external SIEM (Datadog, Splunk) |
| **Reports** | Scheduled summary emails |
| **Raw Data** | Underlying metrics export |

### When this is enough

If the user has Anypoint Monitoring active, Layer 1 + Layer 2 covers:
- App health (Layer 1)
- Latency / error-rate / throughput alerts (Layer 2)
- Log-content alerts (Layer 2)
- Dashboards (Layer 2)
- Trend reports (Layer 2)

**~95% of monitoring use cases.** The remaining 5% is end-to-end synthetic tests — Layer 3.

---

## Layer 3 — Functional Monitoring (synthetic API tests)

**Separate paid product**, originally APIfortress, acquired by MuleSoft. Bundled into mid-tier Anypoint subscriptions (varies).

### What it does

- Scheduled HTTP synthetic tests against your deployed APIs
- DSL-based test definitions (JavaScript-flavoured, with assertion helpers)
- Run from MuleSoft cloud infrastructure (separate from your CloudHub apps — so it can detect if your apps are down)
- Email alerts on test failure
- Configurable cadence (per-minute, per-hour, daily)
- Multi-step tests (login → call → assert response shape → cleanup)

### Example use case (the exact thing BDR wanted to build custom)

```javascript
// Functional Monitoring test definition (DSL):
POST https://broadband-availability-process-api-prod-...cloudhub.io/api/v1/lookup-single
  body: { correlation_id, address: { postcode: "SW1A 2AA", ... }, options: { force_refresh: true } }
assert status == 200
assert payload.availability.status == "Available"
assert payload.availability.technology == "FTTP"
assert payload.source == "ITS"
assert payload.availability.quote_count >= 5
```

Configure cadence: every 15 min. On failure: email the on-call email.

**This replaces any custom-built Mule monitoring app.** Use this, not custom code.

### When this is enough

For end-to-end synthetic checks with response-shape assertions, Functional Monitoring is the canonical answer. No code needed.

---

## Layer 4 — Custom Mule scheduler flow (LAST RESORT)

**Only build this if Layers 1, 2, and 3 are confirmed absent from the user's subscription.** This is rarely the case for enterprise customers.

If genuinely needed:
- Add a scheduler flow to an existing low-criticality app OR a new dedicated `monitoring` Mule app
- Flow runs every N min, makes HTTP calls to other apps, asserts response shape
- Logs ERROR if assertion fails
- Configure Runtime Manager alert on the ERROR log

But: this consumes vCores (which count against subscription cap) and re-implements work MuleSoft already ships. Justify only after confirming the subscription doesn't include Anypoint Monitoring + Functional Monitoring.

---

## Decision tree — when asked to set up monitoring

```
User: "How do I monitor my Mule apps?"
  │
  ├─ STEP 1: Ask them to show the Anypoint Monitoring sidebar
  │   └─ Has Functional Monitoring + Alerts + Custom Metrics + Log Search?
  │       │
  │       ├─ YES → Layer 1 + 2 + 3. NO custom code.
  │       │       │
  │       │       ├─ App health → Runtime Manager basic alerts
  │       │       ├─ Latency/error/log alerts → Anypoint Monitoring Alerts
  │       │       └─ End-to-end synthetic checks → Functional Monitoring
  │       │
  │       └─ NO → Only Layer 1 available.
  │               │
  │               ├─ Configure Runtime Manager basic alerts
  │               └─ Recommend customer upgrade to Anypoint Monitoring tier OR build minimal Layer 4
```

---

## Recommended alert set (BDR production specifically — Integration Advanced tier)

### Layer 1 — Runtime Manager (per app, basic)

| Alert | Condition | Recipients |
|---|---|---|
| App Stopped | Status → Stopped or Failed | Adam |
| Deployment Failed | Deployment outcome = failure | Adam |

### Layer 2 — Anypoint Monitoring (richer KPI-based)

| Alert | Condition | Recipients |
|---|---|---|
| High Error Rate | >5 ERROR logs in 10 min, any of the 3 apps | Adam |
| Slow Response | p95 response time > 10s for 5 min | Adam |
| ITS Auth Failure | Log line contains "VENDOR_AUTH_FAILED" or 401 from upstream | Adam (high priority) |
| Replica Down | Replica count < 2 on any production app | Adam |
| Throughput Drop | Inbound request rate drops to 0 for 15 min (silent failure detection) | Adam |

### Layer 3 — Functional Monitoring (end-to-end synthetic)

| Test | Endpoint | Assertions | Cadence |
|---|---|---|---|
| Broadband end-to-end | `POST /api/v1/lookup-single` SW1A 2AA | status=200, availability.status=Available, technology=FTTP, source=ITS, quote_count>=5 | every 15 min |
| ITS API health | `GET /api/health` on ITS prod | status=200, body.environment=production | every 5 min |
| Process API health | `GET /api/v1/health` | status=200, body.environment=production | every 5 min |
| SF System API health | `GET /api/health` | status=200, body.environment=production | every 5 min |

---

## Accessing logs

Runtime Manager → select app → **Logs** tab. Filter by time, log level, priority, thread, or correlation ID.

For cross-app log search: Anypoint Monitoring → **Log Management** → **Log Search**.

### Correlation IDs

Every flow invocation gets a correlation ID. Log it at key points:

```xml
<logger level="INFO" message='#["Sync started. correlationId=" ++ correlationId]' />
<logger level="ERROR" message='#["Sync failed: " ++ error.description ++ " correlationId=" ++ correlationId]' />
```

---

## External monitoring integration (Telemetry Exporter)

If user has Anypoint Monitoring + needs logs/metrics in their own SIEM:

1. Anypoint Monitoring → **Telemetry Exporter** → New
2. Configure destination (Datadog, Splunk, generic HTTP, syslog)
3. Filter what to export

Requires Enterprise/Titanium plan typically.

---

## Subscription tier reference — what each tier typically includes

Approximate — verify against the user's actual subscription page.

| Tier | Runtime Manager basic | Anypoint Monitoring | Functional Monitoring |
|---|---|---|---|
| **Base CloudHub** | ✅ | ❌ | ❌ |
| **Integration Standard** | ✅ | Limited | ❌ |
| **Integration Advanced** | ✅ | ✅ | ✅ |
| **Titanium / Gold** | ✅ | ✅ | ✅ |

---

## Anti-patterns — what to NEVER recommend

1. ❌ **Building a custom monitoring Mule app without checking Anypoint Monitoring + Functional Monitoring availability first.** Repeats work MuleSoft ships.
2. ❌ **Setting up local PC scheduled tasks as the long-term monitoring strategy.** Single point of failure, hidden when person hands off project.
3. ❌ **Using only Runtime Manager basic alerts when Anypoint Monitoring is active.** Misses the richer alert surface that's already paid for.
4. ❌ **Polling external uptime monitors (UptimeRobot etc.) for the primary check.** Useful as belt-and-braces, NOT as the main approach when Functional Monitoring is available.

## Pro-pattern — what to recommend by default

1. ✅ **Always confirm subscription tier first** before scoping any monitoring work
2. ✅ **Use Functional Monitoring for synthetic end-to-end checks** when available — it's the product designed for this
3. ✅ **Use Anypoint Monitoring Alerts** for KPI-based and log-content alerts
4. ✅ **Reserve Runtime Manager basic alerts** for "app stopped" / "deployment failed" — the deployment-lifecycle events
5. ✅ **Configure all 3 layers** when the tier supports them — they cover different failure modes

---

## Object Store + usage caps (forward planning)

Watch these caps against current usage on the Subscription page:

| Resource | Where to check |
|---|---|
| vCores allocated vs in use | Access Management → Subscription → Runtime Manager |
| Mule Messages per month | Subscription → Runtime Manager → Mule Messages |
| Data Throughput per month | Subscription → Runtime Manager → Data Throughput |
| Object Store API Requests per month | Subscription → Object Store |
| Mule Public Flows | Subscription → Runtime Manager → Mule Public Flows |
| VPCs | Subscription → Runtime Manager → VPCs |
| Network Connections | Subscription → Runtime Manager → Network Connections |

Before any new app deploy or replica scale-up: check headroom. Overage charges apply on most plans.
